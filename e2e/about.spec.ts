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
    // the LinkedIn button carries the LinkedIn mark; the key words of the lead are in the accent colour (red)
    await expect(about.getByRole('link', { name: 'LinkedIn' }).locator('img')).toHaveAttribute('src', /linkedin\.svg$/)
    // his path sits in a panel; its key words are bright and bold, as in the hero (a new visit opens in dark mode)
    const strong = about.locator('.about-panel strong').first()
    await expect(strong).toContainText('Infosys')
    expect(await strong.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(241, 241, 243)')
    // "Hi, I'm Krishna." is one line, and so is the motto, at every width
    const lines = (el: Element) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)
    expect(await about.getByRole('heading', { level: 2 }).evaluate(lines)).toBeLessThan(1.5)
    const quote = about.locator('.about-quote')
    await expect(quote).toContainText('From the first commit to production.')
    expect(await quote.evaluate((el) => el.scrollWidth <= el.clientWidth + 1 && el.firstElementChild!.getClientRects().length === 1)).toBe(true)
  })

  test('the ID card flips on click and on Enter, and shows the contact details on its back', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'about', -40)
    const card = page.getByRole('button', { name: /ID card for Krishna Koushik Maddukuri/ })
    await expect(card).toBeVisible()
    await expect(card).toHaveAttribute('aria-pressed', 'false')
    // the front: his title, the company and his department (and no trace of the old "FinTech" card)
    const front = card.locator('[data-face="front"]')
    await expect(front.getByText('Associate', { exact: true })).toBeVisible()
    await expect(front.getByText('Bank of America')).toBeVisible()
    await expect(front.getByText('Wealth Management Technology')).toBeVisible()
    await expect(card).not.toContainText(/FinTech|Portfolio/i)
    // the face turned away is not drawn at all (so no browser can show the back's mirror image over the front)
    const back = card.locator('[data-face="back"]')
    await expect(back).toBeHidden()
    await card.click()
    await expect(card).toHaveAttribute('aria-pressed', 'true')
    await expect(card.getByText('If found, please return to')).toBeVisible()
    await expect(front).toBeHidden()
    await expect(card.getByText('m.krishnakoushik@icloud.com')).toBeVisible()
    // the back carries a QR code for his LinkedIn profile
    await expect(card.getByRole('img', { name: 'QR code for linkedin.com/in/krishna-koushik' })).toBeVisible()
    await card.press('Enter')
    await expect(card).toHaveAttribute('aria-pressed', 'false')
    await expect(front).toBeVisible()
    await expect(back).toBeHidden()
  })

  test("the lanyard's hook hangs over the card, inside About: nothing of it shows on the first screen", async ({ page }) => {
    await openHome(page)
    const place = () =>
      page.evaluate(() => {
        const about = document.getElementById('about')!.getBoundingClientRect()
        const hook = document.querySelector('#about [data-lanyard-hook]')!.getBoundingClientRect()
        const card = document.querySelector('#about [role="button"]')!.getBoundingClientRect()
        return { aboveAbout: Math.round(about.top - hook.top), offCentre: Math.round(Math.abs(hook.left + hook.width / 2 - (card.left + card.width / 2))), overCard: card.top > hook.top }
      })
    // (it is placed by the animation engine: this holds from the moment the page is up, and after a reload)
    await expect.poll(place).toMatchObject({ offCentre: 0, overCard: true })
    expect((await place()).aboveAbout).toBeLessThanOrEqual(0)
    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect.poll(place).toMatchObject({ offCentre: 0, overCard: true })
    expect((await place()).aboveAbout).toBeLessThanOrEqual(0)
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
