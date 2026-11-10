/**
 * The address of a file in `public/` ("logos/skills/java.svg"), from the site's root. Pages live at their
 * own addresses (/resume/, /work/<slug>/), so a bare relative path would point at a different place on each.
 */
export const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\.?\//, '')
