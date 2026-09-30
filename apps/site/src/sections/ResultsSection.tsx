import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Coins,
  Droplets,
  Gauge,
  Info,
  PieChart,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import resultHeroL from '../shared/ui/result-bg-l 1.png'
import resultHeroM from '../shared/ui/result-bg-m 1.png'
import resultHeroS from '../shared/ui/result-bg-s 1.png'
import resultHeroXs from '../shared/ui/result-bg-xs 1.png'
import '../styles/results-v2.css'

type PerformancePoint = {
  date: string
  trigonum: number
  conservative: number
  cash: number
}

type RangeKey = '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'ALL'
type ScenarioId = 'calm' | 'volatile' | 'drop'

const PERFORMANCE_ANCHORS: PerformancePoint[] = [
  { date: '2023-09-01', trigonum: -8, conservative: -3, cash: 0.5 },
  { date: '2023-10-01', trigonum: -4, conservative: -1, cash: 1.0 },
  { date: '2023-11-01', trigonum: -6, conservative: 1, cash: 1.6 },
  { date: '2023-12-01', trigonum: -2, conservative: 2, cash: 2.2 },
  { date: '2024-01-01', trigonum: 0, conservative: 0, cash: 0 },
  { date: '2024-02-01', trigonum: 12, conservative: 4, cash: 1.0 },
  { date: '2024-03-01', trigonum: 24, conservative: 8, cash: 2.0 },
  { date: '2024-04-01', trigonum: 22, conservative: 7, cash: 3.0 },
  { date: '2024-05-01', trigonum: 35, conservative: 13, cash: 4.0 },
  { date: '2024-06-01', trigonum: 52, conservative: 18, cash: 5.0 },
  { date: '2024-07-01', trigonum: 72, conservative: 21, cash: 6.0 },
  { date: '2024-08-01', trigonum: 68, conservative: 20, cash: 7.0 },
  { date: '2024-09-01', trigonum: 82, conservative: 25, cash: 8.0 },
  { date: '2024-10-01', trigonum: 105, conservative: 33, cash: 9.0 },
  { date: '2024-11-01', trigonum: 135, conservative: 39, cash: 10.0 },
  { date: '2024-12-01', trigonum: 175, conservative: 49, cash: 11.1 },
  { date: '2025-01-14', trigonum: 212.4, conservative: 56.8, cash: 12.1 },
]

const MONTHLY_ROWS = [
  {
    year: '2024',
    values: [
      ['Янв', 4.2], ['Фев', 3.8], ['Мар', 5.1], ['Апр', -2.4], ['Май', 6.7], ['Июн', 4.1],
      ['Июл', 3.9], ['Авг', 5.6], ['Сен', 2.1], ['Окт', 7.3], ['Ноя', 6.1], ['Дек', -1.8],
    ],
  },
  {
    year: '2023',
    values: [
      ['Янв', 1.9], ['Фев', 2.7], ['Мар', -3.2], ['Апр', 4.8], ['Май', 3.6], ['Июн', 2.1],
      ['Июл', 5.2], ['Авг', -1.4], ['Сен', 4.1], ['Окт', 3.8], ['Ноя', 5.6], ['Дек', 2.3],
    ],
  },
] as const

const SCENARIOS = [
  {
    id: 'calm' as const,
    title: 'Спокойный рынок',
    subtitle: 'Умеренный рост, низкая волатильность',
    description: 'Плавномерный рост капитала при умеренных колебаниях.',
    range: '8–20%',
    drawdown: 'до −5%',
    liquidity: 'Высокая',
    color: '#1688ff',
    values: [0, 1.2, 2.1, 3.4, 3.1, 4.8, 5.5, 6.9, 7.4, 8.9, 10.3, 11.7, 13.5],
  },
  {
    id: 'volatile' as const,
    title: 'Высокая волатильность',
    subtitle: 'Резкие колебания, неопределённость',
    description: 'Более широкий диапазон движения с периодами быстрой переоценки риска.',
    range: '4–28%',
    drawdown: 'до −12%',
    liquidity: 'Высокая',
    color: '#8b4cf3',
    values: [0, 4, -2, 6, 1, 10, 3, 14, 8, 16, 10, 20, 18],
  },
  {
    id: 'drop' as const,
    title: 'Резкое падение',
    subtitle: 'Стресс на рынках, защитные механизмы',
    description: 'Сценарий показывает просадку, стабилизацию и последующее восстановление.',
    range: '−8–12%',
    drawdown: 'до −15%',
    liquidity: 'Средняя',
    color: '#ef4f67',
    values: [0, -1, -4, -9, -12, -10, -7, -5, -2, 0, 2, 4, 7],
  },
]

