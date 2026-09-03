import { Bell, ChevronDown, HelpCircle, LogOut, User as UserIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBrokerAccount } from '../shared/lib/AccountContext'
import { notifications } from '../shared/mock/data'

export function Topbar() {
  const { activeAccount } = useBrokerAccount()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

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
          <span className={`grid size-8 place-items-center rounded-full text-xs font-bold ${activeAccount.type === 'company' ? 'bg-violet-50 text-violet-700' : 'bg-[color-mix(in_srgb,var(--trigonum-blue)_14%,white)] text-[var(--trigonum-blue)]'}`}>{activeAccount.initials}</span>
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
