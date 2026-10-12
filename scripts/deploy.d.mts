import type { DeploymentAdapter } from './deploy/contract.mjs'

export interface CliWriter {
  write(chunk: string): unknown
}

export function runCli(
  args: string[],
  dependencies?: { adapter?: DeploymentAdapter; stdout?: CliWriter },
): Promise<number>
