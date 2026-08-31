import { capitalTotals, fundingHistory, fundingMethods } from '../../../shared/mock/data'
import { FundingPage } from '../../../shared/ui/FundingPage'

export function DepositPage() {
  return (
    <FundingPage
      mode="deposit"
      title="Пополнить"
      subtitle="Выберите способ пополнения вашего счёта"
      methods={fundingMethods}
      availableLabel="Доступно сейчас"
      availableAmount={capitalTotals.available}
      lastLabel="Последнее пополнение"
      lastItem={fundingHistory.deposits[0]}
      historyTitle="Последние пополнения"
      historyItems={fundingHistory.deposits}
    />
  )
}
