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

/**
 * Схема комиссий привязана к профилю риска, а не к продукту целиком:
 * стратегии различаются не только целевой доходностью, но и долей брокера
 * в результате — выше риск, выше участие в верхней части.
 */
export type FeeFamily = 'earn' | 'conservative' | 'balanced' | 'aggressive' | 'event'

export interface FeeSchedule {
  /** Комиссия за управление, % годовых от суммы под управлением. */
  managementAnnual: number
  /** Базовая доля брокера в прибыли, %. Ноль — комиссии за результат нет. */
  resultShare: number
  /**
   * Барьерная доходность, % годовых. Базовая доля берётся только с прибыли
   * сверх него. В стратегиях барьера нет: брокер участвует в результате с
   * первого заработанного доллара, но по сниженной ставке.
   */
  hurdleAnnual: number
  /**
   * Повышенная доля с части прибыли, превысившей целевую доходность.
   * Начисляется поверх базовой, а не вместо неё. Ноль — второго уровня нет.
   */
  outperformanceShare: number
  /** Верхняя граница целевого диапазона, % годовых: с превышения идёт повышенная доля. */
  targetAnnual: number
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
  earn: {
    managementAnnual: 1,
    resultShare: 0,
    hurdleAnnual: 0,
    outperformanceShare: 0,
    targetAnnual: 0,
    netOfManagement: true,
    highWaterMark: false,
  },
  conservative: {
    managementAnnual: 2,
    resultShare: 10,
    hurdleAnnual: 0,
    outperformanceShare: 20,
    targetAnnual: 10,
    netOfManagement: false,
    highWaterMark: true,
  },
  balanced: {
    managementAnnual: 2,
    resultShare: 15,
    hurdleAnnual: 0,
    outperformanceShare: 25,
    targetAnnual: 14,
    netOfManagement: false,
    highWaterMark: true,
  },
  aggressive: {
    managementAnnual: 2,
    resultShare: 20,
    hurdleAnnual: 0,
    outperformanceShare: 30,
    targetAnnual: 20,
    netOfManagement: false,
    highWaterMark: true,
  },
  event: {
    managementAnnual: 2,
    resultShare: 20,
    hurdleAnnual: 8,
    outperformanceShare: 0,
    targetAnnual: 0,
    netOfManagement: false,
    highWaterMark: false,
  },
}

export interface FeeBreakdown {
  /** Валовая прибыль до комиссий. */
  gross: number
  /** Комиссия за управление за период. */
  management: number
  /** Барьер в деньгах — прибыль, с которой комиссия за результат не берётся. */
  hurdle: number
  /** База для базовой комиссии: прибыль сверх барьера и максимума. */
  resultBase: number
  /** Базовая комиссия за результат. */
  result: number
  /** Целевая прибыль в деньгах — граница, выше которой доля повышается. */
  target: number
  /** Часть прибыли сверх целевой. */
  outperformanceBase: number
  /** Повышенная комиссия, начисляется поверх базовой. */
  outperformance: number
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
  const base = Math.max(0, amount)
  const management = schedule.netOfManagement ? 0 : (base * schedule.managementAnnual) / 100 * years
  const afterManagement = grossProfit - management

  const hurdle = (base * schedule.hurdleAnnual) / 100 * years
  const recovered = schedule.highWaterMark ? Math.max(0, drawdown) : 0

  const resultBase = Math.max(0, afterManagement - hurdle - recovered)
  const result = (resultBase * schedule.resultShare) / 100

  // Повышенная доля идёт поверх базовой и только с части сверх целевой
  // доходности: иначе превышение цели облагалось бы дважды по полной ставке.
  const target = (base * schedule.targetAnnual) / 100 * years
  const outperformanceBase =
    schedule.outperformanceShare > 0 ? Math.max(0, afterManagement - target - recovered) : 0
  const outperformance = (outperformanceBase * schedule.outperformanceShare) / 100

  const total = management + result + outperformance
  const net = grossProfit - total

  return {
    gross: grossProfit,
    management,
    hurdle,
    resultBase,
    result,
    target,
    outperformanceBase,
    outperformance,
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
  if (schedule.outperformanceShare > 0) {
    return `${management} + ${schedule.resultShare}% от прибыли, ${schedule.outperformanceShare}% сверх ${schedule.targetAnnual}%`
  }
  return `${management} + ${schedule.resultShare}% от прибыли сверх ${schedule.hurdleAnnual}%`
}
