import { useInView, useScroll, useSpring } from 'motion/react'
import type { RefObject } from 'react'
import * as m from 'motion/react-m'
import { useRef, useState, type CSSProperties } from 'react'
import { timeline, type Milestone } from '../data/site'
import { OrgMark } from '../components/Logo'
import { Container, EASE, SectionHeading } from '../components/ui'
import { CSS_SCROLL } from '../lib/scrollTimeline'

/** The red line's fill from script, for browsers without CSS scroll-driven animations (elsewhere: `.tl-fill` in index.css). */
function useScriptFill(ref: RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 55%'] })
  return useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })
}
const useFill: (ref: RefObject<HTMLElement | null>) => ReturnType<typeof useScriptFill> | null = CSS_SCROLL ? () => null : useScriptFill

/**
 * The "Education & experience." timeline: a centre line, big years, cards alternating sides. It runs over
 * more than one screen; on wide screens its sizes follow the screen's height, like the other sections.
 */
export function Experience() {
  const listRef = useRef<HTMLDivElement>(null)
  const progress = useFill(listRef)

  return (
    <section id="experience" className="fit-section relative">
      <Container>
        <SectionHeading
          index="05"
          label="Experience"
          lead="Education &"
          accent="experience."
          aside={
            <p className="text-base text-ink-soft">
              From React front ends at Infosys to a master&rsquo;s at George Mason, then cloud backends at NGA Group and Capital One.
            </p>
          }
        />

        <div
          ref={listRef}
          className="tl-scroll relative mt-12 lg:mt-[clamp(16px,3.2svh,64px)] lg:[--tl-mark:clamp(34px,4.6svh,44px)] lg:[--tl-pad:clamp(16px,2.6svh,28px)]"
        >
          {/* the line: left on phones, centre on desktop */}
          <div className="absolute bottom-0 left-[7px] top-0 w-px bg-line lg:left-1/2" aria-hidden />
          <m.div
            className="tl-fill absolute bottom-0 left-[6px] top-0 w-[3px] origin-top bg-accent shadow-[0_0_0_1px_var(--accent-ring)] lg:left-1/2 lg:-translate-x-[1px]"
            style={progress ? { scaleY: progress } : undefined}
            aria-hidden
          />

          <div className="flex flex-col gap-12 lg:gap-[clamp(12px,2.2svh,24px)]">
            {timeline.map((m, i) => (
              <Row key={`${m.title} · ${m.org}`} ms={m} left={i % 2 === 0} showYear={i === 0 || timeline[i - 1].year !== m.year} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

/**
 * A year whose digits roll into place, like a counter, once `play` is set (`.yr` in index.css). Each digit
 * keeps its own width (the real digit is there, unseen, under a strip of seven that ends on it), so the year
 * is set exactly as plain text would be. Read aloud as the plain year.
 */
function Year({ value, play }: { value: string | number; play: boolean }) {
  const text = String(value)
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden className={`yr ${play ? 'is-rolling' : ''}`}>
        {[...text].map((ch, i) =>
          /\d/.test(ch) ? (
            <span key={i} className="yr-cell" style={{ '--i': i } as CSSProperties}>
              <span className="yr-digit">{ch}</span>
              <span className="yr-strip">
                {Array.from({ length: 7 }, (_, k) => (
                  <span key={k}>{(Number(ch) + 4 + k) % 10}</span>
                ))}
              </span>
            </span>
          ) : (
            ch
          ),
        )}
      </span>
    </>
  )
}

function Row({ ms, left, showYear }: { ms: Milestone; left: boolean; showYear: boolean }) {
  // the year rolls as it comes in; the dot pops when the red line reaches it (70% of the way down the screen)
  const [rolled, setRolled] = useState(false)
  const dotRef = useRef<HTMLSpanElement>(null)
  const reached = useInView(dotRef, { once: true, margin: '0px 0px -30% 0px' })
  const year = (
    <div className={`flex items-center ${left ? 'lg:justify-start' : 'lg:justify-end'}`}>
      {showYear && (
        <m.span
          className="font-display text-[clamp(2.6rem,5.6vw,5.2rem)] font-extrabold leading-none text-ink lg:text-[length:min(5.2rem,5.6vw,8svh)]"
          initial={{ opacity: 0, x: left ? -24 : 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          onViewportEnter={() => setRolled(true)}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <Year value={ms.year} play={rolled} />
        </m.span>
      )}
    </div>
  )

  const card = (
    <m.article
      className="lift spot rounded-[22px] border border-line bg-surface p-6 sm:p-7 lg:p-[var(--tl-pad)]"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.05, ease: EASE, delay: 0.12 }}
    >
      {/* the mark, the kind and the dates; on a narrow card the dates drop to their own line */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="flex items-center gap-3">
          <OrgMark label={ms.org} className="size-11 rounded-[13px] text-[13px] lg:size-[var(--tl-mark)]" />
          <span className="rounded-md bg-chip px-2.5 py-1 font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">{ms.kind}</span>
        </span>
        <span className="tabular ml-auto font-mono text-xs text-ink-soft">{ms.period}</span>
      </div>
      <h3 className="mt-5 font-display text-[clamp(1.45rem,2.2vw,1.9rem)] font-bold leading-[1.1] lg:mt-[clamp(8px,1.6svh,20px)] lg:text-[length:min(1.9rem,2.2vw,3.3svh)]">
        {ms.title}
      </h3>
      <p className="mt-1.5 text-sm text-ink-soft">{ms.org}</p>
      <div className="mt-5 lg:mt-[clamp(8px,1.6svh,20px)]">
        {ms.current ? (
          <span className="tool-chip tool-chip--live">
            <span className="live-dot size-1.5 rounded-full" aria-hidden /> {ms.badge}
          </span>
        ) : (
          <span className="tool-chip">{ms.badge}</span>
        )}
      </div>
    </m.article>
  )

  return (
    <div className="relative grid gap-4 pl-10 lg:grid-cols-2 lg:gap-x-20 lg:pl-0">
      {/* dot on the line, level with the middle of the card's mark */}
      <span
        ref={dotRef}
        className={`tl-dot ${reached ? 'is-reached' : ''} absolute left-0 top-3 size-[15px] rounded-full border-2 lg:left-1/2 lg:top-[calc(var(--tl-pad)_+_var(--tl-mark)_/_2_-_7.5px)] lg:-translate-x-1/2 ${
          ms.current ? 'border-[color:var(--accent-ring)] bg-accent' : 'border-ink bg-paper'
        }`}
        aria-hidden
      />
      {left ? (
        <>
          <div className="order-2 lg:order-1">{card}</div>
          <div className="order-1 lg:order-2 lg:pt-3">{year}</div>
        </>
      ) : (
        <>
          <div className="order-1 lg:pt-3">{year}</div>
          <div className="order-2">{card}</div>
        </>
      )}
    </div>
  )
}
