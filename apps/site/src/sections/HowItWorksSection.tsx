import { Bot, BrainCircuit, Coins, UsersRound } from 'lucide-react'
import { useI18n, type Language } from '../i18n/I18nProvider'
import './HowItWorksSection.css'

type PillarId = 'team' | 'algo' | 'tais' | 'liquidity'

type Pillar = {
  id: PillarId
  title: string
  kicker: string
  text: string
  tags: string[]
  badges: string[]
}

type Copy = {
  eyebrow: string
  titleStart: string
  titleAccent: string
  subtitle: string
  manifesto: string[]
  pillars: Pillar[]
  formula: {
    team: [string, string]
    algo: [string, string]
    tais: [string, string]
    liquidity: [string, string]
    result: [string, string]
  }
}

const copy: Record<Language, Copy> = {
  ru: {
    eyebrow: 'КАК ЭТО РАБОТАЕТ',
    titleStart: 'ОТКУДА БЕРЁТСЯ ',
    titleAccent: 'РЕЗУЛЬТАТ',
    subtitle:
      'Четыре взаимодополняющих элемента работают как единая система, помогая Trigonum находить и использовать рыночные возможности.',
    manifesto: ['ИНТЕЛЛЕКТ', 'СТРАТЕГИИ', 'РЕЗУЛЬТАТ'],
    pillars: [
      {
        id: 'team',
        title: 'Командная торговля',
        kicker: 'ОПЫТ. ЭКСПЕРТИЗА. КОНТРОЛЬ.',
        text:
          'Профессиональные трейдеры и аналитики анализируют мировые рынки, формируют стратегии и принимают решения в рамках инвестиционного комитета. Каждая идея проходит многоуровневую проверку, а риски тщательно контролируются.',
        tags: ['Профессиональные трейдеры', 'Инвестиционный комитет', 'Контроль рисков'],
        badges: ['Анализ', 'Стратегия', 'Риск-контроль'],
      },
      {
        id: 'algo',
        title: 'Алгоритмическая торговля',
        kicker: 'СКОРОСТЬ. СИСТЕМНОСТЬ. 24/7.',
        text:
          'Собственные алгоритмы мгновенно находят и используют краткосрочные неэффективности рынка. Систематическое исполнение, круглосуточный мониторинг и арбитражные стратегии позволяют извлекать результат даже в условиях высокой волатильности.',
        tags: ['Системные стратегии', 'Краткосрочные неэффективности', 'Автоматическое исполнение'],
        badges: ['24/7 мониторинг', 'Арбитраж', 'Высокая скорость'],
      },
      {
        id: 'tais',
        title: 'TAIS',
        kicker: 'ИСКУССТВЕННЫЙ ИНТЕЛЛЕКТ. РЕАЛЬНЫЕ ВОЗМОЖНОСТИ.',
        text:
          'Собственная AI-система Trigonum анализирует огромные массивы рыночных данных, новостные события и поведенческие факторы, выявляя неочевидные зависимости и неэффективности. TAIS усиливает решения команды и алгоритмов, находя больше возможностей раньше других.',
        tags: ['AI-аналитика', 'Большие данные', 'Уникальные инсайты'],
        badges: ['Анализ событий', 'Выявление неэффективностей', 'Прогнозы и сигналы'],
      },
      {
        id: 'liquidity',
        title: 'Ваша ликвидность',
        kicker: 'БОЛЬШЕ ВОЗМОЖНОСТЕЙ ВМЕСТЕ.',
        text:
          'Инвестиции наших клиентов — это топливо, которое позволяет нам масштабировать стратегии, использовать широкий набор рыночных инструментов и зарабатывать вместе. Чем больше ликвидности, тем больше возможностей для Trigonum и для наших инвесторов.',
        tags: ['Глобальные рынки', 'Диверсификация инструментов', 'Рост вместе'],
        badges: ['Больше инструментов', 'Масштаб стратегий', 'Совместная доходность'],
      },
    ],
    formula: {
      team: ['КОМАНДА', 'Экспертиза и контроль'],
      algo: ['АЛГОРИТМЫ', 'Скорость и системность'],
      tais: ['TAIS', 'Анализ и инсайты'],
      liquidity: ['ЛИКВИДНОСТЬ', 'Больше возможностей'],
      result: ['СОВМЕСТНЫЙ РЕЗУЛЬТАТ', 'Рост капитала'],
    },
  },
  en: {
    eyebrow: 'HOW IT WORKS',
    titleStart: 'WHERE THE ',
    titleAccent: 'RESULT COMES FROM',
    subtitle: 'Four complementary elements work as one system, helping Trigonum find and use market opportunities.',
    manifesto: ['INTELLIGENCE', 'STRATEGIES', 'RESULT'],
    pillars: [
      {
        id: 'team',
        title: 'Team trading',
        kicker: 'EXPERIENCE. EXPERTISE. CONTROL.',
        text: 'Professional traders and analysts study global markets, build strategies and make decisions through the investment committee. Every idea goes through multi-level review and disciplined risk control.',
        tags: ['Professional traders', 'Investment committee', 'Risk control'],
        badges: ['Analysis', 'Strategy', 'Risk control'],
      },
      {
        id: 'algo',
        title: 'Algorithmic trading',
        kicker: 'SPEED. SYSTEM. 24/7.',
        text: 'Proprietary algorithms detect and use short-lived market inefficiencies in real time. Systematic execution, round-the-clock monitoring and arbitrage strategies help capture opportunities even in volatile markets.',
        tags: ['Systematic strategies', 'Short-term inefficiencies', 'Automated execution'],
        badges: ['24/7 monitoring', 'Arbitrage', 'High speed'],
      },
      {
        id: 'tais',
        title: 'TAIS',
        kicker: 'ARTIFICIAL INTELLIGENCE. REAL OPPORTUNITIES.',
        text: 'Trigonum’s proprietary AI system analyses large volumes of market data, news events and behavioural factors to uncover hidden relationships and inefficiencies. TAIS strengthens both team and algorithmic decisions by finding more opportunities earlier.',
        tags: ['AI analytics', 'Big data', 'Unique insights'],
        badges: ['Event analysis', 'Inefficiency detection', 'Forecasts and signals'],
      },
      {
        id: 'liquidity',
        title: 'Your liquidity',
        kicker: 'MORE OPPORTUNITIES TOGETHER.',
        text: 'Client capital is the fuel that lets us scale strategies, access a broader set of market instruments and earn together. More liquidity expands the opportunity set for both Trigonum and our investors.',
        tags: ['Global markets', 'Instrument diversification', 'Grow together'],
        badges: ['More instruments', 'Strategy scale', 'Shared return'],
      },
    ],
    formula: {
      team: ['TEAM', 'Expertise and control'],
      algo: ['ALGORITHMS', 'Speed and system'],
      tais: ['TAIS', 'Analysis and insight'],
      liquidity: ['LIQUIDITY', 'More opportunities'],
      result: ['SHARED RESULT', 'Capital growth'],
    },
  },
  ky: {
    eyebrow: 'КАНТИП ИШТЕЙТ',
    titleStart: 'НАТЫЙЖА ',
    titleAccent: 'КАЙДАН КЕЛЕТ',
    subtitle: 'Төрт өз ара толуктоочу элемент бир система катары иштеп, Trigonumга рыноктук мүмкүнчүлүктөрдү табууга жана пайдаланууга жардам берет.',
    manifesto: ['ИНТЕЛЛЕКТ', 'СТРАТЕГИЯЛАР', 'НАТЫЙЖА'],
    pillars: [
      {
        id: 'team',
        title: 'Командалык соода',
        kicker: 'ТАЖРЫЙБА. ЭКСПЕРТИЗА. КӨЗӨМӨЛ.',
        text: 'Кесипкөй трейдерлер жана аналитиктер дүйнөлүк рынокторду талдап, стратегияларды түзүп, инвестициялык комитеттин алкагында чечим кабыл алышат. Ар бир идея көп баскычтуу текшерүүдөн өтүп, тобокел катуу көзөмөлдөнөт.',
        tags: ['Кесипкөй трейдерлер', 'Инвестициялык комитет', 'Тобокел көзөмөлү'],
        badges: ['Талдоо', 'Стратегия', 'Тобокел көзөмөлү'],
      },
      {
        id: 'algo',
        title: 'Алгоритмдик соода',
        kicker: 'ЫЛДАМДЫК. СИСТЕМА. 24/7.',
        text: 'Өздүк алгоритмдер рыноктогу кыска мөөнөттүү натыйжасыздыктарды тез таап, пайдаланат. Системалуу аткаруу, күнү-түнү мониторинг жана арбитраждык стратегиялар жогорку өзгөрмөлүүлүктө да мүмкүнчүлүк табууга шарт түзөт.',
        tags: ['Системалуу стратегиялар', 'Кыска мөөнөттүү натыйжасыздыктар', 'Автоматтык аткаруу'],
        badges: ['24/7 мониторинг', 'Арбитраж', 'Жогорку ылдамдык'],
      },
      {
        id: 'tais',
        title: 'TAIS',
        kicker: 'ЖАСАЛМА ИНТЕЛЛЕКТ. РЕАЛДУУ МҮМКҮНЧҮЛҮКТӨР.',
        text: 'Trigonumдун өздүк AI-системасы чоң көлөмдөгү рыноктук маалыматтарды, жаңылыктарды жана жүрүм-турум факторлорун талдап, жашыруун байланыштарды жана натыйжасыздыктарды табат. TAIS команда менен алгоритмдердин чечимдерин күчөтөт.',
        tags: ['AI-аналитика', 'Чоң маалымат', 'Уникалдуу инсайттар'],
        badges: ['Окуяларды талдоо', 'Натыйжасыздыкты табуу', 'Божомол жана сигналдар'],
      },
      {
        id: 'liquidity',
        title: 'Сиздин ликвиддүүлүк',
        kicker: 'БИРГЕ КӨБҮРӨӨК МҮМКҮНЧҮЛҮК.',
        text: 'Кардарлардын капиталы стратегияларды масштабдоого, рыноктук инструменттердин кеңири спектрин пайдаланууга жана бирге киреше табууга мүмкүнчүлүк берет. Ликвиддүүлүк көбөйгөн сайын Trigonum жана инвесторлор үчүн мүмкүнчүлүктөр да көбөйөт.',
        tags: ['Глобалдык рыноктор', 'Инструменттерди диверсификациялоо', 'Бирге өсүү'],
        badges: ['Көбүрөөк инструмент', 'Стратегия масштабы', 'Биргелешкен киреше'],
      },
    ],
    formula: {
      team: ['КОМАНДА', 'Экспертиза жана көзөмөл'],
      algo: ['АЛГОРИТМДЕР', 'Ылдамдык жана система'],
      tais: ['TAIS', 'Талдоо жана инсайт'],
      liquidity: ['ЛИКВИДДҮҮЛҮК', 'Көбүрөөк мүмкүнчүлүк'],
      result: ['БИРГЕЛЕШКЕН НАТЫЙЖА', 'Капиталдын өсүшү'],
    },
  },
}

