# City landing pages — design spec

**Date:** 2026-08-21
**Status:** Proposed — awaiting review
**Author:** Claude (session with Collin Arachtingi)

## Problem

Crime Radar has 54 indexable pages: 50 state pages (real FBI/Census data,
each genuinely differentiated) plus a handful of static pages. The site's
actual highest-intent organic search traffic is city-level ("is
[city] safe", "[city] crime rate") rather than state-level, but nothing
in that space is indexable today — the existing Area Scan feature fetches
city news client-side, on demand, and never persists as a crawlable URL.

Goal: add a bounded set of real, indexable city pages to expand SEO
surface area toward that higher-intent search traffic, without
compromising the site's core credibility ("real data, no black box" —
see About page) or triggering Google's scaled/thin-content quality
signals, which evaluate a domain's content patterns as a whole and can
suppress ranking for pages that already work (the existing state pages)
if a large share of the site reads as templated.

## Decisions made

These were worked through with the user before this spec was written;
recorded here so the reasoning doesn't have to be re-litigated later.

1. **No fabricated city-level crime data.** City-level UCR/NIBRS data
   isn't uniformly available the way state-level FBI/Census data is.
   Rather than model/estimate a city number from the state figure (which
   would be fabricated data on a site whose entire value proposition is
   "check before you move" on a literal safety question), city pages show
   the state's *real* grade/stats, clearly labeled as state-level, plus
   the same live Area Scan news search the site already has — run
   automatically for that city instead of waiting on user input.

2. **Scope: top 3-5 largest cities per state (~150-250 pages total),
   not top 10-15 (~500-750).** The larger tier was the initial pick, but
   walked back after discussing thin-content risk: a city page's only
   truly unique content per page is its live news results, and
   news coverage drops off fast below roughly the 5th-largest city in a
   state. Fewer, bigger cities means real coverage is far more likely,
   which directly reduces the fraction of near-duplicate pages rather
   than just reducing page count.

3. **URL structure: `/state/:stateName/:citySlug`** (e.g.
   `/state/minnesota/duluth`) — a minimal extension of the existing
   `/state/:stateName` pattern. City slugs use **real hyphens** from day
   one (`st-paul`, not `st paul`) — state slugs are raw lowercase names
   with literal spaces, which is exactly what caused a same-day bug fixed
   in this session (unencoded spaces in sitemap/canonical/og:url for all
   10 multi-word states). Not repeating that mistake.

4. **Prerendering: lightweight template generation, not the existing
   Playwright crawler.** State-page prerendering uses a real headless
   browser because it has to wait for charts to render/animate. City
   pages don't need that — the state stats they show are static/known at
   build time, and the news section is *supposed* to be fresh, so baking
   in stale "prerendered" news would be actively wrong. A plain
   string-templating build script covers this in roughly seconds for the
   whole set, versus the 3-5x-longer build the Playwright approach would
   cost at this page count (proportionally less severe than at the
   500-750 tier, but still real).

