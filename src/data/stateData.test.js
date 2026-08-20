import { describe, expect, it } from 'vitest';
import stateData, { normalizeStateName, stateSlugs, stateNames } from './stateData';

describe('normalizeStateName', () => {
  it('lowercases and trims', () => {
    expect(normalizeStateName('  California  ')).toBe('california');
  });

  it('collapses internal whitespace', () => {
    expect(normalizeStateName('New   York')).toBe('new york');
  });

  it('strips punctuation', () => {
    expect(normalizeStateName("O'Hio!!")).toBe('ohio');
  });

  it('handles non-string/empty input without throwing', () => {
    expect(normalizeStateName('')).toBe('');
    expect(normalizeStateName(undefined)).toBe('');
  });
});

describe('stateData integrity', () => {
  it('exposes exactly 50 states with matching slugs and names', () => {
    expect(stateSlugs.length).toBe(50);
    expect(stateNames.length).toBe(50);
    // every slug must resolve back to the same state via normalizeStateName
    stateSlugs.forEach((slug) => {
      expect(normalizeStateName(slug)).toBe(slug);
    });
  });

  it('every state has the fields every page reads regardless of verification status', () => {
    stateSlugs.forEach((slug) => {
      const state = stateData[slug];
      expect(state.displayName, `${slug}.displayName`).toBeTruthy();
      expect(state.lastUpdated, `${slug}.lastUpdated`).toBeTruthy();
      expect(Array.isArray(state.crimeMeta), `${slug}.crimeMeta`).toBe(true);
      expect(state.crimeMeta.length, `${slug}.crimeMeta length`).toBeGreaterThan(0);
      expect(Array.isArray(state.crimeData), `${slug}.crimeData`).toBe(true);
      expect(state.crimeData.length, `${slug}.crimeData length`).toBeGreaterThan(0);
      state.crimeData.forEach((entry) => {
        expect(typeof entry.name, `${slug}.crimeData[].name`).toBe('string');
        expect(typeof entry.value, `${slug}.crimeData[].value`).toBe('number');
        expect(entry.value, `${slug}.crimeData[].value >= 0`).toBeGreaterThanOrEqual(0);
      });
      expect(typeof state.crimeGrowth, `${slug}.crimeGrowth`).toBe('string');
      expect(typeof state.incomeHeadline, `${slug}.incomeHeadline`).toBe('string');
      expect(typeof state.incomeNote, `${slug}.incomeNote`).toBe('string');
    });
  });

  it('all 50 states are verified with real-data metadata and sourced fields', () => {
    // The rollout started with 3 (CA/TX/FL) and now covers all 50 — this
    // assertion should stay at 50, not silently regress if a future edit
    // reintroduces placeholder data for any state.
    const verifiedSlugs = stateSlugs.filter((slug) => stateData[slug].verified);
    expect(verifiedSlugs.length).toBe(50);

    verifiedSlugs.forEach((slug) => {
      const state = stateData[slug];
      expect(state.dataYear, `${slug}.dataYear`).toBeTypeOf('number');
      expect(Array.isArray(state.sources), `${slug}.sources`).toBe(true);
      expect(state.sources.length, `${slug}.sources length`).toBeGreaterThan(0);
      state.sources.forEach((source) => {
        expect(source.label, `${slug}.sources[].label`).toBeTruthy();
        expect(source.url, `${slug}.sources[].url`).toMatch(/^https?:\/\//);
      });
      expect(Array.isArray(state.povertyData), `${slug}.povertyData`).toBe(true);
      state.povertyData.forEach((entry) => {
        expect(typeof entry.value, `${slug}.povertyData[].value`).toBe('number');
      });
    });
  });

  it('every verified state compares its poverty rate to the same national baseline', () => {
    // All state figures are ACS-sourced, so the "national average" comparator
    // must be the ACS national figure (12.5%), not the CPS-based 11.1% one —
    // mixing survey methodologies would make the comparison meaningless.
    stateSlugs.forEach((slug) => {
      const national = stateData[slug].povertyData.find((e) => e.name === 'National average');
      expect(national?.value, `${slug} national average baseline`).toBe(12.5);
    });
  });

  it('states with a poverty data year distinct from the crime data year expose povertyDataYear', () => {
    const withPovertyYear = stateSlugs.filter((slug) => stateData[slug].povertyDataYear);
    withPovertyYear.forEach((slug) => {
      const state = stateData[slug];
      expect(state.povertyDataYear).not.toBe(state.dataYear);
    });
  });
});
