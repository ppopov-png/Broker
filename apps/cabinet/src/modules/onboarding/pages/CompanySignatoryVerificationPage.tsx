import { BadgeCheck, Building2, FlaskConical, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createKycSession, getKycSession, startIdentitySimulation } from '../../../shared/lib/onboarding/api'
import type { KycSession } from '../../../shared/lib/onboarding/types'
import {
  ONBOARDING_ROUTES,
  notifyOnboardingChanged,
  useOnboardingState,
  useOnboardingStepGuard,
} from '../../../shared/lib/onboarding/useOnboarding'
import { Card } from '../../../shared/ui/Card'
import { CenteredSpinner, PageHeader } from '../../../shared/ui/PageHeader'
import { Pill } from '../../../shared/ui/Pill'
import { PrimaryButton } from '../../../shared/ui/buttons'
import { BackToStatus } from '../ui/BackToStatus'

const SESSION_KEY = 'kyc-session-id'
const POLL_MS = 3000

function readSessionId(): string | null {
  try {
    return window.localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

function writeSessionId(value: string) {
  try {
    window.localStorage.setItem(SESSION_KEY, value)
  } catch {
    // Прототип может работать без localStorage.
  }
}

/**
 * Для юрлица KYC-сессия относится к физическому лицу, действующему от имени
 * компании. Сама компания, структура владения и UBO проверяются по
 * корпоративному досье на отдельном шаге.
 */
export function CompanySignatoryVerificationPage() {
  const { allowed } = useOnboardingStepGuard('EMAIL_VERIFIED')
  const { status } = useOnboardingState(false)
  const [sessionId, setSessionId] = useState<string | null>(readSessionId)
  const [session, setSession] = useState<KycSession | null>(null)
  const [loading, setLoading] = useState(Boolean(sessionId))
  const [starting, setStarting] = useState(false)
  const [simulating, setSimulating] = useState(false)

  const passed = status
    ? ['IDENTITY_VERIFIED', 'SELF_CERT_COMPLETED', 'AGREEMENTS_ACCEPTED', 'DOCUMENTS_SUBMITTED', 'EDD_IN_PROGRESS', 'EDD_SUBMITTED', 'UNDER_REVIEW', 'APPROVED'].includes(status.currentState)
    : false

  useEffect(() => {
    if (!sessionId || passed) {
      setLoading(false)
      return
    }
    let cancelled = false
    const poll = async () => {
      try {
        const next = await getKycSession(sessionId)
        if (!cancelled) {
          setSession(next)
          if (next.status === 'COMPLETED' && next.overallDecision === 'Approved') notifyOnboardingChanged()
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void poll()
    const id = window.setInterval(() => void poll(), POLL_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [sessionId, passed])

  const start = async () => {
    setStarting(true)
    try {
      const created = await createKycSession()
      writeSessionId(created.sessionId)
      setSessionId(created.sessionId)
      setSession(created)
      if (created.verificationUrl) window.open(created.verificationUrl, '_blank', 'noopener,noreferrer')
    } finally {
      setStarting(false)
    }
  }

  if (!allowed) return null

  const approved = passed || (session?.status === 'COMPLETED' && session.overallDecision === 'Approved')
  const inProgress = session?.status === 'PENDING' || session?.status === 'IN_PROGRESS'

  return (
    <div className="pb-10">
      <PageHeader
        back={<BackToStatus />}
        title="Проверка уполномоченного подписанта"
        description="Юридическое лицо не проходит селфи-проверку как человек. На этом шаге подтверждаем личность директора или иного лица, уполномоченного открывать и вести счёт. Компания, структура владения и бенефициары проверяются по корпоративному досье далее."
      />

      {loading ? (
        <CenteredSpinner label="Проверяем статус" />
      ) : (
        <div className="flex flex-col gap-5">
          <Card title="Что проверяется" action={<Building2 size={17} className="text-[var(--trigonum-blue)]" />}>
            <div className="grid gap-3 sm:grid-cols-3">
              <Info title="Личность" text="Документ уполномоченного лица" />
              <Info title="Живое присутствие" text="Селфи / liveness у KYC-провайдера" />
              <Info title="Полномочия" text="Подтверждаются документами компании в досье" />
            </div>
          </Card>

          <Card title="Статус проверки" action={<ShieldCheck size={17} className="text-[var(--trigonum-blue)]" />}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--trigonum-ink)]">
                  {approved ? 'Личность подписанта подтверждена' : inProgress ? 'Проверка выполняется' : 'Проверка ещё не начата'}
                </p>
                <p className="mt-1 text-xs text-[var(--trigonum-muted)]">
                  Следующим этапом будут декларации, соглашения и корпоративное досье.
                </p>
              </div>
              <Pill tone={approved ? 'success' : inProgress ? 'info' : undefined}>
                {approved ? 'Подтверждено' : inProgress ? 'В процессе' : 'Не начато'}
              </Pill>
            </div>

            {!approved && !inProgress && (
              <PrimaryButton className="mt-4" disabled={starting} onClick={() => void start()}>
                {starting ? 'Создаём сессию…' : 'Начать проверку подписанта'}
              </PrimaryButton>
            )}
          </Card>

          {inProgress && !session?.verificationUrl && sessionId && (
            <Card>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[var(--trigonum-muted)]">
                <FlaskConical size={13} /> Прототип · KYC-провайдер не подключён
              </p>
              <p className="mt-2 text-sm text-[var(--trigonum-text)]">
                В рабочей системе здесь открывается KYC-провайдер для документа и селфи уполномоченного лица.
              </p>
              <button
                type="button"
                disabled={simulating}
                onClick={() => {
                  setSimulating(true)
                  void startIdentitySimulation(sessionId)
                }}
                className="mt-4 rounded-lg bg-[var(--trigonum-ink)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {simulating ? 'Проверка идёт…' : 'Симулировать успешную проверку'}
              </button>
            </Card>
          )}

          {approved && (
            <Card>
              <p className="flex items-start gap-2 text-sm text-[var(--trigonum-text)]">
                <BadgeCheck size={17} className="mt-0.5 shrink-0 text-[var(--trigonum-success)]" />
                Проверка подписанта завершена. Корпоративные документы и сведения о бенефициарах будут проверяться отдельно.
              </p>
              <Link
                to={ONBOARDING_ROUTES.selfCertification}
                className="mt-4 inline-flex rounded-lg bg-[var(--trigonum-ink)] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Продолжить оформление
              </Link>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl bg-[var(--trigonum-bg)] p-3">
      <p className="text-xs font-bold text-[var(--trigonum-ink)]">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-[var(--trigonum-muted)]">{text}</p>
    </div>
  )
}
