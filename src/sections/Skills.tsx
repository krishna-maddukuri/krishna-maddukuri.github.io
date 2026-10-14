import { AnimatePresence, useInView } from 'motion/react'
import * as m from 'motion/react-m'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { elements, families, type Element, type FamilyId } from '../data/site'
import { skillLogos } from '../data/logos'
import { Plate } from '../components/Logo'
import { useMedia } from '../hooks/useMedia'
import { Container, EASE, SectionHeading } from '../components/ui'

const familyLabel = Object.fromEntries(families.map((f) => [f.id, f.label])) as Record<FamilyId, string>
const COLS = 8
/** The lightest family is drawn as outlined tiles rather than filled ones. */
const OUTLINE: FamilyId = families[families.length - 1].id
const count = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']

export function Skills() {
  const [family, setFamily] = useState<FamilyId | null>(null)
  // Java (the first element) is shown until something else is pointed at or tapped
  const [focus, setFocus] = useState<Element | null>(elements[0] ?? null)
  const tableRef = useRef<HTMLDivElement>(null)
  const inView = useInView(tableRef, { once: true, amount: 0.2 })
  const [waveDone, setWaveDone] = useState(false)
  const hover = useMedia('(hover: hover)', true)

  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setWaveDone(true), 2000)
    // fetch every logo once the table is on screen, so the inspector never shows an empty plate
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 300))
    const handle = idle(() => {
      for (const file of new Set(Object.values(skillLogos).map((l) => l.file))) new Image().src = file
    })
    return () => {
      clearTimeout(t)
      ;(window.cancelIdleCallback ?? clearTimeout)(handle as number)
    }
  }, [inView])

  const pick = (id: FamilyId) => {
    const next = family === id ? null : id
    setFamily(next)
    if (next) setFocus(elements.find((e) => e.family === next) ?? null)
  }

  return (
    <section id="skills" className="relative py-[clamp(72px,8vw,112px)]">
      <Container>
        <SectionHeading
          index="02"
          label="Skills"
          lead="The periodic table"
          accent="of my stack."
          sub={`${elements.length} elements in ${count[families.length] ?? families.length} families. ${hover ? 'Hover' : 'Tap'} a tile to see what it is, or pick a family to light it up.`}
        />

        <div className="mt-9 flex flex-wrap gap-2.5" role="group" aria-label="Light up a family">
          {families.map((f) => {
            const on = family === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => pick(f.id)}
                aria-pressed={on}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,transform] duration-200 ease-out active:scale-95 ${
                  on ? 'btn-solid bg-ink text-paper' : 'bg-chip text-ink hover:bg-line'
                }`}
              >
                <span
                  className="size-3 rounded-[3px] border border-black/10"
                  style={{ background: f.id === OUTLINE ? `var(--fam-${f.id}-swatch)` : `var(--fam-${f.id})` }}
                  aria-hidden
                />
                {f.label}
              </button>
            )
          })}
        </div>

        <div className="mt-8 grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(250px,300px)] lg:gap-10 xl:gap-14">
          <div ref={tableRef} className="grid grid-cols-5 gap-1.5 min-[520px]:grid-cols-8 sm:gap-2.5">
            {elements.map((el, i) => (
              <Tile
                key={el.sym}
                el={el}
                lit={inView}
                delay={waveDone ? 0 : ((i % COLS) + Math.floor(i / COLS)) * 0.05}
                dim={family !== null && el.family !== family}
                active={focus?.sym === el.sym}
                onFocus={() => setFocus(el)}
              />
            ))}
          </div>
          <Inspector el={focus} hover={hover} />
        </div>
      </Container>
    </section>
  )
}

function Tile({
  el,
  lit,
  delay,
  dim,
  active,
  onFocus,
}: {
  el: Element
  lit: boolean
  delay: number
  dim: boolean
  active: boolean
  onFocus: () => void
}) {
  const style: CSSProperties = {
    background: lit ? `var(--fam-${el.family})` : 'var(--wash)',
    color: lit ? `var(--fam-${el.family}-fg)` : 'var(--ink-soft)',
    transitionDelay: `${delay}s`,
    // the picked tile is ringed in its brand's colour
    outline: active ? `2px solid ${skillLogos[el.sym]?.color ?? 'var(--ink)'}` : undefined,
    outlineOffset: active ? 2 : undefined,
  }
  return (
    <m.button
      type="button"
      onMouseEnter={onFocus}
      onFocus={onFocus}
      onClick={onFocus}
      aria-label={`${el.name} (${familyLabel[el.family]})`}
      aria-pressed={active}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={style}
      className={`relative aspect-square min-w-0 rounded-[12px] text-left shadow-sm transition-[background-color,color,opacity,box-shadow] duration-500 hover:shadow-md sm:rounded-[14px] ${
        dim ? 'opacity-[0.18]' : 'opacity-100'
      } ${el.family === OUTLINE ? 'hover:bg-wash!' : ''}`}
    >
      <span className="tabular absolute left-2 top-1.5 font-mono text-[10px] font-medium sm:left-2.5 sm:top-2 sm:text-[11px]">
        {String(el.n).padStart(2, '0')}
      </span>
      <span className="absolute left-2 top-[34%] font-display text-[clamp(1.05rem,2.3vw,1.95rem)] font-bold leading-none tracking-[-0.03em] sm:left-2.5">
        {el.sym}
      </span>
      <span className="absolute inset-x-2 bottom-1.5 hidden truncate text-[10.5px] font-medium sm:block sm:inset-x-2.5 sm:bottom-2 lg:text-[11.5px]">
        {el.name}
      </span>
    </m.button>
  )
}

/**
 * What the picked tile is. On phones it's a glass pane that sticks under the header,
 * so it stays in view while you scroll the table beneath it.
 */
function Inspector({ el, hover }: { el: Element | null; hover: boolean }) {
  return (
    <div
      className="glass sticky top-[calc(env(safe-area-inset-top,0px)+72px)] z-20 order-first flex min-h-[124px] items-center rounded-[26px] p-3.5 sm:min-h-[148px] sm:p-5 lg:relative lg:top-auto lg:order-none lg:min-h-[340px] lg:justify-center lg:p-7"
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        {el ? (
          <m.div
            key={el.sym}
            className="flex w-full items-center gap-4 sm:gap-5 lg:flex-col lg:text-center"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            {/* its logo on a plate in its colour (every element has one: see src/data/logos.ts) */}
            <Plate
              logo={skillLogos[el.sym]}
              alt={`${el.name} logo`}
              eager
              className="size-14 rounded-[18px] sm:size-20 sm:rounded-[22px] lg:size-28 lg:rounded-[28px]"
            />
            <div className="min-w-0">
              <div className="font-display text-[1.25rem] font-bold leading-tight tracking-[-0.025em] sm:text-[1.5rem] lg:text-[1.8rem]">{el.name}</div>
              <div className="eyebrow mt-1 sm:mt-1.5">{familyLabel[el.family]}</div>
              <p className="mt-1.5 text-sm leading-snug text-ink-soft sm:mt-3 sm:text-base lg:mx-auto lg:max-w-[30ch]">{el.note}</p>
            </div>
          </m.div>
        ) : (
          <m.p
            key="hint"
            className="w-full text-center text-base text-ink-soft"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {hover ? 'Hover' : 'Tap'} any element to see what it is.
          </m.p>
        )}
      </AnimatePresence>
    </div>
  )
}
