import { Building2, Check, ChevronsUpDown, UserRound } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useBrokerAccount } from '../shared/lib/AccountContext'
import { Logo } from '../shared/ui/Logo'
import { primaryNav, secondaryNav } from './nav'

const navItemClass = (active: boolean) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    active
      ? 'bg-[color-mix(in_srgb,var(--trigonum-blue)_10%,white)] text-[var(--trigonum-blue)]'
      : 'text-[var(--trigonum-text)] hover:bg-[var(--trigonum-bg)]'
  }`

export function Sidebar() {
  const { accounts, activeAccount, setActiveAccountId } = useBrokerAccount()
  const [accountOpen, setAccountOpen] = useState(false)
  const ActiveIcon = activeAccount.type === 'company' ? Building2 : UserRound

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] px-4 py-5">
      <div className="px-2">
        <Logo />
      </div>

      <nav className="mt-6 flex flex-col gap-1 overflow-y-auto">
        {primaryNav.map(({ to, label, icon: Icon, badge }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => navItemClass(isActive)}>
            <Icon size={18} strokeWidth={2} />
            <span className="flex-1">{label}</span>
            {badge && <span className="rounded-full bg-[var(--trigonum-green)] px-1.5 py-0.5 text-[10px] font-bold text-white">{badge}</span>}
          </NavLink>
        ))}

        <div className="my-3 border-t border-[var(--trigonum-border)]" />

        {secondaryNav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => navItemClass(isActive)}>
            <Icon size={18} strokeWidth={2} />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 rounded-xl bg-[var(--trigonum-bg)] p-4">
        <p className="text-xs font-semibold text-[var(--trigonum-ink)]">AI находит возможности.</p>
        <p className="mt-1 text-xs text-[var(--trigonum-muted)]">Вы получаете результат.</p>
        <button type="button" className="mt-2 text-xs font-semibold text-[var(--trigonum-blue)]">Как это работает →</button>
      </div>

      <div className="relative mt-auto pt-4">
        {accountOpen && (
          <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 rounded-xl border border-[var(--trigonum-border)] bg-white p-1.5 shadow-xl">
            <p className="px-2 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Аккаунты</p>
            {accounts.map((account) => {
              const Icon = account.type === 'company' ? Building2 : UserRound
              const active = account.id === activeAccount.id
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => {
                    setActiveAccountId(account.id)
                    setAccountOpen(false)
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition ${active ? 'bg-blue-50' : 'hover:bg-[var(--trigonum-bg)]'}`}
                >
                  <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${account.type === 'company' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`}><Icon size={16} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-[var(--trigonum-ink)]">{account.name}</span>
                    <span className="block text-[10px] text-[var(--trigonum-muted)]">{account.accountLabel}</span>
                  </span>
                  {active && <Check size={14} className="text-[var(--trigonum-blue)]" />}
                </button>
              )
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => setAccountOpen((value) => !value)}
          className="flex w-full items-center gap-2.5 rounded-xl border border-[var(--trigonum-border)] bg-white px-2.5 py-2.5 text-left hover:bg-[var(--trigonum-bg)]"
        >
          <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${activeAccount.type === 'company' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`}><ActiveIcon size={17} /></span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-bold text-[var(--trigonum-ink)]">{activeAccount.name}</span>
            <span className="block text-[10px] text-[var(--trigonum-muted)]">{activeAccount.accountLabel}</span>
          </span>
          <ChevronsUpDown size={14} className="text-[var(--trigonum-muted)]" />
        </button>
        <p className="px-2 pt-3 text-[10px] text-[var(--trigonum-muted)]">© 2026 Trigonum Broker</p>
      </div>
    </aside>
  )
}
