import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { installSpotlight } from './lib/spotlight'
import { applyStoredTheme } from './lib/theme'
import './index.css'

applyStoredTheme()
installSpotlight()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
