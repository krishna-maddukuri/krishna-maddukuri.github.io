import { expect, test } from '@playwright/test'
import { isPhone, jumpTo, openHome } from './helpers'

test.describe('about', () => {
  test('shows the greeting, the summary, quick facts and the links', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'about')
    const about = page.locator('#about')
    await expect(about.getByRole('heading', { level: 2 })).toContainText(/Hi, I.m Krishna/)
    await expect(about.getByText('Quick facts')).toBeVisible()
    await expect(about.getByText('Quick facts').locator('..').getByText('Richmond, VA')).toBeVisible()
    await expect(about.getByRole('link', { name: /Download Krishna's resume/ })).toBeVisible()
    await expect(about.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/krishna-koushik')
    // the LinkedIn button carries the LinkedIn mark; the key words of the lead are in the accent colour (teal)
    await expect(about.getByRole('link', { name: 'LinkedIn' }).locator('img')).toHaveAttribute('src', /linkedin\.svg$/)
    const strong = about.locator('p strong').first()
    await expect(strong).toContainText('distributed systems')
    expect(await strong.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(13, 124, 126)')
  })

  test('the ID card flips on click and on Enter, and shows the contact details on its back', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'about', -40)
    const card = page.getByRole('button', { name: /ID card for Krishna Koushik Maddukuri/ })
    await expect(card).toBeVisible()
    await expect(card).toHaveAttribute('aria-pressed', 'false')
    await expect(card.getByText('ENGINEER ID')).toBeVisible()
    await card.click()
    await expect(card).toHaveAttribute('aria-pressed', 'true')
    await expect(card.getByText('If found, please return to')).toBeVisible()
    await expect(card.getByText('m.krishnakoushik@icloud.com')).toBeVisible()
    await card.press('Enter')
    await expect(card).toHaveAttribute('aria-pressed', 'false')
  })

  test('the card can be dragged and springs back', async ({ page }) => {
    test.skip(isPhone(page), 'on phones the card is picked up with a long press')
    await openHome(page)
    await jumpTo(page, 'about', -40)
    const card = page.getByRole('button', { name: /ID card for/ })
    const box = (await card.boundingBox())!
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx + 200, cy + 40, { steps: 12 })
    const moved = (await card.boundingBox())!
    expect(moved.x - box.x).toBeGreaterThan(80)
    await page.mouse.up()
    await expect.poll(async () => Math.abs((await card.boundingBox())!.x - box.x), { timeout: 8_000 }).toBeLessThan(6)
    await expect(card).toHaveAttribute('aria-pressed', 'false') // a drag is not a flip
  })
})
