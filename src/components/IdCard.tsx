import { animate, useDragControls, useInView, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import * as m from 'motion/react-m'
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'
import { about, site } from '../data/site'
import { useMedia } from '../hooks/useMedia'

const CLIP = 34 // the metal clip sits this far above the card's top edge
const STRAP = 18 // strap width
const HANG = 118 // the strap's length at rest, from the hook down to the clip
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
      anchorY.set(Math.max(0, top - CLIP - HANG))
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
  }, [sectionRef, wide, anchorX, anchorY, restTop])

  // Swing in when the section scrolls into view, then sway gently (in CSS, so it
  // costs nothing while you scroll). The sway pauses off-screen and while held.
  const swungIn = useInView(slotRef, { once: true, amount: 0.3 })
  const onScreen = useInView(slotRef, { margin: '160px 0px' })
  const [held, setHeld] = useState(false)
  const [dragging, setDragging] = useState(false)

  const [flipped, setFlipped] = useState(false)
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

      <div className="relative flex flex-col items-center" style={{ paddingTop: HANG + CLIP + (wide ? 8 : 20) }}>
        <div ref={slotRef} className="relative w-[min(280px,76vw)]">
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
            style={{ x, y, rotate: lean, scale, transformOrigin: `50% -${CLIP}px`, touchAction: touch ? 'manipulation' : 'none' }}
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
                  className="preserve-3d relative aspect-[5/8] w-full"
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 110, damping: 15 }}
                >
                  <CardFront />
                  <CardBack />
                </m.div>
              </div>
            </div>
          </m.div>
        </div>
        <p className="eyebrow mt-6 text-center">
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
  const words = useMemo(() => `${site.first} · ${about.card.strap} · `.repeat(Math.max(4, Math.ceil(reach / 90))), [reach])
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

function Clip() {
  return (
    <div className="absolute left-1/2 z-10 -translate-x-1/2" style={{ top: -CLIP }} aria-hidden>
      <div className="relative h-[40px] w-[30px] rounded-[9px] border border-black/10 bg-clip shadow-[0_4px_10px_-4px_rgba(0,0,0,0.4)]">
        <div className="absolute inset-x-[7px] top-[6px] h-[8px] rounded-full bg-black/15" />
        <div className="absolute inset-x-[9px] bottom-[5px] h-[5px] rounded-full bg-black/25" />
      </div>
    </div>
  )
}

/** The name printed on the card: surname on its own line, like "KRISHNA KOUSHIK / MADDUKURI". */
const words = site.name.split(' ')
const nameLines = [words.slice(0, -1).join(' '), words[words.length - 1]]

function CardFront() {
  const fields = [
    { k: 'ID no', v: about.card.idNo },
    { k: 'Dept', v: about.card.dept },
    { k: 'Since', v: about.card.since },
  ]
  return (
    <div className="backface-hidden absolute inset-0 flex flex-col overflow-hidden rounded-[20px] border border-black/10 bg-white text-[var(--card-ink)] shadow-[0_30px_60px_-30px_rgba(20,22,40,0.55)]">
      <div className="flex items-center gap-3 bg-[var(--card-ink)] px-4 py-3.5 text-white">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white font-display text-[12px] font-bold text-[var(--card-ink)]">
          {site.monogram}
        </span>
        <div className="min-w-0 leading-tight">
          <div className="font-display text-[13.5px] font-bold uppercase tracking-[0.12em]">{about.card.title}</div>
          <div className="mt-0.5 text-[11px] opacity-75">{about.card.sub}</div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center px-5 pt-5">
        <div className="grid aspect-[4/5] w-[52%] place-items-center overflow-hidden rounded-[14px] border-2 border-[var(--card-ink)] bg-[#ebe9e2]">
          {site.photo ? (
            <img src={site.photo} alt="" className="pointer-events-none h-full w-full object-cover" draggable={false} />
          ) : (
            <span className="font-serif text-[3.4rem] italic leading-none text-[var(--card-ink)]">{site.monogram}</span>
          )}
        </div>
        <div className="mt-4 text-center font-display text-[16px] font-bold uppercase leading-[1.1] tracking-[0.02em]">
          {nameLines[0]}
          <br />
          {nameLines[1]}
        </div>
        <div className="mt-1 text-[12px] text-[#5b5b5b]">{site.role}</div>

        <dl className="mt-4 grid w-full grid-cols-3 gap-2 text-center">
          {fields.map((f) => (
            <div key={f.k} className="min-w-0">
              <dt className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[#5b5b5b]">{f.k}</dt>
              <dd className="mt-0.5 truncate text-[12.5px] font-semibold">{f.v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex w-full items-end justify-between pb-4 pt-3">
          <Barcode seed={about.card.idNo + site.name} />
          <span
            className="size-9 rounded-full border border-black/10"
            style={{ background: 'conic-gradient(from 40deg, #d9d3ff, #c9f1e8, #f7e6b9, #f6c9de, #d9d3ff)' }}
            aria-hidden
          />
        </div>
      </div>
    </div>
  )
}

function CardBack() {
  const rows = [
    { k: 'Email', v: site.email },
    { k: 'LinkedIn', v: site.linkedinLabel },
    { k: 'Based in', v: site.location },
  ]
  return (
    <div
      className="backface-hidden absolute inset-0 flex flex-col rounded-[20px] border border-[var(--card-edge)] bg-[var(--card-ink)] p-6 text-white shadow-[0_30px_60px_-30px_rgba(20,22,40,0.55)]"
      style={{ transform: 'rotateY(180deg)' }}
    >
      <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] opacity-65">If found, please return to</div>
      <div className="mt-3 font-display text-[1.6rem] font-bold leading-[1.05] tracking-[-0.03em]">{site.name}</div>
      <dl className="mt-6 flex flex-col">
        {rows.map((r) => (
          <div key={r.k} className="border-t border-white/15 py-2.5">
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-65">{r.k}</dt>
            <dd className="mt-0.5 text-[13.5px] [overflow-wrap:anywhere]">{r.v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-auto">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12px]">
          <span className="live-dot size-1.5 rounded-full" aria-hidden />
          {site.openTo}
        </span>
        <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] opacity-55">Tap to flip back</div>
      </div>
    </div>
  )
}

function Barcode({ seed }: { seed: string }) {
  const bars = useMemo(() => {
    const out: { x: number; w: number }[] = []
    let x = 0
    for (let i = 0; i < seed.length && x < 96; i++) {
      const c = seed.charCodeAt(i)
      const w = 1 + (c % 3)
      out.push({ x, w })
      x += w + 1 + ((c >> 2) % 3)
    }
    return out
  }, [seed])
  return (
    <svg viewBox="0 0 100 26" className="h-[26px] w-[100px] shrink-0" aria-hidden>
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y="0" width={b.w} height="26" className="fill-[var(--card-ink)]" />
      ))}
    </svg>
  )
}
