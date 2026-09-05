import { liveEvents, type LiveEvent, type Risk } from '../model/live-events'
import {
  ArrowLeft,
  Crown,
  Filter,
  Flame,
  Gauge,
  History,
  Ticket,
  TrendingDown,
  TrendingUp,
  Trophy,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { formatCurrency } from '../../../shared/lib/format'
import { EventMarketChart } from '../components/EventMarketChart'

type MainView = 'events' | 'season' | 'ledger' | 'hall' | 'collection'
type SortMode = 'scarcity' | 'time' | 'capacity' | 'return'
type Side = 'tais' | 'contra'


type PastEvent = {
  id: string
  title: string
  category: string
  position: string
  shortIdea: string
  result: number
  invested: number
  investors: number
  fillTime: string
  activeDuration: string
  totalPnl: number
  bestPnl: number
  bestAlias: string
  maxDrawdown: number
  closedDate: string
  timeline: { label: string; time: string; detail: string }[]
}

const BALANCE = 50_000


const pastEvents: PastEvent[] = [
  { id: 'EV-ETF-041', title: 'Ускорение ETF-притоков', category: 'Институциональные потоки', position: 'LONG BTC', shortIdea: 'Рост чистых притоков в spot Bitcoin ETF', result: 12.4, invested: 1000000, investors: 83, fillTime: '27 мин', activeDuration: '11 д 4 ч', totalPnl: 124000, bestPnl: 12400, bestAlias: '#7F2A', maxDrawdown: -2.1, closedDate: '28 августа', timeline: [
    { label: 'TAIS обнаружила сигнал', time: '00:00', detail: 'Event опубликован и открыт для allocation.' },
    { label: '50% объёма', time: '00:09', detail: '$500K распределено между инвесторами.' },
    { label: 'Event заполнен', time: '00:27', detail: 'Основной объём $1M полностью распределён.' },
    { label: 'Закрытие Event', time: '11д 04ч', detail: 'Результат +12.4%, прибыль инвесторов +$124K.' },
  ] },
  { id: 'EV-STB-042', title: 'Расширение stablecoin-ликвидности', category: 'Ликвидность', position: 'LONG BTC + ETH', shortIdea: 'Рост свободной ликвидности внутри крипторынка', result: 7.1, invested: 1400000, investors: 141, fillTime: '18 мин', activeDuration: '8 д 17 ч', totalPnl: 99400, bestPnl: 7100, bestAlias: '#31BC', maxDrawdown: -1.6, closedDate: '21 августа', timeline: [
    { label: 'Event открыт', time: '00:00', detail: 'TAIS зафиксировала расширение ликвидности.' },
    { label: '75% объёма', time: '00:11', detail: '$1.05M распределено.' },
    { label: 'Event заполнен', time: '00:18', detail: '$1.4M allocation полностью занят.' },
    { label: 'Закрытие Event', time: '8д 17ч', detail: 'Результат +7.1%, прибыль инвесторов +$99.4K.' },
  ] },
  { id: 'EV-DER-043', title: 'Перегрев длинных позиций', category: 'Деривативы', position: 'SHORT BTC', shortIdea: 'TAIS ожидала коррекцию перегруженного рынка', result: -4.3, invested: 960000, investors: 96, fillTime: '31 мин', activeDuration: '5 д 9 ч', totalPnl: -41280, bestPnl: 0, bestAlias: '—', maxDrawdown: -6.7, closedDate: '14 августа', timeline: [
    { label: 'Event открыт', time: '00:00', detail: 'Открыта позиция SHORT BTC.' },
    { label: '50% объёма', time: '00:19', detail: '$480K allocation занят.' },
    { label: 'Event заполнен', time: '00:31', detail: 'Весь объём $960K распределён без очереди.' },
    { label: 'Максимальная просадка', time: '3д 02ч', detail: 'Неблагоприятное движение достигло -6.7%.' },
    { label: 'Закрытие Event', time: '5д 09ч', detail: 'Результат -4.3%, совокупный P&L -$41.28K.' },
  ] },
  { id: 'EV-ROT-044', title: 'Ротация капитала в Ethereum', category: 'Ротация капитала', position: 'LONG ETH / SHORT BTC', shortIdea: 'Относительный спрос смещался в сторону ETH', result: 18.2, invested: 1600000, investors: 117, fillTime: '8 мин', activeDuration: '14 д 2 ч', totalPnl: 291200, bestPnl: 18200, bestAlias: '#A812', maxDrawdown: -2.8, closedDate: '7 августа', timeline: [
    { label: 'Event открыт', time: '00:00', detail: 'TAIS зафиксировала начало ротации BTC → ETH.' },
    { label: '50% объёма', time: '00:03', detail: '$800K занято за первые три минуты.' },
    { label: 'Event заполнен', time: '00:08', detail: '$1.6M allocation полностью распределён.' },
    { label: 'Закрытие Event', time: '14д 02ч', detail: 'Результат +18.2%, прибыль инвесторов +$291.2K.' },
  ] },
  { id: 'EV-ONC-045', title: 'Снижение биржевого предложения BTC', category: 'On-chain', position: 'LONG BTC', shortIdea: 'TAIS фиксировала отток предложения с бирж', result: 6.8, invested: 1250000, investors: 154, fillTime: '16 мин', activeDuration: '9 д 11 ч', totalPnl: 85000, bestPnl: 6800, bestAlias: '#0D91', maxDrawdown: -1.9, closedDate: '30 июля', timeline: [
    { label: 'Event открыт', time: '00:00', detail: 'Открыта позиция LONG BTC.' },
    { label: 'Event заполнен', time: '00:16', detail: '$1.25M капитала распределено.' },
    { label: 'Целевая зона достигнута', time: '8д 20ч', detail: 'Цена вошла в рабочую целевую область.' },
    { label: 'Закрытие Event', time: '9д 11ч', detail: 'Финальный результат +6.8%.' },
  ] },
  { id: 'EV-FND-046', title: 'Расхождение фондирования', category: 'Фандинг', position: 'SHORT BTC', shortIdea: 'Аномалия стоимости фондирования указывала на коррекцию', result: 9.4, invested: 1800000, investors: 128, fillTime: '12 мин', activeDuration: '6 д 5 ч', totalPnl: 169200, bestPnl: 9400, bestAlias: '#CC41', maxDrawdown: -2.4, closedDate: '22 июля', timeline: [
    { label: 'Event открыт', time: '00:00', detail: 'TAIS открыла SHORT BTC.' },
    { label: '80% объёма', time: '00:08', detail: '$1.44M уже распределено.' },
    { label: 'Event заполнен', time: '00:12', detail: 'Весь объём $1.8M занят.' },
    { label: 'Позиция в прибыли', time: '2д 07ч', detail: 'Движение рынка подтвердило гипотезу.' },
    { label: 'Закрытие Event', time: '6д 05ч', detail: 'Финальный результат +9.4%, +$169.2K инвесторам.' },
  ] },
]

const ledgerRefs = [
  { eventId: 'EV-ONC-045', reference: 10_000 },
  { eventId: 'EV-DER-043', reference: 10_000 },
  { eventId: 'EV-STB-042', reference: 25_000 },
  { eventId: 'EV-FND-046', reference: 15_000 },
]

const proofRefs = [
  { eventId: 'EV-ROT-044', season: 'Сезон IV', invested: 15_000 },
  { eventId: 'EV-ETF-041', season: 'Сезон IV', invested: 20_000 },
  { eventId: 'EV-STB-042', season: 'Сезон IV', invested: 12_000 },
  { eventId: 'EV-DER-043', season: 'Сезон IV', invested: 8_000 },
  { eventId: 'EV-FND-046', season: 'Сезон III', invested: 10_000 },
]

const hallData = [
  { label: 'Крупнейшая индивидуальная прибыль', value: '+$84,210', meta: 'Участник #7F2A · Сезон III' },
  { label: 'Максимальная прибыль одного Event', value: '+$291,200', meta: 'EV-ROT-044 · 117 инвесторов' },
  { label: 'Самое быстрое заполнение', value: '03:41', meta: 'Event #028 · объём $1.5M' },
  { label: 'Больше всего инвесторов', value: '154 инвестора', meta: 'EV-ONC-045 · объём $1.25M' },
]

const podiumData = [
  { alias: 'Участник #7F2A', amount: 84210, meta: '9 Events · Сезон III–IV', rank: 1 },
  { alias: 'Участник #A812', amount: 61480, meta: '7 Events · Сезон IV', rank: 2 },
  { alias: 'Участник #31BC', amount: 48950, meta: '11 Events · Сезон IV', rank: 3 },
]

const eventWindows: Record<string, { closed: string; days: number }> = {
  'EV-ETF-041': { closed: '2026-08-28', days: 11.17 },
  'EV-STB-042': { closed: '2026-08-21', days: 8.71 },
  'EV-DER-043': { closed: '2026-08-14', days: 5.38 },
  'EV-ROT-044': { closed: '2026-08-07', days: 14.08 },
  'EV-ONC-045': { closed: '2026-07-30', days: 9.46 },
  'EV-FND-046': { closed: '2026-07-22', days: 6.21 },
}

function countdown(seconds: number) {
  const value = Math.max(0, Math.floor(seconds))
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(Math.floor(value / 3600))}:${p(Math.floor((value % 3600) / 60))}:${p(value % 60)}`
}

function full(event: LiveEvent) {
  return event.committed >= event.capacity
}

function cover(seedValue: string) {
  let seed = 0
  for (let index = 0; index < seedValue.length; index += 1) seed = (seed * 31 + seedValue.charCodeAt(index)) % 997
  const pairs = [
    ['var(--trigonum-violet)', '#12ccff'], ['#3f3f8a', '#af47ff'], ['var(--trigonum-ink)', '#12ccff'],
    ['var(--trigonum-violet)', '#af47ff'], ['#161638', 'var(--trigonum-violet)'], ['#3f3f8a', '#92f222'],
  ]
  const pair = pairs[seed % pairs.length]
  const angle = 105 + (seed % 5) * 24
  return { bg: `linear-gradient(${angle}deg, #12122e 0%, ${pair[0]} 58%, ${pair[1]} 130%)`, accent: pair[1] }
}

function symbolFor(position: string, visual?: LiveEvent['visual']) {
  if (visual === 'basket') return '₿ + Ξ'
  if (visual === 'relative') return 'Ξ / ₿'
  if (visual === 'eth') return 'Ξ'
  if (position.includes('BTC') && position.includes('ETH')) return 'Ξ₿'
  if (position.includes('ETH')) return 'Ξ'
  return '₿'
}

function chartMeta(source: string, short: boolean) {
  const both = source.includes('BTC') && source.includes('ETH')
  const symbol = both ? (source.includes('/') ? 'ETHBTC' : 'BTCUSDT') : source.includes('ETH') ? 'ETHUSDT' : 'BTCUSDT'
  return { symbol, tone: short ? 'down' as const : 'up' as const }
}

function urgency(event: LiveEvent) {
  if (full(event)) return { label: 'Заполнен', bg: 'var(--trigonum-violet-soft)', color: 'var(--trigonum-violet)', border: '#cdcdf0' }
  const share = Math.max(0, event.capacity - event.committed) / event.capacity
  if (event.secondsLeft <= 600 || share <= 0.06) return { label: 'Почти закрыт', bg: '#fdecec', color: 'var(--trigonum-danger)', border: '#f6cdcd' }
  if (event.secondsLeft <= 1800 || share <= 0.15) return { label: 'Быстро заполняется', bg: '#fdf6e8', color: '#8a5f06', border: '#f2e2c2' }
  return { label: 'Открыт', bg: '#eef7f1', color: 'var(--trigonum-success)', border: 'var(--trigonum-border)' }
}

function Ring({ value, size = 76, stroke = 5 }: { value: number; size?: number; stroke?: number }) {
  const radius = (size - stroke * 2) / 2
  const circumference = 2 * Math.PI * radius
  const dash = `${(Math.max(0, Math.min(100, value)) / 100) * circumference} ${circumference}`
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgb(255 255 255 / 14%)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--trigonum-violet)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={dash} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[17px] font-bold tabular-nums text-white">{Math.round(value)}%</div>
    </div>
  )
}

