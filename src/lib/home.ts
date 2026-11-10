/**
 * "Home" is what the name in the header does. The page scrolls back to the top and, once it is
 * there, the hero answers: a red blade crosses it (lib/homeSweep.ts) and the paper figure's shards turn
 * over in a wave, head to feet. Each of those pieces listens for this one event.
 */
const HOME_EVENT = 'kkm:home'

export const announceHome = () => window.dispatchEvent(new Event(HOME_EVENT))

/** Run `handler` every time the page comes home; returns the function that stops listening. */
export function onHome(handler: () => void) {
  window.addEventListener(HOME_EVENT, handler)
  return () => window.removeEventListener(HOME_EVENT, handler)
}
