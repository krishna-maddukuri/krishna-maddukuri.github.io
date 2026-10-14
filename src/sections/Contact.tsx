import * as m from 'motion/react-m'
import { useRef, useState } from 'react'
import { Link } from '../lib/router'
import { site } from '../data/site'
import { useScrollTo } from '../lib/scroll'
import { FitWord } from '../components/FitWord'
import { LinkedInMark } from '../components/Logo'
import { ResumeLink } from '../components/ResumeLink'
import { copyText, toast } from '../components/Toast'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Container, Copy, Reveal, SectionHeading } from '../components/ui'

export function Contact() {
  const [copied, setCopied] = useState(false)
  const emailRef = useRef<HTMLSpanElement>(null)

  const copy = async () => {
    if (await copyText(site.email)) {
      setCopied(true)
      toast('Email copied')
      setTimeout(() => setCopied(false), 2000)
      return
    }
    // Clipboard can be blocked: select the address so it can be copied by hand.
    const el = emailRef.current
    if (!el) return
    const range = document.createRange()
    range.selectNodeContents(el)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }

  return (
    <section id="contact" className="relative py-[clamp(56px,8vw,112px)]">
      <Container>
        <SectionHeading
          index="07"
          label="Contact"
          lead="Let's"
          accent="talk."
          sub="I'm open to senior software engineering roles in backend, cloud and data platforms. Email is the fastest way to reach me."
        />

        <Reveal className="mt-10 lg:mt-14">
          <div className="card-shadow rounded-[32px] border border-line bg-surface p-6 sm:p-10 lg:p-14">
            <div className="eyebrow">Email</div>
            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <span
                ref={emailRef}
                className="select-all font-display text-[clamp(1.2rem,5.2vw,4.4rem)] font-bold leading-none tracking-[-0.04em] [overflow-wrap:anywhere]"
              >
                {site.email}
              </span>
              <button
                type="button"
                onClick={copy}
                className="btn-solid inline-flex h-12 w-fit shrink-0 items-center gap-2.5 rounded-full bg-ink px-6 text-sm font-medium text-paper"
              >
                {copied ? <Check /> : <Copy />}
                {copied ? 'Copied' : 'Copy email'}
              </button>
            </div>

            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
              <a
                href={site.linkedin}
                target="_blank"
                rel="noreferrer"
                className="spot group flex items-center justify-between gap-3 bg-paper px-5 py-5 transition-colors hover:bg-wash"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <LinkedInMark className="size-8 shrink-0 rounded-[7px]" />
                  <span className="min-w-0">
                    <span className="eyebrow block">LinkedIn</span>
                    <span className="mt-1 block text-base font-medium [overflow-wrap:anywhere]">{site.linkedinLabel}</span>
                  </span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <ResumeLink className="spot group flex items-center justify-between gap-3 bg-paper px-5 py-5 transition-colors hover:bg-wash">
                <span>
                  <span className="eyebrow block">Résumé</span>
                  <span className="mt-1 block text-base font-medium">Download PDF</span>
                </span>
                <ArrowDown className="size-4 shrink-0 transition-transform group-hover:translate-y-0.5" />
              </ResumeLink>
              <Link
                to="/resume"
                className="spot group flex items-center justify-between gap-3 bg-paper px-5 py-5 transition-colors hover:bg-wash"
              >
                <span>
                  <span className="eyebrow block">Web résumé</span>
                  <span className="mt-1 block text-base font-medium">Read it here</span>
                </span>
                <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <div className="flex items-center justify-between gap-3 bg-paper px-5 py-5">
                <span>
                  <span className="eyebrow block">Based in</span>
                  <span className="mt-1 block text-base font-medium">{site.location}</span>
                </span>
                <span className="live-dot size-2.5 shrink-0 rounded-full" aria-hidden />
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

export function Footer() {
  const scrollTo = useScrollTo()
  return (
    <footer className="relative overflow-hidden border-t border-line pt-10" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)' }}>
      <Container>
        <div className="flex flex-col gap-4 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span className="flex items-center gap-5">
            <a href={site.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-ink">
              <LinkedInMark className="size-4 rounded-[3px]" /> LinkedIn
            </a>
            <Link to="/resume" className="transition-colors hover:text-ink">
              Resume
            </Link>
            <button type="button" onClick={() => scrollTo('top')} className="transition-colors hover:text-ink">
              Back to top ↑
            </button>
          </span>
        </div>
      </Container>
      {/* the surname, edge to edge: as wide as the page, whatever the screen */}
      <m.div
        aria-hidden
        className="watermark pointer-events-none mt-8 select-none font-display font-extrabold"
        style={{ fontOpticalSizing: 'auto' }}
        initial={{ y: '30%' }}
        whileInView={{ y: '0%' }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <FitWord text={site.shortName.split(' ')[1] ?? site.first} />
      </m.div>
    </footer>
  )
}
