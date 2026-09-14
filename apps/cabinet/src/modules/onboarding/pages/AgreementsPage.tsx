import { Check, Download, FileText, TriangleAlert } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { readClientProfile } from '@trigonum/shared'
import { consentAgreement, finalizeAgreements, getAgreements, revokeAgreement } from '../../../shared/lib/onboarding/api'
import type { Agreement, AgreementCategory } from '../../../shared/lib/onboarding/types'
import {
  ONBOARDING_ROUTES,
  notifyOnboardingChanged,
  useOnboardingStepGuard,
} from '../../../shared/lib/onboarding/useOnboarding'
import { Card } from '../../../shared/ui/Card'
import { Modal } from '../../../shared/ui/Modal'
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

const PLACEHOLDER_TEMPLATE_IDS = new Set([
  'agr-am-v1', 'agr-am-v2', 'agr-bd-v1', 'agr-va-v1', 'agr-va-v2',
  'agr-risk-v1', 'agr-pp-v1', 'agr-pp-v2', 'agr-mkt-v1',
])

function verifiedAgreements(items: Agreement[]): Agreement[] {
  return filterRetired(items).filter((item) => !PLACEHOLDER_TEMPLATE_IDS.has(item.template.id))
}

export function AgreementsPage() {
  const profile = useMemo(() => readClientProfile(), [])
  const { allowed } = useOnboardingStepGuard(profile.clientType === 'company' ? 'IDENTITY_VERIFIED' : 'SELF_CERT_COMPLETED')
  const navigate = useNavigate()
  const toast = useToast()

  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [pending, setPending] = useState<string | null>(null)
  const [revoking, setRevoking] = useState<Agreement | null>(null)

  const load = useCallback(async () => {
    try {
      setAgreements(verifiedAgreements(await getAgreements()))
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
    notifyOnboardingChanged()
    navigate(profile.clientType === 'company' ? ONBOARDING_ROUTES.documents : ONBOARDING_ROUTES.edd)
  }, [navigate, profile.clientType])

  const accept = async (templateId: string) => {
    setPending(templateId)
    try {
      await consentAgreement(templateId)
      toast('success', 'Согласие зафиксировано')
      const refreshed = verifiedAgreements(await getAgreements())
      setAgreements(refreshed)
      const allRequiredSigned = refreshed.filter((item) => item.template.isRequired).every((item) => item.consented)
      if (allRequiredSigned) await goNext()
    } catch {
      toast('error', 'Не удалось зафиксировать согласие')
    } finally {
      setPending(null)
    }
  }

  const revoke = async (agreement: Agreement) => {
    setPending(agreement.template.id)
    try {
      await revokeAgreement(agreement.template.id)
      setAgreements(verifiedAgreements(await getAgreements()))
      notifyOnboardingChanged()
      toast('success', 'Согласие отозвано, запись добавлена в журнал')
    } catch {
      toast('error', 'Не удалось отозвать согласие')
    } finally {
      setPending(null)
      setRevoking(null)
    }
  }

  if (!allowed) return null

  const required = agreements.filter((item) => item.template.isRequired)
  const signedCount = required.filter((item) => item.consented).length

  return (
    <div className="pb-10">
      <PageHeader
        back={<BackToStatus />}
        title="Соглашения"
        description="Ознакомьтесь с документами, предоставленными оператором, и подтвердите согласие."
        action={required.length > 0 ? <Pill tone={signedCount === required.length ? 'success' : 'info'}>Подписано {signedCount} из {required.length}</Pill> : undefined}
      />

      {loading ? (
        <CenteredSpinner label="Загружаем документы" />
      ) : error ? (
        <Card>
          <p className="text-sm text-[var(--trigonum-muted)]">Не удалось загрузить соглашения</p>
          <OutlineButton type="button" className="mt-4" onClick={() => void load()}>Повторить</OutlineButton>
        </Card>
      ) : agreements.length === 0 ? (
        <Card title="Список документов ещё не подключён">
          <p className="text-sm leading-relaxed text-[var(--trigonum-text)]">В инструкции инвестора конкретные названия и версии соглашений не указаны, поэтому демонстрационные названия скрыты. В рабочем контуре список должен приходить из утверждённого серверного реестра.</p>
          <PrimaryButton type="button" className="mt-4" onClick={() => void goNext()}>Продолжить прототип</PrimaryButton>
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
                    {item.template.isRequired ? <Pill tone="warning">Обязательное</Pill> : <Pill tone="neutral">По желанию</Pill>}
                  </div>
                  <p className="mt-1.5 max-w-[70ch] text-sm text-[var(--trigonum-muted)]">{item.template.description}</p>
                  <p className="mt-1 text-xs text-[var(--trigonum-muted)]">{categoryLabels[item.template.category]}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a href={`#/documents?template=${item.template.mediaId}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--trigonum-border)] px-3 py-1.5 text-xs font-semibold text-[var(--trigonum-ink)] transition hover:border-[var(--trigonum-ink)]"><FileText size={13} />Открыть</a>
                  <a href={`#/documents?download=${item.template.mediaId}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--trigonum-border)] px-3 py-1.5 text-xs font-semibold text-[var(--trigonum-ink)] transition hover:border-[var(--trigonum-ink)]"><Download size={13} />Скачать</a>
                </div>
              </div>
              <div className="mt-4 border-t border-[var(--trigonum-border)] pt-4">
                {item.consented ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-[var(--trigonum-success)]"><Check size={15} strokeWidth={2.5} />Согласие зафиксировано{item.consentedAt && ` · ${new Date(item.consentedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}`}</p>
                    <button type="button" disabled={pending === item.template.id} onClick={() => setRevoking(item)} className="shrink-0 text-xs font-semibold text-[var(--trigonum-muted)] transition hover:text-[var(--trigonum-danger)] disabled:opacity-50">Отозвать</button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={false} disabled={pending === item.template.id} onChange={() => void accept(item.template.id)} className="mt-0.5 size-4 shrink-0 accent-[var(--trigonum-ink)]" /><span className="text-sm text-[var(--trigonum-text)]">Я прочитал документ и принимаю его условия</span></label>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={Boolean(revoking)} onClose={() => setRevoking(null)} title="Отозвать согласие" subtitle={revoking ? `${revoking.template.name} v${revoking.template.version}` : undefined}>
        {revoking?.template.isRequired ? (
          <div className="rounded-xl border p-3.5" style={{ borderColor: 'color-mix(in srgb, var(--trigonum-warning) 45%, white)', background: 'color-mix(in srgb, var(--trigonum-warning) 8%, white)' }}>
            <p className="flex items-start gap-2 text-sm text-[var(--trigonum-text)]"><TriangleAlert size={16} className="mt-0.5 shrink-0 text-[var(--trigonum-warning)]" />Документ обязательный. Без него счёт не может обслуживаться, поэтому заявка вернётся на шаг соглашений, а операции будут недоступны до повторного подписания.</p>
          </div>
        ) : <p className="text-sm text-[var(--trigonum-text)]">Документ не обязателен — отзыв не влияет на обслуживание счёта.</p>}
        <p className="mt-3 text-xs text-[var(--trigonum-muted)]">Отзыв и дата попадут в журнал согласий в разделе «Документы». Ранее подписанная версия остаётся в истории.</p>
        <div className="mt-5 flex justify-end gap-2"><OutlineButton type="button" onClick={() => setRevoking(null)}>Отмена</OutlineButton><button type="button" disabled={pending !== null} onClick={() => revoking && void revoke(revoking)} className="inline-flex items-center gap-2 rounded-lg bg-[var(--trigonum-danger)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50">Отозвать согласие</button></div>
      </Modal>
    </div>
  )
}
