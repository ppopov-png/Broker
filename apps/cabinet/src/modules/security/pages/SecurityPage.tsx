import {
  Check,
  Copy,
  Fingerprint,
  Laptop,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Trash2,
  TriangleAlert,
  Wallet,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { TIER_PERK_MATRIX, tierInk, tierSoft } from '../../../shared/lib/InvestorStatus'
import { useInvestorStatus } from '../../../shared/lib/useInvestorStatus'
import { Card } from '../../../shared/ui/Card'
import { Modal } from '../../../shared/ui/Modal'
import { Pill } from '../../../shared/ui/Pill'
import { Switch } from '../../../shared/ui/Switch'
import { OutlineButton, PrimaryButton } from '../../../shared/ui/buttons'

const STORAGE_KEY = 'trigonum-broker-security-v1'

interface Passkey {
  id: string
  name: string
  addedAt: string
}

interface Payout {
  id: string
  label: string
  detail: string
  kind: 'bank' | 'crypto'
  /** Новые реквизиты сутки недоступны для вывода — защита от угона аккаунта. */
  holdUntil: number | null
}

interface Session {
  id: string
  device: string
  location: string
  lastSeen: string
  current: boolean
  kind: 'desktop' | 'mobile'
}

interface SecurityState {
  twoFa: boolean
  withdrawalConfirm: boolean
  loginAlerts: boolean
  whitelistOnly: boolean
  antiPhishing: string
  passkeys: Passkey[]
  payouts: Payout[]
  backupCodesLeft: number
}

const initialState: SecurityState = {
  twoFa: true,
  withdrawalConfirm: true,
  loginAlerts: true,
  whitelistOnly: true,
  antiPhishing: '',
  passkeys: [
    { id: 'pk-mac', name: 'MacBook Pro · Touch ID', addedAt: '18.02.2026' },
    { id: 'pk-iphone', name: 'iPhone 15 · Face ID', addedAt: '02.05.2026' },
  ],
  payouts: [
    { id: 'po-bank', label: 'Банковский счёт', detail: 'Kaspi Bank · •••• 4587', kind: 'bank', holdUntil: null },
    { id: 'po-usdt', label: 'USDT · TRC20', detail: 'TQn9…f2Rk', kind: 'crypto', holdUntil: null },
  ],
  backupCodesLeft: 10,
}

const initialSessions: Session[] = [
  { id: 's1', device: 'Chrome · macOS', location: 'Алматы, Казахстан', lastSeen: 'сейчас', current: true, kind: 'desktop' },
  { id: 's2', device: 'Trigonum App · iPhone 15', location: 'Алматы, Казахстан', lastSeen: '2 часа назад', current: false, kind: 'mobile' },
  { id: 's3', device: 'Safari · iPad', location: 'Астана, Казахстан', lastSeen: '4 дня назад', current: false, kind: 'mobile' },
]

interface LogEntry {
  id: string
  title: string
  detail: string
  at: string
  tone: 'normal' | 'warning'
}

const securityLog: LogEntry[] = [
  { id: 'l1', title: 'Вход в кабинет', detail: 'Chrome · macOS · Алматы', at: 'Сегодня, 09:14', tone: 'normal' },
  { id: 'l2', title: 'Добавлены реквизиты вывода', detail: 'USDT · TRC20 · TQn9…f2Rk', at: 'Вчера, 18:40', tone: 'normal' },
  { id: 'l3', title: 'Отклонён вход', detail: 'Неизвестное устройство · Франкфурт, Германия', at: '02.09.2026, 03:21', tone: 'warning' },
  { id: 'l4', title: 'Смена пароля', detail: 'Chrome · macOS · Алматы', at: '28.08.2026, 12:05', tone: 'normal' },
  { id: 'l5', title: 'Подтверждён вывод', detail: '$10,000 · банковский перевод', at: '22.08.2026, 17:47', tone: 'normal' },
]

function loadState(): SecurityState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    return { ...initialState, ...(JSON.parse(raw) as Partial<SecurityState>) }
  } catch {
    return initialState
  }
}

function randomCode(length: number) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}

