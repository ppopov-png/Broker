import { ArrowRight, ArrowUpRight, CalendarDays, ChartNoAxesCombined, Target } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent, type LandingContent, type ProductRow } from '../content/landing'
import { EARN_STATS, EVENTS_SUMMARY, STRATEGIES_SUMMARY } from '../content/products'
import { onboardingUrl } from '../lib/appLinks'
import { ProductModal, type ProductId } from './ProductModal'

const icons = {
  earn: ChartNoAxesCombined,
  strategies: Target,
  events: CalendarDays,
} as const

const usd = (value: number) => `$${Math.round(value).toLocaleString('ru-RU').replace(/ /g, ' ')}`

/**
 * Короткая строка доказательства под описанием: она вытягивает человека в
 * попап. Абстрактное «узнать больше» без повода не нажимают.
 */
const proof: Record<ProductId, string> = {
  events: `${EVENTS_SUMMARY.profitable} из ${EVENTS_SUMMARY.total} закрытых сделок прибыльны · инвесторы заработали ${usd(EVENTS_SUMMARY.netProfit)}`,
  strategies: `${usd(STRATEGIES_SUMMARY.aum)} под управлением · инвесторы заработали ${usd(STRATEGIES_SUMMARY.netProfit)} за год`,
  earn: `${usd(EARN_STATS.aum)} под управлением · выплачено ${usd(EARN_STATS.paidOut)} дохода`,
}

/**
 * Продукты идут блоками, а не тремя карточками в ряд: у каждого своя
 * механика, и ряд одинаковых плиток заставляет сравнивать их по ставке —
 * единственному, что в них выглядит сопоставимым.
 *
 * Порядок ведёт от самого наглядного продукта к самому спокойному.
 */
const ORDER: ProductId[] = ['events', 'strategies', 'earn']

export function ProductsSection() {
  const { language } = useI18n()
  const { products } = landingContent(language)
  const [open, setOpen] = useState<ProductId | null>(null)

  const rows = ORDER.map((id) => products.rows.find((row) => row.id === id)).filter(
    (row): row is ProductRow => Boolean(row),
  )

  return (
    <section className="products-section" id="products">
      <header className="section-head">
        <h2>{products.title}</h2>
        <p>{products.subtitle}</p>
      </header>

      <div className="product-stack">
        {rows.map((product) => (
          <ProductBlock
            key={product.id}
            product={product}
            columns={products.columns}
            onOpen={() => setOpen(product.id as ProductId)}
          />
        ))}
      </div>

      <p className="section-note">{products.note}</p>

      <ProductModal product={open} onClose={() => setOpen(null)} />
    </section>
  )
}

function ProductBlock({
  product,
  columns,
  onOpen,
}: {
  product: ProductRow
  columns: LandingContent['products']['columns']
  onOpen: () => void
}) {
  const Icon = icons[product.id]
  const facts: [string, string][] = [
    [columns.term, product.term],
    [columns.liquidity, product.liquidity],
    [columns.min, product.min],
    [columns.fee, product.fee],
    [columns.risk, product.risk],
  ]

  return (
    <article className={`product-block-card product-${product.id}`}>
      <div className="product-side">
        <span className="product-side-icon">
          <Icon strokeWidth={1.7} />
        </span>
        <h3>{product.name}</h3>
        <p className="product-side-rate">
          <b>{product.rate}</b>
          <span>{product.rateNote}</span>
        </p>
      </div>

      <div className="product-main">
        <p className="product-lead">{product.tagline}</p>
        <p className="product-proof">{proof[product.id as ProductId]}</p>

        <dl className="product-facts-row">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="product-actions">
          <button type="button" className="product-more" onClick={onOpen}>
            {columns.more}
            <ArrowRight size={15} />
          </button>
          <a className="product-cta" href={onboardingUrl()}>
            {columns.open}
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </article>
  )
}
