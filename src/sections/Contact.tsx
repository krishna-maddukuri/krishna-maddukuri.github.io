import { useInView } from 'motion/react'
import * as m from 'motion/react-m'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from '../lib/router'
import { site } from '../data/site'
import { useScrollTo } from '../lib/scroll'
import { GiantWord, giantWord } from '../components/GiantWord'
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
    <section id="contact" className="fit-section relative">
      <Container>
        <SectionHeading
          index="07"
          label="Contact"
          lead="Let's"
          accent="talk."
          sub="I'm open to senior software engineering roles in backend, cloud and data platforms. Email is the fastest way to reach me."
        />

        <Reveal className="mt-10 lg:mt-[clamp(16px,3svh,56px)]">
          <div className="card-shadow @container rounded-[32px] border border-line bg-surface p-6 sm:p-10 lg:p-[clamp(24px,5svh,56px)]">
            <div className="eyebrow">Email</div>
            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <span
                ref={emailRef}
                className="contact-email select-all"
              >
                {site.email}
              </span>
              <button
                type="button"
                onClick={copy}
                className="btn-solid btn-key w-fit shrink-0"
              >
                {copied ? <Check /> : <Copy />}
                {copied ? 'Copied' : 'Copy email'}
              </button>
            </div>

            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:mt-[clamp(16px,3.5svh,40px)] lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
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
                  <span className="eyebrow block">Resume</span>
                  <span className="mt-1 block text-base font-medium">Download PDF</span>
                </span>
                <ArrowDown className="size-4 shrink-0 transition-transform group-hover:translate-y-0.5" />
              </ResumeLink>
              <Link
                to="/resume"
                className="spot group flex items-center justify-between gap-3 bg-paper px-5 py-5 transition-colors hover:bg-wash"
              >
                <span>
                  <span className="eyebrow block">Web resume</span>
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

/**
 * How this visit's page actually loaded, measured by the visitor's own browser: when it first showed
 * something, when everything had arrived, and how much was sent over the network (nothing, if the browser
 * had it all saved). Filled in once the page has loaded; the line keeps its place meanwhile.
 */
function LoadLine() {
  const [text, setText] = useState('')
  useEffect(() => {
    let timer = 0
    const read = () => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
      if (!nav || nav.loadEventEnd <= 0) return
      const seconds = (ms: number) => `${(ms / 1000).toFixed(ms < 9950 ? 2 : 1)}s`
      const paint = performance.getEntriesByName('first-contentful-paint')[0]?.startTime
      const sent = (performance.getEntriesByType('resource') as PerformanceResourceTiming[]).reduce((sum, r) => sum + (r.transferSize || 0), nav.transferSize || 0)
      const parts = [paint ? `First paint ${seconds(paint)}` : '', `Loaded in ${seconds(nav.loadEventEnd)}`, sent > 1024 ? `${Math.round(sent / 1024)} KB sent` : 'From your browser’s cache']
      setText(parts.filter(Boolean).join(' · '))
    }
    const soon = () => {
      // just after the load event, so its own end time is known
      timer = window.setTimeout(read, 50)
    }
    if (document.readyState === 'complete') soon()
    else window.addEventListener('load', soon, { once: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('load', soon)
    }
  }, [])
  return (
    <p className="load-line tabular mt-4 min-h-[1.5em] font-mono text-xs text-ink-soft" aria-live="off">
      {text && <span title="Measured by your browser on this visit">{text}</span>}
    </p>
  )
}

/** The footer's word: his surname, set like the giant name over the hero. */
const fw = giantWord([site.name.split(' ').slice(-1)[0]])

export function Footer() {
  const scrollTo = useScrollTo()
  // the surname draws itself in once it is on screen
  const word = useRef<HTMLDivElement>(null)
  const seen = useInView(word, { once: true, amount: 0.5 })
  return (
    <footer
      className="wm-frame relative overflow-hidden border-t border-line pt-10"
      // the home page's red tape ends at this top line, so the footer has the page's full width (no lane)
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)', '--wm-word': fw.word, '--lane': '0px' } as CSSProperties}
    >
      <Container>
        <div className="flex flex-col gap-4 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span className="flex items-center gap-5">
            <a href={site.linkedin} target="_blank" rel="noreferrer" className="tap-target inline-flex items-center gap-1.5 transition-colors hover:text-ink">
              <LinkedInMark className="size-4 rounded-[3px]" /> LinkedIn
            </a>
            <Link to="/resume" className="tap-target transition-colors hover:text-ink">
              Resume
            </Link>
            <button type="button" onClick={() => scrollTo('top')} className="tap-target transition-colors hover:text-ink">
              Back to top ↑
            </button>
          </span>
        </div>
        <LoadLine />
      </Container>
      {/* the surname, as wide as the page's measure, in the style of the giant name over the hero */}
      <m.div
        ref={word}
        aria-hidden
        className="wm-wrap pointer-events-none mt-8 select-none"
        initial={{ y: '30%' }}
        whileInView={{ y: '0%' }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <GiantWord lines={fw.lines} play={seen} />
      </m.div>
    </footer>
  )
}
