import { CalendarDays, Clock3, Coins, Zap } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'

const ICONS = [Coins, Zap, CalendarDays, Clock3]

export function StatsStrip() {
  const { language } = useI18n()
  const { stats } = landingContent(language)

  return (
    <section className="v2-stats-strip" aria-label="Ключевые факты">
      {stats.map((item, index) => {
        const Icon = ICONS[index] ?? Coins
        return (
          <article className="v2-stat-item" key={item.label}>
            <span className="v2-stat-icon" aria-hidden="true"><Icon size={28} /></span>
            <div>
              <p className="v2-stat-value">{item.value}</p>
              <p className="v2-stat-label">{item.label}</p>
              <p className="v2-stat-note">{item.note}</p>
            </div>
          </article>
        )
      })}
    </section>
  )
}
