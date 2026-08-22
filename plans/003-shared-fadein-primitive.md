# 003 — Create a shared FadeIn primitive and migrate the 7 duplicated entrance animations to it

- **Status**: Done
- **Commit**: de1847b (fix: 7468440)
- **Severity**: MEDIUM
- **Category**: Accessibility + Cohesion & tokens
- **Estimated scope**: 6 files (1 new component, 5 edited), medium size

## Problem

The same page/section entrance animation — fade in while rising slightly —
is hand-typed 7 times across 5 files, with small unintentional drift
between copies, and **none of the 7 check `prefers-reduced-motion`**:

```jsx
// src/pages/HomePage.jsx:41-53 (RotatingTagline, inside AnimatePresence)
<motion.span
  key={index}
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -8 }}
  transition={{ duration: 0.4 }}
  className="inline-block"
>
```

```jsx
// src/pages/HomePage.jsx:220-223 (main content block)
<motion.div
  initial={{ opacity: 0, y: 18 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.45 }}
```

```jsx
// src/pages/About.jsx:29-32
<motion.div
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35 }}
```

```jsx
// src/pages/ComparePage.jsx:152-155
<motion.div
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35 }}
```

```jsx
// src/pages/StateDetail.jsx:463-466 (outer page wrapper)
<motion.div
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35 }}
```

```jsx
// src/pages/StateDetail.jsx:559-569 (inner tab-switch, inside AnimatePresence)
<AnimatePresence mode="wait">
  <motion.div
    key={loading ? 'loading' : activeTab}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}
  >
    {renderPanel()}
  </motion.div>
</AnimatePresence>
```

```jsx
// src/pages/StateStatistics.jsx:47-50
<motion.div
  initial={{ opacity: 0, y: 18 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.45 }}
```

Under `prefers-reduced-motion: reduce`, guidance is to keep the opacity
fade but drop the position change — every one of these 7 sites still moves
content vertically regardless of that OS-level preference.

## Target

One new component, `FadeIn`, that both fixes the accessibility gap in one
place and replaces the 7 duplicated call sites:

```jsx
// src/components/FadeIn.jsx — new file
import { motion, useReducedMotion } from 'framer-motion';
import { EASE_OUT_STRONG } from '../utils/motion';

// Shared "fade in while rising slightly" entrance, used for every
// page-level and section-level reveal in the app. Consolidates what used
// to be 7 hand-typed copies of this same pattern (with drifted values)
// into one place, and is the one spot that needs to know about
// prefers-reduced-motion for all of them: reduced motion keeps the
// opacity fade (it aids comprehension) but drops the position change.
export default function FadeIn({ children, y = 16, duration = 0.4, delay = 0, exit = false, className, ...rest }) {
  const prefersReducedMotion = useReducedMotion();
  const offset = prefersReducedMotion ? 0 : y;

  const variants = {
    initial: { opacity: 0, y: offset },
    animate: { opacity: 1, y: 0, transition: { duration, delay, ease: EASE_OUT_STRONG } },
  };
  if (exit) {
    variants.exit = { opacity: 0, y: -offset, transition: { duration: duration * 0.7, ease: EASE_OUT_STRONG } };
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit={exit ? 'exit' : undefined}
      variants={variants}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
```

Each call site is replaced with `FadeIn`, preserving each site's original
`y`/`duration` (deliberately kept different for the snappier in-page
tab-switch vs. the slower full-page load — this plan is not un-drifting
those two *intentionally different* speeds, only removing accidental
duplication and adding the reduced-motion branch every copy was missing):

```jsx
// src/pages/HomePage.jsx:41-53 — target
<AnimatePresence mode="wait">
  <FadeIn key={index} y={8} duration={0.4} exit className="inline-block">
    {lead}
    <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">{highlight}</span>
    {trail}
  </FadeIn>
</AnimatePresence>
```

```jsx
// src/pages/HomePage.jsx:220-223 — target
<FadeIn y={18} duration={0.45} className="...">
```
(keep the existing `className` value on that element verbatim — only the tag and the two motion props change)

```jsx
// src/pages/About.jsx:29-32 — target
<FadeIn y={14} duration={0.35} className="mx-auto max-w-3xl">
```

```jsx
// src/pages/ComparePage.jsx:152-155 — target
<FadeIn y={14} duration={0.35} className="mx-auto max-w-5xl">
```

```jsx
// src/pages/StateDetail.jsx:463-466 — target
<FadeIn y={14} duration={0.35} className="mx-auto max-w-6xl">
```

```jsx
// src/pages/StateDetail.jsx:559-569 — target
<AnimatePresence mode="wait">
  <FadeIn key={loading ? 'loading' : activeTab} y={10} duration={0.25} exit>
    {renderPanel()}
  </FadeIn>
</AnimatePresence>
```

