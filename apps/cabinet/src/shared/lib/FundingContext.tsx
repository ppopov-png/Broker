import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type FundingSourceKind = 'wallet' | 'exchange' | 'address'
export type FundingConnection = 'walletconnect' | 'browser-wallet' | 'exchange-api' | 'manual'
export type FundingTransactionStatus = 'completed' | 'processing'

export interface FundingSource {
  id: string
  kind: FundingSourceKind
  connection: FundingConnection
  name: string
  detail: string
  address?: string
  uid?: string
  asset: string
  balance: number
  networks: string[]
  verified: boolean
  lastUsed: string
  permissions?: string[]
  cooldownUntil?: string
}

export interface FundingTransactionRecord {
  id: string
  date: string
  type: 'deposit' | 'withdrawal'
  source: string
  asset: string
  network: string
  amount: number
  status: FundingTransactionStatus
  txHash?: string
}

interface AccountFundingState {
  brokerBalance: number
  lockedEvents: number
  pendingSettlement: number
  sources: FundingSource[]
  transactions: FundingTransactionRecord[]
}

interface FundingContextValue {
  getAccountState: (accountId: string) => AccountFundingState
  addSource: (accountId: string, source: FundingSource) => void
  removeSource: (accountId: string, sourceId: string) => void
  recordDeposit: (accountId: string, transaction: FundingTransactionRecord) => void
  recordWithdrawal: (accountId: string, transaction: FundingTransactionRecord) => void
}

const now = new Date().toISOString()

const initialStates: Record<string, AccountFundingState> = {
  'artem-personal': {
    brokerBalance: 50_000,
    lockedEvents: 19_000,
    pendingSettlement: 8_000,
    sources: [
      {
        id: 'wallet-metamask-main',
        kind: 'wallet',
        connection: 'browser-wallet',
        name: 'MetaMask',
        detail: '0x83A1…7A21',
        address: '0x83A1B26F04182728B17A67A21C2D5F527A217A21',
        asset: 'USDT',
        balance: 18_420,
        networks: ['Arbitrum', 'Ethereum', 'Base'],
        verified: true,
        lastUsed: now,
      },
      {
        id: 'exchange-bybit-main',
        kind: 'exchange',
        connection: 'exchange-api',
        name: 'Bybit',
        detail: 'UID 483••••91',
        uid: '4837712591',
        asset: 'USDT',
        balance: 42_580,
        networks: ['Arbitrum', 'TRC20', 'ERC20'],
        verified: true,
        lastUsed: now,
        permissions: ['Баланс', 'История депозитов/выводов'],
      },
    ],
    transactions: [
      { id: 'dep-1', date: '2026-05-24T15:20:00', type: 'deposit', source: 'USDT · Bybit', asset: 'USDT', network: 'TRC20', amount: 10_000, status: 'completed', txHash: '0x11a4…91ef' },
      { id: 'dep-2', date: '2026-05-23T11:45:00', type: 'deposit', source: 'MetaMask', asset: 'USDT', network: 'Arbitrum', amount: 2_500, status: 'completed', txHash: '0x42a1…cc81' },
      { id: 'wd-1', date: '2026-05-21T18:10:00', type: 'withdrawal', source: 'MetaMask', asset: 'USDC', network: 'Arbitrum', amount: -5_000, status: 'completed', txHash: '0x90ab…221d' },
    ],
  },
}

const emptyState = (): AccountFundingState => ({
  brokerBalance: 0,
  lockedEvents: 0,
  pendingSettlement: 0,
  sources: [],
  transactions: [],
})

const FundingContext = createContext<FundingContextValue | null>(null)
const STORAGE_KEY = 'trigonum-broker-funding-state-v1'

function loadState() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return initialStates
    return { ...initialStates, ...JSON.parse(stored) } as Record<string, AccountFundingState>
  } catch {
    return initialStates
  }
}

export function FundingProvider({ children }: { children: ReactNode }) {
  const [states, setStates] = useState<Record<string, AccountFundingState>>(loadState)

  const persist = (next: Record<string, AccountFundingState>) => {
    setStates(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const getAccountState = (accountId: string) => states[accountId] ?? emptyState()

  const addSource = (accountId: string, source: FundingSource) => {
    const current = states[accountId] ?? emptyState()
    persist({ ...states, [accountId]: { ...current, sources: [...current.sources.filter((item) => item.id !== source.id), source] } })
  }

  const removeSource = (accountId: string, sourceId: string) => {
    const current = states[accountId] ?? emptyState()
    persist({ ...states, [accountId]: { ...current, sources: current.sources.filter((item) => item.id !== sourceId) } })
  }

  const recordDeposit = (accountId: string, transaction: FundingTransactionRecord) => {
    const current = states[accountId] ?? emptyState()
    persist({
      ...states,
      [accountId]: {
        ...current,
        brokerBalance: current.brokerBalance + Math.abs(transaction.amount),
        transactions: [transaction, ...current.transactions],
      },
    })
  }

  const recordWithdrawal = (accountId: string, transaction: FundingTransactionRecord) => {
    const current = states[accountId] ?? emptyState()
    persist({
      ...states,
      [accountId]: {
        ...current,
        brokerBalance: Math.max(0, current.brokerBalance - Math.abs(transaction.amount)),
        transactions: [transaction, ...current.transactions],
      },
    })
  }

  const value = useMemo(() => ({ getAccountState, addSource, removeSource, recordDeposit, recordWithdrawal }), [states])

  return <FundingContext.Provider value={value}>{children}</FundingContext.Provider>
}

export function useFunding() {
  const context = useContext(FundingContext)
  if (!context) throw new Error('useFunding must be used inside FundingProvider')
  return context
}
