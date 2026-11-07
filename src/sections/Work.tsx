import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from '../lib/router'
import { projects, type Project } from '../data/site'
import { useMedia } from '../hooks/useMedia'
import { ProjectVisual } from '../visuals/LazyProjectVisual'
import { ToolChip } from '../components/Logo'
import { ArrowRight, Container, EASE, Plus, Reveal, SectionHeading } from '../components/ui'

export function Work() {
  const [active, setActive] = useState(0)
  const wide = useMedia('(min-width: 1280px)')
  // Desktop panels open on hover (with a short delay so passing over them doesn't flicker).
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const hoverOpen = (i: number) => {
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setActive(i), 140)
  }
  const hoverCancel = () => clearTimeout(hoverTimer.current)
  // The row is 610px tall unless the open panel's words need more (a long title that wraps, three
  // rows of chips): then it grows to fit, so the "Read case study" button is never cut off.
  const [rowHeight, setRowHeight] = useState(ROW_MIN)
  const measure = useCallback((h: number) => setRowHeight(Math.max(ROW_MIN, Math.ceil(h))), [])
  // The open panel's inside is laid out at the width it will have once the panels have finished
  // sliding (the row minus the closed ones), not at whatever width it is passing through: the words
  // then wrap the way they will end up, the height is right from the first frame, and the slide only
  // uncovers them. (Measured while it is still narrow, the words wrapped onto many more lines and the
  // row shot up, then shrank back.)
  const rowRef = useRef<HTMLDivElement>(null)
  const [panelWidth, setPanelWidth] = useState<number>()
  useEffect(() => {
    if (!wide) return
    const row = rowRef.current
    if (!row) return
    const fit = () => setPanelWidth(row.clientWidth - (projects.length - 1) * (CLOSED_WIDTH + GAP))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(row)
    return () => ro.disconnect()
  }, [wide])

  return (
    <section id="work" className="relative py-[clamp(56px,8vw,112px)]">
      <Container>
        <SectionHeading
          index="03"
          label="Work"
          lead="Things I've"
          accent="built."
          aside={
            <p className="text-base text-ink-soft">
              {wide ? 'Hover a panel to open it.' : 'Tap a project to open it.'}
            </p>
          }
        />

        <Reveal className="mt-10 lg:mt-12">
          {wide ? (
            <div ref={rowRef} className="flex gap-3 transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ height: rowHeight }}>
              {projects.map((p, i) => (
                <Panel
                  key={p.slug}
                  project={p}
                  index={i}
                  open={active === i}
                  width={panelWidth}
                  onOpen={() => setActive(i)}
                  onHover={() => hoverOpen(i)}
                  onLeave={hoverCancel}
                  onMeasure={measure}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {projects.map((p, i) => (
                <Row key={p.slug} project={p} index={i} open={active === i} onToggle={() => setActive(active === i ? -1 : i)} />
              ))}
            </div>
          )}
        </Reveal>
      </Container>
    </section>
  )
}

const num = (i: number) => String(i + 1).padStart(2, '0')
/** The desktop row's height when the open panel's words fit (px). */
const ROW_MIN = 610
/** A closed panel's width and the gap between panels (px; basis-[64px] and gap-3 below). */
const CLOSED_WIDTH = 64
const GAP = 12

/* -------------------------------------------- desktop: horizontal panels -- */
function Panel({
  project: p,
  index,
  open,
  width,
  onOpen,
  onHover,
  onLeave,
  onMeasure,
}: {
  project: Project
  index: number
  open: boolean
  /** The panel's width once open (px), so its inside is laid out at that from the start. */
  width?: number
  onOpen: () => void
  onHover: () => void
  onLeave: () => void
  onMeasure: (height: number) => void
}) {
  return (
    <div
      onMouseEnter={open ? undefined : onHover}
      onMouseLeave={onLeave}
      className={`relative min-w-0 overflow-hidden rounded-[28px] border border-line transition-[flex-grow,flex-basis,background-color,box-shadow] duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] ${
        open ? 'card-shadow grow basis-0 bg-surface' : 'shrink-0 grow-0 basis-[64px] bg-paper hover:bg-surface'
      }`}
    >
      {!open && (
        <button
          type="button"
          onClick={onOpen}
          aria-expanded={false}
          aria-label={`Open ${p.title}`}
          className="group flex h-full w-full flex-col items-center py-6"
        >
          <span className="eyebrow tabular">{num(index)}</span>
          <span className="mt-auto whitespace-nowrap font-display text-[20px] font-bold tracking-[-0.02em] [writing-mode:vertical-rl] rotate-180">
            {p.title}
          </span>
          <span className="mt-6 grid size-9 place-items-center rounded-full bg-ink text-paper transition-transform duration-300 group-hover:rotate-90">
            <Plus />
          </span>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <m.div
            key={p.slug}
            className="absolute inset-y-0 left-0 grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8 p-8 2xl:gap-10 2xl:p-10"
            style={width ? { width } : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <PanelBody project={p} index={index} onMeasure={onMeasure} />
            <m.div
              className="flex min-h-0 items-center"
              initial={{ y: 24, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
            >
              <ProjectVisual kind={p.visual} className="aspect-[4/3] max-h-full w-full" />
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PanelBody({ project: p, index, onMeasure }: { project: Project; index: number; onMeasure?: (height: number) => void }) {
  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  // report how tall the words want to be (the two blocks plus the panel's padding; the space the
  // bottom block is pushed down by doesn't count), a beat after their last reflow (the font or the
  // chips' logos arriving can reflow them once more)
  useEffect(() => {
    const top = topRef.current
    const bottom = bottomRef.current
    if (!top || !bottom || !onMeasure) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const report = () => {
      const cell = top.parentElement?.parentElement
      const pad = cell ? parseFloat(getComputedStyle(cell).paddingTop) + parseFloat(getComputedStyle(cell).paddingBottom) : 0
      onMeasure(top.getBoundingClientRect().height + bottom.getBoundingClientRect().height + pad)
    }
    const settle = () => {
      clearTimeout(timer)
      timer = setTimeout(report, 40)
    }
    settle()
    const ro = new ResizeObserver(settle)
    ro.observe(top)
    ro.observe(bottom)
    return () => {
      clearTimeout(timer)
      ro.disconnect()
    }
  }, [onMeasure])
  return (
    <div className="flex min-h-0 min-w-0 flex-col">
      <div ref={topRef}>
        <div className="eyebrow flex items-center gap-3">
          <span className="accent-index tabular">{num(index)}</span>
          <span className="h-px w-6 bg-line" aria-hidden />
          <span className="min-w-0 leading-snug">{p.eyebrow}</span>
        </div>
        <h3 className="mt-5 font-display text-[clamp(2rem,3vw,2.9rem)] font-bold leading-[0.98] tracking-[-0.035em]">
          {p.title}{' '}
          <em className="accent-tail font-serif font-normal italic tracking-[-0.01em]">{p.accent}</em>
        </h3>
        <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-ink-soft">{p.summary}</p>
        <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-2.5 text-sm">
          {p.highlights.map((h) => (
            <li key={h} className="flex gap-2">
              <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-ink" aria-hidden />
              <span className="min-w-0">{h}</span>
            </li>
          ))}
        </ul>
      </div>
      <div ref={bottomRef} className="mt-auto pt-6">
        <div className="flex flex-wrap gap-1.5">
          {p.tools.map((t) => (
            <ToolChip key={t} name={t} />
          ))}
        </div>
        <Link
          to={`/work/${p.slug}`}
          className="btn-solid group mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-paper"
        >
          Read case study <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}

/* --------------------------------------------- phones/tablets: accordion -- */
function Row({ project: p, index, open, onToggle }: { project: Project; index: number; open: boolean; onToggle: () => void }) {
  return (
    <div className={`overflow-hidden rounded-[24px] border border-line transition-[background-color,box-shadow] duration-300 ${open ? 'card-shadow bg-surface' : 'bg-paper'}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-5 py-5 text-left"
      >
        <span className="eyebrow tabular">{num(index)}</span>
        <span className="min-w-0 flex-1 font-display text-[clamp(1.25rem,5vw,1.6rem)] font-bold leading-tight tracking-[-0.03em]">
          {p.title}
        </span>
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-full bg-ink text-paper transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
          aria-hidden
        >
          <Plus />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="grid gap-6 px-5 pb-6 md:grid-cols-2 md:items-start md:gap-8 md:px-6 md:pb-8">
              <ProjectVisual kind={p.visual} className="aspect-[4/3] w-full" />
              <div className="flex min-w-0 flex-col gap-5">
              <div className="eyebrow">{p.eyebrow}</div>
              <h3 className="-mt-2 font-display text-[1.9rem] font-bold leading-none tracking-[-0.03em]">
                {p.title}{' '}
                <em className="accent-tail font-serif font-normal italic tracking-[-0.01em]">{p.accent}</em>
              </h3>
              <p className="text-base text-ink-soft">{p.summary}</p>
              <ul className="grid gap-2 text-sm sm:grid-cols-2">
                {p.highlights.map((h) => (
                  <li key={h} className="flex gap-2">
                    <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-ink" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-1.5">
                {p.tools.map((t) => (
                  <ToolChip key={t} name={t} />
                ))}
              </div>
              <Link
                to={`/work/${p.slug}`}
                className="btn-solid group inline-flex h-11 w-fit items-center gap-3 rounded-full bg-ink pl-5 pr-1.5 text-sm font-medium text-paper"
              >
                Read case study
                <span className="grid size-8 place-items-center rounded-full bg-paper text-ink">
                  <ArrowRight className="size-3.5" />
                </span>
              </Link>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
