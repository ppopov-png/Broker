import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApiClient } from '../../packages/api/src/index'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createApiClient public contract', () => {
  it('uses the supplied base URL and sends the documented fetch options', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ accountId: 'account-42' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const request = createApiClient({ baseUrl: 'https://api.example.test/v1' })
    const result = await request<{ accountId: string }>('/accounts', {
      method: 'POST',
      body: JSON.stringify({ kind: 'individual' }),
      headers: { 'X-Request-Id': 'request-42' },
    })

    expect(result).toEqual({ accountId: 'account-42' })
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledWith('https://api.example.test/v1/accounts', {
      method: 'POST',
      body: JSON.stringify({ kind: 'individual' }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': 'request-42',
      },
    })
  })

  it('rejects a non-successful response with its HTTP status', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Unavailable' }), { status: 503 }),
    ))

    const request = createApiClient({ baseUrl: 'https://api.example.test' })

    await expect(request('/accounts')).rejects.toThrow('API request failed: 503')
  })

  it('preserves a transport error instead of returning a successful result', async () => {
    const transportError = new TypeError('Failed to fetch')
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockRejectedValue(transportError))

    const request = createApiClient({ baseUrl: 'not-a-reachable-api' })

    await expect(request('/accounts')).rejects.toBe(transportError)
  })
})
