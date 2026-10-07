# Stage 1 Assessment — Crystal Kizor

Full written submission. Landing page source lives in this repository; see `README.md` for the file
structure and deployment.

---

## 1. Thinking Note — for the client

The brief is the primary source; public material was used only to make specifics accurate — Studio
COKA's site, Reuters coverage of the Nsukka hospital, the TEDx listing, published awards. For thin-footprint
ventures I claimed no more than the evidence supports.

The risk is not six ventures — it is six ventures reading as fragmentation. So the page is built on
one spine: *the first design decision is the climate.* Studio COKA generates the knowledge, TEA
gives it away, speaking distributes it, and the initiatives apply it to people rather than buildings.
The page says that once, structurally.

Three decisions shaped it:

1. **The audience router sits third, above the flagship project.** Six visitor types share one URL;
   making them scroll to find themselves costs enquiries.
2. **Weight is expressed structurally, not stated.** Studio COKA gets the deepest treatment, the
   initiatives sit lower, and AKO Alliance — the biggest mission — gets the biggest card.
3. **No stock photography.** Every image position is a marked drawing-sheet placeholder naming the
   photograph it wants; a generic architecture photo would misrepresent the work, which a
   credibility page cannot afford.

Astro, Tailwind v4, subsetted fonts: zero framework JavaScript, no third-party requests, ~87 KB.

---

## 2. Part 2 — AI Tool Proposal: The Tropical Design Crit

**What it does.** You upload a floor plan, section or site photo, confirm the orientation and city,
and get a structured critique against the five pillars of the Tropical Design Framework —
orientation, shade, airflow, daylight, material. Not prose: a ranked list of findings, each with
*what we see*, *why it matters in this climate*, and *the cheapest change that fixes it*.

**Who it is for.** Architects, students and self-builders in hot-humid climates — TEA's audience.

**The problem.** Concept-stage climate feedback is scarce, slow and expensive. Studio crits judge
form, not performance. Energy modelling needs skills and data nobody has at concept stage, so bad
decisions harden before anyone can price them.

**How someone uses it.** Drop in a plan, pick "Enugu, 6-storey residential," answer two questions on
orientation and glazing. Sixty seconds later: a one-page annotated report, every finding linked to
the TEA lesson that teaches it.

**Technology.** A multimodal frontier model via API (GPT-4o-class or Claude), called with a JSON
schema so findings are consistent and renderable rather than free text. The prompt carries Crystal's
rubric as a versioned system prompt. Not a bespoke model — there is no training data, and the value
is her judgment, not novel ML. Next.js on Vercel.

**First working version (2–3 weeks).** Ship it gated behind the waitlist; it *is* the lead magnet.
Build a test set of 30 plans — her projects plus student work — each with her written critique, and
score outputs against it before launch.

**Limits and safeguards.** Vision models misread scale and geometry and cannot compute solar gain.
Label every output *"a starting brief, not a design,"* never claim code compliance, require the
user to confirm orientation, attach a confidence level per finding, delete uploads after 30 days,
and route commercial projects to human review.

---

## 3. Part 3A — Measurement Approach

### What I would track

**Outcome events first.** The page already labels 20 calls to action with `data-track`, so each of
the six audience paths has an explicit success event — `tea-waitlist`, `speaking-request`,
`clients`, `contact-start-a-project`. Everything else is diagnostic.

| Layer | Metric | Question it answers |
| --- | --- | --- |
| Outcome | CTA clicks, split by `data-track` label and section | Which audience paths actually work? |
| Behaviour | Section attention (which bands get read vs. scrolled past), scroll depth, router clicks | Where does the page lose people, and which path do they pick? |
| Acquisition | Source/medium, landing query, country, device | Are we attracting the right six audiences? |
| Technical | LCP, INP, CLS (real-user), 4xx/5xx, broken external links | Is the page slow or broken where it matters? |
| Search | Impressions, queries, CTR, position | What are people actually looking for? |

### Tools

- **Plausible or Vercel Analytics** — cookieless, so no consent banner, and self-hosted-style
  lightness. The `dataLayer` hook is already wired, so it is one script tag.
- **Google Search Console** — query and indexing data.
- **Vercel Speed Insights** (or the `web-vitals` library into the existing hook) for real-user Core
  Web Vitals — lab scores do not represent Nigerian mobile networks.
- **Screaming Frog / Ahrefs** on a quarterly crawl for technical regressions.

### How the data changes the site

I would work in this order, because it is the order of leverage:

1. **Path-level conversion, then traffic acquisition.** For each of the six audiences, compute
   clicks ÷ relevant arrivals. A path that gets attention but no clicks has a clarity or CTA problem;
   a path with no attention is an IA problem. Fix IA before copy.
