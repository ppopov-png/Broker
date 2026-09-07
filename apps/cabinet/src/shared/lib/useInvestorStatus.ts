import { useMemo } from 'react'
import { loadContracts } from '../mock/contracts'
import { useBrokerAccount } from './AccountContext'
import { useFunding } from './FundingContext'
import {
  calculateInvestorStatus,
  SCORE_WINDOW_MONTHS,
  type InvestorStatusInput,
  type InvestorStatusResult,
} from './InvestorStatus'


/**
 * Часть входных данных статуса, которой пока нет в мок-слое кабинета.
 * В проде приходит из истории операций: пополнения и договоры за окно,
 * активные кварталы и дата последней операции.
 */
const activityInput = {
  depositsInWindow: 180_000,
  contractsInWindow: 3,
  completedEvents: 6,
  activeEvents: 2,
  tenureMonths: 19,
  qualifiedReferrals: 3,
  referralPoints: 4_200,
  activeQuarters: 4,
  monthsSinceActivity: 0,
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
    const longTermCapital = contracts
      .filter((contract) => Number(contract.termMonths || 0) >= 12)
      .reduce((sum, contract) => sum + Number(contract.amount || 0), 0)

    // Разные программы, а не договоры: три вклада в Earn — одна программа.
    const programs = new Set(contracts.map((contract) => contract.productId)).size + (state.lockedEvents > 0 ? 1 : 0)

    const input: InvestorStatusInput = {
      qualifiedCapital: invested + state.lockedEvents,
      longTermCapital,
      holdingMonths: SCORE_WINDOW_MONTHS,
      programs,
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
