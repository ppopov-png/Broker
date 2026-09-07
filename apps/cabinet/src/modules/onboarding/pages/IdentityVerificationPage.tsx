import { BadgeCheck, ExternalLink, FlaskConical, Info, RefreshCw, ShieldCheck, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createKycSession, getKycSession, startIdentitySimulation } from '../../../shared/lib/onboarding/api'
import {
  ApiError,
  KYC_CAN_START,
  KYC_TERMINAL,
  type DocumentType,
  type KycSession,
  type KycSessionConflict,
  type OnboardingState,
} from '../../../shared/lib/onboarding/types'
import {
  ONBOARDING_ROUTES,
  notifyOnboardingChanged,
  useOnboardingState,
  useOnboardingStepGuard,
} from '../../../shared/lib/onboarding/useOnboarding'
import { Card } from '../../../shared/ui/Card'
import { CenteredSpinner, PageHeader } from '../../../shared/ui/PageHeader'
import { Pill } from '../../../shared/ui/Pill'
import { useToast } from '../../../shared/ui/Toast'
import { OutlineButton, PrimaryButton } from '../../../shared/ui/buttons'
import { BackToStatus } from '../ui/BackToStatus'

const SESSION_KEY = 'kyc-session-id'
const POLL_MS = 5000

/** Обращения к хранилищу обёрнуты: в приватном режиме экран должен работать. */
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
    /* работаем без персистентности */
  }
}
function clearSessionId() {
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    /* работаем без персистентности */
  }
}

/** Шаг считается пройденным, даже если сессия уже очищена. */
const PASSED_STATES: OnboardingState[] = [
  'IDENTITY_VERIFIED',
  'SELF_CERT_COMPLETED',
  'AGREEMENTS_ACCEPTED',
  'EDD_IN_PROGRESS',
  'EDD_SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
]

const documentLabels: Record<DocumentType, string> = {
  PASSPORT: 'Паспорт',
  NATIONAL_ID: 'Удостоверение личности',
  DRIVERS_LICENSE: 'Водительское удостоверение',
  PROOF_OF_ADDRESS: 'Подтверждение адреса',
  BANK_STATEMENT: 'Банковская выписка',
}