function EventsHero({ events }: { events: LiveEvent[] }) {
  const totalRemaining = events.reduce((sum, event) => sum + Math.max(0, event.capacity - event.committed), 0)
  const totalCapacity = events.reduce((sum, event) => sum + event.capacity, 0)
  const fill = totalCapacity ? ((totalCapacity - totalRemaining) / totalCapacity) * 100 : 0
  return (
    <header className="mb-5 overflow-hidden rounded-[18px] shadow-[0_8px_30px_rgb(8_27_58/8%)]">
      <div className="h-[3px] bg-[linear-gradient(100deg,#92f222_0%,#12ccff_50%,#af47ff_100%)]" />
      <div className="relative overflow-hidden bg-[linear-gradient(160deg,var(--trigonum-ink)_0%,#161638_100%)] text-white">
        <svg viewBox="0 0 420 220" preserveAspectRatio="none" className="absolute right-0 top-0 h-full w-[46%] opacity-50">
          <path d="M40 220 L210 40" fill="none" stroke="rgb(255 255 255 / 14%)" />
          <path d="M210 40 L380 220" fill="none" stroke="rgb(255 255 255 / 14%)" />
          <path d="M210 40 L210 220" fill="none" stroke="rgb(255 255 255 / 14%)" />
          <path d="M110 220 L210 108" fill="none" stroke="rgb(18 204 255 / 26%)" />
          <path d="M310 220 L210 108" fill="none" stroke="rgb(146 242 34 / 24%)" />
          <circle cx="210" cy="40" r="3" fill="var(--trigonum-violet)" />
        </svg>
        <div className="relative flex flex-wrap items-center justify-between gap-7 px-7 py-6">
          <div className="min-w-0 flex-1 basis-[380px]">
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#92f222]">TAIS · инвестиционные события</p>
            <h1 className="mt-2 text-[38px] font-semibold leading-none tracking-[-.03em]">Events</h1>
            <p className="mt-2 max-w-[520px] text-sm leading-[1.55] text-white/70">TAIS находит рыночную возможность и открывает короткое окно входа. Объём Event ограничен: когда капитал распределён, вход закрывается.</p>
          </div>
          <div className="flex items-center gap-6">
            <Ring value={fill} />
            <div className="flex items-stretch gap-5">
              <HeroMetric label="Активных" value={`${events.filter((event) => event.secondsLeft > 0).length}`} />
              <Divider />
              <HeroMetric label="Свободный объём" value={formatCurrency(totalRemaining)} />
              <Divider />
              <HeroMetric label="Ваш капитал" value={formatCurrency(BALANCE)} accent />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function Divider() {
  return <div className="w-px bg-white/15" />
}

function HeroMetric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-[.1em] text-white/60">{label}</p><p className={`mt-2 text-xl font-bold tabular-nums ${accent ? 'text-[#92f222]' : 'text-white'}`}>{value}</p></div>
}

function ViewTabs({ view, onChange }: { view: MainView; onChange: (view: MainView) => void }) {
  const items = [
    { id: 'events' as const, label: 'Live Events', icon: Zap },
    { id: 'season' as const, label: 'Сезон IV', icon: Trophy },
    { id: 'ledger' as const, label: 'Упущенные', icon: History },
    { id: 'hall' as const, label: 'Зал результатов', icon: Crown },
    { id: 'collection' as const, label: 'Моя история', icon: Ticket },
  ]
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {items.map((item) => {
        const Icon = item.icon
        const active = view === item.id
        return <button key={item.id} type="button" onClick={() => onChange(item.id)} className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${active ? 'border-[var(--trigonum-ink)] bg-[var(--trigonum-ink)] text-white' : 'border-[var(--trigonum-border)] bg-white text-[var(--trigonum-text)] hover:border-[var(--trigonum-violet)]'}`}><Icon size={16} />{item.label}</button>
      })}
    </div>
  )
}

function EventCard({ event, onOpen }: { event: LiveEvent; onOpen: () => void }) {
  const remaining = Math.max(0, event.capacity - event.committed)
  const filled = Math.min(100, event.committed / event.capacity * 100)
  const status = urgency(event)
  const coverData = cover(event.id)
  const short = event.taisPosition.startsWith('SHORT')
  const urgentTime = !full(event) && event.secondsLeft <= 900
  return (
    <button type="button" onClick={onOpen} className="block w-full overflow-hidden rounded-[18px] border bg-white p-0 text-left shadow-[0_8px_30px_rgb(8_27_58/8%)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgb(8_27_58/12%)]" style={{ borderColor: status.border }}>
      <div className="relative h-[148px] overflow-hidden" style={{ background: coverData.bg }}>
        <div className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_84%_130%,rgb(255_255_255/10%)_0_1px,transparent_1px_28px)]" />
        <div className="absolute -right-[30px] -top-[46px] h-[200px] w-[200px] rounded-full opacity-55" style={{ background: `radial-gradient(circle, ${coverData.accent} 0%, transparent 68%)` }} />
        <p className="absolute -bottom-[18px] left-4 m-0 text-[96px] font-semibold tracking-[-.04em] text-white/10">{symbolFor(event.taisPosition, event.visual)}</p>
        <div className="absolute inset-0 flex flex-col justify-between p-[14px_18px] text-white">
          <div className="flex items-start justify-between gap-3">
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em]">{event.category}</span>
            <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: status.bg, color: status.color }}>{status.label}</span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/70">{event.asset}</p>
              <div className="mt-1.5 inline-flex items-center gap-2 rounded-lg bg-white/20 px-2.5 py-1.5">
                {short ? <TrendingDown size={17} className="text-[#ffc9c9]" /> : <TrendingUp size={17} className="text-[#d6f9a8]" />}
                <span className="text-[13px] font-bold">{event.taisPosition}</span>
              </div>
            </div>
            <div className="text-right"><p className="text-[9px] font-bold uppercase tracking-[.12em] text-white/70">До закрытия</p><p className={`mt-1 text-[22px] font-bold tabular-nums ${urgentTime ? 'text-[#ffd7d7]' : 'text-white'}`}>{countdown(event.secondsLeft)}</p></div>
          </div>
        </div>
      </div>
      <div className="p-[18px_20px]">
        <h3 className="text-[19px] font-bold text-[var(--trigonum-ink)]">{event.title}</h3>
        <p className="mt-1 text-sm text-[var(--trigonum-muted)]">{event.shortIdea}</p>
        <div className="mt-3.5 flex items-baseline justify-between rounded-xl border border-[var(--trigonum-border)] px-3.5 py-3"><span className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Целевой результат</span><span className="text-[15px] font-bold text-[var(--trigonum-success)]">+{event.targetLow}–{event.targetHigh}%</span></div>
        <div className="mt-3.5">
          <div className="mb-2 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{full(event) ? 'Распределено' : 'Доступно'}</p><p className={`mt-1 text-xl font-bold tabular-nums ${full(event) ? 'text-[var(--trigonum-violet)]' : remaining / event.capacity <= .12 ? 'text-[var(--trigonum-danger)]' : 'text-[var(--trigonum-ink)]'}`}>{full(event) ? formatCurrency(event.capacity) : formatCurrency(remaining)}</p></div><p className="text-[11px] text-[var(--trigonum-muted)]">{filled.toFixed(1)}% из {formatCurrency(event.capacity)}</p></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--trigonum-violet-soft)]"><div className="h-full rounded-full bg-[var(--trigonum-violet)] transition-[width] duration-700" style={{ width: `${filled}%` }} /></div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-[var(--trigonum-border)]">
          <MiniCell label="Минимум" value={formatCurrency(event.minInvestment)} />
          <MiniCell label="Риск" value={event.risk} />
          <MiniCell label="Инвесторов" value={`${event.participants}`} />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--trigonum-border)] pt-3.5"><span className="text-xs text-[var(--trigonum-muted)]">{event.velocityPerMinute > 0 ? `Темп ${formatCurrency(event.velocityPerMinute)}/мин` : 'Набор закрыт'}</span><span className={`rounded-lg px-3 py-1.5 text-xs font-bold ${full(event) ? 'bg-[var(--trigonum-violet-soft)] text-[var(--trigonum-violet)]' : event.minInvestment <= BALANCE ? 'bg-[#eef7f1] text-[var(--trigonum-success)]' : 'bg-[#f5f5fa] text-[var(--trigonum-muted)]'}`}>{full(event) ? 'Заполнен' : event.minInvestment <= BALANCE ? 'Доступен' : 'Недостаточно средств'}</span></div>
      </div>
    </button>
  )
}

function MiniCell({ label, value }: { label: string; value: string }) {
  return <div className="bg-white px-3 py-2.5"><p className="text-[10px] uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{label}</p><p className="mt-1 text-sm font-bold tabular-nums text-[var(--trigonum-ink)]">{value}</p></div>
}

function Gallery({ events, onSelect }: { events: LiveEvent[]; onSelect: (id: string) => void }) {
  const [sort, setSort] = useState<SortMode>('scarcity')
  const [risk, setRisk] = useState<'Все' | Risk>('Все')
  const [affordableOnly, setAffordableOnly] = useState(false)
  const [urgentOnly, setUrgentOnly] = useState(false)
  const visibleEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      if (event.secondsLeft <= 0) return false
      if (risk !== 'Все' && event.risk !== risk) return false
      if (affordableOnly && !full(event) && event.minInvestment > BALANCE) return false
      if (urgentOnly && !full(event) && event.secondsLeft > 1800 && (event.capacity - event.committed) / event.capacity > .15) return false
      return true
    })
    return [...filtered].sort((a, b) => sort === 'time' ? a.secondsLeft - b.secondsLeft : sort === 'capacity' ? (a.capacity - a.committed) - (b.capacity - b.committed) : sort === 'return' ? b.targetHigh - a.targetHigh : b.scarcity - a.scarcity)
  }, [events, sort, risk, affordableOnly, urgentOnly])
  const criticalCount = events.filter((event) => !full(event) && event.secondsLeft > 0 && urgency(event).label === 'Почти закрыт').length
  return (
    <div className="space-y-5">
      <div className="rounded-[18px] border border-[var(--trigonum-border)] bg-white p-5 shadow-[0_8px_30px_rgb(8_27_58/8%)]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--trigonum-ink)]"><Filter size={17} />Фильтры</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="rounded-xl border border-[var(--trigonum-border)] bg-white px-3 py-2 text-sm text-[var(--trigonum-text)]"><option value="scarcity">Сначала самые дефицитные</option><option value="time">Меньше всего времени</option><option value="capacity">Меньше всего доступно</option><option value="return">Выше целевой результат</option></select>
          <select value={risk} onChange={(e) => setRisk(e.target.value as 'Все' | Risk)} className="rounded-xl border border-[var(--trigonum-border)] bg-white px-3 py-2 text-sm text-[var(--trigonum-text)]"><option value="Все">Любой риск</option><option value="Низкий">Низкий</option><option value="Умеренный">Умеренный</option><option value="Высокий">Высокий</option></select>
          <FilterButton active={affordableOnly} tone="green" onClick={() => setAffordableOnly((v) => !v)}>Доступные мне</FilterButton>
          <FilterButton active={urgentOnly} tone="red" onClick={() => setUrgentOnly((v) => !v)}>Срочные</FilterButton>
        </div>
      </div>
      {criticalCount > 0 && <div className="flex items-center gap-3 rounded-[18px] border border-[#f6cdcd] bg-[#fdecec] p-4 text-sm font-semibold text-[#8f2b2e]"><Flame size={20} />{criticalCount} Event близки к закрытию</div>}
      <div className="grid gap-4 xl:grid-cols-2">{visibleEvents.map((event) => <EventCard key={event.id} event={event} onOpen={() => onSelect(event.id)} />)}</div>
    </div>
  )
}

function FilterButton({ active, tone, onClick, children }: { active: boolean; tone: 'green' | 'red'; onClick: () => void; children: string }) {
  const cls = active ? tone === 'green' ? 'border-[#d8ecdf] bg-[#eef7f1] text-[var(--trigonum-success)]' : 'border-[#f6cdcd] bg-[#fdecec] text-[var(--trigonum-danger)]' : 'border-[var(--trigonum-border)] bg-white text-[var(--trigonum-text)]'
  return <button type="button" onClick={onClick} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${cls}`}>{children}</button>
}

function EventDetail({ event, onBack, onInvest, onContra }: { event: LiveEvent; onBack: () => void; onInvest: (amount: number) => void; onContra: (amount: number) => void }) {
  const [side, setSide] = useState<Side>('tais')
  const [amount, setAmount] = useState(Math.max(event.minInvestment, Math.min(20_000, Math.min(event.maxInvestment, BALANCE))))
  const [myAllocation, setMyAllocation] = useState(0)
  const [myContra, setMyContra] = useState(0)
  const [watching, setWatching] = useState(false)
  const [showThesis, setShowThesis] = useState(false)
  const isFull = full(event)
  const remaining = Math.max(0, event.capacity - event.committed)
  const fillPct = Math.min(100, event.committed / event.capacity * 100)
  const maxAmount = Math.min(event.maxInvestment, BALANCE)
  const amountValid = amount >= event.minInvestment && amount <= maxAmount
  const canTais = !isFull && amountValid && remaining >= amount && event.secondsLeft > 0
  const canContra = amountValid && event.secondsLeft > 0
  const blocked = isFull && side === 'tais'
  const odds = Math.max(1.2, Math.min(5, 1 + (event.committed / Math.max(1, event.contraCapital)) * .45))
  const minutesToFull = event.velocityPerMinute > 0 ? remaining / event.velocityPerMinute : 0
  const quick = Array.from(new Set([event.minInvestment, 10_000, 25_000, maxAmount].filter((v) => v >= event.minInvestment && v <= maxAmount))).sort((a, b) => a - b)
  const short = event.taisPosition.startsWith('SHORT')
  const chart = chartMeta(event.asset, short)
  const coverData = cover(event.id)
  const reserve = () => {
    if (side === 'tais') {
      if (!canTais) return
      onInvest(amount)
      setMyAllocation((v) => v + amount)
    } else {
      if (!canContra) return
      onContra(amount)
      setMyContra((v) => v + amount)
    }
  }
  const steps = [
    { title: 'Сигнал TAIS', meta: 'Гипотеза сформирована и опубликована', state: 'done' },
    { title: 'Набор капитала', meta: isFull ? 'Объём распределён полностью' : `Распределено ${fillPct.toFixed(1)}% объёма`, state: isFull ? 'done' : 'active' },
    { title: 'Удержание позиции', meta: `Горизонт ${event.horizon}`, state: isFull ? 'active' : 'future' },
    { title: 'Закрытие и распределение', meta: 'Итог фиксируется по факту закрытия', state: 'future' },
  ]
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--trigonum-violet)]"><ArrowLeft size={16} />Все Events</button><button type="button" onClick={() => setWatching((v) => !v)} className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${watching ? 'border-[#d8ecdf] bg-[#eef7f1] text-[var(--trigonum-success)]' : 'border-[var(--trigonum-border)] bg-white text-[var(--trigonum-text)]'}`}>{watching ? '✓ Отслеживается' : 'Наблюдать'}</button></div>
      <div className="overflow-hidden rounded-[18px] border border-[var(--trigonum-border)] bg-white shadow-[0_8px_30px_rgb(8_27_58/8%)]">
        <div className="relative h-44 overflow-hidden" style={{ background: coverData.bg }}><div className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_88%_140%,rgb(255_255_255/10%)_0_1px,transparent_1px_30px)]" /><div className="absolute -right-10 -top-[70px] h-[260px] w-[260px] rounded-full opacity-55" style={{ background: `radial-gradient(circle, ${coverData.accent} 0%, transparent 68%)` }} /><p className="absolute -bottom-[26px] left-5 text-[128px] font-semibold tracking-[-.04em] text-white/10">{symbolFor(event.taisPosition, event.visual)}</p><div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgb(22_22_56/55%)_100%)]" /></div>
        <div className="bg-[linear-gradient(120deg,#161638_0%,var(--trigonum-ink)_46%,#3f3f8a_100%)] p-5 text-white">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_.62fr_.58fr] lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-[#cfe9ff]">{event.category}</span><span className="text-[10px] font-semibold text-white/60">{event.id}</span></div><h2 className="mt-2.5 text-2xl font-bold">{event.title}</h2><p className="mt-1 text-sm text-white/70">{event.shortIdea}</p></div><div className="lg:border-l lg:border-white/10 lg:pl-4"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-white/60">Позиция TAIS</p><p className="mt-1.5 text-[19px] font-bold text-[#92f222]">{event.taisPosition}</p><p className="mt-1 text-xs text-white/70">Цель +{event.targetLow}–{event.targetHigh}% · {event.horizon}</p></div><div className="lg:border-l lg:border-white/10 lg:pl-4 lg:text-right"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-white/60">До закрытия входа</p><p className="mt-1.5 text-2xl font-bold tabular-nums">{countdown(event.secondsLeft)}</p><span className={`mt-1.5 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${isFull ? 'bg-[var(--trigonum-violet)]/25 text-[#dcdcff]' : event.secondsLeft <= 900 ? 'bg-[#e5484d]/25 text-[#ffd7d7]' : 'bg-[#92f222]/20 text-[#e0ffb8]'}`}>{isFull ? 'Основной объём заполнен' : `${fillPct.toFixed(1)}% распределено`}</span></div></div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-[var(--trigonum-border)] md:grid-cols-4"><TopStat label="Объём Event" value={formatCurrency(event.capacity)} /><TopStat label={isFull ? 'Распределено' : 'Осталось'} value={isFull ? formatCurrency(event.committed) : formatCurrency(remaining)} accent={remaining / event.capacity <= .12 ? 'danger' : isFull ? 'violet' : undefined} /><TopStat label="Минимум" value={formatCurrency(event.minInvestment)} /><TopStat label="Инвесторов" value={`${event.participants}`} /></div>
      </div>
      <div className="rounded-[18px] border border-[var(--trigonum-border)] bg-white px-6 py-5 shadow-[0_8px_30px_rgb(8_27_58/8%)]"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Как проходит Event</p><div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">{steps.map((step, index) => { const done = step.state === 'done'; const active = step.state === 'active'; return <div key={step.title} className="relative pr-4"><div className={`absolute left-4 right-0 top-[15px] h-0.5 ${index === steps.length - 1 ? 'bg-transparent' : step.state === 'future' ? 'bg-[var(--trigonum-border)]' : 'bg-[var(--trigonum-violet)]'}`} /><div className={`relative grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-bold ${done ? 'border-[var(--trigonum-ink)] bg-[var(--trigonum-ink)] text-white' : active ? 'border-[var(--trigonum-violet)] bg-white text-[var(--trigonum-violet)]' : 'border-[var(--trigonum-border)] bg-[#f5f5fa] text-[#b0b0c8]'}`}>{index + 1}</div><p className={`mt-3 text-sm font-bold ${done ? 'text-[var(--trigonum-ink)]' : active ? 'text-[var(--trigonum-violet)]' : 'text-[#b0b0c8]'}`}>{step.title}</p><p className="mt-1 text-xs leading-[1.45] text-[var(--trigonum-muted)]">{step.meta}</p></div> })}</div></div>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_410px]">
        <div className="space-y-4">
          <Panel><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-violet)]">Суть Event</p><h3 className="mt-1.5 text-lg font-bold text-[var(--trigonum-ink)]">{event.driver}</h3></div><button type="button" onClick={() => setShowThesis((v) => !v)} className="rounded-lg border border-[var(--trigonum-border)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--trigonum-text)]">{showThesis ? 'Свернуть' : 'Почему TAIS?'}</button></div><p className="mt-2.5 text-sm text-[var(--trigonum-muted)]">{event.shortIdea}</p>{showThesis && <div className="mt-3 rounded-xl border border-[#d8ecdf] bg-[#eef7f1] px-4 py-3 text-sm leading-[1.55] text-[#1f5c36]">{event.thesis}</div>}</Panel>
          <Panel><div className="flex items-baseline justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Актив события</p><h3 className="mt-1.5 text-lg font-bold text-[var(--trigonum-ink)]">{chart.symbol}</h3></div><span className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${side === 'tais' ? 'bg-[#eef7f1] text-[var(--trigonum-success)]' : 'bg-[#f4e9ff] text-[#8321d6]'}`}>{event.taisPosition}</span></div><div className="mt-3.5"><EventMarketChart symbol={chart.symbol} tone={chart.tone} seed={event.id} height={280} /></div><p className="mt-2 text-[11px] text-[var(--trigonum-muted)]">График: Bybit market data · React/Recharts.</p></Panel>
          <Panel><div className="grid gap-3 sm:grid-cols-3"><MetricBox label="Риск" value={event.risk} hint={`Горизонт ${event.horizon}`} /><MetricBox label="Дефицит" value={`${event.scarcity}/100`} hint="Доступность основного allocation" danger={event.scarcity >= 90} /><MetricBox label="Капитал Trigonum" value={`${Math.round(event.trigonumCapital / event.capacity * 100)}%`} hint={`${formatCurrency(event.trigonumCapital)} внутри Event`} success /></div><div className="mt-3 rounded-xl border border-[var(--trigonum-border)] p-4"><div className="flex items-center gap-5"><div className="relative h-[108px] w-[108px] shrink-0"><GaugeRing fill={fillPct} trigonum={event.trigonumCapital / event.capacity * 100} /></div><div className="min-w-0 flex-1"><p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]"><Gauge size={14} />Набор капитала</p><p className="mt-2 text-xl font-bold tabular-nums text-[var(--trigonum-ink)]">{formatCurrency(event.committed)} из {formatCurrency(event.capacity)}</p><div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-[var(--trigonum-violet-soft)]"><div className="h-full rounded-full bg-[var(--trigonum-violet)]" style={{ width: `${fillPct}%` }} /></div><div className="mt-2.5 flex gap-4 text-[11px] text-[var(--trigonum-muted)]"><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[var(--trigonum-violet)]" />Капитал инвесторов</span><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#92f222]" />Доля Trigonum</span></div></div></div><div className="mt-3.5 grid grid-cols-3 gap-2"><MiniMetric label="Инвесторов" value={`${event.participants}`} /><MiniMetric label="Темп" value={event.velocityPerMinute > 0 ? `${formatCurrency(event.velocityPerMinute)}/мин` : 'Набор закрыт'} success={event.velocityPerMinute > 0} /><MiniMetric label="До заполнения" value={!isFull && event.velocityPerMinute > 0 ? `≈ ${Math.max(1, Math.ceil(minutesToFull))} мин` : 'Заполнен'} /></div></div></Panel>
        </div>
        <div className="xl:sticky xl:top-20">
          <div className="overflow-hidden rounded-[18px] border border-[var(--trigonum-border)] bg-white shadow-[0_8px_30px_rgb(8_27_58/8%)]">
            <div className="border-b border-[var(--trigonum-border)] p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><Wallet size={18} className={side === 'tais' ? 'text-[var(--trigonum-success)]' : 'text-[#8321d6]'} /><div><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Действие</p><h3 className="mt-1 text-base font-bold text-[var(--trigonum-ink)]">{blocked ? 'Event заполнен' : side === 'tais' ? 'Инвестировать в Event' : 'Ставка против TAIS'}</h3></div></div><span className="text-xs font-bold tabular-nums text-[var(--trigonum-muted)]">{countdown(event.secondsLeft)}</span></div><div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-[#f5f5fa] p-1.5"><SideButton active={side === 'tais'} title="С TAIS" position={event.taisPosition} tone="green" onClick={() => setSide('tais')} /><SideButton active={side === 'contra'} title="Обратная" position={event.counterPosition} tone="violet" onClick={() => setSide('contra')} /></div></div>
            <div className="p-4">{blocked ? <div className="space-y-3"><div className="rounded-xl border border-[#cdcdf0] bg-[var(--trigonum-violet-soft)] p-4"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-violet)]">Основной Event заполнен</p><p className="mt-2 text-[17px] font-bold text-[var(--trigonum-ink)]">Новые вложения больше не принимаются</p><p className="mt-2 text-sm leading-[1.45] text-[var(--trigonum-text)]">Капитал участников уже зафиксирован в Event до его завершения.</p></div><button type="button" onClick={() => setSide('contra')} className="w-full rounded-xl border border-[#e5cdf7] bg-[#f4e9ff] px-4 py-3 text-sm font-bold text-[#8321d6]">Рассмотреть ставку против TAIS</button></div> : <div className="space-y-4"><div><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Выбранная позиция</p><div className="mt-1.5 flex items-center justify-between"><p className={`text-[22px] font-bold ${side === 'tais' ? 'text-[var(--trigonum-success)]' : 'text-[#8321d6]'}`}>{side === 'tais' ? event.taisPosition : event.counterPosition}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${side === 'tais' ? 'bg-[#eef7f1] text-[var(--trigonum-success)]' : 'bg-[#f4e9ff] text-[#8321d6]'}`}>{side === 'tais' ? 'TAIS' : 'Обратная'}</span></div></div><AmountPicker amount={amount} setAmount={setAmount} min={event.minInvestment} max={maxAmount} quick={quick} />{side === 'tais' ? <div className="rounded-xl border border-[var(--trigonum-border)] p-3.5"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Сценарии на горизонте Event</p><Scenario label={`Осторожный · +${event.targetLow}%`} value={`+${formatCurrency(amount * event.targetLow / 100)}`} width={event.targetLow / event.targetHigh * 100} fill="linear-gradient(90deg,var(--trigonum-violet),var(--trigonum-violet))" color="var(--trigonum-violet)" /><Scenario label={`Целевой · +${event.targetHigh}%`} value={`+${formatCurrency(amount * event.targetHigh / 100)}`} width={100} fill="linear-gradient(90deg,#12ccff,#92f222)" color="var(--trigonum-success)" /></div> : <div className="space-y-2"><div className="rounded-xl border border-[#e5cdf7] bg-[#f4e9ff] p-3"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#8321d6]">Ставка против гипотезы TAIS</p><p className="mt-1.5 text-sm font-bold text-[var(--trigonum-ink)]">TAIS не достигнет +{event.targetLow}% в горизонте {event.horizon}</p><p className="mt-1.5 text-xs leading-[1.45] text-[#8321d6]">Если нижняя граница цели TAIS не выполнена к завершению Event, ставка выигрывает.</p></div><div className="grid grid-cols-3 gap-2"><MiniMetric label="Коэффициент" value={`×${odds.toFixed(2)}`} violet /><MiniMetric label="Выплата" value={formatCurrency(amount * odds)} success /><MiniMetric label="Прибыль" value={`+${formatCurrency(amount * (odds - 1))}`} success /></div></div>}<button type="button" onClick={reserve} disabled={side === 'tais' ? !canTais : !canContra} className={`w-full rounded-xl px-4 py-3.5 text-sm font-bold text-white disabled:opacity-40 ${side === 'tais' ? 'bg-[var(--trigonum-success)]' : 'bg-[#8321d6]'}`}>{side === 'tais' ? (remaining < amount ? 'Такой объём уже недоступен' : `Открыть ${event.taisPosition}`) : 'Поставить на неуспех TAIS'}</button></div>}{(myAllocation > 0 || myContra > 0) && <div className="mt-4 border-t border-[var(--trigonum-border)] pt-4"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Ваши позиции</p><div className="mt-2 space-y-2">{myAllocation > 0 && <PositionRow label={event.taisPosition} amount={myAllocation} tone="green" />}{myContra > 0 && <PositionRow label={event.counterPosition} amount={myContra} tone="violet" />}</div><p className="mt-2.5 text-[11px] text-[var(--trigonum-muted)]">Капитал зафиксирован до завершения Event</p></div>}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[18px] border border-[var(--trigonum-border)] bg-white p-5 shadow-[0_8px_30px_rgb(8_27_58/8%)]">{children}</div>
}

