type InitMessage = {
  type: 'init'
  canvas: OffscreenCanvas
  width: number
  height: number
  dpr: number
  reduced: boolean
}

type ResizeMessage = {
  type: 'resize'
  width: number
  height: number
  dpr: number
}

type PointerMessage = {
  type: 'pointer'
  x: number | null
  y: number | null
  hovered: boolean
}

type VisibilityMessage = {
  type: 'visibility'
  visible: boolean
}

type WorkerMessage = InitMessage | ResizeMessage | PointerMessage | VisibilityMessage

const MAX_PARTICLES = 1100
const STREAM_ANGLES = [Math.PI, -Math.PI / 4, Math.PI / 2] as const
const STREAM_RGB = [
  [146, 242, 34],
  [175, 71, 255],
  [18, 204, 255],
] as const

let canvas: OffscreenCanvas | null = null
let ctx: OffscreenCanvasRenderingContext2D | null = null
let width = 0
let height = 0
let centerX = 0
let centerY = 0
let dpr = 1
let reduced = false
let visible = true
let hovered = false
let pointerX: number | null = null
let pointerY: number | null = null
let focusX = 0
let focusY = 0
let activeCount = 0
let lastTime = performance.now()
let timer: ReturnType<typeof setTimeout> | null = null
let leftFade: CanvasGradient | null = null
let rightFade: CanvasGradient | null = null
let haloSprite: OffscreenCanvas | null = null
const streakSprites: OffscreenCanvas[] = []

const stream = new Uint8Array(MAX_PARTICLES)
const angle = new Float32Array(MAX_PARTICLES)
const life = new Float32Array(MAX_PARTICLES)
const speed = new Float32Array(MAX_PARTICLES)
const length = new Float32Array(MAX_PARTICLES)
const lineWidth = new Float32Array(MAX_PARTICLES)
const depth = new Float32Array(MAX_PARTICLES)
const offset = new Float32Array(MAX_PARTICLES)

function makeStreakSprite(rgb: readonly [number, number, number]) {
  const sprite = new OffscreenCanvas(512, 14)
  const spriteCtx = sprite.getContext('2d')!
  const gradient = spriteCtx.createLinearGradient(0, 0, 512, 0)
  const color = `${rgb[0]},${rgb[1]},${rgb[2]}`
  gradient.addColorStop(0, `rgba(${color},0)`)
  gradient.addColorStop(0.18, `rgba(${color},.14)`)
  gradient.addColorStop(0.68, `rgba(${color},.75)`)
  gradient.addColorStop(1, `rgba(${color},1)`)
  spriteCtx.fillStyle = gradient
  spriteCtx.fillRect(0, 0, 512, 14)
  return sprite
}

function buildSprites() {
  if (streakSprites.length === 0) {
    STREAM_RGB.forEach((rgb) => streakSprites.push(makeStreakSprite(rgb)))
  }

  if (!haloSprite) {
    haloSprite = new OffscreenCanvas(96, 96)
    const haloCtx = haloSprite.getContext('2d')!
    const gradient = haloCtx.createRadialGradient(48, 48, 0, 48, 48, 48)
    gradient.addColorStop(0, 'rgba(117,117,255,.46)')
    gradient.addColorStop(0.34, 'rgba(175,71,255,.14)')
    gradient.addColorStop(1, 'rgba(117,117,255,0)')
    haloCtx.fillStyle = gradient
    haloCtx.fillRect(0, 0, 96, 96)
  }
}

function resize(nextWidth: number, nextHeight: number, nextDpr: number) {
  if (!canvas || !ctx) return
  width = Math.max(1, nextWidth)
  height = Math.max(1, nextHeight)
  dpr = Math.min(Math.max(nextDpr, 1), 2)
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  centerX = width * 0.585
  centerY = height * 0.5
  if (pointerX === null || pointerY === null) {
    focusX = centerX
    focusY = centerY
  }

  leftFade = ctx.createLinearGradient(0, 0, width * 0.38, 0)
  leftFade.addColorStop(0, 'rgba(247,248,251,.97)')
  leftFade.addColorStop(0.58, 'rgba(247,248,251,.54)')
  leftFade.addColorStop(1, 'rgba(247,248,251,0)')

  rightFade = ctx.createLinearGradient(width * 0.79, 0, width, 0)
  rightFade.addColorStop(0, 'rgba(247,248,251,0)')
  rightFade.addColorStop(1, 'rgba(247,248,251,.9)')
}

function spawn(streamIndex: number, warm = false) {
  if (activeCount >= MAX_PARTICLES) return
  const i = activeCount++
  const particleDepth = 0.32 + Math.random() * 1.02
  const jitter = (Math.random() + Math.random() - 1) * 0.8

  stream[i] = streamIndex
  angle[i] = STREAM_ANGLES[streamIndex] + jitter
  life[i] = warm ? Math.random() * 0.84 : 0
  speed[i] = (0.0034 + Math.random() * 0.0047) * (0.6 + particleDepth * 0.76)
  length[i] = (165 + Math.random() * 320) * (0.72 + particleDepth * 0.76)
  lineWidth[i] = (0.58 + Math.random() * 1.58) * (0.7 + particleDepth * 0.74)
  depth[i] = particleDepth
  offset[i] = (Math.random() - 0.5) * 0.19
}

function burst(perStream: number) {
  for (let s = 0; s < STREAM_ANGLES.length; s += 1) {
    for (let i = 0; i < perStream && activeCount < MAX_PARTICLES; i += 1) spawn(s, true)
  }
}

