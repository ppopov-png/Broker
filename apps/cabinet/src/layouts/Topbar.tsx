import { Bell, ChevronDown, HelpCircle, LogOut, User as UserIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBrokerAccount } from '../shared/lib/AccountContext'
import { useFunding } from '../shared/lib/FundingContext'
import { calculateInvestorStatus, tierAccent } from '../shared/lib/InvestorStatus'
import { notifications } from '../shared/mock/data'

type StoredContract = { amount?: number; termMonths?: number }

function loadContracts() {
  try {
    const raw = window.localStorage.getItem('trigonum-broker-invest-contracts-v1')
    return raw ? JSON.parse(raw) as StoredContract[] : [
      { amount: 14_000, termMonths: 12 },
      { amount: 12_000, termMonths: 6 },
      { amount: 5_000, termMonths: 12 },
    ]
  } catch {
    return []
  }
}

export function Topbar() {
  const { activeAccount } = useBrokerAccount()
  const { getAccountState } = useFunding()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const funding = getAccountState(activeAccount.id)

  const investorStatus = useMemo(() => {
    const contracts = loadContracts()
    const invested = contracts.reduce((sum, contract) => sum + Number(contract.amount || 0), 0)
    const longTermCapital = contracts
      .filter((contract) => Number(contract.termMonths || 0) >= 12)
      .reduce((sum, contract) => sum + Number(contract.amount || 0), 0)

    return calculateInvestorStatus({
      qualifiedCapital: invested + funding.lockedEvents,
      longTermCapital,
      completedEvents: 21,
      activeEvents: 3,
      tenureMonths: 11,
      qualifiedReferrals: 4,
    })
  }, [activeAccount.id, funding.lockedEvents, funding.brokerBalance])

  const investorAccent = tierAccent[investorStatus.tier]

  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-2 border-b border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] px-6">
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setNotifOpen((v) => !v)
            setUserOpen(false)
          }}
          className="relative grid size-9 place-items-center rounded-full text-[var(--trigonum-muted)] hover:bg-[var(--trigonum-bg)]"
          aria-label="Уведомления"
        >
          <Bell size={18} />
          {notifications.length > 0 && <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-[var(--trigonum-danger)] text-[9px] font-bold text-white">{notifications.length}</span>}
        </button>
        {notifOpen && (
          <div className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] p-2 shadow-xl">
            {notifications.map((n) => (
              <div key={n.id} className="rounded-lg p-3 hover:bg-[var(--trigonum-bg)]">
                <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{n.title}</p>
                <p className="mt-0.5 text-xs text-[var(--trigonum-muted)]">{n.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="button" className="grid size-9 place-items-center rounded-full text-[var(--trigonum-muted)] hover:bg-[var(--trigonum-bg)]" aria-label="Помощь"><HelpCircle size={18} /></button>
      <button type="button" className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-[var(--trigonum-muted)] hover:bg-[var(--trigonum-bg)]">RU</button>

      <div className="relative ml-1">
        <button
          type="button"
          onClick={() => {
            setUserOpen((v) => !v)
            setNotifOpen(false)
          }}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-[var(--trigonum-bg)]"
        >
          <span
            className="relative grid size-9 place-items-center rounded-full"
            title={activeAccount.type === 'individual' ? 'Статус инвестора' : undefined}
          >
            {activeAccount.type === 'individual' && (
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(${investorAccent} 0 72%, transparent 72% 100%)`,
                  boxShadow: `0 0 0 1px ${investorAccent}33, 0 0 16px ${investorAccent}22`,
                }}
              />
            )}
            <span className={`relative grid size-7 place-items-center rounded-full text-[11px] font-bold ring-2 ring-white ${activeAccount.type === 'company' ? 'bg-violet-50 text-violet-700' : 'bg-[color-mix(in_srgb,var(--trigonum-blue)_14%,white)] text-[var(--trigonum-blue)]'}`}>{activeAccount.initials}</span>
            {activeAccount.type === 'individual' && <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white" style={{ background: investorAccent }} aria-hidden="true" />}
          </span>
          <span className="max-w-48 text-left leading-tight">
            <span className="block truncate text-xs font-semibold text-[var(--trigonum-ink)]">{activeAccount.name}</span>
            <span className="block text-[11px] text-[var(--trigonum-muted)]">{activeAccount.accountLabel}</span>
          </span>
          <ChevronDown size={14} className="text-[var(--trigonum-muted)]" />
        </button>
        {userOpen && (
          <div className="absolute right-0 z-40 mt-2 w-52 rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] p-1.5 shadow-xl">
            <div className="mb-1 rounded-lg bg-[var(--trigonum-bg)] px-3 py-2">
              <p className="truncate text-xs font-bold text-[var(--trigonum-ink)]">{activeAccount.name}</p>
              <p className="mt-0.5 text-[10px] text-[var(--trigonum-muted)]">Счёт {activeAccount.accountNumber}</p>
            </div>
            <Link to="/profile" onClick={() => setUserOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--trigonum-text)] hover:bg-[var(--trigonum-bg)]"><UserIcon size={16} /> Профиль аккаунта</Link>
            <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--trigonum-danger)] hover:bg-[var(--trigonum-bg)]"><LogOut size={16} /> Выйти</button>
          </div>
        )}
      </div>
    </header>
  )
}
