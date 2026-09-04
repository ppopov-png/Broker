export type SourceKey = 'earn' | 'strategies' | 'events'
export type AllocationKey = 'available' | SourceKey

export interface EarningSource {
  key: SourceKey
  label: string
  principal: number
  apy: number
  earned: number
  color: string
  hint: string
}

/** Заработок по источникам. Сумма earned совпадает с общей прибылью в capitalTotals. */
export const earningSources: EarningSource[] = [
  { key: 'earn', label: 'Earn', principal: 100_000, apy: 7, earned: 1_950, color: 'var(--trigonum-blue)', hint: 'Базовая доходность с ежедневным начислением' },
  { key: 'strategies', label: 'Strategies', principal: 75_000, apy: 12, earned: 6_286, color: 'var(--trigonum-violet)', hint: 'Управляемые стратегии Trigonum' },
  { key: 'events', label: 'Events', principal: 25_000, apy: 15, earned: 184, color: 'var(--trigonum-green)', hint: 'Событийные возможности TAIS' },
]

export const totalEarned = earningSources.reduce((sum, s) => sum + s.earned, 0)

const SECONDS_PER_YEAR = 365 * 24 * 60 * 60

/** Сколько капитал приносит в секунду при текущем распределении. */
export const earningsPerSecond =
  earningSources.reduce((sum, s) => sum + (s.principal * s.apy) / 100, 0) / SECONDS_PER_YEAR

/** Годовая доходность и вклад в риск-профиль по каждому направлению. */
export const allocationProfile: Record<AllocationKey, { label: string; apy: number; risk: number; color: string }> = {
  available: { label: 'Available', apy: 0, risk: 0, color: '#7cc5f7' },
  earn: { label: 'Earn', apy: 7, risk: 20, color: 'var(--trigonum-blue)' },
  strategies: { label: 'Strategies', apy: 12, risk: 65, color: 'var(--trigonum-violet)' },
  events: { label: 'Events', apy: 15, risk: 90, color: 'var(--trigonum-green)' },
}

export const allocationOrder: AllocationKey[] = ['available', 'earn', 'strategies', 'events']

export const currentAllocation: Record<AllocationKey, number> = {
  available: 20,
  earn: 40,
  strategies: 30,
  events: 10,
}

/* --- Блокировки тела капитала --------------------------------------- */

