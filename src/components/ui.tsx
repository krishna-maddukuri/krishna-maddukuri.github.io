import * as m from 'motion/react-m'
import type { ReactNode } from 'react'

export const EASE = [0.22, 1, 0.36, 1] as const

/**
 * A slow fade and rise when a block scrolls into view (about a second, easing out), once.
 * It starts a little before the block is a quarter of the way in, so text is clear by the
 * time it is where people read. `soft` adds a blur that clears, for pictures and cards,
 * never for running text.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 28,
  soft = false,
}: {
  children: ReactNode
  delay?: number
  className?: string
  y?: number
  soft?: boolean
}) {
  return (
    <m.div
      className={className}
      initial={soft ? { opacity: 0, y, filter: 'blur(8px)' } : { opacity: 0, y }}
      whileInView={soft ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.05, ease: EASE, delay }}
    >
      {children}
    </m.div>
  )
}

/** "02 —— SKILLS" eyebrow + bold sans headline with an italic serif tail. */
export function SectionHeading({
  index,
  label,
  lead,
  accent,
  sub,
  aside,
  stack = false,
}: {
  index: string
  label: string
  lead: string
  accent: string
  sub?: ReactNode
  aside?: ReactNode
  /** put the italic part on its own line ("Always / learning.") */
  stack?: boolean
}) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="heading-drift min-w-0">
        <Eyebrow index={index} label={label} />
        {/* the bold part first, the italic tail a beat later */}
        <h2 className="mt-5 font-display text-[clamp(2.6rem,6vw,5.4rem)] font-bold leading-[0.95] tracking-[-0.04em]">
          <m.span
            className="inline-block"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: EASE }}
          >
            {lead}
          </m.span>
          {stack ? <br /> : ' '}
          <m.span
            className="inline-block"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: EASE, delay: 0.18 }}
          >
            <Accent>{accent}</Accent>
          </m.span>
        </h2>
        {sub && (
          <Reveal delay={0.3} y={14}>
            <p className="mt-5 max-w-[52ch] text-md text-ink-soft">{sub}</p>
          </Reveal>
        )}
      </div>
      {aside && (
        <Reveal delay={0.4} y={14} className="min-w-0 lg:max-w-[34ch] lg:pb-3">
          {aside}
        </Reveal>
      )}
    </div>
  )
}

/** "02 —— SKILLS": the number fades in, the line draws itself, then the label. */
export function Eyebrow({ index, label }: { index: string; label: string }) {
  return (
    <div className="eyebrow flex items-center gap-3">
      <m.span className="accent-index tabular" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }}>
        {index}
      </m.span>
      <m.span
        className="h-px w-10 origin-left bg-ink-soft/40"
        aria-hidden
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
      />
      <m.span initial={{ opacity: 0, x: -6 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}>
        {label}
      </m.span>
    </div>
  )
}

/** The Instrument Serif italic tail used in every heading, in the accent colour (teal). */
export function Accent({ children }: { children: ReactNode }) {
  return <em className="accent-tail font-serif font-normal italic tracking-[-0.01em]">{children}</em>
}

/** Text from site.ts with its key words marked **like this**: they come out as <strong>, in the accent colour. */
export function Rich({ text }: { text: string }) {
  return <>{text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))}</>
}

/**
 * The same text as words, each a run of pieces that know whether they are a key word
 * (so "…on AWS**." keeps its full stop on the word, in plain ink).
 */
export type RichWord = { text: string; strong: boolean }[]
export function richWords(text: string): RichWord[] {
  const words: RichWord[] = []
  let open = false // the previous part ended mid-word (no space after it)
  text.split(/\*\*(.+?)\*\*/g).forEach((part, i) => {
    const strong = i % 2 === 1
    part.split(' ').forEach((piece, j) => {
      if (!piece) return
      // no space on either side of the break: this piece continues the previous word
      if (j === 0 && open && !part.startsWith(' ') && words.length) words[words.length - 1].push({ text: piece, strong })
      else words.push([{ text: piece, strong }])
    })
    open = part.length > 0 && !part.endsWith(' ')
  })
  return words
}

export const plain = (text: string) => text.replace(/\*\*/g, '')

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 ${className}`}>{children}</div>
}

/* ---------------------------------------------------------------- icons -- */

type IconProps = { className?: string }

export const ArrowRight = ({ className = 'size-4' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const ArrowUpRight = ({ className = 'size-4' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

export const ArrowDown = ({ className = 'size-4' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
)

export const ArrowLeft = ({ className = 'size-4' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
)

export const Plus = ({ className = 'size-4' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className} aria-hidden>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const Sun = ({ className = 'size-4' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className} aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

export const Moon = ({ className = 'size-4' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </svg>
)

export const Copy = ({ className = 'size-4' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
  </svg>
)

export const Check = ({ className = 'size-4' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="m5 12 5 5 9-10" />
  </svg>
)

export const Sound = ({ on, className = 'size-4' }: IconProps & { on: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M4 9v6h4l5 4V5L8 9H4Z" />
    {on ? <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /> : <path d="m17 9 5 6M22 9l-5 6" />}
  </svg>
)
