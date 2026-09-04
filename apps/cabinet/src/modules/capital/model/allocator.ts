import { capitalTotals } from '../../../shared/mock/data'
import {
  allocationOrder,
  allocationProfile,
  currentAllocation,
  currentLocks,
  earningSources,
  eventHorizonDays,
  lockDays,
  type AllocationKey,
  type SourceKey,
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

/**
 * Тело Earn/Strategies/Events заблокировано (лок ~3 месяца, Events — до закрытия окна).
 * Уменьшить долю сейчас можно только на уже начисленную и ликвидную прибыль (`earned`) —
 * остаток уходит в очередь до даты разлока. Увеличение доли — это довнесение новых денег:
 * для Earn/Strategies оно открывает отдельный параллельный лок и не трогает старый;
 * для Events довнесённое просто присоединяется к сроку того же события.
 */
export interface BucketPlan {
  key: AllocationKey
  fromAmount: number
  toAmount: number
  deltaAmount: number
  /** Сколько по факту сдвинется прямо сейчас (вывод ликвидной прибыли, переброс кэша или довложение из пула). */
  liquidNow: number
  /** Сколько не удастся сдвинуть немедленно. */
  queued: number
  /** Причина: тело в локе (есть дата) или просто не хватило высвобожденного кэша на все довложения сразу. */
  queuedReason?: 'lock' | 'funding'
  queuedUntil?: string
  newLock?: { amount: number; unlockDate: string; parallel: boolean }
}

export function bucketAmount(allocation: Allocation, key: AllocationKey): number {
  return (capitalTotals.total * allocation[key]) / 100
}

function unlockDateFor(sourceKey: SourceKey): string {
  return sourceKey === 'events' ? currentLocks.events.unlockDate : new Date(Date.now() + lockDays[sourceKey] * 86_400_000).toISOString().slice(0, 10)
}

/**
 * Считаем план в два прохода: сначала — сколько кэша реально высвобождается прямо сейчас
 * (уменьшение Available + ликвидная прибыль по сокращаемым локам), потом этим пулом
 * покрываем довложения по порядку. Если пула не хватает на все увеличения — остаток
 * помечается как «ждёт поступления средств», без даты (это не лок, а нехватка кэша).
 */
export function buildExecutionPlan(next: Allocation): BucketPlan[] {
  const raw = allocationOrder.map((key) => {
    const fromAmount = bucketAmount(currentAllocation, key)
    const toAmount = bucketAmount(next, key)
    return { key, fromAmount, toAmount, deltaAmount: toAmount - fromAmount }
  })

  const decreaseInfo = new Map<AllocationKey, { claimable: number; queued: number; queuedUntil: string }>()
  let pool = 0

  for (const r of raw) {
    if (r.deltaAmount >= 0) continue
    if (r.key === 'available') {
      pool += -r.deltaAmount
      continue
    }
    const sourceKey = r.key as SourceKey
    const source = earningSources.find((s) => s.key === sourceKey)!
    const reduceBy = -r.deltaAmount
    const claimable = Math.min(reduceBy, source.earned)
    pool += claimable
    decreaseInfo.set(r.key, { claimable, queued: reduceBy - claimable, queuedUntil: currentLocks[sourceKey].unlockDate })
  }

  return raw.map((r): BucketPlan => {
    if (r.deltaAmount < 0) {
      if (r.key === 'available') return { ...r, liquidNow: r.deltaAmount, queued: 0 }
      const info = decreaseInfo.get(r.key)!
      return {
        ...r,
        liquidNow: -info.claimable,
        queued: info.queued,
        queuedReason: info.queued > 0 ? 'lock' : undefined,
        queuedUntil: info.queued > 0 ? info.queuedUntil : undefined,
      }
    }

    // Увеличение доли покрываем из пула высвобожденного кэша — по порядку, пока пул не кончится.
    const funded = Math.min(r.deltaAmount, pool)
    pool -= funded
    const shortfall = r.deltaAmount - funded

    if (r.key === 'available') {
      return { ...r, liquidNow: funded, queued: shortfall, queuedReason: shortfall > 0 ? 'funding' : undefined }
    }

    const sourceKey = r.key as SourceKey
    return {
      ...r,
      liquidNow: funded,
      queued: shortfall,
      queuedReason: shortfall > 0 ? 'funding' : undefined,
      newLock: funded > 0 ? { amount: funded, unlockDate: unlockDateFor(sourceKey), parallel: sourceKey !== 'events' } : undefined,
    }
  })
}

export interface ExecutionSummary {
  plans: BucketPlan[]
  liquidNow: number
  queued: number
  /** Часть очереди из-за лока тела капитала (Earn/Strategies/Events). */
  queuedLock: number
  /** Часть очереди из-за того, что от сокращений освободилось меньше кэша, чем нужно на довложения. */
  queuedFunding: number
  hasLockQueue: boolean
  hasFundingQueue: boolean
  hasNewLock: boolean
}

export function summarizePlan(next: Allocation): ExecutionSummary {
  const plans = buildExecutionPlan(next)
  const queuedBy = (reason: 'lock' | 'funding') => plans.reduce((sum, p) => sum + (p.queuedReason === reason ? p.queued : 0), 0)
  return {
    plans,
    liquidNow: plans.reduce((sum, p) => sum + Math.max(0, p.liquidNow), 0),
    queued: plans.reduce((sum, p) => sum + p.queued, 0),
    queuedLock: queuedBy('lock'),
    queuedFunding: queuedBy('funding'),
    hasLockQueue: plans.some((p) => p.queuedReason === 'lock'),
    hasFundingQueue: plans.some((p) => p.queuedReason === 'funding'),
    hasNewLock: plans.some((p) => p.newLock),
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
