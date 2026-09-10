import { ArrowDownToLine, ArrowUpRight, FileCheck2, KeyRound, Landmark, Link2, Network, ShieldCheck, UserRound } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'
import { onboardingUrl } from '../lib/appLinks'
import './FeesCustody.css'

const custodyIcons = [UserRound, FileCheck2, Network, ArrowDownToLine]

export function CustodySection() {
  const { language } = useI18n()
  const { custody } = landingContent(language)

  return (
    <section className="custody-section custody-v2" id="custody">
      <div className="custody-v2-shell">
        <div className="custody-v2-intro">
          <span className="custody-v2-kicker"><ShieldCheck size={14} /> CUSTODY ARCHITECTURE</span>
          <h2>{custody.title}</h2>
          <p>{custody.subtitle}</p>

          <div className="custody-v2-core" aria-hidden="true">
            <span className="custody-v2-orbit custody-v2-orbit--one" />
            <span className="custody-v2-orbit custody-v2-orbit--two" />
            <div className="custody-v2-core-card">
              <span><Landmark /></span>
              <b>{language === 'ru' ? 'Счёт хранения' : language === 'ky' ? 'Сактоо эсеби' : 'Custody account'}</b>
              <small>{language === 'ru' ? 'индивидуальный учёт клиента' : language === 'ky' ? 'кардардын жеке эсеби' : 'individual client ledger'}</small>
            </div>
            <span className="custody-v2-node custody-v2-node--a"><KeyRound /></span>
            <span className="custody-v2-node custody-v2-node--b"><Link2 /></span>
            <span className="custody-v2-node custody-v2-node--c"><ShieldCheck /></span>
          </div>

          <a className="custody-v2-cta" href={onboardingUrl()}>{custody.cta}<ArrowUpRight size={15} /></a>
        </div>

        <div className="custody-v2-flow">
          {custody.points.map((point, index) => {
            const Icon = custodyIcons[index] ?? ShieldCheck
            return (
              <article className="custody-v2-step" key={point.title} tabIndex={0}>
                <span className="custody-v2-step-index">0{index + 1}</span>
                <span className="custody-v2-step-icon"><Icon /></span>
                <div>
                  <h3>{point.title}</h3>
                  <p>{point.text}</p>
                </div>
                <span className="custody-v2-step-line" aria-hidden="true" />
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
