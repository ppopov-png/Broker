import { useBrokerAccount } from '../../../shared/lib/AccountContext'
import { fundingHistory } from '../../../shared/mock/data'
import type { FundingMethod, TransactionItem } from '../../../shared/mock/types'
import { FundingPage } from '../../../shared/ui/FundingPage'
import { PersonalFundingPage } from '../../../shared/ui/PersonalFundingPage'

const companyWithdrawalMethods: FundingMethod[] = [
  {
    id: 'transfer',
    title: 'На банковский счёт компании',
    subtitle: 'Верифицированные корпоративные реквизиты',
    points: ['Вывод только на счёт юридического лица', 'Реквизиты закреплены за аккаунтом', 'Крупные суммы могут проходить дополнительную проверку'],
    cta: 'Вывести на счёт компании',
  },
  {
    id: 'crypto',
    title: 'На корпоративный кошелёк',
    subtitle: 'USDT / USDC',
    points: ['Только на верифицированный адрес компании', 'Сеть выбирается перед отправкой', 'Комиссия сети показывается до подтверждения'],
    cta: 'Вывести криптовалюту',
  },
]

const companyWithdrawals: TransactionItem[] = [
  { id: 'corp-wd-1', date: '2026-08-30T13:15:00', type: 'withdrawal', title: 'Вывод', description: 'Корпоративный перевод · Optima Bank', amount: -35_000, status: 'completed' },
  { id: 'corp-wd-2', date: '2026-08-24T12:40:00', type: 'withdrawal', title: 'Вывод', description: 'USDT (TRC20) · корпоративный кошелёк', amount: -18_000, status: 'completed' },
  { id: 'corp-wd-3', date: '2026-08-19T16:05:00', type: 'withdrawal', title: 'Вывод', description: 'Корпоративный перевод · DemirBank', amount: -22_000, status: 'processing' },
]

export function WithdrawPage() {
  const { activeAccount } = useBrokerAccount()

  if (activeAccount.type === 'individual') {
    return <PersonalFundingPage mode="withdraw" />
  }

  const history = companyWithdrawals.length > 0 ? companyWithdrawals : fundingHistory.withdrawals

  return (
    <FundingPage
      mode="withdraw"
      accountType={activeAccount.type}
      accountName={activeAccount.name}
      accountNumber={activeAccount.accountNumber}
      title="Вывести"
      subtitle="Вывод с корпоративного счёта"
      methods={companyWithdrawalMethods}
      availableLabel="Доступно к выводу"
      availableAmount={activeAccount.availableBalance}
      lastLabel="Последний вывод"
      lastItem={history[0]}
      historyTitle="Выводы компании"
      historyItems={history}
    />
  )
}
