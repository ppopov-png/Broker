import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type BrokerAccountType = 'individual' | 'company'

export interface BrokerAccount {
  id: string
  type: BrokerAccountType
  name: string
  shortName: string
  initials: string
  accountLabel: string
  availableBalance: number
  verificationStatus: string
  verificationDate: string
  accountNumber: string
  company?: {
    legalName: string
    registrationNumber: string
    taxId: string
    jurisdiction: string
    address: string
    director: string
    beneficialOwner: string
    email: string
    phone: string
  }
}

export const brokerAccounts: BrokerAccount[] = [
  {
    id: 'artem-personal',
    type: 'individual',
    name: 'Артём Дробков',
    shortName: 'Артём',
    initials: 'АД',
    accountLabel: 'Физическое лицо',
    availableBalance: 50_000,
    verificationStatus: 'KYC пройден',
    verificationDate: '12.03.2024',
    accountNumber: 'IND-02418',
  },
  {
    id: 'capital-no-wait-llc',
    type: 'company',
    name: 'ООО «Чень дешёвые билеты на Aviasales»',
    shortName: 'Чень дешёвые билеты',
    initials: 'ЧБ',
    accountLabel: 'Юридическое лицо',
    availableBalance: 184_000,
    verificationStatus: 'KYB пройден',
    verificationDate: '18.08.2026',
    accountNumber: 'CORP-00731',
    company: {
      legalName: 'ООО «Чень дешёвые билеты на Aviasales»',
      registrationNumber: 'KG-2026-0818-731',
      taxId: '02808202610451',
      jurisdiction: 'Кыргызская Республика',
      address: 'г. Бишкек, ул. Ибраимова, 103',
      director: 'Артём Дробков',
      beneficialOwner: 'Артём Дробков — 100%',
      email: 'finance@capital-ne-zhdet.example',
      phone: '+996 555 731 731',
    },
  },
]

interface BrokerAccountContextValue {
  accounts: BrokerAccount[]
  activeAccount: BrokerAccount
  setActiveAccountId: (accountId: string) => void
}

const BrokerAccountContext = createContext<BrokerAccountContextValue | null>(null)
const STORAGE_KEY = 'trigonum-broker-active-account'

export function BrokerAccountProvider({ children }: { children: ReactNode }) {
  const [activeAccountId, setActiveAccountIdState] = useState(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return brokerAccounts.some((account) => account.id === stored) ? stored! : brokerAccounts[0].id
  })

  const activeAccount = brokerAccounts.find((account) => account.id === activeAccountId) ?? brokerAccounts[0]

  const setActiveAccountId = (accountId: string) => {
    if (!brokerAccounts.some((account) => account.id === accountId)) return
    setActiveAccountIdState(accountId)
    window.localStorage.setItem(STORAGE_KEY, accountId)
  }

  const value = useMemo(
    () => ({ accounts: brokerAccounts, activeAccount, setActiveAccountId }),
    [activeAccount],
  )

  return <BrokerAccountContext.Provider value={value}>{children}</BrokerAccountContext.Provider>
}

export function useBrokerAccount() {
  const context = useContext(BrokerAccountContext)
  if (!context) throw new Error('useBrokerAccount must be used inside BrokerAccountProvider')
  return context
}
