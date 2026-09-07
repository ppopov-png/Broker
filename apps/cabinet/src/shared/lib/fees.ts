/**
 * Комиссии Trigonum — единственный источник правды по монетизации.
 *
 * Три продукта зарабатывают по-разному, и это принципиально:
 *
 * - Earn: брокер размещает средства и живёт на разнице ставок. Клиенту
 *   публикуется уже чистая ставка, комиссия за управление 1% годовых
 *   удержана до публикации. Комиссии за результат нет — результат
 *   фиксирован договором.
 * - Стратегии: 2% годовых за управление. Комиссии за результат сейчас нет —
 *   поля модели (resultShare, hurdleAnnual, highWaterMark) сохранены, чтобы
 *   включить её изменением одной строки, а не переписыванием расчёта.
 * - Events: те же 2% годовых pro rata за срок сделки плюс доля от прибыли
 *   сделки сверх барьера. Максимума нет — каждая сделка самостоятельна.
 */

export type FeeFamily = 'earn' | 'strategy' | 'event'

export interface FeeSchedule {
  /** Комиссия за управление, % годовых от суммы под управлением. */
  managementAnnual: number
  /** Доля брокера в прибыли, % . Ноль — комиссии за результат нет. */
  resultShare: number
  /**
   * Барьерная доходность, % годовых. Комиссия за результат берётся только
   * с прибыли сверх барьера: клиент сначала получает базовую доходность.
   */
  hurdleAnnual: number
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

export const FEE_SCHEDULES: Record<FeeFamily, FeeSchedule> = {
  earn: { managementAnnual: 1, resultShare: 0, hurdleAnnual: 0, netOfManagement: true, highWaterMark: false },
  strategy: { managementAnnual: 2, resultShare: 0, hurdleAnnual: 0, netOfManagement: false, highWaterMark: true },
  event: { managementAnnual: 2, resultShare: 20, hurdleAnnual: 8, netOfManagement: false, highWaterMark: false },
}

export interface FeeBreakdown {
  /** Валовая прибыль до комиссий. */
  gross: number
  /** Комиссия за управление за период. */
  management: number
  /** Барьер в деньгах — прибыль, с которой комиссия за результат не берётся. */
  hurdle: number
  /** База для комиссии за результат: прибыль сверх барьера и максимума. */
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
  /** Срок в месяцах, за который считаем. */
  months: number
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
export function calcFees({ amount, months, grossProfit, schedule, drawdown = 0 }: FeeInput): FeeBreakdown {
  const years = Math.max(0, months) / 12
  const management = schedule.netOfManagement ? 0 : (Math.max(0, amount) * schedule.managementAnnual) / 100 * years
  const afterManagement = grossProfit - management

  const hurdle = (Math.max(0, amount) * schedule.hurdleAnnual) / 100 * years
  const recovered = schedule.highWaterMark ? Math.max(0, drawdown) : 0
  const resultBase = Math.max(0, afterManagement - hurdle - recovered)
  const result = (resultBase * schedule.resultShare) / 100

  const net = grossProfit - management - result
  const total = management + result

  return {
    gross: grossProfit,
    management,
    hurdle,
    resultBase,
    result,
    net,
    total,
    share: grossProfit > 0 ? (total / grossProfit) * 100 : 0,
  }
}

/** Короткая формулировка комиссий для карточек продукта. */
export function feeLabel(schedule: FeeSchedule): string {
  const management = `${schedule.managementAnnual}% годовых за управление`
  if (schedule.netOfManagement) return `${management}, уже учтена в ставке`
  if (schedule.resultShare === 0) return `${management}, комиссии за результат нет`
  return `${management} + ${schedule.resultShare}% от прибыли сверх ${schedule.hurdleAnnual}%`
}
