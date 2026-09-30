import { ArrowRight, BarChart3, LockKeyhole, ShieldCheck, TrendingUp } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import { onboardingUrl } from '../lib/appLinks'

const COPY = {
  ru: {
    titleTop: 'СТАБИЛЬНЫЙ СПОСОБ',
    titleBottom: 'ЗАРАБАТЫВАТЬ\nНА КРИПТОРЫНКЕ',
    description:
      'Trigonum помогает вашему капиталу работать на крипторынке — без необходимости торговать самостоятельно. Понятные условия, профессиональное управление и полный контроль в личном кабинете.',
    open: 'Открыть счёт',
    results: 'Смотреть результаты',
    trust: ['Регулирование и контроль', 'Прозрачная аналитика', 'Без скрытых условий'],
    floatTop: 'ВАШ КАПИТАЛ',
    floatMain: 'РАБОТАЕТ 24/7',
    floatBottom: 'РЕЗУЛЬТАТ ВИДЕН В КАБИНЕТЕ',
  },
  en: {
    titleTop: 'A CLEARER WAY',
    titleBottom: 'TO EARN\nIN CRYPTO',
    description:
      'Trigonum helps your capital work in crypto without requiring you to trade on your own. Clear terms, professional management and full visibility in your account.',
    open: 'Open account',
    results: 'View results',
    trust: ['Regulation and control', 'Transparent analytics', 'No hidden terms'],
    floatTop: 'YOUR CAPITAL',
    floatMain: 'WORKS 24/7',
    floatBottom: 'RESULTS STAY VISIBLE',
  },
  ky: {
    titleTop: 'КРИПТОДО',
    titleBottom: 'ТУРУКТУУ\nКИРЕШЕ',
    description:
      'Trigonum капиталыңызды крипторынокто иштетүүгө жардам берет — өз алдынча соода кылуунун зарылдыгы жок. Түшүнүктүү шарттар, кесипкөй башкаруу жана жеке кабинетте толук көзөмөл.',
    open: 'Эсеп ачуу',
    results: 'Жыйынтыктарды көрүү',
    trust: ['Жөнгө салуу жана көзөмөл', 'Ачык аналитика', 'Жашыруун шарттар жок'],
    floatTop: 'СИЗДИН КАПИТАЛ',
    floatMain: '24/7 ИШТЕЙТ',
    floatBottom: 'ЖЫЙЫНТЫК КАБИНЕТТЕ',
  },
} as const

export function HeroSection() {
  const { language } = useI18n()
  const copy = COPY[language] ?? COPY.ru

  return (
    <section className="v2-hero" id="top">
      <div className="v2-hero-shade" aria-hidden="true" />
      <div className="v2-hero-inner">
        <div className="v2-hero-copy">
          <h1>
            <span>{copy.titleTop}</span>
            <b>{copy.titleBottom.split('\n').map((line) => <i key={line}>{line}</i>)}</b>
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
            <span><ShieldCheck size={21} />{copy.trust[0]}</span>
            <span><TrendingUp size={21} />{copy.trust[1]}</span>
            <span><LockKeyhole size={21} />{copy.trust[2]}</span>
          </div>
        </div>

        <aside className="v2-hero-float" aria-label="Статус капитала">
          <small>{copy.floatTop}</small>
          <strong>{copy.floatMain}</strong>
          <div className="v2-hero-spark" aria-hidden="true">
            <i /><i /><i /><i /><i /><i />
          </div>
          <b>{copy.floatBottom}</b>
        </aside>
      </div>
    </section>
  )
}
