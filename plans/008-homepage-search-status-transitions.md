# 008 — Animate HomePage's search-result status swaps

- **Status**: TODO
- **Commit**: e49a344
- **Severity**: New opportunity (not a regression)
- **Category**: Teleporting state / preventing a jarring change
- **Estimated scope**: 1 file, medium (five conditional blocks touched)

## Problem

`HomePage.jsx` renders one of five mutually-exclusive result panels below
the search form (`idle`, `loading`, `error`, `empty`, `success`), each as
its own `{status === 'x' && (...)}` sibling block. Swapping between them —
e.g. `idle` → `loading` → `success` after a search — teleports instantly,
with no transition marking the state change:

```jsx
// src/pages/HomePage.jsx:323-375 — current, all five blocks
{status === 'idle' && (
  <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/60 p-8 text-center text-sm text-slate-400">
    Enter a state and city above to scan the area.
  </div>
)}

{status === 'loading' && (
  <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center backdrop-blur-xl">
    <ScanningRadar label="Pulling recent safety updates…" />
  </div>
)}

{status === 'error' && (
  <div className="rounded-3xl border border-rose-400/20 bg-rose-500/5 p-8 text-center">
    <p className="text-slate-200">Couldn&apos;t reach the news feed right now. Try again in a moment.</p>
  </div>
)}

{status === 'empty' && (
  <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center backdrop-blur-xl">
    <p className="text-slate-300">
      No recent safety-relevant headlines found for this area — that's good news. Try a larger nearby city for more coverage.
    </p>
  </div>
)}

{status === 'success' && (
  <div className="space-y-3">
    {items.map((item) => (
      <a
        key={item.link}
        href={item.link}
        target="_blank"
        rel="noreferrer"
        className="block rounded-2xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-slate-900/90"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-white">{item.title}</p>
          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {item.source}
          {item.source && item.pubDate ? ' · ' : ''}
          {formatPubDate(item.pubDate)}
        </p>
      </a>
    ))}
  </div>
)}
```

**Gate check** (per `find-animation-opportunities`):
- Frequency: Occasional — this swaps once per search submission, not a
  frequent or keyboard-driven action. Eligible.
- Purpose: Preventing a jarring change — a "no results yet" box being
  instantly replaced by either an error, an empty-state message, or a list
  of real results is exactly the class of content swap that benefits from
  a bridge.
- Speed: 250ms, well inside the modal/panel budget.
- Function: This is a status panel, not dense data the user is scanning at
  speed — motion here aids legibility of "this is new/different content."

## Target

Since exactly one of these five blocks is ever rendered at a time, wrap
the whole group in `AnimatePresence` and give each block's `FadeIn` a
distinct `key` matching its status — `AnimatePresence` then correctly
treats a status change as one keyed child unmounting (playing `exit`)
while the new one mounts (playing its entrance):

```jsx
// src/pages/HomePage.jsx:323-375 — target
<AnimatePresence mode="wait">
  {status === 'idle' && (
    <FadeIn key="idle" y={8} duration={0.25} exit>
      <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/60 p-8 text-center text-sm text-slate-400">
        Enter a state and city above to scan the area.
      </div>
    </FadeIn>
  )}

  {status === 'loading' && (
    <FadeIn key="loading" y={8} duration={0.25} exit>
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center backdrop-blur-xl">
        <ScanningRadar label="Pulling recent safety updates…" />
      </div>
    </FadeIn>
  )}

  {status === 'error' && (
    <FadeIn key="error" y={8} duration={0.25} exit>
      <div className="rounded-3xl border border-rose-400/20 bg-rose-500/5 p-8 text-center">
        <p className="text-slate-200">Couldn&apos;t reach the news feed right now. Try again in a moment.</p>
      </div>
    </FadeIn>
  )}

  {status === 'empty' && (
    <FadeIn key="empty" y={8} duration={0.25} exit>
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center backdrop-blur-xl">
        <p className="text-slate-300">
          No recent safety-relevant headlines found for this area — that's good news. Try a larger nearby city for more coverage.
        </p>
      </div>
    </FadeIn>
  )}

  {status === 'success' && (
    <FadeIn key="success" y={8} duration={0.25} exit>
      <div className="space-y-3">
        {items.map((item) => (
          <a
            key={item.link}
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-slate-900/90"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-white">{item.title}</p>
              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {item.source}
              {item.source && item.pubDate ? ' · ' : ''}
              {formatPubDate(item.pubDate)}
            </p>
          </a>
        ))}
      </div>
    </FadeIn>
  )}
</AnimatePresence>
```

