import { Navigate, Route, Routes } from 'react-router-dom'
import { CabinetLayout } from '../layouts/CabinetLayout'
import { RequireAuth } from '../modules/auth/RequireAuth'
import { LoginPage } from '../modules/auth/pages/LoginPage'
import { CapitalPage } from '../modules/capital/pages/CapitalPage'
import { CustodyAccountPage } from '../modules/custody/pages/CustodyAccountPage'
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage'
import { DocumentsPage } from '../modules/documents/pages/DocumentsPage'
import { EventsPage } from '../modules/events/pages/EventsPage'
import { DepositPage } from '../modules/funding/pages/DepositPage'
import { WithdrawPage } from '../modules/funding/pages/WithdrawPage'
import { InvestPage } from '../modules/invest/pages/InvestPage'
import { LevelsPage } from '../modules/levels/pages/LevelsPage'
import { AgreementsPage } from '../modules/onboarding/pages/AgreementsPage'
import { EddQuestionnairePage } from '../modules/onboarding/pages/EddQuestionnairePage'
import { IdentityVerificationPage } from '../modules/onboarding/pages/IdentityVerificationPage'
import { OnboardingStatusPage } from '../modules/onboarding/pages/OnboardingStatusPage'
import { SelfCertificationPage } from '../modules/onboarding/pages/SelfCertificationPage'
import { ProfilePage } from '../modules/profile/pages/ProfilePage'
import { SecurityPage } from '../modules/security/pages/SecurityPage'
import { SupportPage } from '../modules/support/pages/SupportPage'
import { TransactionsPage } from '../modules/transactions/pages/TransactionsPage'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<CabinetLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/capital" element={<CapitalPage />} />
          <Route path="/deposit" element={<DepositPage />} />
          <Route path="/deposit/custody" element={<CustodyAccountPage />} />
          <Route path="/withdraw" element={<WithdrawPage />} />
          <Route path="/invest" element={<InvestPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/levels" element={<LevelsPage />} />
          <Route path="/onboarding" element={<OnboardingStatusPage />} />
          <Route path="/onboarding/identity" element={<IdentityVerificationPage />} />
          <Route path="/onboarding/self-certification" element={<SelfCertificationPage />} />
          <Route path="/onboarding/agreements" element={<AgreementsPage />} />
          <Route path="/onboarding/edd" element={<EddQuestionnairePage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/support" element={<SupportPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
