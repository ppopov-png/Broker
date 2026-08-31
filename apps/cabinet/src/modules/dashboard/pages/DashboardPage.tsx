import { ArrowRight, CheckCircle2, PieChart, TrendingUp, Wallet, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency, formatPercent, formatSigned, formatShare } from '../../../shared/lib/format'
import {
  accountStatuses,
  capitalBreakdown,
  capitalTotals,
  notifications,
  positions,
  transactions,
  user,
} from '../../../shared/mock/data'
import { Card } from '../../../shared/ui/Card'
import { CapitalChart } from '../../../shared/ui/CapitalChart'
import { IconTile } from '../../../shared/ui/IconTile'
import { StatCard } from '../../../shared/ui/StatCard'
import { TransactionRow } from '../../../shared/ui/TransactionRow'

export function DashboardPage() {
  const earn = capitalBreakdown.find((c) => c.key === 'earn')!
  const strategies = capitalBreakdown.find((c) => c.key === 'strategies')!
  const events = capitalBreakdown.find((c) => c.key === 'events')!
  const available = capitalBreakdown.find((c) => c.key === 'available')!

  return (
    <div className="pb-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--trigonum-ink)]">Добрый день, {user.greetingName}</h1>
        <p className="mt-1 text-sm text-[var(--trigonum-muted)]">Обзор вашего капитала и текущей ситуации</p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Общий капитал" value={formatCurrency(capitalTotals.total)} hint="USD" icon={<Wallet size={17} />} iconTone="blue" />
        <StatCard
          label="В работе"
          value={formatCurrency(capitalTotals.inWork)}
          hint={`${formatShare((capitalTotals.inWork / capitalTotals.total) * 100)} от капитала`}
          hintTone="muted"
          icon={<PieChart size={17} />}
          iconTone="violet"
        />
        <StatCard
          label="Доступно"
          value={formatCurrency(capitalTotals.available)}
          hint={`${formatShare((capitalTotals.available / capitalTotals.total) * 100)} от капитала`}
          hintTone="muted"
          icon={<WalletCards size={17} />}
          iconTone="green"
        />
        <StatCard
          label="Общий результат (30D)"
          value={formatSigned(capitalTotals.ytdProfit)}
          hint={formatPercent(capitalTotals.ytdProfitPct)}
          hintTone="success"
          icon={<TrendingUp size={17} />}
          iconTone="green"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">
        <Card className="lg:col-span-2">
          <CapitalChart />
        </Card>

        <div className="flex flex-col gap-5">
          <Card
            title="Активные продукты"
            action={
              <Link to="/capital" className="text-xs font-semibold text-[var(--trigonum-blue)]">
                Все продукты →
              </Link>
            }
          >
            <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
              {positions.slice(0, 2).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{p.product}</p>
                    <p className="text-xs text-[var(--trigonum-muted)]">{formatCurrency(p.invested)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--trigonum-success)]">{formatSigned(p.profit)}</p>
                    <p className="text-xs text-[var(--trigonum-muted)]">{p.yieldLabel}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Центр действий"
            action={
              <Link to="/support" className="text-xs font-semibold text-[var(--trigonum-blue)]">
                Все события →
              </Link>
            }
          >
            <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
              {notifications.map((n) => (
                <div key={n.id} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{n.title}</p>
                      <p className="mt-0.5 text-xs text-[var(--trigonum-muted)]">{n.description}</p>
                    </div>
                    {n.cta && (
                      <Link
                        to="/events"
                        className="shrink-0 rounded-md border border-[var(--trigonum-border)] px-2.5 py-1 text-xs font-semibold text-[var(--trigonum-blue)]"
                      >
                        {n.cta}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
        <Card title="Capital Map" subtitle="Деньги всегда работают. Переводите капитал между продуктами в один клик.">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[140px] flex-1 rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-bg)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">Available</p>
              <p className="mt-1 text-lg font-bold text-[var(--trigonum-ink)]">{formatCurrency(available.amount)}</p>
              <p className="text-xs text-[var(--trigonum-success)]">{formatShare(available.share)}</p>
            </div>
            <ArrowRight size={18} className="hidden shrink-0 text-[var(--trigonum-muted)] sm:block" />
            <div className="min-w-[140px] flex-1 rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-bg)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">Earn</p>
              <p className="mt-1 text-lg font-bold text-[var(--trigonum-ink)]">{formatCurrency(earn.amount)}</p>
              <p className="text-xs text-[var(--trigonum-muted)]">≈ 7% p.a.</p>
            </div>
            <ArrowRight size={18} className="hidden shrink-0 text-[var(--trigonum-muted)] sm:block" />
            <div className="flex min-w-[140px] flex-1 flex-col gap-2">
              <div className="rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-violet-soft)] p-3">
                <p className="text-xs font-semibold text-[var(--trigonum-violet)]">Strategies</p>
                <p className="text-sm font-bold text-[var(--trigonum-ink)]">{formatCurrency(strategies.amount)}</p>
              </div>
              <div className="rounded-xl border border-[var(--trigonum-border)] bg-[color-mix(in_srgb,var(--trigonum-green)_10%,white)] p-3">
                <p className="text-xs font-semibold text-[var(--trigonum-success)]">Events</p>
                <p className="text-sm font-bold text-[var(--trigonum-ink)]">{formatCurrency(events.amount)}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Статус аккаунта"
          action={
            <Link to="/security" className="text-xs font-semibold text-[var(--trigonum-blue)]">
              Все статусы →
            </Link>
          }
        >
          <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
            {accountStatuses.map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <IconTile icon={<CheckCircle2 size={16} />} tone="green" size={30} />
                <div>
                  <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{s.label}</p>
                  <p className="text-xs text-[var(--trigonum-muted)]">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card
        className="mt-5"
        title="Последние операции"
        action={
          <Link to="/transactions" className="text-xs font-semibold text-[var(--trigonum-blue)]">
            Все операции →
          </Link>
        }
      >
        <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
          {transactions.slice(0, 3).map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      </Card>
    </div>
  )
}
