import { ArrowRight, Clock3, Info, Sparkles, WalletCards } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'
import { EARN_STATS, STRATEGIES } from '../content/products'
import { onboardingUrl } from '../lib/appLinks'

const COPY = {
  ru: {
    eyebrow: 'ПОДБОР ПРОГРАММЫ',
    title: 'Подберите программу под вашу цель',
    subtitle: 'Ответьте на несколько вопросов, и мы покажем наиболее близкий формат инвестирования внутри Trigonum. Events в подбор не входят — это дополнительный продукт для отдельных инвестиционных идей.',
    disclaimer: 'Это ознакомительный инструмент. Не является индивидуальной инвестиционной рекомендацией.',
    horizon: 'Какой у вас горизонт инвестирования?',
    horizonOptions: [['short', '1–3 месяца'], ['mid', '3–12 месяцев'], ['long', 'Более 1 года']],
    liquidity: 'Нужна ли высокая ликвидность?',
    liquidityOptions: [['fast', 'Да, важен быстрый вывод'], ['medium', 'Умеренно важна'], ['low', 'Не критично']],
    priority: 'Что для вас важнее?',
    priorityOptions: [['stable', 'Стабильность'], ['balance', 'Баланс'], ['return', 'Максимальный потенциал']],
    result: 'Вам ближе:',
    open: 'Открыть счёт',
    annual: 'годовых',
    targetAnnual: 'целевая доходность',
    term: 'Срок',
    liquidityLabel: 'Ликвидность',
  },
  en: {
    eyebrow: 'PROGRAM MATCHER',
    title: 'Find a program that fits your goal',
    subtitle: 'Answer a few questions and we will show the closest Trigonum investment format. Events are excluded because they are an additional product for individual investment ideas.',
    disclaimer: 'This is an educational tool and not an individual investment recommendation.',
    horizon: 'What is your investment horizon?',
    horizonOptions: [['short', '1–3 months'], ['mid', '3–12 months'], ['long', 'More than 1 year']],
    liquidity: 'How important is liquidity?',
    liquidityOptions: [['fast', 'Fast withdrawal matters'], ['medium', 'Moderately important'], ['low', 'Not critical']],
    priority: 'What matters most?',
    priorityOptions: [['stable', 'Stability'], ['balance', 'Balance'], ['return', 'Maximum potential']],
    result: 'Closer match:',
    open: 'Open account',
    annual: 'annual',
    targetAnnual: 'target annual return',
    term: 'Term',
    liquidityLabel: 'Liquidity',
  },
  ky: {
    eyebrow: 'ПРОГРАММАНЫ ТАНДОО',
    title: 'Максатыңызга ылайыктуу программаны табыңыз',
    subtitle: 'Бир нече суроого жооп бериңиз — Trigonum ичиндеги эң жакын инвестициялык форматты көрсөтөбүз. Events өзүнчө инвестициялык идеялар үчүн кошумча продукт болгондуктан бул тандоого кирбейт.',
    disclaimer: 'Бул таанышуу куралы жана жеке инвестициялык сунуш эмес.',
    horizon: 'Инвестициялык мөөнөтүңүз кандай?',
    horizonOptions: [['short', '1–3 ай'], ['mid', '3–12 ай'], ['long', '1 жылдан ашык']],
    liquidity: 'Ликвиддүүлүк канчалык маанилүү?',
    liquidityOptions: [['fast', 'Тез чыгаруу маанилүү'], ['medium', 'Орточо маанилүү'], ['low', 'Маанилүү эмес']],
    priority: 'Сиз үчүн эмне маанилүү?',
    priorityOptions: [['stable', 'Туруктуулук'], ['balance', 'Баланс'], ['return', 'Максималдуу потенциал']],
    result: 'Сизге жакыныраак:',
    open: 'Эсеп ачуу',
    annual: 'жылдык',
    targetAnnual: 'максаттуу жылдык киреше',
    term: 'Мөөнөт',
    liquidityLabel: 'Ликвиддүүлүк',
  },
} as const

type Horizon = 'short' | 'mid' | 'long'
type Liquidity = 'fast' | 'medium' | 'low'
type Priority = 'stable' | 'balance' | 'return'
type MatchPlanId = 'earn' | 'stable-income' | 'balanced-growth' | 'alpha-momentum'

