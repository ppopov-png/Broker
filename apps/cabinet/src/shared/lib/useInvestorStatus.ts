import { useMemo } from 'react'
import { loadContracts } from '../mock/contracts'
import { useBrokerAccount } from './AccountContext'
import { useFunding } from './FundingContext'
import {
  calculateInvestorStatus,
  SCORE_WINDOW_MONTHS,
  type InvestorStatusInput,
  type InvestorStatusResult,
  type ProductLine,
} from './InvestorStatus'

/**
 * Часть входных данных статуса, которой пока нет в мок-слое кабинета.
 * В проде приходит из истории операций: чистый приток за окно, месяцы
 * с работающим капиталом и дата последней операции.
 */
const activityInput = {
  netNewMoney: 150_000,
  tenureMonths: 19,
  qualifiedReferrals: 3,
  referralPoints: 42_000,
  investedMonths: SCORE_WINDOW_MONTHS,
  monthsSinceActivity: 0,
}

/** Earn — отдельное направление, остальные продукты идут инвестпрограммами. */
function lineOf(productId: string): ProductLine {
  return productId === 'earn' ? 'earn' : 'programs'
}

export interface InvestorSnapshot {
  status: InvestorStatusResult
  input: InvestorStatusInput
  /** Капитал в инвест-контрактах. */
  invested: number
  /** Капитал, заблокированный в Events. */
  lockedEvents: number
  /** Свободный остаток на брокерском счёте. */
  available: number
  /** Всё вместе — размер отношений клиента с брокером. */
  totalCapital: number
}

/**
 * Единая точка расчёта статуса инвестора: топбар, профиль и страница уровней
 * должны показывать одно и то же число, поэтому формула вызывается здесь.
 */
export function useInvestorStatus(): InvestorSnapshot {
  const { activeAccount } = useBrokerAccount()
  const { getAccountState } = useFunding()
  const state = getAccountState(activeAccount.id)

  return useMemo(() => {
    const contracts = loadContracts()
    const invested = contracts.reduce((sum, contract) => sum + Number(contract.amount || 0), 0)

    const capital: Record<ProductLine, number> = { earn: 0, programs: 0, events: state.lockedEvents }
    const longTermCapital: Record<ProductLine, number> = { earn: 0, programs: 0, events: 0 }

    for (const contract of contracts) {
      const line = lineOf(contract.productId)
      const amount = Number(contract.amount || 0)
      capital[line] += amount
      if (Number(contract.termMonths || 0) >= 12) longTermCapital[line] += amount
    }

    const input: InvestorStatusInput = {
      capital,
      longTermCapital,
      holdingMonths: SCORE_WINDOW_MONTHS,
      ...activityInput,
    }

    return {
      status: calculateInvestorStatus(input),
      input,
      invested,
      lockedEvents: state.lockedEvents,
      available: state.brokerBalance,
      totalCapital: state.brokerBalance + invested + state.lockedEvents,
    }
  }, [state.brokerBalance, state.lockedEvents])
}
