import { expect, test } from '@playwright/test'
import { jumpTo, openHome } from './helpers'

test.describe('contact and footer', () => {
  test('copies the email address and confirms it', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are a Chromium feature')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await openHome(page)
    await jumpTo(page, 'contact')
    const contact = page.locator('#contact')
    await expect(contact.getByText('m.krishnakoushik@icloud.com')).toBeVisible()
    await contact.getByRole('button', { name: 'Copy email' }).click()
    await expect(contact.getByRole('button', { name: 'Copied' })).toBeVisible()
    await expect(page.getByRole('status')).toContainText('Email copied')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('m.krishnakoushik@icloud.com')
    await expect(contact.getByRole('button', { name: 'Copy email' })).toBeVisible({ timeout: 5_000 })
  })

  test('links to LinkedIn, the PDF, the web résumé and shows the location', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'contact')
    const contact = page.locator('#contact')
    await expect(contact.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', 'https://www.linkedin.com/in/krishna-koushik')
    await expect(contact.getByRole('link', { name: /Download Krishna's resume/ })).toHaveAttribute('download', /Resume\.pdf$/)
    await expect(contact.getByRole('link', { name: /Web résumé/ })).toHaveAttribute('href', '#/resume')
    await expect(contact.getByText('Richmond, VA')).toBeVisible()
    await expect(contact.getByText('Based in')).toBeVisible()
  })

  test('the footer has the year, the links and the big surname', async ({ page }) => {
    await openHome(page)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    const footer = page.locator('footer')
    await expect(footer).toContainText(`© ${new Date().getFullYear()} Krishna Koushik Maddukuri`)
    await expect(footer.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', /linkedin\.com/)
    await expect(footer.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', '#/resume')
    await expect(footer.getByText('Maddukuri', { exact: true })).toBeAttached()
  })
})

test.describe('web résumé', () => {
  test('renders the résumé, word for word from the PDF, with a download button and a way back', async ({ page }) => {
    await page.goto('/#/resume')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Krishna Koushik Maddukuri')
    await expect(page.getByText('Senior Software Engineer').first()).toBeVisible()
    for (const heading of ['Summary', 'Skills', 'Experience', 'Education', 'Certifications']) {
      await expect(page.getByText(heading, { exact: true }).first()).toBeAttached()
    }
    await expect(page.getByText('Bank of America', { exact: false }).first()).toBeVisible()
    await expect(page.getByText('Capital One', { exact: false }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Download Krishna's resume/ }).first()).toHaveAttribute('download', /Resume\.pdf$/)
    await page.getByRole('link', { name: 'Portfolio' }).click()
    await expect(page.locator('#top')).toBeVisible()
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('the phone number is not published on the web pages', async ({ page }) => {
    await page.goto('/#/resume')
    const text = await page.locator('body').innerText()
    expect(text).not.toMatch(/\(\d{3}\)\s?\d{3}-\d{4}|\+1\s?\d{3}/)
    await page.goto('/')
    const home = await page.locator('body').innerText()
    expect(home).not.toMatch(/\(\d{3}\)\s?\d{3}-\d{4}|\+1\s?\d{3}/)
  })
})
