import { BadgeCheck, ExternalLink, FileBadge2, Landmark, ShieldCheck } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landing'

const REGULATOR_URL =
  'https://fsa.gov.kg/category/%D0%B4%D0%B5%D1%8F%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D0%BE%D1%81%D1%82%D1%8C/%D0%B2%D0%B8%D1%80%D1%82%D1%83%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B5-%D0%B0%D0%BA%D1%82%D0%B8%D0%B2%D1%8B/'

const icons = [FileBadge2, BadgeCheck, Landmark, ShieldCheck]

export function ComplianceSection() {
  const { language } = useI18n()
  const { compliance } = landingContent(language)

  return (
    <section className="compliance-section" id="compliance">
      <header className="section-head">
        <h2>{compliance.title}</h2>
        <p>{compliance.subtitle}</p>
      </header>

      <div className="compliance-grid">
        {compliance.points.map((point, index) => {
          const Icon = icons[index] ?? ShieldCheck
          return (
            <article key={point.title}>
              <Icon strokeWidth={1.7} />
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </article>
          )
        })}
      </div>

      <a className="compliance-link" href={REGULATOR_URL} target="_blank" rel="noreferrer">
        {compliance.link}
        <ExternalLink size={14} />
      </a>
    </section>
  )
}
