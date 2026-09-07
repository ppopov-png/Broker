import { ArrowRight, Check, Clock, Mail, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMessageThreads } from '../../../shared/lib/onboarding/api'
import type { MessageThread, OnboardingHistoryEntry, OnboardingState } from '../../../shared/lib/onboarding/types'
import { useOnboardingState } from '../../../shared/lib/onboarding/useOnboarding'
import { Card } from '../../../shared/ui/Card'
import { CenteredSpinner, PageHeader } from '../../../shared/ui/PageHeader'
import { Pill } from '../../../shared/ui/Pill'
import { OutlineButton } from '../../../shared/ui/buttons'
import { ONBOARDING_STEPS, resolveStepStatuses, type StepStatus } from '../model/steps'

type Banner = { tone: 'warning' | 'error' | 'info' | 'success'; title: string; text: string; reasonLabel?: string }

function bannerFor(state: OnboardingState): Banner | null {
  switch (state) {
    case 'AMENDMENTS_REQUESTED':
      return {
        tone: 'warning',
        title: 'Запрошены уточнения',
        text: 'Комплаенс просит дополнить анкету. Откройте углублённую проверку и отправьте её ещё раз.',
        reasonLabel: 'Комментарий проверяющего',
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
  'in-progress': 'В процессе',
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
  const statuses = resolveStepStatuses(status.currentState)
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
            <p className="text-sm font-bold" style={{ color: bannerStyles[banner.tone].color }}>
              {banner.title}
            </p>
            <p className="mt-1.5 max-w-[70ch] text-sm text-[var(--trigonum-text)]">{banner.text}</p>

            {banner.reasonLabel && status.metadata?.reason && (
              <p className="mt-3 rounded-lg bg-white/70 px-3 py-2.5 text-sm text-[var(--trigonum-text)]">
                <b className="font-semibold text-[var(--trigonum-ink)]">{banner.reasonLabel}:</b>{' '}
                {status.metadata.reason}
              </p>
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
              return (
                <li key={step.key} className="flex flex-wrap items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      stepStatus === 'completed'
                        ? 'bg-[var(--trigonum-success)] text-white'
                        : stepStatus === 'current'
                          ? 'bg-[var(--trigonum-ink)] text-white'
                          : 'bg-[var(--trigonum-bg)] text-[var(--trigonum-muted)]'
                    }`}
                  >
                    {stepStatus === 'completed' ? <Check size={14} strokeWidth={3} /> : index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{step.title}</p>
                    {done && stepStatus === 'completed' && (
                      <p className="text-xs text-[var(--trigonum-muted)]">Пройден {done}</p>
                    )}
                  </div>

                  <Pill
                    tone={stepStatus === 'completed' ? 'success' : stepStatus === 'current' ? 'info' : 'neutral'}
                  >
                    {statusLabel[stepStatus]}
                  </Pill>

                  {stepStatus === 'current' && step.actionPath && !blockedFlow && (
                    <Link
                      to={step.actionPath}
                      className="shrink-0 rounded-lg bg-[var(--trigonum-ink)] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-125"
                    >
                      Перейти
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
