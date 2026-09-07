import { Paperclip, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEddResponse, getEddTemplate, submitEddResponse } from '../../../shared/lib/onboarding/api'
import { COUNTRIES } from '../../../shared/lib/onboarding/countries'
import { ApiError, type EddAnswer, type EddQuestion, type EddTemplate } from '../../../shared/lib/onboarding/types'
import { ONBOARDING_ROUTES, useOnboardingState, useOnboardingStepGuard } from '../../../shared/lib/onboarding/useOnboarding'
import { Card } from '../../../shared/ui/Card'
import { CenteredSpinner, PageHeader } from '../../../shared/ui/PageHeader'
import { Pill } from '../../../shared/ui/Pill'
import { useToast } from '../../../shared/ui/Toast'
import { PrimaryButton } from '../../../shared/ui/buttons'
import { BackToStatus } from '../ui/BackToStatus'

/** Ответ на один вопрос. YES_NO стартует пустым, а не «Нет». */
type AnswerDraft = { textValue?: string; selectedOptions?: string[]; mediaId?: string; fileName?: string; dateValue?: string }
type Draft = Record<string, AnswerDraft>

const OTHER_OPTIONS = ['Другое', 'Other']

function isOtherSelected(question: EddQuestion, draft: AnswerDraft): boolean {
  if (!question.metadata?.requiresTextOnOther) return false
  return (draft.selectedOptions ?? []).some((option) => OTHER_OPTIONS.includes(option))
}

/** Схема валидации строится из шаблона: правила зависят от типа и обязательности. */
function validate(questions: EddQuestion[], draft: Draft): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const question of questions) {
    const answer = draft[question.id] ?? {}

    if (question.isRequired) {
      const empty =
        (question.type === 'TEXT' || question.type === 'YES_NO') && !answer.textValue?.trim()
          ? true
          : (question.type === 'SINGLE_SELECT' || question.type === 'MULTI_SELECT') &&
              (answer.selectedOptions ?? []).length === 0
            ? true
            : question.type === 'FILE_UPLOAD' && !answer.mediaId
              ? true
              : question.type === 'DATE' && !answer.dateValue?.trim()
      if (empty) errors[question.id] = 'Обязательный вопрос'
    }

    // «Другое» требует пояснения — ошибка привязана к текстовому полю.
    if (isOtherSelected(question, answer) && !answer.textValue?.trim()) {
      errors[question.id] = 'Уточните вариант «Другое»'
    }
  }

  return errors
}

