import { describe, expect, it, vi } from 'vitest'
import { execFile } from 'node:child_process'
import { chmod, copyFile, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { delimiter, join, resolve } from 'node:path'
import { deployWithRollback } from '../../scripts/deploy/contract.mjs'
import { runCli } from '../../scripts/deploy.mjs'
import { LocalComposeAdapter } from '../../scripts/deploy/local-compose-adapter.mjs'
import type { CommandExecutor, CommandOptions } from '../../scripts/deploy/local-compose-adapter.mjs'

const target = `ghcr.io/trigonum/broker@sha256:${'a'.repeat(64)}`
const previous = `ghcr.io/trigonum/broker@sha256:${'b'.repeat(64)}`

describe('LocalComposeAdapter', () => {
  it('rolls out without a build and smokes the published port rather than the CLI default', async () => {
    const { adapter, execute } = adapterHarness({ port: '49152' })

    await expect(adapter.rollout(target, { endpoint: null, timeoutMs: 5_000 })).resolves.toEqual({ actualDigest: target })

    expect(commandArgs(execute)).toEqual([
      ['compose', 'pull', 'broker'],
      ['compose', 'up', '-d', '--no-build', '--force-recreate', 'broker'],
      ['compose', 'ps', '-q', 'broker'],
      ['inspect', '--format', '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}', 'container-id'],
      ['inspect', '--format', '{{.Config.Image}}', 'container-id'],
      ['inspect', '--format', '{{json (index .NetworkSettings.Ports "80/tcp")}}', 'container-id'],
      ['node_modules/@playwright/test/cli.js', 'test'],
    ])
    expect(execute.mock.calls.at(-1)?.[2].env.BROKER_BASE_URL).toBe('http://127.0.0.1:49152')
    expect(execute.mock.calls.flatMap(([, args]) => args)).not.toContain('build')
  })

  it('rejects an endpoint on another published port before smoke starts', async () => {
    const { adapter, execute } = adapterHarness({ port: '49152' })

    await expect(adapter.rollout(target, {
      endpoint: 'http://127.0.0.1:8080', timeoutMs: 5_000,
    })).rejects.toMatchObject({ code: 'ENDPOINT_MISMATCH' })

    expect(playwrightCalls(execute)).toHaveLength(0)
  })

  it('rejects missing or ambiguous published bindings before smoke starts', async () => {
    for (const bindings of [null, [
      { HostIp: '127.0.0.1', HostPort: '49152' },
      { HostIp: '127.0.0.1', HostPort: '49153' },
    ]]) {
      const { adapter, execute } = adapterHarness({ bindings })
      await expect(adapter.rollout(target, { endpoint: null, timeoutMs: 5_000 })).rejects.toThrow(/published binding/)
      expect(playwrightCalls(execute)).toHaveLength(0)
    }
  })

  it('classifies only a confirmed missing artifact as unavailable and stops before up', async () => {
    const missing = Object.assign(new Error('pull failed'), { stderr: 'manifest unknown: manifest not found' })
    const { adapter, execute } = adapterHarness({ pullFailures: new Map([[target, missing]]) })

    await expect(adapter.rollout(target, { endpoint: null, timeoutMs: 5_000 }))
      .rejects.toMatchObject({ code: 'ARTIFACT_UNAVAILABLE' })
    expect(rolloutImages(execute, 'up')).toEqual([])
  })

  it('keeps an operational pull failure as a rollout failure', async () => {
    const failure = Object.assign(new Error('daemon unavailable'), { stderr: 'cannot connect to the Docker daemon' })
    const { adapter, execute } = adapterHarness({ pullFailures: new Map([[target, failure]]) })

    await expect(adapter.rollout(target, { endpoint: null, timeoutMs: 5_000 }))
      .rejects.toMatchObject({ code: 'ROLLOUT_FAILED' })
    expect(rolloutImages(execute, 'up')).toEqual([])
  })

  it('stops after compose up failure', async () => {
    const { adapter, execute } = adapterHarness({ upFailures: new Set([target]) })

    await expect(adapter.rollout(target, { endpoint: null, timeoutMs: 5_000 })).rejects.toThrow(/could not activate/)
    expect(execute.mock.calls.some(([, args]) => args[0] === 'compose' && args[1] === 'ps')).toBe(false)
    expect(playwrightCalls(execute)).toHaveLength(0)
  })

  it('rejects a digest mismatch before published-port discovery and smoke', async () => {
    const { adapter, execute } = adapterHarness({ reportedDigests: new Map([[target, previous]]) })

    await expect(adapter.rollout(target, { endpoint: null, timeoutMs: 5_000 }))
      .rejects.toMatchObject({ code: 'DIGEST_MISMATCH' })
    expect(execute.mock.calls.some(([, args]) => args[0] === 'inspect' && args[2].includes('NetworkSettings.Ports'))).toBe(false)
    expect(playwrightCalls(execute)).toHaveLength(0)
  })

  it('performs a complete previous rollout after target health failure', async () => {
    const { adapter, execute } = adapterHarness({ unhealthyImages: new Set([target]), port: '49154' })
    const result = await deployWithRollback({
      targetDigest: target, previousDigest: previous, timeoutMs: 5_000,
    }, adapter)

    expect(result).toMatchObject({ status: 'rolled_back', actualDigest: previous, rollbackPerformed: true })
    expect(rolloutImages(execute, 'pull')).toEqual([target, previous])
    expect(rolloutImages(execute, 'up')).toEqual([target, previous])
    expect(playwrightCalls(execute)).toHaveLength(1)
    expect(playwrightCalls(execute)[0][2].env.BROKER_BASE_URL).toBe('http://127.0.0.1:49154')
  })

  it('repeats the full rollout and smoke after target smoke failure', async () => {
    const { adapter, execute } = adapterHarness({ failedSmokeRuns: new Set([1]), port: '49155' })
    const result = await deployWithRollback({
      targetDigest: target, previousDigest: previous, timeoutMs: 5_000,
    }, adapter)

    expect(result).toMatchObject({ status: 'rolled_back', actualDigest: previous, rollbackPerformed: true })
    expect(rolloutImages(execute, 'pull')).toEqual([target, previous])
    expect(playwrightCalls(execute)).toHaveLength(2)
  })

  it('reports rollback failure and reads the digest left active by Compose', async () => {
    const { adapter, execute } = adapterHarness({ unhealthyImages: new Set([target, previous]) })
    const result = await deployWithRollback({
      targetDigest: target, previousDigest: previous, timeoutMs: 5_000,
    }, adapter)

    expect(result).toMatchObject({ status: 'rollback_failed', actualDigest: previous, rollbackPerformed: true })
    expect(rolloutImages(execute, 'up')).toEqual([target, previous])
    expect(playwrightCalls(execute)).toHaveLength(0)
  })

  it('reports rollback_failed when the previous pull is killed by its timeout', async () => {
    const timeout = Object.assign(new Error('command timed out'), {
      killed: true, signal: 'SIGTERM', stderr: 'password=registry-secret',
    })
    const { adapter } = adapterHarness({
      unhealthyImages: new Set([target]),
      pullFailures: new Map([[previous, timeout]]),
    })

    const result = await deployWithRollback({
      targetDigest: target, previousDigest: previous, timeoutMs: 5_000,
    }, adapter)

    expect(result).toMatchObject({ status: 'rollback_failed', actualDigest: target, rollbackPerformed: true })
    expect(result.message).not.toContain('registry-secret')
  })

  it('returns a non-zero CLI exit code and sanitized diagnostics for rollback_failed', async () => {
    const timeout = Object.assign(new Error('command timed out'), {
      code: 'ETIMEDOUT', stderr: 'token=registry-secret',
    })
    const { adapter } = adapterHarness({
      unhealthyImages: new Set([target]),
      pullFailures: new Map([[previous, timeout]]),
    })
    let output = ''

    const exitCode = await runCli([
      '--target', target, '--previous', previous, '--timeout', '5000',
    ], { adapter, stdout: { write: (chunk) => { output += chunk } } })

    expect(exitCode).toBe(1)
    expect(JSON.parse(output)).toMatchObject({ status: 'rollback_failed', rollbackPerformed: true, actualDigest: target })
    expect(output).not.toContain('registry-secret')
    expect(output).toContain('token=[redacted]')
  })

  it.each([
    ['missing arguments', []],
    ['unknown argument', ['--unsupported', 'value']],
    ['incomplete argument', ['--target']],
  ])('returns deploy_failed without using the adapter for %s', async (_case, args) => {
    const execute = vi.fn<CommandExecutor>()
    const adapter = new LocalComposeAdapter({ execute })
    let output = ''

    const exitCode = await runCli(args, { adapter, stdout: { write: (chunk) => { output += chunk } } })

    expect(exitCode).toBe(1)
    expect(JSON.parse(output)).toMatchObject({
      status: 'deploy_failed',
      requestedDigest: '[invalid digest reference]',
      actualDigest: null,
      rollbackPerformed: false,
    })
    expect(execute).not.toHaveBeenCalled()
  })

  it.each([
    ['missing arguments', []],
    ['unknown argument', ['--unsupported', 'value']],
    ['incomplete argument', ['--target']],
  ])('exits the real CLI with deploy_failed for %s', async (_case, args) => {
    const execution = await executeProcess(process.execPath, [resolve('scripts/deploy.mjs'), ...args], process.env)

    expect(execution.code).toBe(1)
    expect(execution.stderr).toBe('')
    expect(JSON.parse(execution.stdout)).toMatchObject({
      status: 'deploy_failed', actualDigest: null, rollbackPerformed: false,
    })
  })

  it('exits the real CLI process non-zero with sanitized diagnostics on rollback failure', async () => {
    const fixtureDirectory = await mkdtemp(join(tmpdir(), 'broker-deploy-cli-'))
    const fakeDocker = join(fixtureDirectory, 'fake-docker.cjs')
    const dockerCommand = join(fixtureDirectory, process.platform === 'win32' ? 'docker.exe' : 'docker')
    const stateFile = join(fixtureDirectory, 'active-image.txt')
    const fakeDockerSource = `
const { existsSync, readFileSync, writeFileSync } = require('node:fs')
const { basename } = require('node:path')
const invokedAs = basename(process.argv[1])
const suppliedArgs = process.argv.slice(2)
const args = ['compose', 'inspect'].includes(invokedAs) ? [invokedAs, ...suppliedArgs] : suppliedArgs
const image = process.env.BROKER_IMAGE ?? ''
if (args[0] === 'compose' && args[1] === 'pull') {
  process.stderr.write(image.endsWith('${'b'.repeat(64)}') ? 'token=registry-secret' : 'registry temporarily unavailable')
  process.exitCode = 1
} else if (args[0] === 'compose' && args[1] === 'up') {
  writeFileSync(process.env.TEST_DEPLOY_STATE, image)
} else if (args[0] === 'compose' && args[1] === 'ps') {
  if (existsSync(process.env.TEST_DEPLOY_STATE)) process.stdout.write('container-id\\n')
} else if (args[0] === 'inspect' && args[2].includes('.State.Health')) {
  process.stdout.write('unhealthy\\n')
} else if (args[0] === 'inspect' && args[2] === '{{.Config.Image}}') {
  process.stdout.write(readFileSync(process.env.TEST_DEPLOY_STATE, 'utf8') + '\\n')
}
`
    await writeFile(fakeDocker, fakeDockerSource)
    if (process.platform === 'win32') {
      await copyFile(process.execPath, dockerCommand)
      await writeFile(join(fixtureDirectory, 'compose'), fakeDockerSource)
      await writeFile(join(fixtureDirectory, 'inspect'), fakeDockerSource)
    } else {
      await writeFile(dockerCommand, `#!/bin/sh\nexec "${process.execPath}" "${fakeDocker}" "$@"\n`)
      await chmod(dockerCommand, 0o755)
    }

    try {
      const execution = await executeProcess(process.execPath, [
        resolve('scripts/deploy.mjs'), '--target', target, '--previous', previous, '--timeout', '2000',
      ], {
        ...process.env,
        PATH: `${fixtureDirectory}${delimiter}${process.env.PATH ?? ''}`,
        TEST_DEPLOY_STATE: stateFile,
      }, fixtureDirectory)

      expect(execution.code).toBe(1)
      expect(JSON.parse(execution.stdout)).toMatchObject({ status: 'rollback_failed', rollbackPerformed: true })
      expect(`${execution.stdout}${execution.stderr}`).not.toContain('registry-secret')
      expect(execution.stdout).toContain('token=[redacted]')
    } finally {
      await rm(fixtureDirectory, { recursive: true, force: true })
    }
  }, 10_000)

  it.each([
    ['targetDigest', 'broker:latest'],
    ['targetDigest', 'ghcr.io/trigonum/broker@sha256:abc'],
    ['targetDigest', `./repo@sha256:${'a'.repeat(64)}`],
    ['targetDigest', `registry.example/repo___name@sha256:${'a'.repeat(64)}`],
    ['targetDigest', `registry.example:0/team/broker@sha256:${'a'.repeat(64)}`],
    ['targetDigest', `registry.example:65536/team/broker@sha256:${'a'.repeat(64)}`],
    ['targetDigest', `registry.example:999999/team/broker@sha256:${'a'.repeat(64)}`],
    ['previousDigest', `./repo@sha256:${'b'.repeat(64)}`],
    ['previousDigest', `registry.example/repo-/image@sha256:${'b'.repeat(64)}`],
    ['previousDigest', `registry.example:0/team/broker@sha256:${'b'.repeat(64)}`],
    ['previousDigest', `registry.example:65536/team/broker@sha256:${'b'.repeat(64)}`],
  ] as const)(
    'does not invoke Compose when %s is invalid (%s)',
    async (field, invalidReference) => {
      const execute = vi.fn<CommandExecutor>()
      const adapter = new LocalComposeAdapter({ execute })
      const result = await deployWithRollback({
        targetDigest: target, previousDigest: previous, timeoutMs: 5_000, [field]: invalidReference,
      }, adapter)

      expect(result.status).toBe('deploy_failed')
      expect(execute.mock.calls.some(([, args]) => args[0] === 'compose' && ['pull', 'up'].includes(args[1]))).toBe(false)
    },
  )
})

interface HarnessOptions {
  port?: string
  bindings?: unknown
  unhealthyImages?: Set<string>
  failedSmokeRuns?: Set<number>
  pullFailures?: Map<string, Error>
  upFailures?: Set<string>
  reportedDigests?: Map<string, string>
}

function adapterHarness({
  port = '49152',
  bindings = [{ HostIp: '0.0.0.0', HostPort: port }],
  unhealthyImages = new Set(),
  failedSmokeRuns = new Set(),
  pullFailures = new Map(),
  upFailures = new Set(),
  reportedDigests = new Map(),
}: HarnessOptions = {}) {
  let activeImage: string | undefined
  let smokeRun = 0
  const execute = vi.fn<CommandExecutor>(async (command, args, options) => {
    if (command === 'docker' && args[0] === 'compose' && args[1] === 'pull') {
      const failure = pullFailures.get(options.env.BROKER_IMAGE ?? '')
      if (failure) throw failure
    }
    if (command === 'docker' && args[0] === 'compose' && args[1] === 'up') {
      if (upFailures.has(options.env.BROKER_IMAGE ?? '')) throw new Error('compose up failed')
      activeImage = options.env.BROKER_IMAGE
    }
    if (args[0] === 'compose' && args[1] === 'ps') return { stdout: activeImage ? 'container-id\n' : '' }
    if (args[0] === 'inspect' && args[2].includes('.State.Health')) {
      return { stdout: unhealthyImages.has(activeImage ?? '') ? 'unhealthy\n' : 'healthy\n' }
    }
    if (args[0] === 'inspect' && args[2] === '{{.Config.Image}}') {
      return { stdout: `${reportedDigests.get(activeImage ?? '') ?? activeImage ?? ''}\n` }
    }
    if (args[0] === 'inspect' && args[2].includes('NetworkSettings.Ports')) {
      return { stdout: `${JSON.stringify(bindings)}\n` }
    }
    if (command === process.execPath) {
      smokeRun += 1
      if (failedSmokeRuns.has(smokeRun)) throw Object.assign(new Error('smoke failed'), { stderr: 'smoke failed' })
    }
    return { stdout: '' }
  })
  return {
    adapter: new LocalComposeAdapter({ execute, env: {}, cwd: 'C:\\repo' }),
    execute,
  }
}

function commandArgs(execute: ReturnType<typeof vi.fn<CommandExecutor>>) {
  return execute.mock.calls.map(([, args]) => args)
}

function playwrightCalls(execute: ReturnType<typeof vi.fn<CommandExecutor>>) {
  return execute.mock.calls.filter(([command]) => command === process.execPath)
}

function rolloutImages(execute: ReturnType<typeof vi.fn<CommandExecutor>>, action: 'pull' | 'up') {
  return execute.mock.calls
    .filter(([, args]) => args[0] === 'compose' && args[1] === action)
    .map(([, , options]: [string, string[], CommandOptions]) => options.env.BROKER_IMAGE)
}

function executeProcess(command: string, args: string[], env: NodeJS.ProcessEnv, cwd?: string) {
  return new Promise<{ code: number | string | null; stdout: string; stderr: string }>((resolveExecution) => {
    execFile(command, args, { cwd, env, encoding: 'utf8', timeout: 8_000 }, (error, stdout, stderr) => {
      resolveExecution({ code: error && 'code' in error ? error.code ?? null : 0, stdout, stderr })
    })
  })
}
