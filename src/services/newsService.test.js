import { afterEach, describe, expect, it, vi } from 'vitest';
import { getLocalNews } from './newsService';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getLocalNews', () => {
  it('returns the parsed body on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [{ title: 'Robbery downtown' }] }) });
    expect(await getLocalNews('Duluth', 'Minnesota')).toEqual({ items: [{ title: 'Robbery downtown' }] });
  });

  it('sends city and state as query params', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [] }) });
    await getLocalNews('Duluth', 'Minnesota');
    const url = globalThis.fetch.mock.calls[0][0];
    expect(url).toContain('city=Duluth');
    expect(url).toContain('state=Minnesota');
  });

  it('throws when the response is not ok, so the caller can show an error state', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 502 });
    await expect(getLocalNews('Duluth', 'Minnesota')).rejects.toThrow('news fetch failed');
  });

  it('propagates a network-level failure as a rejection', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('network down'));
    await expect(getLocalNews('Duluth', 'Minnesota')).rejects.toThrow('network down');
  });
});
