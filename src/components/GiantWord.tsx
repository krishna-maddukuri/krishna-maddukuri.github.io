import type { CSSProperties } from 'react'

/** How wide each capital of Antonio is at its heaviest weight, in em (and its space): the measure of a line. */
const ANTONIO: Record<string, number> = {
  A: 0.453, B: 0.48, C: 0.473, D: 0.492, E: 0.391, F: 0.386, G: 0.488, H: 0.508, I: 0.265, J: 0.462, K: 0.479, L: 0.367, M: 0.692,
  N: 0.522, O: 0.488, P: 0.46, Q: 0.488, R: 0.484, S: 0.427, T: 0.345, U: 0.495, V: 0.454, W: 0.664, X: 0.438, Y: 0.429, Z: 0.365,
  ' ': 0.179,
}

export type GiantLine = { text: string; ratio: number }

/**
 * Giant capitals set like portfolio-2's word: Antonio at its heaviest, each line as wide as the
 * page's measure (1240px at most, inside portfolio-2's gutters), and never taller than a share of
 * the screen; when the height is the limit, the letters spread out to keep both edges (CSS does the
 * spreading: each line is a row of letters with the room left over shared out between them; the
 * styles are .wm-* in index.css).
 *
 * The size of the line with the biggest letters is --wm-word, a CSS length worked out from the
 * width of the nearest .wm-frame (container units) and the screen's height, so nothing is measured
 * in JavaScript; the other lines are a fixed fraction of it, so every line fills the same width.
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
    word: `min(calc((100cqw - 2 * var(--wm-gutter)) / ${base.toFixed(3)}), calc(1240px / ${base.toFixed(3)}), ${cap})`,
    bottom: `calc(var(--wm-word) * ${foot.toFixed(4)})`,
  }
}

/**
 * The word itself: on `play`, each letter draws in as an outline, then fills (.wm-play in index.css);
 * every letter is its own span so it can take its turn. Decorative: hide it from assistive tech
 * where it is used, the name is in the page's text.
 */
export function GiantWord({ lines, play }: { lines: GiantLine[]; play: boolean }) {
  return (
    <div className={`wm-word ${play ? 'wm-play' : ''}`}>
      {lines.map((line, l) => (
        <div key={line.text} className="wm-line" style={{ '--l': l, '--wm-r': line.ratio } as CSSProperties}>
          {[...line.text].map((ch, i) => (
            <span key={i} className="wm-ch" style={{ '--i': i } as CSSProperties}>
              {ch}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
