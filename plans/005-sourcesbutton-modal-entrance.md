# 005 — Animate the Sources modal's entrance and exit

- **Status**: TODO
- **Commit**: e49a344
- **Severity**: New opportunity (not a regression — nothing here is broken today, it's simply un-animated)
- **Category**: Missing spatial story / teleporting state
- **Estimated scope**: 1 file, small

## Problem

`SourcesButton.jsx` renders a full-screen backdrop + centered modal card
("Sources") that appears and disappears with a plain conditional render —
zero transition of any kind:

```jsx
// src/components/SourcesButton.jsx — current, full file
import { useState } from 'react';

export default function SourcesButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label="Data sources"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
      >
        Sources
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative m-4 w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/95 p-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-white">Sources</h3>
              <button className="text-sm text-slate-300" onClick={() => setOpen(false)} aria-label="Close sources">Close</button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-200">
              {/* ...body content unchanged, omitted here for brevity... */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

This is the same "full-screen backdrop + centered card" shape as
`SignupTakeover.jsx`, which already has a correct, working entrance/exit
recipe — but `SignupTakeover` uses it and `SourcesButton` doesn't. A user
who has already seen `SignupTakeover`'s smooth open/close will notice
`SourcesButton`'s modal snapping in and out instantly.

**Gate check** (per `find-animation-opportunities`):
- Frequency: Occasional (opened deliberately, not a frequent/keyboard action). Eligible.
- Purpose: Preventing a jarring change (a backdrop + card popping into existence with no transition is exactly the "content that teleports" case). Named.
- Speed: Modal budget is 200-500ms — the target below uses 250ms, inside budget.
- Function: This is chrome/UI, not data the user is reading. Motion helps here, doesn't hinder.

## Target

Reuse `SignupTakeover.jsx`'s own established recipe verbatim (see Repo
conventions below) via `AnimatePresence` + two `motion.div`s — the modal is
centered, so per this repo's audit `transform-origin` is correctly not a
concern here (`AUDIT.md`: "Modals are exempt — they appear centered").

```jsx
// src/components/SourcesButton.jsx — target
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function SourcesButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label="Data sources"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
      >
        Sources
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="relative m-4 w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/95 p-5 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-white">Sources</h3>
                <button className="text-sm text-slate-300" onClick={() => setOpen(false)} aria-label="Close sources">Close</button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-200">
                {/* ...body content unchanged... */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

Note the duration is 0.25s here (not `SignupTakeover`'s 0.35s for its
inner card) — `SourcesButton`'s modal is a smaller, less consequential
surface (reference data, not a form with an irreversible submit), so it
earns a snappier speed while staying inside the 200-500ms modal budget.

## Repo conventions to follow

- `src/components/SignupTakeover.jsx:33-53` is the exemplar for this exact
  shape: `AnimatePresence` wrapping a backdrop `motion.div`
  (`opacity`-only, `duration: 0.25`) containing a card `motion.div`
  (`opacity`+`y`+`scale`, asymmetric enter/exit `y` values — enters from
  further away (`y: 24`) than it exits to (`y: 12`)). Match that same
  enter/exit `y` asymmetry here.
- Never `scale(0)` — this recipe uses `scale: 0.98`, matching the
  existing `SignupTakeover` convention (a very subtle scale, well inside
  the `0.9-0.97` recommended band... actually matches `SignupTakeover`'s
  own `0.98` exactly, which this plan intentionally mirrors rather than
  retuning to the audit's general recommendation, for consistency between
  the two nearly-identical components).

## Steps

1. Open `src/components/SourcesButton.jsx`.
2. Add `import { AnimatePresence, motion } from 'framer-motion';` to the
   top import block.
3. Wrap the existing `{open && (...)}` block in `<AnimatePresence>...
   </AnimatePresence>`.
4. Change the outer `<div className="fixed inset-0 z-[60] flex items-end
   justify-center sm:items-center">` to a `motion.div` with `initial={{
   opacity: 0 }}`, `animate={{ opacity: 1 }}`, `exit={{ opacity: 0 }}`,
   `transition={{ duration: 0.25 }}`, keeping its existing `className`
   unchanged.
5. Change the inner `<div className="relative m-4 w-full max-w-lg
   rounded-2xl border border-white/10 bg-slate-900/95 p-5 shadow-2xl">` to
   a `motion.div` with `initial={{ opacity: 0, y: 24, scale: 0.98 }}`,
   `animate={{ opacity: 1, y: 0, scale: 1 }}`, `exit={{ opacity: 0, y: 12,
   scale: 0.98 }}`, `transition={{ duration: 0.25 }}`, keeping its
   existing `className` unchanged.
6. Leave the backdrop `<div className="absolute inset-0 bg-black/50"
   onClick={() => setOpen(false)} />` as a plain `div` (it's a child of
   the now-animated outer `motion.div`, it doesn't need its own motion
   props) — do not convert this one to `motion.div`.
7. Leave all content inside the card (heading, close button, source list)
   completely unchanged.

## Boundaries

- Do NOT touch `SignupTakeover.jsx` — this plan only copies its pattern,
  it does not refactor it into a shared component. (A future
  consolidation of the two is out of scope here.)
- Do NOT change any text content, links, or the close-button behavior.
- Do NOT add `useReducedMotion()` gating — this modal's motion is opacity
  + a small scale/y, well within what reduced-motion guidance keeps (it's
  the position-changing page-load animations, not occasional modal
  reveals, that need gating; `SignupTakeover`'s identical pattern doesn't
  gate on reduced motion either, so don't introduce an inconsistency by
  gating only this one).
- If the current file content doesn't match the Problem section verbatim
  (drift since the commit stamp), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run lint` (0 errors) and `npm test` (all passing)
  from the repo root.
- **Feel check**:
  - Open the Sources modal (visible on state detail pages). Confirm the
    backdrop fades in and the card fades+rises+scales in together,
    finishing in well under 300ms.
  - Click the backdrop or "Close" — confirm the card animates out
    (shorter rise distance than its entrance, per the asymmetric `y`
    values) rather than vanishing instantly.
  - In DevTools Animations panel, set playback to 10% and confirm the
    card's `transform-origin` reads as centered (correct — this is a
    modal, not a trigger-anchored popover) and that it never touches
    `scale: 0` at any point.
- **Done when**: opening and closing the Sources modal both animate,
  matching `SignupTakeover`'s established feel, and every check above
  passes.
