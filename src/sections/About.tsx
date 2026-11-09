import { useRef } from 'react'
import { about, site } from '../data/site'
import { IdCard } from '../components/IdCard'
import { LinkedInMark } from '../components/Logo'
import { ResumeLink } from '../components/ResumeLink'
import { Accent, ArrowDown, ArrowUpRight, Container, Eyebrow, Reveal, Rich } from '../components/ui'

/**
 * About: "Hi, I'm Krishna." on one line; his path in a panel (as on portfolio-2) with the motto on
 * one line and the Resume and LinkedIn keys (as in the hero); the hanging ID card on the right; the
 * quick facts across the width under both. On wide screens it is sized to the screen's height, so the
 * whole section fits on one screen. On phones: the heading, the panel, the card, then the facts.
 */
export function About() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section id="about" ref={sectionRef} className="about-section relative">
      <Container>
        <div className="about-grid">
          <div className="relative z-10 min-w-0 [grid-area:head]">
            <Eyebrow index="01" label="About" />
            <Reveal>
              <h2 className="about-title whitespace-nowrap font-display font-bold leading-[0.95]">
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
              <div className="about-actions flex flex-wrap items-center gap-3">
                <ResumeLink className="glass-press btn-fill btn-key">
                  Resume <ArrowDown className="size-3.5" />
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
            <dl className="about-facts">
              {about.facts.map((f, i) => (
                <Reveal key={f.k} delay={0.04 * i} y={12} className="about-fact">
                  <dt className="eyebrow">{f.k}</dt>
                  <dd className="about-fact-value">{f.v}</dd>
                  {f.note && <dd className="about-fact-note">{f.note}</dd>}
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  )
}
