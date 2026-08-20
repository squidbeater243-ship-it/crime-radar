import { describe, expect, it } from 'vitest';
import {
  getCombinedCrimeIndex,
  computeRange,
  computeCrimeIndexRange,
  getSafetyScore,
  getSafetyGrade,
  getSeverityColor,
  getMetricValue,
  getPovertyRate,
  normalizeToRange,
} from './stateStats';

describe('getCombinedCrimeIndex', () => {
  it('sums the value field across crimeData entries', () => {
    const state = { crimeData: [{ value: 10 }, { value: 25 }, { value: 5 }] };
    expect(getCombinedCrimeIndex(state)).toBe(40);
  });

  it('treats missing values as zero instead of NaN', () => {
    const state = { crimeData: [{ value: 10 }, {}, { value: 5 }] };
    expect(getCombinedCrimeIndex(state)).toBe(15);
  });

  it('returns 0 for a state with no crimeData', () => {
    expect(getCombinedCrimeIndex({})).toBe(0);
  });

  it('returns 0 for null/undefined input instead of throwing', () => {
    expect(getCombinedCrimeIndex(null)).toBe(0);
    expect(getCombinedCrimeIndex(undefined)).toBe(0);
  });
});

describe('computeCrimeIndexRange', () => {
  it('finds the min and max combined index across states', () => {
    const states = [
      { crimeData: [{ value: 10 }] },
      { crimeData: [{ value: 50 }] },
      { crimeData: [{ value: 30 }] },
    ];
    expect(computeCrimeIndexRange(states)).toEqual({ min: 10, max: 50 });
  });

  it('returns zeros for an empty population', () => {
    expect(computeCrimeIndexRange([])).toEqual({ min: 0, max: 0 });
    expect(computeCrimeIndexRange(undefined)).toEqual({ min: 0, max: 0 });
  });
});

describe('getSafetyScore', () => {
  const range = { min: 0, max: 100 };

  it('scores the lowest-crime state at 100', () => {
    expect(getSafetyScore({ crimeData: [{ value: 0 }] }, range)).toBe(100);
  });

  it('scores the highest-crime state at 0', () => {
    expect(getSafetyScore({ crimeData: [{ value: 100 }] }, range)).toBe(0);
  });

  it('scores a mid-range state around 50', () => {
    expect(getSafetyScore({ crimeData: [{ value: 50 }] }, range)).toBe(50);
  });

  it('returns 100 when every state in the population has the same index', () => {
    expect(getSafetyScore({ crimeData: [{ value: 42 }] }, { min: 42, max: 42 })).toBe(100);
  });
});

describe('getSafetyGrade', () => {
  it('maps score bands to letter grades', () => {
    expect(getSafetyGrade(95)).toBe('A');
    expect(getSafetyGrade(70)).toBe('B');
    expect(getSafetyGrade(50)).toBe('C');
    expect(getSafetyGrade(30)).toBe('D');
    expect(getSafetyGrade(10)).toBe('F');
  });
});

describe('getSeverityColor', () => {
  it('returns emerald at score 100', () => {
    expect(getSeverityColor(100)).toBe('rgb(16, 185, 129)');
  });

  it('returns amber at score 50', () => {
    expect(getSeverityColor(50)).toBe('rgb(245, 158, 11)');
  });

  it('returns rose at score 0', () => {
    expect(getSeverityColor(0)).toBe('rgb(244, 63, 94)');
  });

  it('clamps out-of-range scores', () => {
    expect(getSeverityColor(150)).toBe(getSeverityColor(100));
    expect(getSeverityColor(-50)).toBe(getSeverityColor(0));
  });
});

describe('computeRange', () => {
  it('finds min and max of a value list', () => {
    expect(computeRange([5, 1, 9, 3])).toEqual({ min: 1, max: 9 });
  });

  it('returns zeros for an empty or missing list', () => {
    expect(computeRange([])).toEqual({ min: 0, max: 0 });
    expect(computeRange(undefined)).toEqual({ min: 0, max: 0 });
  });
});

describe('getMetricValue', () => {
  it('finds a crimeData entry by name', () => {
    const state = { crimeData: [{ name: 'Violent', value: 417.2 }, { name: 'Property', value: 1868 }] };
    expect(getMetricValue(state, 'Violent')).toBe(417.2);
    expect(getMetricValue(state, 'Property')).toBe(1868);
  });

  it('returns 0 when the metric or state is missing', () => {
    expect(getMetricValue({ crimeData: [] }, 'Violent')).toBe(0);
    expect(getMetricValue(null, 'Violent')).toBe(0);
  });
});

describe('getPovertyRate', () => {
  it("finds the state's own poverty rate by matching displayName", () => {
    const state = {
      displayName: 'Alabama',
      povertyData: [{ name: 'Alabama', value: 15.6 }, { name: 'National average', value: 12.5 }],
    };
    expect(getPovertyRate(state)).toBe(15.6);
  });

  it('returns 0 when povertyData is missing', () => {
    expect(getPovertyRate({ displayName: 'Alabama' })).toBe(0);
  });
});

describe('normalizeToRange', () => {
  const range = { min: 0, max: 200 };

  it('maps min to 0 and max to 100', () => {
    expect(normalizeToRange(0, range)).toBe(0);
    expect(normalizeToRange(200, range)).toBe(100);
  });

  it('maps a mid value proportionally', () => {
    expect(normalizeToRange(100, range)).toBe(50);
  });

  it('clamps values outside the range', () => {
    expect(normalizeToRange(-50, range)).toBe(0);
    expect(normalizeToRange(500, range)).toBe(100);
  });

  it('returns 50 when min equals max', () => {
    expect(normalizeToRange(10, { min: 10, max: 10 })).toBe(50);
  });
});
