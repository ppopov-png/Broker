import { ChevronDown, Play } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'
import './FaqSection.css'

const videoCopy = {
  ru: {
    answer: 'Ответ',
    video: 'Видеоинструкция',
    title: 'Здесь будет видеоинструкция',
    note: 'Пошаговый ролик по этому вопросу будет добавлен позднее.',
  },
  en: {
    answer: 'Answer',
    video: 'Video guide',
    title: 'Video guide will appear here',
    note: 'A step-by-step video covering this question will be added later.',
  },
  ky: {
    answer: 'Жооп',
    video: 'Видео нускама',
    title: 'Бул жерде видео нускама болот',
    note: 'Бул суроо боюнча кадам-кадам видео кийин кошулат.',
  },
} as const

export function FaqSection() {
  const { language } = useI18n()
  const { faq } = landingContent(language)
  const labels = videoCopy[language]
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="faq-section faq-v2" id="faq">
      <header className="section-head"><h2>{faq.title}</h2></header>
      <div className="faq-list">
        {faq.rows.map((row, index) => {
          const expanded = index === openIndex
          return (
            <article key={row.question} className={expanded ? 'faq-item open' : 'faq-item'}>
              <button type="button" aria-expanded={expanded} onClick={() => setOpenIndex(expanded ? -1 : index)}>
                <span className="faq-v2-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="faq-v2-question">{row.question}</span>
                <span className="faq-v2-chevron"><ChevronDown size={17} /></span>
              </button>

              {expanded && (
                <div className="faq-v2-content">
                  <div className="faq-v2-answer">
                    <p className="faq-v2-answer-label">{labels.answer}</p>
                    <p>{row.answer}</p>
                  </div>

                  <aside className="faq-v2-video" aria-label={labels.video}>
                    <p className="faq-v2-video-label">{labels.video}</p>
                    <div className="faq-v2-video-frame">
                      <div className="faq-v2-video-placeholder">
                        <span className="faq-v2-play"><Play fill="currentColor" /></span>
                        <b>{labels.title}</b>
                        <span>{labels.note}</span>
                      </div>
                    </div>
                  </aside>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