function TopStat({ label, value, accent }: { label: string; value: string; accent?: 'danger' | 'violet' }) {
  return <div className="p-3.5"><p className="text-[10px] font-semibold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{label}</p><p className={`mt-1 text-base font-bold tabular-nums ${accent === 'danger' ? 'text-[var(--trigonum-danger)]' : accent === 'violet' ? 'text-[var(--trigonum-violet)]' : 'text-[var(--trigonum-ink)]'}`}>{value}</p></div>
}

function MetricBox({ label, value, hint, danger, success }: { label: string; value: string; hint: string; danger?: boolean; success?: boolean }) {
  return <div className="rounded-xl bg-[#f5f5fa] p-3"><p className="text-[10px] font-semibold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{label}</p><p className={`mt-1 text-base font-bold ${danger ? 'text-[var(--trigonum-danger)]' : success ? 'text-[var(--trigonum-success)]' : 'text-[var(--trigonum-ink)]'}`}>{value}</p><p className="mt-2 text-xs text-[var(--trigonum-muted)]">{hint}</p></div>
}

function GaugeRing({ fill, trigonum }: { fill: number; trigonum: number }) {
  const c1 = 2 * Math.PI * 45
  const c2 = 2 * Math.PI * 31
  return <><svg viewBox="0 0 108 108" className="h-full w-full -rotate-90"><circle cx="54" cy="54" r="45" fill="none" stroke="var(--trigonum-violet-soft)" strokeWidth="11" /><circle cx="54" cy="54" r="45" fill="none" stroke="var(--trigonum-violet)" strokeWidth="11" strokeLinecap="round" strokeDasharray={`${fill / 100 * c1} ${c1}`} /><circle cx="54" cy="54" r="31" fill="none" stroke="#92f222" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${trigonum / 100 * c2} ${c2}`} /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-xl font-bold tabular-nums text-[var(--trigonum-ink)]">{fill.toFixed(1)}%</span><span className="mt-0.5 text-[9px] font-bold uppercase tracking-[.1em] text-[var(--trigonum-muted)]">набрано</span></div></>
}

function MiniMetric({ label, value, success, violet }: { label: string; value: string; success?: boolean; violet?: boolean }) {
  return <div className={`rounded-lg p-2.5 ${violet ? 'border border-[#e5cdf7] bg-[#f4e9ff]' : 'bg-[#f5f5fa]'}`}><p className="text-[10px] font-semibold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{label}</p><p className={`mt-1 text-[15px] font-bold tabular-nums ${success ? 'text-[var(--trigonum-success)]' : violet ? 'text-[#8321d6]' : 'text-[var(--trigonum-ink)]'}`}>{value}</p></div>
}

function SideButton({ active, title, position, tone, onClick }: { active: boolean; title: string; position: string; tone: 'green' | 'violet'; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-lg border px-3 py-2.5 text-left ${active ? tone === 'green' ? 'border-[#a9dcb9] bg-white' : 'border-[#e5cdf7] bg-white' : 'border-transparent bg-transparent'}`}><span className={`block text-[10px] font-bold uppercase tracking-[.08em] ${tone === 'green' ? 'text-[var(--trigonum-success)]' : 'text-[#8321d6]'}`}>{title}</span><span className="mt-0.5 block text-[13px] font-bold text-[var(--trigonum-ink)]">{position}</span></button>
}

