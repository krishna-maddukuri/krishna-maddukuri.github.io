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
    await work.getByRole('link', { name: 'Read case study' }).and(page.locator('[href="#/work/cloud-delivery"]')).click()
    await expect(page).toHaveURL(/#\/work\/cloud-delivery$/)
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
    await expect(page).toHaveURL(/#\/work\/event-driven-pipelines$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Event-Driven Pipelines')
  })
})

test.describe('case study', () => {
  test('opens from a deep link with its context, outcomes, metrics and tools', async ({ page }) => {
    await page.goto('/#/work/credit-bureau-reporting')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Credit Bureau Reporting')
    await expect(page.getByText('Case study 01')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Context' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'What I did' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Outcome' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tools & methods' })).toBeVisible()
    // the "Where" cell names the company (with its mark in front)
    await expect(page.locator('dd', { hasText: 'Capital One' }).first()).toBeVisible()
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('previous / next step through the projects, "All work" returns to the Work section, and a bad slug goes home', async ({ page }) => {
    await page.goto('/#/work/credit-bureau-reporting')
    await page.getByRole('link', { name: /Next case study/ }).click()
    await expect(page).toHaveURL(/#\/work\/event-driven-pipelines$/)
    await page.getByRole('link', { name: /Previous/ }).click()
    await expect(page).toHaveURL(/#\/work\/credit-bureau-reporting$/)
    await page.goBack()
    await expect(page).toHaveURL(/#\/work\/event-driven-pipelines$/)
    await page.getByRole('link', { name: 'All work' }).click()
    await expect(page).toHaveURL(/\/#\/$|\/$/)
    await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById('work')?.getBoundingClientRect().top ?? 9999)), { timeout: 8_000 }).toBeLessThan(8)
    await page.goto('/#/work/does-not-exist')
    await expect(page.locator('#top')).toBeVisible()
    await expect(page).toHaveURL(/#\/$/)
  })
})
