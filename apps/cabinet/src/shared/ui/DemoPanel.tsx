import { FlaskConical, RotateCcw, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  completeKycNow,
  getOnboardingState,
  resetOnboarding,
  setOnboardingState,
} from '../lib/onboarding/api'
import type { OnboardingState } from '../lib/onboarding/types'
import { ONBOARDING_ROUTES, notifyOnboardingChanged } from '../lib/onboarding/useOnboarding'

/**
 * Пульт прототипа. Бэкенда нет: письмо на почту не придёт, провайдер проверки
 * не пришлёт вебхук. Пульт подменяет эти события, чтобы можно было открыть
 * любой шаг и посмотреть, как он выглядит.
 */

interface Jump {
  state: OnboardingState
  label: string
  route?: string
}

const FLOW: Jump[] = [
  { state: 'REGISTERED', label: 'Зарегистрирован', route: ONBOARDING_ROUTES.status },
  { state: 'EMAIL_VERIFIED', label: 'Почта подтверждена', route: ONBOARDING_ROUTES.identity },
  { state: 'IDENTITY_VERIFIED', label: 'Личность подтверждена', route: ONBOARDING_ROUTES.selfCertification },
  { state: 'SELF_CERT_COMPLETED', label: 'Самосертификация пройдена', route: ONBOARDING_ROUTES.agreements },
  { state: 'AGREEMENTS_ACCEPTED', label: 'Соглашения подписаны', route: ONBOARDING_ROUTES.documents },
  { state: 'DOCUMENTS_SUBMITTED', label: 'Досье отправлено', route: ONBOARDING_ROUTES.edd },
  { state: 'EDD_SUBMITTED', label: 'Анкета отправлена', route: ONBOARDING_ROUTES.status },
  { state: 'UNDER_REVIEW', label: 'На рассмотрении', route: ONBOARDING_ROUTES.status },
]

/** Чем комплаенс закрывает заявку после отправки анкеты. */
const REVIEW_DECISIONS: { state: OnboardingState; label: string; reason?: string }[] = [
  { state: 'APPROVED', label: 'Одобрить заявку' },
  {
    state: 'AMENDMENTS_REQUESTED',
    label: 'Запросить правки',
    reason: 'Приложите выписку за последние три месяца — текущая старше полугода.',
  },
  { state: 'REJECTED', label: 'Отклонить заявку', reason: 'Не удалось подтвердить происхождение средств.' },
]

const EXCEPTIONS: { state: OnboardingState; label: string; reason?: string }[] = [
  { state: 'IDENTITY_FAILED', label: 'Проверка личности провалена' },
  { state: 'SUSPENDED', label: 'Доступ приостановлен', reason: 'Проверка службы комплаенса по операции от 22.08.' },
  { state: 'REVERIFICATION_REQUIRED', label: 'Нужна повторная проверка' },
]

