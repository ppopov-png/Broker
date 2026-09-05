/**
 * Действующие инвест-контракты — единственный источник правды.
 * Раньше каждая страница держала свою копию этого списка, и суммы расходились:
 * «Инвестировать» показывала одно, «Документы» и «Транзакции» — другое.
 */

export const CONTRACTS_STORAGE_KEY = 'trigonum-broker-invest-contracts-v2'

export interface InvestContract {
  id: string
  productId: string
  productName: string
  amount: number
  rate: string
  payoutPeriod: string
  reinvest: boolean
  income: number
  incomeLabel: string
  termMonths: number
  opened: string
  ends: string | null
  status: string
  guaranteed: boolean
}

export const defaultContracts: InvestContract[] = [
  {
    id: 'CTR-2451',
    productId: 'earn',
    productName: 'Earn',
    amount: 100_000,
    rate: '~7% годовых',
    payoutPeriod: 'раз в месяц',
    reinvest: false,
    income: 5_120,
    incomeLabel: 'Начислено',
    termMonths: 12,
    opened: '2026-01-15',
    ends: '2027-01-15',
    status: 'Активен',
    guaranteed: true,
  },
  {
    id: 'CTR-2478',
    productId: 'strategy-balanced-growth',
    productName: 'Strategy «Balanced Growth»',
    amount: 50_000,
    rate: 'целевая 10–14%',
    payoutPeriod: 'раз в квартал',
    reinvest: false,
    income: 2_400,
    incomeLabel: 'Результат периода',
    termMonths: 6,
    opened: '2026-05-12',
    ends: '2026-11-12',
    status: 'Активен',
    guaranteed: false,
  },
  {
    id: 'CTR-2490',
    productId: 'strategy-alpha-momentum',
    productName: 'Strategy «Alpha Momentum»',
    amount: 25_000,
    rate: 'целевая 15–20%',
    payoutPeriod: 'раз в полгода',
    reinvest: true,
    income: 1_600,
    incomeLabel: 'Результат периода',
    termMonths: 12,
    opened: '2025-12-01',
    ends: '2026-12-01',
    status: 'Активен',
    guaranteed: false,
  },
]

/** Контракты клиента: сохранённые правки поверх набора по умолчанию. */
export function loadContracts<T = InvestContract>(): T[] {
  try {
    const raw = window.localStorage.getItem(CONTRACTS_STORAGE_KEY)
    if (!raw) return defaultContracts as unknown as T[]
    const parsed = JSON.parse(raw) as T[]
    return Array.isArray(parsed) && parsed.length ? parsed : (defaultContracts as unknown as T[])
  } catch {
    return defaultContracts as unknown as T[]
  }
}
