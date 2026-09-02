import {
  Activity,
  ArrowLeft,
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
  TrendingDown,
  TrendingUp,
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
type Risk = 'Низкий' | 'Умеренный' | 'Высокий'
type SortMode = 'scarcity' | 'time' | 'capacity' | 'return'
type PositionSide = 'tais' | 'contra'

interface LiveEvent {
  id: string
  title: string
  category: string
  asset: string
  driver: string
  thesis: string
  taisPosition: string
  counterPosition: string
  successCondition: string
  counterCondition: string
  targetLow: number
  targetHigh: number
  horizon: string
  risk: Risk
  minInvestment: number
  maxInvestment: number
  capacity: number
  committed: number
  contraCapital: number
  velocityPerMinute: number
  secondsLeft: number
  participants: number
  trigonumCapital: number
  scarcity: number
  liveCapital: boolean
  flowMultiplier: number
  queueRequests?: number
  queueCapital?: number
}

const AVAILABLE_BALANCE = 50_000

const initialLiveEvents: LiveEvent[] = [
  {
    id: 'EV-ETF-061',
    title: 'ETF-притоки в Bitcoin',
    category: 'Институциональные потоки',
    asset: 'BTC',
    driver: 'Ускорение чистых притоков капитала в spot Bitcoin ETF',
    thesis: 'TAIS ожидает, что устойчивый институциональный спрос поддержит рост Bitcoin в пределах горизонта Event.',
    taisPosition: 'LONG BTC',
    counterPosition: 'BTC не достигнет целевой зоны TAIS',
    successCondition: 'Итог Event достигает не менее +8% в пределах заданного горизонта.',
    counterCondition: 'Event завершается ниже +8% либо закрывается с отрицательным результатом.',
    targetLow: 8,
    targetHigh: 12,
    horizon: '7–14 дней',
    risk: 'Умеренный',
    minInvestment: 5_000,
    maxInvestment: 50_000,
    capacity: 1_200_000,
    committed: 986_000,
    contraCapital: 288_000,
    velocityPerMinute: 13_800,
    secondsLeft: 24 * 60 + 37,
    participants: 146,
    trigonumCapital: 120_000,
    scarcity: 93,
    liveCapital: true,
    flowMultiplier: 1,
  },
  {
    id: 'EV-DER-044',
    title: 'Перекос деривативов BTC',
    category: 'Деривативы',
    asset: 'BTC',
    driver: 'Экстремальное позиционирование участников на рынке деривативов',
    thesis: 'TAIS ожидает коррекцию перегруженного позиционирования и снижение BTC.',
    taisPosition: 'SHORT BTC',
    counterPosition: 'BTC удержится выше зоны снижения TAIS',
    successCondition: 'Event фиксирует снижение BTC не менее чем на 6% в пределах горизонта.',
    counterCondition: 'BTC не достигает порога снижения TAIS к завершению Event.',
    targetLow: 6,
    targetHigh: 10,
    horizon: '3–8 дней',
    risk: 'Высокий',
    minInvestment: 10_000,
    maxInvestment: 35_000,
    capacity: 650_000,
    committed: 650_000,
    contraCapital: 247_000,
    velocityPerMinute: 0,
    secondsLeft: 19 * 60 + 16,
    participants: 91,
    trigonumCapital: 65_000,
    scarcity: 100,
    liveCapital: false,
    flowMultiplier: 0,
    queueRequests: 14,
    queueCapital: 118_000,
  },
  {
    id: 'EV-STB-028',
    title: 'Рост stablecoin-ликвидности',
    category: 'Ликвидность',
    asset: 'BTC + ETH',
    driver: 'Расширение доступной stablecoin-ликвидности внутри крипторынка',
    thesis: 'TAIS ожидает, что рост свободной ликвидности усилит спрос на крупнейшие цифровые активы.',
    taisPosition: 'LONG BTC + ETH',
    counterPosition: 'Ликвидность не перейдёт в рост крупных активов',
    successCondition: 'Корзина Event достигает нижней границы целевого результата.',
    counterCondition: 'Корзина не достигает целевого порога к завершению Event.',
    targetLow: 7,
    targetHigh: 11,
    horizon: '8–18 дней',
    risk: 'Умеренный',
    minInvestment: 5_000,
    maxInvestment: 40_000,
    capacity: 1_500_000,
    committed: 914_000,
    contraCapital: 214_000,
    velocityPerMinute: 7_200,
    secondsLeft: 72 * 60 + 44,
    participants: 174,
    trigonumCapital: 150_000,
    scarcity: 68,
    liveCapital: true,
    flowMultiplier: 0.72,
  },
  {
    id: 'EV-ROT-019',
    title: 'Ротация капитала BTC → ETH',
    category: 'Ротация капитала',
    asset: 'ETH / BTC',
    driver: 'Изменение относительных потоков капитала между Bitcoin и Ethereum',
    thesis: 'TAIS ожидает относительное усиление ETH по отношению к BTC.',
    taisPosition: 'LONG ETH / SHORT BTC',
    counterPosition: 'BTC сохранит относительное преимущество',
    successCondition: 'ETH опережает BTC на целевую величину Event.',
    counterCondition: 'ETH не достигает требуемого относительного преимущества.',
    targetLow: 5,
    targetHigh: 9,
    horizon: '10–24 дня',
    risk: 'Умеренный',
    minInvestment: 7_500,
    maxInvestment: 45_000,
    capacity: 1_100_000,
    committed: 734_000,
    contraCapital: 301_000,
    velocityPerMinute: 5_100,
    secondsLeft: 103 * 60 + 21,
    participants: 112,
    trigonumCapital: 110_000,
    scarcity: 57,
    liveCapital: false,
    flowMultiplier: 0,
  },
  {
    id: 'EV-VOL-035',
    title: 'Сжатие волатильности BTC',
    category: 'Волатильность',
    asset: 'BTC Vol',
    driver: 'Аномально низкая реализованная волатильность относительно текущего режима рынка',
    thesis: 'TAIS ожидает расширение волатильности независимо от направления движения BTC.',
    taisPosition: 'LONG VOLATILITY',
    counterPosition: 'Волатильность останется сжатой',
    successCondition: 'Реализованная волатильность достигает порога Event в пределах горизонта.',
    counterCondition: 'Расширение волатильности не достигает установленного порога.',
    targetLow: 9,
    targetHigh: 15,
    horizon: '5–12 дней',
    risk: 'Высокий',
    minInvestment: 10_000,
    maxInvestment: 30_000,
    capacity: 800_000,
    committed: 708_000,
    contraCapital: 126_000,
    velocityPerMinute: 10_400,
    secondsLeft: 11 * 60 + 52,
    participants: 76,
    trigonumCapital: 80_000,
    scarcity: 96,
    liveCapital: true,
    flowMultiplier: 1.25,
  },
]

const seasonEvents = [
  { id: '#041', result: 12.4, investors: 83, fill: '27 мин', winner: 'TAIS', profit: 124_000 },
  { id: '#042', result: 7.1, investors: 141, fill: '18 мин', winner: 'TAIS', profit: 81_000 },
  { id: '#043', result: -4.3, investors: 96, fill: '31 мин', winner: 'Контр', profit: -42_000 },
  { id: '#044', result: 18.2, investors: 117, fill: '8 мин', winner: 'TAIS', profit: 291_000 },
  { id: '#045', result: 6.8, investors: 154, fill: '16 мин', winner: 'Контр', profit: 104_000 },
  { id: '#046', result: 9.4, investors: 128, fill: '12 мин', winner: 'TAIS', profit: 166_000 },
] as const

const ledgerRows = [
  { id: '#037', reference: 10_000, result: 12.0 },
  { id: '#038', reference: 10_000, result: -6.0 },
  { id: '#039', reference: 25_000, result: 8.0 },
  { id: '#040', reference: 15_000, result: 4.5 },
] as const

const hallRows = [
  { label: 'Крупнейшая индивидуальная прибыль', value: '+$84,210', meta: 'Участник #7F2A · Сезон III', icon: Trophy },
  { label: 'Крупнейшая выплата контр-позиции', value: '+$31,840', meta: 'Участник #2C91 · коэффициент ×3.18', icon: TrendingDown },
  { label: 'Самое быстрое заполнение', value: '03:41', meta: 'Event #028 · объём $1.5M', icon: Timer },
  { label: 'Максимальный капитал против TAIS', value: '41%', meta: 'Event #039', icon: RefreshCcw },
] as const

function InfoTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex shrink-0" tabIndex={0} aria-label={text}>
      <Info size={13} className="cursor-help text-[var(--trigonum-muted)] transition group-hover:text-[var(--trigonum-blue)] group-focus:text-[var(--trigonum-blue)]" />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 hidden w-64 -translate-x-1/2 rounded-xl bg-[var(--trigonum-ink)] px-3 py-2 text-left text-xs font-normal leading-5 text-white shadow-lg group-hover:block group-focus:block">
        {text}
      </span>
    </span>
  )
}