function AmountPicker({ amount, setAmount, min, max, quick }: { amount: number; setAmount: (value: number) => void; min: number; max: number; quick: number[] }) {
  return <div className="space-y-3"><div className="flex items-end gap-3"><label className="min-w-0 flex-1"><span className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Сумма</span><span className="mt-1 flex items-center rounded-xl border border-[var(--trigonum-border)] bg-white px-3"><span className="text-sm font-bold text-[var(--trigonum-muted)]">$</span><input type="number" min={min} max={max} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full bg-transparent px-2 py-2.5 text-xl font-bold text-[var(--trigonum-ink)] outline-none" /></span></label><div className="shrink-0 pb-0.5 text-right"><p className="text-[10px] uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Доступно</p><p className="mt-1 text-sm font-bold text-[var(--trigonum-ink)]">{formatCurrency(BALANCE)}</p></div></div><input type="range" min={min} max={max} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full accent-[var(--trigonum-violet)]" /><div className="flex flex-wrap gap-1.5">{quick.map((value) => <button key={value} type="button" onClick={() => setAmount(value)} className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold ${amount === value ? 'border-[var(--trigonum-violet)] bg-[var(--trigonum-violet-soft)] text-[var(--trigonum-violet)]' : 'border-[var(--trigonum-border)] bg-white text-[var(--trigonum-text)]'}`}>{value === max ? 'MAX' : formatCurrency(value)}</button>)}</div></div>
}

