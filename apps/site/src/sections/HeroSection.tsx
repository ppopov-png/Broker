import { ArrowRight, Clock3, Crosshair, PieChart, ShieldCheck } from 'lucide-react'
import { useEffect, useRef } from 'react'
import worldMap from '../assets/world-map.svg'
import { useI18n } from '../i18n/I18nProvider'
import { onboardingUrl } from '../lib/appLinks'

type Stream = { angle: number; color: [number, number, number] }

const streams: Stream[] = [
  { angle: Math.PI, color: [146, 242, 34] },
  { angle: -Math.PI / 4, color: [175, 71, 255] },
  { angle: Math.PI / 2, color: [18, 204, 255] },
]

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
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let centerX = 0
    let centerY = 0
    let raf = 0
    let pointer: { x: number; y: number } | null = null
    const focus = { x: 0, y: 0 }
    const particles: Array<{ stream: number; angle: number; t: number; speed: number; length: number; width: number }> = []
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      centerX = width * 0.585
      centerY = height * 0.5
      focus.x = centerX
      focus.y = centerY
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }
    const leave = () => { pointer = null }
    canvas.parentElement?.addEventListener('pointermove', move)
    canvas.parentElement?.addEventListener('pointerleave', leave)

    const spawn = (stream: number) => {
      const jitter = (Math.random() + Math.random() - 1) * 0.58
      particles.push({
        stream,
        angle: streams[stream].angle + jitter,
        t: 0,
        speed: 0.0026 + Math.random() * 0.0011,
        length: 140 + Math.random() * 100,
        width: 0.9 + Math.random() * 1.2,
      })
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height)
      const target = pointer
        ? { x: centerX + (pointer.x - centerX) * 0.82, y: centerY + (pointer.y - centerY) * 0.82 }
        : { x: centerX, y: centerY }
      focus.x += (target.x - focus.x) * 0.1
      focus.y += (target.y - focus.y) * 0.1

      if (!reduced && particles.length < 160) {
        const count = pointer ? 2 : 1
        streams.forEach((_, index) => {
          for (let i = 0; i < count; i += 1) if (Math.random() > 0.25) spawn(index)
        })
      }

      const reach = Math.max(width, height) * 0.92
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index]
        if (!reduced) particle.t += particle.speed
        const stream = streams[particle.stream]
        const nx = Math.cos(particle.angle)
        const ny = Math.sin(particle.angle)
        const distance = reach * (1 - particle.t)
        const headX = focus.x + nx * distance
        const headY = focus.y + ny * distance
        const tailDistance = distance + particle.length * (0.45 + 0.55 * particle.t)
        const tailX = focus.x + nx * tailDistance
        const tailY = focus.y + ny * tailDistance
        const alpha = Math.min(1, particle.t * 2.4) * (1 - Math.pow(particle.t, 2.1)) * 0.58
        const gradient = ctx.createLinearGradient(tailX, tailY, headX, headY)
        gradient.addColorStop(0, `rgba(${stream.color.join(',')},0)`)
        gradient.addColorStop(0.48, `rgba(${stream.color.join(',')},${alpha * 0.46})`)
        gradient.addColorStop(1, `rgba(${stream.color.join(',')},${alpha})`)
        ctx.strokeStyle = gradient
        ctx.lineWidth = particle.width
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(headX, headY)
        ctx.stroke()
        if (particle.t >= 1) particles.splice(index, 1)
      }

      const pulse = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(time / 850)
      const halo = ctx.createRadialGradient(focus.x, focus.y, 0, focus.x, focus.y, 92)
      halo.addColorStop(0, `rgba(117,117,255,${0.24 + pulse * 0.16})`)
      halo.addColorStop(1, 'rgba(117,117,255,0)')
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(focus.x, focus.y, 92, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = `rgba(90,90,196,${0.34 + pulse * 0.3})`
      ctx.lineWidth = 1.35
      ctx.beginPath()
      ctx.arc(focus.x, focus.y, 22 + pulse * 7, 0, Math.PI * 2)
      ctx.stroke()

      const leftFade = ctx.createLinearGradient(0, 0, width * 0.44, 0)
      leftFade.addColorStop(0, 'rgba(247,248,251,.96)')
      leftFade.addColorStop(0.66, 'rgba(247,248,251,.58)')
      leftFade.addColorStop(1, 'rgba(247,248,251,0)')
      ctx.fillStyle = leftFade
      ctx.fillRect(0, 0, width * 0.44, height)

      const rightFade = ctx.createLinearGradient(width * 0.75, 0, width, 0)
      rightFade.addColorStop(0, 'rgba(247,248,251,0)')
      rightFade.addColorStop(1, 'rgba(247,248,251,.92)')
      ctx.fillStyle = rightFade
      ctx.fillRect(width * 0.75, 0, width * 0.25, height)

      raf = requestAnimationFrame(draw)
    }

    for (let i = 0; i < 20; i += 1) streams.forEach((_, index) => spawn(index))
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      canvas.parentElement?.removeEventListener('pointermove', move)
      canvas.parentElement?.removeEventListener('pointerleave', leave)
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
