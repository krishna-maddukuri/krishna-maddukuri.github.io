# Krishna Koushik Maddukuri - Portfolio

**Live site: https://krishna-maddukuri.github.io**

The personal portfolio of Krishna Koushik Maddukuri, a software engineer who builds distributed systems and
cloud-native microservices for financial services. It is one scrolling page with eight sections, a
case-study page for each project, a web version of his résumé and a note for addresses that don't exist.

## Pages and sections

1. **Hero** — a full-length paper figure of him, "Hello, I'm a" in his own hand over a red block reading
   "Software Engineer.", a short intro that is typed out letter by letter, three numbers that count up, and
   Explore work / Let's talk / Resume buttons. On wide screens his name stands behind him in giant outlined
   letters, and a short list beside him says where he is now, where he was and what he is studying. On
   phones and tablets the figure has the first screen to himself and the words follow below it. A red tape
   runs down the right edge of the page ("Open to Software Engineer roles"); a click on it goes to Contact.
2. **About** — "Hi, I'm Krishna.", his path in a panel with his motto and the Resume and LinkedIn keys, an ID
   card on a lanyard that you can drag around and tap to flip, and six quick facts.
3. **Skills** — "The periodic table of my stack": 52 skills in eight families. Point at (or tap) a tile to
   see what it is, with its logo on a plate in its brand's colour; pick a family to light it up. With a
   keyboard the table is one Tab stop and the arrow keys move between the tiles.
4. **Work** — "Things I've built": seven projects from Capital One, NGA Group and Infosys, in panels that open
   on hover (rows you tap open on phones). Each has its own case-study page: the context, what he did, the
   outcome, the tools and an architecture diagram that draws itself in. One of them (Event-Driven Pipelines)
   has a small working pipeline to play with.
5. **Always learning** — his doctorate, AWS certifications and degrees.
6. **Education & experience** — a timeline of his jobs and degrees: the years roll into place and a red line
   fills as you scroll.
7. **Proud moments** — his numbers on ten cards that slide sideways as you scroll (a row you swipe on
   phones), each with the company's logo.
8. **Contact** — email (one press copies it), LinkedIn, the résumé as a PDF and as a page, and where he is
   based. The footer says how the page loaded on this visit, measured by the visitor's own browser.

Also included: the web résumé (`/resume/`), which prints as a clean black-on-white document; a "page not
found" note for a wrong address; and two themes: true black (how the site opens) and a paper-white one. The
switch grows the new theme out of the button, and the choice is remembered on that device.

## How it is made

**The paper figure.** `public/avatar/krishna-origami.webp` is the cut-out and
`public/avatar/krishna-origami.json` its mesh: 511 shards cut along the paper's own creases.
`src/components/PaperFigure.tsx` draws them with WebGL in one draw call; every shard's glide, drift and turn
is worked out in the vertex shader, so a phone handles it easily. On load the shards glide in and lock
together. Click him and they scatter: they drift, part around the pointer and ripple outwards from it, stay
out while the mouse plays with them, and come home by themselves, on a click anywhere, or when you scroll
away. Pressing his name in the header replays the hero's entrance: a red blade crosses the screen and
becomes the tape, and his shards turn over in a wave from head to feet. Phones fetch a lighter copy of the
picture (`krishna-origami-phone.webp`), and the picture is decoded off the page's own thread, so the page
never stalls while he arrives. Browsers without WebGL and visitors who ask for less motion get the still
cut-out instead.

**Type.** Headlines are set in Antonio, text in Schibsted Grotesk, labels in IBM Plex Mono and the
handwritten words in Sedgwick Ave. All four are self-hosted (`public/fonts`, latin only, with their
licences); the site never calls a font service.

**Colour.** White on true black, or black on paper, and one accent: the monogram's red (`#f0412e`) on the
emphasised parts (the handwritten tail of every heading and the pen stroke under it, the key words, the big
numbers, the timeline, the tape). The tokens are at the top of `src/index.css`. Brand colour comes from the
logos: every skill has one (`public/logos/skills`, listed with its brand colour in `src/data/logos.ts`), and
companies, schools and certifications show their logo or badge next to their name
(`public/logos/orgs`, `public/logos/badges`).

