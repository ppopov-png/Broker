import { ArrowUpRight, BadgeCheck, ExternalLink, FileBadge2, Headphones, Landmark } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'

const actionLabels = {
  ru: { regulator: 'Сайт регулятора', documents: 'Документы', contact: 'Написать в поддержку' },
  en: { regulator: 'Regulator website', documents: 'Documents', contact: 'Contact support' },
  ky: { regulator: 'Жөнгө салуучунун сайты', documents: 'Документтер', contact: 'Колдоого жазуу' },
}

export function TrustStrip() {
  const { t, language } = useI18n()
  const actions = actionLabels[language]

  return (
    <section className="trust-strip" id="compliance">
      <a className="trust-item regulation" href="https://fsa.gov.kg/category/%D0%B4%D0%B5%D1%8F%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D0%BE%D1%81%D1%82%D1%8C/%D0%B2%D0%B8%D1%80%D1%82%D1%83%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B5-%D0%B0%D0%BA%D1%82%D0%B8%D0%B2%D1%8B/" target="_blank" rel="noreferrer">
        <Landmark strokeWidth={1.7} />
        <div><h3>{t('trust.regulation')}</h3><p>{t('trust.regulationText')}</p><span>{actions.regulator} <ExternalLink size={13} /></span></div>
      </a>
      <a className="trust-item license" href="#license">
        <FileBadge2 strokeWidth={1.7} />
        <div><h3>{t('trust.license')}</h3><p>{t('trust.licenseText')}</p><span>{actions.documents} <ArrowUpRight size={13} /></span></div>
      </a>
      <a className="trust-item standards" href="#aml">
        <BadgeCheck strokeWidth={1.7} />
        <div><h3>{t('trust.standards')}</h3><div className="standard-labels"><b>AML</b><b>KYC</b><b>CFT</b></div></div>
      </a>
      <a className="trust-item support" href="#support">
        <Headphones strokeWidth={1.7} />
        <div><h3>{t('trust.support')}</h3><p>{t('trust.supportText')}</p><span>{actions.contact} <ArrowUpRight size={13} /></span></div>
      </a>
    </section>
  )
}
