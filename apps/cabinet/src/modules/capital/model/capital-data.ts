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

export interface DailyAccrual {
  date: string
  amount: number
  level: 0 | 1 | 2 | 3 | 4
}

/** Детерминированный псевдослучайный ряд, чтобы heatmap не менялся между рендерами. */
function pseudoRandom(seed: number): number {
  return Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1
}

function buildAccruals(days: number): DailyAccrual[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (days - 1 - i))
    const roll = pseudoRandom(i + 1)
    const amount = roll < 0.07 ? 0 : Math.round((5 + roll * 42) * 100) / 100
    const level: DailyAccrual['level'] =
      amount === 0 ? 0 : amount < 14 ? 1 : amount < 26 ? 2 : amount < 38 ? 3 : 4
    return { date: date.toISOString().slice(0, 10), amount, level }
  })
}

export const dailyAccruals = buildAccruals(182)

export const accrualStreak = (() => {
  let current = 0
  for (let i = dailyAccruals.length - 1; i >= 0; i -= 1) {
    if (dailyAccruals[i].amount === 0) break
    current += 1
  }
  let best = 0
  let run = 0
  for (const day of dailyAccruals) {
    run = day.amount === 0 ? 0 : run + 1
    best = Math.max(best, run)
  }
  return { current, best }
})()

export const accrualTotal = dailyAccruals.reduce((sum, d) => sum + d.amount, 0)

export const capitalGoalDefault = 500_000

export const investingSince = '2024-03-12'

/** Начисления Earn уже зачислены на баланс — эта прибыль зафиксирована. */
export const realizedPnl = 1_950

/** Прибыль по открытым позициям: фиксируется только при выходе из них. */
export const unrealizedPnl = { strategies: 6_286, events: 184 }

/** Сколько ещё работает активный Event до закрытия окна. */
export const eventHorizonDays = 45
