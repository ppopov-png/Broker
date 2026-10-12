import { execFileSync, spawn, spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { setTimeout as delay } from 'node:timers/promises'

mkdirSync('reports', { recursive: true })
const sha = process.env.GITHUB_SHA ?? process.env.BROKER_SHA ?? execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
const image = process.env.BROKER_IMAGE ?? `broker:${sha}`
const name = `broker-smoke-${process.pid}`
const port = process.env.BROKER_SMOKE_PORT ?? '0'
let baseURL
const metadata = { sha, image, container: name, baseURL, startedAt: new Date().toISOString() }
let started = false
let child
let stopping = false
const docker = (...args) => execFileSync('docker', args, { encoding: 'utf8', timeout: 60_000 })
function cleanup() {
  if (!started || stopping) return
  stopping = true
  const logs = spawnSync('docker', ['logs', name], { encoding: 'utf8', timeout: 30_000 })
  writeFileSync('reports/container.log', `${logs.stdout ?? ''}${logs.stderr ?? ''}${logs.error ?? ''}`)
  if (logs.status !== 0) process.exitCode = 1
  try { writeFileSync('reports/container-inspect.json', docker('inspect', name)) } catch (error) { console.error(error); process.exitCode = 1 }
  try { docker('rm', '-f', name) } catch (error) { console.error(error); process.exitCode = 1 }
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  child?.kill(signal)
  metadata.signal = signal
  writeFileSync('reports/image-metadata.json', JSON.stringify(metadata, null, 2))
  cleanup()
  process.exit(1)
})
try {
  metadata.imageId = docker('image', 'inspect', '--format', '{{.Id}}', image).trim()
  writeFileSync('reports/image-metadata.json', JSON.stringify(metadata, null, 2))
  started = true
  metadata.containerId = docker('run', '-d', '--name', name, '-p', `127.0.0.1:${port}:80`, image).trim()
  const assignedPort = docker('inspect', '--format', '{{(index (index .NetworkSettings.Ports "80/tcp") 0).HostPort}}', name).trim()
  baseURL = `http://127.0.0.1:${assignedPort}`
  metadata.baseURL = baseURL
  const deadline = Date.now() + 60_000
  let healthy = false
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseURL}/healthz`, { signal: AbortSignal.timeout(2000) })
      healthy = response.status === 200 && (await response.text()).trim() === 'ok'
      if (healthy) break
    } catch { /* Bounded readiness polling, not a test retry. */ }
    await delay(1000)
  }
  if (!healthy) throw new Error('Container /healthz was not ready within 60 seconds')
  const code = await new Promise((resolve, reject) => {
    child = spawn(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)], {
      stdio: 'inherit', env: { ...process.env, BROKER_BASE_URL: baseURL },
    })
    child.on('error', reject)
    child.on('exit', (code) => resolve(code ?? 1))
  })
  metadata.code = code
  process.exitCode = code
} catch (error) {
  metadata.error = String(error)
  console.error(error)
  process.exitCode = 1
} finally {
  metadata.finishedAt = new Date().toISOString()
  writeFileSync('reports/image-metadata.json', JSON.stringify(metadata, null, 2))
  cleanup()
}
