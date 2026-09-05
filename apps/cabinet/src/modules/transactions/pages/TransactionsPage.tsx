import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileText,
  LoaderCircle,
  Repeat,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useBrokerAccount } from '../../../shared/lib/AccountContext'
import { CONTRACTS_STORAGE_KEY, defaultContracts } from '../../../shared/mock/contracts'
import { formatCurrency } from '../../../shared/lib/format'
import { useFunding, type FundingTransactionRecord } from '../../../shared/lib/FundingContext'

type TxKind = 'deposit' | 'withdrawal' | 'investment' | 'transfer' | 'accrual'

type TxRow = {
  id: string
  kind: TxKind
  date: string
  title: string
  meta: string
  amount: number
  status: 'completed' | 'processing'
  asset?: string
  network?: string
  hash?: string
}

type Contract = {
  id: string
  productName: string
  amount: number
  rate: string
  opened: string
  guaranteed: boolean
}


const EXPLORERS: Record<string, { name: string; base: string }> = {
  Arbitrum: { name: 'Arbiscan', base: 'https://arbiscan.io/tx/' },
  Ethereum: { name: 'Etherscan', base: 'https://etherscan.io/tx/' },
  ERC20: { name: 'Etherscan', base: 'https://etherscan.io/tx/' },
  Base: { name: 'Basescan', base: 'https://basescan.org/tx/' },
  TRC20: { name: 'Tronscan', base: 'https://tronscan.org/#/transaction/' },
}


const INTERNAL_SEED: TxRow[] = [
  { id: 'accrual-earn-sep', kind: 'accrual', date: '2026-09-03T09:00:00', title: 'Начисление доходности Earn', meta: 'Договор № CTR-2451 · ставка ~7% годовых', amount: 82, status: 'completed' },
  { id: 'payout-earn-aug', kind: 'transfer', date: '2026-08-15T10:00:00', title: 'Выплата доходности Earn', meta: 'Договор № CTR-2451 · выплата раз в месяц на свободный баланс', amount: 640, status: 'completed' },
  { id: 'payout-balanced-jun', kind: 'transfer', date: '2026-06-30T10:00:00', title: 'Выплата по стратегии', meta: 'Strategy «Balanced Growth» · № CTR-2478 · раз в квартал', amount: 410, status: 'completed' },
  { id: 'accrual-earn-aug', kind: 'accrual', date: '2026-08-03T09:00:00', title: 'Начисление доходности Earn', meta: 'Договор № CTR-2451 · ставка ~7% годовых', amount: 79, status: 'completed' },
]

const KIND_META: Record<TxKind, { label: string; bg: string; color: string; icon: ReactNode }> = {
  deposit: { label: 'Пополнение', bg: '#eef7f1', color: 'var(--trigonum-success)', icon: <ArrowDownCircle size={16} /> },
  withdrawal: { label: 'Вывод', bg: '#f4e9ff', color: '#8321d6', icon: <ArrowUpCircle size={16} /> },
  investment: { label: 'Инвестиция', bg: 'var(--trigonum-violet-soft)', color: 'var(--trigonum-violet)', icon: <ArrowUpCircle size={16} /> },
  transfer: { label: 'Выплата', bg: 'var(--trigonum-violet-soft)', color: 'var(--trigonum-violet)', icon: <Repeat size={16} /> },
  accrual: { label: 'Начисление', bg: '#fdf6e8', color: '#8a5f06', icon: <Sparkles size={16} /> },
}

