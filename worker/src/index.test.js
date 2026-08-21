import { afterEach, describe, expect, it, vi } from 'vitest';
import worker, {
  escapeHtml,
  expandCityAbbreviations,
  formatArticleDate,
  geocodeCity,
  getSeverityTier,
  haversineMiles,
  renderAlertEmailHtml,
  safeArticleUrl,
  subKey,
  unsubscribePage,
} from './index.js';

// In-memory stand-in for the Cloudflare KV namespace binding (`env.VIEWS`).
// Mirrors the subset of the real KV API this worker actually calls:
// get/put/delete plus prefix-based list.
// pageSize defaults to real KV's actual page cap (1000) but is overridable
// so tests can exercise the multi-page path (listAllKeys's cursor loop)
// without needing 1000+ fake entries.
function createFakeKv({ pageSize = 1000 } = {}) {
  const store = new Map();
  // expirationTtl is recorded separately (not just discarded) so tests can
  // assert a key was actually written with a TTL, not just that it exists --
  // the real risk this guards against is a KV.put that silently drops the
  // options argument, which would only ever show up as unbounded storage
  // growth in production, never as a local test failure.
  const ttls = new Map();
  return {
    store,
    ttls,
    async get(key) {
      return store.has(key) ? store.get(key) : null;
    },
    async put(key, value, options) {
      store.set(key, value);
      if (options?.expirationTtl) ttls.set(key, options.expirationTtl);
      else ttls.delete(key);
    },
    async delete(key) {
      store.delete(key);
      ttls.delete(key);
    },
    async list({ prefix = '', cursor } = {}) {
      const matched = [...store.keys()].filter((k) => k.startsWith(prefix));
      const start = cursor ? Number(cursor) : 0;
      const page = matched.slice(start, start + pageSize).map((name) => ({ name }));
      const end = start + page.length;
      const list_complete = end >= matched.length;
      return { keys: page, list_complete, cursor: list_complete ? undefined : String(end) };
    },
  };
}

function makeEnv(overrides = {}) {
  const { kvPageSize, ...rest } = overrides;
  return {
    VIEWS: createFakeKv({ pageSize: kvPageSize }),
    GNEWS_API_KEY: 'test-gnews-key',
    RESEND_API_KEY: 'test-resend-key',
    ...rest,
  };
}

const noopCtx = { waitUntil: () => {} };

