import {
  ArrowDownToLine,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  ExternalLink,
  KeyRound,
  Link2,
  LoaderCircle,
  Plus,
  Search,
  Unplug,
  Wallet,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useBrokerAccount } from '../../../shared/lib/AccountContext'
import { formatCurrency, formatDateTime } from '../../../shared/lib/format'
import { useFunding, type FundingSource, type FundingTransactionRecord } from '../../../shared/lib/FundingContext'

type Flow =
  | { kind: 'connect' }
  | { kind: 'exchange' }
  | { kind: 'deposit'; source: FundingSource }
  | { kind: 'verify'; transaction: FundingTransactionRecord }
  | null

type DepositStep = 'form' | 'processing' | 'success'

const NETWORK_FEE: Record<string, number> = {
  Arbitrum: 0.12,
  Base: 0.08,
  Ethereum: 4.8,
  TRC20: 1,
  ERC20: 4.8,
}

const EXPLORERS: Record<string, { name: string; base: string }> = {
  Arbitrum: { name: 'Arbiscan', base: 'https://arbiscan.io/tx/' },
  Base: { name: 'Basescan', base: 'https://basescan.org/tx/' },
  Ethereum: { name: 'Etherscan', base: 'https://etherscan.io/tx/' },
  ERC20: { name: 'Etherscan', base: 'https://etherscan.io/tx/' },
  TRC20: { name: 'Tronscan', base: 'https://tronscan.org/#/transaction/' },
}

const EXCHANGES = ['Bybit', 'OKX', 'Binance', 'Bitget', 'Gate.io', 'KuCoin']
const PIE_COLORS = ['#5a5ac4', '#12ccff', '#af47ff', '#7575ff', '#3f3f8a']

