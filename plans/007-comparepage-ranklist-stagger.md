# 007 — Stagger the ranked-state list when switching ranking tabs

- **Status**: TODO
- **Commit**: e49a344
- **Severity**: New opportunity (not a regression)
- **Category**: Group entrances / state indication
- **Estimated scope**: 1 file, small-medium

## Problem

`ComparePage.jsx`'s `RankList` component renders a top-5 / bottom-5 ranked
list of states. When the user switches the ranking tab (Combined Index /
Violent Crime / Poverty Rate), the entire list's contents swap instantly —
no transition marks that a genuinely new ranking just replaced the old one:

```jsx
// src/pages/ComparePage.jsx:31-72 — current, full RankList component
function RankList({ title, unit, rows, color, safetyScores }) {
  const top = rows.slice(0, 5);
  const bottom = rows.slice(-5).reverse();

  const Row = ({ rank, item }) => (
    <Link
      to={`/state/${encodeURIComponent(item.slug)}`}
      className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm transition hover:border-white/15 hover:bg-white/10"
    >
      <span className="flex items-center gap-2 text-slate-200">
        <span className="w-5 shrink-0 text-right text-xs text-slate-500">{rank}</span>
        {item.name}
        {safetyScores && <SafetyBadge score={safetyScores[item.slug]} />}
      </span>
      <span className="font-semibold text-white">
        <CountUp value={item.value} format={(v) => v.toLocaleString(undefined, { maximumFractionDigits: 1 })} duration={0.6} />
        <span className="ml-1 text-xs font-normal text-slate-400">{unit}</span>
      </span>
    </Link>
  );

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <p className={`mb-2 text-xs uppercase tracking-[0.28em] ${color}`}>Highest — {title}</p>
        <div className="space-y-1.5">
          {top.map((item, i) => (
            <Row key={item.slug} rank={i + 1} item={item} />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.28em] text-slate-400">Lowest — {title}</p>
        <div className="space-y-1.5">
          {bottom.map((item, i) => (
            <Row key={item.slug} rank={i + 1} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

```jsx
// src/pages/ComparePage.jsx:254-262 — the call site
<div className="mt-4">
  <RankList
    title={activeRankTab.label}
    unit={rankUnit}
    rows={rankRows[rankTab]}
    color={activeRankTab.color}
    safetyScores={rankTab === 'combined' ? safetyScores : undefined}
  />
</div>
```

`RankList` has no `key` prop at its call site — React reconciles it as the
same component instance across tab switches (updating props in place, not
remounting), which means even adding `initial`/`animate` to each `Row`
would not retrigger on tab change without also forcing a remount.

**Gate check** (per `find-animation-opportunities`):
- Frequency: Occasional — this list only changes on a deliberate tab click,
  not a frequent or keyboard-driven action. Eligible.
- Purpose: State indication (making clear a new ranking replaced the old
  one, not a subtle in-place value change).
- Speed: 250ms per row plus a 30-80ms stagger — inside budget, and this
  plan uses 40ms.
- Function: This is a ranked list of states, not dense data the user is
  actively reading numeric precision from at speed — a brief stagger aids
  legibility of "this is a new list" rather than hindering comprehension.

## Target

```jsx
// src/pages/ComparePage.jsx:31-72 — target
import { motion, useReducedMotion } from 'framer-motion';
import { EASE_OUT_STRONG } from '../utils/motion';
// ...existing imports unchanged...

