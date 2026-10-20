import { expect, test } from '@playwright/test'
import { isPhone, jumpTo, openHome } from './helpers'

test.describe('learning, experience and achievements', () => {
  test('learning lists the doctorate, both AWS certifications and both degrees', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'learning')
    const learning = page.locator('#learning')
    await expect(learning.getByRole('heading', { level: 2 })).toContainText('Always')
    await expect(learning.getByRole('listitem')).toHaveCount(5)
    await expect(learning.getByText('DBA, Technology Management')).toBeVisible()
    await expect(learning.getByText('AWS Certified Developer')).toBeVisible()
    await expect(learning.getByText('AWS Certified Cloud Practitioner')).toBeVisible()
  })

  test('the timeline has seven milestones in order, with the current ones marked', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'experience')
    const exp = page.locator('#experience')
    await expect(exp.getByRole('heading', { level: 2 })).toContainText('Education')
    const cards = exp.locator('article')
    await expect(cards).toHaveCount(8)
    await expect(cards.first()).toContainText('Software Engineer Intern')
    await expect(cards.last()).toContainText('Full Stack Software Engineer')
    await expect(cards.last()).toContainText('Bank of America')
    await expect(exp.getByText('Current role')).toBeVisible()
    await expect(exp.getByText('In progress')).toBeVisible()
    for (const year of ['2020', '2023', '2024', '2026']) await expect(exp.getByText(year, { exact: true }).first()).toBeAttached()
  })

  test('achievements: nine cards whose numbers count up to the résumé figures', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'achievements')
    const section = page.locator('#achievements')
    await expect(section.getByRole('heading', { level: 2 })).toContainText('Proud')
    await expect(section.locator('article')).toHaveCount(9)
    const first = section.locator('article').first()
    await expect(first).toContainText('Faster batch processing')
    await expect(first.locator('.tabular').last()).toHaveText('43', { timeout: 8_000 })
    await expect(section.getByText('and counting.')).toBeAttached()
  })

  test('desktop: scrolling through the pinned section slides the cards sideways', async ({ page }) => {
    test.skip(isPhone(page))
    await openHome(page)
    await jumpTo(page, 'achievements')
    await page.waitForTimeout(400)
    const section = page.locator('#achievements')
    const track = section.locator('article').first().locator('..')
    const x0 = await track.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41)
    const height = await section.evaluate((el) => el.getBoundingClientRect().height)
    expect(height).toBeGreaterThan(1200) // taller than one screen: the pin has room to run
    await page.mouse.wheel(0, 900)
    await page.waitForTimeout(900)
    const x1 = await track.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41)
    expect(x1).toBeLessThan(x0 - 200)
    await expect(section.getByText('Keep scrolling')).toBeVisible()
  })

  test('phones: the achievements are a swipeable row', async ({ page }) => {
    test.skip(!isPhone(page))
    await openHome(page)
    await jumpTo(page, 'achievements')
    const row = page.locator('#achievements article').first().locator('..')
    const scrollable = await row.evaluate((el) => el.scrollWidth > el.clientWidth && getComputedStyle(el).overflowX === 'auto')
    expect(scrollable).toBe(true)
    await expect(page.locator('#achievements').getByText('Swipe')).toBeVisible()
  })
})
