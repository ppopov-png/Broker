import { Check, ChevronDown, Globe2 } from 'lucide-react'
import { useState } from 'react'
import { cabinetUrl, onboardingUrl } from '../lib/appLinks'
import { useI18n, type Language } from '../i18n/I18nProvider'

function MiniMark() {
  return (
    <svg viewBox="0 0 62 62" aria-hidden="true" className="brand-mark">
      <defs>
        <linearGradient id="logoGradient" x1="8" y1="9" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#095BF4" />
          <stop offset="0.58" stopColor="#00A9E8" />
          <stop offset="1" stopColor="#22C873" />
        </linearGradient>
      </defs>
      <path d="M31 5 56 49H44L31 27 18 49H6L31 5Z" fill="url(#logoGradient)" />
      <path d="m17 50 14-9 14 9H17Z" fill="#0B2C68" opacity=".92" />
      <path d="M31 27v14" stroke="white" strokeWidth="2" opacity=".85" />
    </svg>
  )
}

const languageNames: Record<Language, string> = { ru: 'RU', en: 'EN', ky: 'KG' }
const languageFullNames: Record<Language, string> = { ru: 'Русский', en: 'English', ky: 'Кыргызча' }

export function Header() {
  const { language, setLanguage, t } = useI18n()
  const [languageOpen, setLanguageOpen] = useState(false)

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Trigonum Broker">
        <MiniMark />
        <span className="brand-name">TRIGONUM</span>
        <span className="brand-divider" />
        <span className="brand-product">BROKER</span>
      </a>

      <nav className="main-nav" aria-label="Основная навигация">
        <a href="#products">{t('nav.products')} <ChevronDown size={14} /></a>
        <a href="#how">{t('nav.how')}</a>
        <a href="#business">{t('nav.business')}</a>
        <a href="#private">{t('nav.private')}</a>
        <a href="#compliance">{t('nav.compliance')}</a>
        <a href="#about">{t('nav.about')}</a>
        <a href="#faq">FAQ</a>
      </nav>

      <div className="header-actions">
        <div className="language-switcher">
          <button
            className="language-button"
            type="button"
            aria-label={t('lang.label')}
            aria-expanded={languageOpen}
            onClick={() => setLanguageOpen((open) => !open)}
          >
            <Globe2 size={17} />
            <span>{languageNames[language]}</span>
            <ChevronDown size={13} className={languageOpen ? 'language-chevron open' : 'language-chevron'} />
          </button>
          {languageOpen && (
            <div className="language-menu">
              {(Object.keys(languageNames) as Language[]).map((item) => (
                <button
                  type="button"
                  key={item}
                  className={item === language ? 'language-option active' : 'language-option'}
                  onClick={() => { setLanguage(item); setLanguageOpen(false) }}
                >
                  <span className="language-code">{languageNames[item]}</span>
                  <span>{languageFullNames[item]}</span>
                  {item === language && <Check size={15} />}
                </button>
              ))}
            </div>
          )}
        </div>
        <a className="button button-secondary compact" href={cabinetUrl()}>{t('nav.login')}</a>
        <a className="button button-primary compact" href={onboardingUrl()}>{t('nav.open')}</a>
      </div>
    </header>
  )
}
