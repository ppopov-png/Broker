import { isIP } from 'node:net'

const SHA256_DIGEST = /^sha256:[a-fA-F0-9]{64}$/
const DOMAIN_COMPONENT = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/
// Docker Distribution permits one dot, one or two underscores, or one or more
// dashes between lowercase alphanumeric portions of a repository component.
const REPOSITORY_COMPONENT = /^[a-z0-9]+(?:(?:[._]|__|-+)[a-z0-9]+)*$/

export class DeploymentError extends Error {
  constructor(message, { code = 'ROLLOUT_FAILED', cause } = {}) {
    super(message, { cause })
    this.name = 'DeploymentError'
    this.code = code
  }
}

export function validateDigestReference(value, name) {
  if (!isDigestReference(value)) {
    throw new DeploymentError(
      `${name} must be a full immutable OCI reference (registry/repository@sha256:<64 hex>)`,
      { code: 'INVALID_INPUT' },
    )
  }
  return value
}

export function validateEndpoint(value) {
  if (value === undefined || value === null) return null
  try {
    const endpoint = new URL(value)
    if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password) throw new Error()
    endpoint.pathname = endpoint.pathname.replace(/\/$/, '')
    endpoint.search = ''
    endpoint.hash = ''
    return endpoint.toString().replace(/\/$/, '')
  } catch {
    throw new DeploymentError('endpoint must be an HTTP(S) URL without embedded credentials', { code: 'INVALID_INPUT' })
  }
}

export function validateTimeout(value) {
  if (!Number.isSafeInteger(value) || value < 1_000 || value > 30 * 60_000) {
    throw new DeploymentError('timeoutMs must be an integer between 1000 and 1800000', { code: 'INVALID_INPUT' })
  }
  return value
}

export function safeMessage(error) {
  const message = error instanceof Error ? error.message : String(error)
  return message
    .replace(/(https?:\/\/)[^\s/@:]+:[^\s/@]+@/gi, '$1[credentials]@')
    .replace(/\b(authorization\s*[=:]\s*)[^\s,;]+(?:\s+[^\s,;]+)?/gi, '$1[redacted]')
    .replace(/\b((?:bearer|basic)\s+)[^\s,;]+/gi, '$1[redacted]')
    .replace(/\b((?:api[_-]?(?:key|token)|access[_-]?token|refresh[_-]?token|token|password|passwd|secret)\s*[=:]\s*)[^\s&,;]+/gi, '$1[redacted]')
    .slice(0, 4_000)
}

/**
 * Platform-independent deploy/rollback orchestration.
 *
 * Adapter contract:
 * - rollout(image, { endpoint, timeoutMs }) => Promise<{ actualDigest: string }>
 * - getActiveDigest({ timeoutMs }) => Promise<string | null>
 * rollout must activate an existing image without building it, wait for platform
 * health, discover the container's published endpoint, optionally verify the
 * supplied endpoint against it, and only resolve after smoke checks pass.
 */
export async function deployWithRollback({ targetDigest, previousDigest, endpoint, timeoutMs }, adapter, { now = Date.now } = {}) {
  const requestedDigest = safeRequestedDigest(targetDigest)
  let normalizedEndpoint
  let deadline

  try {
    validateTimeout(timeoutMs)
    deadline = now() + timeoutMs
    validateDigestReference(targetDigest, 'targetDigest')
    validateDigestReference(previousDigest, 'previousDigest')
    normalizedEndpoint = validateEndpoint(endpoint)
  } catch (error) {
    return result('deploy_failed', requestedDigest, null, false, safeMessage(error))
  }

  try {
    const deployed = await adapter.rollout(targetDigest, {
      endpoint: normalizedEndpoint,
      timeoutMs: remainingBudget(deadline, now),
    })
    remainingBudget(deadline, now)
    validateActualDigest(deployed.actualDigest, targetDigest)
    return result('deployed', requestedDigest, deployed.actualDigest, false, 'Target digest is healthy and passed smoke checks')
  } catch (targetError) {
    const targetMessage = safeMessage(targetError)
    try {
      const rolledBack = await adapter.rollout(previousDigest, {
        endpoint: normalizedEndpoint,
        timeoutMs: remainingBudget(deadline, now),
      })
      remainingBudget(deadline, now)
      validateActualDigest(rolledBack.actualDigest, previousDigest)
      return result(
        'rolled_back', requestedDigest, rolledBack.actualDigest, true,
        `Target rollout failed: ${targetMessage}. Previous digest is healthy and passed smoke checks`,
      )
    } catch (rollbackError) {
      const actualDigest = await readActiveDigest(adapter, deadline, now)
      const unavailable = rollbackError instanceof DeploymentError && rollbackError.code === 'ARTIFACT_UNAVAILABLE'
      return result(
        unavailable ? 'deploy_failed' : 'rollback_failed', requestedDigest, actualDigest, !unavailable,
        `Target rollout failed: ${targetMessage}. Rollback failed: ${safeMessage(rollbackError)}`,
      )
    }
  }
}

function validateActualDigest(actualDigest, expectedDigest) {
  if (actualDigest !== expectedDigest) {
    throw new DeploymentError(`Platform reported unexpected active digest: ${actualDigest ?? 'none'}`, { code: 'DIGEST_MISMATCH' })
  }
}

async function readActiveDigest(adapter, deadline, now) {
  try {
    const timeoutMs = remainingBudget(deadline, now)
    const active = await adapter.getActiveDigest({ timeoutMs })
    return isDigestReference(active) ? active : null
  } catch {
    return null
  }
}

function remainingBudget(deadline, now) {
  const remaining = deadline - now()
  if (remaining <= 0) throw new DeploymentError('Deployment operation timed out', { code: 'TIMEOUT' })
  return remaining
}

function safeRequestedDigest(value) {
  return isDigestReference(value) ? value : '[invalid digest reference]'
}

function isDigestReference(value) {
  if (typeof value !== 'string') return false

  const separator = value.indexOf('@')
  if (separator <= 0 || separator !== value.lastIndexOf('@')) return false

  const name = value.slice(0, separator)
  const digest = value.slice(separator + 1)
  if (!SHA256_DIGEST.test(digest)) return false

  const parts = name.split('/')
  if (parts.length < 2 || !isRegistry(parts[0])) return false
  const repository = parts.slice(1).join('/')
  return repository.length <= 255 && parts.slice(1).every((component) => REPOSITORY_COMPONENT.test(component))
}

function isRegistry(value) {
  let host = value
  let port

  if (value.startsWith('[')) {
    const closingBracket = value.indexOf(']')
    if (closingBracket < 0) return false
    host = value.slice(1, closingBracket)
    const suffix = value.slice(closingBracket + 1)
    if (suffix) {
      if (!suffix.startsWith(':')) return false
      port = suffix.slice(1)
    }
    if (host.includes('.') || isIP(host) !== 6) return false
  } else {
    const colon = value.lastIndexOf(':')
    if (colon >= 0) {
      if (value.indexOf(':') !== colon) return false
      host = value.slice(0, colon)
      port = value.slice(colon + 1)
    }
    if (!isHostname(host)) return false
  }

  return port === undefined || isPort(port)
}

function isHostname(value) {
  if (!value) return false
  return value.split('.').every((component) => DOMAIN_COMPONENT.test(component))
}

function isPort(value) {
  if (!/^[0-9]+$/.test(value)) return false
  const port = Number(value)
  return Number.isSafeInteger(port) && port >= 1 && port <= 65_535
}

function result(status, requestedDigest, actualDigest, rollbackPerformed, message) {
  return { status, requestedDigest, actualDigest, rollbackPerformed, message }
}
