import { ArrowRight, Check, Mail, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const MAX_NAME = 120
const MAX_EMAIL = 254
const MIN_PASSWORD = 8

type Errors = Partial<Record<'name' | 'email' | 'password', string>>

function validate(values: { name: string; email: string; password: string }): Errors {
  const errors: Errors = {}

  if (!values.name.trim()) errors.name = 'Укажите имя'
  else if (values.name.length > MAX_NAME) errors.name = `Не длиннее ${MAX_NAME} символов`

  if (!values.email.trim()) errors.email = 'Укажите email'
  else if (values.email.length > MAX_EMAIL) errors.email = `Не длиннее ${MAX_EMAIL} символов`
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) errors.email = 'Похоже на опечатку в адресе'

  if (!values.password) errors.password = 'Придумайте пароль'
  else if (values.password.length < MIN_PASSWORD) errors.password = `Минимум ${MIN_PASSWORD} символов`
  else if (!/[A-Za-zА-Яа-я]/.test(values.password) || !/\d/.test(values.password)) {
    errors.password = 'Нужны буквы и хотя бы одна цифра'
  }

  return errors
}

export function RegisterPage() {
  const [params] = useSearchParams()
  const isCompany = params.get('type') === 'company'
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const next = validate(values)
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setRegisteredEmail(values.email.trim())
    setSubmitting(false)
  }

  if (registeredEmail) return <CheckMailbox email={registeredEmail} />

  return (
    <Shell
      title={isCompany ? 'Счёт для компании' : 'Счёт частного инвестора'}
      subtitle="Три поля — и мы отправим письмо для подтверждения. Проверка личности и документы будут на следующих шагах."
      back={
        <Link to="/" className="mb-4 inline-flex text-xs font-semibold text-[var(--trigonum-blue)]">
          ← Изменить тип клиента
        </Link>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <Field label={isCompany ? 'Название компании' : 'Имя и фамилия'} error={errors.name}>
          <input
            value={values.name}
            maxLength={MAX_NAME}
            autoComplete={isCompany ? 'organization' : 'name'}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            className={inputClass(Boolean(errors.name))}
          />
        </Field>

        <Field label="Email" error={errors.email}>
          <input
            type="email"
            value={values.email}
            maxLength={MAX_EMAIL}
            autoComplete="email"
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            className={inputClass(Boolean(errors.email))}
          />
        </Field>

        <Field label="Пароль" error={errors.password} helper="Минимум 8 символов, буквы и цифры">
          <input
            type="password"
            value={values.password}
            autoComplete="new-password"
            onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
            className={inputClass(Boolean(errors.password))}
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundImage: 'var(--trigonum-gradient-cta)' }}
        >
          {submitting ? 'Создаём счёт…' : 'Создать счёт'}
          {!submitting && <ArrowRight size={16} />}
        </button>

        <p className="text-xs leading-relaxed text-[var(--trigonum-muted)]">
          Нажимая «Создать счёт», вы соглашаетесь с политикой обработки персональных данных. Юридические документы
          нужно будет подписать отдельно на шаге соглашений.
        </p>
      </form>
    </Shell>
  )
}

function CheckMailbox({ email }: { email: string }) {
  return (
    <Shell title="Проверьте почту" subtitle={`Мы отправили ссылку для подтверждения на ${email}.`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-bg)] p-4">
          <Mail size={18} className="mt-0.5 shrink-0 text-[var(--trigonum-blue)]" />
          <p className="text-sm text-[var(--trigonum-text)]">
            Перейдите по ссылке из письма — после этого откроется проверка личности. Ссылка действует 24 часа.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Step done text="Регистрация" />
          <Step text="Подтверждение email" current />
          <Step text="Проверка личности" />
          <Step text="Самосертификация и документы" />
        </div>

        <p className="text-xs text-[var(--trigonum-muted)]">
          Письмо не пришло? Проверьте папку со спамом или напишите на support@trigonum.broker.
        </p>
      </div>
    </Shell>
  )
}

function Step({ text, done = false, current = false }: { text: string; done?: boolean; current?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
          done
            ? 'bg-[var(--trigonum-success)] text-white'
            : current
              ? 'bg-[var(--trigonum-ink)] text-white'
              : 'bg-[var(--trigonum-border)] text-[var(--trigonum-muted)]'
        }`}
      >
        {done ? <Check size={11} strokeWidth={3} /> : ''}
      </span>
      <span className={`text-sm ${current ? 'font-semibold text-[var(--trigonum-ink)]' : 'text-[var(--trigonum-muted)]'}`}>
        {text}
      </span>
    </div>
  )
}

function Shell({
  title,
  subtitle,
  back,
  children,
}: {
  title: string
  subtitle: string
  back?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--trigonum-bg)] px-4 py-10">
      <div className="w-full max-w-[460px]">
        <div className="mb-6 flex items-center gap-2.5">
          <span
            className="grid size-8 place-items-center rounded-[10px]"
            style={{ backgroundImage: 'var(--trigonum-gradient-cta)' }}
          >
            <ShieldCheck size={17} className="text-white" />
          </span>
          <span className="text-[15px] font-bold tracking-tight text-[var(--trigonum-ink)]">Trigonum</span>
        </div>

        <div className="rounded-[var(--trigonum-radius-lg)] border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] p-6 shadow-[var(--trigonum-shadow-card)]">
          {back}
          <h1 className="text-2xl font-bold text-[var(--trigonum-ink)]">{title}</h1>
          <p className="mt-1.5 text-sm text-[var(--trigonum-muted)]">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

function inputClass(invalid: boolean) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm text-[var(--trigonum-ink)] outline-none transition ${
    invalid ? 'border-[var(--trigonum-danger)]' : 'border-[var(--trigonum-border)] focus:border-[var(--trigonum-ink)]'
  }`
}

function Field({
  label,
  error,
  helper,
  children,
}: {
  label: string
  error?: string
  helper?: string
  children: React.ReactNode
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-[var(--trigonum-text)]">{label}</span>
      {children}
      {helper && !error && <span className="mt-1 block text-xs text-[var(--trigonum-muted)]">{helper}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-[var(--trigonum-danger)]">{error}</span>}
    </label>
  )
}
