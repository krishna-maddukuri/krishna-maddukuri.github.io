import { projects, site } from '../data/site'

/** What the browser tab reads on each page: his name on the home page, the page's name before it elsewhere. */
export function pageTitle(path: string) {
  if (path === '/resume') return `Resume | ${site.name}`
  const project = path.startsWith('/work/') ? projects.find((p) => `/work/${p.slug}` === path) : undefined
  return project ? `${project.title} | ${site.name}` : site.name
}
