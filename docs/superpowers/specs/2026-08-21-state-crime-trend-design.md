# State crime-rate trend chart — design spec

**Date:** 2026-08-21
**Status:** Proposed — awaiting review
**Author:** Claude (session with Collin Arachtingi)

## Problem

Each state page currently shows a single-year snapshot of violent/property
crime rates, plus one pre-computed year-over-year delta string (e.g.
"Violent -13.7% · Property -16.2%"). There's no way for a visitor to see
whether a state's crime rate has been trending up or down over time, which
is a materially stronger signal for the site's "check before you move" value
proposition than a single point-in-time number, and reinforces the site's
"real data, no black box" credibility positioning (see the About page).

## Decisions made

These were worked through with the user before this spec was written;
recorded here so the reasoning doesn't have to be re-litigated later.

1. **Data sourced by manual research, not a live API.** `stateData.js` (all
   50 states, 2,801 lines) was itself hand-researched once in the initial
   commit and has never been touched by any script since — there is no
   existing ingestion pipeline to extend. The FBI's Crime Data API does
   provide real multi-year state estimates, but requires a free API key from
   `api.data.gov/signup`, which needs the site owner to create an account.
   Rather than introduce that new external dependency, this data gets
   compiled the same way the existing dataset was: real numbers, manually
   transcribed from a cited source, committed as a static file.

2. **Violent crime trend only — property crime trend is deferred.**
   Wikipedia's ["List of U.S. states and territories by violent crime
   rate"](https://en.wikipedia.org/wiki/List_of_U.S._states_and_territories_by_violent_crime_rate)
   has a "Rate by Year" table covering all 50 states across 2018-2024 in one
   page — a single, clean, FBI-sourced table. No equivalent page exists for
   property crime (confirmed: neither a dedicated Wikipedia list page nor
   USAFacts, the other source already cited in `stateData.js`, has more than
   a 2-year comparison for property crime — the same single delta this site
   already has). Piecing together 5+ years of property crime per state from
   scattered, less consistent sources would be slower and carries more risk
   of gaps or inconsistent methodology between states, which cuts against
   "real data, no black box." Property crime trend can be added later if a
   comparably clean multi-year source is identified.

3. **Full 7-year range (2018-2024), not a shorter window.** The single
   source table already covers 7 years for the same one-page research cost
   as a shorter window would have cost, so there's no reason to discard data
   the source provides for free.

3a. **Florida gets the FBI-methodology trend too, with a visible caveat.**
   Discovered while sourcing the data: Florida's existing `stateData.js`
   snapshot is intentionally sourced from FDLE (the state agency), not the
   FBI, with an explicit note that it "differs from FBI/other states, not
   directly comparable" — FDLE's violent crime rate for 2023 is 150.7 per
   100k, versus 292.7 in the FBI-sourced Wikipedia trend table for the same
   year. Every other state's snapshot already uses FBI-derived figures, so
   this conflict is unique to Florida (verified: no other state has a
   similar caveat). Rather than silently show two contradictory numbers,
   Florida's trend chart gets a small note under it: "FBI-methodology
   trend; differs from the FDLE figure above." Florida still gets the full
   feature, just with an explicit disclaimer instead of a silent
   discrepancy.

4. **New `stateTrendData.js` file, not an extension of `stateData.js`.**
   Keeps the existing snapshot-stats file from growing further and keeps
   "current snapshot" and "historical series" as separate, independently
   readable concerns, consistent with `stateData.js` and
   `nationalArrestData.js` already being separate files by concern.

5. **Chart placement: additive, not a replacement.** A new single-line
   trend chart is added to the existing "Crime Statistics" tab on
   `StateDetail.jsx`, below the current bar chart + stat-card row. The
   existing bar chart (current-year violent vs. property snapshot) and the
   `crimeGrowth` delta pill stay exactly as they are today.

