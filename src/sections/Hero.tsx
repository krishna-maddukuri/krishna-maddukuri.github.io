import { animate, useInView, useMotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react'
import * as m from 'motion/react-m'
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { site } from '../data/site'
import { useMedia } from '../hooks/useMedia'
import { onHome } from '../lib/home'
import { useScrollTo } from '../lib/scroll'
import { ResumeLink } from '../components/ResumeLink'
import { GiantWord, giantWord } from '../components/GiantWord'
import { HeroMedia } from '../components/HeroMedia'
import { ArrowDown, ArrowRight, EASE, plain, richWords } from '../components/ui'

/** The giant name behind the hero: his first and middle names on one line (the surname is the footer's word). */
const wm = giantWord([site.name.split(' ').slice(0, -1).join(' ')])

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const scrollTo = useScrollTo()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const wmY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const wmFade = useTransform(scrollYProgress, [0, 0.8], [1, 0.2])
  const figY = useTransform(scrollYProgress, [0, 1], ['0%', '-6%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  // Phones and tablets skip the scroll-linked drift and the blur-in: native scrolling stays
  // smooth when the page isn't moving things on every frame.
  const touch = useMedia('(pointer: coarse)')
  // the words drift and fade only where they open the page (wide screens); below 1024px they come after the
  // figure, a screen down, and must be fully there when you reach them
  const wide = useMedia('(min-width: 1024px)')
  const drift = wide && !touch

  // the name draws itself in once its font is in (or after a moment, if the font is slow), so the
  // outline is never drawn in the fallback font and swapped mid-way
  const [wmPlay, setWmPlay] = useState(false)
  // the two columns end on one line: the list beside his figure is stretched to the foot of the buttons,
  // with his stack at its bottom (measured from layout offsets, so the scroll drift doesn't count)
  const copyRef = useRef<HTMLDivElement>(null)
  const sideRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const copy = copyRef.current
    const side = sideRef.current
    const cta = copy?.querySelector<HTMLElement>('.hero-cta')
    if (!copy || !side || !cta) return
    const wide = window.matchMedia('(min-width: 1280px)')
    const fit = () => {
      side.style.minHeight = ''
      if (!wide.matches) return
      const bottom = copy.offsetTop + cta.offsetTop + cta.offsetHeight
      side.style.minHeight = `${Math.max(0, bottom - side.offsetTop)}px`
    }
    const watch = new ResizeObserver(fit)
    watch.observe(copy)
    watch.observe(document.documentElement)
    document.fonts?.ready.then(fit)
    fit()
    return () => watch.disconnect()
  }, [])
  useEffect(() => {
    let done = false
    const go = () => {
      if (!done) {
        done = true
        setWmPlay(true)
      }
    }
    const t = setTimeout(go, 1500)
    document.fonts?.load('700 100px "Antonio"').then(go, go)
    return () => clearTimeout(t)
  }, [])
  // and draws itself in again each time the page comes home (the name in the header)
  useEffect(
    () =>
      onHome(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        setWmPlay(false)
        requestAnimationFrame(() => requestAnimationFrame(() => setWmPlay(true)))
      }),
    [],
  )
  return (
    <section
      id="top"
      ref={ref}
      className="wm-frame wm-frame--hero relative isolate flex flex-col overflow-hidden lg:block"
      style={
        {
          minHeight: 'min(100svh, 1000px)',
          '--wm-word': wm.word,
          // wide screens: his figure stands 60% of the way across the 1440px frame (on a wider screen the
          // frame is centred, so the whole composition keeps its proportions), and is about 0.357x as wide
          // as it is tall, so half of it is this wide
          '--fig-x': 'calc(max(0px, (100vw - 1440px) / 2) + 0.6 * min(100vw, 1440px))',
          '--fig-half': 'min(15.4svh, 158px)',
        } as CSSProperties
      }
    >
      {/* his name behind the figure, set like portfolio-2's giant word (components/GiantWord.tsx): on load
          each letter draws in as an outline, then fills, and the line spreads its letters to both edges of
          the page's measure. Phones: it starts just under the header, so most of it shows above his head */}
      <m.div
        style={touch ? undefined : { y: wmY, opacity: wmFade }}
        aria-hidden
        className="wm-wrap pointer-events-none absolute inset-x-0 top-[68px] -z-10 select-none sm:top-[78px] lg:top-[10%]"
      >
        <GiantWord lines={wm.lines} play={wmPlay} />
      </m.div>

      {/* figure: his cut-out photo. Phones and tablets: the first screen is him,
          from under the header down to the "Scatter him" button above the fold; the words come after
          (the button hangs below his feet into the words' top padding, so the figure sits above them;
          the badge, later in the DOM at the same level, stays tappable where it overlaps him). */}
      <m.div
        style={touch ? undefined : { y: figY }}
        className="relative z-20 mx-auto mt-[96px] flex h-[clamp(320px,calc(100svh-184px),760px)] w-full justify-center sm:mt-[120px] sm:h-[clamp(360px,calc(100svh-212px),820px)] lg:absolute lg:bottom-0 lg:left-[var(--fig-x)] lg:z-0 lg:mt-0 lg:h-[min(86svh,880px)] lg:w-auto lg:-translate-x-1/2"
      >
        <m.div
          className="relative h-full"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.35 }}
        >
          <HeroMedia />
        </m.div>
      </m.div>

      {/* left, portfolio-2's opening: "Hello, I'm a" in his hand, the role on a red block, the intro, the
          buttons and three numbers. Wide screens: "Hello, I'm a" sits between the giant name and the red
          block, its tops just over the name's feet (the name's letters end 0.938 of --wm-word below its top,
          which is 10% down; the hello's line starts 0.3 of its own size above that), and the block follows
          right under it. The column stops short of his figure (--fig-x, --fig-half) and is a container (.hero-copy): the block's one line is sized to fit it */}
      <m.div
        ref={copyRef}
        style={drift ? { y: textY, opacity: fade } : undefined}
        className="hero-copy relative z-10 pl-4 pr-[calc(16px+var(--lane,0px))] pt-[max(88px,calc(100lvh-72px-clamp(320px,calc(100svh-184px),760px)))] sm:pl-6 sm:pr-[calc(24px+var(--lane,0px))] sm:pt-[max(96px,calc(100lvh-96px-clamp(360px,calc(100svh-212px),820px)))] lg:absolute lg:top-[calc(10%+var(--wm-word)*0.938-var(--hello-size)*0.3)] lg:left-[max(40px,calc((100vw-1440px)/2+40px))] lg:z-20 lg:w-[calc(var(--fig-x)-var(--fig-half)-max(40px,calc((100vw-1440px)/2+40px))-36px)] lg:px-0 lg:pt-0"
      >
        {/* the hello, the red block and the intro, as wide as its widest line (the red block): the intro
            wraps under the block, edge to edge */}
        <div className="w-min">
          <h1 className="flex flex-col items-start gap-1">
            <m.span
              className="hero-hello"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
            >
              {site.hero.hello}{' '}
            </m.span>
            {/* the red wipes in from the left, then the words rise into it */}
            <m.span
              className="role-block"
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.55 }}
            >
              {site.headline.map((word, i) => (
                <Fragment key={word}>
                  {i > 0 && ' '}
                  <span className="role-line">
                    <m.span
                      className="block"
                      initial={{ y: '105%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.9, ease: EASE, delay: 0.7 + i * 0.1 }}
                    >
                      {word}
                      {i === site.headline.length - 1 && '.'}
                    </m.span>
                  </span>
                </Fragment>
              ))}
            </m.span>
          </h1>
          <SpokenIntro text={site.intro} />
        </div>
        <ul className="hero-stats" aria-label="In numbers">
          {site.hero.stats.map((stat, i) => (
            <m.li
              key={stat.label}
              className="hero-stat"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 1.2 + i * 0.08 }}
            >
              <CountUp value={stat.value} delay={1.2 + i * 0.08} />
              <span className="hero-stat-k">{stat.label}</span>
            </m.li>
          ))}
        </ul>
        {/* the buttons, under the numbers (their own look and motion) */}
        <m.div
          className="hero-cta relative z-20 flex flex-wrap items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.95 }}
        >
          <button
            type="button"
            onClick={() => scrollTo('work')}
            className="btn-solid btn-key btn-key--primary"
          >
            Explore work <ArrowRight className="size-4" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollTo('contact')}
              className="glass-press btn-fill btn-key"
            >
              Let&rsquo;s talk
            </button>
            <ResumeLink className="glass-press btn-fill btn-key">
              Resume <ArrowDown className="size-3.5" />
            </ResumeLink>
          </div>
        </m.div>
      </m.div>

      {/* right, portfolio-2's list beside the portrait: now, before, studying, then his stack. Screens 1280px
          and wider: right of his figure, level with the red block (the left column's top, plus the hello's
          line, 1.05 of its size, and the h1's 4px gap), as wide as the room right of the figure allows, at
          most 340px. Laptops narrower than that leave it out (About says the same); phones and tablets have it
          after the words */}
      <m.div
        style={drift ? { y: textY, opacity: fade } : undefined}
        ref={sideRef}
        className="hero-side relative z-10 pb-12 pl-4 pr-[calc(16px+var(--lane,0px))] pt-12 sm:pl-6 sm:pr-[calc(24px+var(--lane,0px))] lg:hidden xl:absolute xl:right-[calc(max(0px,(100vw-1440px)/2)+40px+var(--lane,0px))] xl:top-[calc(10%+var(--wm-word)*0.938+var(--hello-size)*0.75+4px)] xl:z-20 xl:flex xl:w-[min(340px,calc(100vw-max(0px,(100vw-1440px)/2)-40px-var(--lane,0px)-var(--fig-x)-var(--fig-half)-48px))] xl:flex-col xl:justify-between xl:p-0"
      >
        <ol className="now-list">
          {site.hero.now.map((item, i) => (
            <m.li
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 1.05 + i * 0.1 }}
            >
              <p className="now-tag">{item.tag}</p>
              <p className="now-title">{item.title}</p>
              <p className="now-text">{item.text}</p>
            </m.li>
          ))}
        </ol>
        <m.ul
          className="hero-stack"
          aria-label="Main stack"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 1.4 }}
        >
          {site.hero.stack.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </m.ul>
      </m.div>

    </section>
  )
}

