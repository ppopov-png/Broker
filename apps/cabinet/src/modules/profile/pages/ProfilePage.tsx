import {
  Building2,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Download,
  FileText,
  Lock,
  MessageCircle,
  Pencil,
  Trash2,
  TriangleAlert,
  UserRoundCog,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useBrokerAccount } from '../../../shared/lib/AccountContext'
import { formatCurrency } from '../../../shared/lib/format'
import {
  buildScoreHistory,
  tierAccent,
  tierHero,
  tierInk,
  tierMetallic,
  tierSoft,
} from '../../../shared/lib/InvestorStatus'
import { useInvestorStatus } from '../../../shared/lib/useInvestorStatus'
import { Card } from '../../../shared/ui/Card'
import { Modal } from '../../../shared/ui/Modal'
import { Pill } from '../../../shared/ui/Pill'
import { Reveal } from '../../../shared/ui/Reveal'
import { SegmentedControl } from '../../../shared/ui/SegmentedControl'
import { Sparkline } from '../../../shared/ui/Sparkline'
import { Switch } from '../../../shared/ui/Switch'
import { OutlineButton, PrimaryButton } from '../../../shared/ui/buttons'

const PROFILE_STORAGE_KEY = 'trigonum-broker-profile-v7'
const AVATAR_SIZE = 160

type ProfileFields = {
  firstName: string
  lastName: string
  email: string
  phone: string
  birthDate: string
  citizenship: string
  country: string
  address: string
  taxResidency: string
  backupContact: string
}

type Preferences = {
  events: boolean
  payouts: boolean
  money: boolean
  products: boolean
  email: boolean
  push: boolean
  telegram: boolean
}

type Settings = {
  language: 'ru' | 'en'
  currency: 'USD' | 'EUR' | 'KZT'
}

/** Значения контактов, которые клиент уже подтвердил кодом. */
type Verified = { email: string; phone: string }

interface StoredProfile {
  fields: ProfileFields
  preferences: Preferences
  settings: Settings
  verified: Verified
  avatar: string | null
}

interface FieldSpec {
  key: keyof ProfileFields
  label: string
  /** Поле обязательно для полного профиля. */
  required: boolean
  placeholder: string
  /** Подтверждено брокером по документам — меняется только через поддержку. */
  locked?: boolean
  /** Контакт, который после изменения нужно подтвердить кодом. */
  contact?: boolean
  wide?: boolean
}

const initialFields: ProfileFields = {
  firstName: 'Артём',
  lastName: 'Дробков',
  email: 'artem.drobkov@example.com',
  phone: '+7 (700) 123-45-67',
  birthDate: '14.06.1990',
  citizenship: 'Республика Казахстан',
  country: 'Казахстан',
  address: 'г. Алматы, ул. Абая, 15',
  taxResidency: '',
  backupContact: '',
}

const initialPreferences: Preferences = {
  events: true,
  payouts: true,
  money: true,
  products: true,
  email: true,
  push: true,
  telegram: false,
}

const initialSettings: Settings = { language: 'ru', currency: 'USD' }

const fieldSpecs: FieldSpec[] = [
  { key: 'firstName', label: 'Имя', required: true, placeholder: 'Артём', locked: true },
  { key: 'lastName', label: 'Фамилия', required: true, placeholder: 'Дробков', locked: true },
  { key: 'email', label: 'Email', required: true, placeholder: 'name@example.com', contact: true },
  { key: 'phone', label: 'Телефон', required: true, placeholder: '+7 (700) 000-00-00', contact: true },
  { key: 'birthDate', label: 'Дата рождения', required: true, placeholder: 'ДД.ММ.ГГГГ', locked: true },
  { key: 'citizenship', label: 'Гражданство', required: true, placeholder: 'Страна гражданства', locked: true },
  { key: 'country', label: 'Страна проживания', required: true, placeholder: 'Казахстан' },
  { key: 'address', label: 'Адрес', required: true, placeholder: 'Город, улица, дом', wide: true },
  { key: 'taxResidency', label: 'Налоговое резидентство (TIN)', required: true, placeholder: 'KZ · 900614300123' },
  { key: 'backupContact', label: 'Резервный контакт', required: false, placeholder: 'Телефон или email' },
]

const contactSpecs = fieldSpecs.filter((spec) => spec.contact)

function loadProfile(): StoredProfile {
  const fallback: StoredProfile = {
    fields: initialFields,
    preferences: initialPreferences,
    settings: initialSettings,
    verified: { email: initialFields.email, phone: initialFields.phone },
    avatar: null,
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<StoredProfile>
    return {
      fields: { ...initialFields, ...parsed.fields },
      preferences: { ...initialPreferences, ...parsed.preferences },
      settings: { ...initialSettings, ...parsed.settings },
      verified: { ...fallback.verified, ...parsed.verified },
      avatar: parsed.avatar ?? null,
    }
  } catch {
    return fallback
  }
}

