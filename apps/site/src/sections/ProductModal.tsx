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
    lead: 'Ограниченные по сроку инвестиционные идеи, сформированные на основе аналитики TAIS и предварительно определённых параметров участия.',
  },
  strategies: {
    name: 'Strategies',
    lead: 'Управляемые стратегии с различными профилями риска, установленным сроком размещения и правилами расчёта финансового результата.',
  },
  earn: {
    name: 'Earn',
    lead: 'Размещение капитала по фиксированной ставке с установленным порядком начисления дохода и возврата основной суммы.',
  },
}

export function ProductModal({ product, onClose }: { product: ProductId | null; onClose: () => void }) {
  useEffect(() => {
    if (!product) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
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
      <div className="pm-window" role="dialog" aria-modal="true" aria-label={`Условия продукта ${meta.name}`}>
        <header className={`pm-head pm-head-${product}`}>
          <div>
            <p className="pm-eyebrow">Условия продукта</p>
            <h2>{meta.name}</h2>
            <p className="pm-lead">{meta.lead}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Закрыть"><X size={18} /></button>
        </header>

        <div className="pm-body">
          {product === 'events' && <EventsBody />}
          {product === 'strategies' && <StrategiesBody />}
          {product === 'earn' && <EarnBody />}
          <p className="pm-asof">Данные по состоянию на {DATA_AS_OF}. Показатели обновляются ежемесячно.</p>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function Metrics({ items }: { items: { value: string; label: string; note?: string; tone?: 'up' }[] }) {
  return <div className="pm-metrics">{items.map((item) => <article key={item.label}><p className={item.tone === 'up' ? 'pm-metric-value pm-up' : 'pm-metric-value'}>{item.value}</p><p className="pm-metric-label">{item.label}</p>{item.note && <p className="pm-metric-note">{item.note}</p>}</article>)}</div>
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return <section className="pm-section"><h3>{title}</h3>{subtitle && <p className="pm-subtitle">{subtitle}</p>}{children}</section>
}

function Steps({ items }: { items: { title: string; text: string }[] }) {
  return <ol className="pm-steps">{items.map((item, index) => <li key={item.title}><span>{index + 1}</span><div><h4>{item.title}</h4><p>{item.text}</p></div></li>)}</ol>
}

function EventsBody() {
  return (
    <>
      <Section title="Исторические результаты закрытых сделок" subtitle="Отображаются все завершённые операции Events за рассматриваемый период.">
        <Metrics items={[
          { value: `${EVENTS_SUMMARY.profitable} из ${EVENTS_SUMMARY.total}`, label: 'Прибыльных сделок', note: `Средний срок — ${EVENTS_SUMMARY.averageDays} дней` },
          { value: usd(EVENTS_SUMMARY.netProfit), label: 'Чистый результат инвесторов', tone: 'up', note: 'После применимых комиссий' },
          { value: pct(EVENTS_SUMMARY.weightedResult), label: 'Средневзвешенный результат', note: 'Взвешено по объёму операций' },
          { value: usd(EVENTS_SUMMARY.volume), label: 'Совокупный объём', note: `${EVENTS_SUMMARY.investors} участий` },
        ]} />
      </Section>

      <Section title="Реестр закрытых Events" subtitle="По каждой операции раскрываются инвестиционная гипотеза, срок, объём и фактический результат.">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Event</th><th>Позиция</th><th>Срок</th><th>Объём</th><th>Результат</th><th>Чистый результат</th></tr></thead>
            <tbody>
              {CLOSED_EVENTS.map((event) => {
                const net = eventNetProfit(event)
                return <tr key={event.id}><td><b>{event.title}</b><span>{event.category} · {event.closed}</span></td><td className="pm-position">{event.position}</td><td>{event.days} дн.</td><td>{usd(event.invested)}</td><td className={event.result >= 0 ? 'pm-up' : 'pm-down'}>{pct(event.result)}</td><td className={net >= 0 ? 'pm-up' : 'pm-down'}>{net >= 0 ? '+' : '−'}{usd(Math.abs(net))}</td></tr>
              })}
            </tbody>
          </table>
        </div>
        <p className="pm-note">Диапазон фактических результатов за рассматриваемый период: от {pct(EVENTS_SUMMARY.worstResult)} до {pct(EVENTS_SUMMARY.bestResult)}. Убыточные операции включены в статистику наравне с прибыльными.</p>
      </Section>

      <Section title="Порядок формирования Event">
        <Steps items={[
          { title: 'Аналитический сигнал TAIS', text: 'Система выявляет отклонения и изменения в рыночных данных, позиционировании и потоках капитала.' },
          { title: 'Проверка инвестиционной гипотезы', text: 'Аналитики оценивают исходные данные, условия реализации и основные факторы риска до открытия участия.' },
          { title: 'Формирование объёма', text: 'Максимальный объём определяется с учётом ликвидности инструмента и параметров риска конкретной операции.' },
          { title: 'Закрытие и расчёт результата', text: 'Позиция закрывается в соответствии с установленными условиями, после чего финансовый результат распределяется пропорционально долям участников.' },
        ]} />
        <p className="pm-note">В отдельных Events может участвовать собственный капитал Trigonum. Размер и условия участия определяются параметрами конкретной операции.</p>
        <p className="pm-note">Комиссия: {feeLabel(FEE_SCHEDULES.event)}.</p>
      </Section>
    </>
  )
}

function StrategiesBody() {
  return (
    <>
      <Section title="Показатели стратегий" subtitle="Совокупные данные по действующим стратегиям за последние 12 месяцев.">
        <Metrics items={[
          { value: usd(STRATEGIES_SUMMARY.aum), label: 'Активы под управлением', note: `${STRATEGIES_SUMMARY.investors} инвесторов` },
          { value: usd(STRATEGIES_SUMMARY.netProfit), label: 'Чистый результат инвесторов', tone: 'up', note: 'После применимых комиссий за 12 месяцев' },
          { value: pct(STRATEGIES_SUMMARY.weightedNet), label: 'Средневзвешенная доходность нетто', note: 'Взвешено по объёму капитала' },
          { value: usd(PLATFORM_SUMMARY.aum), label: 'Совокупные активы платформы', note: 'Earn и Strategies' },
        ]} />
      </Section>

      <Section title="Профили стратегий" subtitle="Потенциальная доходность и уровень риска различаются в зависимости от выбранного профиля.">
        <div className="pm-strategies">
          {STRATEGIES.map((strategy) => {
            const net = strategyNetReturn(strategy)
            const schedule = FEE_SCHEDULES[strategy.family]
            const max = Math.max(...strategy.quarters.map(Math.abs), 1)
            return (
              <article key={strategy.id} className={`pm-strategy pm-${strategy.family}`}>
                <p className="pm-profile">{strategy.profile}</p>
                <h4>{strategy.name}</h4>
                <p className="pm-since">История стратегии с {strategy.since}</p>
                <dl className="pm-facts">
                  <div><dt>Целевая доходность</dt><dd>{strategy.target}</dd></div>
                  <div><dt>Факт за 12 мес.</dt><dd>{pct(strategy.actual)}</dd></div>
                  <div><dt>Доходность нетто</dt><dd className="pm-up">{pct(net)}</dd></div>
                  <div><dt>Макс. просадка</dt><dd className="pm-down">{pct(-strategy.drawdown)}</dd></div>
                  <div><dt>Активы под управлением</dt><dd>{usd(strategy.aum)}</dd></div>
                  <div><dt>Инвесторы</dt><dd>{strategy.investors}</dd></div>
                </dl>
                <div className="pm-quarters" aria-label="Квартальная динамика за год">{strategy.quarters.map((value, index) => <span key={index} title={`Q${index + 1}: ${pct(value)}`}><i className={value >= 0 ? 'up' : 'down'} style={{ height: `${(Math.abs(value) / max) * 100}%` }} /><b>{pct(value)}</b></span>)}</div>
                <p className="pm-fee">{schedule.managementOnDeposit}% при пополнении · {schedule.resultShare}% от реализованной прибыли</p>
              </article>
            )
          })}
        </div>
        <p className="pm-note">Историческая доходность не является гарантией или прогнозом будущего результата. Показатели нетто рассчитаны с учётом применимых комиссий.</p>
      </Section>

      <Section title="Порядок работы стратегии">
        <Steps items={[
          { title: 'Выбор стратегии и срока', text: 'Клиент выбирает профиль риска и срок размещения. Основные условия фиксируются договором.' },
          { title: 'Размещение капитала', text: 'Средства учитываются в выбранной стратегии на предусмотренный договором срок.' },
          { title: 'Управление', text: 'Операции осуществляются в соответствии с правилами стратегии и установленными параметрами риска; динамика отражается в личном кабинете.' },
          { title: 'Расчёт финансового результата', text: 'По окончании срока рассчитывается фактический результат, применяются предусмотренные комиссии и определяется сумма к возврату или продлению.' },
        ]} />
      </Section>
    </>
  )
}

function EarnBody() {
  const rules: [string, string][] = [
    ['Пополнение', 'Дополнительное размещение возможно в соответствии с условиями действующего продукта и применимыми ограничениями.'],
    ['Начисление дохода', 'Доход начисляется ежедневно на сумму размещённого капитала и отражается в личном кабинете.'],
    ['Выплата дохода', 'Выплата осуществляется по запросу в предусмотренной продуктом периодичности либо реинвестируется в соответствии с выбранными настройками.'],
    ['Возврат основной суммы', 'Заявка может быть подана в установленном порядке; исполнение осуществляется в ближайшее предусмотренное окно вывода.'],
    ['Срок размещения', 'Продукт не предусматривает фиксированного минимального срока удержания, если иное не установлено договором.'],
  ]

  return (
    <>
      <Section title="Показатели Earn" subtitle="Исторические данные продукта с марта 2025 года.">
        <Metrics items={[
          { value: usd(EARN_STATS.aum), label: 'Активы под управлением', note: `${EARN_STATS.investors} инвесторов` },
          { value: usd(EARN_STATS.paidOut), label: 'Выплаченный доход', tone: 'up', note: 'За весь период работы продукта' },
          { value: `${EARN_STATS.rate}%`, label: 'Текущая ставка', note: 'В соответствии с действующими условиями продукта' },
          { value: `${EARN_STATS.withdrawDays} дня`, label: 'Средний срок исполнения вывода', note: `${EARN_STATS.monthsWithoutDelay} месяцев без задержек` },
        ]} />
      </Section>

      <Section title="Условия продукта" subtitle="Ставка и порядок расчётов определяются договором и действующими условиями продукта.">
        <dl className="pm-rules">{rules.map(([label, text]) => <div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl>
        <p className="pm-note">Комиссия: {feeLabel(FEE_SCHEDULES.earn)}.</p>
      </Section>

      <Section title="Существенные условия">
        <ul className="pm-caveats">
          <li><Check size={15} />Публикуемая ставка указывается с учётом применимой комиссии, если это предусмотрено условиями продукта.</li>
          <li><Check size={15} />Изменение условий не применяется ретроспективно к уже заключённому договору, если иное прямо не предусмотрено законом или договором.</li>
          <li><X size={15} />Ставка для новых размещений может быть изменена в соответствии с актуальными рыночными и договорными условиями.</li>
          <li><X size={15} />Условия Earn не означают отсутствия всех видов риска; перед размещением необходимо ознакомиться с договором и раскрытием рисков.</li>
        </ul>
      </Section>
    </>
  )
}
