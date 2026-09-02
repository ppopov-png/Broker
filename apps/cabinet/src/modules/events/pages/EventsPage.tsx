import {
  Activity,
  BadgeCheck,
  BarChart3,
  Check,
  Clock3,
  Coins,
  Crown,
  DoorOpen,
  Gauge,
  History,
  LockKeyhole,
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
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatCurrency } from '../../../shared/lib/format'
import { Card } from '../../../shared/ui/Card'
import { ProgressBar } from '../../../shared/ui/ProgressBar'

type MainView = 'event' | 'season' | 'ledger' | 'hall' | 'collection'
type PollConfidence = 'Low' | 'Medium' | 'High'

const EVENT_CAPACITY = 1_000_000
const TRIGONUM_CAPITAL = 120_000
const BASE_COMMITTED = 742_000
const BASE_VELOCITY = 14_200
const MIN_INVESTMENT = 5_000
const MAX_INVESTMENT = 50_000
const PUBLIC_OPENS_IN_MINUTES = 18

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

function EventTab() {
  const [credits, setCredits] = useState(3)
  const [priorityUnlocked, setPriorityUnlocked] = useState(false)
  const [desiredAmount, setDesiredAmount] = useState(25_000)
  const [investedAmount, setInvestedAmount] = useState(0)
  const [releasedAmount, setReleasedAmount] = useState(0)
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const [pollPrediction, setPollPrediction] = useState(11.5)
  const [pollConfidence, setPollConfidence] = useState<PollConfidence>('High')
  const [pollLocked, setPollLocked] = useState(false)
  const [watching, setWatching] = useState(false)
  const [queueDesired, setQueueDesired] = useState(20_000)

  const committed = BASE_COMMITTED + investedAmount - releasedAmount
  const remaining = Math.max(0, EVENT_CAPACITY - committed)
  const fillPct = Math.min(100, (committed / EVENT_CAPACITY) * 100)
  const minutesToFull = remaining / BASE_VELOCITY
  const fullDesiredWindow = Math.max(0, (remaining - desiredAmount) / BASE_VELOCITY)
  const returningInvestorShare = 71
  const returningCapitalShare = 78
  const reentryScore = Math.round((returningInvestorShare + returningCapitalShare) / 2)
  const trigonumShare = (TRIGONUM_CAPITAL / EVENT_CAPACITY) * 100
  const crowdPrediction = 9.4
  const actualPastExample = 12.4
  const taisRange = '8–12%'
  const pollUserError = Math.abs(pollPrediction - actualPastExample)
  const crowdError = Math.abs(crowdPrediction - actualPastExample)
  const taisError = Math.max(0, actualPastExample - 12)

  const canAccess = priorityUnlocked || PUBLIC_OPENS_IN_MINUTES <= 0
  const canInvest = canAccess && remaining >= desiredAmount && desiredAmount >= MIN_INVESTMENT && desiredAmount <= MAX_INVESTMENT

  const releaseFive = () => {
    if (investedAmount - releasedAmount >= 5_000) setReleasedAmount((v) => v + 5_000)
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
      <div className="flex flex-col gap-5">
        <Card className="overflow-hidden !p-0">
          <div className="relative overflow-hidden bg-[linear-gradient(135deg,#071a2d_0%,#0b3350_46%,#0d6a67_100%)] p-6 text-white">
            <div className="absolute -right-20 -top-24 size-72 rounded-full border border-white/10" />
            <div className="absolute -bottom-28 right-24 size-72 rounded-full border border-white/10" />
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                  <span className="size-2 animate-pulse rounded-full bg-emerald-300" /> Live Event #052
                </div>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">Moderate risk</span>
              </div>
              <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight">TAIS Opportunity #052</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
                Ограниченное по объёму событие TAIS. Торговая логика и стратегия закрыты; инвестору доступны только условия участия,
                динамика спроса, прогноз результата и статистика экосистемы.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div><p className="text-xs text-slate-300">Target</p><p className="mt-1 text-xl font-bold">8–12%</p></div>
                <div><p className="text-xs text-slate-300">Horizon</p><p className="mt-1 text-xl font-bold">7–14 дней</p></div>
                <div><p className="text-xs text-slate-300">Minimum</p><p className="mt-1 text-xl font-bold">$5K</p></div>
                <div><p className="text-xs text-slate-300">Capacity</p><p className="mt-1 text-xl font-bold">$1.0M</p></div>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
              <div className="rounded-2xl border border-[var(--trigonum-border)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">Event capacity</p>
                    <p className="mt-1 text-xl font-bold text-[var(--trigonum-ink)]">{formatCurrency(committed)} / {formatCurrency(EVENT_CAPACITY)}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{fillPct.toFixed(1)}% filled</span>
                </div>
                <div className="mt-3"><ProgressBar value={fillPct} tone="green" /></div>
                <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-[var(--trigonum-muted)]">
                  <span>Осталось: <b className="text-[var(--trigonum-ink)]">{formatCurrency(remaining)}</b></span>
                  <span>128 участников</span>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-amber-800"><Gauge size={17} /><p className="text-xs font-bold uppercase tracking-wide">Price of Waiting</p></div>
                <p className="mt-3 text-2xl font-bold text-amber-950">{formatCurrency(BASE_VELOCITY)} / мин</p>
                <p className="mt-1 text-sm text-amber-900">При текущем темпе Event может заполниться примерно через <b>{Math.max(1, Math.floor(minutesToFull - 3))}–{Math.ceil(minutesToFull + 4)} мин</b>.</p>
                <p className="mt-3 rounded-xl bg-white/80 p-3 text-xs text-amber-950">Полный allocation {formatCurrency(desiredAmount)} может стать недоступен примерно через <b>{Math.max(1, Math.floor(fullDesiredWindow))}–{Math.max(2, Math.ceil(fullDesiredWindow + 5))} мин</b>.</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="Re-entry Confidence" value={`${reentryScore}/100`} hint="71% investors · 78% capital returning" />
              <Metric label="Trigonum co-investment" value={`${trigonumShare.toFixed(0)}%`} hint="$120K · same Event result" />
              <Metric label="Private window" value="Priority" hint="Public через 18 мин" />
              <Metric label="Your Event Credits" value={`◆ ${credits}`} hint="1 credit = early access" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2"><LockKeyhole size={18} className="text-[var(--trigonum-blue)]" /><h3 className="font-bold text-[var(--trigonum-ink)]">Private Window</h3></div>
              <p className="mt-1 text-sm text-[var(--trigonum-muted)]">Priority-окно открыто сейчас. Публичный доступ откроется через 18 минут.</p>
            </div>
            {priorityUnlocked ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"><Check size={14} /> Priority unlocked</span>
            ) : (
              <button
                type="button"
                disabled={credits <= 0}
                onClick={() => { setPriorityUnlocked(true); setCredits((v) => Math.max(0, v - 1)) }}
                className="rounded-xl bg-[var(--trigonum-blue)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                Использовать ◆1 Credit
              </button>
            )}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-xs text-[var(--trigonum-muted)]">Priority capacity</p><p className="mt-1 font-bold">$250,000</p></div>
            <div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-xs text-[var(--trigonum-muted)]">Неиспользованный объём</p><p className="mt-1 font-bold">переходит в Public</p></div>
            <div className="rounded-xl bg-[var(--trigonum-bg)] p-3"><p className="text-xs text-[var(--trigonum-muted)]">Event Credits</p><p className="mt-1 font-bold">нельзя купить</p></div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2"><Wallet size={18} className="text-[var(--trigonum-green)]" /><h3 className="font-bold text-[var(--trigonum-ink)]">Your allocation</h3></div>
          {investedAmount === 0 ? (
            <>
              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <label className="text-sm font-medium text-[var(--trigonum-text)]">
                  Сумма участия
                  <input
                    type="range"
                    min={MIN_INVESTMENT}
                    max={MAX_INVESTMENT}
                    step={5_000}
                    value={desiredAmount}
                    onChange={(e) => setDesiredAmount(Number(e.target.value))}
                    className="mt-3 w-full"
                  />
                  <div className="mt-2 flex justify-between text-xs text-[var(--trigonum-muted)]"><span>$5K</span><b className="text-base text-[var(--trigonum-ink)]">{formatCurrency(desiredAmount)}</b><span>$50K</span></div>
                </label>
                <button
                  type="button"
                  disabled={!canInvest}
                  onClick={() => setInvestedAmount(desiredAmount)}
                  className="rounded-xl bg-[var(--trigonum-green)] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {!canAccess ? 'Сначала открыть Priority' : remaining < desiredAmount ? 'Недостаточно allocation' : `Закрепить ${formatCurrency(desiredAmount)}`}
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="Event share" value={`${((desiredAmount / EVENT_CAPACITY) * 100).toFixed(1)}%`} />
                <Metric label="Target +8%" value={`+${formatCurrency(desiredAmount * 0.08)}`} />
                <Metric label="Target +12%" value={`+${formatCurrency(desiredAmount * 0.12)}`} />
                <Metric label="Available balance" value="$50,000" />
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold text-emerald-800"><BadgeCheck size={18} /> Allocation secured</p>
                  <p className="mt-2 text-3xl font-bold text-emerald-950">{formatCurrency(investedAmount - releasedAmount)}</p>
                  <p className="mt-1 text-xs text-emerald-800">Participant #081 · Priority Window · Event #052</p>
                </div>
                <button type="button" onClick={releaseFive} disabled={investedAmount - releasedAmount < 5_000} className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-bold text-emerald-800 disabled:opacity-40">Release $5K</button>
              </div>
              {releasedAmount > 0 && <p className="mt-3 rounded-xl bg-white p-3 text-xs text-emerald-900">{formatCurrency(releasedAmount)} освобождено и передано в Allocation Queue.</p>}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2"><Activity size={18} className="text-violet-600" /><h3 className="font-bold text-[var(--trigonum-ink)]">Investor Poll · TAIS vs Crowd</h3></div>
          {!pollLocked ? (
            <div className="mt-4">
              <p className="text-sm text-[var(--trigonum-text)]">Сначала зафиксируй собственный прогноз. Crowd будет скрыт до голосования.</p>
              <div className="mt-4 rounded-2xl border border-[var(--trigonum-border)] p-4">
                <div className="flex items-center justify-between"><span className="text-xs text-[var(--trigonum-muted)]">Твой прогноз результата</span><b className="text-2xl">{pollPrediction.toFixed(1)}%</b></div>
                <input type="range" min={-10} max={25} step={0.5} value={pollPrediction} onChange={(e) => setPollPrediction(Number(e.target.value))} className="mt-4 w-full" />
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {(['Low', 'Medium', 'High'] as PollConfidence[]).map((item) => (
                    <button key={item} type="button" onClick={() => setPollConfidence(item)} className={`rounded-lg px-3 py-2 text-xs font-bold ${pollConfidence === item ? 'bg-violet-600 text-white' : 'border border-[var(--trigonum-border)]'}`}>{item} confidence</button>
                  ))}
                  <button type="button" onClick={() => setPollLocked(true)} className="ml-auto rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white">Lock prediction</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric label="Your view" value={`${pollPrediction.toFixed(1)}%`} hint={`${pollConfidence} confidence`} />
              <Metric label="TAIS" value={taisRange} hint="published range" />
              <Metric label="Crowd" value={`${crowdPrediction}%`} hint="median · 1,241 predictions" />
              <div className="sm:col-span-3 rounded-2xl bg-violet-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-violet-700">Example settlement comparison</p>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div><p className="text-xs text-violet-700">TAIS error</p><p className="mt-1 text-xl font-bold">{taisError.toFixed(1)}pp</p></div>
                  <div><p className="text-xs text-violet-700">Your error</p><p className="mt-1 text-xl font-bold">{pollUserError.toFixed(1)}pp</p></div>
                  <div><p className="text-xs text-violet-700">Crowd error</p><p className="mt-1 text-xl font-bold">{crowdError.toFixed(1)}pp</p></div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="flex flex-col gap-5">
        <Card>
          <div className="flex items-center gap-2"><Coins size={18} className="text-amber-600" /><h3 className="font-bold text-[var(--trigonum-ink)]">Event Credits</h3></div>
          <p className="mt-3 text-4xl font-bold">◆ {credits}</p>
          <p className="mt-2 text-sm text-[var(--trigonum-muted)]">Не покупаются за деньги. Используются для Priority Window и специальных прав доступа.</p>
        </Card>

        <Card>
          <div className="flex items-center gap-2"><Users size={18} className="text-[var(--trigonum-blue)]" /><h3 className="font-bold text-[var(--trigonum-ink)]">Allocation Queue</h3></div>
          <div className="mt-3 rounded-xl bg-[var(--trigonum-bg)] p-3">
            <p className="text-xs text-[var(--trigonum-muted)]">Event #051 · FULL</p>
            <p className="mt-1 text-lg font-bold">$1.5M / $1.5M</p>
            <p className="mt-1 text-xs text-[var(--trigonum-muted)]">Allocation может освободиться до deployment.</p>
          </div>
          {queuePosition === null ? (
            <div className="mt-4">
              <label className="text-xs font-semibold text-[var(--trigonum-muted)]">Хочу получить</label>
              <select value={queueDesired} onChange={(e) => setQueueDesired(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-[var(--trigonum-border)] bg-white px-3 py-2.5 text-sm">
                <option value={10_000}>$10,000</option><option value={20_000}>$20,000</option><option value={25_000}>$25,000</option><option value={50_000}>$50,000</option>
              </select>
              <button type="button" onClick={() => setQueuePosition(8)} className="mt-3 w-full rounded-xl bg-[var(--trigonum-ink)] px-4 py-2.5 text-sm font-bold text-white">Встать в очередь</button>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Your position</p>
              <p className="mt-1 text-4xl font-bold text-blue-950">#{queuePosition}</p>
              <p className="mt-2 text-sm text-blue-900">Перед вами 7 инвесторов · $94K запросов.</p>
              <p className="mt-1 text-xs text-blue-800">Requested: {formatCurrency(queueDesired)}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setQueuePosition((v) => v ? Math.max(1, v - 2) : v)} className="flex-1 rounded-xl bg-white px-3 py-2 text-xs font-bold text-blue-800">Симулировать release</button>
                <button type="button" onClick={() => setQueuePosition(null)} className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-blue-700"><X size={15} /></button>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-600" /><h3 className="font-bold text-[var(--trigonum-ink)]">Re-entry Confidence</h3></div>
          <p className="mt-3 text-4xl font-bold">{reentryScore}<span className="text-lg text-[var(--trigonum-muted)]">/100</span></p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[var(--trigonum-muted)]">Returning investors</span><b>{returningInvestorShare}%</b></div>
            <div className="flex justify-between"><span className="text-[var(--trigonum-muted)]">Returning capital</span><b>{returningCapitalShare}%</b></div>
            <div className="flex justify-between"><span className="text-[var(--trigonum-muted)]">Veteran capital 5+ Events</span><b>46%</b></div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2"><Sparkles size={18} className="text-amber-600" /><h3 className="font-bold text-[var(--trigonum-ink)]">Skin in the game</h3></div>
          <p className="mt-3 text-3xl font-bold">$120,000</p>
          <p className="text-sm font-semibold text-emerald-700">12% of Event capacity</p>
          <div className="mt-4 space-y-2 text-xs text-[var(--trigonum-muted)]">
            <p className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Те же условия результата</p>
            <p className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Нет раннего выхода</p>
            <p className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Locked until settlement</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2"><History size={18} /><h3 className="font-bold text-[var(--trigonum-ink)]">Watch without investing</h3></div>
          <p className="mt-2 text-sm text-[var(--trigonum-muted)]">Добавить Event в Missed Opportunity Ledger и после settlement увидеть, что произошло бы с reference amount $10K.</p>
          <button type="button" onClick={() => setWatching((v) => !v)} className={`mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-bold ${watching ? 'bg-emerald-50 text-emerald-700' : 'border border-[var(--trigonum-border)] bg-white'}`}>{watching ? '✓ Event отслеживается' : 'Watch Event'}</button>
        </Card>
      </div>
    </div>
  )
}

function SeasonTab() {
  const totalProfit = seasonEvents.reduce((sum, item) => sum + item.profit, 0)
  const positive = seasonEvents.filter((item) => item.result > 0).length
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden !p-0">
        <div className="bg-[linear-gradient(120deg,#18122b,#3b1f6a,#15435c)] p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">TAIS Events · Season IV</p>
          <h2 className="mt-2 text-3xl font-bold">Season IV · Q3 2026</h2>
          <p className="mt-2 text-sm text-slate-200">Квартальный слой истории Events: результат системы, поведение инвесторов и личный прогресс.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Settled" value={`${seasonEvents.length}`} /><Metric label="Positive" value={`${positive}/${seasonEvents.length}`} /><Metric label="Investor P&L" value={`+${formatCurrency(totalProfit)}`} /><Metric label="TAIS vs Crowd" value="6–2" /></div>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Season timeline">
          <div className="space-y-3">
            {seasonEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3 rounded-xl border border-[var(--trigonum-border)] p-3">
                <span className={`grid size-9 place-items-center rounded-full text-xs font-bold ${event.result >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{event.id.slice(1)}</span>
                <div className="flex-1"><p className="text-sm font-bold">Event {event.id}</p><p className="text-xs text-[var(--trigonum-muted)]">{event.investors} investors · fill {event.fill}</p></div>
                <b className={event.result >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{event.result > 0 ? '+' : ''}{event.result}%</b>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          <Card title="TAIS vs Crowd · Season IV"><div className="grid grid-cols-2 gap-3"><Metric label="TAIS MAE" value="2.1pp" hint="wins 6" /><Metric label="Crowd MAE" value="3.4pp" hint="wins 2" /></div><p className="mt-4 text-sm text-[var(--trigonum-muted)]">MAE — средняя абсолютная ошибка прогноза результата Event.</p></Card>
          <Card title="Your Season"><div className="grid grid-cols-2 gap-3"><Metric label="Participated" value="4 Events" /><Metric label="Realized P&L" value="+$7,420" /><Metric label="Prediction rank" value="Top 18%" /><Metric label="Credits" value="◆◆" /></div></Card>
        </div>
      </div>
    </div>
  )
}

function LedgerTab() {
  const missedUpside = ledgerRows.filter((r) => r.result > 0).reduce((sum, r) => sum + r.reference * (r.result / 100), 0)
  const avoidedLoss = Math.abs(ledgerRows.filter((r) => r.result < 0).reduce((sum, r) => sum + r.reference * (r.result / 100), 0))
  const opportunityCost = missedUpside - avoidedLoss
  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <Card title="Missed Opportunity Ledger">
        <p className="mb-4 text-sm text-[var(--trigonum-muted)]">История решений «наблюдать без участия». Положительные и отрицательные исходы считаются одинаково честно.</p>
        <div className="space-y-2">
          {ledgerRows.map((row) => {
            const hypothetical = row.reference * (row.result / 100)
            return <div key={row.id} className="grid grid-cols-[70px_1fr_90px_100px] items-center gap-2 rounded-xl border border-[var(--trigonum-border)] p-3 text-sm"><b>{row.id}</b><span className="text-[var(--trigonum-muted)]">Reference {formatCurrency(row.reference)}</span><b className={row.result >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{row.result > 0 ? '+' : ''}{row.result}%</b><b className={hypothetical >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{hypothetical > 0 ? '+' : ''}{formatCurrency(hypothetical)}</b></div>
          })}
        </div>
      </Card>
      <div className="space-y-4">
        <Card><p className="text-xs font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Missed upside</p><p className="mt-2 text-3xl font-bold text-amber-700">+{formatCurrency(missedUpside)}</p><p className="mt-1 text-xs text-[var(--trigonum-muted)]">Что могли дать пропущенные положительные Events.</p></Card>
        <Card><p className="text-xs font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Avoided losses</p><p className="mt-2 text-3xl font-bold text-emerald-700">+{formatCurrency(avoidedLoss)}</p><p className="mt-1 text-xs text-[var(--trigonum-muted)]">Потери, которых удалось избежать решением не входить.</p></Card>
        <Card><p className="text-xs font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Net opportunity cost</p><p className={`mt-2 text-3xl font-bold ${opportunityCost > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{opportunityCost > 0 ? '-' : '+'}{formatCurrency(Math.abs(opportunityCost))}</p></Card>
      </div>
    </div>
  )
}

function HallTab() {
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden !p-0"><div className="bg-[linear-gradient(120deg,#201706,#503707,#8b6815)] p-6 text-white"><div className="flex items-center gap-3"><Crown size={26} className="text-amber-300" /><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">Anonymous Hall of Outcomes</p><h2 className="mt-1 text-3xl font-bold">Рекорды экосистемы Events</h2></div></div><p className="mt-3 max-w-2xl text-sm text-amber-100">Только агрегированные результаты и одноразовые anonymous aliases. Суммы вложений и идентичность инвесторов не раскрываются.</p></div></Card>
      <div className="grid gap-4 sm:grid-cols-2">
        {hallRows.map((row) => { const Icon = row.icon; return <Card key={row.label}><Icon size={22} className="text-amber-600" /><p className="mt-4 text-xs font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">{row.label}</p><p className="mt-2 text-3xl font-bold">{row.value}</p><p className="mt-2 text-sm text-[var(--trigonum-muted)]">{row.meta}</p></Card> })}
      </div>
    </div>
  )
}

function CollectionTab() {
  const proofs = [
    { id: '#031', season: 'Season II', result: '+17.8%', badge: 'First 10%', window: 'Priority Window' },
    { id: '#038', season: 'Season III', result: '+8.6%', badge: 'Waitlist Entry', window: 'Queue Allocation' },
    { id: '#041', season: 'Season IV', result: '+12.4%', badge: 'TAIS Beat', window: 'Public Window' },
    { id: '#044', season: 'Season IV', result: '+18.2%', badge: 'Full Capacity', window: 'Priority Window' },
  ]
  return (
    <div className="space-y-5">
      <Card><div className="flex items-center gap-2"><Ticket size={20} className="text-[var(--trigonum-blue)]" /><h2 className="text-xl font-bold">Proof of Participation</h2></div><p className="mt-2 text-sm text-[var(--trigonum-muted)]">Каждый завершённый Event оставляет коллекционный proof: Event, сезон, тип доступа, итог и анонимный participant number. Без раскрытия суммы капитала.</p></Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {proofs.map((proof, index) => (
          <div key={proof.id} className="relative overflow-hidden rounded-2xl border border-[var(--trigonum-border)] bg-white p-5 shadow-sm">
            <div className="absolute right-0 top-0 size-24 rounded-bl-full bg-[color-mix(in_srgb,var(--trigonum-blue)_8%,white)]" />
            <div className="relative"><div className="flex items-center justify-between"><Medal size={24} className="text-[var(--trigonum-blue)]" /><span className="text-xs font-bold text-[var(--trigonum-muted)]">#{String(index + 81).padStart(3, '0')}</span></div><p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[var(--trigonum-muted)]">TAIS EVENT</p><h3 className="mt-1 text-2xl font-bold">{proof.id}</h3><p className="mt-1 text-sm text-[var(--trigonum-muted)]">{proof.season}</p><div className="my-5 h-px bg-[var(--trigonum-border)]" /><p className="text-xs text-[var(--trigonum-muted)]">Settled result</p><p className="mt-1 text-3xl font-bold text-emerald-700">{proof.result}</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">{proof.window}</span><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">{proof.badge}</span></div></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EventsPage() {
  const [view, setView] = useState<MainView>('event')
  const views = useMemo(() => [
    { id: 'event' as const, label: 'Live Event', icon: Activity },
    { id: 'season' as const, label: 'Season IV', icon: Trophy },
    { id: 'ledger' as const, label: 'Missed Ledger', icon: History },
    { id: 'hall' as const, label: 'Hall of Outcomes', icon: Crown },
    { id: 'collection' as const, label: 'My Proofs', icon: Ticket },
  ], [])

  return (
    <div className="pb-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--trigonum-blue)]">TAIS Event Economy</p><h1 className="mt-1 text-3xl font-bold text-[var(--trigonum-ink)]">Events</h1><p className="mt-1 max-w-3xl text-sm text-[var(--trigonum-muted)]">Ограниченные инвестиционные события с живым спросом, private access, очередью allocation, коллективными прогнозами и историей результатов.</p></div>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--trigonum-border)] bg-white px-3 py-2 text-sm"><Clock3 size={16} className="text-[var(--trigonum-blue)]" /><span className="text-[var(--trigonum-muted)]">Next public window</span><b>18:00</b></div>
      </header>

      <nav className="mb-5 flex flex-wrap gap-2">
        {views.map((item) => { const Icon = item.icon; return <ViewButton key={item.id} active={view === item.id} onClick={() => setView(item.id)}><span className="flex items-center gap-2"><Icon size={15} />{item.label}</span></ViewButton> })}
      </nav>

      {view === 'event' && <EventTab />}
      {view === 'season' && <SeasonTab />}
      {view === 'ledger' && <LedgerTab />}
      {view === 'hall' && <HallTab />}
      {view === 'collection' && <CollectionTab />}
    </div>
  )
}