/**
 * Незаполненное обязательное поле снижает процент готовности профиля, но не мешает
 * сохранить остальные правки. Ошибкой считаем только стирание уже заполненного поля
 * и неверный формат.
 */
function validate(fields: ProfileFields, saved: ProfileFields): Partial<Record<keyof ProfileFields, string>> {
  const errors: Partial<Record<keyof ProfileFields, string>> = {}

  for (const spec of fieldSpecs) {
    if (spec.required && !fields[spec.key].trim() && saved[spec.key].trim()) {
      errors[spec.key] = 'Поле нельзя оставить пустым'
    }
  }
  if (fields.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.trim())) {
    errors.email = 'Похоже на опечатку в адресе'
  }
  if (fields.phone.trim() && fields.phone.replace(/\D/g, '').length < 10) {
    errors.phone = 'Укажите номер с кодом страны'
  }
  if (fields.birthDate.trim() && !/^\d{2}\.\d{2}\.\d{4}$/.test(fields.birthDate.trim())) {
    errors.birthDate = 'Формат ДД.ММ.ГГГГ'
  }

  return errors
}

/** Ужимаем картинку до квадрата AVATAR_SIZE, иначе dataURL не влезет в localStorage. */
async function fileToAvatar(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = AVATAR_SIZE
  canvas.height = AVATAR_SIZE

  const context = canvas.getContext('2d')
  if (!context) throw new Error('canvas недоступен')
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE,
  )
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.82)
}

