import { useReducedMotion, useScroll, useTransform } from 'motion/react'
import * as m from 'motion/react-m'
import { Fragment, useRef } from 'react'
import { site } from '../data/site'
import { useMedia } from '../hooks/useMedia'
import { useScrollTo } from '../lib/scroll'
import { ResumeLink } from '../components/ResumeLink'
import { HeroMedia } from '../components/HeroMedia'
import { ArrowDown, ArrowRight, EASE, plain, richWords } from '../components/ui'

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

  const wm = watermarkLines(site.name)

  return (
    <section
      id="top"
      ref={ref}
      className="relative isolate flex flex-col overflow-hidden lg:block"
      style={{ minHeight: 'min(100svh, 1000px)', ['--wm-bottom' as string]: wm.bottom, ['--wm-gap' as string]: wm.gap }}
    >
      {/* the faded full name behind the figure */}
      <m.div
        style={touch ? undefined : { y: wmY, opacity: wmFade }}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[92px] -z-10 mx-auto select-none px-3 sm:top-[100px] sm:px-5 lg:top-[10%] lg:px-[2.2vw] min-[2000px]:max-w-[1900px]"
      >
        <m.div
          className="watermark"
          initial={touch ? { opacity: 0, y: 24 } : { opacity: 0, y: 24, filter: 'blur(14px)' }}
          animate={touch ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.15 }}
        >
          <svg viewBox={`0 0 1000 ${wm.height}`} className="block h-auto w-full overflow-visible font-display font-extrabold" style={{ fontOpticalSizing: 'auto' }}>
            {wm.lines.map((line, i) => (
              <m.text
                key={line.text}
                x="0"
                y={line.y}
                fontSize={line.size}
                textLength="1000"
                lengthAdjust="spacing"
                fill="currentColor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4, ease: EASE, delay: 0.2 + i * 0.25 }}
              >
                {line.text}
              </m.text>
            ))}
          </svg>
        </m.div>
      </m.div>

      {/* figure: his cut-out photo, with the chat bubble */}
      <m.div
        style={touch ? undefined : { y: figY }}
        className="relative z-0 mx-auto mt-[112px] flex h-[min(56svh,500px)] w-full justify-center sm:mt-[128px] lg:absolute lg:bottom-0 lg:left-[60%] lg:mt-0 lg:h-[min(86svh,880px)] lg:w-auto lg:-translate-x-1/2"
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

      {/* bottom-left: name, title, tagline */}
      <m.div
        style={touch ? undefined : { y: textY, opacity: fade }}
        className="relative z-20 px-4 pt-6 sm:px-6 lg:absolute lg:bottom-[clamp(36px,8vh,84px)] lg:left-[max(40px,calc((100vw-1440px)/2+40px))] lg:px-0 lg:pt-0"
      >
        <m.div
          className="eyebrow flex items-center gap-3"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.6 }}
        >
          {site.name}
        </m.div>
        {/* wide screens: as big as the design allows, but never so wide that the first line runs into his figure
            ("Senior Software" in Bricolage Grotesque is 6.71em wide; the figure is 0.357x as wide as it is tall) */}
        <h1 className="mt-4 font-display text-[clamp(3.1rem,7.2vw,7.4rem)] font-bold leading-[0.9] tracking-[-0.045em] text-ink lg:text-[length:min(clamp(3.1rem,min(7.2vw,11.5vh),7.4rem),calc((60vw-min(15.4svh,158px)-max(40px,calc((100vw-1440px)/2+40px))-34px)/6.85))]">
          {site.headline.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.07em]">
              <m.span
                className="block"
                initial={{ y: '105%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1, ease: EASE, delay: 0.5 + i * 0.1 }}
              >
                {line}
                {i === site.headline.length - 1 && (
                  <span className="accent-dot ml-[0.08em] inline-block size-[0.13em] translate-y-[-0.02em] rounded-full align-baseline" aria-hidden />
                )}
              </m.span>
            </span>
          ))}
        </h1>
        <SpokenIntro text={site.intro} soft={!touch} />
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
          className="btn-solid inline-flex h-12 items-center gap-2.5 rounded-full bg-ink px-6 text-sm font-medium text-paper"
        >
          Explore work <ArrowRight className="size-4" />
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollTo('contact')}
            className="glass glass-press btn-fill inline-flex h-10 items-center rounded-full px-5 text-sm font-medium"
          >
            Let&rsquo;s talk
          </button>
          <ResumeLink className="glass glass-press btn-fill inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-sm font-medium">
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
 * once is heavy for a phone right when people start scrolling.)
 */
