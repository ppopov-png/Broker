import { Download, FileCheck2, FileClock, FileText } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '../../../shared/ui/Card'
import { IconTile } from '../../../shared/ui/IconTile'
import { Pill } from '../../../shared/ui/Pill'
import { OutlineButton } from '../../../shared/ui/buttons'

const contracts = [
  { id: 'c1', title: 'Договор брокерского обслуживания', date: '12.03.2024', status: 'Подписан' },
  { id: 'c2', title: 'Приложение №1 — тарифы и условия', date: '12.03.2024', status: 'Подписан' },
]

const reports = [
  { id: 'r1', title: 'Отчёт за май 2025', date: '01.06.2025', size: '412 КБ' },
  { id: 'r2', title: 'Отчёт за апрель 2025', date: '01.05.2025', size: '398 КБ' },
  { id: 'r3', title: 'Отчёт за март 2025', date: '01.04.2025', size: '405 КБ' },
]

const statements = [
  { id: 's1', title: 'Выписка по счёту · 01.05.2025 – 31.05.2025', date: '01.06.2025', size: '86 КБ' },
  { id: 's2', title: 'Выписка по счёту · 01.04.2025 – 30.04.2025', date: '01.05.2025', size: '81 КБ' },
]

function DocRow({ title, meta, icon }: { title: string; meta: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <IconTile icon={icon} tone="blue" size={36} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--trigonum-ink)]">{title}</p>
        <p className="text-xs text-[var(--trigonum-muted)]">{meta}</p>
      </div>
      <OutlineButton className="shrink-0 px-3 py-1.5 text-xs">
        <Download size={14} /> Скачать
      </OutlineButton>
    </div>
  )
}

export function DocumentsPage() {
  return (
    <div className="pb-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--trigonum-ink)]">Документы</h1>
        <p className="mt-1 text-sm text-[var(--trigonum-muted)]">Договоры, отчёты и выписки по вашему счёту</p>
      </header>

      <div className="flex flex-col gap-5">
        <Card title="Договоры">
          <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
            {contracts.map((c) => (
              <div key={c.id} className="flex items-center gap-3 py-3">
                <IconTile icon={<FileCheck2 size={17} />} tone="green" size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--trigonum-ink)]">{c.title}</p>
                  <p className="text-xs text-[var(--trigonum-muted)]">от {c.date}</p>
                </div>
                <Pill tone="success">{c.status}</Pill>
                <OutlineButton className="shrink-0 px-3 py-1.5 text-xs">
                  <Download size={14} /> Скачать
                </OutlineButton>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Отчёты">
          <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
            {reports.map((r) => (
              <DocRow key={r.id} title={r.title} meta={`Опубликован ${r.date} · ${r.size}`} icon={<FileText size={17} />} />
            ))}
          </div>
        </Card>

        <Card title="Выписки">
          <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
            {statements.map((s) => (
              <DocRow key={s.id} title={s.title} meta={`Сформирована ${s.date} · ${s.size}`} icon={<FileClock size={17} />} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
