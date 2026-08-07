import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import type { UserRole } from '../shared/types/roles'
import { AppShell } from '../widgets/app-shell/AppShell'
import { InvestorOverview } from '../features/investor-overview/InvestorOverview'
import { InvestorOffers } from '../features/investor-offers/InvestorOffers'
import { InvestorPortfolioV2 } from '../features/investor-portfolio/InvestorPortfolioV2'
import { InvestorFunds } from '../features/investor-funds/InvestorFunds'
import { InvestorMessages } from '../features/investor-messages/InvestorMessages'
import { InvestorSupport } from '../features/investor-support/InvestorSupport'
import { InvestorProfile } from '../features/investor-profile/InvestorProfile'
import { InvestorLogin } from '../features/auth/InvestorLogin'

const investorSections = ['overview', 'offers', 'portfolio', 'funds', 'messages', 'support', 'profile'] as const
const teamLeadSections = ['overview', 'offers', 'investments', 'settlements', 'reports', 'messages', 'support', 'profile'] as const

function RolePage({ role }: { role: UserRole }) {
  const { section = 'overview' } = useParams()
  const sections = role === 'investor' ? investorSections : teamLeadSections
  const title = sections.includes(section as never) ? section : 'not-found'

  if (role === 'investor' && title === 'overview') return <InvestorOverview />
  if (role === 'investor' && title === 'offers') return <InvestorOffers />
  if (role === 'investor' && title === 'portfolio') return <InvestorPortfolioV2 />
  if (role === 'investor' && title === 'funds') return <InvestorFunds />
  if (role === 'investor' && title === 'messages') return <InvestorMessages />
  if (role === 'investor' && title === 'support') return <InvestorSupport />
  if (role === 'investor' && title === 'profile') return <InvestorProfile />
  if (role === 'team-lead' && title === 'messages') return <InvestorMessages />
  if (role === 'team-lead' && title === 'support') return <InvestorSupport />
  if (role === 'team-lead' && title === 'profile') return <InvestorProfile />

  return (
    <main className="grid min-h-screen place-items-center bg-[#161638] p-8 text-white">
      <section className="max-w-xl rounded-2xl border border-white/10 bg-[#25254f] p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-[#af47ff]">Trigonum Broker</p>
        <h1 className="mt-3 text-3xl font-medium">{role}: {title}</h1>
        <p className="mt-3 text-white/65">Базовая маршрутизация готова. UI этого раздела будет собираться из feature-модулей.</p>
      </section>
    </main>
  )
}

export function BrokerRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<InvestorLogin />} />
      <Route path="/forgot-password" element={<InvestorLogin />} />
      <Route path="/investor/operations" element={<Navigate to="/investor/funds" replace />} />
      <Route path="/investor/reports" element={<Navigate to="/investor/portfolio" replace />} />
      <Route element={<AppShell />}><Route path="/investor/:section?" element={<RolePage role="investor" />} /></Route>
      <Route element={<AppShell role="team-lead" />}><Route path="/team-lead/:section?" element={<RolePage role="team-lead" />} /></Route>
      <Route path="*" element={<Navigate to="/investor/overview" replace />} />
    </Routes>
  )
}
