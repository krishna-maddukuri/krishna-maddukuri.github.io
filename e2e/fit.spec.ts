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
})
