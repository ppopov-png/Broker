import { ArrowRight, Clock3, Crosshair, PieChart, ShieldCheck } from 'lucide-react'
import { useEffect, useRef } from 'react'
import worldMap from '../assets/world-map.svg'
import { useI18n } from '../i18n/I18nProvider'
import { onboardingUrl } from '../lib/appLinks'

type Stream = { angle: number; color: [number, number, number] }

type Particle = {
  stream: number
  angle: number
  t: number
  speed: number
  length: number
  width: number
  depth: number
  offset: number
}

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
    const host = canvas?.closest('.hero') as HTMLElement | null
    if (!canvas || !host) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let centerX = 0
    let centerY = 0
    let raf = 0
    let hovered = false
    let lastTime = performance.now()
    let pointer: { x: number; y: number } | null = null
    const focus = { x: 0, y: 0 }
    const particles: Particle[] = []
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
      if (!pointer) {
        focus.x = centerX
        focus.y = centerY
      }
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    const setPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer = {
        x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
        y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
      }
    }

    const spawn = (stream: number, warm = false) => {
      const depth = 0.35 + Math.random() * 0.95
      const jitter = (Math.random() + Math.random() - 1) * 0.72
      particles.push({
        stream,
        angle: streams[stream].angle + jitter,
        t: warm ? Math.random() * 0.78 : 0,
        speed: (0.0038 + Math.random() * 0.0044) * (0.62 + depth * 0.72),
        length: (170 + Math.random() * 260) * (0.7 + depth * 0.72),
        width: (0.7 + Math.random() * 1.8) * (0.72 + depth * 0.8),
        depth,
        offset: (Math.random() - 0.5) * 0.16,
      })
    }

    const burst = (perStream: number) => {
      streams.forEach((_, streamIndex) => {
        for (let i = 0; i < perStream; i += 1) spawn(streamIndex, true)
      })
    }

    const enter = (event: PointerEvent) => {
      hovered = true
      setPointer(event)
      if (!reduced) burst(42)
    }

    const move = (event: PointerEvent) => {
      hovered = true
      setPointer(event)
    }

    const leave = () => {
      hovered = false
      pointer = null
    }

    host.addEventListener('pointerenter', enter)
    host.addEventListener('pointermove', move)
    host.addEventListener('pointerleave', leave)

    const draw = (time: number) => {
      const delta = Math.min(2.2, Math.max(0.45, (time - lastTime) / 16.667))
      lastTime = time

      ctx.clearRect(0, 0, width, height)

      const target = pointer
        ? {
            x: centerX + (pointer.x - centerX) * 0.86,
            y: centerY + (pointer.y - centerY) * 0.86,
          }
        : { x: centerX, y: centerY }

      focus.x += (target.x - focus.x) * (hovered ? 0.14 : 0.075)
      focus.y += (target.y - focus.y) * (hovered ? 0.14 : 0.075)

      if (!reduced) {
        const maxParticles = hovered ? 520 : 95
        const spawnChance = hovered ? 0.96 : 0.2
        const perStream = hovered ? 3 : 1

        if (particles.length < maxParticles) {
          streams.forEach((_, streamIndex) => {
            for (let i = 0; i < perStream; i += 1) {
              if (Math.random() < spawnChance) spawn(streamIndex)
            }
          })
        }
      }

      const reach = Math.max(width, height) * 1.08
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index]
        if (!reduced) particle.t += particle.speed * delta * (hovered ? 1.18 : 0.62)

        const stream = streams[particle.stream]
        const perspectiveAngle = particle.angle + particle.offset * (1 - particle.t)
        const nx = Math.cos(perspectiveAngle)
        const ny = Math.sin(perspectiveAngle)

        const perspective = Math.pow(Math.max(0, 1 - particle.t), 1.18)
        const distance = reach * perspective
        const headX = focus.x + nx * distance
        const headY = focus.y + ny * distance

        const apparentLength = particle.length * (0.42 + particle.t * 1.18) * particle.depth
        const tailDistance = distance + apparentLength
        const tailX = focus.x + nx * tailDistance
        const tailY = focus.y + ny * tailDistance

        const fadeIn = Math.min(1, particle.t * 5)
        const fadeOut = Math.max(0, 1 - Math.pow(particle.t, 2.5))
        const alpha = fadeIn * fadeOut * (0.28 + particle.depth * 0.53) * (hovered ? 1 : 0.56)

        const gradient = ctx.createLinearGradient(tailX, tailY, headX, headY)
        gradient.addColorStop(0, `rgba(${stream.color.join(',')},0)`)
        gradient.addColorStop(0.28, `rgba(${stream.color.join(',')},${alpha * 0.2})`)
        gradient.addColorStop(0.72, `rgba(${stream.color.join(',')},${alpha * 0.7})`)
        gradient.addColorStop(1, `rgba(${stream.color.join(',')},${alpha})`)

        ctx.strokeStyle = gradient
        ctx.lineWidth = particle.width * (0.62 + particle.t * 1.16)
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(headX, headY)
        ctx.stroke()

        if (particle.t >= 1) particles.splice(index, 1)
      }

      const pulse = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(time / (hovered ? 560 : 850))
      const haloRadius = hovered ? 118 : 92
      const halo = ctx.createRadialGradient(focus.x, focus.y, 0, focus.x, focus.y, haloRadius)
      halo.addColorStop(0, `rgba(117,117,255,${hovered ? 0.32 + pulse * 0.22 : 0.2 + pulse * 0.13})`)
      halo.addColorStop(0.38, `rgba(175,71,255,${hovered ? 0.12 + pulse * 0.08 : 0.05})`)
      halo.addColorStop(1, 'rgba(117,117,255,0)')
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(focus.x, focus.y, haloRadius, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = `rgba(90,90,196,${hovered ? 0.52 + pulse * 0.34 : 0.32 + pulse * 0.25})`
      ctx.lineWidth = hovered ? 1.6 : 1.25
      ctx.beginPath()
      ctx.arc(focus.x, focus.y, (hovered ? 25 : 22) + pulse * (hovered ? 10 : 7), 0, Math.PI * 2)
      ctx.stroke()

      const leftFade = ctx.createLinearGradient(0, 0, width * 0.38, 0)
      leftFade.addColorStop(0, 'rgba(247,248,251,.97)')
      leftFade.addColorStop(0.58, 'rgba(247,248,251,.54)')
      leftFade.addColorStop(1, 'rgba(247,248,251,0)')
      ctx.fillStyle = leftFade
      ctx.fillRect(0, 0, width * 0.38, height)

      const rightFade = ctx.createLinearGradient(width * 0.79, 0, width, 0)
      rightFade.addColorStop(0, 'rgba(247,248,251,0)')
      rightFade.addColorStop(1, 'rgba(247,248,251,.9)')
      ctx.fillStyle = rightFade
      ctx.fillRect(width * 0.79, 0, width * 0.21, height)

      raf = requestAnimationFrame(draw)
    }

    if (reduced) {
      streams.forEach((_, streamIndex) => {
        for (let i = 0; i < 8; i += 1) spawn(streamIndex, true)
      })
    } else {
      burst(12)
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      host.removeEventListener('pointerenter', enter)
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
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