// handleNews reads/writes the platform Cache API (`caches.default`), which
// only exists in the real Workers runtime -- stub an always-empty cache so
// tests run under plain Node.
function stubEmptyCache() {
  vi.stubGlobal('caches', { default: { match: vi.fn().mockResolvedValue(undefined), put: vi.fn().mockResolvedValue(undefined) } });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('getSeverityTier', () => {
  it('classifies a routine property crime as local', () => {
    expect(getSeverityTier('Burglary reported at downtown storefront')).toBe('local');
  });

  it('classifies a killing as regional even without any local keyword', () => {
    expect(getSeverityTier('Man fatally shot outside gas station')).toBe('regional');
  });

  it('classifies a mass-casualty event as statewide', () => {
    expect(getSeverityTier('Active shooter reported at shopping mall')).toBe('statewide');
  });

  it('returns null for headlines with no crime keyword at all', () => {
    expect(getSeverityTier('City council approves new park budget')).toBeNull();
  });

  it('is case-insensitive', () => {
    expect(getSeverityTier('ARMED ROBBERY AT CONVENIENCE STORE')).toBe('local');
  });

  it('prioritizes the most severe matching tier when a headline matches multiple', () => {
    // "shooting" alone would be regional, but "mass shooting" pushes it to
    // statewide -- the more severe keyword must win, not whichever tier list
    // happens to be checked first for an unrelated match.
    expect(getSeverityTier('Mass shooting and robbery spree downtown')).toBe('statewide');
  });
});

describe('haversineMiles', () => {
  it('returns ~0 for identical coordinates', () => {
    expect(haversineMiles(44.9778, -93.265, 44.9778, -93.265)).toBeCloseTo(0, 5);
  });

  it('matches the known Minneapolis-to-Saint Paul distance within a couple miles', () => {
    const miles = haversineMiles(44.9778, -93.265, 44.9537, -93.09);
    expect(miles).toBeGreaterThan(7);
    expect(miles).toBeLessThan(11);
  });

  it('is symmetric regardless of argument order', () => {
    const a = haversineMiles(34.05, -118.24, 40.71, -74.0);
    const b = haversineMiles(40.71, -74.0, 34.05, -118.24);
    expect(a).toBeCloseTo(b, 6);
  });
});

describe('expandCityAbbreviations', () => {
  it('expands "St" to "Saint"', () => {
    expect(expandCityAbbreviations('St Paul')).toBe('Saint Paul');
  });

  it('expands "St." with a period', () => {
    expect(expandCityAbbreviations('St. Louis')).toBe('Saint Louis');
  });

  it('expands "Ft" to "Fort"', () => {
    expect(expandCityAbbreviations('Ft Worth')).toBe('Fort Worth');
  });

  it('expands "Mt" to "Mount"', () => {
    expect(expandCityAbbreviations('Mt Vernon')).toBe('Mount Vernon');
  });

  it('leaves cities with no abbreviation untouched', () => {
    expect(expandCityAbbreviations('Minneapolis')).toBe('Minneapolis');
  });
});

describe('subKey', () => {
  it('lowercases every component so lookups are case-insensitive', () => {
    expect(subKey('Minnesota', 'Minneapolis', 'User@Example.com')).toBe(
      'sub:minnesota:minneapolis:user@example.com'
    );
  });

  it('produces the same key for different casings of the same subscription', () => {
    expect(subKey('MN', 'Duluth', 'a@b.com')).toBe(subKey('mn', 'DULUTH', 'A@B.COM'));
  });
});

describe('escapeHtml', () => {
  it('escapes all five reserved HTML characters', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });

  it('treats null/undefined as an empty string instead of throwing', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});

describe('formatArticleDate', () => {
  it('formats a valid ISO date', () => {
    expect(formatArticleDate('2026-03-05T12:00:00Z')).toBe('Mar 5, 2026');
  });

  it('returns an empty string for an invalid date instead of "Invalid Date"', () => {
    expect(formatArticleDate('not-a-date')).toBe('');
  });

  it('returns an empty string for an empty input', () => {
    expect(formatArticleDate('')).toBe('');
  });
});

describe('unsubscribePage', () => {
  it('renders a confirmation for a successful unsubscribe', () => {
    const markup = unsubscribePage({ ok: true, state: 'Minnesota', city: 'Duluth' });
    expect(markup).toContain("You're unsubscribed");
    expect(markup).toContain('Duluth, Minnesota');
  });

  it('escapes city/state so a malicious query string cannot inject markup', () => {
    const markup = unsubscribePage({ ok: true, state: 'MN', city: '<img src=x onerror=alert(1)>' });
    expect(markup).not.toContain('<img src=x');
    expect(markup).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('renders an error state without a location when the link is invalid', () => {
    const markup = unsubscribePage({ ok: false });
    expect(markup).toContain("Couldn't process that link");
  });
});

describe('renderAlertEmailHtml', () => {
  const baseArgs = {
    incidentState: 'Minnesota',
    incidentCity: 'Minneapolis',
    subState: 'Minnesota',
    subCity: 'Minneapolis',
    article: { title: 'Robbery reported downtown', source: 'Star Tribune', link: 'https://example.com/a', pubDate: '2026-01-05T00:00:00Z' },
    unsubscribeUrl: 'https://example.com/unsub',
  };

  it('labels a home-scope alert with just the incident location', () => {
    const markup = renderAlertEmailHtml(baseArgs);
    expect(markup).toContain('Alert for Minneapolis, Minnesota');
  });

  it('labels a regional-scope alert with distance and the recipient city', () => {
    const markup = renderAlertEmailHtml({
      ...baseArgs,
      subCity: 'Saint Paul',
      scope: 'regional',
      distanceMiles: 8.6,
    });
    expect(markup).toContain('Nearby alert');
    expect(markup).toContain('9 mi away');
  });

  it('labels a statewide-scope alert without implying a fixed distance', () => {
    const markup = renderAlertEmailHtml({ ...baseArgs, subCity: 'Duluth', scope: 'statewide' });
    expect(markup).toContain('Statewide alert for Minnesota');
    expect(markup).not.toContain('mi away');
  });

  it('escapes the article title so a malicious feed cannot inject markup into the email', () => {
    const markup = renderAlertEmailHtml({
      ...baseArgs,
      article: { ...baseArgs.article, title: '<script>alert(1)</script>' },
    });
    expect(markup).not.toContain('<script>alert(1)</script>');
    expect(markup).toContain('&lt;script&gt;');
  });

  it("points the unsubscribe link at the recipient's own subscription, not the incident city", () => {
    // A regional/statewide fan-out recipient never subscribed to the
    // incident's city -- the footer and unsubscribe link must reference
    // their own subscription so the link actually works and the copy isn't
    // misleading.
    const markup = renderAlertEmailHtml({
      ...baseArgs,
      subCity: 'Saint Paul',
      subState: 'Minnesota',
      scope: 'regional',
      distanceMiles: 5,
    });
    expect(markup).toContain('Unsubscribe from Saint Paul, Minnesota alerts');
  });
});

describe('safeArticleUrl', () => {
  it('passes through an https URL unchanged', () => {
    expect(safeArticleUrl('https://example.com/story')).toBe('https://example.com/story');
  });

  it('passes through an http URL unchanged', () => {
    expect(safeArticleUrl('http://example.com/story')).toBe('http://example.com/story');
  });

  it('strips a javascript: URL', () => {
    expect(safeArticleUrl('javascript:alert(1)')).toBe('');
  });

  it('strips a data: URL', () => {
    expect(safeArticleUrl('data:text/html,<script>alert(1)</script>')).toBe('');
  });

  it('strips an unparseable value instead of throwing', () => {
    expect(safeArticleUrl('not a url')).toBe('');
    expect(safeArticleUrl('')).toBe('');
  });
});

describe('geocodeCity', () => {
  it('prefers a US result in the requested state over other matches', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            { country_code: 'US', admin1: 'Wisconsin', latitude: 1, longitude: 1 },
            { country_code: 'US', admin1: 'Minnesota', latitude: 44.9778, longitude: -93.265 },
          ],
        }),
      })
    );
    const result = await geocodeCity('Minneapolis', 'Minnesota');
    expect(result).toEqual({ lat: 44.9778, lon: -93.265 });
  });

  it('falls back to any US result when no result matches the given state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [{ country_code: 'US', admin1: 'Ohio', latitude: 2, longitude: 2 }] }),
      })
    );
    const result = await geocodeCity('Springfield', 'Minnesota');
    expect(result).toEqual({ lat: 2, lon: 2 });
  });

  it('returns null when the geocoder has no US results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [{ country_code: 'GB' }] }) })
    );
    expect(await geocodeCity('Paris', 'Texas')).toBeNull();
  });

  it('returns null instead of throwing when the geocoder request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network down')));
    expect(await geocodeCity('Minneapolis', 'Minnesota')).toBeNull();
  });

  it('returns null instead of throwing on a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    expect(await geocodeCity('Minneapolis', 'Minnesota')).toBeNull();
  });

  it('bounds the request with a timeout, so a hanging geocoder cannot hang this call forever', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [] }) });
    vi.stubGlobal('fetch', fetchMock);
    await geocodeCity('Minneapolis', 'Minnesota');
    expect(fetchMock.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });
});

