import { onboardingUrl } from '../lib/appLinks'

export function HeroSection() {
  return (
    <section className="hero figma-hero" id="top">
      <div className="hero-orbit hero-orbit-a" aria-hidden="true" />
      <div className="hero-orbit hero-orbit-b" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-copy">
        <h1>
          <span>ВЕРНЫЙ КУРС</span>
          <b>ДЛЯ ВАШЕГО</b>
          <b>КАПИТАЛА</b>
        </h1>
        <p className="hero-description">
          Платформа для размещения и управления инвестиционным капиталом в соответствии
          с условиями выбранных продуктов.
        </p>
        <div className="hero-buttons">
          <a className="button button-primary" href={onboardingUrl()}>Открыть счёт</a>
          <a className="button button-secondary" href="#products">Изучить продукты</a>
        </div>
      </div>
    </section>
  )
}
