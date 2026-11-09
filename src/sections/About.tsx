import { useEffect, useRef, useState } from 'react'
import { about, site } from '../data/site'
import { IdCard } from '../components/IdCard'
import { LinkedInMark } from '../components/Logo'
import { ResumeLink } from '../components/ResumeLink'
import { Accent, ArrowDown, ArrowUpRight, Container, Eyebrow, Reveal, Rich } from '../components/ui'

/**
 * About: "Hi, I'm Krishna." on one line; his path in a panel (as on portfolio-2) with the motto on
 * one line and the Résumé and LinkedIn keys; the quick facts under it; the hanging ID card on the
 * right. On phones: the heading, the panel, the card, then the facts.
 */
export function About() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section id="about" ref={sectionRef} className="relative py-[clamp(56px,8vw,112px)]">
      <Container>
        <div className="about-grid">
          <div className="relative z-10 min-w-0 [grid-area:head]">
            <Eyebrow index="01" label="About" />
            <Reveal>
              <h2 className="mt-5 whitespace-nowrap font-display text-[clamp(2.4rem,5.4vw,4.9rem)] font-bold leading-[0.95]">
                Hi, I&rsquo;m <Accent>{about.hello}</Accent>
              </h2>
            </Reveal>
          </div>

          <Reveal delay={0.05} className="relative z-10 min-w-0 [grid-area:panel]">
            <div className="about-panel">
              <p className="about-lead">
                <Rich text={about.lead} />
              </p>
              <p className="about-more">{about.more}</p>
              {/* the motto, in his own hand beside a red rule, on one line */}
              <p className="about-quote">
                <span className="accent-tail">&ldquo;{about.quote}&rdquo;</span>
              </p>
              <div className="mt-[clamp(22px,3vw,32px)] flex flex-wrap items-center gap-3">
                <ResumeLink className="btn-solid btn-key btn-key--red">
                  Résumé <ArrowDown className="size-4" />
                </ResumeLink>
                <a href={site.linkedin} target="_blank" rel="noreferrer" className="lift btn-fill btn-key">
                  <LinkedInMark className="size-5 rounded-[5px]" />
                  LinkedIn <ArrowUpRight className="size-3.5" />
                </a>
              </div>
            </div>
          </Reveal>

          {/* the lanyard card: the right column on wide screens (its strap is drawn across the whole section) */}
          <div className="min-w-0 [grid-area:card]">
            <IdCard sectionRef={sectionRef} />
          </div>

          <div className="relative z-10 min-w-0 [grid-area:facts]">
            <div className="eyebrow">Quick facts</div>
            <dl className="about-facts mt-4">
              {about.facts.map((f, i) => (
                <Reveal key={f.k} delay={0.04 * i} y={12} className="about-fact">
                  <dt className="eyebrow">{f.k}</dt>
                  <dd className="mt-2.5 text-[15px] font-semibold leading-snug sm:text-[17px]">{f.v}</dd>
                  <dd className="mt-1 text-[13px] text-ink-soft sm:text-sm">{f.clock ? <LocalTime note={f.note} /> : f.note}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  )
}

const clockFormat = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' })
const clockNow = () => clockFormat.format(new Date())

/** His local time in Richmond, kept to the minute: "12:51 AM · Eastern Time". */
function LocalTime({ note }: { note: string }) {
  const [now, setNow] = useState(clockNow)
  useEffect(() => {
    const id = window.setInterval(() => setNow(clockNow()), 15_000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <>
      <span className="tabular">{now}</span> · {note}
    </>
  )
}
