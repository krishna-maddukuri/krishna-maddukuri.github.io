import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' keeps every asset path relative, so the built site works on
// Vercel, Netlify, GitHub Pages (including /repo-name/ sub-paths) or any static host.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: { chunkSizeWarningLimit: 800 },
})
