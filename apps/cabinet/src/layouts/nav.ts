import {
  CalendarClock,
  FileText,
  Headphones,
  Home,
  Landmark,
  Repeat,
  ShieldCheck,
  TrendingUp,
  User,
  Wallet,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  badge?: string
}

export const primaryNav: NavItem[] = [
  { to: '/', label: 'Главная', icon: Home },
  { to: '/capital', label: 'Капитал', icon: Wallet },
  { to: '/deposit', label: 'Пополнить', icon: WalletCards },
  { to: '/withdraw', label: 'Вывести', icon: Landmark },
  { to: '/invest', label: 'Инвестировать', icon: TrendingUp },
  { to: '/events', label: 'Events', icon: CalendarClock, badge: 'NEW' },
  { to: '/transactions', label: 'Транзакции', icon: Repeat },
  { to: '/documents', label: 'Документы', icon: FileText },
]

export const secondaryNav: NavItem[] = [
  { to: '/profile', label: 'Профиль', icon: User },
  { to: '/security', label: 'Безопасность', icon: ShieldCheck },
  { to: '/support', label: 'Поддержка', icon: Headphones },
]