describe('worker.fetch routing', () => {
  it('responds to a CORS preflight without touching any handler', async () => {
    const res = await worker.fetch(new Request('https://api.test/api/subscribe', { method: 'OPTIONS' }), makeEnv(), noopCtx);
    expect(res.status).toBe(200);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('returns 404 for an unknown route', async () => {
    const res = await worker.fetch(new Request('https://api.test/api/nope'), makeEnv(), noopCtx);
    expect(res.status).toBe(404);
  });

  describe('POST /api/view/:slug', () => {
    it('increments both the all-time and weekly counters and returns them', async () => {
      const env = makeEnv();
      const res = await worker.fetch(new Request('https://api.test/api/view/minnesota', { method: 'POST' }), env, noopCtx);
      const body = await res.json();
      expect(body).toEqual({ slug: 'minnesota', views: 1, weekly: 1 });

      const res2 = await worker.fetch(new Request('https://api.test/api/view/minnesota', { method: 'POST' }), env, noopCtx);
      expect(await res2.json()).toEqual({ slug: 'minnesota', views: 2, weekly: 2 });
    });

    it('rejects a slug that is too short to be real (fails length, not the route pattern)', async () => {
      // The route regex (`[a-z-]+`) only gates which characters are allowed;
      // handleView's own SLUG_PATTERN additionally enforces a 2-40 length
      // floor/ceiling, so a single-character slug reaches handleView and is
      // rejected there rather than 404ing at the routing layer.
      const res = await worker.fetch(new Request('https://api.test/api/view/a', { method: 'POST' }), makeEnv(), noopCtx);
      expect(res.status).toBe(400);
    });

    it("404s for a slug containing characters the route doesn't even match", async () => {
      const res = await worker.fetch(new Request('https://api.test/api/view/Not_Valid!', { method: 'POST' }), makeEnv(), noopCtx);
      expect(res.status).toBe(404);
    });

    // The route only accepts [a-z-]+ (no digits), so distinct test slugs
    // have to be generated as letter combinations rather than "slug0",
    // "slug1", etc.
    function letterSlug(i) {
      const a = 'a'.charCodeAt(0);
      return `z${String.fromCharCode(a + Math.floor(i / 26))}${String.fromCharCode(a + (i % 26))}`;
    }

    it('rate-limits an IP after 30 requests in the window, independent of slug', async () => {
      // No auth, no validation that a slug corresponds to a real state, and
      // the counters it writes never expire -- without a rate limit this
      // endpoint would let anyone mint unlimited permanent KV keys for free.
      const env = makeEnv();
      const req = (slug) =>
        new Request(`https://api.test/api/view/${slug}`, { method: 'POST', headers: { 'cf-connecting-ip': '1.2.3.4' } });

      for (let i = 0; i < 30; i += 1) {
        const res = await worker.fetch(req(letterSlug(i)), env, noopCtx);
        expect(res.status).toBe(200);
      }

      const blocked = await worker.fetch(req(letterSlug(30)), env, noopCtx);
      expect(blocked.status).toBe(429);
    });

    it('does not create views:/weekly: keys for a request rejected by the rate limit', async () => {
      const env = makeEnv();
      const req = (slug) =>
        new Request(`https://api.test/api/view/${slug}`, { method: 'POST', headers: { 'cf-connecting-ip': '5.6.7.8' } });
      for (let i = 0; i < 30; i += 1) await worker.fetch(req(letterSlug(i)), env, noopCtx);

      await worker.fetch(req('shouldnotcount'), env, noopCtx);
      expect(await env.VIEWS.get('views:shouldnotcount')).toBeNull();
    });

    it('tracks separate IPs independently', async () => {
      const env = makeEnv();
      for (let i = 0; i < 30; i += 1) {
        await worker.fetch(
          new Request(`https://api.test/api/view/${letterSlug(i)}`, { method: 'POST', headers: { 'cf-connecting-ip': '9.9.9.9' } }),
          env,
          noopCtx
        );
      }
      // A different IP should still get through even though 9.9.9.9 is now
      // at its cap.
      const res = await worker.fetch(
        new Request('https://api.test/api/view/minnesota', { method: 'POST', headers: { 'cf-connecting-ip': '1.1.1.1' } }),
        env,
        noopCtx
      );
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/views and /api/trending', () => {
    it('ranks views/trending counts highest first', async () => {
      const env = makeEnv();
      await worker.fetch(new Request('https://api.test/api/view/alabama', { method: 'POST' }), env, noopCtx);
      await worker.fetch(new Request('https://api.test/api/view/texas', { method: 'POST' }), env, noopCtx);
      await worker.fetch(new Request('https://api.test/api/view/texas', { method: 'POST' }), env, noopCtx);

      const viewsBody = await (await worker.fetch(new Request('https://api.test/api/views'), env, noopCtx)).json();
      expect(Object.keys(viewsBody.views)).toEqual(['texas', 'alabama']);

      const trendingBody = await (await worker.fetch(new Request('https://api.test/api/trending'), env, noopCtx)).json();
      expect(Object.keys(trendingBody.trending)).toEqual(['texas', 'alabama']);
    });
  });

  describe('GET /api/meta', () => {
    it('returns null when the weekly counters have never been reset', async () => {
      const body = await (await worker.fetch(new Request('https://api.test/api/meta'), makeEnv(), noopCtx)).json();
      expect(body).toEqual({ lastReset: null });
    });
  });

  describe('GET /api/news', () => {
    it('rejects a city/state that fails the location pattern', async () => {
      const res = await worker.fetch(new Request('https://api.test/api/news?city=&state=MN'), makeEnv(), noopCtx);
      expect(res.status).toBe(400);
    });

    it('returns 500 when the news API key is not configured', async () => {
      const res = await worker.fetch(
        new Request('https://api.test/api/news?city=Duluth&state=MN'),
        makeEnv({ GNEWS_API_KEY: undefined }),
        noopCtx
      );
      expect(res.status).toBe(500);
    });

    it('returns deduplicated, capped articles on success', async () => {
      stubEmptyCache();
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            articles: [
              { title: 'Robbery downtown', url: 'https://a', source: { name: 'A' }, publishedAt: '2026-01-01' },
              { title: 'Robbery downtown', url: 'https://a-dupe', source: { name: 'A' }, publishedAt: '2026-01-01' },
              { title: 'Second story', url: 'https://b', source: { name: 'B' }, publishedAt: '2026-01-02' },
            ],
          }),
        })
      );
      const res = await worker.fetch(new Request('https://api.test/api/news?city=Duluth&state=MN'), makeEnv(), noopCtx);
      const body = await res.json();
      expect(body.items).toHaveLength(2);
      expect(body.items.map((i) => i.title)).toEqual(['Robbery downtown', 'Second story']);
    });

    it('strips an unsafe article URL from an untrusted upstream feed', async () => {
      stubEmptyCache();
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            articles: [{ title: 'Malicious feed entry', url: 'javascript:alert(1)', source: { name: 'A' }, publishedAt: '2026-01-01' }],
          }),
        })
      );
      const res = await worker.fetch(new Request('https://api.test/api/news?city=Duluth&state=MN'), makeEnv(), noopCtx);
      const body = await res.json();
      expect(body.items[0].link).toBe('');
    });

    it('returns 502 instead of throwing when the upstream news source errors', async () => {
      stubEmptyCache();
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
      const res = await worker.fetch(new Request('https://api.test/api/news?city=Duluth&state=MN'), makeEnv(), noopCtx);
      expect(res.status).toBe(502);
    });

    it('bounds the GNews request with a timeout', async () => {
      stubEmptyCache();
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ articles: [] }) });
      vi.stubGlobal('fetch', fetchMock);
      await worker.fetch(new Request('https://api.test/api/news?city=Duluth&state=MN'), makeEnv(), noopCtx);
      expect(fetchMock.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
    });
  });

  describe('POST /api/subscribe (request confirmation)', () => {
    it('rejects an invalid email', async () => {
      const req = new Request('https://api.test/api/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: 'not-an-email', state: 'MN', city: 'Duluth' }),
      });
      const res = await worker.fetch(req, makeEnv(), noopCtx);
      expect(res.status).toBe(400);
    });

    it('rejects a malformed JSON body instead of throwing', async () => {
      const req = new Request('https://api.test/api/subscribe', { method: 'POST', body: '{not json' });
      const res = await worker.fetch(req, makeEnv(), noopCtx);
      expect(res.status).toBe(400);
    });

    it('returns 500 when the email service is not configured', async () => {
      const req = new Request('https://api.test/api/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: 'user@example.com', state: 'MN', city: 'Duluth' }),
      });
      const res = await worker.fetch(req, makeEnv({ RESEND_API_KEY: undefined }), noopCtx);
      expect(res.status).toBe(500);
    });

    it('does NOT activate the subscription immediately -- only a pending record is created', async () => {
      // This is the actual fix: anyone typing in an email address must not
      // be able to activate alerts for it without proving they own it.
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
      const env = makeEnv();
      const req = new Request('https://api.test/api/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: 'User@Example.com', state: 'Minnesota', city: 'Duluth' }),
      });
      const res = await worker.fetch(req, env, noopCtx);
      const resBody = await res.json();

      expect(res.status).toBe(200);
      expect(resBody).toEqual({ success: true, pending: true });
      expect(await env.VIEWS.get(subKey('Minnesota', 'Duluth', 'User@Example.com'))).toBeNull();

      const pendingKeys = [...env.VIEWS.store.keys()].filter((k) => k.startsWith('pending:'));
      expect(pendingKeys).toHaveLength(1);
      const pending = JSON.parse(await env.VIEWS.get(pendingKeys[0]));
      expect(pending).toMatchObject({ email: 'user@example.com', state: 'Minnesota', city: 'Duluth' });
      expect(env.VIEWS.ttls.get(pendingKeys[0])).toBe(60 * 60 * 24);
    });

    it('emails a confirmation link pointing at the pending token', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
      vi.stubGlobal('fetch', fetchMock);
      const env = makeEnv();
      await worker.fetch(
        new Request('https://api.test/api/subscribe', {
          method: 'POST',
          body: JSON.stringify({ email: 'user@example.com', state: 'Minnesota', city: 'Duluth' }),
        }),
        env,
        noopCtx
      );

      const resendCall = fetchMock.mock.calls.find(([reqUrl]) => String(reqUrl).includes('resend.com'));
      expect(resendCall).toBeDefined();
      const sentBody = JSON.parse(resendCall[1].body);
      expect(sentBody.to).toEqual(['user@example.com']);
      expect(resendCall[1].signal).toBeInstanceOf(AbortSignal);

      const [token] = [...env.VIEWS.store.keys()].filter((k) => k.startsWith('pending:'));
      expect(sentBody.html).toContain(`/api/subscribe/confirm?token=${token.slice('pending:'.length)}`);
    });

    it('returns 502 and discards the pending record when the confirmation email fails to send', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
      const env = makeEnv();
      const res = await worker.fetch(
        new Request('https://api.test/api/subscribe', {
          method: 'POST',
          body: JSON.stringify({ email: 'user@example.com', state: 'Minnesota', city: 'Duluth' }),
        }),
        env,
        noopCtx
      );
      expect(res.status).toBe(502);
      expect([...env.VIEWS.store.keys()].filter((k) => k.startsWith('pending:'))).toHaveLength(0);
    });

    it('does not throttle after a failed send, so a genuine user can retry', async () => {
      const env = makeEnv();
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
      await worker.fetch(
        new Request('https://api.test/api/subscribe', {
          method: 'POST',
          body: JSON.stringify({ email: 'user@example.com', state: 'Minnesota', city: 'Duluth' }),
        }),
        env,
        noopCtx
      );

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
      const retry = await worker.fetch(
        new Request('https://api.test/api/subscribe', {
          method: 'POST',
          body: JSON.stringify({ email: 'user@example.com', state: 'Minnesota', city: 'Duluth' }),
        }),
        env,
        noopCtx
      );
      expect(retry.status).toBe(200);
    });

    it('throttles a second confirmation request for the same email instead of sending another', async () => {
      // Confirmation alone doesn't stop this endpoint being used to mail-bomb
      // a stranger's inbox with confirmation emails they never asked for --
      // this cooldown is what actually stops that, independent of whether
      // anyone ever clicks confirm.
      const env = makeEnv();
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
      vi.stubGlobal('fetch', fetchMock);

      const req = () =>
        worker.fetch(
          new Request('https://api.test/api/subscribe', {
            method: 'POST',
            body: JSON.stringify({ email: 'victim@example.com', state: 'Minnesota', city: 'Duluth' }),
          }),
          env,
          noopCtx
        );

      const first = await req();
      expect(first.status).toBe(200);
      const second = await req();
      expect(second.status).toBe(429);

      const resendCalls = fetchMock.mock.calls.filter(([reqUrl]) => String(reqUrl).includes('resend.com'));
      expect(resendCalls).toHaveLength(1);
    });

    it('sets a bounded TTL on the throttle key, so it cannot silently lock a real user out forever', async () => {
      const env = makeEnv();
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
      await worker.fetch(
        new Request('https://api.test/api/subscribe', {
          method: 'POST',
          body: JSON.stringify({ email: 'user@example.com', state: 'Minnesota', city: 'Duluth' }),
        }),
        env,
        noopCtx
      );

      const throttleKey = [...env.VIEWS.store.keys()].find((k) => k.startsWith('subthrottle:'));
      expect(throttleKey).toBeDefined();
      expect(env.VIEWS.ttls.get(throttleKey)).toBe(5 * 60);
    });

    it('throttles per-email case-insensitively', async () => {
      const env = makeEnv();
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));

      await worker.fetch(
        new Request('https://api.test/api/subscribe', {
          method: 'POST',
          body: JSON.stringify({ email: 'Victim@Example.com', state: 'Minnesota', city: 'Duluth' }),
        }),
        env,
        noopCtx
      );
      const second = await worker.fetch(
        new Request('https://api.test/api/subscribe', {
          method: 'POST',
          body: JSON.stringify({ email: 'victim@example.com', state: 'Wisconsin', city: 'Madison' }),
        }),
        env,
        noopCtx
      );
      expect(second.status).toBe(429);
    });

    it('rate-limits an IP across many different emails, since each still costs a real send', async () => {
      // The per-email throttle above does nothing against an attacker
      // cycling through many different fake addresses from one source --
      // each one is still a real Resend send that counts against a
      // (likely capped) daily quota. This is what actually stops that.
      const env = makeEnv();
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));

      const subscribeAs = (email) =>
        worker.fetch(
          new Request('https://api.test/api/subscribe', {
            method: 'POST',
            headers: { 'cf-connecting-ip': '1.2.3.4' },
            body: JSON.stringify({ email, state: 'Minnesota', city: 'Duluth' }),
          }),
          env,
          noopCtx
        );

      for (let i = 0; i < 5; i += 1) {
        const res = await subscribeAs(`victim${i}@example.com`);
        expect(res.status).toBe(200);
      }
      const blocked = await subscribeAs('victim5@example.com');
      expect(blocked.status).toBe(429);
    });

    it('does not count a request from a different IP against another IP’s limit', async () => {
      const env = makeEnv();
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));

      const subscribeFrom = (ip, email) =>
        worker.fetch(
          new Request('https://api.test/api/subscribe', {
            method: 'POST',
            headers: { 'cf-connecting-ip': ip },
            body: JSON.stringify({ email, state: 'Minnesota', city: 'Duluth' }),
          }),
          env,
          noopCtx
        );

      for (let i = 0; i < 5; i += 1) await subscribeFrom('9.9.9.9', `a${i}@example.com`);
      const res = await subscribeFrom('1.1.1.1', 'unrelated@example.com');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/subscribe/confirm', () => {
    async function requestSubscription(env, email = 'user@example.com', state = 'Minnesota', city = 'Duluth') {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
      await worker.fetch(
        new Request('https://api.test/api/subscribe', { method: 'POST', body: JSON.stringify({ email, state, city }) }),
        env,
        noopCtx
      );
      const [pendingKey] = [...env.VIEWS.store.keys()].filter((k) => k.startsWith('pending:'));
      vi.unstubAllGlobals();
      return pendingKey.slice('pending:'.length);
    }

    it('activates the subscription and consumes the token', async () => {
      const env = makeEnv();
      const token = await requestSubscription(env);
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [] }) }));

      const res = await worker.fetch(new Request(`https://api.test/api/subscribe/confirm?token=${token}`), env, noopCtx);
      expect(res.status).toBe(200);
      expect(await res.text()).toContain("You're subscribed");

      const stored = JSON.parse(await env.VIEWS.get(subKey('Minnesota', 'Duluth', 'user@example.com')));
      expect(stored.email).toBe('user@example.com');
      expect(await env.VIEWS.get(`pending:${token}`)).toBeNull();
    });

    it('rejects a missing token', async () => {
      const res = await worker.fetch(new Request('https://api.test/api/subscribe/confirm'), makeEnv(), noopCtx);
      expect(res.status).toBe(400);
      expect(await res.text()).toContain("Couldn't confirm");
    });

    it('rejects an unknown or already-used token', async () => {
      const res = await worker.fetch(
        new Request('https://api.test/api/subscribe/confirm?token=not-a-real-token'),
        makeEnv(),
        noopCtx
      );
      expect(res.status).toBe(400);
    });

    it('cannot be replayed a second time', async () => {
      const env = makeEnv();
      const token = await requestSubscription(env);
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [] }) }));

      await worker.fetch(new Request(`https://api.test/api/subscribe/confirm?token=${token}`), env, noopCtx);
      const second = await worker.fetch(new Request(`https://api.test/api/subscribe/confirm?token=${token}`), env, noopCtx);
      expect(second.status).toBe(400);
    });
  });

  describe('DELETE /api/subscribe and GET /api/unsubscribe', () => {
    // These test the already-active-subscriber path, which is independent of
    // the subscribe/confirm flow above -- write the KV record directly
    // rather than going through two real HTTP round-trips per test.
    async function subscribe(env, email = 'user@example.com', state = 'Minnesota', city = 'Duluth') {
      await env.VIEWS.put(
        subKey(state, city, email),
        JSON.stringify({ email: email.toLowerCase(), state, city, lat: null, lon: null, subscribedAt: new Date().toISOString() })
      );
    }

    it('removes the subscription record via the DELETE endpoint', async () => {
      const env = makeEnv();
      await subscribe(env);
      expect(await env.VIEWS.get(subKey('Minnesota', 'Duluth', 'user@example.com'))).not.toBeNull();

      const url = 'https://api.test/api/subscribe?' + new URLSearchParams({ email: 'user@example.com', state: 'Minnesota', city: 'Duluth' });
      const res = await worker.fetch(new Request(url, { method: 'DELETE' }), env, noopCtx);
      expect(res.status).toBe(200);
      expect(await env.VIEWS.get(subKey('Minnesota', 'Duluth', 'user@example.com'))).toBeNull();
    });

    it('removes the subscription and renders a confirmation page via the one-click email link', async () => {
      const env = makeEnv();
      await subscribe(env);

      const url = 'https://api.test/api/unsubscribe?' + new URLSearchParams({ email: 'user@example.com', state: 'Minnesota', city: 'Duluth' });
      const res = await worker.fetch(new Request(url), env, noopCtx);
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toContain('text/html');
      expect(await res.text()).toContain("You're unsubscribed");
      expect(await env.VIEWS.get(subKey('Minnesota', 'Duluth', 'user@example.com'))).toBeNull();
    });

    it('renders an error page for the link variant when params are missing', async () => {
      const res = await worker.fetch(new Request('https://api.test/api/unsubscribe?email=user@example.com'), makeEnv(), noopCtx);
      expect(res.status).toBe(400);
      expect(await res.text()).toContain("Couldn't process that link");
    });
  });
});

