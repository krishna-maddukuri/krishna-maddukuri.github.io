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
    // the doctorate's dates are the resume's
    await expect(learning.getByText('Jul 2026 – Aug 2029 (expected)')).toBeVisible()
    await expect(learning.getByText('AWS Certified Developer – Associate')).toBeVisible()
    await expect(learning.getByText('AWS Certified Cloud Practitioner')).toBeVisible()
  })

  test('About and Learning write in their handwritten words too, after the words they follow', async ({ page }) => {
    await openHome(page)
    for (const id of ['about', 'learning']) {
      await jumpTo(page, id)
      const heading = page.locator(`#${id}`).getByRole('heading', { level: 2 }).first()
      const accent = heading.locator('.accent-write')
      // written in, with the pen's underline, from the one moment the heading is seen: by then the bold words are on their way in
      await expect(accent).toHaveClass(/is-written/)
      await expect(accent.locator('.accent-line')).toBeAttached()
      await expect.poll(() => heading.locator('span').first().evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
      await expect.poll(() => accent.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
    }
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
    // a year rolls into place when it comes into view and lands on its own digits; its dot pops on the line
    const year = exp.locator('.yr').first()
    await year.scrollIntoViewIfNeeded()
    await expect(year).toHaveClass(/is-rolling/)
    await expect(exp.locator('.tl-dot.is-reached').first()).toBeAttached()
    expect(await year.evaluate((el) => [...el.querySelectorAll('.yr-cell')].map((c) => c.querySelector('.yr-strip')!.lastElementChild!.textContent).join(''))).toBe('2020')
    const cell = year.locator('.yr-cell').first()
    await expect
      .poll(() => cell.evaluate((c) => Math.abs(c.querySelector('.yr-strip')!.lastElementChild!.getBoundingClientRect().top - c.getBoundingClientRect().top)), { timeout: 5_000 })
      .toBeLessThan(1)
  })

  test('achievements: ten cards whose numbers count up to the résumé figures', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'achievements')
    const section = page.locator('#achievements')
    await expect(section.getByRole('heading', { level: 2 })).toContainText('Proud')
    await expect(section.locator('article')).toHaveCount(10)
    // the scale of the work comes first: about 30 million accounts a month
    const first = section.locator('article').first()
    await expect(first).toContainText('Accounts reported a month')
    await expect(first).toContainText('About 30 million')
    await expect(first.locator('.tabular').last()).toHaveText('30', { timeout: 8_000 })
    await expect(section.locator('article').nth(1)).toContainText('Faster batch processing')
    await expect(section.getByText('and counting.')).toBeAttached()
  })

  test('desktop: scrolling through the pinned section slides the cards sideways', async ({ page }) => {
    test.skip(isPhone(page))
    await openHome(page)
    await jumpTo(page, 'achievements')
    await page.waitForTimeout(400)
    const section = page.locator('#achievements')
    const track = section.locator('.ach-track')
    const x0 = await track.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41)
    const height = await section.evaluate((el) => el.getBoundingClientRect().height)
    expect(height).toBeGreaterThan(1200) // taller than one screen: the pin has room to run
    await page.mouse.wheel(0, 900)
    await page.waitForTimeout(900)
    const x1 = await track.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41)
    expect(x1).toBeLessThan(x0 - 200)
    await expect(section.getByText('Keep scrolling')).toBeVisible()
  })

  test('the timeline\'s red line fills as the list scrolls past, on the browser\'s own scroll timeline', async ({ page }) => {
    await openHome(page)
    const fill = page.locator('#experience .tl-fill')
    const scaleY = () => fill.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).d)
    // empty while the list is still below the screen, full once it has gone by
    expect(await scaleY()).toBeLessThan(0.01)
    expect(await fill.evaluate((el) => getComputedStyle(el).animationName)).toBe('tl-fill')
    await page.evaluate(() => {
      const list = document.querySelector('#experience .tl-scroll')!.getBoundingClientRect()
      window.scrollTo(0, list.bottom + window.scrollY)
    })
    await expect.poll(scaleY).toBeGreaterThan(0.99)
    // and nothing writes its size from script
    expect(await fill.evaluate((el) => (el as HTMLElement).style.transform)).toBe('')
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

  test('desktop: the experience and proud-moment cards lean towards the pointer and straighten when it leaves', async ({ page }) => {
    test.skip(isPhone(page), 'there is no pointer to lean towards on a phone')
    await openHome(page)
    for (const id of ['experience', 'achievements']) {
      await jumpTo(page, id)
      const card = page.locator(`#${id} .spot`).first()
      await card.scrollIntoViewIfNeeded()
      const box = (await card.boundingBox())!
      await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.2)
      await page.mouse.move(box.x + box.width * 0.86, box.y + box.height * 0.2)
      // leaning: a 3D transform, with the pointer's side turned towards the viewer
      await expect.poll(() => card.evaluate((el) => getComputedStyle(el).transform)).toMatch(/^matrix3d/)
      expect(await card.evaluate((el) => parseFloat(el.style.getPropertyValue('--ry')))).toBeGreaterThan(1)
      await page.mouse.move(2, 2)
      await expect.poll(() => card.evaluate((el) => getComputedStyle(el).transform)).not.toMatch(/^matrix3d/)
    }
  })

  test('desktop: the proud-moments row leans while the page scrolls and stands straight when it stops', async ({ page }) => {
    test.skip(isPhone(page), 'phones swipe the row sideways; nothing leans')
    await openHome(page)
    await jumpTo(page, 'achievements')
    const row = page.locator('#achievements .ach-lean')
    await page.mouse.move(600, 400)
    const seen: string[] = []
    for (let n = 0; n < 14; n++) {
      await page.mouse.wheel(0, 90)
      await page.waitForTimeout(16)
      seen.push(await row.evaluate((el) => el.style.getPropertyValue('--lean')))
    }
    expect(seen.some((v) => Math.abs(parseFloat(v)) > 0.2)).toBe(true)
    await expect.poll(() => row.evaluate((el) => el.style.getPropertyValue('--lean')), { timeout: 5_000 }).toBe('')
  })
})