**Speed.** Every page is built ahead of time into its own HTML file (`scripts/prerender.mjs`), so the first
screen is there before any script has run, and its entrances are plain CSS. Effects that follow the scroll
(the hero's drift, the timeline's line, the sliding cards) run on the browser's own scroll timeline where it
has one, with a scripted fallback. The case-study and résumé pages and the project drawings are separate
files, fetched only when they are needed. Sections far below the screen are laid out in
idle moments after the page opens. Phones and tablets keep their native scrolling; smooth scrolling is
added only for a mouse or trackpad.

**Phones.** Safari on iPhone shows the page on behind its floating toolbar and under it, past the foot of
the screen as the page measures it. So the hero's words start well below that foot (nothing peeks out under
the toolbar before a scroll), the red tape and the menu's dimming run past it, and the "page not found"
note keeps its footer clear of it. The header's controls, the skills' family chips and the footer's links
are finger-sized on touch screens.

**Without script.** With JavaScript switched off, or if a script fails to download, each page still shows
its content; if a single page's code fails, a note offers a way on instead of a blank screen.

**Access.** Visitors who ask for less motion or less transparency get calmer, solid versions. Everything
works from the keyboard, and the pages are checked against WCAG 2.1 AA in both themes (see Tests).

**Built with** React 19, TypeScript, Vite 8, Tailwind CSS 4, Motion and Lenis, with a small router of its own
on real addresses (`src/lib/router.tsx`).

## Install and run it locally

