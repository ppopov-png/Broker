import { Check, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FEE_SCHEDULES, feeLabel } from '@trigonum/shared/fees'
import {
  CLOSED_EVENTS,
  DATA_AS_OF,
  EARN_STATS,
  EVENTS_SUMMARY,
  eventNetProfit,
  PLATFORM_SUMMARY,
  STRATEGIES,
  STRATEGIES_SUMMARY,
  strategyNetReturn,
} from '../content/products'
import { usd, pct } from '../lib/format'

export type ProductId = 'earn' | 'strategies' | 'events'


const titles: Record<ProductId, { name: string; lead: string }> = {
  events: {
    name: 'Events',
    lead: 'Короткие сделки по сигналу TAIS: одна гипотеза, ограниченный объём, понятный момент завершения.',
  },
  strategies: {
    name: 'Strategies',
    lead: 'Управляемые стратегии трёх профилей риска с фиксированным сроком и результатом по итогам периода.',
  },
  earn: {
    name: 'Earn',
    lead: 'Бессрочное размещение под фиксированную ставку. Рыночный риск несёт брокер, а не инвестор.',
  },
}

export function ProductModal({ product, onClose }: { product: ProductId | null; onClose: () => void }) {
  useEffect(() => {
    if (!product) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    // Фон не должен прокручиваться под открытым окном.
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [product, onClose])

  if (!product) return null
  const meta = titles[product]

  return createPortal(
    <div className="pm-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="pm-window" role="dialog" aria-modal="true" aria-label={`Подробнее о ${meta.name}`}>
        <header className={`pm-head pm-head-${product}`}>
          <div>
            <p className="pm-eyebrow">Подробнее о продукте</p>
            <h2>{meta.name}</h2>
            <p className="pm-lead">{meta.lead}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Закрыть">
            <X size={18} />
          </button>
        </header>

        <div className="pm-body">
          {product === 'events' && <EventsBody />}
          {product === 'strategies' && <StrategiesBody />}
          {product === 'earn' && <EarnBody />}
          <p className="pm-asof">Данные на {DATA_AS_OF}. Обновляются ежемесячно.</p>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* --- Общие части ---------------------------------------------------------- */

function Metrics({ items }: { items: { value: string; label: string; note?: string; tone?: 'up' }[] }) {
  return (
    <div className="pm-metrics">
      {items.map((item) => (
        <article key={item.label}>
          <p className={item.tone === 'up' ? 'pm-metric-value pm-up' : 'pm-metric-value'}>{item.value}</p>
          <p className="pm-metric-label">{item.label}</p>
          {item.note && <p className="pm-metric-note">{item.note}</p>}
        </article>
      ))}
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="pm-section">
      <h3>{title}</h3>
      {subtitle && <p className="pm-subtitle">{subtitle}</p>}
      {children}
    </section>
  )
}

function Steps({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ol className="pm-steps">
      {items.map((item, index) => (
        <li key={item.title}>
          <span>{index + 1}</span>
          <div>
            <h4>{item.title}</h4>
            <p>{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/* --- Events --------------------------------------------------------------- */

function EventsBody() {
  return (
    <>
      <Section title="Результаты закрытых сделок" subtitle="Все завершённые Events, без отбора удачных.">
        <Metrics
          items={[
            { value: `${EVENTS_SUMMARY.profitable} из ${EVENTS_SUMMARY.total}`, label: 'Прибыльных сделок', note: `Средний срок ${EVENTS_SUMMARY.averageDays} дней` },
            { value: usd(EVENTS_SUMMARY.netProfit), label: 'Заработали инвесторы', tone: 'up', note: 'После комиссий, по всем сделкам' },
            { value: pct(EVENTS_SUMMARY.weightedResult), label: 'Средний результат', note: 'Средневзвешенный по объёму' },
            { value: usd(EVENTS_SUMMARY.volume), label: 'Совокупный объём', note: `${EVENTS_SUMMARY.investors} участий` },
          ]}
        />
      </Section>

      <Section title="База закрытых Events" subtitle="Каждая сделка с гипотезой, сроком и фактическим результатом.">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Позиция</th>
                <th>Срок</th>
                <th>Объём</th>
                <th>Результат</th>
                <th>Инвесторам</th>
              </tr>
            </thead>
            <tbody>
              {CLOSED_EVENTS.map((event) => {
                const net = eventNetProfit(event)
                return (
                  <tr key={event.id}>
                    <td>
                      <b>{event.title}</b>
                      <span>{event.category} · {event.closed}</span>
                    </td>
                    <td className="pm-position">{event.position}</td>
                    <td>{event.days} дн.</td>
                    <td>{usd(event.invested)}</td>
                    <td className={event.result >= 0 ? 'pm-up' : 'pm-down'}>{pct(event.result)}</td>
                    <td className={net >= 0 ? 'pm-up' : 'pm-down'}>
                      {net >= 0 ? '+' : '−'}{usd(Math.abs(net))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="pm-note">
          Лучший результат {pct(EVENTS_SUMMARY.bestResult)}, худший {pct(EVENTS_SUMMARY.worstResult)}. Убыточные
          сделки показаны наравне с прибыльными: подборка только удачных не даёт понять риск продукта.
        </p>
      </Section>

      <Section title="Как формируется Event">
        <Steps
          items={[
            { title: 'Сигнал TAIS', text: 'Система фиксирует аномалию: перекос позиционирования, смещение ликвидности, расхождение потоков капитала.' },
            { title: 'Гипотеза', text: 'Аналитики проверяют сигнал и публикуют тезис до открытия окна — а не после закрытия сделки.' },
            { title: 'Окно входа', text: 'Объём ограничен ёмкостью возможности. Набран — вход закрывается, даже если желающие остались.' },
            { title: 'Закрытие', text: 'Позиция закрывается по цели или стопу, результат распределяется пропорционально долям участников.' },
          ]}
        />
        <p className="pm-note">
          В каждой сделке участвует собственный капитал Trigonum: сторона, которая формирует гипотезу и определяет
          момент выхода, отвечает за неё деньгами.
        </p>
        <p className="pm-note">Комиссия: {feeLabel(FEE_SCHEDULES.event)}.</p>
      </Section>
    </>
  )
}

/* --- Strategies ----------------------------------------------------------- */

function StrategiesBody() {
  return (
    <>
      <Section title="Сколько денег в стратегиях" subtitle="Совокупно по трём стратегиям, за последние 12 месяцев.">
        <Metrics
          items={[
            { value: usd(STRATEGIES_SUMMARY.aum), label: 'Под управлением', note: `${STRATEGIES_SUMMARY.investors} инвесторов` },
            { value: usd(STRATEGIES_SUMMARY.netProfit), label: 'Заработали инвесторы', tone: 'up', note: 'После всех комиссий, за 12 месяцев' },
            { value: pct(STRATEGIES_SUMMARY.weightedNet), label: 'Средняя чистая доходность', note: 'Средневзвешенная по капиталу' },
            { value: usd(PLATFORM_SUMMARY.aum), label: 'Всего на платформе', note: 'Earn и стратегии вместе' },
          ]}
        />
      </Section>

      <Section title="Три стратегии" subtitle="Выше целевая доходность — выше просадка и выше доля брокера в результате.">
        <div className="pm-strategies">
          {STRATEGIES.map((strategy) => {
            const net = strategyNetReturn(strategy)
            const schedule = FEE_SCHEDULES[strategy.family]
            const max = Math.max(...strategy.quarters.map(Math.abs), 1)
            return (
              <article key={strategy.id} className={`pm-strategy pm-${strategy.family}`}>
                <p className="pm-profile">{strategy.profile}</p>
                <h4>{strategy.name}</h4>
                <p className="pm-since">Работает с {strategy.since}</p>

                <dl className="pm-facts">
                  <div><dt>Целевая</dt><dd>{strategy.target}</dd></div>
                  <div><dt>Факт за 12 мес.</dt><dd>{pct(strategy.actual)}</dd></div>
                  <div><dt>Чистыми инвестору</dt><dd className="pm-up">{pct(net)}</dd></div>
                  <div><dt>Макс. просадка</dt><dd className="pm-down">{pct(-strategy.drawdown)}</dd></div>
                  <div><dt>Под управлением</dt><dd>{usd(strategy.aum)}</dd></div>
                  <div><dt>Инвесторов</dt><dd>{strategy.investors}</dd></div>
                </dl>

                <div className="pm-quarters" aria-label="Квартальная динамика за год">
                  {strategy.quarters.map((value, index) => (
                    <span key={index} title={`Q${index + 1}: ${pct(value)}`}>
                      <i className={value >= 0 ? 'up' : 'down'} style={{ height: `${(Math.abs(value) / max) * 100}%` }} />
                      <b>{pct(value)}</b>
                    </span>
                  ))}
                </div>

                <p className="pm-fee">
                  {schedule.managementOnDeposit}% при пополнении · {schedule.resultShare}% от прибыли
                </p>
              </article>
            )
          })}
        </div>
        <p className="pm-note">
          Фактическая доходность за прошедшие 12 месяцев не является обещанием будущего результата. Чистая доходность
          рассчитана на сумме $100 000 при удержании весь период.
        </p>
      </Section>

      <Section title="Как это работает">
        <Steps
          items={[
            { title: 'Выбор стратегии и срока', text: 'Профиль риска и срок от 3 до 12 месяцев. Условия фиксируются договором.' },
            { title: 'Блокировка капитала', text: 'Средства залочены до конца срока: управляющий должен знать горизонт капитала. Пополнить можно в любой момент.' },
            { title: 'Управление', text: 'Капитал расторговывается по правилам стратегии, динамика видна в кабинете.' },
            { title: 'Фиксация результата', text: 'В конце срока удерживаются комиссии, тело и чистая прибыль возвращаются либо продлеваются.' },
          ]}
        />
      </Section>
    </>
  )
}

/* --- Earn ----------------------------------------------------------------- */

function EarnBody() {
  const rules: [string, string][] = [
    ['Пополнение', 'В любой момент, без ограничения по сумме и частоте. Ставка не меняется.'],
    ['Начисление', 'Каждый день на тело договора, видно в кабинете накопительным итогом.'],
    ['Выплата дохода', 'По запросу, не чаще раза в месяц. Либо реинвестирование по умолчанию.'],
    ['Возврат тела', 'Заявка в любой момент, исполнение в ближайшее еженедельное окно.'],
    ['Срок и штрафы', 'Договор бессрочный. Штрафа за выход нет, минимального периода удержания нет.'],
  ]

  return (
    <>
      <Section title="Сколько денег в Earn" subtitle="Продукт работает с марта 2025 года.">
        <Metrics
          items={[
            { value: usd(EARN_STATS.aum), label: 'Под управлением', note: `${EARN_STATS.investors} инвесторов` },
            { value: usd(EARN_STATS.paidOut), label: 'Выплачено дохода', tone: 'up', note: 'За всё время работы' },
            { value: `${EARN_STATS.rate}%`, label: 'Ставка сейчас', note: 'Чистая, комиссия уже учтена' },
            { value: `${EARN_STATS.withdrawDays} дня`, label: 'Среднее исполнение вывода', note: `${EARN_STATS.monthsWithoutDelay} месяцев без задержек` },
          ]}
        />
      </Section>

      <Section title="Как это работает" subtitle="Ставка зафиксирована договором и не зависит от результата брокера.">
        <dl className="pm-rules">
          {rules.map(([label, text]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
        <p className="pm-note">Комиссия: {feeLabel(FEE_SCHEDULES.earn)}.</p>
      </Section>

      <Section title="Что нужно понимать">
        <ul className="pm-caveats">
          <li><Check size={15} />Ставка публикуется чистой: 1% годовых за управление уже удержан.</li>
          <li><Check size={15} />Условия действующего договора не меняются задним числом.</li>
          <li><X size={15} />Ставка может быть пересмотрена — но только для новых размещений.</li>
          <li><X size={15} />Инвестор не участвует в результате брокера: ставка остаётся прежней.</li>
        </ul>
      </Section>
    </>
  )
}
