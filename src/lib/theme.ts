import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'
const KEY = 'kkm-theme'
/**
 * The site's own attribute for its theme. Not `data-theme`: a page that embeds the site may set
 * that on the root to its own theme, and that must not switch the site.
 */
const ATTR = 'data-mode'

/** The theme last picked with the switch, kept on this device: a returning visitor gets it again. */
function readStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
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
 * The site opens in dark mode the first time (index.html starts that way too, so the first paint is
 * black); once a visitor has used the switch, their choice is kept on their device and is what they get
 * from then on, on every page and every later visit. Applied before React renders.
 */
export function applyStoredTheme() {
  const t = readStoredTheme() ?? 'dark'
  document.documentElement.setAttribute(ATTR, t)
  syncThemeColor(t)
}

/**
 * Printing (the web resume, mostly) is always on the paper theme: black on white, whatever is on screen.
 * The theme on screen comes back when the print is done.
 */
export function installPrintTheme() {
  let before: string | null = null
  window.addEventListener('beforeprint', () => {
    before = document.documentElement.getAttribute(ATTR)
    document.documentElement.setAttribute(ATTR, 'light')
  })
  window.addEventListener('afterprint', () => {
    if (before) document.documentElement.setAttribute(ATTR, before)
    before = null
  })
}

function currentTheme(): Theme {
  return document.documentElement.getAttribute(ATTR) === 'dark' ? 'dark' : 'light'
}

function watchTheme(on: () => void) {
  const mo = new MutationObserver(on)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: [ATTR] })
  return () => mo.disconnect()
}

export function useTheme() {
  // a pre-built page is built dark, as the site opens; the real theme takes over right after
  const theme = useSyncExternalStore<Theme>(watchTheme, currentTheme, () => 'dark')

  /** Switch themes. Given the button's position, the new theme grows out of it as a circle (where the browser can). */
  const toggle = (origin?: { x: number; y: number }) => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark'
    const apply = () => {
      document.documentElement.setAttribute(ATTR, next)
      syncThemeColor(next)
    }
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* storage can be blocked; the toggle still works for this visit */
    }
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } }
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
    // .vt-theme picks the circle (index.css); a page change has its own transition (.vt-page, lib/router.tsx)
    root.classList.add('vt-theme')
    doc.startViewTransition(apply).finished.finally(() => root.classList.remove('vt-theme'))
  }

  return { theme, toggle }
}
