// Free, keyless geocoder -- same one the worker uses for alert-distance
// calculations (worker/src/index.js). Used here purely for city-name
// suggestions/typo correction; no coordinates are stored client-side.
const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

// Open-Meteo matches names literally and doesn't know "St." means "Saint" --
// searching "St Paul" returns zero US results. Expand common abbreviations
// before querying so typing them still finds the right city.
function expandAbbreviations(city) {
  return city
    .replace(/\bSt\.?\s/gi, 'Saint ')
    .replace(/\bFt\.?\s/gi, 'Fort ')
    .replace(/\bMt\.?\s/gi, 'Mount ');
}

async function fetchGeocodeResults(name, count) {
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(name)}&count=${count}&language=en&format=json`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const data = await resp.json();
    return Array.isArray(data.results) ? data.results : [];
  } catch {
    return [];
  }
}

function filterUSState(results, stateDisplayName) {
  const stateLower = stateDisplayName.toLowerCase();
  const seen = new Set();
  const matches = [];
  for (const r of results) {
    if (r.country_code !== 'US') continue;
    if ((r.admin1 || '').toLowerCase() !== stateLower) continue;
    if (seen.has(r.name)) continue;
    seen.add(r.name);
    matches.push(r.name);
  }
  return matches;
}

export async function searchCities(query, stateDisplayName) {
  const trimmed = (query || '').trim();
  if (trimmed.length < 2 || !stateDisplayName) return [];

  const name = expandAbbreviations(trimmed);
  const results = await fetchGeocodeResults(name, 10);
  return filterUSState(results, stateDisplayName).slice(0, 8);
}

// Open-Meteo matches names literally, not fuzzily -- a dropped or wrong
// letter partway through a name (e.g. "Mineapolis") returns zero results at
// all, so there's nothing for resolveCityName to compare against. Widens the
// search specifically for typo correction: if the exact typed text finds
// nothing, retry with just its first few characters and a much larger
// result count, since a short/common prefix matches many places worldwide
// and the right one can rank well outside the default top 10. This only
// helps when the typo is past the first few letters -- an early typo
// corrupts the prefix itself and can't be recovered this way, same as a
// misspelling no fuzzy search could guess.
async function searchCitiesForCorrection(query, stateDisplayName) {
  const trimmed = (query || '').trim();
  if (trimmed.length < 2 || !stateDisplayName) return [];

  const name = expandAbbreviations(trimmed);
  const exactMatches = filterUSState(await fetchGeocodeResults(name, 10), stateDisplayName);
  if (exactMatches.length > 0) return exactMatches.slice(0, 8);

  const shortPrefix = name.slice(0, Math.min(3, name.length));
  const widenedMatches = filterUSState(await fetchGeocodeResults(shortPrefix, 100), stateDisplayName);
  return widenedMatches.slice(0, 8);
}

// Small dependency-free edit-distance check -- fine for short city names.
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// Returns the closest known city name if the typed value either exactly
// matches one case-insensitively (also fixes capitalization) or is close
// enough to be an obvious typo; otherwise returns the original text
// untouched -- a real small town this API doesn't know about is more likely
// than a several-letters-off typo, so we don't force a correction.
export function resolveCityName(typedCity, candidates) {
  const trimmed = (typedCity || '').trim();
  if (!trimmed || !candidates || candidates.length === 0) return trimmed;

  const exact = candidates.find((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact;

  let best = null;
  let bestDistance = Infinity;
  for (const candidate of candidates) {
    const distance = levenshtein(trimmed.toLowerCase(), candidate.toLowerCase());
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }

  const threshold = Math.max(1, Math.floor(trimmed.length * 0.25));
  return best && bestDistance <= threshold ? best : trimmed;
}

export async function autoCorrectCity(typedCity, stateDisplayName) {
  const trimmed = (typedCity || '').trim();
  const candidates = await searchCitiesForCorrection(trimmed, stateDisplayName);

  // resolveCityName's edit-distance threshold is deliberately tight enough
  // to avoid guessing wrong on genuinely different city names -- too tight
  // to also cover "St Paul" -> "Saint Paul" (a 3-letter expansion, not a
  // typo). We already know that equivalence for certain since we performed
  // it ourselves, so check it directly before falling back to fuzzy match.
  const expanded = expandAbbreviations(trimmed);
  const expandedExact = candidates.find((c) => c.toLowerCase() === expanded.toLowerCase());
  if (expandedExact) return expandedExact;

  return resolveCityName(trimmed, candidates);
}

export default { searchCities, resolveCityName, autoCorrectCity };
