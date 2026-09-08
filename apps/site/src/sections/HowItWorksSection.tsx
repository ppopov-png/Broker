import { useState } from 'react'
import trigonumIcon from '../assets/trigonum-icon.svg'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landing'
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
          {how.steps.map((item, index) => (
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
                <span className="how-rail-bar" />
              </button>
            </li>
          ))}
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
const FLOW_H = 300
const NODE_W = 232
const NODE_H = 50
const NODE_GAP = 16
/** Четыре источника слева, три продукта справа — оба столбца центрируются по ядру. */
const CORE_Y = 164
const SOURCE_LANES = [0, 1, 2, 3].map((i) => CORE_Y - 1.5 * (NODE_H + NODE_GAP) + i * (NODE_H + NODE_GAP))
const PRODUCT_LANES = [0, 1, 2].map((i) => CORE_Y - (NODE_H + NODE_GAP) + i * (NODE_H + NODE_GAP))
const CORE_W = 240
const CORE_LEFT = (FLOW_W - CORE_W) / 2
const CORE_RIGHT = CORE_LEFT + CORE_W
const PRODUCTS = ['Events', 'Strategies', 'Earn']

/** Кубическая кривая между краем узла и ядром — прямые линии читаются как таблица. */
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
  return (
    <div className="how-flow">
      <svg viewBox={`0 0 ${FLOW_W} ${FLOW_H}`} className="flow-svg" role="img" aria-label={`${labels.sources} → ${labels.core} → ${labels.products}`}>
        <text className="flow-caption" x={0} y={16}>
          {labels.sources}
        </text>
        <text className="flow-caption" x={FLOW_W / 2} y={16} textAnchor="middle">
          {labels.core}
        </text>
        <text className="flow-caption" x={FLOW_W} y={16} textAnchor="end">
          {labels.products}
        </text>

        {SOURCE_LANES.map((y, step) => (
          <path
            key={`in-${step}`}
            className={active === step ? 'flow-link is-live' : 'flow-link'}
            d={curve(NODE_W, y, CORE_LEFT, CORE_Y)}
            fill="none"
          />
        ))}
        {/* Исходящие связи живые всегда: капитал из любого источника доходит до всех трёх продуктов. */}
        {PRODUCT_LANES.map((y, lane) => (
          <path key={`out-${lane}`} className="flow-link is-live" d={curve(CORE_RIGHT, CORE_Y, FLOW_W - NODE_W, y)} fill="none" />
        ))}

        {SOURCE_LANES.map((y, step) => (
          <g key={step} className={active === step ? 'flow-node is-active' : 'flow-node'}>
            <rect x={0} y={y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={12} />
            <text className="flow-node-name" x={18} y={y + 5}>
              {titles[step]}
            </text>
          </g>
        ))}

        <g className="flow-core">
          <rect x={CORE_LEFT} y={CORE_Y - 48} width={CORE_W} height={96} rx={18} className="flow-core-shape" />
          <image href={trigonumIcon} x={CORE_LEFT + 40} y={CORE_Y - 18} width={36} height={36} />
          <text className="flow-core-name" x={CORE_LEFT + 88} y={CORE_Y - 2}>
            TRIGONUM
          </text>
          <text className="flow-core-product" x={CORE_LEFT + 88} y={CORE_Y + 18}>
            BROKER
          </text>
        </g>

        {PRODUCTS.map((name, lane) => (
          <g key={name} className="flow-node flow-node-product">
            <rect x={FLOW_W - NODE_W} y={PRODUCT_LANES[lane] - NODE_H / 2} width={NODE_W} height={NODE_H} rx={12} />
            <text className="flow-node-name" x={FLOW_W - NODE_W + 18} y={PRODUCT_LANES[lane] + 5}>
              {name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
