import type { ClientType } from '@trigonum/shared'
import type { OnboardingHistoryEntry, OnboardingState } from '../../../shared/lib/onboarding/types'
import { ONBOARDING_ROUTES } from '../../../shared/lib/onboarding/useOnboarding'

export interface OnboardingStep {
  key: string
  title: string
  states: OnboardingState[]
  actionPath?: string
}

export function onboardingSteps(clientType: ClientType = 'individual'): OnboardingStep[] {
  const company = clientType === 'company'
  return [
    { key: 'registration', title: 'Регистрация', states: ['REGISTERED'] },
    { key: 'email', title: 'Подтверждение email', states: ['EMAIL_VERIFIED'] },
    {
      key: 'identity',
      title: company ? 'Проверка уполномоченного подписанта' : 'Проверка личности',
      states: ['IDENTITY_IN_PROGRESS', 'IDENTITY_VERIFIED', 'IDENTITY_FAILED'],
      actionPath: ONBOARDING_ROUTES.identity,
    },
    {
      key: 'self-cert',
      title: company ? 'Декларации юридического лица' : 'Самосертификация',
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
      title: company ? 'Корпоративное досье' : 'Документы',
      states: ['DOCUMENTS_SUBMITTED'],
      actionPath: ONBOARDING_ROUTES.documents,
    },
    {
      key: 'edd',
      title: company ? 'Комплаенс-анкета компании' : 'Углублённая проверка',
      states: ['EDD_IN_PROGRESS', 'EDD_SUBMITTED'],
      actionPath: ONBOARDING_ROUTES.edd,
    },
    { key: 'review', title: 'На рассмотрении', states: ['UNDER_REVIEW'] },
    { key: 'approved', title: 'Одобрено', states: ['APPROVED'], actionPath: '/' },
  ]
}

export const ONBOARDING_STEPS: OnboardingStep[] = onboardingSteps()

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
