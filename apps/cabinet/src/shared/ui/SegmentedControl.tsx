interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
}

export function SegmentedControl<T extends string>({ value, onChange, options }: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex gap-1 rounded-lg border border-[var(--trigonum-border)] bg-[var(--trigonum-bg)] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            value === option.value
              ? 'bg-[var(--trigonum-surface)] text-[var(--trigonum-blue)] shadow-sm'
              : 'text-[var(--trigonum-muted)] hover:text-[var(--trigonum-ink)]'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
