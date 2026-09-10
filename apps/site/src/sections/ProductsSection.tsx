import { ArrowRight, ArrowUpRight, CalendarDays, ChartNoAxesCombined, Target } from 'lucide-react'
import { FEE_SCHEDULES, feeLabel } from '@trigonum/shared/fees'
import { useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent, type LandingContent, type ProductRow } from '../content/landingOfficial'
import { EARN_STATS, EVENTS_SUMMARY, STRATEGIES_SUMMARY } from '../content/products'
import { onboardingUrl } from '../lib/appLinks'
import { ProductModal, type ProductId } from './ProductModal'
import { ProductVisual } from './ProductVisual'
import { usd } from '../lib/format'

const icons = {
  earn: ChartNoAxesCombined,
  strategies: Target,
  events: CalendarDays,
} as const

const ORDER: ProductId[] = ['earn', 'strategies', 'events']

function productFee(id: ProductId): string {
  if (id === 'earn') return feeLabel(FEE_SCHEDULES.earn)
  if (id === 'events') return feeLabel(FEE_SCHEDULES.event)
  return feeLabel(FEE_SCHEDULES.balanced)
}

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
        <h2>{products.title}</h2>
        <p>{products.subtitle}</p>
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

function ProductBlock({ product, products, daysWord, onOpen }: { product: ProductRow; products: LandingContent['products']; daysWord: string; onOpen: () => void }) {
  const id = product.id as ProductId
  const Icon = icons[id]
  const { columns } = products
  const values = proofValues(id, daysWord)
  const visual = products.visual[product.id]

  const facts: [string, string][] = [
    [columns.term, product.term],
    [columns.liquidity, product.liquidity],
    [columns.min, product.min],
    [columns.fee, productFee(id)],
    [columns.risk, product.risk],
  ]

  return (
    <article className={`product-card product-${product.id}`}>
      <div className="product-body">
        <div className="product-head">
          <span className="product-icon"><Icon strokeWidth={1.7} /></span>
          <div className="product-title"><h3>{product.name}</h3><p>{product.tagline}</p></div>
          <p className="product-rate"><b>{product.rate}</b><span>{product.rateNote}</span></p>
        </div>

        <dl className="product-proof">
          {products.proof[product.id].map((label, index) => <div key={label}><dt>{values[index]}</dt><dd>{label}</dd></div>)}
        </dl>

        <dl className="product-facts">
          {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>

        <div className="product-actions">
          <button type="button" className="product-more" onClick={onOpen}>{columns.more}<ArrowRight size={15} /></button>
          <a className="product-cta" href={onboardingUrl()}>{columns.open}<ArrowUpRight size={15} /></a>
        </div>
      </div>

      <aside className="product-visual">
        <p className="product-visual-title">{visual.title}</p>
        <ProductVisual id={id} />
        <p className="product-visual-hint">{visual.hint}</p>
      </aside>
    </article>
  )
}
