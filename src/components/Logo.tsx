import type { CSSProperties } from 'react'
import { elements } from '../data/site'
import { badgeFor, brandLogos, orgFor, skillLogos, toolAliases, type Badge, type Logo, type Org } from '../data/logos'

/**
 * A logo on a plate tinted with its brand colour. The plate stays light in both themes (like a
 * sticker), so dark marks such as Kafka's and GitHub's read in dark mode too; a logo drawn for a
 * dark ground sets `plate` and gets a solid plate in that colour (Capital One's navy), and a wordmark
 * too wide to read on a square sets `wide` (the plate keeps the class's height and widens). Size and
 * corner radius come from `className`; `--fit` is how much of the plate the picture may take.
 */
export function Plate({ logo, alt = '', className = 'size-10 rounded-xl', eager = false }: { logo: Logo; alt?: string; className?: string; eager?: boolean }) {
  return (
    <span className={`plate ${className}`} style={plateStyle(logo.color, logo.fit, logo.plate, logo.wide)}>
      <img src={logo.file} alt={alt} draggable={false} loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </span>
  )
}

/** The same plate with initials instead of a picture (until the logo file is in /public/logos). */
export function Monogram({ text, color, className = 'size-10 rounded-xl text-[13px]' }: { text: string; color: string; className?: string }) {
  return (
    <span className={`plate font-display font-bold leading-none tracking-[-0.02em] ${className}`} style={plateStyle(color)} aria-hidden>
      <span style={{ color: `color-mix(in oklab, ${color} 82%, #000000)` }}>{text}</span>
    </span>
  )
}

function plateStyle(color: string, fit?: number, plate?: string, wide?: number): CSSProperties {
  return {
    '--brand': color,
    ...(fit ? { '--fit': fit } : {}),
    ...(plate ? { '--plate': plate } : {}),
    // a wide plate keeps the height its class gives it and takes its width from the ratio
    ...(wide ? { width: 'auto', aspectRatio: wide } : {}),
  } as CSSProperties
}

/** An organisation's mark (the squarer cut of its logo where there is one, or its initials in its colour) for a label that names it. */
export function OrgMark({ label, org: given, className }: { label?: string; org?: Org; className?: string }) {
  const org = given ?? (label ? orgFor(label) : undefined)
  if (!org) return null
  const logo = org.mark ?? org.logo
  return logo ? <Plate logo={logo} alt={org.name} className={className} /> : <Monogram text={org.short} color={org.color} className={className} />
}

/** A certification's badge for a label that names it (the AWS mark until the badge pictures are in). */
export function BadgeMark({ label, badge: given, className = 'size-10 rounded-xl' }: { label?: string; badge?: Badge; className?: string }) {
  const badge = given ?? (label ? badgeFor(label) : undefined)
  if (!badge) return null
  if (badge.file) return <img src={badge.file} alt={badge.name} className={`${className} object-contain`} loading="lazy" decoding="async" draggable={false} />
  return <Plate logo={brandLogos.aws} alt={badge.name} className={className} />
}

/** The LinkedIn mark, in its blue. */
export function LinkedInMark({ className = 'size-5 rounded-[5px]' }: { className?: string }) {
  return <img src={brandLogos.linkedin.file} alt="" className={className} draggable={false} decoding="async" />
}

const byName = new Map(elements.map((e) => [e.name, e.sym]))

/** The periodic-table logo for a tool named in a project ("Spring Batch", "AWS RDS"), if it has one. */
export function toolLogo(name: string): Logo | undefined {
  const sym = byName.get(name) ?? toolAliases[name]
  return sym ? skillLogos[sym] : undefined
}

/** A tool's name with its small logo in front (on a tiny plate, so dark marks show on dark chips too), for the chips under a project. */
export function ToolChip({ name, className = '' }: { name: string; className?: string }) {
  const logo = toolLogo(name)
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-xs text-ink-soft ${className}`}>
      {logo && <Plate logo={{ ...logo, fit: 0.8 }} className="size-4 rounded-[4px]" />}
      {name}
    </span>
  )
}