const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`

function randomHash() {
  const chars = '0123456789abcdef'
  return `0x${Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`
}

function SourceIcon({ source }: { source: FundingSource }) {
  return source.kind === 'exchange' ? <Building2 size={20} /> : <Wallet size={20} />
}

function StatCard({ label, value, hint, color = '#25254f' }: { label: string; value: string; hint: string; color?: string }) {
  return (
    <div className="rounded-[18px] border border-[#e4e4f0] bg-white px-5 py-[18px] shadow-[0_8px_30px_rgb(8_27_58/8%)]">
      <p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">{label}</p>
      <p className="mt-2.5 text-2xl font-bold tabular-nums" style={{ color }}>{value}</p>
      <p className="mt-1.5 text-xs text-[#71719b]">{hint}</p>
    </div>
  )
}

function Hero({ name, accountNumber }: { name: string; accountNumber: string }) {
  return (
    <header className="mb-5 overflow-hidden rounded-[18px] shadow-[0_8px_30px_rgb(8_27_58/8%)]">
      <div className="h-[3px] bg-[linear-gradient(100deg,#92f222_0%,#12ccff_50%,#af47ff_100%)]" />
      <div className="relative overflow-hidden bg-[linear-gradient(160deg,#25254f_0%,#161638_100%)] text-white">
        <svg viewBox="0 0 420 220" preserveAspectRatio="none" className="absolute right-0 top-0 h-full w-[46%] opacity-50" aria-hidden="true">
          <path d="M40 220 L210 40" fill="none" stroke="rgb(255 255 255 / 14%)" />
          <path d="M210 40 L380 220" fill="none" stroke="rgb(255 255 255 / 14%)" />
          <path d="M210 40 L210 220" fill="none" stroke="rgb(255 255 255 / 14%)" />
          <path d="M110 220 L210 108" fill="none" stroke="rgb(18 204 255 / 26%)" />
          <path d="M310 220 L210 108" fill="none" stroke="rgb(146 242 34 / 24%)" />
          <circle cx="210" cy="40" r="3" fill="#7575ff" />
        </svg>
        <div className="relative flex flex-wrap items-center justify-between gap-7 px-7 py-6">
          <div className="min-w-0 flex-1 basis-[380px]">
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#92f222]">Капитал · пополнение счёта</p>
            <h1 className="mt-2.5 text-[38px] font-semibold leading-none tracking-[-.03em]">Пополнить</h1>
            <p className="mt-2.5 max-w-[540px] text-sm leading-[1.55] text-white/70">Переведите капитал с подключённого личного источника. Кошельки и биржи принадлежат только этому аккаунту.</p>
          </div>
          <div className="shrink-0 rounded-xl border border-white/20 px-[18px] py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[.1em] text-white/60">Личный счёт</p>
            <p className="mt-2 text-[15px] font-bold">{name}</p>
            <p className="mt-1 text-xs text-white/60">{accountNumber} · KYC подтверждён</p>
          </div>
        </div>
      </div>
    </header>
  )
}

function Distribution({ brokerBalance, freeBalance, locked, sources }: { brokerBalance: number; freeBalance: number; locked: number; sources: FundingSource[] }) {
  const total = brokerBalance + sources.reduce((sum, source) => sum + source.balance, 0)
  const items = [
    { label: 'Свободно на счёте Trigonum', meta: 'Личный счёт · USD', amount: freeBalance, color: '#92f222' },
    { label: 'Занято на счёте', meta: 'Активные Events и расчёты', amount: locked, color: '#d3d3e6' },
    ...sources.map((source, index) => ({ label: source.name, meta: `${source.detail} · ${source.asset}`, amount: source.balance, color: PIE_COLORS[index % PIE_COLORS.length] })),
  ]
  const radius = 62
  const circumference = 2 * Math.PI * radius
  let cumulative = 0

  return (
    <section className="mt-4 rounded-[18px] border border-[#e4e4f0] bg-white px-6 py-5 shadow-[0_8px_30px_rgb(8_27_58/8%)]">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-[#25254f]">Средства по источникам</h2>
        <span className="text-[13px] font-bold tabular-nums text-[#25254f]">{formatCurrency(total)}</span>
      </div>
      <div className="mt-[18px] flex flex-wrap items-center gap-8">
        <div className="relative size-[168px] shrink-0">
          <svg viewBox="0 0 168 168" className="block size-[168px] -rotate-90" aria-hidden="true">
            <circle cx="84" cy="84" r={radius} fill="none" stroke="#eeeef8" strokeWidth="20" />
            {items.map((item) => {
              const fraction = total > 0 ? item.amount / total : 0
              const segment = fraction * circumference
              const offset = -cumulative * circumference
              cumulative += fraction
              return <circle key={item.label} cx="84" cy="84" r={radius} fill="none" stroke={item.color} strokeWidth="20" strokeDasharray={`${segment} ${circumference}`} strokeDashoffset={offset} />
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold uppercase tracking-[.1em] text-[#71719b]">Всего</span>
            <span className="mt-1 text-lg font-bold tabular-nums text-[#25254f]">{formatCurrency(total)}</span>
          </div>
        </div>
        <div className="min-w-[260px] flex-1 space-y-3">
          {items.map((item) => {
            const share = total > 0 ? Math.round(item.amount / total * 100) : 0
            return (
              <div key={item.label} className="grid grid-cols-[12px_1fr_auto_auto] items-center gap-3">
                <span className="size-2.5 rounded-full" style={{ background: item.color }} />
                <span className="min-w-0"><span className="block text-[13px] font-semibold text-[#25254f]">{item.label}</span><span className="mt-0.5 block text-[11px] text-[#71719b]">{item.meta}</span></span>
                <span className="text-sm font-bold tabular-nums text-[#25254f]">{formatCurrency(item.amount)}</span>
                <span className="min-w-11 text-right text-xs tabular-nums text-[#71719b]">{share}%</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function SourceCard({ source, onDeposit, onRemove }: { source: FundingSource; onDeposit: () => void; onRemove: () => void }) {
  return (
    <article className="group overflow-hidden rounded-[18px] border border-[#e4e4f0] bg-white shadow-[0_8px_30px_rgb(8_27_58/8%)]">
      <div className="p-[18px]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${source.kind === 'exchange' ? 'bg-[#f4e9ff] text-[#8321d6]' : 'bg-[#eeeef8] text-[#5a5ac4]'}`}><SourceIcon source={source} /></span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><p className="text-[15px] font-bold text-[#25254f]">{source.name}</p>{source.verified && <span className="inline-flex items-center gap-1 rounded-full bg-[#eef7f1] px-2 py-0.5 text-[10px] font-bold text-[#2e9e4f]"><BadgeCheck size={11} />Подтверждён</span>}</div>
              <p className="mt-1 text-xs text-[#71719b]">{source.detail}</p>
            </div>
          </div>
          <button type="button" onClick={onRemove} title="Отключить источник" className="shrink-0 rounded-lg p-1.5 text-[#b0b0c8] transition hover:bg-[#fdecec] hover:text-[#b3383c]"><Unplug size={15} /></button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#f5f5fa] p-3.5">
          <div><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">Доступно</p><p className="mt-1.5 text-lg font-bold tabular-nums text-[#25254f]">{formatCurrency(source.balance)}</p></div>
          <div><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">Актив / сети</p><p className="mt-1.5 text-sm font-bold text-[#25254f]">{source.asset}</p><p className="mt-0.5 text-[11px] text-[#71719b]">{source.networks.slice(0, 2).join(' · ')}</p></div>
        </div>
        {source.permissions?.length ? <div className="mt-3 flex flex-wrap gap-1.5">{source.permissions.map((permission) => <span key={permission} className="rounded-md border border-[#e4e4f0] bg-white px-2 py-1 text-[10px] font-semibold text-[#71719b]">{permission}</span>)}</div> : null}
      </div>
      <button type="button" onClick={onDeposit} className="flex w-full items-center justify-between border-t border-[#e4e4f0] px-[18px] py-3.5 text-sm font-semibold text-[#5a5ac4] transition hover:bg-[#f5f5fa]"><span className="inline-flex items-center gap-2"><ArrowDownToLine size={16} />Пополнить с {source.name}</span><ChevronRight size={16} /></button>
    </article>
  )
}

