export type DeploymentStatus = 'deployed' | 'rolled_back' | 'deploy_failed' | 'rollback_failed'

export interface DeploymentInput {
  targetDigest: string
  previousDigest: string
  endpoint?: string
  timeoutMs: number
}

export interface DeploymentResult {
  status: DeploymentStatus
  requestedDigest: string
  actualDigest: string | null
  rollbackPerformed: boolean
  message: string
}

export interface DeploymentAdapter {
  rollout(image: string, options: { endpoint: string | null; timeoutMs: number }): Promise<{ actualDigest: string }>
  getActiveDigest(options: { timeoutMs: number }): Promise<string | null>
}

export class DeploymentError extends Error {
  code: string
  constructor(message: string, options?: { code?: string; cause?: unknown })
}

export function validateDigestReference(value: unknown, name: string): string
export function validateEndpoint(value?: string): string | null
export function validateTimeout(value: number): number
export function safeMessage(error: unknown): string
export function deployWithRollback(
  input: DeploymentInput,
  adapter: DeploymentAdapter,
  dependencies?: { now?: () => number },
): Promise<DeploymentResult>
