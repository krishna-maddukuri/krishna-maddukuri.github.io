/**
 * One listener for every `.spot` card: as the pointer moves over a card, its highlight follows
 * (two custom properties, read by the card's ::before) and the card leans a few degrees towards the
 * pointer (two more, read by `.spot:hover` in index.css). Passive, and nothing is measured on cards
 * the pointer isn't over.
 */
export function installSpotlight() {
  if (typeof window === 'undefined' || !window.matchMedia('(hover: hover)').matches) return () => {}
  const onMove = (e: PointerEvent) => {
    const card = (e.target as Element | null)?.closest<HTMLElement>('.spot')
    if (!card) return
    const r = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${e.clientX - r.left}px`)
    card.style.setProperty('--my', `${e.clientY - r.top}px`)
    // the lean: the side under the pointer comes forward, at most 4 degrees across and 3.5 up and down
    card.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width - 0.5) * 8).toFixed(2)}deg`)
    card.style.setProperty('--rx', `${((0.5 - (e.clientY - r.top) / r.height) * 7).toFixed(2)}deg`)
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  return () => window.removeEventListener('pointermove', onMove)
}
