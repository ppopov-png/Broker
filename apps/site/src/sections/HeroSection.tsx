import { ArrowRight, Clock3, Crosshair, PieChart, ShieldCheck } from 'lucide-react'
import { useEffect, useRef } from 'react'
import worldMap from '../assets/world-map.svg'
import { useI18n } from '../i18n/I18nProvider'
import { onboardingUrl } from '../lib/appLinks'

export function HeroSection() {
  const { t } = useI18n()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const advantages = [
    { icon: ShieldCheck, title: t('adv.reliability'), text: t('adv.reliabilityText'), tone: 'indigo' },
    { icon: PieChart, title: t('adv.diversification'), text: t('adv.diversificationText'), tone: 'trade' },
    { icon: Crosshair, title: t('adv.result'), text: t('adv.resultText'), tone: 'academy' },
    { icon: Clock3, title: t('adv.liquidity'), text: t('adv.liquidityText'), tone: 'tech' },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.closest('.hero') as HTMLElement | null
    if (!canvas || !host) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const offscreen = canvas.transferControlToOffscreen()
    const worker = new Worker(new URL('../workers/heroParticles.worker.ts', import.meta.url), { type: 'module' })

    const getSize = () => {
      const rect = canvas.getBoundingClientRect()
      return {
        width: rect.width,
        height: rect.height,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      }
    }

    const size = getSize()
    worker.postMessage(
      {
        type: 'init',
        canvas: offscreen,
        width: size.width,
        height: size.height,
        dpr: size.dpr,
        reduced,
      },
      [offscreen],
    )

    const resizeObserver = new ResizeObserver(() => {
      worker.postMessage({ type: 'resize', ...getSize() })
    })
    resizeObserver.observe(canvas)

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => worker.postMessage({ type: 'visibility', visible: entry.isIntersecting }),
      { threshold: 0.02 },
    )
    visibilityObserver.observe(host)

    const sendPointer = (event: PointerEvent, hovered: boolean) => {
      if (!hovered) {
        worker.postMessage({ type: 'pointer', x: null, y: null, hovered: false })
        return
      }

      const rect = canvas.getBoundingClientRect()
      worker.postMessage({
        type: 'pointer',
        x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
        y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
        hovered: true,
      })
    }

    const enter = (event: PointerEvent) => sendPointer(event, true)
    const move = (event: PointerEvent) => sendPointer(event, true)
    const leave = (event: PointerEvent) => sendPointer(event, false)
    const visibilityChange = () => worker.postMessage({ type: 'visibility', visible: !document.hidden })

    host.addEventListener('pointerenter', enter)
    host.addEventListener('pointermove', move, { passive: true })
    host.addEventListener('pointerleave', leave)
    document.addEventListener('visibilitychange', visibilityChange)

    return () => {
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      host.removeEventListener('pointerenter', enter)
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
      document.removeEventListener('visibilitychange', visibilityChange)
      worker.terminate()
    }
  }, [])

  return (
    <section className="hero" id="top">
      <canvas ref={canvasRef} className="hero-field" aria-hidden="true" />

      <div className="hero-copy">
        <p className="eyebrow">{t('hero.eyebrow')} <span>{t('hero.eyebrowResult')}</span></p>
        <h1>{t('hero.capital')}<br />{t('hero.intellect')}<br /><span>{t('hero.opportunities')}</span></h1>
        <div className="title-accent" />
        <p className="hero-description">{t('hero.description')}</p>
        <div className="hero-buttons">
          <a className="button button-primary" href={onboardingUrl()}>{t('nav.open')} <ArrowRight size={18} /></a>
          <a className="button button-secondary" href="#products">{t('hero.more')} <ArrowRight size={18} /></a>
        </div>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <img className="world-map" src={worldMap} alt="" />
      </div>

      <aside className="hero-advantages">
        {advantages.map(({ icon: Icon, title, text, tone }) => (
          <article className={`advantage ${tone}`} key={title}>
            <span className="advantage-icon"><Icon strokeWidth={1.8} /></span>
            <div><h3>{title}</h3><p>{text}</p></div>
          </article>
        ))}
      </aside>
    </section>
  )
}
