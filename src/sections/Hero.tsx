import { useReducedMotion, useScroll, useTransform } from 'motion/react'
import * as m from 'motion/react-m'
import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react'
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

      {/* left, portfolio-2's opening: "Hello, I'm" in his hand, the role on a red block, the role tag, the
          intro and three numbers. Wide screens: as on portfolio-2, the column starts on the foot of the giant
          name, so "Hello, I'm" lies over its lower third and the red block begins where the letters end (the
          name's box starts 10% down and is 0.86 of --wm-word tall; the column starts 0.66 of it down, 0.2 above
          the box's foot); it stops short of his figure (centred at 60%, about 0.357x as wide as it is tall).
          The column is a container (.hero-copy): the block's one line is sized to fit it (index.css) */}
      <m.div
        style={touch ? undefined : { y: textY, opacity: fade }}
        className="hero-copy relative z-10 px-4 pt-[88px] sm:px-6 sm:pt-[96px] lg:absolute lg:top-[calc(10%+var(--wm-word)*0.66)] lg:left-[max(40px,calc((100vw-1440px)/2+40px))] lg:z-20 lg:w-[calc(60vw-min(15.4svh,158px)-max(40px,calc((100vw-1440px)/2+40px))-34px)] lg:px-0 lg:pt-0"
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
        <m.p
          className="role-tag"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.95 }}
        >
          <span className="role-dot" aria-hidden />
          {site.role}
        </m.p>
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
              <span className="hero-stat-v">{stat.value}</span>
              <span className="hero-stat-k">{stat.label}</span>
            </m.li>
          ))}
        </ul>
      </m.div>

      {/* bottom-right: actions */}
      <m.div
        style={touch ? undefined : { opacity: fade }}
        className="relative z-20 flex flex-wrap items-center gap-3 px-4 pb-12 pt-8 sm:px-6 lg:absolute lg:bottom-[clamp(36px,8vh,84px)] lg:right-[max(40px,calc((100vw-1440px)/2+40px))] lg:flex-col lg:items-end lg:p-0 wideshort:flex-row wideshort:items-center"
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

      <RotatingBadge onClick={() => scrollTo('contact')} />
    </section>
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

/** The spinning "Open to …" badge. Click it to jump to Contact. */
function RotatingBadge({ onClick }: { onClick: () => void }) {
  // the loop closes on the separator, so its trailing space must survive SVG's whitespace trimming
  const text = `${site.openTo} ·\u00a0`
  return (
    <m.button
      type="button"
      onClick={onClick}
      aria-label={`${site.openTo}. Go to contact`}
      // Phones/tablets: beside his hip, in the margin right of him. Wide screens: right above the "Explore
      // work" key, on the same right edge (the keys stand clamp(36px,8vh,84px) up from the bottom and take
      // 108px as a column: two 44px keys on their 4px edges and a 12px gap; on wide, short screens they
      // are one 48px row), 18px clear of it.
      className="absolute right-3 top-[calc(54svh-4px)] z-20 size-[96px] sm:right-6 sm:top-[52svh] sm:size-[112px] lg:right-[max(40px,calc((100vw-1440px)/2+40px))] lg:top-auto lg:bottom-[calc(clamp(36px,8vh,84px)+126px)] lg:size-[clamp(112px,14.5vh,132px)] wideshort:bottom-[calc(clamp(36px,8vh,84px)+66px)]"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: EASE, delay: 1.1 }}
      whileHover={{ scale: 1.06 }}
    >
      {/* the spin is on a wrapper, not the SVG, so the curved text is drawn once and just rotated */}
      <span className="spin-slow absolute inset-0" aria-hidden>
        <svg viewBox="0 0 128 128" className="block h-full w-full">
          <defs>
            <path id="badge-circle" d={`M64 64 m-${BADGE_R} 0 a${BADGE_R} ${BADGE_R} 0 1 1 ${2 * BADGE_R} 0 a${BADGE_R} ${BADGE_R} 0 1 1 -${2 * BADGE_R} 0`} />
          </defs>
          {/* in the portfolio's display face (Antonio), 17.5 units in the 128 box (about 17px on a desktop),
              the line once round, stretched to exactly one lap so the loop closes with no gap */}
          <text className="fill-ink font-display text-[17.5px] font-semibold uppercase" textLength={BADGE_LAP} lengthAdjust="spacing">
            <textPath href="#badge-circle" textLength={BADGE_LAP} lengthAdjust="spacing">
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
