import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Clock3,
  Copy,
  FileSignature,
  FileText,
  Landmark,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBrokerAccount } from '../../../shared/lib/AccountContext'
import {
  ACCOUNT_PURPOSE,
  CUSTODY_NETWORKS,
  CUSTODY_STATUS_LABEL,
  createCustodyApplication,
  loadCustodyAccounts,
  networkById,
  OPERATION_FREQUENCY,
  signCustodyContract,
  SOURCE_OF_FUNDS,
  type CustodyAccount,
  type CustodyApplication,
} from '../../../shared/lib/custody'
import { formatCurrency } from '../../../shared/lib/format'
import { Card } from '../../../shared/ui/Card'
import { Modal } from '../../../shared/ui/Modal'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { Pill } from '../../../shared/ui/Pill'
import { OutlineButton, PrimaryButton } from '../../../shared/ui/buttons'
import { useToast } from '../../../shared/ui/Toast'
import { printCustodyContract } from '../model/contract'

const MIN_PLANNED = 1_000

type Step = 'params' | 'aml' | 'review'

const emptyApplication: CustodyApplication = {
  purpose: ACCOUNT_PURPOSE[0],
  sourceOfFunds: SOURCE_OF_FUNDS[0],
  sourceComment: '',
  plannedAmount: 50_000,
  frequency: OPERATION_FREQUENCY[1],
  asset: 'USDT',
  networkId: 'arbitrum',
}

export function CustodyAccountPage() {
  const { activeAccount } = useBrokerAccount()
  const toast = useToast()
  const [accounts, setAccounts] = useState<CustodyAccount[]>(loadCustodyAccounts)
  const [creating, setCreating] = useState(false)

  // Заявку двигает «сторона брокера», поэтому список перечитываем по таймеру.
  useEffect(() => {
    const sync = () => setAccounts(loadCustodyAccounts())
    const timer = window.setInterval(sync, 2_000)
    window.addEventListener('focus', sync)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', sync)
    }
  }, [])

  const submit = (application: CustodyApplication) => {
    createCustodyApplication(application)
    setAccounts(loadCustodyAccounts())
    setCreating(false)
    toast('success', 'Заявка отправлена в комплаенс')
  }

  return (
    <div className="pb-10">
      <Link to="/deposit" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--trigonum-blue)]">
        <ArrowLeft size={14} />
        Пополнить
      </Link>

      <PageHeader
        title="Счёт в Trigonum"
        description="Собственные реквизиты на кошельке Trigonum. Открываются по заявке и договору — адрес выдаётся после подписания."
      />

      {creating || accounts.length === 0 ? (
        <ApplicationForm
          onSubmit={submit}
          onCancel={accounts.length > 0 ? () => setCreating(false) : undefined}
          intro={accounts.length === 0}
        />
      ) : (
        <div className="flex flex-col gap-5">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              clientName={activeAccount.name}
              brokerAccount={activeAccount.accountNumber}
              onSigned={() => setAccounts(loadCustodyAccounts())}
            />
          ))}
          <div>
            <OutlineButton type="button" onClick={() => setCreating(true)}>
              <Landmark size={15} />
              Открыть ещё один счёт
            </OutlineButton>
          </div>
        </div>
      )}
    </div>
  )
}

/* --- Заявка ------------------------------------------------------------- */

