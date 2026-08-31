import { Bell, ChevronDown, HelpCircle, LogOut, User as UserIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { notifications, user } from '../shared/mock/data'

export function Topbar() {
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
          {notifications.length > 0 && (
            <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-[var(--trigonum-danger)] text-[9px] font-bold text-white">
              {notifications.length}
            </span>
          )}
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

      <button
        type="button"
        className="grid size-9 place-items-center rounded-full text-[var(--trigonum-muted)] hover:bg-[var(--trigonum-bg)]"
        aria-label="Помощь"
      >
        <HelpCircle size={18} />
      </button>

      <button
        type="button"
        className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-[var(--trigonum-muted)] hover:bg-[var(--trigonum-bg)]"
      >
        RU
      </button>

      <div className="relative ml-1">
        <button
          type="button"
          onClick={() => {
            setUserOpen((v) => !v)
            setNotifOpen(false)
          }}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-[var(--trigonum-bg)]"
        >
          <span className="grid size-8 place-items-center rounded-full bg-[color-mix(in_srgb,var(--trigonum-blue)_14%,white)] text-xs font-bold text-[var(--trigonum-blue)]">
            {user.initials}
          </span>
          <span className="text-left leading-tight">
            <span className="block text-xs font-semibold text-[var(--trigonum-ink)]">{user.name}</span>
            <span className="block text-[11px] text-[var(--trigonum-muted)]">Профиль</span>
          </span>
          <ChevronDown size={14} className="text-[var(--trigonum-muted)]" />
        </button>
        {userOpen && (
          <div className="absolute right-0 z-40 mt-2 w-48 rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] p-1.5 shadow-xl">
            <Link
              to="/profile"
              onClick={() => setUserOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--trigonum-text)] hover:bg-[var(--trigonum-bg)]"
            >
              <UserIcon size={16} /> Профиль
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--trigonum-danger)] hover:bg-[var(--trigonum-bg)]"
            >
              <LogOut size={16} /> Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