function copyParticle(from: number, to: number) {
  stream[to] = stream[from]
  angle[to] = angle[from]
  life[to] = life[from]
  speed[to] = speed[from]
  length[to] = length[from]
  lineWidth[to] = lineWidth[from]
  depth[to] = depth[from]
  offset[to] = offset[from]
}

function drawParticle(i: number, reach: number, hoveredNow: boolean) {
  if (!ctx) return

  const t = life[i]
  const perspectiveAngle = angle[i] + offset[i] * (1 - t)
  const nx = Math.cos(perspectiveAngle)
  const ny = Math.sin(perspectiveAngle)
  const perspective = Math.pow(Math.max(0, 1 - t), 1.18)
  const distance = reach * perspective
  const headX = focusX + nx * distance
  const headY = focusY + ny * distance
  const apparentLength = length[i] * (0.42 + t * 1.22) * depth[i]
  const tailDistance = distance + apparentLength
  const tailX = focusX + nx * tailDistance
  const tailY = focusY + ny * tailDistance
  const dx = headX - tailX
  const dy = headY - tailY
  const streakLength = Math.max(1, Math.hypot(dx, dy))
  const rotation = Math.atan2(dy, dx)

  const fadeIn = Math.min(1, t * 5)
  const fadeOut = Math.max(0, 1 - Math.pow(t, 2.45))
  const alpha = fadeIn * fadeOut * (0.26 + depth[i] * 0.53) * (hoveredNow ? 1 : 0.64)
  const thickness = lineWidth[i] * (0.57 + t * 1.08)

  ctx.setTransform(dpr, 0, 0, dpr, tailX * dpr, tailY * dpr)
  ctx.rotate(rotation)
  ctx.globalAlpha = alpha
  ctx.drawImage(streakSprites[stream[i]], 0, -thickness * 1.6, streakLength, thickness * 3.2)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function drawFocus(time: number) {
  if (!ctx || !haloSprite) return
  const pulse = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(time / (hovered ? 560 : 850))
  const haloRadius = hovered ? 24 : 18

  ctx.globalAlpha = hovered ? 0.66 : 0.46
  ctx.drawImage(haloSprite, focusX - haloRadius, focusY - haloRadius, haloRadius * 2, haloRadius * 2)
  ctx.globalAlpha = 1

  ctx.strokeStyle = `rgba(90,90,196,${hovered ? 0.5 + pulse * 0.25 : 0.3 + pulse * 0.18})`
  ctx.lineWidth = hovered ? 1.25 : 1
  ctx.beginPath()
  ctx.arc(focusX, focusY, (hovered ? 7 : 6) + pulse * (hovered ? 3 : 2), 0, Math.PI * 2)
  ctx.stroke()
}

function frame() {
  if (!ctx || !canvas) return

  const now = performance.now()
  const delta = Math.min(2.2, Math.max(0.45, (now - lastTime) / 16.667))
  lastTime = now

  if (visible) {
    ctx.clearRect(0, 0, width, height)

    const targetX = pointerX === null ? centerX : centerX + (pointerX - centerX) * 0.86
    const targetY = pointerY === null ? centerY : centerY + (pointerY - centerY) * 0.86
    focusX += (targetX - focusX) * (hovered ? 0.14 : 0.075)
    focusY += (targetY - focusY) * (hovered ? 0.14 : 0.075)

    if (!reduced) {
      const maxParticles = hovered ? 1100 : 260
      const spawnChance = hovered ? 1 : 0.58
      const perStream = hovered ? 8 : 3

      if (activeCount < maxParticles) {
        for (let s = 0; s < STREAM_ANGLES.length; s += 1) {
          for (let n = 0; n < perStream && activeCount < maxParticles; n += 1) {
            if (Math.random() < spawnChance) spawn(s)
          }
        }
      }
    }

    const reach = Math.max(width, height) * 1.08
    let write = 0
    for (let read = 0; read < activeCount; read += 1) {
      if (!reduced) life[read] += speed[read] * delta * (hovered ? 1.18 : 0.62)
      if (life[read] >= 1) continue
      if (write !== read) copyParticle(read, write)
      drawParticle(write, reach, hovered)
      write += 1
    }
    activeCount = write

    drawFocus(now)

    if (leftFade) {
      ctx.fillStyle = leftFade
      ctx.fillRect(0, 0, width * 0.38, height)
    }
    if (rightFade) {
      ctx.fillStyle = rightFade
      ctx.fillRect(width * 0.79, 0, width * 0.21, height)
    }
  }

  timer = setTimeout(frame, 16)
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const message = event.data

  if (message.type === 'init') {
    canvas = message.canvas
    ctx = canvas.getContext('2d', { alpha: true })
    reduced = message.reduced
    buildSprites()
    resize(message.width, message.height, message.dpr)

    if (reduced) {
      for (let s = 0; s < STREAM_ANGLES.length; s += 1) {
        for (let i = 0; i < 10; i += 1) spawn(s, true)
      }
    } else {
      burst(36)
    }

    lastTime = performance.now()
    if (!timer) frame()
    return
  }

  if (message.type === 'resize') {
    resize(message.width, message.height, message.dpr)
    return
  }

  if (message.type === 'pointer') {
    const wasHovered = hovered
    hovered = message.hovered
    pointerX = message.x
    pointerY = message.y
    if (hovered && !wasHovered && !reduced) burst(140)
    return
  }

  if (message.type === 'visibility') {
    visible = message.visible
    lastTime = performance.now()
  }
}
