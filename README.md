# Krishna Koushik Maddukuri — Portfolio

**Live site: https://krishna-maddukuri.github.io**

The personal portfolio of Krishna Koushik Maddukuri, a Senior Software Engineer building distributed
systems and cloud-native microservices for financial services. It is one scrolling page with eight
sections, a case-study page for each project, and a web version of his résumé.

## Sections

1. **Hero** — his name in large faded letters behind a full-length paper-craft figure of him (on load each
   letter draws in as a hairline outline, construction lines and all, then fills; the name is lit like a
   spotlight, brightest behind him), a
   "Hi, I'm Krishna." chat bubble, the headline, a short intro that fades in word by word, a spinning
   "Open to…" badge, and Explore work / Let's talk / Resume buttons. The figure arrives in pieces: about
   450 paper shards (big ones on the body, smaller ones on the face) glide in from all around and lock
   together. Once he's together he breathes, the shards under the cursor lift out of its way, and a click
   scatters him (farther on wide screens, where there is room); he drifts back together by himself. On
   phones and tablets the first screen is just him, cut into ~90 big pieces, with a "Scatter him" /
   "Keep together" button under his feet; the words follow below.
2. **About** — a lanyard ID card you can drag around and tap to flip (on phones, press and hold it to pick it
   up; a normal swipe over it scrolls the page), a short bio and quick facts.
3. **Skills** — "The periodic table of my stack": 48 skills in eight groups. Point at (or tap) a tile to see
   what it is, with its logo on a plate in its brand's colour.
4. **Work** — "Things I've built": seven projects from Capital One, NGA Group and Infosys in panels that open
   on hover (rows you tap open on phones), each with its own case-study page.
5. **Always learning** — his doctorate, AWS certifications and degrees.
6. **Education & experience** — a timeline of his jobs and degrees.
7. **Proud moments** — his achievement numbers on cards that slide sideways as you scroll, each with the
   company's logo.
8. **Contact** — email, LinkedIn and the résumé download.

Also included: a web résumé page (`/#/resume`), a downloadable PDF résumé, a true-black dark mode
(the site always opens in light mode; the switch holds for the visit, and switching spreads the new theme out from the button), and a phone layout with a clear
"liquid glass" header and menu: the menu button shows which section you're reading, the menu grows out of
it, the skill details stay pinned on glass while you scroll the table, and copying the email shows a small
confirmation. Buttons answer the pointer with a fill that rises in the accent colour, and cards light up
in it under the pointer. Visitors who turn on "reduce motion" or "reduce transparency" get calmer, solid
versions.

**The paper figure.** `public/avatar/krishna-origami.webp` is the cut-out and
`public/avatar/krishna-origami.json` the shard mesh (points, depth and triangles) that was cut along the
paper's own creases; `krishna-origami-lite.json` is the coarse cut used below 1024px (a few dozen even
triangles inside the silhouette). `src/components/PaperFigure.tsx` draws the shards with WebGL in one draw call;
every shard's glide, scatter, lift and the figure's turn happen in the vertex shader, so a phone handles
it easily. Browsers without WebGL and visitors with "reduce motion" on get the still cut-out instead.

**Type.** Headlines are set in Bricolage Grotesque, text in Geist, labels in Geist Mono and the italic
accents in Instrument Serif. All four are self-hosted (`public/fonts`, latin only, with their licences)
with metric-matched fallbacks, so nothing jumps while they load.

