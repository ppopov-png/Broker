import { BarChart3, LayoutDashboard, ShieldCheck, Zap } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'

const COPY = {
  ru: {
    eyebrow: 'ПРЕИМУЩЕСТВА',
    title: 'Почему Trigonum',
    subtitle: 'Инвестирование в крипторынок без необходимости самостоятельно искать сделки, следить за рынком и вести учёт результата.',
    cards: [
      ['Понятный результат', 'Вы видите динамику капитала, начисления и итоговый результат в одном месте.'],
      ['Контроль риска', 'Условия продукта, горизонт и ликвидность понятны до размещения капитала.'],
      ['Личный кабинет', 'Баланс, результат, операции и документы собраны в одном интерфейсе.'],
      ['Быстрый старт', 'Открытие счёта проходит онлайн, а команда сопровождает на каждом этапе.'],
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
  kg: {
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
const ART = ['income', 'risk', 'cabinet', 'start'] as const

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
            <article className="v2-benefit-card" data-art={ART[index]} key={title}>
              <span className="v2-benefit-icon"><Icon size={25} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
              <div className="v2-benefit-art" aria-hidden="true">
                {ART[index] === 'income' && <div className="v2-income-bars"><i /><i /><i /><i /><i /></div>}
                {ART[index] === 'risk' && <div className="v2-risk-orb"><ShieldCheck size={54} /></div>}
                {ART[index] === 'cabinet' && (
                  <div className="v2-mini-cabinet"><i /><i /><span /><b /><em /></div>
                )}
                {ART[index] === 'start' && <div className="v2-start-portal"><i /><span /></div>}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
