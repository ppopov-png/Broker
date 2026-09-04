import {
  Building2,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Lock,
  MessageCircle,
  Pencil,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useBrokerAccount } from '../../../shared/lib/AccountContext'
import { formatCurrency } from '../../../shared/lib/format'
import { tierAccent, tierHero, tierInk, tierMetallic, tierSoft } from '../../../shared/lib/InvestorStatus'
import { useInvestorStatus } from '../../../shared/lib/useInvestorStatus'
import { Card } from '../../../shared/ui/Card'
import { Pill } from '../../../shared/ui/Pill'
import { Reveal } from '../../../shared/ui/Reveal'
import { Switch } from '../../../shared/ui/Switch'
import { OutlineButton, PrimaryButton } from '../../../shared/ui/buttons'

const PROFILE_STORAGE_KEY = 'trigonum-broker-profile-v6'

interface FieldSpec {
  key: keyof ProfileFields
  label: string
  /** Поле обязательно для полного профиля. */
  required: boolean
  placeholder: string
  /** Подтверждено брокером — редактируется только через поддержку. */
  locked?: boolean
  verifiedNote?: string
  wide?: boolean
}

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

const fieldSpecs: FieldSpec[] = [
  { key: 'firstName', label: 'Имя', required: true, placeholder: 'Артём', locked: true, verifiedNote: 'по документу' },
  { key: 'lastName', label: 'Фамилия', required: true, placeholder: 'Дробков', locked: true, verifiedNote: 'по документу' },
  { key: 'email', label: 'Email', required: true, placeholder: 'name@example.com', verifiedNote: 'подтверждён' },
  { key: 'phone', label: 'Телефон', required: true, placeholder: '+7 (700) 000-00-00', verifiedNote: 'подтверждён' },
  { key: 'birthDate', label: 'Дата рождения', required: true, placeholder: 'ДД.ММ.ГГГГ', locked: true },
  { key: 'citizenship', label: 'Гражданство', required: true, placeholder: 'Страна гражданства', locked: true },
  { key: 'country', label: 'Страна проживания', required: true, placeholder: 'Казахстан' },
  { key: 'address', label: 'Адрес', required: true, placeholder: 'Город, улица, дом', wide: true },
  { key: 'taxResidency', label: 'Налоговое резидентство (TIN)', required: true, placeholder: 'Например, KZ · 900614300123' },
  { key: 'backupContact', label: 'Резервный контакт', required: false, placeholder: 'Телефон или email' },
]

