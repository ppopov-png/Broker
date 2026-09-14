import { BadgeCheck, Building2, FileCheck2, FlaskConical, Paperclip, ShieldCheck, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
import { OutlineButton, PrimaryButton } from '../../../shared/ui/buttons'
import { BackToStatus } from '../ui/BackToStatus'

const SESSION_KEY = 'kyc-session-id'
const AUTHORITY_FILE_KEY = 'company-signatory-authority-file'
const POLL_MS = 3000

function readSessionId(): string | null {
  try { return window.localStorage.getItem(SESSION_KEY) } catch { return null }
}

function writeSessionId(value: string) {
  try { window.localStorage.setItem(SESSION_KEY, value) } catch { /* prototype can work without persistence */ }
}

function readAuthorityFile(): string | null {
  try { return window.localStorage.getItem(AUTHORITY_FILE_KEY) } catch { return null }
}

function writeAuthorityFile(value: string | null) {
  try {
    if (value) window.localStorage.setItem(AUTHORITY_FILE_KEY, value)
    else window.localStorage.removeItem(AUTHORITY_FILE_KEY)
  } catch { /* prototype can work without persistence */ }
}

/** KYC юрлица проверяет личность физического лица, действующего от имени компании. */
export function CompanySignatoryVerificationPage() {
  const { allowed } = useOnboardingStepGuard('EMAIL_VERIFIED')
  const { status } = useOnboardingState(false)
  const authorityInput = useRef<HTMLInputElement>(null)
  const [authorityFile, setAuthorityFile] = useState<string | null>(readAuthorityFile)
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
    if (!authorityFile) return
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
        title="Проверка уполномоченного лица"
        description="Проверяем по паспорту физическое лицо, которое действует от имени компании, и прикладываем документ, подтверждающий его полномочия."
      />

      {loading ? (
        <CenteredSpinner label="Проверяем статус" />
      ) : (
        <div className="flex flex-col gap-5">
          <Card title="Что нужно для проверки" action={<Building2 size={17} className="text-[var(--trigonum-blue)]" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info title="Паспорт подписанта" text="Паспорт и живое присутствие проверяются через KYC-провайдера." />
              <Info title="Полномочия от компании" text="Приложите доверенность либо иной документ, подтверждающий право действовать от имени компании." />
            </div>
          </Card>

          <Card title="Документ о полномочиях" action={<FileCheck2 size={17} className="text-[var(--trigonum-blue)]" />}>
            <p className="text-sm leading-relaxed text-[var(--trigonum-text)]">
              Для представителя — доверенность от компании. Если счёт открывает директор, полномочия могут подтверждаться решением, приказом или другим корпоративным документом.
            </p>
            {authorityFile ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5">
                <Paperclip size={14} className="text-[var(--trigonum-muted)]" />
                <span className="min-w-0 flex-1 truncate text-sm text-[var(--trigonum-text)]">{authorityFile}</span>
                {!approved && !inProgress && (
                  <button
                    type="button"
                    onClick={() => { setAuthorityFile(null); writeAuthorityFile(null) }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--trigonum-danger)]"
                  >
                    <Trash2 size={13} /> Удалить
                  </button>
                )}
              </div>
            ) : (
              <>
                <input
                  ref={authorityInput}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(event) => {
                    const fileName = event.target.files?.[0]?.name ?? null
                    setAuthorityFile(fileName)
                    writeAuthorityFile(fileName)
                    event.target.value = ''
                  }}
                />
                <OutlineButton type="button" className="mt-4" onClick={() => authorityInput.current?.click()}>
                  Прикрепить документ
                </OutlineButton>
              </>
            )}
          </Card>

          <Card title="Статус KYC" action={<ShieldCheck size={17} className="text-[var(--trigonum-blue)]" />}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--trigonum-ink)]">
                  {approved ? 'Личность и полномочия подтверждены' : inProgress ? 'Проверка выполняется' : 'Проверка ещё не начата'}
                </p>
                <p className="mt-1 text-xs text-[var(--trigonum-muted)]">
                  После успешной проверки откроется анкета юридического лица.
                </p>
              </div>
              <Pill tone={approved ? 'success' : inProgress ? 'info' : undefined}>
                {approved ? 'Подтверждено' : inProgress ? 'В процессе' : 'Не начато'}
              </Pill>
            </div>

            {!approved && !inProgress && (
              <PrimaryButton className="mt-4" disabled={starting || !authorityFile} onClick={() => void start()}>
                {starting ? 'Создаём сессию…' : authorityFile ? 'Начать KYC по паспорту' : 'Сначала прикрепите полномочия'}
              </PrimaryButton>
            )}
          </Card>

          {inProgress && !session?.verificationUrl && sessionId && (
            <Card>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[var(--trigonum-muted)]">
                <FlaskConical size={13} /> Прототип · KYC-провайдер не подключён
              </p>
              <p className="mt-2 text-sm text-[var(--trigonum-text)]">
                В рабочей системе здесь открывается проверка паспорта и liveness уполномоченного лица.
              </p>
              <button
                type="button"
                disabled={simulating}
                onClick={() => { setSimulating(true); void startIdentitySimulation(sessionId) }}
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
                Паспорт уполномоченного лица проверен, документ о полномочиях приложен.
              </p>
              <Link
                to={ONBOARDING_ROUTES.selfCertification}
                className="mt-4 inline-flex rounded-lg bg-[var(--trigonum-ink)] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Перейти к анкете юридического лица
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
