import { Activity, BarChart3, Bot, BrainCircuit, BriefcaseBusiness, Coins, Cpu, DatabaseZap, Network, Radar, ShieldCheck, Sparkles, Target, TrendingUp, UsersRound, Zap } from 'lucide-react'
import { useI18n, type Language } from '../i18n/I18nProvider'
import './HowItWorksSection.css'
import './HowItWorksVisuals.css'

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
    eyebrow: 'ИНВЕСТИЦИОННЫЙ ПРОЦЕСС',
    titleStart: 'КАК ФОРМИРУЕТСЯ ',
    titleAccent: 'ИНВЕСТИЦИОННЫЙ РЕЗУЛЬТАТ',
    subtitle:
      'Результат формируется за счёт сочетания профессионального управления, алгоритмических методов, аналитической системы TAIS и доступной ликвидности. Каждый элемент выполняет отдельную функцию в процессе отбора, оценки и реализации инвестиционных решений.',
    manifesto: ['АНАЛИЗ', 'УПРАВЛЕНИЕ', 'КОНТРОЛЬ'],
    pillars: [
      {
        id: 'team',
        title: 'Командная торговля',
        kicker: 'ПРОФЕССИОНАЛЬНАЯ ЭКСПЕРТИЗА. КОЛЛЕГИАЛЬНЫЕ РЕШЕНИЯ.',
        text:
          'Трейдеры, аналитики и специалисты по управлению рисками оценивают рыночную ситуацию, формируют инвестиционные гипотезы и принимают решения в рамках утверждённых процедур. Существенные идеи рассматриваются инвестиционным комитетом, а параметры риска контролируются на всех этапах исполнения.',
        tags: ['Профессиональная команда', 'Инвестиционный комитет', 'Контроль рисков'],
        badges: ['Рыночный анализ', 'Инвестрешения', 'Риск-контроль'],
      },
      {
        id: 'algo',
        title: 'Алгоритмическая торговля',
        kicker: 'СИСТЕМАТИЧЕСКИЙ АНАЛИЗ. АВТОМАТИЗИРОВАННОЕ ИСПОЛНЕНИЕ.',
        text:
          'Собственные алгоритмические модели непрерывно анализируют рыночные данные, выявляют ценовые отклонения и иные статистически значимые возможности, а также обеспечивают автоматизированное исполнение операций, предусмотренных торговыми стратегиями. Такой подход повышает скорость обработки информации и снижает зависимость от человеческого фактора.',
        tags: ['Алгоритмические модели', 'Автоматизированное исполнение', 'Контроль параметров'],
        badges: ['Мониторинг рынка', 'Арбитражные модели', 'Исполнение'],
      },
      {
        id: 'tais',
        title: 'TAIS',
        kicker: 'ИИ-СИСТЕМА АНАЛИЗА РЫНКА И СОБЫТИЙ.',
        text:
          'TAIS — собственная аналитическая система Trigonum на базе искусственного интеллекта. Она обрабатывает рыночные, макроэкономические, новостные и поведенческие данные, выявляет взаимосвязи, аномалии и признаки рыночных неэффективностей и используется как дополнительный инструмент при формировании и проверке инвестиционных гипотез.',
        tags: ['Анализ данных', 'Рыночные события', 'Оценка гипотез'],
        badges: ['Анализ событий', 'Выявление аномалий', 'Сигналы и сценарии'],
      },
      {
        id: 'liquidity',
        title: 'Ваша ликвидность',
        kicker: 'КАПИТАЛ ДЛЯ РЕАЛИЗАЦИИ ИНВЕСТИЦИОННЫХ РЕШЕНИЙ.',
        text:
          'Средства инвесторов формируют ликвидность, необходимую для реализации одобренных стратегий и использования доступных рыночных инструментов. Объединение капитала инвесторов с инфраструктурой и компетенциями Trigonum позволяет реализовывать инвестиционные решения в требуемом объёме и распределять финансовый результат в соответствии с условиями выбранного продукта.',
        tags: ['Инвестиционная ликвидность', 'Диверсификация инструментов', 'Совместное участие'],
        badges: ['Инвестиционный капитал', 'Масштаб стратегии', 'Результат по продукту'],
      },
    ],
    formula: {
      team: ['КОМАНДА', 'Профессиональное управление'],
      algo: ['АЛГОРИТМЫ', 'Систематический анализ'],
      tais: ['TAIS', 'Аналитика и оценка'],
      liquidity: ['ЛИКВИДНОСТЬ', 'Капитал для реализации'],
      result: ['ИНВЕСТИЦИОННЫЙ РЕЗУЛЬТАТ', 'В соответствии с условиями продукта'],
    },
  },
  en: {
    eyebrow: 'INVESTMENT PROCESS',
    titleStart: 'HOW THE ',
    titleAccent: 'INVESTMENT RESULT IS FORMED',
    subtitle:
      'Investment outcomes are formed through a combination of professional management, systematic methods, the TAIS analytical system and available liquidity. Each element performs a distinct function in the selection, assessment and implementation of investment decisions.',
    manifesto: ['ANALYSIS', 'MANAGEMENT', 'CONTROL'],
    pillars: [
      {
        id: 'team',
        title: 'Team trading',
        kicker: 'PROFESSIONAL EXPERTISE. COLLEGIATE DECISION-MAKING.',
        text:
          'Traders, analysts and risk-management specialists assess market conditions, formulate investment hypotheses and make decisions within approved procedures. Material ideas are reviewed by the investment committee, while risk parameters are monitored throughout the execution process.',
        tags: ['Professional team', 'Investment committee', 'Risk control'],
        badges: ['Market analysis', 'Investment decisions', 'Risk control'],
      },
      {
        id: 'algo',
        title: 'Algorithmic trading',
        kicker: 'SYSTEMATIC ANALYSIS. AUTOMATED EXECUTION.',
        text:
          'Proprietary algorithmic models continuously analyse market data, identify price dislocations and other statistically significant opportunities, and support automated execution of transactions provided for by the trading strategies. This approach increases information-processing speed and reduces dependence on human intervention.',
        tags: ['Algorithmic models', 'Automated execution', 'Parameter control'],
        badges: ['Market monitoring', 'Arbitrage models', 'Execution'],
      },
      {
        id: 'tais',
        title: 'TAIS',
        kicker: 'AI-BASED MARKET AND EVENT ANALYTICS.',
        text:
          'TAIS is Trigonum’s proprietary artificial-intelligence-based analytical system. It processes market, macroeconomic, news and behavioural data, identifies relationships, anomalies and indications of market inefficiencies, and is used as an additional tool for developing and validating investment hypotheses.',
        tags: ['Data analysis', 'Market events', 'Hypothesis assessment'],
        badges: ['Event analysis', 'Anomaly detection', 'Signals and scenarios'],
      },
      {
        id: 'liquidity',
        title: 'Your liquidity',
        kicker: 'CAPITAL FOR IMPLEMENTING INVESTMENT DECISIONS.',
        text:
          'Investor funds provide the liquidity required to implement approved strategies and use available market instruments. Combining investor capital with Trigonum’s infrastructure and expertise enables investment decisions to be implemented at the required scale and financial outcomes to be allocated in accordance with the terms of the selected product.',
        tags: ['Investment liquidity', 'Instrument diversification', 'Co-participation'],
        badges: ['Investment capital', 'Strategy scale', 'Product outcome'],
      },
    ],
    formula: {
      team: ['TEAM', 'Professional management'],
      algo: ['ALGORITHMS', 'Systematic analysis'],
      tais: ['TAIS', 'Analytics and assessment'],
      liquidity: ['LIQUIDITY', 'Capital for implementation'],
      result: ['INVESTMENT RESULT', 'According to product terms'],
    },
  },
  ky: {
    eyebrow: 'ИНВЕСТИЦИЯЛЫК ПРОЦЕСС',
    titleStart: 'ИНВЕСТИЦИЯЛЫК НАТЫЙЖА ',
    titleAccent: 'КАНТИП ТҮЗҮЛӨТ',
    subtitle:
      'Инвестициялык натыйжа кесипкөй башкаруунун, алгоритмдик ыкмалардын, TAIS аналитикалык системасынын жана жеткиликтүү ликвиддүүлүктүн айкалышынын негизинде түзүлөт. Ар бир элемент инвестициялык чечимдерди тандоо, баалоо жана ишке ашыруу процессинде өзүнчө функция аткарат.',
    manifesto: ['ТАЛДОО', 'БАШКАРУУ', 'КӨЗӨМӨЛ'],
    pillars: [
      {
        id: 'team',
        title: 'Командалык соода',
        kicker: 'КЕСИПКӨЙ ЭКСПЕРТИЗА. КОЛЛЕГИАЛДУУ ЧЕЧИМДЕР.',
        text:
          'Трейдерлер, аналитиктер жана тобокелдиктерди башкаруу боюнча адистер рыноктук жагдайды баалап, инвестициялык гипотезаларды түзүшөт жана бекитилген жол-жоболордун алкагында чечим кабыл алышат. Маанилүү идеялар инвестициялык комитет тарабынан каралат, ал эми тобокелдик параметрлери аткаруунун бардык этаптарында көзөмөлдөнөт.',
        tags: ['Кесипкөй команда', 'Инвестициялык комитет', 'Тобокелдикти көзөмөлдөө'],
        badges: ['Рыноктук талдоо', 'Инвестициялык чечимдер', 'Тобокел көзөмөлү'],
      },
      {
        id: 'algo',
        title: 'Алгоритмдик соода',
        kicker: 'СИСТЕМАЛУУ ТАЛДОО. АВТОМАТТАШТЫРЫЛГАН АТКАРУУ.',
        text:
          'Өздүк алгоритмдик моделдер рыноктук маалыматтарды үзгүлтүксүз талдап, баанын четтөөлөрүн жана башка статистикалык маанилүү мүмкүнчүлүктөрдү аныктайт, ошондой эле соода стратегияларында каралган операцияларды автоматташтырылган түрдө аткарууну камсыз кылат. Бул ыкма маалыматты иштетүүнүн ылдамдыгын жогорулатып, адам факторуна болгон көз карандылыкты азайтат.',
        tags: ['Алгоритмдик моделдер', 'Автоматташтырылган аткаруу', 'Параметрлерди көзөмөлдөө'],
        badges: ['Рынок мониторинги', 'Арбитраждык моделдер', 'Аткаруу'],
      },
      {
        id: 'tais',
        title: 'TAIS',
        kicker: 'РЫНОКТУ ЖАНА ОКУЯЛАРДЫ ТАЛДООЧУ ЖАСАЛМА ИНТЕЛЛЕКТ СИСТЕМАСЫ.',
        text:
          'TAIS — Trigonumдун жасалма интеллектке негизделген өздүк аналитикалык системасы. Ал рыноктук, макроэкономикалык, жаңылык жана жүрүм-турум маалыматтарын иштетип, өз ара байланыштарды, аномалияларды жана рыноктук натыйжасыздыктардын белгилерин аныктайт жана инвестициялык гипотезаларды түзүүдө жана текшерүүдө кошумча аналитикалык инструмент катары колдонулат.',
        tags: ['Маалыматтарды талдоо', 'Рыноктук окуялар', 'Гипотезаларды баалоо'],
        badges: ['Окуяларды талдоо', 'Аномалияларды аныктоо', 'Сигналдар жана сценарийлер'],
      },
      {
        id: 'liquidity',
        title: 'Сиздин ликвиддүүлүк',
        kicker: 'ИНВЕСТИЦИЯЛЫК ЧЕЧИМДЕРДИ ИШКЕ АШЫРУУ ҮЧҮН КАПИТАЛ.',
        text:
          'Инвесторлордун каражаттары бекитилген стратегияларды ишке ашыруу жана жеткиликтүү рыноктук инструменттерди колдонуу үчүн зарыл болгон ликвиддүүлүктү түзөт. Инвесторлордун капиталын Trigonumдун инфраструктурасы жана компетенциялары менен айкалыштыруу инвестициялык чечимдерди керектүү көлөмдө ишке ашырууга жана финансылык натыйжаны тандалган продукттун шарттарына ылайык бөлүштүрүүгө мүмкүндүк берет.',
        tags: ['Инвестициялык ликвиддүүлүк', 'Инструменттерди диверсификациялоо', 'Биргелешкен катышуу'],
        badges: ['Инвестициялык капитал', 'Стратегиянын масштабы', 'Продукт боюнча натыйжа'],
      },
    ],
    formula: {
      team: ['КОМАНДА', 'Кесипкөй башкаруу'],
      algo: ['АЛГОРИТМДЕР', 'Системалуу талдоо'],
      tais: ['TAIS', 'Аналитика жана баалоо'],
      liquidity: ['ЛИКВИДДҮҮЛҮК', 'Ишке ашыруу үчүн капитал'],
      result: ['ИНВЕСТИЦИЯЛЫК НАТЫЙЖА', 'Продукттун шарттарына ылайык'],
    },
  },
}

