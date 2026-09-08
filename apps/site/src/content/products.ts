import { calcFees, FEE_SCHEDULES, type FeeFamily } from '@trigonum/shared/fees'

/**
 * База по продуктам для публичных страниц.
 *
 * Агрегаты не задаются числами, а считаются из строк ниже: иначе «всего под
 * управлением» и сумма по списку разъезжаются при первой же правке. Чистый
 * результат инвестора считается той же функцией, что и в кабинете, —
 * модель комиссий одна на оба приложения.
 *
 * Данные прототипа. Перед публикацией заменяются выгрузкой из учётной системы.
 */

export const DATA_AS_OF = '31 августа 2026'

/* --- Закрытые Events ------------------------------------------------------ */

export interface ClosedEvent {
  id: string
  title: string
  category: string
  position: string
  thesis: string
  /** Валовый результат сделки, % от вложенной суммы. */
  result: number
  /** Объём капитала инвесторов в сделке. */
  invested: number
  investors: number
  /** Фактический срок удержания позиции. */
  days: number
  closed: string
}

export const CLOSED_EVENTS: ClosedEvent[] = [
  { id: 'EV-ROT-044', title: 'Ротация капитала в Ethereum', category: 'Ротация капитала', position: 'LONG ETH / SHORT BTC', thesis: 'Относительный спрос смещался в сторону ETH', result: 18.2, invested: 1_600_000, investors: 117, days: 14, closed: '07.08.2026' },
  { id: 'EV-ETF-041', title: 'Ускорение ETF-притоков', category: 'Институциональные потоки', position: 'LONG BTC', thesis: 'Рост чистых притоков в spot Bitcoin ETF', result: 12.4, invested: 1_000_000, investors: 83, days: 11, closed: '28.08.2026' },
  { id: 'EV-FND-046', title: 'Расхождение фондирования', category: 'Фандинг', position: 'SHORT BTC', thesis: 'Аномалия стоимости фондирования указывала на коррекцию', result: 9.4, invested: 1_800_000, investors: 128, days: 6, closed: '22.07.2026' },
  { id: 'EV-STB-042', title: 'Расширение stablecoin-ликвидности', category: 'Ликвидность', position: 'LONG BTC + ETH', thesis: 'Рост свободной ликвидности внутри крипторынка', result: 7.1, invested: 1_400_000, investors: 141, days: 9, closed: '21.08.2026' },
  { id: 'EV-ONC-045', title: 'Снижение биржевого предложения BTC', category: 'On-chain', position: 'LONG BTC', thesis: 'Отток предложения с бирж на длинном горизонте', result: 6.8, invested: 1_250_000, investors: 154, days: 10, closed: '30.07.2026' },
  { id: 'EV-ARB-039', title: 'Премия фьючерсов к спот-рынку', category: 'Деривативы', position: 'ARBITRAGE BTC', thesis: 'Расхождение цены фьючерса и спота выше нормы', result: 5.2, invested: 2_100_000, investors: 186, days: 8, closed: '11.07.2026' },
  { id: 'EV-ETH-038', title: 'Институциональный спрос на ETH', category: 'Институциональные потоки', position: 'LONG ETH', thesis: 'Ускорение относительных потоков капитала в Ethereum', result: 14.6, invested: 900_000, investors: 71, days: 12, closed: '28.06.2026' },
  { id: 'EV-DER-043', title: 'Перегрев длинных позиций', category: 'Деривативы', position: 'SHORT BTC', thesis: 'TAIS ожидала коррекцию перегруженного рынка', result: -4.3, invested: 960_000, investors: 96, days: 5, closed: '14.08.2026' },
  { id: 'EV-LQD-037', title: 'Сжатие ликвидности альткоинов', category: 'Ликвидность', position: 'SHORT ALT BASKET', thesis: 'Отток ликвидности из второго эшелона', result: -2.1, invested: 640_000, investors: 58, days: 7, closed: '19.06.2026' },
  { id: 'EV-MAC-036', title: 'Реакция на данные по инфляции', category: 'Макро', position: 'LONG BTC', thesis: 'Смягчение риторики регулятора поддержит риск-активы', result: 8.9, invested: 1_150_000, investors: 104, days: 4, closed: '05.06.2026' },
]

/** Чистая прибыль инвесторов по сделке — после комиссий, по общей модели. */
export function eventNetProfit(event: ClosedEvent): number {
  const gross = (event.invested * event.result) / 100
  if (gross <= 0) return gross
  return calcFees({
    amount: event.invested,
    months: event.days / 30,
    grossProfit: gross,
    schedule: FEE_SCHEDULES.event,
  }).net
}

