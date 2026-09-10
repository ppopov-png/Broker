import { Check, CircleDollarSign, Layers3, ShieldCheck, Sparkles, TrendingUp, X } from 'lucide-react'
import { FEE_SCHEDULES } from '@trigonum/shared/fees'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'
import './FeesCustody.css'

const feeMeta = {
  Earn: { schedule: FEE_SCHEDULES.earn, icon: CircleDollarSign, tone: 'earn' },
  Strategies: { schedule: FEE_SCHEDULES.balanced, icon: Layers3, tone: 'strategies' },
  Events: { schedule: FEE_SCHEDULES.event, icon: TrendingUp, tone: 'events' },
} as const

export function FeesSection() {
  const { language } = useI18n()
  const { fees } = landingContent(language)

  return (
    <section className="fees-section fees-v2" id="fees">
      <header className="fees-v2-head">
        <div>
          <span className="fees-v2-kicker"><Sparkles size={14} /> TRANSPARENT FEE MODEL</span>
          <h2>{fees.title}</h2>
          <p>{fees.subtitle}</p>
        </div>
        <div className="fees-v2-management" aria-label="2 percent management fee">
          <span className="fees-v2-management-value">2%</span>
          <span className="fees-v2-management-label">
            {language === 'ru' ? 'комиссия за управление' : language === 'ky' ? 'башкаруу комиссиясы' : 'management fee'}
          </span>
          <small>{language === 'ru' ? 'разово при пополнении' : language === 'ky' ? 'толуктоодо бир жолу' : 'charged once on funding'}</small>
        </div>
      </header>

      <div className="fees-v2-grid">
        {fees.rows.map((row) => {
          const meta = feeMeta[row.product as keyof typeof feeMeta] ?? feeMeta.Strategies
          const Icon = meta.icon
          const result = meta.schedule.resultShare === 0
            ? (language === 'ru' ? 'Не взимается' : language === 'ky' ? 'Алынбайт' : 'Not charged')
            : `${meta.schedule.resultShare}% ${language === 'ru' ? 'от реализованной прибыли' : language === 'ky' ? 'ишке ашырылган кирешеден' : 'of realised profit'}`

          return (
            <article className={`fees-v2-product fees-v2-product--${meta.tone}`} key={row.product} tabIndex={0}>
              <div className="fees-v2-product-top">
                <span className="fees-v2-product-icon"><Icon /></span>
                <div>
                  <h3>{row.product}</h3>
                  <p>{language === 'ru' ? 'Структура вознаграждения' : language === 'ky' ? 'Сый акы түзүмү' : 'Fee structure'}</p>
                </div>
              </div>

              <div className="fees-v2-numbers">
                <div>
                  <span>{language === 'ru' ? 'Управление' : language === 'ky' ? 'Башкаруу' : 'Management'}</span>
                  <strong>{meta.schedule.managementOnDeposit}%</strong>
                  <small>{language === 'ru' ? 'при пополнении' : language === 'ky' ? 'толуктоодо' : 'on funding'}</small>
                </div>
                <span className="fees-v2-plus">+</span>
                <div>
                  <span>{language === 'ru' ? 'Результат' : language === 'ky' ? 'Натыйжа' : 'Performance'}</span>
                  <strong>{meta.schedule.resultShare}%</strong>
                  <small>{result}</small>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="fees-v2-bottom">
        <div className="fees-v2-policy">
          <span className="fees-v2-policy-icon"><ShieldCheck /></span>
          <div>
            <h3>{fees.neverTitle}</h3>
            <div className="fees-v2-policy-list">
              {fees.never.map((item) => <span key={item}><X size={13} />{item}</span>)}
            </div>
          </div>
        </div>
        <p className="fees-v2-note"><Check size={15} />{fees.note}</p>
      </div>
    </section>
  )
}
