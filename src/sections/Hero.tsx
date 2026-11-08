import { animate, useInView, useMotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react'
import * as m from 'motion/react-m'
import { Fragment, useEffect, useId, useRef, useState, type CSSProperties } from 'react'
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

  // the name draws itself in once its font is in (or after a moment, if the font is slow), so the
  // outline is never drawn in the fallback font and swapped mid-way
  const [wmPlay, setWmPlay] = useState(false)
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
      className="wm-frame relative isolate flex flex-col overflow-hidden lg:block"
      style={{ minHeight: 'min(100svh, 1000px)', '--wm-word': wm.word } as CSSProperties}
    >
      {/* his name behind the figure, set like portfolio-2's giant word (components/GiantWord.tsx): on load
          each letter draws in as an outline, then fills, and the line spreads its letters to both edges of
          the page's measure. Phones: it starts just under the header, so most of it shows above his head */}
      <m.div
        style={touch ? undefined : { y: wmY, opacity: wmFade }}
        aria-hidden
        className="wm-wrap pointer-events-none absolute inset-x-0 top-[68px] -z-10 mx-auto select-none sm:top-[78px] lg:top-[10%]"
      >
        <GiantWord lines={wm.lines} play={wmPlay} />
      </m.div>

      {/* figure: his cut-out photo. Phones and tablets: the first screen is him,
          from under the header down to the "Scatter him" button above the fold; the words come after
          (the button hangs below his feet into the words' top padding, so the figure sits above them;
          the badge, later in the DOM at the same level, stays tappable where it overlaps him). */}
      <m.div
        style={touch ? undefined : { y: figY }}
        className="relative z-20 mx-auto mt-[96px] flex h-[clamp(320px,calc(100svh-184px),760px)] w-full justify-center sm:mt-[120px] sm:h-[clamp(360px,calc(100svh-212px),820px)] lg:absolute lg:bottom-0 lg:left-[60%] lg:z-0 lg:mt-0 lg:h-[min(86svh,880px)] lg:w-auto lg:-translate-x-1/2"
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
          right under it. The column stops short of his figure (centred at 60%, about 0.357x as wide as it is
          tall) and is a container (.hero-copy): the block's one line is sized to fit it */}
      <m.div
        style={touch ? undefined : { y: textY, opacity: fade }}
        className="hero-copy relative z-10 px-4 pt-[88px] sm:px-6 sm:pt-[96px] lg:absolute lg:top-[calc(10%+var(--wm-word)*0.938-var(--hello-size)*0.3)] lg:left-[max(40px,calc((100vw-1440px)/2+40px))] lg:z-20 lg:w-[calc(60vw-min(15.4svh,158px)-max(40px,calc((100vw-1440px)/2+40px))-34px)] lg:px-0 lg:pt-0"
      >
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
        <SpokenIntro text={site.intro} soft={!touch} />
        <ul className="hero-stats" aria-label="In numbers">
          {site.hero.stats.map((stat, i) => (
            <m.li
              key={stat.label}
              className="hero-stat"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 1.2 + i * 0.08 }}
            >
              <CountUp value={stat.value} delay={1.25 + i * 0.08} />
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
            className="btn-solid btn-key"
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
        style={touch ? undefined : { y: textY, opacity: fade }}
        className="hero-side relative z-10 px-4 pb-12 pt-12 sm:px-6 lg:hidden xl:absolute xl:right-[max(40px,calc((100vw-1440px)/2+40px))] xl:top-[calc(10%+var(--wm-word)*0.938+var(--hello-size)*0.75+4px)] xl:z-20 xl:block xl:w-[min(340px,calc(40vw-max(40px,calc((100vw-1440px)/2+40px))-min(15.4svh,158px)-34px))] xl:p-0"
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

      {/* the spinning badge, near his figure and clear of the words: phones and tablets beside his hip;
          laptops narrower than 1280px in the bottom-right corner; wider screens at the foot of the page, 36px
          left of his figure (centred at 60%, half as wide as 0.357x its height), right of the buttons */}
      <RotatingBadge
        onClick={() => scrollTo('contact')}
        className="absolute right-3 top-[calc(54svh-4px)] z-20 size-[96px] sm:right-6 sm:top-[52svh] sm:size-[112px] lg:right-[max(40px,calc((100vw-1440px)/2+40px))] lg:top-auto lg:bottom-[clamp(36px,8vh,84px)] lg:size-[clamp(112px,14.5vh,132px)] xl:right-auto xl:left-[calc(60vw-min(15.4svh,158px)-36px-clamp(112px,14.5vh,132px))]"
      />
    </section>
  )
}

