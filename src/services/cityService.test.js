import { afterEach, describe, expect, it, vi } from 'vitest';
import { autoCorrectCity, resolveCityName, searchCities } from './cityService';

function mockFetchResults(results) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ results }),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('resolveCityName', () => {
  it('returns an exact case-insensitive match with corrected capitalization', () => {
    expect(resolveCityName('minneapolis', ['Minneapolis', 'St. Paul'])).toBe('Minneapolis');
  });

  it('corrects a close typo to the nearest candidate', () => {
    expect(resolveCityName('Mineapolis', ['Minneapolis', 'St. Paul'])).toBe('Minneapolis');
  });

  it('leaves the original text untouched when nothing is close enough', () => {
    expect(resolveCityName('Sometinyplace', ['Minneapolis', 'St. Paul'])).toBe('Sometinyplace');
  });

  it('returns the trimmed input unchanged when there are no candidates', () => {
    expect(resolveCityName('  Duluth  ', [])).toBe('Duluth');
  });
});

describe('searchCities', () => {
  it('returns an empty list for short queries', async () => {
    expect(await searchCities('M', 'Minnesota')).toEqual([]);
  });

  it('returns an empty list when no state is given', async () => {
    expect(await searchCities('Minneapolis', '')).toEqual([]);
  });

  it('filters results to US matches in the given state', async () => {
    mockFetchResults([
      { name: 'Minneapolis', country_code: 'US', admin1: 'Minnesota' },
      { name: 'Saint Paul', country_code: 'US', admin1: 'Alaska' },
      { name: 'Minneapolis', country_code: 'CA', admin1: 'Minnesota' },
    ]);
    const results = await searchCities('Minn', 'Minnesota');
    expect(results).toEqual(['Minneapolis']);
  });

  it('returns an empty list when the geocoder request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });
    expect(await searchCities('Minneapolis', 'Minnesota')).toEqual([]);
  });
});

describe('autoCorrectCity', () => {
  it('resolves a typo using live search results', async () => {
    mockFetchResults([{ name: 'Minneapolis', country_code: 'US', admin1: 'Minnesota' }]);
    expect(await autoCorrectCity('Mineapolis', 'Minnesota')).toBe('Minneapolis');
  });

  it('expands abbreviations to an exact match even when the edit distance is too large to be treated as a typo', async () => {
    // "St Paul" -> "Saint Paul" is a 3-letter expansion, not a typo -- too
    // far apart for resolveCityName's fuzzy threshold, so this has to be
    // resolved as a known-exact expansion instead.
    mockFetchResults([{ name: 'Saint Paul', country_code: 'US', admin1: 'Minnesota' }]);
    expect(await autoCorrectCity('St Paul', 'Minnesota')).toBe('Saint Paul');
  });

  it('widens the search when the exact typed text returns nothing', async () => {
    // Open-Meteo matches literally: a query for the full misspelled word
    // returns zero results, so the first call must come back empty before
    // the short-prefix retry (with a larger count) finds the real city.
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [{ name: 'Minneapolis', country_code: 'US', admin1: 'Minnesota' }] }),
      });

    const result = await autoCorrectCity('Mineapolis', 'Minnesota');

    expect(result).toBe('Minneapolis');
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    const secondCallUrl = globalThis.fetch.mock.calls[1][0];
    expect(secondCallUrl).toContain('count=100');
    expect(secondCallUrl).toContain('name=Min');
  });

  it('leaves the input untouched when even the widened search finds nothing close', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [] }) });
    expect(await autoCorrectCity('Xyzzyville', 'Minnesota')).toBe('Xyzzyville');
  });
});
