import {
  ArrowUpFromLine,
  Building2,
  CheckCircle2,
  ChevronLeft,
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
  | { kind: 'address' }
  | { kind: 'withdraw'; sourceId?: string }
  | { kind: 'verify'; transaction: FundingTransactionRecord }
  | null

type Step = 'form' | 'processing' | 'success'
type CalendarKind = 'earn' | 'target' | 'end' | 'event'

type CalendarEvent = {
  id: string
  date: string
  kind: CalendarKind
  title: string
  meta: string
  amount: number
  isPayout: boolean
  approx?: boolean
  unknownResult?: boolean
}

const TODAY = '2026-09-04'
const NETWORK_FEE: Record<string, number> = { Arbitrum: 0.12, Base: 0.08, Ethereum: 4.8, TRC20: 1, ERC20: 4.8 }
const EXPLORERS: Record<string, { name: string; base: string }> = {
  Arbitrum: { name: 'Arbiscan', base: 'https://arbiscan.io/tx/' },
  Base: { name: 'Basescan', base: 'https://basescan.org/tx/' },
  Ethereum: { name: 'Etherscan', base: 'https://etherscan.io/tx/' },
  ERC20: { name: 'Etherscan', base: 'https://etherscan.io/tx/' },
  TRC20: { name: 'Tronscan', base: 'https://tronscan.org/#/transaction/' },
}
const MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']
const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
const EXCHANGES = ['Bybit', 'OKX', 'Binance', 'Bitget', 'Gate.io', 'KuCoin']
const KIND_STYLE: Record<CalendarKind, { label: string; color: string; bg: string; border: string }> = {
  earn: { label: 'Начисление Earn · гарантировано', color: 'var(--trigonum-success)', bg: '#eef7f1', border: '#d8ecdf' },
  target: { label: 'Выплата по стратегии · целевая', color: '#0b7fa6', bg: '#e8f8ff', border: '#c3ebf8' },
  end: { label: 'Окончание договора', color: 'var(--trigonum-violet)', bg: 'var(--trigonum-violet-soft)', border: '#cdcdf0' },
  event: { label: 'Закрытие Event', color: '#8321d6', bg: '#f4e9ff', border: '#e5cdf7' },
}

const contracts = [
  { id: 'CTR-2451', kind: 'earn', product: 'Earn Reserve', amount: 14_000, payoutAvailable: 640, period: 'раз в месяц', nextPayout: '2026-09-15', payoutEstimate: 82, endDate: null as string | null, unlocked: true },
  { id: 'CTR-2478', kind: 'strategy', product: 'Strategy Market Neutral', amount: 12_000, payoutAvailable: 0, period: 'раз в квартал', nextPayout: '2026-09-30', payoutEstimate: 380, endDate: '2026-11-12', unlocked: false },
  { id: 'CTR-2490', kind: 'strategy', product: 'Strategy Global Macro', amount: 5_000, payoutAvailable: 0, period: 'раз в полгода', nextPayout: '2026-10-01', payoutEstimate: 210, endDate: '2026-12-01', unlocked: false },
]

function randomHash() {
  const chars = '0123456789abcdef'
  return `0x${Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function dateHuman(iso: string) {
  const d = new Date(`${iso}T00:00:00`)
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`
}

function daysUntil(iso: string) {
  const a = new Date(`${TODAY}T00:00:00`)
  const b = new Date(`${iso}T00:00:00`)
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000))
}

function sourceLimit(source: FundingSource) {
  if (source.kind === 'exchange') return 100_000
  if (source.kind === 'address') return 25_000
  return 50_000
}

function SourceIcon({ source }: { source: FundingSource }) {
  if (source.kind === 'exchange') return <Building2 size={20} />
  if (source.kind === 'address') return <Link2 size={20} />
  return <Wallet size={20} />
}

function StatCard({ label, value, hint, color = 'var(--trigonum-ink)' }: { label: string; value: string; hint: string; color?: string }) {
  return <div className="rounded-[18px] border border-[var(--trigonum-border)] bg-white px-5 py-[18px] shadow-[0_8px_30px_rgb(8_27_58/8%)]"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{label}</p><p className="mt-2.5 text-2xl font-bold tabular-nums" style={{ color }}>{value}</p><p className="mt-1.5 text-xs text-[var(--trigonum-muted)]">{hint}</p></div>
}

function Hero({ name, accountNumber, onWithdraw }: { name: string; accountNumber: string; onWithdraw: () => void }) {
  return <header className="mb-5 overflow-hidden rounded-[18px] shadow-[0_8px_30px_rgb(8_27_58/8%)]"><div className="h-[3px] bg-[linear-gradient(100deg,#92f222_0%,#12ccff_50%,#af47ff_100%)]" /><div className="relative overflow-hidden bg-[linear-gradient(160deg,var(--trigonum-ink)_0%,#161638_100%)] text-white"><svg viewBox="0 0 420 220" preserveAspectRatio="none" className="absolute right-0 top-0 h-full w-[46%] opacity-50" aria-hidden="true"><path d="M40 220 L210 40" fill="none" stroke="rgb(255 255 255 / 14%)" /><path d="M210 40 L380 220" fill="none" stroke="rgb(255 255 255 / 14%)" /><path d="M210 40 L210 220" fill="none" stroke="rgb(255 255 255 / 14%)" /><circle cx="210" cy="40" r="3" fill="var(--trigonum-violet)" /></svg><div className="relative flex flex-wrap items-center justify-between gap-7 px-7 py-6"><div className="min-w-0 flex-1 basis-[380px]"><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#92f222]">Капитал · вывод средств</p><h1 className="mt-2.5 text-[38px] font-semibold leading-none tracking-[-.03em]">Вывести</h1><p className="mt-2.5 max-w-[520px] text-sm leading-[1.55] text-white/70">Выводите свободный капитал и выплаты по договорам на подтверждённые личные реквизиты.</p></div><div className="shrink-0 rounded-xl border border-white/20 px-5 py-4"><p className="text-[10px] font-bold uppercase tracking-[.1em] text-white/60">Личный счёт</p><p className="mt-2 text-[15px] font-bold">{name}</p><p className="mt-1 text-xs text-white/60">{accountNumber} · KYC подтверждён</p><button type="button" onClick={onWithdraw} className="mt-3.5 w-full rounded-[10px] bg-white px-4 py-2.5 text-[13px] font-bold text-[var(--trigonum-ink)]">Вывести средства</button></div></div></div></header>
}