function LabelWithInfo({ label, info }: { label: string; info?: string }) {
  return <span className="inline-flex items-center gap-1.5"><span>{label}</span>{info && <InfoTip text={info} />}</span>
}

function Metric({ label, value, hint, info, tone = 'default' }: { label: string; value: string; hint?: string; info?: string; tone?: 'default' | 'success' | 'danger' | 'violet' }) {
  const toneClass = tone === 'success'
    ? 'border-emerald-200 bg-emerald-50'
    : tone === 'danger'
      ? 'border-rose-200 bg-rose-50'
      : tone === 'violet'
        ? 'border-violet-200 bg-violet-50'
        : 'border-[var(--trigonum-border)] bg-white'
  const valueClass = tone === 'success' ? 'text-emerald-700' : tone === 'danger' ? 'text-rose-700' : tone === 'violet' ? 'text-violet-700' : 'text-[var(--trigonum-ink)]'
  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]"><LabelWithInfo label={label} info={info} /></p>
      <p className={`mt-1 text-lg font-bold tabular-nums ${valueClass}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--trigonum-muted)]">{hint}</p>}
    </div>
  )
}

function ViewButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${active ? 'bg-[var(--trigonum-ink)] text-white shadow-sm' : 'border border-[var(--trigonum-border)] bg-white text-[var(--trigonum-text)] hover:border-[var(--trigonum-blue)]'}`}>{children}</button>
}