const PUBLIC_STATS = [
  { label: 'Капитал на платформе', value: '$ 28 430 000', delta: '+12.8%', note: 'за последние 30 дней', icon: Coins, values: [18, 19, 20, 20, 22, 23, 24, 25, 26, 27, 28] },
  { label: 'Выплаченный доход', value: '$ 4 320 000', delta: '+18.4%', note: 'за последние 30 дней', icon: WalletCards, values: [2.4, 2.5, 2.8, 3.0, 3.1, 3.4, 3.5, 3.8, 4.0, 4.1, 4.32] },
  { label: 'Активные продукты', value: '8', delta: '+2', note: 'инвестиционных стратегий', icon: PieChart, values: [5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8] },
] as const

const RANGE_OPTIONS: { id: RangeKey; label: string }[] = [
  { id: '1M', label: '1М' },
  { id: '3M', label: '3М' },
  { id: '6M', label: '6М' },
  { id: 'YTD', label: 'YTD' },
  { id: '1Y', label: '1Г' },
  { id: 'ALL', label: 'Весь период' },
]

function densifyPerformance(anchors: PerformancePoint[]) {
  const result: PerformancePoint[] = []
  anchors.forEach((current, index) => {
    const next = anchors[index + 1]
    if (!next) {
      result.push(current)
      return
    }

    const start = new Date(`${current.date}T00:00:00Z`).getTime()
    const end = new Date(`${next.date}T00:00:00Z`).getTime()
    const steps = Math.max(2, Math.round((end - start) / (1000 * 60 * 60 * 24 * 7)))

    for (let step = 0; step < steps; step += 1) {
      const ratio = step / steps
      const time = start + (end - start) * ratio
      const pulse = Math.sin((result.length + 1) * 1.61) * 1.6 + Math.sin((result.length + 1) * .47) * .8
      result.push({
        date: new Date(time).toISOString().slice(0, 10),
        trigonum: current.trigonum + (next.trigonum - current.trigonum) * ratio + pulse,
        conservative: current.conservative + (next.conservative - current.conservative) * ratio + pulse * .28,
        cash: current.cash + (next.cash - current.cash) * ratio,
      })
    }
  })
  return result
}

function filterByRange(data: PerformancePoint[], range: RangeKey) {
  if (range === 'ALL') return data
  const last = data[data.length - 1]
  if (!last) return data

  const end = new Date(`${last.date}T00:00:00Z`)
  const start = new Date(end)
  if (range === '1M') start.setUTCMonth(start.getUTCMonth() - 1)
  if (range === '3M') start.setUTCMonth(start.getUTCMonth() - 3)
  if (range === '6M') start.setUTCMonth(start.getUTCMonth() - 6)
  if (range === '1Y') start.setUTCFullYear(start.getUTCFullYear() - 1)
  if (range === 'YTD') {
    start.setUTCMonth(0, 1)
    start.setUTCHours(0, 0, 0, 0)
  }

  return data.filter((point) => new Date(`${point.date}T00:00:00Z`) >= start)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { month: 'short', year: '2-digit' })
    .format(new Date(`${value}T00:00:00Z`))
    .replace('.', '')
}

function formatTooltipDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(`${value}T00:00:00Z`))
    .replace('.', '')
}

