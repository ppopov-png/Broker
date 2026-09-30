import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import trigonumWordmark from '../assets/trigonum-wordmark.svg'
import { cabinetUrl, onboardingUrl } from '../lib/appLinks'
import { useI18n, type Language } from '../i18n/I18nProvider'

const NAV = {
  ru: [
    ['Инвестиции', '#top'],
    ['Продукты', '#products'],
    ['Результаты', '#results'],
    ['О компании', '#compliance'],
    ['Помощь', '#faq'],
  ],
  en: [
    ['Investments', '#top'],
    ['Products', '#products'],
    ['Results', '#results'],
    ['Company', '#compliance'],
    ['Help', '#faq'],
  ],
  ky: [
    ['Инвестициялар', '#top'],
    ['Продукттар', '#products'],
    ['Натыйжалар', '#results'],
    ['Компания', '#compliance'],
    ['Жардам', '#faq'],
  ],
} as const

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { language, setLanguage } = useI18n()
  const closeMobile = () => setMobileOpen(false)
  const nav = NAV[language]

  return (
    <header className="site-header v2-site-header">
      <a className="brand" href="#top" aria-label="Trigonum Broker" onClick={closeMobile}>
        <img className="brand-wordmark" src={trigonumWordmark} alt="TRIGONUM" />
        <span className="brand-product">Broker</span>
      </a>

      <nav className="main-nav v2-main-nav" aria-label="Основная навигация">
        {nav.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
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

      <div className="header-actions v2-header-actions">
        <label className="v2-language-select">
          <span className="sr-only">Язык</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value as Language)} aria-label="Язык">
            <option value="ru">RU</option>
            <option value="en">EN</option>
            <option value="ky">KY</option>
          </select>
          <ChevronDown size={13} aria-hidden="true" />
        </label>
        <a className="button button-secondary compact" href={cabinetUrl()}>Войти</a>
      </div>

      <nav id="mobile-nav" className={`mobile-nav-panel${mobileOpen ? ' is-open' : ''}`} aria-label="Мобильная навигация">
        {nav.map(([label, href]) => <a key={label} href={href} onClick={closeMobile}>{label}</a>)}
        <label className="v2-mobile-language">
          <span>Язык</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
            <option value="ru">RU</option>
            <option value="en">EN</option>
            <option value="ky">KY</option>
          </select>
        </label>
        <div className="mobile-nav-actions">
          <a href={cabinetUrl()} onClick={closeMobile}>Войти</a>
          <a href={onboardingUrl()} onClick={closeMobile}>Открыть счёт</a>
        </div>
      </nav>
    </header>
  )
}
