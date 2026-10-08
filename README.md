# Crystal Kizor — landing page

A single-page landing site for **Crystal Kizor** — architect, designer and founder of **Studio
COKA** — that puts six ventures on one coherent spine.

The page has to answer four questions fast: *who is she, what does she do, what is she building, and
where should I go next?* It is built around a single editorial idea: **the first design decision is
the climate**, and every venture is an expression of it.

---

## The written submission

**[`ASSESSMENT.md`](ASSESSMENT.md) is the written half of the deliverable**, in the order the brief
sets out: Part 1 (the landing page), Part 2 (AI product thinking), Part 3 (analytics and
improvement), then the submission note. The three word limits are not maintained by hand —
`scripts/word-count.py` reads the file and fails the build if any of them is exceeded, so the counts
cannot drift as the content changes:

| Section | Limit | Current |
| --- | --- | --- |
| Part 2 — AI product thinking | 300 | 296 |
| Part 3 — analytics and improvement (measurement *and* the 5,000-visitor scenario share one budget) | 250 | 247 |
| Submission note — thinking, key decisions, technology | 200 | 198 |

`npm run words` runs the check on its own; `npm run verify` includes it.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static output in dist/
npm run preview      # serve the build locally
npm run check        # astro check — types and diagnostics
npm run verify       # check + build + audit + word counts (the pre-push gate)
```

Requires Node 18+. No environment variables, no API keys, no backend, no database.

---

## Stack and why

| Choice | Reason |
| --- | --- |
| **Astro 7** (static output) | Best-in-class HTML output for a content-led marketing page. Ships **zero framework JavaScript** by default — the only JS on the page is ~1.1 KB gzipped, and it is progressive enhancement only. Content-first routing matches a page whose job is reading, not app state. |
| **Tailwind CSS v4** (via `@tailwindcss/vite`) | Design tokens live in CSS custom properties under `@theme`, so the whole palette, type scale and rhythm are declared once and consumed by markup. v4's native `@utility` lets the three bespoke utilities (`shell`, `eyebrow`, `blueprint`) be real first-class utilities rather than ad-hoc class soup. |
| **No React/Vue/Svelte** | There is no interactivity that justifies a runtime. The mobile menu, scroll reveal and the measurement hook are ~60 lines of vanilla JS in one `<script>` per component, and the page is fully functional with JavaScript disabled. |
| **Self-hosted variable fonts** | Two `.woff2` files, subsetted by `scripts/subset-fonts.py`. Zero third-party origins, so no `fonts.googleapis.com` request, no consent-banner implications, and no render-blocking handshake to a CDN. |
| **No icon library** | A single `Icon.astro` inlines ~30 paths. Nothing to tree-shake, nothing to load. |
| **`@astrojs/sitemap`** | One line, gives a correct `sitemap-index.xml`. |

---

## File structure

```
crystal-kizor/
├── astro.config.mjs            # site URL, base path, Tailwind via Vite, sitemap, dev-host allowlist
├── .github/workflows/deploy.yml# build + publish to GitHub Pages on push
├── scripts/
│   ├── extract-marks.mjs       # crops the five lockups out of the supplied logo sheet
│   ├── trace-marks.py          # vectorises those crops to SVG
│   ├── build-images.mjs        # crops/resizes the supplied photography into src/assets/work
│   ├── build-brand-assets.py   # writes public/favicon.svg and public/og.png from the monogram
│   ├── subset-fonts.py         # regenerates public/fonts
│   ├── audit.py                # markup, contrast, glyph and payload checks on the build
│   └── word-count.py           # checks the written submission against the brief's limits
├── public/
│   ├── favicon.svg             # generated: the CK monogram on a linen tile
│   ├── icon-192.png            # generated app icons, from the same tile
│   ├── icon-512.png
│   ├── apple-touch-icon.png
│   ├── og.png                  # generated: 1200×630 social card
│   └── brand/
│       ├── monogram.svg        # traced mark, used as a CSS mask
│       └── signature.svg       # traced script signature
├── assets-src/                 # the untouched client-supplied assets (git-ignored, 54 MB)
└── src/
    ├── assets/
    │   ├── brand/              # the same two traced marks, as source
    │   ├── fonts/              # fraunces-var.woff2 (31.9 KB) + instrument-sans-var.woff2 (27.6 KB)
    │   └── work/               # 24 processed .webp frames (4.2 MB, committed)
    ├── data/
    │   ├── site.ts             # ← ALL COPY LIVES HERE. Single source of truth.
    │   └── projects.ts         # the project register, with its own images and alt text
    ├── styles/
    │   └── global.css          # design tokens (@theme), base layer, custom utilities
    ├── layouts/
    │   └── Base.astro          # <head>, SEO, JSON-LD, skip link, global scripts
    ├── lib/
    │   └── url.ts              # base-aware helpers for public/ paths
    ├── pages/
    │   ├── index.astro         # composes the sections; the page order IS the IA
    │   ├── robots.txt.ts       # robots.txt derived from `site` + `base`
    │   └── site.webmanifest.ts # the manifest, with base-aware icons and scope
    ├── components/
    │   ├── BeforeAfter.astro   # drag-to-compare slider, native range + no-JS fallback
    │   ├── BrandMark.astro     # the traced marks as a currentColor CSS mask
    │   ├── Button.astro        # 4 variants × 3 sizes, renders <a> or <button>
    │   ├── Figure.astro        # responsive image, or a drawing-sheet plate
    │   ├── Footer.astro        # 4 link columns + contact band + socials
    │   ├── Header.astro        # sticky header + accessible mobile panel
    │   ├── Icon.astro          # inline SVG set
    │   ├── NairaMark.astro     # ₦ drawn as SVG (no glyph in either brand font)
    │   ├── SectionHead.astro   # eyebrow / heading / lede rhythm
    │   ├── StatValue.astro     # headline figures, handles the naira mark
    │   └── Wordmark.astro      # monogram + name, for the header and footer
    ├── sections/               # one file per band, in page order
    │   ├── Hero.astro
    │   ├── Proof.astro
    │   ├── Router.astro
    │   ├── StudioCoka.astro
    │   ├── Work.astro
    │   ├── About.astro
    │   ├── Knowledge.astro
    │   ├── Initiatives.astro
    │   └── Contact.astro
