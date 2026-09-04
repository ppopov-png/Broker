import { ArrowRight, Clock, Lock, Zap } from 'lucide-react'
import { formatCurrency, formatDate } from '../../../shared/lib/format'
import { capitalTotals } from '../../../shared/mock/data'
import { PrimaryButton } from '../../../shared/ui/buttons'
import { allocationOrder, allocationProfile, currentAllocation } from '../model/capital-data'
import { projectedIncome, summarizePlan, yearForecast, type Allocation } from '../model/allocator'

function Row({ label, value, tone = 'default', strong = false }: { label: string; value: string; tone?: 'default' | 'success' | 'muted'; strong?: boolean }) {
  const color =
    tone === 'success' ? 'text-[var(--trigonum-success)]' : tone === 'muted' ? 'text-[var(--trigonum-muted)]' : 'text-[var(--trigonum-ink)]'
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className={strong ? 'font-semibold text-[var(--trigonum-ink)]' : 'text-[var(--trigonum-text)]'}>{label}</span>
      <span className={`tabular-nums ${strong ? 'font-bold' : 'font-semibold'} ${color}`}>{value}</span>
    </div>
  )
}

export function AllocationSummary({ allocation, onConfirm }: { allocation: Allocation; onConfirm: () => void }) {
  const summary = summarizePlan(allocation)
  const forecast = yearForecast(allocation)
  const baseIncome = projectedIncome(currentAllocation)
  const delta = forecast.annualIncome - baseIncome
  const yearLabel = new Date().getFullYear()

  return (
    <div className="flex flex-col gap-4">
      <section>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">Распределение</p>
        <div className="flex flex-col gap-1.5">
          {allocationOrder.map((key) => {
            const from = currentAllocation[key]
            const to = allocation[key]
            return (
              <div key={key} className="flex items-center justify-between rounded-lg border border-[var(--trigonum-border)] px-3 py-2 text-sm">
                <span className="flex items-center gap-2 text-[var(--trigonum-text)]">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: allocationProfile[key].color }} />
                  {allocationProfile[key].label}
                </span>
                <span className="tabular-nums text-[var(--trigonum-muted)]">
                  {from.toFixed(0)}% → <b className="text-[var(--trigonum-ink)]">{to.toFixed(0)}%</b>
                  <span className="ml-2 text-xs">{formatCurrency((capitalTotals.total * to) / 100)}</span>
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-xl bg-[var(--trigonum-bg)] p-3">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">Что произойдёт при подтверждении</p>
        <div className="flex flex-col gap-2">
          {summary.plans
            .filter((p) => Math.abs(p.deltaAmount) >= 1)
            .map((p) => (
              <div key={p.key} className="rounded-lg border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] p-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-[var(--trigonum-text)]">
                    <span className="size-2 rounded-full" style={{ backgroundColor: allocationProfile[p.key].color }} />
                    {allocationProfile[p.key].label}
                  </span>
                  <span className={`font-semibold ${p.deltaAmount >= 0 ? 'text-[var(--trigonum-success)]' : 'text-[var(--trigonum-ink)]'}`}>
                    {p.deltaAmount >= 0 ? '+' : '−'}
                    {formatCurrency(Math.abs(p.deltaAmount))}
                  </span>
                </div>

                <div className="mt-1.5 flex flex-col gap-1 text-[11px] text-[var(--trigonum-muted)]">
                  {p.liquidNow !== 0 && (
                    <span className="flex items-center gap-1.5 text-[var(--trigonum-success)]">
                      <Zap size={11} className="shrink-0" />
                      {p.key === 'available' || p.deltaAmount >= 0
                        ? `${formatCurrency(Math.abs(p.liquidNow))} — исполнится сразу`
                        : `${formatCurrency(Math.abs(p.liquidNow))} — доступно сейчас (уже начисленная прибыль)`}
                    </span>
                  )}
                  {p.queued > 0 && p.queuedReason === 'lock' && p.queuedUntil && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={11} className="shrink-0" />
                      {formatCurrency(p.queued)} — в очереди, тело в локе до {formatDate(p.queuedUntil)}
                    </span>
                  )}
                  {p.queued > 0 && p.queuedReason === 'funding' && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={11} className="shrink-0" />
                      {formatCurrency(p.queued)} — ждёт поступления средств от других сокращений
                    </span>
                  )}
                  {p.newLock && (
                    <span className="flex items-center gap-1.5">
                      <Lock size={11} className="shrink-0" />
                      {p.newLock.parallel ? 'Новый параллельный лок' : 'Присоединится к сроку события'} до{' '}
                      {formatDate(p.newLock.unlockDate)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          {summary.plans.every((p) => Math.abs(p.deltaAmount) < 1) && (
            <p className="text-sm text-[var(--trigonum-muted)]">Распределение не изменилось.</p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-[var(--trigonum-border)] pt-2 text-xs">
          <span className="text-[var(--trigonum-muted)]">Итого сейчас / в очереди</span>
          <span className="font-semibold text-[var(--trigonum-ink)]">
            {formatCurrency(summary.liquidNow)} <ArrowRight size={10} className="mx-0.5 inline" /> {formatCurrency(summary.queued)}
          </span>
        </div>
      </section>

      <section className="rounded-xl bg-[var(--trigonum-bg)] p-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">Доходность после перераспределения</p>
        <Row label="Ставка портфеля" value={`${forecast.annualRatePct.toFixed(2)}% годовых`} strong />
        <Row label="Доход в год при этой ставке" value={formatCurrency(forecast.annualIncome)} tone="success" />
        <Row
          label="Изменение ставки к текущей"
          value={Math.abs(delta) < 1 ? 'без изменений' : `${delta > 0 ? '+' : ''}${formatCurrency(delta)} в год`}
          tone={delta > 0 ? 'success' : 'muted'}
        />
        <p className="mt-1 text-[11px] leading-snug text-[var(--trigonum-muted)]">
          Ставка вырастет полностью только после того, как отработает очередь — часть капитала ещё в локе.
        </p>
      </section>

      <section className="rounded-xl border border-[var(--trigonum-border)] p-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">Прогноз капитала</p>
        <Row label="Сейчас" value={formatCurrency(capitalTotals.total)} />
        <Row label={`Доход за остаток года (${forecast.daysLeft} дн.)`} value={`+${formatCurrency(forecast.incomeRestOfYear)}`} tone="success" />
        <div className="my-1 border-t border-[var(--trigonum-border)]" />
        <Row label={`Капитал на 31.12.${yearLabel}`} value={formatCurrency(forecast.yearEndCapital)} strong />
        <Row label="Через 12 месяцев при той же ставке" value={formatCurrency(forecast.twelveMonthsCapital)} tone="muted" />
      </section>

      <PrimaryButton className="w-full" onClick={onConfirm}>
        Подтвердить перераспределение
      </PrimaryButton>
    </div>
  )
}
