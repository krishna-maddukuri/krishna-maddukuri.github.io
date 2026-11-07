import { site } from '../data/site'
import { PaperFigure } from './PaperFigure'

/** His paper figure in the hero (folding itself together). */
export function HeroMedia() {
  return <div className="relative h-full w-fit">{site.hero.image ? <PaperFigure /> : <PlaceholderFigure />}</div>
}

/**
 * Stands in for the photo until one is added (set `image` under `hero` in site.ts):
 * a soft, faded figure the same shape and size as a full-length cut-out.
 */
function PlaceholderFigure() {
  return (
    <svg
      viewBox="0 0 640 1800"
      className="block h-full w-auto max-w-full select-none text-ink"
      role="img"
      aria-label={`Placeholder for a photo of ${site.name}`}
    >
      <defs>
        {/* solid, like a cut-out photo, so it covers the faded name behind it */}
        <linearGradient id="figure-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'color-mix(in oklab, var(--ink) 13%, var(--paper))' }} />
          <stop offset="0.6" style={{ stopColor: 'color-mix(in oklab, var(--ink) 10%, var(--paper))' }} />
          <stop offset="1" style={{ stopColor: 'color-mix(in oklab, var(--ink) 6%, var(--paper))' }} />
        </linearGradient>
        <mask id="figure-shape">
          <g fill="#fff">
            <ellipse cx="320" cy="150" rx="80" ry="104" />
            <path d="M284 228h72l6 92h-84z" />
            <path d="M282 296c-42 10-82 20-106 42-18 18-20 54-16 92l26 210c10 80 18 160 20 240l8 120h212l8-120c2-80 10-160 20-240l26-210c4-38 2-74-16-92-24-22-64-32-106-42z" />
            <path d="M160 352c-30 18-42 58-44 108l-8 240c-2 100 4 200 16 290 4 30 46 32 52 2 10-92 14-192 18-292l10-230z" />
            <path d="M480 352c30 18 42 58 44 108l8 240c2 100-4 200-16 290-4 30-46 32-52 2-10-92-14-192-18-292l-10-230z" />
            <ellipse cx="150" cy="1040" rx="30" ry="52" />
            <ellipse cx="490" cy="1040" rx="30" ry="52" />
            <path d="M214 960h104l-2 80c-4 210-10 410-14 650h-56c-6-240-16-440-24-650z" />
            <path d="M426 960H322l2 80c4 210 10 410 14 650h56c6-240 16-440 24-650z" />
            <path d="M242 1680h64c8 40 12 80 6 100h-92c-8-16 6-60 22-100z" />
            <path d="M398 1680h-64c-8 40-12 80-6 100h92c8-16-6-60-22-100z" />
          </g>
        </mask>
      </defs>
      <rect width="640" height="1800" fill="url(#figure-fade)" mask="url(#figure-shape)" />
    </svg>
  )
}