const icons = {
  team: UsersRound,
  algo: Bot,
  tais: BrainCircuit,
  liquidity: Coins,
} as const

export function HowItWorksSection() {
  const { language } = useI18n()
  const t = copy[language]

  return (
    <section className="how-v2" id="how">
      <header className="how-v2-head">
        <div>
          <p className="how-v2-eyebrow">{t.eyebrow}</p>
          <h2>
            {t.titleStart}
            <span>{t.titleAccent}</span>
          </h2>
          <p className="how-v2-lead">{t.subtitle}</p>
        </div>
        <div className="how-v2-manifesto" aria-hidden="true">
          {t.manifesto.map((item) => <div key={item}>{item}</div>)}
        </div>
      </header>

      <div className="how-v2-grid">
        {t.pillars.map((pillar) => {
          const Icon = icons[pillar.id]
          return (
            <article className={`how-v2-card how-v2-card--${pillar.id}`} key={pillar.id}>
              <div className="how-v2-card-copy">
                <div className="how-v2-card-head">
                  <span className="how-v2-card-icon"><Icon strokeWidth={1.7} /></span>
                  <div>
                    <p className="how-v2-kicker">{pillar.kicker}</p>
                    <h3>{pillar.title}</h3>
                  </div>
                </div>
                <p className="how-v2-card-text">{pillar.text}</p>
                <div className="how-v2-tags">
                  {pillar.tags.map((tag) => <span className="how-v2-tag" key={tag}>{tag}</span>)}
                </div>
              </div>

              <div className="how-v2-card-visual" aria-hidden="true">
                <div className="how-v2-visual-core"><Icon strokeWidth={1.5} /></div>
                <div className="how-v2-visual-badges">
                  {pillar.badges.map((badge) => <span key={badge}>{badge}</span>)}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <Formula copy={t.formula} />
    </section>
  )
}

function Formula({ copy }: { copy: Copy['formula'] }) {
  const items = [
    { id: 'team' as const, icon: UsersRound, copy: copy.team },
    { id: 'algo' as const, icon: Bot, copy: copy.algo },
    { id: 'tais' as const, icon: BrainCircuit, copy: copy.tais },
    { id: 'liquidity' as const, icon: Coins, copy: copy.liquidity },
  ]

  return (
    <div className="how-v2-formula" aria-label={`${copy.team[0]} + ${copy.algo[0]} + ${copy.tais[0]} + ${copy.liquidity[0]} = ${copy.result[0]}`}>
      {items.map(({ id, icon: Icon, copy: itemCopy }, index) => (
        <div key={id} style={{ display: 'contents' }}>
          <div className="how-v2-formula-item">
            <span className="how-v2-formula-icon"><Icon strokeWidth={1.7} /></span>
            <span className="how-v2-formula-copy"><b>{itemCopy[0]}</b><span>{itemCopy[1]}</span></span>
          </div>
          {index < items.length - 1 && <span className="how-v2-op" aria-hidden="true">+</span>}
        </div>
      ))}
      <span className="how-v2-op" aria-hidden="true">=</span>
      <div className="how-v2-result">
        <span className="how-v2-result-icon"><Coins strokeWidth={1.7} /></span>
        <span><b>{copy.result[0]}</b><span>{copy.result[1]}</span></span>
      </div>
    </div>
  )
}
