import { Flame } from 'lucide-react'
import { formatCurrency, formatDate } from '../../../shared/lib/format'
import { Card } from '../../../shared/ui/Card'
import { accrualStreak, accrualTotal, dailyAccruals, type DailyAccrual } from '../model/capital-data'

const levelColor: Record<DailyAccrual['level'], string> = {
  0: 'var(--trigonum-border)',
  1: 'color-mix(in srgb, var(--trigonum-success) 25%, white)',
  2: 'color-mix(in srgb, var(--trigonum-success) 45%, white)',
  3: 'color-mix(in srgb, var(--trigonum-success) 70%, white)',
  4: 'var(--trigonum-success)',
}

/** Раскладываем дни по колонкам-неделям, как в календаре активности. */
function toWeeks(days: DailyAccrual[]): DailyAccrual[][] {
  const weeks: DailyAccrual[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

export function AccrualHeatmap() {
  const weeks = toWeeks(dailyAccruals)

  return (
    <Card
      title="Календарь начислений"
      subtitle={`За последние ${dailyAccruals.length} дней начислено ${formatCurrency(accrualTotal, true)}`}
      action={
        <span className="flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--trigonum-warning)_14%,white)] px-2.5 py-1 text-xs font-semibold text-[#92650c]">
          <Flame size={13} /> Серия {accrualStreak.current} дн.
        </span>
      }
    >
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-1">
          {weeks.map((week, i) => (
            <div key={i} className="flex flex-col gap-1">
              {week.map((day) => (
                <span
                  key={day.date}
                  title={`${formatDate(day.date)} — ${day.amount === 0 ? 'без начислений' : formatCurrency(day.amount, true)}`}
                  className="trg-cell size-3 rounded-[3px] transition-transform duration-150 hover:scale-150 hover:ring-2 hover:ring-[var(--trigonum-blue)]"
                  style={{ backgroundColor: levelColor[day.level], animationDelay: `${i * 12}ms` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--trigonum-muted)]">
        <span>Лучшая серия: {accrualStreak.best} дн. подряд</span>
        <span className="flex items-center gap-1.5">
          меньше
          {([0, 1, 2, 3, 4] as const).map((level) => (
            <span key={level} className="size-3 rounded-[3px]" style={{ backgroundColor: levelColor[level] }} />
          ))}
          больше
        </span>
      </div>
    </Card>
  )
}
