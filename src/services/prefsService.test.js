import { beforeEach, describe, expect, it } from 'vitest';
import { loadPrefs, savePrefs, addRecent, isFavorite, toggleFavorite, isAreaSaved, toggleSavedArea } from './prefsService';

beforeEach(() => {
  localStorage.clear();
});

const DEFAULT_PREFS = { recent: [], favorites: [], soundEnabled: false, hasSeenSignupPrompt: false, savedAreas: [] };

describe('loadPrefs', () => {
  it('returns empty recent/favorites lists when nothing is stored', () => {
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
  });

  it('returns the safe default if localStorage holds invalid JSON', () => {
    localStorage.setItem('crimeRadarPrefs_v1', '{not valid json');
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
  });

  it('round-trips whatever savePrefs wrote, filling in missing keys with defaults', () => {
    savePrefs({ recent: ['texas'] });
    expect(loadPrefs()).toEqual({ ...DEFAULT_PREFS, recent: ['texas'] });
  });
});

describe('addRecent', () => {
  it('adds a slug to the front of the recent list', () => {
    const result = addRecent('california');
    expect(result.recent[0]).toBe('california');
  });

  it('de-duplicates — re-adding an existing slug moves it to the front rather than repeating it', () => {
    addRecent('california');
    addRecent('texas');
    const result = addRecent('california');
    expect(result.recent).toEqual(['california', 'texas']);
  });

  it('caps the recent list at 6 entries, dropping the oldest', () => {
    ['a', 'b', 'c', 'd', 'e', 'f', 'g'].forEach((slug) => addRecent(slug));
    const result = loadPrefs();
    expect(result.recent.length).toBe(6);
    expect(result.recent).toEqual(['g', 'f', 'e', 'd', 'c', 'b']);
    expect(result.recent).not.toContain('a');
  });

  it('normalizes slugs to lowercase', () => {
    const result = addRecent('CALIFORNIA');
    expect(result.recent[0]).toBe('california');
  });
});

describe('toggleFavorite / isFavorite', () => {
  it('adds a state to favorites the first time it is toggled', () => {
    expect(isFavorite('california')).toBe(false);
    toggleFavorite('california');
    expect(isFavorite('california')).toBe(true);
  });

  it('removes a state from favorites the second time it is toggled', () => {
    toggleFavorite('california');
    toggleFavorite('california');
    expect(isFavorite('california')).toBe(false);
  });

  it('normalizes slugs to lowercase', () => {
    toggleFavorite('CALIFORNIA');
    expect(isFavorite('california')).toBe(true);
  });

  it('tracks multiple favorites independently', () => {
    toggleFavorite('california');
    toggleFavorite('texas');
    expect(loadPrefs().favorites).toEqual(['california', 'texas']);
    toggleFavorite('california');
    expect(loadPrefs().favorites).toEqual(['texas']);
  });
});

describe('toggleSavedArea / isAreaSaved', () => {
  it('saves an area the first time it is toggled', () => {
    expect(isAreaSaved('texas', 'Austin')).toBe(false);
    toggleSavedArea('texas', 'Austin', 'Texas');
    expect(isAreaSaved('texas', 'Austin')).toBe(true);
  });

  it('removes an area the second time it is toggled', () => {
    toggleSavedArea('texas', 'Austin', 'Texas');
    toggleSavedArea('texas', 'Austin', 'Texas');
    expect(isAreaSaved('texas', 'Austin')).toBe(false);
  });

  it('matches city case-insensitively and ignores surrounding whitespace', () => {
    toggleSavedArea('texas', '  Austin  ', 'Texas');
    expect(isAreaSaved('texas', 'austin')).toBe(true);
    expect(isAreaSaved('texas', 'AUSTIN')).toBe(true);
  });

  it('treats the same city in different states as distinct areas', () => {
    toggleSavedArea('texas', 'Springfield', 'Texas');
    expect(isAreaSaved('texas', 'Springfield')).toBe(true);
    expect(isAreaSaved('illinois', 'Springfield')).toBe(false);
  });

  it('stores the display name and saved timestamp', () => {
    const result = toggleSavedArea('texas', 'Austin', 'Texas');
    expect(result.savedAreas).toEqual([
      expect.objectContaining({ state: 'texas', city: 'Austin', stateDisplay: 'Texas' }),
    ]);
    expect(result.savedAreas[0].savedAt).toEqual(expect.any(String));
  });
});