6. **No new prerendering work.** `scripts/prerender.js`'s existing
   Playwright crawl of `StateDetail` already waits for and captures the
   recharts bar chart and the (separate-tab) income line chart on that same
   page. The new trend chart is just another recharts chart on an
   already-handled page — no new prerendering logic needed.

7. **Cross-file consistency is enforced by a test, not by eyeballing.**
   Two separately hand-authored files (`stateData.js`, `stateTrendData.js`)
   can silently drift — a state present in one and missing from the other,
   or malformed year/value arrays. A test asserts every `stateData.js` key
   has a matching `stateTrendData.js` entry with exactly 7 ascending years
   (2018-2024) and 7 corresponding violent-rate values.

## Out of scope for this pass (deliberately deferred)

- Property crime trend data (see decision 2) — revisit if/when a clean
  multi-year source is found.
- A live API integration (FBI Crime Data API or otherwise) — revisit if the
  site owner wants to set up an `api.data.gov` key later.
- Extending the trend concept to city pages — the city-pages feature
  (`docs/superpowers/specs/2026-08-21-city-pages-design.md`) is a separate,
  still-unapproved spec; this work does not touch it.
- Automated future-year updates. Refreshing the trend data as new FBI years
  are published is a manual re-research task, same as `stateData.js` already
  requires today (see its `dataYear`/`lastUpdated` fields).

## Architecture

```
src/data/stateTrendData.js        new — { [state]: { years: number[], violent: number[] } }
src/data/stateTrendData.test.js   new — shape/consistency tests
src/pages/StateDetail.jsx         new chart block added to the existing
                                   "Crime Statistics" tab render
```

### `stateTrendData.js` shape

```js
// Source: FBI UCR data via Wikipedia's "List of U.S. states and
// territories by violent crime rate" (Rate by Year table), 2018-2024.
// https://en.wikipedia.org/wiki/List_of_U.S._states_and_territories_by_violent_crime_rate
const stateTrendData = {
  alabama: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [430.5, 449.7, 449.7, 411.4, 434.9, 434.9, 417.2], // per 100k
  },
  // ...every state present in stateData.js
};
```

Values populated from a real, single-page web lookup at implementation
time — not from memory — same discipline the existing dataset and the
city-pages spec's population data both commit to.

### `StateDetail.jsx` changes

- Below the existing bar chart + stat-card grid in the "Crime Statistics"
  tab render, add a new full-width block: a `recharts` `LineChart` reading
  from `stateTrendData[stateKey].years` / `.violent`, styled consistently
  with the existing income trend chart (dark theme, `strokeWidth={3}`,
  dotted points, `CartesianGrid`/`Tooltip` matching the established look).
- A small caption under the chart heading citing the shared source
  ("FBI UCR data via Wikipedia, 2018–2024") rather than repeating the
  per-state `sources` list pattern, since this is one shared source for
  every state rather than a per-state citation.
- If a state key is missing from `stateTrendData` (shouldn't happen once
  the consistency test passes, but defensively), the trend block simply
  doesn't render rather than showing a broken chart.

## Risks

- **Manual transcription error risk.** 50 states × 7 years = 350 individual
  numbers hand-transcribed from one table. Mitigated by sourcing from a
  single already-cited, FBI-derived table (not error-prone piecemeal
  research) and by spot-checking a handful of states' current-year (2024)
  trend value against the existing `stateData.js` snapshot value for that
  same state, which should already agree closely.
- **Two-file drift over time.** Addressed by decision 7's consistency test.

## Testing plan

- `stateTrendData.test.js`: every `stateData.js` key has a corresponding
  `stateTrendData.js` entry; `years` is exactly `[2018, 2019, 2020, 2021,
  2022, 2023, 2024]` for every state; `violent` has exactly 7 numeric,
  non-negative values per state.
- `StateDetail.test.jsx` (existing file, extended): the trend chart section
  renders for a known state; nothing renders/crashes for a state missing
  trend data (defensive-render case).
