/**
 * One listener for every `.spot` card: as the pointer moves over a card, its highlight follows
 * (two custom properties, read by the card's ::before). Passive, and nothing is measured on
 * cards the pointer isn't over.
 */
export function installSpotlight() {
  if (typeof window === 'undefined' || !window.matchMedia('(hover: hover)').matches) return () => {}
  const onMove = (e: PointerEvent) => {
    const card = (e.target as Element | null)?.closest<HTMLElement>('.spot')
    if (!card) return
    const r = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${e.clientX - r.left}px`)
    card.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  return () => window.removeEventListener('pointermove', onMove)
}
