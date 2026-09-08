import { Building2, Check, FileText, Paperclip, ShieldAlert, Trash2, UserRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DOCUMENT_FORMS,
  FORM_RULES,
  documentChecklist,
  jurisdictionLabel,
  mandatoryCount,
  readClientProfile,
  type RequiredDocument,
} from '@trigonum/shared'
import { attachDocument, getDocuments, removeDocument, submitDocuments } from '../../../shared/lib/onboarding/api'
import type { SubmittedDocument } from '../../../shared/lib/onboarding/types'
import {
  ONBOARDING_ROUTES,
  notifyOnboardingChanged,
  useOnboardingStepGuard,
} from '../../../shared/lib/onboarding/useOnboarding'
import { Card } from '../../../shared/ui/Card'
import { CenteredSpinner, PageHeader } from '../../../shared/ui/PageHeader'
import { Pill } from '../../../shared/ui/Pill'
import { useToast } from '../../../shared/ui/Toast'
import { OutlineButton, PrimaryButton } from '../../../shared/ui/buttons'
import { BackToStatus } from '../ui/BackToStatus'

/**
 * Досье документов заявки. Состав перечня не зашит в экран: он приходит из
 * приложения №1.1 по типу клиента и юрисдикции, поэтому гражданин
 * Кыргызстана видит четыре пункта, а компания из Турции — шестнадцать, и
 * экран у них один.
 *
 * Форма представления показывается рядом с каждым пунктом. Приложение
 * отклоняет документ не только по составу, но и по тому, оригинал это,
 * нотариальная копия, перевод или апостиль, — и клиент должен узнать об этом
 * до загрузки, а не из отказа комплаенса через два дня.
 */
