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
import {
  attachDocumentFile,
  getDocumentFiles,
  removeDocumentFile,
  submitDocumentFiles,
} from '../../../shared/lib/onboarding/document-files'
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
 * Досье строится из приложения №1.1 по типу клиента и юрисдикции.
 * Одна позиция перечня может состоять из нескольких файлов — например,
 * паспорта директора и нескольких UBO или комплект документов о полномочиях.
 */
export function DocumentsChecklistPage() {
  const { allowed } = useOnboardingStepGuard('AGREEMENTS_ACCEPTED')
  const navigate = useNavigate()
  const toast = useToast()

  const profile = useMemo(() => readClientProfile(), [])
  const items = useMemo(() => documentChecklist(profile), [profile])
  const required = useMemo(() => items.filter((item) => !item.optional).map((item) => item.id), [items])

  const [attached, setAttached] = useState<Record<string, SubmittedDocument[]>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    void getDocumentFiles()
      .then(setAttached)
      .finally(() => setLoading(false))
  }, [])

  const attach = useCallback(async (documentId: string, fileNames: string[]) => {
    if (fileNames.length === 0) return
    setBusy(documentId)
    try {
      const entries: SubmittedDocument[] = []
      for (const fileName of fileNames) entries.push(await attachDocumentFile(documentId, fileName))
      setAttached((current) => ({
        ...current,
        [documentId]: [...(current[documentId] ?? []), ...entries],
      }))
    } finally {
      setBusy(null)
    }
  }, [])

  const detach = useCallback(async (documentId: string, mediaId: string) => {
    setBusy(documentId)
    try {
      await removeDocumentFile(documentId, mediaId)
      setAttached((current) => {
        const nextEntries = (current[documentId] ?? []).filter((entry) => entry.mediaId !== mediaId)
        const next = { ...current }
        if (nextEntries.length) next[documentId] = nextEntries
        else delete next[documentId]
        return next
      })
    } finally {
      setBusy(null)
    }
  }, [])

  const missing = required.filter((id) => (attached[id] ?? []).length === 0)

  const submit = useCallback(async () => {
    setSubmitting(true)
    try {
      await submitDocumentFiles(required)
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
        title={company ? 'Корпоративное досье' : 'Документы клиента'}
        description={`Перечень сформирован по приложению №1.1. Профиль: ${
          company ? 'юридическое лицо' : 'физическое лицо'
        }, ${jurisdictionLabel(profile.jurisdiction)}.`}
      />

      {loading ? (
        <CenteredSpinner label="Загружаем перечень" />
      ) : (
        <div className="mt-5 space-y-4">
          <Card
            title="Комплектность"
            subtitle={`${done} из ${total} обязательных позиций приложено`}
            action={<Icon size={16} className="text-[var(--trigonum-blue)]" />}
          >
            <div className="h-2 overflow-hidden rounded-full bg-[var(--trigonum-bg)]">
              <div
                className="h-full rounded-full bg-[var(--trigonum-success)] transition-[width] duration-300"
                style={{ width: `${total === 0 ? 100 : (done / total) * 100}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-[1.55] text-[var(--trigonum-muted)]">
              Условные позиции не блокируют отправку, если условие к вашей компании не относится. Для позиций,
              включающих несколько документов, можно приложить несколько файлов.
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
                entries={attached[item.id] ?? []}
                busy={busy === item.id}
                onAttach={(fileNames) => void attach(item.id, fileNames)}
                onDetach={(mediaId) => void detach(item.id, mediaId)}
              />
            ))}
          </ol>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--trigonum-radius-lg)] border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] p-4">
            <p className="text-xs leading-[1.5] text-[var(--trigonum-muted)]">
              {missing.length === 0
                ? 'Все обязательные позиции досье приложены. После отправки откроется комплаенс-анкета.'
                : `Не приложено обязательных позиций: ${missing.length}.`}
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
  entries,
  busy,
  onAttach,
  onDetach,
}: {
  index: number
  item: RequiredDocument
  entries: SubmittedDocument[]
  busy: boolean
  onAttach: (fileNames: string[]) => void
  onDetach: (mediaId: string) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const form = DOCUMENT_FORMS[item.form]
  const complete = entries.length > 0

  return (
    <li className="rounded-[var(--trigonum-radius-lg)] border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] p-4">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
            complete
              ? 'bg-[var(--trigonum-success)] text-white'
              : 'bg-[var(--trigonum-bg)] text-[var(--trigonum-muted)]'
          }`}
        >
          {complete ? <Check size={13} /> : index}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{item.title}</p>
            {item.optional && <Pill>{item.condition ?? 'при наличии'}</Pill>}
            {item.maxAgeMonths && <Pill>не старше {item.maxAgeMonths} мес.</Pill>}
            {item.multiple && <Pill>можно несколько файлов</Pill>}
          </div>

          {item.note && <p className="mt-1 text-xs leading-[1.55] text-[var(--trigonum-muted)]">{item.note}</p>}

          <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[var(--trigonum-bg)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--trigonum-text)]">
            <FileText size={12} />
            {form.label}
          </p>
          <p className="mt-1.5 text-[11px] leading-[1.5] text-[var(--trigonum-muted)]">{form.hint}</p>

          {entries.length > 0 && (
            <div className="mt-3 space-y-2">
              {entries.map((entry) => (
                <div key={entry.mediaId} className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--trigonum-border)] px-3 py-2">
                  <Paperclip size={13} className="text-[var(--trigonum-muted)]" />
                  <span className="min-w-0 flex-1 truncate text-xs text-[var(--trigonum-text)]">{entry.fileName}</span>
                  <button
                    type="button"
                    onClick={() => onDetach(entry.mediaId)}
                    disabled={busy}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--trigonum-danger)]"
                  >
                    <Trash2 size={12} />
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3">
            <input
              ref={input}
              type="file"
              multiple={item.multiple}
              className="hidden"
              onChange={(event) => {
                const fileNames = Array.from(event.target.files ?? []).map((file) => file.name)
                if (fileNames.length) onAttach(fileNames)
                event.target.value = ''
              }}
            />
            <OutlineButton onClick={() => input.current?.click()} disabled={busy}>
              {busy ? 'Загружаем' : entries.length > 0 ? 'Добавить ещё файл' : 'Приложить документ'}
            </OutlineButton>
          </div>
        </div>
      </div>
    </li>
  )
}
