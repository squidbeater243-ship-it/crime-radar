import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAllViews, getMeta, getTrending, recordView } from './viewsService';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('recordView', () => {
  it('returns the parsed body on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ slug: 'minnesota', views: 3, weekly: 1 }) });
    expect(await recordView('minnesota')).toEqual({ slug: 'minnesota', views: 3, weekly: 1 });
  });

  it('encodes the slug into the request URL', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    await recordView('new york');
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/view/new%20york'), expect.any(Object));
  });

  it('returns null instead of throwing on a non-ok response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });
    expect(await recordView('minnesota')).toBeNull();
  });

  it('returns null instead of throwing when the network request itself fails', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('network down'));
    expect(await recordView('minnesota')).toBeNull();
  });
});

describe('getAllViews', () => {
  it('returns the views map on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ views: { texas: 5 } }) });
    expect(await getAllViews()).toEqual({ texas: 5 });
  });

  it('returns an empty object instead of throwing on failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('network down'));
    expect(await getAllViews()).toEqual({});
  });

  it('returns an empty object when the response has no views field', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    expect(await getAllViews()).toEqual({});
  });
});

describe('getTrending', () => {
  it('returns the trending map on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ trending: { texas: 5 } }) });
    expect(await getTrending()).toEqual({ texas: 5 });
  });

  it('returns an empty object instead of throwing on failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });
    expect(await getTrending()).toEqual({});
  });
});

describe('getMeta', () => {
  it('returns the parsed body on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ lastReset: '2026-01-01T00:00:00Z' }) });
    expect(await getMeta()).toEqual({ lastReset: '2026-01-01T00:00:00Z' });
  });

  it('falls back to a null lastReset instead of throwing on failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('network down'));
    expect(await getMeta()).toEqual({ lastReset: null });
  });
});
