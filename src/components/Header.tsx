import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from '../lib/router'
import { navItems, site } from '../data/site'
import { useActiveSection } from '../hooks/useActiveSection'
import { announceHome } from '../lib/home'
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
const barType = 'font-mono text-[12px] font-semibold uppercase tracking-[0.16em]'

/**
 * Wide screens: one floating glass bar in the middle of the top edge, with the red monogram tile,
 * his name and the section links, and the theme switch as a square of the same glass at the right
 * corner. Phones and tablets: the monogram at the left and a capsule with the theme switch and the
 * menu button at the right. Corners are
 * square-ish everywhere (12px on the panes). Pressing the name or the monogram brings the page
 * home: the brand lifts and stamps back down, and the hero plays its welcome again (lib/home.ts).
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
  // how many times the name has been pressed: each press remounts the brand, so its stamp starts
  // again from the beginning
  const [pressed, setPressed] = useState(0)

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

  // Home: back to the top, and the hero's welcome once the page is there (at once if it already is).
  // From another page it is simply the way back.
  const goHome = () => {
    setPressed((n) => n + 1)
    if (!isHome) {
      go('top')
      return
    }
    setOpen(false)
    if (window.scrollY < 2) announceHome()
    else scrollTo('top', { onComplete: announceHome })
  }

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
        {/* phones and tablets: the monogram at the left, the theme switch and the menu in a capsule at the right
            (the home page's red tape stops just under this row, so the capsule keeps the page's own edge) */}
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-3 sm:px-6 lg:hidden">
          <m.button
            type="button"
            onClick={goHome}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="pointer-events-auto flex items-center gap-3 rounded-xl"
            aria-label={`${site.shortName}, back to top`}
          >
            <span key={pressed} className={`brand-stamp ${pressed ? 'is-stamping' : ''}`}>
              <span className="brand-tile brand-tile--lg" aria-hidden>
                <Monogram />
              </span>
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
              className={`flex h-10 items-center gap-2.5 rounded-[8px] pl-3 pr-4 ${barType} text-ink transition-colors active:bg-[var(--glass-press)]`}
            >
              <span className="relative block h-2.5 w-4" aria-hidden>
                <span className={`absolute left-0 h-px w-4 bg-ink transition-all duration-300 ${open ? 'top-1 rotate-45' : 'top-0'}`} />
                <span className={`absolute left-0 h-px w-4 bg-ink transition-all duration-300 ${open ? 'top-1 -rotate-45' : 'top-2'}`} />
              </span>
              <MorphLabel text={open ? 'Close' : (here ?? 'Menu')} />
            </button>
          </m.div>
        </div>

        {/* wide screens: one bar in the middle, and the theme switch on its own at the right corner */}
        <div className="relative hidden justify-center pl-10 pr-[calc(40px+var(--lane,0px))] lg:flex">
          <m.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="glass header-glass pointer-events-auto flex max-w-full items-center gap-[clamp(14px,2vw,26px)] rounded-xl p-[7px]"
          >
            {/* the brand: the red monogram tile and his first and middle names beside it */}
            <button
              type="button"
              onClick={goHome}
              className="flex items-center rounded-[7px] pr-1 text-[var(--bar-ink)]"
              aria-label={`${site.shortName}, back to top`}
            >
              <span key={pressed} className={`brand-stamp ${pressed ? 'is-stamping' : ''}`}>
                <span className="brand-tile" aria-hidden>
                  <Monogram />
                </span>
                <span className={`brand-name ${barType}`} aria-hidden>
                  {givenNames}
                </span>
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
                    className={`relative rounded-[6px] px-[9px] py-[10px] ${barType} leading-none transition-colors ${on ? 'text-[var(--bar-ink)]' : 'text-[var(--bar-muted)] hover:text-[var(--bar-ink)]'}`}
                  >
                    {item.label}
                    {on && (
                      <m.span
                        layoutId="nav-line"
                        className="absolute inset-x-[9px] bottom-[3px] h-0.5 bg-[var(--brand-red)]"
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                        aria-hidden
                      />
                    )}
                  </button>
                )
              })}
            </nav>
          </m.div>

          {/* the theme switch: a square of the same glass, exactly as tall as the bar (7px + the 32px tile + 7px), at the
              right corner of the page's layout (the 1440px frame the hero and the sections sit in), not of the screen */}
          <m.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            // 40px in from the page's frame, like the text; on the home page that is 40px in from the red tape
            className="pointer-events-auto absolute top-0 right-[calc(max(0px,(100vw-1440px)/2)+40px+var(--lane,0px))]"
          >
            {/* as on the main portfolio: a solid tile in the ink, so it is light in the dark and black on the
                paper, the icon cut out of it in the page's own colour (22px, about half the tile). It stays level
                with the bar beside it: a touch softer under the pointer, pressed in on a click */}
            <ThemeButton
              className="grid size-[46px] place-items-center rounded-xl bg-ink text-paper shadow-[var(--shadow-button)] transition-[background-color,scale] duration-200 hover:bg-[color-mix(in_srgb,var(--ink)_86%,var(--paper))] active:scale-95"
              icon="size-[22px]"
            />
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
                    className="group relative flex items-center gap-4 rounded-[8px] px-4 py-3.5 text-left"
                  >
                    <span className="eyebrow tabular relative w-6">{String(i + 1).padStart(2, '0')}</span>
                    {/* the section you're in is underlined in red, as in the bar; so is the one under your finger */}
                    <span className="relative font-mono text-[clamp(1.15rem,5.2vw,1.6rem)] font-semibold uppercase leading-[1.1] tracking-[0.14em]">
                      {item.label}
                      <span
                        className={`absolute inset-x-0 -bottom-1 h-0.5 bg-[var(--brand-red)] transition-opacity duration-200 group-hover:opacity-100 group-active:opacity-100 ${on ? 'opacity-100' : 'opacity-0'}`}
                        aria-hidden
                      />
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

/**
 * The monogram as a drawing: the letters K and M of Antonio at its heaviest weight, traced from the
 * font and set to fill the tile (86% of its width, centred on their capitals). Being a drawing, it
 * sits the same on every screen and needs no font to arrive; the favicon is the same picture.
 */
function Monogram() {
  return (
    <svg viewBox="0 0 64 64" className="block size-full" aria-hidden>
      <path fill="#160403" d="M4.48 54.27V9.73H11.26V30.23L18.04 9.73H25.05L17.66 31.7L25.64 54.27H18.47L11.31 33.47V54.27ZM30.34 54.27V9.73H38.77L45.1 42.27L51.04 9.73H59.52V54.27H53.47V37.67L53.72 22.43L47.73 54.07H42.34L36.09 22.43L36.34 37.67V54.27Z" />
    </svg>
  )
}

const quick =
  'glass-lens flex h-16 flex-col items-center justify-center gap-1.5 rounded-[10px] font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition-[scale] duration-300 active:scale-95'

function ThemeButton({ className, icon = 'size-4' }: { className: string; icon?: string }) {
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
          {theme === 'dark' ? <Sun className={icon} /> : <Moon className={icon} />}
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
