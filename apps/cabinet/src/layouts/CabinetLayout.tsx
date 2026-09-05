import { Outlet } from 'react-router-dom'
import { BrokerAccountProvider } from '../shared/lib/AccountContext'
import { FundingProvider } from '../shared/lib/FundingContext'
import { MobileHeader, MobileTabBar } from './MobileChrome'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function CabinetLayout() {
  return (
    <BrokerAccountProvider>
      <FundingProvider>
        <div className="flex min-h-screen bg-[var(--trigonum-bg)]">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <MobileHeader />
            <Topbar />
            <main className="flex-1 px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:py-7">
              <Outlet />
            </main>
            <MobileTabBar />
          </div>
        </div>
      </FundingProvider>
    </BrokerAccountProvider>
  )
}
