import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOnboardingHistory, getOnboardingState } from './api'
import { STATE_ORDER, TERMINAL_STATES, type OnboardingHistoryEntry, type OnboardingState, type OnboardingStatus } from './types'

const STATUS_POLL_MS = 10_000

/** Состояние изменили вне обычного цикла — например, пультом прототипа. */
export const ONBOARDING_CHANGED_EVENT = 'trigonum:onboarding-changed'

export function notifyOnboardingChanged() {
  window.dispatchEvent(new Event(ONBOARDING_CHANGED_EVENT))
}

export const ONBOARDING_ROUTES = {
  status: '/onboarding',
  identity: '/onboarding/identity',
  selfCertification: '/onboarding/self-certification',
  agreements: '/onboarding/agreements',
  edd: '/onboarding/edd',
} as const

interface OnboardingStateResult {
  status: OnboardingStatus | null
  history: OnboardingHistoryEntry[]
  loading: boolean
  error: string | null
  refetch: () => void
}

/** Состояние онбординга с поллингом. Останавливается на терминальном состоянии. */
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
    return () => {
      cancelled = true
    }
  }, [tick])

  // Внешнее изменение состояния подхватываем сразу, не дожидаясь опроса.
  useEffect(() => {
    window.addEventListener(ONBOARDING_CHANGED_EVENT, refetch)
    return () => window.removeEventListener(ONBOARDING_CHANGED_EVENT, refetch)
  }, [refetch])

  // Поллинг живёт отдельно от загрузки, чтобы не сбрасывать экран в спиннер.
  const terminal = status ? TERMINAL_STATES.includes(status.currentState) : false
  useEffect(() => {
    if (!poll || terminal) return
    const id = window.setInterval(refetch, STATUS_POLL_MS)
    return () => window.clearInterval(id)
  }, [poll, terminal, refetch])

  return { status, history, loading, error, refetch }
}

/**
 * Гард шага. Не блокирует во время загрузки и при неизвестном состоянии —
 * иначе экран мигал бы редиректом на каждой перезагрузке.
 */
export function useOnboardingStepGuard(minimumState: OnboardingState): { allowed: boolean } {
  const navigate = useNavigate()
  const { status, loading } = useOnboardingState(false)
  const redirected = useRef(false)

  const current = status?.currentState
  const currentIndex = current ? STATE_ORDER.indexOf(current) : -1
  const minimumIndex = STATE_ORDER.indexOf(minimumState)

  // Неизвестное состояние (нет в порядке) не блокируем.
  const blocked = !loading && Boolean(current) && currentIndex !== -1 && currentIndex < minimumIndex

  useEffect(() => {
    if (blocked && !redirected.current) {
      redirected.current = true
      navigate(ONBOARDING_ROUTES.status, { replace: true })
    }
  }, [blocked, navigate])

  return { allowed: !blocked }
}