function loadProfile(): { fields: ProfileFields; preferences: Preferences } {
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) return { fields: initialFields, preferences: initialPreferences }
    const parsed = JSON.parse(raw) as { fields?: Partial<ProfileFields>; preferences?: Partial<Preferences> }
    return {
      fields: { ...initialFields, ...parsed.fields },
      preferences: { ...initialPreferences, ...parsed.preferences },
    }
  } catch {
    return { fields: initialFields, preferences: initialPreferences }
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

export function ProfilePage() {
  const { activeAccount } = useBrokerAccount()
  const { status, invested, lockedEvents, totalCapital } = useInvestorStatus()

  const stored = useMemo(loadProfile, [])
  const [fields, setFields] = useState<ProfileFields>(stored.fields)
  const [preferences, setPreferences] = useState<Preferences>(stored.preferences)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<ProfileFields>(stored.fields)
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFields, string>>>({})
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => setEditing(false), [activeAccount.id])

  useEffect(() => {
    if (!saved) return
    const id = window.setTimeout(() => setSaved(false), 2400)
    return () => window.clearTimeout(id)
  }, [saved])

  const persist = (nextFields: ProfileFields, nextPreferences: Preferences) => {
    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({ fields: nextFields, preferences: nextPreferences }),
    )
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
    persist(trimmed, preferences)
    setEditing(false)
    setSaved(true)
  }

  const togglePreference = (key: keyof Preferences) => {
    const next = { ...preferences, [key]: !preferences[key] }
    setPreferences(next)
    persist(fields, next)
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
  const hasManager = status.tier === 'Diamond' || status.tier === 'Black'

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
              <div className="relative shrink-0">
                <div
                  className="grid size-[76px] place-items-center rounded-full text-xl font-semibold tracking-tight"
                  style={{ background: 'rgb(255 255 255 / 6%)', boxShadow: `inset 0 0 0 1px ${accent}55` }}
                >
                  {activeAccount.initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 grid size-6 place-items-center rounded-full bg-[var(--trigonum-success)] text-white ring-[3px] ring-black/25">
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
                <div className="mt-3.5 flex flex-wrap gap-2">
                  <QuietChip>{activeAccount.verificationStatus}</QuietChip>
                  <QuietChip>2FA</QuietChip>
                  <QuietChip>Вывод защищён</QuietChip>
                </div>
              </div>
            </div>

            {/* Уровень: металлик по тиру, прогресс и переход к привилегиям */}
            <Link
              to="/levels"
              className="group block rounded-[20px] p-px transition hover:brightness-110"
              style={{ background: tierMetallic[status.tier] }}
            >
              <div className="rounded-[19px] bg-black/8 p-5 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-[.18em]"
                      style={{ color: status.tier === 'Black' ? 'rgb(255 255 255 / 45%)' : 'rgb(0 0 0 / 45%)' }}
                    >
                      Уровень
                    </p>
                    <p
                      className="mt-1.5 text-[28px] font-semibold leading-none tracking-[-.03em]"
                      style={{ color: status.tier === 'Black' ? '#f4f4f5' : '#1b1d22' }}
                    >
                      {status.tier}
                    </p>
                  </div>
                  <ChevronRight
                    size={17}
                    className="mt-1 transition group-hover:translate-x-0.5"
                    style={{ color: status.tier === 'Black' ? 'rgb(255 255 255 / 50%)' : 'rgb(0 0 0 / 45%)' }}
                  />
                </div>

                <div
                  className="mt-5 h-1.5 overflow-hidden rounded-full"
                  style={{ background: status.tier === 'Black' ? 'rgb(255 255 255 / 18%)' : 'rgb(0 0 0 / 14%)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${status.progress}%`,
                      background: status.tier === 'Black' ? '#e8e8ea' : '#1b1d22',
                    }}
                  />
                </div>

                <div
                  className="mt-2.5 flex items-center justify-between gap-3 text-[11px] font-semibold tabular-nums"
                  style={{ color: status.tier === 'Black' ? 'rgb(255 255 255 / 55%)' : 'rgb(0 0 0 / 50%)' }}
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
                    const confirmed = Boolean(spec.verifiedNote) && value === initialFields[spec.key]
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
                            {value && spec.verifiedNote && !confirmed && (
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
            <Card title="Персональный менеджер">
              {hasManager ? (
                <>
                  <div className="flex items-center gap-3">
                    <div
                      className="grid size-12 shrink-0 place-items-center rounded-full text-sm font-bold"
                      style={{ background: soft, color: ink }}
                    >
                      ДК
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--trigonum-ink)]">Дарья Ковалёва</p>
                      <p className="text-xs text-[var(--trigonum-muted)]">Private client manager</p>
                    </div>
                  </div>
                  <Link
                    to="/support"
                    className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[var(--trigonum-ink)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-125"
                  >
                    <MessageCircle size={15} />
                    Написать
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <Lock size={15} className="mt-0.5 shrink-0 text-[var(--trigonum-muted)]" />
                    <p className="text-sm text-[var(--trigonum-muted)]">
                      Откроется на Diamond — осталось{' '}
                      <b className="tabular-nums text-[var(--trigonum-ink)]">{status.pointsToNext} pts</b>
                    </p>
                  </div>
                  <Link to="/levels" className="mt-3 inline-flex text-xs font-semibold text-[var(--trigonum-blue)]">
                    Как получить Diamond →
                  </Link>
                </>
              )}
            </Card>
          </Reveal>

          <Reveal delay={300}>
            <Card title="Аккаунт">
              <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
                <MetaRow label="Тип счёта" value={activeAccount.accountLabel} />
                <MetaRow label="Номер" value={activeAccount.accountNumber} />
                <MetaRow label="Юрисдикция" value="Кыргызская Республика" />
                <MetaRow label="Валюта" value="USD" />
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
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
        <section
          className="relative overflow-hidden rounded-[24px] p-7 text-white"
          style={{ background: tierHero.Black }}
        >
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
