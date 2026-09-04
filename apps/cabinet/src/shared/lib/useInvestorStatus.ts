import { useMemo } from 'react'
import { useBrokerAccount } from './AccountContext'
import { useFunding } from './FundingContext'
import { calculateInvestorStatus, type InvestorStatusInput, type InvestorStatusResult } from './InvestorStatus'

const CONTRACTS_STORAGE_KEY = 'trigonum-broker-invest-contracts-v1'

type StoredContract = { amount?: number; termMonths?: number }

const fallbackContracts: StoredContract[] = [
  { amount: 14_000, termMonths: 12 },
  { amount: 12_000, termMonths: 6 },
  { amount: 5_000, termMonths: 12 },
]

function loadContracts(): StoredContract[] {
  try {
    const raw = window.localStorage.getItem(CONTRACTS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredContract[]) : fallbackContracts
  } catch {
    return fallbackContracts
  }
}

/** Часть входных данных статуса, которой пока нет в мок-слое кабинета. */
const activityInput = {
  completedEvents: 21,
  activeEvents: 3,
  tenureMonths: 11,
  qualifiedReferrals: 4,
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

    const input: InvestorStatusInput = {
      qualifiedCapital: invested + state.lockedEvents,
      longTermCapital,
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
