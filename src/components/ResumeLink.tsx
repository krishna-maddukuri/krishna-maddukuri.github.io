import type { ReactNode } from 'react'
import { site } from '../data/site'

export const resumeFileName = () => site.resumePdf.split('/').pop() || 'resume.pdf'

/** A link that downloads the résumé PDF. Hidden when no PDF is set in site.ts. */
export function ResumeLink({
  className,
  children,
  ariaLabel = `Download ${site.first}'s resume (PDF)`,
}: {
  className?: string
  children: ReactNode
  ariaLabel?: string
}) {
  if (!site.resumePdf) return null
  return (
    <a href={site.resumePdf} download={resumeFileName()} aria-label={ariaLabel} className={className}>
      {children}
    </a>
  )
}
