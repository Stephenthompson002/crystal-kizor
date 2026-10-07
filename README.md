# Crystal Kizor — landing page

A single-page landing site for **Crystal Kizor** — architect, designer and founder of **Studio
COKA** — that puts six ventures on one coherent spine.

The page has to answer four questions fast: *who is she, what does she do, what is she building, and
where should I go next?* It is built around a single editorial idea: **the first design decision is
the climate**, and every venture is an expression of it.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static output in dist/
npm run preview      # serve the build locally
npm run check        # astro check — types and a11y-ish diagnostics
```

Requires Node 18+. No environment variables, no API keys, no backend.

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
├── astro.config.mjs            # site URL, Tailwind via Vite, sitemap, dev-host allowlist
├── scripts/
│   └── subset-fonts.py         # regenerates public/fonts (documented, run on demand)
├── public/
│   ├── favicon.svg
│   ├── og.png                  # 1200×630 social card, generated from the brand fonts
│   └── fonts/
│       ├── fraunces-var.woff2          31.9 KB   display, axis: opsz
│       └── instrument-sans-var.woff2   27.6 KB   UI, axis: wght
└── src/
    ├── data/
    │   └── site.ts             # ← ALL COPY LIVES HERE. Single source of truth.
    ├── styles/
    │   └── global.css          # design tokens (@theme), base layer, custom utilities
    ├── layouts/
    │   └── Base.astro          # <head>, SEO, JSON-LD, skip link, global scripts
    ├── components/
    │   ├── Button.astro        # 4 variants × 3 sizes, renders <a> or <button>
    │   ├── Figure.astro        # image slot with a marked placeholder state
    │   ├── Footer.astro        # 4 link columns + contact band + socials
    │   ├── Header.astro        # sticky header + accessible mobile panel
    │   ├── Icon.astro          # inline SVG set
    │   ├── Logo.astro          # wordmark + drawn mark
    │   ├── NairaMark.astro     # ₦ drawn as SVG (no glyph in either brand font)
    │   ├── SectionHead.astro   # eyebrow / heading / lede rhythm
    │   └── StatValue.astro     # headline figures, handles the naira mark
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
    └── pages/
        └── index.astro         # composes the sections; the page order IS the IA
```

**Changing the copy never requires touching a component.** Every string, link, project, stat and
credential is in `src/data/site.ts`. That file can be swapped for a CMS or a JSON fetch later
without a single change to the section files.

---

## Information architecture

The order of sections is the strategy. Each band has one job:

| # | Section | Job |
| --- | --- | --- |
| 1 | **Hero** | Who / what / why in one screen, plus a three-layer statement of what she is building. |
| 2 | **Proof** | The strongest evidence on the page, immediately after the claim it supports. Dark band, so it reads as a chapter break. |
| 3 | **Router** | Six audience paths. Placed third, because the page serves six very different visitors and they should not have to scroll to find themselves. |
| 4 | **Studio COKA** | The commercial core in depth: principles, services, a seven-stage process, a direct CTA. |
| 5 | **Work** | The flagship as a case study, then the rest as an honest project register. |
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

## Imagery

There is no photography in the repository. Every image position renders a **clearly marked
placeholder**: a drawing-sheet panel with registration ticks, a figure number, and a note stating
exactly what photograph belongs there (e.g. *“Fig. 03 — The atrium, translucent roof bringing
daylight into the hospital”*).

To drop a real image in, import it and pass it to `Figure`:

```astro
---
import atrium from '../assets/atrium.jpg';
---
<Figure src={atrium} width={1600} height={1200} alt="…" label="…" fig="03" />
```

`Figure` then renders a responsive `srcset` at 480/800/1200/1600 px through Astro's image pipeline,
with correct `width`/`height` so nothing shifts. Placeholders are chosen over stock photography
deliberately: a generic architecture photo would misrepresent the work, which is the one thing a
credibility page cannot afford.

**Still needed:** a portrait of Crystal, the hospital atrium and exterior, the International Event
Center, Garden Home, Pine Towers, Nature Home 2, an interior detail, and an AKO Alliance photograph.

---

## Accessibility

Targets **WCAG 2.2 AA**, and the contrast maths was done rather than assumed.

- The muted text token `--color-ink-mute` (`#6F6558`) was **solved backwards from the requirement**:
  every tertiary label on the page measures ≥ 4.5:1 on linen, sand *and* paper. The original
  `text-ink/40` treatment measured 2.6:1 and was replaced throughout.
