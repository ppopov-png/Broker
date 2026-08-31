export function ProgressBar({ value, tone = 'blue' }: { value: number; tone?: 'blue' | 'green' }) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--trigonum-border)]">
      <div
        className="h-full rounded-full transition-[width]"
        style={{
          width: `${clamped}%`,
          backgroundColor: tone === 'green' ? 'var(--trigonum-green)' : 'var(--trigonum-blue)',
        }}
      />
    </div>
  )
}
