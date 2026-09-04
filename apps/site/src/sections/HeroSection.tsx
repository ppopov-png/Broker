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

const MAX_PARTICLES = 150
const FRAME_INTERVAL = 1000 / 45

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
    let lastFrame = 0
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
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25)
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      centerX = width * 0.585
      centerY = height * 0.5
      focus.x = centerX
      focus.y = centerY

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

    const stopAnimation = () => {
      hovered = false
      pointer = null
      spawnAccumulator = 0
      particles.length = 0
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      ctx.clearRect(0, 0, width, height)
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (!visible) stopAnimation()
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
      if (particles.length >= MAX_PARTICLES) return
      const depth = 0.45 + Math.random() * 0.72
      const jitter = (Math.random() + Math.random() - 1) * 0.72
      particles.push({
        stream,
        angle: streams[stream].angle + jitter,
        t: warm ? Math.random() * 0.7 : 0,
        speed: 0.56 + Math.random() * 0.34 + depth * 0.1,
        length: (205 + Math.random() * 280) * (0.76 + depth * 0.5),
        width: (0.8 + Math.random() * 1.35) * (0.72 + depth * 0.56),
        depth,
        offset: (Math.random() - 0.5) * 0.15,
      })
    }

    const burst = (perStream: number) => {
      streams.forEach((_, streamIndex) => {
        for (let i = 0; i < perStream && particles.length < MAX_PARTICLES; i += 1) {
          spawn(streamIndex, true)
        }
      })
    }

    const drawParticles = (dt: number) => {
      const spawnRate = 66
      spawnAccumulator += dt * spawnRate

      while (spawnAccumulator >= 1 && particles.length < MAX_PARTICLES) {
        spawn(spawnCursor % streams.length)
        spawnCursor += 1
        spawnAccumulator -= 1
      }

      const reach = Math.max(width, height) * 1.08
      let writeIndex = 0

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index]
        particle.t += particle.speed * dt
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
        const apparentLength = particle.length * (0.44 + particle.t * 1.08) * particle.depth
        const tailDistance = distance + apparentLength
        const tailX = focus.x + nx * tailDistance
        const tailY = focus.y + ny * tailDistance

        const fadeIn = Math.min(1, particle.t * 5)
        const fadeOut = Math.max(0, 1 - particle.t * particle.t)
        const alpha = fadeIn * fadeOut * (0.28 + particle.depth * 0.5)

        ctx.globalAlpha = alpha * 0.28
        ctx.strokeStyle = streams[particle.stream].color
        ctx.lineWidth = particle.width * (0.64 + particle.t)
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(headX, headY)
        ctx.stroke()

        const brightX = tailX + (headX - tailX) * 0.58
        const brightY = tailY + (headY - tailY) * 0.58
        ctx.globalAlpha = alpha * 0.72
        ctx.lineWidth = Math.max(0.65, particle.width * (0.44 + particle.t * 0.7))
        ctx.beginPath()
        ctx.moveTo(brightX, brightY)
        ctx.lineTo(headX, headY)
        ctx.stroke()
      }

      particles.length = writeIndex
      ctx.globalAlpha = 1
    }

    const drawFocus = (time: number) => {
      const pulse = 0.5 + 0.5 * Math.sin(time / 560)

      ctx.globalAlpha = 0.08 + pulse * 0.035
      ctx.fillStyle = '#7575ff'
      ctx.beginPath()
      ctx.arc(focus.x, focus.y, 104, 0, Math.PI * 2)
      ctx.fill()

      ctx.globalAlpha = 0.11 + pulse * 0.045
      ctx.fillStyle = '#af47ff'
      ctx.beginPath()
      ctx.arc(focus.x, focus.y, 50, 0, Math.PI * 2)
      ctx.fill()

      ctx.globalAlpha = 1
      ctx.strokeStyle = `rgba(90,90,196,${0.48 + pulse * 0.25})`
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.arc(focus.x, focus.y, 25 + pulse * 8, 0, Math.PI * 2)
      ctx.stroke()
    }

    const draw = (time: number) => {
      if (!hovered || !visible || document.hidden) {
        raf = 0
        return
      }

      if (lastFrame && time - lastFrame < FRAME_INTERVAL) {
        raf = requestAnimationFrame(draw)
        return
      }

      const dt = lastFrame ? Math.min(0.04, (time - lastFrame) / 1000) : FRAME_INTERVAL / 1000
      lastFrame = time
      ctx.clearRect(0, 0, width, height)

      const target = pointer
        ? {
            x: centerX + (pointer.x - centerX) * 0.86,
            y: centerY + (pointer.y - centerY) * 0.86,
          }
        : { x: centerX, y: centerY }

      focus.x += (target.x - focus.x) * 0.18
      focus.y += (target.y - focus.y) * 0.18

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

    const startAnimation = () => {
      if (reduced || !visible || hovered) return
      hovered = true
      lastFrame = 0
      spawnAccumulator = 0
      burst(16)
      raf = requestAnimationFrame(draw)
    }

    const enter = (event: PointerEvent) => {
      setPointer(event)
      startAnimation()
    }

    const move = (event: PointerEvent) => {
      setPointer(event)
    }

    const leave = () => {
      stopAnimation()
    }

    const onVisibilityChange = () => {
      if (document.hidden) stopAnimation()
    }

    host.addEventListener('pointerenter', enter)
    host.addEventListener('pointermove', move, { passive: true })
    host.addEventListener('pointerleave', leave)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      stopAnimation()
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      host.removeEventListener('pointerenter', enter)
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
      document.removeEventListener('visibilitychange', onVisibilityChange)
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
