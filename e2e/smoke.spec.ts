import { expect, test } from '@playwright/test'
import { openHome } from './helpers'

test.describe('page load', () => {
  test('renders every section with no console errors and no failed requests', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`))

    await openHome(page)
    await expect(page).toHaveTitle('Krishna Maddukuri')
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
    for (const family of ['Bricolage Grotesque', 'Geist', 'Geist Mono', 'Instrument Serif']) {
      expect(loaded, `${family} should be loaded`).toContain(family)
    }
    expect(external).toEqual([])
  })

  test('has the SEO essentials: description, open graph and structured data', async ({ page }) => {
    await openHome(page)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Senior Software Engineer/)
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Krishna Maddukuri/)
    const ld = await page.locator('script[type="application/ld+json"]').textContent()
    expect(JSON.parse(ld ?? '{}')).toMatchObject({ '@type': 'Person', name: 'Krishna Koushik Maddukuri' })
  })

  test('the page never scrolls sideways', async ({ page }) => {
    await openHome(page)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
