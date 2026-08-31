import { ArrowRight, Clock3, Crosshair, PieChart, ShieldCheck } from 'lucide-react'
import heroMark from '../assets/trigonum-hero.svg'
import worldMap from '../assets/world-map.svg'

const advantages = [
  { icon: ShieldCheck, title: 'НАДЁЖНОСТЬ', text: 'Банковский уровень безопасности и защита средств' },
  { icon: PieChart, title: 'ДИВЕРСИФИКАЦИЯ', text: 'Стратегии на разных рынках и циклах' },
  { icon: Crosshair, title: 'РЕЗУЛЬТАТ', text: 'Целевые доходности при контролируемом риске' },
  { icon: Clock3, title: 'ЛИКВИДНОСТЬ', text: 'Гибкий доступ к вашему капиталу' },
]

export function HeroSection() {
  return (
    <section className="hero" id="top">
      <img className="world-map" src={worldMap} alt="" aria-hidden="true" />
      <div className="hero-copy">
        <p className="eyebrow">ИНТЕЛЛЕКТ. СТРАТЕГИИ. <span>РЕЗУЛЬТАТ.</span></p>
        <h1>КАПИТАЛ.<br />ИНТЕЛЛЕКТ.<br /><span>ВОЗМОЖНОСТИ.</span></h1>
        <div className="title-accent" />
        <p className="hero-description">Trigonum Broker — инвестиционные решения для роста и защиты вашего капитала.</p>
        <div className="hero-buttons">
          <a className="button button-primary" href="#open-account">ОТКРЫТЬ СЧЁТ <ArrowRight size={19} /></a>
          <a className="button button-secondary" href="#products">УЗНАТЬ БОЛЬШЕ <ArrowRight size={19} /></a>
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
