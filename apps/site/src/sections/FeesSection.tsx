import { FEE_SCHEDULES } from '@trigonum/shared/fees'

const rows = [
  { name: 'Earn', text: 'Консервативные стратегии с регулярным доходом.', management: FEE_SCHEDULES.earn.managementOnDeposit, result: FEE_SCHEDULES.earn.resultShare },
  { name: 'Strategies', text: 'Сбалансированные стратегии для роста капитала.', management: FEE_SCHEDULES.balanced.managementOnDeposit, result: FEE_SCHEDULES.balanced.resultShare },
  { name: 'Events', text: 'Событийные инвестиционные идеи с ограниченным сроком.', management: FEE_SCHEDULES.event.managementOnDeposit, result: FEE_SCHEDULES.event.resultShare },
]

export function FeesSection() {
  return (
    <section className="conditions-section" id="fees">
      <div className="conditions-art" aria-hidden="true">
        <span className="conditions-orbit conditions-orbit-a" />
        <span className="conditions-orbit conditions-orbit-b" />
        <span className="conditions-core">2%</span>
      </div>

      <div className="conditions-content">
        <header>
          <h2>Условия видны до старта</h2>
          <p>Структура комиссий раскрывается до размещения капитала и зависит от выбранного продукта.</p>
        </header>

        <div className="conditions-management">
          <strong>2%</strong>
          <span>КОМИССИЯ ЗА УПРАВЛЕНИЕ<br />РАЗОВО ПРИ ПОПОЛНЕНИИ</span>
        </div>

        <div className="conditions-list">
          {rows.map((row) => (
            <article key={row.name}>
              <div className="conditions-product"><h3>{row.name}</h3><p>{row.text}</p></div>
              <dl>
                <div><dt>Управление</dt><dd>{row.management}%<small>При пополнении</small></dd></div>
                <div><dt>Результат</dt><dd>{row.result}%<small>{row.result === 0 ? 'Не взимается' : 'От реализованной прибыли'}</small></dd></div>
              </dl>
            </article>
          ))}
        </div>

        <p className="conditions-note">Дополнительные комиссии отсутствуют: за ввод и вывод средств, за неактивность счёта, с нереализованного результата, сверх раскрытых условий исполнения.</p>
      </div>
    </section>
  )
}
