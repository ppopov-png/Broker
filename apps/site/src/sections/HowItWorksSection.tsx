import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landing'

/**
 * Объяснение источника доходности. Без него 7–20% выглядят обещанием из
 * воздуха — а именно это и отпугивает аудиторию с реальным капиталом.
 */
export function HowItWorksSection() {
  const { language } = useI18n()
  const { how } = landingContent(language)

  return (
    <section className="how-section" id="how">
      <header className="section-head">
        <h2>{how.title}</h2>
        <p>{how.subtitle}</p>
      </header>

      <ol className="how-steps">
        {how.steps.map((step, index) => (
          <li key={step.title}>
            <span className="how-index">{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>

      <p className="how-note">{how.note}</p>
    </section>
  )
}
