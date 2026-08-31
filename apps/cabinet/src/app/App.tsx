import { Navigate, Route, Routes } from 'react-router-dom'
import { CabinetLayout } from '../layouts/CabinetLayout'
import { CapitalPage } from '../modules/capital/pages/CapitalPage'
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage'
import { DocumentsPage } from '../modules/documents/pages/DocumentsPage'
import { EventsPage } from '../modules/events/pages/EventsPage'
import { DepositPage } from '../modules/funding/pages/DepositPage'
import { WithdrawPage } from '../modules/funding/pages/WithdrawPage'
import { InvestPage } from '../modules/invest/pages/InvestPage'
import { ProfilePage } from '../modules/profile/pages/ProfilePage'
import { SecurityPage } from '../modules/security/pages/SecurityPage'
import { SupportPage } from '../modules/support/pages/SupportPage'
import { TransactionsPage } from '../modules/transactions/pages/TransactionsPage'

export function App() {
  return (
    <Routes>
      <Route element={<CabinetLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/capital" element={<CapitalPage />} />
        <Route path="/deposit" element={<DepositPage />} />
        <Route path="/withdraw" element={<WithdrawPage />} />
        <Route path="/invest" element={<InvestPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/support" element={<SupportPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