function Scenario({ label, value, width, fill, color }: { label: string; value: string; width: number; fill: string; color: string }) {
  return <div className="mt-2.5"><div className="flex items-baseline justify-between"><span className="text-xs text-[var(--trigonum-muted)]">{label}</span><span className="text-[13px] font-bold tabular-nums" style={{ color }}>{value}</span></div><div className="mt-1 h-2 rounded-full bg-[var(--trigonum-border)]"><div className="h-full rounded-full" style={{ width: `${width}%`, background: fill }} /></div></div>
}

function PositionRow({ label, amount, tone }: { label: string; amount: number; tone: 'green' | 'violet' }) {
  return <div className={`flex items-center justify-between rounded-xl border px-3 py-2 ${tone === 'green' ? 'border-[#d8ecdf] bg-[#eef7f1]' : 'border-[#e5cdf7] bg-[#f4e9ff]'}`}><span className={`text-xs font-bold ${tone === 'green' ? 'text-[var(--trigonum-success)]' : 'text-[#8321d6]'}`}>{label}</span><b className="text-sm tabular-nums text-[var(--trigonum-ink)]">{formatCurrency(amount)}</b></div>
}

function SeasonView({ onOpen }: { onOpen: (event: PastEvent) => void }) {
  const capital = pastEvents.reduce((sum, event) => sum + event.invested, 0)
  const pnl = pastEvents.reduce((sum, event) => sum + event.totalPnl, 0)
  const profitable = pastEvents.filter((event) => event.totalPnl > 0).length
  return <div className="space-y-5"><div className="overflow-hidden rounded-[18px] border border-[var(--trigonum-border)] shadow-[0_8px_30px_rgb(8_27_58/8%)]"><div className="bg-[linear-gradient(120deg,#161638,var(--trigonum-ink)_52%,#3f3f8a)] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#92f222]">Архив TAIS Events</p><h2 className="mt-2 text-[28px] font-bold">Сезон IV · III квартал 2026</h2><p className="mt-2 max-w-[720px] text-sm leading-[1.5] text-white/75">Завершённые возможности: как быстро распределялся капитал, сколько инвесторов участвовало и каким был итог.</p></div></div><div className="grid gap-3 sm:grid-cols-3"><SummaryCard label="Распределено капитала" value={formatCurrency(capital)} /><SummaryCard label="Итог инвесторов" value={`+${formatCurrency(pnl)}`} success /><SummaryCard label="Прибыльных Event" value={`${profitable} из ${pastEvents.length}`} /></div><div className="grid gap-4 xl:grid-cols-2">{pastEvents.map((event) => <PastCard key={event.id} event={event} onOpen={() => onOpen(event)} />)}</div></div>
}

