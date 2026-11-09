/**
 * Lets the page open sooner: while it loads, the browser skips laying out and painting the sections that
 * are still far below the screen (`html.defer-sections .fit-section`, content-visibility in index.css).
 * Then, in idle moments, they are filled in one at a time, and once all are in the page is exactly as it
 * would have been without this: real heights, nothing clipped, jumps landing where they should.
 * `warmSections()` fills them all in at once; anything that scrolls to a section calls it first.
 *
 * Only on a fresh visit: a reload or a step back in history restores the old scroll position, which needs
 * the real heights from the start.
 */
const CLASS = 'defer-sections'
const WARM = 'is-warm'
let pending = false

export function deferSections() {
  if (typeof window === 'undefined' || !CSS.supports('content-visibility: auto')) return
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  if (nav && nav.type !== 'navigate') return
  document.documentElement.classList.add(CLASS)
  pending = true
  const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200))
  const step = () => {
    if (!pending) return
    const sections = document.querySelectorAll<HTMLElement>(`.fit-section:not(.${WARM})`)
    // not rendered yet (the page is still starting): look again in a moment
    if (!document.querySelector('.fit-section')) return void window.setTimeout(() => idle(step), 300)
    if (!sections.length) return warmSections()
    sections[0].classList.add(WARM)
    idle(step, { timeout: 500 })
  }
  idle(step, { timeout: 2500 })
}

/** Fill in every section now (before measuring where one is, or scrolling to it). */
export function warmSections() {
  if (!pending) return
  pending = false
  document.documentElement.classList.remove(CLASS)
}
