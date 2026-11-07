import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { openHome, revealAll } from './helpers'

test.describe('accessibility and motion', () => {
  for (const scheme of ['light', 'dark'] as const) {
    test(`the home page has no serious accessibility violations in ${scheme} mode`, async ({ page }) => {
      test.setTimeout(120_000) // revealing every block, then the full axe pass
      // with "reduce motion" the page is complete at once (no fades to wait for, and the paper figure
      // is its still picture), which is also the version assistive-tech users most often get
      await page.emulateMedia({ reducedMotion: 'reduce' })
      // the site opens in dark mode; light is the switch's choice for the visit
      if (scheme === 'light') await page.addInitScript(() => sessionStorage.setItem('kkm-theme', 'light'))
      await openHome(page)
      await expect(page.locator('html')).toHaveAttribute('data-mode', scheme)
      await revealAll(page)
      // the faint name behind the hero and the footer are decoration (aria-hidden), not text to read
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).exclude('[aria-hidden="true"]').analyze()
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
    })
  }

  test('the résumé page has no serious accessibility violations', async ({ page }) => {
    test.setTimeout(120_000)
    await page.goto('/#/resume')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await revealAll(page)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).exclude('[aria-hidden="true"]').analyze()
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(serious.map((v) => v.id)).toEqual([])
  })

  test('every interactive control can be reached and shows a focus ring', async ({ page }) => {
    await openHome(page)
    const names: string[] = []
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab')
      names.push(await page.evaluate(() => (document.activeElement as HTMLElement)?.getAttribute('aria-label') || (document.activeElement as HTMLElement)?.textContent?.trim() || ''))
    }
    expect(names[0]).toBe('Skip to content')
    expect(names.some((n) => /back to top/.test(n))).toBe(true)
    const ring = await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle)
    expect(ring).not.toBe('none')
  })

  test('with reduced motion the page is still complete and the smooth-scroll engine stays off', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openHome(page)
    expect(await page.evaluate(() => document.documentElement.classList.contains('lenis'))).toBe(false)
    await expect(page.locator('#achievements article')).toHaveCount(9)
    const swipe = page.locator('#achievements').getByText('Swipe')
    await expect(swipe).toBeAttached()
  })

  test('is readable at every common width without sideways scrolling', async ({ page }) => {
    for (const width of [360, 390, 768, 1024, 1366, 1920]) {
      await page.setViewportSize({ width, height: 900 })
      await openHome(page)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow, `at ${width}px`).toBeLessThanOrEqual(0)
      const body = await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize))
      expect(body, `body size at ${width}px`).toBeGreaterThanOrEqual(16)
    }
  })

  test('only the code that is needed loads up front: the case-study chunk arrives on navigation', async ({ page }) => {
    const chunks: string[] = []
    page.on('request', (r) => r.url().includes('/assets/') && r.url().endsWith('.js') && chunks.push(r.url()))
    await openHome(page)
    await page.waitForLoadState('networkidle')
    expect(chunks.some((u) => /CaseStudy/.test(u))).toBe(false)
    expect(chunks.some((u) => /Resume/.test(u))).toBe(false)
    await page.goto('/#/work/credit-bureau-reporting')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Credit Bureau Reporting')
    await expect.poll(() => chunks.some((u) => /CaseStudy/.test(u))).toBe(true)
  })
})