describe('worker.scheduled', () => {
  it('runs the weekly reset on the Sunday-midnight cron and not the alert check', async () => {
    const env = makeEnv();
    await worker.fetch(new Request('https://api.test/api/view/minnesota', { method: 'POST' }), env, noopCtx);

    const waited = [];
    const ctx = { waitUntil: (p) => waited.push(p) };
    await worker.scheduled({ cron: '0 0 * * SUN' }, env, ctx);
    await Promise.all(waited);

    expect(await env.VIEWS.get('weekly:minnesota')).toBeNull();
    expect(await env.VIEWS.get('meta:lastReset')).not.toBeNull();
  });

  it('writes the weekly snapshot to an archive key with a bounded TTL, not forever', async () => {
    // Nothing in the codebase reads archive: keys back programmatically --
    // they're a manually-inspectable historical log, written on every
    // Sunday reset indefinitely. Without a TTL that's unbounded KV storage
    // growth that would never surface as a test failure, only as a slowly
    // growing bill/key count in production.
    const env = makeEnv();
    await worker.fetch(new Request('https://api.test/api/view/minnesota', { method: 'POST' }), env, noopCtx);

    const waited = [];
    const ctx = { waitUntil: (p) => waited.push(p) };
    await worker.scheduled({ cron: '0 0 * * SUN' }, env, ctx);
    await Promise.all(waited);

    const archiveKeys = [...env.VIEWS.store.keys()].filter((k) => k.startsWith('archive:'));
    expect(archiveKeys).toHaveLength(1);
    expect(env.VIEWS.ttls.get(archiveKeys[0])).toBe(60 * 60 * 24 * 365);

    const snapshot = JSON.parse(await env.VIEWS.get(archiveKeys[0]));
    expect(snapshot).toEqual({ minnesota: 1 });
  });

  it('runs the alert check on any other cron expression', async () => {
    const env = makeEnv();
    const waited = [];
    const ctx = { waitUntil: (p) => waited.push(p) };
    await worker.scheduled({ cron: '0 12 * * *' }, env, ctx);
    await Promise.all(waited);

    // No subscribers exist yet, so the alert check has nothing to send --
    // this just confirms it took the alert-check branch and completed
    // without the weekly-reset side effect running instead.
    expect(await env.VIEWS.get('meta:lastReset')).toBeNull();
  });

  it('logs the alert-check summary, so a silent zero-sent day is actually visible somewhere', async () => {
    const env = makeEnv();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const waited = [];
    const ctx = { waitUntil: (p) => waited.push(p) };
    await worker.scheduled({ cron: '0 12 * * *' }, env, ctx);
    await Promise.all(waited);

    expect(logSpy).toHaveBeenCalledWith('runAlertCheck', expect.stringContaining('"locations":0'));
  });

  it('records the actual failure reason (e.g. a Resend status code) when every send for an article fails', async () => {
    // Previously this just recorded "send failed for <title>" with nothing
    // to act on. A status code that's the same across every recipient (401
    // here) is exactly the kind of thing that should be immediately
    // diagnosable from the log line alone -- it means the Resend API key is
    // bad, not that any individual recipient's address is invalid.
    const env = makeEnv();
    await subscribeDirect(env, 'a@example.com', 'Minnesota', 'Duluth');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) => {
        const href = String(url);
        if (href.includes('gnews.io')) {
          return {
            ok: true,
            json: async () => ({ articles: [{ title: 'Robbery downtown', url: 'https://a', source: { name: 'A' }, publishedAt: '2026-01-01' }] }),
          };
        }
        if (href.includes('resend.com')) return { ok: false, status: 401, json: async () => ({}) };
        return { ok: true, json: async () => ({ results: [] }) };
      })
    );

    const waited = [];
    const ctx = { waitUntil: (p) => waited.push(p) };
    await worker.scheduled({ cron: '0 12 * * *' }, env, ctx);
    await Promise.all(waited);

    const [, loggedJson] = logSpy.mock.calls.find(([label]) => label === 'runAlertCheck');
    const logged = JSON.parse(loggedJson);
    expect(logged.errors).toHaveLength(1);
    expect(logged.errors[0]).toContain('Robbery downtown');
    expect(logged.errors[0]).toContain('401');
  });

  it('logs the weekly-reset summary', async () => {
    const env = makeEnv();
    await worker.fetch(new Request('https://api.test/api/view/minnesota', { method: 'POST' }), env, noopCtx);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const waited = [];
    const ctx = { waitUntil: (p) => waited.push(p) };
    await worker.scheduled({ cron: '0 0 * * SUN' }, env, ctx);
    await Promise.all(waited);

    expect(logSpy).toHaveBeenCalledWith('resetWeeklyCounts', expect.stringContaining('"resetCount":1'));
  });
});

