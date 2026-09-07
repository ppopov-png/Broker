import type { OnboardingState } from '../../../shared/lib/onboarding/types'
import { ONBOARDING_ROUTES } from '../../../shared/lib/onboarding/useOnboarding'

export interface OnboardingStep {
  key: string
  title: string
  /** Состояния, которые относятся к этому этапу. */
  states: OnboardingState[]
  actionPath?: string
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { key: 'registration', title: 'Регистрация', states: ['REGISTERED'] },
  { key: 'email', title: 'Подтверждение email', states: ['EMAIL_VERIFIED'] },
  {
    key: 'identity',
    title: 'Проверка личности',
    states: ['IDENTITY_IN_PROGRESS', 'IDENTITY_VERIFIED', 'IDENTITY_FAILED'],
    actionPath: ONBOARDING_ROUTES.identity,
  },
  {
    key: 'self-cert',
    title: 'Самосертификация',
    states: ['SELF_CERT_COMPLETED'],
    actionPath: ONBOARDING_ROUTES.selfCertification,
  },
  { key: 'agreements', title: 'Соглашения', states: ['AGREEMENTS_ACCEPTED'], actionPath: ONBOARDING_ROUTES.agreements },
  {
    key: 'edd',
    title: 'Углублённая проверка',
    states: ['EDD_IN_PROGRESS', 'EDD_SUBMITTED'],
    actionPath: ONBOARDING_ROUTES.edd,
  },
  { key: 'review', title: 'На рассмотрении', states: ['UNDER_REVIEW'] },
  { key: 'approved', title: 'Одобрено', states: ['APPROVED'], actionPath: '/' },
]

/**
 * Эти состояния означают «этап завершён»: сам этап красится завершённым,
 * а текущим становится следующий.
 */
const COMPLETING_STATES: OnboardingState[] = [
  'EMAIL_VERIFIED',
  'IDENTITY_VERIFIED',
  'SELF_CERT_COMPLETED',
  'AGREEMENTS_ACCEPTED',
  'EDD_SUBMITTED',
]

export type StepStatus = 'completed' | 'current' | 'pending' | 'in-progress'

export function resolveStepStatuses(current: OnboardingState): StepStatus[] {
  const ownerIndex = ONBOARDING_STEPS.findIndex((step) => step.states.includes(current))
  if (ownerIndex === -1) return ONBOARDING_STEPS.map(() => 'pending')

  const completesOwnStep = COMPLETING_STATES.includes(current)
  const currentIndex = completesOwnStep ? ownerIndex + 1 : ownerIndex

  return ONBOARDING_STEPS.map((_, index) => {
    if (index < currentIndex) return 'completed'
    if (index === currentIndex) return current === 'APPROVED' ? 'completed' : 'current'
    return 'pending'
  })
}
