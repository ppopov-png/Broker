import { LocalComposeAdapter } from '../../scripts/deploy/local-compose-adapter.mjs'

export function getActiveDigestWithTimeout(): Promise<string | null> {
  return new LocalComposeAdapter().getActiveDigest({ timeoutMs: 5_000 })
}
