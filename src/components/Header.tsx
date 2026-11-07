import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from '../lib/router'
import { navItems, site } from '../data/site'
import { useActiveSection } from '../hooks/useActiveSection'
import { useLenis, useScrollTo } from '../lib/scroll'
import { useTheme } from '../lib/theme'
import { LinkedInMark } from './Logo'
import { ResumeLink } from './ResumeLink'
import { copyText, toast } from './Toast'
import { ArrowDown, Copy, EASE, Moon, Sun } from './ui'

const sectionIds = ['top', ...navItems.map((n) => n.id)]
const sectionLabel = Object.fromEntries(navItems.map((n) => [n.id, n.label])) as Record<string, string>
/** His first and middle names, as the bar spells them beside the tile. */
const givenNames = site.name.split(' ').slice(0, -1).join(' ')

/**
 * Wide screens: one floating glass bar in the middle of the top edge, with the red monogram tile
 * and his name, the section links and the theme switch. Phones and tablets: the monogram at the
 * left and a capsule with the theme switch and the menu button at the right. Corners are
 * square-ish everywhere (12px on the panes).
 */
export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const scrollTo = useScrollTo()
  const lenis = useLenis()
  const isHome = location.pathname === '/'
  const active = useActiveSection(isHome ? sectionIds : [], location.pathname)
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)

  // Phones: the menu button names the section you're reading, like an app's title bar.
  const here = active && active !== 'top' ? sectionLabel[active] : null

  const go = (id: string) => {
    setOpen(false)
    document.documentElement.style.overflow = ''
    lenis?.start()
    if (isHome) scrollTo(id)
    else navigate('/', { state: { section: id } })
  }

  // While the menu is open the page behind it stays put.
  useEffect(() => {
    if (!open) return
    const html = document.documentElement
    const before = html.style.overflow
    html.style.overflow = 'hidden'
    lenis?.stop()
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      menuButton.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      html.style.overflow = before
      lenis?.start()
      window.removeEventListener('keydown', onKey)
    }
  }, [open, lenis])

  useEffect(() => setOpen(false), [location.pathname])

  const copyEmail = async () => {
    if (await copyText(site.email)) toast('Email copied')
    else window.location.href = `mailto:${site.email}`
  }

  return (
    <>
      <header
        className="site-header pointer-events-none fixed inset-x-0 top-0 z-50"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        {/* phones and tablets: the monogram at the left, the theme switch and the menu in a capsule at the right */}
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-3 sm:px-6 lg:hidden">
          <m.button
            type="button"
            onClick={() => go('top')}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="pointer-events-auto flex items-center gap-3 rounded-xl"
            aria-label={`${site.shortName}, back to top`}
          >
            <span className="glass header-glass glass-press grid size-12 place-items-center rounded-xl font-display text-[14px] font-bold tracking-tight text-ink">
              {site.monogram}
            </span>
          </m.button>

          <m.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            className="glass header-glass pointer-events-auto flex h-12 items-center rounded-xl p-1"
          >
            <ThemeButton className="grid size-10 place-items-center rounded-[8px] text-ink transition-colors active:bg-[var(--glass-press)]" />
            <span className="mx-0.5 h-5 w-px bg-ink/15" aria-hidden />
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : here ? `Menu (${here})` : 'Menu'}
              className="flex h-10 items-center gap-2.5 rounded-[8px] pl-3 pr-4 text-sm font-medium text-ink transition-colors active:bg-[var(--glass-press)]"
            >
              <span className="relative block h-2.5 w-4" aria-hidden>
                <span className={`absolute left-0 h-px w-4 bg-ink transition-all duration-300 ${open ? 'top-1 rotate-45' : 'top-0'}`} />
                <span className={`absolute left-0 h-px w-4 bg-ink transition-all duration-300 ${open ? 'top-1 -rotate-45' : 'top-2'}`} />
              </span>
              <MorphLabel text={open ? 'Close' : (here ?? 'Menu')} />
            </button>
          </m.div>
        </div>

        {/* wide screens: one bar in the middle */}
        <div className="hidden justify-center px-10 lg:flex">
          <m.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="glass header-glass pointer-events-auto flex max-w-full items-center gap-[clamp(14px,2vw,26px)] rounded-xl p-[7px]"
          >
            {/* the brand: the red monogram tile and his first and middle names beside it */}
            <button
              type="button"
              onClick={() => go('top')}
              className="glass-press flex items-center gap-2.5 rounded-[7px] pr-1 text-[var(--bar-ink)]"
              aria-label={`${site.shortName}, back to top`}
            >
              <span className="brand-tile" aria-hidden>
                {site.monogram}
              </span>
              <span className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.16em]" aria-hidden>
                {givenNames}.
              </span>
            </button>

            <nav aria-label="Sections" className="flex items-center gap-[clamp(2px,0.6vw,8px)]">
              {navItems.map((item) => {
                const on = active === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(item.id)}
                    aria-current={on ? 'true' : undefined}
                    className={`relative rounded-[6px] px-[9px] py-[9px] text-sm font-medium transition-colors ${on ? 'text-[var(--bar-ink)]' : 'text-[var(--bar-muted)] hover:text-[var(--bar-ink)]'}`}
                  >
                    {item.label}
                    {on && (
                      <m.span
                        layoutId="nav-line"
                        className="absolute inset-x-[9px] bottom-[3px] h-0.5 bg-accent"
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                        aria-hidden
                      />
                    )}
                  </button>
                )
              })}
            </nav>

            <ThemeButton className="grid size-9 place-items-center rounded-[7px] border border-ink/15 text-[var(--bar-ink)] transition-colors hover:bg-[var(--glass-press)]" />
          </m.div>
        </div>
      </header>

      {/* the menu: a glass sheet that grows out of the menu button */}
      <AnimatePresence>
        {open && (
          <m.div
            key="scrim"
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'var(--scrim)', touchAction: 'none' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <m.div
            key="menu"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="glass glass-menu fixed z-50 flex flex-col overflow-y-auto overscroll-contain rounded-[14px] p-2 lg:hidden"
            style={{
              top: 'calc(env(safe-area-inset-top, 0px) + 72px)',
              left: 'calc(env(safe-area-inset-left, 0px) + 12px)',
              right: 'calc(env(safe-area-inset-right, 0px) + 12px)',
              maxHeight: 'calc(100svh - env(safe-area-inset-top, 0px) - 88px)',
              transformOrigin: 'top right',
            }}
            initial={{ opacity: 0, scale: 0.35, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -16, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.9 }}
          >
            <nav aria-label="Sections" className="flex flex-col">
              {navItems.map((item, i) => {
                const on = active === item.id
                return (
                  <m.button
                    key={item.id}
                    type="button"
                    onClick={() => go(item.id)}
                    aria-current={on ? 'true' : undefined}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: 0.06 + i * 0.035 }}
                    className="relative flex items-center gap-4 rounded-[8px] px-4 py-2.5 text-left transition-colors active:bg-[var(--glass-press)]"
                  >
                    {on && <span className="glass-lens absolute inset-0 rounded-[8px]" aria-hidden />}
                    <span className="eyebrow tabular relative w-6">{String(i + 1).padStart(2, '0')}</span>
                    <span className="relative font-display text-[clamp(1.75rem,8.6vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.04em]">
                      {item.label}
                    </span>
                  </m.button>
                )
              })}
            </nav>

            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mx-2 mt-2 border-t border-ink/10 pb-1 pt-3"
            >
              <div className="px-2 font-mono text-xs text-ink-soft [overflow-wrap:anywhere]">{site.email}</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button type="button" onClick={copyEmail} className={quick}>
                  <Copy className="size-4" /> Copy email
                </button>
                <a href={site.linkedin} target="_blank" rel="noreferrer" className={quick}>
                  <LinkedInMark className="size-5 rounded-[5px]" /> LinkedIn
                </a>
                <ResumeLink className={quick}>
                  <ArrowDown className="size-4" /> Résumé
                </ResumeLink>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}

const quick =
  'glass-lens flex h-16 flex-col items-center justify-center gap-1.5 rounded-[10px] text-sm font-medium text-ink transition-[scale] duration-300 active:scale-95'

function ThemeButton({ className }: { className: string }) {
  const { theme, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
      }}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className={className}
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </m.span>
      </AnimatePresence>
    </button>
  )
}

/** A label that rolls to its new text while the capsule stretches or shrinks to fit. */
function MorphLabel({ text }: { text: string }) {
  const sizer = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = sizer.current
    if (!el) return
    const measure = () => setWidth(Math.ceil(el.getBoundingClientRect().width))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [text])

  return (
    <m.span
      aria-hidden
      className="relative block h-5 overflow-hidden"
      initial={false}
      animate={{ width: width ?? 'auto' }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
    >
      <span ref={sizer} className="invisible absolute left-0 top-0 whitespace-nowrap leading-5">
        {text}
      </span>
      <AnimatePresence initial={false}>
        <m.span
          key={text}
          className="absolute left-0 top-0 whitespace-nowrap leading-5"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        >
          {text}
        </m.span>
      </AnimatePresence>
    </m.span>
  )
}
