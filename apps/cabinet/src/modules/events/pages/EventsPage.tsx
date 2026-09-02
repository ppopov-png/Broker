import {
  Activity,
  BadgeCheck,
  BarChart3,
  Check,
  Clock3,
  Coins,
  Crown,
  Filter,
  Flame,
  Gauge,
  History,
  Medal,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Ticket,
  Timer,
  Trophy,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatCurrency } from '../../../shared/lib/format'
import { Card } from '../../../shared/ui/Card'
import { ProgressBar } from '../../../shared/ui/ProgressBar'

type MainView = 'events' | 'season' | 'ledger' | 'hall' | 'collection'
type PollConfidence = 'Low' | 'Medium' | 'High'
type Risk = 'Low' | 'Moderate' | 'High'
type SortMode = 'scarcity' | 'time' | 'capacity' | 'return'

interface LiveEvent {
  id: string
  title: string
  subtitle: string
  category: string
  targetLow: number
  targetHigh: number
  horizon: string
  risk: Risk
  minInvestment: number
  maxInvestment: number
  capacity: number
  committed: number
  velocityPerMinute: number
  minutesLeft: number
  participants: number
  returningInvestors: number
  returningCapital: number
  trigonumCapital: number
  creditsRequired: number
  scarcity: number
}

const AVAILABLE_BALANCE = 50_000

const liveEvents: LiveEvent[] = [
  {
    id: 'EV-LQ-052',
    title: 'Liquidity Imbalance',
    subtitle: 'Краткосрочная рыночная неэффективность',
    category: 'Liquidity',
    targetLow: 8,
    targetHigh: 12,
    horizon: '7–14 дней',
    risk: 'Moderate',
    minInvestment: 5_000,
    maxInvestment: 50_000,
    capacity: 1_000_000,
    committed: 912_000,
    velocityPerMinute: 14_200,
    minutesLeft: 21,
    participants: 128,
    returningInvestors: 71,
    returningCapital: 78,
    trigonumCapital: 120_000,
    creditsRequired: 0,
    scarcity: 94,
  },
  {
    id: 'EV-VL-027',
    title: 'Volatility Dislocation',
    subtitle: 'Аномальное расхождение рыночных режимов',
    category: 'Volatility',
    targetLow: 11,
    targetHigh: 17,
    horizon: '3–9 дней',
    risk: 'High',
    minInvestment: 10_000,
    maxInvestment: 35_000,
    capacity: 650_000,
    committed: 571_000,
    velocityPerMinute: 8_600,
    minutesLeft: 8,
    participants: 84,
    returningInvestors: 79,
    returningCapital: 83,
    trigonumCapital: 65_000,
    creditsRequired: 1,
    scarcity: 98,
  },
  {
    id: 'EV-CM-014',
    title: 'Cross-Market Spread',
    subtitle: 'Временная ценовая неэффективность между площадками',
    category: 'Cross-market',
    targetLow: 6,
    targetHigh: 9,
    horizon: '10–21 день',
    risk: 'Low',
    minInvestment: 2_500,
    maxInvestment: 25_000,
    capacity: 1_800_000,
    committed: 936_000,
    velocityPerMinute: 5_200,
    minutesLeft: 94,
    participants: 203,
    returningInvestors: 58,
    returningCapital: 64,
    trigonumCapital: 180_000,
    creditsRequired: 0,
    scarcity: 61,
  },
  {
    id: 'EV-MS-033',
    title: 'Market Structure Anomaly',
    subtitle: 'Редкая структурная неэффективность рынка',
    category: 'Market structure',
    targetLow: 13,
    targetHigh: 19,
    horizon: '14–30 дней',
    risk: 'High',
    minInvestment: 25_000,
    maxInvestment: 75_000,
    capacity: 2_500_000,
    committed: 2_372_000,
    velocityPerMinute: 19_400,
    minutesLeft: 46,
    participants: 176,
    returningInvestors: 82,
    returningCapital: 88,
    trigonumCapital: 300_000,
    creditsRequired: 1,
    scarcity: 97,
  },
  {
    id: 'EV-FD-019',
    title: 'Funding Divergence',
    subtitle: 'Временное отклонение стоимости фондирования',
    category: 'Funding',
    targetLow: 7,
    targetHigh: 11,
    horizon: '5–12 дней',
    risk: 'Moderate',
    minInvestment: 5_000,
    maxInvestment: 40_000,
    capacity: 900_000,
    committed: 498_000,
    velocityPerMinute: 4_700,
    minutesLeft: 132,
    participants: 69,
    returningInvestors: 63,
    returningCapital: 69,
    trigonumCapital: 90_000,
    creditsRequired: 0,
    scarcity: 52,
  },
]