Note `mode="wait"` — the outgoing panel fully exits before the incoming
one enters, avoiding two status panels visually overlapping mid-transition
(they have different heights, so a cross-fade would jump).

## Repo conventions to follow

- This plan depends on Plan 003 (`FadeIn` from
  `src/components/FadeIn.jsx`). If it doesn't exist yet, STOP and execute
  Plan 003 first.
- `HomePage.jsx` already imports `AnimatePresence` from `'framer-motion'`
  (used by `RotatingTagline` elsewhere in this same file) — reuse that
  same import, do not add a duplicate.
- `mode="wait"` matches the convention already used for
  `RotatingTagline`'s own `AnimatePresence` and for the app-wide route
  transitions in `src/App.jsx`.

## Steps

1. Confirm `src/components/FadeIn.jsx` exists (Plan 003). If not, STOP.
2. Open `src/pages/HomePage.jsx`. Confirm `FadeIn` is imported (it should
   already be, from Plan 003's edit to this same file — if not present,
   add `import FadeIn from '../components/FadeIn';`).
3. Locate the five `{status === '...' && (...)}` blocks (currently lines
   323-375).
4. Wrap all five blocks together in a single `<AnimatePresence
   mode="wait">...</AnimatePresence>`.
5. Inside that wrapper, change each block's outermost element from a plain
   `<div>` (or, for the `success` case, keep the outer `<div
   className="space-y-3">` as the child of a new wrapping element) to
   `<FadeIn key="<status-name>" y={8} duration={0.25} exit>`, using the
   exact `key` values `"idle"`, `"loading"`, `"error"`, `"empty"`,
   `"success"` shown in Target. Keep every child element and its
   `className` completely unchanged — only the outermost tag per block
   changes from `<div>`/`</div>` to `<FadeIn ...>`/`</FadeIn>` (for
   `success`, the existing `<div className="space-y-3">` stays as-is,
   nested one level inside the new `<FadeIn key="success" ...>`).

## Boundaries

- Do NOT touch the `{submitted && (...)}` block above this group (lines
  291-321) or the `{submitted && status !== 'loading' && (...)}` block
  below it (line 377) — both are out of scope for this plan.
- Do NOT change any copy, the `items.map(...)` logic, or `formatPubDate`.
- Do NOT change `RotatingTagline`'s own `AnimatePresence` usage elsewhere
  in this file.
- If the current five blocks don't match the Problem section verbatim
  (drift since the commit stamp), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run lint` (0 errors) and `npm test` (all passing)
  from the repo root.
- **Feel check**:
  - On the homepage, before searching: confirm the `idle` panel is
    visible (it may not visibly animate on first paint if it's already
    mounted before `AnimatePresence` initializes — that's fine).
  - Submit a search. Confirm the `idle` panel fades/rises out and the
    `loading` panel fades/rises in, without the two overlapping oddly.
  - Let the search resolve to results (or force each of `error`/`empty`
    cases if the dev environment allows it) — confirm each transition
    plays the same way.
  - Confirm `mode="wait"` is doing its job: at no point are two status
    panels visible simultaneously mid-transition.
  - In DevTools Rendering panel, enable "prefers-reduced-motion: reduce",
    repeat a search — confirm panels still cross-fade (opacity) but no
    longer visibly rise or fall.
- **Done when**: every status transition on this page animates via the
  keyed `AnimatePresence`/`FadeIn` pair, no overlap is visible, and
  lint/tests are green.