function formatCountdown(seconds: number) {
  const value = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(value / 3600)
  const minutes = Math.floor((value % 3600) / 60)
  const secs = value % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function isFull(event: LiveEvent) {
  return event.committed >= event.capacity
}

function capitalSplit(event: LiveEvent) {
  const total = Math.max(1, event.committed + event.contraCapital)
  return {
    tais: (event.committed / total) * 100,
    contra: (event.contraCapital / total) * 100,
  }
}

function contraOdds(event: LiveEvent) {
  return clamp(1 + (event.committed / Math.max(1, event.contraCapital)) * 0.55, 1.25, 6)
}

function urgencyLabel(event: LiveEvent) {
  if (isFull(event)) return { label: 'Заполнен', tone: 'bg-blue-100 text-blue-700', border: 'border-blue-300' }
  const remaining = Math.max(0, event.capacity - event.committed)
  const remainingShare = remaining / event.capacity
  if (event.secondsLeft <= 10 * 60 || remainingShare <= 0.06) return { label: 'Почти закрыт', tone: 'bg-rose-100 text-rose-700', border: 'border-rose-300' }
  if (event.secondsLeft <= 30 * 60 || remainingShare <= 0.15) return { label: 'Быстро заполняется', tone: 'bg-amber-100 text-amber-700', border: 'border-amber-300' }
  return { label: 'Открыт', tone: 'bg-emerald-50 text-emerald-700', border: 'border-[var(--trigonum-border)]' }
}

function HypothesisStrip({ event }: { event: LiveEvent }) {
  const split = capitalSplit(event)
  return (
    <div className="mt-4 rounded-2xl border border-[var(--trigonum-border)] bg-[var(--trigonum-bg)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">Драйвер</p>
          <p className="mt-1 text-sm font-semibold text-[var(--trigonum-ink)]">{event.driver}</p>
        </div>
        <span className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">TAIS: {event.taisPosition}</span>
      </div>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <div>
          <div className="flex justify-between text-xs"><span className="font-semibold text-emerald-700">За TAIS</span><b>{split.tais.toFixed(0)}%</b></div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${split.tais}%` }} /></div>
        </div>
        <span className="text-xs font-bold text-[var(--trigonum-muted)]">VS</span>
        <div>
          <div className="flex justify-between text-xs"><span className="font-semibold text-violet-700">Против</span><b>{split.contra.toFixed(0)}%</b></div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-violet-500" style={{ width: `${split.contra}%` }} /></div>
        </div>
      </div>
    </div>
  )
}

function EventCard({ event, onOpen }: { event: LiveEvent; onOpen: () => void }) {
  const remaining = Math.max(0, event.capacity - event.committed)
  const filled = Math.min(100, (event.committed / event.capacity) * 100)
  const urgency = urgencyLabel(event)
  const affordable = event.minInvestment <= AVAILABLE_BALANCE
  const full = isFull(event)

  return (
    <button type="button" onClick={onOpen} className={`group w-full rounded-2xl border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${urgency.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">{event.category}</span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${urgency.tone}`}>{urgency.label}</span>
            {full && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">Очередь {event.queueRequests ?? 0}</span>}
          </div>
          <h3 className="mt-3 text-xl font-bold text-[var(--trigonum-ink)]">{event.title}</h3>
          <p className="mt-1 text-sm text-[var(--trigonum-muted)]">{event.asset} · {event.horizon}</p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--trigonum-muted)]">{event.id}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-[var(--trigonum-muted)]"><LabelWithInfo label="Целевой результат" info="Ожидаемый диапазон результата Event по гипотезе TAIS." /></p>
          <p className="text-2xl font-bold text-emerald-700">+{event.targetLow}–{event.targetHigh}%</p>
          <p className="mt-1 text-xs font-bold text-[var(--trigonum-ink)]">{event.taisPosition}</p>
        </div>
      </div>

      <HypothesisStrip event={event} />

      <div className="mt-5">
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--trigonum-muted)]"><LabelWithInfo label={full ? 'Распределено' : 'Доступно'} info={full ? 'Весь объём Event уже распределён между инвесторами.' : 'Свободный объём, который ещё можно занять в основном Event.'} /></p>
            <p className={`mt-1 text-lg font-bold tabular-nums ${full ? 'text-blue-700' : remaining / event.capacity <= 0.12 ? 'text-rose-700' : 'text-[var(--trigonum-ink)]'}`}>{full ? formatCurrency(event.capacity) : formatCurrency(remaining)}</p>
          </div>
          <p className="text-xs font-semibold text-[var(--trigonum-muted)]">Заполнено {filled.toFixed(1)}%</p>
        </div>
        <ProgressBar value={filled} tone="green" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={`rounded-xl p-3 ${!full && event.secondsLeft <= 15 * 60 ? 'bg-rose-50' : 'bg-[var(--trigonum-bg)]'}`}>
          <p className="text-[11px] text-[var(--trigonum-muted)]">{full ? 'Контр-окно' : 'Осталось времени'}</p>
          <p className={`mt-1 font-bold tabular-nums ${!full && event.secondsLeft <= 15 * 60 ? 'text-rose-700' : ''}`}>{formatCountdown(event.secondsLeft)}</p>
        </div>
        <div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-[11px] text-[var(--trigonum-muted)]"><LabelWithInfo label="Дефицит" info="Насколько ограничена возможность входа в основной Event." /></p><p className="mt-1 font-bold">{event.scarcity}/100</p></div>
        <div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-[11px] text-[var(--trigonum-muted)]">Минимум</p><p className="mt-1 font-bold">{formatCurrency(event.minInvestment)}</p></div>
        <div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-[11px] text-[var(--trigonum-muted)]">Риск</p><p className="mt-1 font-bold">{event.risk}</p></div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--trigonum-border)] pt-4">
        <span className="text-xs text-[var(--trigonum-muted)]">{event.participants} инвесторов</span>
        <span className={`rounded-lg px-3 py-1.5 text-xs font-bold ${full ? 'bg-blue-50 text-blue-700' : affordable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{full ? 'Доступна очередь' : affordable ? 'Доступен' : 'Недостаточно средств'}</span>
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
      if (event.secondsLeft <= 0) return false
      if (risk !== 'Все' && event.risk !== risk) return false
      if (affordableOnly && !isFull(event) && event.minInvestment > AVAILABLE_BALANCE) return false
      if (urgentOnly && !isFull(event) && event.secondsLeft > 30 * 60 && (event.capacity - event.committed) / event.capacity > 0.15) return false
      return true
    })
    return [...filtered].sort((a, b) => {
      if (sort === 'time') return a.secondsLeft - b.secondsLeft
      if (sort === 'capacity') return (a.capacity - a.committed) - (b.capacity - b.committed)
      if (sort === 'return') return b.targetHigh - a.targetHigh
      return b.scarcity - a.scarcity
    })
  }, [events, sort, risk, affordableOnly, urgentOnly])

  const criticalCount = events.filter((event) => !isFull(event) && event.secondsLeft > 0 && urgencyLabel(event).label === 'Почти закрыт').length
  const totalRemaining = events.reduce((sum, event) => sum + Math.max(0, event.capacity - event.committed), 0)

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="TAIS Events сейчас" value={`${events.filter((event) => event.secondsLeft > 0).length}`} />
        <Metric label="Свободный объём" value={formatCurrency(totalRemaining)} />
        <Metric label="Ваш свободный капитал" value={formatCurrency(AVAILABLE_BALANCE)} />
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

      {criticalCount > 0 && <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900"><Flame size={20} className="shrink-0" /><p className="text-sm font-bold">{criticalCount} Event близки к закрытию</p></div>}

      <div className="grid gap-4 xl:grid-cols-2">
        {visibleEvents.map((event) => <EventCard key={event.id} event={event} onOpen={() => onSelect(event.id)} />)}
      </div>
    </div>
  )
}

function SideChoice({ event, side, onChange }: { event: LiveEvent; side: PositionSide; onChange: (side: PositionSide) => void }) {
  const odds = contraOdds(event)
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <button type="button" onClick={() => onChange('tais')} className={`rounded-2xl border p-4 text-left transition ${side === 'tais' ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100' : 'border-[var(--trigonum-border)] bg-white'}`}>
        <div className="flex items-center gap-2 text-emerald-700"><TrendingUp size={18} /><span className="text-xs font-bold uppercase tracking-wide">Согласен с TAIS</span></div>
        <p className="mt-3 text-2xl font-black text-[var(--trigonum-ink)]">{event.taisPosition}</p>
        <p className="mt-2 text-sm text-[var(--trigonum-muted)]">{event.successCondition}</p>
      </button>
      <button type="button" onClick={() => onChange('contra')} className={`rounded-2xl border p-4 text-left transition ${side === 'contra' ? 'border-violet-400 bg-violet-50 ring-2 ring-violet-100' : 'border-[var(--trigonum-border)] bg-white'}`}>
        <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2 text-violet-700"><TrendingDown size={18} /><span className="text-xs font-bold uppercase tracking-wide">Против гипотезы</span></div><span className="rounded-lg bg-violet-100 px-2.5 py-1 text-sm font-black text-violet-800">×{odds.toFixed(2)}</span></div>
        <p className="mt-3 text-lg font-black text-[var(--trigonum-ink)]">{event.counterPosition}</p>
        <p className="mt-2 text-sm text-[var(--trigonum-muted)]">{event.counterCondition}</p>
      </button>
    </div>
  )
}

function EventDetail({ event, onBack, onReserveTais, onReserveContra, onRelease }: { event: LiveEvent; onBack: () => void; onReserveTais: (amount: number) => void; onReserveContra: (amount: number) => void; onRelease: (amount: number) => void }) {
  const maxAmount = Math.min(event.maxInvestment, AVAILABLE_BALANCE)
  const [side, setSide] = useState<PositionSide>('tais')
  const [desiredAmount, setDesiredAmount] = useState(Math.max(event.minInvestment, Math.min(20_000, maxAmount)))
  const [myAllocation, setMyAllocation] = useState(0)
  const [myContra, setMyContra] = useState(0)
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const [watching, setWatching] = useState(false)

  useEffect(() => {
    setDesiredAmount(Math.max(event.minInvestment, Math.min(20_000, maxAmount)))
    setMyAllocation(0)
    setMyContra(0)
    setQueuePosition(null)
    setSide('tais')
  }, [event.id, event.minInvestment, maxAmount])

  const full = isFull(event)
  const remaining = Math.max(0, event.capacity - event.committed)
  const fillPct = Math.min(100, (event.committed / event.capacity) * 100)
  const minutesToFull = event.velocityPerMinute > 0 ? remaining / event.velocityPerMinute : 0
  const split = capitalSplit(event)
  const odds = contraOdds(event)
  const trigonumShare = (event.trigonumCapital / event.capacity) * 100
  const amountValid = desiredAmount >= event.minInvestment && desiredAmount <= maxAmount && desiredAmount <= AVAILABLE_BALANCE
  const canInvestTais = !full && amountValid && remaining >= desiredAmount && event.secondsLeft > 0
  const canInvestContra = amountValid && event.secondsLeft > 0

  const reserve = () => {
    if (side === 'tais') {
      if (!canInvestTais) return
      onReserveTais(desiredAmount)
      setMyAllocation((value) => value + desiredAmount)
    } else {
      if (!canInvestContra) return
      onReserveContra(desiredAmount)
      setMyContra((value) => value + desiredAmount)
    }
  }

  const release = () => {
    const amount = Math.min(5_000, myAllocation)
    if (amount <= 0) return
    onRelease(amount)
    setMyAllocation((value) => Math.max(0, value - amount))
  }

  const potentialLow = desiredAmount * event.targetLow / 100
  const potentialHigh = desiredAmount * event.targetHigh / 100
  const contraPayout = desiredAmount * odds
  const contraProfit = desiredAmount * (odds - 1)

  return (
    <div className="space-y-5">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--trigonum-blue)]"><ArrowLeft size={16} /> Все Events</button>

      <Card className="overflow-hidden !p-0">
        <div className="bg-[linear-gradient(135deg,#071a2d_0%,#0b3350_46%,#0d6a67_100%)] p-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">{event.category} · {event.id}</p><h2 className="mt-2 text-3xl font-bold">{event.title}</h2><p className="mt-2 text-sm text-slate-200">{event.driver}</p></div>
            <div className="text-right"><p className="text-xs text-slate-300">Гипотеза TAIS</p><p className="mt-1 text-2xl font-black text-emerald-300">{event.taisPosition}</p><p className="mt-1 text-xs text-slate-300">{event.horizon}</p></div>
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Инвестиционная гипотеза</p><p className="mt-2 max-w-4xl text-sm leading-6 text-white">{event.thesis}</p></div>
        </div>

        <div className="p-5">
          <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-2xl border border-[var(--trigonum-border)] p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">Объём Event</p><p className="mt-1 text-xl font-bold tabular-nums">{formatCurrency(event.committed)} / {formatCurrency(event.capacity)}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${full ? 'bg-blue-100 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>{full ? 'Заполнен' : `${fillPct.toFixed(1)}%`}</span></div><div className="mt-3"><ProgressBar value={fillPct} tone="green" /></div><div className="mt-3 flex justify-between text-xs text-[var(--trigonum-muted)]"><span>{full ? `Очередь: ${event.queueRequests ?? 0}` : <>Доступно <b className="tabular-nums">{formatCurrency(remaining)}</b></>}</span><span>{event.participants} инвесторов</span></div></div>
            {!full ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex items-center gap-2 text-amber-800"><Gauge size={17} /><p className="text-xs font-bold uppercase tracking-wide"><LabelWithInfo label="Цена ожидания" info="Показывает, как быстро уменьшается доступный объём Event." /></p></div><p className="mt-3 text-2xl font-bold text-amber-950 tabular-nums">{formatCurrency(event.velocityPerMinute)} / мин</p><p className="mt-1 text-sm text-amber-900">При текущем темпе свободный объём может закончиться примерно через <b>{Math.max(1, Math.floor(minutesToFull - 2))}–{Math.ceil(minutesToFull + 3)} мин</b>.</p></div> : <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-blue-700">Основной Event заполнен</p><p className="mt-2 text-xl font-bold text-blue-950">{event.queueRequests ?? 0} инвесторов в очереди</p><p className="mt-1 text-sm text-blue-800">Заявки на {formatCurrency(event.queueCapital ?? 0)}</p></div>}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Дефицит" value={`${event.scarcity}/100`} info="Насколько ограничен доступ к основному Event." /><Metric label="За TAIS" value={`${split.tais.toFixed(0)}%`} hint={formatCurrency(event.committed)} info="Доля капитала, занявшего сторону гипотезы TAIS." tone="success" /><Metric label="Против TAIS" value={`${split.contra.toFixed(0)}%`} hint={`×${odds.toFixed(2)}`} info="Доля капитала в контр-позиции." tone="violet" /><Metric label="Капитал Trigonum" value={`${trigonumShare.toFixed(0)}%`} hint={formatCurrency(event.trigonumCapital)} info="Доля собственных средств Trigonum в основном Event." /></div>
        </div>
      </Card>

      <Card><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2"><Activity size={18} className="text-violet-600" /><h3 className="font-bold">TAIS vs инвесторы</h3></div><p className="mt-1 text-sm text-[var(--trigonum-muted)]">Выберите, какую гипотезу хотите поддержать капиталом.</p></div><div className="text-right"><p className="text-xs text-[var(--trigonum-muted)]">До закрытия позиции</p><p className="font-bold tabular-nums">{formatCountdown(event.secondsLeft)}</p></div></div><div className="mt-4"><SideChoice event={event} side={side} onChange={setSide} /></div></Card>

      <div className={`grid gap-5 ${full && side === 'tais' ? 'xl:grid-cols-[1.25fr_1fr]' : ''}`}>
        {full && side === 'tais' ? <><Card><div className="flex items-center gap-2"><Users size={18} className="text-[var(--trigonum-blue)]" /><h3 className="font-bold">Очередь на allocation</h3><InfoTip text="Если другой инвестор освободит свою сумму до начала исполнения, место перейдёт следующему участнику очереди." /></div>{queuePosition === null ? <div className="mt-4"><p className="text-sm text-[var(--trigonum-muted)]">Основной объём уже распределён. Можно занять место в очереди.</p><button type="button" onClick={() => setQueuePosition((event.queueRequests ?? 0) + 1)} className="mt-4 w-full rounded-xl bg-[var(--trigonum-ink)] px-4 py-3 text-sm font-bold text-white">Встать в очередь</button></div> : <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-5"><p className="text-xs font-bold uppercase tracking-wide text-blue-700">Ваша позиция</p><p className="mt-1 text-4xl font-black text-blue-950">#{queuePosition}</p><p className="mt-2 text-sm text-blue-900">Перед вами {Math.max(0, queuePosition - 1)} инвесторов</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => setQueuePosition((value) => value ? Math.max(1, value - 2) : value)} className="flex-1 rounded-xl bg-white px-3 py-2 text-xs font-bold text-blue-800">Показать освобождение allocation</button><button type="button" onClick={() => setQueuePosition(null)} className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-blue-700"><X size={15} /></button></div></div>}</Card><Card><p className="text-xs font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Хотите занять другую сторону?</p><p className="mt-2 text-lg font-bold">Контр-позиция ещё открыта</p><p className="mt-2 text-sm text-[var(--trigonum-muted)]">Текущий коэффициент ×{odds.toFixed(2)}</p><button type="button" onClick={() => setSide('contra')} className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white">Перейти к контр-позиции</button></Card></> : <Card><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Wallet size={18} className={side === 'tais' ? 'text-emerald-600' : 'text-violet-600'} /><h3 className="font-bold">{side === 'tais' ? 'Инвестиция с TAIS' : 'Контр-позиция'}</h3></div><span className={`rounded-lg px-3 py-1.5 text-xs font-bold ${side === 'tais' ? 'bg-emerald-50 text-emerald-700' : 'bg-violet-50 text-violet-700'}`}>{side === 'tais' ? event.taisPosition : `×${odds.toFixed(2)}`}</span></div><div className="mt-5 grid gap-4 md:grid-cols-[1fr_180px] md:items-end"><div><input type="range" min={event.minInvestment} max={maxAmount} step={1} value={desiredAmount} onChange={(e) => setDesiredAmount(Number(e.target.value))} className="w-full" /><div className="mt-2 flex justify-between text-xs text-[var(--trigonum-muted)]"><span>{formatCurrency(event.minInvestment)}</span><span>{formatCurrency(maxAmount)}</span></div></div><label className="text-xs font-semibold text-[var(--trigonum-muted)]">Точная сумма<input type="number" min={event.minInvestment} max={maxAmount} step={1} value={desiredAmount} onChange={(e) => setDesiredAmount(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-[var(--trigonum-border)] bg-white px-3 py-2.5 text-base font-bold text-[var(--trigonum-ink)]" /></label></div>{side === 'tais' ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Ваша доля" value={`${((desiredAmount / event.capacity) * 100).toFixed(2)}%`} /><Metric label={`При +${event.targetLow}%`} value={`+${formatCurrency(potentialLow)}`} tone="success" /><Metric label={`При +${event.targetHigh}%`} value={`+${formatCurrency(potentialHigh)}`} tone="success" /><Metric label="Свободно на счёте" value={formatCurrency(AVAILABLE_BALANCE)} /></div> : <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Коэффициент" value={`×${odds.toFixed(2)}`} tone="violet" info="Коэффициент фиксируется в момент подтверждения контр-позиции." /><Metric label="Возможная выплата" value={formatCurrency(contraPayout)} tone="success" /><Metric label="Возможная прибыль" value={`+${formatCurrency(contraProfit)}`} tone="success" /><Metric label="Ваш риск" value={formatCurrency(desiredAmount)} tone="danger" /></div>}<button type="button" disabled={side === 'tais' ? !canInvestTais : !canInvestContra} onClick={reserve} className={`mt-4 w-full rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-40 ${side === 'tais' ? 'bg-emerald-600' : 'bg-violet-600'}`}>{side === 'tais' ? (remaining < desiredAmount ? 'Такой объём уже недоступен' : `Инвестировать ${formatCurrency(desiredAmount)}`) : `Занять контр-позицию на ${formatCurrency(desiredAmount)}`}</button>{(myAllocation > 0 || myContra > 0) && <div className="mt-4 grid gap-3 sm:grid-cols-2">{myAllocation > 0 && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="flex items-center gap-2 text-sm font-bold text-emerald-800"><BadgeCheck size={17} /> С TAIS</p><p className="mt-2 text-2xl font-black text-emerald-950">{formatCurrency(myAllocation)}</p><button type="button" onClick={release} className="mt-3 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-emerald-800">Освободить $5K</button></div>}{myContra > 0 && <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4"><p className="flex items-center gap-2 text-sm font-bold text-violet-800"><BadgeCheck size={17} /> Против TAIS</p><p className="mt-2 text-2xl font-black text-violet-950">{formatCurrency(myContra)}</p><p className="mt-1 text-xs text-violet-700">Зафиксировано по ×{odds.toFixed(2)}</p></div>}</div>}</Card>}
      </div>

      <Card><div className="flex items-center gap-2"><History size={18} /><h3 className="font-bold">Наблюдать без участия</h3><InfoTip text="После завершения Event вы увидите результат гипотезы, даже если решили не инвестировать." /></div><button type="button" onClick={() => setWatching((value) => !value)} className={`mt-4 rounded-xl px-4 py-2.5 text-sm font-bold ${watching ? 'bg-emerald-50 text-emerald-700' : 'border border-[var(--trigonum-border)] bg-white'}`}>{watching ? '✓ Event отслеживается' : 'Наблюдать'}</button></Card>
    </div>
  )
}

