export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M16 3L29 27H3L16 3Z" fill="url(#trigonum-logo-gradient)" />
        <path d="M16 10L23 23H9L16 10Z" fill="var(--trigonum-surface)" />
        <defs>
          <linearGradient id="trigonum-logo-gradient" x1="3" y1="3" x2="29" y2="27" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--trigonum-blue)" />
            <stop offset="0.55" stopColor="var(--trigonum-cyan)" />
            <stop offset="1" stopColor="var(--trigonum-green)" />
          </linearGradient>
        </defs>
      </svg>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[15px] font-extrabold tracking-wide text-[var(--trigonum-ink)]">TRIGONUM</span>
          <span className="block text-[10px] font-semibold tracking-[0.25em] text-[var(--trigonum-muted)]">BROKER</span>
        </span>
      )}
    </div>
  )
}