- One `<h1>`, no heading-level skips, semantic landmarks (`header` / `main` / `footer` / `nav`).
- Skip link, visible focus ring, focus ring colour switches on dark grounds.
- Mobile menu is a proper dialog: `aria-expanded`, focus moved in, focus trapped, Escape closes,
  focus returned to the trigger, background scroll locked.
- All decorative SVG is `aria-hidden`; placeholders expose `role="img"` with a descriptive label.
- Full `prefers-reduced-motion` support; the page works with JavaScript disabled.
- An accessibility statement is on the page itself (`#accessibility`), with a contact route.

---

## Performance

Measured on the production build (`npm run build`), Brotli/gzip transfer sizes:

| Asset | Gzipped |
| --- | --- |
| `index.html` | 16.8 KB |
| CSS | 8.0 KB |
| JavaScript | 1.1 KB |
| Fraunces (subsetted, `opsz` axis) | 32.7 KB |
| Instrument Sans (subsetted, `wght` axis) | 28.3 KB |
| `favicon.svg` | 0.3 KB |
| **First load total** | **≈ 87 KB in 6 requests** |

What gets it there:

- **Fonts are subsetted to the 79 characters the page actually uses**, including Latin Extended so
  Yoruba and Igbo render from the brand face rather than a fallback. See
  `scripts/subset-fonts.py` for the measurement table — pinning Fraunces' unused `wght` axis alone
  saved 30.7 KB while keeping the optical-size axis that gives the hero its typography.
- Both fonts are `preload`ed and use `font-display: swap`, with a fallback stack chosen so the swap
  is close in proportion rather than a visible reflow.
- **No third-party requests at all.** No font CDN, no analytics script, no embedded map.
- Zero framework JS. The only script is progressive enhancement.
- No layout shift: every media slot has intrinsic dimensions, including the placeholders.
- `scroll-padding-top` on `html`, so anchor jumps land below the sticky header instead of under it.
- Every class in the markup resolves to generated CSS, and no source class is unused — verified
  against the built stylesheet (397 rendered tokens, 0 missing, 0 dead). The CSS cannot silently
  drift from the markup.

---

## Measurement

The page ships **no analytics by default** — that is an explicit decision, not an omission. Adding a
tracker is a two-line change, and the intent of every call to action is already declared in the
markup, so nothing needs re-instrumenting:

Every CTA carries a `data-track` label (20 of them):

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

### Vercel (recommended)

```bash
npm i -g vercel
vercel            # framework auto-detected as Astro
vercel --prod
```

Or import the repo at vercel.com — no configuration needed. Set `site` in `astro.config.mjs` to the
live domain first, so canonical URLs, the sitemap and Open Graph tags are correct.

### Netlify

```
Build command:    npm run build
Publish directory: dist
```

### Cloudflare Pages

```
Build command:    npm run build
Output directory: dist
```

### Any static host / VPS

```bash
npm run build
rsync -avz dist/ user@host:/var/www/crystalkizor.com/
```

### Before going live

1. Set the real domain in `astro.config.mjs` → `SITE`.
2. Replace `meta.email` in `src/data/site.ts` with the live inbox (it currently reads
   `hello@crystalkizor.com` as a placeholder, and every contact link derives from it).
3. Confirm the YouTube channel URL in `socials` (currently a search, because the handle is not
   published on her profiles).
4. Drop the real photography into `src/assets/` and pass it to each `Figure` (see *Imagery*).
5. Add the analytics provider (see *Measurement*).
6. Submit `sitemap-index.xml` in Search Console.

### Dev server behind a proxy

Vite rejects unknown `Host` headers, which breaks tunnels and preview proxies. Add the pattern:

```bash
ALLOWED_DEV_HOSTS=".mytunnel.dev,.e2b.app" npm run dev
```

---

## Regenerating the fonts

Only needed if the type system changes. Requires Python + `fonttools` + `brotli`:

```bash
pip install fonttools brotli
npm run fonts          # rewrites public/fonts/*.woff2
```

Commit the output. Deployment never needs Python. If display weight ever becomes part of the design,
change `INSTANCE` in `scripts/subset-fonts.py` and the script ships the full `opsz + wght` range
instead (62.6 KB).

---

## Sources

Content is drawn from publicly verifiable material only: Studio COKA's own site and project pages,
Reuters / bird Story Agency coverage of the Nsukka hospital (2026), the TEDx Port Harcourt speaker
listing, and published award listings. Where a venture has a thin public footprint — ELEvated, AKO
Alliance, Alive and Free — it is described with the confidence the evidence supports and no invented
traction.

The brief is treated as the primary source; public material was used only to make specifics accurate.