2. **Section attention → section order and length.** If most visitors never reach Work, the proof is
   too far down. If they reach Contact and stall, the CTA is wrong. Reorder, then re-measure.
3. **Search Console → editorial.** Write for the queries already bringing people in
   (`off-grid hospital`, `tropical architecture Nigeria`, `passive cooling design`). This is the
   cheapest qualified traffic available.
4. **Core Web Vitals → engineering.** Any regression on a p75 mobile real-user metric is a bug, not a
   tuning task. The performance budget is ~90 KB; enforce it in CI.
5. **A/B the two highest-leverage variables** once there is volume: the hero sub-headline (the
   positioning sentence) and the router's card order. Both are one-line changes in `site.ts`, which
   is exactly why the content is centralised.

The discipline that matters: define the six audience conversions *before* launch, so traffic can be
read against intent rather than as one undifferentiated number.

---

## 4. Part 3B — Scenario Response

5,000 visitors and 5 enquiries is 0.1%. For an architecture practice, 1–3% of *qualified* traffic is
normal — so this is 10–30× low, meaning either the traffic is wrong or the path is broken.

**Investigate, in order:**

1. **Is the enquiry path technically working?** Test every CTA on a real mid-range Android and on
   desktop. `mailto:` links silently fail on many desktop configurations — the most common cause of
   exactly this symptom, and invisible in analytics. Confirm the spam filter, deliverability and the
   auto-reply. Check the console on the contact route.
2. **Is it the right traffic?** Segment by source, landing page and query. If a blog post or job ad
   pulls 4,000 of the 5,000, the headline ratio is misleading and the real rate is fine. Check
   country and device mix.
3. **Where do people stop?** Read section attention and scroll depth. Never reaching Work or Contact
   is an IA problem. Reaching Contact and not clicking is a CTA problem. Those are different fixes.
4. **Is the offer legible on mobile?** Confirm what an enquiry requires, how many fields, and whether
   response time is stated. Test tap-target size and contrast.

**Then act:** replace the `mailto:` with a four-field form plus serverless handler, auto-reply and CRM
records — this alone usually explains most of the gap, because email is a high-activation
commitment. Add a lower-commitment step: a 15-minute call. Move proof and a process signal up. Instrument every step, then re-measure in four weeks against 1% as the first
milestone.

---

## 5. Part 1 — Landing Page

### Recommended stack

**Astro 7 + Tailwind CSS v4, static output, zero framework JavaScript.** Astro emits plain HTML and
ships no runtime for content-led pages, which is exactly what this is; Tailwind v4 keeps the palette,
type scale and rhythm as CSS custom properties declared once in `@theme`, so the design system is
auditable in one file. There is no interactivity here that justifies React, so none is shipped —
which is why total first load is ~87 KB across 6 requests.

Detail in `README.md`: stack rationale, full file structure, IA table, visual system, accessibility,
performance measurements, measurement plan, and deployment instructions for Vercel, Netlify, Cloudflare
Pages and plain static hosting.

### Source

Full source is in this repository. Entry point: `src/pages/index.astro`, which composes nine
sections. All copy, links, projects, stats and credentials are in `src/data/site.ts` — the page can
be re-edited without touching a component.

### Deployment

```bash
npm install
npm run build        # → dist/, fully static
```

`vercel` or `vercel --prod` deploys with zero configuration (also Netlify / Cloudflare Pages /
`rsync`). Before launch: set the real domain in `astro.config.mjs`, swap `meta.email` in
`src/data/site.ts`, confirm the YouTube handle, and drop in the photography.

### Design decisions summary

**Hierarchy.** Crystal is the spine; Studio COKA is the commercial engine and gets the deepest
treatment; TEA and Speaking form the thought-leadership layer in their own dark section; the
initiatives sit below, weighted differently from each other. Weight is expressed by depth of
treatment, not by a stated order.

**Audience paths.** The router is the third band on the page, not the last, because six visitor types
share one URL. Each card leads to a section, and each section ends with a CTA matched to that
audience. Two of those paths bypass email entirely and generate a pre-filled draft instead.

**Visual system.** Warm architectural neutrals — linen, sand, night, three levels of ink — with a
single clay accent and an ochre counterpart on dark grounds. Fraunces for display and Instrument
Sans for UI, on a fully fluid `clamp()` scale with no breakpoint-driven font sizes anywhere. A faint
88 px grid behind the hero and contact bands is the only decoration.

**Contact is email-first, deliberately.** Four audience-specific paths, each opening a pre-filled
draft with the right subject line — no form that silently drops enquiries, no backend to maintain,
and a distinct subject per audience so routing and measurement work from day one. The `data-track`
taxonomy is already in the markup for when a real form lands.
