import { Trophy } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landing'
import { BEST_EVENTS, DATA_AS_OF, eventNetProfit, investorReturn, TOP_INVESTORS } from '../content/products'
import { usd, pct } from '../lib/format'

/**
 * Витрина результатов. Средние по платформе не убеждают: человек примеряет на
 * себя конкретный счёт. Поэтому здесь обезличенные, но живые строки — и рядом
 * прямая оговорка про убыточные сделки, иначе блок читается как реклама.
 */
export function ResultsSection() {
  const { language } = useI18n()
  const { results } = landingContent(language)

  return (
    <section className="results-section" id="results">
      <header className="section-head">
        <h2>
          <Trophy size={20} /> {results.title}
        </h2>
        <p>{results.subtitle}</p>
      </header>

      <div className="results-grid">
        <article className="results-card">
          <h3>{results.investorsTitle}</h3>
          <p className="results-note">{results.investorsNote}</p>
          <div className="results-table-wrap">
            <table className="results-table">
              <thead>
                <tr>
                  <th>{results.columns.investor}</th>
                  <th>{results.columns.tier}</th>
                  <th>{results.columns.capital}</th>
                  <th>{results.columns.profit}</th>
                  <th>{results.columns.mix}</th>
                </tr>
              </thead>
              <tbody>
                {TOP_INVESTORS.map((investor, index) => (
                  <tr key={investor.alias}>
                    <th scope="row">
                      <span className="results-rank">{index + 1}</span>
                      {investor.alias}
                      <small>
                        {results.columns.since} {investor.since}
                      </small>
                    </th>
                    <td>{investor.tier}</td>
                    <td>{usd(investor.capital)}</td>
                    <td className="results-profit">
                      +{usd(investor.profit)}
                      <small>{pct(investorReturn(investor))}</small>
                    </td>
                    <td className="results-mix">{investor.mix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="results-card">
          <h3>{results.eventsTitle}</h3>
          <p className="results-note">{results.eventsNote}</p>
          <ul className="results-events">
            {BEST_EVENTS.map((event) => (
              <li key={event.id}>
                <div className="results-event-head">
                  <b>{event.title}</b>
                  <span className="results-event-result">{pct(event.result)}</span>
                </div>
                <p>{event.thesis}</p>
                <dl>
                  <div>
                    <dt>{event.position}</dt>
                    <dd>{event.days} {results.eventLabels.days}</dd>
                  </div>
                  <div>
                    <dt>{event.investors} {results.eventLabels.investors}</dt>
                    <dd>{usd(event.invested)}</dd>
                  </div>
                  <div>
                    <dt>{results.eventLabels.kept}</dt>
                    <dd className="results-profit">+{usd(eventNetProfit(event))}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <p className="results-disclaimer">
        {results.note} · {DATA_AS_OF}
      </p>
    </section>
  )
}
