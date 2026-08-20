// Sum of a state's crimeData series. For verified states this is a real
// violent+property rate per 100k residents; for unverified states it's a
// sum of sample category counts. Shared so the map tooltip and the compare
// page always agree on what "combined crime index" means for a given state.
export function getCombinedCrimeIndex(state) {
  if (!state?.crimeData) return 0;
  return state.crimeData.reduce((sum, item) => sum + (item.value || 0), 0);
}

export function computeRange(values) {
  if (!values || !values.length) return { min: 0, max: 0 };
  return { min: Math.min(...values), max: Math.max(...values) };
}

// Precompute the min/max combined crime index across a set of states once,
// so scoring every state against the same population doesn't mean
// re-scanning all of them on every call (map coloring calls this per state).
export function computeCrimeIndexRange(states) {
  return computeRange((states || []).map(getCombinedCrimeIndex));
}

// value from a state's crimeData series by category name (e.g. 'Violent',
// 'Property'). Shared so the compare page and national overview rankings
// read this the same way.
export function getMetricValue(state, name) {
  return state?.crimeData?.find((c) => c.name === name)?.value ?? 0;
}

export function getPovertyRate(state) {
  return state?.povertyData?.find((p) => p.name === state?.displayName)?.value ?? 0;
}

// Maps a value into a 0-100 position within [min, max] — 0 = at or below
// min, 100 = at or above max. Used to plot different-scaled metrics
// (violent rate, property rate, poverty %) on the same radar axes.
export function normalizeToRange(value, range) {
  const { min, max } = range || {};
  if (min == null || max == null || max === min) return 50;
  const t = (value - min) / (max - min);
  return Math.round(Math.max(0, Math.min(1, t)) * 100);
}

// 0-100 safety score, 100 = safest (lowest crime index in the population),
// 0 = highest crime index in the population. Relative, not absolute — it
// only means something within the `range` it was scored against.
export function getSafetyScore(state, range) {
  const { min, max } = range || {};
  if (min == null || max == null || max === min) return 100;
  const value = getCombinedCrimeIndex(state);
  const normalized = (value - min) / (max - min);
  return Math.round((1 - normalized) * 100);
}

const GRADE_THRESHOLDS = [
  { min: 85, grade: 'A' },
  { min: 70, grade: 'B' },
  { min: 50, grade: 'C' },
  { min: 30, grade: 'D' },
];

export function getSafetyGrade(score) {
  const found = GRADE_THRESHOLDS.find((t) => score >= t.min);
  return found ? found.grade : 'F';
}

const SEVERITY_COLOR_STOPS = [
  { at: 0, rgb: [244, 63, 94] }, // rose-500 — highest crime in the population
  { at: 50, rgb: [245, 158, 11] }, // amber-500 — mid
  { at: 100, rgb: [16, 185, 129] }, // emerald-500 — safest
];

// Interpolates a safety score (0-100) into an rgb() string along a
// rose -> amber -> emerald gradient, for map fills and score badges.
export function getSeverityColor(score) {
  const clamped = Math.max(0, Math.min(100, score));
  let lower = SEVERITY_COLOR_STOPS[0];
  let upper = SEVERITY_COLOR_STOPS[SEVERITY_COLOR_STOPS.length - 1];
  for (let i = 0; i < SEVERITY_COLOR_STOPS.length - 1; i++) {
    if (clamped >= SEVERITY_COLOR_STOPS[i].at && clamped <= SEVERITY_COLOR_STOPS[i + 1].at) {
      lower = SEVERITY_COLOR_STOPS[i];
      upper = SEVERITY_COLOR_STOPS[i + 1];
      break;
    }
  }
  const span = upper.at - lower.at || 1;
  const t = (clamped - lower.at) / span;
  const [r, g, b] = lower.rgb.map((c, i) => Math.round(c + (upper.rgb[i] - c) * t));
  return `rgb(${r}, ${g}, ${b})`;
}
