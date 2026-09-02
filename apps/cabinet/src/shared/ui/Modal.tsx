import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
}

export function Modal({ open, onClose, title, subtitle, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="trg-fade fixed inset-0 z-50 grid place-items-center bg-[rgb(8_27_58_/_45%)] p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="trg-pop w-full max-w-md rounded-[var(--trigonum-radius-lg)] bg-[var(--trigonum-surface)] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[var(--trigonum-ink)]">{title}</h3>
            {subtitle && <p className="mt-1 text-sm text-[var(--trigonum-muted)]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-full text-[var(--trigonum-muted)] hover:bg-[var(--trigonum-bg)]"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