export function DocumentsChecklistPage() {
  const { allowed } = useOnboardingStepGuard('AGREEMENTS_ACCEPTED')
  const navigate = useNavigate()
  const toast = useToast()

  const profile = useMemo(() => readClientProfile(), [])
  const items = useMemo(() => documentChecklist(profile), [profile])
  const required = useMemo(() => items.filter((item) => !item.optional).map((item) => item.id), [items])

  const [attached, setAttached] = useState<Record<string, SubmittedDocument>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    void getDocuments()
      .then(setAttached)
      .finally(() => setLoading(false))
  }, [])

  const attach = useCallback(
    async (documentId: string, fileName: string) => {
      setBusy(documentId)
      try {
        const entry = await attachDocument(documentId, fileName)
        setAttached((current) => ({ ...current, [documentId]: entry }))
      } finally {
        setBusy(null)
      }
    },
    [],
  )

  const detach = useCallback(async (documentId: string) => {
    setBusy(documentId)
    try {
      await removeDocument(documentId)
      setAttached((current) => {
        const next = { ...current }
        delete next[documentId]
        return next
      })
    } finally {
      setBusy(null)
    }
  }, [])

  const missing = required.filter((id) => !attached[id])

  const submit = useCallback(async () => {
    setSubmitting(true)
    try {
      await submitDocuments(required)
      notifyOnboardingChanged()
      navigate(ONBOARDING_ROUTES.edd)
    } catch {
      toast('error', 'Не хватает обязательных документов')
    } finally {
      setSubmitting(false)
    }
  }, [navigate, required, toast])

  if (!allowed) return null

  const company = profile.clientType === 'company'
  const Icon = company ? Building2 : UserRound
  const total = mandatoryCount(items)
  const done = total - missing.length

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6 sm:px-6">
      <BackToStatus />

      <PageHeader
        title={company ? 'Документы компании' : 'Документы'}
        description={`Перечень определён приложением №1.1 для типа клиента и юрисдикции. Ваш профиль: ${
          company ? 'юридическое лицо' : 'физическое лицо'
        }, ${jurisdictionLabel(profile.jurisdiction)}.`}
      />

      {loading ? (
        <CenteredSpinner label="Загружаем перечень" />
      ) : (
        <div className="mt-5 space-y-4">
          <Card
            title="Комплектность"
            subtitle={`${done} из ${total} обязательных документов приложено`}
            action={<Icon size={16} className="text-[var(--trigonum-blue)]" />}
          >
            <div className="h-2 overflow-hidden rounded-full bg-[var(--trigonum-bg)]">
              <div
                className="h-full rounded-full bg-[var(--trigonum-success)] transition-[width] duration-300"
                style={{ width: `${total === 0 ? 100 : (done / total) * 100}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-[1.55] text-[var(--trigonum-muted)]">
              Пункты с пометкой «при наличии» на комплектность не влияют: если документа у вас нет, заявка уходит
              дальше без него.
            </p>
          </Card>

          <Card title="Требования к форме документов" action={<ShieldAlert size={16} className="text-[var(--trigonum-warning)]" />}>
            <ul className="space-y-2">
              {FORM_RULES.map((rule) => (
                <li key={rule} className="flex items-start gap-2 text-xs leading-[1.55] text-[var(--trigonum-text)]">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--trigonum-muted)]" />
                  {rule}
                </li>
              ))}
            </ul>
          </Card>

          <ol className="space-y-2.5">
            {items.map((item, index) => (
              <DocumentRow
                key={item.id}
                index={index + 1}
                item={item}
                entry={attached[item.id]}
                busy={busy === item.id}
                onAttach={(fileName) => attach(item.id, fileName)}
                onDetach={() => detach(item.id)}
              />
            ))}
          </ol>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--trigonum-radius-lg)] border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] p-4">
            <p className="text-xs leading-[1.5] text-[var(--trigonum-muted)]">
              {missing.length === 0
                ? 'Все обязательные документы приложены. После отправки досье откроется анкета углублённой проверки.'
                : `Не приложено обязательных документов: ${missing.length}.`}
            </p>
            <PrimaryButton onClick={submit} disabled={missing.length > 0 || submitting}>
              {submitting ? 'Отправляем' : 'Отправить досье'}
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  )
}

function DocumentRow({
  index,
  item,
  entry,
  busy,
  onAttach,
  onDetach,
}: {
  index: number
  item: RequiredDocument
  entry?: SubmittedDocument
  busy: boolean
  onAttach: (fileName: string) => void
  onDetach: () => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const form = DOCUMENT_FORMS[item.form]

  return (
    <li className="rounded-[var(--trigonum-radius-lg)] border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] p-4">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
            entry
              ? 'bg-[var(--trigonum-success)] text-white'
              : 'bg-[var(--trigonum-bg)] text-[var(--trigonum-muted)]'
          }`}
        >
          {entry ? <Check size={13} /> : index}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{item.title}</p>
            {item.optional && <Pill>при наличии</Pill>}
            {item.maxAgeMonths && <Pill>не старше {item.maxAgeMonths} мес.</Pill>}
          </div>

          {item.note && <p className="mt-1 text-xs leading-[1.55] text-[var(--trigonum-muted)]">{item.note}</p>}

          <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[var(--trigonum-bg)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--trigonum-text)]">
            <FileText size={12} />
            {form.label}
          </p>
          <p className="mt-1.5 text-[11px] leading-[1.5] text-[var(--trigonum-muted)]">{form.hint}</p>

          {entry ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--trigonum-border)] px-3 py-2">
              <Paperclip size={13} className="text-[var(--trigonum-muted)]" />
              <span className="min-w-0 flex-1 truncate text-xs text-[var(--trigonum-text)]">{entry.fileName}</span>
              <button
                type="button"
                onClick={onDetach}
                disabled={busy}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--trigonum-danger)]"
              >
                <Trash2 size={12} />
                Удалить
              </button>
            </div>
          ) : (
            <div className="mt-3">
              <input
                ref={input}
                type="file"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) onAttach(file.name)
                  event.target.value = ''
                }}
              />
              <OutlineButton onClick={() => input.current?.click()} disabled={busy}>
                {busy ? 'Загружаем' : 'Приложить документ'}
              </OutlineButton>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
