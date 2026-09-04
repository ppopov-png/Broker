import { Download, FileText } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useBrokerAccount } from '../../../shared/lib/AccountContext'
import { formatCurrency } from '../../../shared/lib/format'

type Contract = {
  id: string
  productId?: string
  productName: string
  amount: number
  rate: string
  payoutPeriod?: string
  reinvest?: boolean
  income?: number
  incomeLabel?: string
  termMonths: number
  opened: string
  ends: string | null
  status: string
  guaranteed: boolean
}

type ArchivedContract = {
  id: string
  productName: string
  amount: number
  opened: string
  closed: string
  result: number
  rate: string
}

const STORAGE_KEY = 'trigonum-broker-invest-contracts-v1'

const INITIAL_CONTRACTS: Contract[] = [
  { id: 'CTR-2451', productId: 'earn', productName: 'Earn', amount: 14_000, rate: '~7% годовых', payoutPeriod: 'раз в месяц', reinvest: false, income: 5_120, incomeLabel: 'Начислено', termMonths: 12, opened: '2026-01-15', ends: '2027-01-15', status: 'Активен', guaranteed: true },
  { id: 'CTR-2478', productId: 'strategy-balanced-growth', productName: 'Strategy «Balanced Growth»', amount: 12_000, rate: 'целевая 10–14%', payoutPeriod: 'раз в квартал', reinvest: false, income: 1_180, incomeLabel: 'Результат периода', termMonths: 6, opened: '2026-05-12', ends: '2026-11-12', status: 'Активен', guaranteed: false },
  { id: 'CTR-2490', productId: 'strategy-alpha-momentum', productName: 'Strategy «Alpha Momentum»', amount: 5_000, rate: 'целевая 15–20%', payoutPeriod: 'раз в полгода', reinvest: true, income: 640, incomeLabel: 'Результат периода', termMonths: 12, opened: '2025-12-01', ends: '2026-12-01', status: 'Активен', guaranteed: false },
]

const ARCHIVE: ArchivedContract[] = [
  { id: 'CTR-2312', productName: 'Earn', amount: 8_000, opened: '2025-03-10', closed: '2026-03-10', result: 560, rate: '~7% годовых' },
  { id: 'CTR-2288', productName: 'Strategy «Balanced Growth»', amount: 15_000, opened: '2025-01-20', closed: '2025-07-20', result: 1_720, rate: 'факт 11.5%' },
  { id: 'CTR-2204', productName: 'Strategy «Alpha Momentum»', amount: 10_000, opened: '2024-09-05', closed: '2025-09-05', result: 1_840, rate: 'факт 18.4%' },
  { id: 'CTR-2150', productName: 'Earn', amount: 5_000, opened: '2024-06-01', closed: '2025-06-01', result: 350, rate: '~7% годовых' },
]

const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']

function loadContracts(): Contract[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : INITIAL_CONTRACTS
  } catch {
    return INITIAL_CONTRACTS
  }
}

function human(iso: string) {
  const d = new Date(`${iso}T00:00:00`)
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}`
}

function short(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function months(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} месяц`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} месяца`
  return `${n} месяцев`
}

function printContract(contract: Contract | ArchivedContract, accountName: string, accountNumber: string) {
  const archived = 'closed' in contract
  const end = archived ? contract.closed : contract.ends
  const scheme = archived ? 'Договор завершён' : contract.reinvest ? 'Реинвестирование дохода' : `Выплаты ${contract.payoutPeriod ?? 'по графику'}`
  const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${contract.id}</title><style>body{font-family:Arial,sans-serif;color:#25254f;padding:48px;line-height:1.5}h1{font-size:24px}.brand{font-weight:700;letter-spacing:.08em}.muted{color:#71719b}.row{display:flex;justify-content:space-between;gap:24px;border-bottom:1px solid #e4e4f0;padding:10px 0}.row b{text-align:right}@media print{@page{size:A4;margin:18mm}}</style></head><body><div class="brand">TRIGONUM BROKER</div><p class="muted">Инвестиционный договор</p><h1>Договор № ${contract.id}</h1><p>${contract.productName}</p><div class="row"><span>Клиент</span><b>${accountName}</b></div><div class="row"><span>Счёт</span><b>${accountNumber}</b></div><div class="row"><span>Сумма</span><b>${formatCurrency(contract.amount)}</b></div><div class="row"><span>Условия доходности</span><b>${contract.rate}</b></div><div class="row"><span>Открыт</span><b>${human(contract.opened)}</b></div><div class="row"><span>${archived ? 'Завершён' : 'Окончание'}</span><b>${end ? human(end) : '—'}</b></div><div class="row"><span>Схема</span><b>${scheme}</b></div>${archived ? `<div class="row"><span>Итоговый результат</span><b>+${formatCurrency(contract.result)}</b></div>` : ''}<p class="muted" style="margin-top:40px">Документ сформирован в интерфейсе Trigonum Broker.</p><script>window.onload=()=>window.print()</script></body></html>`
  const win = window.open('', '_blank', 'noopener,noreferrer')
  if (!win) return
  win.document.open()
  win.document.write(html)
  win.document.close()
}