```

**Changing the copy never requires touching a component.** Every string, link, project, stat and
credential is in `src/data/`. Those files can be swapped for a CMS or a JSON fetch later without a
single change to the section files.

---

## Information architecture

The order of sections is the strategy. Each band has one job:

| # | Section | Job |
| --- | --- | --- |
| 1 | **Hero** | Who / what / why in one screen, plus a three-layer statement of what she is building. |
| 2 | **Proof** | The strongest evidence on the page, immediately after the claim it supports. Dark band, so it reads as a chapter break. |
| 3 | **Router** | Six audience paths. Placed third, because the page serves six very different visitors and they should not have to scroll to find themselves. |
| 4 | **Studio COKA** | The commercial core in depth: principles, services, a seven-stage process, a direct CTA. |
| 5 | **Work** | The flagship as a case study, then the built work with its photography, then an honest register of the rest. |
| 6 | **About** | The spine that makes six ventures one story rather than a list. |
| 7 | **Knowledge** | The Effective Architect and Speaking — thought leadership, given real weight without competing with the practice. |
| 8 | **Initiatives** | ELEvated, AKO Alliance, Alive and Free. Deliberately weighted *below* the practice and the teaching, and weighted differently from each other. |
| 9 | **Contact** | Four pre-filled email paths, one per visitor type. |

**Weighting is expressed structurally, not just stated.** Studio COKA gets the deepest treatment,
TEA and Speaking get a dedicated dark section, and the initiatives get a shorter, denser band that
does not pretend to equal billing. AKO Alliance — the NGO with the largest public mission — is given
a wider card than the other two.

---

## Visual system

**Palette** — warm, architectural, restrained. Grounds are linen `#FAF7F2`, sand `#F0E8DC` and night
`#12100E`; text is ink `#17130F` at three deliberate levels. A single clay accent `#A9491F` carries
primary actions and selected emphasis; ochre `#C08A3E` is its counterpart on dark grounds.

**Type** — *Fraunces* for display (a variable serif whose **optical-size axis** means the hero renders
with true display contrast at 84 px while an h4 stays sturdy at 24 px) and *Instrument Sans* for all
UI and body text. The whole type scale is fluid, declared as `clamp()` tokens, so there is not a
single breakpoint-driven font-size override in the codebase.

