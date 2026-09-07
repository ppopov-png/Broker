import { Check, Download, FileText } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { consentAgreement, finalizeAgreements, getAgreements } from '../../../shared/lib/onboarding/api'
import type { Agreement, AgreementCategory } from '../../../shared/lib/onboarding/types'
import { ONBOARDING_ROUTES, useOnboardingStepGuard } from '../../../shared/lib/onboarding/useOnboarding'
import { Card } from '../../../shared/ui/Card'
import { CenteredSpinner, PageHeader } from '../../../shared/ui/PageHeader'
import { Pill } from '../../../shared/ui/Pill'
import { useToast } from '../../../shared/ui/Toast'
import { OutlineButton, PrimaryButton } from '../../../shared/ui/buttons'
import { filterRetired } from '../model/retired-agreements'
import { BackToStatus } from '../ui/BackToStatus'

const categoryLabels: Record<AgreementCategory, string> = {
  ASSET_MANAGEMENT: 'Управление активами',
  BROKER_DEALER: 'Брокерское обслуживание',
  VIRTUAL_ASSETS: 'Цифровые активы',
  RISK_DISCLOSURE: 'Раскрытие рисков',
  PRIVACY_POLICY: 'Персональные данные',
  OTHER: 'Прочее',
}

export function AgreementsPage() {
  const { allowed } = useOnboardingStepGuard('SELF_CERT_COMPLETED')
  const navigate = useNavigate()
  const toast = useToast()

  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [pending, setPending] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const list = await getAgreements()
      // Ту же фильтрацию применяем и здесь, и при проверке перехода.
      setAgreements(filterRetired(list))
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const goNext = useCallback(async () => {
    await finalizeAgreements()
    navigate(ONBOARDING_ROUTES.edd)
  }, [navigate])

  const accept = async (templateId: string) => {
    setPending(templateId)
    try {
      await consentAgreement(templateId)
      toast('success', 'Согласие зафиксировано')

      const refreshed = filterRetired(await getAgreements())
      setAgreements(refreshed)

      const allRequiredSigned = refreshed
        .filter((item) => item.template.isRequired)
        .every((item) => item.consented)
      if (allRequiredSigned) await goNext()
    } catch {
      toast('error', 'Не удалось зафиксировать согласие')
    } finally {
      setPending(null)
    }
  }

  if (!allowed) return null

  const required = agreements.filter((item) => item.template.isRequired)
  const signedCount = required.filter((item) => item.consented).length

  return (
    <div className="pb-10">
      <PageHeader
        back={<BackToStatus />}
        title="Юридические документы"
        description="Ознакомьтесь с документами и подтвердите согласие. Без обязательных соглашений счёт открыть нельзя."
        action={
          required.length > 0 ? (
            <Pill tone={signedCount === required.length ? 'success' : 'info'}>
              Подписано {signedCount} из {required.length}
            </Pill>
          ) : undefined
        }
      />

      {loading ? (
        <CenteredSpinner label="Загружаем документы" />
      ) : error ? (
        <Card>
          <p className="text-sm text-[var(--trigonum-muted)]">Не удалось загрузить соглашения</p>
          <OutlineButton type="button" className="mt-4" onClick={() => void load()}>
            Повторить
          </OutlineButton>
        </Card>
      ) : agreements.length === 0 ? (
        <Card>
          <p className="text-sm text-[var(--trigonum-text)]">
            Сейчас подписывать нечего — можно перейти к следующему шагу.
          </p>
          <PrimaryButton type="button" className="mt-4" onClick={() => void goNext()}>
            Продолжить
          </PrimaryButton>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {agreements.map((item) => (
            <Card key={item.template.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[15px] font-semibold text-[var(--trigonum-ink)]">{item.template.name}</h2>
                    <span className="text-xs tabular-nums text-[var(--trigonum-muted)]">v{item.template.version}</span>
                    {item.template.isRequired ? (
                      <Pill tone="warning">Обязательное</Pill>
                    ) : (
                      <Pill tone="neutral">По желанию</Pill>
                    )}
                  </div>
                  <p className="mt-1.5 max-w-[70ch] text-sm text-[var(--trigonum-muted)]">
                    {item.template.description}
                  </p>
                  <p className="mt-1 text-xs text-[var(--trigonum-muted)]">
                    {categoryLabels[item.template.category]}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <a
                    href={`#/documents?template=${item.template.mediaId}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--trigonum-border)] px-3 py-1.5 text-xs font-semibold text-[var(--trigonum-ink)] transition hover:border-[var(--trigonum-ink)]"
                  >
                    <FileText size={13} />
                    Открыть
                  </a>
                  <a
                    href={`#/documents?download=${item.template.mediaId}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--trigonum-border)] px-3 py-1.5 text-xs font-semibold text-[var(--trigonum-ink)] transition hover:border-[var(--trigonum-ink)]"
                  >
                    <Download size={13} />
                    Скачать
                  </a>
                </div>
              </div>

              <div className="mt-4 border-t border-[var(--trigonum-border)] pt-4">
                {item.consented ? (
                  <p className="flex items-center gap-2 text-sm font-semibold text-[var(--trigonum-success)]">
                    <Check size={15} strokeWidth={2.5} />
                    Согласие зафиксировано
                    {item.consentedAt &&
                      ` · ${new Date(item.consentedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}`}
                  </p>
                ) : (
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={false}
                      disabled={pending === item.template.id}
                      onChange={() => void accept(item.template.id)}
                      className="mt-0.5 size-4 shrink-0 accent-[var(--trigonum-ink)]"
                    />
                    <span className="text-sm text-[var(--trigonum-text)]">
                      Я прочитал документ и принимаю его условия
                    </span>
                  </label>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