function DepositHistory({ transactions, onVerify }: { transactions: FundingTransactionRecord[]; onVerify: (tx: FundingTransactionRecord) => void }) {
  if (!transactions.length) return null
  return (
    <section className="mt-6 rounded-[18px] border border-[#e4e4f0] bg-white px-6 py-5 shadow-[0_8px_30px_rgb(8_27_58/8%)]">
      <h2 className="mb-3.5 text-[15px] font-semibold text-[#25254f]">Последние пополнения</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-collapse">
          <thead><tr className="text-left text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]"><th className="w-[21%] border-b border-[#e4e4f0] pb-2">Дата</th><th className="w-[18%] border-b border-[#e4e4f0] pb-2">Источник</th><th className="w-[20%] border-b border-[#e4e4f0] pb-2">Сеть</th><th className="w-[14%] border-b border-[#e4e4f0] pb-2">Сумма</th><th className="w-[14%] border-b border-[#e4e4f0] pb-2">Статус</th><th className="w-[13%] border-b border-[#e4e4f0] pb-2 text-right">Проверка</th></tr></thead>
          <tbody>{transactions.map((tx) => <tr key={tx.id} className="text-[13px]"><td className="border-b border-[#e4e4f0] py-3 pr-2 whitespace-nowrap text-[#3a3a63]">{formatDateTime(tx.date)}</td><td className="border-b border-[#e4e4f0] py-3 pr-2 text-[#3a3a63]">{tx.source.split(' · ')[0]}</td><td className="border-b border-[#e4e4f0] py-3 pr-2 whitespace-nowrap text-[#71719b]">{tx.asset} · {tx.network}</td><td className="border-b border-[#e4e4f0] py-3 pr-2 whitespace-nowrap font-bold tabular-nums text-[#25254f]">{formatCurrency(Math.abs(tx.amount))}</td><td className={`border-b border-[#e4e4f0] py-3 pr-2 whitespace-nowrap font-semibold ${tx.status === 'completed' ? 'text-[#2e9e4f]' : 'text-[#e9a21c]'}`}>{tx.status === 'completed' ? 'Выполнено' : 'В обработке'}</td><td className="border-b border-[#e4e4f0] py-3 text-right"><button type="button" onClick={() => onVerify(tx)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e4e4f0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#5a5ac4] transition hover:border-[#5a5ac4] hover:bg-[#f7f7fc]"><Search size={14} />Проверить</button></td></tr>)}</tbody>
        </table>
      </div>
    </section>
  )
}

function ModalShell({ eyebrow, title, onClose, children }: { eyebrow: string; title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const key = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', key) }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[rgb(8_27_58/45%)] p-8 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="my-auto max-h-[88vh] w-full max-w-[520px] overflow-auto rounded-[18px] bg-white shadow-[0_25px_50px_-12px_rgb(8_27_58/40%)]">
        <div className="relative overflow-hidden bg-[linear-gradient(160deg,#25254f_0%,#161638_100%)] px-[22px] py-5 text-white"><div className="absolute -right-[60px] -top-20 size-60 rounded-full bg-[radial-gradient(circle,rgb(117_117_255/40%)_0%,transparent_66%)]" /><div className="relative flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#7575ff]">{eyebrow}</p><h2 className="mt-2 text-xl font-bold">{title}</h2></div><button type="button" onClick={onClose} className="rounded-lg border border-white/25 bg-transparent p-2 text-white"><X size={16} /></button></div></div>
        <div className="px-[22px] py-5">{children}</div>
      </div>
    </div>
  )
}

export function PersonalDepositV2() {
  const { activeAccount } = useBrokerAccount()
  const { getAccountState, addSource, removeSource, recordDeposit } = useFunding()
  const state = getAccountState(activeAccount.id)
  const [flow, setFlow] = useState<Flow>(null)
  const [step, setStep] = useState<DepositStep>('form')
  const [amount, setAmount] = useState(10_000)
  const [asset, setAsset] = useState('USDT')
  const [network, setNetwork] = useState('Arbitrum')
  const [exchange, setExchange] = useState('Bybit')
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [message, setMessage] = useState('')
  const [confirmations, setConfirmations] = useState(0)
  const [copied, setCopied] = useState(false)

  const freeBalance = Math.max(0, state.brokerBalance - state.lockedEvents - state.pendingSettlement)
  const externalCapital = state.sources.reduce((sum, source) => sum + source.balance, 0)
  const deposits = useMemo(() => state.transactions.filter((tx) => tx.type === 'deposit'), [state.transactions])
  const selectedSource = flow?.kind === 'deposit' ? flow.source : null
  const fee = NETWORK_FEE[network] ?? 1
  const credited = Math.max(0, amount - fee)

  const closeFlow = () => {
    setFlow(null)
    setStep('form')
    setAmount(10_000)
    setAsset('USDT')
    setNetwork('Arbitrum')
    setApiKey('')
    setApiSecret('')
    setMessage('')
    setConfirmations(0)
    setCopied(false)
  }

  useEffect(() => {
    if (flow?.kind !== 'verify') return
    setConfirmations(0)
    const target = flow.transaction.status === 'completed' ? 12 : 5
    const timer = window.setInterval(() => setConfirmations((value) => {
      const next = Math.min(target, value + 1)
      if (next >= target) window.clearInterval(timer)
      return next
    }), 420)
    return () => window.clearInterval(timer)
  }, [flow])

  const openDeposit = (source: FundingSource) => {
    setFlow({ kind: 'deposit', source })
    setStep('form')
    setAmount(Math.min(10_000, source.balance))
    setAsset(source.asset)
    setNetwork(source.networks[0] || 'Arbitrum')
    setMessage('')
  }

  const connectBrowserWallet = async () => {
    const ethereum = (window as Window & { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum
    if (!ethereum) { setMessage('Browser wallet не найден. Установите MetaMask/Rabby или используйте WalletConnect.'); return }
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[]
      const address = accounts?.[0]
      if (!address) throw new Error('No wallet address')
      const text = `Подтверждаю подключение кошелька ${address} к аккаунту Trigonum Broker ${activeAccount.accountNumber}`
      await ethereum.request({ method: 'personal_sign', params: [text, address] })
      addSource(activeAccount.id, { id: `wallet-${address.toLowerCase()}`, kind: 'wallet', connection: 'browser-wallet', name: 'Browser Wallet', detail: shortAddress(address), address, asset: 'USDT', balance: 12_850, networks: ['Arbitrum', 'Ethereum', 'Base'], verified: true, lastUsed: new Date().toISOString() })
      closeFlow()
    } catch { setMessage('Подключение или подпись отменены в кошельке.') }
  }

  const connectWalletConnect = () => {
    addSource(activeAccount.id, { id: 'wallet-wc-demo', kind: 'wallet', connection: 'walletconnect', name: 'WalletConnect', detail: '0x5C91…88F2', address: '0x5C91B12A7F932671242C11B20755B9094C1188F2', asset: 'USDT', balance: 21_300, networks: ['Arbitrum', 'Base', 'Ethereum'], verified: true, lastUsed: new Date().toISOString() })
    closeFlow()
  }

  const connectExchange = () => {
    if (!apiKey.trim() || !apiSecret.trim()) { setMessage('Введите API Key и API Secret.'); return }
    const uid: Record<string, string> = { Bybit: 'UID 483••••91', OKX: 'UID 71••••284', Binance: 'UID 902••••17', Bitget: 'UID 55••••430', 'Gate.io': 'UID 118••••62', KuCoin: 'UID 74••••905' }
    const balance: Record<string, number> = { Bybit: 42_580, OKX: 31_250, Binance: 38_900, Bitget: 16_740, 'Gate.io': 12_300, KuCoin: 9_850 }
    addSource(activeAccount.id, { id: `exchange-${exchange.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, kind: 'exchange', connection: 'exchange-api', name: exchange, detail: uid[exchange] ?? 'UID ••••••', asset: 'USDT', balance: balance[exchange] ?? 10_000, networks: ['Arbitrum', 'TRC20', 'ERC20'], verified: true, lastUsed: new Date().toISOString(), permissions: ['Баланс', 'История операций', 'Вывод на адреса Trigonum'] })
    closeFlow()
  }

  const executeDeposit = () => {
    if (!selectedSource) return
    if (amount <= 0 || amount > selectedSource.balance) { setMessage(`Максимально доступно ${formatCurrency(selectedSource.balance)}.`); return }
    setStep('processing')
    setMessage('')
    window.setTimeout(() => {
      const transaction: FundingTransactionRecord = { id: `dep-${Date.now()}`, date: new Date().toISOString(), type: 'deposit', source: selectedSource.name, asset, network, hash: undefined as never, amount, status: 'completed', txHash: randomHash() }
      recordDeposit(activeAccount.id, transaction)
      addSource(activeAccount.id, { ...selectedSource, balance: Math.max(0, selectedSource.balance - amount), lastUsed: new Date().toISOString() })
      setStep('success')
    }, 1200)
  }

  const renderModal = () => {
    if (!flow) return null

    if (flow.kind === 'connect') return <ModalShell eyebrow="Подключение источника" title="Подключить кошелёк" onClose={closeFlow}><div className="space-y-3"><button type="button" onClick={connectBrowserWallet} className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#e4e4f0] bg-white p-4 text-left transition hover:border-[#5a5ac4] hover:bg-[#f7f7fc]"><span className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#eeeef8] text-[#5a5ac4]"><Wallet size={20} /></span><span><b className="block text-sm text-[#25254f]">MetaMask / Rabby</b><span className="mt-0.5 block text-xs text-[#71719b]">Подключить browser wallet и подписать сообщение</span></span></span><ChevronRight size={18} className="text-[#71719b]" /></button><button type="button" onClick={connectWalletConnect} className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#e4e4f0] bg-white p-4 text-left transition hover:border-[#af47ff] hover:bg-[#f9f4ff]"><span className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#f4e9ff] text-[#8321d6]"><Link2 size={20} /></span><span><b className="block text-sm text-[#25254f]">WalletConnect</b><span className="mt-0.5 block text-xs text-[#71719b]">Trust Wallet, Ledger Live и другие приложения</span></span></span><ChevronRight size={18} className="text-[#71719b]" /></button><p className="rounded-xl bg-[#f5f5fa] p-3.5 text-xs leading-[1.5] text-[#71719b]">Подпись не создаёт транзакцию и не даёт Trigonum права распоряжаться средствами кошелька.</p>{message && <p className="rounded-lg bg-[#fdecec] px-3 py-2.5 text-xs text-[#b3383c]">{message}</p>}</div></ModalShell>

    if (flow.kind === 'exchange') return <ModalShell eyebrow="Подключение биржи" title="Подключить биржу" onClose={closeFlow}><div className="space-y-3.5"><div className="grid grid-cols-3 gap-2">{EXCHANGES.map((name) => <button key={name} type="button" onClick={() => setExchange(name)} className={`rounded-xl border p-3 text-sm font-bold ${exchange === name ? 'border-[#e5cdf7] bg-[#f4e9ff] text-[#8321d6]' : 'border-[#e4e4f0] bg-white text-[#3a3a63]'}`}>{name}</button>)}</div><FieldLabel label="API Key"><input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Введите API Key" className="mt-1.5 block w-full rounded-xl border border-[#e4e4f0] px-3 py-2.5 text-sm text-[#25254f] outline-none focus:border-[#5a5ac4]" /></FieldLabel><FieldLabel label="API Secret"><input type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder="••••••••••••" className="mt-1.5 block w-full rounded-xl border border-[#e4e4f0] px-3 py-2.5 text-sm text-[#25254f] outline-none focus:border-[#5a5ac4]" /></FieldLabel><div className="rounded-xl border border-[#d8ecdf] bg-[#eef7f1] p-3.5 text-xs leading-[1.45] text-[#1f5c36]"><p className="font-bold uppercase tracking-[.08em]">Какие разрешения нужны</p><p className="mt-2"><b>Обязательно</b> — чтение баланса и истории операций</p><p className="mt-2"><b>Обязательно</b> — вывод на whitelisted-адреса Trigonum для автоматического перевода</p><p className="mt-2 text-[#71719b]"><b>Не нужно</b> — торговые разрешения</p></div>{message && <p className="rounded-lg bg-[#fdecec] px-3 py-2.5 text-xs text-[#b3383c]">{message}</p>}<button type="button" onClick={connectExchange} className="w-full rounded-xl bg-[#25254f] px-4 py-3.5 text-sm font-bold text-white">Проверить и подключить {exchange}</button></div></ModalShell>

    if (flow.kind === 'verify') {
      const tx = flow.transaction
      const target = tx.status === 'completed' ? 12 : 5
      const done = confirmations >= target
      const confirmed = tx.status === 'completed' && done
      const explorer = EXPLORERS[tx.network] ?? EXPLORERS.Ethereum
      const hash = tx.txHash ?? 'Хэш транзакции недоступен'
      return <ModalShell eyebrow="Проверка перевода в сети" title="Статус транзакции" onClose={closeFlow}><div className="space-y-3.5"><div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#e4e4f0] bg-[#e4e4f0]"><ModalMetric label="Сумма" value={formatCurrency(Math.abs(tx.amount))} /><ModalMetric label="Сеть" value={tx.network} /></div><div className="rounded-xl border border-[#e4e4f0] p-3.5"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">Хэш транзакции</p><p className="mt-2 break-all text-[13px] text-[#25254f]">{hash}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => { if (tx.txHash) navigator.clipboard?.writeText(tx.txHash); setCopied(true) }} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e4e4f0] px-2.5 py-1.5 text-xs font-semibold text-[#3a3a63]"><Copy size={14} />{copied ? 'Скопировано' : 'Копировать хэш'}</button>{tx.txHash && <a href={`${explorer.base}${tx.txHash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[#e4e4f0] px-2.5 py-1.5 text-xs font-semibold text-[#5a5ac4]"><ExternalLink size={14} />Открыть в {explorer.name}</a>}</div></div><div className={`rounded-xl border p-4 ${confirmed ? 'border-[#d8ecdf] bg-[#eef7f1]' : done ? 'border-[#f2e2c2] bg-[#fdf6e8]' : 'border-[#cdcdf0] bg-[#eeeef8]'}`}><div className="flex items-center justify-between gap-3"><p className={`inline-flex items-center gap-2 text-sm font-bold ${confirmed ? 'text-[#2e9e4f]' : done ? 'text-[#e9a21c]' : 'text-[#5a5ac4]'}`}>{confirmed ? <CheckCircle2 size={17} /> : done ? <Clock3 size={17} /> : <LoaderCircle size={17} className="animate-spin" />}{confirmed ? 'Транзакция подтверждена' : done ? 'Ожидает подтверждений сети' : 'Проверяем в сети'}</p><span className="text-[13px] font-bold tabular-nums">{confirmations} / {target}</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/70"><div className={`h-full rounded-full transition-[width] duration-500 ${confirmed ? 'bg-[#2e9e4f]' : done ? 'bg-[#e9a21c]' : 'bg-[#5a5ac4]'}`} style={{ width: `${Math.min(100, confirmations / target * 100)}%` }} /></div><p className="mt-3 text-xs leading-[1.5] text-[#3a3a63]">{confirmed ? 'Средства зачислены на счёт Trigonum. Данные получены из сети по хэшу транзакции.' : done ? 'Транзакция найдена в сети, но подтверждений пока недостаточно. Зачисление произойдёт автоматически.' : 'Запрашиваем статус у сети по хэшу транзакции.'}</p></div><button type="button" onClick={() => setConfirmations(0)} className="w-full rounded-xl border border-[#e4e4f0] bg-white p-3 text-sm font-bold text-[#25254f]">Проверить в сети ещё раз</button></div></ModalShell>
    }

    if (flow.kind === 'deposit') {
      if (step === 'processing') return <ModalShell eyebrow="Пополнение счёта" title={`Пополнить с ${flow.source.name}`} onClose={closeFlow}><div className="py-6 text-center"><LoaderCircle size={30} className="mx-auto animate-spin text-[#5a5ac4]" /><p className="mt-4 text-lg font-bold text-[#25254f]">Операция отправлена</p><div className="mx-auto mt-4 inline-flex flex-col gap-2.5 text-left text-sm"><span className="inline-flex items-center gap-2 text-[#2e9e4f]"><CheckCircle2 size={16} />Транзакция создана</span><span className="inline-flex items-center gap-2 text-[#2e9e4f]"><CheckCircle2 size={16} />Отправлена в сеть</span><span className="inline-flex items-center gap-2 text-[#5a5ac4]"><Clock3 size={16} />Ожидаем подтверждения сети</span></div></div></ModalShell>
      if (step === 'success') return <ModalShell eyebrow="Пополнение счёта" title="Пополнение выполнено" onClose={closeFlow}><div className="py-5 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-[#eef7f1] text-[#2e9e4f]"><CheckCircle2 size={30} /></span><p className="mt-4 text-xl font-bold text-[#25254f]">Средства зачислены</p><p className="mt-2 text-3xl font-bold tabular-nums text-[#2e9e4f]">{formatCurrency(amount)}</p><p className="mt-2 text-[13px] text-[#71719b]">{asset} · {network}</p><button type="button" onClick={closeFlow} className="mt-5 w-full rounded-xl bg-[#25254f] p-3.5 text-sm font-bold text-white">Готово</button></div></ModalShell>

      return <ModalShell eyebrow="Пополнение счёта" title={`Пополнить с ${flow.source.name}`} onClose={closeFlow}><div className="space-y-3.5"><div className="flex items-center gap-3 rounded-xl bg-[#f5f5fa] px-3.5 py-3"><span className={`grid size-10 place-items-center rounded-xl bg-white ${flow.source.kind === 'exchange' ? 'text-[#8321d6]' : 'text-[#5a5ac4]'}`}><SourceIcon source={flow.source} /></span><div><p className="text-sm font-bold text-[#25254f]">{flow.source.name}</p><p className="mt-0.5 text-xs text-[#71719b]">{flow.source.detail}</p></div></div><div className="grid grid-cols-2 gap-3"><SelectField label="Актив" value={asset} onChange={setAsset} options={['USDT', 'USDC']} /><SelectField label="Сеть" value={network} onChange={setNetwork} options={flow.source.networks} /></div><FieldLabel label="Сумма" aside={`Макс. ${formatCurrency(flow.source.balance)}`}><span className="mt-1.5 flex items-center rounded-xl border border-[#e4e4f0] px-3"><b className="text-sm text-[#71719b]">$</b><input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full bg-transparent px-2 py-2.5 text-xl font-bold text-[#25254f] outline-none" /></span></FieldLabel><div className="grid grid-cols-2 gap-3 rounded-xl bg-[#f5f5fa] p-3.5"><div><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">Комиссия сети</p><p className="mt-1.5 text-[15px] font-bold tabular-nums text-[#25254f]">≈ {formatCurrency(fee)}</p></div><div><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">Будет зачислено</p><p className="mt-1.5 text-[15px] font-bold tabular-nums text-[#2e9e4f]">{formatCurrency(credited)}</p></div></div>{flow.source.kind === 'exchange' && <p className="rounded-xl border border-[#cdcdf0] bg-[#eeeef8] p-3.5 text-xs leading-[1.5] text-[#3a3a63]">Перевод с {flow.source.name} уйдёт автоматически: ключ имеет разрешение на вывод только на whitelisted-адреса Trigonum. Если разрешение отключено, подтвердите перевод в приложении биржи вручную.</p>}{message && <p className="rounded-lg bg-[#fdecec] px-3 py-2.5 text-xs text-[#b3383c]">{message}</p>}<button type="button" onClick={executeDeposit} className="w-full rounded-xl bg-[#5a5ac4] p-3.5 text-sm font-bold text-white">Пополнить {formatCurrency(amount)}</button></div></ModalShell>
    }

    return null
  }

  return (
    <div className="pb-10">
      <Hero name={activeAccount.name} accountNumber={activeAccount.accountNumber} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="На счёте Trigonum" value={formatCurrency(state.brokerBalance)} hint={`Личный счёт ${activeAccount.accountNumber}`} />
        <StatCard label="Свободно к операциям" value={formatCurrency(freeBalance)} hint="Можно инвестировать или вывести" color="#2e9e4f" />
        <StatCard label="На внешних источниках" value={formatCurrency(externalCapital)} hint={`${state.sources.length} подключённых источника`} />
        <StatCard label="Всего доступно" value={formatCurrency(state.brokerBalance + externalCapital)} hint="Счёт и подключённые источники" />
      </div>

      <Distribution brokerBalance={state.brokerBalance} freeBalance={freeBalance} locked={state.lockedEvents + state.pendingSettlement} sources={state.sources} />

      <section className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-[19px] font-bold text-[#25254f]">Ваши источники капитала</h2><p className="mt-1 text-sm text-[#71719b]">Пополнение идёт только с подтверждённых источников этого аккаунта</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setFlow({ kind: 'connect' }); setMessage('') }} className="inline-flex items-center gap-2 rounded-xl bg-[#25254f] px-3.5 py-2.5 text-sm font-semibold text-white"><Plus size={16} />Кошелёк</button><button type="button" onClick={() => { setFlow({ kind: 'exchange' }); setMessage('') }} className="inline-flex items-center gap-2 rounded-xl border border-[#e4e4f0] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#3a3a63]"><KeyRound size={16} />Биржа API</button></div></div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">{state.sources.map((source) => <SourceCard key={source.id} source={source} onDeposit={() => openDeposit(source)} onRemove={() => removeSource(activeAccount.id, source.id)} />)}{state.sources.length === 0 && <button type="button" onClick={() => setFlow({ kind: 'connect' })} className="flex min-h-[180px] flex-col items-center justify-center rounded-[18px] border border-dashed border-[#d3d3e6] bg-white"><Plus size={26} className="text-[#5a5ac4]" /><p className="mt-2.5 text-[15px] font-bold text-[#25254f]">Подключить первый источник</p><p className="mt-1 text-xs text-[#71719b]">WalletConnect, browser wallet или биржа</p></button>}</div>
      </section>

      <DepositHistory transactions={deposits} onVerify={(transaction) => { setCopied(false); setFlow({ kind: 'verify', transaction }) }} />
      {renderModal()}
    </div>
  )
}

function FieldLabel({ label, aside, children }: { label: string; aside?: string; children: ReactNode }) {
  return <label className="block"><span className="flex items-baseline justify-between gap-3"><span className="text-[11px] font-bold uppercase tracking-[.08em] text-[#71719b]">{label}</span>{aside && <span className="text-xs text-[#71719b]">{aside}</span>}</span>{children}</label>
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="block"><span className="text-[11px] font-bold uppercase tracking-[.08em] text-[#71719b]">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 block w-full rounded-xl border border-[#e4e4f0] bg-white px-3 py-2.5 text-sm text-[#25254f]">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
}

function ModalMetric({ label, value }: { label: string; value: string }) {
  return <div className="bg-white p-3.5"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">{label}</p><p className="mt-1.5 text-[17px] font-bold tabular-nums text-[#25254f]">{value}</p></div>
}