function SpokenIntro({ text, soft }: { text: string; soft: boolean }) {
  const reduce = useReducedMotion()
  // a run of key words moves as one piece, so its highlight is one unbroken stroke
  const words = richWords(text).reduce<ReturnType<typeof richWords>>((units, word) => {
    const last = units[units.length - 1]
    if (last && word[0].strong && last[last.length - 1].strong) last[last.length - 1] = { text: `${last[last.length - 1].text} ${word[0].text}`, strong: true }
    else units.push([...word])
    if (last && word[0].strong && units[units.length - 1] === last) last.push(...word.slice(1))
    return units
  }, [])
  return (
    // on wide screens it stops short of his figure (which is centred at 60% and ~0.36x as wide as tall)
    <p className="mt-5 max-w-[38rem] text-base leading-[1.6] text-ink/80 sm:text-md lg:max-w-[min(38rem,calc(60vw-min(15.3svh,157px)-max(64px,calc((100vw-1440px)/2+64px))))]">
      <span className="sr-only">{plain(text)}</span>
      {words.map((word, i) => (
        <Fragment key={i}>
          <m.span
            aria-hidden
            className="inline-block"
            initial={reduce ? false : soft ? { opacity: 0.14, filter: 'blur(5px)', y: 3 } : { opacity: 0.14, y: 3 }}
            animate={soft ? { opacity: 1, filter: 'blur(0px)', y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE, delay: 1.1 + i * 0.075 }}
          >
            {word.map((piece, j) => (piece.strong ? <strong key={j}>{piece.text}</strong> : piece.text))}
          </m.span>{' '}
        </Fragment>
      ))}
    </p>
  )
}

/**
 * The faded full name behind the figure: everything but the surname on the first line,
 * the surname on the second ("KRISHNA KOUSHIK" over "MADDUKURI"). Each line is sized from
 * its length so it spans the full width without squeezing the letters, then stretched
 * edge to edge. Also returns how far down the last line ends (for placing the badge) and
 * where the space between the lines is (for the chat bubble).
 */
function watermarkLines(name: string) {
  const words = name.toUpperCase().split(' ')
  const texts = words.length > 1 ? [words.slice(0, -1).join(' '), words[words.length - 1]] : [words[0]]
  const CAP = 0.66 // cap height of Bricolage Grotesque, as a share of the font size
  let y = 19
  const lines = texts.map((text, i) => {
    const size = Math.min(170, Math.round(1750 / text.length))
    y += (i === 0 ? 0 : 35) + CAP * size
    return { text, size, y: Math.round(y) }
  })
  const last = lines[lines.length - 1].y
  // the name spans the hero minus 2.2vw each side, up to ~1783px wide on very wide screens
  const down = (units: number) => `min(${((units / 1000) * 95.6).toFixed(2)}vw, ${Math.round((units / 1000) * 1783)}px)`
  return {
    lines,
    height: last + 20,
    bottom: down(last),
    // the middle of the space between the two lines: where the chat bubble sits, clear of both
    gap: down(lines[0].y + 17.5),
  }
}

/** One lap of the badge's circle (radius 46), the length the text is stretched to. */
const BADGE_LAP = Math.round(2 * Math.PI * 46 * 100) / 100

/** The spinning "Open to …" badge. Click it to jump to Contact. */
function RotatingBadge({ onClick }: { onClick: () => void }) {
  // the loop closes on the last separator, so its trailing space must survive SVG's whitespace trimming
  const text = `${site.openTo} · ${site.location} ·\u00a0`
  return (
    <m.button
      type="button"
      onClick={onClick}
      aria-label={`${site.openTo}. Go to contact`}
      // Phones/tablets: beside him, below the name. Wide screens: just under the second line of
      // the faded name (which sits 10% down; --wm-bottom is how far down its last line ends).
      className="absolute right-4 top-[calc(112px+32svh)] z-20 size-24 sm:right-6 sm:top-[calc(128px+30svh)] sm:size-28 lg:right-[max(40px,calc((100vw-1440px)/2+40px))] lg:top-[calc(10%+var(--wm-bottom)+20px)] lg:size-[clamp(88px,14vh,128px)]"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: EASE, delay: 1.1 }}
      whileHover={{ scale: 1.06 }}
    >
      {/* the spin is on a wrapper, not the SVG, so the curved text is drawn once and just rotated */}
      <span className="spin-slow absolute inset-0" aria-hidden>
        <svg viewBox="0 0 120 120" className="block h-full w-full">
          <defs>
            <path id="badge-circle" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
          </defs>
          {/* the text is stretched to exactly one lap of the circle, so the loop closes with no gap */}
          <text className="fill-ink font-mono text-[8.5px] font-medium uppercase" textLength={BADGE_LAP} lengthAdjust="spacing">
            <textPath href="#badge-circle" textLength={BADGE_LAP} lengthAdjust="spacing">
              {text.toUpperCase()}
            </textPath>
          </text>
        </svg>
      </span>
      <span className="glass absolute inset-[30%] grid place-items-center rounded-full">
        <span className="live-dot size-3 rounded-full" />
      </span>
    </m.button>
  )
}
