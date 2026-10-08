# Stage 1 Assessment — Crystal Kizor

**Live:** https://crystal-kizor.netlify.app/
**Source:** https://github.com/Stephenthompson002/crystal-kizor

The build is fully static — `npm run build` produces `dist/` with no runtime, no API keys and no
server — so any host serves it unchanged. This delivery is deployed on **Netlify** from that build.
The repository additionally carries a GitHub Actions workflow that type-checks, builds, audits and
publishes to GitHub Pages on every push; if that mirror is used, Pages needs switching on once for
the repository — *Settings → Pages → Source: **GitHub Actions*** — because a workflow token is not
permitted to create the Pages site.

---

## Part 1 — The landing page

### The problem, as I read it

Six ventures, one URL, one first impression. The risk was never the number of ventures — it was them
reading as a list of unrelated businesses. So the page is built on a single spine: **the first design
decision is the climate.** Studio COKA generates the knowledge, The Effective Architect gives it
away, speaking distributes it, and the initiatives apply it to people rather than buildings. That is
said once, structurally, instead of repeated on every brand's card.

### How it is arranged

| # | Section | Job |
| --- | --- | --- |
| 1 | **Hero** | Who / what / why in one screen, plus a three-layer statement of what she is building. |
| 2 | **Proof** | The strongest evidence immediately after the claim it supports. Dark band, so it reads as a chapter break. |
| 3 | **Router** | Six audience paths. Third, because the page serves six very different visitors and none of them should have to scroll to find themselves. |
| 4 | **Studio COKA** | The commercial core in depth: principles, services, a seven-stage process, a direct CTA. |
| 5 | **Work** | The flagship as a case study, then the built work with its photography, then an honest register of the rest. |
| 6 | **About** | The spine that makes six ventures one story rather than a list. |
| 7 | **Knowledge** | The Effective Architect and Speaking — thought leadership given real weight without competing with the practice. |
| 8 | **Initiatives** | ELEvated, AKO Alliance, Alive and Free. Deliberately below the practice and the teaching, and weighted differently from each other. |
| 9 | **Contact** | Four pre-filled email paths, one per visitor type. |

**Weighting is expressed structurally, not stated.** Studio COKA gets the deepest treatment, TEA and
Speaking get a dedicated dark section, and the initiatives get a shorter, denser band that does not
pretend to equal billing. AKO Alliance — the NGO with the largest public mission — gets a wider card
than the other two.

**Audience paths.** Each router card leads to a section, and each section ends with a CTA matched to
that audience. Two paths bypass email entirely and open a pre-filled draft instead, with an
audience-specific subject line so routing and measurement work from day one.

### Visual system

Warm architectural neutrals — linen `#FAF7F2`, sand, night — with three deliberate levels of ink and
a single clay accent `#A9491F`, ochre `#C08A3E` as its counterpart on dark grounds. **Fraunces** for
display, using its *optical-size axis* so the hero renders with true display contrast while an h4
stays sturdy; **Instrument Sans** for UI and body. The type scale is fluid `clamp()` tokens, so there
is not one breakpoint-driven font size in the codebase. A faint 88 px grid behind the hero and
contact bands is the only decoration — it is what makes the layout read as a drawing sheet rather
than a template.

### Brand identity

The identity comes from the client's own logo collection, and nothing about it was invented. The CK
monogram and the script signature were vectorised from the supplied sheet by
`scripts/extract-marks.mjs` + `scripts/trace-marks.py`, and `BrandMark.astro` renders them as a
**CSS mask** — so one file serves the linen header and the night footer, the mark is never inlined
into the HTML response, and it stays a single cacheable request. The name itself is **set in type**
rather than drawn: an SVG of the drawn lockup would be heavier, unselectable and invisible to search
engines. The favicon and the social card are generated from the same traced monogram by
`scripts/build-brand-assets.py`, so they cannot drift from the identity.

### Imagery

Twenty-four photographs, all from the folders supplied with the brief, processed by
`scripts/build-images.mjs`: fixed aspect crops, a per-file size budget, and alt text written from the
frame itself. **Crop decisions live in a script, not in a GUI session** — each job declares its
source, output name, aspect ratio and gravity, so re-running it reproduces the whole set byte for
byte and the framing stays reviewable.

**Attribution is by folder.** An image is only shown against the project whose folder it came from.
The hospital — the flagship — is a written case study, because no photograph of it was supplied:
illustrating it with another building would be a straightforward misrepresentation, and the copy says
plainly that clinical privacy governs its imagery. Where a supplied image is a visualisation rather
than a photograph of built work, the copy does not claim otherwise.

**The flagship carries a before-and-after comparison.** The hospital began as an existing residential
structure that was retained and rebuilt around daylight and natural ventilation, which is exactly the
kind of change a picture shows better than a paragraph. `BeforeAfter.astro` is a drag-to-compare
slider over two frames of the same building, built the classic way rather than reinvented, in three
layers: with no JavaScript both frames render as a static pair and the controls hide; a **native
`<input type="range">`** drives a `--split` custom property that clips the before frame, so keyboard
and screen readers work through a real form control rather than a hand-rolled ARIA widget; and
pointer drag moves the divider anywhere on the image, with `touch-action: pan-y` so vertical
scrolling on a phone is not hijacked. Neither frame was supplied by the practice, so both render as
labelled drawing plates and the caption reads from whether the images exist rather than asserting
that photographs do.

**Nothing on the page invents an asset to look finished.** AKO Alliance used to carry a marked
placeholder; it now carries the three strands of the work as a numbered list. Information in the
space an image would take is worth more to a visitor than a note saying the photograph is missing,
and no photograph is borrowed from the practice to fill either gap.

