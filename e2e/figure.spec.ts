import { expect, test, type Page } from '@playwright/test'
import { openHome } from './helpers'

/**
 * The paint on the shards' canvas (the hero's shard layer, where the figure is drawn), sampled on a coarse
 * grid: `inside` is the paint over the figure's own box (with a margin for the breathing and the lifted
 * shards), as a share of the box, where a standing figure fills roughly half; `outside` is the paint
 * anywhere else, as a share of the canvas: none while he stands, plenty while his shards are spread out.
 * `red` counts the pixels in the brand red of the paper's back, which only a turned-over shard shows.
 */
async function paint(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#top [data-shard-layer] canvas')
    const box = document.querySelector<HTMLElement>('#top [data-paper-figure]')
    if (!canvas || !box) return { inside: -1, outside: -1, red: -1 }
    const step = 4
    const probe = document.createElement('canvas')
    probe.width = Math.ceil(canvas.width / step)
    probe.height = Math.ceil(canvas.height / step)
    const ctx = probe.getContext('2d')!
    ctx.drawImage(canvas, 0, 0, probe.width, probe.height)
    const { data } = ctx.getImageData(0, 0, probe.width, probe.height)
    const cr = canvas.getBoundingClientRect()
    const br = box.getBoundingClientRect()
    const sx = probe.width / cr.width
    const sy = probe.height / cr.height
    const m = br.width * 0.15
    const [x0, x1] = [(br.left - cr.left - m) * sx, (br.right - cr.left + m) * sx]
    const [y0, y1] = [(br.top - cr.top - m) * sy, (br.bottom - cr.top + m) * sy]
    let inside = 0
    let outside = 0
    let red = 0
    for (let y = 0; y < probe.height; y++) {
      for (let x = 0; x < probe.width; x++) {
        const i = (y * probe.width + x) * 4
        if (data[i + 3] <= 40) continue
        if (x >= x0 && x <= x1 && y >= y0 && y <= y1) inside++
        else outside++
        if (data[i + 3] > 150 && data[i] > 120 && data[i + 1] < data[i] * 0.45 && data[i + 2] < data[i] * 0.4) red++
      }
    }
    return { inside: inside / (br.width * sx * br.height * sy), outside: outside / (probe.width * probe.height), red }
  })
}

test.describe('paper figure', () => {
  test('gathers on load from all over the hero and ends up fully drawn', async ({ page }) => {
    await page.goto('/')
    const figure = page.locator('#top [data-paper-figure]')
    await expect(figure).toHaveAttribute('data-paper-figure', 'building', { timeout: 10_000 })
    await expect(figure).toHaveAttribute('data-paper-figure', 'ready', { timeout: 10_000 })
    // a standing figure fills roughly half of its box, and nothing is left lying about
    const { inside, outside, red } = await paint(page)
    expect(inside).toBeGreaterThan(0.3)
    expect(inside).toBeLessThan(0.9)
    expect(outside).toBeLessThan(0.003)
    expect(red).toBe(0)
  })

  test('is spread over the hero while it builds', async ({ page }) => {
    await page.goto('/')
    const figure = page.locator('#top [data-paper-figure]')
    await expect(figure).toHaveAttribute('data-paper-figure', 'building', { timeout: 10_000 })
    // the shards lie all over the hero, away from where he stands, before they come together
    let spread = 0
    await expect.poll(async () => (spread = (await paint(page)).outside), { timeout: 10_000 }).toBeGreaterThan(0.02)
    const caughtMidway = (await figure.getAttribute('data-paper-figure')) === 'building'
    await expect(figure).toHaveAttribute('data-paper-figure', 'ready', { timeout: 10_000 })
    await expect.poll(async () => (await paint(page)).outside, { timeout: 10_000 }).toBeLessThan(0.003)
    // (a slow software renderer can finish before we look; then there is nothing mid-way to check)
    if (caughtMidway) expect(spread).toBeGreaterThan(0.02)
  })

  test('a click scatters him and he comes back together by himself', async ({ page }) => {
    await openHome(page)
    const figure = page.locator('#top [data-paper-figure]')
    await expect(figure).toHaveAttribute('data-paper-figure', 'ready', { timeout: 10_000 })
    const button = page.getByRole('button', { name: 'Scatter the paper figure' })
    await button.click()
    await expect(figure).toHaveAttribute('data-paper-figure', 'scattered')
    await expect(page.getByRole('button', { name: 'Put the paper figure back together' })).toHaveAttribute('aria-pressed', 'true')
    // his shards fly out over the hero, and the red backs of the paper show as they turn
    await expect.poll(async () => (await paint(page)).outside, { timeout: 10_000 }).toBeGreaterThan(0.02)
    await expect.poll(async () => (await paint(page)).red, { timeout: 10_000 }).toBeGreaterThan(20)
    // he returns on his own after a moment
    await expect(figure).toHaveAttribute('data-paper-figure', 'ready', { timeout: 10_000 })
    await expect(button).toHaveAttribute('aria-pressed', 'false')
    await expect.poll(async () => (await paint(page)).outside, { timeout: 10_000 }).toBeLessThan(0.003)
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

  test('phones: the button under his feet scatters him and "Keep together" brings him back', async ({ page }) => {
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
  })

  test('wide screens: no button under his feet', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024, 'wide screens only')
    await openHome(page)
    const figure = page.locator('#top [data-paper-figure]')
    await expect(figure).toHaveAttribute('data-paper-figure', 'ready', { timeout: 10_000 })
    await expect(page.getByRole('button', { name: 'Scatter him' })).toBeHidden()
  })

  test('his shards are drawn over the giant name and under the words', async ({ page }) => {
    await openHome(page)
    const order = await page.evaluate(() => {
      const z = (el: Element | null) => (el ? Number(getComputedStyle(el).zIndex) || 0 : NaN)
      const layer = document.querySelector('#top [data-shard-layer]')
      return { name: z(document.querySelector('#top .wm-wrap')), layer: z(layer), words: z(document.querySelector('#top .hero-copy')), canvas: !!layer?.querySelector('canvas') }
    })
    expect(order.canvas).toBe(true)
    expect(order.name).toBeLessThan(order.layer)
    expect(order.layer).toBeLessThan(order.words)
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
        const canvas = document.querySelector<HTMLCanvasElement>('#top [data-shard-layer] canvas')!
        const box = document.querySelector<HTMLElement>('#top [data-paper-figure]')!
        const probe = document.createElement('canvas')
        probe.width = canvas.width
        probe.height = canvas.height
        const ctx = probe.getContext('2d')!
        ctx.drawImage(canvas, 0, 0)
        // a row through his face: a tenth of the way down his box (the canvas is the hero's, above him too)
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
        const canvas = document.querySelector<HTMLCanvasElement>('#top [data-shard-layer] canvas')!
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
    // and they lift photo side up: no red behind or under them
    expect((await paint(page)).red).toBe(0)
  })

  test('shows the still picture when motion is reduced', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const figure = page.locator('#top [data-paper-figure]')
    await expect(figure).toHaveAttribute('data-paper-figure', 'still')
    const img = figure.locator('img')
    await expect(img).toBeVisible()
    expect(await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true)
    expect(await page.locator('#top canvas').count()).toBe(0)
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