export function IdentityVerificationPage() {
  const { allowed } = useOnboardingStepGuard('EMAIL_VERIFIED')
  const { status } = useOnboardingState(false)
  const toast = useToast()
  const navigate = useNavigate()

  const [sessionId, setSessionId] = useState<string | null>(readSessionId)
  const [session, setSession] = useState<KycSession | null>(null)
  const [loading, setLoading] = useState(Boolean(readSessionId()))
  const [starting, setStarting] = useState(false)
  /** Ссылка на экране на случай, если попап заблокирован браузером. */
  const [manualUrl, setManualUrl] = useState<string | null>(null)
  const [simulating, setSimulating] = useState(false)

  const alreadyPassed = status ? PASSED_STATES.includes(status.currentState) : false
  // Сессии может не быть (очищена, другой браузер), но состояние помнит провал.
  const failedByState = status?.currentState === 'IDENTITY_FAILED'
  const sessionStatus = session?.status

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }
    let cancelled = false

    const poll = async () => {
      try {
        const next = await getKycSession(sessionId)
        if (cancelled) return
        if (next.status === 'SUPERSEDED') {
          clearSessionId()
          setSessionId(null)
          setSession(null)
          return
        }
        setSession(next)
      } catch {
        // Протухший id — молча сбрасываем, пользователь увидит кнопку старта.
        if (cancelled) return
        clearSessionId()
        setSessionId(null)
        setSession(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void poll()
    // Поллинг останавливается, как только статус стал терминальным.
    if (sessionStatus && KYC_TERMINAL.includes(sessionStatus)) return
    const id = window.setInterval(() => void poll(), POLL_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [sessionId, sessionStatus])

  // Шаг закончился — сразу открываем следующий, чтобы клиент не искал его сам.
  const verifiedNow =
    status?.currentState !== 'IDENTITY_FAILED' &&
    session?.status === 'COMPLETED' &&
    session.overallDecision === 'Approved'
  const [autoRedirect, setAutoRedirect] = useState(false)
  useEffect(() => {
    if (!verifiedNow) return
    notifyOnboardingChanged()
    setAutoRedirect(true)
    const id = window.setTimeout(() => navigate(ONBOARDING_ROUTES.selfCertification), 3500)
    return () => window.clearTimeout(id)
  }, [verifiedNow, navigate])

  const openVerification = (url?: string) => {
    if (!url) return
    const popup = window.open(url, '_blank', 'noopener,noreferrer')
    if (!popup) {
      setManualUrl(url)
      toast('error', 'Окно проверки не открылось — возможно, браузер блокирует всплывающие окна')
    }
  }

  const startVerification = async (retry = false) => {
    setStarting(true)
    setManualUrl(null)
    if (retry) {
      clearSessionId()
      setSessionId(null)
      setSession(null)
      setSimulating(false)
    }

    try {
      const created = await createKycSession()
      writeSessionId(created.sessionId)
      setSessionId(created.sessionId)
      setSession(created)
      openVerification(created.verificationUrl)
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // Активная сессия уже есть — подхватываем её вместо создания новой.
        const conflict = error.body as KycSessionConflict
        writeSessionId(conflict.existingSessionId)
        setSessionId(conflict.existingSessionId)
        toast('error', 'Проверка уже идёт — завершите её или дождитесь истечения сессии')
        openVerification(conflict.verificationUrl)
      } else {
        toast('error', 'Не удалось начать проверку. Попробуйте ещё раз')
      }
    } finally {
      setStarting(false)
    }
  }

  if (!allowed) return null

  // ТЗ 4.7 отдаёт приоритет состоянию онбординга над данными сессии: сессия
  // могла быть очищена или устареть. Правило симметрично и для провала —
  // иначе на IDENTITY_FAILED показывался бы результат старой успешной сессии.
  const currentStatus = failedByState
    ? 'FAILED'
    : alreadyPassed
      ? 'COMPLETED'
      : (session?.status ?? 'NOT_STARTED')
  const decision = failedByState ? 'Declined' : alreadyPassed ? 'Approved' : session?.overallDecision
  const terminalResult = KYC_TERMINAL.includes(currentStatus)
  // ТЗ разрешает показывать старт и при FAILED/EXPIRED, но тогда рядом с
  // карточкой результата оказались бы две кнопки об одном и том же.
  const canStart = !alreadyPassed && KYC_CAN_START.includes(currentStatus) && !terminalResult
  const showLink = !alreadyPassed && (currentStatus === 'PENDING' || currentStatus === 'IN_PROGRESS')
  const terminal = terminalResult

  return (
    <div className="pb-10">
      <PageHeader
        back={<BackToStatus />}
        title="Проверка личности"
        description="Подтвердите личность, чтобы открыть все возможности платформы. Займёт несколько минут: понадобится документ и селфи."
      />

      {loading ? (
        <CenteredSpinner label="Проверяем статус сессии" />
      ) : (
        <div className="flex flex-col gap-5">
          {(session || alreadyPassed || failedByState) && (
            <Card title="Статус проверки">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--trigonum-bg)] text-[var(--trigonum-muted)]">
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--trigonum-ink)]">
                      {currentStatus === 'COMPLETED'
                        ? 'Проверка завершена'
                        : currentStatus === 'IN_PROGRESS'
                          ? 'Идёт проверка документов'
                          : currentStatus === 'PENDING'
                            ? 'Сессия создана'
                            : currentStatus === 'EXPIRED'
                              ? 'Сессия истекла'
                              : 'Проверка не пройдена'}
                    </p>
                    <p className="text-xs text-[var(--trigonum-muted)]">
                      {currentStatus === 'PENDING' || currentStatus === 'IN_PROGRESS'
                        ? 'Статус обновляется автоматически'
                        : 'Результат получен от провайдера проверки'}
                    </p>
                  </div>
                </div>

                <Pill
                  tone={
                    currentStatus === 'COMPLETED' && decision === 'Approved'
                      ? 'success'
                      : currentStatus === 'FAILED' || decision === 'Declined'
                        ? 'danger'
                        : 'info'
                  }
                >
                  {currentStatus === 'COMPLETED' && decision ? decision : currentStatus}
                </Pill>
              </div>
            </Card>
          )}

          {showLink && session?.verificationUrl && (
            <Card>
              <p className="text-sm text-[var(--trigonum-text)]">
                {currentStatus === 'PENDING'
                  ? 'Окно проверки открыто в новой вкладке. Если оно закрылось — откройте ссылку заново.'
                  : 'Проверка начата в соседней вкладке. Вернитесь туда и завершите шаги.'}
              </p>
              <a
                href={session.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[var(--trigonum-ink)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-125"
              >
                <ExternalLink size={15} />
                Открыть окно проверки
              </a>
            </Card>
          )}

          {/* Провайдер не подключён — проходим проверку за него, но не мгновенно */}
          {showLink && !session?.verificationUrl && sessionId && (
            <Card>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[var(--trigonum-muted)]">
                <FlaskConical size={13} />
                Прототип · провайдер не подключён
              </p>
              <p className="mt-2 text-sm text-[var(--trigonum-text)]">
                В бою здесь открывается окно Didit: документ, селфи и проверка живого присутствия. Пока провайдера нет,
                можно пройти шаг за него — сессия двинется по своим статусам, а не подтвердится мгновенно.
              </p>

              <StatusTrack current={currentStatus} />

              <button
                type="button"
                disabled={simulating}
                onClick={() => {
                  setSimulating(true)
                  void startIdentitySimulation(sessionId)
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--trigonum-ink)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {simulating ? 'Проверка идёт…' : 'Я прошёл проверку в Didit'}
              </button>

              {simulating && (
                <p className="mt-2 text-xs text-[var(--trigonum-muted)]">
                  Провайдер отвечает не сразу: статус обновится сам через несколько секунд.
                </p>
              )}
            </Card>
          )}

          {manualUrl && (
            <Card>
              <p className="flex items-start gap-2 text-sm text-[var(--trigonum-text)]">
                <TriangleAlert size={16} className="mt-0.5 shrink-0 text-[var(--trigonum-warning)]" />
                Браузер заблокировал всплывающее окно. Откройте проверку по ссылке вручную.
              </p>
              <a
                href={manualUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 break-all text-sm font-semibold text-[var(--trigonum-blue)]"
              >
                <ExternalLink size={15} className="shrink-0" />
                {manualUrl}
              </a>
            </Card>
          )}

          {canStart && (
            <Card>
              <p className="text-sm text-[var(--trigonum-text)]">
                Проверку проводит провайдер идентификации в отдельном окне. Приготовьте паспорт или удостоверение
                личности.
              </p>
              <PrimaryButton
                type="button"
                className="mt-4"
                disabled={starting}
                onClick={() => void startVerification()}
              >
                {starting ? 'Создаём сессию…' : 'Начать проверку'}
              </PrimaryButton>
            </Card>
          )}

          {terminal && (
            <Card title="Результат">
              {decision === 'Approved' && (
                <>
                  <p className="flex items-start gap-2 text-sm text-[var(--trigonum-text)]">
                    <BadgeCheck size={17} className="mt-0.5 shrink-0 text-[var(--trigonum-success)]" />
                    Личность успешно подтверждена.
                  </p>

                  {autoRedirect && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--trigonum-bg)] px-3.5 py-3">
                      <p className="text-sm text-[var(--trigonum-text)]">
                        Открываем следующий шаг — самосертификацию…
                      </p>
                      <Link
                        to={ONBOARDING_ROUTES.selfCertification}
                        className="shrink-0 rounded-lg bg-[var(--trigonum-ink)] px-3.5 py-2 text-xs font-semibold text-white transition hover:brightness-125"
                      >
                        Перейти сейчас
                      </Link>
                    </div>
                  )}

                  <div className="mt-4 rounded-xl border border-[var(--trigonum-border)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">
                        Детали проверки
                      </p>
                      <Pill tone="success">Подтверждено</Pill>
                    </div>
                    <div className="mt-3 flex flex-col divide-y divide-[var(--trigonum-border)]">
                      <DetailRow
                        label="Дата подтверждения"
                        value={new Date(
                          session?.updatedAt ?? session?.webhookReceivedAt ?? Date.now(),
                        ).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}
                      />
                      <DetailRow
                        label="Тип документа"
                        value={
                          session?.documentData?.documentType
                            ? documentLabels[session.documentData.documentType]
                            : 'Документ'
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {(decision === 'Declined' || currentStatus === 'FAILED') && (
                <p className="flex items-start gap-2 text-sm text-[var(--trigonum-text)]">
                  <TriangleAlert size={17} className="mt-0.5 shrink-0 text-[var(--trigonum-danger)]" />
                  Проверка отклонена. Попробуйте пройти её ещё раз — документ должен быть виден целиком и без бликов.
                </p>
              )}

              {decision === 'Review' && (
                <p className="flex items-start gap-2 text-sm text-[var(--trigonum-text)]">
                  <Info size={17} className="mt-0.5 shrink-0 text-[var(--trigonum-blue)]" />
                  Проверка на ручном рассмотрении. Сообщим о результате.
                </p>
              )}

              {currentStatus === 'EXPIRED' && (
                <p className="flex items-start gap-2 text-sm text-[var(--trigonum-text)]">
                  <Info size={17} className="mt-0.5 shrink-0 text-[var(--trigonum-blue)]" />
                  Срок сессии истёк. Начните проверку заново.
                </p>
              )}

              {(decision === 'Declined' || currentStatus === 'FAILED' || currentStatus === 'EXPIRED') && (
                <OutlineButton
                  type="button"
                  className="mt-4"
                  disabled={starting}
                  onClick={() => void startVerification(true)}
                >
                  <RefreshCw size={15} />
                  Пройти заново
                </OutlineButton>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <span className="text-sm text-[var(--trigonum-muted)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--trigonum-ink)]">{value}</span>
    </div>
  )
}

/** Промежуточные статусы сессии: видно, на какой стадии проверка сейчас. */
function StatusTrack({ current }: { current: string }) {
  const stages = [
    { key: 'PENDING', label: 'Сессия создана' },
    { key: 'IN_PROGRESS', label: 'Документы на проверке' },
    { key: 'COMPLETED', label: 'Решение получено' },
  ]
  const activeIndex = stages.findIndex((stage) => stage.key === current)

  return (
    <ol className="mt-4 flex flex-col gap-2.5">
      {stages.map((stage, index) => {
        const done = activeIndex > index
        const active = activeIndex === index
        return (
          <li key={stage.key} className="flex items-center gap-2.5">
            <span
              className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                done
                  ? 'bg-[var(--trigonum-success)] text-white'
                  : active
                    ? 'bg-[var(--trigonum-ink)] text-white'
                    : 'bg-[var(--trigonum-border)] text-[var(--trigonum-muted)]'
              }`}
            >
              {done ? '✓' : index + 1}
            </span>
            <span
              className={`text-sm ${active ? 'font-semibold text-[var(--trigonum-ink)]' : 'text-[var(--trigonum-muted)]'}`}
            >
              {stage.label}
            </span>
            {active && (
              <span className="ml-1 size-1.5 animate-pulse rounded-full bg-[var(--trigonum-ink)]" aria-hidden="true" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
