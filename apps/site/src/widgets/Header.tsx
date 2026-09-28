import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import trigonumWordmark from '../assets/trigonum-wordmark.svg'
import { cabinetUrl, onboardingUrl } from '../lib/appLinks'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Trigonum Broker" onClick={closeMobile}>
        <img className="brand-wordmark" src={trigonumWordmark} alt="TRIGONUM" />
        <span className="brand-product">Broker</span>
      </a>

      <nav className="main-nav" aria-label="Основная навигация">
        <a href="#products">Продукты</a>
        <a href="#how">Инвестпроцесс</a>
        <a href="#results">Результаты</a>
        <details className="nav-conditions">
          <summary>Условия <ChevronDown size={16} /></summary>
          <div className="nav-conditions-menu">
            <a href="#fees">Комиссии</a>
            <a href="#custody">Хранение</a>
            <a href="#compliance">Комплаенс</a>
          </div>
        </details>
        <a href="#tiers">Уровни</a>
        <a href="#faq">FAQ</a>
      </nav>

      <button
        type="button"
        className={`mobile-nav-trigger${mobileOpen ? ' is-open' : ''}`}
        aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav"
        onClick={() => setMobileOpen((value) => !value)}
      >
        <i /><i /><i />
      </button>

      <div className="header-actions">
        <a className="button button-secondary compact" href={cabinetUrl()}>Войти</a>
        <a className="button button-primary compact" href={onboardingUrl()}>Открыть счёт</a>
      </div>

      <nav id="mobile-nav" className={`mobile-nav-panel${mobileOpen ? ' is-open' : ''}`} aria-label="Мобильная навигация">
        <a href="#products" onClick={closeMobile}>Продукты</a>
        <a href="#how" onClick={closeMobile}>Инвестпроцесс</a>
        <a href="#results" onClick={closeMobile}>Результаты</a>
        <a href="#fees" onClick={closeMobile}>Комиссии</a>
        <a href="#custody" onClick={closeMobile}>Хранение</a>
        <a href="#compliance" onClick={closeMobile}>Комплаенс</a>
        <a href="#tiers" onClick={closeMobile}>Уровни</a>
        <a href="#faq" onClick={closeMobile}>FAQ</a>
        <div className="mobile-nav-actions">
          <a href={cabinetUrl()} onClick={closeMobile}>Войти</a>
          <a href={onboardingUrl()} onClick={closeMobile}>Открыть счёт</a>
        </div>
      </nav>
    </header>
  )
}
