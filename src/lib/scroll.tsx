import type Lenis from 'lenis'
import { warmSections } from './deferSections'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

const LenisContext = createContext<Lenis | null>(null)

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Phones and tablets: their own scrolling is already smooth and runs off the main thread. */
const touchFirst = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/**
 * Buttery smooth wheel scrolling (Lenis) for mouse and trackpad. Phones and tablets keep
 * native scrolling: Lenis can't improve it there, and its touch listeners would make
 * every scroll wait for the page's code. Also off for people who ask for reduced motion.
 * Its code is fetched only where it is used, after the page is up: phones never download it.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    if (prefersReducedMotion() || touchFirst()) return
    let instance: Lenis | null = null
    let frame = 0
    let gone = false
    import('lenis').then(({ default: Lenis }) => {
      if (gone) return
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
      instance = lenis
      const raf = (time: number) => {
        lenis.raf(time)
        frame = requestAnimationFrame(raf)
      }
      frame = requestAnimationFrame(raf)
      setLenis(lenis)
    })
    return () => {
      gone = true
      cancelAnimationFrame(frame)
      instance?.destroy()
      setLenis(null)
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}

export function useLenis() {
  return useContext(LenisContext)
}

/** Scroll to a section id (or 'top'). Uses Lenis when it is running. */
export function useScrollTo() {
  const lenis = useLenis()
  return useCallback(
    (id: string, opts: { immediate?: boolean; onComplete?: () => void } = {}) => {
      // every section at its real height before measuring where the target is
      warmSections()
      const target: HTMLElement | number = id === 'top' ? 0 : document.getElementById(id) ?? 0
      if (lenis) {
        // Lenis learns the page's height from a debounced resize observer; right after a page
        // change it may still clamp to the old height, so measure again first.
        lenis.resize()
        lenis.scrollTo(target, {
          offset: 0,
          duration: 1.4,
          immediate: opts.immediate,
          force: true,
          easing: (t: number) => 1 - Math.pow(1 - t, 4),
          onComplete: opts.onComplete,
        })
        return
      }
      const behavior: ScrollBehavior = opts.immediate || prefersReducedMotion() ? 'auto' : 'smooth'
      if (typeof target === 'number') window.scrollTo({ top: target, behavior })
      else target.scrollIntoView({ behavior, block: 'start' })
      // the browser's own smooth scrolling has no callback; a moment covers the distances on this page
      if (opts.onComplete) setTimeout(opts.onComplete, behavior === 'auto' ? 0 : 700)
    },
    [lenis],
  )
}
