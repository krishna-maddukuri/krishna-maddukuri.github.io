import type { ReactElement } from 'react'
import type { IconName } from '../data/site'

/** Plain line icons drawn for this site, for the achievement cards. */
const paths: Record<string, ReactElement> = {
  chart: <path d="M4 20h16M7 16.5v-5M12 16.5V7M17 16.5v-7.5" />,
  report: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 16v-3M12 16V9M15 16v-5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  hourglass: <path d="M7 3h10M7 21h10M8 3c0 4.5 8 4.5 8 9s-8 4.5-8 9M16 3c0 4.5-8 4.5-8 9s8 4.5 8 9" />,
  shield: (
    <>
      <path d="M12 3 19 6v6c0 4.2-3 7.4-7 9-4-1.6-7-4.8-7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  trophy: <path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 3M16 6h3a3 3 0 0 1-3 3M12 13v4M9 20h6M10 17h4" />,
  bug: (
    <>
      <rect x="8" y="7" width="8" height="12" rx="4" />
      <path d="M12 7V5M9.6 5.6 8 4M14.4 5.6 16 4M8 11H4.5M8 15H4.5M16 11h3.5M16 15h3.5M12 11v8" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.6 14.2A4.6 4.6 0 0 1 21 18.6" />
    </>
  ),
  box: (
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </>
  ),
  rocket: (
    <>
      <path d="M14.5 4.5c2.5-1 4.5-1 5-.5s.5 2.5-.5 5l-6 6-4-4z" />
      <path d="M9 11 6 10.5 3.5 13l4 1M13 15l.5 3 2.5-2.5-1-4M8 16.5 5.5 19M15.2 8.8h.01" />
    </>
  ),
  pulse: <path d="M3 12h4l2.5-6 4 12 2.5-6H21" />,
  repeat: (
    <>
      <path d="M4 11V9a3 3 0 0 1 3-3h12M16 3l3 3-3 3" />
      <path d="M20 13v2a3 3 0 0 1-3 3H5M8 21l-3-3 3-3" />
    </>
  ),
  bank: <path d="M3.5 9 12 4l8.5 5M5 9v8M9.7 9v8M14.3 9v8M19 9v8M3.5 20h17" />,
}

export function Icon({ name, className = 'size-6', stroke = 1.6 }: { name: IconName | string; className?: string; stroke?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {paths[name] ?? paths.chart}
    </svg>
  )
}
