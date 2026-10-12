export interface CommandOptions {
  cwd: string
  env: NodeJS.ProcessEnv
  encoding: 'utf8'
  timeout: number
  windowsHide: true
  stdio?: 'inherit'
}

export type CommandExecutor = (
  command: string,
  args: string[],
  options: CommandOptions,
) => Promise<{ stdout?: string; stderr?: string }>

export interface LocalComposeAdapterOptions {
  cwd?: string
  env?: NodeJS.ProcessEnv
  execute?: CommandExecutor
  now?: () => number
  wait?: (milliseconds: number) => Promise<unknown>
}

export class LocalComposeAdapter {
  constructor(options?: LocalComposeAdapterOptions)
  rollout(image: string, options: { endpoint: string | null; timeoutMs: number }): Promise<{ actualDigest: string }>
  getActiveDigest(options?: { timeoutMs?: number }): Promise<string | null>
}
