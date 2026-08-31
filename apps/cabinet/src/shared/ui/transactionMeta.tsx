import { ArrowDownCircle, ArrowUpCircle, Repeat, Sparkles } from 'lucide-react'
import type { TransactionType } from '../mock/types'

export const transactionMeta: Record<TransactionType, { icon: typeof ArrowDownCircle; tone: 'blue' | 'green' | 'violet' | 'amber' }> = {
  deposit: { icon: ArrowDownCircle, tone: 'green' },
  withdrawal: { icon: ArrowUpCircle, tone: 'violet' },
  transfer: { icon: Repeat, tone: 'blue' },
  accrual: { icon: Sparkles, tone: 'amber' },
  investment: { icon: ArrowUpCircle, tone: 'blue' },
}

export const transactionTypeLabel: Record<TransactionType, string> = {
  deposit: 'Пополнение',
  withdrawal: 'Вывод',
  transfer: 'Перевод',
  accrual: 'Начисление',
  investment: 'Инвестиция',
}
