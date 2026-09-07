import {
  ApiError,
  type Agreement,
  type EddResponse,
  type EddTemplate,
  type KycSession,
  type MessageThread,
  type OnboardingHistoryEntry,
  type OnboardingState,
  type OnboardingStatus,
  type SelfCertification,
} from './types'

/**
 * Мок бэкенда онбординга. Формы запросов и ответов повторяют контракт из ТЗ,
 * поэтому реальные вызовы подставляются вместо тела функций без правок экранов.
 * Состояние машины двигается только здесь — экраны его не выставляют.
 */

const STORE_KEY = 'trigonum-onboarding-v1'
const LATENCY_MS = 320

interface Store {
  currentState: OnboardingState
  stateChangedAt: string
  metadata?: { reason?: string }
  history: OnboardingHistoryEntry[]
  sessions: Record<string, KycSession & { createdAt: number }>
  selfCertification: SelfCertification | null
  consented: string[]
  eddResponse: EddResponse | null
}

function emptyStore(): Store {
  const now = new Date().toISOString()
  return {
    // Регистрация и подтверждение почты происходят до кабинета,
    // поэтому демо стартует с подтверждённого email.
    currentState: 'EMAIL_VERIFIED',
    stateChangedAt: now,
    history: [
      { id: 'h1', fromState: null, toState: 'REGISTERED', createdAt: new Date(Date.now() - 864e5).toISOString() },
      { id: 'h2', fromState: 'REGISTERED', toState: 'EMAIL_VERIFIED', createdAt: now },
    ],
    sessions: {},
    selfCertification: null,
    consented: [],
    eddResponse: null,
  }
}

function read(): Store {
  try {
    const raw = window.localStorage.getItem(STORE_KEY)
    if (!raw) return emptyStore()
    return { ...emptyStore(), ...(JSON.parse(raw) as Partial<Store>) } as Store
  } catch {
    return emptyStore()
  }
}

function write(store: Store) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store))
  } catch {
    // Приватный режим — работаем без персистентности.
  }
}

function transition(store: Store, next: OnboardingState, metadata?: { reason?: string }) {
  if (store.currentState === next) return store
  const createdAt = new Date().toISOString()
  store.history = [
    ...store.history,
    { id: `h${store.history.length + 1}`, fromState: store.currentState, toState: next, createdAt },
  ]
  store.currentState = next
  store.stateChangedAt = createdAt
  store.metadata = metadata
  return store
}

const wait = (ms = LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms))

/* --- Онбординг ----------------------------------------------------------- */

export async function getOnboardingState(): Promise<OnboardingStatus> {
  await wait(120)
  const store = advanceServerSideStates(read())
  write(store)
  return { currentState: store.currentState, stateChangedAt: store.stateChangedAt, metadata: store.metadata }
}

export async function getOnboardingHistory(): Promise<OnboardingHistoryEntry[]> {
  await wait(120)
  return read().history
}

/**
 * Переходы, которые в реальной системе делает бэкенд сам: вебхук провайдера
 * закрывает KYC-сессию, комплаенс проверяет анкету. В демо они происходят
 * по таймеру, чтобы поллинг было видно.
 */
function advanceServerSideStates(store: Store): Store {
  const now = Date.now()

  for (const session of Object.values(store.sessions)) {
    if (session.status === 'PENDING' && now - session.createdAt > 6_000) {
      session.status = 'IN_PROGRESS'
    }
    if (session.status === 'IN_PROGRESS' && now - session.createdAt > 16_000) {
      session.status = 'COMPLETED'
      session.overallDecision = 'Approved'
      session.updatedAt = new Date().toISOString()
      session.webhookReceivedAt = new Date().toISOString()
      session.documentData = { documentType: 'PASSPORT' }
    }
    if (session.status === 'COMPLETED' && session.overallDecision === 'Approved') {
      if (store.currentState === 'IDENTITY_IN_PROGRESS') transition(store, 'IDENTITY_VERIFIED')
    }
    if (session.status === 'FAILED' || session.overallDecision === 'Declined') {
      if (store.currentState === 'IDENTITY_IN_PROGRESS') transition(store, 'IDENTITY_FAILED')
    }
  }

  if (store.currentState === 'EDD_SUBMITTED' && now - Date.parse(store.stateChangedAt) > 8_000) {
    transition(store, 'UNDER_REVIEW')
  }
  if (store.currentState === 'UNDER_REVIEW' && now - Date.parse(store.stateChangedAt) > 20_000) {
    transition(store, 'APPROVED')
  }

  return store
}

