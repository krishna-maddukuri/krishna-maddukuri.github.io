/**
 * A small hash router: three routes, back/forward support, and per-entry state (used to say
 * "scroll to Work" when coming back from a case study). Hash URLs (#/work/slug) work on any
 * static host, GitHub Pages included, with no server rewrites.
 */
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
export type NavigateOptions = { replace?: boolean; state?: unknown }
export type NavigateFn = (to: string, opts?: NavigateOptions) => void

const RouterContext = createContext<{ location: Location; navigate: NavigateFn } | null>(null)
const ParamsContext = createContext<Record<string, string>>({})

/** "#/work/x?y" -> "/work/x" (the hash's path part, always starting with "/"). */
function readPath(hash = window.location.hash) {
  const raw = hash.replace(/^#/, '').split('?')[0]
  const path = raw.startsWith('/') ? raw : `/${raw}`
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}

function readState(): unknown {
  const s = window.history.state as { usr?: unknown } | null
  return s && typeof s === 'object' && 'usr' in s ? s.usr : null
}

/** Build a hash href for a path ("/resume" -> "#/resume"). Relative "." means the current path. */
export function hashHref(to: string) {
  return `#${to.startsWith('/') ? to : `/${to}`}`
}

export function Router({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location>(() => ({ pathname: readPath(), state: readState() }))

  useEffect(() => {
    const sync = () => startTransition(() => setLocation({ pathname: readPath(), state: readState() }))
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])

  const navigate = useCallback<NavigateFn>((to, opts = {}) => {
    const path = to === '.' ? readPath() : to.startsWith('/') ? to : `/${to}`
    const url = `${window.location.pathname}${window.location.search}#${path}`
    const entry = { usr: opts.state ?? null }
    if (opts.replace) window.history.replaceState(entry, '', url)
    else window.history.pushState(entry, '', url)
    startTransition(() => setLocation({ pathname: path, state: opts.state ?? null }))
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

export function Navigate({ to, replace = false, state }: { to: string; replace?: boolean; state?: unknown }) {
  const navigate = useNavigate()
  useEffect(() => navigate(to, { replace, state }), [navigate, to, replace, state])
  return null
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string; state?: unknown }

/** An ordinary hash link (works in a new tab, middle click, "copy link") that navigates in place on a plain click. */
export function Link({ to, state, onClick, children, ...rest }: LinkProps) {
  const navigate = useNavigate()
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target === '_blank') return
    e.preventDefault()
    navigate(to, { state })
  }
  return (
    <a href={hashHref(to)} onClick={handle} {...rest}>
      {children}
    </a>
  )
}
