import { Check, CheckCircle2, LoaderCircle, X } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useBrokerAccount } from '../../../shared/lib/AccountContext'
import { CONTRACTS_STORAGE_KEY, defaultContracts } from '../../../shared/mock/contracts'
import { formatCurrency } from '../../../shared/lib/format'
import { useFunding } from '../../../shared/lib/FundingContext'

type Product = {
  id: string
  family: 'EARN' | 'STRATEGIES'
  category: 'conservative' | 'balanced' | 'aggressive'
  name: string
  rate: string
  rateNote: string
  guaranteed: boolean
  rateLow: number
  rateHigh: number
  risk: string
  description: string
  terms: number[]
  payout: string
  payoutMonths: number
  min: number
  topup: string
  tags: string[]
  headerBg: string
  accent: string
}

type Contract = {
  id: string
  productId: string
  productName: string
  amount: number
  rate: string
  payoutPeriod: string
  reinvest: boolean
  income: number
  incomeLabel: string
  termMonths: number
  opened: string
  ends: string | null
  status: string
  guaranteed: boolean
}

type Flow = { kind: 'invest'; productId: string; topupContractId?: string } | { kind: 'terms'; contractId: string } | null

type Step = 'form' | 'processing' | 'success'

const PRODUCTS: Product[] = [
  {
    id: 'earn', family: 'EARN', category: 'conservative', name: 'Earn', rate: '~7%', rateNote: 'годовых, фиксированная ставка', guaranteed: true, rateLow: 7, rateHigh: 7,
    risk: 'Низкий риск', description: 'Стабильная доходность без сложных решений: капитал работает, пока вы ждёте.', terms: [3, 6, 12], payout: 'раз в месяц', payoutMonths: 1, min: 1000, topup: 'в любой момент', tags: ['Срок 3–12 мес.', 'Начисление раз в месяц'],
    headerBg: 'linear-gradient(150deg,#12122e,var(--trigonum-ink) 60%,#0b7fa6)', accent: '#12ccff',
  },
  {
    id: 'strategy-balanced-growth', family: 'STRATEGIES', category: 'balanced', name: 'Balanced Growth', rate: '10–14%', rateNote: 'целевая доходность годовых', guaranteed: false, rateLow: 10, rateHigh: 14,
    risk: 'Умеренный риск', description: 'Сбалансированный рост: управляемая стратегия Trigonum с горизонтом от трёх месяцев.', terms: [3, 6, 12], payout: 'раз в квартал', payoutMonths: 3, min: 1000, topup: 'в любой момент', tags: ['Сбалансированный рост', 'Срок 3–12 мес.'],
    headerBg: 'linear-gradient(150deg,#12122e,var(--trigonum-ink) 60%,var(--trigonum-violet))', accent: 'var(--trigonum-violet)',
  },
  {
    id: 'strategy-alpha-momentum', family: 'STRATEGIES', category: 'aggressive', name: 'Alpha Momentum', rate: '15–20%', rateNote: 'целевая доходность годовых', guaranteed: false, rateLow: 15, rateHigh: 20,
    risk: 'Высокий риск', description: 'Агрессивный рост: активное управление с повышенной волатильностью результата.', terms: [3, 6, 12], payout: 'раз в полгода', payoutMonths: 6, min: 1000, topup: 'в любой момент', tags: ['Агрессивный рост', 'Срок 3–12 мес.'],
    headerBg: 'linear-gradient(150deg,#12122e,#3f3f8a 60%,#af47ff)', accent: '#af47ff',
  },
]



const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']

function loadContracts() {
  try {
    const raw = window.localStorage.getItem(CONTRACTS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Contract[]) : defaultContracts
  } catch {
    return defaultContracts
  }
}

