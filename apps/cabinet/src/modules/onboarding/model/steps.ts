import type { ClientType } from '@trigonum/shared'
import type { OnboardingHistoryEntry, OnboardingState } from '../../../shared/lib/onboarding/types'
import { ONBOARDING_ROUTES } from '../../../shared/lib/onboarding/useOnboarding'

export interface OnboardingStep {
  key: string
  title: string
  /** Состояния, которые относятся к этому этапу. */
  states: OnboardingState[]
  actionPath?: string
}

/**
 * Маршрут один, формулировки — разные. У компании проверяется не «личность
 * клиента», а компания и её подписант, и самосертификацию заполняют за
 * бенефициаров, а не за себя. Подменять при этом состояния было бы дороже:
 * машина, гард и история переходов остаются общими.
 */
export function onboardingSteps(clientType: ClientType = 'individual'): OnboardingStep[] {
  const company = clientType === 'company'
  return [
    { key: 'registration', title: 'Регистрация', states: ['REGISTERED'] },
    { key: 'email', title: 'Подтверждение email', states: ['EMAIL_VERIFIED'] },
    {
      key: 'identity',
      title: company ? 'Проверка компании и подписанта' : 'Проверка личности',
      states: ['IDENTITY_IN_PROGRESS', 'IDENTITY_VERIFIED', 'IDENTITY_FAILED'],
      actionPath: ONBOARDING_ROUTES.identity,
    },
    {
      key: 'self-cert',
      title: 'Самосертификация',
      states: ['SELF_CERT_COMPLETED'],
      actionPath: ONBOARDING_ROUTES.selfCertification,
    },
    {
      key: 'agreements',
      title: 'Соглашения',
      states: ['AGREEMENTS_ACCEPTED'],
      actionPath: ONBOARDING_ROUTES.agreements,
    },
    {
      key: 'documents',
      title: company ? 'Документы компании' : 'Документы',
      states: ['DOCUMENTS_SUBMITTED'],
      actionPath: ONBOARDING_ROUTES.documents,
    },
    {
      key: 'edd',
      title: 'Углублённая проверка',
      states: ['EDD_IN_PROGRESS', 'EDD_SUBMITTED'],
      actionPath: ONBOARDING_ROUTES.edd,
    },
    { key: 'review', title: 'На рассмотрении', states: ['UNDER_REVIEW'] },
    { key: 'approved', title: 'Одобрено', states: ['APPROVED'], actionPath: '/' },
  ]
}

/** Список для мест, где тип клиента не важен: ключи и порядок у веток общие. */
export const ONBOARDING_STEPS: OnboardingStep[] = onboardingSteps()

/**
 * Эти состояния означают «этап завершён»: сам этап красится завершённым,
 * а текущим становится следующий.
 */
const COMPLETING_STATES: OnboardingState[] = [
  'EMAIL_VERIFIED',
  'IDENTITY_VERIFIED',
  'SELF_CERT_COMPLETED',
  'AGREEMENTS_ACCEPTED',
  'DOCUMENTS_SUBMITTED',
  'EDD_SUBMITTED',
]

export type StepStatus = 'completed' | 'current' | 'pending' | 'action-required' | 'failed' | 'rejected' | 'blocked'

/**
 * Состояния, которые выпадают из линейного трека. У каждого есть шаг-якорь —
 * этап, на котором заявка остановилась. Без якоря ни один шаг не совпадал бы
 * с состоянием, и весь трек рисовался «Ожидает», хотя регистрация и почта
 * давно пройдены.
 */
const OFF_TRACK: Partial<Record<OnboardingState, { anchorKey: string; status: StepStatus }>> = {
  IDENTITY_FAILED: { anchorKey: 'identity', status: 'failed' },
  REVERIFICATION_REQUIRED: { anchorKey: 'identity', status: 'action-required' },
  AMENDMENTS_REQUESTED: { anchorKey: 'edd', status: 'action-required' },
  REJECTED: { anchorKey: 'review', status: 'rejected' },
  SUSPENDED: { anchorKey: 'review', status: 'blocked' },
}

/** Шаг, на котором заявка стоит прямо сейчас: к нему привязаны баннер и CTA. */
export function resolveCurrentStep(current: OnboardingState): OnboardingStep | null {
  const index = resolveAnchorIndex(current)
  return index === -1 ? null : (ONBOARDING_STEPS[index] ?? null)
}

function resolveAnchorIndex(current: OnboardingState): number {
  const offTrack = OFF_TRACK[current]
  if (offTrack) return ONBOARDING_STEPS.findIndex((step) => step.key === offTrack.anchorKey)

  const ownerIndex = ONBOARDING_STEPS.findIndex((step) => step.states.includes(current))
  if (ownerIndex === -1) return -1
  return COMPLETING_STATES.includes(current) ? ownerIndex + 1 : ownerIndex
}

export function resolveStepStatuses(current: OnboardingState, history: OnboardingHistoryEntry[] = []): StepStatus[] {
  const anchorIndex = resolveAnchorIndex(current)
  if (anchorIndex === -1) return ONBOARDING_STEPS.map(() => 'pending')

  // История нужна для шагов за якорем: анкету могли отправить, а потом
  // комплаенс запросил уточнения — отправка от этого не отменяется.
  const reached = new Set(history.map((entry) => entry.toState))

  return ONBOARDING_STEPS.map((step, index) => {
    if (index < anchorIndex) return 'completed'
    if (index === anchorIndex) {
      if (current === 'APPROVED') return 'completed'
      return OFF_TRACK[current]?.status ?? 'current'
    }
    if (step.states.some((state) => COMPLETING_STATES.includes(state) && reached.has(state))) return 'completed'
    return 'pending'
  })
}