const today = new Date()
today.setHours(0, 0, 0, 0)
function daysFromNow(n: number): string {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Сколько ещё работает активный Event до закрытия окна. */
export const eventHorizonDays = 45

/** Ориентировочный лок тела капитала: Earn и Strategies — 3 месяца, Events — до закрытия окна события. */
export const lockDays: Record<SourceKey, number> = { earn: 90, strategies: 90, events: eventHorizonDays }

export interface CurrentLock {
  amount: number
  unlockDate: string
}

/**
 * Упрощение прототипа: текущее тело каждого продукта считается одним активным локом.
 * Новые деньги, довнесённые сверху, открывают отдельный параллельный лок (см. allocator.ts) —
 * кроме Events, где всё, что заходит сейчас, привязано к сроку того же события.
 */
export const currentLocks: Record<SourceKey, CurrentLock> = {
  earn: { amount: earningSources[0].principal, unlockDate: daysFromNow(41) },
  strategies: { amount: earningSources[1].principal, unlockDate: daysFromNow(67) },
  events: { amount: earningSources[2].principal, unlockDate: daysFromNow(eventHorizonDays) },
}

export interface InvestorLevel {
  key: string
  label: string
  threshold: number
  perks: string[]
}

export const investorLevels: InvestorLevel[] = [
  { key: 'bronze', label: 'Bronze', threshold: 0, perks: ['Earn и базовые продукты', 'Поддержка 24/7'] },
  { key: 'silver', label: 'Silver', threshold: 50_000, perks: ['Доступ к Strategies', 'Сниженная комиссия вывода'] },
  { key: 'gold', label: 'Gold', threshold: 150_000, perks: ['Ранний доступ к Events', 'Приоритетная поддержка', 'Персональные отчёты'] },
  { key: 'platinum', label: 'Platinum', threshold: 500_000, perks: ['Персональный менеджер', 'Индивидуальные условия', 'Закрытые Events'] },
]

export interface Achievement {
  id: string
  title: string
  description: string
  unlocked: boolean
  date?: string
  progress?: string
}

export const achievements: Achievement[] = [
  { id: 'first-deposit', title: 'Первый шаг', description: 'Первое пополнение счёта', unlocked: true, date: '12.03.2024' },
  { id: 'six-figures', title: 'Шестизначный', description: 'Капитал превысил $100,000', unlocked: true, date: '22.10.2024' },
  { id: 'diversifier', title: 'Диверсификатор', description: 'Капитал сразу в трёх продуктах', unlocked: true, date: '09.01.2025' },
  { id: 'first-event', title: 'Первый Event', description: 'Участие в событийной возможности', unlocked: true, date: '18.03.2025' },
  { id: 'earn-100', title: '100 дней в Earn', description: 'Непрерывно в Earn 100 дней', unlocked: true, date: '19.04.2025' },
  { id: 'marathon', title: 'Марафонец', description: '12 месяцев без вывода средств', unlocked: false, progress: '8 из 12 мес.' },
  { id: 'event-hunter', title: 'Охотник за Events', description: 'Участие в пяти событиях', unlocked: false, progress: '1 из 5' },
  { id: 'half-million', title: 'Полмиллиона', description: 'Капитал достиг $500,000', unlocked: false, progress: '$250,000 из $500,000' },
]

/* --- Календарь начислений --------------------------------------------
 * Earn почти всегда в плюсе (продукт без риска тела). Strategies и Events —
 * рыночная переоценка, поэтому у них бывают отрицательные дни: это ещё не
 * убыток по факту, а нереализованная просадка на конкретный день.
 */

export interface DailyAccrual {
  date: string
  amount: number
  bySource: Record<SourceKey, number>
  level: -2 | -1 | 0 | 1 | 2 | 3 | 4
}

/** Детерминированный псевдослучайный ряд, чтобы heatmap не менялся между рендерами. */
function pseudoRandom(seed: number): number {
  return Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1
}

function levelFor(amount: number): DailyAccrual['level'] {
  if (amount <= -20) return -2
  if (amount < 0) return -1
  if (amount === 0) return 0
  if (amount < 14) return 1
  if (amount < 26) return 2
  if (amount < 38) return 3
  return 4
}

function buildAccruals(days: number): DailyAccrual[] {
  const base: Record<SourceKey, number> = {
    earn: (earningSources[0].principal * earningSources[0].apy) / 100 / 365,
    strategies: (earningSources[1].principal * earningSources[1].apy) / 100 / 365,
    events: (earningSources[2].principal * earningSources[2].apy) / 100 / 365,
  }

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (days - 1 - i))

    // Earn — фиксированная доходность, почти без просадок.
    const earn = Math.round(base.earn * (0.85 + pseudoRandom(i * 3 + 1) * 0.3) * 100) / 100
    // Strategies — рыночная переоценка: около 27% дней уходят в минус.
    const strategies = Math.round(base.strategies * (pseudoRandom(i * 3 + 2) * 3 - 0.8) * 100) / 100
    // Events — самая волатильная часть: просадки чаще и глубже.
    const events = Math.round(base.events * (pseudoRandom(i * 3 + 3) * 4 - 1.2) * 100) / 100

    const amount = Math.round((earn + strategies + events) * 100) / 100
    return {
      date: date.toISOString().slice(0, 10),
      amount,
      bySource: { earn, strategies, events },
      level: levelFor(amount),
    }
  })
}

export const dailyAccruals = buildAccruals(182)

export const accrualStreak = (() => {
  let current = 0
  for (let i = dailyAccruals.length - 1; i >= 0; i -= 1) {
    if (dailyAccruals[i].amount <= 0) break
    current += 1
  }
  let best = 0
  let run = 0
  for (const day of dailyAccruals) {
    run = day.amount > 0 ? run + 1 : 0
    best = Math.max(best, run)
  }
  return { current, best }
})()

export const accrualTotal = dailyAccruals.reduce((sum, d) => sum + d.amount, 0)

export function accrualBreakdown(day: DailyAccrual) {
  return earningSources.map((s) => ({ key: s.key, label: s.label, color: s.color, amount: day.bySource[s.key] }))
}

export interface MonthlyAccrual {
  key: string
  label: string
  amount: number
}

export const monthlyAccruals: MonthlyAccrual[] = (() => {
  const buckets = new Map<string, number>()
  for (const day of dailyAccruals) {
    const key = day.date.slice(0, 7)
    buckets.set(key, (buckets.get(key) ?? 0) + day.amount)
  }
  return [...buckets.entries()].map(([key, amount]) => ({
    key,
    label: new Date(`${key}-01`).toLocaleDateString('ru-RU', { month: 'short' }),
    amount,
  }))
})()

export const bestAccrualDay = dailyAccruals.reduce((max, d) => (d.amount > max.amount ? d : max), dailyAccruals[0])
export const worstAccrualDay = dailyAccruals.reduce((min, d) => (d.amount < min.amount ? d : min), dailyAccruals[0])

export const capitalGoalDefault = 500_000

export const investingSince = '2024-03-12'
