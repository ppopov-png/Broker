import { BadgeCheck, FileBadge2, Headphones } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'

function NavaSeal() {
  return (
    <div className="nava-seal" aria-label="НАВА Кыргызской Республики">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="29" fill="#D51E2B" />
        <circle cx="32" cy="32" r="20" fill="none" stroke="#F4C542" strokeWidth="2" />
        <g stroke="#F4C542" strokeWidth="2" strokeLinecap="round">
          <path d="M32 7v8M32 49v8M7 32h8M49 32h8M14.3 14.3l5.6 5.6M44.1 44.1l5.6 5.6M49.7 14.3l-5.6 5.6M19.9 44.1l-5.6 5.6" />
        </g>
        <circle cx="32" cy="32" r="8" fill="#F4C542" />
        <path d="M27 27h10v10H27zM29 29h6v6h-6z" fill="#D51E2B" fillRule="evenodd" />
      </svg>
      <span>НАВА</span>
    </div>
  )
}

export function TrustStrip() {
  const { t } = useI18n()

  return (
    <section className="trust-strip" id="compliance">
      <article>
        <NavaSeal />
        <div><h3>{t('trust.regulation')}</h3><p>{t('trust.regulationText')}</p></div>
      </article>
      <article>
        <FileBadge2 />
        <div><h3>{t('trust.license')}</h3><p>{t('trust.licenseText')}</p></div>
      </article>
      <article className="standards">
        <BadgeCheck />
        <div><h3>{t('trust.standards')}</h3><div className="standard-labels"><b>AML</b><b>KYC</b><b>CFT</b></div></div>
      </article>
      <article>
        <Headphones />
        <div><h3>{t('trust.support')}</h3><p>{t('trust.supportText')}</p></div>
      </article>
    </section>
  )
}
