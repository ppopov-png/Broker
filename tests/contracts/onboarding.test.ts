import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_CLIENT_PROFILE, ONBOARDING_STORE_KEY, PROTOTYPE_ACCOUNTS_KEY,
  findPrototypeAccount, markClientProfile, readClientProfile, registerPrototypeAccount,
} from '@trigonum/shared'

// Fresh Storage for each test, without a browser or application internals.
class MemoryStorage implements Storage {
  private values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, String(value)) }
}

describe('@trigonum/shared storage contract', () => {
  let storage: Storage
  beforeEach(() => {
    storage = new MemoryStorage()
    vi.stubGlobal('window', { localStorage: storage })
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-02T03:04:05.000Z'))
  })
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

  it.each(['individual', 'company'] as const)('persists %s account and profile', (clientType) => {
    const account = registerPrototypeAccount({
      email: ' Investor@Example.com ', name: ' Investor ', clientType, jurisdiction: 'OTHER',
    })
    expect(account).toEqual({
      email: 'Investor@Example.com', name: 'Investor', clientType, jurisdiction: 'OTHER',
      createdAt: '2026-01-02T03:04:05.000Z',
    })
    expect(JSON.parse(storage.getItem(PROTOTYPE_ACCOUNTS_KEY)!)).toEqual({ 'investor@example.com': account })
    expect(findPrototypeAccount('  INVESTOR@example.COM  ')).toEqual(account)
    expect(readClientProfile()).toEqual({ clientType, jurisdiction: 'OTHER' })
  })
  it('reads saved profile and prefers valid session profile', () => {
    markClientProfile({ clientType: 'company', jurisdiction: 'OTHER' })
    expect(readClientProfile()).toEqual({ clientType: 'company', jurisdiction: 'OTHER' })
    storage.setItem('trigonum-session-v1', JSON.stringify({ clientType: 'individual', jurisdiction: 'KG' }))
    expect(readClientProfile()).toEqual({ clientType: 'individual', jurisdiction: 'KG' })
  })
  it('falls back from corrupt session JSON to saved profile', () => {
    markClientProfile({ clientType: 'company', jurisdiction: 'OTHER' })
    storage.setItem('trigonum-session-v1', '{broken')
    expect(readClientProfile()).toEqual({ clientType: 'company', jurisdiction: 'OTHER' })
  })
  it('falls back from corrupt stores and can register again', () => {
    storage.setItem(ONBOARDING_STORE_KEY, '{broken')
    storage.setItem(PROTOTYPE_ACCOUNTS_KEY, '{broken')
    expect(readClientProfile()).toEqual(DEFAULT_CLIENT_PROFILE)
    expect(findPrototypeAccount('missing@example.com')).toBeNull()
    registerPrototypeAccount({ email: 'new@example.com', name: 'New', clientType: 'company', jurisdiction: 'KG' })
    expect(findPrototypeAccount('new@example.com')?.clientType).toBe('company')
    expect(readClientProfile()).toEqual({ clientType: 'company', jurisdiction: 'KG' })
  })
  it('ignores an invalid session profile', () => {
    markClientProfile({ clientType: 'company', jurisdiction: 'OTHER' })
    storage.setItem('trigonum-session-v1', JSON.stringify({ clientType: 'unknown', jurisdiction: 'KG' }))
    expect(readClientProfile()).toEqual({ clientType: 'company', jurisdiction: 'OTHER' })
  })
})
