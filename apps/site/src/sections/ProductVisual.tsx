import { useState } from 'react'
import { landingContent } from '../content/landing'
import { CLOSED_EVENTS, EARN_STATS, EVENTS_SUMMARY, STRATEGIES, strategyNetReturn } from '../content/products'
import { useI18n } from '../i18n/I18nProvider'
import { usd, pct } from '../lib/format'
import type { ProductId } from './ProductModal'

/**
 * Графики продуктов. Рисуем сами, а не библиотекой: три небольших графика на
 * фиксированных данных не стоят 40 КБ рантайма, а инлайновый SVG красится
 * токенами темы и не тянет внешние запросы.
 *
 * Все три построены на тех же массивах, что и таблицы в попапах, — картинка
 * и цифры под ней не могут разойтись.
 */

const W = 340
const H = 176

/** Палитра графиков. Она своя: панель тёмная, и токены светлой темы на ней не читаются. */
const INK = {
  positive: '#a6e34d',
  negative: '#ff7a7a',
  grid: 'rgba(255,255,255,.12)',
  axis: 'rgba(255,255,255,.4)',
  series: ['#4dd0e1', '#9c8cff', '#a6e34d'],
}

export function ProductVisual({ id }: { id: ProductId }) {
  if (id === 'events') return <EventsChart />
  if (id === 'strategies') return <StrategiesChart />
  return <EarnChart />
}

/* --- Events: результат каждой закрытой сделки ------------------------------ */

/** Хронологический порядок: `closed` хранится как дд.мм.гггг. */
function closedAt(value: string): number {
  const [day, month, year] = value.split('.').map(Number)
  return new Date(year, month - 1, day).getTime()
}

const EVENTS_BY_DATE = [...CLOSED_EVENTS].sort((a, b) => closedAt(a.closed) - closedAt(b.closed))

function EventsChart() {
  const { language } = useI18n()
  const t = landingContent(language).charts.events
  const [active, setActive] = useState<number | null>(null)

  const top = 18
  const bottom = 22
  const plot = H - top - bottom
  const posMax = Math.max(...EVENTS_BY_DATE.map((event) => event.result))
  const negMax = Math.abs(Math.min(...EVENTS_BY_DATE.map((event) => event.result)))
  const zero = top + (plot * posMax) / (posMax + negMax)
  const scale = plot / (posMax + negMax)

  const gap = 8
  const width = (W - gap * (EVENTS_BY_DATE.length - 1)) / EVENTS_BY_DATE.length

  const shown = active === null ? EVENTS_BY_DATE.findIndex((event) => event.result === posMax) : active
  const event = EVENTS_BY_DATE[shown]

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" aria-hidden="true">
        <line x1={0} x2={W} y1={zero} y2={zero} stroke={INK.axis} strokeWidth={1} />
        {EVENTS_BY_DATE.map((row, index) => {
          const height = Math.abs(row.result) * scale
          const x = index * (width + gap)
          const up = row.result >= 0
          return (
            <g
              key={row.id}
              className={index === shown ? 'chart-bar is-active' : 'chart-bar'}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
            >
              {/* Прозрачная накладка на всю высоту: по столбцу в 4px попасть нельзя. */}
              <rect x={x} y={top} width={width} height={plot} fill="transparent" />
              <rect
                x={x}
                y={up ? zero - height : zero}
                width={width}
                height={Math.max(height, 1.5)}
                rx={2}
                fill={up ? INK.positive : INK.negative}
              />
            </g>
          )
        })}
      </svg>

      <p className="chart-caption">
        <b>{event.title}</b>
        <span className={event.result >= 0 ? 'chart-pos' : 'chart-neg'}>{pct(event.result)}</span>
        <small>
          {event.position} · {event.days} {t.days} · {event.closed}
        </small>
      </p>

      <dl className="chart-legend">
        <div>
          <dt>{t.average}</dt>
          <dd className="chart-pos">{pct(EVENTS_SUMMARY.weightedResult)}</dd>
        </div>
        <div>
          <dt>{t.best}</dt>
          <dd>{pct(EVENTS_SUMMARY.bestResult)}</dd>
        </div>
        <div>
          <dt>{t.worst}</dt>
          <dd className="chart-neg">{pct(EVENTS_SUMMARY.worstResult)}</dd>
        </div>
      </dl>
    </div>
  )
}

/* --- Strategies: накопленная доходность по кварталам ----------------------- */

/** Накопленным итогом, а не поквартально: инвестора интересует результат за год. */
function cumulative(quarters: number[]): number[] {
  const points = [0]
  quarters.forEach((value) => points.push(points[points.length - 1] + value))
  return points
}

const SERIES = STRATEGIES.map((strategy, index) => ({
  strategy,
  points: cumulative(strategy.quarters),
  color: INK.series[index],
}))

