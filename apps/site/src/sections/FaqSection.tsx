import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'

export function FaqSection() {
  const { language } = useI18n()
  const { faq } = landingContent(language)
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="faq-section" id="faq">
      <header className="section-head"><h2>{faq.title}</h2></header>
      <div className="faq-list">
        {faq.rows.map((row, index) => {
          const expanded = index === openIndex
          return (
            <article key={row.question} className={expanded ? 'faq-item open' : 'faq-item'}>
              <button type="button" aria-expanded={expanded} onClick={() => setOpenIndex(expanded ? -1 : index)}>
                <span>{row.question}</span><ChevronDown size={17} />
              </button>
              {expanded && <p>{row.answer}</p>}
            </article>
          )
        })}
      </div>
    </section>
  )
}
