import { useScroll, useSpring } from 'motion/react'
import * as m from 'motion/react-m'
import { useRef } from 'react'
import { timeline, type Milestone } from '../data/site'
import { OrgMark } from '../components/Logo'
import { Container, EASE, SectionHeading } from '../components/ui'

/** The "Education & experience." timeline: a centre line, big years, cards alternating sides. */
export function Experience() {
  const listRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 70%', 'end 55%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })

  return (
    <section id="experience" className="relative py-[clamp(56px,8vw,112px)]">
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

        <div ref={listRef} className="relative mt-12 lg:mt-16">
          {/* the line: left on phones, centre on desktop */}
          <div className="absolute bottom-0 left-[7px] top-0 w-px bg-line lg:left-1/2" aria-hidden />
          <m.div
            className="absolute bottom-0 left-[6px] top-0 w-[3px] origin-top bg-accent shadow-[0_0_0_1px_var(--accent-ring)] lg:left-1/2 lg:-translate-x-[1px]"
            style={{ scaleY: progress }}
            aria-hidden
          />

          <div className="flex flex-col gap-12 lg:gap-6">
            {timeline.map((m, i) => (
              <Row key={`${m.title} · ${m.org}`} ms={m} left={i % 2 === 0} showYear={i === 0 || timeline[i - 1].year !== m.year} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

function Row({ ms, left, showYear }: { ms: Milestone; left: boolean; showYear: boolean }) {
  const year = (
    <div className={`flex items-center ${left ? 'lg:justify-start' : 'lg:justify-end'}`}>
      {showYear && (
        <m.span
          className="font-display text-[clamp(2.6rem,5.6vw,5.2rem)] font-extrabold leading-none tracking-[-0.05em] text-ink"
          initial={{ opacity: 0, x: left ? -24 : 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          {ms.year}
        </m.span>
      )}
    </div>
  )

  const card = (
    <m.article
      className="lift spot rounded-[22px] border border-line bg-surface p-6 sm:p-7"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.05, ease: EASE, delay: 0.12 }}
    >
      {/* the mark, the kind and the dates; on a narrow card the dates drop to their own line */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="flex items-center gap-3">
          <OrgMark label={ms.org} className="size-11 rounded-[13px] text-[13px]" />
          <span className="rounded-md bg-chip px-2.5 py-1 font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">{ms.kind}</span>
        </span>
        <span className="tabular ml-auto font-mono text-xs text-ink-soft">{ms.period}</span>
      </div>
      <h3 className="mt-5 font-display text-[clamp(1.45rem,2.2vw,1.9rem)] font-bold leading-[1.1] tracking-[-0.025em]">{ms.title}</h3>
      <p className="mt-1.5 text-sm text-ink-soft">{ms.org}</p>
      <div className="mt-5">
        {ms.current ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 text-sm font-medium text-paper">
            <span className="live-dot size-1.5 rounded-full" aria-hidden /> {ms.badge}
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-chip px-3.5 py-1.5 text-sm font-medium">{ms.badge}</span>
        )}
      </div>
    </m.article>
  )

  return (
    <div className="relative grid gap-4 pl-10 lg:grid-cols-2 lg:gap-x-20 lg:pl-0">
      {/* dot on the line */}
      <span
        className={`absolute left-0 top-3 size-[15px] rounded-full border-2 lg:left-1/2 lg:top-8 lg:-translate-x-1/2 ${
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
