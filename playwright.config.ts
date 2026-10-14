import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests run against the production build (`vite preview`), on a desktop
 * viewport and an iPhone-sized one. `npm run test:e2e` builds first.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://localhost:4173/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // the bundled Chromium, when Playwright's own download isn't available; WebGL through SwiftShader
    launchOptions: {
      executablePath: process.env.PW_CHROMIUM || undefined,
      args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'],
    },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'phone', use: { ...devices['iPhone 14'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
