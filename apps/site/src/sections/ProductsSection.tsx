import { ArrowUpRight, CalendarDays, ChartNoAxesCombined, Target } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'

export function ProductsSection() {
  const { t } = useI18n()
  const [hovered, setHovered] = useState<string | null>(null)
  const products = [
    {
      id: 'earn',
      tone: 'earn',
      icon: ChartNoAxesCombined,
      name: 'EARN',
      description: t('product.earnText'),
      rate: '~7%',
      rateText: t('product.earnRate'),
      label: t('product.earnRisk'),
      back: t('product.earnBack'),
    },
    {
      id: 'strategies',
      tone: 'strategies',
      icon: Target,
      name: 'STRATEGIES',
      description: t('product.strategiesText'),
      rate: '1%–15%',
      rateText: t('product.strategiesRate'),
      label: t('product.strategiesRisk'),
      back: t('product.strategiesBack'),
    },
    {
      id: 'events',
      tone: 'events',
      icon: CalendarDays,
      name: 'EVENTS',
      description: t('product.eventsText'),
      rate: 'до 20%+',
      rateText: t('product.eventsRate'),
      label: t('product.eventsRisk'),
      back: t('product.eventsBack'),
    },
  ]

  return (
    <section className="products" id="products">
      <div className="section-title"><span /><h2>{t('products.title')}</h2><span /></div>
      <div className="product-grid">
        {products.map(({ id, tone, icon: Icon, name, description, rate, rateText, label, back }) => (
          <div
            className={`product-card-shell ${tone} ${hovered === id ? 'is-flipped' : ''}`}
            key={id}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered((current) => current === id ? null : current)}
          >
            <div className="product-card-inner">
              <article className="product-card product-card-front">
                <span className="product-rule" />
                <div className="product-top">
                  <div className="product-icon"><Icon strokeWidth={1.6} /></div>
                  <div><h3>{name}</h3><p>{description}</p></div>
                </div>
                <div className="product-bottom">
                  <div><strong>{rate}</strong><span>{rateText}</span></div>
                  <span className="product-risk">{label}<ArrowUpRight size={18} /></span>
                </div>
              </article>

              <article className="product-card product-card-back">
                <span className="product-rule" />
                <div>
                  <h3>{name}</h3>
                  <p>{back}</p>
                </div>
                <a href={`#${id}`}>{t('product.more')}<ArrowUpRight size={18} /></a>
              </article>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
