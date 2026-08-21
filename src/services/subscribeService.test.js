import { afterEach, describe, expect, it, vi } from 'vitest';
import { subscribe, unsubscribe } from './subscribeService';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('subscribe', () => {
  it('posts email/state/city as JSON and returns the parsed body on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    const result = await subscribe('user@example.com', 'Minnesota', 'Duluth');
    expect(result).toEqual({ success: true });

    const [url, options] = globalThis.fetch.mock.calls[0];
    expect(url).toContain('/api/subscribe');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ email: 'user@example.com', state: 'Minnesota', city: 'Duluth' });
  });

  it('throws the server-provided error message on failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'invalid email' }) });
    await expect(subscribe('not-an-email', 'Minnesota', 'Duluth')).rejects.toThrow('invalid email');
  });

  it('falls back to a generic message when the error response has no JSON body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, json: async () => { throw new Error('not json'); } });
    await expect(subscribe('user@example.com', 'Minnesota', 'Duluth')).rejects.toThrow('subscribe failed');
  });
});

describe('unsubscribe', () => {
  it('sends a DELETE request with email/state/city as query params', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    await unsubscribe('user@example.com', 'Minnesota', 'Duluth');

    const [url, options] = globalThis.fetch.mock.calls[0];
    expect(options.method).toBe('DELETE');
    expect(url).toContain('email=user%40example.com');
    expect(url).toContain('state=Minnesota');
    expect(url).toContain('city=Duluth');
  });

  it('throws on a non-ok response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });
    await expect(unsubscribe('user@example.com', 'Minnesota', 'Duluth')).rejects.toThrow('unsubscribe failed');
  });
});