**Colour.** Black ink on paper, white on true black in dark mode, and one accent on the emphasised parts (the
italic tail of every heading, the key words in the intro and the About lead, the achievement numbers, the
eyebrow index, the timeline, the dot after the headline and text selection): teal in both modes, a deeper
one (#0F8B8D) on the paper and a brighter one (#2ED3D5) on black. The tokens are at the top of `src/index.css` (`--accent` for dots and lines,
`--accent-display` for big text, `--accent-text` for body-size words; `--accent-mark` can draw a highlighter
stroke behind accent text for a colour that can't be read on its paper). Brand colour comes from the logos:
every skill has one (`public/logos/skills`, listed with its brand colour in `src/data/logos.ts`), the LinkedIn
mark sits beside every LinkedIn link, and companies, schools and certifications show their logo or badge next
to their name in the timeline, the Learning rows, the Proud Moments cards and the résumé page (`public/logos/orgs`
and `public/logos/badges`).

Phones and tablets use their own native scrolling (smooth scrolling is added only for mouse and
trackpad), and the moving parts (the card's sway, the pulsing dots, the spinning badge, the project
drawings) run on the graphics chip, and the larger ones pause when they're off screen, so scrolling stays
smooth.

**Built with** React 19, TypeScript, Vite 8, Tailwind CSS 4, Motion and Lenis, with a small hash router of its own
(`src/lib/router.tsx`). The case-study and résumé pages and the project drawings load only when they're opened.

## Install and run it locally

You need [Node.js](https://nodejs.org) 20.19 or newer, and Git.

```bash
cd krishna-portfolio
npm install
npm run dev        # opens the site at http://localhost:5173
```

Other commands:

```bash
npm run build      # production build in dist/
npm run preview    # serve that build locally
npm run test:e2e   # build, then run the end-to-end tests (see below)
```

## Tests

`e2e/` holds end-to-end tests (Playwright) for everything on the site: page load and fonts, the section
pills and the phone menu, the theme switch and that a new visit opens light again, the hero buttons and the badge, the
paper figure (it assembles, scatters on a click and returns, turns towards the pointer, and falls back to
the still picture without WebGL or with reduced motion), the ID card (flip, drag), the skills table (filters, inspector), the work panels and accordion, the case-study
pages and their navigation, the timeline, the achievement counters and the sliding track, the contact
card (copy email, links), the web résumé, accessibility (axe, WCAG 2.1 AA) in both themes, keyboard
access, reduced motion, every common screen width, and that the inner pages' code only loads when opened.
They run on a desktop viewport and an iPhone-sized one.

```bash
npx playwright install chromium   # once
npm run test:e2e                  # about five minutes
npm run test:e2e:ui               # the same tests in Playwright's UI
```

## Publishing

The code lives in the GitHub repository `krishna-maddukuri/krishna-maddukuri.github.io`.
`.github/workflows/deploy.yml` builds the site and publishes it to GitHub Pages on every commit to the
`main` branch (the repo setting this needs is **Settings → Pages → Source: GitHub Actions**, already on).
A repository named `<username>.github.io` is published at `https://<username>.github.io`.

After that, every commit to `main` goes live in about 1–2 minutes. You can follow it in the **Actions**
tab: a green tick means the new version is live; a red cross means the build failed, and the live site
stays on the last working version.

## Making changes

You can make all of the changes below right on GitHub, with nothing installed.

**Text.** Every word on the site lives in `src/data/site.ts`: name, headline, intro, the chat bubble,
About text and quick facts, the ID card, the skills, the projects and their case studies, the learning
list, the timeline, the achievement numbers and the web résumé. Open the file, click the pencil icon
(**Edit this file**), change the words and click **Commit changes**.

- Text sits between quotes. Change only what's inside them and keep the quotes and commas.
- If the text has an apostrophe (I'm, Krishna's), the line must use double quotes `"…"`, like the
  `intro` and `bubble` lines. An apostrophe inside single quotes `'…'` breaks the build.

**Chat bubble.** `bubble` under `hero` in `src/data/site.ts`. Set it to `''` to hide the bubble.

**"Open to…" badge.** `openTo` in `src/data/site.ts`.

**Résumé.** Open the `public` folder, click **Add file → Upload files**, drop in the new PDF named
exactly `Krishna_Koushik_Maddukuri_Resume.pdf` and click **Commit changes**. It replaces the old one.

**Pictures.** Upload the picture to `public`, then put its file name in `src/data/site.ts`:

- `image` under `hero` — the figure: full length, with a see-through background, for example
  `image: 'avatar/krishna-origami.webp'`. It needs its shard mesh beside it
  (`public/avatar/krishna-origami.json`, cut from the picture along the paper's creases), so a new
  picture means a new mesh too. While `image` is empty, the hero shows a faded placeholder figure.
- `photo` — the ID card picture: head and shoulders (480 × 600), for example
  `photo: 'krishna-portrait.webp'`. While it's empty, the card shows the "KM" monogram.

**Logos and badges.** Each skill's picture and brand colour is listed in `src/data/logos.ts`; the
files are in `public/logos/skills`. The companies and schools are listed there too (`orgs`), each with its
logo in `public/logos/orgs` (`logo`, and for a wide logo a squarer `mark` cut from it, used on the small
plates); an entry without a file shows its initials instead. Certification badges are in
`public/logos/badges` (`file` on the entry under `badges`). SVG or PNG both work; a square picture with a
see-through background looks best. The skill pictures come from the SVG Logos (CC0), devicon (MIT), Simple Icons (CC0) and AWS
Architecture Icons sets, with a few glyphs drawn for the skills that are practices rather than products; every
logo remains the trademark of its owner.

**Key words.** In the hero intro and the About lead, words between double asterisks (`**like this**`)
are shown bold, in the accent colour.

**Tab title and icon.** The `<title>` line in `index.html` sets the tab title. The tab icon is the
"KM" monogram: `public/favicon.svg`, `public/favicon.ico` and `public/apple-touch-icon.png` (the icon
on phone home screens). If you change the icon files, change `?v=km1` in `index.html` too, so browsers
load the new icon instead of a cached one.

**On your computer.** Edit the files, check them with `npm run dev`, then commit and push to `main`.

## Project structure

```
src/
  data/site.ts        all the text, links and picture file names
  data/logos.ts       the logo and brand colour of every skill, company, school and certification
  sections/           Hero, About, Skills, Work, Learning, Experience, Achievements, Contact
  pages/              Home, case studies (/work/:slug), résumé (/resume)
  components/         header and menu, ID card, the paper figure and its bubble, résumé link, toast, icons, shared UI
  visuals/            the small drawings shown for each project
  lib/                light/dark theme, smooth scrolling, the hash router, the card spotlight
  index.css           colours, type scale, fonts, shadows, the glass material and shared styles
public/               résumé PDF, tab icons, the pictures (the figure and its mesh under avatar/), the logos and the fonts
e2e/                  end-to-end tests (Playwright)
.github/workflows/    deploy.yml: builds and publishes the site on every push to main
```