You need [Node.js](https://nodejs.org) 20.19 or newer, and Git.

```bash
npm install
npm run dev        # opens the site at http://localhost:5173
```

Other commands:

```bash
npm run build      # production build in dist/, every page pre-built
npm run preview    # serve that build locally
npm run test:e2e   # build, then run the end-to-end tests (see below)
```

`npm run dev` draws the pages from script as you edit; the pre-built pages exist only in a build.

## Tests

`e2e/` holds end-to-end tests (Playwright) for everything on the site: page load and fonts, the header and
the phone menu, the theme switch, the hero and its typed intro, the paper figure (it assembles, scatters and
returns, answers the pointer, and falls back to the still picture without WebGL or with reduced motion), the
ID card (flip, drag), the skills table (filters, inspector, arrow keys), the work panels and accordion, the
case-study pages and their diagrams, the timeline, the achievement counters and the sliding track, the
contact card (copy email, links), the web résumé and how it prints, the pre-built pages, what happens when a
script fails or an address doesn't exist, accessibility (axe, WCAG 2.1 AA) in both themes, keyboard access,
reduced motion, and every common screen width. They run on a desktop viewport and an iPhone-sized one.

```bash
npx playwright install chromium   # once
npm run test:e2e                  # about ten minutes
npm run test:e2e:ui               # the same tests in Playwright's UI
```

On GitHub the same run takes ten to twenty minutes: its test machines are slower and draw the page in
software, so there every time limit in the tests is three times as long (`SLOW` in `e2e/helpers.ts`).

## Publishing

The site is served from the GitHub repository `krishna-maddukuri/krishna-maddukuri.github.io` (GitHub Pages
publishes a repository named `<username>.github.io` at `https://<username>.github.io`).
`.github/workflows/deploy.yml` runs on every commit to its `main` branch: first the end-to-end tests
(`.github/workflows/test.yml`), and only if they pass does it build the site and publish it. The repo setting
this needs is **Settings → Pages → Source: GitHub Actions**.

You can follow it in the **Actions** tab (a run takes ten to twenty minutes): a green tick means the new
version is live; a red cross means a test or the build failed, and the live site stays on the last version
that passed. **Run workflow** on the same page publishes again by hand.

The build reads two settings, both optional: `SITE_URL` (where the site lives, for the sitemap, the
canonical addresses and the link-preview picture; default `https://krishna-maddukuri.github.io`) and
`SITE_BASE` (a sub-path, if the site is served from one, such as `/<repository>/`). The deploy workflow sets
both from the address GitHub Pages gives the repository.

## Making changes

You can make all of the changes below right on GitHub, with nothing installed.

**Text.** Every word on the site lives in `src/data/site.ts`: name, headline, intro, the hero's numbers and
"now" list, the tape, About text and quick facts, the ID card, the skills, the projects and their case
studies (architecture included), the learning list, the timeline, the achievement numbers and the web
résumé. Open the file, click the pencil icon (**Edit this file**), change the words and click **Commit
changes**.

- Text sits between quotes. Change only what's inside them and keep the quotes and commas.
- If the text has an apostrophe (I'm, Krishna's), the line must use double quotes `"…"`, like the `intro`
  line. An apostrophe inside single quotes `'…'` breaks the build.

**The tape.** `openTo` in `src/data/site.ts` (it is also the green tag on the back of the ID card).

**Résumé.** Open the `public` folder, click **Add file → Upload files**, drop in the new PDF named exactly
`Krishna_Koushik_Maddukuri_Resume.pdf` and click **Commit changes**. It replaces the old one. The web résumé
is written out in `src/data/site.ts` (`resume`, `experience`, `education`): keep the two alike.

**Pictures.** Upload the picture to `public/avatar`, then put its file name in `src/data/site.ts`:

- `image` under `hero` — the figure: full length, with a see-through background. It needs its shard mesh
  beside it (`public/avatar/krishna-origami.json`, cut from the picture along the paper's creases), so a new
  picture means a new mesh too, and a new lighter copy for phones (`imagePhone`: the same picture at 867 ×
  2400; leave it empty and phones use the full one). While `image` is empty, the hero shows a faded
  placeholder figure.
- `photo` — the ID card's picture: head and shoulders (480 × 600) with a see-through background.

**Logos and badges.** Each skill's picture and brand colour is listed in `src/data/logos.ts`; the files are
in `public/logos/skills`. The companies and schools are listed there too, each with its logo in
`public/logos/orgs` (`logo`, and for a wide logo a squarer `mark` cut from it, used on the small plates); an
entry without a file shows its initials instead. Certification badges are in `public/logos/badges`. SVG, PNG
or WebP all work; a square picture with a see-through background looks best, and a raster one should be at
least three times the size it is shown at, so it stays sharp on high-density screens. The skill pictures
come from the SVG Logos (CC0), devicon (MIT), Simple Icons (CC0) and AWS Architecture Icons sets, with a few
glyphs drawn for the skills that are practices rather than products; every logo remains the trademark of
its owner.

**Key words.** In the hero intro and the About lead, words between double asterisks (`**like this**`) are
shown bold.

**Tab title, description and icon.** Each page's tab title comes from `src/lib/pageTitle.ts`; the home
page's description and link-preview tags are in `index.html`, and the preview picture is `public/og.png`.
The tab icon is the "KM" monogram: `public/favicon.png` and `public/apple-touch-icon.png` (the icon on phone
home screens). If you change the icon files, change `?v=km3` in `index.html` too, so browsers load the new
icon instead of a cached one.

The preview picture is 1200 × 1000, because apps cut it two ways: a small preview (the compact card in
WhatsApp) shows its middle square, 1000 × 1000, and a wide one (LinkedIn, Facebook, X) shows its middle
strip, 1200 × 630. Keep everything that matters inside both, the middle 1000 × 630. If you change the
picture, raise `?v=2` on both of its tags in `index.html`, so apps fetch the new one instead of a copy they
kept; if its size changes, change `og:image:width` and `og:image:height` there too.

**On your computer.** Edit the files, check them with `npm run dev`, then commit and push to `main`.

## Project structure

```
src/
  data/site.ts        all the text, links and picture file names
  data/logos.ts       the logo and brand colour of every skill, company, school and certification
  sections/           Hero, About, Skills, Work, Learning, Experience, Achievements, Contact (and the footer)
  pages/              Home, case studies (/work/<slug>/), résumé (/resume/), page not found
  components/         header and menu, the paper figure, the giant name, the tape, ID card, résumé link, toast, icons, shared UI
  visuals/            the small drawing shown for each project, and the pipeline to play with
  lib/                the router, light/dark theme, smooth scrolling, the name-press sweep, the card spotlight, page titles
  hooks/              which section is on screen, media queries
  entry-server.tsx    draws each page to HTML at build time
  index.css           colours, type scale, fonts, entrances, the glass material and shared styles
scripts/prerender.mjs writes every page's ready-made HTML, the 404 page, the sitemap and robots.txt after a build
public/               résumé PDF, tab icons, the preview picture, the figure and its mesh (avatar/), the logos and the fonts
e2e/                  end-to-end tests (Playwright)
.github/workflows/    test.yml runs the tests; deploy.yml runs them, then builds and publishes, on every push to main
```
