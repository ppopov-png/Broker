import { ArrowRight, Building2, FileText, ShieldCheck, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { documentChecklist, mandatoryCount, type ClientType } from '@trigonum/shared'

/**
 * Развилка веток. Число документов считается из перечня приложения №1.1, а
 * не пишется руками: между «четыре документа» и «девятнадцать с апостилем»
 * лежит разное решение, и узнать об этом лучше здесь, чем на шестом шаге.
 */
const options: {
  type: ClientType
  icon: typeof UserRound
  title: string
  detail: string
  points: string[]
  /** Юрисдикция для подсчёта: берём самый короткий и самый длинный вариант ветки. */
  countFor: { min: 'KG'; max: 'OTHER' }
}[] = [
  {
    type: 'individual',
    icon: UserRound,
    title: 'Физическое лицо',
    detail: 'Частный инвестор',
    points: ['Проверка личности по документу', 'Решение по заявке за один рабочий день', 'Все продукты Trigonum'],
    countFor: { min: 'KG', max: 'OTHER' },
  },
  {
    type: 'company',
    icon: Building2,
    title: 'Юридическое лицо',
    detail: 'Компания или фонд',
    points: [
      'Проверка компании, подписанта и бенефициаров с долей 5% и более',
      'Учредительные документы с нотариальным заверением, для нерезидентов — с апостилем',
      'Несколько пользователей на счёте и отчётность для бухгалтерии',
    ],
    countFor: { min: 'KG', max: 'OTHER' },
  },
]

/** «4 документа» либо «19–20 документов» — в зависимости от разброса по юрисдикциям. */
function documentsRange(type: ClientType): string {
  const min = mandatoryCount(documentChecklist({ clientType: type, jurisdiction: 'KG' }))
  const max = mandatoryCount(documentChecklist({ clientType: type, jurisdiction: 'OTHER' }))
  return min === max ? `${min}` : `${min}–${max}`
}

export function ClientTypePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--trigonum-bg)] px-4 py-10">
      <div className="w-full max-w-[820px]">
        <div className="mb-7 flex items-center gap-2.5">
          <span
            className="grid size-8 place-items-center rounded-[10px]"
            style={{ backgroundImage: 'var(--trigonum-gradient-cta)' }}
          >
            <ShieldCheck size={17} className="text-white" />
          </span>
          <span className="text-[15px] font-bold tracking-tight text-[var(--trigonum-ink)]">Trigonum</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[var(--trigonum-ink)]">Открыть счёт</h1>
        <p className="mt-1.5 max-w-[60ch] text-sm text-[var(--trigonum-muted)]">
          Выберите, от чьего имени открываете счёт. От этого зависит состав документов и порядок проверки — перечень
          задан приложением №1.1 к регламенту и показывается целиком до регистрации.
        </p>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {options.map((option) => (
            <Link
              key={option.type}
              to={`/register?type=${option.type}`}
              className="group flex flex-col rounded-[var(--trigonum-radius-lg)] border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] p-6 shadow-[var(--trigonum-shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--trigonum-ink)]"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-[var(--trigonum-bg)] text-[var(--trigonum-ink)]">
                <option.icon size={20} />
              </span>

              <h2 className="mt-4 text-lg font-bold text-[var(--trigonum-ink)]">{option.title}</h2>
              <p className="mt-0.5 text-sm text-[var(--trigonum-muted)]">{option.detail}</p>

              <ul className="mt-4 flex flex-1 flex-col gap-2">
                {option.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-[var(--trigonum-text)]">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--trigonum-muted)]" />
                    {point}
                  </li>
                ))}
              </ul>

              <p className="mt-4 inline-flex items-center gap-2 self-start rounded-lg bg-[var(--trigonum-bg)] px-3 py-2 text-xs font-semibold text-[var(--trigonum-text)]">
                <FileText size={13} />
                {documentsRange(option.type)} документов в досье · состав зависит от юрисдикции
              </p>

              <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--trigonum-ink)] px-4 py-2.5 text-sm font-semibold text-white transition group-hover:brightness-125">
                Продолжить
                <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-6 text-xs text-[var(--trigonum-muted)]">
          Уже есть счёт?{' '}
          <a href="../app/" className="font-semibold text-[var(--trigonum-blue)]">
            Войти в кабинет
          </a>
        </p>
      </div>
    </div>
  )
}
