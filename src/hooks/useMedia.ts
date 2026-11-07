import { useEffect, useState } from 'react'

export function useMedia(query: string, fallback = false) {
  const [match, setMatch] = useState(() =>
    typeof window === 'undefined' ? fallback : window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}
