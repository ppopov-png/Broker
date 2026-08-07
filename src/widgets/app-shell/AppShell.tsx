import { BarChart3, ChevronDown, CircleHelp, FileText, LayoutDashboard, LogOut, MessageCircle, ShieldCheck, WalletCards } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import logo from '../../assets/trigonum-logo-white.png'
import './app-shell.css'
import './app-shell-interactions.css'
import './app-shell-support.css'
import './app-shell-direct-profile.css'
import './app-shell-logout.css'

type ShellRole = 'investor' | 'team-lead'

const investorItems = [
  ['Обзор', '/investor/overview', LayoutDashboard],
  ['Маркет стратегий', '/investor/offers', WalletCards],
  ['Портфель', '/investor/portfolio', ShieldCheck],
  ['Средства', '/investor/funds', WalletCards],
  ['Сообщения', '/investor/messages', MessageCircle],
] as const

const teamLeadItems = [
  ['Обзор', '/team-lead/overview', LayoutDashboard],
  ['Предложения', '/team-lead/offers', WalletCards],
  ['Инвестиции', '/team-lead/investments', ShieldCheck, '3'],
  ['Расчёты', '/team-lead/settlements', BarChart3],
  ['Отчётность', '/team-lead/reports', FileText],
  ['Сообщения', '/team-lead/messages', MessageCircle],
] as const

const titles: Record<ShellRole, Record<string, string>> = {
  investor: { '/investor/overview': 'Добро пожаловать, Инвестор', '/investor/offers': 'Маркет стратегий', '/investor/portfolio': 'Портфель', '/investor/funds': 'Средства', '/investor/support': 'Поддержка', '/investor/profile': 'Личный кабинет', '/investor/messages': 'Сообщения' },
  'team-lead': { '/team-lead/overview': 'Добро пожаловать, Тимлид', '/team-lead/offers': 'Предложения', '/team-lead/investments': 'Инвестиции', '/team-lead/settlements': 'Расчёты', '/team-lead/reports': 'Отчётность', '/team-lead/messages': 'Сообщения', '/team-lead/support': 'Поддержка', '/team-lead/profile': 'Личный кабинет' },
}

export function AppShell({ role = 'investor' }: { role?: ShellRole }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const items = role === 'investor' ? investorItems : teamLeadItems
  const prefix = role === 'investor' ? '/investor' : '/team-lead'
  const title = titles[role][pathname] ?? `Кабинет ${role === 'investor' ? 'инвестора' : 'тимлида'}`
  const email = role === 'investor' ? 'investor@example.com' : 'teamlead@example.com'
  const avatar = role === 'investor' ? 'TI' : 'TL'
  const logout = () => { sessionStorage.removeItem('broker-demo-session'); navigate('/login') }

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-icon" aria-hidden="true"><img src={logo} alt="" /></span><img className="brand-logo" src={logo} alt="Trigonum" /></div>
      <nav>{items.map(([label, to, Icon, count]) => <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={22} /><span>{label}</span>{count && <em className="nav-badge">{count}</em>}</NavLink>)}</nav>
      <div className="sidebar-footer">
        <NavLink className="support" to={`${prefix}/support`}><CircleHelp size={22} /><span><b>Поддержка</b><small>support@trigonum.io</small></span></NavLink>
        <button className="logout" onClick={logout}><LogOut size={21} /><span>Выйти</span></button>
      </div>
    </aside>
    <section className="shell-main"><header className="topbar">{title ? <h1>{title}</h1> : <div />}<NavLink className="identity identity-trigger" to={`${prefix}/profile`}><div><b>Trigonum ID</b><small>{email}</small></div><div className="avatar">{avatar}</div><ChevronDown size={18} /></NavLink></header><Outlet /></section>
  </div>
}
