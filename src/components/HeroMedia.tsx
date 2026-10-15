import { AnimatePresence, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import { useEffect, useState } from 'react'
import { site } from '../data/site'
import { PaperFigure } from './PaperFigure'

/** When the bubble appears (s after load) and how long he "types" before the message is sent. */
const BUBBLE_IN = 1.3
const TYPING = 1.5

/** His paper figure in the hero (folding itself together), with a chat bubble that pops up beside his head. */
export function HeroMedia() {
  const { image, bubble } = site.hero
  return (
    <div className="relative h-full w-fit">
      {image ? <PaperFigure /> : <PlaceholderFigure />}
      {bubble && <Bubble text={bubble} />}
    </div>
  )
}

/**
 * The chat bubble, as a message arriving: it slides up as a small bubble with three dots bouncing
 * (he's typing), then widens into the message itself. Hidden while he is scattered (.bubble-wrap in
 * index.css). With "reduce motion" the message simply appears.
 */
function Bubble({ text }: { text: string }) {
  const reduce = useReducedMotion()
  // he types once the bubble has slid in (timed from then, so a slow start never cuts the typing short)
  const [typing, setTyping] = useState(false)
  const [sent, setSent] = useState(false)
  useEffect(() => {
    if (!typing) return
    const t = setTimeout(() => setSent(true), TYPING * 1000)
    return () => clearTimeout(t)
  }, [typing])
  const showText = sent || reduce
  return (
    <m.div
      // beside his neck, with the square corner pointing at him, clear of the faded name behind him.
      // Wide screens: in the space between the name's two lines (--wm-gap, measured from the hero's top;
      // the figure starts 14svh, at most 40px short of 100%, below that). Phones and tablets: just under
      // the name's last line (--wm-bottom from the hero's top), and pinned 16px (sm: 24px) from the
      // screen's right edge, however wide he is (the figure's box is centred: the margin beside it is
      // half of what the screen has left over).
      className="bubble-wrap absolute right-[calc(16px_-_(100vw_-_100%)_/_2)] top-[calc(var(--wm-bottom)-12px)] origin-bottom-left sm:right-[calc(24px_-_(100vw_-_100%)_/_2)] sm:top-[calc(var(--wm-bottom)-20px)] lg:left-[calc(76%+34px)] lg:right-auto lg:top-[calc(var(--wm-gap)-20px-min(4svh,40px))]"
      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : BUBBLE_IN }}
      onAnimationComplete={() => setTyping(true)}
    >
      {/* the float is on this wrapper so the bubble itself is free to change size (bubble-float in index.css) */}
      <div className="bubble-float relative w-fit">
        {/* an unseen copy of the words holds the finished bubble's room, so the bubble always grows from its
            left corner (the one pointing at him) towards the right, on phones too, where it is pinned to
            the screen's right edge */}
        <div className="invisible whitespace-nowrap px-3.5 py-2 text-[13px] font-medium sm:px-4 sm:py-2.5 sm:text-sm" aria-hidden>
          {text}
        </div>
        {/* teal gradient with a breathing halo (bubble-hello in index.css); its width eases as the dots give way to the words */}
        <m.div
          layout
          transition={{ layout: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
          className="bubble-hello absolute inset-y-0 left-0 flex items-center overflow-hidden whitespace-nowrap rounded-2xl rounded-bl-sm px-3.5 text-[13px] font-medium sm:px-4 sm:text-sm"
          style={{ borderRadius: 16, borderBottomLeftRadius: 2 }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {showText ? (
              <m.span key="text" className="block" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                {text}
              </m.span>
            ) : (
              <m.span key="dots" className="typing-dots flex items-center gap-1" aria-label="typing" exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                <i /><i /><i />
              </m.span>
            )}
          </AnimatePresence>
        </m.div>
      </div>
    </m.div>
  )
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
