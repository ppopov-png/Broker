import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

mkdirSync('reports', { recursive: true })
const result = spawnSync(process.execPath, [process.env.npm_execpath, 'audit', '--omit=dev', '--audit-level=high', '--json'], { encoding: 'utf8', timeout: 120_000, maxBuffer: 10 * 1024 * 1024 })
writeFileSync('reports/security.json', result.stdout || JSON.stringify({ error: String(result.error ?? result.stderr ?? 'No audit report') }))
if (result.stderr) process.stderr.write(result.stderr)
let failed = result.status !== 0 || !!result.error
try {
  const report = JSON.parse(result.stdout)
  const counts = report.metadata?.vulnerabilities
  if (report.error || !counts || !Number.isInteger(counts.high) || !Number.isInteger(counts.critical)) {
    throw new Error(`Audit service did not return a valid report: ${JSON.stringify(report.error ?? report)}`)
  }
  console.log(`Production audit: high=${counts.high}, critical=${counts.critical}. Blocking threshold: high.`)
  failed ||= counts.high > 0 || counts.critical > 0
  if (failed) console.error(JSON.stringify(report, null, 2))
} catch (error) { failed = true; console.error(String(error)) }
if (result.error) console.error(result.error)
process.exitCode = failed ? 1 : 0
