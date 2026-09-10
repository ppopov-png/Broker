import { ArrowUpRight, Landmark } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'
import { onboardingUrl } from '../lib/appLinks'

export function CustodySection() {
  const { language } = useI18n()
  const { custody } = landingContent(language)

  return (
    <section className="custody-section" id="custody">
      <div className="custody-intro">
        <span className="custody-badge"><Landmark size={18} strokeWidth={1.8} /></span>
        <h2>{custody.title}</h2>
        <p>{custody.subtitle}</p>
        <a className="custody-link" href={onboardingUrl()}>{custody.cta}<ArrowUpRight size={15} /></a>
      </div>
      <div className="custody-points">
        {custody.points.map((point) => <article key={point.title}><h3>{point.title}</h3><p>{point.text}</p></article>)}
      </div>
    </section>
  )
}
