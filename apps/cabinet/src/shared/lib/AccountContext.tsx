import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { jurisdictionLabel } from '@trigonum/shared'
import { useSession } from './session'

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

function initials(name: string): string {
  const letters = name
    .replace(/[«»"'()]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
  return letters || 'TR'
}

function accountFromSession(session: NonNullable<ReturnType<typeof useSession>>): BrokerAccount {
  if (session.accountId) {
    const predefined = brokerAccounts.find((account) => account.id === session.accountId)
    if (predefined) return predefined
  }

  const company = session.clientType === 'company'
  const name = session.accountName || session.email
  return {
    id: `session-${session.email.toLowerCase()}`,
    type: session.clientType,
    name,
    shortName: name,
    initials: initials(name),
    accountLabel: company ? 'Юридическое лицо' : 'Физическое лицо',
    availableBalance: 0,
    verificationStatus: company ? 'KYB в процессе' : 'KYC в процессе',
    verificationDate: '—',
    accountNumber: company ? 'CORP-PENDING' : 'IND-PENDING',
    company: company
      ? {
          legalName: name,
          registrationNumber: 'Не заполнено',
          taxId: 'Не заполнено',
          jurisdiction: jurisdictionLabel(session.jurisdiction),
          address: 'Не заполнено',
          director: 'Не заполнено',
          beneficialOwner: 'Не заполнено',
          email: session.email,
          phone: 'Не заполнено',
        }
      : undefined,
  }
}

export function BrokerAccountProvider({ children }: { children: ReactNode }) {
  const session = useSession()
  const sessionAccount = useMemo(
    () => (session ? accountFromSession(session) : brokerAccounts[0]),
    [session],
  )
  const accounts = useMemo(() => [sessionAccount], [sessionAccount])
  const [activeAccountId, setActiveAccountIdState] = useState(sessionAccount.id)

  const activeAccount = accounts.find((account) => account.id === activeAccountId) ?? sessionAccount

  const setActiveAccountId = (accountId: string) => {
    if (!accounts.some((account) => account.id === accountId)) return
    setActiveAccountIdState(accountId)
  }

  const value = useMemo(
    () => ({ accounts, activeAccount, setActiveAccountId }),
    [accounts, activeAccount],
  )

  return <BrokerAccountContext.Provider value={value}>{children}</BrokerAccountContext.Provider>
}

export function useBrokerAccount() {
  const context = useContext(BrokerAccountContext)
  if (!context) throw new Error('useBrokerAccount must be used inside BrokerAccountProvider')
  return context
}