const icons = {
  team: UsersRound,
  algo: Bot,
  tais: BrainCircuit,
  liquidity: Coins,
} as const

const sceneIcons = {
  team: [BriefcaseBusiness, Target, ShieldCheck],
  algo: [Zap, Radar, Cpu],
  tais: [DatabaseZap, Network, Sparkles],
  liquidity: [TrendingUp, BarChart3, Activity],
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
            <article className={`how-v2-card how-v2-card--${pillar.id}`} key={pillar.id} tabIndex={0}>
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

              <PillarScene pillar={pillar} />
            </article>
          )
        })}
      </div>

      <Formula copy={t.formula} />
    </section>
  )
}

function PillarScene({ pillar }: { pillar: Pillar }) {
  const MainIcon = icons[pillar.id]
  const [NodeOne, NodeTwo, NodeThree] = sceneIcons[pillar.id]

  return (
    <div className="how-v2-card-visual" aria-hidden="true">
      <div className="how-v2-scene">
        <span className="how-v2-scene-node how-v2-scene-node--1"><NodeOne /></span>
        <span className="how-v2-scene-node how-v2-scene-node--2"><NodeTwo /></span>
        <span className="how-v2-scene-node how-v2-scene-node--3"><NodeThree /></span>
        <span className="how-v2-scene-main"><MainIcon /></span>
        <div className="how-v2-visual-badges">
          {pillar.badges.map((badge) => <span key={badge}>{badge}</span>)}
        </div>
      </div>
    </div>
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
        <span className="how-v2-result-icon"><TrendingUp strokeWidth={1.7} /></span>
        <span><b>{copy.result[0]}</b><span>{copy.result[1]}</span></span>
      </div>
    </div>
  )
}