/**
 * One of the three numbers: it counts up from 0 to its value (43% runs 0% … 43%) once it is first in view,
 * which on a wide screen is as the page loads, easing into the real number as portfolio-2's numbers do. With
 * reduced motion it is simply the number.
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
    <m.span ref={ref} className="hero-stat-v">
      {parts ? shown : value}
    </m.span>
  )
}

/**
 * His intro line. It shows faint and soft first, then each word clears in turn,
 * as if he's saying it. (On phones the words just fade in: blurring 30 words at
 * once is heavy for a phone right when people start scrolling.) Each word is its
 * own piece, so the lines wrap as prose does on a narrow screen.
 */
function SpokenIntro({ text, soft }: { text: string; soft: boolean }) {
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
            initial={reduce ? false : soft ? { opacity: 0.14, filter: 'blur(5px)', y: 3 } : { opacity: 0.14, y: 3 }}
            animate={soft ? { opacity: 1, filter: 'blur(0px)', y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE, delay: 1.1 + i * 0.065 }}
          >
            {word.map((piece, j) => (piece.strong ? <strong key={j}>{piece.text}</strong> : piece.text))}
          </m.span>{' '}
        </Fragment>
      ))}
    </p>
  )
}

/**
 * The badge's circle: its words run round at radius 47.5 in a 128-unit box (one unit is a pixel at its
 * desktop size); one lap is what they are stretched to, which spaces the capitals out a little.
 */
const BADGE_R = 47.5
const BADGE_LAP = Math.round(2 * Math.PI * BADGE_R * 100) / 100

/** The spinning "Open to …" badge. Click it to jump to Contact. Where it sits and how big it is come from `className`. */
function RotatingBadge({ onClick, className }: { onClick: () => void; className: string }) {
  // the loop closes on the separator, so its trailing space must survive SVG's whitespace trimming
  const text = `${site.openTo} ·\u00a0`
  // each badge draws its words on its own circle (there are two: one for small screens, one in the button row)
  const circle = `badge-circle-${useId().replace(/:/g, '')}`
  return (
    <m.button
      type="button"
      onClick={onClick}
      aria-label={`${site.openTo}. Go to contact`}
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: EASE, delay: 1.1 }}
      whileHover={{ scale: 1.06 }}
    >
      {/* the spin is on a wrapper, not the SVG, so the curved text is drawn once and just rotated */}
      <span className="spin-slow absolute inset-0" aria-hidden>
        <svg viewBox="0 0 128 128" className="block h-full w-full">
          <defs>
            <path id={circle} d={`M64 64 m-${BADGE_R} 0 a${BADGE_R} ${BADGE_R} 0 1 1 ${2 * BADGE_R} 0 a${BADGE_R} ${BADGE_R} 0 1 1 -${2 * BADGE_R} 0`} />
          </defs>
          {/* in the portfolio's display face (Antonio), 17.5 units in the 128 box (about 17px on a desktop),
              the line once round, stretched to exactly one lap so the loop closes with no gap */}
          <text className="fill-ink font-display text-[17.5px] font-semibold uppercase" textLength={BADGE_LAP} lengthAdjust="spacing">
            <textPath href={`#${circle}`} textLength={BADGE_LAP} lengthAdjust="spacing">
              {text.toUpperCase()}
            </textPath>
          </text>
        </svg>
      </span>
      {/* the disc in the middle comes to within about 9 units of the words (radius 38.5 of the 128 box, the words' baseline at 47.5) */}
      <span className="glass absolute inset-[20%] grid place-items-center rounded-full">
        <span className="live-dot size-[18%] rounded-full" />
      </span>
    </m.button>
  )
}
