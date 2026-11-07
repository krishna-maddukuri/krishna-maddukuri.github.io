import { expect, type Page } from '@playwright/test'

/** Open the home page and wait until the fonts and the first animations have settled. */
export async function openHome(page: Page, path = '/') {
  await page.goto(path)
  await page.evaluate(() => document.fonts.ready)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  // the hero's entrance is over once the badge has faded in
  const badge = page.getByRole('button', { name: /Go to contact/ })
  await expect.poll(() => badge.evaluate((el) => getComputedStyle(el).opacity), { timeout: 8_000 }).toBe('1')
}

/** Scroll through the whole page so every "reveal on view" block has revealed, then go back to the top. */
export async function revealAll(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < height; y += 450) {
    await page.evaluate((v) => window.scrollTo(0, v), y)
    await page.waitForTimeout(60)
  }
  // anything the quick pass skipped (a busy machine can miss an intersection): bring the first thing
  // still faint into view, and keep doing that until nothing is faint any more
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          // (the hero is left out: its text fades with the scroll position, by design)
          const faint = [...document.querySelectorAll<HTMLElement>('[style*="opacity"]')].filter(
            (el) =>
              parseFloat(getComputedStyle(el).opacity) < 0.99 &&
              !el.closest('[aria-hidden="true"]') &&
              !el.closest('#top') &&
              el.getBoundingClientRect().height > 0,
          )
          faint[0]?.scrollIntoView({ block: 'center' })
          return faint.length
        }),
      { timeout: 40_000, intervals: [250] },
    )
    .toBe(0)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(900)
  await settled(page)
}

/**
 * Wait until every finite, time-driven animation on the page has run its course
 * (the spinners and the live dot loop forever; the header's settle is driven by scrolling, not time).
 */
export async function settled(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            document
              .getAnimations()
              .filter((a) => a.playState === 'running' && a.timeline === document.timeline && a.effect?.getTiming().iterations !== Infinity).length,
        ),
      { timeout: 10_000 },
    )
    .toBe(0)
}

/** The first [section] element's distance from the top of the viewport. */
export function topOf(page: Page, id: string) {
  return page.evaluate((i) => document.getElementById(i)!.getBoundingClientRect().top, id)
}

/** Wait until a section has scrolled to (about) the top of the viewport. Smooth scrolling takes ~1.4s. */
export async function expectScrolledTo(page: Page, id: string, tolerance = 4) {
  await expect.poll(() => topOf(page, id), { timeout: 8_000 }).toBeLessThanOrEqual(tolerance)
  await expect.poll(() => topOf(page, id), { timeout: 8_000 }).toBeGreaterThanOrEqual(-tolerance - 1)
}

/** Scroll a section into view directly (no animation), for tests that are about the section itself. */
export async function jumpTo(page: Page, id: string, offset = 0) {
  await page.evaluate(
    ({ i, o }) => {
      const el = document.getElementById(i)!
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + o)
    },
    { i: id, o: offset },
  )
}

export const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1440) < 1024