```jsx
// src/pages/StateStatistics.jsx:47-50 — target
<FadeIn y={18} duration={0.45} className="relative w-full max-w-4xl rounded-[2rem] border border-white/15 bg-gradient-to-br from-white/6 to-white/3 p-8 text-center shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl sm:p-12 overflow-hidden">
```

## Repo conventions to follow

- New shared components live in `src/components/` as a default export,
  matching every existing component in that directory (e.g.
  `src/components/CountUp.jsx`).
- Import the easing token from `src/utils/motion.js` (created by Plan
  001 — if Plan 001 has not landed yet when this plan runs, STOP and
  execute Plan 001 first; this plan depends on it).
- Every call site that swaps `motion.div`/`motion.span` for `FadeIn` must
  keep its existing `className` value character-for-character — `FadeIn`
  forwards `className` straight onto the underlying `motion.div`.

## Steps

1. Confirm `src/utils/motion.js` exists and exports `EASE_OUT_STRONG`
   (Plan 001). If it doesn't exist, STOP — this plan depends on Plan 001
   landing first.
2. Create `src/components/FadeIn.jsx` with exactly the content shown in
   Target above.
3. Edit `src/pages/HomePage.jsx`: import `FadeIn` from
   `../components/FadeIn`; replace the `motion.span` block at (originally)
   lines 41-53 with the `FadeIn` version shown above, keeping the `key`,
   the child content, and the `AnimatePresence mode="wait"` wrapper
   unchanged.
4. In the same file, replace the `motion.div` block at (originally) lines
   220-223 with `<FadeIn y={18} duration={0.45} className="...">` —
   substitute the real existing `className` value from that element, do
   not invent one.
5. Edit `src/pages/About.jsx`: import `FadeIn`; replace the `motion.div`
   at (originally) lines 29-32 with `<FadeIn y={14} duration={0.35}
   className="mx-auto max-w-3xl">`.
6. Edit `src/pages/ComparePage.jsx`: import `FadeIn`; replace the
   `motion.div` at (originally) lines 152-155 with `<FadeIn y={14}
   duration={0.35} className="mx-auto max-w-5xl">`.
7. Edit `src/pages/StateDetail.jsx`: import `FadeIn`; replace the outer
   `motion.div` at (originally) lines 463-466 with `<FadeIn y={14}
   duration={0.35} className="mx-auto max-w-6xl">`, and separately replace
   the inner `AnimatePresence`/`motion.div` pair at (originally) lines
   559-569 with the `FadeIn` version shown above (note the `exit` prop —
   this one animates out, unlike the outer wrapper).
8. Edit `src/pages/StateStatistics.jsx`: import `FadeIn`; replace the
   `motion.div` at (originally) lines 47-50 with `<FadeIn y={18}
   duration={0.45} className="...">` — substitute the real existing
   `className` value from that element.
9. In every edited file, remove the `motion`/`AnimatePresence` import
   only if nothing else in that file still uses it — `StateDetail.jsx`
   and `HomePage.jsx` both still need `AnimatePresence` imported (it wraps
   `FadeIn` directly now, unchanged), and check whether `motion` itself is
   still used elsewhere in each file before removing that import.

## Boundaries

- Do NOT change any `className` value — copy each one verbatim from the
  current code, do not reformat or "clean up" Tailwind classes.
- Do NOT touch `src/components/PageTransition.jsx` or `src/App.jsx` —
  the redundant-double-fade issue between `PageTransition` and these 7
  sites is Plan 004's job, not this one's.
- Do NOT touch `src/components/SignupTakeover.jsx` — its entrance uses a
  different shape (`scale` in addition to `opacity`/`y`) and is out of
  scope for this plan.
- If any of the 7 call sites' current code doesn't match what's shown in
  the Problem section verbatim (drift since the commit stamp), STOP and
  report that one site instead of improvising a fix for it.

## Verification

- **Mechanical**: `npm run lint` (0 errors) and `npm test` (all passing,
  no new failures) from the repo root.
- **Feel check**:
  - Load the homepage. Confirm the rotating tagline still fades and
    rises/falls on each rotation, at roughly the same speed as before.
  - Navigate to `/about`, `/compare`, `/state/california`, and
    `/state-statistics` — confirm each page still fades in on load,
    visually indistinguishable in feel from before this change.
  - On a state detail page, switch between tabs (Crime Statistics,
    Gender Demographics, etc.) — confirm the snappier in-page transition
    still plays and still feels faster than the full-page-load fade.
  - In DevTools Rendering panel, enable "prefers-reduced-motion: reduce",
    reload the homepage and every page above — confirm each still fades
    in (opacity) but no longer visibly rises or falls (no `y` movement).
    Confirm this dropped-movement behavior for both AnimatePresence sites
    (tagline rotation, tab switch) as well as the plain-mount sites.
- **Done when**: all 7 original call sites now render through `FadeIn`,
  `grep -rn "initial={{ opacity: 0, y:" src/pages/` returns zero matches
  (only `src/components/FadeIn.jsx` itself should define this shape now),
  and every item in the feel check above passes.