export function ProfilePage() {
  const { activeAccount } = useBrokerAccount()
  const { status, invested, lockedEvents, totalCapital } = useInvestorStatus()

  const stored = useMemo(loadProfile, [])
  const [fields, setFields] = useState(stored.fields)
  const [preferences, setPreferences] = useState(stored.preferences)
  const [settings, setSettings] = useState(stored.settings)
  const [verified, setVerified] = useState(stored.verified)
  const [avatar, setAvatar] = useState(stored.avatar)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(stored.fields)
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFields, string>>>({})
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [avatarError, setAvatarError] = useState('')

  // Очередь контактов, ожидающих подтверждения кодом.
  const [pending, setPending] = useState<(keyof ProfileFields)[]>([])
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [closeOpen, setCloseOpen] = useState(false)
  const [closeConfirm, setCloseConfirm] = useState('')
  const [closeRequested, setCloseRequested] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => setEditing(false), [activeAccount.id])

  useEffect(() => {
    if (!saved) return
    const id = window.setTimeout(() => setSaved(false), 2400)
    return () => window.clearTimeout(id)
  }, [saved])

  const persist = (patch: Partial<StoredProfile>) => {
    const next: StoredProfile = { fields, preferences, settings, verified, avatar, ...patch }
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next))
  }

  const startEditing = () => {
    setDraft(fields)
    setErrors({})
    setEditing(true)
  }

  const saveProfile = () => {
    const nextErrors = validate(draft, fields)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const trimmed = Object.fromEntries(
      Object.entries(draft).map(([key, value]) => [key, value.trim()]),
    ) as ProfileFields

    setFields(trimmed)
    persist({ fields: trimmed })
    setEditing(false)
    setSaved(true)

    // Изменённые контакты уходят на подтверждение кодом.
    const changed = contactSpecs
      .filter((spec) => trimmed[spec.key] !== verified[spec.key as keyof Verified])
      .map((spec) => spec.key)
    setPending(changed)
    setCode('')
    setCodeError('')
  }

  const confirmCode = () => {
    if (!/^\d{6}$/.test(code)) {
      setCodeError('Код состоит из шести цифр')
      return
    }
    const key = pending[0]
    const nextVerified = { ...verified, [key]: fields[key] }
    setVerified(nextVerified)
    persist({ verified: nextVerified })
    setPending((queue) => queue.slice(1))
    setCode('')
    setCodeError('')
  }

  const togglePreference = (key: keyof Preferences) => {
    const next = { ...preferences, [key]: !preferences[key] }
    setPreferences(next)
    persist({ preferences: next })
  }

  const updateSettings = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    persist({ settings: next })
  }

  const pickAvatar = async (file: File | undefined) => {
    if (!file) return
    setAvatarError('')
    if (!file.type.startsWith('image/')) {
      setAvatarError('Нужен файл изображения')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setAvatarError('Файл больше 8 МБ')
      return
    }
    try {
      const dataUrl = await fileToAvatar(file)
      setAvatar(dataUrl)
      persist({ avatar: dataUrl })
    } catch {
      setAvatarError('Не удалось обработать файл')
    }
  }

  const removeAvatar = () => {
    setAvatar(null)
    persist({ avatar: null })
  }

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      account: {
        number: activeAccount.accountNumber,
        type: activeAccount.accountLabel,
        verifiedAt: activeAccount.verificationDate,
      },
      investorStatus: { tier: status.tier, score: status.score, breakdown: status.breakdown },
      fields,
      preferences,
      settings,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `trigonum-${activeAccount.accountNumber}-profile.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const missing = fieldSpecs.filter((spec) => spec.required && !fields[spec.key].trim())
  const requiredCount = fieldSpecs.filter((spec) => spec.required).length
  const completeness = Math.round(((requiredCount - missing.length) / requiredCount) * 100)

  const copyReferral = () => {
    navigator.clipboard?.writeText('https://trigonum.ae/ref/ARTEM-7K4P')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  if (activeAccount.type === 'company' && activeAccount.company) return <CompanyProfile />

  const accent = tierAccent[status.tier]
  const ink = tierInk[status.tier]
  const soft = tierSoft[status.tier]
  const onMetal = status.tier === 'Black' ? '#f4f4f5' : '#1b1d22'
  const onMetalMuted = status.tier === 'Black' ? 'rgb(255 255 255 / 50%)' : 'rgb(0 0 0 / 48%)'
  const hasPrivateDesk = status.tier === 'Diamond' || status.tier === 'Black'
  const scoreHistory = buildScoreHistory(status.score)
  const pendingSpec = pending.length > 0 ? fieldSpecs.find((spec) => spec.key === pending[0]) : undefined

  return (
    <div className="pb-10">
      {/* Шапка в тон уровню: статус читается раньше всего остального */}
      <Reveal>
        <section
          className="relative overflow-hidden rounded-[24px] text-white"
          style={{ background: tierHero[status.tier] }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-40 size-[460px] rounded-full"
            style={{ background: `radial-gradient(circle, ${accent}26 0%, transparent 68%)` }}
          />

          <div className="relative grid gap-8 p-7 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)] xl:items-center">
            <div className="flex min-w-0 items-center gap-5">
              <div className="group relative shrink-0">
                {avatar ? (
                  <img
                    src={avatar}
                    alt=""
                    className="size-[76px] rounded-full object-cover"
                    style={{ boxShadow: `inset 0 0 0 1px ${accent}55` }}
                  />
                ) : (
                  <div
                    className="grid size-[76px] place-items-center rounded-full text-xl font-semibold tracking-tight"
                    style={{ background: 'rgb(255 255 255 / 6%)', boxShadow: `inset 0 0 0 1px ${accent}55` }}
                  >
                    {activeAccount.initials}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 grid place-items-center rounded-full bg-black/55 text-[11px] font-semibold opacity-0 transition focus-visible:opacity-100 group-hover:opacity-100"
                >
                  Сменить
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    void pickAvatar(event.target.files?.[0])
                    event.target.value = ''
                  }}
                />

                <span className="pointer-events-none absolute -bottom-0.5 -right-0.5 grid size-6 place-items-center rounded-full bg-[var(--trigonum-success)] text-white ring-[3px] ring-black/25">
                  <Check size={11} strokeWidth={3} />
                </span>
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-[30px] font-medium leading-none tracking-[-.03em]">
                  {activeAccount.name}
                </h1>
                <p className="mt-2.5 text-sm text-white/45">
                  {activeAccount.accountLabel} · <span className="tabular-nums">{activeAccount.accountNumber}</span> ·
                  с {activeAccount.verificationDate}
                </p>
                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  <QuietChip>{activeAccount.verificationStatus}</QuietChip>
                  <QuietChip>2FA</QuietChip>
                  <QuietChip>Вывод защищён</QuietChip>
                  {avatar && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="text-[11px] font-medium text-white/35 underline-offset-2 hover:text-white/60 hover:underline"
                    >
                      Убрать фото
                    </button>
                  )}
                </div>
                {avatarError && <p className="mt-2 text-[11px] font-medium text-[#ff9b9b]">{avatarError}</p>}
              </div>
            </div>

            {/* Уровень: металлик по тиру, динамика баллов и переход к привилегиям */}
            <Link
              to="/levels"
              className="group block rounded-[20px] p-px transition hover:brightness-110"
              style={{ background: tierMetallic[status.tier] }}
            >
              <div className="rounded-[19px] bg-black/8 p-5 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.18em]" style={{ color: onMetalMuted }}>
                      Уровень
                    </p>
                    <p
                      className="mt-1.5 text-[28px] font-semibold leading-none tracking-[-.03em]"
                      style={{ color: onMetal }}
                    >
                      {status.tier}
                    </p>
                  </div>
                  <ChevronRight
                    size={17}
                    className="mt-1 transition group-hover:translate-x-0.5"
                    style={{ color: onMetalMuted }}
                  />
                </div>

                <p className="mt-4 text-[9px] font-bold uppercase tracking-[.16em]" style={{ color: onMetalMuted }}>
                  Баллы за 12 месяцев
                </p>
                <div className="mt-1 h-7 opacity-40">
                  <Sparkline data={scoreHistory} color={onMetal} height={28} />
                </div>

                <div
                  className="mt-4 h-1.5 overflow-hidden rounded-full"
                  style={{ background: status.tier === 'Black' ? 'rgb(255 255 255 / 18%)' : 'rgb(0 0 0 / 14%)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${status.progress}%`, background: onMetal }}
                  />
                </div>

                <div
                  className="mt-2.5 flex items-center justify-between gap-3 text-[11px] font-semibold tabular-nums"
                  style={{ color: onMetalMuted }}
                >
                  <span>{status.score} pts</span>
                  <span>{status.nextTier ? `${status.pointsToNext} до ${status.nextTier}` : 'Максимум'}</span>
                </div>
              </div>
            </Link>
          </div>

          <div className="relative grid grid-cols-2 gap-px border-t border-white/8 bg-white/8 lg:grid-cols-4">
            <HeroMetric label="В продуктах" value={formatCurrency(invested)} />
            <HeroMetric label="В Events" value={formatCurrency(lockedEvents)} />
            <HeroMetric label="Общий капитал" value={formatCurrency(totalCapital)} />
            <HeroMetric label="Профиль" value={`${completeness}%`} accent={completeness < 100 ? accent : undefined} />
          </div>
        </section>
      </Reveal>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">
        {/* --- Левая колонка --------------------------------------------- */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Reveal delay={60}>
            <Card
              title="Личные данные"
              action={
                editing ? undefined : (
                  <div className="flex items-center gap-2">
                    {saved && <Pill tone="success" icon={<Check size={13} />}>Сохранено</Pill>}
                    <button
                      type="button"
                      onClick={startEditing}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--trigonum-border)] px-3 py-1.5 text-xs font-semibold text-[var(--trigonum-ink)] transition hover:border-[var(--trigonum-ink)]"
                    >
                      <Pencil size={13} />
                      Изменить
                    </button>
                  </div>
                )
              }
            >
              {editing ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    saveProfile()
                  }}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {fieldSpecs.map((spec) => (
                      <label key={spec.key} className={`text-sm ${spec.wide ? 'sm:col-span-2' : ''}`}>
                        <span className="mb-1 flex items-center gap-1.5 font-medium text-[var(--trigonum-text)]">
                          {spec.label}
                          {spec.locked && <Lock size={11} className="text-[var(--trigonum-muted)]" />}
                        </span>
                        <input
                          value={draft[spec.key]}
                          disabled={spec.locked}
                          placeholder={spec.placeholder}
                          onChange={(event) => {
                            const value = event.target.value
                            setDraft((current) => ({ ...current, [spec.key]: value }))
                            setErrors((current) => ({ ...current, [spec.key]: undefined }))
                          }}
                          className={`w-full rounded-lg border px-3 py-2.5 text-sm text-[var(--trigonum-ink)] outline-none transition disabled:cursor-not-allowed disabled:bg-[var(--trigonum-bg)] disabled:text-[var(--trigonum-muted)] ${
                            errors[spec.key]
                              ? 'border-[var(--trigonum-danger)]'
                              : 'border-[var(--trigonum-border)] focus:border-[var(--trigonum-ink)]'
                          }`}
                        />
                        {errors[spec.key] && (
                          <span className="mt-1 block text-xs font-medium text-[var(--trigonum-danger)]">
                            {errors[spec.key]}
                          </span>
                        )}
                        {spec.contact && draft[spec.key].trim() !== verified[spec.key as keyof Verified] && (
                          <span className="mt-1 block text-xs text-[var(--trigonum-muted)]">
                            Понадобится подтверждение кодом
                          </span>
                        )}
                      </label>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap justify-end gap-2">
                    <OutlineButton type="button" onClick={() => setEditing(false)}>
                      Отмена
                    </OutlineButton>
                    <PrimaryButton type="submit">Сохранить</PrimaryButton>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
                  {fieldSpecs.map((spec) => {
                    const value = fields[spec.key].trim()
                    const confirmed = spec.contact
                      ? value === verified[spec.key as keyof Verified]
                      : Boolean(spec.locked) && Boolean(value)
                    return (
                      <div key={spec.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                        <span className="text-sm text-[var(--trigonum-muted)]">{spec.label}</span>
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className={`truncate text-sm ${value ? 'font-semibold text-[var(--trigonum-ink)]' : 'text-[var(--trigonum-muted)]'}`}
                          >
                            {value || (spec.required ? 'Требуется' : '—')}
                          </span>
                          {/* Слот фиксированной ширины держит правый край значений ровным */}
                          <span className="grid w-4 shrink-0 place-items-center">
                            {value && confirmed && (
                              <Check size={14} strokeWidth={2.5} className="text-[var(--trigonum-success)] opacity-70" />
                            )}
                            {value && spec.contact && !confirmed && (
                              <Clock size={14} className="text-[var(--trigonum-warning)]" />
                            )}
                            {!value && spec.required && (
                              <span className="size-1.5 rounded-full bg-[var(--trigonum-warning)]" />
                            )}
                          </span>
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </Reveal>

          <Reveal delay={120}>
            <Card
              title="Реферальная программа"
              action={
                <span className="text-xs font-semibold tabular-nums" style={{ color: ink }}>
                  +15 pts за реферала
                </span>
              }
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl p-4" style={{ background: soft }}>
                  <p className="text-2xl font-bold tracking-[0.06em]" style={{ color: ink }}>
                    ARTEM-7K4P
                  </p>

                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] px-3 py-2">
                    <span className="min-w-0 flex-1 truncate text-xs text-[var(--trigonum-muted)]">
                      trigonum.ae/ref/ARTEM-7K4P
                    </span>
                    <button
                      type="button"
                      onClick={copyReferral}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[var(--trigonum-ink)] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:brightness-125"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Готово' : 'Копировать'}
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <RewardCell label="Доступно" value="$340" accent={ink} />
                    <RewardCell label="В ожидании" value="$180" />
                    <RewardCell label="Выплачено" value="$720" />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <FunnelStep label="Приглашено" value={8} share={100} accent={ink} />
                  <FunnelStep label="Прошли KYC" value={6} share={75} />
                  <FunnelStep label="Инвестируют" value={4} share={50} />
                  <FunnelStep label="Активны" value={3} share={38} />
                </div>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={180}>
            <Card title="Уведомления">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <PreferenceRow label="Новые Events" checked={preferences.events} onChange={() => togglePreference('events')} />
                <PreferenceRow label="Выплаты" checked={preferences.payouts} onChange={() => togglePreference('payouts')} />
                <PreferenceRow label="Движение средств" checked={preferences.money} onChange={() => togglePreference('money')} />
                <PreferenceRow label="Новые продукты" checked={preferences.products} onChange={() => togglePreference('products')} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--trigonum-border)] pt-4">
                <ChannelChip label="Email" on={preferences.email} onClick={() => togglePreference('email')} />
                <ChannelChip label="Push" on={preferences.push} onClick={() => togglePreference('push')} />
                <ChannelChip label="Telegram" on={preferences.telegram} onClick={() => togglePreference('telegram')} />
              </div>
            </Card>
          </Reveal>

          <Reveal delay={240}>
            <Card title="Данные и доступ">
              <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
                <ActionRow
                  icon={<Download size={16} />}
                  label="Скачать мои данные"
                  detail="Профиль, настройки и статус одним JSON-файлом"
                  actionLabel="Скачать"
                  onClick={exportData}
                />
                <ActionRow
                  icon={<TriangleAlert size={16} />}
                  label="Закрыть счёт"
                  detail="Заявка уходит в поддержку, средства выводятся на подтверждённые реквизиты"
                  actionLabel={closeRequested ? 'Заявка принята' : 'Закрыть'}
                  danger
                  disabled={closeRequested}
                  onClick={() => setCloseOpen(true)}
                />
              </div>
            </Card>
          </Reveal>
        </div>

        {/* --- Правая колонка -------------------------------------------- */}
        <div className="flex flex-col gap-5">
          {missing.length > 0 && (
            <Reveal delay={60}>
              <Card title={`Профиль ${completeness}%`}>
                <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--trigonum-bg)]">
                  <div className="h-full rounded-full" style={{ width: `${completeness}%`, background: ink }} />
                </div>
                <div className="flex flex-col gap-2">
                  {missing.map((spec) => (
                    <button
                      key={spec.key}
                      type="button"
                      onClick={startEditing}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-left transition hover:border-[var(--trigonum-ink)]"
                    >
                      <span className="text-sm font-semibold text-[var(--trigonum-ink)]">{spec.label}</span>
                      <ChevronRight size={14} className="shrink-0 text-[var(--trigonum-muted)]" />
                    </button>
                  ))}
                </div>
              </Card>
            </Reveal>
          )}

          <Reveal delay={120}>
            <Card title="Верификация">
              <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
                <StatusRow label="KYC" detail={activeAccount.verificationDate} />
                <StatusRow label="AML-скрининг" detail="Ограничений нет" />
                <StatusRow label="Источник средств" detail="Документы приняты" />
                <StatusRow label="Инвест-анкета" detail="Сбалансированный" />
              </div>

              {fields.taxResidency.trim() && (
                <Link
                  to="/documents"
                  className="mt-3 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[var(--trigonum-ink)] transition hover:brightness-95"
                  style={{ background: soft }}
                >
                  <span className="flex items-center gap-2">
                    <FileText size={15} style={{ color: ink }} />
                    Налоговый отчёт за 2025
                  </span>
                  <ChevronRight size={14} className="text-[var(--trigonum-muted)]" />
                </Link>
              )}
            </Card>
          </Reveal>

          <Reveal delay={180}>
            <Card
              title="Безопасность"
              action={
                <Link to="/security" className="text-xs font-semibold text-[var(--trigonum-blue)]">
                  Управление →
                </Link>
              }
            >
              <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
                <MetaRow label="2FA" value="Включена" />
                <MetaRow label="Passkey" value="2 устройства" />
                <MetaRow label="Подтверждение вывода" value="Включено" />
                <MetaRow label="Последняя сессия" value="MacBook Pro · Алматы" />
              </div>
            </Card>
          </Reveal>

          <Reveal delay={240}>
            <Card title="Предпочтения">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="mb-2 text-sm text-[var(--trigonum-muted)]">Язык кабинета</p>
                  <SegmentedControl
                    value={settings.language}
                    onChange={(language) => updateSettings({ language })}
                    options={[
                      { value: 'ru', label: 'Русский' },
                      { value: 'en', label: 'English' },
                    ]}
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm text-[var(--trigonum-muted)]">Валюта отчётности</p>
                  <SegmentedControl
                    value={settings.currency}
                    onChange={(currency) => updateSettings({ currency })}
                    options={[
                      { value: 'USD', label: 'USD' },
                      { value: 'EUR', label: 'EUR' },
                      { value: 'KZT', label: 'KZT' },
                    ]}
                  />
                  <p className="mt-2 text-xs text-[var(--trigonum-muted)]">
                    Счёт остаётся в USD — меняется только валюта выписок и отчётов
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={300}>
            <Card title="Private desk">
              {hasPrivateDesk ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="grid size-12 shrink-0 place-items-center rounded-full text-sm font-bold"
                      style={{ background: soft, color: ink }}
                    >
                      ДК
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--trigonum-ink)]">Дарья Ковалёва</p>
                      <p className="text-xs text-[var(--trigonum-muted)]">Персональный менеджер</p>
                    </div>
                  </div>

                  <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
                    <MetaRow label="Доверенное лицо" value="Не назначено" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/support"
                      className="flex items-center justify-center gap-2 rounded-lg bg-[var(--trigonum-ink)] px-3 py-2.5 text-sm font-semibold text-white transition hover:brightness-125"
                    >
                      <MessageCircle size={15} />
                      Написать
                    </Link>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm font-semibold text-[var(--trigonum-ink)] transition hover:border-[var(--trigonum-ink)]"
                    >
                      <UserRoundCog size={15} />
                      Назначить
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-[var(--trigonum-muted)]">
                    Персональный менеджер и доверенное лицо открываются на Diamond — осталось{' '}
                    <b className="tabular-nums text-[var(--trigonum-ink)]">{status.pointsToNext} pts</b>
                  </p>
                  <ul className="mt-3 flex flex-col gap-1.5">
                    <li className="flex items-center gap-2 text-xs text-[var(--trigonum-muted)]">
                      <Lock size={12} className="shrink-0" />
                      Персональный менеджер
                    </li>
                    <li className="flex items-center gap-2 text-xs text-[var(--trigonum-muted)]">
                      <Lock size={12} className="shrink-0" />
                      Доверенное лицо и наследование
                    </li>
                  </ul>
                  <Link to="/levels" className="mt-3 inline-flex text-xs font-semibold text-[var(--trigonum-blue)]">
                    Как получить Diamond →
                  </Link>
                </>
              )}
            </Card>
          </Reveal>

          <Reveal delay={360}>
            <Card title="Аккаунт">
              <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
                <MetaRow label="Тип счёта" value={activeAccount.accountLabel} />
                <MetaRow label="Номер" value={activeAccount.accountNumber} />
                <MetaRow label="Юрисдикция" value="Кыргызская Республика" />
                <MetaRow label="Валюта счёта" value="USD" />
              </div>
            </Card>
          </Reveal>
        </div>
      </div>

      {/* Подтверждение изменённого контакта */}
      <Modal
        open={Boolean(pendingSpec)}
        onClose={() => setPending([])}
        title={`Подтвердите ${pendingSpec?.label.toLowerCase() ?? ''}`}
        subtitle={pendingSpec ? `Код отправлен на ${fields[pendingSpec.key]}` : undefined}
      >
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Код из шести цифр</span>
          <input
            value={code}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
              setCodeError('')
            }}
            className={`w-full rounded-lg border px-3 py-2.5 text-center text-lg font-semibold tracking-[0.4em] tabular-nums text-[var(--trigonum-ink)] outline-none transition ${
              codeError ? 'border-[var(--trigonum-danger)]' : 'border-[var(--trigonum-border)] focus:border-[var(--trigonum-ink)]'
            }`}
          />
          {codeError && <span className="mt-1 block text-xs font-medium text-[var(--trigonum-danger)]">{codeError}</span>}
        </label>

        <p className="mt-3 text-xs text-[var(--trigonum-muted)]">
          Пока контакт не подтверждён, он помечен как ожидающий проверки и не используется для уведомлений.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <OutlineButton type="button" onClick={() => setPending([])}>
            Позже
          </OutlineButton>
          <PrimaryButton type="button" onClick={confirmCode}>
            Подтвердить
          </PrimaryButton>
        </div>
      </Modal>

      {/* Закрытие счёта */}
      <Modal
        open={closeOpen}
        onClose={() => {
          setCloseOpen(false)
          setCloseConfirm('')
        }}
        title="Закрыть счёт"
        subtitle="Действие необратимо и потребует подтверждения от поддержки"
      >
        <div className="rounded-xl border border-[color-mix(in_srgb,var(--trigonum-danger)_35%,white)] bg-[color-mix(in_srgb,var(--trigonum-danger)_6%,white)] p-3.5">
          <p className="text-sm text-[var(--trigonum-text)]">
            Открытые инвест-контракты и позиции в Events должны быть закрыты до подачи заявки. Свободный остаток{' '}
            <b className="text-[var(--trigonum-ink)]">{formatCurrency(totalCapital)}</b> выводится на подтверждённые
            реквизиты.
          </p>
        </div>

        <label className="mt-4 block text-sm">
          <span className="mb-1 block font-medium text-[var(--trigonum-text)]">
            Введите <b className="text-[var(--trigonum-ink)]">ЗАКРЫТЬ</b> для подтверждения
          </span>
          <input
            value={closeConfirm}
            onChange={(event) => setCloseConfirm(event.target.value)}
            className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm text-[var(--trigonum-ink)] outline-none focus:border-[var(--trigonum-danger)]"
          />
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <OutlineButton
            type="button"
            onClick={() => {
              setCloseOpen(false)
              setCloseConfirm('')
            }}
          >
            Отмена
          </OutlineButton>
          <button
            type="button"
            disabled={closeConfirm.trim().toUpperCase() !== 'ЗАКРЫТЬ'}
            onClick={() => {
              setCloseRequested(true)
              setCloseOpen(false)
              setCloseConfirm('')
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--trigonum-danger)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={15} />
            Подать заявку
          </button>
        </div>
      </Modal>
    </div>
  )
}

