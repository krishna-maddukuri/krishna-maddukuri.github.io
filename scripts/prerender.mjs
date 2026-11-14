/**
 * After `vite build`: draws every page to HTML and writes it at its own address, so each page is served
 * ready-made (dist/index.html, dist/resume/index.html, dist/work/<slug>/index.html).
 * Also writes dist/404.html (the bare app, for an address that has no page: it shows the "page not found"
 * note), dist/sitemap.xml and dist/robots.txt.
 *
 * SITE_URL is where the site lives (for the sitemap and each page's canonical address);
 * SITE_BASE is its sub-path, if it is served from one (the same value vite.config.ts reads).
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'

const SITE_URL = (process.env.SITE_URL || 'https://krishna-maddukuri.github.io').replace(/\/+$/, '')
const BASE = process.env.SITE_BASE || '/'
const DIST = 'dist'
const SSR = 'node_modules/.prerender'

await build({ logLevel: 'warn', build: { ssr: 'src/entry-server.tsx', outDir: SSR, emptyOutDir: true } })
const { render, routes, pageTitle, pageDescription } = await import(pathToFileURL(path.resolve(SSR, 'entry-server.js')).href)

const shell = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
const ROOT = '<div id="root"></div>'
if (!shell.includes(ROOT)) throw new Error('index.html has no empty #root to fill')

// a pre-built page with script switched off shows itself: its noscript block only reveals the parts that
// wait for the script (the same rule as html.script-failed in index.css)
const NOSCRIPT = /<noscript id="boot-fallback">[\s\S]*?<\/noscript>/
if (!NOSCRIPT.test(shell)) throw new Error('index.html has no boot-fallback block')
const REVEAL = `<noscript><style>[style*="opacity:0"]{opacity:1!important;transform:none!important;filter:none!important}.wm-ch{opacity:1!important}.hero-stack{visibility:visible!important}.skills-table{opacity:1!important;transform:none!important}.arch-draw .arch-stage,.arch-draw .arch-after{opacity:1!important}</style></noscript>`
// only the home page has the figure: the other pages don't fetch its picture and mesh ahead of time
const FIGURE = /^\s*<link rel="preload" href="[^"]*avatar\/krishna-origami[^"]*"[^>]*>\n/gm

const TITLE = /<title>[^<]*<\/title>/
if (!TITLE.test(shell)) throw new Error('index.html has no title')
const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
// an address with no page: the bare app, named for what it will show, and kept out of search results
fs.writeFileSync(
  path.join(DIST, '404.html'),
  shell.replace(FIGURE, '').replace(TITLE, () => `<title>${escape(pageTitle('/404'))}</title>\n    <meta name="robots" content="noindex" />`),
)

/**
 * The card a shared link shows: every page carries its own address, title and description, and the
 * picture's full address (apps that draw the card need one). The home page keeps the title and description
 * written in index.html.
 */
const meta = (html, key, content) => {
  const tag = new RegExp(`(<meta (?:name|property)="${key}" content=")[^"]*(")`)
  if (!tag.test(html)) throw new Error(`index.html has no ${key} tag`)
  return html.replace(tag, (_, a, b) => `${a}${escape(content)}${b}`)
}
// the picture's file name, with its ?v=, is the one index.html names; the build puts the site's address before it
const PICTURE = /<meta property="og:image" content="[^"]*\/([^"/]+)"/.exec(shell)?.[1]
if (!PICTURE) throw new Error('index.html has no og:image tag')
const card = (html, route) => {
  const picture = `${SITE_URL}${BASE}${PICTURE}`
  let out = meta(meta(meta(html, 'og:image', picture), 'twitter:image', picture), 'og:url', `${SITE_URL}${address(route)}`)
  if (route === '/') return out
  out = meta(out, 'og:title', pageTitle(route))
  const description = pageDescription(route)
  return description ? meta(meta(out, 'description', description), 'og:description', description) : out
}

/** "/resume" -> "/resume/" under the base: the address of a route. */
const address = (route) => (route === '/' ? BASE : `${BASE}${route.slice(1)}/`)
// a page that loads part of its code separately fetches that part alongside the main script
const assets = fs.readdirSync(path.join(DIST, 'assets'))
const chunk = (name) => assets.filter((f) => f.startsWith(`${name}-`) && f.endsWith('.js')).map((f) => `<link rel="modulepreload" crossorigin href="${BASE}assets/${f}" />`)
const extra = (route) => (route === '/resume' ? chunk('Resume') : route.startsWith('/work/') ? [...chunk('CaseStudy'), ...chunk('ProjectVisual')] : [])

for (const route of routes) {
  const html = await render(route)
  const head = [`<link rel="canonical" href="${SITE_URL}${address(route)}" />`, ...extra(route)].map((l) => `    ${l}\n`).join('')
  const page = card(route === '/' ? shell : shell.replace(FIGURE, ''), route)
    .replace(TITLE, () => `<title>${escape(pageTitle(route))}</title>`)
    .replace(NOSCRIPT, () => REVEAL)
    .replace(ROOT, () => `<div id="root" data-prerendered="${route}">${html}</div>`)
    .replace('  </head>', () => `${head}  </head>`)
  const file = path.join(DIST, route === '/' ? '' : route.slice(1), 'index.html')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, page)
  console.log(`pre-built ${address(route)} (${(page.length / 1024).toFixed(0)} KB)`)
}

fs.writeFileSync(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((r) => `  <url><loc>${SITE_URL}${address(r)}</loc></url>`).join('\n')}\n</urlset>\n`,
)
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}${BASE}sitemap.xml\n`)
fs.rmSync(SSR, { recursive: true, force: true })
