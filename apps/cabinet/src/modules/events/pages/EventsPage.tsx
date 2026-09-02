import {
  Activity,
  BadgeCheck,
  BarChart3,
  Crown,
  Filter,
  Flame,
  Gauge,
  History,
  Info,
  Medal,
  RefreshCcw,
  Ticket,
  Timer,
  Trophy,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { formatCurrency } from '../../../shared/lib/format'
import { Card } from '../../../shared/ui/Card'
import { ProgressBar } from '../../../shared/ui/ProgressBar'

type MainView = 'events' | 'season' | 'ledger' | 'hall' | 'collection'
type PollConfidence = 'Низкая' | 'Средняя' | 'Высокая'
type Risk = 'Низкий' | 'Умеренный' | 'Высокий'
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
  secondsLeft: number
  participants: number
  returningInvestors: number
  returningCapital: number
  trigonumCapital: number
  scarcity: number
  liveCapital: boolean
  flowMultiplier: number
}

const AVAILABLE_BALANCE = 50_000

const initialLiveEvents: LiveEvent[] = [
  {
    id: 'EV-LQ-052',
    title: 'Дисбаланс ликвидности',
    subtitle: 'Краткосрочная рыночная неэффективность',
    category: 'Ликвидность',
    targetLow: 8,
    targetHigh: 12,
    horizon: '7–14 дней',
    risk: 'Умеренный',
    minInvestment: 5_000,
    maxInvestment: 50_000,
    capacity: 1_000_000,
    committed: 912_000,
    velocityPerMinute: 14_200,
    secondsLeft: 21 * 60 + 37,
    participants: 128,
    returningInvestors: 71,
    returningCapital: 78,
    trigonumCapital: 120_000,
    scarcity: 94,
    liveCapital: true,
    flowMultiplier: 1,
  },
  {
    id: 'EV-VL-027',
    title: 'Аномалия волатильности',
    subtitle: 'Аномальное расхождение рыночных режимов',
    category: 'Волатильность',
    targetLow: 11,
    targetHigh: 17,
    horizon: '3–9 дней',
    risk: 'Высокий',
    minInvestment: 10_000,
    maxInvestment: 35_000,
    capacity: 650_000,
    committed: 571_000,
    velocityPerMinute: 8_600,
    secondsLeft: 8 * 60 + 16,
    participants: 84,
    returningInvestors: 79,
    returningCapital: 83,
    trigonumCapital: 65_000,
    scarcity: 98,
    liveCapital: true,
    flowMultiplier: 1.35,
  },
  {
    id: 'EV-CM-014',
    title: 'Межрыночный спред',
    subtitle: 'Временная ценовая неэффективность между площадками',
    category: 'Межрыночная',
    targetLow: 6,
    targetHigh: 9,
    horizon: '10–21 день',
    risk: 'Низкий',
    minInvestment: 2_500,
    maxInvestment: 25_000,
    capacity: 1_800_000,
    committed: 936_000,
    velocityPerMinute: 5_200,
    secondsLeft: 94 * 60 + 44,
    participants: 203,
    returningInvestors: 58,
    returningCapital: 64,
    trigonumCapital: 180_000,
    scarcity: 61,
    liveCapital: false,
    flowMultiplier: 0,
  },
  {
    id: 'EV-MS-033',
    title: 'Структурная аномалия',
    subtitle: 'Редкая структурная неэффективность рынка',
    category: 'Структура рынка',
    targetLow: 13,
    targetHigh: 19,
    horizon: '14–30 дней',
    risk: 'Высокий',
    minInvestment: 25_000,
    maxInvestment: 75_000,
    capacity: 2_500_000,
    committed: 2_372_000,
    velocityPerMinute: 19_400,
    secondsLeft: 46 * 60 + 9,
    participants: 176,
    returningInvestors: 82,
    returningCapital: 88,
    trigonumCapital: 300_000,
    scarcity: 97,
    liveCapital: true,
    flowMultiplier: 1.65,
  },
  {
    id: 'EV-FD-019',
    title: 'Расхождение фондирования',
    subtitle: 'Временное отклонение стоимости фондирования',
    category: 'Фандинг',
    targetLow: 7,
    targetHigh: 11,
    horizon: '5–12 дней',
    risk: 'Умеренный',
    minInvestment: 5_000,
    maxInvestment: 40_000,
    capacity: 900_000,
    committed: 498_000,
    velocityPerMinute: 4_700,
    secondsLeft: 132 * 60 + 51,
    participants: 69,
    returningInvestors: 63,
    returningCapital: 69,
    trigonumCapital: 90_000,
    scarcity: 52,
    liveCapital: false,
    flowMultiplier: 0,
  },
]

