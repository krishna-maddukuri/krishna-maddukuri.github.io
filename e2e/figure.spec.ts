import { expect, test, type Page } from '@playwright/test'
import { openHome } from './helpers'

/**
 * How much paint there is on the figure's canvas, as a share of the figure's own box (0..1), sampled on
 * a coarse grid. The canvas is padded around him (more on wide screens, for the scatter), so the box is
 * the stable yardstick: a standing figure fills roughly half of it.
 */
async function coverage(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#top [data-paper-figure] canvas')
    const box = document.querySelector<HTMLElement>('#top [data-paper-figure]')
    if (!canvas || !box) return -1
    const probe = document.createElement('canvas')
    const step = 8
    probe.width = Math.ceil(canvas.width / step)
    probe.height = Math.ceil(canvas.height / step)
    const ctx = probe.getContext('2d')!
    ctx.drawImage(canvas, 0, 0, probe.width, probe.height)
    const { data } = ctx.getImageData(0, 0, probe.width, probe.height)
    let painted = 0
    for (let i = 3; i < data.length; i += 4) if (data[i] > 40) painted++
    const scale = canvas.width / canvas.getBoundingClientRect().width
    const r = box.getBoundingClientRect()
    return painted / ((r.width * scale * r.height * scale) / (step * step))
  })
}

