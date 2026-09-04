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

// The reference field keeps particles alive for roughly 4-6 seconds.
// At 0.85 / 1.4 emissions per stream per 60 Hz frame this settles around
// 700-1300 visible streaks, so the pool must not clip the intended cadence.
const MAX_PARTICLES = 1700
const STREAM_ANGLES = [Math.PI, -Math.PI / 4, Math.PI / 2] as const
const STREAM_RGB = [
  [146, 242, 34],
  [175, 71, 255],
  [18, 204, 255],
] as const
const REFERENCE_FRAME_MS = 1000 / 60
const SPREAD_RADIANS = (34 * Math.PI) / 180

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
const particleLength = new Float32Array(MAX_PARTICLES)
const lineWidth = new Float32Array(MAX_PARTICLES)

// Tiny fixed-size ripple pool from the reference animation.
const RIPPLE_LIMIT = 4
const rippleRadius = new Float32Array(RIPPLE_LIMIT)
const rippleAlpha = new Float32Array(RIPPLE_LIMIT)
const rippleStream = new Uint8Array(RIPPLE_LIMIT)
let rippleCount = 0

function makeStreakSprite(rgb: readonly [number, number, number]) {
  const sprite = new OffscreenCanvas(512, 14)
  const spriteCtx = sprite.getContext('2d')!
  const gradient = spriteCtx.createLinearGradient(0, 0, 512, 0)
  const color = `${rgb[0]},${rgb[1]},${rgb[2]}`
  gradient.addColorStop(0, `rgba(${color},0)`)
  gradient.addColorStop(0.45, `rgba(${color},.5)`)
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

  leftFade = ctx.createLinearGradient(0, 0, width * 0.44, 0)
  leftFade.addColorStop(0, 'rgba(248,249,252,.94)')
  leftFade.addColorStop(0.62, 'rgba(248,249,252,.62)')
  leftFade.addColorStop(1, 'rgba(248,249,252,0)')

  rightFade = ctx.createLinearGradient(width * 0.74, 0, width, 0)
  rightFade.addColorStop(0, 'rgba(248,249,252,0)')
  rightFade.addColorStop(1, 'rgba(248,249,252,.92)')
}

function spawn(streamIndex: number, warm = false) {
  if (activeCount >= MAX_PARTICLES) return
  const i = activeCount++
  const jitter = (Math.random() + Math.random() - 1) * 0.5

  stream[i] = streamIndex
  angle[i] = STREAM_ANGLES[streamIndex] + jitter * SPREAD_RADIANS
  life[i] = warm ? Math.random() * 0.88 : 0
  speed[i] = 0.0028 + Math.random() * 0.0012
  particleLength[i] = 150 + Math.random() * 90
  lineWidth[i] = 1 + Math.random() * 1.2
}

function seedReferenceField() {
  // Fill the first frame with the same age distribution the reference field
  // naturally reaches after a few seconds, without a hover-triggered burst.
  for (let s = 0; s < STREAM_ANGLES.length; s += 1) {
    for (let i = 0; i < 34; i += 1) spawn(s, true)
  }
}

function copyParticle(from: number, to: number) {
  stream[to] = stream[from]
  angle[to] = angle[from]
  life[to] = life[from]
  speed[to] = speed[from]
  particleLength[to] = particleLength[from]
  lineWidth[to] = lineWidth[from]
}

function addRipple(streamIndex: number) {
  if (rippleCount >= RIPPLE_LIMIT) return
  rippleRadius[rippleCount] = 8
  rippleAlpha[rippleCount] = 0.3
  rippleStream[rippleCount] = streamIndex
  rippleCount += 1
}