const seasonEvents = [
  { id: '#041', result: 12.4, investors: 83, fill: '27 мин', profit: 124_000 },
  { id: '#042', result: 7.1, investors: 141, fill: '18 мин', profit: 81_000 },
  { id: '#043', result: -4.3, investors: 96, fill: '31 мин', profit: -42_000 },
  { id: '#044', result: 18.2, investors: 117, fill: '8 мин', profit: 291_000 },
  { id: '#045', result: 6.8, investors: 154, fill: '16 мин', profit: 104_000 },
  { id: '#046', result: 9.4, investors: 128, fill: '12 мин', profit: 166_000 },
] as const

const ledgerRows = [
  { id: '#037', reference: 10_000, result: 12.0 },
  { id: '#038', reference: 10_000, result: -6.0 },
  { id: '#039', reference: 25_000, result: 8.0 },
  { id: '#040', reference: 15_000, result: 4.5 },
] as const

const hallRows = [
  { label: 'Крупнейшая индивидуальная прибыль', value: '+$84,210', meta: 'Участник #7F2A · Сезон III', icon: Trophy },
  { label: 'Максимальная прибыль одного события', value: '+$481,200', meta: 'Event #034 · 219 инвесторов', icon: BarChart3 },
  { label: 'Самое быстрое заполнение', value: '03:41', meta: 'Event #028 · объём $1.5M', icon: Timer },
  { label: 'Максимальная доля повторного участия', value: '84%', meta: 'Event #039', icon: RefreshCcw },
] as const

function InfoTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex shrink-0" tabIndex={0} aria-label={text}>
      <Info size={13} className="cursor-help text-[var(--trigonum-muted)] transition group-hover:text-[var(--trigonum-blue)] group-focus:text-[var(--trigonum-blue)]" />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-64 -translate-x-1/2 rounded-xl bg-[var(--trigonum-ink)] px-3 py-2 text-left text-xs font-normal leading-5 text-white shadow-lg group-hover:block group-focus:block">
        {text}
      </span>
    </span>
  )
}

function LabelWithInfo({ label, info }: { label: string; info?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{label}</span>
      {info && <InfoTip text={info} />}
    </span>
  )
}

function Metric({ label, value, hint, info }: { label: string; value: string; hint?: string; info?: string }) {
  return (
    <div className="rounded-xl border border-[var(--trigonum-border)] bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]"><LabelWithInfo label={label} info={info} /></p>
      <p className="mt-1 text-lg font-bold text-[var(--trigonum-ink)] tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--trigonum-muted)]">{hint}</p>}
    </div>
  )
}

function ViewButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
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