function ApplicationForm({
  onSubmit,
  onCancel,
  intro,
}: {
  onSubmit: (application: CustodyApplication) => void
  onCancel?: () => void
  intro: boolean
}) {
  const [step, setStep] = useState<Step>('params')
  const [values, setValues] = useState<CustodyApplication>(emptyApplication)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const network = networkById(values.networkId)
  const set = <K extends keyof CustodyApplication>(key: K, value: CustodyApplication[K]) =>
    setValues((current) => ({ ...current, [key]: value }))

  // Сеть определяет список активов: USDT в Base и USDC в TRON не существует.
  useEffect(() => {
    if (!network.assets.includes(values.asset)) set('asset', network.assets[0])
  }, [network, values.asset])

  const goAml = () => {
    if (values.plannedAmount < MIN_PLANNED) {
      setError(`Минимальная сумма первого размещения — ${formatCurrency(MIN_PLANNED)}`)
      return
    }
    if (values.plannedAmount < network.minDeposit) {
      setError(`Для сети ${network.label} минимальное пополнение — ${formatCurrency(network.minDeposit)}`)
      return
    }
    setError(null)
    setStep('aml')
  }

  const goReview = () => {
    if (values.sourceComment.trim().length < 10) {
      setError('Опишите происхождение средств — не меньше 10 символов. Это требование комплаенса.')
      return
    }
    setError(null)
    setStep('review')
  }

  return (
    <div className="flex flex-col gap-5">
      {intro && (
        <Card>
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--trigonum-bg)] text-[var(--trigonum-blue)]">
              <Landmark size={19} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--trigonum-ink)]">Зачем нужен счёт в Trigonum</p>
              <p className="mt-1 max-w-[68ch] text-sm text-[var(--trigonum-muted)]">
                Это ваш адрес на кошельке Trigonum: переводите на него средства из любого кошелька или биржи, не
                подключая их к кабинету. Счёт открывается по заявке и договору — реквизиты появятся после подписания.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card title="Заявка на открытие счёта" action={<StepBadge step={step} />}>
        {step === 'params' && (
          <div className="flex flex-col gap-4">
            <Field label="Сеть перевода" hint={network.note} group>
              <div className="grid gap-2 sm:grid-cols-2">
                {CUSTODY_NETWORKS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => set('networkId', item.id)}
                    className={`rounded-xl border px-3.5 py-3 text-left transition ${
                      values.networkId === item.id
                        ? 'border-[var(--trigonum-ink)] bg-[var(--trigonum-bg)]'
                        : 'border-[var(--trigonum-border)] hover:border-[var(--trigonum-ink)]'
                    }`}
                  >
                    <span className="block text-sm font-semibold text-[var(--trigonum-ink)]">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-[var(--trigonum-muted)]">
                      {item.assets.join(' · ')} · от {formatCurrency(item.minDeposit)} · {item.arrival}
                    </span>
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Актив">
                <Select value={values.asset} onChange={(value) => set('asset', value)} options={[...network.assets]} />
              </Field>
              <Field label="Планируемое первое размещение">
                <span className="flex items-center rounded-lg border border-[var(--trigonum-border)] px-3">
                  <b className="text-sm text-[var(--trigonum-muted)]">$</b>
                  <input
                    type="number"
                    value={values.plannedAmount}
                    onChange={(event) => set('plannedAmount', Number(event.target.value))}
                    className="w-full bg-transparent px-2 py-2.5 text-sm font-semibold text-[var(--trigonum-ink)] outline-none"
                  />
                </span>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Цель открытия счёта">
                <Select value={values.purpose} onChange={(value) => set('purpose', value)} options={[...ACCOUNT_PURPOSE]} />
              </Field>
              <Field label="Ожидаемая частота операций">
                <Select
                  value={values.frequency}
                  onChange={(value) => set('frequency', value)}
                  options={[...OPERATION_FREQUENCY]}
                />
              </Field>
            </div>

            {error && <ErrorLine text={error} />}

            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="button" onClick={goAml}>
                Далее
                <ArrowRight size={15} />
              </PrimaryButton>
              {onCancel && (
                <OutlineButton type="button" onClick={onCancel}>
                  Отмена
                </OutlineButton>
              )}
            </div>
          </div>
        )}

        {step === 'aml' && (
          <div className="flex flex-col gap-4">
            <p className="max-w-[70ch] text-sm text-[var(--trigonum-muted)]">
              Эти данные войдут в договор и в анкету комплаенса. Указывайте фактическое происхождение средств — при
              расхождении с операциями по счёту зачисления приостанавливаются.
            </p>

            <Field label="Источник средств">
              <Select
                value={values.sourceOfFunds}
                onChange={(value) => set('sourceOfFunds', value)}
                options={[...SOURCE_OF_FUNDS]}
              />
            </Field>

            <Field label="Описание происхождения средств" hint="Например: доход от продажи доли в ООО «Вектор», договор от 12.03.2025">
              <textarea
                value={values.sourceComment}
                onChange={(event) => set('sourceComment', event.target.value)}
                rows={4}
                className="w-full resize-y rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm text-[var(--trigonum-ink)] outline-none transition focus:border-[var(--trigonum-ink)]"
              />
            </Field>

            {error && <ErrorLine text={error} />}

            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="button" onClick={goReview}>
                Далее
                <ArrowRight size={15} />
              </PrimaryButton>
              <OutlineButton type="button" onClick={() => setStep('params')}>
                Назад
              </OutlineButton>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="flex flex-col gap-4">
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Row label="Сеть" value={network.label} />
              <Row label="Актив" value={values.asset} />
              <Row label="Первое размещение" value={formatCurrency(values.plannedAmount)} />
              <Row label="Частота операций" value={values.frequency} />
              <Row label="Цель" value={values.purpose} />
              <Row label="Источник средств" value={values.sourceOfFunds} />
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-[var(--trigonum-muted)]">Происхождение средств</dt>
                <dd className="mt-0.5 text-sm text-[var(--trigonum-ink)]">{values.sourceComment}</dd>
              </div>
            </dl>

            <label className="flex items-start gap-2.5 rounded-xl bg-[var(--trigonum-bg)] px-4 py-3">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-[var(--trigonum-blue)]"
              />
              <span className="text-sm text-[var(--trigonum-text)]">
                Подтверждаю, что средства принадлежат мне, получены законным путём и не связаны с третьими лицами.
              </span>
            </label>

            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="button" disabled={!confirmed} onClick={() => onSubmit(values)}>
                <FileText size={15} />
                Отправить заявку
              </PrimaryButton>
              <OutlineButton type="button" onClick={() => setStep('aml')}>
                Назад
              </OutlineButton>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

/* --- Счёт --------------------------------------------------------------- */

function AccountCard({
  account,
  clientName,
  brokerAccount,
  onSigned,
}: {
  account: CustodyAccount
  clientName: string
  brokerAccount: string
  onSigned: () => void
}) {
  const toast = useToast()
  const network = networkById(account.application.networkId)
  const [signing, setSigning] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const tone = account.status === 'active' ? 'success' : account.status === 'rejected' ? 'danger' : 'warning'

  const sign = () => {
    signCustodyContract(account.id)
    setSigning(false)
    setAccepted(false)
    onSigned()
    toast('success', 'Договор подписан, реквизиты выданы')
  }

  const copy = (value: string, what: string) => {
    navigator.clipboard?.writeText(value)
    setCopied(what)
    window.setTimeout(() => setCopied(null), 1600)
  }

  return (
    <Card
      title={`Счёт ${account.id}`}
      action={<Pill tone={tone}>{CUSTODY_STATUS_LABEL[account.status]}</Pill>}
    >
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
        <Row label="Сеть" value={network.label} />
        <Row label="Актив" value={account.application.asset} />
        <Row label="Договор" value={`№ ${account.contractNumber}`} />
      </dl>

      {account.status === 'review' && (
        <Notice tone="info" icon={<Clock3 size={15} />}>
          Комплаенс проверяет заявку. Обычно это занимает несколько минут, после чего сформируется договор — реквизиты
          выдаются только после его подписания.
        </Notice>
      )}

      {account.status === 'contract' && (
        <>
          <Notice tone="warning" icon={<FileSignature size={15} />}>
            Договор № {account.contractNumber} сформирован по данным вашей заявки. Прочитайте его и подпишите —
            после этого счёт откроется и появится адрес для перевода.
          </Notice>
          <div className="mt-4 flex flex-wrap gap-2">
            <PrimaryButton type="button" onClick={() => setSigning(true)}>
              <FileSignature size={15} />
              Подписать договор
            </PrimaryButton>
            <OutlineButton
              type="button"
              onClick={() => printCustodyContract(account, clientName, brokerAccount)}
            >
              <FileText size={15} />
              Открыть договор
            </OutlineButton>
          </div>
        </>
      )}

      {account.status === 'active' && account.address && (
        <>
          <div className="mt-4 rounded-xl border border-[var(--trigonum-border)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">
              Адрес для пополнения · {network.label}
            </p>
            <p className="mt-2 break-all font-mono text-sm text-[var(--trigonum-ink)]">{account.address}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <OutlineButton type="button" onClick={() => copy(account.address ?? '', 'address')}>
                <Copy size={14} />
                {copied === 'address' ? 'Скопировано' : 'Копировать адрес'}
              </OutlineButton>
              <OutlineButton type="button" onClick={() => printCustodyContract(account, clientName, brokerAccount)}>
                <FileText size={14} />
                Договор
              </OutlineButton>
            </div>
          </div>

          <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-3">
            <Row label="Минимальное пополнение" value={formatCurrency(network.minDeposit)} />
            <Row label="Подтверждений сети" value={String(network.confirmations)} />
            <Row label="Зачисление" value={network.arrival} />
          </dl>

          <Notice tone="danger" icon={<AlertTriangle size={15} />}>
            Переводите только {account.application.asset} в сети {network.label}. Средства в другом активе или другой
            сети восстановить нельзя. Адрес закреплён за вашим счётом — не передавайте его третьим лицам.
          </Notice>
        </>
      )}

      <Modal open={signing} onClose={() => setSigning(false)} title={`Договор № ${account.contractNumber}`}>
        <p className="text-sm text-[var(--trigonum-text)]">
          Договор об открытии счёта и хранении средств сформирован по данным заявки от{' '}
          {new Date(account.createdAt).toLocaleDateString('ru-RU')}. Подписывая его, вы подтверждаете параметры счёта и
          заявленное происхождение средств.
        </p>

        <dl className="mt-4 grid gap-x-6 gap-y-2.5 rounded-xl bg-[var(--trigonum-bg)] p-4 sm:grid-cols-2">
          <Row label="Клиент" value={clientName} />
          <Row label="Брокерский счёт" value={brokerAccount} />
          <Row label="Сеть" value={network.label} />
          <Row label="Актив" value={account.application.asset} />
          <Row label="Первое размещение" value={formatCurrency(account.application.plannedAmount)} />
          <Row label="Источник средств" value={account.application.sourceOfFunds} />
        </dl>

        <button
          type="button"
          onClick={() => printCustodyContract(account, clientName, brokerAccount)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--trigonum-blue)]"
        >
          <FileText size={13} />
          Прочитать полный текст договора
        </button>

        <label className="mt-4 flex items-start gap-2.5">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-[var(--trigonum-blue)]"
          />
          <span className="text-sm text-[var(--trigonum-text)]">
            Я прочитал договор № {account.contractNumber} и принимаю его условия.
          </span>
        </label>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <OutlineButton type="button" onClick={() => setSigning(false)}>
            Отмена
          </OutlineButton>
          <PrimaryButton type="button" disabled={!accepted} onClick={sign}>
            <ShieldCheck size={15} />
            Подписать
          </PrimaryButton>
        </div>
      </Modal>
    </Card>
  )
}

/* --- Мелочи ------------------------------------------------------------- */

function StepBadge({ step }: { step: Step }) {
  const index = step === 'params' ? 1 : step === 'aml' ? 2 : 3
  return <span className="text-xs font-semibold text-[var(--trigonum-muted)]">Шаг {index} из 3</span>
}

/**
 * `group` обязателен там, где внутри не один контрол, а набор кнопок: <label>
 * вокруг группы приклеивает свой текст к имени каждой кнопки, и скринридер
 * читает «Сеть перевода Ethereum» на кнопке Tron.
 */
function Field({
  label,
  hint,
  group = false,
  children,
}: {
  label: string
  hint?: string
  group?: boolean
  children: React.ReactNode
}) {
  const Tag = group ? 'div' : 'label'
  return (
    <Tag className="block" role={group ? 'group' : undefined} aria-label={group ? label : undefined}>
      <span className="text-xs font-semibold text-[var(--trigonum-ink)]">{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {hint && <span className="mt-1.5 block text-xs text-[var(--trigonum-muted)]">{hint}</span>}
    </Tag>
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] px-3 py-2.5 text-sm text-[var(--trigonum-ink)] outline-none transition focus:border-[var(--trigonum-ink)]"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-[var(--trigonum-muted)]">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-[var(--trigonum-ink)]">{value}</dd>
    </div>
  )
}

function ErrorLine({ text }: { text: string }) {
  return (
    <p className="rounded-lg bg-[color-mix(in_srgb,var(--trigonum-danger)_8%,white)] px-3 py-2.5 text-sm text-[var(--trigonum-danger)]">
      {text}
    </p>
  )
}

const noticeTone = {
  info: { bg: 'var(--trigonum-blue)', fg: 'var(--trigonum-blue)' },
  warning: { bg: 'var(--trigonum-warning)', fg: '#92650c' },
  danger: { bg: 'var(--trigonum-danger)', fg: 'var(--trigonum-danger)' },
} as const

function Notice({
  tone,
  icon,
  children,
}: {
  tone: keyof typeof noticeTone
  icon: React.ReactNode
  children: React.ReactNode
}) {
  const style = noticeTone[tone]
  return (
    <div
      className="mt-4 flex items-start gap-2.5 rounded-xl px-4 py-3"
      style={{ background: `color-mix(in srgb, ${style.bg} 8%, white)` }}
    >
      <span className="mt-0.5 shrink-0" style={{ color: style.fg }}>
        {icon}
      </span>
      <p className="text-sm text-[var(--trigonum-text)]">{children}</p>
    </div>
  )
}
