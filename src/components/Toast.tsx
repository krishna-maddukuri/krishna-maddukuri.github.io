import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { useEffect, useState } from 'react'
import { Check } from './ui'

const EVENT = 'site:toast'

/** Show a short confirmation at the top of the screen, e.g. toast('Email copied'). */
export function toast(message: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: message }))
}

/** Copy text to the clipboard. Returns false if the browser blocks it. */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** A glass pill that drops in under the header, like a notification on a phone. */
export function Toaster() {
  const [note, setNote] = useState<{ id: number; text: string } | null>(null)

  useEffect(() => {
    let timer = 0
    const show = (e: Event) => {
      setNote({ id: Date.now(), text: (e as CustomEvent<string>).detail })
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setNote(null), 2200)
    }
    window.addEventListener(EVENT, show)
    return () => {
      window.removeEventListener(EVENT, show)
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top,0px)+74px)] z-[60] flex justify-center px-4 lg:top-[92px]"
    >
      <AnimatePresence>
        {note && (
          <m.div
            key={note.id}
            className="glass glass-strong flex h-11 items-center gap-2.5 rounded-full pl-2 pr-4 text-[13.5px] font-medium text-ink"
            initial={{ y: -26, scale: 0.6, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -16, scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 32 }}
          >
            <span className="grid size-7 place-items-center rounded-full bg-ink text-paper" aria-hidden>
              <Check className="size-3.5" />
            </span>
            {note.text}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