function formatCountdown(seconds: number) {
  const value = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(value / 3600)
  const minutes = Math.floor((value % 3600) / 60)
  const secs = value % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function urgencyLabel(event: LiveEvent) {
  const remaining = Math.max(0, event.capacity - event.committed)
  const remainingShare = remaining / event.capacity
  if (event.secondsLeft <= 10 * 60 || remainingShare <= 0.06) return { label: 'Почти закрыт', tone: 'bg-rose-100 text-rose-700', border: 'border-rose-300' }
  if (event.secondsLeft <= 30 * 60 || remainingShare <= 0.15) return { label: 'Быстро заполняется', tone: 'bg-amber-100 text-amber-700', border: 'border-amber-300' }
  return { label: 'Открыт', tone: 'bg-emerald-50 text-emerald-700', border: 'border-[var(--trigonum-border)]' }
}

function EventCard({ event, onOpen }: { event: LiveEvent; onOpen: () => void }) {
  const remaining = Math.max(0, event.capacity - event.committed)
  const filled = Math.min(100, (event.committed / event.capacity) * 100)
  const urgency = urgencyLabel(event)
  const affordable = event.minInvestment <= AVAILABLE_BALANCE
  const paceSeconds = event.velocityPerMinute > 0 ? (remaining / event.velocityPerMinute) * 60 : event.secondsLeft

  return (
    <button type="button" onClick={onOpen} className={`group w-full rounded-2xl border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${urgency.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">{event.category}</span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${urgency.tone}`}>{urgency.label}</span>
          </div>
          <h3 className="mt-3 text-xl font-bold text-[var(--trigonum-ink)]">{event.title}</h3>
          <p className="mt-1 text-sm text-[var(--trigonum-muted)]">{event.subtitle}</p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--trigonum-muted)]">{event.id}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-[var(--trigonum-muted)]"><LabelWithInfo label="Целевой результат" info="Ожидаемый диапазон результата события. Это ориентир, а не гарантированная доходность." /></p>
          <p className="text-2xl font-bold text-[var(--trigonum-ink)]">{event.targetLow}–{event.targetHigh}%</p>
          <p className="text-xs text-[var(--trigonum-muted)]">{event.horizon}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-[var(--trigonum-muted)]"><LabelWithInfo label="Доступно" info="Свободный объём события, который ещё не распределён между инвесторами." /></p>
              {event.liveCapital && remaining > 0 && <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700"><span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> сейчас</span>}
            </div>
            <p className={`mt-1 text-lg font-bold tabular-nums transition ${remaining / event.capacity <= 0.12 ? 'text-rose-700' : 'text-[var(--trigonum-ink)]'}`}>{formatCurrency(remaining)}</p>
          </div>
          <p className="text-xs font-semibold text-[var(--trigonum-muted)]">Заполнено {filled.toFixed(1)}%</p>
        </div>
        <ProgressBar value={filled} tone="green" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={`rounded-xl p-3 ${event.secondsLeft <= 15 * 60 ? 'bg-rose-50' : 'bg-[var(--trigonum-bg)]'}`}>
          <p className="text-[11px] text-[var(--trigonum-muted)]"><LabelWithInfo label="Осталось времени" info="Если свободный объём не закончится раньше, возможность входа закроется по этому таймеру." /></p>
          <p className={`mt-1 font-bold tabular-nums ${event.secondsLeft <= 15 * 60 ? 'text-rose-700' : ''}`}>{formatCountdown(event.secondsLeft)}</p>
        </div>
        <div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-[11px] text-[var(--trigonum-muted)]"><LabelWithInfo label="Дефицит" info="Показывает, насколько ограничена возможность входа сейчас. Высокое значение означает, что времени или свободного объёма осталось немного." /></p><p className="mt-1 font-bold">{event.scarcity}/100</p></div>
        <div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-[11px] text-[var(--trigonum-muted)]"><LabelWithInfo label="Минимум" info="Минимальная сумма, с которой можно участвовать в этом событии." /></p><p className="mt-1 font-bold">{formatCurrency(event.minInvestment)}</p></div>
        <div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-[11px] text-[var(--trigonum-muted)]"><LabelWithInfo label="Риск" info="Уровень риска события относительно других Events внутри платформы." /></p><p className="mt-1 font-bold">{event.risk}</p></div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--trigonum-border)] pt-4">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--trigonum-muted)]">
          <span>{event.participants} инвесторов</span>
          <span><LabelWithInfo label={`${event.returningCapital}% повторного капитала`} info="Доля капитала в этом Event от инвесторов, которые уже участвовали в предыдущих завершённых Events." /></span>
          <span><LabelWithInfo label={`≈ ${formatCountdown(Math.min(event.secondsLeft, paceSeconds))}`} info="Оценка того, через сколько свободный объём может закончиться при текущей скорости заполнения." /></span>
        </div>
        <span className={`rounded-lg px-3 py-1.5 text-xs font-bold ${affordable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{affordable ? 'Доступен' : 'Недостаточно средств'}</span>
      </div>
    </button>
  )
}

function LiveEventsGallery({ events, onSelect }: { events: LiveEvent[]; onSelect: (eventId: string) => void }) {
  const [sort, setSort] = useState<SortMode>('scarcity')
  const [risk, setRisk] = useState<'Все' | Risk>('Все')
  const [affordableOnly, setAffordableOnly] = useState(false)
  const [urgentOnly, setUrgentOnly] = useState(false)

  const visibleEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      if (event.secondsLeft <= 0 || event.committed >= event.capacity) return false
      if (risk !== 'Все' && event.risk !== risk) return false
      if (affordableOnly && event.minInvestment > AVAILABLE_BALANCE) return false
      if (urgentOnly && event.secondsLeft > 30 * 60 && (event.capacity - event.committed) / event.capacity > 0.15) return false
      return true
    })
    return [...filtered].sort((a, b) => {
      if (sort === 'time') return a.secondsLeft - b.secondsLeft
      if (sort === 'capacity') return (a.capacity - a.committed) - (b.capacity - b.committed)
      if (sort === 'return') return b.targetHigh - a.targetHigh
      return b.scarcity - a.scarcity
    })
  }, [events, sort, risk, affordableOnly, urgentOnly])

  const criticalCount = events.filter((event) => event.secondsLeft > 0 && event.committed < event.capacity && urgencyLabel(event).label === 'Почти закрыт').length
  const totalRemaining = events.reduce((sum, event) => sum + Math.max(0, event.capacity - event.committed), 0)

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Активные Events" value={`${events.filter((event) => event.secondsLeft > 0 && event.committed < event.capacity).length}`} info="События, в которые сейчас ещё можно войти." />
        <Metric label="Доступно во всех Events" value={formatCurrency(totalRemaining)} info="Суммарный свободный объём всех активных событий." />
        <Metric label="Ваш свободный капитал" value={formatCurrency(AVAILABLE_BALANCE)} info="Капитал на счёте, который сейчас можно распределить в Events." />
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2"><Filter size={17} /><span className="text-sm font-bold">Фильтры</span></div>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="rounded-xl border border-[var(--trigonum-border)] bg-white px-3 py-2 text-sm">
            <option value="scarcity">Сначала самые дефицитные</option>
            <option value="time">Меньше всего времени</option>
            <option value="capacity">Меньше всего доступно</option>
            <option value="return">Выше целевой результат</option>
          </select>
          <select value={risk} onChange={(e) => setRisk(e.target.value as 'Все' | Risk)} className="rounded-xl border border-[var(--trigonum-border)] bg-white px-3 py-2 text-sm">
            <option value="Все">Любой риск</option><option value="Низкий">Низкий</option><option value="Умеренный">Умеренный</option><option value="Высокий">Высокий</option>
          </select>
          <button type="button" onClick={() => setAffordableOnly((value) => !value)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${affordableOnly ? 'bg-emerald-100 text-emerald-800' : 'border border-[var(--trigonum-border)] bg-white'}`}>Доступные мне</button>
          <button type="button" onClick={() => setUrgentOnly((value) => !value)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${urgentOnly ? 'bg-rose-100 text-rose-800' : 'border border-[var(--trigonum-border)] bg-white'}`}>Срочные</button>
        </div>
      </Card>

      {criticalCount > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          <Flame size={20} className="shrink-0" />
          <p className="text-sm font-bold">{criticalCount} Event близки к закрытию</p>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {visibleEvents.map((event) => <EventCard key={event.id} event={event} onOpen={() => onSelect(event.id)} />)}
      </div>
    </div>
  )
}

function EventDetail({
  event,
  onBack,
  onReserve,
  onRelease,
}: {
  event: LiveEvent
  onBack: () => void
  onReserve: (amount: number) => void
  onRelease: (amount: number) => void
}) {
  const [desiredAmount, setDesiredAmount] = useState(Math.max(event.minInvestment, Math.min(25_000, event.maxInvestment, AVAILABLE_BALANCE)))
  const [myAllocation, setMyAllocation] = useState(0)
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const [pollPrediction, setPollPrediction] = useState((event.targetLow + event.targetHigh) / 2)
  const [pollConfidence, setPollConfidence] = useState<PollConfidence>('Высокая')
  const [pollLocked, setPollLocked] = useState(false)
  const [watching, setWatching] = useState(false)

  const remaining = Math.max(0, event.capacity - event.committed)
  const fillPct = Math.min(100, (event.committed / event.capacity) * 100)
  const minutesToFull = event.velocityPerMinute > 0 ? remaining / event.velocityPerMinute : 0
  const fullDesiredWindow = event.velocityPerMinute > 0 ? Math.max(0, (remaining - desiredAmount) / event.velocityPerMinute) : 0
  const reentryScore = Math.round((event.returningInvestors + event.returningCapital) / 2)
  const trigonumShare = (event.trigonumCapital / event.capacity) * 100
  const canInvest = remaining >= desiredAmount && desiredAmount >= event.minInvestment && desiredAmount <= event.maxInvestment && desiredAmount <= AVAILABLE_BALANCE && event.secondsLeft > 0

  const reserve = () => {
    if (!canInvest) return
    onReserve(desiredAmount)
    setMyAllocation((value) => value + desiredAmount)
  }

  const release = () => {
    const amount = Math.min(5_000, myAllocation)
    if (amount <= 0) return
    onRelease(amount)
    setMyAllocation((value) => value - amount)
  }

  return (
    <div className="space-y-5">
      <button type="button" onClick={onBack} className="text-sm font-semibold text-[var(--trigonum-blue)]">← Все активные Events</button>

      <Card className="overflow-hidden !p-0">
        <div className="bg-[linear-gradient(135deg,#071a2d_0%,#0b3350_46%,#0d6a67_100%)] p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">{event.category} · {event.id}</p><h2 className="mt-2 text-3xl font-bold">{event.title}</h2><p className="mt-2 text-sm text-slate-200">{event.subtitle}</p></div>
            <div className="text-right"><p className="text-xs text-slate-300">Целевой результат</p><p className="text-3xl font-bold">{event.targetLow}–{event.targetHigh}%</p><p className="text-xs text-slate-300">{event.horizon}</p></div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-2xl border border-[var(--trigonum-border)] p-4">
              <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]"><LabelWithInfo label="Объём Event" info="Сколько капитала уже распределено в событие и сколько всего оно может принять." /></p><p className="mt-1 text-xl font-bold tabular-nums">{formatCurrency(event.committed)} / {formatCurrency(event.capacity)}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{fillPct.toFixed(1)}%</span></div>
              <div className="mt-3"><ProgressBar value={fillPct} tone="green" /></div>
              <div className="mt-3 flex justify-between text-xs text-[var(--trigonum-muted)]"><span>Доступно <b className="tabular-nums">{formatCurrency(remaining)}</b></span><span>{event.participants} инвесторов</span></div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-800"><Gauge size={17} /><p className="text-xs font-bold uppercase tracking-wide"><LabelWithInfo label="Цена ожидания" info="Показывает, насколько быстро свободный объём события уменьшается прямо сейчас." /></p></div>
              <p className="mt-3 text-2xl font-bold text-amber-950 tabular-nums">{formatCurrency(event.velocityPerMinute)} / мин</p>
              <p className="mt-1 text-sm text-amber-900">При текущем темпе свободный объём может закончиться примерно через <b>{Math.max(1, Math.floor(minutesToFull - 2))}–{Math.ceil(minutesToFull + 3)} мин</b>.</p>
              <p className="mt-3 rounded-xl bg-white/80 p-3 text-xs text-amber-950">Сумма {formatCurrency(desiredAmount)} может стать недоступна через <b>{Math.max(1, Math.floor(fullDesiredWindow))}–{Math.max(2, Math.ceil(fullDesiredWindow + 4))} мин</b>.</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Дефицит" value={`${event.scarcity}/100`} info="Насколько ограничена возможность входа прямо сейчас." />
            <Metric label="Повторное участие" value={`${reentryScore}/100`} hint={`${event.returningCapital}% капитала`} info="Насколько значительная часть участников и капитала пришла от инвесторов, уже знакомых с Events." />
            <Metric label="Капитал Trigonum" value={`${trigonumShare.toFixed(0)}%`} hint={formatCurrency(event.trigonumCapital)} info="Доля собственных средств Trigonum внутри этого Event." />
            <Metric label="Осталось времени" value={formatCountdown(event.secondsLeft)} info="Таймер до закрытия входа, если свободный объём не закончится раньше." />
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <Card>
          <div className="flex items-center gap-2"><Wallet size={18} className="text-[var(--trigonum-green)]" /><h3 className="font-bold">Ваша сумма</h3></div>
          {myAllocation === 0 ? (
            <>
              <div className="mt-4"><input type="range" min={event.minInvestment} max={Math.min(event.maxInvestment, AVAILABLE_BALANCE)} step={2_500} value={desiredAmount} onChange={(e) => setDesiredAmount(Number(e.target.value))} className="w-full" /><div className="mt-2 flex justify-between text-xs text-[var(--trigonum-muted)]"><span>{formatCurrency(event.minInvestment)}</span><b className="text-lg text-[var(--trigonum-ink)]">{formatCurrency(desiredAmount)}</b><span>{formatCurrency(Math.min(event.maxInvestment, AVAILABLE_BALANCE))}</span></div></div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Доля Event" value={`${((desiredAmount / event.capacity) * 100).toFixed(2)}%`} /><Metric label={`При +${event.targetLow}%`} value={`+${formatCurrency(desiredAmount * event.targetLow / 100)}`} /><Metric label={`При +${event.targetHigh}%`} value={`+${formatCurrency(desiredAmount * event.targetHigh / 100)}`} /><Metric label="Свободно на счёте" value={formatCurrency(AVAILABLE_BALANCE)} /></div>
              <button type="button" disabled={!canInvest} onClick={reserve} className="mt-4 w-full rounded-xl bg-[var(--trigonum-green)] px-5 py-3 text-sm font-bold text-white disabled:opacity-40">{remaining < desiredAmount ? 'Такой объём уже недоступен' : `Закрепить ${formatCurrency(desiredAmount)}`}</button>
            </>
          ) : (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="flex items-center gap-2 text-sm font-bold text-emerald-800"><BadgeCheck size={18} /> Сумма закреплена</p><p className="mt-2 text-3xl font-bold text-emerald-950">{formatCurrency(myAllocation)}</p><p className="mt-1 text-xs text-emerald-800">Участник #081 · {event.id}</p><button type="button" onClick={release} className="mt-4 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-bold text-emerald-800">Освободить $5K</button></div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2"><Users size={18} className="text-[var(--trigonum-blue)]" /><h3 className="font-bold">Очередь</h3><InfoTip text="Если свободный объём закончится, очередь даёт шанс получить место, когда другой инвестор освободит свою сумму до начала исполнения." /></div>
          {queuePosition === null ? <button type="button" onClick={() => setQueuePosition(8)} className="mt-4 w-full rounded-xl bg-[var(--trigonum-ink)] px-4 py-2.5 text-sm font-bold text-white">Встать в резервную очередь</button> : <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-blue-700">Ваша позиция</p><p className="mt-1 text-4xl font-bold text-blue-950">#{queuePosition}</p><p className="mt-2 text-sm text-blue-900">Перед вами 7 инвесторов · заявок на $94K</p><div className="mt-3 flex gap-2"><button type="button" onClick={() => setQueuePosition((value) => value ? Math.max(1, value - 2) : value)} className="flex-1 rounded-xl bg-white px-3 py-2 text-xs font-bold text-blue-800">Показать движение очереди</button><button type="button" onClick={() => setQueuePosition(null)} className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-blue-700"><X size={15} /></button></div></div>}
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2"><Activity size={18} className="text-violet-600" /><h3 className="font-bold">Прогноз инвесторов</h3><InfoTip text="Сначала фиксируется ваш прогноз результата Event, после чего открывается медианный прогноз остальных инвесторов и диапазон TAIS." /></div>
        {!pollLocked ? (
          <div className="mt-4"><div className="rounded-2xl border border-[var(--trigonum-border)] p-4"><div className="flex items-center justify-between"><span className="text-xs text-[var(--trigonum-muted)]">Ваш прогноз</span><b className="text-2xl">{pollPrediction.toFixed(1)}%</b></div><input type="range" min={-10} max={25} step={0.5} value={pollPrediction} onChange={(e) => setPollPrediction(Number(e.target.value))} className="mt-4 w-full" /><div className="mt-4 flex flex-wrap items-center gap-2">{(['Низкая','Средняя','Высокая'] as PollConfidence[]).map((item) => <button key={item} type="button" onClick={() => setPollConfidence(item)} className={`rounded-lg px-3 py-2 text-xs font-bold ${pollConfidence === item ? 'bg-violet-600 text-white' : 'border border-[var(--trigonum-border)]'}`}>{item}</button>)}<button type="button" onClick={() => setPollLocked(true)} className="ml-auto rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white">Зафиксировать прогноз</button></div></div></div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-3"><Metric label="Ваш прогноз" value={`${pollPrediction.toFixed(1)}%`} hint={`Уверенность: ${pollConfidence.toLowerCase()}`} /><Metric label="TAIS" value={`${event.targetLow}–${event.targetHigh}%`} /><Metric label="Инвесторы" value="9.4%" hint="медиана · 1 241 прогноз" /></div>
        )}
      </Card>

      <Card><div className="flex items-center gap-2"><History size={18} /><h3 className="font-bold">Наблюдать без участия</h3><InfoTip text="После завершения Event вы увидите, что произошло бы с выбранной условной суммой, даже если решили не инвестировать." /></div><button type="button" onClick={() => setWatching((value) => !value)} className={`mt-4 rounded-xl px-4 py-2.5 text-sm font-bold ${watching ? 'bg-emerald-50 text-emerald-700' : 'border border-[var(--trigonum-border)] bg-white'}`}>{watching ? '✓ Event отслеживается' : 'Наблюдать'}</button></Card>
    </div>
  )
}

function SeasonTab() {
  const totalProfit = seasonEvents.reduce((sum, item) => sum + item.profit, 0)
  const positive = seasonEvents.filter((item) => item.result > 0).length
  return <div className="space-y-5"><Card className="overflow-hidden !p-0"><div className="bg-[linear-gradient(120deg,#18122b,#3b1f6a,#15435c)] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">TAIS Events · Сезон IV</p><h2 className="mt-2 text-3xl font-bold">Сезон IV · III квартал 2026</h2><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Завершено" value={`${seasonEvents.length}`} /><Metric label="Положительных" value={`${positive}/${seasonEvents.length}`} /><Metric label="Результат инвесторов" value={`+${formatCurrency(totalProfit)}`} /><Metric label="TAIS против инвесторов" value="6–2" /></div></div></Card><div className="grid gap-4 lg:grid-cols-2"><Card title="Хронология сезона"><div className="space-y-3">{seasonEvents.map((event) => <div key={event.id} className="flex items-center gap-3 rounded-xl border border-[var(--trigonum-border)] p-3"><span className={`grid size-9 place-items-center rounded-full text-xs font-bold ${event.result >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{event.id.slice(1)}</span><div className="flex-1"><p className="text-sm font-bold">Event {event.id}</p><p className="text-xs text-[var(--trigonum-muted)]">{event.investors} инвесторов · заполнен за {event.fill}</p></div><b className={event.result >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{event.result > 0 ? '+' : ''}{event.result}%</b></div>)}</div></Card><div className="space-y-4"><Card title="TAIS против инвесторов"><div className="grid grid-cols-2 gap-3"><Metric label="Ошибка TAIS" value="2.1 п.п." /><Metric label="Ошибка инвесторов" value="3.4 п.п." /></div></Card><Card title="Ваш сезон"><div className="grid grid-cols-2 gap-3"><Metric label="Участий" value="4 Events" /><Metric label="Результат" value="+$7,420" /><Metric label="Точность прогнозов" value="Топ 18%" /><Metric label="Лучший Event" value="+18.2%" /></div></Card></div></div></div>
}

