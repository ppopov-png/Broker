import { liveEvents } from '../../events/model/live-events'
import { loadContracts, type InvestContract } from '../../../shared/mock/contracts'

export interface UpcomingPayout {
  id: string
  product: string
  amount: number
  date: Date
  /** Начисление уходит обратно в тело контракта. */
  reinvest: boolean
}

const payoutMonths: { match: RegExp; months: number }[] = [
  { match: /месяц/i, months: 1 },
  { match: /квартал/i, months: 3 },
  { match: /полгода|полугод/i, months: 6 },
  { match: /год/i, months: 12 },
]

function periodMonths(label: string | undefined): number {
  if (!label) return 1
  return payoutMonths.find((item) => item.match.test(label))?.months ?? 1
}

/** Из «целевая 10–14%» и «~7% годовых» берём первое число как ставку. */
function annualRate(label: string | undefined): number {
  const found = label?.match(/(\d+(?:[.,]\d+)?)/)
  return found ? Number(found[1].replace(',', '.')) : 0
}

/**
 * Ближайшие начисления по активным контрактам: шагаем от даты открытия
 * периодами выплат, пока не выйдем за сегодняшний день.
 */
export function upcomingPayouts(from: Date = new Date()): UpcomingPayout[] {
  return loadContracts<InvestContract>()
    .filter((contract) => Number(contract.amount) > 0)
    .map((contract, index) => {
      const months = periodMonths(contract.payoutPeriod)
      const rate = annualRate(contract.rate)
      const opened = contract.opened ? new Date(contract.opened) : from
      const next = new Date(opened)

      // Отматываем период вперёд до первой даты в будущем.
      let guard = 0
      while (next.getTime() <= from.getTime() && guard < 400) {
        next.setMonth(next.getMonth() + months)
        guard += 1
      }

      return {
        id: contract.id ?? `ctr-${index}`,
        product: contract.productName ?? 'Контракт',
        amount: (Number(contract.amount) * (rate / 100) * months) / 12,
        date: next,
        reinvest: Boolean(contract.reinvest),
      }
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

/** Ближайшее к закрытию окно Event из тех, где ещё остался объём. */
export function nextEventWindow(from: Date = new Date()) {
  const open = liveEvents.filter((event) => event.committed < event.capacity)
  const pool = open.length ? open : liveEvents
  const soonest = pool.reduce((closest, event) => (event.secondsLeft < closest.secondsLeft ? event : closest), pool[0])

  return {
    id: soonest.id,
    title: soonest.title,
    category: soonest.category,
    targetLow: soonest.targetLow,
    targetHigh: soonest.targetHigh,
    minimum: soonest.minInvestment,
    filled: Math.round((soonest.committed / soonest.capacity) * 100),
    closesAt: new Date(from.getTime() + soonest.secondsLeft * 1000).toISOString(),
  }
}

/** Ставка Earn — база для расчёта упущенного дохода по свободным деньгам. */
export const EARN_APY = 7
