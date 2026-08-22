# 002 — Respect prefers-reduced-motion on the map's click-to-zoom navigation

- **Status**: Done
- **Commit**: 2e12519
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 1 file, small

## Problem

Clicking a state on the interactive US map (`src/components/UsMap.jsx`)
triggers a 900ms animated pan-and-zoom before navigating to that state's
detail page. This animation never checks `useReducedMotion()`, even though
the *other* animated moment in this exact same file (the first-load radar
sweep reveal) correctly does:

```jsx
// src/components/UsMap.jsx:64 — already declared, already used elsewhere
const prefersReducedMotion = useReducedMotion();
```

```jsx
// src/components/UsMap.jsx:79-99 — the radar sweep already gates correctly
useEffect(() => {
  let mounted = true;
  let scanTimeout;
  loadGeoData()
    .then((data) => {
      if (!mounted) return;
      setGeoData(data);
      if (!prefersReducedMotion) {
        setScanning(true);
        scanTimeout = setTimeout(() => mounted && setScanning(false), 1400);
      }
    })
    .catch((err) => mounted && setGeoError(err.message || 'Failed to load map data'));
  // ...
```

```jsx
// src/components/UsMap.jsx:120-154 — handleClick, the animation that DOESN'T gate
const handleClick = useCallback((geo) => {
  const slug = normalizeStateName(geo.properties.name);
  if (!stateData[slug] || pendingSlug) return;

  playPing();

  const centroid = geoCentroid(geo);
  const [[x0, y0], [x1, y1]] = pathGenerator.bounds(geo);
  const boxWidth = Math.max(x1 - x0, 1);
  const boxHeight = Math.max(y1 - y0, 1);
  const fitZoom = Math.min(MAP_WIDTH / boxWidth, MAP_HEIGHT / boxHeight) * 0.55;
  const targetZoom = Math.min(Math.max(fitZoom, MIN_ZOOM), MAX_ZOOM);

  setHovered(null);
  setPendingSlug(slug);

  const from = position;
  controlsRef.current?.stop();
  controlsRef.current = animate(0, 1, {
    duration: 0.9,
    ease: [0.16, 1, 0.3, 1],
    onUpdate: (t) => {
      setPosition({
        center: [
          from.center[0] + (centroid[0] - from.center[0]) * t,
          from.center[1] + (centroid[1] - from.center[1]) * t,
        ],
        zoom: from.zoom + (targetZoom - from.zoom) * t,
      });
    },
    onComplete: () => {
      navigate(`/state/${encodeURIComponent(slug)}`);
    },
  });
}, [position, navigate, pendingSlug]);
```

Every click on any state forces a continuous, velocity-driven pan-and-zoom
on a user who has explicitly told their OS they don't want this class of
motion — and it delays navigation by 900ms for no functional reason once
motion is off.

## Target

When `prefersReducedMotion` is true, skip the animated pan/zoom entirely
and navigate immediately — there is no visual state to preserve across the
transition since the user is leaving this view:

```jsx
// src/components/UsMap.jsx:120-154 — target
const handleClick = useCallback((geo) => {
  const slug = normalizeStateName(geo.properties.name);
  if (!stateData[slug] || pendingSlug) return;

  playPing();

  if (prefersReducedMotion) {
    navigate(`/state/${encodeURIComponent(slug)}`);
    return;
  }

  const centroid = geoCentroid(geo);
  const [[x0, y0], [x1, y1]] = pathGenerator.bounds(geo);
  const boxWidth = Math.max(x1 - x0, 1);
  const boxHeight = Math.max(y1 - y0, 1);
  const fitZoom = Math.min(MAP_WIDTH / boxWidth, MAP_HEIGHT / boxHeight) * 0.55;
  const targetZoom = Math.min(Math.max(fitZoom, MIN_ZOOM), MAX_ZOOM);

  setHovered(null);
  setPendingSlug(slug);

  const from = position;
  controlsRef.current?.stop();
  controlsRef.current = animate(0, 1, {
    duration: 0.9,
    ease: [0.16, 1, 0.3, 1],
    onUpdate: (t) => {
      setPosition({
        center: [
          from.center[0] + (centroid[0] - from.center[0]) * t,
          from.center[1] + (centroid[1] - from.center[1]) * t,
        ],
        zoom: from.zoom + (targetZoom - from.zoom) * t,
      });
    },
    onComplete: () => {
      navigate(`/state/${encodeURIComponent(slug)}`);
    },
  });
}, [position, navigate, pendingSlug, prefersReducedMotion]);
```

Note: `prefersReducedMotion` must be added to the `useCallback` dependency
array, since the callback now reads it.

If Plan 001 has already landed when this plan is executed, the `ease:
[0.16, 1, 0.3, 1]` literal in the untouched branch will already read
`ease: EASE_OUT_STRONG` — that's expected and correct; do not revert it.

## Repo conventions to follow

- `prefersReducedMotion` is already declared at the top of this same
  component (`src/components/UsMap.jsx:64`) via
  `const prefersReducedMotion = useReducedMotion();` — reuse that existing
  variable, do not call `useReducedMotion()` a second time.
- The exemplar for the "if reduced motion, do the simple thing and return
  early" shape is the radar-sweep `useEffect` in this same file
  (`src/components/UsMap.jsx:86`: `if (!prefersReducedMotion) { ... }`).

## Steps

1. Open `src/components/UsMap.jsx` and locate `handleClick` (currently
   lines 120-154).
2. Immediately after the `playPing();` call and before the `const centroid
   = geoCentroid(geo);` line, insert:
   ```jsx
   if (prefersReducedMotion) {
     navigate(`/state/${encodeURIComponent(slug)}`);
     return;
   }
   ```
3. Add `prefersReducedMotion` to the `useCallback` dependency array at the
   end of `handleClick` (currently `[position, navigate, pendingSlug]` →
   `[position, navigate, pendingSlug, prefersReducedMotion]`).

## Boundaries

- Do NOT touch the radar-sweep `useEffect` (lines 79-99) — it already
  handles reduced motion correctly.
- Do NOT change `MIN_ZOOM`, `MAX_ZOOM`, or any zoom-calculation math.
- Do NOT add a `prefers-reduced-motion` media query in CSS — this is a
  JS-driven `animate()` call, the fix belongs in JS.
- If `handleClick`'s current code doesn't match the Problem section
  verbatim (drift since the commit stamp), STOP and report instead of
  improvising.

## Verification

- **Mechanical**: `npm run lint` (0 errors) and `npm test` (all passing)
  from the repo root.
- **Feel check**:
  - In Chrome DevTools, open the Rendering panel, set "Emulate CSS media
    feature prefers-reduced-motion" to "reduce".
  - Load the homepage, click any state on the map.
  - Confirm: navigation to the state detail page happens immediately
    (no visible pan or zoom), with no delay before the URL changes.
  - Turn the emulation back to "No emulation" and click a different
    state — confirm the original animated pan-and-zoom still plays
    exactly as before.
- **Done when**: both the reduced-motion and normal-motion paths in the
  feel check above behave as described, lint and tests are green.
