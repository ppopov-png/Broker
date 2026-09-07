import { formatCurrency } from '../../../shared/lib/format'
import { networkById, type CustodyAccount } from '../../../shared/lib/custody'

const escape = (value: string) =>
  value.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] ?? char)

const date = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })

/**
 * Печатная форма договора. Текст собирается из данных заявки: реквизиты счёта
 * и заявленное происхождение средств — предмет договора, а не подпись под уже
 * выданным адресом. Поэтому раздел с адресом появляется только у подписанного
 * договора, а у неподписанного на его месте стоит объяснение.
 */
export function printCustodyContract(account: CustodyAccount, clientName: string, brokerAccount: string) {
  const network = networkById(account.application.networkId)
  const app = account.application

  const rows = [
    ['Клиент', clientName],
    ['Брокерский счёт', brokerAccount],
    ['Номер счёта хранения', account.id],
    ['Сеть перевода', network.label],
    ['Актив', app.asset],
    ['Минимальное пополнение', formatCurrency(network.minDeposit)],
    ['Подтверждений сети для зачисления', String(network.confirmations)],
    ['Планируемое первое размещение', formatCurrency(app.plannedAmount)],
    ['Ожидаемая частота операций', app.frequency],
    ['Цель открытия счёта', app.purpose],
    ['Источник средств', app.sourceOfFunds],
    ['Дата заявки', date(account.createdAt)],
    ['Дата подписания', account.signedAt ? date(account.signedAt) : 'не подписан'],
  ]

  const requisites = account.address
    ? `<h2>4. Реквизиты счёта</h2>
       <p>Средства принимаются исключительно по адресу, указанному ниже, в активе ${escape(app.asset)} и сети ${escape(network.label)}.</p>
       <p class="addr">${escape(account.address)}</p>
       <p class="muted">Перевод в другом активе или другой сети не может быть зачислен и не подлежит восстановлению.</p>`
    : `<h2>4. Реквизиты счёта</h2>
       <p class="muted">Адрес для пополнения присваивается Клиенту в момент подписания настоящего Договора и указывается в настоящем разделе. До подписания реквизиты не выдаются.</p>`

  const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${escape(account.contractNumber)}</title><style>
    body{font-family:Arial,Helvetica,sans-serif;color:#081b3a;padding:48px;line-height:1.55;max-width:900px}
    .brand{font-weight:700;letter-spacing:.08em}
    .muted{color:#6b7280}
    h1{font-size:22px;margin:14px 0 4px}
    h2{font-size:15px;margin:26px 0 8px}
    .row{display:flex;justify-content:space-between;gap:24px;border-bottom:1px solid #dbe2ea;padding:9px 0;font-size:14px}
    .row b{text-align:right}
    .addr{font-family:"Courier New",monospace;font-size:15px;word-break:break-all;background:#f6f8fb;padding:12px;border-radius:8px}
    .sign{display:flex;justify-content:space-between;gap:40px;margin-top:48px}
    .sign div{flex:1;border-top:1px solid #081b3a;padding-top:8px;font-size:13px}
    @media print{@page{size:A4;margin:18mm}body{padding:0}}
  </style></head><body>
    <div class="brand">TRIGONUM BROKER</div>
    <p class="muted">Договор об открытии счёта хранения и приёме цифровых активов</p>
    <h1>Договор № ${escape(account.contractNumber)}</h1>
    <p class="muted">от ${date(account.createdAt)}</p>

    <h2>1. Предмет договора</h2>
    <p>Брокер открывает Клиенту счёт хранения № ${escape(account.id)} и принимает на него цифровые активы Клиента в
    активе ${escape(app.asset)} по сети ${escape(network.label)}. Принятые средства учитываются на брокерском счёте
    Клиента ${escape(brokerAccount)} и могут быть размещены в продуктах Trigonum по отдельным договорам.</p>

    <h2>2. Параметры счёта</h2>
    ${rows.map(([label, value]) => `<div class="row"><span>${escape(label)}</span><b>${escape(value)}</b></div>`).join('')}

    <h2>3. Заявление о происхождении средств</h2>
    <p>Клиент заявляет, что средства, направляемые на счёт хранения, принадлежат ему на законном основании и получены
    из следующего источника: <b>${escape(app.sourceOfFunds)}</b>.</p>
    <p>${escape(app.sourceComment)}</p>
    <p class="muted">При расхождении фактических операций с заявленным источником Брокер вправе приостановить
    зачисление до предоставления подтверждающих документов.</p>

    ${requisites}

    <h2>5. Условия зачисления</h2>
    <p>Средства зачисляются после ${escape(String(network.confirmations))} подтверждений сети. Ориентировочное время
    зачисления — ${escape(network.arrival)}. Минимальная сумма одного перевода — ${escape(formatCurrency(network.minDeposit))}.</p>

    <div class="sign">
      <div>Брокер<br><span class="muted">Trigonum Broker</span></div>
      <div>Клиент<br><span class="muted">${escape(clientName)}</span></div>
    </div>

    <p class="muted" style="margin-top:32px">Документ сформирован в интерфейсе Trigonum Broker${
      account.signedAt ? ` и подписан ${date(account.signedAt)}` : ''
    }.</p>
    <script>window.onload=()=>window.print()</script>
  </body></html>`

  const win = window.open('', '_blank', 'noopener,noreferrer')
  if (!win) return
  win.document.open()
  win.document.write(html)
  win.document.close()
}
