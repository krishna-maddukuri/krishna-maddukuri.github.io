import * as m from 'motion/react-m'
import type { ReactNode } from 'react'
import { Link } from '../lib/router'
import { education, experience, resume, site } from '../data/site'
import { BadgeMark, LinkedInMark, OrgMark } from '../components/Logo'
import { ResumeLink } from '../components/ResumeLink'
import { ArrowDown, ArrowLeft, ArrowUpRight, Container, EASE } from '../components/ui'

/** The web version of the résumé. Everything on it comes from site.ts, word for word from the PDF. */
export function Resume() {
  return (
    <main id="main" className="pb-10" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 112px)' }}>
      <Container className="max-w-[1080px]!">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="lift btn-fill inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Portfolio
          </Link>
          <ResumeLink className="btn-solid inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper">
            Download PDF <ArrowDown className="size-3.5" />
          </ResumeLink>
        </div>

        <m.article
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="card-shadow mt-8 rounded-[32px] border border-line bg-surface p-6 sm:p-10 lg:p-14"
        >
          <header className="border-b border-line pb-8">
            <h1 className="font-display text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[0.95] tracking-[-0.04em]">
              {site.name}
            </h1>
            <p className="mt-3 text-lg">
              {resume.title} <em className="font-serif italic text-ink-soft">{resume.tagline}</em>
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
              <span>{site.location}</span>
              <span className="select-all">{site.email}</span>
              <a href={site.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-ink">
                <LinkedInMark className="size-4 rounded-[3px]" /> {site.linkedinLabel} <ArrowUpRight className="size-3" />
              </a>
            </div>
          </header>

          <Part title="Summary">
            <p className="max-w-[70ch] text-base leading-relaxed">{resume.summary}</p>
          </Part>

          <Part title="Skills">
            <dl className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {resume.skills.map((g) => (
                <div key={g.label} className="min-w-0">
                  <dt className="text-sm font-semibold">{g.label}</dt>
                  <dd className="mt-1 text-sm text-ink-soft">{g.items}</dd>
                </div>
              ))}
            </dl>
          </Part>

          <Part title="Experience">
            {experience.map((job) => (
              <Job key={`${job.role} · ${job.period}`} title={`${job.role} — ${job.org}`} org={job.org} meta={job.where} period={job.period}>
                {job.points.length > 0 && (
                  <ul className="flex flex-col gap-1.5 text-sm text-ink-soft">
                    {job.points.map((p) => (
                      <li key={p} className="flex gap-2.5">
                        <span className="mt-[10px] h-px w-2.5 shrink-0 bg-ink-soft" aria-hidden />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Job>
            ))}
          </Part>

          <Part title="Education">
            <div className="flex flex-col gap-4">
              {education.map((e) => (
                <div key={e.role} className="flex flex-col justify-between gap-1 sm:flex-row sm:gap-6">
                  <div className="flex min-w-0 items-start gap-3">
                    <OrgMark label={e.org} className="mt-0.5 size-9 rounded-[10px] text-[11px]" />
                    <div className="min-w-0">
                      <div className="font-semibold">{e.role}</div>
                      <div className="text-sm text-ink-soft">
                        {e.org}
                        {e.where && `, ${e.where}`}
                      </div>
                    </div>
                  </div>
                  <span className="tabular shrink-0 font-mono text-xs text-ink-soft">{e.period}</span>
                </div>
              ))}
            </div>
          </Part>

          <Part title="Certifications" last>
            <ul className="flex flex-col gap-2 text-base">
              {resume.certifications.map((c) => (
                <li key={c} className="flex items-center gap-3">
                  <BadgeMark label={c} className="size-10 rounded-xl" />
                  <span className="font-medium">{c}</span>
                </li>
              ))}
            </ul>
          </Part>
        </m.article>
      </Container>
    </main>
  )
}

function Part({ title, children, last = false }: { title: string; children: ReactNode; last?: boolean }) {
  return (
    <section className={`grid gap-4 py-8 md:grid-cols-[170px_minmax(0,1fr)] md:gap-8 ${last ? 'pb-0' : 'border-b border-line'}`}>
      <h2 className="eyebrow pt-1">{title}</h2>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

function Job({ title, org, meta, period, children }: { title: string; org: string; meta: string; period: string; children: ReactNode }) {
  return (
    <div className="mb-8 last:mb-0">
      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <OrgMark label={org} className="mt-0.5 size-10 rounded-xl text-[12px]" />
          <div className="min-w-0">
            <div className="text-lg font-semibold tracking-[-0.01em]">{title}</div>
            <div className="text-sm text-ink-soft">{meta}</div>
          </div>
        </div>
        <span className="tabular shrink-0 font-mono text-xs text-ink-soft">{period}</span>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
