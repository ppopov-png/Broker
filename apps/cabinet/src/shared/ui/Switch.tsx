export function Switch({
  checked,
  onChange,
  label,
  tone = 'success',
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  /** `ink` — спокойный графитовый вариант для страниц с собственным акцентом. */
  tone?: 'success' | 'ink'
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked
          ? tone === 'ink'
            ? 'bg-[var(--trigonum-ink)]'
            : 'bg-[var(--trigonum-success)]'
          : 'bg-[var(--trigonum-border)]'
      }`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
      />
    </button>
  )
}
