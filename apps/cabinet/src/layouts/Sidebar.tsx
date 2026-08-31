import { NavLink } from 'react-router-dom'
import { user } from '../shared/mock/data'
import { Logo } from '../shared/ui/Logo'
import { primaryNav, secondaryNav } from './nav'

const navItemClass = (active: boolean) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    active
      ? 'bg-[color-mix(in_srgb,var(--trigonum-blue)_10%,white)] text-[var(--trigonum-blue)]'
      : 'text-[var(--trigonum-text)] hover:bg-[var(--trigonum-bg)]'
  }`

export function Sidebar() {
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
            {badge && (
              <span className="rounded-full bg-[var(--trigonum-green)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                {badge}
              </span>
            )}
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
        <button type="button" className="mt-2 text-xs font-semibold text-[var(--trigonum-blue)]">
          Как это работает →
        </button>
      </div>

      <div className="mt-auto flex items-center gap-2.5 px-2 pt-4 text-xs text-[var(--trigonum-muted)]">
        <span className="grid size-7 place-items-center rounded-full bg-[color-mix(in_srgb,var(--trigonum-blue)_14%,white)] text-[11px] font-bold text-[var(--trigonum-blue)]">
          {user.initials}
        </span>
        © 2025 Trigonum Broker
      </div>
    </aside>
  )
}