/* --- KYC ----------------------------------------------------------------- */

export async function createKycSession(): Promise<KycSession> {
  await wait()
  const store = read()

  const active = Object.values(store.sessions).find(
    (session) => session.status === 'PENDING' || session.status === 'IN_PROGRESS',
  )
  if (active) {
    throw new ApiError(409, 'Verification session already in progress', {
      existingSessionId: active.sessionId,
      existingStatus: active.status,
      verificationUrl: active.verificationUrl,
    })
  }

  const sessionId = `kyc_${Math.random().toString(36).slice(2, 12)}`
  const session: KycSession & { createdAt: number } = {
    sessionId,
    status: 'PENDING',
    verificationUrl: `https://verify.didit.me/session/${sessionId}`,
    createdAt: Date.now(),
  }
  store.sessions[sessionId] = session
  transition(store, 'IDENTITY_IN_PROGRESS')
  write(store)

  return { ...session }
}

export async function getKycSession(sessionId: string): Promise<KycSession> {
  await wait(100)
  const store = advanceServerSideStates(read())
  write(store)

  const session = store.sessions[sessionId]
  // Протухший id от другого пользователя или очищенной базы.
  if (!session) throw new ApiError(404, 'Session not found')
  return { ...session }
}

/* --- Самосертификация ----------------------------------------------------- */

export async function getSelfCertification(): Promise<SelfCertification> {
  await wait(140)
  const stored = read().selfCertification
  // 404 на первом заходе — штатный сценарий, экран его не показывает как ошибку.
  if (!stored) throw new ApiError(404, 'Self-certification not found')
  return stored
}

export async function submitSelfCertification(payload: SelfCertification): Promise<SelfCertification> {
  await wait()
  const store = read()
  store.selfCertification = payload
  transition(store, 'SELF_CERT_COMPLETED')
  write(store)
  return payload
}

/* --- Соглашения ----------------------------------------------------------- */

const AGREEMENT_TEMPLATES: Omit<Agreement, 'consented' | 'consentedAt'>[] = [
  {
    template: {
      id: 'agr-am-v1',
      name: 'Asset Management Agreement',
      description: 'Условия доверительного управления активами.',
      version: '1.0',
      category: 'ASSET_MANAGEMENT',
      isRequired: true,
      mediaId: 'media-am-1',
    },
  },
  {
    template: {
      id: 'agr-am-v2',
      name: 'Asset Management Agreement',
      description: 'Условия доверительного управления активами: состав услуг, вознаграждение, порядок отчётности.',
      version: '2.0',
      category: 'ASSET_MANAGEMENT',
      isRequired: true,
      mediaId: 'media-am-2',
    },
  },
  {
    template: {
      id: 'agr-bd-v1',
      name: 'Broker-Dealer Terms',
      description: 'Порядок исполнения поручений, комиссии и урегулирование сделок.',
      version: '1.2',
      category: 'BROKER_DEALER',
      isRequired: true,
      mediaId: 'media-bd-1',
    },
  },
  {
    template: {
      id: 'agr-va-v1',
      name: 'Virtual Assets Addendum',
      description: 'Дополнение по операциям с цифровыми активами.',
      version: '1.0',
      category: 'VIRTUAL_ASSETS',
      isRequired: true,
      mediaId: 'media-va-1',
    },
  },
  {
    template: {
      id: 'agr-va-v2',
      name: 'Virtual Assets Addendum',
      description: 'Хранение, перевод и налоговые последствия операций с цифровыми активами.',
      version: '2.0',
      category: 'VIRTUAL_ASSETS',
      isRequired: true,
      mediaId: 'media-va-2',
    },
  },
  {
    template: {
      id: 'agr-risk-v1',
      name: 'Risk Disclosure Statement',
      description: 'Раскрытие рисков: рыночный, кредитный, ликвидности, операционный.',
      version: '1.1',
      category: 'RISK_DISCLOSURE',
      isRequired: true,
      mediaId: 'media-risk-1',
    },
  },
  {
    template: {
      id: 'agr-pp-v1',
      name: 'Privacy Policy',
      description: 'Обработка персональных данных.',
      version: '1.0',
      category: 'PRIVACY_POLICY',
      isRequired: true,
      mediaId: 'media-pp-1',
    },
  },
  {
    template: {
      id: 'agr-pp-v2',
      name: 'Privacy Policy',
      description: 'Какие данные собираем, сколько храним, кому передаём и как отозвать согласие.',
      version: '2.0',
      category: 'PRIVACY_POLICY',
      isRequired: true,
      mediaId: 'media-pp-2',
    },
  },
  {
    template: {
      id: 'agr-mkt-v1',
      name: 'Marketing Communications',
      description: 'Согласие на материалы об инвестиционных возможностях. Не обязательно.',
      version: '1.0',
      category: 'OTHER',
      isRequired: false,
      mediaId: 'media-mkt-1',
    },
  },
]

