import { BadgeCheck, ExternalLink, FileBadge2, Landmark, ShieldCheck } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'
import './ComplianceTiers.css'

const REGULATOR_URL =
  'https://fsa.gov.kg/category/%D0%B4%D0%B5%D1%8F%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D0%BE%D1%81%D1%82%D1%8C/%D0%B2%D0%B8%D1%80%D1%82%D1%83%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B5-%D0%B0%D0%BA%D1%82%D0%B8%D0%B2%D1%8B/'

const icons = [FileBadge2, BadgeCheck, Landmark, ShieldCheck]

export function ComplianceSection() {
  const { language } = useI18n()
  const { compliance } = landingContent(language)

  const trustTitle = language === 'ru' ? 'Надёжность и прозрачность' : language === 'ky' ? 'Ишенимдүүлүк жана ачык-айкындуулук' : 'Reliability and transparency'
  const trustText = language === 'ru'
    ? 'Регуляторные требования, процедуры контроля и защита доступа встроены в операционную модель платформы.'
    : language === 'ky'
      ? 'Жөнгө салуучу талаптар, көзөмөл жол-жоболору жана кирүү мүмкүнчүлүгүн коргоо платформанын операциялык моделине киргизилген.'
      : 'Regulatory requirements, control procedures and access protection are embedded into the platform operating model.'

  return (
    <section className="compliance-v2" id="compliance">
      <div className="compliance-v2-head">
        <div className="compliance-v2-copy">
          <p className="compliance-v2-kicker">{trustTitle}</p>
          <h2>{compliance.title}</h2>
          <p>{compliance.subtitle}</p>
        </div>

        <aside className="compliance-v2-trust" aria-label={trustTitle}>
          <div className="compliance-v2-trust-copy">
            <span>COMPLIANCE BY DESIGN</span>
            <p>{trustText}</p>
            <div className="compliance-v2-trust-list" aria-hidden="true">
              <span><i />{language === 'ru' ? 'Прозрачность' : language === 'ky' ? 'Ачык-айкындуулук' : 'Transparency'}</span>
              <span><i />{language === 'ru' ? 'Контроль' : language === 'ky' ? 'Көзөмөл' : 'Control'}</span>
              <span><i />{language === 'ru' ? 'Защита клиента' : language === 'ky' ? 'Кардарды коргоо' : 'Client protection'}</span>
            </div>
          </div>
          <span className="compliance-v2-shield" aria-hidden="true"><ShieldCheck /></span>
        </aside>
      </div>

      <div className="compliance-v2-grid">
        {compliance.points.map((point, index) => {
          const Icon = icons[index] ?? ShieldCheck
          return (
            <article className="compliance-v2-card" key={point.title}>
              <span className="compliance-v2-number">0{index + 1}</span>
              <span className="compliance-v2-icon"><Icon strokeWidth={1.7} /></span>
              <h3>{point.title}</h3>
              <p>{point.text}</p>
              {index === 0 && (
                <a className="compliance-v2-card-link" href={REGULATOR_URL} target="_blank" rel="noreferrer">
                  {compliance.link}<ExternalLink size={14} />
                </a>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
