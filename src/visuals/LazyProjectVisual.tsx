import { lazy, Suspense, useState, type ComponentProps } from 'react'

const Visual = lazy(() => import('./ProjectVisual').then((m) => ({ default: m.ProjectVisual })))

let ready: typeof import('./ProjectVisual') | undefined
/** Fetch the drawings' code ahead of time (before an animated change of page, so they are there at once). */
export const preloadProjectVisual = () => import('./ProjectVisual').then((m) => (ready = m))

/**
 * The project drawings in their own chunk: the home page is lighter and they load when a project opens.
 * After `preloadProjectVisual`, a drawing is put on the page directly, with no moment of waiting. (Only
 * then: a pre-built page is always taken over the waiting way, as it was built.)
 */
export function ProjectVisual(props: ComponentProps<typeof Visual>) {
  // decided once, so a drawing on the page is never swapped for another copy of itself
  const [Direct] = useState(() => ready?.ProjectVisual)
  if (Direct) return <Direct {...props} />
  return (
    <Suspense fallback={<div className={props.className} aria-hidden />}>
      <Visual {...props} />
    </Suspense>
  )
}
