import type { ClientType } from '@trigonum/shared'
import type { OnboardingHistoryEntry, OnboardingState } from '../../../shared/lib/onboarding/types'
import { ONBOARDING_ROUTES } from '../../../shared/lib/onboarding/useOnboarding'

export interface OnboardingStep {
  key: string
  title: string
  states: OnboardingState[]
  actionPath?: string
}

/**
 * Флоу физлица следует инструкции инвестора:
 * регистрация → email → верификация личности → самосертификация → соглашения
 * → углублённая проверка (анкета) → рассмотрение → одобрение.
 *
 * Для юрлица персональная самосертификация не используется. После проверки
 * уполномоченного подписанта идут соглашения, корпоративное досье и KYB/EDD.
 */
export function onboardingSteps(clientType: ClientType = 'individual'): OnboardingStep[] {
  const commonStart: OnboardingStep[] = [
    { key: 'registration', title: 'Регистрация', states: ['REGISTERED'] },
    { key: 'email', title: 'Подтверждение email', states: ['EMAIL_VERIFIED'] },
    {
      key: 'identity',
      title: clientType === 'company' ? 'Проверка уполномоченного подписанта' : 'Верификация личности',
      states: ['IDENTITY_IN_PROGRESS', 'IDENTITY_VERIFIED', 'IDENTITY_FAILED'],
      actionPath: ONBOARDING_ROUTES.identity,
    },
  ]

  const middle: OnboardingStep[] = clientType === 'company'
    ? [
        {
          key: 'agreements',
          title: 'Соглашения',
          states: ['AGREEMENTS_ACCEPTED'],
          actionPath: ONBOARDING_ROUTES.agreements,
        },
        {
          key: 'documents',
          title: 'Корпоративное досье',
          states: ['DOCUMENTS_SUBMITTED'],
          actionPath: ONBOARDING_ROUTES.documents,
        },
        {
          key: 'edd',
          title: 'Углублённая проверка компании',
          states: ['EDD_IN_PROGRESS', 'EDD_SUBMITTED'],
          actionPath: ONBOARDING_ROUTES.edd,
        },
      ]
    : [
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
          key: 'edd',
          title: 'Углублённая проверка',
          states: ['EDD_IN_PROGRESS', 'EDD_SUBMITTED'],
          actionPath: ONBOARDING_ROUTES.edd,
        },
      ]

  return [
    ...commonStart,
    ...middle,
    { key: 'review', title: 'На рассмотрении', states: ['UNDER_REVIEW'] },
    { key: 'approved', title: 'Одобрено', states: ['APPROVED'], actionPath: '/' },
  ]
}

const COMPLETING_STATES: OnboardingState[] = [
  'EMAIL_VERIFIED',
  'IDENTITY_VERIFIED',
  'SELF_CERT_COMPLETED',
  'AGREEMENTS_ACCEPTED',
  'DOCUMENTS_SUBMITTED',
  'EDD_SUBMITTED',
]

export type StepStatus = 'completed' | 'current' | 'pending' | 'action-required' | 'failed' | 'rejected' | 'blocked'

const OFF_TRACK: Partial<Record<OnboardingState, { anchorKey: string; status: StepStatus }>> = {
  IDENTITY_FAILED: { anchorKey: 'identity', status: 'failed' },
  REVERIFICATION_REQUIRED: { anchorKey: 'identity', status: 'action-required' },
  AMENDMENTS_REQUESTED: { anchorKey: 'edd', status: 'action-required' },
  REJECTED: { anchorKey: 'review', status: 'rejected' },
  SUSPENDED: { anchorKey: 'review', status: 'blocked' },
}

function resolveAnchorIndex(current: OnboardingState, clientType: ClientType): number {
  const steps = onboardingSteps(clientType)
  const offTrack = OFF_TRACK[current]
  if (offTrack) return steps.findIndex((step) => step.key === offTrack.anchorKey)

  const ownerIndex = steps.findIndex((step) => step.states.includes(current))
  if (ownerIndex !== -1) return COMPLETING_STATES.includes(current) ? Math.min(ownerIndex + 1, steps.length - 1) : ownerIndex

  // Состояния, которых нет в конкретной ветке, считаем техническими мостами.
  if (clientType === 'company' && current === 'SELF_CERT_COMPLETED') return steps.findIndex((step) => step.key === 'agreements')
  if (clientType === 'individual' && current === 'DOCUMENTS_SUBMITTED') return steps.findIndex((step) => step.key === 'edd')
  return -1
}

export function resolveCurrentStep(current: OnboardingState, clientType: ClientType = 'individual'): OnboardingStep | null {
  const steps = onboardingSteps(clientType)
  const index = resolveAnchorIndex(current, clientType)
  return index === -1 ? null : (steps[index] ?? null)
}

export function resolveStepStatuses(
  current: OnboardingState,
  history: OnboardingHistoryEntry[] = [],
  clientType: ClientType = 'individual',
): StepStatus[] {
  const steps = onboardingSteps(clientType)
  const anchorIndex = resolveAnchorIndex(current, clientType)
  if (anchorIndex === -1) return steps.map(() => 'pending')

  const reached = new Set(history.map((entry) => entry.toState))

  return steps.map((step, index) => {
    if (index < anchorIndex) return 'completed'
    if (index === anchorIndex) {
      if (current === 'APPROVED') return 'completed'
      return OFF_TRACK[current]?.status ?? 'current'
    }
    if (step.states.some((state) => COMPLETING_STATES.includes(state) && reached.has(state))) return 'completed'
    return 'pending'
  })
}
