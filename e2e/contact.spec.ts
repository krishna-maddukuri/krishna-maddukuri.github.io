import { expect, test } from '@playwright/test'
import { isPhone, jumpTo, openHome, upTo } from './helpers'

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
    await expect(contact.locator('.copy-stamp')).toBeVisible()
    await expect(page.getByRole('status')).toContainText('Email copied')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('m.krishnakoushik@icloud.com')
    await expect(contact.getByRole('button', { name: 'Copy email' })).toBeVisible({ timeout: upTo(5_000) })
  })

  test('links to LinkedIn, the PDF, the web résumé and shows the location', async ({ page }) => {
    await openHome(page)
    await jumpTo(page, 'contact')
    const contact = page.locator('#contact')
    await expect(contact.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', 'https://www.linkedin.com/in/krishna-koushik')
    await expect(contact.getByRole('link', { name: /Download Krishna's resume/ })).toHaveAttribute('download', /Resume\.pdf$/)
    await expect(contact.getByRole('link', { name: /Web resume/ })).toHaveAttribute('href', '/resume/')
    await expect(contact.getByText('Richmond, VA')).toBeVisible()
    await expect(contact.getByText('Based in')).toBeVisible()
    // "Resume" with no accents, as on the keys; the email in the label font (IBM Plex Mono), as on portfolio-2
    await expect(contact).not.toContainText(/résumé/i)
    expect(await contact.getByText('m.krishnakoushik@icloud.com').evaluate((el) => getComputedStyle(el).fontFamily)).toContain('IBM Plex Mono')
  })

  test('the footer has the year, the links and the big surname', async ({ page }) => {
    await openHome(page)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    const footer = page.locator('footer')
    await expect(footer).toContainText(`© ${new Date().getFullYear()} Krishna Koushik Maddukuri`)
    await expect(footer.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', /linkedin\.com/)
    await expect(footer.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', '/resume/')
    // the giant surname, one letter per span (the letters join up as the word)
    await expect(footer.locator('.wm-word')).toHaveText('MADDUKURI')
  })
})

test.describe('web résumé', () => {
  test('renders the résumé, word for word from the PDF, with a download button and a way back', async ({ page }) => {
    await page.goto('/resume/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Krishna Koushik Maddukuri')
    await expect(page.getByText('Senior Software Engineer').first()).toBeVisible()
    for (const heading of ['Summary', 'Skills', 'Experience', 'Education', 'Certifications']) {
      await expect(page.getByText(heading, { exact: true }).first()).toBeAttached()
    }
    await expect(page.getByText('Bank of America', { exact: false }).first()).toBeVisible()
    await expect(page.getByText('Capital One', { exact: false }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Download Krishna's resume/ }).first()).toHaveAttribute('download', /Resume\.pdf$/)
    // in the site's UI: numbered labels in the label font, the details as cells, the current role's dot in red
    const summary = page.getByRole('heading', { level: 2, name: /Summary/ })
    await expect(summary).toContainText('01')
    expect(await summary.evaluate((el) => getComputedStyle(el).fontFamily)).toContain('IBM Plex Mono')
    await expect(page.locator('.resume-cells').first()).toContainText('Richmond, VA')
    await expect(page.locator('.resume-dot.is-current')).toHaveCount(1)
    await page.getByRole('link', { name: 'Portfolio' }).click()
    await expect(page.locator('#top')).toBeVisible()
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('the phone number is not published on the web pages', async ({ page }) => {
    await page.goto('/resume/')
    const text = await page.locator('body').innerText()
    expect(text).not.toMatch(/\(\d{3}\)\s?\d{3}-\d{4}|\+1\s?\d{3}/)
    await page.goto('/')
    const home = await page.locator('body').innerText()
    expect(home).not.toMatch(/\(\d{3}\)\s?\d{3}-\d{4}|\+1\s?\d{3}/)
  })

test('phones: the footer\'s small links are finger-sized', async ({ page }) => {
  test.skip(!isPhone(page), 'a touch-screen check')
  await openHome(page)
  const heights = await page.evaluate(() => [...document.querySelectorAll('footer .tap-target')].map((el) => Math.round(el.getBoundingClientRect().height)))
  expect(heights).toHaveLength(3)
  for (const h of heights) expect(h).toBeGreaterThanOrEqual(44)
})

  test('the footer says how this visit\'s page loaded, and the page calls nobody else', async ({ page }) => {
    const outside: string[] = []
    page.on('request', (r) => {
      if (!r.url().startsWith('http://localhost:4173/') && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) outside.push(r.url())
    })
    await openHome(page)
    await expect(page.locator('footer .load-line')).toHaveText(/(First paint \d+\.\d+s · )?Loaded in \d+\.\d+s · (\d+ KB sent|From your browser’s cache)/, { timeout: upTo(10_000) })
    // on a narrow screen the line breaks between its measures, never inside one ("596 / KB sent")
    expect(await page.locator('footer .load-line span span').evaluateAll((els) => els.filter((el) => new Set([...el.getClientRects()].map((r) => Math.round(r.top))).size > 1).length)).toBe(0)
    // there is no visit counter, and nothing else is fetched from outside
    expect(outside).toEqual([])
  })
})