function CapitalOverview({ available, freeBalance, payouts, lockedEvents }: { available: number; freeBalance: number; payouts: number; lockedEvents: number }) {
  const lockedContracts = contracts.filter((c) => !c.unlocked).reduce((sum, c) => sum + c.amount, 0)
  const earnBody = contracts.filter((c) => c.unlocked).reduce((sum, c) => sum + c.amount, 0)
  const split = [
    { label: 'Доступно к выводу', amount: available, color: '#92f222' },
    { label: 'В активных Events', amount: lockedEvents, color: '#af47ff' },
    { label: 'Earn Reserve', amount: earnBody, color: '#12ccff' },
    { label: 'Стратегии', amount: lockedContracts, color: 'var(--trigonum-violet)' },
  ]
  const total = split.reduce((sum, item) => sum + item.amount, 0)
  const unlocks = [
    { label: 'Закрытие активных Events', amount: lockedEvents, date: '2026-09-20', color: '#af47ff' },
    { label: 'Окончание Strategy Market Neutral', amount: 12_000, date: '2026-11-12', color: 'var(--trigonum-violet)' },
    { label: 'Окончание Strategy Global Macro', amount: 5_000, date: '2026-12-01', color: 'var(--trigonum-violet)' },
  ]

  return <section className="mt-4 overflow-hidden rounded-[18px] border border-[var(--trigonum-border)] bg-white shadow-[0_8px_30px_rgb(8_27_58/8%)]"><div className="grid gap-px bg-[var(--trigonum-border)] lg:grid-cols-2"><div className="bg-white px-6 py-[22px]"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Можно вывести сейчас</p><p className="mt-2.5 text-[36px] font-semibold leading-none tracking-[-.03em] tabular-nums text-[var(--trigonum-success)]">{formatCurrency(available)}</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-[10px] border border-[var(--trigonum-border)] px-3 py-2"><span className="block text-[11px] text-[var(--trigonum-muted)]">Свободный баланс счёта</span><b className="mt-0.5 block text-[15px] tabular-nums text-[var(--trigonum-ink)]">{formatCurrency(freeBalance)}</b></span><span className="rounded-[10px] border border-[var(--trigonum-border)] px-3 py-2"><span className="block text-[11px] text-[var(--trigonum-muted)]">Доход Earn Reserve</span><b className="mt-0.5 block text-[15px] tabular-nums text-[var(--trigonum-ink)]">{formatCurrency(payouts)}</b></span></div></div><div className="bg-white px-6 py-[22px]"><div className="flex items-baseline justify-between gap-3"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Весь капитал на счёте</p><b className="text-[13px] tabular-nums text-[var(--trigonum-ink)]">{formatCurrency(total)}</b></div><div className="mt-3.5 flex h-3 overflow-hidden rounded-full bg-[var(--trigonum-violet-soft)]">{split.map((item) => <span key={item.label} style={{ width: `${total ? item.amount / total * 100 : 0}%`, background: item.color }} />)}</div><div className="mt-4 grid grid-cols-1 gap-x-[18px] gap-y-2.5 sm:grid-cols-2">{split.map((item) => <div key={item.label} className="flex items-center gap-2"><span className="size-2 shrink-0 rounded-full" style={{ background: item.color }} /><span className="min-w-0 flex-1 text-xs text-[var(--trigonum-muted)]">{item.label}</span><b className="shrink-0 text-xs tabular-nums text-[var(--trigonum-ink)]">{formatCurrency(item.amount)}</b></div>)}</div></div></div><div className="border-t border-[var(--trigonum-border)] px-6 py-[22px]"><div className="flex items-baseline justify-between gap-3"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Когда освободится залоченный капитал</p><b className="text-[13px] tabular-nums text-[var(--trigonum-ink)]">{formatCurrency(lockedEvents + lockedContracts)}</b></div><div className="mt-[22px] grid gap-4 sm:grid-cols-3">{unlocks.map((item) => <div key={item.label} className="min-w-0"><b className="text-[15px] tabular-nums text-[var(--trigonum-ink)]">{formatCurrency(item.amount)}</b><span className="relative mt-2 block h-3.5"><span className="absolute left-0 right-[-16px] top-1.5 h-0.5 bg-[var(--trigonum-border)]" /><span className="absolute left-0 top-0 size-3.5 rounded-full border-[3px] border-white" style={{ background: item.color, boxShadow: `0 0 0 1px ${item.color}` }} /></span><b className="mt-2.5 block text-xs text-[var(--trigonum-ink)]">{dateHuman(item.date)}</b><span className="mt-1 block text-xs leading-[1.35] text-[var(--trigonum-muted)]">{item.label}</span><span className="mt-0.5 block text-[11px] text-[#b0b0c8]">через {daysUntil(item.date)} дн.</span></div>)}</div></div></section>
}

function calendarEvents(lockedEvents: number): CalendarEvent[] {
  const out: CalendarEvent[] = []
  contracts.forEach((contract) => {
    const guaranteed = contract.kind === 'earn'
    out.push({ id: `payout-${contract.id}`, date: contract.nextPayout, kind: guaranteed ? 'earn' : 'target', title: guaranteed ? `Начисление ${contract.product}` : `Целевая выплата ${contract.product}`, amount: guaranteed ? contract.payoutAvailable || contract.payoutEstimate : contract.payoutEstimate, approx: !guaranteed, meta: guaranteed ? `Договор № ${contract.id} · фиксированная ставка, начисление ${contract.period}` : `Договор № ${contract.id} · выплата ${contract.period}, сумма определится по результату периода`, isPayout: true })
    if (contract.endDate) out.push({ id: `end-${contract.id}`, date: contract.endDate, kind: 'end', title: `Окончание ${contract.product}`, amount: contract.amount, meta: `Договор № ${contract.id} · тело договора возвращается на свободный баланс`, isPayout: false })
  })
  out.push({ id: 'event-close', date: '2026-09-20', kind: 'event', title: 'Закрытие активных Events', amount: lockedEvents, meta: 'Капитал вернётся на счёт, результат по факту закрытия — заранее не определён', isPayout: false, unknownResult: true })
  return out
}

function PayoutCalendar({ lockedEvents, onWithdrawPayout }: { lockedEvents: number; onWithdrawPayout: (amount: number) => void }) {
  const [viewYear, setViewYear] = useState(2026)
  const [viewMonth, setViewMonth] = useState(8)
  const [selectedDate, setSelectedDate] = useState('2026-09-15')
  const [globalReinvest, setGlobalReinvest] = useState(false)
  const [reinvest, setReinvest] = useState<Record<string, boolean>>({})
  const [autoWithdraw, setAutoWithdraw] = useState<Record<string, boolean>>({})
  const events = useMemo(() => calendarEvents(lockedEvents), [lockedEvents])
  const first = new Date(viewYear, viewMonth, 1)
  const startOffset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const days = Array.from({ length: startOffset + daysInMonth }, (_, index) => {
    if (index < startOffset) return null
    const day = index - startOffset + 1
    const date = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayEvents = events.filter((event) => event.date === date)
    return { day, date, events: dayEvents }
  })
  const selected = events.filter((event) => event.date === selectedDate)
  const selectedDateObj = new Date(`${selectedDate}T00:00:00`)

  return <section className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,1fr)]"><div className="rounded-[18px] border border-[var(--trigonum-border)] bg-white px-6 py-5 shadow-[0_8px_30px_rgb(8_27_58/8%)]"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-[15px] font-semibold text-[var(--trigonum-ink)]">Календарь выплат</h2><p className="mt-1 text-xs text-[var(--trigonum-muted)]">Начисления Earn, целевые выплаты по стратегиям, закрытия Events и окончания договоров</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => viewMonth === 0 ? (setViewMonth(11), setViewYear((year) => year - 1)) : setViewMonth((month) => month - 1)} className="grid size-8 place-items-center rounded-lg border border-[var(--trigonum-border)] bg-white text-[var(--trigonum-text)]"><ChevronLeft size={16} /></button><span className="min-w-[150px] text-center text-sm font-bold text-[var(--trigonum-ink)]">{MONTHS[viewMonth]} {viewYear}</span><button type="button" onClick={() => viewMonth === 11 ? (setViewMonth(0), setViewYear((year) => year + 1)) : setViewMonth((month) => month + 1)} className="grid size-8 place-items-center rounded-lg border border-[var(--trigonum-border)] bg-white text-[var(--trigonum-text)]"><ChevronRight size={16} /></button></div></div><div className="mt-[18px] grid grid-cols-7 gap-1.5">{['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((day) => <span key={day} className="text-center text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{day}</span>)}</div><div className="mt-2 grid grid-cols-7 gap-1.5">{days.map((day, index) => day ? <button key={day.date} type="button" onClick={() => setSelectedDate(day.date)} className={`relative flex min-h-[58px] flex-col items-center justify-start rounded-[10px] border px-1 py-2 ${selectedDate === day.date ? 'border-[var(--trigonum-ink)] bg-[var(--trigonum-ink)] text-white' : day.events.length ? 'border-[var(--trigonum-border)] bg-[var(--trigonum-bg)] text-[var(--trigonum-ink)]' : day.date === TODAY ? 'border-[var(--trigonum-violet)] bg-white text-[var(--trigonum-ink)]' : 'border-[var(--trigonum-border)] bg-white text-[var(--trigonum-muted)]'}`}><span className="text-[13px] font-bold tabular-nums">{day.day}</span><span className="mt-1.5 flex gap-[3px]">{day.events.map((event) => <span key={event.id} className="size-1.5 rounded-full" style={{ background: KIND_STYLE[event.kind].color }} />)}</span></button> : <span key={`empty-${index}`} />)}</div><div className="mt-4 flex flex-wrap gap-3.5">{Object.values(KIND_STYLE).map((kind) => <span key={kind.label} className="inline-flex items-center gap-1.5 text-[11px] text-[var(--trigonum-muted)]"><span className="size-2 rounded-full" style={{ background: kind.color }} />{kind.label}</span>)}</div></div><div className="rounded-[18px] border border-[var(--trigonum-border)] bg-white p-5 shadow-[0_8px_30px_rgb(8_27_58/8%)]"><h2 className="text-[15px] font-semibold text-[var(--trigonum-ink)]">{selectedDateObj.getDate()} {MONTHS_GEN[selectedDateObj.getMonth()]} {selectedDateObj.getFullYear()}</h2>{selected.length ? <div className="mt-3.5 space-y-3">{selected.map((event) => { const kind = KIND_STYLE[event.kind]; const reinvestOn = reinvest[event.id] ?? globalReinvest; const autoOn = !!autoWithdraw[event.id]; const accrued = event.kind === 'earn' && event.amount > 0; return <div key={event.id} className="rounded-xl border p-3.5" style={{ borderColor: kind.border, background: kind.bg }}><div className="flex items-start justify-between gap-2.5"><div className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-[.08em]" style={{ color: kind.color }}>{kind.label}</span><b className="mt-1.5 block text-sm text-[var(--trigonum-ink)]">{event.title}</b><span className="mt-1 block text-xs leading-[1.45] text-[var(--trigonum-muted)]">{event.meta}</span></div><b className="shrink-0 text-[15px] tabular-nums" style={{ color: kind.color }}>{event.unknownResult ? formatCurrency(event.amount) : `${event.isPayout ? event.approx ? '~+' : '+' : ''}${formatCurrency(event.amount)}`}</b></div>{event.isPayout && <div className="mt-3 space-y-2.5"><Toggle label="Автоматически реинвестировать" hint={reinvestOn ? 'Выплата уйдёт в новый договор Earn Reserve' : 'Выплата останется на свободном балансе'} on={reinvestOn} color="var(--trigonum-success)" onClick={() => setReinvest((current) => ({ ...current, [event.id]: !reinvestOn }))} />{!accrued && !reinvestOn && <Toggle label="Вывести автоматически после выплаты" hint={autoOn ? 'После выплаты сумма уйдёт на выбранный реквизит' : 'Сумма останется на свободном балансе до вашего решения'} on={autoOn} color="var(--trigonum-violet)" onClick={() => setAutoWithdraw((current) => ({ ...current, [event.id]: !autoOn }))} />}{accrued && <button type="button" onClick={() => onWithdrawPayout(event.amount)} className="w-full rounded-[10px] bg-[var(--trigonum-violet)] px-3 py-2.5 text-[13px] font-bold text-white">Вывести начисленное</button>}</div>}</div> })}</div> : <p className="mt-3.5 text-[13px] text-[var(--trigonum-muted)]">В этот день выплат нет.</p>}<div className="mt-[18px] border-t border-[var(--trigonum-border)] pt-4"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Правило по умолчанию</p><Toggle label={globalReinvest ? 'Реинвестировать все выплаты' : 'Выплаты приходят на свободный баланс'} hint={globalReinvest ? 'Каждая выплата открывает новый договор Earn Reserve' : 'Каждую выплату можно вывести вручную'} on={globalReinvest} color="var(--trigonum-success)" onClick={() => { setGlobalReinvest((value) => !value); setReinvest({}) }} /></div></div></section>
}

function Toggle({ label, hint, on, color, onClick }: { label: string; hint: string; on: boolean; color: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center justify-between gap-2.5 rounded-[10px] border border-[var(--trigonum-border)] bg-white px-3 py-2.5 text-left"><span><b className="block text-xs text-[var(--trigonum-ink)]">{label}</b><span className="mt-0.5 block text-[11px] text-[var(--trigonum-muted)]">{hint}</span></span><span className="relative h-[22px] w-[38px] shrink-0 rounded-full" style={{ background: on ? color : '#d3d3e6' }}><span className="absolute top-[3px] size-4 rounded-full bg-white transition-all" style={{ left: on ? 19 : 3 }} /></span></button>
}

function DestinationCard({ source, onWithdraw, onRemove }: { source: FundingSource; onWithdraw: () => void; onRemove: () => void }) {
  const cooldown = !!source.cooldownUntil && new Date(source.cooldownUntil).getTime() > new Date(`${TODAY}T00:00:00`).getTime()
  const limit = sourceLimit(source)
  const iconClass = source.kind === 'exchange' ? 'bg-[#f4e9ff] text-[#8321d6]' : source.kind === 'address' ? 'bg-[#e8f8ff] text-[#0b7fa6]' : 'bg-[var(--trigonum-violet-soft)] text-[var(--trigonum-violet)]'
  return <article className="flex h-full flex-col overflow-hidden rounded-[18px] border border-[var(--trigonum-border)] bg-white shadow-[0_8px_30px_rgb(8_27_58/8%)]"><div className="flex-1 p-[18px]"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className={`grid size-11 shrink-0 place-items-center rounded-xl ${iconClass}`}><SourceIcon source={source} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-[15px] font-bold text-[var(--trigonum-ink)]">{source.name}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cooldown ? 'bg-[#fdf6e8] text-[#8a5f06]' : 'bg-[#eef7f1] text-[var(--trigonum-success)]'}`}>{cooldown ? 'Cooldown 24 ч' : 'В whitelist'}</span></div><p className="mt-1 text-xs text-[var(--trigonum-muted)]">{source.detail}</p></div></div><button type="button" onClick={onRemove} title="Удалить реквизит" className="shrink-0 rounded-lg p-1.5 text-[#b0b0c8] transition hover:bg-[#fdecec] hover:text-[var(--trigonum-danger)]"><Unplug size={15} /></button></div><div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#f5f5fa] p-3.5"><div><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Лимит за сутки</p><p className="mt-1.5 text-[15px] font-bold tabular-nums text-[var(--trigonum-ink)]">{formatCurrency(limit)}</p></div><div><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Сети</p><p className="mt-1.5 text-[13px] font-semibold text-[var(--trigonum-ink)]">{source.networks.slice(0, 2).join(' · ')}</p></div></div></div><button type="button" onClick={onWithdraw} disabled={cooldown} className={`flex min-h-[50px] w-full items-center justify-between border-t border-[var(--trigonum-border)] px-[18px] py-3.5 text-sm font-semibold ${cooldown ? 'cursor-not-allowed text-[#b0b0c8]' : 'text-[var(--trigonum-violet)] hover:bg-[#f5f5fa]'}`}><span className="inline-flex items-center gap-2"><ArrowUpFromLine size={16} />{cooldown ? `Доступно после ${dateHuman(source.cooldownUntil!.slice(0, 10))}` : `Вывести на ${source.name}`}</span><ChevronRight size={16} /></button></article>
}

function ModalShell({ eyebrow, title, onClose, children }: { eyebrow: string; title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => { const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; const key = (event: KeyboardEvent) => event.key === 'Escape' && onClose(); window.addEventListener('keydown', key); return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', key) } }, [onClose])
  return <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[rgb(8_27_58/45%)] p-8 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className="my-auto max-h-[88vh] w-full max-w-[520px] overflow-auto rounded-[18px] bg-white shadow-[0_25px_50px_-12px_rgb(8_27_58/40%)]"><div className="relative overflow-hidden bg-[linear-gradient(160deg,var(--trigonum-ink)_0%,#161638_100%)] px-[22px] py-5 text-white"><div className="absolute -right-[60px] -top-20 size-60 rounded-full bg-[radial-gradient(circle,rgb(117_117_255/40%)_0%,transparent_66%)]" /><div className="relative flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--trigonum-violet)]">{eyebrow}</p><h2 className="mt-2 text-xl font-bold">{title}</h2></div><button type="button" onClick={onClose} className="rounded-lg border border-white/25 bg-transparent p-2 text-white"><X size={16} /></button></div></div><div className="px-[22px] py-5">{children}</div></div></div>
}

export function PersonalWithdrawV2() {
  const { activeAccount } = useBrokerAccount()
  const { getAccountState, addSource, removeSource, recordWithdrawal } = useFunding()
  const state = getAccountState(activeAccount.id)
  const [flow, setFlow] = useState<Flow>(null)
  const [step, setStep] = useState<Step>('form')
  const [destinationId, setDestinationId] = useState(state.sources[0]?.id ?? '')
  const [amount, setAmount] = useState(10_000)
  const [asset, setAsset] = useState('USDT')
  const [network, setNetwork] = useState(state.sources[0]?.networks[0] ?? 'Arbitrum')
  const [code, setCode] = useState('')
  const [exchange, setExchange] = useState('Bybit')
  const [exchangeAddress, setExchangeAddress] = useState('')
  const [manualName, setManualName] = useState('Ledger Vault')
  const [manualAddress, setManualAddress] = useState('')
  const [manualNetwork, setManualNetwork] = useState('Arbitrum')
  const [message, setMessage] = useState('')
  const [confirmations, setConfirmations] = useState(0)
  const [copied, setCopied] = useState(false)

  const payouts = contracts.reduce((sum, contract) => sum + contract.payoutAvailable, 0)
  const freeBalance = Math.max(0, state.brokerBalance - state.lockedEvents - state.pendingSettlement)
  const available = freeBalance + payouts
  const lockedContracts = contracts.filter((contract) => !contract.unlocked).reduce((sum, contract) => sum + contract.amount, 0)
  const withdrawals = useMemo(() => state.transactions.filter((tx) => tx.type === 'withdrawal'), [state.transactions])
  const destination = state.sources.find((source) => source.id === destinationId) ?? state.sources[0]
  const fee = NETWORK_FEE[network] ?? 1
  const receive = Math.max(0, amount - fee)

  const closeFlow = () => { setFlow(null); setStep('form'); setMessage(''); setCode(''); setConfirmations(0); setCopied(false); setExchangeAddress(''); setManualAddress('') }
  const openWithdraw = (sourceId?: string, presetAmount?: number) => {
    const selected = state.sources.find((source) => source.id === sourceId) ?? state.sources[0]
    if (selected) { setDestinationId(selected.id); setNetwork(selected.networks[0] ?? 'Arbitrum') }
    setAmount(Math.min(presetAmount ?? 10_000, available, selected ? sourceLimit(selected) : available))
    setMessage(''); setCode(''); setStep('form'); setFlow({ kind: 'withdraw', sourceId: selected?.id })
  }

  useEffect(() => {
    if (flow?.kind !== 'verify') return
    setConfirmations(0)
    const target = flow.transaction.status === 'completed' ? 12 : 5
    const timer = window.setInterval(() => setConfirmations((current) => { const next = Math.min(target, current + 1); if (next >= target) window.clearInterval(timer); return next }), 420)
    return () => window.clearInterval(timer)
  }, [flow])

  const connectBrowserWallet = async () => {
    const ethereum = (window as Window & { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum
    if (!ethereum) { setMessage('Browser wallet не найден. Установите MetaMask/Rabby или используйте WalletConnect.'); return }
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[]
      const address = accounts?.[0]
      if (!address) throw new Error('No address')
      await ethereum.request({ method: 'personal_sign', params: [`Подтверждаю добавление ${address} в whitelist Trigonum Broker ${activeAccount.accountNumber}`, address] })
      addSource(activeAccount.id, { id: `wallet-${address.toLowerCase()}`, kind: 'wallet', connection: 'browser-wallet', name: 'Browser Wallet', detail: shortAddress(address), address, asset: 'USDT', balance: 0, networks: ['Arbitrum', 'Ethereum', 'Base'], verified: true, lastUsed: new Date().toISOString() })
      closeFlow()
    } catch { setMessage('Подключение или подпись отменены в кошельке.') }
  }

  const connectWalletConnect = () => { addSource(activeAccount.id, { id: 'wallet-wc-demo', kind: 'wallet', connection: 'walletconnect', name: 'WalletConnect', detail: '0x5C91…88F2', address: '0x5C91B12A7F932671242C11B20755B9094C1188F2', asset: 'USDT', balance: 0, networks: ['Arbitrum', 'Base', 'Ethereum'], verified: true, lastUsed: new Date().toISOString() }); closeFlow() }
  const saveExchange = () => { const address = exchangeAddress.trim(); if (address.length < 8) { setMessage('Введите депозитный адрес биржи.'); return } addSource(activeAccount.id, { id: `withdraw-exchange-${exchange.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, kind: 'exchange', connection: 'manual', name: exchange, detail: shortAddress(address), address, asset: 'USDT', balance: 0, networks: ['TRC20', 'Arbitrum', 'ERC20'], verified: true, lastUsed: new Date().toISOString() }); closeFlow() }
  const saveAddress = () => { const address = manualAddress.trim(); if (address.length < 8) { setMessage('Введите корректный адрес.'); return } addSource(activeAccount.id, { id: `address-${address.toLowerCase()}`, kind: 'address', connection: 'manual', name: manualName || 'Внешний кошелёк', detail: shortAddress(address), address, asset: 'USDT', balance: 0, networks: [manualNetwork], verified: true, lastUsed: new Date().toISOString(), cooldownUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }); closeFlow() }

  const executeWithdrawal = () => {
    if (!destination) return
    const cooldown = !!destination.cooldownUntil && new Date(destination.cooldownUntil).getTime() > Date.now()
    if (cooldown) { setMessage('Реквизит находится в 24-часовом security cooldown.'); return }
    if (amount <= 0 || amount > available) { setMessage(`Доступно к выводу ${formatCurrency(available)}.`); return }
    if (amount > sourceLimit(destination)) { setMessage(`Суточный лимит реквизита ${formatCurrency(sourceLimit(destination))}.`); return }
    if (code.length !== 6) { setMessage('Введите 6-значный код подтверждения.'); return }
    setStep('processing'); setMessage('')
    window.setTimeout(() => {
      recordWithdrawal(activeAccount.id, { id: `wd-${Date.now()}`, date: new Date().toISOString(), type: 'withdrawal', source: destination.name, asset, network, amount: -amount, status: 'processing', txHash: randomHash() })
      setStep('success')
    }, 1200)
  }

  const renderModal = () => {
    if (!flow) return null
    if (flow.kind === 'connect') return <ModalShell eyebrow="Подключение кошелька" title="Подключить кошелёк" onClose={closeFlow}><div className="space-y-3"><ActionChoice icon={<Wallet size={20} />} tone="indigo" title="MetaMask / Rabby" text="Подписать владение адресом и добавить в whitelist" onClick={connectBrowserWallet} /><ActionChoice icon={<Link2 size={20} />} tone="violet" title="WalletConnect" text="Trust Wallet, Ledger Live и другие приложения" onClick={connectWalletConnect} /><p className="rounded-xl bg-[#f5f5fa] p-3.5 text-xs leading-[1.5] text-[var(--trigonum-muted)]">Подпись подтверждает, что адрес принадлежит вам. Вывод возможен только на адреса из whitelist.</p>{message && <ErrorNote>{message}</ErrorNote>}</div></ModalShell>
    if (flow.kind === 'exchange') return <ModalShell eyebrow="Реквизит биржи" title="Добавить биржевой реквизит" onClose={closeFlow}><div className="space-y-3.5"><div className="grid grid-cols-3 gap-2">{EXCHANGES.map((name) => <button key={name} type="button" onClick={() => setExchange(name)} className={`rounded-xl border p-3 text-sm font-bold ${exchange === name ? 'border-[#e5cdf7] bg-[#f4e9ff] text-[#8321d6]' : 'border-[var(--trigonum-border)] bg-white text-[var(--trigonum-text)]'}`}>{name}</button>)}</div><Field label="Адрес для вывода на бирже"><input value={exchangeAddress} onChange={(e) => setExchangeAddress(e.target.value)} placeholder="Депозитный адрес биржи" className="mt-1.5 w-full rounded-xl border border-[var(--trigonum-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--trigonum-violet)]" /></Field><p className="rounded-xl border border-[#d8ecdf] bg-[#eef7f1] p-3.5 text-xs leading-[1.5] text-[#1f5c36]">Адрес добавляется в whitelist аккаунта. Убедитесь, что сеть совпадает с сетью депозитного адреса биржи.</p>{message && <ErrorNote>{message}</ErrorNote>}<button type="button" onClick={saveExchange} className="w-full rounded-xl bg-[var(--trigonum-ink)] p-3.5 text-sm font-bold text-white">Добавить {exchange} в whitelist</button></div></ModalShell>
    if (flow.kind === 'address') return <ModalShell eyebrow="Новый адрес" title="Добавить адрес" onClose={closeFlow}><div className="space-y-3.5"><Field label="Название"><input value={manualName} onChange={(e) => setManualName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[var(--trigonum-border)] px-3 py-2.5 text-sm outline-none" /></Field><Field label="Адрес"><input value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} placeholder="0x…" className="mt-1.5 w-full rounded-xl border border-[var(--trigonum-border)] px-3 py-2.5 text-sm outline-none" /></Field><SelectField label="Сеть" value={manualNetwork} onChange={setManualNetwork} options={['Arbitrum','Ethereum','Base','TRC20']} /><p className="rounded-xl border border-[#f2e2c2] bg-[#fdf6e8] p-3.5 text-xs leading-[1.5] text-[#8a5f06]">Новый адрес получает 24-часовой security cooldown: первый вывод станет доступен через сутки после добавления.</p>{message && <ErrorNote>{message}</ErrorNote>}<button type="button" onClick={saveAddress} className="w-full rounded-xl bg-[var(--trigonum-ink)] p-3.5 text-sm font-bold text-white">Добавить адрес</button></div></ModalShell>
    if (flow.kind === 'verify') {
      const tx = flow.transaction; const target = tx.status === 'completed' ? 12 : 5; const done = confirmations >= target; const confirmed = tx.status === 'completed' && done; const explorer = EXPLORERS[tx.network] ?? EXPLORERS.Ethereum
      return <ModalShell eyebrow="Проверка перевода в сети" title="Статус транзакции" onClose={closeFlow}><div className="space-y-3.5"><div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-border)]"><Metric label="Сумма" value={formatCurrency(Math.abs(tx.amount))} /><Metric label="Сеть" value={tx.network} /></div><div className="rounded-xl border border-[var(--trigonum-border)] p-3.5"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Хэш транзакции</p><p className="mt-2 break-all text-[13px] text-[var(--trigonum-ink)]">{tx.txHash ?? 'Хэш недоступен'}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => { if (tx.txHash) navigator.clipboard?.writeText(tx.txHash); setCopied(true) }} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--trigonum-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--trigonum-text)]"><Copy size={14} />{copied ? 'Скопировано' : 'Копировать хэш'}</button>{tx.txHash && <a href={`${explorer.base}${tx.txHash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--trigonum-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--trigonum-violet)]"><ExternalLink size={14} />Открыть в {explorer.name}</a>}</div></div><div className={`rounded-xl border p-4 ${confirmed ? 'border-[#d8ecdf] bg-[#eef7f1]' : done ? 'border-[#f2e2c2] bg-[#fdf6e8]' : 'border-[#cdcdf0] bg-[var(--trigonum-violet-soft)]'}`}><div className="flex items-center justify-between gap-3"><p className={`inline-flex items-center gap-2 text-sm font-bold ${confirmed ? 'text-[var(--trigonum-success)]' : done ? 'text-[#e9a21c]' : 'text-[var(--trigonum-violet)]'}`}>{confirmed ? <CheckCircle2 size={17} /> : done ? <Clock3 size={17} /> : <LoaderCircle size={17} className="animate-spin" />}{confirmed ? 'Транзакция подтверждена' : done ? 'Ожидает подтверждений сети' : 'Проверяем в сети'}</p><b className="text-[13px] tabular-nums">{confirmations} / {target}</b></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/70"><div className={`h-full rounded-full transition-[width] duration-500 ${confirmed ? 'bg-[var(--trigonum-success)]' : done ? 'bg-[#e9a21c]' : 'bg-[var(--trigonum-violet)]'}`} style={{ width: `${Math.min(100, confirmations / target * 100)}%` }} /></div><p className="mt-3 text-xs leading-[1.5] text-[var(--trigonum-text)]">{confirmed ? 'Средства получены реквизитом. Данные получены из сети по хэшу транзакции.' : done ? 'Транзакция найдена в сети, ожидает подтверждений. Статус обновится автоматически.' : 'Запрашиваем статус у сети по хэшу транзакции.'}</p></div><button type="button" onClick={() => setConfirmations(0)} className="w-full rounded-xl border border-[var(--trigonum-border)] bg-white p-3 text-sm font-bold text-[var(--trigonum-ink)]">Проверить в сети ещё раз</button></div></ModalShell>
    }
    if (flow.kind === 'withdraw') {
      if (step === 'processing') return <ModalShell eyebrow="Вывод средств" title={`Вывести на ${destination?.name ?? 'реквизит'}`} onClose={closeFlow}><div className="py-6 text-center"><LoaderCircle size={30} className="mx-auto animate-spin text-[var(--trigonum-violet)]" /><p className="mt-4 text-lg font-bold text-[var(--trigonum-ink)]">Заявка на вывод создана</p><div className="mx-auto mt-4 inline-flex flex-col gap-2.5 text-left text-sm"><span className="inline-flex items-center gap-2 text-[var(--trigonum-success)]"><CheckCircle2 size={16} />Код подтверждения принят</span><span className="inline-flex items-center gap-2 text-[var(--trigonum-success)]"><CheckCircle2 size={16} />Реквизит в whitelist</span><span className="inline-flex items-center gap-2 text-[var(--trigonum-violet)]"><Clock3 size={16} />Отправляем транзакцию в сеть</span></div></div></ModalShell>
      if (step === 'success') return <ModalShell eyebrow="Вывод средств" title="Вывод отправлен" onClose={closeFlow}><div className="py-5 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-[#eef7f1] text-[var(--trigonum-success)]"><CheckCircle2 size={30} /></span><p className="mt-4 text-xl font-bold text-[var(--trigonum-ink)]">Вывод отправлен</p><p className="mt-2 text-3xl font-bold tabular-nums text-[var(--trigonum-success)]">{formatCurrency(amount)}</p><p className="mt-2 text-[13px] text-[var(--trigonum-muted)]">{destination?.name} · {asset} · {network}</p><button type="button" onClick={closeFlow} className="mt-5 w-full rounded-xl bg-[var(--trigonum-ink)] p-3.5 text-sm font-bold text-white">Готово</button></div></ModalShell>
      return <ModalShell eyebrow="Вывод средств" title={`Вывести на ${destination?.name ?? 'реквизит'}`} onClose={closeFlow}><div className="space-y-3.5"><SelectField label="Куда вывести" value={destinationId} onChange={(id) => { setDestinationId(id); const next = state.sources.find((source) => source.id === id); if (next) setNetwork(next.networks[0] ?? 'Arbitrum') }} options={state.sources.map((source) => source.id)} labels={Object.fromEntries(state.sources.map((source) => [source.id, `${source.name} · ${source.detail}`]))} /><div className="grid grid-cols-2 gap-3"><SelectField label="Актив" value={asset} onChange={setAsset} options={['USDT','USDC']} /><SelectField label="Сеть" value={network} onChange={setNetwork} options={destination?.networks ?? ['Arbitrum']} /></div><Field label="Сумма" aside={`Доступно ${formatCurrency(available)}`}><span className="mt-1.5 flex items-center rounded-xl border border-[var(--trigonum-border)] px-3"><b className="text-sm text-[var(--trigonum-muted)]">$</b><input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full bg-transparent px-2 py-2.5 text-xl font-bold text-[var(--trigonum-ink)] outline-none" /><button type="button" onClick={() => setAmount(Math.min(available, destination ? sourceLimit(destination) : available))} className="rounded-lg border border-[var(--trigonum-border)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--trigonum-violet)]">MAX</button></span></Field><div className="grid grid-cols-2 gap-3 rounded-xl bg-[#f5f5fa] p-3.5"><Metric label="Комиссия сети" value={`≈ ${formatCurrency(fee)}`} /><Metric label="Будет получено" value={formatCurrency(receive)} green /></div><Field label="Код подтверждения из приложения"><input value={code} onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} placeholder="6 цифр" className="mt-1.5 w-full rounded-xl border border-[var(--trigonum-border)] px-3 py-2.5 text-lg tracking-[.2em] outline-none" /></Field>{destination?.cooldownUntil && new Date(destination.cooldownUntil).getTime() > Date.now() && <p className="rounded-xl border border-[#f2e2c2] bg-[#fdf6e8] p-3.5 text-xs leading-[1.5] text-[#8a5f06]">Реквизит добавлен недавно: вывод станет доступен {dateHuman(destination.cooldownUntil.slice(0, 10))}.</p>}{message && <ErrorNote>{message}</ErrorNote>}<button type="button" onClick={executeWithdrawal} className="w-full rounded-xl bg-[var(--trigonum-violet)] p-3.5 text-sm font-bold text-white">Вывести {formatCurrency(amount)}</button></div></ModalShell>
    }
    return null
  }

  return <div className="pb-10"><Hero name={activeAccount.name} accountNumber={activeAccount.accountNumber} onWithdraw={() => openWithdraw()} /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard label="Доход Earn с начала года" value={formatCurrency(5_120)} hint="8 начислений подряд" color="var(--trigonum-success)" /><StatCard label="Выведено за месяц" value={formatCurrency(20_000)} hint="3 операции · лимитов не достигнуто" /><StatCard label="Реквизитов в whitelist" value={`${state.sources.length}`} hint="Кошельки, биржи и адреса" /><StatCard label="Залочено" value={formatCurrency(state.lockedEvents + lockedContracts)} hint="Тела договоров и активные Events" color="var(--trigonum-muted)" /></div><CapitalOverview available={available} freeBalance={freeBalance} payouts={payouts} lockedEvents={state.lockedEvents} /><PayoutCalendar lockedEvents={state.lockedEvents} onWithdrawPayout={(value) => openWithdraw(undefined, value)} /><section className="mt-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-[19px] font-bold text-[var(--trigonum-ink)]">Куда выводить</h2><p className="mt-1 text-sm text-[var(--trigonum-muted)]">Вывод возможен только на подтверждённые реквизиты этого аккаунта</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setMessage(''); setFlow({ kind: 'connect' }) }} className="inline-flex items-center gap-2 rounded-xl bg-[var(--trigonum-ink)] px-3.5 py-2.5 text-sm font-semibold text-white"><Plus size={16} />Кошелёк</button><button type="button" onClick={() => { setMessage(''); setFlow({ kind: 'exchange' }) }} className="inline-flex items-center gap-2 rounded-xl border border-[var(--trigonum-border)] bg-white px-3.5 py-2.5 text-sm font-semibold text-[var(--trigonum-text)]"><KeyRound size={16} />Биржа API</button><button type="button" onClick={() => { setMessage(''); setFlow({ kind: 'address' }) }} className="inline-flex items-center gap-2 rounded-xl border border-[var(--trigonum-border)] bg-white px-3.5 py-2.5 text-sm font-semibold text-[var(--trigonum-text)]"><Link2 size={16} />Адрес</button></div></div><div className="mt-4 grid gap-4 xl:grid-cols-2">{state.sources.map((source) => <DestinationCard key={source.id} source={source} onWithdraw={() => openWithdraw(source.id)} onRemove={() => removeSource(activeAccount.id, source.id)} />)}{state.sources.length === 0 && <button type="button" onClick={() => setFlow({ kind: 'connect' })} className="flex min-h-[180px] flex-col items-center justify-center rounded-[18px] border border-dashed border-[#d3d3e6] bg-white"><Plus size={26} className="text-[var(--trigonum-violet)]" /><p className="mt-2.5 text-[15px] font-bold text-[var(--trigonum-ink)]">Добавить реквизит</p><p className="mt-1 text-xs text-[var(--trigonum-muted)]">Кошелёк, биржа или внешний адрес</p></button>}</div></section>{withdrawals.length > 0 && <section className="mt-6 rounded-[18px] border border-[var(--trigonum-border)] bg-white px-6 py-5 shadow-[0_8px_30px_rgb(8_27_58/8%)]"><h2 className="mb-3.5 text-[15px] font-semibold text-[var(--trigonum-ink)]">История выводов</h2><div className="overflow-x-auto"><table className="w-full min-w-[720px] table-fixed border-collapse"><thead><tr className="text-left text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]"><th className="w-[21%] border-b border-[var(--trigonum-border)] pb-2">Дата</th><th className="w-[30%] border-b border-[var(--trigonum-border)] pb-2">Реквизит и сеть</th><th className="w-[14%] border-b border-[var(--trigonum-border)] pb-2">Сумма</th><th className="w-[14%] border-b border-[var(--trigonum-border)] pb-2">Статус</th><th className="w-[21%] border-b border-[var(--trigonum-border)] pb-2 text-right">Проверка</th></tr></thead><tbody>{withdrawals.map((tx) => <tr key={tx.id} className="text-[13px]"><td className="border-b border-[var(--trigonum-border)] py-3 pr-2 whitespace-nowrap text-[var(--trigonum-text)]">{formatDateTime(tx.date)}</td><td className="border-b border-[var(--trigonum-border)] py-3 pr-2"><span className="block text-[var(--trigonum-ink)]">{tx.source}</span><span className="mt-0.5 block text-[11px] text-[var(--trigonum-muted)]">{tx.asset} · {tx.network}</span></td><td className="border-b border-[var(--trigonum-border)] py-3 pr-2 whitespace-nowrap font-bold tabular-nums text-[var(--trigonum-ink)]">{formatCurrency(Math.abs(tx.amount))}</td><td className={`border-b border-[var(--trigonum-border)] py-3 pr-2 whitespace-nowrap font-semibold ${tx.status === 'completed' ? 'text-[var(--trigonum-success)]' : 'text-[#e9a21c]'}`}>{tx.status === 'completed' ? 'Выполнено' : 'В обработке'}</td><td className="border-b border-[var(--trigonum-border)] py-3 text-right"><button type="button" onClick={() => { setCopied(false); setFlow({ kind: 'verify', transaction: tx }) }} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--trigonum-border)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--trigonum-violet)] transition hover:border-[var(--trigonum-violet)] hover:bg-[var(--trigonum-bg)]"><Search size={14} />Проверить</button></td></tr>)}</tbody></table></div></section>}{renderModal()}</div>
}

function ActionChoice({ icon, tone, title, text, onClick }: { icon: ReactNode; tone: 'indigo' | 'violet'; title: string; text: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--trigonum-border)] bg-white p-4 text-left transition ${tone === 'violet' ? 'hover:border-[#af47ff] hover:bg-[#f9f4ff]' : 'hover:border-[var(--trigonum-violet)] hover:bg-[var(--trigonum-bg)]'}`}><span className="flex items-center gap-3"><span className={`grid size-10 place-items-center rounded-xl ${tone === 'violet' ? 'bg-[#f4e9ff] text-[#8321d6]' : 'bg-[var(--trigonum-violet-soft)] text-[var(--trigonum-violet)]'}`}>{icon}</span><span><b className="block text-sm text-[var(--trigonum-ink)]">{title}</b><span className="mt-0.5 block text-xs text-[var(--trigonum-muted)]">{text}</span></span></span><ChevronRight size={18} className="text-[var(--trigonum-muted)]" /></button>
}
function Field({ label, aside, children }: { label: string; aside?: string; children: ReactNode }) { return <label className="block"><span className="flex items-baseline justify-between gap-3"><span className="text-[11px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{label}</span>{aside && <span className="text-xs text-[var(--trigonum-muted)]">{aside}</span>}</span>{children}</label> }
function SelectField({ label, value, onChange, options, labels }: { label: string; value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string> }) { return <label className="block"><span className="text-[11px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 block w-full rounded-xl border border-[var(--trigonum-border)] bg-white px-3 py-2.5 text-sm text-[var(--trigonum-ink)]">{options.map((option) => <option key={option} value={option}>{labels?.[option] ?? option}</option>)}</select></label> }
function Metric({ label, value, green = false }: { label: string; value: string; green?: boolean }) { return <div className="bg-white p-3.5"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{label}</p><p className={`mt-1.5 text-[15px] font-bold tabular-nums ${green ? 'text-[var(--trigonum-success)]' : 'text-[var(--trigonum-ink)]'}`}>{value}</p></div> }
function ErrorNote({ children }: { children: ReactNode }) { return <p className="rounded-lg bg-[#fdecec] px-3 py-2.5 text-xs text-[var(--trigonum-danger)]">{children}</p> }