test.describe('paper figure', () => {
  test('glides together on load and ends up fully drawn', async ({ page }) => {
    await page.goto('/')
    const figure = page.locator('#top [data-paper-figure]')
    await expect(figure).toHaveAttribute('data-paper-figure', 'building', { timeout: 10_000 })
    await expect(figure).toHaveAttribute('data-paper-figure', 'ready', { timeout: 10_000 })
    // a standing figure fills roughly half of its box
    const painted = await coverage(page)
    expect(painted).toBeGreaterThan(0.3)
    expect(painted).toBeLessThan(0.9)
  })

  test('is in pieces while it builds', async ({ page }) => {
    await page.goto('/')
    const figure = page.locator('#top [data-paper-figure]')
    await expect(figure).toHaveAttribute('data-paper-figure', 'building', { timeout: 10_000 })
    // the first facets land: some paint, while the state is still "building"
    let mid = 0
    await expect.poll(async () => (mid = await coverage(page)), { timeout: 10_000 }).toBeGreaterThan(0.01)
    const caughtMidway = (await figure.getAttribute('data-paper-figure')) === 'building'
    await expect(figure).toHaveAttribute('data-paper-figure', 'ready', { timeout: 10_000 })
    const done = await coverage(page)
    expect(done).toBeGreaterThan(0.3)
    // (a slow software renderer can finish before we look; then there is nothing mid-way to compare)
    if (caughtMidway) expect(mid).toBeLessThan(done)
  })

  test('a click scatters him and he comes back together by himself', async ({ page }) => {
    await openHome(page)
    const figure = page.locator('#top [data-paper-figure]')
    await expect(figure).toHaveAttribute('data-paper-figure', 'ready', { timeout: 10_000 })
    const button = page.getByRole('button', { name: 'Scatter the paper figure' })
    await button.click()
    await expect(figure).toHaveAttribute('data-paper-figure', 'scattered')
    await expect(page.getByRole('button', { name: 'Put the paper figure back together' })).toHaveAttribute('aria-pressed', 'true')
    // he returns on his own after a moment
    await expect(figure).toHaveAttribute('data-paper-figure', 'ready', { timeout: 10_000 })
    await expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  test('a second click brings him back straight away', async ({ page }) => {
    await openHome(page)
    const figure = page.locator('#top [data-paper-figure]')
    await expect(figure).toHaveAttribute('data-paper-figure', 'ready', { timeout: 10_000 })
    await page.getByRole('button', { name: 'Scatter the paper figure' }).click()
    await expect(figure).toHaveAttribute('data-paper-figure', 'scattered')
    await page.getByRole('button', { name: 'Put the paper figure back together' }).click()
    await expect(figure).toHaveAttribute('data-paper-figure', 'ready')
  })

  test('phones: the button under his feet scatters him, "Keep together" brings him back, and he is cut coarser', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) >= 1024, 'phones and tablets only')
    await openHome(page)
    const figure = page.locator('#top [data-paper-figure]')
    await expect(figure).toHaveAttribute('data-paper-figure', 'ready', { timeout: 10_000 })
    const pill = page.getByRole('button', { name: 'Scatter him' })
    await expect(pill).toBeVisible()
    await pill.tap()
    await expect(figure).toHaveAttribute('data-paper-figure', 'scattered')
    const back = page.getByRole('button', { name: 'Keep together' })
    await expect(back).toHaveAttribute('aria-pressed', 'true')
    await back.tap()
    await expect(figure).toHaveAttribute('data-paper-figure', 'ready')
    await expect(pill).toBeVisible()
    // the coarse mesh (a few dozen big pieces) was loaded, not the fine one
    const meshes = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => r.name).filter((n) => n.includes('krishna-origami') && n.endsWith('.json')))
    expect(meshes.some((n) => n.endsWith('krishna-origami-lite.json'))).toBe(true)
    expect(meshes.some((n) => n.endsWith('/krishna-origami.json'))).toBe(false)
  })

  test('wide screens: no button under his feet, and the fine cut', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024, 'wide screens only')
    await openHome(page)
    const figure = page.locator('#top [data-paper-figure]')
    await expect(figure).toHaveAttribute('data-paper-figure', 'ready', { timeout: 10_000 })
    await expect(page.getByRole('button', { name: 'Scatter him' })).toBeHidden()
    const meshes = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => r.name).filter((n) => n.includes('krishna-origami') && n.endsWith('.json')))
    expect(meshes.some((n) => n.endsWith('/krishna-origami.json'))).toBe(true)
    expect(meshes.some((n) => n.endsWith('krishna-origami-lite.json'))).toBe(false)
  })

  test('does not turn or move with a pointer that is not over him', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024, 'needs a mouse')
    await openHome(page)
    const figure = page.locator('#top [data-paper-figure]')
    await expect(figure).toHaveAttribute('data-paper-figure', 'ready', { timeout: 10_000 })
    const box = (await figure.boundingBox())!
    // where his head is drawn, with the pointer far to his left and then far to his right
    const headProfile = async () =>
      page.evaluate(() => {
        const canvas = document.querySelector<HTMLCanvasElement>('#top [data-paper-figure] canvas')!
        const box = document.querySelector<HTMLElement>('#top [data-paper-figure]')!
        const probe = document.createElement('canvas')
        probe.width = canvas.width
        probe.height = canvas.height
        const ctx = probe.getContext('2d')!
        ctx.drawImage(canvas, 0, 0)
        // a row through his face: a tenth of the way down his box (the canvas is padded above him)
        const scale = canvas.width / canvas.getBoundingClientRect().width
        const y = Math.round((box.getBoundingClientRect().top - canvas.getBoundingClientRect().top + box.getBoundingClientRect().height * 0.1) * scale)
        const row = ctx.getImageData(0, y, canvas.width, 1).data
        let sum = 0
        let n = 0
        for (let x = 0; x < canvas.width; x++) {
          if (row[x * 4 + 3] > 40) {
            sum += x
            n++
          }
        }
        return n ? sum / n : -1
      })
    await page.mouse.move(box.x - box.width * 2.5, box.y + box.height * 0.1, { steps: 10 })
    await page.waitForTimeout(900)
    const left = await headProfile()
    await page.mouse.move(box.x + box.width * 3.5, box.y + box.height * 0.1, { steps: 10 })
    await page.waitForTimeout(900)
    const right = await headProfile()
    expect(left).toBeGreaterThan(0)
    expect(right).toBeGreaterThan(0)
    expect(Math.abs(right - left)).toBeLessThan(3) // breathing moves it a pixel or two; a turn would move it by tens
  })

  test('the shards under the pointer move aside', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024, 'needs a mouse')
    await openHome(page)
    const figure = page.locator('#top [data-paper-figure]')
    await expect(figure).toHaveAttribute('data-paper-figure', 'ready', { timeout: 10_000 })
    const box = (await figure.boundingBox())!
    const snapshot = async () =>
      page.evaluate(() => {
        const canvas = document.querySelector<HTMLCanvasElement>('#top [data-paper-figure] canvas')!
        const probe = document.createElement('canvas')
        probe.width = Math.ceil(canvas.width / 4)
        probe.height = Math.ceil(canvas.height / 4)
        const ctx = probe.getContext('2d')!
        ctx.drawImage(canvas, 0, 0, probe.width, probe.height)
        return Array.from(ctx.getImageData(0, 0, probe.width, probe.height).data)
      })
    await page.mouse.move(box.x - box.width * 2.5, box.y + box.height * 0.3, { steps: 6 })
    await page.waitForTimeout(800)
    const before = await snapshot()
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.3, { steps: 10 })
    await page.waitForTimeout(800)
    const after = await snapshot()
    let changed = 0
    for (let i = 3; i < before.length; i += 4) if (Math.abs(before[i] - after[i]) > 60) changed++
    // some pixels along the lifted shards' edges change, but the figure as a whole stays
    expect(changed).toBeGreaterThan(5)
    expect(changed).toBeLessThan(before.length / 4 / 20)
  })

  test('shows the still picture when motion is reduced', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const figure = page.locator('#top [data-paper-figure]')
    await expect(figure).toHaveAttribute('data-paper-figure', 'still')
    const img = figure.locator('img')
    await expect(img).toBeVisible()
    expect(await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true)
    expect(await figure.locator('canvas').count()).toBe(0)
  })

  test('falls back to the still picture without WebGL', async ({ page }) => {
    await page.addInitScript(() => {
      const real = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (type === 'webgl2' || type === 'webgl') return null
        return (real as (this: HTMLCanvasElement, t: string, ...r: unknown[]) => unknown).call(this, type, ...rest)
      } as typeof real
    })
    await page.goto('/')
    const figure = page.locator('#top [data-paper-figure]')
    await expect(figure).toHaveAttribute('data-paper-figure', 'still', { timeout: 10_000 })
    await expect(figure.locator('img')).toBeVisible()
  })
})
