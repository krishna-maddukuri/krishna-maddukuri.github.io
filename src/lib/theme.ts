import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'
const KEY = 'kkm-theme'
/**
 * The site's own attribute for its theme. Not `data-theme`: a page that embeds the site may set
 * that on the root to its own theme, and that must not switch the site.
 */
const ATTR = 'data-mode'

/** The theme picked with the switch, kept for this visit only (a new visit opens in dark mode again). */
function readStoredTheme(): Theme | null {
  try {
    const v = sessionStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

const PAPER: Record<Theme, string> = { light: '#f4f3ef', dark: '#000000' }

/** The browser bar colour (phones) follows the theme picked on the site. */
function syncThemeColor(t: Theme) {
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
    m.content = PAPER[t]
  })
  nudgeStatusBar()
}

/**
 * Safari on iPhone colours its status bar from the fixed header (see .site-header in index.css), but
 * only re-reads that colour when a fixed element comes or goes, so after a switch one briefly does.
 */
function nudgeStatusBar() {
  if (!document.body) return
  const probe = document.createElement('div')
  probe.setAttribute('aria-hidden', 'true')
  probe.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none'
  document.body.appendChild(probe)
  requestAnimationFrame(() => requestAnimationFrame(() => probe.remove()))
}

/**
 * The site opens in dark mode (index.html starts that way too, so the first paint is black); light
 * mode is a choice made with the switch, kept while you browse (across the site's pages and a
 * reload) and forgotten when you come back another time. Applied before React renders.
 */
export function applyStoredTheme() {
  const t = readStoredTheme() ?? 'dark'
  document.documentElement.setAttribute(ATTR, t)
  syncThemeColor(t)
}

function currentTheme(): Theme {
  return document.documentElement.getAttribute(ATTR) === 'dark' ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(currentTheme)

  useEffect(() => {
    const sync = () => setThemeState(currentTheme())
    const mo = new MutationObserver(sync)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: [ATTR] })
    return () => mo.disconnect()
  }, [])

  /** Switch themes. Given the button's position, the new theme grows out of it as a circle (where the browser can). */
  const toggle = (origin?: { x: number; y: number }) => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark'
    const apply = () => {
      document.documentElement.setAttribute(ATTR, next)
      syncThemeColor(next)
    }
    try {
      sessionStorage.setItem(KEY, next)
    } catch {
      /* storage can be blocked; the toggle still works for this visit */
    }
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!doc.startViewTransition || reduce || !origin) {
      apply()
      return
    }
    const root = document.documentElement
    const r = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y))
    root.style.setProperty('--theme-x', `${origin.x}px`)
    root.style.setProperty('--theme-y', `${origin.y}px`)
    root.style.setProperty('--theme-r', `${r}px`)
    doc.startViewTransition(apply)
  }

  return { theme, toggle }
}
