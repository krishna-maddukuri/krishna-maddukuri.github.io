import { useInView, useScroll, useTransform } from 'motion/react'
import type { RefObject } from 'react'
import * as m from 'motion/react-m'
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { site } from '../data/site'
import { useMedia } from '../hooks/useMedia'
import { onHome } from '../lib/home'
import { homeSweep } from '../lib/homeSweep'
import { useScrollTo } from '../lib/scroll'
import { CSS_SCROLL } from '../lib/scrollTimeline'
import { ResumeLink } from '../components/ResumeLink'
import { GiantWord, giantWord } from '../components/GiantWord'
import { HeroMedia } from '../components/HeroMedia'
import { ArrowDown, ArrowRight, plain, richWords, enter } from '../components/ui'

/** The giant name behind the hero: his first and middle names on one line (the surname is the footer's word). */
const wm = giantWord([site.name.split(' ').slice(0, -1).join(' ')])

/**
 * The hero's drift as you scroll away from it (the name sinks and dims, the figure and the words rise, the
 * words fade), from script: only for browsers without CSS scroll-driven animations. Everywhere else it is
 * the `.hero-drift-*` rules in index.css and this is not used.
 */
function useScriptDrift(ref: RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  return {
    wmY: useTransform(scrollYProgress, [0, 1], ['0%', '40%']),
    wmFade: useTransform(scrollYProgress, [0, 0.8], [1, 0.2]),
    figY: useTransform(scrollYProgress, [0, 1], ['0%', '-6%']),
    textY: useTransform(scrollYProgress, [0, 1], ['0%', '-30%']),
    fade: useTransform(scrollYProgress, [0, 0.7], [1, 0]),
  }
}
// one or the other for the life of the page, so the hooks called never change
const useDrift: (ref: RefObject<HTMLElement | null>) => ReturnType<typeof useScriptDrift> | null = CSS_SCROLL ? () => null : useScriptDrift

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const scrollTo = useScrollTo()
  const script = useDrift(ref)
  // Phones and tablets skip the scroll-linked drift and the blur-in: native scrolling stays
  // smooth when the page isn't moving things on every frame.
  const touch = useMedia('(pointer: coarse)')
  // the words drift and fade only where they open the page (wide screens); below 1024px they come after the
  // figure, a screen down, and must be fully there when you reach them
  const wide = useMedia('(min-width: 1024px)')
  const drift = wide && !touch && script ? { y: script.textY, opacity: script.fade } : undefined

  // where the figure's shards fly (the layer below), handed to the figure once it is in the page
  const [shardLayer, setShardLayer] = useState<HTMLDivElement | null>(null)
  // the numbers count up when first in view (narrow screens; wide ones count as the page opens)
  const statsRef = useRef<HTMLUListElement>(null)
  const statsSeen = useInView(statsRef, { once: true })
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
    // the stack waits for this (.hero-side:not([data-fit]) in index.css), so on a pre-built page it never
    // shows in one place and then moves; it then comes in at its usual moment, counted from when the list
    // beside it started (the page's first paint, or when the hero was put on the page)
    const stack = side.querySelector<HTMLElement>('.hero-stack')
    const started = side.querySelector('.now-list li')?.getAnimations()[0]?.startTime
    const now = document.timeline.currentTime
    const elapsed = typeof started === 'number' && typeof now === 'number' ? (now - started) / 1000 : Infinity
    stack?.style.setProperty('--enter-delay', `${Math.max(0, 1.4 - elapsed).toFixed(2)}s`)
    side.dataset.fit = ''
    return () => watch.disconnect()
  }, [])
  // each time the page comes home (the name in the header), the red blade crosses the hero (lib/homeSweep.ts)
  useEffect(() => onHome(() => ref.current && homeSweep(ref.current)), [])
  return (
    <section
      id="top"
      ref={ref}
      className="hero-scroll wm-frame wm-frame--hero relative isolate flex flex-col overflow-hidden lg:block"
      style={
        {
          // one screen tall, but on a wide and very short screen never too short for its words and buttons
          // (--hero-floor in index.css), which would otherwise be cut off at its foot
          minHeight: 'max(min(100svh, 1000px), var(--hero-floor, 0px))',
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
        style={touch || !script ? undefined : { y: script.wmY, opacity: script.wmFade }}
        aria-hidden
        className="hero-drift-name wm-wrap pointer-events-none absolute inset-x-0 top-[68px] -z-10 select-none sm:top-[78px] lg:top-[10%]"
      >
        {/* the name draws itself in as the page opens (its letters stay unseen until their font is in: Antonio
            is font-display: block) */}
        <GiantWord lines={wm.lines} play />
      </m.div>

      {/* the paper figure's shards fly here: over the giant name, under the words, anywhere on the hero's first
          screen (components/PaperFigure.tsx draws them; the figure's own box below takes the clicks) */}
      <div ref={setShardLayer} data-shard-layer className="pointer-events-none absolute inset-x-0 top-0 z-0" />

      {/* figure: his cut-out photo. Phones and tablets: the first screen is him,
          from under the header down to the "Scatter him" button above the fold; the words come after
          (the button hangs below his feet into the words' top padding, so the figure sits above them;
          the badge, later in the DOM at the same level, stays tappable where it overlaps him). */}
      <m.div
        style={touch || !script ? undefined : { y: script.figY }}
        className="hero-drift-figure relative z-20 mx-auto mt-[96px] flex h-[clamp(320px,calc(100svh-184px),760px)] w-full justify-center sm:mt-[120px] sm:h-[clamp(360px,calc(100svh-212px),820px)] lg:absolute lg:bottom-0 lg:left-[var(--fig-x)] lg:z-0 lg:mt-0 lg:h-[min(86svh,880px)] lg:w-auto lg:-translate-x-1/2"
      >
        <div className="enter relative h-full" style={enter(0.35, 50, 1.2)}>
          <HeroMedia shardLayer={shardLayer} />
        </div>
      </m.div>

      {/* left, portfolio-2's opening: "Hello, I'm a" in his hand, the role on a red block, the intro, the
          buttons and three numbers. Wide screens: "Hello, I'm a" sits between the giant name and the red
          block, its tops just over the name's feet (the name's letters end 0.938 of --wm-word below its top,
          which is 10% down; the hello's line starts 0.3 of its own size above that), and the block follows
          right under it. The column stops short of his figure (--fig-x, --fig-half) and is a container (.hero-copy): the block's one line is sized to fit it */}
      <m.div
        ref={copyRef}
        style={drift}
        className="hero-drift-words hero-copy relative z-10 pl-4 pr-[calc(16px+var(--lane,0px))] pt-[max(88px,calc(100lvh-72px-clamp(320px,calc(100svh-184px),760px)))] sm:pl-6 sm:pr-[calc(24px+var(--lane,0px))] sm:pt-[max(96px,calc(100lvh-96px-clamp(360px,calc(100svh-212px),820px)))] lg:absolute lg:top-[calc(10%+var(--wm-word)*0.938-var(--hello-size)*0.3)] lg:left-[max(40px,calc((100vw-1440px)/2+40px))] lg:z-20 lg:w-[calc(var(--fig-x)-var(--fig-half)-max(40px,calc((100vw-1440px)/2+40px))-36px)] lg:px-0 lg:pt-0"
      >
        {/* the hello, the red block and the intro, as wide as its widest line (the red block): the intro
            wraps under the block, edge to edge */}
        <div className="w-min">
          <h1 className="flex flex-col items-start gap-1">
            <span className="hero-hello enter" style={enter(0.45, 14, 0.8)}>
              {site.hero.hello}{' '}
            </span>
            {/* the red wipes in from the left, then the words rise into it (.role-block, .role-word in index.css) */}
            <span className="role-block">
              {site.headline.map((word, i) => (
                <Fragment key={word}>
                  {i > 0 && ' '}
                  <span className="role-line">
                    <span className="role-word" style={{ '--i': i } as CSSProperties}>
                      {word}
                      {i === site.headline.length - 1 && '.'}
                    </span>
                  </span>
                </Fragment>
              ))}
            </span>
          </h1>
          <SpokenIntro text={site.intro} />
        </div>
        <ul ref={statsRef} className={`hero-stats ${statsSeen ? 'is-seen' : ''}`} aria-label="In numbers">
          {site.hero.stats.map((stat, i) => (
            <li key={stat.label} className="hero-stat enter" style={enter(1.2 + i * 0.08, 12, 0.7)}>
              <CountUp value={stat.value} delay={1.2 + i * 0.08} />
              <span className="hero-stat-k">{stat.label}</span>
            </li>
          ))}
        </ul>
        {/* the buttons, under the numbers (their own look and motion) */}
        <div className="hero-cta enter relative z-20 flex flex-wrap items-center gap-3" style={enter(0.95, 20, 0.9)}>
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
        </div>
      </m.div>

      {/* right, portfolio-2's list beside the portrait: now, before, studying, then his stack. Screens 1280px
          and wider: right of his figure, level with the red block (the left column's top, plus the hello's
          line, 1.05 of its size, and the h1's 4px gap), as wide as the room right of the figure allows, at
          most 340px. Laptops narrower than that leave it out (About says the same); phones and tablets have it
          after the words */}
      <m.div
        style={drift}
        ref={sideRef}
        className="hero-drift-words hero-side relative z-10 pb-12 pl-4 pr-[calc(16px+var(--lane,0px))] pt-12 sm:pl-6 sm:pr-[calc(24px+var(--lane,0px))] lg:hidden xl:absolute xl:right-[calc(max(0px,(100vw-1440px)/2)+40px+var(--lane,0px))] xl:top-[calc(10%+var(--wm-word)*0.938+var(--hello-size)*0.75+4px)] xl:z-20 xl:flex xl:w-[min(340px,calc(100vw-max(0px,(100vw-1440px)/2)-40px-var(--lane,0px)-var(--fig-x)-var(--fig-half)-48px))] xl:flex-col xl:justify-between xl:p-0"
      >
        <ol className="now-list">
          {site.hero.now.map((item, i) => (
            <li key={item.title} className="enter" style={enter(1.05 + i * 0.1, 14, 0.8)}>
              <p className="now-tag">{item.tag}</p>
              <p className="now-title">{item.title}</p>
              <p className="now-text">{item.text}</p>
            </li>
          ))}
        </ol>
        <ul className="hero-stack enter" aria-label="Main stack" style={enter(1.4, 0, 0.8)}>
          {site.hero.stack.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </m.div>

    </section>
  )
}

/**
 * One of the three numbers: it counts up from 0 to its value (43% runs 0% … 43%), easing into the real
 * number as portfolio-2's numbers do. The count is CSS (`.count` in index.css: a number animated from 0 and
 * shown through a counter), so it needs no script: on a wide screen, where the numbers are on the first
 * screen, it runs as the page opens; on a narrower one it waits until the numbers are first in view
 * (`.hero-stats.is-seen`). With reduced motion it is simply the number. Only the eye sees the count: screen
 * readers (and anything else reading the page) always get the real number.
 */
function CountUp({ value, delay }: { value: string; delay: number }) {
  const parts = /^(\d+)(.*)$/.exec(value)
  return (
    <span className="hero-stat-v">
      <span className="sr-only">{value}</span>
      {parts ? (
        <span aria-hidden>
          <span className="count" style={{ '--to': Number(parts[1]), '--count-delay': `${delay}s` } as CSSProperties} />
          {parts[2]}
        </span>
      ) : (
        <span aria-hidden>{value}</span>
      )}
    </span>
  )
}

/**
 * His intro line. It shows faint first, then each word comes up to full strength in
 * turn, as if he's saying it (no blur: he didn't like it). Each word is its own
 * piece, so the lines wrap as prose does on a narrow screen.
 */
function SpokenIntro({ text }: { text: string }) {
  const words = richWords(text)
  return (
    // portfolio-2's lede: muted, with the key words bright (.hero-lede in index.css); the column it sits in
    // already stops short of his figure on wide screens
    <p className="hero-lede">
      <span className="sr-only">{plain(text)}</span>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span aria-hidden className="lede-word" style={{ '--i': i } as CSSProperties}>
            {word.map((piece, j) => (piece.strong ? <strong key={j}>{piece.text}</strong> : piece.text))}
          </span>{' '}
        </Fragment>
      ))}
    </p>
  )
}

