import { ArrowUpRight, CalendarDays, ChartNoAxesCombined, Target } from 'lucide-react'

const products = [
  { tone: 'blue', icon: ChartNoAxesCombined, name: 'EARN', description: 'Стабильная доходность на капитал с высокой ликвидностью.', rate: '~7%', rateText: 'годовых целевая доходность', label: 'НИЗКИЙ РИСК' },
  { tone: 'cyan', icon: Target, name: 'STRATEGIES', description: 'Активно управляемые стратегии для различных рыночных условий.', rate: '1%–15%', rateText: 'целевая доходность', label: 'УМЕРЕННЫЙ РИСК' },
  { tone: 'green', icon: CalendarDays, name: 'EVENTS', description: 'Ограниченные по времени возможности с высоким потенциалом.', rate: 'до 20%+', rateText: 'целевая доходность', label: 'ВЫСОКИЙ ПОТЕНЦИАЛ' },
]

export function ProductsSection() {
  return (
    <section className="products" id="products">
      <div className="section-title"><span /><h2>НАШИ ПРОДУКТЫ</h2><span /></div>
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
