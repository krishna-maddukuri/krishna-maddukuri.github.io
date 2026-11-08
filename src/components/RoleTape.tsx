import * as m from 'motion/react-m'
import type { CSSProperties } from 'react'
import { site } from '../data/site'
import { heroName } from '../sections/Hero'
import { EASE } from './ui'

/**
 * The red tape down the right edge of the home page, in the red block's colours: "Open to Software Engineer
 * roles •" climbing it without end. Its track runs from the top of the page to the foot of the footer, and the
 * part you see is a window a screen tall that sticks to the top of the screen, so the tape is there the whole
 * way down, header to footer (the page keeps a lane clear for it: --lane and .page-frame in index.css). On
 * phones and tablets the track starts just under the hero's giant name, so the name keeps the whole width;
 * once the name has scrolled away the tape runs the full height of the screen there too. Two identical halves
 * of words, so the loop never shows a seam; it holds still under a pointer or keyboard focus, and for people
 * who ask for less motion (.role-tape). Click it to jump to Contact.
 */
export function RoleTape({ onClick }: { onClick: () => void }) {
  const run = `${site.openTo.toUpperCase()} • `
  // the hero name's size on a phone or tablet (its measure is the screen less the two gutters), for where the
  // track starts there
  const nameWord = `min((100vw - 2 * clamp(16px, 4vw, 40px)) / ${heroName.base.toFixed(3)}, 31svh)`
  return (
    <div className="role-tape" style={{ '--name-word': nameWord } as CSSProperties}>
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
