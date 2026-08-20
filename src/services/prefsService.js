const PREF_KEY = 'crimeRadarPrefs_v1';

const DEFAULT_PREFS = { recent: [], favorites: [], soundEnabled: false, hasSeenSignupPrompt: false };

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
  isSoundEnabled,
  setSoundEnabled,
  hasSeenSignupPrompt,
  setSeenSignupPrompt,
};
