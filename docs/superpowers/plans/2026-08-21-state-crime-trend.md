# State Crime-Rate Trend Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 7-year (2018–2024) violent-crime-rate trend line chart to every state page, sourced from real FBI-derived historical data, additive to the existing single-year snapshot.

**Architecture:** A new static data file (`src/data/stateTrendData.js`) holding real, pre-researched per-state trend data, consumed by a new chart block in the existing "Crime Statistics" tab of `StateDetail.jsx`. No backend changes, no new prerendering logic — the existing Playwright-based prerender crawl already handles recharts charts on this page.

**Tech Stack:** React, `recharts` (already a dependency, already used for the existing bar/line/pie charts on this page), Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-21-state-crime-trend-design.md`

## Global Constraints

- Trend data covers **violent crime only**, years **2018–2024 inclusive**, all 7 years present for every state (spec decisions 2, 3).
- Data source: Wikipedia's ["List of U.S. states and territories by violent crime rate"](https://en.wikipedia.org/wiki/List_of_U.S._states_and_territories_by_violent_crime_rate) "Rate by Year" table (FBI-derived). Values in this plan were extracted directly from that page's live wikitext table on 2026-08-21, not summarized/transcribed by an intermediate model — verified state-count (50/50, matching `stateData.js` exactly) and cross-checked against existing `stateData.js` snapshot values.
- Every state's trend chart shows a caption. Florida and Nebraska get a specific caveat (their snapshot values come from state-agency sources, not the FBI, and diverge meaningfully from the FBI-sourced trend). Every other state gets a generic provenance caption (spec decisions 3a, 3b).
- The trend chart is **additive** — it does not replace or modify the existing bar chart, `crimeMeta` cards, or `crimeGrowth` pill.
- No new prerendering script, no worker/backend changes.

---

## Task 1: Create `stateTrendData.js` and its consistency test

**Files:**
- Create: `src/data/stateTrendData.js`
- Create: `src/data/stateTrendData.test.js`

**Interfaces:**
- Produces: `export default stateTrendData` — an object keyed exactly like `stateData.js` (lowercase state name, multi-word states as `'new hampshire'`-style quoted keys), each value shaped `{ years: number[], violent: number[] }` with `years` always `[2018, 2019, 2020, 2021, 2022, 2023, 2024]` and `violent` always 7 numbers.

- [ ] **Step 1: Write the failing consistency test**

Create `src/data/stateTrendData.test.js`:

```js
import { describe, expect, it } from 'vitest';
import stateData from './stateData';
import stateTrendData from './stateTrendData';

const EXPECTED_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024];

