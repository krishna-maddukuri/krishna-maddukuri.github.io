import * as m from 'motion/react-m'
import { useLayoutEffect, useRef } from 'react'
import { site } from '../data/site'
import { EASE } from './ui'

/**
 * The red tape down the right edge of the home page, in the red block's colours: "Open to Software Engineer
 * roles •" climbing it without end. Its track spans <main>, from the top of the page to the footer's top line,
 * where it ends; the part you see is a window a screen tall that sticks to the top of the screen, so the tape
 * is there the whole way down (the page keeps a lane clear for it: --lane and .page-frame in index.css). On
 * phones and tablets the first screen belongs to the giant name and the figure: the track starts level with
 * the top of the hero's red block, and the window stops just under the header's row. Two identical halves of
 * words, so the loop never shows a seam; it holds still under a pointer or keyboard focus, and for people who
 * ask for less motion (.role-tape). Click it to jump to Contact.
 */
export function RoleTape({ onClick }: { onClick: () => void }) {
  const run = `${site.openTo.toUpperCase()} • `
  const track = useRef<HTMLDivElement>(null)
  // where the red block starts, from layout offsets (its entrance motion doesn't count); wide screens ignore it
  useLayoutEffect(() => {
    const el = track.current
    const block = document.querySelector<HTMLElement>('.hero-copy .role-block')
    const hero = document.getElementById('top')
    if (!el || !block || !hero) return
    const place = () => {
      const stop = el.offsetParent
      let y = 0
      for (let n: Element | null = block; n instanceof HTMLElement && n !== stop; n = n.offsetParent) y += n.offsetTop
      el.style.setProperty('--tape-start', `${Math.round(y)}px`)
    }
    const watch = new ResizeObserver(place)
    watch.observe(hero)
    watch.observe(block)
    watch.observe(document.documentElement)
    document.fonts?.ready.then(place)
    place()
    return () => watch.disconnect()
  }, [])
  return (
    <div ref={track} className="role-tape">
      <m.button
        type="button"
        onClick={onClick}
        aria-label={`${site.openTo}. Go to contact`}
        className="role-tape-window"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay: 1.1 }}
      >
        <span className="role-tape-run" aria-hidden>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i}>{run}</span>
          ))}
        </span>
      </m.button>
    </div>
  )
}
