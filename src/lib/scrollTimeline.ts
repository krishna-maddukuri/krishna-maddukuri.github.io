/**
 * Whether the browser can tie an animation to the scroll position by itself (CSS scroll-driven animations).
 * Where it can, the hero's drift, the timeline's red line and the Achievements track are plain CSS
 * (see "scroll-driven" in index.css) and no script runs while the page scrolls; where it can't, the same
 * effects are driven from script as before.
 */
// (a pre-built page is built for browsers that can)
export const CSS_SCROLL = typeof CSS === 'undefined' || CSS.supports('animation-timeline: view()')
