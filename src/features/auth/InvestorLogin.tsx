import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import logo from '../../assets/trigonum-logo-white.png'
import './investor-login.css'
import './investor-login-role.css'

export function InvestorLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const recovery = location.pathname.includes('forgot-password')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'investor' | 'team-lead'>('investor')
  const [email, setEmail] = useState('investor@example.com')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)

  const enter = (event: React.FormEvent) => {
    event.preventDefault()
    sessionStorage.setItem('broker-demo-session', 'active')
    navigate(role === 'investor' ? '/investor/overview' : '/team-lead/overview')
  }

  const sendRecovery = (event: React.FormEvent) => {
    event.preventDefault()
    setSent(true)
  }

  return <main className="login-page">
    <div className="login-grid" aria-hidden="true" />
    <header className="login-header">
      <img src={logo} alt="Trigonum Broker" />
      <span>Защищённая инвестиционная платформа</span>
    </header>

    <section className="login-layout">
      <div className="login-hero">
        <p>TRIGONUM BROKER</p>
        <h1>Инвестиции —<br /><em>в вашем ритме.</em></h1>
        <span>Управляйте стратегиями, средствами и отчётностью в одном защищённом пространстве.</span>
        <div className="login-points">
          <i><ShieldCheck size={18} /></i><div><b>Trigonum ID</b><small>Единый защищённый вход для всех сервисов Trigonum</small></div>
          <i><CheckCircle2 size={18} /></i><div><b>Прозрачный результат</b><small>Стратегии, договоры и движение средств всегда под рукой</small></div>
        </div>
      </div>

      <section className="login-card">
        {recovery ? <>
          <button className="login-back" onClick={() => navigate('/login')}><ArrowLeft size={16} /> Назад ко входу</button>
          {sent ? <div className="login-sent">
            <span><CheckCircle2 /></span>
            <p>Письмо отправлено</p>
            <small>Ссылка для восстановления доступа отправлена на {email}.</small>
            <button className="login-primary" onClick={() => navigate('/login')}>Вернуться ко входу <ArrowRight size={17} /></button>
          </div> : <form onSubmit={sendRecovery}>
            <p className="login-kicker">ВОССТАНОВЛЕНИЕ ДОСТУПА</p>
            <h2>Забыли пароль?</h2>
            <span className="login-copy">Введите адрес, привязанный к Trigonum ID. Мы отправим ссылку для восстановления.</span>
            <LoginField label="Email" icon={<Mail size={17} />} value={email} onChange={setEmail} type="email" />
            <button className="login-primary" type="submit">Отправить ссылку <ArrowRight size={17} /></button>
          </form>}
        </> : <form onSubmit={enter}>
          <div className="login-role-switch" role="group" aria-label="Выбор роли">
            <button className={role === 'investor' ? 'active' : ''} type="button" onClick={() => setRole('investor')}>Инвестор</button>
            <button className={role === 'team-lead' ? 'active' : ''} type="button" onClick={() => setRole('team-lead')}>Тимлид</button>
          </div>
          <p className="login-kicker">ВХОД В TRIGONUM BROKER</p>
          <h2>{role === 'investor' ? 'Добро пожаловать' : 'Кабинет тимлида'}</h2>
          <span className="login-copy">Войдите с помощью вашего Trigonum ID как {role === 'investor' ? 'инвестор' : 'тимлид'}.</span>
          <LoginField label="Email" icon={<Mail size={17} />} value={email} onChange={setEmail} type="email" />
          <label className="login-field"><span>Пароль</span><div><LockKeyhole size={17} /><input required value={password} onChange={event => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Введите пароль" autoComplete="current-password" /><button type="button" aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          <div className="login-options"><label><input type="checkbox" defaultChecked /> Запомнить меня</label><button type="button" onClick={() => navigate('/forgot-password')}>Забыли пароль?</button></div>
          <button className="login-primary" type="submit">Войти <ArrowRight size={17} /></button>
          <p className="login-help">Нет доступа к Trigonum ID? <button type="button" onClick={() => navigate('/investor/support')}>Написать в поддержку</button></p>
        </form>}
      </section>
    </section>
    <footer className="login-footer"><span>© 2026 Trigonum</span><span>Безопасность · Конфиденциальность</span></footer>
  </main>
}

function LoginField({ label, icon, value, onChange, type = 'text' }: { label: string; icon: React.ReactNode; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="login-field"><span>{label}</span><div>{icon}<input required value={value} onChange={event => onChange(event.target.value)} type={type} autoComplete={type === 'email' ? 'email' : 'off'} placeholder={type === 'email' ? 'you@example.com' : ''} /></div></label>
}