function SeasonTab() {
  const totalProfit = seasonEvents.reduce((sum, item) => sum + item.profit, 0)
  const taisWins = seasonEvents.filter((item) => item.winner === 'TAIS').length
  const contraWins = seasonEvents.length - taisWins
  return <div className="space-y-5"><Card className="overflow-hidden !p-0"><div className="bg-[linear-gradient(120deg,#18122b,#3b1f6a,#15435c)] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">TAIS Events · Сезон IV</p><h2 className="mt-2 text-3xl font-bold">Сезон IV · III квартал 2026</h2><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Завершено" value={`${seasonEvents.length}`} /><Metric label="Победы TAIS" value={`${taisWins}`} tone="success" /><Metric label="Победы контр-стороны" value={`${contraWins}`} tone="violet" /><Metric label="Результат инвесторов" value={`+${formatCurrency(totalProfit)}`} tone="success" /></div></div></Card><div className="grid gap-4 lg:grid-cols-2"><Card title="Хронология сезона"><div className="space-y-3">{seasonEvents.map((event) => <div key={event.id} className="flex items-center gap-3 rounded-xl border border-[var(--trigonum-border)] p-3"><span className={`grid size-9 place-items-center rounded-full text-xs font-bold ${event.winner === 'TAIS' ? 'bg-emerald-50 text-emerald-700' : 'bg-violet-50 text-violet-700'}`}>{event.id.slice(1)}</span><div className="flex-1"><p className="text-sm font-bold">Event {event.id}</p><p className="text-xs text-[var(--trigonum-muted)]">{event.investors} инвесторов · заполнен за {event.fill}</p></div><div className="text-right"><b className={event.result >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{event.result > 0 ? '+' : ''}{event.result}%</b><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">{event.winner}</p></div></div>)}</div></Card><div className="space-y-4"><Card title="TAIS против рынка"><div className="grid grid-cols-2 gap-3"><Metric label="TAIS" value={`${taisWins} побед`} tone="success" /><Metric label="Контр-сторона" value={`${contraWins} побед`} tone="violet" /></div></Card><Card title="Ваш сезон"><div className="grid grid-cols-2 gap-3"><Metric label="С TAIS" value="4 Events" /><Metric label="Контр-позиций" value="3" /><Metric label="Результат" value="+$7,420" tone="success" /><Metric label="Против TAIS" value="2 победы" tone="violet" /></div></Card></div></div></div>
}