**Texture** — a faint 88 px architectural grid (`blueprint`) sits behind the hero and the contact
band. It is the only decorative device on the page, and it is the thing that makes the layout read as
a drawing sheet rather than a template.

**Motion** — one gesture, used once: content fades and rises 14 px as it enters the viewport. It is
strictly additive. Without JavaScript the page is complete; with `prefers-reduced-motion` the
transitions are removed entirely.

---

## Brand identity

The identity comes from the client's own logo collection (`assets-src/Crystal Kizor Logo
Collection.png`, five lockups on a cream ground within ~1 % of `--color-linen`). Nothing about it was
invented, and the earlier bracket mark that stood in for it is gone from the repository.

- `scripts/extract-marks.mjs` finds the real cell grid from raw-pixel ink scans and crops the CK
  monogram and the script signature, banding rows by ink so no lockup's caption comes along for the
  ride. `scripts/trace-marks.py` vectorises those crops with potrace, normalising each to a
  100-unit-wide viewBox and emitting one closed contour per curve.
- The result is two small SVGs — `monogram.svg` (9.3 KB) and `signature.svg` (10.2 KB) — drawn with
  `fill="currentColor"`. Components render them through `BrandMark.astro` as a **CSS mask**, so one
  file serves the linen header and the night footer, the mark is never inlined into the HTML
  response, and it stays a single cacheable request.
- The wordmark itself is **set in type**, not drawn: an SVG of the drawn lockup would be heavier,
  unselectable and invisible to search engines. The monogram — the distinctive half of the identity
  — is used exactly as supplied, and the name stays real text for both readers and crawlers.
- `scripts/build-brand-assets.py` generates the favicon and the social card from that same monogram,
  so they cannot drift from the identity. Card text is converted to **outlines** from the site's own
  subsetted fonts, because a social card must not depend on whatever fonts a scraper happens to
  have.

```bash
node scripts/extract-marks.mjs        # → /tmp/marks/*.png
python3 scripts/trace-marks.py        # → src/assets/brand/*.svg
python3 scripts/build-brand-assets.py # → public/favicon.svg, public/og.png, public/brand/
```

---

## Imagery

Twenty-four photographs, all from the folders supplied with the brief, processed by
`scripts/build-images.mjs`:

| Where | What |
| --- | --- |
| Hero | The studio portrait, 4:5, the only eager image on the page. |
| Studio COKA | A working drawing beside a physical massing model. |
| Work | Nature Home 2, Nature Home and the Community Centre — a lead frame and a five-frame gallery each. |
| About | A portrait at the drawing board, with plans pinned to the wall behind. |
| Knowledge | The podcast desk (TEA) and the standing studio portrait (Speaking). |
| Contact | The editorial portrait, closing the page. |

**Crop decisions live in a script, not in a GUI session.** Each job declares its source, output name,
aspect ratio and gravity; the script crops at ratio, applies one light sharpening pass, and encodes
WebP with a **per-file size budget** (quality steps down only as far as each frame needs, and three
detail-heavy frames get a median pass rather than being crushed). Running it again reproduces the
whole image set byte for byte:

```bash
node scripts/build-images.mjs
```

**Attribution is by folder.** An image is only shown against the project whose folder it came from.
The hospital — the flagship — is a written case study: illustrating it with another building would be
a straightforward misrepresentation, and the copy states plainly that clinical privacy governs its
imagery.

**Before and after, for the flagship.** `BeforeAfter.astro` is a drag-to-compare slider over two
frames of the same building — the existing residential structure and the hospital it became. It is
built the classic way rather than reinvented, in three layers:

1. **No JavaScript** — both frames render, the tags and the handle are hidden, and the pair reads as
   a static side-by-side.
2. **A real form control** — a native `<input type="range">` drives a `--split` custom property that
   clips the before frame. Keyboard, screen readers and touch all work through the control itself,
   not through a hand-rolled ARIA widget.
3. **Pointer drag** — dragging anywhere on the photograph moves the divider, with `touch-action:
   pan-y` so vertical scrolling on a phone is not hijacked.

**No AKO Alliance photography was supplied either, and the card no longer fakes a gap.** It used to
carry a marked placeholder; it now carries the three strands of the work — return out-of-school
children to the classroom, capital for family businesses, sponsorship for ideas that move a
community — as a numbered list. Information in the space an image would take is worth more to a
visitor than a note saying the photograph is missing, and nothing is borrowed to fill it.

Alt text describes each frame as it actually is (checked frame by frame against the file), and where
a supplied image is a design visualisation rather than a photograph of built work, the copy does not
claim otherwise.

---

## Accessibility

Targets **WCAG 2.2 AA**, and the contrast maths was done rather than assumed — `npm run audit` checks
it on every run.

- The muted text token `--color-ink-mute` (`#6F6558`) was **solved backwards from the requirement**:
  every tertiary label on the page measures ≥ 4.5:1 on linen, sand *and* paper. The original
  `text-ink/40` treatment measured 2.6:1 and was replaced throughout.
