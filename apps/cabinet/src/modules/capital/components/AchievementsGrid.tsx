import { Award, Lock } from 'lucide-react'
import { Card } from '../../../shared/ui/Card'
import { achievements } from '../model/capital-data'

export function AchievementsGrid() {
  const unlocked = achievements.filter((a) => a.unlocked).length

  return (
    <Card
      title="Достижения"
      subtitle="Открываются за шаги в инвестировании"
      action={
        <span className="text-xs font-semibold text-[var(--trigonum-muted)]">
          <b className="text-[var(--trigonum-ink)]">{unlocked}</b> из {achievements.length}
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {achievements.map((a, i) => (
          <div
            key={a.id}
            style={{ animationDelay: `${i * 55}ms` }}
            className={`trg-rise rounded-xl border p-3 transition duration-200 hover:-translate-y-1 hover:shadow-[var(--trigonum-shadow-card)] ${
              a.unlocked
                ? 'trg-sheen border-[color-mix(in_srgb,var(--trigonum-success)_35%,white)] bg-[color-mix(in_srgb,var(--trigonum-success)_7%,white)]'
                : 'border-dashed border-[var(--trigonum-border)] bg-[var(--trigonum-bg)]'
            }`}
          >
            <span
              className={`grid size-9 place-items-center rounded-lg transition-transform duration-200 ${
                a.unlocked
                  ? 'bg-[color-mix(in_srgb,var(--trigonum-success)_16%,white)] text-[var(--trigonum-success)]'
                  : 'bg-[color-mix(in_srgb,var(--trigonum-muted)_12%,white)] text-[var(--trigonum-muted)]'
              }`}
            >
              {a.unlocked ? <Award size={18} /> : <Lock size={16} />}
            </span>
            <p className={`mt-2 text-sm font-semibold ${a.unlocked ? 'text-[var(--trigonum-ink)]' : 'text-[var(--trigonum-muted)]'}`}>
              {a.title}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-[var(--trigonum-muted)]">{a.description}</p>
            <p className={`mt-2 text-[11px] font-semibold ${a.unlocked ? 'text-[var(--trigonum-success)]' : 'text-[var(--trigonum-muted)]'}`}>
              {a.unlocked ? `Получено ${a.date}` : a.progress}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}
