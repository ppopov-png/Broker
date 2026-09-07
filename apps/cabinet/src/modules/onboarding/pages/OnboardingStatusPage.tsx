import { AlertTriangle, ArrowRight, Check, Clock, Mail, RefreshCw, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMessageThreads } from '../../../shared/lib/onboarding/api'
import type { MessageThread, OnboardingHistoryEntry, OnboardingState } from '../../../shared/lib/onboarding/types'
import { useOnboardingState } from '../../../shared/lib/onboarding/useOnboarding'
import { Card } from '../../../shared/ui/Card'
import { CenteredSpinner, PageHeader } from '../../../shared/ui/PageHeader'
import { Pill, type PillTone } from '../../../shared/ui/Pill'
import { OutlineButton } from '../../../shared/ui/buttons'
import { ONBOARDING_STEPS, resolveCurrentStep, resolveStepStatuses, type StepStatus } from '../model/steps'

type Banner = {
  tone: 'warning' | 'error' | 'info' | 'success'
  title: string
  text: string
  reasonLabel?: string
  /** Подпись кнопки, ведущей на шаг-якорь баннера. Без неё кнопки нет. */
  cta?: string
}

function bannerFor(state: OnboardingState): Banner | null {
  switch (state) {
    case 'AMENDMENTS_REQUESTED':
      return {
        tone: 'warning',
        title: 'Запрошены уточнения',
        text: 'Анкету приняли, но комплаенсу не хватает данных. Дополните ответы и отправьте анкету ещё раз — заявка вернётся на рассмотрение.',
        reasonLabel: 'Комментарий проверяющего',
        cta: 'Дополнить анкету',
      }
    case 'REVERIFICATION_REQUIRED':
      return {
        tone: 'warning',
        title: 'Нужна повторная проверка личности',
        text: 'Срок действия документа или самой проверки истёк. Пройдите её заново — остальные шаги останутся в силе.',
        reasonLabel: 'Причина',
        cta: 'Пройти проверку',
      }
    case 'IDENTITY_FAILED':
      return {
        tone: 'error',
        title: 'Проверка личности не пройдена',
        text: 'Провайдер не подтвердил документы. Проверку можно пройти заново — остальные шаги при этом сохранятся.',
        reasonLabel: 'Причина',
        cta: 'Пройти заново',
      }
    case 'REJECTED':
      return {
        tone: 'error',
        title: 'Заявка отклонена',
        text: 'Открыть счёт по этой заявке не получится. Если считаете решение ошибочным, напишите в поддержку.',
        reasonLabel: 'Причина',
      }
    case 'SUSPENDED':
      return {
        tone: 'error',
        title: 'Доступ приостановлен',
        text: 'Операции временно недоступны. Свяжитесь с поддержкой, чтобы разобраться.',
        reasonLabel: 'Причина',
      }
    case 'UNDER_REVIEW':
      return {
        tone: 'info',
        title: 'Заявка на рассмотрении',
        text: 'Обычно проверка занимает 1–2 рабочих дня. Мы напишем, как только будет решение.',
      }
    case 'APPROVED':
      return {
        tone: 'success',
        title: 'Заявка одобрена',
        text: 'Счёт открыт. Можно пополнять баланс и размещать капитал в продуктах Trigonum.',
      }
    default:
      return null
  }
}

const bannerStyles: Record<Banner['tone'], { border: string; background: string; color: string }> = {
  warning: {
    border: 'color-mix(in srgb, var(--trigonum-warning) 45%, white)',
    background: 'color-mix(in srgb, var(--trigonum-warning) 8%, white)',
    color: '#92650c',
  },
  error: {
    border: 'color-mix(in srgb, var(--trigonum-danger) 40%, white)',
    background: 'color-mix(in srgb, var(--trigonum-danger) 6%, white)',
    color: 'var(--trigonum-danger)',
  },
  info: {
    border: 'color-mix(in srgb, var(--trigonum-blue) 35%, white)',
    background: 'color-mix(in srgb, var(--trigonum-blue) 6%, white)',
    color: 'var(--trigonum-blue)',
  },
  success: {
    border: 'color-mix(in srgb, var(--trigonum-success) 40%, white)',
    background: 'color-mix(in srgb, var(--trigonum-success) 7%, white)',
    color: 'var(--trigonum-success)',
  },
}

