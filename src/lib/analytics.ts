/**
 * Visit counts, without cookies and without following anyone around. Off unless the site is built with
 * VITE_ANALYTICS set (see .env.example), so nothing is loaded and nothing is sent until then. One of:
 *
 *   goatcounter:<code>     the <code> in https://<code>.goatcounter.com
 *   cloudflare:<token>     the token of a Cloudflare Web Analytics site
 *   plausible:<domain>     the site's domain as registered with Plausible
 *
 * Never on a development or preview address, and never for a visitor whose browser asks not to be tracked.
 */
const CONFIG = (import.meta.env.VITE_ANALYTICS as string | undefined)?.trim()

type Goat = { no_onload?: boolean; count?: (vars: { path: string }) => void }
let provider = ''

function script(src: string, attrs: Record<string, string>) {
  const el = document.createElement('script')
  el.async = true
  el.src = src
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  document.head.appendChild(el)
}

export function installAnalytics() {
  if (!CONFIG || !import.meta.env.PROD) return
  if (/^(localhost$|127\.|\[::1\]$)|\.(localhost|test)$/.test(location.hostname)) return
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean }
  if (nav.doNotTrack === '1' || nav.globalPrivacyControl) return
  const at = CONFIG.indexOf(':')
  const id = CONFIG.slice(at + 1)
  if (at < 1 || !id) return
  provider = CONFIG.slice(0, at)
  if (provider === 'goatcounter') {
    // pages are counted by `countPage` (the site changes page without reloading), not by the script's own first count
    ;(window as Window & { goatcounter?: Goat }).goatcounter = { no_onload: true }
    script('https://gc.zgo.at/count.js', { 'data-goatcounter': `https://${id}.goatcounter.com/count` })
  } else if (provider === 'cloudflare') script('https://static.cloudflareinsights.com/beacon.min.js', { 'data-cf-beacon': JSON.stringify({ token: id }) })
  else if (provider === 'plausible') script('https://plausible.io/js/script.js', { 'data-domain': id })
  else provider = ''
}

/** A page was opened (the first one, or another without a reload). Cloudflare and Plausible notice by themselves. */
export function countPage(path: string) {
  if (provider !== 'goatcounter') return
  const send = (tries: number) => {
    const goat = (window as Window & { goatcounter?: Goat }).goatcounter
    if (goat?.count) goat.count({ path })
    else if (tries > 0) setTimeout(() => send(tries - 1), 500)
  }
  send(10)
}