function LedgerTab() {
  const missedUpside = ledgerRows.filter((row) => row.result > 0).reduce((sum, row) => sum + row.reference * (row.result / 100), 0)
  const avoidedLoss = Math.abs(ledgerRows.filter((row) => row.result < 0).reduce((sum, row) => sum + row.reference * (row.result / 100), 0))
  const opportunityCost = missedUpside - avoidedLoss
  return <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]"><Card title="Пропущенные возможности"><div className="space-y-2">{ledgerRows.map((row) => { const hypothetical = row.reference * (row.result / 100); return <div key={row.id} className="grid grid-cols-[70px_1fr_90px_100px] items-center gap-2 rounded-xl border border-[var(--trigonum-border)] p-3 text-sm"><b>{row.id}</b><span className="text-[var(--trigonum-muted)]">Условная сумма {formatCurrency(row.reference)}</span><b className={row.result >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{row.result > 0 ? '+' : ''}{row.result}%</b><b className={hypothetical >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{hypothetical > 0 ? '+' : ''}{formatCurrency(hypothetical)}</b></div> })}</div></Card><div className="space-y-4"><Card><p className="text-xs font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Пропущенный рост</p><p className="mt-2 text-3xl font-bold text-amber-700">+{formatCurrency(missedUpside)}</p></Card><Card><p className="text-xs font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Избежали потерь</p><p className="mt-2 text-3xl font-bold text-emerald-700">+{formatCurrency(avoidedLoss)}</p></Card><Card><p className="text-xs font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Итог решений</p><p className={`mt-2 text-3xl font-bold ${opportunityCost > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{opportunityCost > 0 ? '-' : '+'}{formatCurrency(Math.abs(opportunityCost))}</p></Card></div></div>
}

function HallTab() {
  return <div className="space-y-5"><Card className="overflow-hidden !p-0"><div className="bg-[linear-gradient(120deg,#201706,#503707,#8b6815)] p-6 text-white"><div className="flex items-center gap-3"><Crown size={26} className="text-amber-300" /><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">Анонимный зал результатов</p><h2 className="mt-1 text-3xl font-bold">Рекорды Events</h2></div></div></div></Card><div className="grid gap-4 sm:grid-cols-2">{hallRows.map((row) => { const Icon = row.icon; return <Card key={row.label}><Icon size={22} className="text-amber-600" /><p className="mt-4 text-xs font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">{row.label}</p><p className="mt-2 text-3xl font-bold">{row.value}</p><p className="mt-2 text-sm text-[var(--trigonum-muted)]">{row.meta}</p></Card> })}</div></div>
}

function CollectionTab() {
  const proofs = [{ id: '#031', season: 'Сезон II', result: '+17.8%', badge: 'С TAIS', position: 'LONG BTC' },{ id: '#038', season: 'Сезон III', result: '+8.6%', badge: 'Контр-позиция', position: 'Против SHORT BTC' },{ id: '#041', season: 'Сезон IV', result: '+12.4%', badge: 'С TAIS', position: 'LONG ETH' },{ id: '#044', season: 'Сезон IV', result: '+18.2%', badge: 'Очередь', position: 'LONG VOLATILITY' }]
  return <div className="space-y-5"><Card><div className="flex items-center gap-2"><Ticket size={20} className="text-[var(--trigonum-blue)]" /><h2 className="text-xl font-bold">История участия</h2></div></Card><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{proofs.map((proof, index) => <div key={proof.id} className="rounded-2xl border border-[var(--trigonum-border)] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><Medal size={24} className="text-[var(--trigonum-blue)]" /><span className="text-xs font-bold text-[var(--trigonum-muted)]">#{String(index + 81).padStart(3, '0')}</span></div><p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[var(--trigonum-muted)]">TAIS EVENT</p><h3 className="mt-1 text-2xl font-bold">{proof.id}</h3><p className="mt-1 text-sm text-[var(--trigonum-muted)]">{proof.season}</p><p className="mt-4 text-sm font-bold">{proof.position}</p><div className="my-5 h-px bg-[var(--trigonum-border)]" /><p className="text-xs text-[var(--trigonum-muted)]">Результат</p><p className="mt-1 text-3xl font-bold text-emerald-700">{proof.result}</p><span className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${proof.badge === 'Контр-позиция' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`}>{proof.badge}</span></div>)}</div></div>
}

