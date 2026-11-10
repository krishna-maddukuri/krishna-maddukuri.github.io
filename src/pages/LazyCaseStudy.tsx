import { lazy, useState } from 'react'
import { preloadProjectVisual } from '../visuals/LazyProjectVisual'

const Page = lazy(() => import('./CaseStudy').then((m) => ({ default: m.CaseStudy })))

let ready: typeof import('./CaseStudy') | undefined
/**
 * The case study page's code and its drawing's, fetched ahead of an animated change of page (Work's "Read
 * case study"), so the page can be drawn in one step for the browser to animate to.
 */
export const preloadCaseStudy = () => Promise.all([import('./CaseStudy').then((m) => (ready = m)), preloadProjectVisual()])

/** A case study, in its own chunk: drawn at once after `preloadCaseStudy`, else when its code arrives. */
export function CaseStudy() {
  // decided once, so the page is never swapped for another copy of itself
  const [Direct] = useState(() => ready?.CaseStudy)
  return Direct ? <Direct /> : <Page />
}
