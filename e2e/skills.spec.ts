import { expect, test } from '@playwright/test'
import { isPhone, jumpTo, openHome } from './helpers'

test.describe('skills', () => {
  test('shows all 48 elements and eight family filters', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'skills')
    const skills = page.locator('#skills')
    await expect(skills.getByRole('heading', { level: 2 })).toContainText('The periodic table')
    const tiles = skills.getByRole('button', { name: /\(.*\)$/ })
    await expect(tiles).toHaveCount(48)
    await expect(skills.getByRole('group', { name: 'Light up a family' }).getByRole('button')).toHaveCount(8)
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
    await cloud.click()
    await expect(cloud).toHaveAttribute('aria-pressed', 'false')
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
})
