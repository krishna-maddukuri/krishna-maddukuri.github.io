import { expect, test } from '@playwright/test'
import { isPhone, jumpTo, openHome } from './helpers'

test.describe('skills', () => {
  test('shows all 52 elements and eight family filters', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'skills')
    const skills = page.locator('#skills')
    await expect(skills.getByRole('heading', { level: 2 })).toContainText('The periodic table')
    const tiles = skills.getByRole('button', { name: /\(.*\)$/ })
    await expect(tiles).toHaveCount(52)
    for (const name of ['SOAP (Backend & Frameworks)', 'Liquibase (Backend & Frameworks)', 'OpenShift (Cloud & AWS)', 'WireMock (Testing & Quality)'])
      await expect(skills.getByRole('button', { name, exact: true })).toHaveCount(1)
    await expect(skills.getByRole('group', { name: 'Light up a family' }).getByRole('button')).toHaveCount(8)
  })

  test('the tiles are square and the family selectors are chips in the mono font, as on portfolio-2', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'skills')
    const skills = page.locator('#skills')
    for (const name of ['Java (Languages)', 'WireMock (Testing & Quality)']) {
      const box = (await skills.getByRole('button', { name, exact: true }).boundingBox())!
      expect(Math.abs(box.width - box.height)).toBeLessThan(1)
    }
    const chip = skills.getByRole('group', { name: 'Light up a family' }).getByRole('button').first()
    const style = await chip.evaluate((el) => {
      const s = getComputedStyle(el)
      return { radius: s.borderTopLeftRadius, font: s.fontFamily, size: s.fontSize }
    })
    expect(style).toEqual({ radius: '6px', font: expect.stringContaining('IBM Plex Mono'), size: '12px' })
  })

  test('picking a family dims the other tiles and the inspector shows one of its elements', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'skills')
    const skills = page.locator('#skills')
    const cloud = skills.getByRole('group', { name: 'Light up a family' }).getByRole('button', { name: 'Cloud & AWS', exact: true })
    await cloud.click()
    await expect(cloud).toHaveAttribute('aria-pressed', 'true')
    const java = skills.getByRole('button', { name: 'Java (Languages)', exact: true })
    const fargate = skills.getByRole('button', { name: 'AWS Fargate (Cloud & AWS)', exact: true })
    await expect.poll(() => java.evaluate((el) => getComputedStyle(el).opacity)).toBe('0.18')
    await expect.poll(() => fargate.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
    await expect(skills.locator('[aria-live="polite"]')).toContainText('Cloud & AWS')
    // the picked family's tiles hop (and only they do); a tile of another family stays put
    expect(await fargate.evaluate((el) => getComputedStyle(el).animationName)).toMatch(/^skills-hop-/)
    expect(await java.evaluate((el) => getComputedStyle(el).animationName)).toBe('none')
    await cloud.click()
    await expect(cloud).toHaveAttribute('aria-pressed', 'false')
    expect(await fargate.evaluate((el) => getComputedStyle(el).animationName)).toBe('none')
    await expect.poll(() => java.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
  })

  test('hovering or tapping a tile explains it in the inspector', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'skills')
    const skills = page.locator('#skills')
    const inspector = skills.locator('[aria-live="polite"]')
    // Java is explained from the start
    await expect(inspector).toContainText('Java')
    await expect(inspector).toContainText('Languages')
    const kafka = skills.getByRole('button', { name: 'Spring Kafka (Backend & Frameworks)', exact: true })
    if (isPhone(page)) await kafka.tap()
    else await kafka.hover()
    await expect(inspector).toContainText('Spring Kafka')
    await expect(inspector).toContainText('Backend & Frameworks')
    await expect(kafka).toHaveAttribute('aria-pressed', 'true')
  })

  test('the inspector shows each element on a plate in its brand colour, with its logo loaded', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'skills')
    const skills = page.locator('#skills')
    const inspector = skills.locator('[aria-live="polite"]')
    const java = inspector.getByRole('img', { name: 'Java logo' })
    await expect(java).toBeVisible()
    await expect.poll(() => java.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    // the plate is tinted with the brand's colour, not the family's grey
    const plate = java.locator('..')
    expect(await plate.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgb(255, 255, 255)')
    const docker = skills.getByRole('button', { name: 'Docker (Cloud & AWS)', exact: true })
    if (isPhone(page)) await docker.tap()
    else await docker.hover()
    const logo = inspector.getByRole('img', { name: 'Docker logo' })
    await expect(logo).toBeVisible()
    await expect.poll(() => logo.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    // the picked tile is ringed in that colour (Docker blue)
    await expect.poll(() => docker.evaluate((el) => getComputedStyle(el).outlineColor)).toBe('rgb(36, 150, 237)')
  })

  test('the table is one stop for the Tab key, and the arrow keys move through it', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'skills')
    const skills = page.locator('#skills')
    const tiles = skills.locator('.skills-tile')
    const hint = skills.locator('.skills-keys')
    // only the tile last shown takes the Tab key
    expect(await tiles.evaluateAll((els) => els.filter((el) => (el as HTMLElement).tabIndex === 0).length)).toBe(1)
    await skills.getByRole('group', { name: 'Light up a family' }).getByRole('button').last().focus()
    await page.keyboard.press('Tab')
    await expect(skills.getByRole('button', { name: 'Java (Languages)', exact: true })).toBeFocused()
    // the hint is there only while a tile holds the keyboard's focus
    await expect.poll(() => hint.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
    await page.keyboard.press('ArrowRight')
    await expect(skills.getByRole('button', { name: 'Python (Languages)', exact: true })).toBeFocused()
    // down a row lands on the tile underneath, however many tiles this screen fits in a row
    const perRow = await tiles.evaluateAll((els) => els.filter((el) => (el as HTMLElement).offsetTop === (els[0] as HTMLElement).offsetTop).length)
    await page.keyboard.press('ArrowDown')
    await expect(tiles.nth(1 + perRow)).toBeFocused()
    const under = ((await tiles.nth(1 + perRow).getAttribute('aria-label')) ?? '').replace(/ \(.*\)$/, '')
    await expect(skills.locator('[aria-live="polite"]')).toContainText(under)
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowLeft')
    await expect(tiles.first()).toBeFocused()
    // at the edge it stays where it is
    await page.keyboard.press('ArrowLeft')
    await expect(tiles.first()).toBeFocused()
    await page.keyboard.press('End')
    await expect(tiles.last()).toBeFocused()
    expect(await tiles.evaluateAll((els) => els.filter((el) => (el as HTMLElement).tabIndex === 0).length)).toBe(1)
    // and one more Tab leaves the table
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => document.activeElement?.classList.contains('skills-tile'))).toBe(false)
    await expect.poll(() => hint.evaluate((el) => getComputedStyle(el).opacity)).toBe('0')
  })

  test('phones: the table comes in as one piece, its tiles already in their colours', async ({ page }) => {
    test.skip(!isPhone(page), 'a touch-screen check')
    await openHome(page)
    await jumpTo(page, 'skills')
    const table = page.locator('#skills .skills-table')
    await table.scrollIntoViewIfNeeded()
    await expect(table).toHaveClass(/is-in/)
    await expect.poll(() => table.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
    // no colour tween per tile
    expect(await table.locator('.skills-tile').first().evaluate((el) => getComputedStyle(el).transitionProperty)).not.toContain('background-color')
  })
})
