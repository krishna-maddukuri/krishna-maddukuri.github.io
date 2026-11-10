/**
 * Draws a page to HTML at build time (scripts/prerender.mjs runs this for every address), so the built site
 * serves each page ready-made and the browser has something to show before any script has run. The script
 * then takes the page over where it stands (main.tsx).
 */
import { StrictMode } from 'react'
import { prerender } from 'react-dom/static'
import App from './App'
import { projects } from './data/site'

/** Every address the site has. */
export const routes = ['/', '/resume', ...projects.map((p) => `/work/${p.slug}`)]

export async function render(path: string) {
  // waits for the parts of a page that load separately (the resume, a case study and its picture)
  const { prelude } = await prerender(
    <StrictMode>
      <App path={path} />
    </StrictMode>,
  )
  return new Response(prelude).text()
}