export function SecurityPage() {
  const { status } = useInvestorStatus()
  const ink = tierInk[status.tier]
  const soft = tierSoft[status.tier]

  const stored = useMemo(loadState, [])
  const [state, setState] = useState(stored)
  const [sessions, setSessions] = useState(initialSessions)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [addPayoutOpen, setAddPayoutOpen] = useState(false)
  const [payoutDraft, setPayoutDraft] = useState({ label: '', detail: '' })
  const [phishingOpen, setPhishingOpen] = useState(false)
  const [phishingDraft, setPhishingDraft] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [copied, setCopied] = useState(false)

  const update = (patch: Partial<SecurityState>) => {
    const next = { ...state, ...patch }
    setState(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  useEffect(() => {
    if (!passwordSaved) return
    const id = window.setTimeout(() => setPasswordSaved(false), 2400)
    return () => window.clearTimeout(id)
  }, [passwordSaved])

  // Оценка складывается из реально включённых мер, а не из фиксированного числа.
  const factors = [
    { key: '2fa', label: 'Двухфакторная аутентификация', weight: 25, done: state.twoFa },
    { key: 'passkey', label: 'Passkey хотя бы на одном устройстве', weight: 20, done: state.passkeys.length > 0 },
    { key: 'confirm', label: 'Подтверждение каждого вывода', weight: 20, done: state.withdrawalConfirm },
    { key: 'whitelist', label: 'Вывод только на проверенные реквизиты', weight: 15, done: state.whitelistOnly },
    { key: 'alerts', label: 'Оповещения о входах', weight: 10, done: state.loginAlerts },
    { key: 'phishing', label: 'Антифишинг-код в письмах', weight: 10, done: Boolean(state.antiPhishing) },
  ]
  const score = factors.reduce((sum, factor) => sum + (factor.done ? factor.weight : 0), 0)
  const weakSpots = factors.filter((factor) => !factor.done)
  const scoreLabel = score >= 90 ? 'Максимальная' : score >= 70 ? 'Высокая' : score >= 45 ? 'Средняя' : 'Низкая'

  const withdrawalLimit = TIER_PERK_MATRIX.find((row) => row.label === 'Лимит вывода в сутки')?.values[status.tier] ?? '—'
  const withdrawalFee = TIER_PERK_MATRIX.find((row) => row.label === 'Комиссия вывода')?.values[status.tier] ?? '—'

  const addPayout = () => {
    if (!payoutDraft.label.trim() || !payoutDraft.detail.trim()) return
    update({
      payouts: [
        ...state.payouts,
        {
          id: `po-${Date.now()}`,
          label: payoutDraft.label.trim(),
          detail: payoutDraft.detail.trim(),
          kind: /^[A-Za-z0-9]{20,}$/.test(payoutDraft.detail.trim()) ? 'crypto' : 'bank',
          holdUntil: Date.now() + 24 * 60 * 60 * 1000,
        },
      ],
    })
    setPayoutDraft({ label: '', detail: '' })
    setAddPayoutOpen(false)
  }

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 10 }, () => `${randomCode(4)}-${randomCode(4)}`)
    setBackupCodes(codes)
    update({ backupCodesLeft: codes.length })
  }

  const downloadBackupCodes = () => {
    if (!backupCodes) return
    const blob = new Blob([`Trigonum Broker — резервные коды\n\n${backupCodes.join('\n')}\n`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'trigonum-backup-codes.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="pb-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--trigonum-ink)]">Безопасность</h1>
        <p className="mt-1 text-sm text-[var(--trigonum-muted)]">Доступ к счёту, подтверждение операций и журнал событий</p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Оценка защиты ведёт себя как чек-лист: каждый пункт кликабелен */}
          <Card title="Защита аккаунта">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-bold tabular-nums text-[var(--trigonum-ink)]">
                  {score}
                  <span className="ml-1 text-lg font-semibold text-[var(--trigonum-muted)]">/100</span>
                </p>
                <p className="mt-1 text-sm font-semibold" style={{ color: ink }}>
                  {scoreLabel} защита
                </p>
              </div>
              {weakSpots.length === 0 ? (
                <Pill tone="success" icon={<Check size={13} />}>Все меры включены</Pill>
              ) : (
                <Pill tone="warning">Не включено: {weakSpots.length}</Pill>
              )}
            </div>

            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--trigonum-bg)]">
              <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${score}%`, background: ink }} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {factors.map((factor) => (
                <div
                  key={factor.key}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${
                    factor.done ? 'border-[var(--trigonum-border)]' : 'border-[color-mix(in_srgb,var(--trigonum-warning)_45%,white)] bg-[color-mix(in_srgb,var(--trigonum-warning)_6%,white)]'
                  }`}
                >
                  <span className="min-w-0 text-sm text-[var(--trigonum-text)]">{factor.label}</span>
                  {factor.done ? (
                    <Check size={15} strokeWidth={2.5} className="shrink-0 text-[var(--trigonum-success)] opacity-70" />
                  ) : (
                    <span className="shrink-0 text-xs font-semibold text-[var(--trigonum-warning)]">+{factor.weight}</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card title="Способы входа">
            <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
              <ToggleRow
                icon={<ShieldCheck size={16} />}
                label="Двухфакторная аутентификация"
                detail="Код из приложения-аутентификатора при каждом входе"
                checked={state.twoFa}
                onChange={(twoFa) => update({ twoFa })}
              />
              <ToggleRow
                icon={<Lock size={16} />}
                label="Оповещения о входах"
                detail="Письмо при входе с нового устройства"
                checked={state.loginAlerts}
                onChange={(loginAlerts) => update({ loginAlerts })}
              />
            </div>

            <div className="mt-4 rounded-xl border border-[var(--trigonum-border)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Fingerprint size={16} className="text-[var(--trigonum-muted)]" />
                  <p className="text-sm font-semibold text-[var(--trigonum-ink)]">Passkey</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    update({
                      passkeys: [
                        ...state.passkeys,
                        { id: `pk-${Date.now()}`, name: 'Новое устройство', addedAt: new Date().toLocaleDateString('ru-RU') },
                      ],
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--trigonum-border)] px-3 py-1.5 text-xs font-semibold text-[var(--trigonum-ink)] transition hover:border-[var(--trigonum-ink)]"
                >
                  <Plus size={13} />
                  Добавить
                </button>
              </div>

              <div className="mt-3 flex flex-col divide-y divide-[var(--trigonum-border)]">
                {state.passkeys.length === 0 && (
                  <p className="text-sm text-[var(--trigonum-muted)]">Ни одного ключа. Вход останется только по паролю.</p>
                )}
                {state.passkeys.map((passkey) => (
                  <div key={passkey.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--trigonum-ink)]">{passkey.name}</p>
                      <p className="text-xs text-[var(--trigonum-muted)]">добавлен {passkey.addedAt}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => update({ passkeys: state.passkeys.filter((item) => item.id !== passkey.id) })}
                      className="shrink-0 rounded-lg p-2 text-[var(--trigonum-muted)] transition hover:bg-[var(--trigonum-bg)] hover:text-[var(--trigonum-danger)]"
                      aria-label={`Удалить ${passkey.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <form
              className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3"
              onSubmit={(event) => {
                event.preventDefault()
                setPasswordSaved(true)
                event.currentTarget.reset()
              }}
            >
              <label className="text-sm sm:col-span-3">
                <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Смена пароля</span>
              </label>
              <input required type="password" placeholder="Текущий пароль" className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--trigonum-ink)]" />
              <input required type="password" placeholder="Новый пароль" minLength={8} className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--trigonum-ink)]" />
              <input required type="password" placeholder="Повторите новый" minLength={8} className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--trigonum-ink)]" />
              <div className="flex items-center gap-3 sm:col-span-3">
                <PrimaryButton type="submit">Обновить пароль</PrimaryButton>
                {passwordSaved && <Pill tone="success" icon={<Check size={13} />}>Пароль обновлён</Pill>}
              </div>
            </form>
          </Card>

          <Card
            title="Журнал безопасности"
            action={<span className="text-xs text-[var(--trigonum-muted)]">за 30 дней</span>}
          >
            <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
              {securityLog.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span
                    className={`mt-0.5 shrink-0 ${entry.tone === 'warning' ? 'text-[var(--trigonum-danger)]' : 'text-[var(--trigonum-muted)]'}`}
                  >
                    {entry.tone === 'warning' ? <TriangleAlert size={16} /> : <Check size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{entry.title}</p>
                    <p className="text-xs text-[var(--trigonum-muted)]">{entry.detail}</p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-[var(--trigonum-muted)]">{entry.at}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card
            title="Активные сессии"
            action={
              sessions.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setSessions((list) => list.filter((session) => session.current))}
                  className="text-xs font-semibold text-[var(--trigonum-blue)]"
                >
                  Завершить все →
                </button>
              ) : undefined
            }
          >
            <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="shrink-0 text-[var(--trigonum-muted)]">
                    {session.kind === 'mobile' ? <Smartphone size={16} /> : <Laptop size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--trigonum-ink)]">{session.device}</p>
                    <p className="text-xs text-[var(--trigonum-muted)]">
                      {session.location} · {session.lastSeen}
                    </p>
                  </div>
                  {session.current ? (
                    <Pill tone="success">Текущая</Pill>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSessions((list) => list.filter((item) => item.id !== session.id))}
                      className="shrink-0 rounded-lg p-2 text-[var(--trigonum-muted)] transition hover:bg-[var(--trigonum-bg)] hover:text-[var(--trigonum-danger)]"
                      aria-label={`Завершить сессию ${session.device}`}
                    >
                      <LogOut size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Вывод средств"
            action={
              <Link to="/levels" className="text-xs font-semibold text-[var(--trigonum-blue)]">
                Лимиты уровня →
              </Link>
            }
          >
            <div className="rounded-xl p-3.5" style={{ background: soft }}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">
                  Лимит {status.tier}
                </span>
                <span className="text-sm font-bold" style={{ color: ink }}>
                  {withdrawalLimit}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <span className="text-xs text-[var(--trigonum-muted)]">Комиссия</span>
                <span className="text-xs font-semibold text-[var(--trigonum-ink)]">{withdrawalFee}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col divide-y divide-[var(--trigonum-border)]">
              <ToggleRow
                icon={<ShieldCheck size={16} />}
                label="Подтверждать каждый вывод"
                detail="Код на email и в приложении"
                checked={state.withdrawalConfirm}
                onChange={(withdrawalConfirm) => update({ withdrawalConfirm })}
              />
              <ToggleRow
                icon={<Wallet size={16} />}
                label="Только проверенные реквизиты"
                detail="Вывод на новые реквизиты — через сутки после добавления"
                checked={state.whitelistOnly}
                onChange={(whitelistOnly) => update({ whitelistOnly })}
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">Реквизиты</p>
                <button
                  type="button"
                  onClick={() => setAddPayoutOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--trigonum-blue)]"
                >
                  <Plus size={13} />
                  Добавить
                </button>
              </div>
              <div className="mt-2 flex flex-col divide-y divide-[var(--trigonum-border)]">
                {state.payouts.map((payout) => {
                  const held = payout.holdUntil !== null && payout.holdUntil > Date.now()
                  return (
                    <div key={payout.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--trigonum-ink)]">{payout.label}</p>
                        <p className="truncate text-xs text-[var(--trigonum-muted)]">{payout.detail}</p>
                      </div>
                      {held ? <Pill tone="warning">Холд 24 ч</Pill> : <Pill tone="success">Проверены</Pill>}
                      <button
                        type="button"
                        onClick={() => update({ payouts: state.payouts.filter((item) => item.id !== payout.id) })}
                        className="shrink-0 rounded-lg p-1.5 text-[var(--trigonum-muted)] transition hover:text-[var(--trigonum-danger)]"
                        aria-label={`Удалить ${payout.label}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>

          <Card title="Антифишинг-код">
            {state.antiPhishing ? (
              <>
                <p className="text-sm text-[var(--trigonum-muted)]">
                  Код показывается в каждом письме Trigonum. Письма без него — подделка.
                </p>
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl px-3.5 py-3" style={{ background: soft }}>
                  <span className="text-lg font-bold tracking-[0.2em]" style={{ color: ink }}>
                    {state.antiPhishing}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPhishingDraft(state.antiPhishing)
                      setPhishingOpen(true)
                    }}
                    className="text-xs font-semibold text-[var(--trigonum-blue)]"
                  >
                    Изменить
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-[var(--trigonum-muted)]">
                  Своё слово в письмах Trigonum: если его нет — письмо не от нас.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPhishingDraft('')
                    setPhishingOpen(true)
                  }}
                  className="mt-3 w-full rounded-lg bg-[var(--trigonum-ink)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-125"
                >
                  Задать код
                </button>
              </>
            )}
          </Card>

          <Card title="Резервные коды">
            <p className="text-sm text-[var(--trigonum-muted)]">
              Одноразовые коды на случай потери телефона. Осталось{' '}
              <b className="tabular-nums text-[var(--trigonum-ink)]">{state.backupCodesLeft}</b>.
            </p>

            {backupCodes && (
              <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-xl bg-[var(--trigonum-bg)] p-3">
                {backupCodes.map((backupCode) => (
                  <span key={backupCode} className="text-xs font-semibold tabular-nums text-[var(--trigonum-ink)]">
                    {backupCode}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <OutlineButton type="button" onClick={generateBackupCodes} className="px-3 py-2 text-xs">
                <RefreshCw size={13} />
                Сгенерировать
              </OutlineButton>
              {backupCodes && (
                <>
                  <OutlineButton type="button" onClick={downloadBackupCodes} className="px-3 py-2 text-xs">
                    Скачать
                  </OutlineButton>
                  <OutlineButton
                    type="button"
                    className="px-3 py-2 text-xs"
                    onClick={() => {
                      navigator.clipboard?.writeText(backupCodes.join('\n'))
                      setCopied(true)
                      window.setTimeout(() => setCopied(false), 2000)
                    }}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? 'Скопировано' : 'Копировать'}
                  </OutlineButton>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={addPayoutOpen}
        onClose={() => setAddPayoutOpen(false)}
        title="Новые реквизиты"
        subtitle="Вывод на них откроется через 24 часа после добавления"
      >
        <div className="flex flex-col gap-4">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Название</span>
            <input
              value={payoutDraft.label}
              onChange={(event) => setPayoutDraft((draft) => ({ ...draft, label: event.target.value }))}
              placeholder="Например, Банковский счёт"
              className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--trigonum-ink)]"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Реквизиты</span>
            <input
              value={payoutDraft.detail}
              onChange={(event) => setPayoutDraft((draft) => ({ ...draft, detail: event.target.value }))}
              placeholder="Номер счёта или адрес кошелька"
              className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--trigonum-ink)]"
            />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <OutlineButton type="button" onClick={() => setAddPayoutOpen(false)}>
            Отмена
          </OutlineButton>
          <PrimaryButton type="button" onClick={addPayout} disabled={!payoutDraft.label.trim() || !payoutDraft.detail.trim()}>
            Добавить
          </PrimaryButton>
        </div>
      </Modal>

      <Modal
        open={phishingOpen}
        onClose={() => setPhishingOpen(false)}
        title="Антифишинг-код"
        subtitle="От 4 до 12 символов — слово, которое узнаете только вы"
      >
        <input
          value={phishingDraft}
          maxLength={12}
          onChange={(event) => setPhishingDraft(event.target.value.toUpperCase().replace(/\s/g, ''))}
          placeholder="НАПРИМЕР, ALMATY26"
          className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-center text-lg font-bold tracking-[0.2em] outline-none focus:border-[var(--trigonum-ink)]"
        />
        <div className="mt-5 flex justify-end gap-2">
          <OutlineButton type="button" onClick={() => setPhishingOpen(false)}>
            Отмена
          </OutlineButton>
          <PrimaryButton
            type="button"
            disabled={phishingDraft.trim().length < 4}
            onClick={() => {
              update({ antiPhishing: phishingDraft.trim() })
              setPhishingOpen(false)
            }}
          >
            Сохранить
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  )
}

function ToggleRow({
  icon,
  label,
  detail,
  checked,
  onChange,
}: {
  icon: ReactNode
  label: string
  detail: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <span className="shrink-0 text-[var(--trigonum-muted)]">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{label}</p>
        <p className="text-xs text-[var(--trigonum-muted)]">{detail}</p>
      </div>
      <Switch checked={checked} onChange={onChange} label={label} tone="ink" />
    </div>
  )
}
