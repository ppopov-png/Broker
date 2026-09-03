import {
  Activity,
  ArrowLeft,
  BadgeCheck,
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

type EventTimelineStep = {
  label: string
  time: string
  detail: string
}

interface LiveEvent {
  id: string
  title: string
  category: string
  asset: string
  shortIdea: string
  driver: string
  thesis: string
  taisPosition: string
  counterPosition: string
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
  visual: 'btc' | 'eth' | 'basket' | 'relative'
  queueRequests?: number
  queueCapital?: number
}

interface PastEvent {
  id: string
  title: string
  category: string
  asset: string
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
  queueUsed: boolean
  peakQueue: number
  queueCapital: number
  maxDrawdown: number
  closedDate: string
  timeline: EventTimelineStep[]
}

const AVAILABLE_BALANCE = 50_000

const initialLiveEvents: LiveEvent[] = [
  {
    id: 'EV-ETF-061',
    title: 'ETF-притоки в Bitcoin',
    category: 'Институциональные потоки',
    asset: 'BTC',
    shortIdea: 'Притоки в spot Bitcoin ETF ускоряются',
    driver: 'Ускорение чистых притоков капитала в spot Bitcoin ETF',
    thesis: 'TAIS ожидает, что устойчивый институциональный спрос поддержит рост Bitcoin в пределах горизонта Event.',
    taisPosition: 'LONG BTC',
    counterPosition: 'SHORT BTC',
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
    visual: 'btc',
  },
  {
    id: 'EV-DER-044',
    title: 'Перекос деривативов BTC',
    category: 'Деривативы',
    asset: 'BTC',
    shortIdea: 'Рынок перегружен длинными позициями',
    driver: 'Экстремальное позиционирование участников на рынке деривативов',
    thesis: 'TAIS ожидает коррекцию перегруженного позиционирования и снижение Bitcoin.',
    taisPosition: 'SHORT BTC',
    counterPosition: 'LONG BTC',
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
    visual: 'btc',
    queueRequests: 14,
    queueCapital: 118_000,
  },
  {
    id: 'EV-STB-028',
    title: 'Рост stablecoin-ликвидности',
    category: 'Ликвидность',
    asset: 'BTC + ETH',
    shortIdea: 'Свободная ликвидность крипторынка расширяется',
    driver: 'Расширение доступной stablecoin-ликвидности внутри крипторынка',
    thesis: 'TAIS ожидает, что рост свободной ликвидности усилит спрос на крупнейшие цифровые активы.',
    taisPosition: 'LONG BTC + ETH',
    counterPosition: 'SHORT BTC + ETH',
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
    visual: 'basket',
  },
  {
    id: 'EV-ROT-019',
    title: 'Ротация капитала BTC → ETH',
    category: 'Ротация капитала',
    asset: 'ETH / BTC',
    shortIdea: 'Потоки капитала смещаются в сторону Ethereum',
    driver: 'Изменение относительных потоков капитала между Bitcoin и Ethereum',
    thesis: 'TAIS ожидает относительное усиление Ethereum по отношению к Bitcoin.',
    taisPosition: 'LONG ETH / SHORT BTC',
    counterPosition: 'SHORT ETH / LONG BTC',
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
    visual: 'relative',
  },
  {
    id: 'EV-ETH-035',
    title: 'Институциональный спрос на ETH',
    category: 'Институциональные потоки',
    asset: 'ETH',
    shortIdea: 'Спрос на Ethereum ускоряется относительно рынка',
    driver: 'Рост институционального спроса и относительных потоков капитала в Ethereum',
    thesis: 'TAIS ожидает продолжение притока капитала и положительную динамику Ethereum.',
    taisPosition: 'LONG ETH',
    counterPosition: 'SHORT ETH',
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
    visual: 'eth',
  },
]

const pastEvents: PastEvent[] = [
  {
    id: 'EV-ETF-041',
    title: 'Ускорение ETF-притоков',
    category: 'Институциональные потоки',
    asset: 'BTC',
    position: 'LONG BTC',
    shortIdea: 'Рост чистых притоков в spot Bitcoin ETF',
    result: 12.4,
    invested: 1_000_000,
    investors: 83,
    fillTime: '27 мин',
    activeDuration: '11 д 4 ч',
    totalPnl: 124_000,
    bestPnl: 12_400,
    bestAlias: '#7F2A',
    queueUsed: true,
    peakQueue: 18,
    queueCapital: 164_000,
    maxDrawdown: -2.1,
    closedDate: '28 августа',
    timeline: [
      { label: 'TAIS обнаружила сигнал', time: '00:00', detail: 'Event опубликован и открыт для allocation.' },
      { label: '50% объёма', time: '00:09', detail: '$500K распределено между инвесторами.' },
      { label: 'Event заполнен', time: '00:27', detail: 'Основной объём $1M полностью распределён.' },
      { label: 'Пиковая очередь', time: '01:04', detail: '18 инвесторов ожидали освобождения $164K allocation.' },
      { label: 'Закрытие Event', time: '11д 04ч', detail: 'Результат +12.4%, прибыль инвесторов +$124K.' },
    ],
  },
  {
    id: 'EV-STB-042',
    title: 'Расширение stablecoin-ликвидности',
    category: 'Ликвидность',
    asset: 'BTC + ETH',
    position: 'LONG BTC + ETH',
    shortIdea: 'Рост свободной ликвидности внутри крипторынка',
    result: 7.1,
    invested: 1_400_000,
    investors: 141,
    fillTime: '18 мин',
    activeDuration: '8 д 17 ч',
    totalPnl: 99_400,
    bestPnl: 7_100,
    bestAlias: '#31BC',
    queueUsed: true,
    peakQueue: 31,
    queueCapital: 286_000,
    maxDrawdown: -1.6,
    closedDate: '21 августа',
    timeline: [
      { label: 'Event открыт', time: '00:00', detail: 'TAIS зафиксировала расширение ликвидности.' },
      { label: '75% объёма', time: '00:11', detail: '$1.05M распределено.' },
      { label: 'Event заполнен', time: '00:18', detail: '$1.4M allocation полностью занят.' },
      { label: 'Пиковая очередь', time: '00:46', detail: '31 инвестор, суммарный спрос $286K.' },
      { label: 'Закрытие Event', time: '8д 17ч', detail: 'Результат +7.1%, прибыль инвесторов +$99.4K.' },
    ],
  },
  {
    id: 'EV-DER-043',
    title: 'Перегрев длинных позиций',
    category: 'Деривативы',
    asset: 'BTC',
    position: 'SHORT BTC',
    shortIdea: 'TAIS ожидала коррекцию перегруженного рынка',
    result: -4.3,
    invested: 960_000,
    investors: 96,
    fillTime: '31 мин',
    activeDuration: '5 д 9 ч',
    totalPnl: -41_280,
    bestPnl: 0,
    bestAlias: '—',
    queueUsed: false,
    peakQueue: 0,
    queueCapital: 0,
    maxDrawdown: -6.7,
    closedDate: '14 августа',
    timeline: [
      { label: 'Event открыт', time: '00:00', detail: 'Открыта позиция SHORT BTC.' },
      { label: '50% объёма', time: '00:19', detail: '$480K allocation занят.' },
      { label: 'Event заполнен', time: '00:31', detail: 'Весь объём $960K распределён без очереди.' },
      { label: 'Максимальная просадка', time: '3д 02ч', detail: 'Неблагоприятное движение достигло -6.7%.' },
      { label: 'Закрытие Event', time: '5д 09ч', detail: 'Результат -4.3%, совокупный P&L -$41.28K.' },
    ],
  },
  {
    id: 'EV-ROT-044',
    title: 'Ротация капитала в Ethereum',
    category: 'Ротация капитала',
    asset: 'ETH / BTC',
    position: 'LONG ETH / SHORT BTC',
    shortIdea: 'Относительный спрос смещался в сторону ETH',
    result: 18.2,
    invested: 1_600_000,
    investors: 117,
    fillTime: '8 мин',
    activeDuration: '14 д 2 ч',
    totalPnl: 291_200,
    bestPnl: 18_200,
    bestAlias: '#A812',
    queueUsed: true,
    peakQueue: 46,
    queueCapital: 512_000,
    maxDrawdown: -2.8,
    closedDate: '7 августа',
    timeline: [
      { label: 'Event открыт', time: '00:00', detail: 'TAIS зафиксировала начало ротации BTC → ETH.' },
      { label: '50% объёма', time: '00:03', detail: '$800K занято за первые три минуты.' },
      { label: 'Event заполнен', time: '00:08', detail: '$1.6M allocation полностью распределён.' },
      { label: 'Пиковая очередь', time: '00:22', detail: '46 инвесторов ожидали $512K allocation.' },
      { label: 'Закрытие Event', time: '14д 02ч', detail: 'Результат +18.2%, прибыль инвесторов +$291.2K.' },
    ],
  },
  {
    id: 'EV-ONC-045',
    title: 'Снижение биржевого предложения BTC',
    category: 'On-chain',
    asset: 'BTC',
    position: 'LONG BTC',
    shortIdea: 'TAIS фиксировала отток предложения с бирж',
    result: 6.8,
    invested: 1_250_000,
    investors: 154,
    fillTime: '16 мин',
    activeDuration: '9 д 11 ч',
    totalPnl: 85_000,
    bestPnl: 6_800,
    bestAlias: '#0D91',
    queueUsed: true,
    peakQueue: 22,
    queueCapital: 191_000,
    maxDrawdown: -1.9,
    closedDate: '30 июля',
    timeline: [
      { label: 'Event открыт', time: '00:00', detail: 'Открыта позиция LONG BTC.' },
      { label: 'Event заполнен', time: '00:16', detail: '$1.25M капитала распределено.' },
      { label: 'Очередь сформирована', time: '00:29', detail: 'Пиковый спрос очереди $191K.' },
      { label: 'Целевая зона достигнута', time: '8д 20ч', detail: 'Цена вошла в рабочую целевую область.' },
      { label: 'Закрытие Event', time: '9д 11ч', detail: 'Финальный результат +6.8%.' },
    ],
  },
  {
    id: 'EV-FND-046',
    title: 'Расхождение фондирования',
    category: 'Фандинг',
    asset: 'BTC',
    position: 'SHORT BTC',
    shortIdea: 'Аномалия стоимости фондирования указывала на коррекцию',
    result: 9.4,
    invested: 1_800_000,
    investors: 128,
    fillTime: '12 мин',
    activeDuration: '6 д 5 ч',
    totalPnl: 169_200,
    bestPnl: 9_400,
    bestAlias: '#CC41',
    queueUsed: false,
    peakQueue: 0,
    queueCapital: 0,
    maxDrawdown: -2.4,
    closedDate: '22 июля',
    timeline: [
      { label: 'Event открыт', time: '00:00', detail: 'TAIS открыла SHORT BTC.' },
      { label: '80% объёма', time: '00:08', detail: '$1.44M уже распределено.' },
      { label: 'Event заполнен', time: '00:12', detail: 'Весь объём $1.8M занят.' },
      { label: 'Позиция в прибыли', time: '2д 07ч', detail: 'Движение рынка подтвердило гипотезу.' },
      { label: 'Закрытие Event', time: '6д 05ч', detail: 'Финальный результат +9.4%, +$169.2K инвесторам.' },
    ],
  },
]

const ledgerRows = [
  { id: '#037', reference: 10_000, result: 12.0 },
  { id: '#038', reference: 10_000, result: -6.0 },
  { id: '#039', reference: 25_000, result: 8.0 },
  { id: '#040', reference: 15_000, result: 4.5 },
] as const

const hallRows = [
  { label: 'Крупнейшая индивидуальная прибыль', value: '+$84,210', meta: 'Участник #7F2A · Сезон III', icon: Trophy },
  { label: 'Максимальная прибыль одного Event', value: '+$291,200', meta: 'EV-ROT-044 · 117 инвесторов', icon: TrendingUp },
  { label: 'Самое быстрое заполнение', value: '03:41', meta: 'Event #028 · объём $1.5M', icon: Timer },
  { label: 'Самая большая очередь', value: '61 инвестор', meta: 'Event #039 · спрос $684K', icon: Users },
] as const

function InfoTip({ text }: { text: string }) {
  return <span className="group relative inline-flex shrink-0" tabIndex={0} aria-label={text}><Info size={13} className="cursor-help text-[var(--trigonum-muted)] transition group-hover:text-[var(--trigonum-blue)] group-focus:text-[var(--trigonum-blue)]" /><span className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 hidden w-64 -translate-x-1/2 rounded-xl bg-[var(--trigonum-ink)] px-3 py-2 text-left text-xs font-normal leading-5 text-white shadow-lg group-hover:block group-focus:block">{text}</span></span>
}

function LabelWithInfo({ label, info }: { label: string; info?: string }) {
  return <span className="inline-flex items-center gap-1.5"><span>{label}</span>{info && <InfoTip text={info} />}</span>
}

function Metric({ label, value, hint, info, tone = 'default' }: { label: string; value: string; hint?: string; info?: string; tone?: 'default' | 'success' | 'danger' | 'violet' }) {
  const toneClass = tone === 'success' ? 'border-emerald-200 bg-emerald-50' : tone === 'danger' ? 'border-rose-200 bg-rose-50' : tone === 'violet' ? 'border-violet-200 bg-violet-50' : 'border-[var(--trigonum-border)] bg-white'
  const valueClass = tone === 'success' ? 'text-emerald-700' : tone === 'danger' ? 'text-rose-700' : tone === 'violet' ? 'text-violet-700' : 'text-[var(--trigonum-ink)]'
  return <div className={`rounded-xl border p-3 ${toneClass}`}><p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]"><LabelWithInfo label={label} info={info} /></p><p className={`mt-1 text-lg font-bold tabular-nums ${valueClass}`}>{value}</p>{hint && <p className="mt-1 text-xs text-[var(--trigonum-muted)]">{hint}</p>}</div>
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

function isFull(event: LiveEvent) {
  return event.committed >= event.capacity
}

function urgencyLabel(event: LiveEvent) {
  if (isFull(event)) return { label: 'Заполнен', tone: 'bg-blue-100 text-blue-700', border: 'border-blue-300' }
  const remaining = Math.max(0, event.capacity - event.committed)
  const remainingShare = remaining / event.capacity
  if (event.secondsLeft <= 10 * 60 || remainingShare <= 0.06) return { label: 'Почти закрыт', tone: 'bg-rose-100 text-rose-700', border: 'border-rose-300' }
  if (event.secondsLeft <= 30 * 60 || remainingShare <= 0.15) return { label: 'Быстро заполняется', tone: 'bg-amber-100 text-amber-700', border: 'border-amber-300' }
  return { label: 'Открыт', tone: 'bg-emerald-50 text-emerald-700', border: 'border-[var(--trigonum-border)]' }
}

function EventVisual({ event }: { event: LiveEvent }) {
  const short = event.taisPosition.startsWith('SHORT')
  const symbol = event.visual === 'eth' ? 'Ξ' : event.visual === 'basket' ? '₿ + Ξ' : event.visual === 'relative' ? 'Ξ / ₿' : '₿'
  return <div className={`relative h-36 overflow-hidden rounded-2xl ${short ? 'bg-[linear-gradient(135deg,#1f2937,#4c1d2d,#7f1d1d)]' : 'bg-[linear-gradient(135deg,#071a2d,#0b4960,#0d766c)]'}`}><div className="absolute -right-10 -top-10 size-40 rounded-full border border-white/10" /><div className="absolute -bottom-16 left-10 size-44 rounded-full border border-white/10" /><div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '18px 18px' }} /><div className="relative flex h-full items-center justify-between p-5 text-white"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">{event.asset}</p><p className="mt-2 text-5xl font-black tracking-tight">{symbol}</p></div><div className={`grid size-14 place-items-center rounded-2xl border border-white/15 bg-white/10 ${short ? 'text-rose-200' : 'text-emerald-200'}`}>{short ? <TrendingDown size={30} /> : <TrendingUp size={30} />}</div></div></div>
}

