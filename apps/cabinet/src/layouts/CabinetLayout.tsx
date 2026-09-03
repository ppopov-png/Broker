import { Outlet } from 'react-router-dom'
import { BrokerAccountProvider } from '../shared/lib/AccountContext'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function CabinetLayout() {
  return (
    <BrokerAccountProvider>
      <div className="flex min-h-screen bg-[var(--trigonum-bg)]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-8 py-7">
            <Outlet />
          </main>
        </div>
      </div>
    </BrokerAccountProvider>
  )
}