function LedgerTab() {
  const missedUpside = ledgerRows.filter((row) => row.result > 0).reduce((sum, row) => sum + row.reference * (row.result / 100), 0)
  const avoidedLoss = Math.abs(ledgerRows.filter((row) => row.result < 0).reduce((sum, row) => sum + row.reference * (row.result / 100), 0))
  const opportunityCost = missedUpside - avoidedLoss
  return <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]"><Card title="Пропущенные возможности"><div className="space-y-2">{ledgerRows.map((row) => { const hypothetical = row.reference * (row.result / 100); return <div key={row.id} className="grid grid-cols-[70px_1fr_90px_100px] items-center gap-2 rounded-xl border border-[var(--trigonum-border)] p-3 text-sm"><b>{row.id}</b><span className="text-[var(--trigonum-muted)]">Условная сумма {formatCurrency(row.reference)}</span><b className={row.result >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{row.result > 0 ? '+' : ''}{row.result}%</b><b className={hypothetical >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{hypothetical > 0 ? '+' : ''}{formatCurrency(hypothetical)}</b></div> })}</div></Card><div className="space-y-4"><Card><p className="text-xs font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Упущенная прибыль</p><p className="mt-2 text-3xl font-bold text-amber-700">+{formatCurrency(missedUpside)}</p></Card><Card><p className="text-xs font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Избежали потерь</p><p className="mt-2 text-3xl font-bold text-emerald-700">+{formatCurrency(avoidedLoss)}</p></Card><Card><p className="text-xs font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Итог решений</p><p className={`mt-2 text-3xl font-bold ${opportunityCost > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{opportunityCost > 0 ? '-' : '+'}{formatCurrency(Math.abs(opportunityCost))}</p></Card></div></div>
}

function HallTab() {
  return <div className="space-y-5"><Card className="overflow-hidden !p-0"><div className="bg-[linear-gradient(120deg,#201706,#503707,#8b6815)] p-6 text-white"><div className="flex items-center gap-3"><Crown size={26} className="text-amber-300" /><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">Анонимные результаты</p><h2 className="mt-1 text-3xl font-bold">Рекорды Events</h2></div></div></div></Card><div className="grid gap-4 sm:grid-cols-2">{hallRows.map((row) => { const Icon = row.icon; return <Card key={row.label}><Icon size={22} className="text-amber-600" /><p className="mt-4 text-xs font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">{row.label}</p><p className="mt-2 text-3xl font-bold">{row.value}</p><p className="mt-2 text-sm text-[var(--trigonum-muted)]">{row.meta}</p></Card> })}</div></div>
}

function CollectionTab() {
  const proofs = [
    { id: '#031', season: 'Сезон II', result: '+17.8%', badge: 'Первый 10%' },
    { id: '#038', season: 'Сезон III', result: '+8.6%', badge: 'Из очереди' },
    { id: '#041', season: 'Сезон IV', result: '+12.4%', badge: 'Точнее рынка' },
    { id: '#044', season: 'Сезон IV', result: '+18.2%', badge: 'Полностью заполнен' },
  ]
  return <div className="space-y-5"><Card><div className="flex items-center gap-2"><Ticket size={20} className="text-[var(--trigonum-blue)]" /><h2 className="text-xl font-bold">Мои участия</h2></div></Card><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{proofs.map((proof, index) => <div key={proof.id} className="rounded-2xl border border-[var(--trigonum-border)] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><Medal size={24} className="text-[var(--trigonum-blue)]" /><span className="text-xs font-bold text-[var(--trigonum-muted)]">#{String(index + 81).padStart(3, '0')}</span></div><p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[var(--trigonum-muted)]">TAIS EVENT</p><h3 className="mt-1 text-2xl font-bold">{proof.id}</h3><p className="mt-1 text-sm text-[var(--trigonum-muted)]">{proof.season}</p><div className="my-5 h-px bg-[var(--trigonum-border)]" /><p className="text-xs text-[var(--trigonum-muted)]">Итог</p><p className="mt-1 text-3xl font-bold text-emerald-700">{proof.result}</p><div className="mt-4"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">{proof.badge}</span></div></div>)}</div></div>
}

export function EventsPage() {
  const [view, setView] = useState<MainView>('events')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [events, setEvents] = useState<LiveEvent[]>(initialLiveEvents)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setEvents((current) => current.map((event, index) => {
        const secondsLeft = Math.max(0, event.secondsLeft - 1)
        if (!event.liveCapital || secondsLeft <= 0 || event.committed >= event.capacity) return { ...event, secondsLeft }

        const baseFlow = (event.velocityPerMinute / 60) * event.flowMultiplier
        const pulse = 0.72 + ((Date.now() / 1000 + index * 7) % 11) / 20
        const nextCommitted = Math.min(event.capacity, event.committed + baseFlow * pulse)
        const crossedChunk = Math.floor(nextCommitted / 7_500) > Math.floor(event.committed / 7_500)
        return {
          ...event,
          secondsLeft,
          committed: nextCommitted,
          participants: event.participants + (crossedChunk ? 1 : 0),
        }
      }))
    }, 1_000)
    return () => window.clearInterval(timer)
  }, [])

  const selectedEvent = selectedEventId ? events.find((event) => event.id === selectedEventId) ?? null : null

  const reserve = (eventId: string, amount: number) => {
    setEvents((current) => current.map((event) => event.id === eventId ? { ...event, committed: Math.min(event.capacity, event.committed + amount), participants: event.participants + 1 } : event))
  }

  const release = (eventId: string, amount: number) => {
    setEvents((current) => current.map((event) => event.id === eventId ? { ...event, committed: Math.max(0, event.committed - amount) } : event))
  }

  const views = useMemo(() => [
    { id: 'events' as const, label: 'Активные Events', icon: Zap },
    { id: 'season' as const, label: 'Сезон IV', icon: Trophy },
    { id: 'ledger' as const, label: 'Пропущенные', icon: History },
    { id: 'hall' as const, label: 'Рекорды', icon: Crown },
    { id: 'collection' as const, label: 'Мои участия', icon: Ticket },
  ], [])

  return (
    <div className="pb-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--trigonum-blue)]">TAIS Events</p>
        <h1 className="mt-1 text-3xl font-bold text-[var(--trigonum-ink)]">События</h1>
        <p className="mt-1 max-w-3xl text-sm text-[var(--trigonum-muted)]">Активные инвестиционные возможности TAIS с ограниченным временем и объёмом.</p>
      </header>

      <nav className="mb-5 flex flex-wrap gap-2">{views.map((item) => { const Icon = item.icon; return <ViewButton key={item.id} active={view === item.id} onClick={() => { setView(item.id); setSelectedEventId(null) }}><span className="flex items-center gap-2"><Icon size={15} />{item.label}</span></ViewButton> })}</nav>

      {view === 'events' && (selectedEvent ? <EventDetail event={selectedEvent} onBack={() => setSelectedEventId(null)} onReserve={(amount) => reserve(selectedEvent.id, amount)} onRelease={(amount) => release(selectedEvent.id, amount)} /> : <LiveEventsGallery events={events} onSelect={setSelectedEventId} />)}
      {view === 'season' && <SeasonTab />}
      {view === 'ledger' && <LedgerTab />}
      {view === 'hall' && <HallTab />}
      {view === 'collection' && <CollectionTab />}
    </div>
  )
}
