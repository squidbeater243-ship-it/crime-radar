import { describe, expect, it } from 'vitest';
import { getState, searchStates } from './dataService';

describe('getState', () => {
  it('resolves a known slug to its state data', async () => {
    const state = await getState('california');
    expect(state).toBeTruthy();
    expect(state.displayName).toBe('California');
  });

  it('is case/whitespace tolerant since it normalizes the slug', async () => {
    const state = await getState('  CALIFORNIA  ');
    expect(state?.displayName).toBe('California');
  });

  it('resolves to null for an unknown slug instead of throwing', async () => {
    await expect(getState('narnia')).resolves.toBeNull();
  });

  it('resolves to null for empty input', async () => {
    await expect(getState('')).resolves.toBeNull();
  });
});

describe('searchStates', () => {
  it('returns all states for an empty query', async () => {
    const results = await searchStates('');
    expect(results.length).toBe(50);
  });

  it('matches by partial name, case-insensitively', async () => {
    const results = await searchStates('calif');
    expect(results.some((r) => r.slug === 'california')).toBe(true);
  });

  it('caps results at 8', async () => {
    // "a" matches a large fraction of state names
    const results = await searchStates('a');
    expect(results.length).toBeLessThanOrEqual(8);
  });

  it('returns an empty array for a query with no matches', async () => {
    const results = await searchStates('zzzznotastate');
    expect(results).toEqual([]);
  });
});