export function DocumentsPage() {
  const { activeAccount } = useBrokerAccount()
  const [contracts, setContracts] = useState<Contract[]>(loadContracts)

  useEffect(() => {
    const sync = () => setContracts(loadContracts())
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('focus', sync) }
  }, [])

  const activeTotal = useMemo(() => contracts.reduce((sum, contract) => sum + contract.amount, 0), [contracts])
  const archiveIncome = ARCHIVE.reduce((sum, contract) => sum + contract.result, 0)

  return <div className="pb-10"><header className="mb-5"><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#5a5ac4]">Личный счёт · {activeAccount.accountNumber}</p><h1 className="mt-2.5 text-[28px] font-bold tracking-[-.01em] text-[#25254f]">Документы</h1><p className="mt-2 max-w-[620px] text-sm leading-[1.55] text-[#71719b]">Действующие и завершённые договоры с Trigonum. Каждый документ доступен для скачивания.</p></header><div className="flex flex-col gap-5"><section className="rounded-[18px] border border-[#e4e4f0] bg-white px-6 py-5 shadow-[0_8px_30px_rgb(8_27_58/8%)]"><div className="flex flex-wrap items-baseline justify-between gap-3"><div><h2 className="text-[15px] font-semibold text-[#25254f]">Действующие договоры</h2><p className="mt-1 text-xs text-[#71719b]">{contracts.length} договора · вложено {formatCurrency(activeTotal)}</p></div><span className="text-[13px] font-bold tabular-nums text-[#25254f]">{formatCurrency(activeTotal)}</span></div><div className="mt-4 flex flex-col gap-2.5">{contracts.map((contract) => <div key={contract.id} className="grid items-center gap-3.5 rounded-xl border border-[#e4e4f0] px-4 py-3.5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"><div className="flex min-w-0 items-center gap-3"><span className={`grid size-[38px] shrink-0 place-items-center rounded-[10px] ${contract.guaranteed ? 'bg-[#e8f8ff] text-[#0b7fa6]' : 'bg-[#eeeef8] text-[#5a5ac4]'}`}><FileText size={18}/></span><div className="min-w-0"><p className="text-sm font-bold text-[#25254f]">{contract.productName} · № {contract.id}</p><p className="mt-0.5 text-[11px] text-[#71719b]">{contract.rate} · {contract.reinvest ? 'реинвестирование' : `выплаты ${contract.payoutPeriod ?? 'по графику'}`} · открыт {human(contract.opened)}</p></div></div><div><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">Сумма</p><p className="mt-1 text-sm font-bold tabular-nums text-[#25254f]">{formatCurrency(contract.amount)}</p></div><div><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">Срок</p><p className="mt-1 text-[13px] font-semibold text-[#25254f]">{months(contract.termMonths)}{contract.ends ? ` · до ${short(contract.ends)}` : ''}</p></div><div className="flex shrink-0 items-center gap-2"><span className="rounded-full bg-[#eef7f1] px-2.5 py-1.5 text-[11px] font-bold text-[#2e9e4f]">Действует</span><button type="button" onClick={() => printContract(contract, activeAccount.name, activeAccount.accountNumber)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e4e4f0] px-2.5 py-1.5 text-xs font-semibold text-[#5a5ac4]"><Download size={14}/>PDF</button></div></div>)}</div></section><section className="rounded-[18px] border border-[#e4e4f0] bg-white px-6 py-5 shadow-[0_8px_30px_rgb(8_27_58/8%)]"><div className="flex flex-wrap items-baseline justify-between gap-3"><div><h2 className="text-[15px] font-semibold text-[#25254f]">Завершённые договоры</h2><p className="mt-1 text-xs text-[#71719b]">{ARCHIVE.length} завершённых договора</p></div><span className="text-[13px] font-bold tabular-nums text-[#2e9e4f]">+{formatCurrency(archiveIncome)} итог</span></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] table-fixed border-collapse"><thead><tr className="text-left text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]"><th className="border-b border-[#e4e4f0] pb-2">Договор</th><th className="w-[150px] border-b border-[#e4e4f0] pb-2">Период</th><th className="w-[100px] border-b border-[#e4e4f0] pb-2">Сумма</th><th className="w-[100px] border-b border-[#e4e4f0] pb-2">Итог</th><th className="w-[92px] border-b border-[#e4e4f0] pb-2 text-right">Документ</th></tr></thead><tbody>{ARCHIVE.map((contract) => <tr key={contract.id} className="text-[13px]"><td className="border-b border-[#e4e4f0] py-3 pr-2"><span className="block font-semibold text-[#25254f]">{contract.productName} · № {contract.id}</span><span className="mt-0.5 block text-[11px] text-[#71719b]">{contract.rate}</span></td><td className="border-b border-[#e4e4f0] py-3 pr-2 whitespace-nowrap text-[#3a3a63]">{short(contract.opened)} – {short(contract.closed)}</td><td className="border-b border-[#e4e4f0] py-3 pr-2 whitespace-nowrap font-bold tabular-nums text-[#25254f]">{formatCurrency(contract.amount)}</td><td className="border-b border-[#e4e4f0] py-3 pr-2 whitespace-nowrap font-bold tabular-nums text-[#2e9e4f]">+{formatCurrency(contract.result)}</td><td className="border-b border-[#e4e4f0] py-3 text-right"><button type="button" onClick={() => printContract(contract, activeAccount.name, activeAccount.accountNumber)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e4e4f0] px-2.5 py-1.5 text-xs font-semibold text-[#5a5ac4]"><Download size={14}/>PDF</button></td></tr>)}</tbody></table></div></section></div></div>
}
