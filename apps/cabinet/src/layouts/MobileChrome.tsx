import { Bell, CalendarClock, Home, LayoutGrid, Menu, TrendingUp, Wallet, X } from 'lucide-react'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { SignOutButton } from '../modules/auth/SignOutButton'
import { useBrokerAccount } from '../shared/lib/AccountContext'
import { tierAccent } from '../shared/lib/InvestorStatus'
import { useOnboardingActionRequired } from '../shared/lib/onboarding/useOnboarding'
import { useInvestorStatus } from '../shared/lib/useInvestorStatus'
import { notifications } from '../shared/mock/data'
import { Logo } from '../shared/ui/Logo'
import { primaryNav, secondaryNav } from './nav'

/** Пять вкладок внизу — то, ради чего заходят с телефона. Остальное в шторке. */
const tabs = [
  { to: '/', label: 'Главная', icon: Home, end: true },
  { to: '/capital', label: 'Капитал', icon: Wallet, end: false },
  { to: '/invest', label: 'Инвест', icon: TrendingUp, end: false },
  { to: '/events', label: 'Events', icon: CalendarClock, end: false },
]

/** Шторку открывают и шапка, и вкладка «Ещё», поэтому состояние общее. */
const MobileMenuContext = createContext<{ open: boolean; setOpen: (value: boolean) => void } | null>(null)

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const value = useMemo(() => ({ open, setOpen }), [open])
  return <MobileMenuContext.Provider value={value}>{children}</MobileMenuContext.Provider>
}

function useMobileMenu() {
  const context = useContext(MobileMenuContext)
  if (!context) throw new Error('useMobileMenu должен вызываться внутри MobileNavProvider')
  return context
}

export function MobileHeader() {
  const { open, setOpen } = useMobileMenu()
  const { activeAccount } = useBrokerAccount()
  const { status } = useInvestorStatus()
  const onboardingNeedsAction = useOnboardingActionRequired()
  const location = useLocation()

  // Переход по ссылке из шторки должен её закрывать.
  useEffect(() => setOpen(false), [location.pathname])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative -ml-1.5 grid size-9 place-items-center rounded-lg text-[var(--trigonum-ink)]"
          aria-label="Меню"
        >
          <Menu size={20} />
          {onboardingNeedsAction && (
            <span className="absolute right-1 top-1 size-2 rounded-full bg-[var(--trigonum-warning)]" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <Logo />
        </div>

        <NavLink
          to="/support"
          className="relative grid size-9 place-items-center rounded-full text-[var(--trigonum-muted)]"
          aria-label="Уведомления"
        >
          <Bell size={19} />
          {notifications.length > 0 && (
            <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-[var(--trigonum-danger)] text-[9px] font-bold text-white">
              {notifications.length}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/profile"
          className="grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-bold"
          style={{
            background: `color-mix(in srgb, ${tierAccent[status.tier]} 18%, white)`,
            color: 'var(--trigonum-ink)',
            boxShadow: `inset 0 0 0 1.5px ${tierAccent[status.tier]}`,
          }}
          aria-label="Профиль"
        >
          {activeAccount.initials}
        </NavLink>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[rgb(8_27_58/45%)] backdrop-blur-[2px]"
          />

          <nav className="trg-rise absolute inset-y-0 left-0 flex w-[82vw] max-w-[320px] flex-col overflow-y-auto bg-[var(--trigonum-surface)] px-4 py-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-lg text-[var(--trigonum-muted)]"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-1">
              {primaryNav.map(({ to, label, icon: Icon, badge }) => (
                <DrawerLink key={to} to={to} label={label} icon={<Icon size={18} />} badge={badge} end={to === '/'} />
              ))}

              <div className="my-3 border-t border-[var(--trigonum-border)]" />

              {secondaryNav.map(({ to, label, icon: Icon }) => (
                <DrawerLink
                  key={to}
                  to={to}
                  label={label}
                  icon={<Icon size={18} />}
                  dot={to === '/onboarding' && onboardingNeedsAction}
                />
              ))}
            </div>

            <div className="mt-auto pt-5">
              <div className="flex items-center gap-2.5 rounded-xl border border-[var(--trigonum-border)] px-3 py-2.5">
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-xs font-bold"
                  style={{
                    background: `color-mix(in srgb, ${tierAccent[status.tier]} 18%, white)`,
                    color: 'var(--trigonum-ink)',
                  }}
                >
                  {activeAccount.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold text-[var(--trigonum-ink)]">{activeAccount.name}</span>
                  <span className="mt-0.5 block text-[10px] text-[var(--trigonum-muted)]">
                    {status.tier} · {status.score} pts
                  </span>
                </span>
              </div>
              <div className="mt-1.5">
                <SignOutButton onDone={() => setOpen(false)} />
              </div>
              <p className="px-1 pt-3 text-[10px] text-[var(--trigonum-muted)]">© 2026 Trigonum Broker</p>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

function DrawerLink({
  to,
  label,
  icon,
  badge,
  dot = false,
  end = false,
}: {
  to: string
  label: string
  icon: React.ReactNode
  badge?: string
  dot?: boolean
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? 'bg-[color-mix(in_srgb,var(--trigonum-blue)_10%,white)] text-[var(--trigonum-blue)]'
            : 'text-[var(--trigonum-text)]'
        }`
      }
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="rounded-full bg-[var(--trigonum-green)] px-1.5 py-0.5 text-[10px] font-bold text-white">{badge}</span>
      )}
      {dot && <span className="size-2 shrink-0 rounded-full bg-[var(--trigonum-warning)]" />}
    </NavLink>
  )
}

/** Нижняя панель: большие цели пальцем, безопасная зона под жест «домой». */
export function MobileTabBar() {
  const { setOpen } = useMobileMenu()

  return (
    <nav className="fixed bottom-0 left-0 z-40 grid w-screen grid-cols-5 border-t border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] pb-[env(safe-area-inset-bottom)] lg:hidden">
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition ${
              isActive ? 'text-[var(--trigonum-blue)]' : 'text-[var(--trigonum-muted)]'
            }`
          }
        >
          <Icon size={20} strokeWidth={2} />
          {label}
        </NavLink>
      ))}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold text-[var(--trigonum-muted)] transition"
      >
        <LayoutGrid size={20} strokeWidth={2} />
        Ещё
      </button>
    </nav>
  )
}
