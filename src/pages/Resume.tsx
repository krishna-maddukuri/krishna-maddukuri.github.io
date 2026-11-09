import * as m from 'motion/react-m'
import type { ReactNode } from 'react'
import { Link } from '../lib/router'
import { education, experience, resume, site } from '../data/site'
import { BadgeMark, LinkedInMark, OrgMark } from '../components/Logo'
import { ResumeLink } from '../components/ResumeLink'
import { ArrowDown, ArrowLeft, ArrowUpRight, Container, EASE, Reveal } from '../components/ui'

/**
 * The web version of the résumé, in the site's own UI: the keys at the top; his name and role, with his
 * details in a panel cut into cells (as on the home page); then each part under a numbered label, as the
 * home page's sections are: the summary in a panel, the skills as a panel of cells, the roles as cards on
 * a timeline (as Experience), the degrees and certifications as cards. Everything on it comes from
 * site.ts, word for word from the PDF.
 */
export function Resume() {
  return (
    <main id="main" className="pb-10" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 112px)' }}>
      <Container className="max-w-[1080px]!">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="lift btn-fill btn-key">
            <ArrowLeft className="size-3.5" /> Portfolio
          </Link>
          <ResumeLink className="btn-solid btn-key btn-key--primary">
            Download PDF <ArrowDown className="size-3.5" />
          </ResumeLink>
        </div>

        <m.header
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mt-12 sm:mt-16"
        >
          <div className="eyebrow">Resume</div>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,7vw,5.4rem)] font-bold leading-[0.95]">{site.name}</h1>
          <p className="mt-4 text-lg">
            {resume.title} <em className="font-hand not-italic text-ink-soft">{resume.tagline}</em>
          </p>
          <dl className="resume-cells resume-cells--3 mt-8">
            <div className="resume-cell">
              <dt className="eyebrow">Based in</dt>
              <dd className="resume-cell-value">{site.location}</dd>
            </div>
            <div className="resume-cell">
              <dt className="eyebrow">Email</dt>
              <dd className="resume-cell-value select-all [overflow-wrap:anywhere]">{site.email}</dd>
            </div>
            <div className="resume-cell">
              <dt className="eyebrow">LinkedIn</dt>
              <dd className="resume-cell-value">
                <a href={site.linkedin} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2">
                  <LinkedInMark className="size-5 shrink-0 rounded-[4px]" />
                  <span className="[overflow-wrap:anywhere]">{site.linkedinLabel}</span>
                  <ArrowUpRight className="size-3.5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </dd>
            </div>
          </dl>
        </m.header>

        <Part index="01" title="Summary">
          <Reveal y={20} className="resume-panel">
            <p className="resume-lead">{resume.summary}</p>
          </Reveal>
        </Part>

        <Part index="02" title="Skills">
          <Reveal y={20}>
            <dl className="resume-cells resume-cells--2">
              {resume.skills.map((g) => (
                <div key={g.label} className="resume-cell">
                  <dt className="eyebrow">{g.label}</dt>
                  <dd className="mt-2.5 text-[15px] leading-relaxed text-ink-soft">{g.items}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Part>

        <Part index="03" title="Experience">
          {/* the roles on a line, newest first; the current one's dot is red, as on the home page */}
          <ol className="resume-timeline">
            {experience.map((job) => (
              <li key={`${job.role} · ${job.period}`}>
                <Reveal y={20} className="relative">
                  <span className={`resume-dot ${job.current ? 'is-current' : ''}`} aria-hidden />
                  <article className="resume-card">
                    <div className="flex flex-col justify-between gap-x-6 gap-y-2 sm:flex-row sm:items-start">
                      <div className="flex min-w-0 items-start gap-3.5">
                        <OrgMark label={job.org} className="size-11 shrink-0 rounded-[13px] text-[13px]" />
                        <div className="min-w-0">
                          <h3 className="font-display text-[clamp(1.3rem,2.2vw,1.65rem)] font-bold leading-[1.1]">{job.role}</h3>
                          <p className="mt-1.5 text-sm text-ink-soft">
                            {job.org} · {job.where}
                          </p>
                        </div>
                      </div>
                      <span className="tabular flex shrink-0 items-center gap-2 font-mono text-xs text-ink-soft sm:pt-1.5">
                        {job.current && <span className="live-dot size-1.5 rounded-full" aria-hidden />}
                        {job.period}
                      </span>
                    </div>
                    {job.points.length > 0 && (
                      <ul className="mt-5 flex flex-col gap-2.5 text-[15px] leading-relaxed">
                        {job.points.map((p) => (
                          <li key={p} className="flex gap-3">
                            <span className="mt-[11px] h-px w-3.5 shrink-0 bg-ink-soft" aria-hidden />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>
        </Part>

        <Part index="04" title="Education">
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {education.map((e, i) => (
              <Reveal key={e.role} y={20} delay={i * 0.06} className="resume-card flex items-start gap-3.5">
                <OrgMark label={e.org} className="size-11 shrink-0 rounded-[13px] text-[13px]" />
                <div className="min-w-0">
                  <h3 className="font-display text-[1.3rem] font-bold leading-[1.15]">{e.role}</h3>
                  <p className="mt-1.5 text-sm text-ink-soft">
                    {e.org}
                    {e.where && ` · ${e.where}`}
                  </p>
                  <p className="tabular mt-3 font-mono text-xs text-ink-soft">{e.period}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Part>

        <Part index="05" title="Certifications">
          <div className="grid gap-3.5 sm:grid-cols-2">
            {resume.certifications.map((c, i) => (
              <Reveal key={c} y={20} delay={i * 0.06} className="resume-card flex items-center gap-3.5">
                <BadgeMark label={c} className="size-12 shrink-0 rounded-xl" />
                <h3 className="font-display text-[1.3rem] font-bold leading-[1.15]">{c}</h3>
              </Reveal>
            ))}
          </div>
        </Part>
      </Container>
    </main>
  )
}

/** One part of the résumé under a numbered label ("03 —— EXPERIENCE"), as the home page's sections are. */
function Part({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return (
    <section className="mt-[clamp(48px,7vw,88px)]">
      <h2 className="eyebrow flex items-center gap-3">
        <span className="accent-index tabular">{index}</span>
        <span className="h-px w-10 bg-ink-soft/40" aria-hidden />
        <span>{title}</span>
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}
