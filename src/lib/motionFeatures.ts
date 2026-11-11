/**
 * The animation library's engine (reveals on scroll, gestures, dragging, layout moves). It is a file of its
 * own, fetched beside the page's first script instead of inside it (App.tsx), so that script is lighter and
 * runs sooner; the first screen's entrances are plain CSS and never wait for this.
 */
export { domMax as default } from 'motion/react'
