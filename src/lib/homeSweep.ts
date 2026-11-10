/**
 * What the hero does when the page comes home (the name in the header): a red blade crosses the first screen.
 * On wide screens the blade is the red tape itself: it starts at the left edge, crosses, slows and settles
 * back into its place on the right, where its words come back. Narrower screens have no tape on the first
 * screen, so a blade of the tape's width crosses and leaves. As it passes, each letter of the giant name
 * flashes red and cools, the red block wipes in again with its words, and everything else in the hero (the
 * hello, the intro (typed again), the numbers, the buttons, the list beside him and his stack) comes in again behind the
 * blade, each piece when the blade reaches it and a touch later the lower it sits.
 * (The figure answers on its own: components/PaperFigure.tsx.) Nothing here runs for people who ask for
 * less motion; every animation is a one-off that leaves the page exactly as it found it.
 */
const BLADE: [number, number, number, number] = [0.65, 0, 0.2, 1]
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'
const DELAY = 200
const CROSS = 1050

/** The blade's easing, as a table of [time, progress] (both 0..1), to ask when it reaches a given place. */
const CURVE = Array.from({ length: 61 }, (_, n) => {
  const u = n / 60
  const a = 3 * (1 - u) * (1 - u) * u
  const b = 3 * (1 - u) * u * u
  return [a * BLADE[0] + b * BLADE[2] + u * u * u, a * BLADE[1] + b * BLADE[3] + u * u * u] as const
})
function timeAt(progress: number) {
  if (progress <= 0) return 0
  if (progress >= 1) return 1
  const n = CURVE.findIndex(([, y]) => y >= progress)
  const [x0, y0] = CURVE[n - 1]
  const [x1, y1] = CURVE[n]
  return x0 + ((x1 - x0) * (progress - y0)) / (y1 - y0 || 1)
}

export function homeSweep(hero: HTMLElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof hero.animate !== 'function') return
  const root = document.documentElement
  const vw = root.clientWidth
  const red = getComputedStyle(root).getPropertyValue('--brand-red').trim() || '#f0412e'
  const easing = `cubic-bezier(${BLADE.join(',')})`
  const tape = document.querySelector<HTMLElement>('.role-tape-window')
  let width = tape?.offsetWidth || 24
  let from = 0
  let to = vw - width

  if (tape && window.matchMedia('(min-width: 1024px)').matches) {
    // the tape is the blade
    tape.animate([{ transform: `translateX(${-to}px)` }, { transform: 'translateX(0)' }], {
      duration: CROSS,
      delay: DELAY,
      easing,
      fill: 'backwards',
    })
    tape.querySelector('.role-tape-run')?.animate([{ opacity: 0 }, { opacity: 0, offset: 0.74 }, { opacity: 1 }], {
      duration: DELAY + CROSS + 450,
    })
  } else {
    // a blade of its own, over the first screen, gone when it has crossed
    const blade = document.createElement('div')
    blade.setAttribute('aria-hidden', 'true')
    blade.dataset.homeBlade = ''
    blade.style.cssText = `position:absolute;top:0;left:0;z-index:30;width:${width}px;height:${Math.min(hero.offsetHeight, window.innerHeight)}px;background:${red};pointer-events:none`
    from = -width
    to = vw
    hero.append(blade)
    const run = blade.animate([{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }], {
      duration: CROSS,
      delay: DELAY,
      easing,
      fill: 'both',
    })
    run.onfinish = run.oncancel = () => blade.remove()
  }

  /** When (ms from now) the middle of the blade reaches this x on the screen. */
  const reaches = (x: number) => DELAY + CROSS * timeAt((x - width / 2 - from) / (to - from))

  // the giant name: each letter flashes red as the blade passes it, then cools
  for (const ch of hero.querySelectorAll<HTMLElement>('.wm-ch')) {
    const box = ch.getBoundingClientRect()
    const fill = getComputedStyle(ch).color
    ch.animate([{ color: fill }, { color: red, offset: 0.15 }, { color: fill }], {
      duration: 900,
      delay: reaches(box.left + box.width / 2),
      easing: 'ease-out',
    })
  }

  // the red block wipes in again behind the blade, its words rise into it, and the numbers count up
  const block = hero.querySelector<HTMLElement>('.role-block')
  const at = block ? reaches(block.getBoundingClientRect().left) : DELAY
  block?.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], {
    duration: 800,
    delay: at,
    easing: EASE_OUT,
    fill: 'backwards',
  })
  hero.querySelectorAll<HTMLElement>('.role-word').forEach((word, i) => {
    word.animate([{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }], {
      duration: 900,
      delay: at + 150 + i * 100,
      easing: EASE_OUT,
      fill: 'backwards',
    })
  })
  // everything else comes in again as the blade reaches it, the lower pieces a touch later
  const top = hero.getBoundingClientRect().top
  const tall = Math.min(hero.offsetHeight, window.innerHeight) || 1
  const after = (el: Element) => {
    const box = el.getBoundingClientRect()
    return reaches(box.left) + Math.max(0, Math.min(1, (box.top - top) / tall)) * 350
  }
  for (const el of hero.querySelectorAll<HTMLElement>('.enter')) {
    if (el.querySelector('[data-paper-figure]')) continue // he answers on his own
    const y = getComputedStyle(el).getPropertyValue('--enter-y').trim() || '14px'
    el.animate([{ opacity: 0, transform: `translateY(${y})` }, { opacity: 1, transform: 'translateY(0)' }], {
      duration: 700,
      delay: after(el),
      easing: EASE_OUT,
      fill: 'backwards',
    })
  }
  // the intro, typed again behind its red caret (in about a second, to land with the rest)
  const letters = hero.querySelectorAll<HTMLElement>('.lede-ch')
  const typed = letters.length ? after(letters[0]) : 0
  const caret = [{ boxShadow: `2px 0 0 ${red}` }, { boxShadow: `2px 0 0 ${red}` }]
  letters.forEach((letter, i) => {
    const delay = typed + (Number(letter.style.getPropertyValue('--c')) || i) * 5
    letter.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay, fill: 'backwards' })
    letter.animate(caret, i === letters.length - 1 ? { duration: 700, delay } : { duration: 5, delay })
  })
  for (const count of hero.querySelectorAll<HTMLElement>('.count')) {
    const value = Number(count.style.getPropertyValue('--to'))
    if (!Number.isFinite(value)) continue
    try {
      count.animate([{ '--count': 0 }, { '--count': value }], {
        duration: 1100,
        delay: after(count) + 100,
        easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
        fill: 'backwards',
      })
    } catch {
      // a browser that cannot animate the counter leaves the number as it is
    }
  }
}
