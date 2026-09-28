import { useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'
import { BEST_EVENTS, DATA_AS_OF, eventNetProfit, investorReturn, TOP_INVESTORS } from '../content/products'
import { usd, pct } from '../lib/format'

export function ResultsSection() {
  const { language } = useI18n()
  const { results } = landingContent(language)
  const [investorSlide, setInvestorSlide] = useState(0)
  const investorTrack = useRef<HTMLDivElement>(null)
  const goInvestor = (index: number) => {
    const track = investorTrack.current
    if (!track) return
    const card = track.children[index] as HTMLElement | undefined
    card?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
    setInvestorSlide(index)
  }
  const syncInvestorSlide = () => {
    const track = investorTrack.current
    if (!track) return
    const cards = Array.from(track.children) as HTMLElement[]
    if (!cards.length) return
    const x = track.scrollLeft
    let best = 0
    let distance = Infinity
    cards.forEach((card, index) => {
      const d = Math.abs(card.offsetLeft - track.offsetLeft - x)
      if (d < distance) { distance = d; best = index }
    })
    setInvestorSlide(best)
  }

  return (
    <section className="results-section history-section" id="results">
      <header className="section-head history-head">
        <h2>ДАННЫЕ СЧЕТОВ ЗА 12 МЕСЯЦЕВ</h2>
        <p>В разделе представлены обезличенные данные по счетам и завершённым операциям за год. Финансовый результат указан после применимых комиссий.</p>
      </header>

      <div className="history-mobile-carousel">
        <div className="history-mobile-track" ref={investorTrack} onScroll={syncInvestorSlide}>
          {TOP_INVESTORS.map((investor, index) => (
            <article className="history-mobile-card" key={investor.alias}>
              <header>
                <span className="history-mobile-rank">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{investor.alias}</h3>
                  <p>{results.columns.since} {investor.since}</p>
                </div>
              </header>
              <dl>
                <div><dt>Чистый результат</dt><dd className="positive">+{usd(investor.profit)} ({pct(investorReturn(investor))})</dd></div>
                <div><dt>Средний капитал</dt><dd>{usd(investor.capital)}</dd></div>
                <div><dt>Уровень</dt><dd>{investor.tier}</dd></div>
                <div><dt>Продукты</dt><dd>{investor.mix}</dd></div>
              </dl>
            </article>
          ))}
        </div>
        <div className="history-mobile-dots" aria-label="Счета инвесторов">
          {TOP_INVESTORS.map((investor, index) => <button key={investor.alias} className={index === investorSlide ? 'active' : ''} onClick={() => goInvestor(index)} aria-label={`Счёт ${index + 1}`} />)}
        </div>
      </div>

      <div className="history-table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th>Счёт</th>
              <th>Уровень</th>
              <th>Средний капитал</th>
              <th>Чистый результат</th>
              <th>Продукты</th>
            </tr>
          </thead>
          <tbody>
            {TOP_INVESTORS.map((investor, index) => (
              <tr key={investor.alias}>
                <th scope="row">
                  <span className="history-rank">{String(index + 1).padStart(2, '0')}</span>
                  <b>{investor.alias}</b>
                  <small>{results.columns.since} {investor.since}</small>
                </th>
                <td>{investor.tier}</td>
                <td>{usd(investor.capital)}</td>
                <td className="history-profit">
                  +{usd(investor.profit)}
                  <small>{pct(investorReturn(investor))}</small>
                </td>
                <td>{investor.mix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="realized-events">
        <div>
          <span>Реализованные сценарии</span>
          <h3>Завершённые сделки Events</h3>
        </div>
        <div className="realized-events-grid">
          {BEST_EVENTS.slice(0, 3).map((event) => (
            <article key={event.id}>
              <strong>{pct(event.result)}</strong>
              <h4>{event.title}</h4>
              <p>{event.position} · {event.days} дней · {event.investors} участников</p>
              <b>+{usd(eventNetProfit(event))}</b>
            </article>
          ))}
        </div>
      </section>

      <p className="results-disclaimer">Исторические показатели приведены исключительно в информационных целях и не являются гарантией либо прогнозом будущих результатов. · {DATA_AS_OF}</p>
    </section>
  )
}
