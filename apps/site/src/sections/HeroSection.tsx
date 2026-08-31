import { ArrowRight, Clock3, Crosshair, PieChart, ShieldCheck } from 'lucide-react'
import heroMark from '../assets/trigonum-hero.svg'
import worldMap from '../assets/world-map.svg'
import { onboardingUrl } from '../lib/appLinks'
import { useI18n } from '../i18n/I18nProvider'

export function HeroSection() {
  const { t } = useI18n()
  const advantages = [
    { icon: ShieldCheck, title: t('adv.reliability'), text: t('adv.reliabilityText') },
    { icon: PieChart, title: t('adv.diversification'), text: t('adv.diversificationText') },
    { icon: Crosshair, title: t('adv.result'), text: t('adv.resultText') },
    { icon: Clock3, title: t('adv.liquidity'), text: t('adv.liquidityText') },
  ]

  return (
    <section className="hero" id="top">
      <img className="world-map" src={worldMap} alt="" aria-hidden="true" />
      <div className="hero-copy">
        <p className="eyebrow">{t('hero.eyebrow')} <span>{t('hero.eyebrowResult')}</span></p>
        <h1>{t('hero.capital')}<br />{t('hero.intellect')}<br /><span>{t('hero.opportunities')}</span></h1>
        <div className="title-accent" />
        <p className="hero-description">{t('hero.description')}</p>
        <div className="hero-buttons">
          <a className="button button-primary" href={onboardingUrl()}>{t('nav.open')} <ArrowRight size={19} /></a>
          <a className="button button-secondary" href="#products">{t('hero.more')} <ArrowRight size={19} /></a>
        </div>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <img src={heroMark} alt="" />
      </div>

      <aside className="hero-advantages">
        {advantages.map(({ icon: Icon, title, text }) => (
          <div className="advantage" key={title}>
            <Icon className="advantage-icon" strokeWidth={1.6} />
            <div><h3>{title}</h3><p>{text}</p></div>
          </div>
        ))}
      </aside>
    </section>
  )
}
