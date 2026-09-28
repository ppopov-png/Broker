import { ChevronDown } from 'lucide-react'
import trigonumWordmark from '../assets/trigonum-wordmark.svg'
import { cabinetUrl, onboardingUrl } from '../lib/appLinks'

export function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Trigonum Broker">
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

      <div className="header-actions">
        <a className="button button-secondary compact" href={cabinetUrl()}>Войти</a>
        <a className="button button-primary compact" href={onboardingUrl()}>Открыть счёт</a>
      </div>
    </header>
  )
}