function drawParticle(i: number, reach: number) {
  if (!ctx) return

  const t = life[i]
  const nx = Math.cos(angle[i])
  const ny = Math.sin(angle[i])
  const distance = reach * (1 - t)
  const headX = focusX + nx * distance
  const headY = focusY + ny * distance
  const tailDistance = distance + particleLength[i] * (0.4 + 0.6 * t)
  const tailX = focusX + nx * tailDistance
  const tailY = focusY + ny * tailDistance
  const dx = headX - tailX
  const dy = headY - tailY
  const streakLength = Math.max(1, Math.hypot(dx, dy))
  const rotation = Math.atan2(dy, dx)
  const alpha = Math.min(1, t * 2.4) * (1 - Math.pow(t, 2.2)) * 0.62
  const thickness = lineWidth[i]

  ctx.setTransform(dpr, 0, 0, dpr, tailX * dpr, tailY * dpr)
  ctx.rotate(rotation)
  ctx.globalAlpha = alpha
  ctx.drawImage(streakSprites[stream[i]], 0, -thickness * 1.5, streakLength, thickness * 3)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function drawRipples(frameScale: number) {
  if (!ctx) return
  let write = 0

  for (let read = 0; read < rippleCount; read += 1) {
    const nextRadius = rippleRadius[read] + 1.1 * frameScale
    const nextAlpha = rippleAlpha[read] * Math.pow(0.975, frameScale)
    if (nextAlpha < 0.02) continue

    rippleRadius[write] = nextRadius
    rippleAlpha[write] = nextAlpha
    rippleStream[write] = rippleStream[read]

    const rgb = STREAM_RGB[rippleStream[write]]
    ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${nextAlpha})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(focusX, focusY, nextRadius, 0, Math.PI * 2)
    ctx.stroke()
    write += 1
  }

  rippleCount = write
}

function drawFocus(time: number) {
  if (!ctx || !haloSprite) return
  const pulse = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(time / 900)

  // Keep the compact focus requested for the production version; only the
  // particle cadence/physics are copied from the reference field.
  const haloRadius = hovered ? 24 : 18
  ctx.globalAlpha = hovered ? 0.66 : 0.46
  ctx.drawImage(haloSprite, focusX - haloRadius, focusY - haloRadius, haloRadius * 2, haloRadius * 2)
  ctx.globalAlpha = 1

  ctx.strokeStyle = `rgba(90,90,196,${0.35 + pulse * 0.35})`
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.arc(focusX, focusY, 7 + pulse * 3, 0, Math.PI * 2)
  ctx.stroke()
}

function emitForFrame(frameScale: number) {
  if (reduced) return

  // Exact reference cadence, normalized to elapsed time so a slow worker
  // frame does not reduce the number of emitted streaks per second.
  const rate = (hovered ? 1.4 : 0.85) * frameScale
  for (let s = 0; s < STREAM_ANGLES.length; s += 1) {
    let count = Math.floor(rate)
    if (Math.random() < rate - count) count += 1
    for (let n = 0; n < count; n += 1) spawn(s)
  }
}

function frame() {
  if (!ctx || !canvas) return

  const now = performance.now()
  const elapsedMs = Math.min(50, Math.max(4, now - lastTime))
  const frameScale = elapsedMs / REFERENCE_FRAME_MS
  lastTime = now

  if (visible) {
    ctx.clearRect(0, 0, width, height)

    const targetX = pointerX === null ? centerX : centerX + (pointerX - centerX) * 0.82
    const targetY = pointerY === null ? centerY : centerY + (pointerY - centerY) * 0.82
    const focusEase = 1 - Math.pow(1 - 0.12, frameScale)
    focusX += (targetX - focusX) * focusEase
    focusY += (targetY - focusY) * focusEase

    emitForFrame(frameScale)

    const reach = Math.max(width, height) * 0.9
    let write = 0
    for (let read = 0; read < activeCount; read += 1) {
      if (!reduced) life[read] += speed[read] * frameScale
      if (life[read] >= 1) {
        if (!reduced) addRipple(stream[read])
        continue
      }
      if (write !== read) copyParticle(read, write)
      drawParticle(write, reach)
      write += 1
    }
    activeCount = write

    drawRipples(frameScale)
    drawFocus(now)

    if (leftFade) {
      ctx.fillStyle = leftFade
      ctx.fillRect(0, 0, width * 0.44, height)
    }
    if (rightFade) {
      ctx.fillStyle = rightFade
      ctx.fillRect(width * 0.74, 0, width * 0.26, height)
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
        for (let i = 0; i < 5; i += 1) {
          spawn(s)
          life[activeCount - 1] = 0.15 + i * 0.16
        }
      }
    } else {
      seedReferenceField()
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
    hovered = message.hovered
    pointerX = message.x
    pointerY = message.y
    return
  }

  if (message.type === 'visibility') {
    visible = message.visible
    lastTime = performance.now()
  }
}