function RankList({ title, unit, rows, color, safetyScores }) {
  const top = rows.slice(0, 5);
  const bottom = rows.slice(-5).reverse();
  const prefersReducedMotion = useReducedMotion();
  const rowDelay = (i) => (prefersReducedMotion ? 0 : i * 0.04);

  const Row = ({ rank, item }) => (
    <Link
      to={`/state/${encodeURIComponent(item.slug)}`}
      className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm transition hover:border-white/15 hover:bg-white/10"
    >
      <span className="flex items-center gap-2 text-slate-200">
        <span className="w-5 shrink-0 text-right text-xs text-slate-500">{rank}</span>
        {item.name}
        {safetyScores && <SafetyBadge score={safetyScores[item.slug]} />}
      </span>
      <span className="font-semibold text-white">
        <CountUp value={item.value} format={(v) => v.toLocaleString(undefined, { maximumFractionDigits: 1 })} duration={0.6} />
        <span className="ml-1 text-xs font-normal text-slate-400">{unit}</span>
      </span>
    </Link>
  );

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <p className={`mb-2 text-xs uppercase tracking-[0.28em] ${color}`}>Highest — {title}</p>
        <div className="space-y-1.5">
          {top.map((item, i) => (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: rowDelay(i), ease: EASE_OUT_STRONG }}
            >
              <Row rank={i + 1} item={item} />
            </motion.div>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.28em] text-slate-400">Lowest — {title}</p>
        <div className="space-y-1.5">
          {bottom.map((item, i) => (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: rowDelay(i), ease: EASE_OUT_STRONG }}
            >
              <Row rank={i + 1} item={item} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

```jsx
// src/pages/ComparePage.jsx:254-262 — target (adds `key={rankTab}`)
<div className="mt-4">
  <RankList
    key={rankTab}
    title={activeRankTab.label}
    unit={rankUnit}
    rows={rankRows[rankTab]}
    color={activeRankTab.color}
    safetyScores={rankTab === 'combined' ? safetyScores : undefined}
  />
</div>
```

The `key={rankTab}` is what makes the entrance actually retrigger on every
tab switch — without it, React reuses the same `RankList` instance and
`initial` never re-fires.

## Repo conventions to follow

- This plan depends on Plan 001 (`EASE_OUT_STRONG`). If
  `src/utils/motion.js` doesn't exist yet, STOP and execute Plan 001
  first.
- `40ms` (`i * 0.04`) is within the `30-80ms` stagger range this repo's
  audit specifies for group entrances.
- `RankList` currently has no `framer-motion` import at all — this is a
  new import for this file's `RankList` function specifically (the file's
  default-exported `ComparePage` component already imports `motion`
  separately for its own page-level wrapper — reuse the same
  `framer-motion` import line if one already exists near the top of the
  file, don't add a duplicate).

## Steps

1. Confirm `src/utils/motion.js` exists and exports `EASE_OUT_STRONG`
   (Plan 001). If not, STOP.
2. Open `src/pages/ComparePage.jsx`. Check the existing top-of-file
   imports: if `motion` and/or `useReducedMotion` are not already
   imported from `'framer-motion'`, add them (extend the existing
   `framer-motion` import line if one exists, otherwise add a new one).
   Add `import { EASE_OUT_STRONG } from '../utils/motion';`.
3. Inside `RankList` (currently lines 31-72), add
   `const prefersReducedMotion = useReducedMotion();` and
   `const rowDelay = (i) => (prefersReducedMotion ? 0 : i * 0.04);`
   immediately after the existing `const top = ...` / `const bottom =
   ...` lines. Leave the `Row` sub-component's own definition completely
   unchanged.
4. In the `top.map((item, i) => (<Row key={item.slug} rank={i + 1}
   item={item} />))` block, wrap the `<Row>` element in a `motion.div` as
   shown in Target — move the `key` from `Row` to the new `motion.div`,
   and `Row` no longer takes a `key` prop directly (it's an inline
   function component, not iterated with its own key elsewhere).
5. Make the identical change to the `bottom.map(...)` block.
6. At the `RankList` call site (currently lines 254-262), add
   `key={rankTab}` as the first prop.

## Boundaries

- Do NOT change `Row`'s own JSX, styling, or the `CountUp` usage inside it.
- Do NOT change the stagger delay beyond `i * 0.04` (40ms) — this value
  was chosen to stay within the repo's audited 30-80ms range without
  drifting toward the slow end.
- Do NOT add `key={rankTab}` anywhere else in this file — only at the one
  `RankList` call site identified above.
- If the current `RankList` component or its call site don't match the
  Problem section verbatim (drift since the commit stamp), STOP and
  report instead of improvising.

## Verification

- **Mechanical**: `npm run lint` (0 errors) and `npm test` (all passing)
  from the repo root.
- **Feel check**:
  - Go to `/compare`, scroll to the ranked-list section.
  - Click between "Combined Index", "Violent Crime", and "Poverty Rate"
    tabs several times.
  - Confirm each switch re-triggers a visible fade+rise on every row, with
    each row starting slightly after the one above it (a cascade, not all
    5 rows appearing simultaneously).
  - Confirm the stagger never blocks interaction — clicking a row
    immediately after switching tabs still navigates correctly even
    mid-animation.
  - In DevTools Rendering panel, enable "prefers-reduced-motion: reduce",
    switch tabs again — confirm rows still fade in together (no stagger
    delay, no `y` movement) rather than snapping in instantly with zero
    transition.
- **Done when**: every tab switch re-triggers the staggered entrance, the
  reduced-motion path fades without staggering or moving, and lint/tests
  are green.
