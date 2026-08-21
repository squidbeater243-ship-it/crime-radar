import { describe, expect, it } from 'vitest';
import stateData from './stateData';
import stateTrendData from './stateTrendData';

const EXPECTED_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024];

describe('stateTrendData', () => {
  it('has a matching entry for every state in stateData', () => {
    const missing = Object.keys(stateData).filter((key) => !stateTrendData[key]);
    expect(missing).toEqual([]);
  });

  it('has no entries for states that do not exist in stateData', () => {
    const extra = Object.keys(stateTrendData).filter((key) => !stateData[key]);
    expect(extra).toEqual([]);
  });

  it('has exactly 7 ascending years (2018-2024) and 7 violent values for every state', () => {
    for (const [key, entry] of Object.entries(stateTrendData)) {
      expect(entry.years, `${key} years`).toEqual(EXPECTED_YEARS);
      expect(entry.violent, `${key} violent length`).toHaveLength(7);
      for (const value of entry.violent) {
        expect(typeof value, `${key} violent value type`).toBe('number');
        expect(value, `${key} violent value positive`).toBeGreaterThan(0);
      }
    }
  });
});
