import { expect, test } from '@playwright/test'
import { isPhone, openHome } from './helpers'

// On wide screens each section is sized to the screen's height, so it fits on one screen. Experience
// runs over more than one (a long timeline), and Achievements pins while its cards slide past.
const ONE_SCREEN = ['top', 'about', 'skills', 'work', 'learning', 'contact']

test.describe('one screen per section', () => {
  for (const [width, height] of [
    [1440, 900],
    [1280, 720],
    [1920, 1080],
  ] as const) {
    test(`on a ${width}×${height} screen each section fits on one screen`, async ({ page }) => {
      test.skip(isPhone(page), 'on phones the sections scroll')
      await page.setViewportSize({ width, height })
      await openHome(page)
      const sizes = await page.evaluate(
        (ids) => ids.map((id) => [id, Math.round(document.getElementById(id)!.getBoundingClientRect().height)] as const),
        ONE_SCREEN,
      )
      for (const [id, h] of sizes) expect(h, `#${id} is ${h}px tall`).toBeLessThanOrEqual(height)
    })
  }

  test('on a wide but very short screen the hero keeps its words and buttons whole', async ({ page }) => {
    test.skip(isPhone(page), 'a wide-screen check')
    for (const [width, height] of [
      [1280, 600],
      [1200, 560],
      [1024, 600],
    ] as const) {
      await page.setViewportSize({ width, height })
      await openHome(page)
      const { hero, buttons } = await page.evaluate(() => ({
        hero: document.getElementById('top')!.getBoundingClientRect().bottom,
        buttons: document.querySelector('#top .hero-cta')!.getBoundingClientRect().bottom,
      }))
      expect(buttons, `${width}×${height}: the buttons end ${Math.round(buttons)}px down, the hero ${Math.round(hero)}px`).toBeLessThanOrEqual(hero - 16)
    }
  })
})
