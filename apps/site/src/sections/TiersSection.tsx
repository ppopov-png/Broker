import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { onboardingUrl } from '../lib/appLinks'
import './ComplianceTiers.css'

type Level = {
  id: 'launch' | 'orbit' | 'lunar' | 'solar' | 'stellar'
  ru: string
  en: string
  lead: string
  get: string
  keep: string
  protection: string
  benefits: string[]
}

const LEVELS: Level[] = [
  {
    id: 'launch',
    ru: 'СТАРТ',
    en: 'LAUNCH',
    lead: 'Первый шаг в инвестиционное путешествие.',
    get: '0',
    keep: '—',
    protection: '—',
    benefits: ['Базовые возможности', 'Доступ к рынкам', 'Обучающие материалы'],
  },
  {
    id: 'orbit',
    ru: 'ОРБИТА',
    en: 'ORBIT',
    lead: 'Вы на орбите новых возможностей.',
    get: '5 000',
    keep: '4 000',
    protection: '—',
    benefits: ['Расширенные инструменты', 'Аналитика и идеи', 'Приоритетная поддержка'],
  },
  {
    id: 'lunar',
    ru: 'ЛУННЫЙ РУБЕЖ',
    en: 'LUNAR',
    lead: 'Ближе к целям. Дальше привычных границ.',
    get: '15 000',
    keep: '12 000',
    protection: '1 пересмотр',
    benefits: ['Персональная аналитика', 'Больше рыночных данных', 'Эксклюзивные обзоры'],
  },
  {
    id: 'solar',
    ru: 'СОЛНЕЧНЫЙ ГОРИЗОНТ',
    en: 'SOLAR',
    lead: 'Больше пространства для ваших решений.',
    get: '40 000',
    keep: '32 000',
    protection: '2 пересмотра',
    benefits: ['Индивидуальные решения', 'Персональный менеджер', 'Расширенная аналитика'],
  },
  {
    id: 'stellar',
    ru: 'К ЗВЁЗДАМ',
    en: 'STELLAR',
    lead: 'У вашего путешествия больше нет границ.',
    get: '90 000',
    keep: '72 000',
    protection: '4 пересмотра',
    benefits: ['Максимум возможностей', 'Персональные условия', 'Приоритетный сервис'],
  },
]

export function TiersSection() {
  const [open, setOpen] = useState<Level | null>(null)

  return (
    <section className="tiers-v2" id="tiers">
      <header className="section-head">
        <h2>УРОВНИ ИНВЕСТОРА</h2>
      </header>

      <div className="tiers-progress" aria-hidden="true">
        {LEVELS.map((level,index)=><span key={level.id} className={index===0?'active':undefined} />)}
      </div>

      <div className="tiers-v2-grid">
        {LEVELS.map((level, index) => (
          <button
            type="button"
            className="tiers-v2-card"
            data-tier={level.id}
            key={level.id}
            onClick={() => setOpen(level)}
          >
            <span className="tier-index">Уровень {index + 1}</span>
            <strong>{level.ru}</strong>
            <em>{level.en}</em>
            <p>{level.lead}</p>
            <ul>
              {level.benefits.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <span className="tier-more">Подробнее</span>
          </button>
        ))}
      </div>

      <LevelModal level={open} onClose={() => setOpen(null)} />
    </section>
  )
}

function LevelModal({ level, onClose }: { level: Level | null; onClose: () => void }) {
  useEffect(() => {
    if (!level) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [level, onClose])

  if (!level) return null

  return createPortal(
    <div className="level-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <article className={`level-modal level-modal-${level.id}`} role="dialog" aria-modal="true">
        <button className="level-modal-close" type="button" onClick={onClose} aria-label="Закрыть"><X size={18} /></button>

        <header className="level-modal-head">
          <span>Уровень</span>
          <h2>{level.ru}</h2>
          <b>{level.en}</b>
          <p>{level.lead}</p>
        </header>

        <section className="level-modal-stats">
          <div><span>Получить уровень</span><strong>{level.get}</strong><small>баллов</small></div>
          <div><span>Удержать уровень</span><strong>{level.keep}</strong><small>{level.keep === '—' ? 'порог не установлен' : 'баллов · 80% порога'}</small></div>
          <div><span>Защита после 1-го достижения</span><strong>{level.protection}</strong><small>{level.protection === '—' ? 'без защиты' : 'от планового понижения'}</small></div>
        </section>

        <section className="level-modal-section">
          <h3>Возможности уровня</h3>
          <p>Привилегии применяются только после одобрения заявки и с учётом условий продукта.</p>
          <div className="level-benefits">
            {level.benefits.map((item, index) => (
              <div key={item}><span>0{index + 1}</span><b>{item}</b></div>
            ))}
          </div>
        </section>

        <section className="level-modal-section">
          <h3>Как начисляются баллы</h3>
          <p>Основная метрика — работающий капитал. Начисления учитываются в скользящем окне 12 месяцев.</p>
          <div className="level-points">
            <div><strong>$1000</strong><span>размещённого капитала за один месяц</span></div>
            <dl>
              <div><dt>Earn</dt><dd>10</dd></div>
              <div><dt>Events</dt><dd>15</dd></div>
              <div><dt>Strategies и Alpha</dt><dd>20</dd></div>
            </dl>
          </div>
        </section>

        <section className="level-modal-section">
          <h3>Повышение и удержание</h3>
          <dl className="level-rules">
            <div><dt>Повышение — сразу</dt><dd>Когда баллов хватает, следующий уровень и его привилегии действуют в тот же день.</dd></div>
            <div><dt>Пересмотр — раз в квартал</dt><dd>Понижение возможно при баллах ниже порога удержания, не более одной ступени за пересмотр.</dd></div>
            <div><dt>Сначала предупреждение</dt><dd>При нехватке баллов клиент получает уведомление заранее.</dd></div>
          </dl>
        </section>

        <footer className="level-modal-foot">
          <p>Правила уровней — по регламенту программы лояльности. Индивидуальные условия подтверждаются договором.</p>
          <a href={onboardingUrl()}>Перейти к открытию счёта</a>
        </footer>
      </article>
    </div>,
    document.body,
  )
}
