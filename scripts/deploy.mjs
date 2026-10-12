#!/usr/bin/env node
import { DeploymentError, deployWithRollback, safeMessage } from './deploy/contract.mjs'
import { LocalComposeAdapter } from './deploy/local-compose-adapter.mjs'
import { pathToFileURL } from 'node:url'

export async function runCli(args, {
  adapter = new LocalComposeAdapter(),
  stdout = process.stdout,
} = {}) {
  let options
  try {
    options = parseArgs(args)
  } catch (error) {
    const result = {
      status: 'deploy_failed',
      requestedDigest: '[invalid digest reference]',
      actualDigest: null,
      rollbackPerformed: false,
      message: safeMessage(error),
    }
    stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    return 1
  }

  const input = {
    targetDigest: options.target,
    previousDigest: options.previous,
    endpoint: options.endpoint,
    timeoutMs: parseTimeout(options.timeout),
  }

  const result = await deployWithRollback(input, adapter)
  stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  return ['deployed', 'rolled_back'].includes(result.status) ? 0 : 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await runCli(process.argv.slice(2))
}

function parseArgs(args) {
  const values = {}
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (!['--target', '--previous', '--endpoint', '--timeout'].includes(argument) || !args[index + 1]) {
      throw invalidArguments(`Unknown or incomplete argument: ${argument ?? ''}`)
    }
    values[argument.slice(2)] = args[index + 1]
    index += 1
  }
  if (!values.target || !values.previous) throw invalidArguments('--target and --previous are required')
  return values
}

function parseTimeout(value) {
  if (value === undefined) return 120_000
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) ? parsed : Number.NaN
}

function invalidArguments(message) {
  return new DeploymentError(
    `${message}. Usage: npm run deploy:local -- --target <image@sha256:digest> --previous <image@sha256:digest> [--endpoint URL] [--timeout milliseconds]`,
    { code: 'INVALID_INPUT' },
  )
}