function human(date: string) {
  const d = new Date(`${date}T00:00:00`)
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}`
}

function months(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} месяц`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} месяца`
  return `${n} месяцев`
}

function Modal({ eyebrow, title, onClose, children }: { eyebrow: string; title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const key = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', key) }
  }, [onClose])
  return <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[rgb(8_27_58/45%)] p-8 backdrop-blur-[2px]" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}><div className="my-auto max-h-[88vh] w-full max-w-[560px] overflow-auto rounded-[18px] bg-white shadow-[0_25px_50px_-12px_rgb(8_27_58/40%)]"><div className="relative overflow-hidden bg-[linear-gradient(160deg,var(--trigonum-ink)_0%,#161638_100%)] px-[22px] py-5 text-white"><div className="absolute -right-[60px] -top-20 size-60 rounded-full bg-[radial-gradient(circle,rgb(117_117_255/40%)_0%,transparent_66%)]" /><div className="relative flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--trigonum-violet)]">{eyebrow}</p><h2 className="mt-2 text-xl font-bold">{title}</h2></div><button type="button" onClick={onClose} className="rounded-lg border border-white/25 p-2"><X size={16} /></button></div></div><div className="px-[22px] py-5">{children}</div></div></div>
}

export function InvestPage() {
  const { activeAccount } = useBrokerAccount()
  const { getAccountState, reserveInvestment } = useFunding()
  const funding = getAccountState(activeAccount.id)
  const free = Math.max(0, funding.brokerBalance - funding.lockedEvents - funding.pendingSettlement)
  const [filter, setFilter] = useState<'all' | Product['category']>('all')
  const [contracts, setContracts] = useState<Contract[]>(loadContracts)
  const [flow, setFlow] = useState<Flow>(null)
  const [step, setStep] = useState<Step>('form')
  const [termIndex, setTermIndex] = useState(2)
  const [amount, setAmount] = useState(2000)
  const [reinvest, setReinvest] = useState(true)
  const [agree, setAgree] = useState(false)
  const [message, setMessage] = useState('')

  const selectedProduct = flow?.kind === 'invest' ? PRODUCTS.find((p) => p.id === flow.productId) ?? null : null
  const topupContract = flow?.kind === 'invest' && flow.topupContractId ? contracts.find((c) => c.id === flow.topupContractId) ?? null : null
  const termsContract = flow?.kind === 'terms' ? contracts.find((c) => c.id === flow.contractId) ?? null : null

  const invested = contracts.reduce((sum, contract) => sum + contract.amount, 0)
  const earnIncome = contracts.filter((c) => c.guaranteed).reduce((sum, c) => sum + c.income, 0)
  const stratIncome = contracts.filter((c) => !c.guaranteed).reduce((sum, c) => sum + c.income, 0)

  const filteredProducts = PRODUCTS.filter((product) => filter === 'all' || product.category === filter)

  const persistContracts = (next: Contract[]) => {
    setContracts(next)
    window.localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(next))
  }

  const openInvest = (product: Product) => {
    setFlow({ kind: 'invest', productId: product.id })
    setStep('form'); setTermIndex(product.terms.length - 1); setAmount(Math.max(product.min, Math.min(product.min * 2, free))); setReinvest(true); setAgree(false); setMessage('')
  }

  const openTopup = (contract: Contract) => {
    setFlow({ kind: 'invest', productId: contract.productId, topupContractId: contract.id })
    setStep('form'); setAmount(Math.max(1000, Math.min(2000, free))); setReinvest(contract.reinvest); setAgree(false); setMessage('')
  }

  const close = () => { setFlow(null); setStep('form'); setMessage(''); setAgree(false) }

  const form = useMemo(() => {
    if (!selectedProduct) return null
    const termMonths = topupContract ? topupContract.termMonths : selectedProduct.terms[termIndex] ?? selectedProduct.terms[0]
    const reinvestOn = topupContract ? topupContract.reinvest : reinvest
    const calc = (annualRate: number) => {
      const simple = amount * (annualRate / 100) * (termMonths / 12)
      const periods = Math.floor(termMonths / selectedProduct.payoutMonths)
      const periodRate = (annualRate / 100) * (selectedProduct.payoutMonths / 12)
      const rest = (termMonths - periods * selectedProduct.payoutMonths) / 12
      const grown = amount * Math.pow(1 + periodRate, periods) * (1 + (annualRate / 100) * rest)
      return { simple, compound: grown - amount }
    }
    const low = calc(selectedProduct.rateLow)
    const high = calc(selectedProduct.rateHigh)
    const simpleMid = (low.simple + high.simple) / 2
    const compoundMid = (low.compound + high.compound) / 2
    const maxIncome = Math.max(simpleMid, compoundMid, 1)
    const range = (a: number, b: number) => selectedProduct.guaranteed ? `+${formatCurrency(a)}` : `+${formatCurrency(a)} – ${formatCurrency(b)}`
    const firstPayoutDate = new Date(2026, 8, 4)
    firstPayoutDate.setMonth(firstPayoutDate.getMonth() + selectedProduct.payoutMonths)
    return { termMonths, reinvestOn, low, high, simpleMid, compoundMid, maxIncome, range, firstPayoutDate }
  }, [amount, reinvest, selectedProduct, termIndex, topupContract])

  const submit = () => {
    if (!selectedProduct || !form) return
    if (amount < selectedProduct.min) { setMessage(`Минимальная сумма по продукту — ${formatCurrency(selectedProduct.min)}.`); return }
    if (amount > free) { setMessage(`Свободный капитал — ${formatCurrency(free)}. Пополните счёт или уменьшите сумму.`); return }
    if (!agree) { setMessage('Подтвердите ознакомление с условиями договора.'); return }
    setStep('processing'); setMessage('')
    window.setTimeout(() => {
      reserveInvestment(activeAccount.id, amount)
      if (topupContract) {
        persistContracts(contracts.map((contract) => contract.id === topupContract.id ? { ...contract, amount: contract.amount + amount } : contract))
      } else {
        const nextId = `CTR-${2491 + contracts.filter((c) => Number(c.id.slice(4)) >= 2491).length}`
        const endsDate = new Date(2026, 8 + form.termMonths, 4)
        const ends = `${endsDate.getFullYear()}-${String(endsDate.getMonth() + 1).padStart(2, '0')}-${String(endsDate.getDate()).padStart(2, '0')}`
        const next: Contract = {
          id: nextId,
          productId: selectedProduct.id,
          productName: selectedProduct.family === 'EARN' ? selectedProduct.name : `Strategy «${selectedProduct.name}»`,
          amount,
          rate: selectedProduct.guaranteed ? `${selectedProduct.rate} годовых` : `целевая ${selectedProduct.rate}`,
          payoutPeriod: selectedProduct.payout,
          reinvest,
          income: 0,
          incomeLabel: selectedProduct.guaranteed ? 'Начислено' : 'Результат периода',
          termMonths: form.termMonths,
          opened: '2026-09-04',
          ends,
          status: 'Активен',
          guaranteed: selectedProduct.guaranteed,
        }
        persistContracts([next, ...contracts])
      }
      setStep('success')
    }, 1200)
  }

  return <div className="pb-10">
    <header className="mb-5 overflow-hidden rounded-[18px] shadow-[0_8px_30px_rgb(8_27_58/8%)]"><div className="h-[3px] bg-[linear-gradient(100deg,#92f222_0%,#12ccff_50%,#af47ff_100%)]" /><div className="relative overflow-hidden bg-[linear-gradient(160deg,var(--trigonum-ink)_0%,#161638_100%)] text-white"><svg viewBox="0 0 420 220" preserveAspectRatio="none" className="absolute right-0 top-0 h-full w-[46%] opacity-50"><path d="M40 220 L210 40" fill="none" stroke="rgb(255 255 255 / 14%)"/><path d="M210 40 L380 220" fill="none" stroke="rgb(255 255 255 / 14%)"/><path d="M210 40 L210 220" fill="none" stroke="rgb(255 255 255 / 14%)"/><circle cx="210" cy="40" r="3" fill="var(--trigonum-violet)"/></svg><div className="relative flex flex-wrap items-center justify-between gap-7 px-7 py-6"><div className="min-w-0 flex-1 basis-[380px]"><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#92f222]">Капитал · инвестиционные продукты</p><h1 className="mt-2.5 text-[38px] font-semibold leading-none tracking-[-.03em]">Инвестировать</h1><p className="mt-2.5 max-w-[520px] text-sm leading-[1.55] text-white/70">Earn с фиксированным начислением и стратегии под разный риск-профиль. Каждая инвестиция оформляется отдельным договором.</p></div><div className="shrink-0 rounded-xl border border-white/20 px-5 py-4"><p className="text-[10px] font-bold uppercase tracking-[.1em] text-white/60">Свободный капитал</p><p className="mt-2 text-[26px] font-bold tabular-nums text-[#92f222]">{formatCurrency(free)}</p><p className="mt-1.5 text-xs text-white/60">Личный счёт {activeAccount.accountNumber}</p></div></div></div></header>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Stat label="Вложено в продукты" value={formatCurrency(invested)} hint={`${contracts.length} активных договора`} /><Stat label="Начислено Earn" value={`+${formatCurrency(earnIncome)}`} hint="Гарантированная ставка, с начала года" color="var(--trigonum-success)" /><Stat label="Результат стратегий" value={`+${formatCurrency(stratIncome)}`} hint="За текущие периоды договоров" color="var(--trigonum-success)" /><Stat label="Ближайшая выплата" value={formatCurrency(640)} hint="Earn · 15 сентября" /></div>

    <section className="mt-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-[19px] font-bold text-[var(--trigonum-ink)]">Продукты</h2><p className="mt-1 text-sm text-[var(--trigonum-muted)]">Earn — фиксированное начисление. Стратегии — целевая доходность при контролируемом риске</p></div><div className="flex flex-wrap gap-2">{[
      ['all','Все продукты'],['conservative','Консервативные'],['balanced','Сбалансированные'],['aggressive','Агрессивные'],
    ].map(([id,label]) => <button key={id} type="button" onClick={() => setFilter(id as typeof filter)} className={`rounded-xl border px-3.5 py-2 text-[13px] font-semibold ${filter===id?'border-[var(--trigonum-ink)] bg-[var(--trigonum-ink)] text-white':'border-[var(--trigonum-border)] bg-white text-[var(--trigonum-text)]'}`}>{label}</button>)}</div></div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">{filteredProducts.map((product) => <article key={product.id} className="flex h-full flex-col overflow-hidden rounded-[18px] border border-[var(--trigonum-border)] bg-white shadow-[0_8px_30px_rgb(8_27_58/8%)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgb(8_27_58/12%)]"><div className="relative overflow-hidden px-5 py-[18px] text-white" style={{ background: product.headerBg }}><div className="absolute -right-10 -top-[60px] size-[200px] rounded-full opacity-50" style={{ background: `radial-gradient(circle,${product.accent} 0%,transparent 68%)` }} /><div className="relative flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-white/65">{product.family}</p><h3 className="mt-2 text-xl font-bold">{product.name}</h3></div><span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold">{product.risk}</span></div><div className="relative mt-3.5 flex items-baseline gap-2"><span className="text-[30px] font-semibold tracking-[-.03em]">{product.rate}</span><span className="text-xs text-white/70">{product.rateNote}</span></div></div><div className="flex flex-1 flex-col px-5 py-[18px]"><p className="text-sm leading-[1.5] text-[var(--trigonum-muted)]">{product.description}</p><div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-border)]"><Mini label="Срок" value={`${product.terms[0]}–${product.terms.at(-1)} мес.`} /><Mini label="Выплаты" value={`${product.payout} или в конце срока`} /><Mini label="Минимум" value={formatCurrency(product.min)} /><Mini label="Пополнение" value={product.topup} /></div><div className="my-3.5 flex flex-wrap gap-1.5">{product.tags.map((tag) => <span key={tag} className="rounded-lg border border-[var(--trigonum-border)] px-2.5 py-1 text-[11px] font-semibold text-[var(--trigonum-muted)]">{tag}</span>)}</div><button type="button" onClick={() => openInvest(product)} className="mt-auto w-full rounded-xl bg-[var(--trigonum-violet)] p-3 text-sm font-bold text-white">Инвестировать</button></div></article>)}</div>
    </section>

    <section className="mt-6 rounded-[18px] border border-[var(--trigonum-border)] bg-white px-6 py-5 shadow-[0_8px_30px_rgb(8_27_58/8%)]"><div className="flex items-baseline justify-between gap-3"><h2 className="text-[15px] font-semibold text-[var(--trigonum-ink)]">Мои договоры</h2><span className="text-[13px] font-bold tabular-nums text-[var(--trigonum-ink)]">{formatCurrency(invested)}</span></div><div className="mt-3.5 space-y-2.5">{contracts.map((contract) => <div key={contract.id} className="grid gap-3 rounded-xl border border-[var(--trigonum-border)] p-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-center"><div><p className="text-sm font-bold text-[var(--trigonum-ink)]">{contract.productName}</p><p className="mt-1 text-[11px] text-[var(--trigonum-muted)]">Договор № {contract.id} · {contract.rate} · до {contract.ends ? human(contract.ends) : 'бессрочно'}</p></div><div><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Вложено</p><p className="mt-1 text-sm font-bold tabular-nums text-[var(--trigonum-ink)]">{formatCurrency(contract.amount)}</p></div><div><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{contract.incomeLabel}</p><p className="mt-1 text-sm font-bold tabular-nums text-[var(--trigonum-success)]">+{formatCurrency(contract.income)}</p></div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#eef7f1] px-2.5 py-1 text-[11px] font-bold text-[var(--trigonum-success)]">{contract.status}</span><button type="button" onClick={() => openTopup(contract)} className="rounded-lg bg-[var(--trigonum-violet)] px-2.5 py-2 text-xs font-bold text-white">Долить</button><button type="button" onClick={() => setFlow({ kind:'terms', contractId: contract.id })} className="rounded-lg border border-[var(--trigonum-border)] px-2.5 py-2 text-xs font-semibold text-[var(--trigonum-violet)]">Договор</button></div></div>)}</div></section>

    {flow && <Modal eyebrow={flow.kind === 'terms' ? 'Условия договора' : selectedProduct?.family === 'EARN' ? 'Earn · фиксированная ставка' : 'Стратегия · целевая доходность'} title={flow.kind === 'terms' ? termsContract?.productName ?? 'Договор' : step === 'success' ? topupContract ? 'Договор пополнен' : 'Договор оформлен' : topupContract ? `Долить в ${selectedProduct?.name}` : selectedProduct?.name ?? 'Инвестировать'} onClose={close}>{flow.kind === 'terms' && termsContract ? <div className="space-y-2.5">{[
      ['Номер договора', `№ ${termsContract.id}`],['Продукт',termsContract.productName],['Сумма',formatCurrency(termsContract.amount)],['Ставка',termsContract.rate],['Срок',months(termsContract.termMonths)],['Открыт',human(termsContract.opened)],['Окончание',termsContract.ends?human(termsContract.ends):'бессрочно'],['Схема выплат',termsContract.reinvest?'реинвестирование, всё в конце срока':`выплаты ${termsContract.payoutPeriod} на свободный баланс`],['Пополнение договора','в любой момент, в тот же договор'],['Досрочный вывод тела','не предусмотрен'],
    ].map(([label,value]) => <div key={label} className="flex items-baseline justify-between gap-3 border-b border-[var(--trigonum-border)] pb-2.5"><span className="text-[13px] text-[var(--trigonum-muted)]">{label}</span><b className="text-right text-[13px] text-[var(--trigonum-ink)]">{value}</b></div>)}<button className="w-full rounded-xl border border-[var(--trigonum-border)] p-3 text-[13px] font-bold text-[var(--trigonum-violet)]">Скачать PDF договора</button></div> : selectedProduct && form ? step === 'processing' ? <div className="py-6 text-center"><LoaderCircle size={30} className="mx-auto animate-spin text-[var(--trigonum-violet)]" /><p className="mt-4 text-lg font-bold text-[var(--trigonum-ink)]">Оформляем договор</p><div className="mx-auto mt-4 inline-flex flex-col gap-2.5 text-left text-sm"><span className="inline-flex items-center gap-2 text-[var(--trigonum-success)]"><CheckCircle2 size={16}/>Заявка принята</span><span className="inline-flex items-center gap-2 text-[var(--trigonum-success)]"><CheckCircle2 size={16}/>Средства зарезервированы</span><span className="inline-flex items-center gap-2 text-[var(--trigonum-violet)]"><LoaderCircle size={16} className="animate-spin"/>Формируем документ и график выплат</span></div></div> : step === 'success' ? <div className="py-5 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-[#eef7f1] text-[var(--trigonum-success)]"><CheckCircle2 size={30}/></span><p className="mt-4 text-xl font-bold text-[var(--trigonum-ink)]">{topupContract?'Договор пополнен':'Договор оформлен'}</p><p className="mt-2 text-3xl font-bold tabular-nums text-[var(--trigonum-success)]">{formatCurrency(amount)}</p><p className="mt-2 text-[13px] text-[var(--trigonum-muted)]">{selectedProduct.name} · выплаты {selectedProduct.payout} · {reinvest?'с реинвестированием':'выплаты на свободный баланс'}</p><div className="mt-5 flex gap-2"><button className="flex-1 rounded-xl border border-[var(--trigonum-border)] p-3 text-[13px] font-bold text-[var(--trigonum-violet)]">Скачать договор</button><button type="button" onClick={close} className="flex-1 rounded-xl bg-[var(--trigonum-ink)] p-3 text-[13px] font-bold text-white">Готово</button></div></div> : <div className="space-y-4"><div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-border)]"><Mini label="Доходность" value={selectedProduct.rate} hint={selectedProduct.rateNote}/><Mini label="Выплаты" value={selectedProduct.payout} hint={selectedProduct.risk}/></div>{topupContract ? <div className="rounded-xl border border-[#cdcdf0] bg-[var(--trigonum-violet-soft)] p-3.5"><p className="text-[11px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-violet)]">Пополнение действующего договора</p><div className="mt-2.5 flex flex-wrap gap-4"><Fact label="Договор" value={`№ ${topupContract.id}`}/><Fact label="Срок" value={months(topupContract.termMonths)}/><Fact label="Схема выплат" value={topupContract.reinvest?'реинвестирование':`выплаты ${topupContract.payoutPeriod}`}/><Fact label="Тело сейчас" value={formatCurrency(topupContract.amount)}/></div></div> : <div><p className="text-[11px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Срок договора</p><div className="mt-2 flex flex-wrap gap-2">{selectedProduct.terms.map((term,index) => <button key={term} type="button" onClick={() => setTermIndex(index)} className={`rounded-[10px] border px-3.5 py-2 text-[13px] font-bold ${index===termIndex?'border-[var(--trigonum-violet)] bg-[var(--trigonum-violet-soft)] text-[var(--trigonum-violet)]':'border-[var(--trigonum-border)] bg-white text-[var(--trigonum-text)]'}`}>{term} мес.</button>)}</div></div>}<div><div className="flex items-baseline justify-between"><span className="text-[11px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Сумма</span><span className="text-xs text-[var(--trigonum-muted)]">Свободно {formatCurrency(free)}</span></div><div className="mt-1.5 flex items-center rounded-xl border border-[var(--trigonum-border)] px-3"><b className="text-sm text-[var(--trigonum-muted)]">$</b><input type="number" value={amount} onChange={(e)=>setAmount(Number(e.target.value))} className="w-full bg-transparent px-2 py-2.5 text-xl font-bold text-[var(--trigonum-ink)] outline-none"/><button type="button" onClick={()=>setAmount(Math.min(free,free))} className="rounded-lg border border-[var(--trigonum-border)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--trigonum-violet)]">MAX</button></div><input type="range" min={selectedProduct.min} max={Math.max(selectedProduct.min,free)} value={Math.min(amount,Math.max(selectedProduct.min,free))} onChange={(e)=>setAmount(Number(e.target.value))} className="mt-2 w-full accent-[var(--trigonum-violet)]"/></div><div className="grid grid-cols-2 gap-3 rounded-xl bg-[#f5f5fa] p-3.5"><Mini label={selectedProduct.guaranteed?'Доход за срок':'Целевой доход за срок'} value={form.reinvestOn?form.range(form.low.compound,form.high.compound):form.range(form.low.simple,form.high.simple)} green/><Mini label="Первая выплата" value={form.reinvestOn?'в конце срока':`${form.firstPayoutDate.getDate()} ${MONTHS_GEN[form.firstPayoutDate.getMonth()]}`}/></div><p className="text-[11px] leading-[1.5] text-[var(--trigonum-muted)]">{selectedProduct.guaranteed?'Ставка фиксирована договором, доход начисляется ежемесячно.':'Целевая доходность — ориентир стратегии, а не обязательство. Фактический результат определяется по итогам периода.'}</p>{!topupContract && <><p className="text-[11px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Схема выплат</p><div className="grid grid-cols-2 gap-2"><Scheme active={reinvest} title="Реинвестировать" hint="Доход увеличивает тело договора и работает дальше — сложный процент" badge={Math.round(form.compoundMid-form.simpleMid)>0?'Выгоднее':''} onClick={()=>setReinvest(true)}/><Scheme active={!reinvest} title="Забирать выплаты" hint={`Выплаты ${selectedProduct.payout} приходят на свободный баланс`} onClick={()=>setReinvest(false)}/></div>{Math.round(form.compoundMid-form.simpleMid)>0 && <div className="rounded-xl border border-[var(--trigonum-border)] p-4"><div className="flex items-baseline justify-between gap-3"><p className="text-[11px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">Что даёт реинвестирование</p><span className="text-[13px] font-bold text-[var(--trigonum-success)]">+{formatCurrency(form.compoundMid-form.simpleMid)} сверху</span></div><Compare label="Реинвестировать · сложный процент" value={form.range(form.low.compound,form.high.compound)} width={form.compoundMid/form.maxIncome*100} fill="linear-gradient(90deg,var(--trigonum-violet),#92f222)" color="var(--trigonum-success)"/><Compare label="Забирать выплаты · простой процент" value={form.range(form.low.simple,form.high.simple)} width={form.simpleMid/form.maxIncome*100} fill="#cdcdf0" color="var(--trigonum-ink)"/><div className="mt-3 flex items-baseline justify-between border-t border-[var(--trigonum-border)] pt-3"><span className="text-xs text-[var(--trigonum-muted)]">Капитал в конце срока при реинвестировании</span><b className="text-[15px] text-[var(--trigonum-ink)]">{formatCurrency(amount+form.compoundMid)}</b></div></div>}</>}<button type="button" onClick={()=>setAgree(!agree)} className={`flex w-full items-start gap-2.5 rounded-xl border p-3 text-left ${agree?'border-[#cdcdf0]':'border-[var(--trigonum-border)]'}`}><span className={`grid size-5 shrink-0 place-items-center rounded-md border ${agree?'border-[var(--trigonum-violet)] bg-[var(--trigonum-violet)] text-white':'border-[#d3d3e6] bg-white'}`}>{agree&&<Check size={14}/>}</span><span className="text-xs leading-[1.5] text-[var(--trigonum-text)]">Ознакомлен с условиями договора {topupContract?`№ ${topupContract.id} (пополнение)`:`№ CTR-${2491 + contracts.filter((c)=>Number(c.id.slice(4))>=2491).length}`} и с тем, что {selectedProduct.guaranteed?'ставка фиксирована на срок договора':'целевая доходность не является гарантией и результат может отличаться'}</span></button>{message&&<p className="rounded-lg bg-[#fdecec] px-3 py-2.5 text-xs text-[var(--trigonum-danger)]">{message}</p>}<button type="button" onClick={submit} className="w-full rounded-xl bg-[var(--trigonum-violet)] p-3.5 text-sm font-bold text-white">{topupContract?`Долить ${formatCurrency(amount)} в договор`:`Оформить договор на ${formatCurrency(amount)}`}</button></div> : null}</Modal>}
  </div>
}

function Stat({label,value,hint,color='var(--trigonum-ink)'}:{label:string;value:string;hint:string;color?:string}) { return <div className="rounded-[18px] border border-[var(--trigonum-border)] bg-white px-5 py-[18px] shadow-[0_8px_30px_rgb(8_27_58/8%)]"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{label}</p><p className="mt-2.5 text-2xl font-bold tabular-nums" style={{color}}>{value}</p><p className="mt-1.5 text-xs text-[var(--trigonum-muted)]">{hint}</p></div> }
function Mini({label,value,hint,green=false}:{label:string;value:string;hint?:string;green?:boolean}) { return <div className="bg-white p-3.5"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{label}</p><p className={`mt-1.5 text-[15px] font-bold ${green?'text-[var(--trigonum-success)]':'text-[var(--trigonum-ink)]'}`}>{value}</p>{hint&&<p className="mt-1 text-[11px] text-[var(--trigonum-muted)]">{hint}</p>}</div> }
function Fact({label,value}:{label:string;value:string}) { return <span><span className="block text-[10px] font-bold uppercase tracking-[.08em] text-[var(--trigonum-muted)]">{label}</span><b className="mt-1 block text-[13px] text-[var(--trigonum-ink)]">{value}</b></span> }
function Scheme({active,title,hint,badge,onClick}:{active:boolean;title:string;hint:string;badge?:string;onClick:()=>void}) { return <button type="button" onClick={onClick} className={`rounded-xl border p-3 text-left ${active?'border-[var(--trigonum-violet)] bg-[var(--trigonum-violet-soft)]':'border-[var(--trigonum-border)] bg-white'}`}><span className="flex items-center gap-2"><b className={`text-[13px] ${active?'text-[var(--trigonum-violet)]':'text-[var(--trigonum-ink)]'}`}>{title}</b>{badge&&<span className="rounded-full bg-[#eef7f1] px-2 py-0.5 text-[9px] font-bold uppercase text-[var(--trigonum-success)]">{badge}</span>}</span><span className="mt-1 block text-[11px] leading-[1.4] text-[var(--trigonum-muted)]">{hint}</span></button> }
function Compare({label,value,width,fill,color}:{label:string;value:string;width:number;fill:string;color:string}) { return <div className="mt-3"><div className="flex items-baseline justify-between gap-2"><span className="text-xs text-[var(--trigonum-muted)]">{label}</span><b className="text-[13px]" style={{color}}>{value}</b></div><div className="mt-1.5 h-2 rounded-full bg-[var(--trigonum-border)]"><div className="h-full rounded-full" style={{width:`${Math.min(100,width)}%`,background:fill}}/></div></div> }
