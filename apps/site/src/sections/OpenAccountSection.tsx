import { ArrowUpRight } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'
import { onboardingUrl } from '../lib/appLinks'
import { GoalCalculator } from './GoalCalculator'

export function OpenAccountSection() {
  const { language } = useI18n()
  const { open } = landingContent(language)

  return (
    <section className="open-section" id="open">
      <header className="section-head"><h2>{open.title}</h2><p>{open.subtitle}</p></header>
      <div className="open-layout">
        <div className="open-steps-column">
          <ol className="open-steps">
            {open.steps.map((step, index) => (
              <li key={step.title}>
                <span className="open-index">{index + 1}</span>
                <div><h3>{step.title}</h3><p>{step.text}</p></div>
                <span className="open-time">{step.time}</span>
              </li>
            ))}
          </ol>
          <div className="open-footer">
            <p><b>{open.needTitle}.</b> {open.need}</p>
            <a className="button button-primary" href={onboardingUrl()}>{open.cta}<ArrowUpRight size={15} /></a>
          </div>
        </div>
        <GoalCalculator />
      </div>
    </section>
  )
}