function EventCard({ event, onOpen }: { event: LiveEvent; onOpen: () => void }) {
  const remaining = Math.max(0, event.capacity - event.committed)
  const filled = Math.min(100, (event.committed / event.capacity) * 100)
  const urgency = urgencyLabel(event)
  const full = isFull(event)
  const affordable = event.minInvestment <= AVAILABLE_BALANCE
  const short = event.taisPosition.startsWith('SHORT')

  return <button type="button" onClick={onOpen} className={`group w-full rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${urgency.border}`}>
    <EventVisual event={event} />
    <div className="px-1 pb-1 pt-4">
      <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">{event.category}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${urgency.tone}`}>{urgency.label}</span></div>
      <div className="mt-3 flex items-start justify-between gap-4"><div><h3 className="text-xl font-bold text-[var(--trigonum-ink)]">{event.title}</h3><p className="mt-1 text-sm text-[var(--trigonum-muted)]">{event.shortIdea}</p></div><span className={`shrink-0 rounded-xl px-3 py-2 text-sm font-black ${short ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{event.taisPosition}</span></div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-[10px] uppercase tracking-wide text-[var(--trigonum-muted)]">Цель</p><p className="mt-1 font-bold text-emerald-700">+{event.targetLow}–{event.targetHigh}%</p></div>
        <div className={`rounded-xl p-3 ${!full && event.secondsLeft <= 15 * 60 ? 'bg-rose-50' : 'bg-[var(--trigonum-bg)]'}`}><p className="text-[10px] uppercase tracking-wide text-[var(--trigonum-muted)]">Осталось</p><p className={`mt-1 font-bold tabular-nums ${!full && event.secondsLeft <= 15 * 60 ? 'text-rose-700' : ''}`}>{formatCountdown(event.secondsLeft)}</p></div>
        <div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-[10px] uppercase tracking-wide text-[var(--trigonum-muted)]">Минимум</p><p className="mt-1 font-bold">{formatCurrency(event.minInvestment)}</p></div>
        <div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-[10px] uppercase tracking-wide text-[var(--trigonum-muted)]">Риск</p><p className="mt-1 font-bold">{event.risk}</p></div>
      </div>
      <div className="mt-4"><div className="mb-2 flex items-end justify-between"><div><p className="text-xs text-[var(--trigonum-muted)]">{full ? 'Распределено' : 'Доступно'}</p><p className={`mt-1 text-lg font-bold tabular-nums ${full ? 'text-blue-700' : remaining / event.capacity <= 0.12 ? 'text-rose-700' : 'text-[var(--trigonum-ink)]'}`}>{full ? formatCurrency(event.capacity) : formatCurrency(remaining)}</p></div><p className="text-xs font-semibold text-[var(--trigonum-muted)]">{filled.toFixed(1)}%</p></div><ProgressBar value={filled} tone="green" /></div>
      <div className="mt-4 flex items-center justify-between border-t border-[var(--trigonum-border)] pt-4"><span className="text-xs text-[var(--trigonum-muted)]">{event.participants} инвесторов</span><span className={`rounded-lg px-3 py-1.5 text-xs font-bold ${full ? 'bg-blue-50 text-blue-700' : affordable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{full ? `Очередь ${event.queueRequests ?? 0}` : affordable ? 'Доступен' : 'Недостаточно средств'}</span></div>
    </div>
  </button>
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
    return [...filtered].sort((a, b) => sort === 'time' ? a.secondsLeft - b.secondsLeft : sort === 'capacity' ? (a.capacity - a.committed) - (b.capacity - b.committed) : sort === 'return' ? b.targetHigh - a.targetHigh : b.scarcity - a.scarcity)
  }, [events, sort, risk, affordableOnly, urgentOnly])
  const criticalCount = events.filter((event) => !isFull(event) && event.secondsLeft > 0 && urgencyLabel(event).label === 'Почти закрыт').length
  const totalRemaining = events.reduce((sum, event) => sum + Math.max(0, event.capacity - event.committed), 0)
  return <div className="space-y-5"><div className="grid gap-3 sm:grid-cols-3"><Metric label="Активные возможности" value={`${events.filter((event) => event.secondsLeft > 0).length}`} /><Metric label="Свободный объём" value={formatCurrency(totalRemaining)} /><Metric label="Ваш свободный капитал" value={formatCurrency(AVAILABLE_BALANCE)} /></div><Card><div className="flex flex-wrap items-center gap-3"><div className="flex items-center gap-2"><Filter size={17} /><span className="text-sm font-bold">Фильтры</span></div><select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="rounded-xl border border-[var(--trigonum-border)] bg-white px-3 py-2 text-sm"><option value="scarcity">Сначала самые дефицитные</option><option value="time">Меньше всего времени</option><option value="capacity">Меньше всего доступно</option><option value="return">Выше целевой результат</option></select><select value={risk} onChange={(e) => setRisk(e.target.value as 'Все' | Risk)} className="rounded-xl border border-[var(--trigonum-border)] bg-white px-3 py-2 text-sm"><option value="Все">Любой риск</option><option value="Низкий">Низкий</option><option value="Умеренный">Умеренный</option><option value="Высокий">Высокий</option></select><button type="button" onClick={() => setAffordableOnly((value) => !value)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${affordableOnly ? 'bg-emerald-100 text-emerald-800' : 'border border-[var(--trigonum-border)] bg-white'}`}>Доступные мне</button><button type="button" onClick={() => setUrgentOnly((value) => !value)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${urgentOnly ? 'bg-rose-100 text-rose-800' : 'border border-[var(--trigonum-border)] bg-white'}`}>Срочные</button></div></Card>{criticalCount > 0 && <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900"><Flame size={20} className="shrink-0" /><p className="text-sm font-bold">{criticalCount} Event близки к закрытию</p></div>}<div className="grid gap-4 xl:grid-cols-2">{visibleEvents.map((event) => <EventCard key={event.id} event={event} onOpen={() => onSelect(event.id)} />)}</div></div>
}

function PositionToggle({ event, side, onChange }: { event: LiveEvent; side: PositionSide; onChange: (side: PositionSide) => void }) {
  return <div className="grid grid-cols-2 gap-2 rounded-xl bg-[var(--trigonum-bg)] p-1.5"><button type="button" onClick={() => onChange('tais')} className={`rounded-lg px-3 py-2.5 text-left transition ${side === 'tais' ? 'bg-white shadow-sm ring-1 ring-emerald-300' : 'text-[var(--trigonum-muted)] hover:bg-white/70'}`}><span className="block text-[10px] font-bold uppercase tracking-wide text-emerald-700">С TAIS</span><span className="mt-0.5 block text-sm font-black text-[var(--trigonum-ink)]">{event.taisPosition}</span></button><button type="button" onClick={() => onChange('contra')} className={`rounded-lg px-3 py-2.5 text-left transition ${side === 'contra' ? 'bg-white shadow-sm ring-1 ring-violet-300' : 'text-[var(--trigonum-muted)] hover:bg-white/70'}`}><span className="block text-[10px] font-bold uppercase tracking-wide text-violet-700">Обратная</span><span className="mt-0.5 block text-sm font-black text-[var(--trigonum-ink)]">{event.counterPosition}</span></button></div>
}

function CompactStat({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'success' | 'danger' | 'blue' }) {
  const valueClass = tone === 'success' ? 'text-emerald-700' : tone === 'danger' ? 'text-rose-700' : tone === 'blue' ? 'text-blue-700' : 'text-[var(--trigonum-ink)]'
  return <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">{label}</p><p className={`mt-1 truncate text-base font-black tabular-nums ${valueClass}`}>{value}</p></div>
}

function EventDetail({ event, onBack, onReserveTais, onReserveContra, onRelease }: { event: LiveEvent; onBack: () => void; onReserveTais: (amount: number) => void; onReserveContra: (amount: number) => void; onRelease: (amount: number) => void }) {
  const maxAmount = Math.min(event.maxInvestment, AVAILABLE_BALANCE)
  const initialAmount = Math.max(event.minInvestment, Math.min(20_000, maxAmount))
  const [side, setSide] = useState<PositionSide>('tais')
  const [desiredAmount, setDesiredAmount] = useState(initialAmount)
  const [queueAmount, setQueueAmount] = useState(initialAmount)
  const [queuedAmount, setQueuedAmount] = useState(0)
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const [queueAheadCapital, setQueueAheadCapital] = useState(0)
  const [myAllocation, setMyAllocation] = useState(0)
  const [myContra, setMyContra] = useState(0)
  const [watching, setWatching] = useState(false)
  const [showThesis, setShowThesis] = useState(false)

  useEffect(() => {
    const amount = Math.max(event.minInvestment, Math.min(20_000, maxAmount))
    setDesiredAmount(amount)
    setQueueAmount(amount)
    setQueuedAmount(0)
    setQueuePosition(null)
    setQueueAheadCapital(0)
    setMyAllocation(0)
    setMyContra(0)
    setSide('tais')
    setShowThesis(false)
  }, [event.id, event.minInvestment, maxAmount])

  const full = isFull(event)
  const remaining = Math.max(0, event.capacity - event.committed)
  const fillPct = Math.min(100, (event.committed / event.capacity) * 100)
  const minutesToFull = event.velocityPerMinute > 0 ? remaining / event.velocityPerMinute : 0
  const trigonumShare = (event.trigonumCapital / event.capacity) * 100
  const amountValid = desiredAmount >= event.minInvestment && desiredAmount <= maxAmount && desiredAmount <= AVAILABLE_BALANCE
  const queueAmountValid = queueAmount >= event.minInvestment && queueAmount <= maxAmount && queueAmount <= AVAILABLE_BALANCE
  const canInvestTais = !full && amountValid && remaining >= desiredAmount && event.secondsLeft > 0
  const canInvestContra = amountValid && event.secondsLeft > 0
  const scenarioLow = desiredAmount * event.targetLow / 100
  const scenarioHigh = desiredAmount * event.targetHigh / 100
  const quickAmounts = Array.from(new Set([event.minInvestment, 10_000, 25_000, maxAmount].filter((value) => value >= event.minInvestment && value <= maxAmount))).sort((a, b) => a - b)

  const reserve = () => {
    if (side === 'tais') {
      if (!canInvestTais) return
      onReserveTais(desiredAmount)
      setMyAllocation((value) => value + desiredAmount)
      return
    }
    if (!canInvestContra) return
    onReserveContra(desiredAmount)
    setMyContra((value) => value + desiredAmount)
  }

  const release = () => {
    const amount = Math.min(5_000, myAllocation)
    if (amount <= 0) return
    onRelease(amount)
    setMyAllocation((value) => Math.max(0, value - amount))
  }

  const joinQueue = () => {
    if (!queueAmountValid) return
    setQueuedAmount(queueAmount)
    setQueuePosition((event.queueRequests ?? 0) + 1)
    setQueueAheadCapital(event.queueCapital ?? 0)
  }

  const simulateQueueMove = () => {
    setQueuePosition((value) => value ? Math.max(1, value - 2) : value)
    setQueueAheadCapital((value) => Math.max(0, value - 18_000))
  }

  const renderAmountPicker = (value: number, setValue: (value: number) => void) => <div className="space-y-3"><div className="flex items-end gap-3"><label className="min-w-0 flex-1"><span className="text-[10px] font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Сумма</span><div className="mt-1 flex items-center rounded-xl border border-[var(--trigonum-border)] bg-white px-3"><span className="text-sm font-bold text-[var(--trigonum-muted)]">$</span><input type="number" min={event.minInvestment} max={maxAmount} step={1} value={value} onChange={(e) => setValue(Number(e.target.value))} className="w-full bg-transparent px-2 py-2.5 text-xl font-black outline-none" /></div></label><div className="shrink-0 pb-0.5 text-right"><p className="text-[10px] uppercase text-[var(--trigonum-muted)]">Доступно</p><p className="text-sm font-bold">{formatCurrency(AVAILABLE_BALANCE)}</p></div></div><input type="range" min={event.minInvestment} max={maxAmount} step={1} value={value} onChange={(e) => setValue(Number(e.target.value))} className="w-full" /><div className="flex flex-wrap gap-1.5">{quickAmounts.map((amount) => <button key={amount} type="button" onClick={() => setValue(amount)} className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${value === amount ? 'border-[var(--trigonum-blue)] bg-blue-50 text-blue-700' : 'border-[var(--trigonum-border)] bg-white hover:border-[var(--trigonum-blue)]'}`}>{amount === maxAmount ? 'MAX' : formatCurrency(amount)}</button>)}</div></div>

  return <div className="space-y-4">
    <div className="flex items-center justify-between gap-3"><button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--trigonum-blue)]"><ArrowLeft size={16} /> Все Events</button><button type="button" onClick={() => setWatching((value) => !value)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${watching ? 'bg-emerald-50 text-emerald-700' : 'border border-[var(--trigonum-border)] bg-white'}`}>{watching ? '✓ Отслеживается' : 'Наблюдать'}</button></div>

    <Card className="overflow-hidden !p-0">
      <div className="bg-[linear-gradient(135deg,#071a2d_0%,#0b3350_52%,#0d6a67_100%)] px-5 py-4 text-white"><div className="grid gap-4 lg:grid-cols-[1.5fr_.62fr_.58fr] lg:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-100">{event.category}</span><span className="text-[10px] font-semibold text-slate-300">{event.id}</span></div><h2 className="mt-2 text-2xl font-black">{event.title}</h2><p className="mt-1 text-sm text-slate-200">{event.shortIdea}</p></div><div className="lg:border-l lg:border-white/10 lg:pl-4"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-300">Позиция TAIS</p><p className="mt-1 text-xl font-black text-emerald-300">{event.taisPosition}</p><p className="mt-1 text-xs text-slate-300">Цель +{event.targetLow}–{event.targetHigh}% · {event.horizon}</p></div><div className="lg:border-l lg:border-white/10 lg:pl-4 lg:text-right"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-300">До закрытия входа</p><p className="mt-1 text-2xl font-black tabular-nums">{formatCountdown(event.secondsLeft)}</p><span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${full ? 'bg-blue-400/20 text-blue-100' : event.secondsLeft <= 15 * 60 ? 'bg-rose-400/20 text-rose-100' : 'bg-emerald-400/20 text-emerald-100'}`}>{full ? 'Основной объём заполнен' : `${fillPct.toFixed(1)}% распределено`}</span></div></div></div>
      <div className="grid grid-cols-2 divide-x divide-y divide-[var(--trigonum-border)] border-t border-[var(--trigonum-border)] bg-white md:grid-cols-4 md:divide-y-0"><div className="p-3"><CompactStat label="Объём Event" value={formatCurrency(event.capacity)} /></div><div className="p-3"><CompactStat label={full ? 'Распределено' : 'Осталось'} value={full ? formatCurrency(event.committed) : formatCurrency(remaining)} tone={full ? 'blue' : remaining / event.capacity <= 0.12 ? 'danger' : 'default'} /></div><div className="p-3"><CompactStat label="Минимум" value={formatCurrency(event.minInvestment)} /></div><div className="p-3"><CompactStat label={full ? 'Очередь' : 'Инвесторов'} value={full ? `${event.queueRequests ?? 0} чел. · ${formatCurrency(event.queueCapital ?? 0)}` : `${event.participants}`} tone={full ? 'blue' : 'default'} /></div></div>
    </Card>

    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_410px] xl:items-start">
      <div className="space-y-4">
        <Card>
          <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--trigonum-blue)]">Суть Event</p><h3 className="mt-1 text-lg font-black">{event.driver}</h3></div><button type="button" onClick={() => setShowThesis((value) => !value)} className="shrink-0 rounded-lg border border-[var(--trigonum-border)] bg-white px-3 py-1.5 text-xs font-bold">{showThesis ? 'Свернуть' : 'Почему TAIS?'}</button></div><p className="mt-2 text-sm text-[var(--trigonum-muted)]">{event.shortIdea}</p>{showThesis && <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950">{event.thesis}</div>}
        </Card>

        <Card>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><CompactStat label="Риск" value={event.risk} /><p className="mt-2 text-xs text-[var(--trigonum-muted)]">Горизонт {event.horizon}</p></div>
            <div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><CompactStat label="Дефицит" value={`${event.scarcity}/100`} tone={event.scarcity >= 90 ? 'danger' : 'default'} /><p className="mt-2 text-xs text-[var(--trigonum-muted)]">Доступность основного allocation</p></div>
            <div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><CompactStat label="Капитал Trigonum" value={`${trigonumShare.toFixed(0)}%`} tone="success" /><p className="mt-2 text-xs text-[var(--trigonum-muted)]">{formatCurrency(event.trigonumCapital)} внутри Event</p></div>
          </div>

          <div className="mt-3 rounded-xl border border-[var(--trigonum-border)] p-3">
            <div className="flex items-end justify-between gap-3"><div><div className="flex items-center gap-2"><Gauge size={15} className="text-[var(--trigonum-blue)]" /><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Набор капитала</p></div><p className="mt-1 text-xl font-black">{formatCurrency(event.committed)} <span className="text-sm font-semibold text-[var(--trigonum-muted)]">из {formatCurrency(event.capacity)}</span></p></div><span className="text-sm font-black">{fillPct.toFixed(1)}%</span></div>
            <div className="mt-2"><ProgressBar value={fillPct} tone="green" /></div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3"><div className="rounded-lg bg-[var(--trigonum-bg)] p-2.5"><CompactStat label="Инвесторов" value={`${event.participants}`} /></div><div className="rounded-lg bg-[var(--trigonum-bg)] p-2.5"><CompactStat label="Темп" value={event.velocityPerMinute > 0 ? `${formatCurrency(event.velocityPerMinute)}/мин` : 'Набор закрыт'} tone={event.velocityPerMinute > 0 ? 'success' : 'default'} /></div><div className="rounded-lg bg-[var(--trigonum-bg)] p-2.5"><CompactStat label="До заполнения" value={!full && event.velocityPerMinute > 0 ? `≈ ${Math.max(1, Math.ceil(minutesToFull))} мин` : 'Заполнен'} tone={full ? 'blue' : 'default'} /></div></div>
          </div>

          {full && <div className="mt-3 grid gap-2 sm:grid-cols-3"><div className="rounded-xl border border-blue-100 bg-blue-50 p-3"><CompactStat label="Заявок в очереди" value={`${event.queueRequests ?? 0}`} tone="blue" /></div><div className="rounded-xl border border-blue-100 bg-blue-50 p-3"><CompactStat label="Капитал в очереди" value={formatCurrency(event.queueCapital ?? 0)} tone="blue" /></div><div className="rounded-xl border border-blue-100 bg-blue-50 p-3"><CompactStat label="Следующая позиция" value={`#${(event.queueRequests ?? 0) + 1}`} tone="blue" /></div></div>}
        </Card>
      </div>

      <div className="xl:sticky xl:top-4">
        <Card className="!p-0">
          <div className="border-b border-[var(--trigonum-border)] p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Wallet size={18} className={side === 'tais' ? 'text-emerald-600' : 'text-violet-600'} /><div><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Действие</p><h3 className="font-black">{full && side === 'tais' ? 'Очередь на allocation' : 'Открыть позицию'}</h3></div></div><span className="text-xs font-bold tabular-nums text-[var(--trigonum-muted)]">{formatCountdown(event.secondsLeft)}</span></div><div className="mt-3"><PositionToggle event={event} side={side} onChange={setSide} /></div></div>

          <div className="p-4">
            {full && side === 'tais' ? <div className="space-y-4">{queuePosition === null ? <><div className="rounded-xl border border-blue-100 bg-blue-50 p-3"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wide text-blue-700">Основной Event заполнен</p><p className="mt-1 text-sm text-blue-950">Можно занять место на освобождающийся allocation.</p></div><Users size={22} className="text-blue-600" /></div><div className="mt-3 grid grid-cols-2 gap-3"><CompactStat label="Сейчас в очереди" value={`${event.queueRequests ?? 0}`} tone="blue" /><CompactStat label="Капитал впереди" value={formatCurrency(event.queueCapital ?? 0)} tone="blue" /></div></div>{renderAmountPicker(queueAmount, setQueueAmount)}<div className="rounded-xl bg-[var(--trigonum-bg)] px-3 py-2.5 text-xs"><div className="flex items-center justify-between"><span>Ожидаемая позиция</span><b>#{(event.queueRequests ?? 0) + 1}</b></div></div><button type="button" disabled={!queueAmountValid} onClick={joinQueue} className="w-full rounded-xl bg-[var(--trigonum-ink)] px-4 py-3 text-sm font-black text-white disabled:opacity-40">Встать в очередь на {formatCurrency(queueAmount)}</button></> : <div className="rounded-xl border border-blue-200 bg-blue-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wide text-blue-700">Ваша очередь</p><p className="mt-1 text-4xl font-black text-blue-950">#{queuePosition}</p></div><button type="button" onClick={() => { setQueuePosition(null); setQueuedAmount(0); setQueueAheadCapital(0) }} className="rounded-lg border border-blue-200 bg-white p-2 text-blue-700"><X size={15} /></button></div><div className="mt-4 grid grid-cols-2 gap-3"><CompactStat label="Ваша заявка" value={formatCurrency(queuedAmount)} tone="blue" /><CompactStat label="Капитал впереди" value={formatCurrency(queueAheadCapital)} tone="blue" /></div><button type="button" onClick={simulateQueueMove} className="mt-4 w-full rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-blue-800">Показать движение очереди</button></div>}</div> : <div className="space-y-4"><div><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Выбранная позиция</p><div className="mt-1 flex items-center justify-between gap-3"><p className={`text-2xl font-black ${side === 'tais' ? 'text-emerald-700' : 'text-violet-700'}`}>{side === 'tais' ? event.taisPosition : event.counterPosition}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${side === 'tais' ? 'bg-emerald-50 text-emerald-700' : 'bg-violet-50 text-violet-700'}`}>{side === 'tais' ? 'TAIS' : 'Обратная'}</span></div></div>{renderAmountPicker(desiredAmount, setDesiredAmount)}<div className="grid grid-cols-2 gap-2"><div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3"><CompactStat label={`При +${event.targetLow}%`} value={`+${formatCurrency(scenarioLow)}`} tone="success" /></div><div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3"><CompactStat label={`При +${event.targetHigh}%`} value={`+${formatCurrency(scenarioHigh)}`} tone="success" /></div></div><button type="button" disabled={side === 'tais' ? !canInvestTais : !canInvestContra} onClick={reserve} className={`w-full rounded-xl px-4 py-3 text-sm font-black text-white disabled:opacity-40 ${side === 'tais' ? 'bg-emerald-600' : 'bg-violet-600'}`}>{side === 'tais' ? (remaining < desiredAmount ? 'Такой объём уже недоступен' : `Открыть ${event.taisPosition}`) : `Открыть ${event.counterPosition}`}</button></div>}

            {(myAllocation > 0 || myContra > 0) && <div className="mt-4 border-t border-[var(--trigonum-border)] pt-4"><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Ваши позиции</p><div className="mt-2 space-y-2">{myAllocation > 0 && <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2"><div className="flex items-center gap-2"><BadgeCheck size={15} className="text-emerald-700" /><span className="text-xs font-bold text-emerald-900">{event.taisPosition}</span></div><div className="flex items-center gap-2"><b className="text-sm text-emerald-950">{formatCurrency(myAllocation)}</b><button type="button" onClick={release} className="rounded-lg border border-emerald-200 bg-white px-2 py-1 text-[10px] font-bold text-emerald-700">−$5K</button></div></div>}{myContra > 0 && <div className="flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50 px-3 py-2"><div className="flex items-center gap-2"><BadgeCheck size={15} className="text-violet-700" /><span className="text-xs font-bold text-violet-900">{event.counterPosition}</span></div><b className="text-sm text-violet-950">{formatCurrency(myContra)}</b></div>}</div></div>}
          </div>
        </Card>
      </div>
    </div>
  </div>
}

function PastEventCard({ event, onOpen }: { event: PastEvent; onOpen: () => void }) {
  const positive = event.totalPnl >= 0
  return <button type="button" onClick={onOpen} className="w-full rounded-2xl border border-[var(--trigonum-border)] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--trigonum-blue)] hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">{event.category}</span><span className="text-[11px] font-semibold text-[var(--trigonum-muted)]">{event.closedDate}</span></div><h3 className="mt-3 text-lg font-bold">{event.title}</h3><p className="mt-1 text-sm text-[var(--trigonum-muted)]">{event.shortIdea}</p></div><span className={`shrink-0 rounded-xl px-3 py-2 text-sm font-black ${event.position.startsWith('SHORT') ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{event.position}</span></div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"><div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-[10px] uppercase text-[var(--trigonum-muted)]">Результат</p><p className={`mt-1 text-lg font-black ${event.result >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{event.result > 0 ? '+' : ''}{event.result}%</p></div><div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-[10px] uppercase text-[var(--trigonum-muted)]">Капитал</p><p className="mt-1 font-bold">{formatCurrency(event.invested)}</p></div><div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-[10px] uppercase text-[var(--trigonum-muted)]">Инвесторов</p><p className="mt-1 font-bold">{event.investors}</p></div><div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-[10px] uppercase text-[var(--trigonum-muted)]">Заполнен за</p><p className="mt-1 font-bold">{event.fillTime}</p></div></div><div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--trigonum-border)] pt-3"><div><p className="text-[10px] uppercase text-[var(--trigonum-muted)]">Итог инвесторов</p><p className={`mt-1 text-lg font-black ${positive ? 'text-emerald-700' : 'text-rose-700'}`}>{event.totalPnl > 0 ? '+' : ''}{formatCurrency(event.totalPnl)}</p></div><span className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${event.queueUsed ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{event.queueUsed ? `Была очередь · пик ${event.peakQueue}` : 'Без очереди'}</span></div></button>
}

function PastEventDetail({ event, onClose }: { event: PastEvent; onClose: () => void }) {
  return <Card className="overflow-hidden !p-0"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--trigonum-border)] bg-[var(--trigonum-bg)] p-5"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--trigonum-blue)]">Архив · {event.id}</p><h2 className="mt-1 text-2xl font-bold">{event.title}</h2><p className="mt-1 text-sm text-[var(--trigonum-muted)]">{event.position} · завершён {event.closedDate}</p></div><button type="button" onClick={onClose} className="rounded-xl border border-[var(--trigonum-border)] bg-white p-2"><X size={17} /></button></div><div className="p-5"><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Metric label="Распределено" value={formatCurrency(event.invested)} /><Metric label="Итог инвесторов" value={`${event.totalPnl > 0 ? '+' : ''}${formatCurrency(event.totalPnl)}`} tone={event.totalPnl >= 0 ? 'success' : 'danger'} /><Metric label="Результат Event" value={`${event.result > 0 ? '+' : ''}${event.result}%`} tone={event.result >= 0 ? 'success' : 'danger'} /><Metric label="Макс. просадка" value={`${event.maxDrawdown}%`} tone="danger" /></div><div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]"><div className="rounded-2xl border border-[var(--trigonum-border)] p-4"><div className="flex items-center gap-2"><Activity size={17} /><h3 className="font-bold">Как проходил Event</h3></div><div className="mt-4 space-y-0">{event.timeline.map((step, index) => <div key={`${event.id}-${step.time}`} className="grid grid-cols-[66px_18px_1fr] gap-3"><span className="pt-0.5 text-xs font-bold tabular-nums text-[var(--trigonum-muted)]">{step.time}</span><div className="relative flex justify-center"><span className="mt-1.5 size-2.5 rounded-full bg-[var(--trigonum-blue)]" />{index < event.timeline.length - 1 && <span className="absolute bottom-0 top-4 w-px bg-[var(--trigonum-border)]" />}</div><div className="pb-5"><p className="text-sm font-bold">{step.label}</p><p className="mt-1 text-xs leading-5 text-[var(--trigonum-muted)]">{step.detail}</p></div></div>)}</div></div><div className="space-y-3"><div className="rounded-2xl border border-[var(--trigonum-border)] p-4"><p className="text-xs font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Исполнение</p><div className="mt-3 space-y-2 text-sm"><div className="flex justify-between"><span>Инвесторов</span><b>{event.investors}</b></div><div className="flex justify-between"><span>Заполнение</span><b>{event.fillTime}</b></div><div className="flex justify-between"><span>Длительность</span><b>{event.activeDuration}</b></div><div className="flex justify-between"><span>Очередь</span><b>{event.queueUsed ? `Да · ${event.peakQueue} чел.` : 'Нет'}</b></div>{event.queueUsed && <div className="flex justify-between"><span>Пиковый спрос очереди</span><b>{formatCurrency(event.queueCapital)}</b></div>}</div></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-amber-800">Лучший анонимный результат</p><p className="mt-2 text-2xl font-black text-amber-950">{event.bestPnl > 0 ? `+${formatCurrency(event.bestPnl)}` : '—'}</p><p className="mt-1 text-xs text-amber-800">Участник {event.bestAlias}</p></div></div></div></div></Card>
}

function SeasonTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = selectedId ? pastEvents.find((event) => event.id === selectedId) ?? null : null
  const totalCapital = pastEvents.reduce((sum, event) => sum + event.invested, 0)
  const totalPnl = pastEvents.reduce((sum, event) => sum + event.totalPnl, 0)
  const profitable = pastEvents.filter((event) => event.totalPnl > 0).length
  const withQueue = pastEvents.filter((event) => event.queueUsed).length

  return <div className="space-y-5"><Card className="overflow-hidden !p-0"><div className="bg-[linear-gradient(120deg,#071a2d,#0b4960,#0d766c)] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Архив TAIS Events</p><h2 className="mt-2 text-3xl font-bold">Сезон IV · III квартал 2026</h2><p className="mt-2 max-w-3xl text-sm text-slate-200">Завершённые возможности: как быстро распределялся капитал, как проходило исполнение и какой результат получили инвесторы.</p><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Завершено" value={`${pastEvents.length} Events`} /><Metric label="Распределено капитала" value={formatCurrency(totalCapital)} /><Metric label="Итог инвесторов" value={`${totalPnl >= 0 ? '+' : ''}${formatCurrency(totalPnl)}`} tone={totalPnl >= 0 ? 'success' : 'danger'} /><Metric label="С очередью" value={`${withQueue}/${pastEvents.length}`} hint={`${profitable}/${pastEvents.length} прибыльных`} /></div></div></Card>{selected && <PastEventDetail event={selected} onClose={() => setSelectedId(null)} />}<div><div className="mb-3 flex items-center justify-between"><div><h3 className="text-lg font-bold">Завершённые Events</h3><p className="text-sm text-[var(--trigonum-muted)]">Откройте карточку, чтобы посмотреть полный ход Event.</p></div><span className="text-xs font-semibold text-[var(--trigonum-muted)]">{pastEvents.length} событий</span></div><div className="grid gap-4 xl:grid-cols-2">{pastEvents.map((event) => <PastEventCard key={event.id} event={event} onOpen={() => setSelectedId(event.id)} />)}</div></div></div>
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
  const proofs = [{ id: '#031', season: 'Сезон II', result: '+17.8%', badge: 'Участие', position: 'LONG BTC' },{ id: '#038', season: 'Сезон III', result: '+8.6%', badge: 'Участие', position: 'SHORT BTC' },{ id: '#041', season: 'Сезон IV', result: '+12.4%', badge: 'Участие', position: 'LONG ETH' },{ id: '#044', season: 'Сезон IV', result: '+18.2%', badge: 'Через очередь', position: 'LONG BTC' }]
  return <div className="space-y-5"><Card><div className="flex items-center gap-2"><Ticket size={20} className="text-[var(--trigonum-blue)]" /><h2 className="text-xl font-bold">История участия</h2></div></Card><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{proofs.map((proof, index) => <div key={proof.id} className="rounded-2xl border border-[var(--trigonum-border)] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><Medal size={24} className="text-[var(--trigonum-blue)]" /><span className="text-xs font-bold text-[var(--trigonum-muted)]">#{String(index + 81).padStart(3, '0')}</span></div><p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[var(--trigonum-muted)]">TAIS EVENT</p><h3 className="mt-1 text-2xl font-bold">{proof.id}</h3><p className="mt-1 text-sm text-[var(--trigonum-muted)]">{proof.season}</p><p className="mt-4 text-sm font-bold">{proof.position}</p><div className="my-5 h-px bg-[var(--trigonum-border)]" /><p className="text-xs text-[var(--trigonum-muted)]">Результат</p><p className="mt-1 text-3xl font-bold text-emerald-700">{proof.result}</p><span className="mt-4 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">{proof.badge}</span></div>)}</div></div>
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

  return <div className="pb-10"><header className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--trigonum-blue)]">TAIS · инвестиционные события</p><h1 className="mt-1 text-3xl font-bold text-[var(--trigonum-ink)]">Events</h1><p className="mt-1 max-w-3xl text-sm text-[var(--trigonum-muted)]">TAIS находит рыночную возможность, формирует понятную сделку и открывает короткое окно для прямого участия инвесторов.</p></header><nav className="mb-5 flex flex-wrap gap-2">{views.map((item) => { const Icon = item.icon; return <ViewButton key={item.id} active={view === item.id} onClick={() => { setView(item.id); setSelectedEventId(null) }}><span className="flex items-center gap-2"><Icon size={15} />{item.label}</span></ViewButton> })}</nav>{view === 'events' && (selectedEvent ? <EventDetail event={selectedEvent} onBack={() => setSelectedEventId(null)} onReserveTais={(amount) => reserveTais(selectedEvent.id, amount)} onReserveContra={(amount) => reserveContra(selectedEvent.id, amount)} onRelease={(amount) => release(selectedEvent.id, amount)} /> : <LiveEventsGallery events={events} onSelect={setSelectedEventId} />)}{view === 'season' && <SeasonTab />}{view === 'ledger' && <LedgerTab />}{view === 'hall' && <HallTab />}{view === 'collection' && <CollectionTab />}</div>
}
