import { test as base, expect } from '@playwright/test'

const test = base.extend<{ browserDiagnostics: void }>({
  browserDiagnostics: [async ({ page, baseURL }, use, testInfo) => {
    const errors: string[] = []
    const assets = new Set<string>()
    const pending: Promise<void>[] = []
    const localAsset = (url: string) => new URL(url).origin === new URL(baseURL!).origin && /\.(?:js|mjs|css)$/.test(new URL(url).pathname)
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('requestfailed', (request) => {
      if (localAsset(request.url())) errors.push(`${request.url()}: ${request.failure()?.errorText}`)
    })
    page.on('response', (response) => {
      if (!localAsset(response.url())) return
      assets.add(response.url())
      pending.push((async () => {
        const mime = response.headers()['content-type'] ?? ''
        const css = new URL(response.url()).pathname.endsWith('.css')
        if (!response.ok() || !(css ? /text\/css/i : /(?:javascript|ecmascript)/i).test(mime)) {
          errors.push(`${response.status()} ${mime}: ${response.url()}`)
        }
        try {
          const body = await response.text()
          if (!body.trim() || /^\s*(?:<!doctype\s+html|<html)/i.test(body)) errors.push(`Invalid asset body: ${response.url()}`)
        } catch (error) { errors.push(`Cannot read asset ${response.url()}: ${error}`) }
      })())
    })
    await use()
    await Promise.all(pending)
    await testInfo.attach('browser-diagnostics', { body: JSON.stringify({ assets: [...assets], errors }, null, 2), contentType: 'application/json' })
    expect(errors, 'Unhandled browser errors and failed/HTML assets').toEqual([])
    if (page.url() !== 'about:blank') {
      expect([...assets].some((url) => url.endsWith('.js'))).toBe(true)
      expect([...assets].some((url) => url.endsWith('.css'))).toBe(true)
    }
  }, { auto: true }],
})

test('health and server SPA fallbacks for each application', async ({ request }) => {
  const health = await request.get('/healthz')
  expect(health.status()).toBe(200)
  expect((await health.text()).trim()).toBe('ok')
  const documents: string[] = []
  for (const root of ['/', '/open/', '/app/']) {
    const index = await request.get(root)
    expect(index.status()).toBe(200)
    const html = await index.text()
    expect(index.headers()['content-type']).toContain('text/html')
    expect(html).toContain('id="root"')
    const nested = await request.get(`${root}ci-smoke/nested-route`)
    expect(nested.status()).toBe(200)
    expect(nested.headers()['content-type']).toContain('text/html')
    expect(await nested.text()).toBe(html)
    documents.push(html)
  }
  expect(new Set(documents).size, 'Each fallback must serve its own app').toBe(3)
})

test('public site renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Стабильный способ')
  await expect(page.getByRole('link', { name: 'Открыть счёт' }).first()).toBeVisible()
})

test('onboarding opens individual registration through hash router', async ({ page }) => {
  await page.goto('/open/')
  await expect(page.getByRole('heading', { name: 'Открыть счёт', exact: true })).toBeVisible()
  await page.getByRole('link', { name: /Физическое лицо/ }).click()
  await expect(page).toHaveURL(/\/open\/#\/register\?type=individual$/)
  await expect(page.getByLabel('Имя и фамилия', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Email аккаунта', { exact: true })).toBeVisible()
})

for (const path of ['/app/', '/app/#/login']) {
  test(`cabinet login without session: ${path}`, async ({ page }) => {
    await page.goto(path)
    await expect(page).toHaveURL(/\/app\/#\/login$/)
    await expect(page.getByRole('heading', { name: 'Вход в кабинет', exact: true })).toBeVisible()
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Пароль', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Войти', exact: true })).toBeVisible()
  })
}
