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
      // p-0 обязателен: у кнопки есть браузерный padding, и бегунок без left
      // отсчитывался бы от него, вылезая за правый край.
      className={`relative h-6 w-11 shrink-0 rounded-full p-0 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trigonum-blue)] focus-visible:ring-offset-2 ${
        checked
          ? tone === 'ink'
            ? 'bg-[var(--trigonum-ink)]'
            : 'bg-[var(--trigonum-success)]'
          : 'bg-[var(--trigonum-border)]'
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