describe('stateTrendData', () => {
  it('has a matching entry for every state in stateData', () => {
    const missing = Object.keys(stateData).filter((key) => !stateTrendData[key]);
    expect(missing).toEqual([]);
  });

  it('has no entries for states that do not exist in stateData', () => {
    const extra = Object.keys(stateTrendData).filter((key) => !stateData[key]);
    expect(extra).toEqual([]);
  });

  it('has exactly 7 ascending years (2018-2024) and 7 violent values for every state', () => {
    for (const [key, entry] of Object.entries(stateTrendData)) {
      expect(entry.years, `${key} years`).toEqual(EXPECTED_YEARS);
      expect(entry.violent, `${key} violent length`).toHaveLength(7);
      for (const value of entry.violent) {
        expect(typeof value, `${key} violent value type`).toBe('number');
        expect(value, `${key} violent value positive`).toBeGreaterThan(0);
      }
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/data/stateTrendData.test.js`
Expected: FAIL — `stateTrendData.js` does not exist yet (module not found).

- [ ] **Step 3: Create `stateTrendData.js` with the real dataset**

Create `src/data/stateTrendData.js` with exactly this content:

```js
// Violent crime rate per 100,000 residents, 2018-2024, for every U.S. state.
// Source: Wikipedia — "List of U.S. states and territories by violent crime
// rate", "Rate by year" table (FBI Uniform Crime Reporting Program data).
// https://en.wikipedia.org/wiki/List_of_U.S._states_and_territories_by_violent_crime_rate
//
// This is intentionally a separate file from stateData.js: this is a
// historical time series, not the current-year snapshot stats stateData.js
// holds, and the two are independently sourced (see stateTrendData.test.js
// for the cross-file consistency check, and the design spec for why the
// most-recent trend value sometimes differs from the stateData.js snapshot
// for the same state/year -- that's expected, not a bug).
const stateTrendData = {
  alabama: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [523.1, 504.7, 453.6, 348.3, 409.1, 417.2, 359.9],
  },
  alaska: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [891.7, 865.0, 837.8, 759.1, 758.9, 733.6, 724.1],
  },
  arizona: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [475.7, 447.1, 484.8, 425.6, 431.5, 433.8, 421.9],
  },
  arkansas: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [561.6, 580.8, 671.9, 702.4, 645.3, 623.3, 579.4],
  },
  california: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [447.5, 442.1, 442.0, 481.2, 499.5, 506.9, 486.0],
  },
  colorado: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [401.5, 384.6, 423.1, 480.4, 492.5, 485.2, 476.3],
  },
  connecticut: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [209.6, 184.6, 181.6, 168.6, 150.0, 152.4, 136.0],
  },
  delaware: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [422.5, 422.7, 431.9, 419.2, 383.5, 394.0, 360.8],
  },
  florida: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [385.9, 378.2, 383.6, 337.3, 258.9, 292.7, 267.1],
  },
  georgia: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [338.9, 326.2, 400.1, 349.8, 367.0, 367.0, 325.7],
  },
  hawaii: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [255.0, 264.5, 254.2, 274.0, 259.6, 232.1, 217.7],
  },
  idaho: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [239.7, 232.6, 242.6, 240.8, 241.4, 240.4, 230.6],
  },
  illinois: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [411.4, 415.3, 425.9, 344.8, 287.3, 308.7, 289.2],
  },
  indiana: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [373.5, 371.5, 357.7, 332.6, 306.2, 341.8, 312.9],
  },
  iowa: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [263.7, 287.6, 303.5, 295.0, 286.5, 273.6, 243.3],
  },
  kansas: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [441.8, 405.5, 425.0, 444.9, 414.6, 468.6, 438.7],
  },
  kentucky: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [217.9, 220.7, 259.1, 269.0, 214.1, 229.2, 213.1],
  },
  louisiana: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [543.3, 559.7, 639.4, 662.7, 628.6, 562.1, 519.8],
  },
  maine: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [112.0, 116.1, 108.6, 112.9, 103.3, 103.8, 100.1],
  },
  maryland: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [469.4, 454.4, 399.9, 435.1, 398.5, 440.3, 420.4],
  },
  massachusetts: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [340.3, 328.7, 308.8, 301.1, 322.0, 320.9, 314.7],
  },
  michigan: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [452.5, 438.6, 478.0, 491.1, 461.0, 460.8, 434.3],
  },
  minnesota: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [221.2, 237.5, 277.5, 308.9, 280.6, 262.9, 256.6],
  },
  mississippi: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [266.0, 261.2, 291.2, 255.4, 245.0, 201.9, 210.5],
  },
  missouri: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [501.4, 499.6, 542.7, 524.3, 488.0, 471.0, 462.0],
  },
  montana: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [380.9, 417.9, 469.8, 469.8, 417.9, 448.7, 423.5],
  },
  nebraska: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [289.9, 304.6, 334.1, 297.0, 282.8, 232.7, 220.5],
  },
  nevada: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [552.1, 496.1, 460.3, 432.0, 454.0, 433.7, 402.0],
  },
  'new hampshire': {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [177.6, 158.1, 146.4, 129.7, 125.6, 115.0, 110.1],
  },
  'new jersey': {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [208.6, 206.7, 195.4, 183.5, 202.9, 225.3, 217.7],
  },
  'new mexico': {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [842.8, 824.0, 778.3, 820.8, 780.5, 746.9, 717.1],
  },
  'new york': {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [350.8, 361.0, 363.8, 308.3, 429.3, 391.1, 380.2],
  },
  'north carolina': {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [356.2, 378.7, 419.3, 419.5, 405.1, 393.5, 375.8],
  },
  'north dakota': {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [284.1, 301.4, 329.0, 276.4, 279.6, 279.8, 254.3],
  },
  ohio: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [294.8, 296.0, 308.8, 317.4, 293.6, 301.3, 293.7],
  },
  oklahoma: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [474.6, 436.3, 458.6, 438.0, 419.7, 418.2, 422.8],
  },
  oregon: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [290.4, 293.7, 291.9, 341.3, 342.4, 332.0, 331.0],
  },
  pennsylvania: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [305.4, 306.0, 389.5, 281.8, 279.9, 267.9, 245.6],
  },
  'rhode island': {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [219.8, 222.7, 230.8, 200.5, 172.3, 167.5, 153.6],
  },
  'south carolina': {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [500.8, 510.1, 530.7, 513.8, 491.3, 477.1, 436.7],
  },
  'south dakota': {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [396.4, 397.1, 501.4, 391.8, 377.4, 352.2, 362.3],
  },
  tennessee: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [630.4, 598.9, 672.7, 671.8, 621.6, 636.5, 592.3],
  },
  texas: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [412.9, 421.8, 446.5, 453.0, 431.9, 407.3, 389.4],
  },
  utah: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [239.4, 236.9, 260.7, 259.1, 241.8, 231.4, 229.6],
  },
  vermont: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [185.0, 207.2, 173.4, 194.0, 221.9, 216.0, 219.1],
  },
  virginia: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [204.2, 209.4, 208.7, 225.5, 234.0, 241.6, 217.9],
  },
  washington: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [315.3, 303.3, 293.7, 335.7, 375.6, 359.3, 326.1],
  },
  'west virginia': {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [299.9, 318.9, 355.9, 291.5, 277.9, 268.9, 248.8],
  },
  wisconsin: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [299.0, 297.1, 323.4, 325.4, 297.0, 298.0, 278.5],
  },
  wyoming: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    violent: [213.8, 215.0, 234.2, 223.8, 201.9, 193.7, 203.4],
  },
};

