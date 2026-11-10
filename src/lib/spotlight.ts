/**
 * One listener for every `.spot` card: as the pointer moves over a card, its highlight follows
 * (two custom properties, read by the card's ::before) and the card leans a few degrees towards the
 * pointer (two more, read by `.spot.is-leaning:hover` in index.css). Passive, and nothing is measured on
 * cards the pointer isn't over.
 *
 * A card leans only while the pointer itself is moving over it. When the page scrolls, cards slide under
 * a pointer that is standing still (the proud-moments row does this for a whole screen), and each one
 * would otherwise snap to a lean left over from the last time it was pointed at; so a scroll stands the
 * card up again, and it leans afresh the next time the pointer moves.
 */
export function installSpotlight() {
  if (typeof window === 'undefined' || !window.matchMedia('(hover: hover)').matches) return () => {}
  let leaning: HTMLElement | null = null
  const stand = () => {
    leaning?.classList.remove('is-leaning')
    leaning = null
  }
  const onMove = (e: PointerEvent) => {
    const card = (e.target as Element | null)?.closest<HTMLElement>('.spot') ?? null
    if (card !== leaning) {
      stand()
      card?.classList.add('is-leaning')
      leaning = card
    }
    if (!card) return
    const r = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${e.clientX - r.left}px`)
    card.style.setProperty('--my', `${e.clientY - r.top}px`)
    // the lean: the side under the pointer comes forward, at most 4 degrees across and 3.5 up and down
    card.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width - 0.5) * 8).toFixed(2)}deg`)
    card.style.setProperty('--rx', `${((0.5 - (e.clientY - r.top) / r.height) * 7).toFixed(2)}deg`)
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('scroll', stand, { passive: true })
  return () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('scroll', stand)
    stand()
  }
}
