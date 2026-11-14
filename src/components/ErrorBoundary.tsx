import { Component, type ErrorInfo, type ReactNode } from 'react'
import { site } from '../data/site'
import { ResumeLink } from './ResumeLink'

const RETRIED = 'kkm-reloaded'

/** A part of the site's code that failed to download (a new version went live, or the connection dropped). */
const isLoadError = (error: unknown) =>
  error instanceof Error && /dynamically imported module|importing a module script|Failed to fetch|Loading chunk/i.test(error.message)

/**
 * The safety net: if a page fails while it is being drawn, or its code fails to download, this stands in
 * for it instead of a blank screen: a line saying so, a way to try again, and how to reach him anyway.
 * A failed download is tried again once by itself (the usual cause is a tab left open across a new
 * version), then this shows.
 */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(error, info.componentStack)
    if (!isLoadError(error)) return
    try {
      if (sessionStorage.getItem(RETRIED)) return
      sessionStorage.setItem(RETRIED, '1')
      window.location.reload()
    } catch {
      // no storage: show the fallback rather than risk reloading for ever
    }
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    // going to another page clears it
    if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false })
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main id="main" className="page-frame fold-gap mx-auto flex min-h-svh max-w-[720px] flex-col justify-center gap-6 px-4 py-28 sm:px-6" role="alert">
        <div className="eyebrow">Something went wrong</div>
        <h1 className="font-display text-[clamp(2.2rem,6vw,3.8rem)] font-bold leading-[1]">This page didn&rsquo;t load.</h1>
        <p className="max-w-[52ch] text-lg text-ink-soft">
          It is on my side, not yours. Loading it again usually fixes it. You can also reach me directly:
        </p>
        <dl className="resume-cells resume-cells--2">
          <div className="resume-cell">
            <dt className="eyebrow">Email</dt>
            <dd className="resume-cell-value select-all [overflow-wrap:anywhere]">{site.email}</dd>
          </div>
          <div className="resume-cell">
            <dt className="eyebrow">LinkedIn</dt>
            <dd className="resume-cell-value">
              <a href={site.linkedin} target="_blank" rel="noreferrer" className="link-underline [overflow-wrap:anywhere]">
                {site.linkedinLabel}
              </a>
            </dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => window.location.reload()} className="btn-solid btn-key btn-key--primary">
            Load it again
          </button>
          <a href={import.meta.env.BASE_URL} className="lift btn-fill btn-key">
            Home
          </a>
          <ResumeLink className="lift btn-fill btn-key">Resume (PDF)</ResumeLink>
        </div>
      </main>
    )
  }
}

/** A page drew without failing: a later failed download may be tried again once. */
export function clearRetry() {
  try {
    sessionStorage.removeItem(RETRIED)
  } catch {
    // no storage
  }
}
