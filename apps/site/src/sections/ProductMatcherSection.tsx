import { ArrowRight, Clock3, Info, Sparkles, WalletCards } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'
import { onboardingUrl } from '../lib/appLinks'
import type { ProductId } from './ProductModal'

const COPY = {
  ru: {
    eyebrow: 'ПОДБОР ПРОДУКТА',
    title: 'Подберите продукт под вашу цель',
    subtitle: 'Ответьте на несколько вопросов — мы покажем, какой формат ближе к выбранным параметрам.',
    disclaimer: 'Это ознакомительный инструмент. Он не является индивидуальной инвестиционной рекомендацией.',
    horizon: 'Какой у вас горизонт инвестирования?',
    horizonOptions: [['short', '1–3 месяца'], ['mid', '3–12 месяцев'], ['long', 'Более 1 года']],
    liquidity: 'Нужна ли высокая ликвидность?',
    liquidityOptions: [['fast', 'Да, важен быстрый вывод'], ['medium', 'Умеренно важна'], ['low', 'Не критично']],
    priority: 'Что для вас важнее?',
    priorityOptions: [['stable', 'Стабильность'], ['balance', 'Баланс'], ['return', 'Максимальный потенциал']],
    result: 'Вам ближе:',
    open: 'Открыть счёт',
  },
  en: {
    eyebrow: 'PRODUCT MATCHER',
    title: 'Find a format that fits your goal',
    subtitle: 'Answer a few questions and we will show which format is closest to your selected parameters.',
    disclaimer: 'This is an educational tool and not an individual investment recommendation.',
    horizon: 'What is your investment horizon?',
    horizonOptions: [['short', '1–3 months'], ['mid', '3–12 months'], ['long', 'More than 1 year']],
    liquidity: 'How important is liquidity?',
    liquidityOptions: [['fast', 'Fast withdrawal matters'], ['medium', 'Moderately important'], ['low', 'Not critical']],
    priority: 'What matters most?',
    priorityOptions: [['stable', 'Stability'], ['balance', 'Balance'], ['return', 'Maximum potential']],
    result: 'Closer match:',
    open: 'Open account',
  },
  ky: {
    eyebrow: 'ПРОДУКТТУ ТАНДОО',
    title: 'Максатыңызга ылайыктуу форматты табыңыз',
    subtitle: 'Бир нече суроого жооп бериңиз — тандалган параметрлерге жакын форматты көрсөтөбүз.',
    disclaimer: 'Бул таанышуу куралы жана жеке инвестициялык сунуш эмес.',
    horizon: 'Инвестициялык мөөнөтүңүз кандай?',
    horizonOptions: [['short', '1–3 ай'], ['mid', '3–12 ай'], ['long', '1 жылдан ашык']],
    liquidity: 'Ликвиддүүлүк канчалык маанилүү?',
    liquidityOptions: [['fast', 'Тез чыгаруу маанилүү'], ['medium', 'Орточо маанилүү'], ['low', 'Маанилүү эмес']],
    priority: 'Сиз үчүн эмне маанилүү?',
    priorityOptions: [['stable', 'Туруктуулук'], ['balance', 'Баланс'], ['return', 'Максималдуу потенциал']],
    result: 'Сизге жакыныраак:',
    open: 'Эсеп ачуу',
  },
} as const

type Horizon = 'short' | 'mid' | 'long'
type Liquidity = 'fast' | 'medium' | 'low'
type Priority = 'stable' | 'balance' | 'return'

export function ProductMatcherSection() {
  const { language } = useI18n()
  const copy = COPY[language] ?? COPY.ru
  const { products } = landingContent(language)
  const [horizon, setHorizon] = useState<Horizon>('short')
  const [liquidity, setLiquidity] = useState<Liquidity>('medium')
  const [priority, setPriority] = useState<Priority>('stable')

  const recommendation = useMemo<ProductId>(() => {
    if (liquidity === 'fast' || priority === 'stable') return 'earn'
    if (priority === 'return') return 'events'
    if (horizon === 'long' || horizon === 'mid') return 'strategies'
    return 'earn'
  }, [horizon, liquidity, priority])

  const product = products.rows.find((row) => row.id === recommendation) ?? products.rows[0]

  return (
    <section className="v2-matcher" aria-labelledby="product-matcher-title">
      <div className="v2-matcher-head">
        <div>
          <span>{copy.eyebrow}</span>
          <h2 id="product-matcher-title">{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
        <p className="v2-matcher-note"><Info size={17} />{copy.disclaimer}</p>
      </div>

      <div className="v2-matcher-layout">
        <div className="v2-matcher-questions">
          <MatcherQuestion number="1" title={copy.horizon} options={copy.horizonOptions} value={horizon} onChange={(value) => setHorizon(value as Horizon)} />
          <MatcherQuestion number="2" title={copy.liquidity} options={copy.liquidityOptions} value={liquidity} onChange={(value) => setLiquidity(value as Liquidity)} />
          <MatcherQuestion number="3" title={copy.priority} options={copy.priorityOptions} value={priority} onChange={(value) => setPriority(value as Priority)} />
        </div>

        <aside className={`v2-match-result v2-match-${recommendation}`}>
          <span className="v2-match-kicker"><Sparkles size={18} />{copy.result}</span>
          <h3>{product.name}</h3>
          <p>{product.tagline}</p>
          <dl>
            <div><dt>{product.rate}</dt><dd>{product.rateNote}</dd></div>
            <div><dt><Clock3 size={17} />{product.term}</dt><dd>{products.columns.term}</dd></div>
            <div><dt><WalletCards size={17} />{product.liquidity}</dt><dd>{products.columns.liquidity}</dd></div>
          </dl>
          <a href={onboardingUrl()}>{copy.open}<ArrowRight size={17} /></a>
        </aside>
      </div>
    </section>
  )
}

function MatcherQuestion({
  number,
  title,
  options,
  value,
  onChange,
}: {
  number: string
  title: string
  options: readonly (readonly [string, string])[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="v2-matcher-question">
      <h3><span>{number}.</span>{title}</h3>
      <div role="group" aria-label={title}>
        {options.map(([id, label]) => (
          <button key={id} type="button" className={value === id ? 'active' : undefined} aria-pressed={value === id} onClick={() => onChange(id)}>
            <i aria-hidden="true" />{label}
          </button>
        ))}
      </div>
    </div>
  )
}
