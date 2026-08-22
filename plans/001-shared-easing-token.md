# 001 — Extract the duplicated easing curve into a shared token

- **Status**: Done
- **Commit**: d1f5489
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 3 files (1 new, 2 edited), trivial size

## Problem

The same custom cubic-bezier easing curve is hand-typed identically in two
separate files, with no shared constant:

```jsx
// src/components/CountUp.jsx:27 — current
const controls = animate(motionValue, numericValue, { duration, ease: [0.16, 1, 0.3, 1] });
```

```jsx
// src/components/UsMap.jsx:138-140 — current
controlsRef.current = animate(0, 1, {
  duration: 0.9,
  ease: [0.16, 1, 0.3, 1],
  onUpdate: (t) => {
```

If this curve is ever retuned, someone has to remember to change it in two
places, and any third place that wants the same feel is likely to
hand-type it a third time with a slight drift (exactly the kind of
duplication Plan 003 fixes for the entrance-animation pattern separately).

## Target

```js
// src/utils/motion.js — new file
// Strong ease-out used for deliberate UI motion across the app (count-up
// number reveals, the map's click-to-zoom pan). Matches the "strong
// ease-out for UI" curve from Emil Kowalski's animation philosophy.
export const EASE_OUT_STRONG = [0.16, 1, 0.3, 1];
```

```jsx
// src/components/CountUp.jsx:27 — target
import { EASE_OUT_STRONG } from '../utils/motion';
// ...
const controls = animate(motionValue, numericValue, { duration, ease: EASE_OUT_STRONG });
```

```jsx
// src/components/UsMap.jsx:138-140 — target
controlsRef.current = animate(0, 1, {
  duration: 0.9,
  ease: EASE_OUT_STRONG,
  onUpdate: (t) => {
```

## Repo conventions to follow

- `src/utils/` already holds plain, framework-agnostic utility modules
  (`src/utils/stateStats.js`, `src/utils/sounds.js`) — `motion.js` belongs
  alongside them, not in `src/components/`.
- Named exports, not a default export (matches `stateStats.js`'s style).

## Steps

1. Create `src/utils/motion.js` with exactly the content shown in Target above.
2. Edit `src/components/CountUp.jsx`: add `import { EASE_OUT_STRONG } from '../utils/motion';` to the top import block (alongside the existing `framer-motion` import), then replace the literal `[0.16, 1, 0.3, 1]` on line 27 with `EASE_OUT_STRONG`.
3. Edit `src/components/UsMap.jsx`: add `import { EASE_OUT_STRONG } from '../utils/motion';` to the top import block, then replace the literal `[0.16, 1, 0.3, 1]` on line 140 with `EASE_OUT_STRONG`.

## Boundaries

- Do NOT touch any other easing/duration values in either file — this plan
  only deduplicates the one curve, it does not re-tune anything.
- Do NOT add new dependencies.
- If either file's `ease: [0.16, 1, 0.3, 1]` literal doesn't match verbatim
  (drift since the commit stamp), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run lint` (0 errors) and `npm test` (all passing, no
  new failures) from the repo root.
- **Feel check**: not applicable — this plan changes zero runtime values,
  only where the value is defined. Confirm by diffing that
  `EASE_OUT_STRONG` literally equals `[0.16, 1, 0.3, 1]` and that both
  call sites now reference the import instead of a literal array.
- **Done when**: `grep -rn "0.16, 1, 0.3, 1" src/` returns exactly one
  match (inside `src/utils/motion.js` itself), lint and tests are green.
