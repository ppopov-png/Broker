import { capitalTotals } from '../../../shared/mock/data'
import {
  allocationOrder,
  allocationProfile,
  currentAllocation,
  eventHorizonDays,
  realizedPnl,
  unrealizedPnl,
  type AllocationKey,
} from './capital-data'

export type Allocation = Record<AllocationKey, number>

/** Продуктовые ограничения: концентрация в Events и подушка ликвидности. */
export const constraints = {
  maxEventsShare: 30,
  minAvailableShare: 5,
  minEventsAmount: 10_000,
}

export const riskPresets = [
  { key: 'conservative', label: 'Консервативный', maxRisk: 25 },
  { key: 'moderate', label: 'Умеренный', maxRisk: 55 },
  { key: 'aggressive', label: 'Агрессивный', maxRisk: 100 },
] as const

export type RiskPresetKey = (typeof riskPresets)[number]['key']

export function projectedIncome(allocation: Allocation): number {
  return allocationOrder.reduce(
    (sum, key) => sum + ((capitalTotals.total * allocation[key]) / 100) * (allocationProfile[key].apy / 100),
    0,
  )
}

export function riskScore(allocation: Allocation): number {
  return allocationOrder.reduce((sum, key) => sum + (allocation[key] / 100) * allocationProfile[key].risk, 0)
}

export function riskLabel(score: number): { label: string; tone: string } {
  if (score < 25) return { label: 'Консервативный', tone: 'var(--trigonum-success)' }
  if (score < 55) return { label: 'Умеренный', tone: 'var(--trigonum-warning)' }
  return { label: 'Агрессивный', tone: 'var(--trigonum-danger)' }
}

/** Меняем один ползунок, остальные пропорционально ужимаем/растягиваем до суммы в 100%. */
export function rebalance(allocation: Allocation, key: AllocationKey, nextValue: number): Allocation {
  const value = Math.min(100, Math.max(0, nextValue))
  const others = allocationOrder.filter((k) => k !== key)
  const othersTotal = others.reduce((sum, k) => sum + allocation[k], 0)
  const remaining = 100 - value

  const next = { ...allocation, [key]: value } as Allocation
  if (othersTotal === 0) {
    others.forEach((k) => {
      next[k] = remaining / others.length
    })
  } else {
    others.forEach((k) => {
      next[k] = (allocation[k] / othersTotal) * remaining
    })
  }
  return next
}

const STEP = 5

function isAllowed(allocation: Allocation): boolean {
  if (allocation.available < constraints.minAvailableShare) return false
  if (allocation.events > constraints.maxEventsShare) return false
  const eventsAmount = (capitalTotals.total * allocation.events) / 100
  if (eventsAmount > 0 && eventsAmount < constraints.minEventsAmount) return false
  return true
}

function eachCandidate(visit: (allocation: Allocation) => void): void {
  for (let available = 0; available <= 100; available += STEP) {
    for (let earn = 0; earn + available <= 100; earn += STEP) {
      for (let strategies = 0; strategies + earn + available <= 100; strategies += STEP) {
        const events = 100 - available - earn - strategies
        const candidate = { available, earn, strategies, events }
        if (isAllowed(candidate)) visit(candidate)
      }
    }
  }
}

/** Максимальный доход, достижимый в рамках заданного уровня риска. */
export function maxIncomeAtRisk(maxRisk: number): number {
  let best = 0
  eachCandidate((candidate) => {
    if (riskScore(candidate) > maxRisk) return
    best = Math.max(best, projectedIncome(candidate))
  })
  return best
}

export interface SolveResult {
  allocation: Allocation
  income: number
  risk: number
  /** Цель достижима с приемлемой точностью. */
  feasible: boolean
  /** Потолок дохода при этом уровне риска. */
  ceiling: number
}

/** Попадание в цель считаем точным в пределах этого допуска. */
const INCOME_TOLERANCE = 750

/**
 * Подбирает распределение под желаемый доход и потолок риска.
 * Пока цель недостижима — недобор дохода перевешивает всё, поэтому подбирается максимум,
 * а среди вариантов, попавших в цель, выбирается тот, где меньше риска и меньше движений по портфелю.
 */
export function solveAllocation(targetIncome: number, maxRisk: number): SolveResult {
  let best: Allocation = currentAllocation
  let bestScore = Number.POSITIVE_INFINITY
  let ceiling = 0

  eachCandidate((candidate) => {
    const risk = riskScore(candidate)
    if (risk > maxRisk) return

    const income = projectedIncome(candidate)
    ceiling = Math.max(ceiling, income)

    const incomeError = Math.abs(income - targetIncome)
    const moves = allocationOrder.reduce((sum, key) => sum + Math.abs(candidate[key] - currentAllocation[key]), 0)
    const missPenalty = incomeError > INCOME_TOLERANCE ? incomeError * 10 : 0
    const score = missPenalty + incomeError / 100 + risk * 0.15 + moves * 0.4

    if (score < bestScore) {
      bestScore = score
      best = candidate
    }
  })

  const income = projectedIncome(best)
  return {
    allocation: best,
    income,
    risk: riskScore(best),
    feasible: Math.abs(income - targetIncome) <= INCOME_TOLERANCE,
    ceiling,
  }
}

export interface PnlBreakdown {
  alreadyRealized: number
  lockingNow: number
  remainingUnrealized: number
}

/** Сколько прибыли фиксируется при переходе к новому распределению. */
export function pnlOnApply(next: Allocation): PnlBreakdown {
  const cutShare = (key: 'strategies' | 'events') => {
    const current = currentAllocation[key]
    if (current === 0) return 0
    return Math.max(0, current - next[key]) / current
  }

  const lockingNow = unrealizedPnl.strategies * cutShare('strategies') + unrealizedPnl.events * cutShare('events')
  const totalUnrealized = unrealizedPnl.strategies + unrealizedPnl.events

  return {
    alreadyRealized: realizedPnl,
    lockingNow,
    remainingUnrealized: totalUnrealized - lockingNow,
  }
}

export interface YearForecast {
  daysLeft: number
  annualIncome: number
  annualRatePct: number
  incomeRestOfYear: number
  yearEndCapital: number
  twelveMonthsCapital: number
  /** Осторожный сценарий: после закрытия Events деньги лежат без доходности. */
  conservativeYearEndCapital: number
  eventsWorkingDays: number
}

export function yearForecast(allocation: Allocation): YearForecast {
  const now = new Date()
  const yearEnd = new Date(now.getFullYear(), 11, 31)
  const daysLeft = Math.max(0, Math.round((yearEnd.getTime() - now.getTime()) / 86_400_000))

  const annualIncome = projectedIncome(allocation)
  const eventsIncome =
    ((capitalTotals.total * allocation.events) / 100) * (allocationProfile.events.apy / 100)
  const steadyIncome = annualIncome - eventsIncome

  const incomeRestOfYear = (annualIncome * daysLeft) / 365
  const eventsWorkingDays = Math.min(daysLeft, eventHorizonDays)
  const conservativeRest = (steadyIncome * daysLeft) / 365 + (eventsIncome * eventsWorkingDays) / 365

  return {
    daysLeft,
    annualIncome,
    annualRatePct: (annualIncome / capitalTotals.total) * 100,
    incomeRestOfYear,
    yearEndCapital: capitalTotals.total + incomeRestOfYear,
    twelveMonthsCapital: capitalTotals.total + annualIncome,
    conservativeYearEndCapital: capitalTotals.total + conservativeRest,
    eventsWorkingDays,
  }
}
