import { projects, site } from '../data/site'

/**
 * What the browser tab reads on each page: his name on the home page, the page's name before it elsewhere,
 * and "Page not found" at an address the site does not have.
 */
export function pageTitle(path: string) {
  if (path === '/') return site.name
  if (path === '/resume') return `Resume | ${site.name}`
  const project = path.startsWith('/work/') ? projects.find((p) => `/work/${p.slug}` === path) : undefined
  return project ? `${project.title} | ${site.name}` : `Page not found | ${site.name}`
}

/**
 * The line under the title when a page's link is shared (and in search results): the case study's own summary,
 * a line for the resume; the home page keeps the one written in index.html (null).
 */
export function pageDescription(path: string) {
  if (path === '/resume') return `The resume of ${site.name}, ${site.role}: experience, skills, education and certifications.`
  const project = path.startsWith('/work/') ? projects.find((p) => `/work/${p.slug}` === path) : undefined
  return project ? project.summary : null
}
