/**
 * Комиссии Trigonum — единственный источник правды по монетизации.
 *
 * Модель одна на все продукты и держится на двух числах:
 *
 * - За управление — 2% от суммы пополнения, разово, в момент зачисления
 *   средств на продукт. Не годовые: срок размещения на неё не влияет, и
 *   клиент видит цену входа сразу, а не находит её в выписке через месяц.
 * - За результат — доля брокера в фактической прибыли: Earn 0%, стратегии
 *   10%, Events 20%. Барьера нет: доля берётся с любой прибыли, а при
 *   убытке не берётся вовсе.
 *
 * Исключение одно — Earn: там ставка фиксирована договором и публикуется
 * уже чистой, комиссия за управление удержана до публикации.
 *
 * В стратегиях действует high-water mark: следующая прибыль сначала
 * закрывает предыдущую просадку, и только остаток делится.
 */

export type FeeFamily = 'earn' | 'conservative' | 'balanced' | 'aggressive' | 'event'

export interface FeeSchedule {
  /**
   * Комиссия за управление, % от суммы пополнения. Удерживается разово в
   * момент внесения средств, а не начисляется по дням: клиент видит цену
   * входа сразу, а не обнаруживает её в выписке через месяц.
   */
  managementOnDeposit: number
  /** Доля брокера в прибыли, %. Ноль — комиссии за результат нет. */
  resultShare: number
  /**
   * Публикуемая доходность уже за вычетом комиссии за управление.
   * Так устроен только Earn — там ставка фиксирована и клиенту важно
   * видеть ровно то, что он получит.
   */
  netOfManagement: boolean
  /**
   * Комиссия за результат берётся только с прироста над историческим
   * максимумом счёта. Для сделок Events не применяется.
   */
  highWaterMark: boolean
}

/** Комиссия за управление одна на все продукты. */
export const MANAGEMENT_ON_DEPOSIT = 2

export const FEE_SCHEDULES: Record<FeeFamily, FeeSchedule> = {
  earn: { managementOnDeposit: MANAGEMENT_ON_DEPOSIT, resultShare: 0, netOfManagement: true, highWaterMark: false },
  conservative: { managementOnDeposit: MANAGEMENT_ON_DEPOSIT, resultShare: 10, netOfManagement: false, highWaterMark: true },
  balanced: { managementOnDeposit: MANAGEMENT_ON_DEPOSIT, resultShare: 10, netOfManagement: false, highWaterMark: true },
  aggressive: { managementOnDeposit: MANAGEMENT_ON_DEPOSIT, resultShare: 10, netOfManagement: false, highWaterMark: true },
  event: { managementOnDeposit: MANAGEMENT_ON_DEPOSIT, resultShare: 20, netOfManagement: false, highWaterMark: false },
}

export interface FeeBreakdown {
  /** Валовая прибыль до комиссий. */
  gross: number
  /** Комиссия за управление, удержанная при пополнении. */
  management: number
  /** База для комиссии за результат: прибыль сверх непокрытого убытка. */
  resultBase: number
  /** Комиссия за результат. */
  result: number
  /** Что остаётся клиенту. */
  net: number
  /** Суммарная комиссия. */
  total: number
  /** Доля комиссий в валовой прибыли, %. */
  share: number
}

export interface FeeInput {
  /** Сумма под управлением. */
  amount: number
  /** Валовая прибыль за период до комиссий. */
  grossProfit: number
  schedule: FeeSchedule
  /**
   * Незакрытый убыток предыдущих периодов. Пока он не отработан, комиссии
   * за результат нет — иначе клиент платил бы дважды за одни и те же деньги.
   */
  drawdown?: number
}

/**
 * Комиссия за управление считается от суммы, а за результат — от прибыли
 * сверх барьера. Порядок важен: сначала удерживается управление, и только
 * оставшаяся прибыль участвует в расчёте результата. Иначе клиент платил бы
 * долю с денег, которые уже ушли на комиссию.
 */
export function calcFees({ amount, grossProfit, schedule, drawdown = 0 }: FeeInput): FeeBreakdown {
  const base = Math.max(0, amount)
  // Управление удерживается от суммы входа, поэтому не зависит от срока.
  const management = schedule.netOfManagement ? 0 : (base * schedule.managementOnDeposit) / 100

  const recovered = schedule.highWaterMark ? Math.max(0, drawdown) : 0
  const resultBase = Math.max(0, grossProfit - recovered)
  const result = (resultBase * schedule.resultShare) / 100

  const total = management + result
  const net = grossProfit - total

  return {
    gross: grossProfit,
    management,
    resultBase,
    result,
    net,
    total,
    share: grossProfit > 0 ? (total / grossProfit) * 100 : 0,
  }
}

/** Короткая формулировка комиссий для карточек продукта. */
export function feeLabel(schedule: FeeSchedule): string {
  const management = `${schedule.managementOnDeposit}% при пополнении`
  if (schedule.netOfManagement) return `${management}, уже учтена в ставке`
  if (schedule.resultShare === 0) return `${management}, комиссии за результат нет`
  return `${management} + ${schedule.resultShare}% от прибыли`
}
