import { Flame, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatCurrency, formatDate } from '../../../shared/lib/format'
import { Card } from '../../../shared/ui/Card'
import { ProgressBar } from '../../../shared/ui/ProgressBar'
import { SegmentedControl } from '../../../shared/ui/SegmentedControl'
import { accrualBreakdown, accrualStreak, dailyAccruals, monthlyAccruals, type DailyAccrual } from '../model/capital-data'

const levelColor: Record<DailyAccrual['level'], string> = {
  0: 'var(--trigonum-border)',
  1: 'color-mix(in srgb, var(--trigonum-success) 25%, white)',
  2: 'color-mix(in srgb, var(--trigonum-success) 45%, white)',
  3: 'color-mix(in srgb, var(--trigonum-success) 70%, white)',
  4: 'var(--trigonum-success)',
}

const periods = [
  { value: '30', label: '30 дней' },
  { value: '90', label: '90 дней' },
  { value: '182', label: 'Полгода' },
] as const

type PeriodValue = (typeof periods)[number]['value']

const weekdayLabels = ['Пн', '', 'Ср', '', 'Пт', '', 'Вс']

/** Раскладываем дни по колонкам-неделям, выравнивая первую колонку по дню недели. */
function toWeeks(days: DailyAccrual[]): (DailyAccrual | null)[][] {
  if (days.length === 0) return []
  const first = new Date(days[0].date)
  const offset = (first.getDay() + 6) % 7 // понедельник — первый день
  const padded: (DailyAccrual | null)[] = [...Array<null>(offset).fill(null), ...days]

  const weeks: (DailyAccrual | null)[][] = []
  for (let i = 0; i < padded.length; i += 7) {
    const week = padded.slice(i, i + 7)
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }
  return weeks
}

const STREAK_MILESTONE = 30

export function AccrualHeatmap() {
  const [period, setPeriod] = useState<PeriodValue>('90')
  const [hovered, setHovered] = useState<DailyAccrual | null>(null)

  const days = useMemo(() => dailyAccruals.slice(-Number(period)), [period])
  const weeks = useMemo(() => toWeeks(days), [days])

  const stats = useMemo(() => {
    const total = days.reduce((sum, d) => sum + d.amount, 0)
    const active = days.filter((d) => d.amount > 0)
    const best = days.reduce((max, d) => (d.amount > max.amount ? d : max), days[0])
    return { total, active: active.length, best, average: active.length ? total / active.length : 0 }
  }, [days])

  const monthlyMax = Math.max(...monthlyAccruals.map((m) => m.amount))
  const shown = hovered ?? stats.best
  const breakdown = accrualBreakdown(shown.amount)

  return (
    <Card
      title="Календарь начислений"
      subtitle="Каждая клетка — день, насыщенность цвета — размер начисления"
      action={<SegmentedControl value={period} onChange={setPeriod} options={periods.map(({ value, label }) => ({ value, label }))} />}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Начислено за период', formatCurrency(stats.total, true)],
          ['В среднем в день', formatCurrency(stats.average, true)],
          ['Дней с начислением', `${stats.active} из ${days.length}`],
          ['Лучший день', formatCurrency(stats.best.amount, true)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-[var(--trigonum-bg)] p-3">
            <p className="text-[11px] text-[var(--trigonum-muted)]">{label}</p>
            <p className="mt-0.5 text-sm font-bold text-[var(--trigonum-ink)]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        <div className="flex shrink-0 flex-col gap-1 pt-0.5">
          {weekdayLabels.map((label, i) => (
            <span key={i} className="h-3 text-[9px] leading-3 text-[var(--trigonum-muted)]">
              {label}
            </span>
          ))}
        </div>

        <div className="flex gap-1">
          {weeks.map((week, i) => (
            <div key={i} className="flex flex-col gap-1">
              {week.map((day, j) =>
                day ? (
                  <span
                    key={day.date}
                    title={`${formatDate(day.date)} — ${day.amount === 0 ? 'без начислений' : formatCurrency(day.amount, true)}`}
                    onMouseEnter={() => setHovered(day)}
                    onMouseLeave={() => setHovered(null)}
                    className={`trg-cell size-3 cursor-pointer rounded-[3px] transition-transform duration-150 hover:scale-150 ${
                      day.date === stats.best.date ? 'ring-2 ring-[var(--trigonum-warning)]' : ''
                    }`}
                    style={{ backgroundColor: levelColor[day.level], animationDelay: `${i * 12}ms` }}
                  />
                ) : (
                  <span key={`empty-${i}-${j}`} className="size-3" />
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-[var(--trigonum-muted)]">
        меньше
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <span key={level} className="size-3 rounded-[3px]" style={{ backgroundColor: levelColor[level] }} />
        ))}
        больше
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl border border-[var(--trigonum-border)] p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[var(--trigonum-ink)]">
              {formatDate(shown.date)}
              {!hovered && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--trigonum-warning)]">
                  <Trophy size={11} /> лучший день периода
                </span>
              )}
            </p>
            <p className="text-sm font-bold text-[var(--trigonum-success)]">{formatCurrency(shown.amount, true)}</p>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {breakdown.map((source) => (
              <div key={source.key} className="flex items-center gap-2 text-xs">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: source.color }} />
                <span className="flex-1 text-[var(--trigonum-text)]">{source.label}</span>
                <span className="font-semibold tabular-nums text-[var(--trigonum-ink)]">{formatCurrency(source.amount, true)}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-[var(--trigonum-muted)]">Наведите на клетку, чтобы посмотреть другой день</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-[color-mix(in_srgb,var(--trigonum-warning)_8%,white)] p-4">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-[#92650c]">
                <Flame size={15} /> Серия {accrualStreak.current} дн.
              </p>
              <p className="text-xs text-[var(--trigonum-muted)]">рекорд {accrualStreak.best}</p>
            </div>
            <div className="mt-2">
              <ProgressBar value={(accrualStreak.current / STREAK_MILESTONE) * 100} tone="green" />
            </div>
            <p className="mt-1.5 text-[11px] text-[var(--trigonum-muted)]">
              {accrualStreak.current >= STREAK_MILESTONE
                ? `Серия в ${STREAK_MILESTONE} дней собрана`
                : `До серии в ${STREAK_MILESTONE} дней осталось ${STREAK_MILESTONE - accrualStreak.current} дн.`}
            </p>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">По месяцам</p>
            <div className="flex items-end gap-2">
              {monthlyAccruals.map((month) => (
                <div key={month.key} className="flex flex-1 flex-col items-center gap-1" title={formatCurrency(month.amount, true)}>
                  <div
                    className="w-full rounded-t-md bg-[color-mix(in_srgb,var(--trigonum-success)_55%,white)] transition-[height] duration-500"
                    style={{ height: `${Math.max(6, (month.amount / monthlyMax) * 56)}px` }}
                  />
                  <span className="text-[10px] text-[var(--trigonum-muted)]">{month.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
