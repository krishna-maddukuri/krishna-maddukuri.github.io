import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import { deferSections } from './lib/deferSections'
import { readPath } from './lib/router'
import { installSpotlight } from './lib/spotlight'
import { applyStoredTheme, installPrintTheme } from './lib/theme'
import './index.css'

applyStoredTheme()
installPrintTheme()
installSpotlight()
deferSections()

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)
// The built site serves each page ready-made (scripts/prerender.mjs): take that page over where it stands,
// so what is already on screen, entrances included, carries on. Anywhere else (the dev server, or an address
// with no page of its own) draw it from scratch.
if (root.dataset.prerendered === readPath()) hydrateRoot(root, app)
else {
  root.replaceChildren()
  createRoot(root).render(app)
}
