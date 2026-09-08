import { useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landing'
import { RETURN_SOURCE_SHARES } from '../content/products'
import { SourceArt } from './SourceArt'

/**
 * Объяснение источника доходности. Без него 7–20% выглядят обещанием из
 * воздуха — а именно это и отпугивает аудиторию с реальным капиталом.
 *
 * Четыре абзаца в ряд читали по диагонали и уходили: текст без структуры не
 * доказывает. Здесь то же содержание разложено на выбор источника, картинку
 * механики и схему всей архитектуры — человек видит, что источников
 * действительно несколько и что они связаны, а не перечислены.
 */
export function HowItWorksSection() {
  const { language } = useI18n()
  const { how } = landingContent(language)
  const [active, setActive] = useState(0)
  const step = how.steps[active]

  return (
    <section className="how-section" id="how">
      <header className="section-head">
        <h2>{how.title}</h2>
        <p>{how.subtitle}</p>
      </header>

      <div className="how-layout">
        <ol className="how-rail">
          {how.steps.map((item, index) => {
            const share = RETURN_SOURCE_SHARES[index]
            return (
              <li key={item.title}>
                <button
                  type="button"
                  className={index === active ? 'is-active' : undefined}
                  aria-pressed={index === active}
                  onClick={() => setActive(index)}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                >
                  <span className="how-rail-index">{index + 1}</span>
                  <span className="how-rail-name">{item.title}</span>
                  <span className="how-rail-share">{share === null ? '—' : `${share}%`}</span>
                  <span className="how-rail-bar" style={{ width: `${share ?? 100}%` }} />
                </button>
              </li>
            )
          })}
          <li className="how-rail-legend">{how.flow.share}</li>
        </ol>

        {/* key перезапускает анимацию входа: без неё смена выглядит как подмена текста. */}
        <article className="how-panel" key={active}>
          <div className="how-art">
            <SourceArt index={active} />
          </div>
          <div className="how-panel-text">
            <h3>{step.title}</h3>
            <p>{step.text}</p>
            <dl className="how-metrics">
              {step.metrics.map((metric) => (
                <div key={metric.label}>
                  <dt>{metric.value}</dt>
                  <dd>{metric.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </article>
      </div>

      <FlowDiagram active={active} labels={how.flow} titles={how.steps.map((item) => item.title)} />

      <p className="how-note">{how.note}</p>
    </section>
  )
}

/* --- Схема архитектуры ------------------------------------------------------ */

const FLOW_W = 1100
const FLOW_H = 250
/** Индексы шагов, которые действительно являются источниками дохода. TAIS — слой между ними. */
const SOURCE_STEPS = [0, 1, 3]
const TAIS_STEP = 2
const NODE_W = 232
const NODE_H = 50
const LANES = [58, 128, 198]
const CORE_X = FLOW_W / 2
const PRODUCTS = ['Events', 'Strategies', 'Earn']

/** Кубическая кривая между правым краем узла и ядром — прямые линии читаются как таблица. */
function curve(x1: number, y1: number, x2: number, y2: number): string {
  const mid = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`
}

function FlowDiagram({
  active,
  labels,
  titles,
}: {
  active: number
  labels: { sources: string; core: string; products: string }
  titles: string[]
}) {
  const coreLeft = CORE_X - 66
  const coreRight = CORE_X + 66

  return (
    <div className="how-flow">
      <svg viewBox={`0 0 ${FLOW_W} ${FLOW_H}`} className="flow-svg" role="img" aria-label={`${labels.sources} → ${labels.core} → ${labels.products}`}>
        <text className="flow-caption" x={0} y={16}>
          {labels.sources}
        </text>
        <text className="flow-caption" x={CORE_X} y={16} textAnchor="middle">
          {labels.core}
        </text>
        <text className="flow-caption" x={FLOW_W} y={16} textAnchor="end">
          {labels.products}
        </text>

        {SOURCE_STEPS.map((step, lane) => (
          <path
            key={`in-${step}`}
            className={active === step || active === TAIS_STEP ? 'flow-link is-live' : 'flow-link'}
            d={curve(NODE_W, LANES[lane], coreLeft, 128)}
            fill="none"
          />
        ))}
        {LANES.map((y, lane) => (
          <path
            key={`out-${lane}`}
            className={active === TAIS_STEP ? 'flow-link is-live' : 'flow-link'}
            d={curve(coreRight, 128, FLOW_W - NODE_W, y)}
            fill="none"
          />
        ))}

        {SOURCE_STEPS.map((step, lane) => {
          const share = RETURN_SOURCE_SHARES[step]
          return (
            <g key={step} className={active === step ? 'flow-node is-active' : 'flow-node'}>
              <rect x={0} y={LANES[lane] - NODE_H / 2} width={NODE_W} height={NODE_H} rx={12} />
              <text className="flow-node-name" x={18} y={LANES[lane] + 1}>
                {titles[step]}
              </text>
              <text className="flow-node-share" x={18} y={LANES[lane] + 16}>
                {share}%
              </text>
            </g>
          )
        })}

        <g className={active === TAIS_STEP ? 'flow-core is-active' : 'flow-core'}>
          <circle cx={CORE_X} cy={128} r={72} className="flow-core-halo" />
          <path
            className="flow-core-shape"
            d={`M ${CORE_X} 70 L ${CORE_X + 50} 99 L ${CORE_X + 50} 157 L ${CORE_X} 186 L ${CORE_X - 50} 157 L ${CORE_X - 50} 99 Z`}
          />
          <text className="flow-core-text" x={CORE_X} y={134} textAnchor="middle">
            TAIS
          </text>
        </g>

        {PRODUCTS.map((name, lane) => (
          <g key={name} className="flow-node flow-node-product">
            <rect x={FLOW_W - NODE_W} y={LANES[lane] - NODE_H / 2} width={NODE_W} height={NODE_H} rx={12} />
            <text className="flow-node-name" x={FLOW_W - NODE_W + 18} y={LANES[lane] + 5}>
              {name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
