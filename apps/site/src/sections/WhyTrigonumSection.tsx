import { BarChart3, LayoutDashboard, ShieldCheck, Zap } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import whyIncome from '../shared/ui/landing-v2/why-income.webp'
import whyRisk from '../shared/ui/landing-v2/why-risk.webp'
import whyCabinet from '../shared/ui/landing-v2/why-cabinet.webp'
import whyStart from '../shared/ui/landing-v2/why-start.webp'

const COPY = {
  ru: {
    eyebrow: 'ПРЕИМУЩЕСТВА',
    title: 'Почему Trigonum',
    subtitle: 'Мы создаём удобный и надёжный способ инвестировать в криптовалюту, с фокусом на прозрачность, контроль и предсказуемый результат.',
    cards: [
      ['Понятный доход', 'Прозрачная логика начислений и результата. Вы всегда видите, как работает ваш капитал.'],
      ['Контроль риска', 'Продукт с заранее понятными параметрами риска и ликвидности. Сбалансированный подход к доходности.'],
      ['Личный кабинет', 'Результат, операции и документы в одном интерфейсе. Полный контроль ваших инвестиций.'],
      ['Быстрый старт', 'Простое открытие счёта и сопровождение на всех этапах. Команда поддержки всегда рядом.'],
    ],
  },
  en: {
    eyebrow: 'ADVANTAGES',
    title: 'Why Trigonum',
    subtitle: 'Crypto investing without having to find trades, monitor the market and reconcile results on your own.',
    cards: [
      ['Clear results', 'Track capital, accruals and outcomes in one place.'],
      ['Risk control', 'Product terms, horizon and liquidity are clear before investing.'],
      ['Personal account', 'Balance, performance, operations and documents in one interface.'],
      ['Fast start', 'Account opening is online, with support at every step.'],
    ],
  },
  ky: {
    eyebrow: 'АРТЫКЧЫЛЫКТАР',
    title: 'Эмне үчүн Trigonum',
    subtitle: 'Крипторынокто өз алдынча бүтүм издеп, рынокту көзөмөлдөп жана жыйынтыкты эсептебей инвестициялоо.',
    cards: [
      ['Түшүнүктүү жыйынтык', 'Капиталдын динамикасын, эсептөөлөрдү жана жыйынтыкты бир жерден көрөсүз.'],
      ['Тобокелди көзөмөлдөө', 'Продукттун шарттары, мөөнөтү жана ликвиддүүлүгү алдын ала түшүнүктүү.'],
      ['Жеке кабинет', 'Баланс, жыйынтык, операциялар жана документтер бир интерфейсте.'],
      ['Тез баштоо', 'Эсеп онлайн ачылат, команда ар бир этапта коштойт.'],
    ],
  },
} as const

const ICONS = [BarChart3, ShieldCheck, LayoutDashboard, Zap]
const ART_IMAGES = [whyIncome, whyRisk, whyCabinet, whyStart]

export function WhyTrigonumSection() {
  const { language } = useI18n()
  const copy = COPY[language] ?? COPY.ru

  return (
    <section className="v2-why" aria-labelledby="why-trigonum-title">
      <header className="v2-section-head">
        <span>{copy.eyebrow}</span>
        <h2 id="why-trigonum-title">{copy.title}</h2>
        <p>{copy.subtitle}</p>
      </header>

      <div className="v2-benefit-grid">
        {copy.cards.map(([title, text], index) => {
          const Icon = ICONS[index]
          return (
            <article className="v2-benefit-card" key={title}>
              <span className="v2-benefit-icon"><Icon size={25} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
              <div className="v2-benefit-art" aria-hidden="true">
                <img className="v2-benefit-image" src={ART_IMAGES[index]} alt="" loading="lazy" />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
