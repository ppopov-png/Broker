import { useBrokerAccount } from '../../../shared/lib/AccountContext'
import { fundingHistory, fundingMethods } from '../../../shared/mock/data'
import type { FundingMethod, TransactionItem } from '../../../shared/mock/types'
import { FundingPage } from '../../../shared/ui/FundingPage'

const companyDepositMethods: FundingMethod[] = [
  {
    id: 'transfer',
    title: 'Корпоративный банковский перевод',
    subtitle: 'Только со счёта компании',
    points: ['Персональные реквизиты счёта', 'Назначение платежа фиксируется автоматически', 'Зачисление после банковского подтверждения'],
    cta: 'Получить реквизиты компании',
  },
  {
    id: 'crypto',
    title: 'Корпоративная криптовалюта',
    subtitle: 'USDT / USDC',
    points: ['Адрес закреплён за юридическим аккаунтом', 'Источник средств относится к компании', 'Зачисление после подтверждений сети'],
    cta: 'Получить адрес компании',
  },
]

const companyDeposits: TransactionItem[] = [
  { id: 'corp-dep-1', date: '2026-09-01T10:20:00', type: 'deposit', title: 'Пополнение', description: 'Корпоративный перевод · Optima Bank', amount: 120_000, status: 'completed' },
  { id: 'corp-dep-2', date: '2026-08-27T15:45:00', type: 'deposit', title: 'Пополнение', description: 'USDT (TRC20) · корпоративный кошелёк', amount: 45_000, status: 'completed' },
  { id: 'corp-dep-3', date: '2026-08-21T09:10:00', type: 'deposit', title: 'Пополнение', description: 'Корпоративный перевод · DemirBank', amount: 80_000, status: 'completed' },
]

export function DepositPage() {
  const { activeAccount } = useBrokerAccount()
  const isCompany = activeAccount.type === 'company'
  const methods = isCompany ? companyDepositMethods : fundingMethods
  const history = isCompany ? companyDeposits : fundingHistory.deposits

  return (
    <FundingPage
      mode="deposit"
      accountType={activeAccount.type}
      accountName={activeAccount.name}
      accountNumber={activeAccount.accountNumber}
      title="Пополнить"
      subtitle={isCompany ? 'Пополнение корпоративного счёта' : 'Пополнение личного счёта'}
      methods={methods}
      availableLabel="Доступно сейчас"
      availableAmount={activeAccount.availableBalance}
      lastLabel="Последнее пополнение"
      lastItem={history[0]}
      historyTitle={isCompany ? 'Пополнения компании' : 'Последние пополнения'}
      historyItems={history}
    />
  )
}
