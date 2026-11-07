import * as m from 'motion/react-m'
import type { ReactNode } from 'react'
import { Link, Navigate, useParams } from '../lib/router'
import { projects } from '../data/site'
import { ProjectVisual } from '../visuals/LazyProjectVisual'
import { OrgMark, ToolChip } from '../components/Logo'
import { ArrowLeft, ArrowRight, Check, Container, EASE, Reveal } from '../components/ui'

export function CaseStudy() {
  const { slug } = useParams()
  const idx = projects.findIndex((p) => p.slug === slug)
  if (idx < 0) return <Navigate to="/" replace />

  const p = projects[idx]
  const next = projects[(idx + 1) % projects.length]
  const prev = projects[(idx - 1 + projects.length) % projects.length]
  const num = (i: number) => String(i + 1).padStart(2, '0')

  const meta = [
    { k: 'Role', v: p.role },
    { k: 'Where', v: p.org },
    { k: 'When', v: p.period },
    { k: 'Tools', v: p.tools.slice(0, 3).join(', ') },
  ]

  return (
    <main id="main" key={p.slug} className="pb-10" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 112px)' }}>
      <Container>
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            state={{ section: 'work' }}
            className="lift btn-fill inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="size-3.5" /> All work
          </Link>
          <span className="eyebrow tabular">
            {num(idx)} / {String(projects.length).padStart(2, '0')}
          </span>
        </div>

        <div className="eyebrow mt-12 flex flex-wrap items-center gap-3">
          <span>Case study <span className="accent-index">{num(idx)}</span></span>
          <span className="h-px w-8 bg-line" aria-hidden />
          <OrgMark label={p.org} className="size-5 rounded-md text-[8px]" />
          <span>{p.eyebrow}</span>
        </div>
        <m.h1
          className="mt-5 font-display text-[clamp(2.8rem,8vw,7.4rem)] font-bold leading-[0.92] tracking-[-0.045em]"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          {p.title}{' '}
          <em className="accent-tail font-serif font-normal italic tracking-[-0.015em]">{p.accent}</em>
        </m.h1>
        <m.p
          className="mt-6 max-w-[58ch] text-lg text-ink-soft"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {p.summary}
        </m.p>

        <dl className="mt-10 grid grid-cols-2 border-y border-line lg:grid-cols-4">
          {meta.map((m, i) => (
            <div
              key={m.k}
              className={`min-w-0 py-5 pr-4 ${i % 2 === 1 ? 'border-l border-line pl-4' : ''} ${i === 2 ? 'lg:border-l lg:border-line lg:pl-4' : ''} ${
                i >= 2 ? 'border-t border-line lg:border-t-0' : ''
              }`}
            >
              <dt className="eyebrow">{m.k}</dt>
              <dd className="mt-1.5 flex items-center gap-2 text-base font-medium">
                {m.k === 'Where' && <OrgMark label={m.v} className="size-5 rounded-md text-[8px]" />}
                {m.v}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <m.div
              initial={{ y: 40, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: EASE, delay: 0.25 }}
            >
              <ProjectVisual kind={p.visual} className="aspect-[4/3] w-full" />
            </m.div>
            {p.metrics.length > 0 && (
              <div className={`mt-4 grid gap-4 ${p.metrics.length === 1 ? 'grid-cols-1' : p.metrics.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {p.metrics.map((m) => (
                  <div key={m.label} className="lift rounded-2xl border border-line bg-surface p-4 sm:p-5">
                    <div className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-none tracking-[-0.04em]">{m.value}</div>
                    <div className="mt-2 text-sm leading-snug text-ink-soft">{m.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <Block title="Context" first>
              <p className="max-w-[60ch] text-lg leading-relaxed">{p.context}</p>
            </Block>
            <Block title="What I did">
              <ul className="flex flex-col gap-3.5 text-md">
                {p.did.map((d) => (
                  <li key={d} className="flex gap-3">
                    <span className="mt-[12px] h-px w-4 shrink-0 bg-ink" aria-hidden />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </Block>
            <Block title="Outcome">
              <ul className="flex flex-col gap-3 text-md">
                {p.outcomes.map((o) => (
                  <li key={o} className="flex gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-ink text-paper">
                      <Check className="size-3.5" />
                    </span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </Block>
            <Block title="Tools & methods">
              <div className="flex flex-wrap gap-2">
                {p.tools.map((t) => (
                  <ToolChip key={t} name={t} className="bg-surface px-3! py-1.5! text-ink!" />
                ))}
              </div>
            </Block>
          </div>
        </div>

        <div className="mt-24 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <Link
            to={`/work/${prev.slug}`}
            className="lift group flex flex-col justify-between gap-6 rounded-[28px] border border-line bg-surface p-6 sm:p-8"
          >
            <span className="eyebrow inline-flex items-center gap-2">
              <ArrowLeft className="size-3" /> Previous
            </span>
            <span className="font-display text-2xl font-semibold leading-tight tracking-[-0.03em]">{prev.title}</span>
          </Link>
          <Link
            to={`/work/${next.slug}`}
            className="btn-solid btn-still group flex flex-col justify-between gap-6 rounded-[28px] bg-ink p-6 text-paper sm:p-8"
          >
            <span className="eyebrow inline-flex items-center gap-2 text-paper/60">
              Next case study <ArrowRight className="size-3" />
            </span>
            <span className="flex items-end justify-between gap-6">
              <span className="font-display text-[clamp(2rem,5vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
                {next.title}{' '}
                <em className="font-serif font-normal italic tracking-[-0.01em] opacity-60">{next.accent}</em>
              </span>
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-paper text-ink transition-transform group-hover:translate-x-1">
                <ArrowRight className="size-5" />
              </span>
            </span>
          </Link>
        </div>
      </Container>
    </main>
  )
}

function Block({ title, children, first = false }: { title: string; children: ReactNode; first?: boolean }) {
  return (
    <Reveal y={20}>
      <section className={first ? 'pb-8' : 'border-t border-line py-8'}>
        <h2 className="eyebrow mb-5">{title}</h2>
        {children}
      </section>
    </Reveal>
  )
}
