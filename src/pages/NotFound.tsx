import { Link } from '../lib/router'

/**
 * For an address the site does not have (an old or mistyped link): it says so and offers the ways on.
 * On a static host this is what its 404.html shows (scripts/prerender.mjs writes that file).
 */
export function NotFound() {
  return (
    <main id="main" className="page-frame fold-gap mx-auto flex min-h-svh max-w-[720px] flex-col justify-center gap-6 px-4 py-28 sm:px-6">
      <div className="eyebrow">Page not found</div>
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.8rem)] font-bold leading-[1]">
        Nothing at <em className="accent-tail">this address.</em>
      </h1>
      <p className="max-w-[52ch] text-lg text-ink-soft">The link may be old or mistyped. Everything on the site is one step from here:</p>
      <div className="flex flex-wrap gap-3">
        <Link to="/" className="btn-solid btn-key btn-key--primary">
          Home
        </Link>
        <Link to="/" state={{ section: 'work' }} className="lift btn-fill btn-key">
          Work
        </Link>
        <Link to="/resume" className="lift btn-fill btn-key">
          Resume
        </Link>
      </div>
    </main>
  )
}
