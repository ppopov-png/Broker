import { describe, expect, it, vi } from 'vitest'
import { DeploymentError, deployWithRollback, safeMessage, validateDigestReference } from '../../scripts/deploy/contract.mjs'
import type { DeploymentAdapter } from '../../scripts/deploy/contract.mjs'

const target = `ghcr.io/trigonum/broker@sha256:${'a'.repeat(64)}`
const previous = `ghcr.io/trigonum/broker@sha256:${'b'.repeat(64)}`
const input = { targetDigest: target, previousDigest: previous, endpoint: 'http://127.0.0.1:8080', timeoutMs: 5_000 }

describe('deployment contract', () => {
  it.each([
    'ghcr.io/trigonum/broker:latest',
    'ghcr.io/trigonum/broker@sha256:abc',
    `ghcr.io/Trigonum/broker@sha256:${'a'.repeat(64)}`,
    `./repo@sha256:${'a'.repeat(64)}`,
    `registry.example/repo-/broker@sha256:${'a'.repeat(64)}`,
  ])('rejects mutable or malformed reference %s', (reference) => {
    expect(() => validateDigestReference(reference, 'image')).toThrow(/immutable OCI reference/)
  })

  it('accepts Docker Distribution repository separators including repeated dashes', () => {
    const reference = `registry.example/team/repo--name/image__part@sha256:${'a'.repeat(64)}`
    expect(validateDigestReference(reference, 'image')).toBe(reference)
  })

  it.each([1, 65_535])('accepts registry port boundary %i', (port) => {
    const reference = `registry.example:${port}/team/broker@sha256:${'a'.repeat(64)}`
    expect(validateDigestReference(reference, 'image')).toBe(reference)
  })

  it.each([
    ['targetDigest', `./repo@sha256:${'a'.repeat(64)}`],
    ['targetDigest', `registry.example/repo___name@sha256:${'a'.repeat(64)}`],
    ['targetDigest', `registry.example:0/team/broker@sha256:${'a'.repeat(64)}`],
    ['targetDigest', `registry.example:65536/team/broker@sha256:${'a'.repeat(64)}`],
    ['targetDigest', `registry.example:999999/team/broker@sha256:${'a'.repeat(64)}`],
    ['previousDigest', `./repo@sha256:${'b'.repeat(64)}`],
    ['previousDigest', `registry.example/repo-/image@sha256:${'b'.repeat(64)}`],
    ['previousDigest', `registry.example:0/team/broker@sha256:${'b'.repeat(64)}`],
    ['previousDigest', `registry.example:65536/team/broker@sha256:${'b'.repeat(64)}`],
  ] as const)('does not rollout when %s has a malformed registry, port, or repository', async (field, reference) => {
    const adapter = fakeAdapter(vi.fn<DeploymentAdapter['rollout']>(), previous)
    const result = await deployWithRollback({ ...input, [field]: reference }, adapter)

    expect(result.status).toBe('deploy_failed')
    expect(adapter.rollout).not.toHaveBeenCalled()
    expect(adapter.getActiveDigest).not.toHaveBeenCalled()
  })

  it('deploys the requested digest', async () => {
    const adapter = fakeAdapter(vi.fn<DeploymentAdapter['rollout']>().mockResolvedValue({ actualDigest: target }))
    await expect(deployWithRollback(input, adapter)).resolves.toMatchObject({
      status: 'deployed', requestedDigest: target, actualDigest: target, rollbackPerformed: false,
    })
    expect(adapter.rollout).toHaveBeenCalledOnce()
  })

  it('rolls back and verifies the previous digest after a target failure', async () => {
    const rollout = vi.fn<DeploymentAdapter['rollout']>()
      .mockRejectedValueOnce(new DeploymentError('target smoke failed'))
      .mockResolvedValueOnce({ actualDigest: previous })
    const result = await deployWithRollback(input, fakeAdapter(rollout))
    expect(result).toMatchObject({ status: 'rolled_back', actualDigest: previous, rollbackPerformed: true })
    expect(rollout).toHaveBeenNthCalledWith(2, previous, expect.objectContaining({ endpoint: input.endpoint }))
  })

  it('shares one timeout budget between target, rollback, and active digest lookup', async () => {
    let clock = 1_000
    const rollout = vi.fn<DeploymentAdapter['rollout']>()
      .mockImplementationOnce(async (_image, options) => {
        expect(options.timeoutMs).toBe(5_000)
        clock += 2_000
        throw new Error('target failed')
      })
      .mockImplementationOnce(async (_image, options) => {
        expect(options.timeoutMs).toBe(3_000)
        clock += 2_000
        throw new Error('rollback failed')
      })
    const getActiveDigest = vi.fn<DeploymentAdapter['getActiveDigest']>(async (options) => {
      expect(options.timeoutMs).toBe(1_000)
      return previous
    })

    const result = await deployWithRollback(input, { rollout, getActiveDigest }, { now: () => clock })

    expect(result).toMatchObject({ status: 'rollback_failed', actualDigest: previous })
    expect(getActiveDigest).toHaveBeenCalledOnce()
  })

  it('does not start active digest lookup after the shared deadline expires', async () => {
    let clock = 0
    const rollout = vi.fn<DeploymentAdapter['rollout']>()
      .mockImplementationOnce(async () => {
        clock = 4_000
        throw new Error('target failed')
      })
      .mockImplementationOnce(async (_image, options) => {
        expect(options.timeoutMs).toBe(1_000)
        clock = 5_000
        throw new Error('rollback timed out')
      })
    const adapter = fakeAdapter(rollout, previous)

    const result = await deployWithRollback(input, adapter, { now: () => clock })

    expect(result).toMatchObject({ status: 'rollback_failed', actualDigest: null })
    expect(adapter.getActiveDigest).not.toHaveBeenCalled()
  })

  it('reports an unavailable previous artifact as deploy_failed', async () => {
    const rollout = vi.fn<DeploymentAdapter['rollout']>()
      .mockRejectedValueOnce(new Error('target failed'))
      .mockRejectedValueOnce(new DeploymentError('previous pull failed', { code: 'ARTIFACT_UNAVAILABLE' }))
    const result = await deployWithRollback(input, fakeAdapter(rollout, target))
    expect(result).toMatchObject({ status: 'deploy_failed', actualDigest: target, rollbackPerformed: false })
  })

  it('reports rollback verification failure and the remaining active digest', async () => {
    const rollout = vi.fn<DeploymentAdapter['rollout']>()
      .mockRejectedValueOnce(new Error('target failed'))
      .mockRejectedValueOnce(new Error('health failed'))
    const result = await deployWithRollback(input, fakeAdapter(rollout, previous))
    expect(result).toMatchObject({ status: 'rollback_failed', actualDigest: previous, rollbackPerformed: true })
  })

  it('does not call the adapter when preflight validation fails', async () => {
    const adapter = fakeAdapter(vi.fn<DeploymentAdapter['rollout']>(), target)
    const result = await deployWithRollback({ ...input, previousDigest: 'broker:latest' }, adapter)
    expect(result).toMatchObject({
      status: 'deploy_failed', actualDigest: null, rollbackPerformed: false,
    })
    expect(adapter.rollout).not.toHaveBeenCalled()
    expect(adapter.getActiveDigest).not.toHaveBeenCalled()
  })

  it.each([
    ['endpoint', 'ftp://registry.example'],
    ['timeoutMs', 999],
  ] as const)('does not call the adapter when %s fails preflight validation', async (field, value) => {
    const adapter = fakeAdapter(vi.fn<DeploymentAdapter['rollout']>(), target)
    const result = await deployWithRollback({ ...input, [field]: value }, adapter)

    expect(result).toMatchObject({ status: 'deploy_failed', actualDigest: null, rollbackPerformed: false })
    expect(adapter.rollout).not.toHaveBeenCalled()
    expect(adapter.getActiveDigest).not.toHaveBeenCalled()
  })

  it.each([
    ['pull https://user:hunter2@registry.example/repo', 'pull https://[credentials]@registry.example/repo'],
    ['Authorization: Bearer bearer-secret', 'Authorization: [redacted]'],
    ['authorization=Basic basic-secret', 'authorization=[redacted]'],
    ['api_key=api-secret', 'api_key=[redacted]'],
    ['api-key: api-secret', 'api-key: [redacted]'],
    ['X-Api-Token: api-secret', 'X-Api-Token: [redacted]'],
    ['access_token=access-secret&scope=pull', 'access_token=[redacted]&scope=pull'],
    ['refresh_token: refresh-secret', 'refresh_token: [redacted]'],
    ['token=token-secret password: password-secret secret=secret-value', 'token=[redacted] password: [redacted] secret=[redacted]'],
  ])('redacts sensitive diagnostic %s', (diagnostic, expected) => {
    expect(safeMessage(diagnostic)).toBe(expected)
  })

  it('does not expose an invalid target containing credentials in the result', async () => {
    const invalidTarget = 'https://user:hunter2@registry.example/repo?access_token=access-secret'
    const result = await deployWithRollback(
      { ...input, targetDigest: invalidTarget },
      fakeAdapter(vi.fn<DeploymentAdapter['rollout']>(), previous),
    )

    expect(result.requestedDigest).toBe('[invalid digest reference]')
    expect(JSON.stringify(result)).not.toContain('hunter2')
    expect(JSON.stringify(result)).not.toContain('access-secret')
  })
})

function fakeAdapter(rollout: DeploymentAdapter['rollout'], active: string | null = null): DeploymentAdapter {
  return { rollout, getActiveDigest: vi.fn().mockResolvedValue(active) }
}