const PLAN_COPY: Record<MatchPlanId, Record<'ru' | 'en' | 'ky', { description: string; term: string; liquidity: string }>> = {
  earn: {
    ru: {
      description: 'Базовый формат для размещения капитала с фиксированной ставкой и регулярным окном вывода.',
      term: 'Без ограничения',
      liquidity: 'Еженедельно',
    },
    en: {
      description: 'Core capital placement format with a fixed rate and a regular withdrawal window.',
      term: 'No fixed term',
      liquidity: 'Weekly',
    },
    ky: {
      description: 'Белгиленген ставка жана үзгүлтүксүз чыгаруу терезеси бар капитал жайгаштыруунун негизги форматы.',
      term: 'Чектелбейт',
      liquidity: 'Апта сайын',
    },
  },
  'stable-income': {
    ru: {
      description: 'Консервативная стратегия для инвестора, которому важнее стабильность и ограничение просадки.',
      term: '3–12 месяцев',
      liquidity: 'По условиям стратегии',
    },
    en: {
      description: 'A conservative strategy for investors who prioritise stability and drawdown control.',
      term: '3–12 months',
      liquidity: 'Per strategy terms',
    },
    ky: {
      description: 'Туруктуулукту жана төмөндөөнү чектөөнү биринчи орунга койгон инвестор үчүн консервативдүү стратегия.',
      term: '3–12 ай',
      liquidity: 'Стратегия шарттары боюнча',
    },
  },
  'balanced-growth': {
    ru: {
      description: 'Умеренная стратегия с балансом между потенциальной доходностью и уровнем принимаемого риска.',
      term: '3–12 месяцев',
      liquidity: 'По условиям стратегии',
    },
    en: {
      description: 'A moderate strategy balancing potential return and the level of risk taken.',
      term: '3–12 months',
      liquidity: 'Per strategy terms',
    },
    ky: {
      description: 'Потенциалдуу киреше менен кабыл алынган тобокелдиктин ортосундагы тең салмактуу стратегия.',
      term: '3–12 ай',
      liquidity: 'Стратегия шарттары боюнча',
    },
  },
  'alpha-momentum': {
    ru: {
      description: 'Агрессивная стратегия для инвестора, который готов принять более высокий риск ради большего потенциала.',
      term: '3–12 месяцев',
      liquidity: 'По условиям стратегии',
    },
    en: {
      description: 'An aggressive strategy for investors willing to accept higher risk for greater upside potential.',
      term: '3–12 months',
      liquidity: 'Per strategy terms',
    },
    ky: {
      description: 'Жогорку потенциал үчүн көбүрөөк тобокелдик кабыл алууга даяр инвестор үчүн агрессивдүү стратегия.',
      term: '3–12 ай',
      liquidity: 'Стратегия шарттары боюнча',
    },
  },
}

export function ProductMatcherSection() {
  const { language } = useI18n()
  const copy = COPY[language] ?? COPY.ru
  const { products } = landingContent(language)
  const [horizon, setHorizon] = useState<Horizon>('short')
  const [liquidity, setLiquidity] = useState<Liquidity>('medium')
  const [priority, setPriority] = useState<Priority>('stable')

  const recommendation = useMemo<MatchPlanId>(() => {
    // Events intentionally do not participate in the matcher: they are an
    // additional opportunity product, not the core investment allocation.
    if (liquidity === 'fast' || horizon === 'short') return 'earn'
    if (priority === 'stable') return 'stable-income'
    if (priority === 'balance') return 'balanced-growth'
    return 'alpha-momentum'
  }, [horizon, liquidity, priority])

  const strategy = recommendation === 'earn'
    ? null
    : STRATEGIES.find((item) => item.id === recommendation) ?? STRATEGIES[0]

  const planName = recommendation === 'earn' ? 'EARN' : strategy?.name ?? 'STRATEGY'
  const planCopy = PLAN_COPY[recommendation][language]
  const rate = recommendation === 'earn' ? `${EARN_STATS.rate}%` : strategy?.target ?? '—'
  const rateCaption = recommendation === 'earn' ? copy.annual : copy.targetAnnual
  const resultClass = recommendation === 'earn' ? 'earn' : 'strategies'

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

        <aside className={`v2-match-result v2-match-${resultClass}`}>
          <span className="v2-match-kicker"><Sparkles size={18} />{copy.result}</span>
          <h3>{planName}</h3>
          <p>{planCopy.description}</p>
          <dl>
            <div><dt>{rate}</dt><dd>{rateCaption}</dd></div>
            <div><dt><Clock3 size={17} />{planCopy.term}</dt><dd>{copy.term}</dd></div>
            <div><dt><WalletCards size={17} />{planCopy.liquidity}</dt><dd>{copy.liquidityLabel}</dd></div>
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
