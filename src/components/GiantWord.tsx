import type { CSSProperties } from 'react'

/** How wide each capital of Antonio is at its heaviest weight, in em (and its space): the measure of a line. */
const ANTONIO: Record<string, number> = {
  A: 0.453, B: 0.48, C: 0.473, D: 0.492, E: 0.391, F: 0.386, G: 0.488, H: 0.508, I: 0.265, J: 0.462, K: 0.479, L: 0.367, M: 0.692,
  N: 0.522, O: 0.488, P: 0.46, Q: 0.488, R: 0.484, S: 0.427, T: 0.345, U: 0.495, V: 0.454, W: 0.664, X: 0.438, Y: 0.429, Z: 0.365,
  ' ': 0.179,
}

/**
 * The empty space each capital carries at its left and right (in em, Antonio at its heaviest): the first
 * letter of a line is pulled left by its left side, the last pushed right by its right side, so the ink
 * itself, not the letters' boxes, meets the edges the page's text starts and ends on.
 */
const SIDES: Record<string, [number, number]> = {
  A: [0.014, 0.013],
  B: [0.064, 0.037],
  C: [0.054, 0.046],
  D: [0.064, 0.054],
  E: [0.064, 0.032],
  F: [0.064, 0.027],
  G: [0.054, 0.059],
  H: [0.064, 0.064],
  I: [0.067, 0.067],
  J: [0.041, 0.067],
  K: [0.064, 0.006],
  L: [0.064, 0.006],
  M: [0.064, 0.065],
  N: [0.064, 0.064],
  O: [0.054, 0.054],
  P: [0.064, 0.024],
  Q: [0.054, 0.054],
  R: [0.064, 0.042],
  S: [0.036, 0.027],
  T: [0.009, 0.009],
  U: [0.058, 0.058],
  V: [0.019, 0.018],
  W: [0.022, 0.022],
  X: [0.020, 0.020],
  Y: [0.008, 0.008],
  Z: [0.031, 0.019],
}

/** One line of a giant word: its letters, its size as a share of the biggest line's, and a class of its own if it needs one. */
export type GiantLine = { text: string; ratio: number; className?: string }

/**
 * Giant capitals set like portfolio-2's word: Antonio at its heaviest, each line as wide as the
 * page's layout (the 1440px frame less its 40px sides, so 1360px at most, the same edges as the hero's
 * text and buttons; the gutters are narrower on small screens), and never taller than a share of
 * the screen; when the height is the limit, the letters spread out to keep both edges (CSS does the
 * spreading: each line is a row of letters with the room left over shared out between them; the
 * styles are .wm-* in index.css).
 *
 * The size of the line with the biggest letters is --wm-word, a CSS length worked out from the
 * width of the nearest .wm-frame (container units) less its two insets (--wm-l and --wm-r, index.css)
 * and the screen's height, so nothing is measured in JavaScript; the other lines are a fixed fraction
 * of it, so every line fills the same width.
 * `cap` is the tallest the biggest letters may be (portfolio-2 allows 31svh for its one word).
 * Also returns how far down the last line's foot is (--wm-bottom, for anything placed under the
 * word), as a CSS length from the word's top.
 */
export function giantWord(texts: string[], cap = '31svh') {
  const upper = texts.map((t) => t.toUpperCase())
  // each line's natural width in em, with portfolio-2's 1.5% of slack so the letters never quite touch
  const widths = upper.map((text) => [...text].reduce((w, ch) => w + (ANTONIO[ch] ?? 0.49), 0) * 1.0155)
  const base = Math.min(...widths) // the narrowest line gets the biggest letters: --wm-word is its size
  const lines: GiantLine[] = upper.map((text, i) => ({ text, ratio: base / widths[i] }))
  // Antonio set with a line-height of 0.86: the capitals' foot (the baseline) is 0.938em below the
  // line's box; the lines sit 0.12 word apart
  const BOX = 0.86, FOOT = 0.938, GAP = 0.12
  let y = 0
  let foot = 0
  lines.forEach((line, i) => {
    if (i) y += GAP
    foot = y + FOOT * line.ratio
    y += BOX * line.ratio
  })
  return {
    lines,
    word: `min(calc((100cqw - var(--wm-l) - var(--wm-r)) / ${base.toFixed(3)}), ${cap})`,
    bottom: `calc(var(--wm-word) * ${foot.toFixed(4)})`,
  }
}

/**
 * The word itself: on `play`, each letter draws in as an outline (.wm-play in index.css); every
 * letter is its own span so it can take its turn. Decorative: hide it from assistive tech where it is
 * used, the name is in the page's text.
 */
export function GiantWord({ lines, play }: { lines: GiantLine[]; play: boolean }) {
  return (
    <div className={`wm-word ${play ? 'wm-play' : ''}`}>
      {lines.map((line, l) => (
        <div key={line.text} className={line.className ? `wm-line ${line.className}` : 'wm-line'} style={{ '--l': l, '--wm-ratio': line.ratio } as CSSProperties}>
          {[...line.text].map((ch, i, all) => (
            <span
              key={i}
              className="wm-ch"
              style={
                {
                  '--i': i,
                  marginLeft: i === 0 ? `${-(SIDES[ch]?.[0] ?? 0)}em` : undefined,
                  marginRight: i === all.length - 1 ? `${-(SIDES[ch]?.[1] ?? 0)}em` : undefined,
                } as CSSProperties
              }
            >
              {ch}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
