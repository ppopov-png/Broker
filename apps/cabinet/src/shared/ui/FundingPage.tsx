import { Building2, CheckCircle2, Clock, Coins, CreditCard, Landmark, User, Wallet } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency, formatDateTime } from '../lib/format'
import type { FundingMethod, TransactionItem } from '../mock/types'
import { Card } from './Card'
import { FundingMethodForm } from './FundingMethodForm'
import { Modal } from './Modal'
import { OutlineButton } from './buttons'
import { SegmentedControl } from './SegmentedControl'
import { StatCard } from './StatCard'

const methodIcon: Record<FundingMethod['id'], typeof CreditCard> = {
  card: CreditCard,
  crypto: Coins,
  transfer: Landmark,
}

interface FundingPageProps {
  mode: 'deposit' | 'withdraw'
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
  const [clientType, setClientType] = useState<'individual' | 'company'>('individual')
  const [activeMethod, setActiveMethod] = useState<FundingMethod | null>(null)

  return (
    <div className="pb-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--trigonum-ink)]">{title}</h1>
        <p className="mt-1 text-sm text-[var(--trigonum-muted)]">{subtitle}</p>
      </header>

      <SegmentedControl
        value={clientType}
        onChange={setClientType}
        options={[
          { value: 'individual', label: 'Физическое лицо' },
          { value: 'company', label: 'Юридическое лицо' },
        ]}
      />

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
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
          hint="Все ограничения сняты"
          hintTone="success"
          icon={<CheckCircle2 size={17} />}
          iconTone="green"
        />
      </div>

      {clientType === 'company' && (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-[color-mix(in_srgb,var(--trigonum-warning)_10%,white)] px-4 py-3 text-sm text-[#92650c]">
          <Building2 size={16} className="shrink-0" />
          Для юридических лиц лимиты и реквизиты уточняются персональным менеджером.
        </p>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3 md:items-start">
        {methods.map((method) => {
          const Icon = methodIcon[method.id]
          return (
            <Card key={method.id}>
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--trigonum-blue)_10%,white)] text-[var(--trigonum-blue)]">
                  <Icon size={20} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{method.title}</p>
                  <p className="text-xs text-[var(--trigonum-muted)]">{method.subtitle}</p>
                </div>
              </div>
              <ul className="mt-3 flex flex-col gap-1.5">
                {method.points.map((point) => (
                  <li key={point} className="flex items-start gap-1.5 text-xs text-[var(--trigonum-text)]">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--trigonum-success)]" />
                    {point}
                  </li>
                ))}
              </ul>
              <OutlineButton className="mt-3 w-full border-[var(--trigonum-blue)] text-[var(--trigonum-blue)]" onClick={() => setActiveMethod(method)}>
                {method.cta}
              </OutlineButton>
            </Card>
          )
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr] lg:items-start">
        <Card title={historyTitle}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] text-sm">
              <thead>
                <tr className="border-b border-[var(--trigonum-border)] text-left text-xs uppercase tracking-wide text-[var(--trigonum-muted)]">
                  <th className="py-2 font-semibold">Дата</th>
                  <th className="py-2 font-semibold">Способ</th>
                  <th className="py-2 font-semibold">Сумма</th>
                  <th className="py-2 text-right font-semibold">Статус</th>
                </tr>
              </thead>
              <tbody>
                {historyItems.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--trigonum-border)] last:border-0">
                    <td className="py-3 text-[var(--trigonum-text)]">{formatDateTime(item.date)}</td>
                    <td className="py-3 text-[var(--trigonum-text)]">{item.description}</td>
                    <td className="py-3 font-semibold text-[var(--trigonum-ink)]">{formatCurrency(Math.abs(item.amount))}</td>
                    <td className="py-3 text-right">
                      <span
                        className={
                          item.status === 'completed'
                            ? 'text-[var(--trigonum-success)]'
                            : 'text-[var(--trigonum-warning)]'
                        }
                      >
                        {item.status === 'completed' ? 'Выполнено' : 'В обработке'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Важно">
          <p className="flex items-start gap-2 text-sm text-[var(--trigonum-text)]">
            <User size={16} className="mt-0.5 shrink-0 text-[var(--trigonum-muted)]" />
            Способы {mode === 'deposit' ? 'пополнения' : 'вывода'} и доступные реквизиты/лимиты зависят от типа аккаунта, статуса верификации и выбранной юрисдикции.
          </p>
        </Card>
      </div>

      <Modal open={!!activeMethod} onClose={() => setActiveMethod(null)} title={activeMethod?.title ?? ''} subtitle={activeMethod?.subtitle}>
        {activeMethod && <FundingMethodForm method={activeMethod} mode={mode} />}
      </Modal>
    </div>
  )
}