const statusLabel: Record<StepStatus, string> = {
  completed: 'Пройден',
  current: 'Текущий шаг',
  pending: 'Ожидает',
  'action-required': 'Нужны уточнения',
  failed: 'Не пройден',
  rejected: 'Отказано',
  blocked: 'Приостановлен',
}

const statusTone: Record<StepStatus, PillTone> = {
  completed: 'success',
  current: 'info',
  pending: 'neutral',
  'action-required': 'warning',
  failed: 'danger',
  rejected: 'danger',
  blocked: 'danger',
}

/** Цвет кружка с номером шага — тот же язык, что и у плашки статуса. */
const markerClass: Record<StepStatus, string> = {
  completed: 'bg-[var(--trigonum-success)] text-white',
  current: 'bg-[var(--trigonum-ink)] text-white',
  pending: 'bg-[var(--trigonum-bg)] text-[var(--trigonum-muted)]',
  'action-required': 'bg-[var(--trigonum-warning)] text-white',
  failed: 'bg-[var(--trigonum-danger)] text-white',
  rejected: 'bg-[var(--trigonum-danger)] text-white',
  blocked: 'bg-[var(--trigonum-danger)] text-white',
}

/** Подпись кнопки зависит от того, почему шаг требует внимания. */
const actionLabel: Partial<Record<StepStatus, string>> = {
  current: 'Перейти',
  'action-required': 'Дополнить анкету',
  failed: 'Пройти заново',
}

/**
 * Один и тот же шаг может требовать внимания по разным причинам, и слова тогда
 * нужны разные: истёкшую проверку личности не «дополняют анкетой». Переопределение
 * применяется только к шагу-якорю — тому, на котором заявка стоит сейчас.
 */
const anchorOverride: Partial<Record<OnboardingState, { status?: string; action?: string }>> = {
  REVERIFICATION_REQUIRED: { status: 'Нужна повторная проверка', action: 'Пройти проверку' },
}