- One `<h1>`, no heading-level skips, semantic landmarks (`header` / `main` / `footer` / `nav`).
- Skip link, visible focus ring, focus ring colour switches on dark grounds.
- Mobile menu is a proper dialog: `aria-expanded`, focus moved in, focus trapped, Escape closes,
  focus returned to the trigger, background scroll locked.
- All decorative SVG is `aria-hidden`; the two unsupplied frames in the comparison expose
  `role="img"` with a descriptive label.
- Every image carries intrinsic dimensions, so nothing shifts while it loads.
- Full `prefers-reduced-motion` support; the page works with JavaScript disabled.
- An accessibility statement is on the page itself (`#accessibility`), with a contact route.

---

## Performance

Measured on the production build by `scripts/audit.py` (gzipped transfer):

| Asset | Gzipped |
| --- | --- |
| `index.html` | 20.4 KB |
| CSS | 8.4 KB |
| JavaScript | 1.1 KB |
| Fraunces (subsetted, `opsz` axis) | 31.9 KB |
| Instrument Sans (subsetted, `wght` axis) | 27.6 KB |
| `favicon.svg` | 3.2 KB |
| Hero photograph (the 800 px candidate a 1440 px screen picks) | 75.4 KB |
| **First load total** | **168.0 KB in 7 requests** |

What gets it there:

- **Fonts are subsetted to the 79 characters the page actually uses**, including Latin Extended so
  Yoruba and Igbo render from the brand face rather than a fallback. See
  `scripts/subset-fonts.py` for the measurement table — pinning Fraunces' unused `wght` axis alone
  saved 30.7 KB while keeping the optical-size axis that gives the hero its typography.
- **The other 23 images are lazy** and carry honest `sizes` hints (a gallery thumbnail in a
  twelve-column grid is ~17vw, not half the page), so the browser downloads the candidate that
  matches the slot instead of the largest one available.
- **No third-party requests at all.** No font CDN, no analytics script, no embedded map.
- Zero framework JS. The only script is progressive enhancement.
- No layout shift: every media slot has intrinsic dimensions, including the placeholder.
- `scroll-padding-top` on `html`, so anchor jumps land below the sticky header instead of under it.
- The whole image set is 4.2 MB on disk across 24 files; nothing above 400 KB reaches `srcset`.
- Every class in the markup resolves to generated CSS, and no source class is unused — verified
  against the built stylesheet. The CSS cannot silently drift from the markup.

---

## Measurement

The page ships **no analytics by default** — that is an explicit decision, not an omission. Adding a
tracker is a two-line change, and the intent of every call to action is already declared in the
markup, so nothing needs re-instrumenting:

Every CTA carries a `data-track` label (21 of them):

```
hero-start-project   hero-see-work   hero-layer-the-practice
clients  professionals  speaking  press  collaborators  community
coka-start-project   work-send-brief   tea-waitlist   speaking-request
contact-start-a-project   contact-join-the-teaching   …
```

A single delegated listener pushes a `cta_click` event to `window.dataLayer`:

```js
{ event: 'cta_click', cta: 'tea-waitlist', href: 'mailto:…', section: 'knowledge' }
```

So wiring Plausible, GA4, Vercel Analytics or PostHog is: load the provider, and forward
`dataLayer`. The taxonomy is already correct.

**Recommendation for launch:** a cookieless provider (Plausible or Vercel Analytics) — it needs no
consent banner, which keeps the page fast and the visitor's first impression clean.

---

## Deployment

The build is fully static — any host works. `npm run build` produces `dist/`.

The live page for this submission is **https://crystal-kizor.netlify.app/**, deployed on Netlify
from that same `dist/` build (build command `npm run build`, publish directory `dist`).

