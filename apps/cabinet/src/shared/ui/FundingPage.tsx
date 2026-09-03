import { CheckCircle2, Clock, Coins, CreditCard, Landmark, User, Wallet } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency, formatDateTime } from '../lib/format'
import type { BrokerAccountType } from '../lib/AccountContext'
import type { FundingMethod, TransactionItem } from '../mock/types'
import { Card } from './Card'
import { FundingMethodForm } from './FundingMethodForm'
import { Modal } from './Modal'
import { OutlineButton } from './buttons'
import { StatCard } from './StatCard'

const methodIcon: Record<FundingMethod['id'], typeof CreditCard> = {
  card: CreditCard,
  crypto: Coins,
  transfer: Landmark,
}

interface FundingPageProps {
  mode: 'deposit' | 'withdraw'
  accountType: BrokerAccountType
  accountName: string
  accountNumber: string
  title: string
  subtitle: string
  methods: FundingMethod[]
  availableLabel: string
  availableAmount: number
  lastLabel: string
  lastItem: TransactionItem
  historyTitle: string
  historyItems: TransactionItem[]
}

export function FundingPage({
  mode,
  accountType,
  accountName,
  accountNumber,
  title,
  subtitle,
  methods,
  availableLabel,
  availableAmount,
  lastLabel,
  lastItem,
  historyTitle,
  historyItems,
}: FundingPageProps) {
  const [activeMethod, setActiveMethod] = useState<FundingMethod | null>(null)

  return (
    <div className="pb-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--trigonum-ink)]">{title}</h1>
          <p className="mt-1 text-sm text-[var(--trigonum-muted)]">{subtitle}</p>
        </div>
        <div className={`rounded-xl border px-3 py-2 ${accountType === 'company' ? 'border-violet-200 bg-violet-50' : 'border-blue-100 bg-blue-50'}`}>
          <p className={`text-[10px] font-bold uppercase tracking-wide ${accountType === 'company' ? 'text-violet-700' : 'text-blue-700'}`}>{accountType === 'company' ? 'Корпоративный счёт' : 'Личный счёт'}</p>
          <p className="mt-0.5 text-sm font-bold text-[var(--trigonum-ink)]">{accountName}</p>
          <p className="text-[10px] text-[var(--trigonum-muted)]">{accountNumber}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label={availableLabel} value={formatCurrency(availableAmount)} icon={<Wallet size={17} />} iconTone="green" />
        <StatCard
          label={lastLabel}
          value={formatCurrency(Math.abs(lastItem.amount))}
          hint={`${lastItem.description} · ${formatDateTime(lastItem.date)}`}
          icon={<Clock size={17} />}
          iconTone="blue"
        />
        <StatCard
          label="Статус аккаунта"
          value={mode === 'deposit' ? 'Можно пополнять' : 'Можно выводить'}
          hint={accountType === 'company' ? 'KYB подтверждён' : 'KYC подтверждён'}
          hintTone="success"
          icon={<CheckCircle2 size={17} />}
          iconTone="green"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3 md:items-start">
        {methods.map((method) => {
          const Icon = methodIcon[method.id]
          return (
            <Card key={method.id}>
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--trigonum-blue)_10%,white)] text-[var(--trigonum-blue)]"><Icon size={20} /></span>
                <div>
                  <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{method.title}</p>
                  <p className="text-xs text-[var(--trigonum-muted)]">{method.subtitle}</p>
                </div>
              </div>
              <ul className="mt-3 flex flex-col gap-1.5">
                {method.points.map((point) => <li key={point} className="flex items-start gap-1.5 text-xs text-[var(--trigonum-text)]"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--trigonum-success)]" />{point}</li>)}
              </ul>
              <OutlineButton className="mt-3 w-full border-[var(--trigonum-blue)] text-[var(--trigonum-blue)]" onClick={() => setActiveMethod(method)}>{method.cta}</OutlineButton>
            </Card>
          )
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr] lg:items-start">
        <Card title={historyTitle}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] text-sm">
              <thead><tr className="border-b border-[var(--trigonum-border)] text-left text-xs uppercase tracking-wide text-[var(--trigonum-muted)]"><th className="py-2 font-semibold">Дата</th><th className="py-2 font-semibold">Способ</th><th className="py-2 font-semibold">Сумма</th><th className="py-2 text-right font-semibold">Статус</th></tr></thead>
              <tbody>{historyItems.map((item) => <tr key={item.id} className="border-b border-[var(--trigonum-border)] last:border-0"><td className="py-3 text-[var(--trigonum-text)]">{formatDateTime(item.date)}</td><td className="py-3 text-[var(--trigonum-text)]">{item.description}</td><td className="py-3 font-semibold text-[var(--trigonum-ink)]">{formatCurrency(Math.abs(item.amount))}</td><td className="py-3 text-right"><span className={item.status === 'completed' ? 'text-[var(--trigonum-success)]' : 'text-[var(--trigonum-warning)]'}>{item.status === 'completed' ? 'Выполнено' : 'В обработке'}</span></td></tr>)}</tbody>
            </table>
          </div>
        </Card>

        <Card title="Важно">
          <p className="flex items-start gap-2 text-sm text-[var(--trigonum-text)]"><User size={16} className="mt-0.5 shrink-0 text-[var(--trigonum-muted)]" />Операция проводится только по реквизитам текущего {accountType === 'company' ? 'юридического' : 'личного'} аккаунта. Средства между аккаунтами не смешиваются.</p>
        </Card>
      </div>

      <Modal open={!!activeMethod} onClose={() => setActiveMethod(null)} title={activeMethod?.title ?? ''} subtitle={activeMethod?.subtitle}>
        {activeMethod && <FundingMethodForm method={activeMethod} mode={mode} />}
      </Modal>
    </div>
  )
}