export default stateTrendData;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/data/stateTrendData.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/stateTrendData.js src/data/stateTrendData.test.js
git commit -m "Add 7-year violent-crime trend dataset (stateTrendData.js)"
```

---

## Task 2: Add the trend chart to `StateDetail.jsx`

**Files:**
- Modify: `src/pages/StateDetail.jsx`
- Test: `src/pages/StateDetail.test.jsx`
- Create: `src/pages/StateDetail.trendFallback.test.jsx`

**Interfaces:**
- Consumes: `stateTrendData` default export from Task 1 (`{ [stateKey]: { years: number[], violent: number[] } }`).
- Consumes existing `normalizedState` (already computed in `StateDetail.jsx` at the top of the component, used today to index into `stateData`).

- [ ] **Step 1: Write the failing test**

Open `src/pages/StateDetail.test.jsx` and add these two tests inside the existing `describe('StateDetail', ...)` block (after the existing tests, before the closing `});`):

```js
  it('renders the violent-crime trend chart with the generic provenance caption for a normal state', async () => {
    renderAt('/state/california');
    expect(await screen.findByText('Violent crime rate, 2018–2024')).toBeInTheDocument();
    expect(
      screen.getByText('Independently sourced from FBI historical data; may differ slightly from the snapshot above.')
    ).toBeInTheDocument();
  });

  it('renders the Florida-specific caveat instead of the generic caption', async () => {
    renderAt('/state/florida');
    expect(await screen.findByText('Violent crime rate, 2018–2024')).toBeInTheDocument();
    expect(screen.getByText('FBI-methodology trend; differs from the FDLE figure above.')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/pages/StateDetail.test.jsx`
Expected: FAIL — neither the heading text "Violent crime rate, 2018–2024" nor the caption text exist yet.

- [ ] **Step 3: Import `stateTrendData` and derive the chart data**

In `src/pages/StateDetail.jsx`, add the import alongside the existing `stateData` import (near line 21):

```js
import stateData, { normalizeStateName, stateSlugs } from '../data/stateData';
import stateTrendData from '../data/stateTrendData';
```

Then, immediately after the existing `const previewState = stateData[normalizedState] || null;` line (line 86), add:

```js
  const trendEntry = stateTrendData[normalizedState] || null;
  const trendChartData = trendEntry
    ? trendEntry.years.map((year, i) => ({ year, violent: trendEntry.violent[i] }))
    : [];
  const TREND_CAVEATS = {
    florida: 'FBI-methodology trend; differs from the FDLE figure above.',
    nebraska: "FBI-methodology trend; this state's snapshot above is sourced from state data flagged as approximate.",
  };
  const trendCaption =
    TREND_CAVEATS[normalizedState] ||
    'Independently sourced from FBI historical data; may differ slightly from the snapshot above.';
```

- [ ] **Step 4: Add the trend chart block to the Crime Statistics tab render**

Find this block in `renderPanel()` (the `if (activeTab === 'Crime Statistics')` branch, currently returning a single `<div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">...</div>`). Wrap the existing grid in an outer container and add the new chart block as a sibling, so the existing bar chart/meta cards/sources are completely unchanged:

Before:
```jsx
    if (activeTab === 'Crime Statistics') {
      return (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
```

After:
```jsx
    if (activeTab === 'Crime Statistics') {
      return (
        <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
```

And before the closing of that same return block:
```jsx
          </div>
        </div>
      );
    }
```

After:
```jsx
          </div>
        </div>
        {trendEntry && (
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <h2 className="text-xl font-semibold text-white">Violent crime rate, 2018–2024</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    cursor={{ stroke: 'rgba(56, 189, 248, 0.35)' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }}
                    itemStyle={{ color: '#e2e8f0' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Line type="monotone" dataKey="violent" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-sm text-slate-400">{trendCaption}</p>
          </div>
        )}
        </div>
      );
    }
```

(The indentation of the pre-existing inner grid content does not need to change — only the opening/closing wrapper lines shown above.)

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/pages/StateDetail.test.jsx`
Expected: PASS (all tests in the file, including the 2 new ones).

- [ ] **Step 5a: Write and verify the defensive-render test for a missing trend entry**

A state present in `stateData.js` but missing from `stateTrendData.js` should
never happen in production — `stateTrendData.test.js` from Task 1 enforces
that as a hard test failure — but the `{trendEntry && (...)}` render guard
must still degrade gracefully rather than crash if it ever did. This can't
be exercised with the real dataset (all 50 states are present in both
files), so it needs a mocked module in its own test file, since the main
`StateDetail.test.jsx` file's other tests rely on the real trend data.

Create `src/pages/StateDetail.trendFallback.test.jsx`:

```js
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StateDetail from './StateDetail';

vi.mock('../data/stateTrendData', () => ({ default: {} }));

describe('StateDetail (trend data missing)', () => {
  it('renders the rest of the page without crashing when a state has no trend entry', async () => {
    render(
      <MemoryRouter initialEntries={['/state/california']}>
        <Routes>
          <Route path="/state/:stateName" element={<StateDetail />} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByRole('heading', { name: 'California' })).toBeInTheDocument();
    expect(await screen.findByText('Reported incidents')).toBeInTheDocument();
    expect(screen.queryByText('Violent crime rate, 2018–2024')).not.toBeInTheDocument();
  });
});
```

Run: `npx vitest run src/pages/StateDetail.trendFallback.test.jsx`
Expected: PASS.

- [ ] **Step 6: Run the full test suite and lint**

Run: `npm test` and `npm run lint`.
Expected: All tests pass; lint clean.

- [ ] **Step 7: Commit**

```bash
git add src/pages/StateDetail.jsx src/pages/StateDetail.test.jsx src/pages/StateDetail.trendFallback.test.jsx
git commit -m "Add violent-crime trend chart to state pages"
```
