# 004 — Bring NotFound's entrance in line with the other 6 routed pages

- **Status**: TODO
- **Commit**: e49a344
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 file, trivial size

## Problem

Every routed page except `NotFound` gets a content-level "fade in while
rising slightly" entrance (via the `FadeIn` primitive from Plan 003) in
addition to the route-level cross-fade every page gets from
`src/components/PageTransition.jsx`. `NotFound.jsx` has no inner motion at
all — it relies entirely on `PageTransition`'s own opacity fade, so its
entrance reads flatter than every other page in the app:

```jsx
// src/pages/NotFound.jsx:8 — current, no motion of any kind
<div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.15),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.15),_transparent_30%)] px-4 py-8 sm:px-6 lg:px-8">
  <div className="mx-auto flex max-w-md flex-col items-center rounded-[2rem] border border-white/15 bg-white/10 p-10 text-center shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl">
```

(Note: an earlier draft of this plan proposed removing `PageTransition`'s
own entrance fade to eliminate the double-animation on the other 6 pages.
That was rejected on review: `NotFound` depends entirely on
`PageTransition`'s fade for any entrance motion at all, so removing it
would leave `NotFound` popping in with zero transition — a regression, not
a fix. The two-layer fade (route-level cross-fade + content-level
fade-and-rise) is a legitimate, low-risk pattern once every page uses it
consistently; this plan makes `NotFound` the 7th consistent site instead
of the 1 inconsistent one.)

## Target

```jsx
// src/pages/NotFound.jsx — target
import FadeIn from '../components/FadeIn';
// ... existing imports unchanged

export default function NotFound() {
  usePageMeta({ title: 'Page Not Found', noindex: true });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.15),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.15),_transparent_30%)] px-4 py-8 sm:px-6 lg:px-8">
      <FadeIn y={14} duration={0.35} className="mx-auto flex max-w-md flex-col items-center rounded-[2rem] border border-white/15 bg-white/10 p-10 text-center shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl">
        {/* existing inner content (Radar icon, heading, copy, Link) unchanged */}
      </FadeIn>
    </div>
  );
}
```

Only the inner `<div className="mx-auto flex max-w-md ...">` becomes
`<FadeIn y={14} duration={0.35} className="mx-auto flex max-w-md ...">`
(same `className`, same children) — the outer full-screen `<div>` and every
child inside stay exactly as they are.

## Repo conventions to follow

- This plan depends on Plan 003 (`src/components/FadeIn.jsx` must exist).
  If it doesn't exist yet, STOP and execute Plan 003 first.
- `y={14} duration={0.35}` matches the values used for the other
  full-page-load sites (`About.jsx`, `ComparePage.jsx`,
  `StateDetail.jsx`'s outer wrapper) per Plan 003 — use the same values
  here for consistency, not the `y={18} duration={0.45}` variant used by
  `HomePage.jsx`/`StateStatistics.jsx`.

## Steps

1. Confirm `src/components/FadeIn.jsx` exists (Plan 003). If it doesn't,
   STOP.
2. Open `src/pages/NotFound.jsx`. Add `import FadeIn from
   '../components/FadeIn';` to the top import block.
3. Change the inner `<div className="mx-auto flex max-w-md flex-col
   items-center rounded-[2rem] border border-white/15 bg-white/10 p-10
   text-center shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl">` tag to
   `<FadeIn y={14} duration={0.35} className="mx-auto flex max-w-md
   flex-col items-center rounded-[2rem] border border-white/15
   bg-white/10 p-10 text-center shadow-2xl shadow-cyan-500/10
   backdrop-blur-2xl">`, and its closing `</div>` to `</FadeIn>`. Every
   child between the opening and closing tag stays exactly as it is.

## Boundaries

- Do NOT touch `src/components/PageTransition.jsx` or `src/App.jsx` —
  out of scope; see the Problem section for why removing
  `PageTransition`'s own fade was rejected.
- Do NOT change the outer full-screen `<div>`'s className or structure.
- Do NOT touch any other page.
- If the current file content doesn't match the Problem section verbatim
  (drift since the commit stamp), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run lint` (0 errors) and `npm test` (all passing)
  from the repo root.
- **Feel check**:
  - Navigate to a URL that doesn't exist (e.g. `/this-page-does-not-exist`).
  - Confirm the 404 card now fades in while rising slightly, visually
    matching the entrance feel of `/about` or `/compare`.
  - In DevTools Rendering panel, enable "prefers-reduced-motion: reduce",
    reload the same URL — confirm the card still fades in (opacity) but
    no longer visibly rises.
- **Done when**: the 404 page's entrance is visually consistent with the
  other 6 routed pages, and both checks above pass.
