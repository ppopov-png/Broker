import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landing'

/**
 * Полоса фактов вместо полосы абстракций. Числа здесь только проверяемые:
 * придуманный счётчик, который не растёт между визитами, обнаруживается за
 * день и стоит дороже, чем его отсутствие (docs/landing-structure.md §3).
 */
export function StatsStrip() {
  const { language } = useI18n()
  const { stats } = landingContent(language)

  return (
    <section className="stats-strip" aria-label="Ключевые факты">
      {stats.map((item) => (
        <article className="stat-item" key={item.label}>
          <p className="stat-value">{item.value}</p>
          <p className="stat-label">{item.label}</p>
          <p className="stat-note">{item.note}</p>
        </article>
      ))}
    </section>
  )
}
