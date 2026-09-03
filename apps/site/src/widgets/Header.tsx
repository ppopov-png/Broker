import { Check, ChevronDown, Globe2 } from 'lucide-react'
import { useState } from 'react'
import trigonumIcon from '../assets/trigonum-icon.svg'
import trigonumWordmark from '../assets/trigonum-wordmark.svg'
import { useI18n, type Language } from '../i18n/I18nProvider'
import { cabinetUrl, onboardingUrl } from '../lib/appLinks'

const languageNames: Record<Language, string> = { ru: 'RU', en: 'EN', ky: 'KG' }
const languageFullNames: Record<Language, string> = { ru: 'Русский', en: 'English', ky: 'Кыргызча' }

export function Header() {
  const { language, setLanguage, t } = useI18n()
  const [languageOpen, setLanguageOpen] = useState(false)

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Trigonum Broker">
        <img className="brand-mark" src={trigonumIcon} alt="" aria-hidden="true" />
        <img className="brand-wordmark" src={trigonumWordmark} alt="TRIGONUM" />
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