export function EddQuestionnairePage() {
  const { allowed } = useOnboardingStepGuard('AGREEMENTS_ACCEPTED')
  const { status } = useOnboardingState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const [template, setTemplate] = useState<EddTemplate | null>(null)
  const [draft, setDraft] = useState<Draft>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // При запросе правок форма снова редактируемая.
  const amendmentsRequested = status?.currentState === 'AMENDMENTS_REQUESTED'
  const readOnly = submitted && !amendmentsRequested

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const active = await getEddTemplate()
        if (cancelled) return
        setTemplate(active)

        try {
          const existing = await getEddResponse()
          if (cancelled) return
          setSubmitted(true)
          const restored: Draft = {}
          for (const answer of existing.answers) {
            restored[answer.questionId] = {
              textValue: answer.textValue,
              selectedOptions: answer.selectedOptions,
              mediaId: answer.mediaId,
              dateValue: answer.dateValue,
            }
          }
          setDraft(restored)
        } catch (error) {
          // Ответа ещё нет — обычный первый заход.
          if (!(error instanceof ApiError && error.status === 404)) throw error
        }
      } catch {
        if (!cancelled) toast('error', 'Не удалось загрузить анкету')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [toast])

  const questions = useMemo(
    () => (template ? [...template.questions].sort((a, b) => a.order - b.order) : []),
    [template],
  )

  const update = (questionId: string, patch: AnswerDraft) => {
    setDraft((current) => ({ ...current, [questionId]: { ...current[questionId], ...patch } }))
    setErrors((current) => ({ ...current, [questionId]: '' }))
  }

  const submit = async () => {
    const nextErrors = validate(questions, draft)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).some((key) => nextErrors[key])) {
      toast('error', 'Проверьте отмеченные вопросы')
      return
    }

    setSubmitting(true)
    try {
      const answers: EddAnswer[] = questions.map((question) => {
        const answer = draft[question.id] ?? {}
        return {
          questionId: question.id,
          textValue: answer.textValue?.trim() || undefined,
          selectedOptions: answer.selectedOptions?.length ? answer.selectedOptions : undefined,
          mediaId: answer.mediaId,
          dateValue: answer.dateValue,
        }
      })
      await submitEddResponse(answers)
      toast('success', 'Анкета отправлена на проверку')
      navigate(ONBOARDING_ROUTES.status)
    } catch {
      toast('error', 'Не удалось отправить анкету')
    } finally {
      setSubmitting(false)
    }
  }

  if (!allowed) return null

  return (
    <div className="pb-10">
      <PageHeader
        back={<BackToStatus />}
        title="Углублённая проверка"
        description="Анкета о происхождении средств и инвестиционном опыте. Это требование регулятора для открытия счёта."
        action={readOnly ? <Pill tone="success">Отправлена</Pill> : undefined}
      />

      {loading ? (
        <CenteredSpinner label="Загружаем анкету" />
      ) : (
        <div className="flex flex-col gap-4">
          {amendmentsRequested && (
            <Card>
              <p className="text-sm text-[var(--trigonum-text)]">
                Комплаенс запросил уточнения — поправьте ответы и отправьте анкету ещё раз.
              </p>
            </Card>
          )}

          {questions.map((question, index) => (
            <Card key={question.id}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[var(--trigonum-bg)] text-xs font-bold text-[var(--trigonum-muted)]">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--trigonum-ink)]">
                    {question.text}
                    {!question.isRequired && (
                      <span className="ml-2 text-xs font-normal text-[var(--trigonum-muted)]">необязательно</span>
                    )}
                  </p>

                  <div className="mt-3">
                    <QuestionControl
                      question={question}
                      value={draft[question.id] ?? {}}
                      readOnly={readOnly}
                      onChange={(patch) => update(question.id, patch)}
                    />
                  </div>

                  {isOtherSelected(question, draft[question.id] ?? {}) && (
                    <input
                      value={draft[question.id]?.textValue ?? ''}
                      disabled={readOnly}
                      placeholder="Уточните вариант"
                      onChange={(event) => update(question.id, { textValue: event.target.value })}
                      className="mt-3 w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--trigonum-ink)] disabled:bg-[var(--trigonum-bg)]"
                    />
                  )}

                  {errors[question.id] && (
                    <p className="mt-2 text-xs font-medium text-[var(--trigonum-danger)]">{errors[question.id]}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {!readOnly && (
            <div className="flex justify-end">
              <PrimaryButton type="button" disabled={submitting} onClick={() => void submit()}>
                {submitting ? 'Отправляем…' : 'Отправить анкету'}
              </PrimaryButton>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function QuestionControl({
  question,
  value,
  readOnly,
  onChange,
}: {
  question: EddQuestion
  value: AnswerDraft
  readOnly: boolean
  onChange: (patch: AnswerDraft) => void
}) {
  const selected = value.selectedOptions ?? []

  if (question.type === 'TEXT') {
    return (
      <textarea
        value={value.textValue ?? ''}
        disabled={readOnly}
        rows={3}
        onChange={(event) => onChange({ textValue: event.target.value })}
        className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--trigonum-ink)] disabled:bg-[var(--trigonum-bg)]"
      />
    )
  }

  if (question.type === 'YES_NO') {
    return (
      <div className="flex gap-2">
        {['Да', 'Нет'].map((option) => (
          <button
            key={option}
            type="button"
            disabled={readOnly}
            onClick={() => onChange({ textValue: option })}
            aria-pressed={value.textValue === option}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
              value.textValue === option
                ? 'border-[var(--trigonum-ink)] bg-[var(--trigonum-ink)] text-white'
                : 'border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] text-[var(--trigonum-text)]'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    )
  }

  if (question.type === 'DATE') {
    return (
      <input
        type="date"
        value={value.dateValue ?? ''}
        disabled={readOnly}
        onChange={(event) => onChange({ dateValue: event.target.value })}
        className="rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--trigonum-ink)] disabled:bg-[var(--trigonum-bg)]"
      />
    )
  }

  if (question.type === 'FILE_UPLOAD') {
    return <FileControl value={value} readOnly={readOnly} onChange={onChange} />
  }

  // Страны приходят пустым списком — подставляем справочник с поиском.
  const options = question.options?.length ? question.options : COUNTRIES
  if (question.type === 'SINGLE_SELECT' && options.length > 20) {
    return <SearchableSelect options={options} value={selected[0]} readOnly={readOnly} onChange={(option) => onChange({ selectedOptions: [option] })} />
  }

  if (question.type === 'SINGLE_SELECT') {
    return (
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <label key={option} className="flex cursor-pointer items-start gap-2.5 text-sm text-[var(--trigonum-text)]">
            <input
              type="radio"
              name={question.id}
              checked={selected[0] === option}
              disabled={readOnly}
              onChange={() => onChange({ selectedOptions: [option] })}
              className="mt-0.5 size-4 shrink-0 accent-[var(--trigonum-ink)]"
            />
            {option}
          </label>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <label key={option} className="flex cursor-pointer items-start gap-2.5 text-sm text-[var(--trigonum-text)]">
          <input
            type="checkbox"
            checked={selected.includes(option)}
            disabled={readOnly}
            onChange={() =>
              onChange({
                selectedOptions: selected.includes(option)
                  ? selected.filter((item) => item !== option)
                  : [...selected, option],
              })
            }
            className="mt-0.5 size-4 shrink-0 accent-[var(--trigonum-ink)]"
          />
          {option}
        </label>
      ))}
    </div>
  )
}

function FileControl({
  value,
  readOnly,
  onChange,
}: {
  value: AnswerDraft
  readOnly: boolean
  onChange: (patch: AnswerDraft) => void
}) {
  if (value.mediaId) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5">
        <Paperclip size={15} className="shrink-0 text-[var(--trigonum-muted)]" />
        <span className="min-w-0 flex-1 truncate text-sm text-[var(--trigonum-ink)]">
          {value.fileName ?? 'Файл загружен'}
        </span>
        {!readOnly && (
          <button
            type="button"
            onClick={() => onChange({ mediaId: undefined, fileName: undefined })}
            className="shrink-0 rounded-md p-1 text-[var(--trigonum-muted)] transition hover:text-[var(--trigonum-danger)]"
            aria-label="Удалить файл"
          >
            <X size={14} />
          </button>
        )}
      </div>
    )
  }

  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--trigonum-border)] px-3.5 py-2.5 text-sm font-semibold text-[var(--trigonum-ink)] transition hover:border-[var(--trigonum-ink)]">
      <Paperclip size={15} />
      Загрузить файл
      <input
        type="file"
        className="hidden"
        disabled={readOnly}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onChange({ mediaId: `media_${Date.now()}`, fileName: file.name })
          event.target.value = ''
        }}
      />
    </label>
  )
}

/** Селект с поиском: 195 стран в обычном дропдауне неюзабельны. */
function SearchableSelect({
  options,
  value,
  readOnly,
  onChange,
}: {
  options: string[]
  value?: string
  readOnly: boolean
  onChange: (option: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const found = query.trim()
    ? options.filter((option) => option.toLowerCase().includes(query.trim().toLowerCase()))
    : options

  return (
    <div className="relative">
      <button
        type="button"
        disabled={readOnly}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-left text-sm text-[var(--trigonum-ink)] transition hover:border-[var(--trigonum-muted)] disabled:bg-[var(--trigonum-bg)]"
      >
        <span className={value ? '' : 'text-[var(--trigonum-muted)]'}>{value ?? 'Выберите страну'}</span>
        <Search size={15} className="shrink-0 text-[var(--trigonum-muted)]" />
      </button>

      {open && !readOnly && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] shadow-[0_16px_40px_rgb(8_27_58/16%)]">
          <input
            autoFocus
            value={query}
            placeholder="Начните вводить название"
            onChange={(event) => setQuery(event.target.value)}
            className="w-full border-b border-[var(--trigonum-border)] px-3 py-2.5 text-sm outline-none"
          />
          <div className="max-h-60 overflow-y-auto">
            {found.length === 0 ? (
              <p className="px-3 py-3 text-sm text-[var(--trigonum-muted)]">Ничего не найдено</p>
            ) : (
              found.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option)
                    setOpen(false)
                    setQuery('')
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-[var(--trigonum-bg)] ${
                    option === value ? 'font-semibold text-[var(--trigonum-ink)]' : 'text-[var(--trigonum-text)]'
                  }`}
                >
                  {option}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
