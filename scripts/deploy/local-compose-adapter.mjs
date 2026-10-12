import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { setTimeout as delay } from 'node:timers/promises'
import { DeploymentError, safeMessage } from './contract.mjs'

const execFileAsync = promisify(execFile)

export class LocalComposeAdapter {
  constructor({
    cwd = process.cwd(),
    env = process.env,
    execute = executeCommand,
    now = Date.now,
    wait = delay,
  } = {}) {
    this.cwd = cwd
    this.env = env
    this.execute = execute
    this.now = now
    this.wait = wait
  }

  async rollout(image, { endpoint, timeoutMs }) {
    const deadline = this.now() + timeoutMs
    const env = { ...this.env, BROKER_IMAGE: image }

    try {
      await this.#run('docker', ['compose', 'pull', 'broker'], env, this.#remaining(deadline))
    } catch (error) {
      throw pullError(image, error)
    }

    try {
      await this.#run('docker', ['compose', 'up', '-d', '--no-build', '--force-recreate', 'broker'], env, this.#remaining(deadline))
    } catch (error) {
      throw new DeploymentError(`Compose could not activate requested image: ${commandMessage(error)}`, { cause: error })
    }

    const containerId = await this.#containerId(env, deadline)
    await this.#waitForHealth(containerId, deadline)
    const actualDigest = await this.#containerImage(containerId, deadline)
    if (actualDigest !== image) {
      throw new DeploymentError(`Running container uses ${actualDigest || 'an unknown image'} instead of requested digest`, { code: 'DIGEST_MISMATCH' })
    }
    const publishedEndpoint = await this.#publishedEndpoint(containerId, deadline)
    assertEndpointMatches(endpoint, publishedEndpoint)
    await this.#smoke(publishedEndpoint, deadline)
    return { actualDigest }
  }

  async getActiveDigest({ timeoutMs = 15_000 } = {}) {
    const deadline = this.now() + Math.min(timeoutMs, 15_000)
    const containerId = await this.#containerId(this.env, deadline, false)
    return containerId ? this.#containerImage(containerId, deadline) : null
  }

  async #containerId(env, deadline, required = true) {
    const { stdout } = await this.#run('docker', ['compose', 'ps', '-q', 'broker'], env, this.#remaining(deadline))
    const id = stdout.trim()
    if (!id && required) throw new DeploymentError('Compose did not return a container for service broker')
    return id
  }

  async #containerImage(containerId, deadline) {
    const { stdout } = await this.#run(
      'docker', ['inspect', '--format', '{{.Config.Image}}', containerId], this.env, this.#remaining(deadline),
    )
    return stdout.trim()
  }

  async #waitForHealth(containerId, deadline) {
    let lastStatus = 'unknown'
    while (this.now() < deadline) {
      const { stdout } = await this.#run(
        'docker', ['inspect', '--format', '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}', containerId],
        this.env, this.#remaining(deadline),
      )
      lastStatus = stdout.trim()
      if (lastStatus === 'healthy') return
      if (['exited', 'dead', 'unhealthy'].includes(lastStatus)) {
        throw new DeploymentError(`Container reached ${lastStatus} state before rollout completed`)
      }
      await this.wait(Math.min(1_000, this.#remaining(deadline)))
    }
    throw new DeploymentError(`Container health check timed out in ${lastStatus} state`, { code: 'TIMEOUT' })
  }

  async #publishedEndpoint(containerId, deadline) {
    const { stdout } = await this.#run(
      'docker', ['inspect', '--format', '{{json (index .NetworkSettings.Ports "80/tcp")}}', containerId],
      this.env, this.#remaining(deadline),
    )
    let bindings
    try {
      bindings = JSON.parse(stdout.trim())
    } catch {
      throw new DeploymentError('Container port 80 has an invalid published binding')
    }
    if (!Array.isArray(bindings) || bindings.length === 0) {
      throw new DeploymentError('Container port 80 does not have a published binding')
    }
    if (bindings.some((binding) => (
      !binding || typeof binding !== 'object' || !isPort(binding.HostPort)
      || (binding.HostIp !== undefined && typeof binding.HostIp !== 'string')
    ))) {
      throw new DeploymentError('Container port 80 has an invalid published binding')
    }

    const ports = [...new Set(bindings.map((binding) => binding.HostPort))]
    if (ports.length !== 1) {
      throw new DeploymentError('Container port 80 does not have an unambiguous published binding')
    }
    const host = publishedHost(bindings)
    if (!host) throw new DeploymentError('Container port 80 does not have an unambiguous published binding')
    return `http://${formatHost(host)}:${ports[0]}`
  }

  async #smoke(endpoint, deadline) {
    try {
      await this.#run(
        process.execPath,
        ['node_modules/@playwright/test/cli.js', 'test'],
        { ...this.env, BROKER_BASE_URL: endpoint },
        this.#remaining(deadline),
        'inherit',
      )
    } catch (error) {
      throw new DeploymentError(`Smoke checks failed for ${endpoint}: ${commandMessage(error)}`, { code: 'SMOKE_FAILED', cause: error })
    }
  }

  #run(command, args, env, timeout, stdio) {
    if (timeout <= 0) throw new DeploymentError('Rollout timed out', { code: 'TIMEOUT' })
    return this.execute(command, args, {
      cwd: this.cwd,
      env,
      encoding: 'utf8',
      timeout,
      windowsHide: true,
      ...(stdio ? { stdio } : {}),
    })
  }

  #remaining(deadline) {
    return Math.max(0, deadline - this.now())
  }
}

