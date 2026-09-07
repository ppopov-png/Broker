import type { ReactNode } from 'react'

/** Общая шапка страницы: заголовок, описание шага и место под действие. */
export function PageHeader({
  title,
  description,
  back,
  action,
}: {
  title: string
  description?: string
  back?: ReactNode
  action?: ReactNode
}) {
  return (
    <header className="mb-6">
      {back}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-[var(--trigonum-ink)]">{title}</h1>
          {description && <p className="mt-1 max-w-[70ch] text-sm text-[var(--trigonum-muted)]">{description}</p>}
        </div>
        {action}
      </div>
    </header>
  )
}

/** Спиннер по центру — состояние loading для всех экранов онбординга. */
export function CenteredSpinner({ label = 'Загружаем данные' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20" role="status">
      <span className="size-8 animate-spin rounded-full border-2 border-[var(--trigonum-border)] border-t-[var(--trigonum-blue)]" />
      <p className="text-sm text-[var(--trigonum-muted)]">{label}</p>
    </div>
  )
}
