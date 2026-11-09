import { animate, useInView, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import * as m from 'motion/react-m'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { achievements, type Achievement } from '../data/site'
import { useMedia } from '../hooks/useMedia'
import { Icon } from '../components/icons'
import { OrgMark } from '../components/Logo'
import { orgFor } from '../data/logos'
import { ArrowRight, Container, SectionHeading } from '../components/ui'
import { CSS_SCROLL } from '../lib/scrollTimeline'

const heading = (
  <SectionHeading
    index="06"
    label="Achievements"
    lead="Proud"
    accent="moments."
  />
)

export function Achievements() {
  const reduce = useReducedMotion()
  const wide = useMedia('(min-width: 768px)', true)
  return wide && !reduce ? <PinnedTrack /> : <SwipeTrack />
}

/** The pinned track's slide and its progress line from script, for browsers without CSS scroll-driven animations. */
function useScriptSlide(ref: RefObject<HTMLElement | null>, dist: MotionValue<number>) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(() => -scrollYProgress.get() * dist.get())
  return { x, scrollYProgress }
}
const useSlide: (ref: RefObject<HTMLElement | null>, dist: MotionValue<number>) => ReturnType<typeof useScriptSlide> | null = CSS_SCROLL
  ? () => null
  : useScriptSlide

/**
 * Desktop: the section pins and scrolling down slides the cards sideways. Where the browser can, the slide
 * and the progress line follow the scroll in CSS (`.ach-track`, `.ach-progress` in index.css, by the distance
 * in --ach-dist), with no script per frame.
 */
function PinnedTrack() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [dist, setDist] = useState(0)
  const distMV = useMotionValue(0)

  useLayoutEffect(() => {
    const measure = () => {
      const t = trackRef.current
      if (!t) return
      const d = Math.max(0, t.scrollWidth - document.documentElement.clientWidth)
      setDist(d)
      distMV.set(d)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (trackRef.current) ro.observe(trackRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [distMV])

  const script = useSlide(sectionRef, distMV)

  return (
    <section
      id="achievements"
      ref={sectionRef}
      className="ach-scroll relative"
      style={{ height: `calc(100svh + ${dist}px)`, '--ach-dist': `${dist}px` } as CSSProperties}
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center gap-10 overflow-hidden py-16 lg:gap-[clamp(28px,5svh,56px)]">
        <Container>{heading}</Container>

        <m.div
          ref={trackRef}
          style={script ? { x: script.x } : undefined}
          className="ach-track flex w-max items-center gap-6 px-[max(24px,calc((100vw-1440px)/2+40px))] py-4"
        >
          {achievements.map((a, i) => (
            <Card key={a.title} a={a} i={i} />
          ))}
          <EndNote />
        </m.div>

        <Container>
          <div className="flex items-center gap-5">
            <div className="relative h-px flex-1 bg-line">
              <m.div className="ach-progress absolute inset-0 origin-left bg-ink" style={script ? { scaleX: script.scrollYProgress } : undefined} />
            </div>
            <span className="eyebrow inline-flex items-center gap-2">
              Keep scrolling <ArrowRight className="size-3" />
            </span>
          </div>
        </Container>
      </div>
    </section>
  )
}

/** Phones (and reduced motion): a native swipeable row. */
function SwipeTrack() {
  return (
    <section id="achievements" className="relative py-[clamp(56px,8vw,112px)]">
      <Container>{heading}</Container>
      <div
        className="no-scrollbar mt-10 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overscroll-x-contain px-4 pb-6 pt-2 sm:scroll-px-6 sm:px-6"
        role="region"
        aria-label="Achievements, swipe sideways"
        tabIndex={0}
      >
        {achievements.map((a, i) => (
          <Card key={a.title} a={a} i={i} />
        ))}
        <EndNote />
      </div>
      <Container>
        <p className="eyebrow mt-2 inline-flex items-center gap-2">
          Swipe <ArrowRight className="size-3" />
        </p>
      </Container>
    </section>
  )
}

function Card({ a, i }: { a: Achievement; i: number }) {
  return (
    <article className="lift spot relative flex h-[min(300px,46svh)] min-h-[260px] w-[min(84vw,440px)] shrink-0 snap-start flex-col justify-between rounded-[26px] border border-line bg-surface p-6 sm:p-7 lg:w-[460px]">
      <div className="flex items-start justify-between">
        {orgFor(a.source) ? (
          <OrgMark label={a.source} className="size-14 rounded-2xl text-[15px]" />
        ) : (
          <span className="grid size-14 place-items-center rounded-2xl border border-line bg-paper shadow-sm">
            <Icon name={a.icon} className="size-7" stroke={1.5} />
          </span>
        )}
        <span className="eyebrow tabular">
          {String(i + 1).padStart(2, '0')} / {String(achievements.length).padStart(2, '0')}
        </span>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0 pb-1">
          <div className="font-display text-[1.2rem] font-bold leading-tight sm:text-[1.3rem]">{a.title}</div>
          <div className="eyebrow mt-1.5">{a.source}</div>
          <div className="mt-2 text-sm leading-snug text-ink-soft">{a.detail}</div>
        </div>
        <div className="shrink-0 font-display text-[clamp(3.6rem,6.5vw,5.6rem)] font-bold leading-[0.8]">
          <span className="accent-num">
            <CountUp value={a.value} />
            <span className="text-accent-display/40">{a.suffix}</span>
          </span>
        </div>
      </div>
    </article>
  )
}

/** Counts up once it scrolls into view. It writes the digits straight into the text, so React doesn't re-render 60 times a second. */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0 })
  useEffect(() => {
    const text = ref.current?.firstChild
    if (!inView || !text) return
    const c = animate(0, value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        text.nodeValue = String(Math.round(v))
      },
    })
    return () => {
      c.stop()
      text.nodeValue = String(value)
    }
  }, [inView, value])
  return (
    <span ref={ref} className="tabular">
      {value}
    </span>
  )
}

function EndNote() {
  return (
    <div className="flex w-[260px] shrink-0 snap-start items-center gap-4 pr-6" aria-hidden>
      <span className="h-px w-16 bg-ink/40" />
      <span className="accent-tail text-[2.4rem] leading-none">and counting.</span>
    </div>
  )
}