function executeCommand(command, args, options) {
  return execFileAsync(command, args, options)
}

function isPort(value) {
  return typeof value === 'string' && /^(?:[1-9]\d{0,4})$/.test(value) && Number(value) <= 65_535
}

function publishedHost(bindings) {
  const hosts = [...new Set(bindings.map(({ HostIp }) => HostIp || '0.0.0.0'))]
  if (hosts.includes('0.0.0.0') || hosts.includes('127.0.0.1')) return '127.0.0.1'
  if (hosts.includes('::') || hosts.includes('::1')) return '::1'
  return hosts.length === 1 ? hosts[0] : null
}

function formatHost(host) {
  return host.includes(':') ? `[${host}]` : host
}

function assertEndpointMatches(requestedEndpoint, publishedEndpoint) {
  if (!requestedEndpoint) return
  const requested = new URL(requestedEndpoint)
  const published = new URL(publishedEndpoint)
  if (requested.hostname !== published.hostname || effectivePort(requested) !== effectivePort(published)) {
    throw new DeploymentError(
      `Configured endpoint ${safeEndpoint(requested)} does not match published endpoint ${publishedEndpoint}`,
      { code: 'ENDPOINT_MISMATCH' },
    )
  }
}

function effectivePort(url) {
  return url.port || (url.protocol === 'https:' ? '443' : '80')
}

function safeEndpoint(url) {
  return `${url.protocol}//${url.host}`
}

function commandMessage(error) {
  const output = `${error?.stdout ?? ''}${error?.stderr ?? ''}`.trim()
  return safeMessage(output || error)
}

function pullError(image, error) {
  const message = commandMessage(error)
  if (isTimeoutError(error)) {
    return new DeploymentError(`Pull timed out for ${image}: ${message}`, { code: 'TIMEOUT', cause: error })
  }
  if (isArtifactUnavailableError(error)) {
    return new DeploymentError(`Cannot pull ${image}: ${message}`, { code: 'ARTIFACT_UNAVAILABLE', cause: error })
  }
  return new DeploymentError(`Pull failed for ${image}: ${message}`, { cause: error })
}

function isTimeoutError(error) {
  return (error instanceof DeploymentError && error.code === 'TIMEOUT')
    || error?.code === 'ETIMEDOUT'
    || error?.killed === true
    || (typeof error?.signal === 'string' && /^SIG(?:TERM|KILL)$/i.test(error.signal))
}

function isArtifactUnavailableError(error) {
  const output = `${error?.stdout ?? ''}\n${error?.stderr ?? ''}\n${error?.message ?? ''}`
  return /(?:manifest unknown|manifest[^\n]*not found|no matching manifest|repository[^\n]*not found|reference[^\n]*not found)/i.test(output)
}
