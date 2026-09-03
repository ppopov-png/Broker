import { useBrokerAccount } from '../../../shared/lib/AccountContext'
import { fundingHistory, withdrawalMethods } from '../../../shared/mock/data'
import type { FundingMethod, TransactionItem } from '../../../shared/mock/types'
import { FundingPage } from '../../../shared/ui/FundingPage'

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
  const isCompany = activeAccount.type === 'company'
  const methods = isCompany ? companyWithdrawalMethods : withdrawalMethods
  const history = isCompany ? companyWithdrawals : fundingHistory.withdrawals

  return (
    <FundingPage
      mode="withdraw"
      accountType={activeAccount.type}
      accountName={activeAccount.name}
      accountNumber={activeAccount.accountNumber}
      title="Вывести"
      subtitle={isCompany ? 'Вывод с корпоративного счёта' : 'Вывод с личного счёта'}
      methods={methods}
      availableLabel="Доступно к выводу"
      availableAmount={activeAccount.availableBalance}
      lastLabel="Последний вывод"
      lastItem={history[0]}
      historyTitle={isCompany ? 'Выводы компании' : 'Последние выводы'}
      historyItems={history}
    />
  )
}
