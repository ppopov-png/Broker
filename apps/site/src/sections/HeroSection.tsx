import { ArrowRight, BarChart3, LockKeyhole, ShieldCheck, TrendingUp } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import { onboardingUrl } from '../lib/appLinks'

const COPY = {
  ru: {
    titleWhite: 'Стабильный способ',
    titleBlue: ['зарабатывать', 'на крипторынке'],
    description:
      'Trigonum помогает вашему капиталу работать в криптовалюте — без необходимости торговать самостоятельно. Профессиональные стратегии, прозрачные условия и полный контроль в вашем кабинете.',
    open: 'Открыть счёт',
    results: 'Смотреть результаты',
    trust: ['Регулирование и контроль', 'Прозрачная аналитика', 'Без скрытых условий'],
    floatTop: 'ВАШ КАПИТАЛ',
    floatMain: 'РАБОТАЕТ 24/7',
    floatRate: '+12.8%',
    floatBottom: 'СРЕДНИЙ РЕЗУЛЬТАТ КЛИЕНТОВ В 2024',
  },
  en: {
    titleWhite: 'A stable way',
    titleBlue: ['to earn', 'in crypto'],
    description:
      'Trigonum helps your capital work in crypto without the need to trade on your own. Professional strategies, transparent terms and full visibility in your account.',
    open: 'Open account',
    results: 'View results',
    trust: ['Regulation and control', 'Transparent analytics', 'No hidden terms'],
    floatTop: 'YOUR CAPITAL',
    floatMain: 'WORKS 24/7',
    floatRate: '+12.8%',
    floatBottom: 'AVERAGE CLIENT RESULT IN 2024',
  },
  ky: {
    titleWhite: 'Криптодо туруктуу',
    titleBlue: ['киреше табуунун', 'жолу'],
    description:
      'Trigonum капиталыңызды крипторынокто иштетүүгө жардам берет — өз алдынча соода кылуунун зарылдыгы жок. Кесипкөй стратегиялар, ачык шарттар жана жеке кабинетте толук көзөмөл.',
    open: 'Эсеп ачуу',
    results: 'Жыйынтыктарды көрүү',
    trust: ['Жөнгө салуу жана көзөмөл', 'Ачык аналитика', 'Жашыруун шарттар жок'],
    floatTop: 'СИЗДИН КАПИТАЛ',
    floatMain: '24/7 ИШТЕЙТ',
    floatRate: '+12.8%',
    floatBottom: '2024-ЖЫЛДАГЫ ОРТОЧО ЖЫЙЫНТЫК',
  },
} as const

export function HeroSection() {
  const { language } = useI18n()
  const copy = COPY[language]

  return (
    <section className="v2-hero" id="top">
      <div className="v2-hero-shade" aria-hidden="true" />
      <div className="v2-hero-inner">
        <div className="v2-hero-copy">
          <h1>
            <span>{copy.titleWhite}</span>
            <b>{copy.titleBlue.map((line) => <i key={line}>{line}</i>)}</b>
          </h1>
          <p>{copy.description}</p>

          <div className="v2-hero-actions">
            <a className="v2-button v2-button-primary" href={onboardingUrl()}>
              {copy.open} <ArrowRight size={18} />
            </a>
            <a className="v2-button v2-button-secondary" href="#results">
              <BarChart3 size={18} /> {copy.results}
            </a>
          </div>

          <div className="v2-hero-trust" aria-label="Ключевые преимущества">
            <span><ShieldCheck size={20} />{copy.trust[0]}</span>
            <span><TrendingUp size={20} />{copy.trust[1]}</span>
            <span><LockKeyhole size={20} />{copy.trust[2]}</span>
          </div>
        </div>

        <aside className="v2-hero-float" aria-label="Статус капитала">
          <small>{copy.floatTop}</small>
          <strong>{copy.floatMain}</strong>
          <svg className="v2-hero-line" viewBox="0 0 108 55" role="img" aria-label="График результата">
            <polyline points="4,44 20,31 35,37 53,23 69,31 87,18 104,8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="104" cy="8" r="4" fill="currentColor" />
          </svg>
          <b>{copy.floatRate}</b>
          <em>{copy.floatBottom}</em>
        </aside>
      </div>
    </section>
  )
}