function loadContracts(): Contract[] {
  try {
    const raw = window.localStorage.getItem(CONTRACTS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : defaultContracts
  } catch {
    return defaultContracts
  }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function plural(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} операция`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} операции`
  return `${n} операций`
}

function normalizeFunding(tx: FundingTransactionRecord): TxRow {
  const kind = tx.type === 'investment' ? 'investment' : tx.type
  const source = tx.source || 'Trigonum Broker'
  const title = tx.title ?? (kind === 'deposit' ? 'Пополнение счёта' : kind === 'withdrawal' ? 'Вывод средств' : 'Инвестиция')
  const meta = tx.meta ?? `${source}${tx.asset ? ` · ${tx.asset}` : ''}`
  return {
    id: tx.id,
    kind,
    date: tx.date,
    title,
    meta,
    amount: tx.amount,
    status: tx.status,
    asset: tx.asset,
    network: tx.network,
    hash: tx.txHash,
  }
}

function contractRows(contracts: Contract[]): TxRow[] {
  return contracts.map((contract) => ({
    id: `contract-${contract.id}`,
    kind: 'investment',
    date: `${contract.opened}T12:00:00`,
    title: 'Заключение договора',
    meta: `${contract.productName} · № ${contract.id} · ${contract.rate}`,
    amount: -Math.abs(contract.amount),
    status: 'completed',
  }))
}

function Modal({ row, onClose }: { row: TxRow; onClose: () => void }) {
  const [confirmations, setConfirmations] = useState(0)
  const [copied, setCopied] = useState(false)
  const target = row.status === 'completed' ? 12 : 5
  const done = confirmations >= target
  const confirmed = row.status === 'completed' && done
  const explorer = EXPLORERS[row.network ?? 'Ethereum'] ?? EXPLORERS.Ethereum

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setInterval(() => setConfirmations((current) => {
      const next = Math.min(target, current + 1)
      if (next >= target) window.clearInterval(timer)
      return next
    }), 420)
    return () => { document.body.style.overflow = previous; window.clearInterval(timer) }
  }, [target])

  return <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[rgb(8_27_58/45%)] p-8 backdrop-blur-[2px]" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}><div className="my-auto max-h-[88vh] w-full max-w-[520px] overflow-auto rounded-[18px] bg-white shadow-[0_25px_50px_-12px_rgb(8_27_58/40%)]"><div className="relative overflow-hidden bg-[linear-gradient(160deg,var(--trigonum-ink)_0%,#161638_100%)] px-[22px] py-5 text-white"><div className="absolute -right-[60px] -top-20 size-60 rounded-full bg-[radial-gradient(circle,rgb(117_117_255/40%)_0%,transparent_66%)]"/><div className="relative flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--trigonum-violet)]">Проверка перевода в сети</p><h2 className="mt-2 text-xl font-bold">{row.title}</h2></div><button type="button" onClick={onClose} className="rounded-lg border border-white/25 p-2"><X size={16}/></button></div></div><div className="space-y-3.5 px-[22px] py-5"><div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-border)]"><Metric label="Сумма" value={formatCurrency(Math.abs(row.amount))}/><Metric label="Актив и сеть" value={`${row.asset ?? 'USDT'} · ${row.network ?? '—'}`}/></div><div className="rounded-xl border border-[var(--trigonum-border)] p-3.5"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Хэш транзакции</p><p className="mt-2 break-all text-[13px] text-[var(--trigonum-ink)]">{row.hash ?? 'Хэш недоступен'}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => { if (row.hash) navigator.clipboard?.writeText(row.hash); setCopied(true) }} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--trigonum-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--trigonum-text)]"><Copy size={14}/>{copied ? 'Скопировано' : 'Копировать хэш'}</button>{row.hash && <a href={`${explorer.base}${row.hash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--trigonum-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--trigonum-violet)]"><ExternalLink size={14}/>Открыть в {explorer.name}</a>}</div></div><div className={`rounded-xl border p-4 ${confirmed ? 'border-[#d8ecdf] bg-[#eef7f1]' : done ? 'border-[#f2e2c2] bg-[#fdf6e8]' : 'border-[#cdcdf0] bg-[var(--trigonum-violet-soft)]'}`}><div className="flex items-center justify-between gap-3"><p className={`inline-flex items-center gap-2 text-sm font-bold ${confirmed ? 'text-[var(--trigonum-success)]' : done ? 'text-[#e9a21c]' : 'text-[var(--trigonum-violet)]'}`}>{confirmed ? <CheckCircle2 size={17}/> : done ? <FileText size={17}/> : <LoaderCircle size={17} className="animate-spin"/>}{confirmed ? 'Транзакция подтверждена' : done ? 'Ожидает подтверждений сети' : 'Проверяем в сети'}</p><b className="text-[13px] tabular-nums">{confirmations} / {target}</b></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/70"><div className={`h-full rounded-full transition-[width] duration-500 ${confirmed ? 'bg-[var(--trigonum-success)]' : done ? 'bg-[#e9a21c]' : 'bg-[var(--trigonum-violet)]'}`} style={{ width: `${Math.min(100, confirmations / target * 100)}%` }}/></div><p className="mt-3 text-xs leading-[1.5] text-[var(--trigonum-text)]">{confirmed ? 'Перевод подтверждён сетью. Данные получены по хэшу транзакции.' : done ? 'Транзакция найдена в сети, ожидает подтверждений.' : 'Запрашиваем статус у сети по хэшу транзакции.'}</p></div><button type="button" onClick={() => setConfirmations(0)} className="w-full rounded-xl border border-[var(--trigonum-border)] bg-white p-3 text-sm font-bold text-[var(--trigonum-ink)]">Проверить в сети ещё раз</button></div></div></div>
}

export function TransactionsPage() {
  const { activeAccount } = useBrokerAccount()
  const { getAccountState } = useFunding()
  const funding = getAccountState(activeAccount.id)
  const [filter, setFilter] = useState<'all' | TxKind>('all')
  const [verify, setVerify] = useState<TxRow | null>(null)
  const [contracts, setContracts] = useState<Contract[]>(loadContracts)

  useEffect(() => {
    const sync = () => setContracts(loadContracts())
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('focus', sync) }
  }, [])

  const rows = useMemo(() => {
    const fundingRows = funding.transactions.map(normalizeFunding)
    const fundingInvestmentIds = new Set(fundingRows.filter((row) => row.kind === 'investment').map((row) => row.meta.match(/CTR-\d+/)?.[0]).filter(Boolean))
    const investments = contractRows(contracts).filter((row) => !fundingInvestmentIds.has(row.meta.match(/CTR-\d+/)?.[0]))
    return [...fundingRows, ...investments, ...INTERNAL_SEED].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [contracts, funding.transactions])

  const visible = rows.filter((row) => filter === 'all' || row.kind === filter)
  const filters: { id: 'all' | TxKind; label: string }[] = [
    { id: 'all', label: 'Все транзакции' },
    { id: 'deposit', label: 'Пополнения' },
    { id: 'withdrawal', label: 'Выводы' },
    { id: 'investment', label: 'Инвестиции' },
    { id: 'transfer', label: 'Выплаты' },
    { id: 'accrual', label: 'Начисления' },
  ]

  return <div className="pb-10"><header className="mb-5"><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[var(--trigonum-violet)]">Личный счёт · {activeAccount.accountNumber}</p><h1 className="mt-2.5 text-[28px] font-bold tracking-[-.01em] text-[var(--trigonum-ink)]">Транзакции</h1><p className="mt-2 max-w-[620px] text-sm leading-[1.55] text-[var(--trigonum-muted)]">Заключение договоров, пополнения, выводы, выплаты и начисление доходности. Переводы в сети можно проверить по хэшу.</p></header><section className="rounded-[18px] border border-[var(--trigonum-border)] bg-white px-6 py-5 shadow-[0_8px_30px_rgb(8_27_58/8%)]"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2">{filters.map((item) => <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`rounded-[10px] border px-3 py-2 text-[13px] font-semibold ${filter === item.id ? 'border-[var(--trigonum-ink)] bg-[var(--trigonum-ink)] text-white' : 'border-[var(--trigonum-border)] bg-white text-[var(--trigonum-text)]'}`}>{item.label}</button>)}</div><span className="text-xs text-[var(--trigonum-muted)]">{plural(visible.length)}</span></div><div className="mt-[18px] overflow-x-auto"><table className="w-full min-w-[800px] table-fixed border-collapse"><thead><tr className="text-left text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]"><th className="w-[15%] border-b border-[var(--trigonum-border)] pb-2">Дата</th><th className="w-[41%] border-b border-[var(--trigonum-border)] pb-2">Операция</th><th className="w-[14%] border-b border-[var(--trigonum-border)] pb-2">Сумма</th><th className="w-[14%] border-b border-[var(--trigonum-border)] pb-2">Статус</th><th className="w-[16%] border-b border-[var(--trigonum-border)] pb-2 text-right">Проверка</th></tr></thead><tbody>{visible.map((row) => { const meta = KIND_META[row.kind]; const onchain = (row.kind === 'deposit' || row.kind === 'withdrawal') && !!row.hash; return <tr key={row.id} className="text-[13px]"><td className="border-b border-[var(--trigonum-border)] py-3 pr-2 text-[var(--trigonum-text)]"><span className="block whitespace-nowrap tabular-nums">{formatDate(row.date)}</span><span className="mt-0.5 block text-[11px] text-[var(--trigonum-muted)]">{formatTime(row.date)}</span></td><td className="border-b border-[var(--trigonum-border)] py-3 pr-2"><span className="flex items-center gap-2.5"><span className="grid size-8 shrink-0 place-items-center rounded-[10px]" style={{ background: meta.bg, color: meta.color }}>{meta.icon}</span><span className="min-w-0"><span className="block font-semibold text-[var(--trigonum-ink)]">{meta.label}</span><span className="mt-0.5 block text-xs text-[var(--trigonum-text)]">{row.title}</span><span className="mt-0.5 block text-[11px] text-[var(--trigonum-muted)]">{row.meta}</span></span></span></td><td className={`border-b border-[var(--trigonum-border)] py-3 pr-2 whitespace-nowrap font-bold tabular-nums ${row.amount > 0 ? 'text-[var(--trigonum-success)]' : 'text-[var(--trigonum-ink)]'}`}>{row.amount > 0 ? '+' : ''}{formatCurrency(row.amount)}</td><td className={`border-b border-[var(--trigonum-border)] py-3 pr-2 font-semibold ${row.status === 'completed' ? 'text-[var(--trigonum-success)]' : 'text-[#e9a21c]'}`}>{row.status === 'completed' ? 'Выполнено' : 'В обработке'}</td><td className="border-b border-[var(--trigonum-border)] py-3 text-right">{onchain ? <button type="button" onClick={() => setVerify(row)} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--trigonum-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--trigonum-violet)] transition hover:border-[var(--trigonum-violet)] hover:bg-[var(--trigonum-bg)]"><Search size={14}/>В сети</button> : <span className="text-[11px] text-[#b0b0c8]">внутренняя</span>}</td></tr>})}</tbody></table></div></section>{verify && <Modal row={verify} onClose={() => setVerify(null)}/>}</div>
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="bg-white p-3.5"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{label}</p><p className="mt-1.5 text-[17px] font-bold text-[var(--trigonum-ink)]">{value}</p></div>
}
