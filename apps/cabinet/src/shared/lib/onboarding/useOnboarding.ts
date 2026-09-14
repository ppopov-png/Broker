import { readClientProfile } from '@trigonum/shared'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOnboardingHistory, getOnboardingState } from './api'
import { STATE_ORDER, TERMINAL_STATES, type OnboardingHistoryEntry, type OnboardingState, type OnboardingStatus } from './types'

const STATUS_POLL_MS = 10_000

export const ONBOARDING_CHANGED_EVENT = 'trigonum:onboarding-changed'

export function notifyOnboardingChanged() {
  window.dispatchEvent(new Event(ONBOARDING_CHANGED_EVENT))
}

export const ONBOARDING_ROUTES = {
  status: '/onboarding',
  identity: '/onboarding/identity',
  selfCertification: '/onboarding/self-certification',
  agreements: '/onboarding/agreements',
  documents: '/onboarding/documents',
  edd: '/onboarding/edd',
} as const

interface OnboardingStateResult {
  status: OnboardingStatus | null
  history: OnboardingHistoryEntry[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useOnboardingState(poll = true): OnboardingStateResult {
  const [status, setStatus] = useState<OnboardingStatus | null>(null)
  const [history, setHistory] = useState<OnboardingHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((value) => value + 1), [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [nextStatus, nextHistory] = await Promise.all([getOnboardingState(), getOnboardingHistory()])
        if (cancelled) return
        setStatus(nextStatus)
        setHistory(nextHistory)
        setError(null)
      } catch {
        if (!cancelled) setError('Не удалось загрузить статус заявки')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [tick])

  useEffect(() => {
    window.addEventListener(ONBOARDING_CHANGED_EVENT, refetch)
    return () => window.removeEventListener(ONBOARDING_CHANGED_EVENT, refetch)
  }, [refetch])

  const terminal = status ? TERMINAL_STATES.includes(status.currentState) : false
  useEffect(() => {
    if (!poll || terminal) return
    const id = window.setInterval(refetch, STATUS_POLL_MS)
    return () => window.clearInterval(id)
  }, [poll, terminal, refetch])

  return { status, history, loading, error, refetch }
}

/**
 * Гард учитывает разные ветки. У юрлица после проверки подписанта нет
 * отдельной персональной самосертификации; у физлица после соглашений нет
 * отдельного шага загрузки «анкеты физлица» — сама EDD-форма и есть анкета.
 */
export function useOnboardingStepGuard(minimumState: OnboardingState): { allowed: boolean } {
  const navigate = useNavigate()
  const { status, loading } = useOnboardingState(false)
  const redirected = useRef(false)

  const current = status?.currentState
  const profile = readClientProfile()
  const currentIndex = current ? STATE_ORDER.indexOf(current) : -1
  const minimumIndex = STATE_ORDER.indexOf(minimumState)

  const companyAgreementBridge =
    profile.clientType === 'company' && minimumState === 'SELF_CERT_COMPLETED' && current === 'IDENTITY_VERIFIED'
  const individualEddBridge =
    profile.clientType === 'individual' && minimumState === 'DOCUMENTS_SUBMITTED' && current === 'AGREEMENTS_ACCEPTED'

  const blocked = !loading && Boolean(current) && currentIndex !== -1 && currentIndex < minimumIndex && !companyAgreementBridge && !individualEddBridge

  useEffect(() => {
    if (blocked && !redirected.current) {
      redirected.current = true
      navigate(ONBOARDING_ROUTES.status, { replace: true })
    }
  }, [blocked, navigate])

  return { allowed: !blocked }
}

const ACTION_REQUIRED: OnboardingState[] = [
  'REGISTERED',
  'EMAIL_VERIFIED',
  'IDENTITY_VERIFIED',
  'IDENTITY_FAILED',
  'SELF_CERT_COMPLETED',
  'AGREEMENTS_ACCEPTED',
  'DOCUMENTS_SUBMITTED',
  'AMENDMENTS_REQUESTED',
  'REVERIFICATION_REQUIRED',
]

export function useOnboardingActionRequired(): boolean {
  const { status } = useOnboardingState(false)
  return status ? ACTION_REQUIRED.includes(status.currentState) : false
}

export function nextStepRoute(state: OnboardingState): string | null {
  const clientType = readClientProfile().clientType
  switch (state) {
    case 'EMAIL_VERIFIED':
      return ONBOARDING_ROUTES.identity
    case 'IDENTITY_VERIFIED':
      return clientType === 'company' ? ONBOARDING_ROUTES.agreements : ONBOARDING_ROUTES.selfCertification
    case 'SELF_CERT_COMPLETED':
      return ONBOARDING_ROUTES.agreements
    case 'AGREEMENTS_ACCEPTED':
      return clientType === 'company' ? ONBOARDING_ROUTES.documents : ONBOARDING_ROUTES.edd
    case 'DOCUMENTS_SUBMITTED':
    case 'AMENDMENTS_REQUESTED':
      return ONBOARDING_ROUTES.edd
    case 'IDENTITY_FAILED':
    case 'REVERIFICATION_REQUIRED':
      return ONBOARDING_ROUTES.identity
    default:
      return null
  }
}