function CompanyProfile() {
  const { activeAccount } = useBrokerAccount()
  const company = activeAccount.company
  if (!company) return null

  const rows: [string, string][] = [
    ['Наименование', company.legalName],
    ['Регистрационный номер', company.registrationNumber],
    ['ИНН / налоговый номер', company.taxId],
    ['Юрисдикция', company.jurisdiction],
    ['Юридический адрес', company.address],
    ['Директор', company.director],
    ['Бенефициар', company.beneficialOwner],
    ['Email', company.email],
    ['Телефон', company.phone],
  ]

  return (
    <div className="pb-10">
      <Reveal>
        <section className="relative overflow-hidden rounded-[24px] p-7 text-white" style={{ background: tierHero.Black }}>
          <div className="flex flex-wrap items-center gap-5">
            <span className="grid size-[76px] shrink-0 place-items-center rounded-full bg-white/6 ring-1 ring-white/12">
              <Building2 size={26} />
            </span>
            <div className="min-w-0">
              <h1 className="text-[26px] font-medium leading-tight tracking-[-.03em]">{activeAccount.name}</h1>
              <p className="mt-2 text-sm text-white/45">
                {activeAccount.accountLabel} · <span className="tabular-nums">{activeAccount.accountNumber}</span>
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2">
                <QuietChip>{activeAccount.verificationStatus}</QuietChip>
                <QuietChip>с {activeAccount.verificationDate}</QuietChip>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">
        <Card className="lg:col-span-2" title="Данные компании" subtitle="Изменения — через поддержку с документами">
          <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
            {rows.map(([label, value]) => (
              <MetaRow key={label} label={label} value={value} />
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card title="Compliance">
            <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
              <StatusRow label="KYB" detail="Компания верифицирована" />
              <StatusRow label="AML-скрининг" detail="Ограничений нет" />
              <StatusRow label="Бенефициар" detail="Структура подтверждена" />
            </div>
          </Card>

          <Card
            title="Доступ"
            action={
              <Link to="/security" className="text-xs font-semibold text-[var(--trigonum-blue)]">
                Управление →
              </Link>
            }
          >
            <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
              <MetaRow label={company.director} value="Полный доступ" />
              <MetaRow label="Бухгалтерия" value="Только отчёты" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

/* --- Мелкие блоки страницы --------------------------------------------- */

function QuietChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-white/6 px-2.5 py-1 text-[11px] font-medium text-white/55 ring-1 ring-inset ring-white/10">
      {children}
    </span>
  )
}

function HeroMetric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="px-7 py-4" style={{ background: 'rgb(0 0 0 / 18%)' }}>
      <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/35">{label}</p>
      <p className="mt-1.5 text-lg font-semibold tabular-nums" style={{ color: accent ?? 'rgb(255 255 255 / 90%)' }}>
        {value}
      </p>
    </div>
  )
}

function StatusRow({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{label}</p>
        <p className="text-xs text-[var(--trigonum-muted)]">{detail}</p>
      </div>
      <Check size={15} strokeWidth={2.5} className="shrink-0 text-[var(--trigonum-success)] opacity-70" />
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <span className="text-sm text-[var(--trigonum-muted)]">{label}</span>
      <span className="text-right text-sm font-semibold text-[var(--trigonum-ink)]">{value}</span>
    </div>
  )
}

function ActionRow({
  icon,
  label,
  detail,
  actionLabel,
  onClick,
  danger = false,
  disabled = false,
}: {
  icon: ReactNode
  label: string
  detail: string
  actionLabel: string
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="flex min-w-0 items-start gap-3">
        <span className={`mt-0.5 shrink-0 ${danger ? 'text-[var(--trigonum-danger)]' : 'text-[var(--trigonum-muted)]'}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{label}</p>
          <p className="mt-0.5 text-xs text-[var(--trigonum-muted)]">{detail}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          danger
            ? 'border-[color-mix(in_srgb,var(--trigonum-danger)_40%,white)] text-[var(--trigonum-danger)] hover:border-[var(--trigonum-danger)]'
            : 'border-[var(--trigonum-border)] text-[var(--trigonum-ink)] hover:border-[var(--trigonum-ink)]'
        }`}
      >
        {actionLabel}
      </button>
    </div>
  )
}

function RewardCell({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[.1em] text-[var(--trigonum-muted)]">{label}</p>
      <p className="mt-0.5 text-base font-bold tabular-nums" style={{ color: accent ?? 'var(--trigonum-ink)' }}>
        {value}
      </p>
    </div>
  )
}

function FunnelStep({ label, value, share, accent }: { label: string; value: number; share: number; accent?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-[var(--trigonum-muted)]">{label}</span>
        <span className="text-sm font-bold tabular-nums text-[var(--trigonum-ink)]">
          {value}
          <span className="ml-1.5 text-xs font-medium text-[var(--trigonum-muted)]">{share}%</span>
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--trigonum-bg)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${share}%`, background: accent ?? 'color-mix(in srgb, var(--trigonum-ink) 30%, white)' }}
        />
      </div>
    </div>
  )
}

function PreferenceRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--trigonum-border)] px-3.5 py-3">
      <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{label}</p>
      <Switch checked={checked} onChange={onChange} label={label} tone="ink" />
    </div>
  )
}

function ChannelChip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
        on
          ? 'border-[var(--trigonum-ink)] bg-[var(--trigonum-ink)] text-white'
          : 'border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] text-[var(--trigonum-muted)] hover:border-[var(--trigonum-muted)]'
      }`}
    >
      {label}
    </button>
  )
}
