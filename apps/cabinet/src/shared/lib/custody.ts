/**
 * Счета Trigonum — собственные реквизиты клиента на кошельке брокера.
 *
 * Главное правило модели: адрес для пополнения выдаётся только после
 * подписания договора. Реквизиты — это не настройка интерфейса, а следствие
 * принятой заявки и подписанного документа, поэтому `address` до подписи
 * равен null и не вычисляется «на лету» в компоненте.
 */

export type CustodyStatus = 'review' | 'contract' | 'active' | 'rejected'

export interface CustodyNetwork {
  id: string
  label: string
  chain: string
  assets: string[]
  confirmations: number
  minDeposit: number
  arrival: string
  note: string
}

export const CUSTODY_NETWORKS: CustodyNetwork[] = [
  {
    id: 'arbitrum',
    label: 'Arbitrum One',
    chain: 'Arbitrum',
    assets: ['USDT', 'USDC'],
    confirmations: 12,
    minDeposit: 100,
    arrival: '2–5 минут',
    note: 'Низкая комиссия сети, рекомендуем для сумм до $100,000.',
  },
  {
    id: 'ethereum',
    label: 'Ethereum (ERC-20)',
    chain: 'Ethereum',
    assets: ['USDT', 'USDC'],
    confirmations: 12,
    minDeposit: 1_000,
    arrival: '5–15 минут',
    note: 'Высокая комиссия сети. Оправдана на крупных суммах.',
  },
  {
    id: 'tron',
    label: 'Tron (TRC-20)',
    chain: 'TRON',
    assets: ['USDT'],
    confirmations: 20,
    minDeposit: 100,
    arrival: '3–7 минут',
    note: 'Только USDT. USDC в сети TRON не принимается.',
  },
  {
    id: 'base',
    label: 'Base',
    chain: 'Base',
    assets: ['USDC'],
    confirmations: 12,
    minDeposit: 100,
    arrival: '2–5 минут',
    note: 'Только USDC. USDT в сети Base не принимается.',
  },
]

export const SOURCE_OF_FUNDS = [
  'Собственные накопления',
  'Доход от предпринимательской деятельности',
  'Заработная плата и премии',
  'Продажа имущества или активов',
  'Инвестиционный доход',
  'Наследство или дарение',
] as const

export const ACCOUNT_PURPOSE = [
  'Долгосрочное размещение капитала',
  'Участие в Events',
  'Регулярные инвестиции',
  'Диверсификация портфеля',
] as const

export const OPERATION_FREQUENCY = [
  'Разовое размещение',
  'Раз в квартал',
  'Раз в месяц',
  'Несколько раз в месяц',
] as const

export interface CustodyApplication {
  purpose: string
  sourceOfFunds: string
  sourceComment: string
  plannedAmount: number
  frequency: string
  asset: string
  networkId: string
}

export interface CustodyAccount {
  id: string
  contractNumber: string
  status: CustodyStatus
  application: CustodyApplication
  createdAt: string
  statusChangedAt: string
  signedAt: string | null
  /** Реквизиты для пополнения. До подписания договора равны null. */
  address: string | null
  reason?: string
}

const STORE_KEY = 'trigonum-custody-accounts-v1'

/** Заявку обрабатывает комплаенс. В прототипе — таймером. */
const REVIEW_MS = 8_000

export function networkById(id: string): CustodyNetwork {
  return CUSTODY_NETWORKS.find((network) => network.id === id) ?? CUSTODY_NETWORKS[0]
}

/**
 * Детерминированный адрес из номера счёта и сети: между перезагрузками он
 * обязан оставаться тем же, иначе клиент отправит деньги на устаревший.
 */
function deriveAddress(seed: string, network: CustodyNetwork): string {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619) >>> 0
  }
  const next = () => {
    hash ^= hash << 13
    hash ^= hash >>> 17
    hash ^= hash << 5
    hash >>>= 0
    return hash
  }

  if (network.chain === 'TRON') {
    const base58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    return `T${Array.from({ length: 33 }, () => base58[next() % base58.length]).join('')}`
  }

  const hex = '0123456789abcdef'
  return `0x${Array.from({ length: 40 }, () => hex[next() % 16]).join('')}`
}

function read(): CustodyAccount[] {
  try {
    const raw = window.localStorage.getItem(STORE_KEY)
    return raw ? (JSON.parse(raw) as CustodyAccount[]) : []
  } catch {
    return []
  }
}

function write(accounts: CustodyAccount[]) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(accounts))
  } catch {
    // Приватный режим — заявка проживёт до перезагрузки.
  }
}

export const CUSTODY_CHANGED_EVENT = 'trigonum:custody-changed'

export function notifyCustodyChanged() {
  window.dispatchEvent(new Event(CUSTODY_CHANGED_EVENT))
}

/** Проверка заявки идёт на стороне брокера — двигаем её при каждом чтении. */
function advance(accounts: CustodyAccount[]): CustodyAccount[] {
  const now = Date.now()
  let changed = false
  const next = accounts.map((account) => {
    if (account.status !== 'review') return account
    if (now - Date.parse(account.statusChangedAt) < REVIEW_MS) return account
    changed = true
    return { ...account, status: 'contract' as const, statusChangedAt: new Date(now).toISOString() }
  })
  if (changed) write(next)
  return next
}

export function loadCustodyAccounts(): CustodyAccount[] {
  return advance(read())
}

export function createCustodyApplication(application: CustodyApplication): CustodyAccount {
  const accounts = read()
  const now = new Date().toISOString()
  const sequence = accounts.length + 1
  const year = new Date().getFullYear()

  const account: CustodyAccount = {
    id: `TRG-${year}-${String(sequence).padStart(4, '0')}`,
    contractNumber: `CA-${year}-${String(sequence).padStart(4, '0')}`,
    status: 'review',
    application,
    createdAt: now,
    statusChangedAt: now,
    signedAt: null,
    address: null,
  }

  write([...accounts, account])
  notifyCustodyChanged()
  return account
}

/**
 * Подписание договора — единственное место, где выдаются реквизиты.
 * Адрес создаётся здесь, а не при подаче заявки: до подписи у счёта нет
 * правового основания принимать средства.
 */
export function signCustodyContract(id: string): CustodyAccount | null {
  const accounts = read()
  const account = accounts.find((item) => item.id === id)
  if (!account || account.status !== 'contract') return null

  const network = networkById(account.application.networkId)
  const now = new Date().toISOString()
  const signed: CustodyAccount = {
    ...account,
    status: 'active',
    statusChangedAt: now,
    signedAt: now,
    address: deriveAddress(`${account.id}:${network.id}`, network),
  }

  write(accounts.map((item) => (item.id === id ? signed : item)))
  notifyCustodyChanged()
  return signed
}

/** Сброс для прототипа: убрать все заявки и счета. */
export function resetCustodyAccounts() {
  write([])
  notifyCustodyChanged()
}

export const CUSTODY_STATUS_LABEL: Record<CustodyStatus, string> = {
  review: 'Заявка на рассмотрении',
  contract: 'Договор готов к подписанию',
  active: 'Счёт открыт',
  rejected: 'Заявка отклонена',
}
