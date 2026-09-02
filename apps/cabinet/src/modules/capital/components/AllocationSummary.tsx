import { Info } from 'lucide-react'
import { formatCurrency, formatSigned } from '../../../shared/lib/format'
import { PrimaryButton } from '../../../shared/ui/buttons'
import { allocationOrder, allocationProfile, currentAllocation } from '../model/capital-data'
import { pnlOnApply, projectedIncome, yearForecast, type Allocation } from '../model/allocator'
import { capitalTotals } from '../../../shared/mock/data'

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
  const pnl = pnlOnApply(allocation)
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
            const changed = Math.abs(to - from) >= 0.5
            return (
              <div key={key} className="flex items-center justify-between rounded-lg border border-[var(--trigonum-border)] px-3 py-2 text-sm">
                <span className="flex items-center gap-2 text-[var(--trigonum-text)]">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: allocationProfile[key].color }} />
                  {allocationProfile[key].label}
                </span>
                <span className={`tabular-nums ${changed ? 'text-[var(--trigonum-muted)]' : 'text-[var(--trigonum-muted)] opacity-60'}`}>
                  {from.toFixed(0)}% → <b className="text-[var(--trigonum-ink)]">{to.toFixed(0)}%</b>
                  <span className="ml-2 text-xs">{formatCurrency((capitalTotals.total * to) / 100)}</span>
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-xl bg-[var(--trigonum-bg)] p-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">Зафиксированный PnL</p>
        <Row label="Уже зафиксировано (начисления Earn)" value={formatSigned(pnl.alreadyRealized)} tone="success" />
        <Row label="Фиксируется этой операцией" value={formatSigned(pnl.lockingNow)} tone={pnl.lockingNow > 0 ? 'success' : 'muted'} />
        <Row label="Остаётся нереализованным" value={formatSigned(pnl.remainingUnrealized)} tone="muted" />
      </section>

      <section className="rounded-xl bg-[var(--trigonum-bg)] p-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">Доходность после перераспределения</p>
        <Row label="Ставка портфеля" value={`${forecast.annualRatePct.toFixed(2)}% годовых`} strong />
        <Row label="Доход в год при этой ставке" value={formatCurrency(forecast.annualIncome)} tone="success" />
        <Row
          label="Изменение ставки к текущей"
          value={Math.abs(delta) < 1 ? 'без изменений' : `${formatSigned(delta)} в год`}
          tone={delta > 0 ? 'success' : 'muted'}
        />
        <p className="mt-1 text-[11px] leading-snug text-[var(--trigonum-muted)]">
          Это будущая доходность, а не заработанные деньги: за остаток года из неё материализуется{' '}
          {formatSigned((delta * forecast.daysLeft) / 365)}.
        </p>
      </section>

      <section className="rounded-xl border border-[var(--trigonum-border)] p-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">Прогноз капитала</p>
        <Row label="Сейчас" value={formatCurrency(capitalTotals.total)} />
        <Row label={`Доход за остаток года (${forecast.daysLeft} дн.)`} value={formatSigned(forecast.incomeRestOfYear)} tone="success" />
        <div className="my-1 border-t border-[var(--trigonum-border)]" />
        <Row label={`Капитал на 31.12.${yearLabel}`} value={formatCurrency(forecast.yearEndCapital)} strong />
        <Row label="Через 12 месяцев при той же ставке" value={formatCurrency(forecast.twelveMonthsCapital)} tone="muted" />
        <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-[var(--trigonum-muted)]">
          <Info size={12} className="mt-0.5 shrink-0" />
          Осторожный сценарий — {formatCurrency(forecast.conservativeYearEndCapital)}: Events приносят доход только {forecast.eventsWorkingDays} дн.
          до закрытия окна, дальше эти средства лежат без доходности. Прогноз построен на целевых ставках продуктов и не является гарантией.
        </p>
      </section>

      <PrimaryButton className="w-full" onClick={onConfirm}>
        Подтвердить перераспределение
      </PrimaryButton>
    </div>
  )
}
