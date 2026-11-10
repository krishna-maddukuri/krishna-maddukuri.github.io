import { expect, test } from '@playwright/test'
import { openHome } from './helpers'

const themeButton = (page: import('@playwright/test').Page) => page.getByRole('button', { name: /Switch to (light|dark) theme/ }).first()

test.describe('theme', () => {
  test('opens in dark mode (true black), whatever the system prefers', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await openHome(page)
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark')
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(bg).toBe('rgb(0, 0, 0)')
    expect(await page.locator('meta[name="theme-color"]').first().getAttribute('content')).toBe('#000000')
    await expect(themeButton(page)).toHaveAccessibleName('Switch to light theme')
  })

  test('the switch flips to the paper, holds through a reload, and updates the browser bar colour', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await openHome(page)
    await themeButton(page).click()
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'light')
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(244, 243, 239)')
    expect(await page.evaluate(() => localStorage.getItem('kkm-theme'))).toBe('light')
    const bar = await page.locator('meta[name="theme-color"]').first().getAttribute('content')
    expect(bar).toBe('#f4f3ef')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'light')
    await themeButton(page).click()
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark')
    expect(await page.evaluate(() => localStorage.getItem('kkm-theme'))).toBe('dark')
  })

  test('a first visit opens in dark mode, a later visit keeps the theme last picked, and a host setting data-theme on the root changes nothing', async ({ page, context }) => {
    await openHome(page)
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark')
    await themeButton(page).click()
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'light')
    // a fresh tab is a new visit: the choice comes with it, from the first paint
    const fresh = await context.newPage()
    await fresh.goto('/')
    await expect(fresh.locator('html')).toHaveAttribute('data-mode', 'light')
    // some hosts stamp their own theme on the root; the site keeps its own
    await fresh.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
    expect(await fresh.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(244, 243, 239)')
    await fresh.close()
  })

  test('the accent is the monogram red in both themes, and the ID card turns over with the theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await openHome(page)
    // the card is painted with variables, so read the colours it actually renders
    const card = page.getByRole('button', { name: /ID card for/ })
    const paint = (selector: string) => () => card.locator(selector).evaluate((el) => getComputedStyle(el).backgroundColor)
    const bar = paint('[data-part="title-bar"]')
    const front = paint('[data-face="front"]')
    const back = paint('[data-face="back"]')
    const shadow = () => card.locator('[data-face="front"]').evaluate((el) => getComputedStyle(el).boxShadow)
    const tail = page.locator('#about h2 em')
    const colour = () => tail.evaluate((el) => getComputedStyle(el).color)
    // in the dark: a black card with a paper back, under the red title bar, and no shadow (it would glow on OLED)
    expect(await bar()).toBe('rgb(240, 65, 46)')
    expect(await front()).toBe('rgb(0, 0, 0)')
    expect(await back()).toBe('rgb(244, 243, 239)')
    expect(await shadow()).toBe('none')
    expect(await colour()).toBe('rgb(240, 65, 46)')
    // on the paper: a white card with a black back and a soft shadow; the title bar stays red
    await themeButton(page).click()
    await expect.poll(front).toBe('rgb(255, 255, 255)')
    await expect.poll(back).toBe('rgb(0, 0, 0)')
    await expect.poll(shadow).not.toBe('none')
    await expect.poll(bar).toBe('rgb(240, 65, 46)')
    await expect.poll(colour).toBe('rgb(240, 65, 46)')
  })
})