describe('KV list() pagination', () => {
  it('handleAllViews sees every key across multiple pages, not just the first page', async () => {
    const env = makeEnv({ kvPageSize: 2 });
    // 5 keys against a page size of 2 forces 3 pages -- if listAllKeys
    // didn't follow the cursor, only the first 2 would show up here.
    for (const slug of ['alabama', 'alaska', 'arizona', 'arkansas', 'california']) {
      await worker.fetch(new Request(`https://api.test/api/view/${slug}`, { method: 'POST' }), env, noopCtx);
    }

    const body = await (await worker.fetch(new Request('https://api.test/api/views'), env, noopCtx)).json();
    expect(Object.keys(body.views).sort()).toEqual(['alabama', 'alaska', 'arizona', 'arkansas', 'california']);
  });

  it('the daily alert check reaches a subscriber past the first KV list page', async () => {
    const env = makeEnv({ kvPageSize: 1 });
    // Two subscribers in two different locations, page size 1 -- the second
    // location only exists on page 2. Before the fix, getSubscribersByLocation
    // would have silently only ever seen the first.
    await subscribeDirect(env, 'a@example.com', 'Minnesota', 'Duluth');
    await subscribeDirect(env, 'b@example.com', 'Wisconsin', 'Madison');

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) => {
        const href = String(url);
        if (href.includes('gnews.io')) {
          return {
            ok: true,
            json: async () => ({ articles: [{ title: 'Robbery downtown', url: `https://a/${href}`, source: { name: 'A' }, publishedAt: '2026-01-01' }] }),
          };
        }
        if (href.includes('resend.com')) return { ok: true, json: async () => ({}) };
        return { ok: true, json: async () => ({ results: [] }) };
      })
    );

    const waited = [];
    const ctx = { waitUntil: (p) => waited.push(p) };
    await worker.scheduled({ cron: '0 12 * * *' }, env, ctx);
    await Promise.all(waited);

    const sentKeys = [...env.VIEWS.store.keys()].filter((k) => k.startsWith('sent:'));
    expect(sentKeys.some((k) => k.includes('minnesota'))).toBe(true);
    expect(sentKeys.some((k) => k.includes('wisconsin'))).toBe(true);
  });
});

