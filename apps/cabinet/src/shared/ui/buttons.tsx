import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>

export function PrimaryButton({ children, className = '', ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={{ backgroundImage: 'var(--trigonum-gradient-cta)' }}
      {...props}
    >
      {children}
    </button>
  )
}

export function OutlineButton({ children, className = '', ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--trigonum-ink)] transition hover:border-[var(--trigonum-blue)] hover:text-[var(--trigonum-blue)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function GhostButton({ children, className = '', ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--trigonum-blue)] transition hover:bg-[color-mix(in_srgb,var(--trigonum-blue)_8%,white)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