Both the origin and the base path come from the environment, so one repository can build for a domain
root *or* for a project subpath such as `https://<user>.github.io/crystal-kizor/` with no source
change:

```bash
SITE=https://crystalkizor.com BASE_PATH=/ npm run build
SITE=https://<user>.github.io BASE_PATH=/crystal-kizor npm run build
```

### GitHub Pages (included)

`.github/workflows/deploy.yml` runs on every push and is split into two jobs on purpose:

- **`verify`** — type-check, build, audit, word counts. It has no dependency on hosting at all, so
  the quality gate is enforced even in a repository where Pages has not been switched on.
- **`deploy`** — resolves the real Pages URL into `SITE`/`BASE_PATH`, rebuilds, and publishes. It
  `needs: verify`, so a regression cannot ship.

That split matters here. The first runs failed at `actions/configure-pages`, and because the gate sat
*behind* it in the same job, **the audits never executed at all** — the quality gate the brief is
graded on was silently not running. `configure-pages` also no longer asks for `enablement`, because
creating the Pages site needs repository administration the workflow token does not have: that
request returned `Resource not accessible by integration` on every run. The step now only *reads*
the Pages configuration.

**Pages is switched on for this repository**, so the `deploy` job publishes on every push to `main`
and the mirror lives at **https://stephenthompson002.github.io/crystal-kizor/**. The one-time step —
*Settings → Pages → Source: **GitHub Actions*** — has to be done in the UI, not from CI: creating the
Pages site requires repository administration the workflow token does not have. Until it is done the
`verify` job still runs and still gates; only `deploy` is skipped.

### Vercel

```bash
npm i -g vercel
vercel            # framework auto-detected as Astro
vercel --prod
```

### Netlify / Cloudflare Pages

```
Build command:     npm run build
Publish directory: dist
```

### Any static host / VPS

```bash
npm run build
rsync -avz dist/ user@host:/var/www/crystalkizor.com/
```

### Before going live

1. Set `SITE` (and `BASE_PATH` if serving from a subpath).
2. Replace `meta.email` in `src/data/site.ts` with the live inbox (it currently reads
   `hello@crystalkizor.com` as a placeholder, and every contact link derives from it).
3. Confirm the YouTube channel URL in `socials` (currently a search, because the handle is not
   published on her profiles).
4. Supply the two frames for the flagship comparison — drop them into `assets-src/`, add them to
   the `before`/`after` entries in `src/data/projects.ts`, and the caption switches from drawing
   plates to photographs automatically. AKO Alliance photography would likewise replace its
   three-strand list.
5. Add the analytics provider (see *Measurement*).
6. Submit `sitemap-index.xml` in Search Console.

### Dev server behind a proxy

Vite rejects unknown `Host` headers, which breaks tunnels and preview proxies. Add the pattern:

```bash
ALLOWED_DEV_HOSTS=".mytunnel.dev,.e2b.app" npm run dev
```

---

## Regenerating everything

Only needed when the type system, the imagery or the identity changes. `npm run verify` is the gate;
it runs the type check, the build, the audit and the word counts.

```bash
npm run fonts     # public/fonts — needs Python + fonttools + brotli
npm run images    # src/assets/work — needs the sources in assets-src/ (git-ignored)
npm run marks     # src/assets/brand — extract + trace the supplied logo sheet
npm run brand     # public/favicon.svg, public/og.png, public/brand/
npm run audit     # markup, contrast, first-load payload, against dist/
                  #   (add the fontTools venv to also check glyph coverage)
npm run words     # checks ASSESSMENT.md against the brief's 300/250/200 limits
```

`assets-src/` holds the untouched client-supplied downloads and is deliberately **not** committed —
54 MB of camera JPEGs and PNGs have no place in git history. Everything derived from it is
committed, and every derivation is a script, so the set can be rebuilt from the originals at any
time. Deployment never needs Python.

---

## Sources

Content is drawn from publicly verifiable material only: the brief supplied with the assessment,
Studio COKA's own site and project pages, Reuters / bird Story Agency coverage of the Nsukka
hospital (2026), the TEDx Port Harcourt speaker listing, and published award listings. Where a
venture has a thin public footprint — ELEvated, AKO Alliance, Alive and Free — it is described with
the confidence the evidence supports and no invented traction.

The brief is treated as the primary source; public material was used only to make specifics accurate.