/**
 * One of the three numbers: it counts up from 0 to its value (43% runs 0% … 43%) once it is first in view,
 * which on a wide screen is as the page loads, easing into the real number as portfolio-2's numbers do. With
 * reduced motion it is simply the number. Only the eye sees the count: screen readers (and anything else
 * reading the page) always get the real number.
 */
function CountUp({ value, delay }: { value: string; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const parts = /^(\d+)(.*)$/.exec(value)
  const end = parts ? Number(parts[1]) : 0
  const suffix = parts ? parts[2] : ''
  const count = useMotionValue(0)
  const shown = useTransform(count, (v) => `${Math.round(v)}${suffix}`)
  useEffect(() => {
    if (!parts) return
    if (reduce) {
      count.set(end)
      return
    }
    if (!seen) return
    // ease out, quick off the mark and slow into the real number
    const run = animate(count, end, { duration: 1.1, delay, ease: [0.33, 1, 0.68, 1] })
    return () => run.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen, reduce])
  return (
    <span ref={ref} className="hero-stat-v">
      <span className="sr-only">{value}</span>
      <m.span aria-hidden>{parts ? shown : value}</m.span>
    </span>
  )
}

/**
 * His intro line. It shows faint first, then each word comes up to full strength in
 * turn, as if he's saying it (no blur: he didn't like it). Each word is its own
 * piece, so the lines wrap as prose does on a narrow screen.
 */
function SpokenIntro({ text }: { text: string }) {
  const reduce = useReducedMotion()
  const words = richWords(text)
  return (
    // portfolio-2's lede: muted, with the key words bright (.hero-lede in index.css); the column it sits in
    // already stops short of his figure on wide screens
    <p className="hero-lede">
      <span className="sr-only">{plain(text)}</span>
      {words.map((word, i) => (
        <Fragment key={i}>
          <m.span
            aria-hidden
            className="inline-block"
            initial={reduce ? false : { opacity: 0.14, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE, delay: 1.1 + i * 0.065 }}
          >
            {word.map((piece, j) => (piece.strong ? <strong key={j}>{piece.text}</strong> : piece.text))}
          </m.span>{' '}
        </Fragment>
      ))}
    </p>
  )
}

