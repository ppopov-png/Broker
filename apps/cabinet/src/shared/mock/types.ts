export type ProductKind = 'available' | 'earn' | 'strategies' | 'events'

export interface CapitalBreakdownItem {
  key: ProductKind
  label: string
  amount: number
  share: number
  color: string
}

export interface Position {
  id: string
  product: string
  kind: Exclude<ProductKind, 'available'>
  invested: number
  profit: number
  yieldLabel: string
  currentValue: number
  openedAt: string
  series: number[]
}

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'investment' | 'accrual'
export type TransactionStatus = 'completed' | 'processing'

export interface TransactionItem {
  id: string
  date: string
  type: TransactionType
  title: string
  description: string
  amount: number
  status: TransactionStatus
}

export type EventStatus = 'active' | 'upcoming' | 'closed'
export type RiskLevel = 'Low' | 'Moderate' | 'High'

export type EventCoverKind = 'crypto' | 'ai' | 'emerging' | 'macro'

export interface EventItem {
  id: string
  title: string
  status: EventStatus
  cover: EventCoverKind
  description: string
  targetRange: string
  horizon: string
  risk: RiskLevel
  minAmount: number
  windowLabel: string
  windowTarget?: string
  progress?: { current: number; total: number }
  result?: string
  participants?: number
  closedDate?: string
}

export interface StrategyProduct {
  id: string
  name: string
  tagline: string
  targetRange: string
  horizon: string
  risk: RiskLevel
}

export interface NotificationItem {
  id: string
  title: string
  description: string
  cta?: string
  tone: 'warning' | 'success' | 'info'
}

export interface FundingMethod {
  id: 'card' | 'crypto' | 'transfer'
  title: string
  subtitle: string
  points: string[]
  cta: string
}
