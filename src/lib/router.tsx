/**
 * A small router on real addresses: the home page at the site's root, /resume/ and /work/<slug>/, with
 * back/forward support and per-entry state (used to say "scroll to Work" when coming back from a case
 * study). Each address is also a pre-built file (scripts/prerender.mjs), so opening one directly works on
 * any static host with no server rewrites; an address with no page falls to the host's 404.html, which is
 * this same app, and shows the "page not found" note (pages/NotFound.tsx).
 */
import { flushSync } from 'react-dom'
import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

export type Location = { pathname: string; state: unknown }
/** `transition`: change page as one animated step (the browser's view transition), where the browser can. */
type NavigateOptions = { replace?: boolean; state?: unknown; transition?: boolean }
export type NavigateFn = (to: string, opts?: NavigateOptions) => void

const RouterContext = createContext<{ location: Location; navigate: NavigateFn } | null>(null)
const ParamsContext = createContext<Record<string, string>>({})

/** Where the site is served from: "/" or, under a sub-path, "/portfolio/". */
const BASE = import.meta.env.BASE_URL

/** "/work/x/" (or, under a sub-path, "/portfolio/work/x/") -> "/work/x": the route, always starting with "/". */
export function readPath(pathname = window.location.pathname) {
  const inside = pathname.startsWith(BASE) ? pathname.slice(BASE.length - 1) : pathname
  const path = inside.replace(/\/index\.html$/, '/')
  return path.length > 1 ? path.replace(/\/+$/, '') : '/'
}

function readState(): unknown {
  const s = window.history.state as { usr?: unknown } | null
  return s && typeof s === 'object' && 'usr' in s ? s.usr : null
}

/** The address of a route ("/resume" -> "/resume/", "/" -> "/"): a folder, as the pre-built files are laid out. */
function href(to: string) {
  const path = to.startsWith('/') ? to : `/${to}`
  return path === '/' ? BASE : `${BASE}${path.slice(1).replace(/\/+$/, '')}/`
}

/** `path` is given only when a page is pre-built (there is no address bar to read then). */
export function Router({ children, path }: { children: ReactNode; path?: string }) {
  const [location, setLocation] = useState<Location>(() => (path ? { pathname: path, state: null } : { pathname: readPath(), state: readState() }))

  useEffect(() => {
    const sync = () => startTransition(() => setLocation({ pathname: readPath(), state: readState() }))
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  const navigate = useCallback<NavigateFn>((to, opts = {}) => {
    const path = to === '.' ? readPath() : to.startsWith('/') ? to : `/${to}`
    const url = href(path)
    const entry = { usr: opts.state ?? null }
    if (opts.replace) window.history.replaceState(entry, '', url)
    else window.history.pushState(entry, '', url)
    const next = { pathname: path, state: opts.state ?? null }
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }
    if (opts.transition && doc.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // the old page is pictured, the new one drawn at once (flushSync), and the browser animates between
      // the two: what the pages share (.vt-* names in index.css) moves from its old place to its new one
      const root = document.documentElement
      root.classList.add('vt-page')
      doc.startViewTransition(() => flushSync(() => setLocation(next))).finished.finally(() => root.classList.remove('vt-page'))
    } else startTransition(() => setLocation(next))
  }, [])

  const value = useMemo(() => ({ location, navigate }), [location, navigate])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('Router is missing')
  return ctx
}

export function useLocation() {
  return useRouter().location
}

export function useNavigate() {
  return useRouter().navigate
}

export function useParams<T extends Record<string, string> = Record<string, string>>() {
  return useContext(ParamsContext) as T
}

/** Match "/work/:slug" against a path; returns the params, or null. "*" matches anything. */
function match(pattern: string, path: string): Record<string, string> | null {
  if (pattern === '*') return {}
  const a = pattern.split('/').filter(Boolean)
  const b = path.split('/').filter(Boolean)
  if (a.length !== b.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i])
    else if (a[i] !== b[i]) return null
  }
  return params
}

export function Route(_props: { path: string; element: ReactElement }) {
  return null
}

/** Renders the first child Route whose path matches. */
export function Routes({ children }: { children: ReactElement<{ path: string; element: ReactElement }>[] }) {
  const { pathname } = useLocation()
  for (const child of children) {
    const params = match(child.props.path, pathname)
    if (params) return <ParamsContext.Provider value={params}>{child.props.element}</ParamsContext.Provider>
  }
  return null
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string
  state?: unknown
  /** Animate the change of page; `prepare` is awaited first (the next page's code, so it can be drawn at once). */
  transition?: boolean
  prepare?: () => Promise<unknown>
}

/** An ordinary link (works in a new tab, middle click, "copy link") that navigates in place on a plain click. */
export function Link({ to, state, transition, prepare, onClick, children, ...rest }: LinkProps) {
  const navigate = useNavigate()
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target === '_blank') return
    e.preventDefault()
    if (!transition) return navigate(to, { state })
    // wait for the next page's code, but not for long: then go without the animation
    let gone = false
    const go = (animated: boolean) => {
      if (gone) return
      gone = true
      navigate(to, { state, transition: animated })
    }
    const late = setTimeout(() => go(false), 1200)
    Promise.resolve(prepare?.()).then(
      () => (clearTimeout(late), go(true)),
      () => (clearTimeout(late), go(false)),
    )
  }
  return (
    <a href={href(to)} onClick={handle} {...rest}>
      {children}
    </a>
  )
}