const seasonEvents = [
  { id: '#041', result: 12.4, investors: 83, fill: '27m', profit: 124_000 },
  { id: '#042', result: 7.1, investors: 141, fill: '18m', profit: 81_000 },
  { id: '#043', result: -4.3, investors: 96, fill: '31m', profit: -42_000 },
  { id: '#044', result: 18.2, investors: 117, fill: '08m', profit: 291_000 },
  { id: '#045', result: 6.8, investors: 154, fill: '16m', profit: 104_000 },
  { id: '#046', result: 9.4, investors: 128, fill: '12m', profit: 166_000 },
] as const

const ledgerRows = [
  { id: '#037', reference: 10_000, result: 12.0 },
  { id: '#038', reference: 10_000, result: -6.0 },
  { id: '#039', reference: 25_000, result: 8.0 },
  { id: '#040', reference: 15_000, result: 4.5 },
] as const

const hallRows = [
  { label: 'Крупнейшая индивидуальная прибыль', value: '+$84,210', meta: 'Participant #7F2A · Season III', icon: Trophy },
  { label: 'Максимальная прибыль одного Event', value: '+$481,200', meta: 'Event #034 · 219 investors', icon: BarChart3 },
  { label: 'Самое быстрое заполнение', value: '03m 41s', meta: 'Event #028 · $1.5M capacity', icon: Timer },
  { label: 'Максимальный Re-entry', value: '84%', meta: 'Event #039 · returning capital', icon: RefreshCcw },
] as const

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-[var(--trigonum-border)] bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">{label}</p>
      <p className="mt-1 text-lg font-bold text-[var(--trigonum-ink)]">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--trigonum-muted)]">{hint}</p>}
    </div>
  )
}

function ViewButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-[var(--trigonum-ink)] text-white shadow-sm'
          : 'border border-[var(--trigonum-border)] bg-white text-[var(--trigonum-text)] hover:border-[var(--trigonum-blue)]'
      }`}
    >
      {children}
    </button>
  )
}

function urgencyLabel(event: LiveEvent) {
  const remaining = event.capacity - event.committed
  const remainingShare = remaining / event.capacity
  if (event.minutesLeft <= 10 || remainingShare <= 0.06) return { label: 'Critical', tone: 'bg-rose-100 text-rose-700', border: 'border-rose-300' }
  if (event.minutesLeft <= 30 || remainingShare <= 0.15) return { label: 'Closing fast', tone: 'bg-amber-100 text-amber-700', border: 'border-amber-300' }
  return { label: 'Open', tone: 'bg-emerald-50 text-emerald-700', border: 'border-[var(--trigonum-border)]' }
}

function EventCard({ event, onOpen }: { event: LiveEvent; onOpen: () => void }) {
  const remaining = event.capacity - event.committed
  const filled = (event.committed / event.capacity) * 100
  const urgency = urgencyLabel(event)
  const affordable = event.minInvestment <= AVAILABLE_BALANCE
  const paceMinutes = remaining / event.velocityPerMinute

  return (
    <button type="button" onClick={onOpen} className={`group w-full rounded-2xl border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${urgency.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">{event.category}</span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${urgency.tone}`}>{urgency.label}</span>
            {event.creditsRequired > 0 && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">◆{event.creditsRequired} access</span>}
          </div>
          <h3 className="mt-3 text-xl font-bold text-[var(--trigonum-ink)]">{event.title}</h3>
          <p className="mt-1 text-sm text-[var(--trigonum-muted)]">{event.subtitle}</p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--trigonum-muted)]">{event.id}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-[var(--trigonum-muted)]">Target</p>
          <p className="text-2xl font-bold text-[var(--trigonum-ink)]">{event.targetLow}–{event.targetHigh}%</p>
          <p className="text-xs text-[var(--trigonum-muted)]">{event.horizon}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--trigonum-muted)]">Available allocation</p>
            <p className={`text-lg font-bold ${remaining / event.capacity <= 0.12 ? 'text-rose-700' : 'text-[var(--trigonum-ink)]'}`}>{formatCurrency(remaining)}</p>
          </div>
          <p className="text-xs font-semibold text-[var(--trigonum-muted)]">{filled.toFixed(1)}% filled</p>
        </div>
        <ProgressBar value={filled} tone="green" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={`rounded-xl p-3 ${event.minutesLeft <= 15 ? 'bg-rose-50' : 'bg-[var(--trigonum-bg)]'}`}>
          <p className="text-[11px] text-[var(--trigonum-muted)]">Time left</p>
          <p className={`mt-1 font-bold ${event.minutesLeft <= 15 ? 'text-rose-700' : ''}`}>{event.minutesLeft} мин</p>
        </div>
        <div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-[11px] text-[var(--trigonum-muted)]">Scarcity</p><p className="mt-1 font-bold">{event.scarcity}/100</p></div>
        <div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-[11px] text-[var(--trigonum-muted)]">Minimum</p><p className="mt-1 font-bold">{formatCurrency(event.minInvestment)}</p></div>
        <div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-[11px] text-[var(--trigonum-muted)]">Risk</p><p className="mt-1 font-bold">{event.risk}</p></div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--trigonum-border)] pt-4">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--trigonum-muted)]">
          <span>{event.participants} investors</span>
          <span>{event.returningCapital}% returning capital</span>
          <span>~{Math.max(1, Math.round(paceMinutes))} min at current pace</span>
        </div>
        <span className={`rounded-lg px-3 py-1.5 text-xs font-bold ${affordable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{affordable ? 'Доступен по балансу' : 'Недостаточно средств'}</span>
      </div>
    </button>
  )
}

function LiveEventsGallery({ onSelect }: { onSelect: (event: LiveEvent) => void }) {
  const [sort, setSort] = useState<SortMode>('scarcity')
  const [risk, setRisk] = useState<'All' | Risk>('All')
  const [affordableOnly, setAffordableOnly] = useState(false)
  const [urgentOnly, setUrgentOnly] = useState(false)

  const events = useMemo(() => {
    const filtered = liveEvents.filter((event) => {
      if (risk !== 'All' && event.risk !== risk) return false
      if (affordableOnly && event.minInvestment > AVAILABLE_BALANCE) return false
      if (urgentOnly && event.minutesLeft > 30 && (event.capacity - event.committed) / event.capacity > 0.15) return false
      return true
    })
    return [...filtered].sort((a, b) => {
      if (sort === 'time') return a.minutesLeft - b.minutesLeft
      if (sort === 'capacity') return (a.capacity - a.committed) - (b.capacity - b.committed)
      if (sort === 'return') return b.targetHigh - a.targetHigh
      return b.scarcity - a.scarcity
    })
  }, [sort, risk, affordableOnly, urgentOnly])

  const criticalCount = liveEvents.filter((e) => urgencyLabel(e).label === 'Critical').length
  const totalRemaining = liveEvents.reduce((sum, e) => sum + (e.capacity - e.committed), 0)

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Live TAIS Events" value={`${liveEvents.length}`} hint={`${criticalCount} требуют быстрого решения`} />
        <Metric label="Available across Events" value={formatCurrency(totalRemaining)} hint="Свободный capacity сейчас" />
        <Metric label="Your available capital" value={formatCurrency(AVAILABLE_BALANCE)} hint="Используется фильтром доступности" />
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2"><Filter size={17} /><span className="text-sm font-bold">Filters</span></div>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="rounded-xl border border-[var(--trigonum-border)] bg-white px-3 py-2 text-sm">
            <option value="scarcity">Сначала самые редкие</option>
            <option value="time">Меньше всего времени</option>
            <option value="capacity">Меньше всего капитала осталось</option>
            <option value="return">Выше target</option>
          </select>
          <select value={risk} onChange={(e) => setRisk(e.target.value as 'All' | Risk)} className="rounded-xl border border-[var(--trigonum-border)] bg-white px-3 py-2 text-sm">
            <option value="All">Любой риск</option><option value="Low">Low</option><option value="Moderate">Moderate</option><option value="High">High</option>
          </select>
          <button type="button" onClick={() => setAffordableOnly((v) => !v)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${affordableOnly ? 'bg-emerald-100 text-emerald-800' : 'border border-[var(--trigonum-border)] bg-white'}`}>По моему балансу</button>
          <button type="button" onClick={() => setUrgentOnly((v) => !v)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${urgentOnly ? 'bg-rose-100 text-rose-800' : 'border border-[var(--trigonum-border)] bg-white'}`}>Только срочные</button>
        </div>
      </Card>

      {criticalCount > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          <Flame size={20} className="shrink-0" />
          <div><p className="text-sm font-bold">{criticalCount} Event сейчас на критической стадии</p><p className="text-xs text-rose-700">Осталось мало времени или свободного allocation. Такие Events подсвечиваются автоматически.</p></div>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {events.map((event) => <EventCard key={event.id} event={event} onOpen={() => onSelect(event)} />)}
      </div>
    </div>
  )
}

function EventDetail({ event, onBack }: { event: LiveEvent; onBack: () => void }) {
  const [credits, setCredits] = useState(3)
  const [desiredAmount, setDesiredAmount] = useState(Math.max(event.minInvestment, Math.min(25_000, event.maxInvestment)))
  const [investedAmount, setInvestedAmount] = useState(0)
  const [releasedAmount, setReleasedAmount] = useState(0)
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const [pollPrediction, setPollPrediction] = useState((event.targetLow + event.targetHigh) / 2)
  const [pollConfidence, setPollConfidence] = useState<PollConfidence>('High')
  const [pollLocked, setPollLocked] = useState(false)
  const [watching, setWatching] = useState(false)
  const [accessUnlocked, setAccessUnlocked] = useState(event.creditsRequired === 0)

  const committed = event.committed + investedAmount - releasedAmount
  const remaining = Math.max(0, event.capacity - committed)
  const fillPct = Math.min(100, (committed / event.capacity) * 100)
  const minutesToFull = remaining / event.velocityPerMinute
  const fullDesiredWindow = Math.max(0, (remaining - desiredAmount) / event.velocityPerMinute)
  const reentryScore = Math.round((event.returningInvestors + event.returningCapital) / 2)
  const trigonumShare = (event.trigonumCapital / event.capacity) * 100
  const canInvest = accessUnlocked && remaining >= desiredAmount && desiredAmount >= event.minInvestment && desiredAmount <= event.maxInvestment && desiredAmount <= AVAILABLE_BALANCE

  return (
    <div className="space-y-5">
      <button type="button" onClick={onBack} className="text-sm font-semibold text-[var(--trigonum-blue)]">← Все активные Events</button>

      <Card className="overflow-hidden !p-0">
        <div className="bg-[linear-gradient(135deg,#071a2d_0%,#0b3350_46%,#0d6a67_100%)] p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">{event.category} · {event.id}</p><h2 className="mt-2 text-3xl font-bold">{event.title}</h2><p className="mt-2 text-sm text-slate-200">{event.subtitle}. Стратегия и торговая логика остаются закрытыми.</p></div>
            <div className="text-right"><p className="text-xs text-slate-300">Target</p><p className="text-3xl font-bold">{event.targetLow}–{event.targetHigh}%</p><p className="text-xs text-slate-300">{event.horizon}</p></div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-2xl border border-[var(--trigonum-border)] p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">Event capacity</p><p className="mt-1 text-xl font-bold">{formatCurrency(committed)} / {formatCurrency(event.capacity)}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{fillPct.toFixed(1)}% filled</span></div><div className="mt-3"><ProgressBar value={fillPct} tone="green" /></div><div className="mt-3 flex justify-between text-xs text-[var(--trigonum-muted)]"><span>Осталось <b>{formatCurrency(remaining)}</b></span><span>{event.participants} investors</span></div></div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex items-center gap-2 text-amber-800"><Gauge size={17} /><p className="text-xs font-bold uppercase tracking-wide">Price of Waiting</p></div><p className="mt-3 text-2xl font-bold text-amber-950">{formatCurrency(event.velocityPerMinute)} / мин</p><p className="mt-1 text-sm text-amber-900">При текущем темпе Event может заполниться примерно через <b>{Math.max(1, Math.floor(minutesToFull - 2))}–{Math.ceil(minutesToFull + 3)} мин</b>.</p><p className="mt-3 rounded-xl bg-white/80 p-3 text-xs text-amber-950">Полный allocation {formatCurrency(desiredAmount)} может стать недоступен через <b>{Math.max(1, Math.floor(fullDesiredWindow))}–{Math.max(2, Math.ceil(fullDesiredWindow + 4))} мин</b>.</p></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Scarcity" value={`${event.scarcity}/100`} /><Metric label="Re-entry Confidence" value={`${reentryScore}/100`} hint={`${event.returningCapital}% returning capital`} /><Metric label="Trigonum co-investment" value={`${trigonumShare.toFixed(0)}%`} hint={formatCurrency(event.trigonumCapital)} /><Metric label="Time left" value={`${event.minutesLeft} мин`} /></div>
        </div>
      </Card>

      {event.creditsRequired > 0 && !accessUnlocked && (
        <Card><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2"><Coins size={18} className="text-violet-600" /><h3 className="font-bold">Access Credit</h3></div><p className="mt-1 text-sm text-[var(--trigonum-muted)]">Для этого Event требуется ◆{event.creditsRequired}. Credits нельзя купить за деньги.</p></div><button type="button" disabled={credits < event.creditsRequired} onClick={() => { setCredits((v) => v - event.creditsRequired); setAccessUnlocked(true) }} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white">Использовать ◆{event.creditsRequired}</button></div></Card>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <Card>
          <div className="flex items-center gap-2"><Wallet size={18} className="text-[var(--trigonum-green)]" /><h3 className="font-bold">Your allocation</h3></div>
          {investedAmount === 0 ? <><div className="mt-4"><input type="range" min={event.minInvestment} max={Math.min(event.maxInvestment, AVAILABLE_BALANCE)} step={2_500} value={desiredAmount} onChange={(e) => setDesiredAmount(Number(e.target.value))} className="w-full" /><div className="mt-2 flex justify-between text-xs text-[var(--trigonum-muted)]"><span>{formatCurrency(event.minInvestment)}</span><b className="text-lg text-[var(--trigonum-ink)]">{formatCurrency(desiredAmount)}</b><span>{formatCurrency(Math.min(event.maxInvestment, AVAILABLE_BALANCE))}</span></div></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Event share" value={`${((desiredAmount / event.capacity) * 100).toFixed(2)}%`} /><Metric label={`Target +${event.targetLow}%`} value={`+${formatCurrency(desiredAmount * event.targetLow / 100)}`} /><Metric label={`Target +${event.targetHigh}%`} value={`+${formatCurrency(desiredAmount * event.targetHigh / 100)}`} /><Metric label="Available balance" value={formatCurrency(AVAILABLE_BALANCE)} /></div><button type="button" disabled={!canInvest} onClick={() => setInvestedAmount(desiredAmount)} className="mt-4 w-full rounded-xl bg-[var(--trigonum-green)] px-5 py-3 text-sm font-bold text-white disabled:opacity-40">{!accessUnlocked ? 'Требуется Event Credit' : `Закрепить ${formatCurrency(desiredAmount)}`}</button></> : <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="flex items-center gap-2 text-sm font-bold text-emerald-800"><BadgeCheck size={18} /> Allocation secured</p><p className="mt-2 text-3xl font-bold text-emerald-950">{formatCurrency(investedAmount - releasedAmount)}</p><p className="mt-1 text-xs text-emerald-800">Participant #081 · {event.id}</p><button type="button" onClick={() => { if (investedAmount - releasedAmount >= 5_000) setReleasedAmount((v) => v + 5_000) }} className="mt-4 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-bold text-emerald-800">Release $5K</button>{releasedAmount > 0 && <p className="mt-3 text-xs text-emerald-900">{formatCurrency(releasedAmount)} передано в Allocation Queue.</p>}</div>}
        </Card>

        <Card><div className="flex items-center gap-2"><Users size={18} className="text-[var(--trigonum-blue)]" /><h3 className="font-bold">Allocation Queue</h3></div><p className="mt-2 text-sm text-[var(--trigonum-muted)]">Если Event заполнится до входа, можно занять позицию на освобождающийся allocation.</p>{queuePosition === null ? <button type="button" onClick={() => setQueuePosition(8)} className="mt-4 w-full rounded-xl bg-[var(--trigonum-ink)] px-4 py-2.5 text-sm font-bold text-white">Встать в резервную очередь</button> : <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-blue-700">Your position</p><p className="mt-1 text-4xl font-bold text-blue-950">#{queuePosition}</p><p className="mt-2 text-sm text-blue-900">Перед вами 7 инвесторов · $94K запросов.</p><div className="mt-3 flex gap-2"><button type="button" onClick={() => setQueuePosition((v) => v ? Math.max(1, v - 2) : v)} className="flex-1 rounded-xl bg-white px-3 py-2 text-xs font-bold text-blue-800">Симулировать release</button><button type="button" onClick={() => setQueuePosition(null)} className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-blue-700"><X size={15} /></button></div></div>}</Card>
      </div>

      <Card><div className="flex items-center gap-2"><Activity size={18} className="text-violet-600" /><h3 className="font-bold">Investor Poll · TAIS vs Crowd</h3></div>{!pollLocked ? <div className="mt-4"><p className="text-sm text-[var(--trigonum-text)]">Сначала фиксируется твой прогноз; Crowd скрыт до голосования.</p><div className="mt-4 rounded-2xl border border-[var(--trigonum-border)] p-4"><div className="flex items-center justify-between"><span className="text-xs text-[var(--trigonum-muted)]">Твой прогноз</span><b className="text-2xl">{pollPrediction.toFixed(1)}%</b></div><input type="range" min={-10} max={25} step={0.5} value={pollPrediction} onChange={(e) => setPollPrediction(Number(e.target.value))} className="mt-4 w-full" /><div className="mt-4 flex flex-wrap items-center gap-2">{(['Low','Medium','High'] as PollConfidence[]).map((item) => <button key={item} type="button" onClick={() => setPollConfidence(item)} className={`rounded-lg px-3 py-2 text-xs font-bold ${pollConfidence === item ? 'bg-violet-600 text-white' : 'border border-[var(--trigonum-border)]'}`}>{item}</button>)}<button type="button" onClick={() => setPollLocked(true)} className="ml-auto rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white">Lock prediction</button></div></div></div> : <div className="mt-4 grid gap-3 sm:grid-cols-3"><Metric label="Your view" value={`${pollPrediction.toFixed(1)}%`} hint={`${pollConfidence} confidence`} /><Metric label="TAIS" value={`${event.targetLow}–${event.targetHigh}%`} hint="published range" /><Metric label="Crowd" value="9.4%" hint="median · 1,241 predictions" /></div>}</Card>

      <Card><div className="flex items-center gap-2"><History size={18} /><h3 className="font-bold">Watch without investing</h3></div><p className="mt-2 text-sm text-[var(--trigonum-muted)]">Добавить Event в Missed Opportunity Ledger и после settlement увидеть результат reference amount $10K.</p><button type="button" onClick={() => setWatching((v) => !v)} className={`mt-4 rounded-xl px-4 py-2.5 text-sm font-bold ${watching ? 'bg-emerald-50 text-emerald-700' : 'border border-[var(--trigonum-border)] bg-white'}`}>{watching ? '✓ Event отслеживается' : 'Watch Event'}</button></Card>
    </div>
  )
}

function SeasonTab() {
  const totalProfit = seasonEvents.reduce((sum, item) => sum + item.profit, 0)
  const positive = seasonEvents.filter((item) => item.result > 0).length
  return <div className="space-y-5"><Card className="overflow-hidden !p-0"><div className="bg-[linear-gradient(120deg,#18122b,#3b1f6a,#15435c)] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">TAIS Events · Season IV</p><h2 className="mt-2 text-3xl font-bold">Season IV · Q3 2026</h2><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Settled" value={`${seasonEvents.length}`} /><Metric label="Positive" value={`${positive}/${seasonEvents.length}`} /><Metric label="Investor P&L" value={`+${formatCurrency(totalProfit)}`} /><Metric label="TAIS vs Crowd" value="6–2" /></div></div></Card><div className="grid gap-4 lg:grid-cols-2"><Card title="Season timeline"><div className="space-y-3">{seasonEvents.map((event) => <div key={event.id} className="flex items-center gap-3 rounded-xl border border-[var(--trigonum-border)] p-3"><span className={`grid size-9 place-items-center rounded-full text-xs font-bold ${event.result >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{event.id.slice(1)}</span><div className="flex-1"><p className="text-sm font-bold">Event {event.id}</p><p className="text-xs text-[var(--trigonum-muted)]">{event.investors} investors · fill {event.fill}</p></div><b className={event.result >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{event.result > 0 ? '+' : ''}{event.result}%</b></div>)}</div></Card><div className="space-y-4"><Card title="TAIS vs Crowd · Season IV"><div className="grid grid-cols-2 gap-3"><Metric label="TAIS MAE" value="2.1pp" hint="wins 6" /><Metric label="Crowd MAE" value="3.4pp" hint="wins 2" /></div></Card><Card title="Your Season"><div className="grid grid-cols-2 gap-3"><Metric label="Participated" value="4 Events" /><Metric label="Realized P&L" value="+$7,420" /><Metric label="Prediction rank" value="Top 18%" /><Metric label="Credits" value="◆◆" /></div></Card></div></div></div>
}

