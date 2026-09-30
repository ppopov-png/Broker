import { ArrowRight, Clock3, WalletCards } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent, type ProductRow } from '../content/landingOfficial'
import { onboardingUrl } from '../lib/appLinks'
import { ProductModal, type ProductId } from './ProductModal'

const ORDER: ProductId[] = ['earn', 'strategies', 'events']

const COPY = {
  ru: {
    eyebrow: 'ИНВЕСТИЦИОННЫЕ ПРОДУКТЫ',
    title: 'Выберите подходящий формат',
    subtitle: 'Несколько способов разместить капитал на крипторынке — с разным горизонтом, ликвидностью и уровнем риска.',
    tags: { earn: 'СТАБИЛЬНОСТЬ', strategies: 'РОСТ', events: 'ВОЗМОЖНОСТИ' },
    more: 'Подробнее',
    invest: 'Инвестировать',
  },
  en: {
    eyebrow: 'INVESTMENT PRODUCTS',
    title: 'Choose the right format',
    subtitle: 'Several ways to put capital to work in crypto, with different horizons, liquidity and risk levels.',
    tags: { earn: 'STABILITY', strategies: 'GROWTH', events: 'OPPORTUNITIES' },
    more: 'Details',
    invest: 'Invest',
  },
  kg: {
    eyebrow: 'ИНВЕСТИЦИЯЛЫК ПРОДУКТТАР',
    title: 'Ылайыктуу форматты тандаңыз',
    subtitle: 'Крипторынокто капиталды жайгаштыруунун бир нече жолу — мөөнөтү, ликвиддүүлүгү жана тобокелдиги ар башка.',
    tags: { earn: 'ТУРУКТУУЛУК', strategies: 'ӨСҮҮ', events: 'МҮМКҮНЧҮЛҮКТӨР' },
    more: 'Толук маалымат',
    invest: 'Инвестициялоо',
  },
} as const

export function ProductsSection() {
  const { language } = useI18n()
  const { products } = landingContent(language)
  const copy = COPY[language] ?? COPY.ru
  const [open, setOpen] = useState<ProductId | null>(null)

  const rows = ORDER.map((id) => products.rows.find((row) => row.id === id)).filter(
    (row): row is ProductRow => Boolean(row),
  )

  return (
    <section className="v2-products" id="products">
      <header className="v2-section-head">
        <span>{copy.eyebrow}</span>
        <h2>{copy.title}</h2>
        <p>{copy.subtitle}</p>
      </header>

      <div className="v2-product-grid">
        {rows.map((product) => {
          const id = product.id as ProductId
          return (
            <article className="v2-product-card" data-product={id} key={product.id}>
              <div className="v2-product-topline">
                <b><i />{product.name}</b>
                <span>{copy.tags[id]}</span>
              </div>
              <h3>{product.name}</h3>
              <p className="v2-product-tagline">{product.tagline}</p>

              <div className="v2-product-rate-row">
                <div>
                  <strong>{product.rate}</strong>
                  <small>{product.rateNote}</small>
                </div>
                <div className="v2-product-bars" aria-hidden="true">
                  <i /><i /><i /><i /><i /><i /><i />
                </div>
              </div>

              <dl className="v2-product-facts">
                <div><dt><Clock3 size={17} />{products.columns.term}</dt><dd>{product.term}</dd></div>
                <div><dt><WalletCards size={17} />{products.columns.liquidity}</dt><dd>{product.liquidity}</dd></div>
              </dl>

              <div className="v2-product-actions">
                <button type="button" onClick={() => setOpen(id)}>{copy.more}</button>
                <a href={onboardingUrl()}>{copy.invest}<ArrowRight size={16} /></a>
              </div>
            </article>
          )
        })}
      </div>

      <p className="v2-product-note">{products.note}</p>
      <ProductModal product={open} onClose={() => setOpen(null)} />
    </section>
  )
}
