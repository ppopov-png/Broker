import { Check, X } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'

export function FeesSection() {
  const { language } = useI18n()
  const { fees } = landingContent(language)

  return (
    <section className="fees-section" id="fees">
      <header className="section-head"><h2>{fees.title}</h2><p>{fees.subtitle}</p></header>
      <div className="fees-layout">
        <div className="fees-table-wrap">
          <table className="fees-table">
            <thead><tr><th>{fees.columns.product}</th><th>{fees.columns.management}</th><th>{fees.columns.result}</th></tr></thead>
            <tbody>{fees.rows.map((row) => <tr key={row.product}><th scope="row">{row.product}</th><td>{row.management}</td><td>{row.result}</td></tr>)}</tbody>
          </table>
          <p className="section-note">{fees.note}</p>
        </div>
        <aside className="fees-never">
          <h3><Check size={16} />{fees.neverTitle}</h3>
          <ul>{fees.never.map((item) => <li key={item}><X size={14} />{item}</li>)}</ul>
        </aside>
      </div>
    </section>
  )
}
