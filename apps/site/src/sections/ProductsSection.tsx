import { useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent, type LandingContent, type ProductRow } from '../content/landingOfficial'
import { EARN_STATS, EVENTS_SUMMARY, STRATEGIES_SUMMARY } from '../content/products'
import { onboardingUrl } from '../lib/appLinks'
import { ProductModal, type ProductId } from './ProductModal'
import { usd } from '../lib/format'

const ORDER: ProductId[] = ['earn', 'strategies', 'events']

function proofValues(id: ProductId, daysWord: string): [string, string, string] {
  if (id === 'events') {
    return [
      `${EVENTS_SUMMARY.profitable} / ${EVENTS_SUMMARY.total}`,
      usd(EVENTS_SUMMARY.netProfit),
      `${EVENTS_SUMMARY.averageDays} ${daysWord}`,
    ]
  }
  if (id === 'strategies') {
    return [usd(STRATEGIES_SUMMARY.aum), usd(STRATEGIES_SUMMARY.netProfit), String(STRATEGIES_SUMMARY.investors)]
  }
  return [usd(EARN_STATS.aum), usd(EARN_STATS.paidOut), String(EARN_STATS.monthsWithoutDelay)]
}

export function ProductsSection() {
  const { language } = useI18n()
  const { products, charts } = landingContent(language)
  const [open, setOpen] = useState<ProductId | null>(null)

  const rows = ORDER.map((id) => products.rows.find((row) => row.id === id)).filter(
    (row): row is ProductRow => Boolean(row),
  )

  return (
    <section className="products-section" id="products">
      <header className="section-head">
        <h2>ИНВЕСТИЦИОННЫЕ ПРОДУКТЫ</h2>
      </header>

      <div className="product-stack">
        {rows.map((product) => (
          <ProductBlock
            key={product.id}
            product={product}
            products={products}
            daysWord={charts.events.days}
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
  products,
  daysWord,
  onOpen,
}: {
  product: ProductRow
  products: LandingContent['products']
  daysWord: string
  onOpen: () => void
}) {
  const id = product.id as ProductId
  const values = proofValues(id, daysWord)
  const badge = id === 'events' ? 'ОТ $5000' : 'ОТ $1000'

  return (
    <article className={`product-card product-${product.id}`}>
      <span className="product-glow" aria-hidden="true" />
      <div className="product-body">
        <div className="product-head">
          <div className="product-title">
            <div className="product-title-line">
              <h3>{product.name}</h3>
              <span className="product-badge">{badge}</span>
            </div>
            <p>{product.tagline}</p>
          </div>
        </div>

        <p className="product-rate">
          <b>{product.rate}</b>
          <span>{product.rateNote}</span>
        </p>

        <dl className="product-proof">
          {products.proof[product.id].map((label, index) => (
            <div key={label}>
              <dt>{values[index]}</dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>

        <div className="product-actions">
          <button type="button" className="product-more" onClick={onOpen}>Условия продукта</button>
          <a className="product-cta" href={onboardingUrl()}>Открыть счёт</a>
        </div>
      </div>
    </article>
  )
}