export function EventsPage() {
  const [view, setView] = useState<MainView>('events')
  const [events, setEvents] = useState<LiveEvent[]>(initialLiveEvents)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setEvents((current) => current.map((event) => {
        const nextSeconds = Math.max(0, event.secondsLeft - 1)
        if (!event.liveCapital || isFull(event) || nextSeconds <= 0) return { ...event, secondsLeft: nextSeconds }
        const inflow = (event.velocityPerMinute / 60) * event.flowMultiplier
        const nextCommitted = Math.min(event.capacity, event.committed + inflow)
        const crossedBlock = Math.floor(nextCommitted / 5_000) > Math.floor(event.committed / 5_000)
        return { ...event, secondsLeft: nextSeconds, committed: nextCommitted, participants: event.participants + (crossedBlock ? 1 : 0) }
      }))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const selectedEvent = selectedEventId ? events.find((event) => event.id === selectedEventId) ?? null : null
  const changeEvent = (eventId: string, updater: (event: LiveEvent) => LiveEvent) => setEvents((current) => current.map((event) => event.id === eventId ? updater(event) : event))
  const reserveTais = (eventId: string, amount: number) => changeEvent(eventId, (event) => ({ ...event, committed: Math.min(event.capacity, event.committed + amount), participants: event.participants + 1 }))
  const reserveContra = (eventId: string, amount: number) => changeEvent(eventId, (event) => ({ ...event, contraCapital: event.contraCapital + amount }))
  const release = (eventId: string, amount: number) => changeEvent(eventId, (event) => ({ ...event, committed: Math.max(0, event.committed - amount) }))

  const views = useMemo(() => [{ id: 'events' as const, label: 'Live Events', icon: Zap },{ id: 'season' as const, label: 'Сезон IV', icon: Trophy },{ id: 'ledger' as const, label: 'Пропущенные', icon: History },{ id: 'hall' as const, label: 'Зал результатов', icon: Crown },{ id: 'collection' as const, label: 'Моя история', icon: Ticket }], [])

  return <div className="pb-10"><header className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--trigonum-blue)]">TAIS · рынок инвестиционных гипотез</p><h1 className="mt-1 text-3xl font-bold text-[var(--trigonum-ink)]">Events</h1><p className="mt-1 max-w-3xl text-sm text-[var(--trigonum-muted)]">TAIS формирует инвестиционную гипотезу из данных. Вы можете поддержать её капиталом или занять противоположную сторону.</p></header><nav className="mb-5 flex flex-wrap gap-2">{views.map((item) => { const Icon = item.icon; return <ViewButton key={item.id} active={view === item.id} onClick={() => { setView(item.id); setSelectedEventId(null) }}><span className="flex items-center gap-2"><Icon size={15} />{item.label}</span></ViewButton> })}</nav>{view === 'events' && (selectedEvent ? <EventDetail event={selectedEvent} onBack={() => setSelectedEventId(null)} onReserveTais={(amount) => reserveTais(selectedEvent.id, amount)} onReserveContra={(amount) => reserveContra(selectedEvent.id, amount)} onRelease={(amount) => release(selectedEvent.id, amount)} /> : <LiveEventsGallery events={events} onSelect={setSelectedEventId} />)}{view === 'season' && <SeasonTab />}{view === 'ledger' && <LedgerTab />}{view === 'hall' && <HallTab />}{view === 'collection' && <CollectionTab />}</div>
}
