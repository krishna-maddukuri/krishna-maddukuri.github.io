import { lazy, Suspense, type ComponentProps } from 'react'

const Visual = lazy(() => import('./ProjectVisual').then((m) => ({ default: m.ProjectVisual })))

/** The project drawings in their own chunk: the home page is lighter and they load when a project opens. */
export function ProjectVisual(props: ComponentProps<typeof Visual>) {
  return (
    <Suspense fallback={<div className={props.className} aria-hidden />}>
      <Visual {...props} />
    </Suspense>
  )
}
