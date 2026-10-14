import { domMax, LazyMotion, MotionConfig } from 'motion/react'
import { lazy, Suspense, useEffect, useLayoutEffect } from 'react'
import { Header } from './components/Header'
import { Toaster } from './components/Toast'
import { Navigate, Route, Router, Routes, useLocation } from './lib/router'
import { SmoothScroll, useLenis } from './lib/scroll'
import { Home } from './pages/Home'
import { Footer } from './sections/Contact'

// The two inner pages load only when someone opens them.
const CaseStudy = lazy(() => import('./pages/CaseStudy').then((m) => ({ default: m.CaseStudy })))
const Resume = lazy(() => import('./pages/Resume').then((m) => ({ default: m.Resume })))


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

export default function App() {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <Router>
          <SmoothScroll>
            <SkipLink />
            <ScrollReset />
            <Header />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/work/:slug" element={<CaseStudy />} />
                <Route path="/resume" element={<Resume />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <Footer />
            <Toaster />
          </SmoothScroll>
        </Router>
      </MotionConfig>
    </LazyMotion>
  )
}