function LedgerTab() {
  const missedUpside = ledgerRows.filter((r) => r.result > 0).reduce((sum, r) => sum + r.reference * (r.result / 100), 0)
  const avoidedLoss = Math.abs(ledgerRows.filter((r) => r.result < 0).reduce((sum, r) => sum + r.reference * (r.result / 100), 0))
  const opportunityCost = missedUpside - avoidedLoss
  return <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]"><Card title="Missed Opportunity Ledger"><div className="space-y-2">{ledgerRows.map((row) => { const hypothetical = row.reference * (row.result / 100); return <div key={row.id} className="grid grid-cols-[70px_1fr_90px_100px] items-center gap-2 rounded-xl border border-[var(--trigonum-border)] p-3 text-sm"><b>{row.id}</b><span className="text-[var(--trigonum-muted)]">Reference {formatCurrency(row.reference)}</span><b className={row.result >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{row.result > 0 ? '+' : ''}{row.result}%</b><b className={hypothetical >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{hypothetical > 0 ? '+' : ''}{formatCurrency(hypothetical)}</b></div> })}</div></Card><div className="space-y-4"><Card><p className="text-xs font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Missed upside</p><p className="mt-2 text-3xl font-bold text-amber-700">+{formatCurrency(missedUpside)}</p></Card><Card><p className="text-xs font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Avoided losses</p><p className="mt-2 text-3xl font-bold text-emerald-700">+{formatCurrency(avoidedLoss)}</p></Card><Card><p className="text-xs font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Net opportunity cost</p><p className={`mt-2 text-3xl font-bold ${opportunityCost > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{opportunityCost > 0 ? '-' : '+'}{formatCurrency(Math.abs(opportunityCost))}</p></Card></div></div>
}

function HallTab() {
  return <div className="space-y-5"><Card className="overflow-hidden !p-0"><div className="bg-[linear-gradient(120deg,#201706,#503707,#8b6815)] p-6 text-white"><div className="flex items-center gap-3"><Crown size={26} className="text-amber-300" /><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">Anonymous Hall of Outcomes</p><h2 className="mt-1 text-3xl font-bold">Рекорды экосистемы Events</h2></div></div></div></Card><div className="grid gap-4 sm:grid-cols-2">{hallRows.map((row) => { const Icon = row.icon; return <Card key={row.label}><Icon size={22} className="text-amber-600" /><p className="mt-4 text-xs font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">{row.label}</p><p className="mt-2 text-3xl font-bold">{row.value}</p><p className="mt-2 text-sm text-[var(--trigonum-muted)]">{row.meta}</p></Card> })}</div></div>
}

function CollectionTab() {
  const proofs = [
    { id: '#031', season: 'Season II', result: '+17.8%', badge: 'First 10%', window: 'Priority Access' },
    { id: '#038', season: 'Season III', result: '+8.6%', badge: 'Waitlist Entry', window: 'Queue Allocation' },
    { id: '#041', season: 'Season IV', result: '+12.4%', badge: 'TAIS Beat', window: 'Standard Access' },
    { id: '#044', season: 'Season IV', result: '+18.2%', badge: 'Full Capacity', window: 'Priority Access' },
  ]
  return <div className="space-y-5"><Card><div className="flex items-center gap-2"><Ticket size={20} className="text-[var(--trigonum-blue)]" /><h2 className="text-xl font-bold">Proof of Participation</h2></div><p className="mt-2 text-sm text-[var(--trigonum-muted)]">Коллекционный proof завершённого Event без раскрытия суммы капитала.</p></Card><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{proofs.map((proof, index) => <div key={proof.id} className="rounded-2xl border border-[var(--trigonum-border)] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><Medal size={24} className="text-[var(--trigonum-blue)]" /><span className="text-xs font-bold text-[var(--trigonum-muted)]">#{String(index + 81).padStart(3, '0')}</span></div><p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[var(--trigonum-muted)]">TAIS EVENT</p><h3 className="mt-1 text-2xl font-bold">{proof.id}</h3><p className="mt-1 text-sm text-[var(--trigonum-muted)]">{proof.season}</p><div className="my-5 h-px bg-[var(--trigonum-border)]" /><p className="text-xs text-[var(--trigonum-muted)]">Settled result</p><p className="mt-1 text-3xl font-bold text-emerald-700">{proof.result}</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">{proof.window}</span><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">{proof.badge}</span></div></div>)}</div></div>
}

export function EventsPage() {
  const [view, setView] = useState<MainView>('events')
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null)

  const views = useMemo(() => [
    { id: 'events' as const, label: 'Live Events', icon: Zap },
    { id: 'season' as const, label: 'Season IV', icon: Trophy },
    { id: 'ledger' as const, label: 'Missed Ledger', icon: History },
    { id: 'hall' as const, label: 'Hall of Outcomes', icon: Crown },
    { id: 'collection' as const, label: 'My Proofs', icon: Ticket },
  ], [])

  return (
    <div className="pb-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--trigonum-blue)]">TAIS Event Economy</p>
        <h1 className="mt-1 text-3xl font-bold text-[var(--trigonum-ink)]">Events</h1>
        <p className="mt-1 max-w-3xl text-sm text-[var(--trigonum-muted)]">Активные инвестиционные возможности TAIS с ограниченным временем и capacity. Стратегия события остаётся закрытой.</p>
      </header>

      <nav className="mb-5 flex flex-wrap gap-2">{views.map((item) => { const Icon = item.icon; return <ViewButton key={item.id} active={view === item.id} onClick={() => { setView(item.id); setSelectedEvent(null) }}><span className="flex items-center gap-2"><Icon size={15} />{item.label}</span></ViewButton> })}</nav>

      {view === 'events' && (selectedEvent ? <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} /> : <LiveEventsGallery onSelect={setSelectedEvent} />)}
      {view === 'season' && <SeasonTab />}
      {view === 'ledger' && <LedgerTab />}
      {view === 'hall' && <HallTab />}
      {view === 'collection' && <CollectionTab />}
    </div>
  )
}