describe('runAlertCheck resilience (via worker.scheduled)', () => {
  it('bounds the alert-email send with a timeout', async () => {
    const env = makeEnv();
    await subscribeDirect(env, 'a@example.com', 'Minnesota', 'Duluth');

    const fetchMock = vi.fn(async (url) => {
      const href = String(url);
      if (href.includes('gnews.io')) {
        return {
          ok: true,
          json: async () => ({ articles: [{ title: 'Robbery downtown', url: 'https://a', source: { name: 'A' }, publishedAt: '2026-01-01' }] }),
        };
      }
      return { ok: true, json: async () => ({}) };
    });
    vi.stubGlobal('fetch', fetchMock);

    const waited = [];
    const ctx = { waitUntil: (p) => waited.push(p) };
    await worker.scheduled({ cron: '0 12 * * *' }, env, ctx);
    await Promise.all(waited);

    const resendCall = fetchMock.mock.calls.find(([reqUrl]) => String(reqUrl).includes('resend.com'));
    expect(resendCall).toBeDefined();
    expect(resendCall[1].signal).toBeInstanceOf(AbortSignal);
  });

  it('still processes and emails a second location after the first location fails to fetch news', async () => {
    const env = makeEnv();
    await subscribeDirect(env, 'a@example.com', 'Minnesota', 'Duluth');
    await subscribeDirect(env, 'b@example.com', 'Minnesota', 'Rochester');

    let call = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) => {
        const href = String(url);
        if (href.includes('gnews.io')) {
          call += 1;
          if (call === 1) throw new TypeError('network down');
          return {
            ok: true,
            json: async () => ({ articles: [{ title: 'Robbery downtown', url: 'https://a', source: { name: 'A' }, publishedAt: '2026-01-01' }] }),
          };
        }
        if (href.includes('resend.com')) {
          return { ok: true, json: async () => ({}) };
        }
        return { ok: true, json: async () => ({ results: [] }) };
      })
    );

    const waited = [];
    const ctx = { waitUntil: (p) => waited.push(p) };
    await worker.scheduled({ cron: '0 12 * * *' }, env, ctx);
    await Promise.all(waited);

    // The first location's fetch failure must not stop the second location
    // from being checked and alerted.
    const keys = [...env.VIEWS.store.keys()].filter((k) => k.startsWith('sent:'));
    expect(keys.some((k) => k.includes('rochester'))).toBe(true);
  });

  it('still records the article as sent and keeps going when one recipient send throws', async () => {
    const env = makeEnv();
    await subscribeDirect(env, 'a@example.com', 'Minnesota', 'Duluth');
    await subscribeDirect(env, 'b@example.com', 'Minnesota', 'Duluth');

    let emailCall = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) => {
        const href = String(url);
        if (href.includes('gnews.io')) {
          return {
            ok: true,
            json: async () => ({ articles: [{ title: 'Robbery downtown', url: 'https://a', source: { name: 'A' }, publishedAt: '2026-01-01' }] }),
          };
        }
        if (href.includes('resend.com')) {
          emailCall += 1;
          if (emailCall === 1) throw new TypeError('connection reset');
          return { ok: true, json: async () => ({}) };
        }
        return { ok: true, json: async () => ({ results: [] }) };
      })
    );

    const waited = [];
    const ctx = { waitUntil: (p) => waited.push(p) };
    await worker.scheduled({ cron: '0 12 * * *' }, env, ctx);
    await Promise.all(waited);

    // One recipient's send throwing must not prevent the other recipient in
    // the same location from being emailed, and the article must still be
    // marked sent since at least one send succeeded.
    expect(emailCall).toBe(2);
    const keys = [...env.VIEWS.store.keys()].filter((k) => k.startsWith('sent:'));
    expect(keys).toHaveLength(1);
    expect(env.VIEWS.ttls.get(keys[0])).toBe(60 * 60 * 24 * 30);
  });
});

// Writes an already-confirmed subscriber straight into the fake KV store --
// these tests are about runAlertCheck's failure isolation, not the
// subscribe/confirm flow itself, so they only need an active subscriber to
// already exist.
async function subscribeDirect(env, email, state, city) {
  await env.VIEWS.put(
    subKey(state, city, email),
    JSON.stringify({ email: email.toLowerCase(), state, city, lat: null, lon: null, subscribedAt: new Date().toISOString() })
  );
}