function SummaryCard({ label, value, success }: { label: string; value: string; success?: boolean }) {
  return <div className={`rounded-xl border p-3.5 ${success ? 'border-[#d8ecdf] bg-[#eef7f1]' : 'border-[var(--trigonum-border)] bg-white'}`}><p className="text-[11px] font-semibold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{label}</p><p className={`mt-1.5 text-xl font-bold tabular-nums ${success ? 'text-[var(--trigonum-success)]' : 'text-[var(--trigonum-ink)]'}`}>{value}</p></div>
}

function PastCard({ event, onOpen }: { event: PastEvent; onOpen: () => void }) {
  const c = cover(event.id)
  const short = event.position.startsWith('SHORT')
  return <button type="button" onClick={onOpen} className="block w-full overflow-hidden rounded-[18px] border border-[var(--trigonum-border)] bg-white p-0 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgb(8_27_58/10%)]"><div className="relative h-28 overflow-hidden" style={{ background: c.bg }}><div className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_86%_140%,rgb(255_255_255/9%)_0_1px,transparent_1px_26px)]" /><div className="absolute -right-[26px] -top-[54px] h-[190px] w-[190px] rounded-full opacity-50" style={{ background: `radial-gradient(circle, ${c.accent} 0%, transparent 68%)` }} /><p className="absolute -bottom-3.5 left-4 text-[76px] font-semibold tracking-[-.04em] text-white/10">{symbolFor(event.position)}</p><div className="absolute inset-0 flex items-start justify-between p-[14px_18px] text-white"><span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em]">{event.category}</span><span className="text-[11px] font-semibold text-white/80">{event.closedDate}</span></div></div><div className="p-[18px]"><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-bold text-[var(--trigonum-ink)]">{event.title}</h3><p className="mt-1 text-sm text-[var(--trigonum-muted)]">{event.shortIdea}</p></div><span className={`shrink-0 rounded-xl px-3 py-2 text-[13px] font-bold ${short ? 'bg-[#fdecec] text-[var(--trigonum-danger)]' : 'bg-[#eef7f1] text-[var(--trigonum-success)]'}`}>{event.position}</span></div><div className="mt-4 grid grid-cols-4 gap-2"><MetricCell label="Результат" value={`${event.result > 0 ? '+' : ''}${event.result}%`} good={event.result >= 0} /><MetricCell label="Капитал" value={formatCurrency(event.invested)} /><MetricCell label="Инвесторов" value={`${event.investors}`} /><MetricCell label="Заполнен за" value={event.fillTime} /></div><div className="mt-4 flex items-center justify-between border-t border-[var(--trigonum-border)] pt-3.5"><div><p className="text-[10px] uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Итог инвесторов</p><p className={`mt-1 text-[17px] font-bold tabular-nums ${event.totalPnl >= 0 ? 'text-[var(--trigonum-success)]' : 'text-[var(--trigonum-danger)]'}`}>{event.totalPnl > 0 ? '+' : ''}{formatCurrency(event.totalPnl)}</p></div><span className="rounded-lg bg-[#f5f5fa] px-2.5 py-1.5 text-xs font-semibold text-[var(--trigonum-muted)]">Длительность {event.activeDuration}</span></div></div></button>
}

