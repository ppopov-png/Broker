import { ArrowRight, Clock3, Crosshair, PieChart, ShieldCheck } from 'lucide-react'
import { useEffect, useRef } from 'react'
import worldMap from '../assets/world-map.svg'
import { useI18n } from '../i18n/I18nProvider'
import { onboardingUrl } from '../lib/appLinks'

type Stream = { angle: number; color: string }

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
  { angle: Math.PI, color: 'rgb(146 242 34)' },
  { angle: -Math.PI / 4, color: 'rgb(175 71 255)' },
  { angle: Math.PI / 2, color: 'rgb(18 204 255)' },
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

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let width = 0
    let height = 0
    let centerX = 0
    let centerY = 0
    let raf = 0
    let hovered = false
    let visible = true
    let lastTime = performance.now()
    let spawnAccumulator = 0
    let spawnCursor = 0
    let pointer: { x: number; y: number } | null = null
    let leftFade: CanvasGradient | null = null
    let rightFade: CanvasGradient | null = null

    const focus = { x: 0, y: 0 }
    const particles: Particle[] = []
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.35)
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      centerX = width * 0.585
      centerY = height * 0.5

      if (!pointer) {
        focus.x = centerX
        focus.y = centerY
      }

      leftFade = ctx.createLinearGradient(0, 0, width * 0.38, 0)
      leftFade.addColorStop(0, 'rgba(247,248,251,.97)')
      leftFade.addColorStop(0.58, 'rgba(247,248,251,.54)')
      leftFade.addColorStop(1, 'rgba(247,248,251,0)')

      rightFade = ctx.createLinearGradient(width * 0.79, 0, width, 0)
      rightFade.addColorStop(0, 'rgba(247,248,251,0)')
      rightFade.addColorStop(1, 'rgba(247,248,251,.9)')
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        lastTime = performance.now()
      },
      { threshold: 0.02 },
    )
    visibilityObserver.observe(host)

    const setPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer = {
        x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
        y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
      }
    }

    const spawn = (stream: number, warm = false) => {
      const depth = 0.42 + Math.random() * 0.78
      const jitter = (Math.random() + Math.random() - 1) * 0.72

      particles.push({
        stream,
        angle: streams[stream].angle + jitter,
        t: warm ? Math.random() * 0.72 : 0,
        speed: 0.5 + Math.random() * 0.38 + depth * 0.12,
        length: (185 + Math.random() * 260) * (0.72 + depth * 0.55),
        width: (0.72 + Math.random() * 1.45) * (0.7 + depth * 0.65),
        depth,
        offset: (Math.random() - 0.5) * 0.15,
      })
    }

    const burst = (perStream: number) => {
      const hardLimit = hovered ? 205 : 55
      streams.forEach((_, streamIndex) => {
        for (let i = 0; i < perStream && particles.length < hardLimit; i += 1) {
          spawn(streamIndex, true)
        }
      })
    }

    const enter = (event: PointerEvent) => {
      hovered = true
      setPointer(event)
      spawnAccumulator = 0
      if (!reduced) burst(18)
    }

    const move = (event: PointerEvent) => {
      setPointer(event)
    }

    const leave = () => {
      hovered = false
      pointer = null
      spawnAccumulator = 0
    }

    host.addEventListener('pointerenter', enter)
    host.addEventListener('pointermove', move, { passive: true })
    host.addEventListener('pointerleave', leave)

    const drawParticles = (dt: number) => {
      const maxParticles = hovered ? 205 : 55
      const spawnRate = hovered ? 76 : 10

      if (!reduced && particles.length < maxParticles) {
        spawnAccumulator += dt * spawnRate
        while (spawnAccumulator >= 1 && particles.length < maxParticles) {
          spawn(spawnCursor % streams.length)
          spawnCursor += 1
          spawnAccumulator -= 1
        }
      }

      const reach = Math.max(width, height) * 1.08
      let writeIndex = 0

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index]
        if (!reduced) particle.t += particle.speed * dt * (hovered ? 1 : 0.68)
        if (particle.t >= 1) continue

        particles[writeIndex] = particle
        writeIndex += 1

        const perspectiveAngle = particle.angle + particle.offset * (1 - particle.t)
        const nx = Math.cos(perspectiveAngle)
        const ny = Math.sin(perspectiveAngle)
        const perspective = Math.pow(Math.max(0, 1 - particle.t), 1.16)
        const distance = reach * perspective
        const headX = focus.x + nx * distance
        const headY = focus.y + ny * distance
        const apparentLength = particle.length * (0.43 + particle.t * 1.12) * particle.depth
        const tailDistance = distance + apparentLength
        const tailX = focus.x + nx * tailDistance
        const tailY = focus.y + ny * tailDistance

        const fadeIn = Math.min(1, particle.t * 5)
        const fadeOut = Math.max(0, 1 - particle.t * particle.t)
        const alpha = fadeIn * fadeOut * (0.26 + particle.depth * 0.52) * (hovered ? 1 : 0.46)

        ctx.globalAlpha = alpha * 0.3
        ctx.strokeStyle = streams[particle.stream].color
        ctx.lineWidth = particle.width * (0.62 + particle.t * 1.02)
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(headX, headY)
        ctx.stroke()

        const highlightStart = 0.54
        const brightX = tailX + (headX - tailX) * highlightStart
        const brightY = tailY + (headY - tailY) * highlightStart
        ctx.globalAlpha = alpha * 0.72
        ctx.lineWidth = Math.max(0.6, particle.width * (0.42 + particle.t * 0.74))
        ctx.beginPath()
        ctx.moveTo(brightX, brightY)
        ctx.lineTo(headX, headY)
        ctx.stroke()
      }

      particles.length = writeIndex
      ctx.globalAlpha = 1
    }

    const drawFocus = (time: number) => {
      const pulse = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(time / (hovered ? 560 : 850))
      const radius = hovered ? 112 : 88

      ctx.globalAlpha = hovered ? 0.08 + pulse * 0.04 : 0.05 + pulse * 0.025
      ctx.fillStyle = '#7575ff'
      ctx.beginPath()
      ctx.arc(focus.x, focus.y, radius, 0, Math.PI * 2)
      ctx.fill()

      ctx.globalAlpha = hovered ? 0.12 + pulse * 0.05 : 0.07
      ctx.fillStyle = '#af47ff'
      ctx.beginPath()
      ctx.arc(focus.x, focus.y, radius * 0.48, 0, Math.PI * 2)
      ctx.fill()

      ctx.globalAlpha = 1
      ctx.strokeStyle = `rgba(90,90,196,${hovered ? 0.5 + pulse * 0.28 : 0.3 + pulse * 0.2})`
      ctx.lineWidth = hovered ? 1.5 : 1.2
      ctx.beginPath()
      ctx.arc(focus.x, focus.y, (hovered ? 25 : 22) + pulse * (hovered ? 9 : 6), 0, Math.PI * 2)
      ctx.stroke()
    }

    const draw = (time: number) => {
      const rawDt = (time - lastTime) / 1000
      const dt = Math.min(0.034, Math.max(0.001, rawDt))
      lastTime = time

      if (!visible || document.hidden) {
        raf = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, width, height)

      const target = pointer
        ? {
            x: centerX + (pointer.x - centerX) * 0.86,
            y: centerY + (pointer.y - centerY) * 0.86,
          }
        : { x: centerX, y: centerY }

      const easing = hovered ? 0.15 : 0.075
      focus.x += (target.x - focus.x) * easing
      focus.y += (target.y - focus.y) * easing

      drawParticles(dt)
      drawFocus(time)

      if (leftFade) {
        ctx.fillStyle = leftFade
        ctx.fillRect(0, 0, width * 0.38, height)
      }
      if (rightFade) {
        ctx.fillStyle = rightFade
        ctx.fillRect(width * 0.79, 0, width * 0.21, height)
      }

      raf = requestAnimationFrame(draw)
    }

    if (reduced) {
      streams.forEach((_, streamIndex) => {
        for (let i = 0; i < 6; i += 1) spawn(streamIndex, true)
      })
    } else {
      burst(8)
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
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
