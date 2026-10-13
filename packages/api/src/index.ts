export interface ApiClientOptions {
  baseUrl: string
}

export function createApiClient({ baseUrl }: ApiClientOptions) {
  return async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    return response.json() as Promise<T>
  }
}