function MetricCell({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return <div className="rounded-xl bg-[#f5f5fa] p-3"><p className="text-[10px] uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{label}</p><p className={`mt-1 text-sm font-bold tabular-nums ${good === true ? 'text-[var(--trigonum-success)]' : good === false ? 'text-[var(--trigonum-danger)]' : 'text-[var(--trigonum-ink)]'}`}>{value}</p></div>
}

function LedgerView({ onOpen }: { onOpen: (event: PastEvent, reference: number) => void }) {
  const rows = ledgerRefs.map((ref) => { const event = pastEvents.find((item) => item.id === ref.eventId)!; return { ref, event, value: ref.reference * event.result / 100 } })
  const maxAbs = Math.max(...rows.map((row) => Math.abs(row.value)))
  return <div className="grid items-start gap-5 lg:grid-cols-2"><Panel><h2 className="text-[15px] font-semibold text-[var(--trigonum-ink)]">Упущенные возможности</h2><p className="mt-1 text-xs text-[var(--trigonum-muted)]">Нажмите на строку — откроются детали закрытого Event</p><div className="mt-4 space-y-2.5">{rows.map(({ ref, event, value }) => { const w = Math.abs(value) / maxAbs * 50; return <button key={event.id} type="button" onClick={() => onOpen(event, ref.reference)} className="grid w-full grid-cols-[62px_1fr_128px] items-center gap-3 rounded-xl border border-transparent px-2 py-1.5 text-left hover:border-[var(--trigonum-border)] hover:bg-[var(--trigonum-bg)]"><b className="text-sm text-[var(--trigonum-ink)]">#{event.id.slice(-3)}</b><div className="relative h-[30px] min-w-[140px] rounded-lg bg-[var(--trigonum-bg)]"><div className="absolute bottom-0 left-1/2 top-0 w-px bg-[#d3d3e6]" /><div className="absolute top-[9px] h-3 rounded-full" style={{ background: value >= 0 ? 'var(--trigonum-violet)' : '#e5484d', left: value >= 0 ? '50%' : `${50 - w}%`, width: `${w}%` }} /></div><div className="text-right"><p className={`text-[15px] font-bold tabular-nums ${value >= 0 ? 'text-[var(--trigonum-success)]' : 'text-[var(--trigonum-danger)]'}`}>{value > 0 ? '+' : ''}{formatCurrency(value)}</p><p className="mt-0.5 text-[11px] text-[var(--trigonum-muted)]">{event.result > 0 ? '+' : ''}{event.result}% · из {formatCurrency(ref.reference)}</p></div></button> })}</div></Panel><Panel><h2 className="text-[15px] font-semibold text-[var(--trigonum-ink)]">Как читать эту таблицу</h2><p className="mt-2.5 text-sm leading-[1.55] text-[var(--trigonum-muted)]">Условный расчёт: результат завершённого Event, применённый к сумме, которую вы могли бы вложить. Это не доход и не обязательство — только историческая иллюстрация.</p></Panel></div>
}

function HallView() {
  const ordered = [podiumData[1], podiumData[0], podiumData[2]]
  const max = podiumData[0].amount
  const heights: Record<number, number> = { 1: 168, 2: 124, 3: 96 }
  const backgrounds: Record<number, string> = { 1: 'linear-gradient(160deg,var(--trigonum-violet),var(--trigonum-ink))', 2: 'linear-gradient(160deg,#3f3f8a,var(--trigonum-ink))', 3: 'linear-gradient(160deg,var(--trigonum-ink),#161638)' }
  return <div className="space-y-5"><div className="overflow-hidden rounded-[18px] shadow-[0_8px_30px_rgb(8_27_58/8%)]"><div className="bg-[linear-gradient(120deg,#161638,#3f3f8a_55%,#8321d6)] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#e5cdf7]">Анонимный зал результатов</p><h2 className="mt-2 text-[28px] font-bold">Рекорды Events</h2></div></div><Panel><div className="flex items-baseline justify-between"><h2 className="text-[15px] font-semibold text-[var(--trigonum-ink)]">Топ-3 по доходу инвесторов</h2><span className="rounded-full bg-[var(--trigonum-violet-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--trigonum-violet)]">Сезон IV</span></div><div className="mt-5 grid grid-cols-3 items-end gap-4">{ordered.map((item) => <div key={item.rank}><p className="text-center text-[11px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{item.alias}</p><p className="mt-1.5 text-center text-[26px] font-semibold tracking-[-.03em] text-[var(--trigonum-success)]">+{formatCurrency(item.amount)}</p><p className="mb-3 mt-1 text-center text-xs text-[var(--trigonum-muted)]">{item.meta}</p><div className="relative overflow-hidden rounded-t-xl" style={{ height: heights[item.rank], background: backgrounds[item.rank] }}><div className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_50%_160%,rgb(255_255_255/10%)_0_1px,transparent_1px_22px)]" /><p className="absolute inset-x-0 top-3.5 text-center text-[11px] font-bold text-white/75">{item.rank === 1 ? 'Лидер сезона' : `${Math.round(item.amount / max * 100)}% от лидера`}</p><p className="absolute inset-x-0 bottom-3 text-center text-[34px] font-semibold text-white/60">{item.rank}</p></div></div>)}</div><div className="h-1.5 bg-[var(--trigonum-ink)]" /></Panel><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{hallData.map((item) => <Panel key={item.label}><p className="text-[11px] font-semibold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{item.label}</p><p className="mt-3.5 text-[30px] font-semibold tracking-[-.03em] tabular-nums text-[var(--trigonum-ink)]">{item.value}</p><p className="mt-2 text-xs text-[var(--trigonum-muted)]">{item.meta}</p></Panel>)}</div></div>
}

function HistoryView({ onOpen }: { onOpen: (event: PastEvent, mine: { invested: number; season: string }) => void }) {
  const rows = proofRefs.map((ref) => { const event = pastEvents.find((item) => item.id === ref.eventId)!; return { event, ...ref, earned: ref.invested * event.result / 100 } })
  const invested = rows.reduce((sum, row) => sum + row.invested, 0)
  const earned = rows.reduce((sum, row) => sum + row.earned, 0)
  const wins = rows.filter((row) => row.event.result > 0).length
  const best = rows.reduce((a, b) => b.earned > a.earned ? b : a, rows[0])
  const stats = [
    ['Участий в Events', `${rows.length}`], ['Винрейт', `${Math.round(wins / rows.length * 100)}%`], ['Вложено всего', formatCurrency(invested)], ['Заработано', `${earned > 0 ? '+' : ''}${formatCurrency(earned)}`], ['Средний результат', `${earned / invested > 0 ? '+' : ''}${(earned / invested * 100).toFixed(1)}%`], ['Лучший Event', `+${formatCurrency(best.earned)}`],
  ]
  return <div className="space-y-5"><Panel><h2 className="text-[19px] font-bold text-[var(--trigonum-ink)]">История участия</h2><p className="mt-1.5 text-sm text-[var(--trigonum-muted)]">Events, в которых вы участвовали. Нажмите на карточку — откроются детали события.</p><div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-border)] md:grid-cols-3 xl:grid-cols-6">{stats.map(([label, value]) => <div key={label} className="bg-white p-3.5"><p className="text-[10px] font-semibold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{label}</p><p className={`mt-1.5 text-lg font-bold tabular-nums ${label === 'Заработано' || label === 'Лучший Event' ? 'text-[var(--trigonum-success)]' : 'text-[var(--trigonum-ink)]'}`}>{value}</p></div>)}</div></Panel><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map((row) => { const c = cover(row.event.id); return <button key={row.event.id} type="button" onClick={() => onOpen(row.event, { invested: row.invested, season: row.season })} className="block w-full overflow-hidden rounded-[18px] border border-[var(--trigonum-border)] bg-white p-0 text-left shadow-[0_8px_30px_rgb(8_27_58/8%)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgb(8_27_58/12%)]"><div className="relative h-[104px] overflow-hidden" style={{ background: c.bg }}><div className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_86%_140%,rgb(255_255_255/9%)_0_1px,transparent_1px_24px)]" /><div className="absolute -right-6 -top-[50px] h-[170px] w-[170px] rounded-full opacity-50" style={{ background: `radial-gradient(circle, ${c.accent} 0%, transparent 68%)` }} /><p className="absolute -bottom-3 left-3.5 text-[68px] font-semibold text-white/10">{symbolFor(row.event.position)}</p><div className="absolute inset-0 flex items-start justify-between p-3.5 text-white"><span className="text-[11px] font-bold uppercase tracking-[.08em]">{row.season}</span><span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold">Участие</span></div></div><div className="p-4"><div className="flex items-baseline justify-between"><p className={`text-2xl font-bold tabular-nums ${row.earned >= 0 ? 'text-[var(--trigonum-success)]' : 'text-[var(--trigonum-danger)]'}`}>{row.earned > 0 ? '+' : ''}{formatCurrency(row.earned)}</p><p className={`text-sm font-bold ${row.event.result >= 0 ? 'text-[var(--trigonum-success)]' : 'text-[var(--trigonum-danger)]'}`}>{row.event.result > 0 ? '+' : ''}{row.event.result}%</p></div><p className="mt-1.5 text-[13px] font-semibold text-[var(--trigonum-ink)]">{row.event.position}</p><div className="mt-3 flex items-baseline justify-between border-t border-[var(--trigonum-border)] pt-3 text-xs text-[var(--trigonum-muted)]"><span>Вложено {formatCurrency(row.invested)}</span><span>Event #{row.event.id.slice(-3)}</span></div></div></button> })}</div></div>
}

function ArchiveModal({ event, reference, mine, onClose }: { event: PastEvent; reference?: number; mine?: { invested: number; season: string }; onClose: () => void }) {
  const chart = chartMeta(event.position, event.position.startsWith('SHORT'))
  const windowData = eventWindows[event.id]
  const end = windowData ? Math.floor(new Date(`${windowData.closed}T18:00:00Z`).getTime() / 1000) : 0
  const start = windowData ? Math.round(end - windowData.days * 86400) : 0
  const hypothetical = reference ? reference * event.result / 100 : 0
  const mineEarned = mine ? mine.invested * event.result / 100 : 0
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgb(8_27_58/45%)] p-8 backdrop-blur-[2px]" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}><div className="max-h-[88vh] w-full max-w-[760px] overflow-auto rounded-[18px] bg-white shadow-[0_25px_50px_-12px_rgb(8_27_58/40%)]"><div className="relative overflow-hidden bg-[linear-gradient(160deg,var(--trigonum-ink)_0%,#161638_100%)] px-6 py-5 text-white"><div className="absolute -right-[60px] -top-20 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgb(117_117_255/40%)_0%,transparent_66%)]" /><p className="absolute -bottom-[34px] right-5 text-[108px] font-semibold text-white/[.07]">{symbolFor(event.position)}</p><div className="relative flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-white/80">{event.category}</span><span className="text-[11px] font-bold uppercase tracking-[.12em] text-[var(--trigonum-violet)]">{reference ? `Упущенная возможность #${event.id.slice(-3)} · ${event.id}` : mine ? `Ваше участие · ${event.id}` : `Архив · ${event.id}`}</span></div><h2 className="mt-3 text-2xl font-bold">{event.title}</h2><p className="mt-1.5 text-[13px] text-white/70">{event.position} · завершён {event.closedDate}</p></div><button type="button" onClick={onClose} className="rounded-lg border border-white/25 bg-transparent p-2 text-white"><X size={16} /></button></div></div><div className="p-5"><div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-border)] md:grid-cols-4"><ModalMetric label="Результат Event" value={`${event.result > 0 ? '+' : ''}${event.result}%`} color={event.result >= 0 ? 'var(--trigonum-success)' : 'var(--trigonum-danger)'} /><ModalMetric label="Итог инвесторов" value={`${event.totalPnl > 0 ? '+' : ''}${formatCurrency(event.totalPnl)}`} /><ModalMetric label="Заполнен за" value={event.fillTime} /><ModalMetric label={reference ? 'Ваш условный итог' : mine ? 'Ваш результат' : 'Инвесторов'} value={reference ? `${hypothetical > 0 ? '+' : ''}${formatCurrency(hypothetical)}` : mine ? `${mineEarned > 0 ? '+' : ''}${formatCurrency(mineEarned)}` : `${event.investors}`} color={reference ? hypothetical >= 0 ? 'var(--trigonum-success)' : 'var(--trigonum-danger)' : mine ? mineEarned >= 0 ? 'var(--trigonum-success)' : 'var(--trigonum-danger)' : undefined} /></div><div className="mt-4 rounded-xl border border-[var(--trigonum-border)] p-3.5"><EventMarketChart symbol={chart.symbol} tone={chart.tone} seed={event.id} height={200} interval="240" limit={600} eventStart={start} eventEnd={end} /><p className="mt-2 text-[11px] text-[var(--trigonum-muted)]">Период Event на графике выделен фоном.</p></div><div className="mt-4 grid gap-3 md:grid-cols-2"><div className="rounded-xl border border-[var(--trigonum-border)] p-4"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Исполнение</p><div className="mt-3 space-y-2 text-sm"><Row label="Инвесторов" value={`${event.investors}`} /><Row label="Заполнение" value={event.fillTime} /><Row label="Длительность" value={event.activeDuration} /></div></div>{event.totalPnl > 0 && event.bestPnl > 0 ? <div className="rounded-xl border border-[var(--trigonum-border)] p-4"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Топ-3 инвесторов Event</p><div className="mt-4 grid grid-cols-3 items-end gap-2">{[.74,1,.51].map((k, index) => <div key={k}><p className="text-center text-sm font-bold text-[var(--trigonum-success)]">+{formatCurrency(Math.round(event.bestPnl * k))}</p><p className="my-1.5 text-center text-[10px] text-[var(--trigonum-muted)]">{index === 1 ? `Участник ${event.bestAlias}` : `Участник #${event.id.slice(-3)}${index === 0 ? 'B' : 'C'}`}</p><div className="relative rounded-t-lg bg-[linear-gradient(160deg,var(--trigonum-violet),var(--trigonum-ink))]" style={{ height: index === 1 ? 118 : index === 0 ? 84 : 64 }}><p className="absolute inset-x-0 bottom-2 text-center text-xl font-semibold text-white/60">{index === 1 ? 1 : index === 0 ? 2 : 3}</p></div></div>)}</div><div className="h-1 bg-[var(--trigonum-ink)]" /></div> : <div className="rounded-xl border border-[#f6cdcd] bg-[#fdecec] p-4"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-danger)]">Итог Event</p><p className="mt-2 text-[19px] font-bold text-[var(--trigonum-danger)]">{formatCurrency(event.totalPnl)} · {event.result}%</p><p className="mt-2 text-xs leading-[1.45] text-[#8f2b2e]">Гипотеза TAIS не подтвердилась, прибыли по этому Event не было.</p></div>}</div><div className="mt-3 rounded-xl border border-[var(--trigonum-border)] p-4"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Как проходил Event</p>{event.timeline.map((item, index) => <div key={`${item.time}-${index}`} className="grid grid-cols-[66px_26px_1fr] gap-3"><span className="pt-1 text-xs font-bold tabular-nums text-[var(--trigonum-muted)]">{item.time}</span><div className="relative flex justify-center"><span className="relative z-10 grid h-[26px] w-[26px] place-items-center rounded-full border-2 border-[var(--trigonum-violet)] bg-[var(--trigonum-violet-soft)] text-[11px] font-bold text-[var(--trigonum-violet)]">{index + 1}</span>{index < event.timeline.length - 1 && <span className="absolute bottom-[-6px] top-[26px] w-0.5 bg-[var(--trigonum-border)]" />}</div><div className="pb-4 pt-0.5"><p className="text-sm font-semibold text-[var(--trigonum-ink)]">{item.label}</p><p className="mt-1 text-xs leading-[1.5] text-[var(--trigonum-muted)]">{item.detail}</p></div></div>)}</div>{reference && <p className="mt-3 text-xs leading-[1.5] text-[var(--trigonum-muted)]">Условный итог рассчитан от суммы {formatCurrency(reference)} по фактическому результату Event {event.result > 0 ? '+' : ''}{event.result}%. Это историческая иллюстрация, а не доход.</p>}{mine && <p className="mt-3 text-xs text-[var(--trigonum-muted)]">Ваше участие: Event #{event.id.slice(-3)}, {mine.season}.</p>}</div></div></div>
}

function ModalMetric({ label, value, color }: { label: string; value: string; color?: string }) {
  return <div className="bg-white p-3.5"><p className="text-[10px] font-semibold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{label}</p><p className="mt-1.5 text-[17px] font-bold tabular-nums" style={{ color: color ?? 'var(--trigonum-ink)' }}>{value}</p></div>
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span>{label}</span><b className="text-[var(--trigonum-ink)]">{value}</b></div>
}

export function EventsV2() {
  const [view, setView] = useState<MainView>('events')
  const [events, setEvents] = useState(liveEvents)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [archive, setArchive] = useState<{ event: PastEvent; reference?: number; mine?: { invested: number; season: string } } | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setEvents((current) => current.map((event) => {
        const secondsLeft = Math.max(0, event.secondsLeft - 1)
        if (!event.liveCapital || full(event) || secondsLeft <= 0) return { ...event, secondsLeft }
        const inflow = event.velocityPerMinute / 60 * event.flowMultiplier
        const committed = Math.min(event.capacity, event.committed + inflow)
        const crossed = Math.floor(committed / 5000) > Math.floor(event.committed / 5000)
        return { ...event, secondsLeft, committed, participants: event.participants + (crossed ? 1 : 0) }
      }))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const selected = selectedId ? events.find((event) => event.id === selectedId) ?? null : null
  const mutate = (id: string, update: (event: LiveEvent) => LiveEvent) => setEvents((current) => current.map((event) => event.id === id ? update(event) : event))

  return (
    <div className="pb-10">
      <EventsHero events={events} />
      <ViewTabs view={view} onChange={(next) => { setView(next); setSelectedId(null) }} />
      {view === 'events' && (selected ? <EventDetail event={selected} onBack={() => setSelectedId(null)} onInvest={(amount) => mutate(selected.id, (event) => ({ ...event, committed: Math.min(event.capacity, event.committed + amount), participants: event.participants + 1 }))} onContra={(amount) => mutate(selected.id, (event) => ({ ...event, contraCapital: event.contraCapital + amount }))} /> : <Gallery events={events} onSelect={setSelectedId} />)}
      {view === 'season' && <SeasonView onOpen={(event) => setArchive({ event })} />}
      {view === 'ledger' && <LedgerView onOpen={(event, reference) => setArchive({ event, reference })} />}
      {view === 'hall' && <HallView />}
      {view === 'collection' && <HistoryView onOpen={(event, mine) => setArchive({ event, mine })} />}
      {archive && <ArchiveModal {...archive} onClose={() => setArchive(null)} />}
    </div>
  )
}
