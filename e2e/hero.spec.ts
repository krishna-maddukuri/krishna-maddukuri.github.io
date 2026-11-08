import { expect, test } from '@playwright/test'
import { expectScrolledTo, openHome } from './helpers'

test.describe('hero', () => {
  test('says hello, shows the role on its red block, the tag, the numbers and the figure', async ({ page }) => {
    await openHome(page)
    const hero = page.locator('#top')
    await expect(hero.getByRole('heading', { level: 1 })).toHaveText(/^Hello, I.m Software Engineer\.$/)
    await expect(hero.locator('.role-tag')).toHaveText('Senior Software Engineer')
    const numbers = hero.getByRole('list', { name: 'In numbers' }).getByRole('listitem')
    await expect(numbers).toHaveCount(3)
    await expect(numbers.first()).toContainText('6+')
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

  test('the spinning badge reads "open to software engineer roles" in a closed loop and jumps to Contact', async ({ page }) => {
    await openHome(page)
    const badge = page.getByRole('button', { name: /Open to Software Engineer roles. Go to contact/ })
    await expect(badge).toBeVisible()
    const text = await badge.locator('textPath').textContent()
    expect(text).toMatch(/^OPEN TO SOFTWARE ENGINEER ROLES ·\u00a0$/)
    await badge.click()
    await expectScrolledTo(page, 'contact', 6)
  })

  test('the red block never runs into the figure on wide screens', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024)
    for (const width of [1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 })
      await openHome(page)
      await page.waitForTimeout(1500)
      const gap = await page.evaluate(() => {
        // the red block itself, padding and all
        const block = document.querySelector('#top h1 .role-block')!.getBoundingClientRect()
        const figure = document.querySelector('#top [data-paper-figure]')!.getBoundingClientRect()
        return figure.left - block.right
      })
      expect(gap, `gap at ${width}px`).toBeGreaterThan(16)
    }
  })
})
