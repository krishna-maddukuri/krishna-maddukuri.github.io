/**
 * "Home" is what the name in the header does. The page scrolls back to the top and, once it is
 * there, the hero gives its welcome again: the name draws itself in, a wave runs down the paper
 * figure, and the chat bubble is sent once more. Each of those pieces listens for this one event.
 */
const HOME_EVENT = 'kkm:home'

export const announceHome = () => window.dispatchEvent(new Event(HOME_EVENT))

/** Run `handler` every time the page comes home; returns the function that stops listening. */
export function onHome(handler: () => void) {
  window.addEventListener(HOME_EVENT, handler)
  return () => window.removeEventListener(HOME_EVENT, handler)
}