export function DemoPanel() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<OnboardingState | null>(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    void getOnboardingState().then((status) => setCurrent(status.currentState))
  }, [open])

  const apply = async (action: () => Promise<void>, route?: string) => {
    setBusy(true)
    await action()
    const status = await getOnboardingState()
    setCurrent(status.currentState)
    setBusy(false)
    // Экран может быть уже открыт на этом же маршруте — просим его перечитать данные.
    notifyOnboardingChanged()
    if (route) {
      setOpen(false)
      navigate(route)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-[76px] right-4 z-[150] flex items-center gap-2 rounded-full border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] px-3.5 py-2.5 text-xs font-semibold text-[var(--trigonum-ink)] shadow-[0_10px_30px_rgb(8_27_58/18%)] lg:bottom-6"
      >
        <FlaskConical size={15} />
        Прототип
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-end p-4 lg:p-6">
      <button
        type="button"
        aria-label="Закрыть пульт"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-[rgb(8_27_58/35%)]"
      />

      <div className="trg-rise relative flex max-h-[80vh] w-full max-w-[380px] flex-col overflow-hidden rounded-[var(--trigonum-radius-lg)] border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] shadow-[0_24px_60px_rgb(8_27_58/28%)]">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--trigonum-border)] p-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-bold text-[var(--trigonum-ink)]">
              <FlaskConical size={15} />
              Пульт прототипа
            </p>
            <p className="mt-1 text-xs text-[var(--trigonum-muted)]">
              Бэкенда нет — письма и ответы провайдера подменяются здесь
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="shrink-0 rounded-lg p-1.5 text-[var(--trigonum-muted)] transition hover:bg-[var(--trigonum-bg)]"
            aria-label="Закрыть"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="rounded-xl bg-[var(--trigonum-bg)] px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">
              Текущее состояние
            </p>
            <p className="mt-0.5 text-sm font-bold text-[var(--trigonum-ink)]">{current ?? '—'}</p>
          </div>

          <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">
            Шаги по порядку
          </p>
          <div className="flex flex-col gap-1.5">
            {FLOW.map((jump) => (
              <button
                key={jump.state}
                type="button"
                disabled={busy}
                onClick={() => void apply(() => setOnboardingState(jump.state), jump.route)}
                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition disabled:opacity-50 ${
                  current === jump.state
                    ? 'border-[var(--trigonum-ink)] bg-[var(--trigonum-ink)] text-white'
                    : 'border-[var(--trigonum-border)] text-[var(--trigonum-text)] hover:border-[var(--trigonum-ink)]'
                }`}
              >
                <span className="min-w-0 truncate font-medium">{jump.label}</span>
                <span
                  className={`shrink-0 text-[10px] ${current === jump.state ? 'text-white/55' : 'text-[var(--trigonum-muted)]'}`}
                >
                  {jump.state}
                </span>
              </button>
            ))}
          </div>

          <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">
            Решение комплаенса
          </p>
          <div className="flex flex-col gap-1.5">
            {REVIEW_DECISIONS.map((item) => (
              <button
                key={item.state}
                type="button"
                disabled={busy}
                onClick={() => void apply(() => setOnboardingState(item.state, item.reason), ONBOARDING_ROUTES.status)}
                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition disabled:opacity-50 ${
                  current === item.state
                    ? 'border-[var(--trigonum-ink)] bg-[var(--trigonum-ink)] text-white'
                    : 'border-[var(--trigonum-border)] text-[var(--trigonum-text)] hover:border-[var(--trigonum-ink)]'
                }`}
              >
                <span className="min-w-0 truncate font-medium">{item.label}</span>
                <span
                  className={`shrink-0 text-[10px] ${current === item.state ? 'text-white/55' : 'text-[var(--trigonum-muted)]'}`}
                >
                  {item.state}
                </span>
              </button>
            ))}
          </div>

          <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">
            Особые сценарии
          </p>
          <div className="flex flex-col gap-1.5">
            {EXCEPTIONS.map((item) => (
              <button
                key={item.state}
                type="button"
                disabled={busy}
                onClick={() =>
                  void apply(
                    // Провал закрываем через решение провайдера, иначе останется
                    // успешная сессия и экран покажет подтверждённую личность.
                    item.state === 'IDENTITY_FAILED'
                      ? () => completeKycNow('Declined')
                      : () => setOnboardingState(item.state, item.reason),
                    item.state === 'IDENTITY_FAILED' || item.state === 'REVERIFICATION_REQUIRED'
                      ? ONBOARDING_ROUTES.identity
                      : ONBOARDING_ROUTES.status,
                  )
                }
                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition disabled:opacity-50 ${
                  current === item.state
                    ? 'border-[var(--trigonum-ink)] bg-[var(--trigonum-ink)] text-white'
                    : 'border-[var(--trigonum-border)] text-[var(--trigonum-text)] hover:border-[var(--trigonum-ink)]'
                }`}
              >
                <span className="min-w-0 truncate font-medium">{item.label}</span>
                <span
                  className={`shrink-0 text-[10px] ${current === item.state ? 'text-white/55' : 'text-[var(--trigonum-muted)]'}`}
                >
                  {item.state}
                </span>
              </button>
            ))}
          </div>

          <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">
            Ответ провайдера проверки
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void apply(() => completeKycNow('Approved'), ONBOARDING_ROUTES.identity)}
              className="rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm font-semibold text-[var(--trigonum-ink)] transition hover:border-[var(--trigonum-ink)] disabled:opacity-50"
            >
              Подтвердить
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void apply(() => completeKycNow('Declined'), ONBOARDING_ROUTES.identity)}
              className="rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm font-semibold text-[var(--trigonum-danger)] transition hover:border-[var(--trigonum-danger)] disabled:opacity-50"
            >
              Отклонить
            </button>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => void apply(() => resetOnboarding(), ONBOARDING_ROUTES.status)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm font-semibold text-[var(--trigonum-muted)] transition hover:border-[var(--trigonum-ink)] hover:text-[var(--trigonum-ink)] disabled:opacity-50"
          >
            <RotateCcw size={14} />
            Начать онбординг заново
          </button>
        </div>
      </div>
    </div>
  )
}
