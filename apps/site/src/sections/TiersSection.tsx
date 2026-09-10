import { ArrowRight, BarChart3, Globe2, GraduationCap, UsersRound } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'
import './ComplianceTiers.css'

export function TiersSection() {
  const { language } = useI18n()
  const { tiers } = landingContent(language)

  const kicker = language === 'ru' ? 'Доступ к рынкам' : language === 'ky' ? 'Рынокторго жетүү' : 'Market access'
  const principles = language === 'ru'
    ? [
        ['Гибкие условия', 'для разных задач'],
        ['Доступ к глобальным', 'рынкам'],
        ['Профессиональная', 'поддержка'],
      ]
    : language === 'ky'
      ? [
          ['Ийкемдүү шарттар', 'ар кандай милдеттер үчүн'],
          ['Глобалдык', 'рынокторго жетүү'],
          ['Кесипкөй', 'колдоо'],
        ]
      : [
          ['Flexible terms', 'for different objectives'],
          ['Access to global', 'markets'],
          ['Professional', 'support'],
        ]

  const footLabel = language === 'ru' ? 'Подробнее' : language === 'ky' ? 'Кененирээк' : 'Details'

  return (
    <section className="tiers-v2" id="tiers">
      <div className="tiers-v2-head">
        <div className="tiers-v2-copy">
          <p className="tiers-v2-kicker">{kicker}</p>
          <h2>{tiers.title}</h2>
          <p>{tiers.subtitle}</p>
        </div>

        <div className="tiers-v2-principles" aria-label={kicker}>
          {principles.map(([lineOne, lineTwo], index) => {
            const Icon = index === 0 ? BarChart3 : index === 1 ? Globe2 : UsersRound
            return (
              <div className="tiers-v2-principle" key={`${lineOne}-${lineTwo}`}>
                <span className="tiers-v2-principle-icon"><Icon strokeWidth={1.7} /></span>
                <span>{lineOne}<br />{lineTwo}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="tiers-v2-grid">
        {tiers.rows.map((tier) => (
          <article className="tiers-v2-card" data-tier={tier.name} key={tier.name} tabIndex={0}>
            <span className="tiers-v2-strip" aria-hidden="true" />
            <h3>{tier.name}</h3>
            <p>{tier.perk}</p>
            <div className="tiers-v2-card-foot">
              <span>{footLabel}</span>
              <span aria-hidden="true"><ArrowRight size={15} /></span>
            </div>
          </article>
        ))}
      </div>

      <div className="tiers-v2-bottom">
        <span className="tiers-v2-bottom-icon"><GraduationCap strokeWidth={1.7} /></span>
        <p>{tiers.note}</p>
      </div>
    </section>
  )
}
