import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync, createWriteStream } from 'node:fs'

const gate = process.argv[2]
if (!['typecheck', 'lint', 'test', 'test:contracts', 'security', 'build', 'test:e2e'].includes(gate)) throw new Error('Expected a known gate name')
mkdirSync('reports', { recursive: true })
const file = `reports/${gate.replaceAll(':', '-')}`
const metadata = { gate, sha: process.env.GITHUB_SHA ?? process.env.BROKER_SHA ?? 'local', startedAt: new Date().toISOString() }
writeFileSync(`${file}-metadata.json`, JSON.stringify(metadata, null, 2))
const log = createWriteStream(`${file}.log`)
let cancelled = false
const child = spawn(process.execPath, [process.env.npm_execpath, 'run', gate], { stdio: ['ignore', 'pipe', 'pipe'] })
child.stdout.on('data', (data) => { process.stdout.write(data); log.write(data) })
child.stderr.on('data', (data) => { process.stderr.write(data); log.write(data) })
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { cancelled = true; child.kill(signal) })
child.on('error', (error) => { log.end(String(error)); process.exitCode = 1 })
child.on('exit', (code, signal) => {
  writeFileSync(`${file}-metadata.json`, JSON.stringify({ ...metadata, code, signal, finishedAt: new Date().toISOString() }, null, 2))
  log.end()
  process.exitCode = cancelled ? 1 : (code ?? 1)
})
