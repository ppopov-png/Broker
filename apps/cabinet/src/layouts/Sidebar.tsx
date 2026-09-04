import { Building2, Check, ChevronsUpDown, Crown, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useBrokerAccount } from '../shared/lib/AccountContext'
import { useFunding } from '../shared/lib/FundingContext'
import { calculateInvestorStatus, tierAccent } from '../shared/lib/InvestorStatus'
import { Logo } from '../shared/ui/Logo'
import { primaryNav, secondaryNav } from './nav'

const navItemClass = (active: boolean) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    active
      ? 'bg-[color-mix(in_srgb,var(--trigonum-blue)_10%,white)] text-[var(--trigonum-blue)]'
      : 'text-[var(--trigonum-text)] hover:bg-[var(--trigonum-bg)]'
  }`

type StoredContract = { amount?: number; termMonths?: number }

function loadInvestorContracts() {
  try {
    const raw = window.localStorage.getItem('trigonum-broker-invest-contracts-v1')
    return raw ? (JSON.parse(raw) as StoredContract[]) : [
      { amount: 14_000, termMonths: 12 },
      { amount: 12_000, termMonths: 6 },
      { amount: 5_000, termMonths: 12 },
    ]
  } catch {
    return []
  }
}

export function Sidebar() {
  const { accounts, activeAccount, setActiveAccountId } = useBrokerAccount()
  const { getAccountState } = useFunding()
  const [accountOpen, setAccountOpen] = useState(false)
  const ActiveIcon = activeAccount.type === 'company' ? Building2 : UserRound
  const funding = getAccountState(activeAccount.id)
  const investorStatus = useMemo(() => {
    const contracts = loadInvestorContracts()
    const invested = contracts.reduce((sum, contract) => sum + Number(contract.amount || 0), 0)
    const longTerm = contracts.filter((contract) => Number(contract.termMonths || 0) >= 12).reduce((sum, contract) => sum + Number(contract.amount || 0), 0)
    return calculateInvestorStatus({ qualifiedCapital: invested + funding.lockedEvents, longTermCapital: longTerm, completedEvents: 21, activeEvents: 3, tenureMonths: 11, qualifiedReferrals: 4 })
  }, [activeAccount.id, funding.brokerBalance, funding.lockedEvents])
  const statusAccent = tierAccent[investorStatus.tier]

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 self-start flex-col border-r border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] px-4 py-5">
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

      {activeAccount.type === 'individual' ? (
        <NavLink to="/profile" className="mt-5 block rounded-xl border border-[#e4e4f0] bg-[linear-gradient(145deg,#25254f,#17172f)] p-3.5 text-white shadow-[0_8px_24px_rgb(8_27_58/12%)]">
          <div className="flex items-center justify-between gap-2"><span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.12em]" style={{ color: statusAccent }}><Crown size={13} />{investorStatus.tier}</span><span className="text-[10px] font-bold tabular-nums text-white/65">{investorStatus.score} pts</span></div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/12"><div className="h-full rounded-full" style={{ width: `${investorStatus.progress}%`, background: `linear-gradient(90deg,#92f222,${statusAccent})` }} /></div>
          <p className="mt-2 text-[10px] text-white/55">{investorStatus.nextTier ? `${investorStatus.pointsToNext} до ${investorStatus.nextTier}` : 'Максимальный уровень'}</p>
        </NavLink>
      ) : (
        <div className="mt-5 rounded-xl bg-[var(--trigonum-bg)] p-4"><p className="text-xs font-semibold text-[var(--trigonum-ink)]">Корпоративный аккаунт</p><p className="mt-1 text-xs text-[var(--trigonum-muted)]">KYB и реквизиты ведутся отдельно.</p></div>
      )}

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
                  className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition ${active ? 'bg-blue-50' : 'hover:bg-[var(--trigonum-bg)]'}`}
                >
                  <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${account.type === 'company' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`}><Icon size={16} /></span>
                  <span className="w-0 flex-1">
                    <span className="block whitespace-normal text-xs font-bold leading-[1.35] text-[var(--trigonum-ink)]" style={{ overflowWrap: 'anywhere' }}>{account.name}</span>
                    <span className="mt-1 block text-[10px] text-[var(--trigonum-muted)]">{account.accountLabel}</span>
                  </span>
                  {active && <Check size={14} className="mt-1 shrink-0 text-[var(--trigonum-blue)]" />}
                </button>
              )
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => setAccountOpen((value) => !value)}
          className="flex w-full items-start gap-2.5 rounded-xl border border-[var(--trigonum-border)] bg-white px-2.5 py-2.5 text-left hover:bg-[var(--trigonum-bg)]"
        >
          <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg ${activeAccount.type === 'company' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`}><ActiveIcon size={17} /></span>
          <span className="w-0 flex-1">
            <span className="block whitespace-normal text-xs font-bold leading-[1.35] text-[var(--trigonum-ink)]" style={{ overflowWrap: 'anywhere' }}>{activeAccount.name}</span>
            <span className="mt-1 block text-[10px] text-[var(--trigonum-muted)]">{activeAccount.accountLabel}</span>
          </span>
          <ChevronsUpDown size={14} className="mt-1 shrink-0 text-[var(--trigonum-muted)]" />
        </button>
        <p className="px-2 pt-3 text-[10px] text-[var(--trigonum-muted)]">© 2026 Trigonum Broker</p>
      </div>
    </aside>
  )
}
