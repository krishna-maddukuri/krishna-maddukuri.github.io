import * as m from 'motion/react-m'
import { learning } from '../data/site'
import { BadgeMark, OrgMark } from '../components/Logo'
import { Accent, Container, EASE, Eyebrow, Reveal } from '../components/ui'

/** The "Always learning." list: his degrees and certifications. */
export function Learning() {
  return (
    <section id="learning" className="relative py-[clamp(72px,8vw,112px)]">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="min-w-0 lg:sticky lg:top-32 lg:self-start">
            <Eyebrow index="04" label="Learning" />
            <Reveal>
              <h2 className="mt-5 font-display text-[clamp(2.8rem,6vw,5.4rem)] font-bold leading-[0.92] tracking-[-0.04em]">
                Always
                <br />
                <Accent>learning.</Accent>
              </h2>
            </Reveal>
            <p className="mt-6 max-w-[34ch] text-md text-ink-soft">{learning.sub}</p>
          </div>

          <ol className="flex min-w-0 flex-col gap-1.5">
            {learning.items.map((item, i) => (
              <m.li
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.95, ease: EASE, delay: 0.06 * i }}
                className="group grid cursor-default grid-cols-[1.6rem_3rem_minmax(0,1fr)] items-center gap-3 rounded-2xl px-4 py-4 transition-colors duration-300 hover:bg-ink hover:text-paper sm:grid-cols-[2.5rem_3.25rem_minmax(0,1fr)] sm:px-6 sm:py-5"
              >
                  <span className="tabular font-mono text-xs text-ink-soft transition-colors group-hover:text-paper/60">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {/* the school's mark, or the certification's badge */}
                  {item.from.includes('Certification') ? (
                    <BadgeMark label={item.title} className="size-12 rounded-[14px] sm:size-[52px] sm:rounded-2xl" />
                  ) : (
                    <OrgMark label={item.from} className="size-12 rounded-[14px] text-[13px] sm:size-[52px] sm:rounded-2xl sm:text-sm" />
                  )}
                  <span className="min-w-0">
                    <span className="block font-display text-[clamp(1.2rem,2vw,1.6rem)] font-semibold leading-tight tracking-[-0.02em]">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm text-ink-soft transition-colors group-hover:text-paper/70">{item.from}</span>
                  </span>
              </m.li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}
