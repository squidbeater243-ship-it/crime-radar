import { describe, expect, it } from 'vitest';
import { arrestsBySex, arrestsByRace, arrestDataMeta } from './nationalArrestData';

const sumValues = (entries) => entries.reduce((sum, e) => sum + e.value, 0);

describe('nationalArrestData', () => {
  it('arrestsBySex sums to (approximately) 100%', () => {
    expect(sumValues(arrestsBySex)).toBeCloseTo(100, 0);
  });

  it('arrestsByRace sums to (approximately) 100%', () => {
    expect(sumValues(arrestsByRace)).toBeCloseTo(100, 0);
  });

  it('every entry has a positive share and a name', () => {
    [...arrestsBySex, ...arrestsByRace].forEach((entry) => {
      expect(entry.name).toBeTruthy();
      expect(entry.value).toBeGreaterThan(0);
    });
  });

  it('carries source citations for the figures shown on every state page', () => {
    expect(arrestDataMeta.year).toBeTypeOf('number');
    expect(arrestDataMeta.sources.length).toBeGreaterThan(0);
    arrestDataMeta.sources.forEach((source) => {
      expect(source.url).toMatch(/^https?:\/\//);
    });
  });
});
