import { ArrowRight, Building2, Eye, EyeOff, FlaskConical, Lock, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  DEMO_COMPANY_EMAIL,
  DEMO_INDIVIDUAL_EMAIL,
  resolveLoginAccount,
  signIn,
  useSession,
} from '../../../shared/lib/session'
import { Logo } from '../../../shared/ui/Logo'

const MIN_PASSWORD = 8

type Errors = Partial<Record<'email' | 'password', string>>

function validate(values: { email: string; password: string }): Errors {
  const errors: Errors = {}
  if (!values.email.trim()) errors.email = 'Укажите email'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) errors.email = 'Похоже на опечатку в адресе'

  if (!values.password) errors.password = 'Введите пароль'
  else if (values.password.length < MIN_PASSWORD) errors.password = `Минимум ${MIN_PASSWORD} символов`

  return errors
}

export function LoginPage() {
  const session = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'
  if (session) return <Navigate to={from} replace />

  const resolvedAccount = values.email.trim() ? resolveLoginAccount(values.email) : null

  const enter = (email: string) => {
    const nextSession = signIn(email)
    if (!nextSession) {
      setErrors((current) => ({ ...current, email: 'Аккаунт не найден. Сначала откройте счёт или используйте демо-аккаунт.' }))
      return false
    }
    navigate(from, { replace: true })
    return true
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const next = validate(values)
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    enter(values.email)
    setSubmitting(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--trigonum-bg)] px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-[var(--trigonum-radius-lg)] border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] p-6 shadow-[var(--trigonum-shadow-card)]">
          <h1 className="text-2xl font-bold text-[var(--trigonum-ink)]">Вход в кабинет</h1>
          <p className="mt-1.5 text-sm text-[var(--trigonum-muted)]">
            Введите данные счёта Trigonum. Тип аккаунта — физическое или юридическое лицо — хранится в самом аккаунте и восстанавливается автоматически.
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={submit} noValidate>
            <Field label="Email" error={errors.email}>
              <input
                type="email"
                value={values.email}
                autoComplete="email"
                autoFocus
                onChange={(event) => {
                  setValues((current) => ({ ...current, email: event.target.value }))
                  setErrors((current) => ({ ...current, email: undefined }))
                }}
                className={inputClass(Boolean(errors.email))}
              />
            </Field>

            {resolvedAccount && (
              <div className="flex items-center gap-3 rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-bg)] px-3.5 py-3">
                <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${resolvedAccount.clientType === 'company' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`}>
                  {resolvedAccount.clientType === 'company' ? <Building2 size={17} /> : <UserRound size={17} />}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--trigonum-ink)]">{resolvedAccount.name}</p>
                  <p className="mt-0.5 text-xs text-[var(--trigonum-muted)]">
                    {resolvedAccount.clientType === 'company' ? 'Юридическое лицо' : 'Физическое лицо'}
                  </p>
                </div>
              </div>
            )}

            <Field label="Пароль" error={errors.password}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  autoComplete="current-password"
                  onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
                  className={`${inputClass(Boolean(errors.password))} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center text-[var(--trigonum-muted)] transition hover:text-[var(--trigonum-ink)]"
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs text-[var(--trigonum-text)]">
                <input type="checkbox" defaultChecked className="size-3.5 accent-[var(--trigonum-blue)]" />
                Запомнить меня
              </label>
              <button
                type="button"
                onClick={() => setResetSent(true)}
                className="text-xs font-semibold text-[var(--trigonum-blue)]"
              >
                Забыли пароль?
              </button>
            </div>

            {resetSent && (
              <p className="rounded-lg bg-[color-mix(in_srgb,var(--trigonum-blue)_8%,white)] px-3 py-2.5 text-xs text-[var(--trigonum-text)]">
                Ссылку для сброса пароля отправим на указанный email. В прототипе письма не уходят.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundImage: 'var(--trigonum-gradient-cta)' }}
            >
              {submitting ? 'Проверяем…' : 'Войти'}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[var(--trigonum-muted)]">
            <Lock size={12} />
            Соединение защищено, вход подтверждается вторым фактором
          </p>

          <div className="mt-5 rounded-xl border border-dashed border-[var(--trigonum-border)] p-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-[var(--trigonum-ink)]">
              <FlaskConical size={13} />
              Прототип без бэкенда
            </p>
            <p className="mt-1 text-xs text-[var(--trigonum-muted)]">
              Зарегистрированный через «Открыть счёт» email уже помнит свой тип. Для проверки обеих веток доступны два демо-аккаунта.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => enter(DEMO_INDIVIDUAL_EMAIL)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--trigonum-ink)] px-3 py-2.5 text-xs font-semibold text-white transition hover:brightness-125"
              >
                <UserRound size={14} />
                Физлицо
              </button>
              <button
                type="button"
                onClick={() => enter(DEMO_COMPANY_EMAIL)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-700 px-3 py-2.5 text-xs font-semibold text-white transition hover:brightness-125"
              >
                <Building2 size={14} />
                Юрлицо
              </button>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-[var(--trigonum-muted)]">
          Ещё нет счёта?{' '}
          <a href="../open/" className="font-semibold text-[var(--trigonum-blue)]">
            Открыть счёт
          </a>
        </p>
      </div>
    </div>
  )
}

function inputClass(invalid: boolean) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm text-[var(--trigonum-ink)] outline-none transition ${
    invalid ? 'border-[var(--trigonum-danger)]' : 'border-[var(--trigonum-border)] focus:border-[var(--trigonum-ink)]'
  }`
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-[var(--trigonum-ink)]">{label}</span>
      {children}
      {error && <span className="text-xs text-[var(--trigonum-danger)]">{error}</span>}
    </label>
  )
}
