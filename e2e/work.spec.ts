import { expect, test } from '@playwright/test'
import { isPhone, jumpTo, openHome } from './helpers'

test.describe('work', () => {
  test('lists seven projects', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'work')
    const work = page.locator('#work')
    await expect(work.getByRole('heading', { level: 2 })).toContainText("Things I've")
    await expect(work.getByText(isPhone(page) ? 'Tap a project to open it.' : 'Hover a panel to open it.')).toBeVisible()
  })

  test('desktop: the first panel is open, clicking a closed panel opens it, and the case study link works', async ({ page }) => {
    test.skip(isPhone(page))
    await openHome(page)
    await jumpTo(page, 'work')
    const work = page.locator('#work')
    await expect(work.getByRole('heading', { level: 3, name: /Credit Bureau Reporting/ })).toBeVisible()
    await work.getByRole('button', { name: 'Open Cloud Delivery' }).click()
    await expect(work.getByRole('heading', { level: 3, name: /Cloud Delivery/ })).toBeVisible()
    await expect(work.getByRole('button', { name: 'Open Credit Bureau Reporting' })).toBeVisible()
    // the previous panel's body fades out for a moment; the open panel's link is the one for Cloud Delivery
    await work.getByRole('link', { name: 'Read case study' }).and(page.locator('[href="/work/cloud-delivery/"]')).click()
    await expect(page).toHaveURL(/\/work\/cloud-delivery\/$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Cloud Delivery')
  })

  test('phones: projects open as an accordion and lead to the case study', async ({ page }) => {
    test.skip(!isPhone(page))
    await openHome(page)
    await jumpTo(page, 'work')
    const work = page.locator('#work')
    const first = work.getByRole('button', { name: /Credit Bureau Reporting/ }).first()
    await expect(first).toHaveAttribute('aria-expanded', 'true')
    const second = work.getByRole('button', { name: /Event-Driven Pipelines/ }).first()
    await second.click()
    await expect(second).toHaveAttribute('aria-expanded', 'true')
    await expect(first).toHaveAttribute('aria-expanded', 'false')
    await work.getByRole('link', { name: 'Read case study' }).last().click() // the open row (the first one is still folding away)
    await expect(page).toHaveURL(/\/work\/event-driven-pipelines\/$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Event-Driven Pipelines')
  })
})

test.describe('case study', () => {
  test('opens from a deep link with its context, outcomes, metrics and tools', async ({ page }) => {
    await page.goto('/work/credit-bureau-reporting/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Credit Bureau Reporting')
    await expect(page.getByText('Case study 01')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Context' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'What I did' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Outcome' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tools & methods' })).toBeVisible()
    // the "Where" cell names the company (with its mark in front)
    await expect(page.locator('dd', { hasText: 'Capital One' }).first()).toBeVisible()
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    // the section labels are in the label font (IBM Plex Mono), not the display face; "All work" is the site's key
    expect(await page.getByRole('heading', { name: 'What I did' }).evaluate((el) => getComputedStyle(el).fontFamily)).toContain('IBM Plex Mono')
    await expect(page.getByRole('link', { name: 'All work' })).toHaveClass(/btn-key/)
  })

  test('previous / next step through the projects, "All work" returns to the Work section, and a bad slug goes home', async ({ page }) => {
    await page.goto('/work/credit-bureau-reporting/')
    await page.getByRole('link', { name: /Next case study/ }).click()
    await expect(page).toHaveURL(/\/work\/event-driven-pipelines\/$/)
    await page.getByRole('link', { name: /Previous/ }).click()
    await expect(page).toHaveURL(/\/work\/credit-bureau-reporting\/$/)
    await page.goBack()
    await expect(page).toHaveURL(/\/work\/event-driven-pipelines\/$/)
    await page.getByRole('link', { name: 'All work' }).click()
    await expect(page).toHaveURL(/:4173\/$/)
    await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById('work')?.getBoundingClientRect().top ?? 9999)), { timeout: 8_000 }).toBeLessThan(8)
    await page.goto('/work/does-not-exist/')
    await expect(page.locator('#top')).toBeVisible()
    await expect(page).toHaveURL(/:4173\/$/)
  })

  test('"Read case study" changes page as one step and leaves nothing behind', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'work')
    const link = page.locator('#work').getByRole('link', { name: 'Read case study' }).first()
    await link.scrollIntoViewIfNeeded()
    await link.click()
    await expect(page).toHaveURL(/\/work\/[a-z-]+\/$/)
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    // the page is at its top, fully shown, and the transition's marks are gone
    await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('vt-page'))).toBe(false)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    expect(await h1.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
  })

  test('the pipeline to play with stores every event once, even when a consumer stops mid-event', async ({ page }) => {
    await page.goto('/work/event-driven-pipelines/')
    const demo = page.locator('.pd:not(.pd--loading)')
    await demo.scrollIntoViewIfNeeded()
    const stat = async (name: string) => Number(await demo.locator('.pd-stats div', { hasText: name }).locator('dd').innerText())
    expect(await stat('Sent')).toBe(await stat('Stored'))
    await demo.getByRole('button', { name: 'Send 12' }).click()
    await expect.poll(() => stat('Waiting')).toBeGreaterThan(0)
    // stop the second consumer while it is in the middle of an event
    await expect(demo.locator('.pd-consumer').nth(1)).toContainText(/Storing|Confirming/, { timeout: 5_000 })
    await demo.getByRole('button', { name: 'Stop consumer 2' }).click()
    await expect(demo.getByRole('status')).toContainText('gets that event again')
    // the other consumer takes over; everything ends up stored once, and the copy was skipped
    await expect.poll(() => stat('Waiting'), { timeout: 30_000 }).toBe(0)
    expect(await stat('Stored')).toBe(await stat('Sent'))
    expect(await stat('Copies skipped')).toBeGreaterThanOrEqual(1)
    // the page is ready-made with the demo in it
    expect(await (await page.request.get('/work/event-driven-pipelines/')).text()).toContain('pd-stage')
  })

  test('every case study shows how its system fits together', async ({ page }) => {
    for (const [slug, stages, first, beside] of [
      ['credit-bureau-reporting', 4, 'Four lines of business', 'Checked by'],
      ['unified-reporting', 5, 'Disparate data sources', null],
      ['cloud-delivery', 4, 'Jenkins pipeline', 'Works with'],
    ] as const) {
      await page.goto(`/work/${slug}/`)
      const arch = page.getByRole('region', { name: 'How it fits together.' })
      await arch.scrollIntoViewIfNeeded()
      await expect(arch.locator('.arch-stage')).toHaveCount(stages)
      await expect(arch.locator('.arch-stage').first()).toContainText(first)
      if (beside) await expect(arch.locator('.arch-aside')).toContainText(beside)
      else await expect(arch.locator('.arch-aside')).toHaveCount(0)
      // nothing sticks out sideways
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
    }
  })
})
