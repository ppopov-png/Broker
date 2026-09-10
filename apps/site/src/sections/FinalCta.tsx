import { ArrowUpRight } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'
import { cabinetUrl, onboardingUrl } from '../lib/appLinks'

export function FinalCta() {
  const { language } = useI18n()
  const { final } = landingContent(language)

  return (
    <section className="final-cta">
      <h2>{final.title}</h2>
      <p>{final.text}</p>
      <div className="final-actions">
        <a className="button button-primary" href={onboardingUrl()}>{final.cta}<ArrowUpRight size={15} /></a>
        <a className="button button-secondary" href={cabinetUrl()}>{final.secondary}</a>
      </div>
    </section>
  )
}
