import { CalendarDays, Clock3, Coins, Zap } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'

const ICONS = [Coins, Zap, CalendarDays, Clock3]

const COPY = {
  ru: [
    { value: 'от $1 000', label: 'Минимальная сумма', note: 'для открытия счёта. Доступ к профессиональным стратегиям.' },
    { value: 'до 1 дня', label: 'Открытие счёта', note: 'и доступ к инвестициям. Полностью онлайн.' },
    { value: '7 дней', label: 'Первые результаты.', note: 'Регулярные начисления и прозрачная статистика.' },
    { value: '24/7', label: 'Ваш капитал работает', note: 'круглосуточно. Поддержка и контроль в любое время.' },
  ],
  en: [
    { value: 'from $1,000', label: 'Minimum amount', note: 'to open an account and access professional strategies.' },
    { value: 'up to 1 day', label: 'Account opening', note: 'and investment access. Fully online.' },
    { value: '7 days', label: 'First results', note: 'Regular accruals and transparent statistics.' },
    { value: '24/7', label: 'Your capital works', note: 'around the clock with support and control available anytime.' },
  ],
  ky: [
    { value: '$1 000 баштап', label: 'Минималдуу сумма', note: 'эсеп ачуу жана кесипкөй стратегияларга жетүү үчүн.' },
    { value: '1 күнгө чейин', label: 'Эсеп ачуу', note: 'жана инвестицияларга жетүү. Толугу менен онлайн.' },
    { value: '7 күн', label: 'Алгачкы жыйынтык', note: 'Туруктуу эсептөөлөр жана ачык статистика.' },
    { value: '24/7', label: 'Капиталыңыз иштейт', note: 'күнү-түнү. Колдоо жана көзөмөл каалаган убакта.' },
  ],
} as const

export function StatsStrip() {
  const { language } = useI18n()
  const stats = COPY[language]

  return (
    <section className="v2-stats-strip" aria-label="Ключевые факты">
      {stats.map((item, index) => {
        const Icon = ICONS[index] ?? Coins
        return (
          <article className="v2-stat-item" key={item.label}>
            <span className="v2-stat-icon" aria-hidden="true"><Icon size={28} /></span>
            <div>
              <p className="v2-stat-value">{item.value}</p>
              <p className="v2-stat-label">{item.label}</p>
              <p className="v2-stat-note">{item.note}</p>
            </div>
          </article>
        )
      })}
    </section>
  )
}
