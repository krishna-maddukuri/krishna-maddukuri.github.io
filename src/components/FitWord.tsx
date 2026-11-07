import { useLayoutEffect, useRef, useState } from 'react'

/**
 * A word drawn edge to edge: an SVG whose viewBox is the word's ink bounds, so the glyphs scale
 * uniformly to the full width of the box. Nothing is stretched and no letter-spacing is added;
 * the word is simply as big as the box is wide. The ink is measured with a canvas in the same
 * font (and again once the fonts are in); until then the glyph cells stand in.
 */
const SIZE = 1000

export function FitWord({ text, className = '' }: { text: string; className?: string }) {
  const textRef = useRef<SVGTextElement>(null)
  const [viewBox, setViewBox] = useState<string | null>(null)

  useLayoutEffect(() => {
    let alive = true
    const measure = () => {
      const el = textRef.current
      if (!el || !alive) return
      const cell = el.getBBox()
      if (!(cell.width > 0)) return
      let { x, y, width: w, height: h } = cell
      try {
        const cs = getComputedStyle(el)
        const ctx = document.createElement('canvas').getContext('2d')
        if (ctx) {
          ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${SIZE}px ${cs.fontFamily}`
          const m = ctx.measureText(text)
          if (m.actualBoundingBoxRight > 0 && m.actualBoundingBoxAscent > 0) {
            // the text's origin is at 0,0: left of the ink to the right of it, top of the ink to its bottom
            x = -m.actualBoundingBoxLeft
            w = m.actualBoundingBoxRight + m.actualBoundingBoxLeft
            y = -m.actualBoundingBoxAscent
            h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
          }
        }
      } catch {
        // no canvas: the glyph cells are close enough
      }
      setViewBox(`${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`)
    }
    measure()
    document.fonts?.ready.then(measure)
    return () => {
      alive = false
    }
  }, [text])

  return (
    <svg viewBox={viewBox ?? `0 ${-SIZE * 0.72} ${SIZE * text.length * 0.52} ${SIZE * 0.74}`} className={`block h-auto w-full overflow-visible ${className}`} aria-hidden>
      <text ref={textRef} x="0" y="0" fontSize={SIZE} fill="currentColor">
        {text}
      </text>
    </svg>
  )
}
