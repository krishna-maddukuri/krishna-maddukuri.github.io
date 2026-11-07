import { expect, test } from '@playwright/test'
import { expectScrolledTo, openHome } from './helpers'

test.describe('hero', () => {
  test('shows the name, the headline, the intro, the figure and the chat bubble', async ({ page }) => {
    await openHome(page)
    const hero = page.locator('#top')
    await expect(hero.getByRole('heading', { level: 1 })).toContainText('Senior Software')
    await expect(hero.getByRole('heading', { level: 1 })).toContainText('Engineer')
    await expect(hero.getByText('Krishna Koushik Maddukuri', { exact: true })).toBeVisible()
    await expect(hero.getByText("Hi, I'm Krishna.")).toBeVisible()
    // the paper figure is an image to assistive tech, whether it is the folding canvas or the still picture
    const figure = hero.getByRole('img', { name: 'Krishna Koushik Maddukuri' })
    await expect(figure).toBeVisible()
  })

  test('"Explore work" and "Let\'s talk" scroll to their sections', async ({ page }) => {
    await openHome(page)
    await page.getByRole('button', { name: 'Explore work' }).click()
    await expectScrolledTo(page, 'work', 6)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.getByRole('button', { name: /Let.s talk/ }).click()
    await expectScrolledTo(page, 'contact', 6)
  })

  test('the résumé button downloads the PDF', async ({ page }) => {
    await openHome(page)
    const link = page.locator('#top').getByRole('link', { name: /Download Krishna's resume/ })
    await expect(link).toHaveAttribute('href', /Krishna_Koushik_Maddukuri_Resume\.pdf$/)
    await expect(link).toHaveAttribute('download', 'Krishna_Koushik_Maddukuri_Resume.pdf')
    const res = await page.request.get((await link.getAttribute('href'))!)
    expect(res.ok()).toBe(true)
    expect(res.headers()['content-type']).toContain('pdf')
  })

  test('the spinning badge reads "open to roles" in a closed loop and jumps to Contact', async ({ page }) => {
    await openHome(page)
    const badge = page.getByRole('button', { name: /Open to Senior Engineer roles. Go to contact/ })
    await expect(badge).toBeVisible()
    const text = await badge.locator('textPath').textContent()
    expect(text).toMatch(/OPEN TO SENIOR ENGINEER ROLES · RICHMOND, VA · $/)
    await badge.click()
    await expectScrolledTo(page, 'contact', 6)
  })

  test('the headline never runs into the figure on wide screens', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024)
    for (const width of [1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 })
      await openHome(page)
      await page.waitForTimeout(1500)
      const gap = await page.evaluate(() => {
        // the glyphs themselves (the line's box is as wide as the column)
        const range = document.createRange()
        range.selectNodeContents(document.querySelector('#top h1 span span')!)
        const text = range.getBoundingClientRect()
        const figure = document.querySelector('#top [data-paper-figure]')!.getBoundingClientRect()
        return figure.left - text.right
      })
      expect(gap, `gap at ${width}px`).toBeGreaterThan(16)
    }
  })
})
