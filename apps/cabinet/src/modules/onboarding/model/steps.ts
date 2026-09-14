import { readClientProfile, type ClientType } from '@trigonum/shared'
import type { OnboardingHistoryEntry, OnboardingState } from '../../../shared/lib/onboarding/types'
import { ONBOARDING_ROUTES } from '../../../shared/lib/onboarding/useOnboarding'

export interface OnboardingStep { key: string; title: string; states: OnboardingState[]; actionPath?: string }

export function onboardingSteps(clientType: ClientType = readClientProfile().clientType): OnboardingStep[] {
  const start: OnboardingStep[] = [
    { key: 'registration', title: 'Регистрация', states: ['REGISTERED'] },
    { key: 'email', title: 'Подтверждение email', states: ['EMAIL_VERIFIED'] },
    { key: 'identity', title: clientType === 'company' ? 'Проверка уполномоченного подписанта' : 'Верификация личности', states: ['IDENTITY_IN_PROGRESS', 'IDENTITY_VERIFIED', 'IDENTITY_FAILED'], actionPath: ONBOARDING_ROUTES.identity },
  ]

  const middle: OnboardingStep[] = clientType === 'company'
    ? [
        { key: 'company-questionnaire', title: 'Анкета юридического лица', states: ['SELF_CERT_COMPLETED'], actionPath: ONBOARDING_ROUTES.selfCertification },
        { key: 'documents', title: 'Корпоративное досье', states: ['DOCUMENTS_SUBMITTED'], actionPath: ONBOARDING_ROUTES.documents },
      ]
    : [
        { key: 'self-cert', title: 'Самосертификация', states: ['SELF_CERT_COMPLETED'], actionPath: ONBOARDING_ROUTES.selfCertification },
        { key: 'agreements', title: 'Соглашения', states: ['AGREEMENTS_ACCEPTED'], actionPath: ONBOARDING_ROUTES.agreements },
        { key: 'edd', title: 'Анкета физического лица', states: ['EDD_IN_PROGRESS', 'EDD_SUBMITTED'], actionPath: ONBOARDING_ROUTES.edd },
      ]

  return [...start, ...middle, { key: 'review', title: 'На рассмотрении', states: ['UNDER_REVIEW'] }, { key: 'approved', title: 'Одобрено', states: ['APPROVED'], actionPath: '/' }]
}

const DONE: OnboardingState[] = ['EMAIL_VERIFIED', 'IDENTITY_VERIFIED', 'SELF_CERT_COMPLETED', 'AGREEMENTS_ACCEPTED', 'DOCUMENTS_SUBMITTED', 'EDD_SUBMITTED']
export type StepStatus = 'completed' | 'current' | 'pending' | 'action-required' | 'failed' | 'rejected' | 'blocked'

const OFF: Partial<Record<OnboardingState, { anchorKey: string; status: StepStatus }>> = {
  IDENTITY_FAILED: { anchorKey: 'identity', status: 'failed' },
  REVERIFICATION_REQUIRED: { anchorKey: 'identity', status: 'action-required' },
  REJECTED: { anchorKey: 'review', status: 'rejected' },
  SUSPENDED: { anchorKey: 'review', status: 'blocked' },
}

function anchor(current: OnboardingState, clientType: ClientType) {
  const steps = onboardingSteps(clientType)
  if (current === 'AMENDMENTS_REQUESTED') return steps.findIndex((s) => s.key === (clientType === 'company' ? 'documents' : 'edd'))
  if (clientType === 'company' && current === 'AGREEMENTS_ACCEPTED') return steps.findIndex((s) => s.key === 'documents')
  if (OFF[current]) return steps.findIndex((s) => s.key === OFF[current]!.anchorKey)
  const i = steps.findIndex((s) => s.states.includes(current))
  if (i !== -1) return DONE.includes(current) ? Math.min(i + 1, steps.length - 1) : i
  if (clientType === 'individual' && current === 'DOCUMENTS_SUBMITTED') return steps.findIndex((s) => s.key === 'edd')
  return -1
}

export function resolveCurrentStep(current: OnboardingState, clientType: ClientType = readClientProfile().clientType) {
  const steps = onboardingSteps(clientType)
  const i = anchor(current, clientType)
  return i < 0 ? null : steps[i] ?? null
}

export function resolveStepStatuses(current: OnboardingState, history: OnboardingHistoryEntry[] = [], clientType: ClientType = readClientProfile().clientType): StepStatus[] {
  const steps = onboardingSteps(clientType)
  const i = anchor(current, clientType)
  if (i < 0) return steps.map(() => 'pending')
  const reached = new Set(history.map((h) => h.toState))
  return steps.map((s, n) => n < i ? 'completed' : n === i ? (current === 'APPROVED' ? 'completed' : current === 'AMENDMENTS_REQUESTED' ? 'action-required' : OFF[current]?.status ?? 'current') : s.states.some((x) => DONE.includes(x) && reached.has(x)) ? 'completed' : 'pending')
}