/** Дата завершения этапа — последний по времени переход в одно из его состояний. */
function completedAt(history: OnboardingHistoryEntry[], states: OnboardingState[]): string | null {
  const matching = history.filter((entry) => states.includes(entry.toState))
  if (matching.length === 0) return null
  const last = matching.reduce((latest, entry) =>
    Date.parse(entry.createdAt) > Date.parse(latest.createdAt) ? entry : latest,
  )
  return new Date(last.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function OnboardingStatusPage() {
  const { status, history, loading, error, refetch } = useOnboardingState()
  const [threads, setThreads] = useState<MessageThread[]>([])

  useEffect(() => {
    let cancelled = false
    void getMessageThreads().then((list) => {
      if (!cancelled) setThreads(list)
    })
    return () => {
      cancelled = true
    }
  }, [status?.currentState])

  if (loading && !status) {
    return (
      <div className="pb-10">
        <PageHeader title="Статус заявки" />
        <CenteredSpinner label="Загружаем статус заявки" />
      </div>
    )
  }

  if (error || !status) {
    return (
      <div className="pb-10">
        <PageHeader title="Статус заявки" />
        <Card>
          <p className="text-sm text-[var(--trigonum-muted)]">{error ?? 'Данные заявки недоступны'}</p>
          <OutlineButton type="button" className="mt-4" onClick={refetch}>
            <RefreshCw size={15} />
            Повторить
          </OutlineButton>
        </Card>
      </div>
    )
  }

  const banner = bannerFor(status.currentState)
  const statuses = resolveStepStatuses(status.currentState, history)
  const currentStep = resolveCurrentStep(status.currentState)
  const stepNumber = currentStep ? ONBOARDING_STEPS.indexOf(currentStep) + 1 : 0
  const blockedFlow = status.currentState === 'REJECTED' || status.currentState === 'SUSPENDED'

  return (
    <div className="pb-10">
      <PageHeader
        title="Статус заявки"
        description="Здесь видно, какие шаги пройдены и что осталось сделать, чтобы открыть счёт."
      />

      <div className="flex flex-col gap-5">
        {banner && (
          <section
            className="rounded-[var(--trigonum-radius-lg)] border p-5"
            style={{ borderColor: bannerStyles[banner.tone].border, background: bannerStyles[banner.tone].background }}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <p className="text-sm font-bold" style={{ color: bannerStyles[banner.tone].color }}>
                {banner.title}
              </p>
              {currentStep && (
                <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--trigonum-ink)]">
                  Шаг {stepNumber} из {ONBOARDING_STEPS.length} — {currentStep.title}
                </span>
              )}
            </div>
            <p className="mt-1.5 max-w-[70ch] text-sm text-[var(--trigonum-text)]">{banner.text}</p>

            {banner.reasonLabel && status.metadata?.reason && (
              <p className="mt-3 rounded-lg bg-white/70 px-3 py-2.5 text-sm text-[var(--trigonum-text)]">
                <b className="font-semibold text-[var(--trigonum-ink)]">{banner.reasonLabel}:</b>{' '}
                {status.metadata.reason}
              </p>
            )}

            {banner.cta && currentStep?.actionPath && (
              <Link
                to={currentStep.actionPath}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--trigonum-ink)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-125"
              >
                {banner.cta}
                <ArrowRight size={15} />
              </Link>
            )}

            {status.currentState === 'APPROVED' && (
              <Link
                to="/invest"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--trigonum-ink)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-125"
              >
                Начать инвестировать
                <ArrowRight size={15} />
              </Link>
            )}
          </section>
        )}

        <Card title="Шаги проверки">
          <ol className="flex flex-col divide-y divide-[var(--trigonum-border)]">
            {ONBOARDING_STEPS.map((step, index) => {
              const stepStatus = statuses[index]
              const done = completedAt(history, step.states)
              const override = index === stepNumber - 1 ? anchorOverride[status.currentState] : undefined
              const action = override?.action ?? actionLabel[stepStatus]
              return (
                <li key={step.key} className="flex flex-wrap items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${markerClass[stepStatus]}`}
                  >
                    {stepStatus === 'completed' ? (
                      <Check size={14} strokeWidth={3} />
                    ) : stepStatus === 'failed' || stepStatus === 'rejected' || stepStatus === 'blocked' ? (
                      <X size={14} strokeWidth={3} />
                    ) : stepStatus === 'action-required' ? (
                      <AlertTriangle size={13} strokeWidth={2.5} />
                    ) : (
                      index + 1
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{step.title}</p>
                    {done && stepStatus === 'completed' && (
                      <p className="text-xs text-[var(--trigonum-muted)]">Пройден {done}</p>
                    )}
                  </div>

                  <Pill tone={statusTone[stepStatus]}>{override?.status ?? statusLabel[stepStatus]}</Pill>

                  {action && step.actionPath && !blockedFlow && (
                    <Link
                      to={step.actionPath}
                      className="shrink-0 rounded-lg bg-[var(--trigonum-ink)] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-125"
                    >
                      {action}
                    </Link>
                  )}
                </li>
              )
            })}
          </ol>
        </Card>

        <Card title="Сообщения от проверяющего">
          {threads.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Mail size={22} className="text-[var(--trigonum-muted)]" />
              <p className="text-sm font-semibold text-[var(--trigonum-ink)]">Сообщений нет</p>
              <p className="max-w-[46ch] text-xs text-[var(--trigonum-muted)]">
                Если по заявке потребуются уточнения, они появятся здесь и придут на почту.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
              {threads.map((thread) => (
                <Link
                  key={thread.id}
                  to="/support"
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 transition hover:opacity-80"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--trigonum-ink)]">
                      {thread.subject ?? 'Сообщение от проверяющего'}
                    </p>
                    <p className="truncate text-xs text-[var(--trigonum-muted)]">{thread.lastMessage}</p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-[var(--trigonum-muted)]">
                    {new Date(thread.updatedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {status.currentState !== 'APPROVED' && (
          <p className="flex items-center gap-2 text-xs text-[var(--trigonum-muted)]">
            <Clock size={13} />
            Статус обновляется автоматически
          </p>
        )}
      </div>
    </div>
  )
}