export function ResultsSection() {
  const performanceData = useMemo(() => densifyPerformance(PERFORMANCE_ANCHORS), [])
  const [range, setRange] = useState<RangeKey>('1Y')
  const [scenarioId, setScenarioId] = useState<ScenarioId>('calm')
  const [selectedMonth, setSelectedMonth] = useState({ year: '2024', month: 'Окт', value: 7.3 })

  const visiblePerformance = useMemo(
    () => filterByRange(performanceData, range),
    [performanceData, range],
  )
  const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0]
  const scenarioData = scenario.values.map((value, index) => ({ step: index + 1, value }))

  return (
    <section className="performance-v2" id="results">
      <section className="performance-v2-hero">
        <picture className="performance-v2-hero-art" aria-hidden="true">
          <source media="(max-width: 640px)" srcSet={resultHeroXs} />
          <source media="(max-width: 1024px)" srcSet={resultHeroS} />
          <source media="(max-width: 1440px)" srcSet={resultHeroM} />
          <img src={resultHeroL} alt="" />
        </picture>
        <div className="performance-v2-hero-shade" aria-hidden="true" />
        <div className="performance-v2-hero-copy">
          <span>РЕЗУЛЬТАТЫ</span>
          <h2>Результаты<br /><b>говорят сами за себя</b></h2>
          <p>Реальные исторические данные, прозрачная статистика и устойчивый рост капитала на разных рыночных циклах.</p>
        </div>
      </section>

      <div className="performance-v2-body">
        <header className="performance-v2-heading">
          <span>ИСТОРИЧЕСКИЕ РЕЗУЛЬТАТЫ</span>
          <h3>Результаты во времени</h3>
          <p>Посмотрите, как менялся капитал на историческом периоде. Данные носят иллюстративный характер и не гарантируют аналогичных результатов в будущем.</p>
        </header>

        <section className="performance-chart-card">
          <div className="performance-chart-toolbar">
            <div className="performance-chart-title">
              <strong>Рост капитала, %</strong>
              <Info size={18} aria-hidden="true" />
            </div>
            <div className="performance-range-tabs" role="group" aria-label="Период графика">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={range === option.id ? 'active' : undefined}
                  onClick={() => setRange(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="performance-main-chart" aria-label="Интерактивный график роста капитала">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={visiblePerformance} margin={{ top: 12, right: 14, bottom: 0, left: -8 }}>
                <defs>
                  <linearGradient id="trigonumPerformanceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1688ff" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#1688ff" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(129,154,188,.18)" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#7890ad', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={56}
                  tickFormatter={formatDate}
                />
                <YAxis
                  width={52}
                  tick={{ fill: '#7890ad', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <ReferenceLine y={0} stroke="rgba(109,130,157,.38)" />
                <Tooltip
                  animationDuration={120}
                  labelFormatter={(value) => formatTooltipDate(String(value))}
                  formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]}
                  contentStyle={{
                    border: '1px solid #dce8f4',
                    borderRadius: 10,
                    boxShadow: '0 12px 30px rgba(42,74,110,.14)',
                    background: 'rgba(255,255,255,.97)',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="trigonum"
                  name="Trigonum"
                  stroke="#1688ff"
                  strokeWidth={3}
                  fill="url(#trigonumPerformanceFill)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#1688ff' }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="conservative"
                  name="Консервативный ориентир"
                  stroke="#8b4cf3"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="cash"
                  name="Капитал без размещения"
                  stroke="#8b98aa"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="performance-chart-legend" aria-label="Легенда">
            <span><i className="blue" />Trigonum <b>+212.4%</b></span>
            <span><i className="purple" />Консервативный ориентир <b>+56.8%</b></span>
            <span><i className="gray" />Капитал без размещения <b>+12.1%</b></span>
          </div>

          <div className="performance-kpis">
            <article>
              <TrendingUp size={25} />
              <div><span>Доходность за 12 мес.</span><strong>+48.6%</strong><small>на исторических данных</small></div>
            </article>
            <article>
              <CalendarDays size={25} />
              <div><span>Прибыльных месяцев</span><strong>9 из 12</strong><small>месяцев в плюсе</small></div>
            </article>
            <article className="purple">
              <ArrowDownRight size={25} />
              <div><span>Макс. просадка</span><strong>−12.8%</strong><small>минимальное значение</small></div>
            </article>
            <article>
              <RefreshCw size={25} />
              <div><span>Срок восстановления</span><strong>38 дней</strong><small>до нового максимума</small></div>
            </article>
          </div>
        </section>

        <header className="performance-v2-heading performance-v2-heading-spaced">
          <span>СТАБИЛЬНОСТЬ</span>
          <h3>Стабильность результата</h3>
          <p>Помесячная доходность за последние 2 года. Нажмите на любой месяц, чтобы выделить его и посмотреть значение.</p>
        </header>

        <section className="stability-panel">
          <div className="stability-table-wrap">
            <div className="stability-table" role="table" aria-label="Помесячная доходность">
              <div className="stability-row stability-head-row" role="row">
                <b>Год</b>
                {MONTHLY_ROWS[0].values.map(([month]) => <span key={month}>{month}</span>)}
              </div>
              {MONTHLY_ROWS.map((row) => (
                <div className="stability-row" role="row" key={row.year}>
                  <b>{row.year}</b>
                  {row.values.map(([month, value]) => {
                    const active = selectedMonth.year === row.year && selectedMonth.month === month
                    return (
                      <button
                        key={month}
                        type="button"
                        className={`${value >= 0 ? 'positive' : 'negative'}${active ? ' active' : ''}`}
                        onClick={() => setSelectedMonth({ year: row.year, month, value })}
                        aria-label={`${month} ${row.year}: ${value > 0 ? '+' : ''}${value}%`}
                      >
                        {value > 0 ? '+' : ''}{value}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="stability-selection">
              <span>Выбранный месяц</span>
              <strong className={selectedMonth.value >= 0 ? 'positive' : 'negative'}>
                {selectedMonth.month} {selectedMonth.year}: {selectedMonth.value > 0 ? '+' : ''}{selectedMonth.value}%
              </strong>
            </div>
          </div>

          <div className="stability-summary">
            <article><strong>9 из 12</strong><span>месяцев в плюсе</span><Activity size={23} /></article>
            <article className="negative"><strong>−3.2%</strong><span>Худший месяц<br />Март 2023</span><ArrowDownRight size={23} /></article>
            <article className="positive"><strong>+7.3%</strong><span>Лучший месяц<br />Октябрь 2024</span><ArrowUpRight size={23} /></article>
            <article className="positive"><strong>+3.8%</strong><span>Средний результат<br />в месяц</span><TrendingUp size={23} /></article>
          </div>
        </section>

        <header className="performance-v2-heading performance-v2-heading-spaced">
          <span>СЦЕНАРИИ</span>
          <h3>Как ведёт себя капитал в разных рыночных условиях</h3>
          <p>Переключайте сценарии: график и параметры перестраиваются интерактивно на основе иллюстративных исторических профилей.</p>
        </header>

        <section className="scenario-panel">
          <div className="scenario-tabs" role="tablist" aria-label="Рыночные сценарии">
            {SCENARIOS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={scenario.id === item.id}
                className={scenario.id === item.id ? 'active' : undefined}
                onClick={() => setScenarioId(item.id)}
              >
                <span className={`scenario-icon ${item.id}`}><Gauge size={23} /></span>
                <span><b>{item.title}</b><small>{item.subtitle}</small></span>
              </button>
            ))}
          </div>

          <div className="scenario-chart-card">
            <div>
              <span className="scenario-eyebrow">{scenario.title}</span>
              <strong>{scenario.description}</strong>
            </div>
            <div className="scenario-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scenarioData} margin={{ top: 10, right: 10, left: -26, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(129,154,188,.13)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="step" hide />
                  <YAxis
                    tick={{ fill: '#7f92aa', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <ReferenceLine y={0} stroke="rgba(101,123,151,.35)" />
                  <Tooltip
                    formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Изменение капитала']}
                    labelFormatter={(value) => `Этап ${value}`}
                    contentStyle={{
                      border: '1px solid #dce8f4',
                      borderRadius: 9,
                      background: 'rgba(255,255,255,.98)',
                      fontSize: 11,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={scenario.color}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: scenario.color }}
                    isAnimationActive
                    animationDuration={320}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="scenario-metrics">
            <h4>Историческое поведение</h4>
            <dl>
              <div><dt><TrendingUp size={20} />Ожидаемый диапазон</dt><dd>{scenario.range}<small>годовых по историческому профилю</small></dd></div>
              <div><dt><ShieldCheck size={20} />Зона просадки</dt><dd>{scenario.drawdown}<small>в типичных условиях</small></dd></div>
              <div><dt><Droplets size={20} />Ликвидность</dt><dd>{scenario.liquidity}<small>возможность вывода зависит от продукта</small></dd></div>
            </dl>
          </div>

          <p className="scenario-disclaimer"><Info size={17} />Сценарии основаны на исторических данных и носят информационный характер. Они не являются индивидуальной инвестиционной рекомендацией и не гарантируют аналогичных результатов в будущем.</p>
        </section>

        <header className="performance-v2-heading performance-v2-heading-spaced">
          <span>ПЛАТФОРМА</span>
          <h3>Публичная статистика платформы</h3>
          <p>Актуальные показатели работы Trigonum Broker. Мини-графики позволяют быстро увидеть направление изменения показателя.</p>
        </header>

        <section className="public-stats-grid">
          {PUBLIC_STATS.map((stat) => {
            const Icon = stat.icon
            const sparkData = stat.values.map((value, index) => ({ index, value }))
            return (
              <article key={stat.label}>
                <div className="public-stat-icon"><Icon size={25} /></div>
                <div className="public-stat-copy">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                  <b>↗ {stat.delta}</b>
                  <small>{stat.note}</small>
                </div>
                <div className="public-stat-spark" aria-hidden="true">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkData}>
                      <Line type="monotone" dataKey="value" stroke="#1688ff" strokeWidth={2.3} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </article>
            )
          })}
          <article className="public-stat-update">
            <div className="public-stat-icon"><Clock3 size={25} /></div>
            <div className="public-stat-copy">
              <span>Последнее обновление</span>
              <strong>14 янв 2025</strong>
              <b className="status-dot">● Данные актуальны</b>
              <small>обновление каждые 4 часа</small>
            </div>
          </article>
        </section>

        <p className="performance-v2-disclaimer">
          Все показатели в этом демонстрационном блоке используются для визуализации интерфейса и исторического поведения. Прошлые результаты не гарантируют будущую доходность.
        </p>
      </div>
    </section>
  )
}
