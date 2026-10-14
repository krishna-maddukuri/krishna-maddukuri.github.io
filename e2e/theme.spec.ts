import { expect, test } from '@playwright/test'
import { openHome } from './helpers'

const themeButton = (page: import('@playwright/test').Page) => page.getByRole('button', { name: /Switch to (light|dark) theme/ }).first()

test.describe('theme', () => {
  test('opens in light mode, whatever the system prefers', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await openHome(page)
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'light')
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(bg).toBe('rgb(244, 243, 239)')
    expect(await page.locator('meta[name="theme-color"]').first().getAttribute('content')).toBe('#f4f3ef')
    await expect(themeButton(page)).toHaveAccessibleName('Switch to dark theme')
  })

  test('the switch flips to true black, holds through a reload, and updates the browser bar colour', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await openHome(page)
    await themeButton(page).click()
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark')
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(0, 0, 0)')
    expect(await page.evaluate(() => sessionStorage.getItem('kkm-theme'))).toBe('dark')
    const bar = await page.locator('meta[name="theme-color"]').first().getAttribute('content')
    expect(bar).toBe('#000000')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark')
    await themeButton(page).click()
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'light')
    expect(await page.evaluate(() => sessionStorage.getItem('kkm-theme'))).toBe('light')
  })

  test('a new visit opens in light mode even after dark was picked, and a host setting data-theme on the root changes nothing', async ({ page, context }) => {
    await openHome(page)
    await themeButton(page).click()
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark')
    // a fresh tab is a new visit: the choice is not carried over
    const fresh = await context.newPage()
    await fresh.goto('/')
    await expect(fresh.locator('html')).toHaveAttribute('data-mode', 'light')
    // some hosts stamp their own theme on the root; the site keeps its own
    await fresh.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
    expect(await fresh.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(244, 243, 239)')
    await fresh.close()
  })

  test('the ink is black in both themes, the accent is terracotta on the paper and neon on black, and the card header follows', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await openHome(page)
    // the card's header bar is painted with the variable, so read the colour it actually renders
    const header = page.getByRole('button', { name: /ID card for/ }).getByText('ENGINEER ID').locator('..').locator('..')
    const bar = () => header.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(await bar()).toBe('rgb(0, 0, 0)')
    const tail = page.locator('#about h2 em')
    const colour = () => tail.evaluate((el) => getComputedStyle(el).color)
    expect(await colour()).toBe('rgb(204, 100, 64)')
    await themeButton(page).click()
    await expect.poll(bar).toBe('rgb(0, 0, 0)')
    await expect.poll(colour).toBe('rgb(127, 255, 0)')
  })
})
