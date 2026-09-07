import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, useSession } from '../../shared/lib/session'
import { Modal } from '../../shared/ui/Modal'
import { OutlineButton } from '../../shared/ui/buttons'

/**
 * Выход всегда через подтверждение: случайное нажатие в меню не должно
 * выбрасывать из кабинета посреди заявки.
 */
export function SignOutButton({ className = '', onDone }: { className?: string; onDone?: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const session = useSession()
  const navigate = useNavigate()

  const leave = () => {
    signOut()
    setConfirming(false)
    onDone?.()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--trigonum-danger)] transition hover:bg-[var(--trigonum-bg)] ${className}`}
      >
        <LogOut size={16} />
        Выйти
      </button>

      <Modal open={confirming} onClose={() => setConfirming(false)} title="Выйти из кабинета?">
        <p className="text-sm text-[var(--trigonum-text)]">
          {session ? `Сессия ${session.email} завершится на этом устройстве.` : 'Сессия завершится на этом устройстве.'}{' '}
          Данные счёта, заявки и подписанные документы сохранятся — они вернутся при следующем входе.
        </p>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <OutlineButton type="button" onClick={() => setConfirming(false)}>
            Остаться
          </OutlineButton>
          <button
            type="button"
            onClick={leave}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--trigonum-danger)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <LogOut size={15} />
            Выйти
          </button>
        </div>
      </Modal>
    </>
  )
}