/* --- Стратегии ------------------------------------------------------------ */

export interface StrategyRow {
  id: string
  name: string
  profile: 'Консервативная' | 'Умеренная' | 'Агрессивная'
  family: FeeFamily
  target: string
  /** Фактическая доходность за последние 12 месяцев, % годовых. */
  actual: number
  /** Максимальная просадка за период, %. */
  drawdown: number
  /** Капитал под управлением сейчас. */
  aum: number
  investors: number
  /** Квартальная динамика за год, % — для спарклайна. */
  quarters: number[]
  since: string
}

export const STRATEGIES: StrategyRow[] = [
  {
    id: 'stable-income',
    name: 'Stable Income',
    profile: 'Консервативная',
    family: 'conservative',
    target: '8–10%',
    actual: 9.4,
    drawdown: 2.1,
    aum: 4_820_000,
    investors: 214,
    quarters: [2.1, 2.4, 2.2, 2.7],
    since: 'март 2025',
  },
  {
    id: 'balanced-growth',
    name: 'Balanced Growth',
    profile: 'Умеренная',
    family: 'balanced',
    target: '10–14%',
    actual: 13.1,
    drawdown: 6.4,
    aum: 7_340_000,
    investors: 168,
    quarters: [3.8, 2.1, 4.2, 3.0],
    since: 'ноябрь 2024',
  },
  {
    id: 'alpha-momentum',
    name: 'Alpha Momentum',
    profile: 'Агрессивная',
    family: 'aggressive',
    target: '15–20%',
    actual: 21.7,
    drawdown: 17.8,
    aum: 3_260_000,
    investors: 97,
    quarters: [7.4, -3.1, 9.8, 7.6],
    since: 'январь 2025',
  },
]

/** Чистая доходность инвестора после комиссий, % годовых. */
export function strategyNetReturn(strategy: StrategyRow): number {
  const notional = 100_000
  const fees = calcFees({
    amount: notional,
    months: 12,
    grossProfit: (notional * strategy.actual) / 100,
    schedule: FEE_SCHEDULES[strategy.family],
  })
  return (fees.net / notional) * 100
}

/* --- Earn ----------------------------------------------------------------- */

export const EARN_STATS = {
  rate: 7,
  aum: 12_450_000,
  investors: 612,
  /** Выплачено дохода за всё время. */
  paidOut: 706_000,
  /** Среднее время исполнения заявки на вывод, дней. */
  withdrawDays: 3.2,
  /** Месяцев без единой задержки выплаты. */
  monthsWithoutDelay: 18,
}

/* --- Агрегаты ------------------------------------------------------------- */

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

export const EVENTS_SUMMARY = {
  total: CLOSED_EVENTS.length,
  profitable: CLOSED_EVENTS.filter((event) => event.result > 0).length,
  volume: sum(CLOSED_EVENTS.map((event) => event.invested)),
  investors: sum(CLOSED_EVENTS.map((event) => event.investors)),
  netProfit: sum(CLOSED_EVENTS.map(eventNetProfit)),
  /** Средневзвешенный по объёму результат — среднее по сделкам исказило бы мелкие. */
  weightedResult:
    sum(CLOSED_EVENTS.map((event) => (event.invested * event.result) / 100)) /
    sum(CLOSED_EVENTS.map((event) => event.invested)) *
    100,
  bestResult: Math.max(...CLOSED_EVENTS.map((event) => event.result)),
  worstResult: Math.min(...CLOSED_EVENTS.map((event) => event.result)),
  averageDays: Math.round(sum(CLOSED_EVENTS.map((event) => event.days)) / CLOSED_EVENTS.length),
}

export const STRATEGIES_SUMMARY = {
  aum: sum(STRATEGIES.map((strategy) => strategy.aum)),
  investors: sum(STRATEGIES.map((strategy) => strategy.investors)),
  /** Средневзвешенная по капиталу чистая доходность. */
  weightedNet:
    sum(STRATEGIES.map((strategy) => strategy.aum * strategyNetReturn(strategy))) /
    sum(STRATEGIES.map((strategy) => strategy.aum)),
  /** Заработано инвесторами за 12 месяцев после комиссий. */
  netProfit: sum(STRATEGIES.map((strategy) => (strategy.aum * strategyNetReturn(strategy)) / 100)),
}

export const PLATFORM_SUMMARY = {
  aum: EARN_STATS.aum + STRATEGIES_SUMMARY.aum,
  investors: EARN_STATS.investors + STRATEGIES_SUMMARY.investors,
  paidOut: EARN_STATS.paidOut + STRATEGIES_SUMMARY.netProfit + EVENTS_SUMMARY.netProfit,
}