5. **Unique OG image per city** (user's call, overriding the
   recommendation to reuse the parent state's image). At ~150-250 cities
   this is roughly proportional to the existing 51-image/18MB state
   pattern — call it +55-90MB committed to the repo. `generate-og-images.js`
   gets extended to loop over cities the same way it already loops over
   states. Same manual-regen caveat as today applies (see risk section).

6. **Internal linking: a "Popular cities in [State]" section on each
   state page**, linking to its 3-5 cities. Gives every city page a real
   internal link from an already-authoritative page (helps both crawl
   priority and human discoverability) instead of relying solely on
   sitemap.xml.

7. **Thin-content safety net kept regardless of the reduced scope:** if
   a city's live news search returns zero results, that specific page
   gets `noindex` set dynamically (via the existing `usePageMeta`
   `noindex` prop) rather than being left indexable with an empty
   section. Only genuinely-differentiated pages are offered to search
   engines; a human visitor sees the same page either way, just with an
   honest "no recent news found" message instead of a search engine
   being asked to index it.

8. **No backend/worker changes.** City pages call the existing
   `/api/news?city=X&state=Y` endpoint exactly as HomePage's Area Scan
   already does — same server-side cache, same rate limiting, nothing new
   to deploy on the Cloudflare side.

## Out of scope for this pass (deliberately deferred)

- Per-city view-count tracking in the worker (`/api/view/:slug` is
  state-scoped today; extending it to a `city:state:city` key scheme is
  a real but separable change).
- Any estimated/modeled city-level crime number, now or later, unless a
  genuinely reliable per-city data source is identified — see risk below.
- Expanding beyond 3-5 cities/state. If this first batch performs well
  (real search impressions, reasonable news-hit-rate), revisit scope as
  its own follow-up, informed by actual data instead of a guess.

## Architecture

```
src/data/cityData.js          new — static dataset, mirrors stateData.js's
                               shape/conventions
src/pages/CityDetail.jsx      new — page component
src/App.jsx                   route added: /state/:stateName/:citySlug
src/pages/StateDetail.jsx     "Popular cities in [State]" section added
scripts/prerender-cities.js   new — template-based generator, no browser
scripts/generate-sitemap.js   extended — include city routes
scripts/generate-og-images.js extended — loop over cities too
package.json                  postbuild step runs prerender-cities.js
                               alongside the existing prerender.js
```

### `cityData.js` shape

```js
const cityData = {
  minnesota: [
    { name: 'Minneapolis', slug: 'minneapolis', population: 429954 },
    { name: 'St. Paul', slug: 'st-paul', population: 311527 },
    { name: 'Rochester', slug: 'rochester', population: 121395 },
  ],
  // ...every state present in stateData.js
};
```

Populations sourced via a real web lookup against Census Bureau
estimates at implementation time — not from memory — precisely because
this page's credibility depends on it being real. `slug` is authored
explicitly and hyphenated; there is no `normalizeCitySlug()` derivation
step the way state routing derives from a raw display name, so the
space-in-URL bug class cannot recur here.

### `CityDetail.jsx`

- Look up `{ state, city }` from `cityData`/`stateData` by route param;
  unknown combination → same "not found" treatment `StateDetail` already
  has for unknown states.
- Render: city name + state name breadcrumb, the state's safety
  grade/badge and violent/property crime rate cards (reused from
  `StateDetail`'s existing crime-stats view, same components), clearly
  labeled "state-level data" so nothing implies a city-specific figure.
- Below that, an Area Scan-style news section, auto-triggered on mount
  (reusing `newsService.getLocalNews`) instead of waiting for a form
  submit — loading skeleton, then results or an honest empty state.
- `usePageMeta({ ..., noindex: <true if the news fetch resolved empty> })`
  — the noindex decision is made from the real fetch result, not
  guessed at build time (build-time generation can't know if news
  exists "today"; this is necessarily a runtime/client-side signal,
  same as the rest of Area Scan already is).

### `prerender-cities.js`

- For each `(state, city)` pair: build the static HTML shell directly —
  title, meta description, canonical link, OG tags (including the
  per-city image path), JSON-LD, and the state stats markup — using the
  same title/description conventions `usePageMeta` produces, without
  spinning up a browser.
- The news section renders as the same loading-placeholder markup real
  users see pre-fetch; it hydrates with real results (and applies
  `noindex` if empty) exactly like today's client-rendered Area Scan
  does. Search engines that execute JS (Googlebot does) still see the
  real, current news content and the correct final `noindex` state on
  render; non-JS crawlers/social unfurlers see accurate state data and a
  neutral news section rather than stale baked-in headlines.

## Risks / things worth validating before or shortly after shipping

- **News coverage rate is still unverified.** Reducing scope to
  top 3-5/state was a reasoned bet, not a measurement. Worth pulling a
  real sample against `/api/news` for a handful of 3rd-5th-largest
  cities across a few states before or right after implementation, to
  confirm the noindex safety net isn't catching, say, half the pages —
  if it is, that's a signal to reduce scope further rather than a reason
  to remove the safety net.
- **OG image regeneration is a manual step, same as today's per-state
  images** — and this exact category of gap (generated-but-gitignored,
  never actually in the deploy) is what silently broke every social
  share image in production until today. The city version must actually
  get committed. Decision: build a small consistency check as part of
  this work (not deferred) — a script (or a step in
  `generate-sitemap.js`, which already runs every build) that compares
  every `cityData.js`/`stateData.js` entry against `public/og/`
  filenames and fails the build loudly if any are missing. Cheap, and
  directly motivated by an incident from earlier today rather than a
  hypothetical.
- **Repo size growth.** +55-90MB of committed PNGs on top of today's
  18MB. Not a functional risk, but worth being aware of for clone times
  going forward.

## Testing plan

- Unit tests for `CityDetail.jsx`: known city renders correctly, unknown
  city/state combination shows the not-found state, noindex is set
  correctly for an empty vs. non-empty news result (mirroring how
  `StateDetail.test.jsx` and the `usePageMeta` test suite already cover
  these patterns).
- `prerender-cities.js`: structure it the same way the worker's email
  templates are structured (this session's `worker/src/index.js`) — a
  pure, exported `renderCityPageHtml(city, state, stateData)` function
  that returns a string, separate from the file-writing I/O. That keeps
  the actual template logic unit-testable (correct meta tags/canonical
  URLs, hyphenated slugs, no repeat of the space-encoding bug) rather
  than only checkable by eyeballing generated files.
- `generate-sitemap.js` — extend its existing coverage/spot-check to
  confirm city routes appear with valid encoded URLs.
