const PREF_KEY = 'crimeRadarPrefs_v1';

const DEFAULT_PREFS = { recent: [], favorites: [], soundEnabled: false, hasSeenSignupPrompt: false, savedAreas: [] };

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(prefs) {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function addRecent(slug) {
  try {
    const prefs = loadPrefs();
    const recent = prefs.recent || [];
    const normalized = slug.toString().toLowerCase();
    const filtered = recent.filter((s) => s !== normalized);
    filtered.unshift(normalized);
    const next = filtered.slice(0, 6);
    const updated = { ...prefs, recent: next };
    savePrefs(updated);
    return updated;
  } catch {
    return loadPrefs();
  }
}

export function isFavorite(slug) {
  const normalized = slug?.toString().toLowerCase();
  return loadPrefs().favorites.includes(normalized);
}

export function toggleFavorite(slug) {
  try {
    const prefs = loadPrefs();
    const favorites = prefs.favorites || [];
    const normalized = slug.toString().toLowerCase();
    const next = favorites.includes(normalized)
      ? favorites.filter((s) => s !== normalized)
      : [...favorites, normalized];
    const updated = { ...prefs, favorites: next };
    savePrefs(updated);
    return updated;
  } catch {
    return loadPrefs();
  }
}

export function isSoundEnabled() {
  return !!loadPrefs().soundEnabled;
}

export function setSoundEnabled(value) {
  const prefs = loadPrefs();
  const updated = { ...prefs, soundEnabled: !!value };
  savePrefs(updated);
  return updated;
}

// Area (state slug + city) identity for save/unsave comparisons — city is
// free-typed by the user, so it's lowercased/trimmed the same way on both
// sides rather than relying on exact string equality.
function areaKey(state, city) {
  return `${(state || '').toLowerCase()}:${(city || '').trim().toLowerCase()}`;
}

export function isAreaSaved(state, city) {
  const key = areaKey(state, city);
  return loadPrefs().savedAreas.some((area) => areaKey(area.state, area.city) === key);
}

export function toggleSavedArea(state, city, stateDisplay) {
  try {
    const prefs = loadPrefs();
    const savedAreas = prefs.savedAreas || [];
    const key = areaKey(state, city);
    const exists = savedAreas.some((area) => areaKey(area.state, area.city) === key);
    const next = exists
      ? savedAreas.filter((area) => areaKey(area.state, area.city) !== key)
      : [...savedAreas, { state, city: city.trim(), stateDisplay, savedAt: new Date().toISOString() }];
    const updated = { ...prefs, savedAreas: next };
    savePrefs(updated);
    return updated;
  } catch {
    return loadPrefs();
  }
}

export function hasSeenSignupPrompt() {
  return !!loadPrefs().hasSeenSignupPrompt;
}

export function setSeenSignupPrompt() {
  const prefs = loadPrefs();
  const updated = { ...prefs, hasSeenSignupPrompt: true };
  savePrefs(updated);
  return updated;
}

export default {
  loadPrefs,
  savePrefs,
  addRecent,
  isFavorite,
  toggleFavorite,
  isAreaSaved,
  toggleSavedArea,
  isSoundEnabled,
  setSoundEnabled,
  hasSeenSignupPrompt,
  setSeenSignupPrompt,
};
