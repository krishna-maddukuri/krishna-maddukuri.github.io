import { useRef } from 'react'
import { about, site } from '../data/site'
import { IdCard } from '../components/IdCard'
import { LinkedInMark } from '../components/Logo'
import { ResumeLink } from '../components/ResumeLink'
import { Accent, ArrowDown, ArrowUpRight, Container, Eyebrow, Reveal, Rich } from '../components/ui'

/** About: the hanging ID card on the left, "Hi, I'm …" in the middle, quick facts on the right. */
export function About() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section id="about" ref={sectionRef} className="relative py-[clamp(56px,8vw,112px)]">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.84fr)_minmax(0,0.98fr)] lg:gap-10 xl:gap-14">
          {/* hello (first on phones; the left column on wide screens) */}
          <div className="relative z-10 min-w-0">
            <Eyebrow index="01" label="About" />
            <Reveal>
              <h2 className="mt-5 font-display text-[clamp(2.8rem,5.4vw,4.9rem)] font-bold leading-[0.95] tracking-[-0.04em]">
                Hi, I&rsquo;m <Accent>{about.hello}</Accent>
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-7 max-w-[52ch] text-lg leading-[1.55] text-ink/85">
                <Rich text={about.lead} />
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 max-w-[52ch] text-base text-ink-soft">{about.more}</p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ResumeLink className="btn-solid inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-paper">
                  Résumé <ArrowDown className="size-4" />
                </ResumeLink>
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="lift btn-fill inline-flex h-12 items-center gap-2.5 rounded-full border border-line bg-surface pl-4 pr-6 text-sm font-medium transition-colors"
                >
                  <LinkedInMark className="size-5 rounded-[5px]" />
                  LinkedIn <ArrowUpRight className="size-3.5" />
                </a>
              </div>
            </Reveal>
          </div>

          {/* the lanyard card: the middle column on wide screens (its strap is drawn across the whole section) */}
          <div className="min-w-0">
            <IdCard sectionRef={sectionRef} />
          </div>

          {/* right: quick facts */}
          <div className="relative z-10 min-w-0 lg:pt-2">
            <div className="eyebrow">Quick facts</div>
            <dl className="mt-4">
              {about.facts.map((f, i) => (
                <Reveal key={f.k} delay={0.05 * i} y={12} className="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
                  <dt className="shrink-0 text-sm text-ink-soft">{f.k}</dt>
                  <dd className="text-right text-sm font-medium">{f.v}</dd>
                </Reveal>
              ))}
            </dl>
            <Reveal delay={0.2}>
              <p className="mt-8 font-serif text-[clamp(1.7rem,2.4vw,2.2rem)] italic leading-[1.15]">
                <span className="accent-tail">&ldquo;{about.quote}&rdquo;</span>
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  )
}
