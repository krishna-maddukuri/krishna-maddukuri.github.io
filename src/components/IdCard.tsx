import { asset } from '../lib/asset'
import { animate, useDragControls, useInView, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import * as m from 'motion/react-m'
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'
import { LINKEDIN_QR } from '../data/linkedin-qr'
import { about, site } from '../data/site'
import { useMedia } from '../hooks/useMedia'
import { MONOGRAM_PATH } from './monogram'

const CLIP = 36 // the metal clip's top sits this far above the card's top edge (it grips the top 8px)
const STRAP = 20 // strap width
const HANG = 118 // the strap's length at rest, from the hook down to the clip...
const HANG_WIDE = 60 // ...shorter on wide screens, where the About section fits on one screen
const HOOK = 30 // the wall hook's size
const HOLD_MS = 200 // phones: press and hold this long to pick the card up...
const SLOP = 8 // ...without moving more than this (moving more is a scroll)

type Limits = { top: number; left: number; right: number; bottom: number }

/**
 * The lanyard ID card. Its strap hangs from a small wall hook at the top of its
 * column; drag the card anywhere in the section and the strap follows it,
 * let go and it swings back. Tap (or press Enter) to flip it.
 *
 * On phones a swipe over the card scrolls the page as usual; press and hold
 * the card for a moment to pick it up.
 */
export function IdCard({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) {
  const slotRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const wide = useMedia('(min-width: 1024px)')
  const touch = useMedia('(pointer: coarse)')
  const controls = useDragControls()
  const hang = wide ? HANG_WIDE : HANG

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  const anchorX = useMotionValue(0)
  const anchorY = useMotionValue(0)
  const restTop = useMotionValue(0)
  const [limits, setLimits] = useState<Limits | null>(null)
  const [reach, setReach] = useState(0)

  // The strap runs from its anchor to the clip; the card leans along it.
  const strapDy = () => restTop.get() - CLIP + 6 + y.get() - anchorY.get()
  const strapLength = useTransform(() => Math.hypot(x.get(), strapDy()))
  const strapAngle = useTransform(() => (-Math.atan2(x.get(), strapDy()) * 180) / Math.PI)
  const lean = useTransform(() => {
    const dy = restTop.get() - CLIP - anchorY.get() + y.get()
    return ((-Math.atan2(x.get(), Math.max(40, dy)) * 180) / Math.PI) * 0.9
  })

  useLayoutEffect(() => {
    const slot = slotRef.current
    // (on the first render the section's ref isn't attached yet, so find it from the card)
    const section = sectionRef.current ?? slot?.closest('section')
    if (!section || !slot) return
    const measure = () => {
      // measure the resting slot, not the (possibly dragged) card
      const s = section.getBoundingClientRect()
      const c = slot.getBoundingClientRect()
      const top = c.top - s.top
      anchorX.set(c.left - s.left + c.width / 2)
      restTop.set(top)
      // the hook sits a strap's length above the clip
      anchorY.set(Math.max(0, top - CLIP - hang))
      // The card can be dragged anywhere inside the section. These are fixed numbers on purpose:
      // limits tied to the section element make the drag library stop the card mid-swing
      // whenever the window resizes, which on iPhone happens as soon as you scroll.
      const next = {
        top: Math.round(s.top - c.top),
        left: Math.round(s.left - c.left),
        right: Math.round(s.right - c.right),
        bottom: Math.round(s.bottom - c.bottom),
      }
      setLimits((prev) =>
        prev && prev.top === next.top && prev.left === next.left && prev.right === next.right && prev.bottom === next.bottom
          ? prev
          : next,
      )
      setReach(Math.ceil(Math.hypot(s.width, s.height)) + 240)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(section)
    document.fonts?.ready.then(measure).catch(() => {})
    return () => ro.disconnect()
  }, [sectionRef, wide, hang, anchorX, anchorY, restTop])

  // Swing in when the section scrolls into view, then sway gently (in CSS, so it
  // costs nothing while you scroll). The sway pauses off-screen and while held.
  const swungIn = useInView(slotRef, { once: true, amount: 0.3 })
  const onScreen = useInView(slotRef, { margin: '160px 0px' })
  const [held, setHeld] = useState(false)
  const [dragging, setDragging] = useState(false)

  const [flipped, setFlipped] = useState(false)
  // Which face is towards the viewer, written on the turning card itself (data-showing) as it turns: the far
  // face is then not drawn at all (index.css), so a browser that does not hide a turned-away face by itself
  // never shows the back's mirror image over the front.
  const turnRef = useRef<HTMLDivElement>(null)
  const showFace = (back: boolean) => {
    if (turnRef.current) turnRef.current.dataset.showing = back ? 'back' : 'front'
  }
  const press = useRef({ x: 0, y: 0, timer: 0, armed: false, picked: false, event: null as PointerEvent | null })

  const lift = (to: number) => animate(scale, to, { type: 'spring', stiffness: 520, damping: to > 1 ? 26 : 30 })

  const onPointerDown = (e: ReactPointerEvent) => {
    const p = press.current
    window.clearTimeout(p.timer)
    p.x = e.clientX
    p.y = e.clientY
    p.picked = false
    if (!(touch && e.pointerType === 'touch')) {
      controls.start(e) // mouse and pen: drag straight away
      return
    }
    p.event = e.nativeEvent
    p.timer = window.setTimeout(() => {
      p.armed = true
      p.picked = true
      setHeld(true)
      lift(1.045)
      if (p.event) controls.start(p.event)
    }, HOLD_MS)
  }
  const onPointerMove = (e: ReactPointerEvent) => {
    const p = press.current
    if (!p.armed && Math.hypot(e.clientX - p.x, e.clientY - p.y) > SLOP) window.clearTimeout(p.timer)
  }
  const endPress = () => {
    const p = press.current
    window.clearTimeout(p.timer)
    p.event = null
    if (p.armed) {
      p.armed = false
      setHeld(false)
      lift(1)
    }
  }
  const onClick = (e: MouseEvent) => {
    const p = press.current
    if (p.picked) {
      p.picked = false // a press-and-hold picks the card up; it doesn't flip it
      return
    }
    if (Math.hypot(e.clientX - p.x, e.clientY - p.y) < 6) setFlipped((f) => !f)
  }

  // Once the card is picked up, the finger moves the card instead of the page.
  useEffect(() => {
    const el = cardRef.current
    if (!el || !touch) return
    const block = (e: TouchEvent) => {
      if (press.current.armed) e.preventDefault()
    }
    el.addEventListener('touchmove', block, { passive: false })
    return () => el.removeEventListener('touchmove', block)
  }, [touch])

  useEffect(() => () => window.clearTimeout(press.current.timer), [])

  return (
    <>
      <Strap anchorX={anchorX} anchorY={anchorY} angle={strapAngle} length={strapLength} reach={reach} visible={reach > 0} />
      <Hook anchorX={anchorX} anchorY={anchorY} visible={reach > 0} />

      <div className="relative flex flex-col items-center" style={{ paddingTop: hang + CLIP + (wide ? 8 : 20) }}>
        <div ref={slotRef} className="relative w-[min(280px,76vw)] lg:w-[min(280px,30svh)]">
          <m.div
            ref={cardRef}
            role="button"
            tabIndex={0}
            aria-pressed={flipped}
            aria-label={`ID card for ${site.name}. Drag it, or press to flip.`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endPress}
            onPointerCancel={endPress}
            onClick={onClick}
            onContextMenu={(e) => touch && e.preventDefault()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setFlipped((f) => !f)
              }
            }}
            drag
            dragListener={false}
            dragControls={controls}
            dragConstraints={limits ?? false}
            dragElastic={0.12}
            dragSnapToOrigin
            dragTransition={{ bounceStiffness: 240, bounceDamping: 15 }}
            onDragStart={() => {
              setDragging(true)
              if (!press.current.armed) lift(1.02)
            }}
            onDragEnd={() => {
              setDragging(false)
              lift(1)
            }}
            // (the round corners are for the keyboard focus ring, so it follows the card's own corners)
            style={{ x, y, rotate: lean, scale, transformOrigin: `50% -${CLIP}px`, touchAction: touch ? 'manipulation' : 'none', borderRadius: 18 }}
            className={`relative z-30 w-full select-none [-webkit-touch-callout:none] ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            {/* two layers so each runs a single animation the GPU can take over: the swing-in, then the sway */}
            <div
              className={`card-swing ${swungIn ? 'is-in' : ''}`}
              data-paused={!onScreen || held || dragging || undefined}
              style={{ transformOrigin: `50% -${CLIP}px` }}
            >
              <div
                className={`card-sway ${swungIn ? 'is-in' : ''}`}
                data-paused={!onScreen || held || dragging || undefined}
                style={{ transformOrigin: `50% -${CLIP}px`, perspective: 1400 }}
              >
                <Clip />
                <m.div
                  ref={turnRef}
                  data-showing="front"
                  className="preserve-3d relative aspect-[5/8] w-full"
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 110, damping: 15 }}
                  // past edge-on, the other face is the one to draw; when the turn has settled, the state decides
                  onUpdate={(now) => typeof now.rotateY === 'number' && showFace(Math.cos((now.rotateY * Math.PI) / 180) < 0)}
                  onAnimationComplete={() => showFace(flipped)}
                >
                  <CardFront />
                  <CardBack />
                </m.div>
              </div>
            </div>
          </m.div>
        </div>
        <p className="eyebrow mt-6 text-center lg:mt-[clamp(8px,1.6svh,24px)]">
          {touch ? 'Hold to pick it up · tap to flip' : 'Drag the card · tap to flip'}
        </p>
      </div>
    </>
  )
}

/**
 * The strap. It is drawn from the anchor towards the card using only transforms
 * (a rotated holder that clips a long strip sliding inside it), so moving the
 * card never re-lays out or repaints anything.
 */
function Strap({
  anchorX,
  anchorY,
  angle,
  length,
  reach,
  visible,
}: {
  anchorX: MotionValue<number>
  anchorY: MotionValue<number>
  angle: MotionValue<number>
  length: MotionValue<number>
  reach: number
  visible: boolean
}) {
  const left = useTransform(() => anchorX.get() - STRAP / 2)
  const slide = useTransform(() => length.get() - reach)
  const words = useMemo(() => `${about.card.strap} • `.repeat(Math.max(4, Math.ceil(reach / 90))), [reach])
  return (
    <m.div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-20 overflow-hidden will-change-transform"
      style={{ x: left, y: anchorY, rotate: angle, originX: 0.5, originY: 0, width: STRAP, height: reach, opacity: visible ? 1 : 0 }}
    >
      <m.div className="lanyard-strap will-change-transform" style={{ y: slide, height: reach }}>
        {words}
      </m.div>
    </m.div>
  )
}

/** The wall hook the strap hangs from: a small round plate with a peg, screwed to the page. */
function Hook({ anchorX, anchorY, visible }: { anchorX: MotionValue<number>; anchorY: MotionValue<number>; visible: boolean }) {
  const left = useTransform(() => anchorX.get() - HOOK / 2)
  const top = useTransform(() => anchorY.get() - HOOK / 2 - 2)
  return (
    <m.div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-[21] grid place-items-center rounded-full border border-line bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.6)]"
      style={{ x: left, y: top, width: HOOK, height: HOOK, opacity: visible ? 1 : 0 }}
    >
      <span className="block size-2.5 rounded-full bg-clip shadow-[inset_0_1px_1px_rgb(0_0_0/0.35)]" />
    </m.div>
  )
}

/** The metal clip at the end of the strap, gripping the card's top edge (gunmetal in both themes). */
function Clip() {
  return (
    <div className="absolute left-1/2 z-10 -translate-x-1/2" style={{ top: -CLIP }} aria-hidden>
      <div className="relative h-[44px] w-[32px] rounded-[9px] bg-[linear-gradient(180deg,#4a4a4f,#1c1c1f)] shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_6px_12px_-6px_rgb(0_0_0/0.6)]">
        <div className="absolute inset-x-[8px] top-[7px] h-[7px] rounded-full bg-black/60" />
        <div className="absolute inset-x-[10px] bottom-[6px] h-[4px] rounded-full bg-white/15" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- the card -- */

/**
 * The card is drawn on a grid 300 units wide (480 tall), as it was designed; u(n) is n of those units
 * in the card's own width (cqw), so everything on it scales with the card, from a phone to the desktop.
 * Each face is its own size container. The face itself is sized by its parent, so its own corners and
 * borders stay in pixels.
 */
const u = (n: number) => `${+(n / 3).toFixed(4)}cqw`

/** The name on the back: surname on its own line, like "KRISHNA KOUSHIK / MADDUKURI". */
const words = site.name.split(' ')
const nameLines = [words.slice(0, -1).join(' '), words[words.length - 1]]

/** SVG ids must be unique on the page and plain enough for url(#…). */
const useSvgId = () => 'card' + useId().replace(/[^\w-]/g, '')

/**
 * The front. Dark mode: a black card. Light mode: a white one. In both: the red title bar with
 * the monogram (black tile, red letters), his portrait with a contact chip on its left and a
 * barcode on its right, a woven line pattern, his name and the company details, and a faint ghost
 * of the photo.
 */
function CardFront() {
  const fields = [
    { k: 'Company', v: about.card.company },
    { k: 'Engineer since', v: about.card.since },
    { k: 'Department', v: about.card.dept, wide: true },
  ]
  return (
    <div
      data-face="front"
      className="@container backface-hidden absolute inset-0 overflow-hidden rounded-[18px] border border-[var(--badge-edge)] bg-[var(--badge)] text-[var(--badge-ink)] shadow-[var(--badge-shadow)]"
    >
      <Weave height={430} style={{ top: u(50), height: u(430), color: 'var(--badge-weave)' }} />

      <div
        data-part="title-bar"
        className="absolute inset-x-0 top-0 flex items-center bg-[var(--brand-red)] text-[#160403]"
        style={{ height: u(50), padding: `0 ${u(16)} 0 ${u(14)}`, gap: u(10) }}
      >
        <MonogramTile size={u(28)} />
        <span className="font-display font-bold uppercase leading-none" style={{ fontSize: u(15), letterSpacing: '0.12em' }}>
          {about.card.title}
        </span>
        <span
          className="ml-auto font-semibold leading-none tabular-nums text-[rgb(22_4_3/0.72)]"
          style={{ fontSize: u(11.5), letterSpacing: '0.04em' }}
        >
          {about.card.idNo}
        </span>
      </div>

      <Chip style={{ left: u(22), top: u(122), width: u(34) }} />
      <img
        src={asset(site.photo)}
        // below the first screen: fetched when it is near, behind the page's script
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        alt=""
        draggable={false}
        className="pointer-events-none absolute block"
        style={{
          left: u(78),
          top: u(90),
          width: u(144),
          height: u(180),
          WebkitMaskImage: 'linear-gradient(180deg, #000 72%, transparent)',
          maskImage: 'linear-gradient(180deg, #000 72%, transparent)',
        }}
      />
      <Barcode seed={about.card.idNo + site.name} style={{ right: u(16), top: u(100), width: u(34), height: u(150) }} />

      <div className="absolute font-display font-bold uppercase leading-none" style={{ left: u(18), top: u(318), fontSize: u(16), letterSpacing: '0.02em' }}>
        {site.name}
      </div>
      <dl
        className="absolute grid grid-cols-2 border-t border-[var(--badge-line)]"
        style={{ left: u(18), right: u(18), top: u(348), paddingTop: u(10), gap: `${u(9)} ${u(12)}` }}
      >
        {fields.map((f) => (
          <div key={f.k} className={`flex min-w-0 flex-col ${f.wide ? 'col-span-2' : ''}`} style={{ gap: u(2) }}>
            <dt className="font-medium text-[var(--badge-label)]" style={{ fontSize: u(10.5), letterSpacing: '0.02em' }}>
              {f.k}
            </dt>
            <dd className="truncate font-semibold" style={{ fontSize: u(12.5) }}>
              {f.v}
            </dd>
          </div>
        ))}
      </dl>
      <div className="absolute text-[var(--badge-soft)]" style={{ left: u(18), bottom: u(12), fontSize: u(11) }}>
        {site.location}
      </div>
      {/* the ghost image: a faint second copy of the photo, as on a printed card */}
      <img
        src={asset(site.photo)}
        // below the first screen: fetched when it is near, behind the page's script
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        alt=""
        draggable={false}
        className="pointer-events-none absolute block opacity-20 grayscale"
        style={{ right: u(18), bottom: u(10), width: u(36), height: u(45) }}
      />
    </div>
  )
}

/**
 * The back, the front's opposite: paper with black type in dark mode, black with white type in
 * light mode. "If found, please return to", his name, how to reach him, a QR code that opens
 * his LinkedIn profile, and the green "open to roles" tag.
 */
function CardBack() {
  const rows = [
    { k: 'Email', v: site.email },
    { k: 'LinkedIn', v: site.linkedinLabel },
    { k: 'Based in', v: site.location },
  ]
  return (
    <div
      data-face="back"
      className="@container backface-hidden absolute inset-0 overflow-hidden rounded-[18px] bg-[var(--badge-back)] text-[var(--badge-back-ink)] shadow-[var(--badge-shadow)]"
      style={{ transform: 'rotateY(180deg)' }}
    >
      <Weave height={480} style={{ top: 0, height: u(480), color: 'var(--badge-back-weave)' }} />
      <div className="absolute inset-0 flex flex-col" style={{ padding: `${u(22)} ${u(22)} ${u(18)}` }}>
        <div className="flex items-center" style={{ gap: u(10) }}>
          <MonogramTile size={u(28)} ring />
          <span className="font-medium text-[var(--badge-back-soft)]" style={{ fontSize: u(11.5) }}>
            If found, please return to
          </span>
          <Contactless className="ml-auto block shrink-0 opacity-50" style={{ width: u(18) }} />
        </div>
        <div className="font-display font-bold uppercase leading-none" style={{ marginTop: u(16), fontSize: u(30), letterSpacing: '0.01em' }}>
          {nameLines[0]}
          <br />
          {nameLines[1]}
        </div>
        <dl className="flex flex-col" style={{ marginTop: u(14) }}>
          {rows.map((r, i) => (
            <div
              key={r.k}
              className={`flex flex-col border-t border-[var(--badge-back-line)] ${i === rows.length - 1 ? 'border-b' : ''}`}
              style={{ padding: `${u(8)} 0`, gap: u(2) }}
            >
              <dt className="font-medium text-[var(--badge-back-label)]" style={{ fontSize: u(10.5), letterSpacing: '0.02em' }}>
                {r.k}
              </dt>
              <dd className="[overflow-wrap:anywhere]" style={{ fontSize: u(13) }}>
                {r.v}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto flex items-center" style={{ gap: u(14) }}>
          <div
            className="flex shrink-0 border border-[var(--badge-qr-edge)] bg-white"
            style={{ width: u(92), height: u(92), padding: u(9), borderRadius: u(10) }}
          >
            <svg
              viewBox={`0 0 ${LINKEDIN_QR.size} ${LINKEDIN_QR.size}`}
              className="block size-full"
              shapeRendering="crispEdges"
              role="img"
              aria-label={`QR code for ${site.linkedinLabel}`}
            >
              <path fill="#000000" d={LINKEDIN_QR.path} />
            </svg>
          </div>
          <div className="flex flex-col" style={{ gap: u(4) }}>
            <span className="font-semibold" style={{ fontSize: u(12.5) }}>
              Scan to connect
            </span>
            <span className="text-[var(--badge-back-soft)]" style={{ fontSize: u(12) }}>
              LinkedIn, straight to my profile
            </span>
          </div>
        </div>
        <span
          className="inline-flex items-center self-start rounded-full bg-[var(--badge-back-pill)] text-[var(--badge-back-pill-ink)]"
          style={{ marginTop: u(14), gap: u(8), padding: `${u(7)} ${u(12)}`, fontSize: u(12) }}
        >
          <span className="live-dot shrink-0 rounded-full" style={{ width: u(7), height: u(7) }} aria-hidden />
          {site.openTo}
        </span>
      </div>
    </div>
  )
}

/** The monogram on the card: a black tile with the letters in the monogram's red. */
function MonogramTile({ size, ring = false }: { size: string; ring?: boolean }) {
  return (
    <span
      className={`block shrink-0 bg-black ${ring ? 'shadow-[inset_0_0_0_1px_rgb(255_255_255/0.22)]' : ''}`}
      style={{ width: size, height: size, borderRadius: `calc(${size} / 4)` }}
      aria-hidden
    >
      <svg viewBox="0 0 64 64" className="block size-full">
        <path className="fill-[var(--brand-red)]" d={MONOGRAM_PATH} />
      </svg>
    </span>
  )
}

/** A fine woven line pattern (two crossing waves, 48 × 12 units a repeat), under everything on a face. */
const WEAVE =
  'M0 6L4 7.8L8 9.12L12 9.6L16 9.12L20 7.8L24 6L28 4.2L32 2.88L36 2.4L40 2.88L44 4.2L48 6M0 6L4 4.2L8 2.88L12 2.4L16 2.88L20 4.2L24 6L28 7.8L32 9.12L36 9.6L40 9.12L44 7.8L48 6'

function Weave({ height, style }: { height: number; style: CSSProperties }) {
  const id = useSvgId()
  return (
    <svg viewBox={`0 0 300 ${height}`} aria-hidden className="pointer-events-none absolute inset-x-0 block w-full" style={style}>
      <defs>
        <pattern id={id} width="48" height="12" patternUnits="userSpaceOnUse">
          <path d={WEAVE} fill="none" stroke="currentColor" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="300" height={height} fill={`url(#${id})`} />
    </svg>
  )
}

/** The contact chip, in gold. */
function Chip({ style }: { style: CSSProperties }) {
  const id = useSvgId()
  return (
    <svg viewBox="0 0 34 26" aria-hidden className="pointer-events-none absolute block" style={style}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ecd393" />
          <stop offset="0.55" stopColor="#c49a4a" />
          <stop offset="1" stopColor="#e6c57e" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="33" height="25" rx="5" fill={`url(#${id})`} stroke="#7d5f25" strokeWidth="0.8" />
      <path d="M0.5 9H10.5M0.5 17H10.5M23.5 9H33.5M23.5 17H33.5M10.5 0.5V25.5M23.5 0.5V25.5M10.5 13H23.5" fill="none" stroke="#7d5f25" strokeWidth="0.8" />
    </svg>
  )
}

/** The contactless mark (four widening arcs). */
function Contactless({ className, style }: { className: string; style: CSSProperties }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={className} style={style}>
      <path
        d="M2 7.5A2.9 2.9 0 0 1 2 12.5M5.5 5A5.8 5.8 0 0 1 5.5 15M9 2.5A8.6 8.6 0 0 1 9 17.5M12.5 0.5A11 11 0 0 1 12.5 19.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** A barcode standing on end, its bars made from his ID number and name; in the card's ink. */
function Barcode({ seed, style }: { seed: string; style: CSSProperties }) {
  const path = useMemo(() => {
    let d = ''
    for (let y = 0, i = 0; seed; i++) {
      const c = seed.charCodeAt(i % seed.length)
      const h = 1 + (c % 3)
      if (y + h > 120) break
      d += `M0 ${y}h27v${h}h-27z`
      y += h + 1 + ((c >> 2) % 3)
    }
    return d
  }, [seed])
  return (
    <svg viewBox="0 0 27 120" preserveAspectRatio="none" aria-hidden className="pointer-events-none absolute block fill-current" style={style}>
      <path d={path} />
    </svg>
  )
}
