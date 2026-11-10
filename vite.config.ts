import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Pages live at their own addresses (/resume/, /work/<slug>/), so every asset path is counted from the
// site's root. Served from a sub-path (GitHub Pages' /repo-name/)? Build with SITE_BASE=/repo-name/.
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {}

export default defineConfig({
  base: env.SITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  build: { chunkSizeWarningLimit: 800 },
})
