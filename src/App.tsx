import { LazyMotion, MotionConfig } from 'motion/react'
import { lazy, Suspense, useEffect, useLayoutEffect } from 'react'
import { Header } from './components/Header'
import { Toaster } from './components/Toast'
import { clearRetry, ErrorBoundary } from './components/ErrorBoundary'
import { pageTitle } from './lib/pageTitle'
import { Route, Router, Routes, useLocation } from './lib/router'
import { SmoothScroll, useLenis } from './lib/scroll'
import { Home } from './pages/Home'
import { CaseStudy } from './pages/LazyCaseStudy'
import { NotFound } from './pages/NotFound'
import { Footer } from './sections/Contact'

// The two inner pages load only when someone opens them.
const Resume = lazy(() => import('./pages/Resume').then((m) => ({ default: m.Resume })))

/**
 * Settled once the page in view has been taken over by the script (`PageUp`, inside the pages' boundary).
 * A ready-made inner page waits for its own code before that; anything that changes the app around it
 * meanwhile would make React throw the ready-made page away and show a blank one until the code arrived.
 * So the animation engine, which loads after the first script, joins the app only once the page is up (or
 * after a few seconds, whatever happens); smooth scrolling (lib/scroll.tsx) joins as a change that can wait.
 */
let pageIsUp = () => {}
const pageUp = new Promise<void>((ok) => {
  pageIsUp = ok
})
function PageUp() {
  useEffect(() => pageIsUp(), [])
  return null
}

/**
 * The animation engine arrives as its own file (lib/motionFeatures.ts). If it cannot be fetched, even on a
 * second try, the parts of the page that wait for it to fade in are simply shown (the same rule as for a
 * page whose script never arrived: `html.script-failed` in index.css), so nothing stays unseen.
 */
const engine = () => import('./lib/motionFeatures').then((m) => m.default)
const features = () =>
  engine()
    .catch(() => new Promise((again) => setTimeout(again, 1500)).then(engine))
    .then((found) => Promise.race([pageUp, new Promise((late) => setTimeout(late, 4000))]).then(() => found))
    .catch(() => {
      document.documentElement.classList.add('script-failed')
      return new Promise<never>(() => {})
    })


function ScrollReset() {
  const { pathname, state } = useLocation()
  const lenis = useLenis()
  useLayoutEffect(() => {
    if ((state as { section?: string } | null)?.section) return
    window.scrollTo(0, 0)
    lenis?.scrollTo(0, { immediate: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  }, [])
  return null
}

/** "Skip to content" for keyboards: moves focus to the page's main landmark without touching the URL hash. */
function SkipLink() {
  return (
    <a
      href="#main"
      className="skip-link"
      onClick={(e) => {
        e.preventDefault()
        const main = document.getElementById('main')
        if (!main) return
        main.setAttribute('tabindex', '-1')
        main.focus({ preventScroll: true })
        main.scrollIntoView({ block: 'start' })
      }}
    >
      Skip to content
    </a>
  )
}

/** Keeps the page's height while an inner page's code loads, so nothing jumps. */
function PageFallback() {
  return <main className="min-h-svh" aria-busy="true" />
}

/** The pages, inside the safety net (components/ErrorBoundary.tsx): a page that fails shows a way on, not a blank screen. */
function Pages() {
  const { pathname } = useLocation()
  // the tab names the page you are on (a pre-built page already carries its title)
  useEffect(() => {
    document.title = pageTitle(pathname)
  }, [pathname])
  // once the site has been up for a while, a later failed download may be tried again by itself
  useEffect(() => {
    const t = setTimeout(clearRetry, 10_000)
    return () => clearTimeout(t)
  }, [])
  return (
    <ErrorBoundary resetKey={pathname}>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work/:slug" element={<CaseStudy />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <PageUp />
      </Suspense>
    </ErrorBoundary>
  )
}

/** `path` is given only when a page is pre-built (entry-server.tsx). */
export default function App({ path }: { path?: string }) {
  return (
    <LazyMotion features={features} strict>
      <MotionConfig reducedMotion="user">
        <Router path={path}>
          <SmoothScroll>
            <SkipLink />
            <ScrollReset />
            <Header />
            <Pages />
            <Footer />
            <Toaster />
          </SmoothScroll>
        </Router>
      </MotionConfig>
    </LazyMotion>
  )
}
