import { ChevronRight } from 'lucide-react'
import { formatDateTime, formatSigned } from '../lib/format'
import type { TransactionItem } from '../mock/types'
import { IconTile } from './IconTile'
import { Pill } from './Pill'
import { transactionMeta, transactionTypeLabel } from './transactionMeta'

export function TransactionRow({ tx }: { tx: TransactionItem }) {
  const meta = transactionMeta[tx.type]
  const Icon = meta.icon

  return (
    <div className="flex items-center gap-3 py-3">
      <IconTile icon={<Icon size={16} />} tone={meta.tone} size={34} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--trigonum-ink)]">{transactionTypeLabel[tx.type]}</p>
        <p className="truncate text-xs text-[var(--trigonum-muted)]">{tx.description}</p>
      </div>
      <p className="hidden shrink-0 text-xs text-[var(--trigonum-muted)] sm:block">{formatDateTime(tx.date)}</p>
      <p className={`w-28 shrink-0 text-right text-sm font-semibold ${tx.amount >= 0 ? 'text-[var(--trigonum-success)]' : 'text-[var(--trigonum-ink)]'}`}>
        {formatSigned(tx.amount, true)}
      </p>
      <div className="hidden w-28 shrink-0 justify-end md:flex">
        <Pill tone={tx.status === 'completed' ? 'success' : 'warning'}>
          {tx.status === 'completed' ? 'Выполнено' : 'В обработке'}
        </Pill>
      </div>
      <ChevronRight size={16} className="shrink-0 text-[var(--trigonum-muted)]" />
    </div>
  )
}