### Build and quality gates

Astro 7 with Tailwind v4, static output, **zero framework JavaScript** — the only script is 1.1 KB of
progressive enhancement, and the page is complete with JavaScript disabled. Two self-hosted,
subsetted variable fonts, no third-party requests at all, so no consent banner and no render-blocking
handshake to a CDN.

`npm run verify` is the gate, and it runs on every push before anything publishes. It type-checks,
builds, then audits the real output: markup and accessibility, every contrast pair the design ships,
glyph coverage, and the first-load payload against an enforced budget. Current state:

- **168.0 KB gzipped across 7 requests**, 0 third-party. Budget is 400 KB / 8 requests; the audit
  fails the build above either.
- One `<h1>`, no heading skips across 35 headings, one `<main>`, skip link, focus-trapped mobile
  dialog, every image with intrinsic dimensions and alt text, 10/10 external links with `rel=noopener`.
- All 12 contrast pairs pass WCAG 2.2 AA, and they are the values the design actually ships — nothing
  is opacity-based.
- The written submission's word limits are checked by the same pipeline, so they cannot drift.

### Source

Full source is in this repository. Entry point: `src/pages/index.astro`, which composes nine
sections. All copy, links, stats, credentials and projects are in `src/data/` — the page can be
re-edited without touching a component. Depth — stack rationale, file structure, IA, accessibility,
performance measurements and deployment — is in `README.md`.

---

## Part 2 — AI product thinking

**What it does.** You upload a floor plan, section or site photo, confirm the orientation and city,
and get a structured critique against the five pillars of the Tropical Design Framework —
orientation, shade, airflow, daylight, material. Not prose: a ranked list of findings, each with
*what we see*, *why it matters here*, and *the cheapest change that fixes it*.

**Who it is for.** Architects, students and self-builders in hot-humid climates — TEA's audience.

**The problem.** Concept-stage climate feedback is scarce, slow and expensive. Studio crits judge
form, not performance. Energy modelling needs skills and data nobody has at concept stage, so bad
decisions harden before they can be priced.

**How someone uses it.** Drop in a plan, pick "Enugu, 6-storey residential," answer two questions on
orientation and glazing. Sixty seconds later: a one-page annotated report, every finding linked to
the TEA lesson that teaches it.

**Technology.** A multimodal frontier model via API (GPT-4o-class or Claude), called with a JSON
schema so findings stay consistent and renderable, not free text. The prompt carries Crystal's
rubric as a versioned system prompt. Not a bespoke model — there is no training data, and the value
is her judgment, not novel ML. Next.js on Vercel.

**First working version (2–3 weeks).** Ship it behind the waitlist; it *is* the lead magnet. Build a
test set of 30 plans — her projects plus student work — each with her written critique, and score
against it before launch.

**Limits and safeguards.** Vision models misread scale and geometry and cannot compute solar gain.
Label every output *"a starting brief, not a design,"* never claim code compliance, require the user
to confirm orientation, attach a confidence level per finding, delete uploads after 30 days, and
route commercial work to human review.

---

## Part 3 — Analytics & improvement

**What I would track.** Outcomes first, diagnostics second. Every CTA carries a `data-track` label
(21 of them), so each of the six audience paths has a named success event. Everything else is
diagnostic: which sections get read, scroll depth, source, landing query, real-user Core Web Vitals.

**Tools.** Plausible or Vercel Analytics — cookieless, so no consent banner, and `cta_click` already
fires into `window.dataLayer`. Wiring a provider is one tag. Search Console for queries. Field
vitals via Speed Insights: lab scores do not represent Nigerian mobile networks.

**How it improves the site.** Path conversion first: clicks over relevant arrivals, per audience. A
path read but never clicked is a clarity problem; a path never reached is an IA problem, so fix
order before copy. Then write for the queries Search Console already shows. Define the six
conversions before launch, so traffic reads against intent, not as one number.

**The scenario.** 5,000 visitors and 5 enquiries is 0.1% — ten to thirty times low, so the traffic
is wrong or the path is broken. First, test every CTA on a real Android: `mailto:` fails silently on
many desktops and analytics cannot see it. Then segment by source; if one article brought 4,000 of
them, the page is fine. Then read scroll depth to separate "never reached Contact" from "reached it
without clicking." Then act: swap the mailto for a four-field form with a serverless handler, add a
low-commitment 15-minute call, move proof up, and re-measure in four weeks against 1%.

---

## Submission note

**Thinking.** The risk was never the number of ventures; it was them reading as fragmentation. So the
page runs on one spine: *the first design decision is the climate.* Studio COKA generates the
knowledge, The Effective Architect gives it away, speaking distributes it, and the initiatives apply
it to people rather than buildings.

**Key decisions.** The audience router sits **third**, above the flagship project: six visitor types
share one URL. Weight is expressed **structurally, not stated**. Contact is **email-first**, four
paths each opening a pre-filled draft with the right subject. Supplied assets are the **source of
truth**: the logo sheet is traced rather than redrawn, crops are declared in a script rather than by
hand, and where the brief promises an asset the folder lacks, the page says so rather than inventing
one.

**Technology.** Astro 7 with Tailwind v4, static output, zero framework JavaScript — the only script
is 1.1 KB of progressive enhancement. Fonts are self-hosted and subsetted to the 79 characters used,
with zero third-party requests. First load is 168.0 KB across 7 requests, and one `npm run verify`
gates the type check, build, audit and these word limits, so a regression cannot publish.
