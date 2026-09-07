import { ArrowUpRight, CalendarDays, ChartNoAxesCombined, Target } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent, type LandingContent, type ProductRow } from '../content/landing'
import { onboardingUrl } from '../lib/appLinks'

const icons = {
  earn: ChartNoAxesCombined,
  strategies: Target,
  events: CalendarDays,
} as const

/**
 * Карточка продукта даёт параметры, которые человек ищет первыми:
 * ликвидность и минимум важнее ставки — он считает, когда сможет вернуть
 * деньги, а не только сколько заработает.
 */
export function ProductsSection() {
  const { language } = useI18n()
  const { products } = landingContent(language)

  return (
    <section className="products-section" id="products">
      <header className="section-head">
        <h2>{products.title}</h2>
        <p>{products.subtitle}</p>
      </header>

      <div className="product-grid">
        {products.rows.map((product) => (
          <ProductCard key={product.id} product={product} columns={products.columns} />
        ))}
      </div>

      <p className="section-note">{products.note}</p>
    </section>
  )
}

function ProductCard({ product, columns }: { product: ProductRow; columns: LandingContent['products']['columns'] }) {
  const Icon = icons[product.id]
  const rows: [string, string][] = [
    [columns.term, product.term],
    [columns.liquidity, product.liquidity],
    [columns.min, product.min],
    [columns.fee, product.fee],
    [columns.risk, product.risk],
  ]

  return (
    <article className={`product-card product-${product.id}`}>
      <div className="product-card-head">
        <Icon strokeWidth={1.7} />
        <h3>{product.name}</h3>
      </div>
      <p className="product-tagline">{product.tagline}</p>

      <div className="product-rate">
        <b>{product.rate}</b>
        <span>{product.rateNote}</span>
      </div>

      <dl className="product-facts">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <a className="product-cta" href={onboardingUrl()}>
        {columns.open}
        <ArrowUpRight size={15} />
      </a>
    </article>
  )
}
