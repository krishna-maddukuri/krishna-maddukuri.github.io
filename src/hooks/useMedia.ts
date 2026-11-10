import { useCallback, useSyncExternalStore } from 'react'

/**
 * Whether a media query matches, kept up to date. While a pre-built page is being taken over it reports
 * `fallback` (what the page was built with) and switches to the real answer right after, so the two always
 * agree at the moment they must.
 */
export function useMedia(query: string, fallback = false) {
  const subscribe = useCallback(
    (on: () => void) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', on)
      return () => mq.removeEventListener('change', on)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => fallback,
  )
}

/** The visitor asks for less motion. (Motion's own hook reads the setting while drawing, which a pre-built page can't match.) */
export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)')
