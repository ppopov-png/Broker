import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'

const tierTone: Record<string, string> = {
  Member: 'linear-gradient(135deg,#f3f4f6,#babfca)',
  Silver: 'linear-gradient(135deg,#f8f9fb,#aeb5c2)',
  Gold: 'linear-gradient(135deg,#fff5cf,#c89734)',
  Platinum: 'linear-gradient(135deg,#fdfeff,#9db2c8)',
  Diamond: 'linear-gradient(135deg,#f8fdff,#9fd8f5,#c7b9f6)',
  Californium: 'linear-gradient(135deg,#1c2721,#060908)',
}

export function TiersSection() {
  const { language } = useI18n()
  const { tiers } = landingContent(language)

  return (
    <section className="tiers-section" id="tiers">
      <header className="section-head"><h2>{tiers.title}</h2><p>{tiers.subtitle}</p></header>
      <ol className="tier-ladder">
        {tiers.rows.map((tier, index) => (
          <li key={tier.name} style={{ ['--tier-step' as string]: `${index}` }}>
            <span className="tier-chip" style={{ background: tierTone[tier.name] }} aria-hidden="true" />
            <h3>{tier.name}</h3><p>{tier.perk}</p>
          </li>
        ))}
      </ol>
      <p className="section-note">{tiers.note}</p>
    </section>
  )
}
