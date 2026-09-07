import { Check, TriangleAlert, X } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ToastTone = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  tone: ToastTone
  text: string
}

const ToastContext = createContext<((tone: ToastTone, text: string) => void) | null>(null)

const AUTO_HIDE_MS = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const push = useCallback((tone: ToastTone, text: string) => {
    const id = Date.now() + Math.random()
    setItems((current) => [...current, { id, tone, text }])
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), AUTO_HIDE_MS)
  }, [])

  const value = useMemo(() => push, [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {items.length > 0 &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-4 bottom-24 z-[200] flex flex-col items-center gap-2 lg:inset-x-auto lg:bottom-6 lg:right-6 lg:items-end">
            {items.map((item) => (
              <div
                key={item.id}
                role="status"
                className="trg-rise pointer-events-auto flex w-full max-w-[420px] items-start gap-3 rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] px-4 py-3 shadow-[0_16px_40px_rgb(8_27_58/16%)]"
              >
                <span
                  className={`mt-0.5 shrink-0 ${
                    item.tone === 'success'
                      ? 'text-[var(--trigonum-success)]'
                      : item.tone === 'error'
                        ? 'text-[var(--trigonum-danger)]'
                        : 'text-[var(--trigonum-blue)]'
                  }`}
                >
                  {item.tone === 'success' ? <Check size={16} strokeWidth={2.5} /> : <TriangleAlert size={16} />}
                </span>
                <p className="min-w-0 flex-1 text-sm text-[var(--trigonum-text)]">{item.text}</p>
                <button
                  type="button"
                  onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
                  className="shrink-0 rounded-md p-1 text-[var(--trigonum-muted)] transition hover:bg-[var(--trigonum-bg)]"
                  aria-label="Закрыть"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const push = useContext(ToastContext)
  if (!push) throw new Error('useToast должен вызываться внутри ToastProvider')
  return push
}
