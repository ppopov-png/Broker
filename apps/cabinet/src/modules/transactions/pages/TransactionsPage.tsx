import { useEffect, useMemo, useState } from 'react'
import { formatSigned } from '../../../shared/lib/format'
import { transactions } from '../../../shared/mock/data'
import type { TransactionStatus, TransactionType } from '../../../shared/mock/types'
import { Card } from '../../../shared/ui/Card'
import { OutlineButton } from '../../../shared/ui/buttons'
import { TransactionRow } from '../../../shared/ui/TransactionRow'

const typeTabs: { value: TransactionType | 'all'; label: string }[] = [
  { value: 'all', label: 'Все транзакции' },
  { value: 'deposit', label: 'Пополнения' },
  { value: 'withdrawal', label: 'Выводы' },
  { value: 'transfer', label: 'Переводы' },
  { value: 'accrual', label: 'Начисления' },
]

const PAGE_SIZE = 10

export function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(
    () =>
      transactions.filter(
        (tx) => (typeFilter === 'all' || tx.type === typeFilter) && (statusFilter === 'all' || tx.status === statusFilter),
      ),
    [typeFilter, statusFilter],
  )

  useEffect(() => setPage(1), [typeFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totals = useMemo(() => {
    const by = (type: TransactionType) => filtered.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0)
    const deposits = by('deposit')
    const withdrawals = by('withdrawal')
    const transfers = by('transfer')
    const accruals = by('accrual')
    return { deposits, withdrawals, transfers, accruals, net: deposits + withdrawals + transfers + accruals }
  }, [filtered])

  return (
    <div className="pb-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--trigonum-ink)]">Транзакции</h1>
        <p className="mt-1 text-sm text-[var(--trigonum-muted)]">Все операции по вашему счёту: пополнения, выводы, переводы, инвестиции и начисления.</p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr] lg:items-start">
        <Card>
          <div className="mb-4 flex flex-wrap gap-1 border-b border-[var(--trigonum-border)] pb-3">
            {typeTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setTypeFilter(tab.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  typeFilter === tab.value ? 'bg-[color-mix(in_srgb,var(--trigonum-blue)_10%,white)] text-[var(--trigonum-blue)]' : 'text-[var(--trigonum-muted)] hover:text-[var(--trigonum-ink)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {pageItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--trigonum-muted)]">Транзакций не найдено.</p>
          ) : (
            <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
              {pageItems.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--trigonum-border)] pt-3 text-sm text-[var(--trigonum-muted)]">
            <span>
              Показано {pageItems.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + pageItems.length} из {filtered.length} транзакций
            </span>
            <div className="flex items-center gap-1">
              <OutlineButton className="px-2.5 py-1.5" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                ‹
              </OutlineButton>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`grid size-8 place-items-center rounded-lg text-sm font-semibold ${
                    p === page ? 'bg-[var(--trigonum-blue)] text-white' : 'text-[var(--trigonum-text)] hover:bg-[var(--trigonum-bg)]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <OutlineButton className="px-2.5 py-1.5" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                ›
              </OutlineButton>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card title="Фильтры" action={<button type="button" onClick={() => setStatusFilter('all')} className="text-xs font-semibold text-[var(--trigonum-blue)]">Сбросить</button>}>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Статус</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | 'all')}
                className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm"
              >
                <option value="all">Все статусы</option>
                <option value="completed">Выполнено</option>
                <option value="processing">В обработке</option>
              </select>
            </label>
          </Card>

          <Card title="Итоги за период">
            <div className="flex flex-col divide-y divide-[var(--trigonum-border)] text-sm">
              <Row label="Пополнения" value={totals.deposits} />
              <Row label="Выводы" value={totals.withdrawals} />
              <Row label="Переводы" value={totals.transfers} />
              <Row label="Начисления" value={totals.accruals} />
              <div className="flex items-center justify-between py-2.5">
                <span className="font-semibold text-[var(--trigonum-ink)]">Итого</span>
                <span className={`font-bold ${totals.net >= 0 ? 'text-[var(--trigonum-success)]' : 'text-[var(--trigonum-danger)]'}`}>{formatSigned(totals.net, true)}</span>
              </div>
            </div>
          </Card>

          <Card title="Нужна помощь?">
            <p className="text-sm text-[var(--trigonum-text)]">Если у вас есть вопросы по транзакции, обратитесь в нашу службу поддержки.</p>
            <OutlineButton className="mt-3 w-full">Связаться с поддержкой</OutlineButton>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-2.5 first:pt-0">
      <span className="text-[var(--trigonum-text)]">{label}</span>
      <span className={value >= 0 ? 'text-[var(--trigonum-success)]' : 'text-[var(--trigonum-ink)]'}>{formatSigned(value, true)}</span>
    </div>
  )
}
