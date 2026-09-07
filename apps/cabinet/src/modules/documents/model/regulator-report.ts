import { formatCurrency } from '../../../shared/lib/format'

/**
 * Отчёт для регулятора. Два режима — Кыргызстан и Россия: состав сведений,
 * периодичность и валюта представления различаются, поэтому это не один
 * документ с переключателем страны в шапке, а две разные формы.
 */
export type Regulator = 'kg' | 'ru'

export interface RegulatorProfile {
  id: Regulator
  country: string
  authority: string
  /** Валюта, в которой регулятор ожидает суммы. */
  currency: string
  /** Курс к доллару для представления. В проде — курс на отчётную дату. */
  rate: number
  period: 'квартал' | 'год'
  label: string
  /** Разделы, обязательные именно для этого регулятора. */
  sections: string[]
  note: string
}

export const REGULATORS: Record<Regulator, RegulatorProfile> = {
  kg: {
    id: 'kg',
    country: 'Кыргызская Республика',
    authority: 'Служба регулирования и надзора за финансовым рынком',
    currency: 'KGS',
    rate: 87.4,
    period: 'квартал',
    label: 'Кыргызстан',
    sections: [
      'Сведения о клиенте и идентификации',
      'Договоры и размещённый капитал',
      'Операции по счёту за период',
      'Источники поступления средств',
      'Начисленный и выплаченный доход',
    ],
    note: 'Отчёт формируется поквартально. Суммы приводятся в сомах по курсу НБКР на отчётную дату.',
  },
  ru: {
    id: 'ru',
    country: 'Российская Федерация',
    authority: 'Федеральная налоговая служба',
    currency: 'RUB',
    rate: 92.6,
    period: 'год',
    label: 'Россия',
    sections: [
      'Сведения о налогоплательщике',
      'Счета за пределами Российской Федерации',
      'Движение средств по счёту за период',
      'Доход от источников за пределами РФ',
      'Подтверждающие документы',
    ],
    note: 'Отчёт о движении средств подаётся ежегодно до 1 июня года, следующего за отчётным. Суммы приводятся в рублях по курсу ЦБ РФ.',
  },
}

export interface ReportData {
  clientName: string
  accountNumber: string
  totalCapital: number
  invested: number
  accrued: number
  paidOut: number
  contracts: { id: string; productName: string; amount: number; opened: string; rate: string }[]
}

const escape = (value: string) =>
  value.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] ?? char)

export function printRegulatorReport(regulator: Regulator, data: ReportData) {
  const profile = REGULATORS[regulator]
  const today = new Date()
  const period =
    profile.period === 'год'
      ? `${today.getFullYear() - 1} год`
      : `${Math.floor(today.getMonth() / 3) + 1} квартал ${today.getFullYear()} года`

  // Суммы даём в двух валютах: регулятор ждёт национальную, клиент сверяет с кабинетом.
  const money = (value: number) =>
    `${formatCurrency(value)} · ${Math.round(value * profile.rate).toLocaleString('ru-RU')} ${profile.currency}`

  const rows: [string, string][] = [
    ['Клиент', data.clientName],
    ['Номер счёта', data.accountNumber],
    ['Отчётный период', period],
    ['Капитал на конец периода', money(data.totalCapital)],
    ['Размещено в продуктах', money(data.invested)],
    ['Доход начислен', money(data.accrued)],
    ['Доход выплачен', money(data.paidOut)],
    ['Курс представления', `1 USD = ${profile.rate} ${profile.currency}`],
  ]

  const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Отчёт ${escape(profile.label)}</title><style>
    body{font-family:Arial,Helvetica,sans-serif;color:#081b3a;padding:44px;line-height:1.5;max-width:940px}
    .brand{font-weight:700;letter-spacing:.08em}
    .muted{color:#6b7280}
    h1{font-size:20px;margin:14px 0 4px}
    h2{font-size:14px;margin:24px 0 8px}
    .row{display:flex;justify-content:space-between;gap:24px;border-bottom:1px solid #dbe2ea;padding:8px 0;font-size:13px}
    .row b{text-align:right}
    table{width:100%;border-collapse:collapse;font-size:13px;margin-top:6px}
    th,td{border-bottom:1px solid #dbe2ea;padding:8px 6px;text-align:left}
    th{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280}
    ol{padding-left:18px;font-size:13px}
    .sign{display:flex;justify-content:space-between;gap:40px;margin-top:44px}
    .sign div{flex:1;border-top:1px solid #081b3a;padding-top:8px;font-size:12px}
    @media print{@page{size:A4;margin:16mm}body{padding:0}}
  </style></head><body>
    <div class="brand">TRIGONUM BROKER</div>
    <p class="muted">${escape(profile.authority)} · ${escape(profile.country)}</p>
    <h1>Отчёт о состоянии счёта и движении средств</h1>
    <p class="muted">за ${escape(period)} · сформирован ${today.toLocaleDateString('ru-RU')}</p>

    <h2>1. Сводные сведения</h2>
    ${rows.map(([label, value]) => `<div class="row"><span>${escape(label)}</span><b>${escape(value)}</b></div>`).join('')}

    <h2>2. Договоры</h2>
    <table><thead><tr><th>Договор</th><th>Продукт</th><th>Открыт</th><th>Условия</th><th>Сумма</th></tr></thead><tbody>
      ${data.contracts
        .map(
          (contract) =>
            `<tr><td>№ ${escape(contract.id)}</td><td>${escape(contract.productName)}</td><td>${escape(
              contract.opened,
            )}</td><td>${escape(contract.rate)}</td><td>${escape(money(contract.amount))}</td></tr>`,
        )
        .join('')}
    </tbody></table>

    <h2>3. Состав отчёта</h2>
    <ol>${profile.sections.map((section) => `<li>${escape(section)}</li>`).join('')}</ol>
    <p class="muted">${escape(profile.note)}</p>

    <div class="sign">
      <div>Брокер<br><span class="muted">Trigonum Broker</span></div>
      <div>Клиент<br><span class="muted">${escape(data.clientName)}</span></div>
    </div>
    <script>window.onload=()=>window.print()</script>
  </body></html>`

  const win = window.open('', '_blank', 'noopener,noreferrer')
  if (!win) return
  win.document.open()
  win.document.write(html)
  win.document.close()
}
