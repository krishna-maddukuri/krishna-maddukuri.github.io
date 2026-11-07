import { expect, test } from '@playwright/test'
import { expectScrolledTo, isPhone, jumpTo, openHome } from './helpers'

test.describe('navigation', () => {
  test('the section pills scroll to each section and mark the one in view', async ({ page }) => {
    test.skip(isPhone(page), 'the pill bar is a desktop control')
    await openHome(page)
    const nav = page.getByRole('navigation', { name: 'Sections' })
    for (const [label, id] of [
      ['Skills', 'skills'],
      ['Work', 'work'],
      ['Contact', 'contact'],
      ['About', 'about'],
    ] as const) {
      await nav.getByRole('button', { name: label, exact: true }).click()
      await expectScrolledTo(page, id)
      await expect(nav.getByRole('button', { name: label, exact: true })).toHaveAttribute('aria-current', 'true')
    }
  })

  test('the monogram and the footer link go back to the top', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'contact')
    await page.getByRole('button', { name: /back to top/i }).last().click()
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 8_000 }).toBeLessThan(2)
    await jumpTo(page, 'skills')
    await page.getByRole('button', { name: /Krishna Maddukuri, back to top/ }).click()
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 8_000 }).toBeLessThan(2)
  })

  test('phones: the menu opens, lists the sections, navigates, and closes with Escape or the scrim', async ({ page }) => {
    test.skip(!isPhone(page), 'the sheet menu is a phone control')
    await openHome(page)
    const menuButton = page.getByRole('button', { name: /^Menu/ })
    await menuButton.click()
    const menu = page.getByRole('dialog', { name: 'Menu' })
    await expect(menu).toBeVisible()
    await expect(menu.getByRole('button', { name: 'Skills' })).toBeVisible()
    await expect(menu.getByText('m.krishnakoushik@icloud.com')).toBeVisible()
    await expect(menu.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', /linkedin\.com/)

    await menu.getByRole('button', { name: 'Work' }).click()
    await expect(menu).toBeHidden()
    await expectScrolledTo(page, 'work', 6)
    await expect(page.getByRole('button', { name: /^Menu \(Work\)/ })).toBeVisible()

    await page.getByRole('button', { name: /^Menu/ }).click()
    await expect(menu).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()

    await page.getByRole('button', { name: /^Menu/ }).click()
    await expect(menu).toBeVisible()
    const { height } = page.viewportSize()!
    await page.mouse.click(6, height - 6) // the scrim, below the sheet
    await expect(menu).toBeHidden()
  })

  test('the skip link moves focus to the main content', async ({ page }) => {
    await openHome(page)
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
    await skip.press('Enter')
    await expect(page.locator('main#main')).toBeFocused()
    expect(page.url()).not.toContain('#main')
  })
})
