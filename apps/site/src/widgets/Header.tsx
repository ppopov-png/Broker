import { Check, ChevronDown, Globe2 } from 'lucide-react'
import { useState } from 'react'
import { useI18n, type Language } from '../i18n/I18nProvider'
import { cabinetUrl, onboardingUrl } from '../lib/appLinks'

function MiniMark() {
  return (
    <svg viewBox="0 0 64 58" aria-hidden="true" className="brand-mark">
      <defs>
        <linearGradient id="trigonumMarkGradient" x1="7" y1="5" x2="57" y2="53" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3F3F8A" />
          <stop offset="0.52" stopColor="#7575FF" />
          <stop offset="1" stopColor="#A940E8" />
        </linearGradient>
      </defs>
      <path d="M32 4 59 52H47L32 26 17 52H5L32 4Z" fill="url(#trigonumMarkGradient)" />
      <path d="m17 52 15-9 15 9H17Z" fill="#25254F" opacity=".94" />
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
        <a href="#products">{t('nav.products')} <ChevronDown size={13} strokeWidth={2.4} /></a>
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
            <Globe2 size={16} />
            <span>{languageNames[language]}</span>
            <ChevronDown size={12} className={languageOpen ? 'language-chevron open' : 'language-chevron'} />
          </button>
          {languageOpen && (
            <div className="language-menu">
              {(Object.keys(languageNames) as Language[]).map((item) => (
                <button
                  type="button"
                  key={item}
                  className={item === language ? 'language-option active' : 'language-option'}
                  onClick={() => {
                    setLanguage(item)
                    setLanguageOpen(false)
                  }}
                >
                  <span className="language-code">{languageNames[item]}</span>
                  <span>{languageFullNames[item]}</span>
                  {item === language && <Check size={14} />}
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
