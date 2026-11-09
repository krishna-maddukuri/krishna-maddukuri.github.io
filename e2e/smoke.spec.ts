import { expect, test } from '@playwright/test'
import { openHome } from './helpers'

test.describe('page load', () => {
  test('renders every section with no console errors and no failed requests', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`))

    await openHome(page)
    await expect(page).toHaveTitle('Krishna Koushik Maddukuri')
    for (const id of ['top', 'about', 'skills', 'work', 'learning', 'experience', 'achievements', 'contact']) {
      await expect(page.locator(`#${id}`)).toBeAttached()
    }
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('footer')).toBeAttached()
    await expect(page.locator('main#main')).toBeAttached()
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
  })

  test('uses the self-hosted fonts and never calls Google Fonts', async ({ page }) => {
    const external: string[] = []
    page.on('request', (r) => {
      if (/fonts\.g(oogleapis|static)\.com/.test(r.url())) external.push(r.url())
    })
    await openHome(page)
    await page.waitForLoadState('networkidle')
    const loaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family))
    for (const family of ['Antonio', 'Schibsted Grotesk', 'IBM Plex Mono', 'Sedgwick Ave']) {
      expect(loaded, `${family} should be loaded`).toContain(family)
    }
    expect(external).toEqual([])
  })

  test('has the SEO essentials: description, open graph and structured data', async ({ page }) => {
    await openHome(page)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Senior Software Engineer/)
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Krishna Koushik Maddukuri/)
    const ld = await page.locator('script[type="application/ld+json"]').textContent()
    expect(JSON.parse(ld ?? '{}')).toMatchObject({ '@type': 'Person', name: 'Krishna Koushik Maddukuri' })
  })

  test('sections below the screen are skipped while the page opens, then all filled in; a jump fills them in at once', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const state = () =>
      page.evaluate(() => ({
        deferring: document.documentElement.classList.contains('defer-sections'),
        contact: getComputedStyle(document.getElementById('contact')!).contentVisibility,
        work: getComputedStyle(document.getElementById('work')!).contentVisibility,
      }))
    const first = await state()
    // Work is never skipped (it measures itself); Contact is, until it is filled in
    expect(first.work).toBe('visible')
    if (first.deferring) expect(first.contact).toBe('auto')
    // the tape's jump to Contact fills everything in before it measures where Contact is
    await page.getByRole('button', { name: /Go to contact/ }).click()
    expect(await state()).toEqual({ deferring: false, contact: 'visible', work: 'visible' })
    await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById('contact')!.getBoundingClientRect().top)), { timeout: 6_000 }).toBeLessThan(20)
  })

  test('a page whose code fails to download shows a way on instead of a blank screen', async ({ page }) => {
    await page.route('**/assets/Resume-*.js', (route) => route.abort())
    await page.goto('/#/resume')
    // one try again by itself, then the safety net
    const net = page.getByRole('alert')
    await expect(net.getByRole('heading', { level: 1 })).toHaveText('This page didn’t load.', { timeout: 15_000 })
    await expect(net.getByText('m.krishnakoushik@icloud.com')).toBeVisible()
    await expect(net.getByRole('button', { name: 'Load it again' })).toBeVisible()
    await expect(net.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(page.getByRole('banner')).toBeVisible()
  })

  test('with script switched off, or the script failing to download, his name and how to reach him still show', async ({ page }) => {
    // script off: the page carries the fallback in a noscript block
    const html = await (await page.request.get('/')).text()
    const block = html.slice(html.indexOf('<noscript id="boot-fallback">'), html.indexOf('</noscript>'))
    for (const text of ['Krishna Koushik Maddukuri', 'm.krishnakoushik@icloud.com', 'linkedin.com/in/krishna-koushik', 'Resume (PDF)']) expect(block).toContain(text)
    // script failing to download: the same block is put on the page
    await page.route('**/assets/index-*.js', (route) => route.abort())
    await page.goto('/')
    await expect(page.getByText('The full site did not load.')).toBeVisible()
    await expect(page.getByText('Krishna Koushik Maddukuri')).toBeVisible()
    await expect(page.getByRole('link', { name: 'linkedin.com/in/krishna-koushik' })).toBeVisible()
  })

  test('the page never scrolls sideways', async ({ page }) => {
    await openHome(page)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
