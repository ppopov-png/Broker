import { capitalTotals, fundingHistory, withdrawalMethods } from '../../../shared/mock/data'
import { FundingPage } from '../../../shared/ui/FundingPage'

export function WithdrawPage() {
  return (
    <FundingPage
      mode="withdraw"
      title="Вывести"
      subtitle="Выберите способ вывода средств с вашего счёта"
      methods={withdrawalMethods}
      availableLabel="Доступно к выводу"
      availableAmount={capitalTotals.available}
      lastLabel="Последний вывод"
      lastItem={fundingHistory.withdrawals[0]}
      historyTitle="Последние выводы"
      historyItems={fundingHistory.withdrawals}
    />
  )
}
