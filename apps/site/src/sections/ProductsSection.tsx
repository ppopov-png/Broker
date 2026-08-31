import { ArrowUpRight, CalendarDays, ChartNoAxesCombined, Target } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'

export function ProductsSection() {
  const { t } = useI18n()
  const products = [
    { tone: 'blue', icon: ChartNoAxesCombined, name: 'EARN', description: t('product.earnText'), rate: '~7%', rateText: t('product.earnRate'), label: t('product.earnRisk') },
    { tone: 'cyan', icon: Target, name: 'STRATEGIES', description: t('product.strategiesText'), rate: '1%–15%', rateText: t('product.strategiesRate'), label: t('product.strategiesRisk') },
    { tone: 'green', icon: CalendarDays, name: 'EVENTS', description: t('product.eventsText'), rate: 'до 20%+', rateText: t('product.eventsRate'), label: t('product.eventsRisk') },
  ]

  return (
    <section className="products" id="products">
      <div className="section-title"><span /><h2>{t('products.title')}</h2><span /></div>
      <div className="product-grid">
        {products.map(({ tone, icon: Icon, name, description, rate, rateText, label }) => (
          <article className={`product-card ${tone}`} key={name}>
            <div className="product-top"><div className="product-icon"><Icon strokeWidth={1.65} /></div><div><h3>{name}</h3><p>{description}</p></div></div>
            <div className="product-bottom"><div><strong>{rate}</strong><span>{rateText}</span></div><a href={`#${name.toLowerCase()}`}>{label}<ArrowUpRight size={20} /></a></div>
          </article>
        ))}
      </div>
    </section>
  )
}