export async function getAgreements(): Promise<Agreement[]> {
  await wait(160)
  const store = read()
  return AGREEMENT_TEMPLATES.map((item) => ({
    template: item.template,
    consented: store.consented.includes(item.template.id),
    consentedAt: store.consented.includes(item.template.id) ? store.stateChangedAt : null,
  }))
}

export async function consentAgreement(agreementTemplateId: string): Promise<void> {
  await wait()
  const store = read()
  if (!store.consented.includes(agreementTemplateId)) store.consented.push(agreementTemplateId)
  write(store)
}

/** Бэкенд подтверждает переход, когда все обязательные соглашения подписаны. */
export async function finalizeAgreements(): Promise<void> {
  await wait(120)
  const store = read()
  transition(store, 'AGREEMENTS_ACCEPTED')
  write(store)
}

/* --- EDD ------------------------------------------------------------------ */

export async function getEddTemplate(): Promise<EddTemplate> {
  await wait(160)
  const { EDD_TEMPLATE } = await import('./edd-template')
  return EDD_TEMPLATE
}

export async function getEddResponse(): Promise<EddResponse> {
  await wait(140)
  const stored = read().eddResponse
  if (!stored) throw new ApiError(404, 'Response not found')
  return stored
}

export async function submitEddResponse(answers: EddResponse['answers']): Promise<EddResponse> {
  await wait()
  const store = read()
  const response: EddResponse = { id: `edd_${Date.now()}`, submittedAt: new Date().toISOString(), answers }
  store.eddResponse = response
  transition(store, 'EDD_SUBMITTED')
  write(store)
  return response
}

/* --- Управление прототипом -------------------------------------------------
 * Без бэкенда пройти шаги «по-настоящему» нельзя: письма не приходят,
 * провайдер проверки не отвечает вебхуком. Эти операции подменяют события,
 * которые в бою присылает сервер, чтобы прототип можно было смотреть целиком.
 */

/** Перевести онбординг в произвольное состояние. */
export async function setOnboardingState(next: OnboardingState, reason?: string): Promise<void> {
  await wait(80)
  const store = read()
  transition(store, next, reason ? { reason } : undefined)
  write(store)
}

/** Начать сначала: состояние, сессии, анкеты и согласия. */
export async function resetOnboarding(): Promise<void> {
  await wait(80)
  write(emptyStore())
  try {
    window.localStorage.removeItem('kyc-session-id')
  } catch {
    // Приватный режим — сбрасываем только состояние.
  }
}

/** Досрочно закрыть KYC-сессию — за провайдера, который в бою шлёт вебхук. */
export async function completeKycNow(decision: 'Approved' | 'Declined'): Promise<void> {
  await wait(80)
  const store = read()
  const now = new Date().toISOString()

  for (const session of Object.values(store.sessions)) {
    if (session.status === 'PENDING' || session.status === 'IN_PROGRESS') {
      session.status = decision === 'Approved' ? 'COMPLETED' : 'FAILED'
      session.overallDecision = decision
      session.updatedAt = now
      session.webhookReceivedAt = now
      session.documentData = { documentType: 'PASSPORT' }
    }
  }

  transition(store, decision === 'Approved' ? 'IDENTITY_VERIFIED' : 'IDENTITY_FAILED')
  write(store)
}

/* --- Сообщения ------------------------------------------------------------- */

export async function getMessageThreads(): Promise<MessageThread[]> {
  await wait(140)
  const store = read()
  if (store.currentState === 'AMENDMENTS_REQUESTED') {
    return [
      {
        id: 'thread-1',
        subject: 'Требуются уточнения по анкете',
        lastMessage: 'Приложите, пожалуйста, выписку за последние три месяца — текущая старше полугода.',
        updatedAt: new Date().toISOString(),
      },
    ]
  }
  return []
}