function StrategiesChart() {
  const { language } = useI18n()
  const t = landingContent(language).charts.strategies
  const [active, setActive] = useState<number | null>(null)

  const top = 14
  const bottom = 24
  const left = 16
  const plot = H - top - bottom
  const max = Math.max(...SERIES.flatMap((item) => item.points))
  const min = Math.min(0, ...SERIES.flatMap((item) => item.points))
  const scale = plot / (max - min)

  const step = (W - left * 2) / (SERIES[0].points.length - 1)
  const x = (index: number) => left + index * step
  const y = (value: number) => top + (max - value) * scale

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((index) => (
          <line key={index} x1={x(index)} x2={x(index)} y1={top} y2={top + plot} stroke={INK.grid} strokeWidth={1} />
        ))}
        <line x1={0} x2={W} y1={y(0)} y2={y(0)} stroke={INK.axis} strokeWidth={1} />

        {SERIES.map((item, index) => (
          <polyline
            key={item.strategy.id}
            className={active === null || active === index ? 'chart-line' : 'chart-line is-dim'}
            points={item.points.map((value, point) => `${x(point)},${y(value)}`).join(' ')}
            fill="none"
            stroke={item.color}
            strokeWidth={active === index ? 3 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {SERIES.map((item, index) => (
          <circle
            key={item.strategy.id}
            className={active === null || active === index ? 'chart-line' : 'chart-line is-dim'}
            cx={x(item.points.length - 1)}
            cy={y(item.points[item.points.length - 1])}
            r={active === index ? 5 : 3.5}
            fill={item.color}
          />
        ))}

        {[1, 2, 3, 4].map((quarter) => (
          <text key={quarter} x={x(quarter)} y={H - 7} textAnchor="middle" className="chart-tick">
            Q{quarter}
          </text>
        ))}
      </svg>

      <ul className="chart-series">
        {SERIES.map((item, index) => (
          <li key={item.strategy.id}>
            <button
              type="button"
              className={active === index ? 'is-active' : undefined}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
            >
              <span className="chart-dot" style={{ background: item.color }} />
              <span className="chart-series-name">{item.strategy.name}</span>
              <b>{pct(strategyNetReturn(item.strategy))}</b>
              <small>
                {t.drawdown} {pct(item.strategy.drawdown)}
              </small>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* --- Earn: накопленный доход и окна вывода --------------------------------- */

const EARN_BASE = 100_000
const EARN_POINTS = Array.from({ length: 13 }, (_, month) => (EARN_BASE * (EARN_STATS.rate / 100) * month) / 12)

function EarnChart() {
  const { language } = useI18n()
  const t = landingContent(language).charts.earn
  const [month, setMonth] = useState<number | null>(null)

  const top = 14
  const bottom = 44
  const left = 16
  const plot = H - top - bottom
  const max = EARN_POINTS[EARN_POINTS.length - 1]
  const step = (W - left * 2) / (EARN_POINTS.length - 1)
  const x = (index: number) => left + index * step
  const y = (value: number) => top + plot - (value / max) * plot

  const line = EARN_POINTS.map((value, index) => `${x(index)},${y(value)}`).join(' ')
  const area = `${line} ${x(EARN_POINTS.length - 1)},${top + plot} ${x(0)},${top + plot}`
  const shown = month ?? EARN_POINTS.length - 1

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" aria-hidden="true">
        <defs>
          <linearGradient id="earn-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={INK.series[0]} stopOpacity=".45" />
            <stop offset="100%" stopColor={INK.series[0]} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 3, 6, 9, 12].map((month) => (
          <line key={month} x1={x(month)} x2={x(month)} y1={top} y2={top + plot} stroke={INK.grid} strokeWidth={1} />
        ))}
        <line x1={0} x2={W} y1={top + plot} y2={top + plot} stroke={INK.axis} strokeWidth={1} />
        <polygon points={area} fill="url(#earn-fill)" />
        <polyline points={line} fill="none" stroke={INK.series[0]} strokeWidth={2.5} strokeLinecap="round" />

        <line x1={x(shown)} x2={x(shown)} y1={top} y2={top + plot} stroke={INK.axis} strokeDasharray="3 3" strokeWidth={1} />
        <circle cx={x(shown)} cy={y(EARN_POINTS[shown])} r={4.5} fill={INK.series[0]} />

        {EARN_POINTS.map((_, index) => (
          <rect
            key={index}
            x={x(index) - step / 2}
            y={top}
            width={step}
            height={plot}
            fill="transparent"
            onMouseEnter={() => setMonth(index)}
            onMouseLeave={() => setMonth(null)}
          />
        ))}

        {/* Окна вывода: 52 засечки показывают, что тело доступно каждую неделю. */}
        {Array.from({ length: 52 }, (_, week) => (
          <line
            key={week}
            x1={left + (week * (W - left * 2)) / 51}
            x2={left + (week * (W - left * 2)) / 51}
            y1={H - 26}
            y2={H - 20}
            stroke={INK.grid}
            strokeWidth={1.5}
          />
        ))}
        <text x={left} y={H - 6} className="chart-tick">
          {t.windows}
        </text>
      </svg>

      <p className="chart-caption">
        <b>
          {shown} {t.monthsShort} · +{usd(EARN_POINTS[shown])}
        </b>
        <small>{t.base.replace('{amount}', usd(EARN_BASE)).replace('{rate}', String(EARN_STATS.rate))}</small>
      </p>

      <dl className="chart-legend">
        {t.rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value.replace('{days}', String(EARN_STATS.withdrawDays))}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
