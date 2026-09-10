import { Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { landingContent } from '../content/landingOfficial'
import { PLATFORM_SUMMARY, STRATEGIES_SUMMARY } from '../content/products'
import { useI18n, type Language } from '../i18n/I18nProvider'
import { onboardingUrl } from '../lib/appLinks'
import './LiveEarningsTicker.css'

const YEAR_SECONDS = 365 * 24 * 60 * 60
const PAGE_STARTED_AT = Date.now()

const copy: Record<Language, { title: string; note: string }> = {
  ru: {
    title: 'Пока ты читаешь эту страницу, наши инвесторы заработали',
    note: 'Динамика рассчитана на основе исторических показателей платформы.',
  },
  en: {
    title: 'While you are reading this page, our investors have earned',
    note: 'The counter is calculated from the platform’s historical performance.',
  },
  ky: {
    title: 'Сиз бул баракты окуп жатканда, биздин инвесторлор тапты',
    note: 'Санаӊ платформанын тарыхый көрсөткүчтөрүнүн негизинде эсептелет.',
  },
}

function money(value: number): string {
  const cents = Math.max(0, Math.round(value * 100))
  const dollars = Math.trunc(cents / 100).toLocaleString('en-US')
  return `$${dollars}.${String(cents % 100).padStart(2, '0')}`
}

export function LiveEarningsTicker({
  variant = 'panel',
  withCta = false,
}: {
  variant?: 'panel' | 'header'
  withCta?: boolean
}) {
  const { language } = useI18n()
  const { final } = landingContent(language)
  const [elapsed, setElapsed] = useState(() => Math.max(0, (Date.now() - PAGE_STARTED_AT) / 1000))

  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsed(Math.max(0, (Date.now() - PAGE_STARTED_AT) / 1000))
    }, 100)
    return () => window.clearInterval(id)
  }, [])

  const platformPerSecond = (PLATFORM_SUMMARY.aum * (STRATEGIES_SUMMARY.weightedNet / 100)) / YEAR_SECONDS
  const value = money(platformPerSecond * elapsed)
  const labels = copy[language]

  return (
    <div className={`live-earnings live-earnings-${variant}`} aria-label={`${labels.title}: ${value}`}>
      <span className="live-earnings-icon" aria-hidden="true"><Sparkles /></span>
      <div className="live-earnings-copy">
        <span className="live-earnings-title">{labels.title}</span>
        <strong aria-live="off">+{value}</strong>
        {variant === 'panel' && <span className="live-earnings-note">{labels.note}</span>}
      </div>
      {withCta && <a className="button button-primary" href={onboardingUrl()}>{final.cta}</a>}
    </div>
  )
}
