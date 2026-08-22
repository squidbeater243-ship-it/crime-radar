# 006 — Add entrance motion to the signup success state

- **Status**: Done
- **Commit**: 46130db
- **Severity**: New opportunity (not a regression)
- **Category**: Delight (rare, high-emotion moment)
- **Estimated scope**: 1 file, small

## Problem

`SignupTakeover.jsx` swaps its form for a success confirmation (icon +
"Almost there." + copy) the instant `status` becomes `'pending'` — a
conditional re-render inside the same already-mounted `motion.div`, with
no entrance motion of its own:

```jsx
// src/components/SignupTakeover.jsx:63-80 — current
{status === 'pending' ? (
  <div className="py-4">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
      <ShieldCheck className="h-6 w-6 text-emerald-300" aria-hidden />
    </div>
    <h2 className="mt-4 text-xl font-semibold text-white">Almost there.</h2>
    <p className="mx-auto mt-2 max-w-sm text-sm text-slate-300">
      Check {email} for a confirmation link. Alerts for {city}, {stateData[state]?.displayName || state} start once you
      confirm.
    </p>
    <button
      type="button"
      onClick={onClose}
      className="mt-6 inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/15 px-6 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/25"
    >
      Done
    </button>
  </div>
) : (
  // ...form...
)}
```

**Gate check** (per `find-animation-opportunities`):
- Frequency: Rare / first-time — this is a one-time success confirmation
  per signup, not something a user sees repeatedly. Eligible, and this is
  specifically where the delight budget lives.
- Purpose: Delight, explicitly allowed at this frequency tier — plus
  Preventing a jarring change (the content swap itself currently teleports).
- Speed: Icon settles in ~200ms, well inside any relevant budget.
- Function: Pure confirmation UI, not data the user needs to read quickly
  — motion helps here.

## Target

The icon scales and fades in first, then the heading and body copy follow
with a small stagger — using the shared `FadeIn` primitive from Plan 003
for the text, and a small inline `motion.div` for the icon (its "pop"
character — a slightly stronger scale — doesn't match `FadeIn`'s
generic `y`-rise shape, so it isn't a `FadeIn` use case):

```jsx
// src/components/SignupTakeover.jsx:63-80 — target
{status === 'pending' ? (
  <div className="py-4">
    <motion.div
      initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: EASE_OUT_STRONG }}
      className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10"
    >
      <ShieldCheck className="h-6 w-6 text-emerald-300" aria-hidden />
    </motion.div>
    <FadeIn y={8} duration={0.25} delay={0.1}>
      <h2 className="mt-4 text-xl font-semibold text-white">Almost there.</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-300">
        Check {email} for a confirmation link. Alerts for {city}, {stateData[state]?.displayName || state} start once you
        confirm.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-6 inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/15 px-6 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/25"
      >
        Done
      </button>
    </FadeIn>
  </div>
) : (
  // ...form, unchanged...
)}
```

`delay={0.1}` on the text block is what creates the stagger — the icon
starts immediately, the heading/copy/button follow 100ms later, both
finishing within a few hundred ms of each other (well inside the modal
motion budget).

## Repo conventions to follow

- This plan depends on Plan 001 (`EASE_OUT_STRONG` from
  `src/utils/motion.js`) and Plan 003 (`FadeIn` from
  `src/components/FadeIn.jsx`). If either doesn't exist yet, STOP and
  execute those plans first.
- `scale: 0.9` on entrance matches `AUDIT.md`'s recommended
  `scale(0.9-0.97)` band for "appears from nothing" moments — never
  `scale(0)`.
- `SignupTakeover.jsx` already imports `motion` from `framer-motion` for
  its outer backdrop/card — extend that same import to add
  `useReducedMotion` rather than adding a second `framer-motion` import
  line.
- The icon's scale-pop is gated on `prefersReducedMotion` the same way
  every other new/touched animation in this batch of plans is: reduced
  motion keeps the opacity fade, drops the size/position change (here,
  that means entering at `scale: 1` instead of `0.9` — it still fades in,
  it just doesn't visibly grow).

## Steps

1. Confirm `src/utils/motion.js` and `src/components/FadeIn.jsx` both
   exist (Plans 001 and 003). If either doesn't, STOP.
2. Open `src/components/SignupTakeover.jsx`. Change the existing
   `import { AnimatePresence, motion } from 'framer-motion';` line to
   `import { AnimatePresence, motion, useReducedMotion } from
   'framer-motion';`. Add two more imports: `import FadeIn from
   './FadeIn';` and `import { EASE_OUT_STRONG } from '../utils/motion';`.
3. Inside the `SignupTakeover` component function, near the top (next to
   the existing `useState` declarations), add:
   `const prefersReducedMotion = useReducedMotion();`
4. Locate the `{status === 'pending' ? ( ... ) : ( ... )}` block
   (currently lines 63-80 for the `pending` branch).
5. Change the icon's wrapping `<div className="mx-auto flex h-12 w-12
   items-center justify-center rounded-full border border-emerald-400/30
   bg-emerald-500/10">` to a `motion.div` with `initial={{ opacity: 0,
   scale: prefersReducedMotion ? 1 : 0.9 }}`, `animate={{ opacity: 1,
   scale: 1 }}`, `transition={{ duration: 0.2, ease: EASE_OUT_STRONG }}`,
   keeping its existing `className` and the `ShieldCheck` child unchanged.
6. Wrap the `<h2>`, the `<p>`, and the `<button>` (the three siblings
   immediately following the icon div) in a single `<FadeIn y={8}
   duration={0.25} delay={0.1}>...</FadeIn>` — do not wrap them
   individually, one `FadeIn` around all three. (`FadeIn` already handles
   its own reduced-motion branching internally — no extra prop needed
   here.)

## Boundaries

- Do NOT touch the `else` branch (the form) — out of scope.
- Do NOT change any copy, the button's `onClick`, or any other behavior.
- Do NOT add this same treatment to `SourcesButton.jsx` or any other
  file — this plan is scoped to `SignupTakeover.jsx`'s success state only.
- If the current `pending` block doesn't match the Problem section
  verbatim (drift since the commit stamp), STOP and report instead of
  improvising.

## Verification

- **Mechanical**: `npm run lint` (0 errors) and `npm test` (all passing)
  from the repo root.
- **Feel check**:
  - Open the signup takeover, fill in a state/city/email, agree to the
    checkbox, and submit (or trigger `status === 'pending'` however this
    codebase's tests/dev tools allow simulating it).
  - Confirm the shield-check icon pops in first (scale + fade), and the
    heading/copy/button visibly follow shortly after rather than all
    four elements appearing in the exact same instant.
  - Confirm nothing in this sequence exceeds ~500ms total.
  - In DevTools Rendering panel, enable "prefers-reduced-motion: reduce"
    and repeat — confirm the icon still fades in but no longer visibly
    grows from a smaller size, and the heading/copy/button still fade in
    (via `FadeIn`'s internal reduced-motion handling) without rising.
- **Done when**: the success state now has a visible, staggered entrance
  distinct from an instant swap, and lint/tests are green.
