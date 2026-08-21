const API_BASE_URL = 'https://crime-radar-api.crimeradar.workers.dev';
const SITE_URL = 'https://crimeradar.platinumsoftwaremn.com';

const SLUG_PATTERN = /^[a-z-]{2,40}$/;
const WEEKLY_PREFIX = 'weekly:';
const VIEWS_PREFIX = 'views:';
const LAST_RESET_KEY = 'meta:lastReset';
const ARCHIVE_PREFIX = 'archive:';
const ARCHIVE_TTL_SECONDS = 60 * 60 * 24 * 365;
const LOCATION_PATTERN = /^[a-zA-Z0-9 .'-]{1,80}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Unlike LOCATION_PATTERN (bounded at 80 chars), the shape-only regex above
// has no upper bound -- a pattern-valid but absurdly long string (10,000+
// chars) would pass it, get written to KV, and get sent to Resend for
// nothing. 254 is RFC 5321's practical maximum total email length.
const EMAIL_MAX_LENGTH = 254;
function isValidEmail(email) {
  return email.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(email);
}
const SUB_PREFIX = 'sub:';
const NEWS_CACHE_TTL_SECONDS = 600;
const PENDING_PREFIX = 'pending:';
const PENDING_TTL_SECONDS = 60 * 60 * 24;
const SUBSCRIBE_THROTTLE_PREFIX = 'subthrottle:';
const SUBSCRIBE_THROTTLE_SECONDS = 5 * 60;
const VIEW_RATE_PREFIX = 'viewrate:';
const VIEW_RATE_WINDOW_SECONDS = 60;
const VIEW_RATE_MAX = 30;
const SUBSCRIBE_IP_RATE_PREFIX = 'subiprate:';
const SUBSCRIBE_IP_RATE_WINDOW_SECONDS = 10 * 60;
const SUBSCRIBE_IP_RATE_MAX = 5;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, ...extraHeaders },
  });
}

function html(markup, status = 200) {
  return new Response(markup, {
    status,
    headers: { 'Content-Type': 'text/html; charset=UTF-8', ...CORS_HEADERS },
  });
}

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

async function bump(env, key) {
  const current = Number((await env.VIEWS.get(key)) || '0');
  const next = current + 1;
  await env.VIEWS.put(key, String(next));
  return next;
}

// Unlike /api/subscribe, this endpoint takes no email/identity to key a
// cooldown on -- and unlike sent:/pending:/subthrottle:, the counters
// bump() writes never expire (they're real, persistent view counts, not
// disposable dedup markers). Nothing validates that `slug` corresponds to
// an actual state either -- it only has to match the character pattern.
// Combined, an unauthenticated caller could otherwise mint unlimited
// permanent KV keys for free just by POSTing arbitrary garbage slugs. A
// generous per-IP rate limit doesn't require knowing the real slug list,
// and 30/minute is far above what a real visitor loading state pages could
// ever hit (recordView fires once per page view, gated by isPrerendering()).
async function handleView(slug, env, request) {
  if (!SLUG_PATTERN.test(slug)) {
    return json({ error: 'invalid slug' }, 400);
  }

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const rateKey = `${VIEW_RATE_PREFIX}${ip}`;
  const recent = Number((await env.VIEWS.get(rateKey)) || '0');
  if (recent >= VIEW_RATE_MAX) {
    return json({ error: 'too many requests' }, 429);
  }
  await env.VIEWS.put(rateKey, String(recent + 1), { expirationTtl: VIEW_RATE_WINDOW_SECONDS });

  const [views, weekly] = await Promise.all([
    bump(env, `${VIEWS_PREFIX}${slug}`),
    bump(env, `${WEEKLY_PREFIX}${slug}`),
  ]);
  return json({ slug, views, weekly });
}

// KV's list() caps out at 1000 keys per call (returning a cursor for the
// rest) -- none of this worker's three list() call sites handled that
// pagination, so any prefix that ever grew past 1000 keys would silently
// process only the first 1000 with no error anywhere. views:/weekly: are
// bounded by the fixed set of real states today, but sub: (every
// subscriber-location pair) is exactly the kind of count that's meant to
// grow, and growing past 1000 would have meant some subscribers silently
// stopped receiving alerts.
async function listAllKeys(env, prefix) {
  const keys = [];
  let cursor;
  for (;;) {
    const page = await env.VIEWS.list({ prefix, cursor });
    keys.push(...page.keys);
    if (page.list_complete) return keys;
    cursor = page.cursor;
  }
}

async function listCounts(env, prefix) {
  const keys = await listAllKeys(env, prefix);
  const entries = await Promise.all(
    keys.map(async (k) => {
      const slug = k.name.slice(prefix.length);
      const count = Number((await env.VIEWS.get(k.name)) || '0');
      return [slug, count];
    })
  );
  entries.sort((a, b) => b[1] - a[1]);
  return Object.fromEntries(entries);
}

async function handleAllViews(env) {
  return json({ views: await listCounts(env, VIEWS_PREFIX) });
}

async function handleTrending(env) {
  return json({ trending: await listCounts(env, WEEKLY_PREFIX) });
}

async function handleMeta(env) {
  const lastReset = await env.VIEWS.get(LAST_RESET_KEY);
  return json({ lastReset: lastReset || null });
}

// GNews items get embedded verbatim as an <a href> both here (client-side
// rendering) and in alert emails (renderAlertEmailHtml) -- neither of those
// call sites HTML-escapes the URL *scheme*, so a `javascript:`/`data:` link
// from an untrusted upstream feed would otherwise work as a clickable link.
// Only http(s) survives; anything else is dropped rather than passed through
// broken, so the item still renders (with a missing link) instead of the
// whole article being discarded.
export function safeArticleUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? url : '';
  } catch {
    return '';
  }
}

// Every external fetch in this file (GNews here, Open-Meteo, Resend x2)
// gets an explicit timeout. Without one, a single slow/hanging third-party
// response has no bound other than the whole Worker's execution limit --
// on the cron path (runAlertCheck loops over every subscribed location
// sequentially), that means one stuck request could silently starve out
// every location queued after it, not just fail its own.
const FETCH_TIMEOUT_MS = 8000;

async function fetchNewsArticles(city, env) {
  const query = `${city} crime`;
  const apiUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=us&max=10&apikey=${env.GNEWS_API_KEY}`;

  const apiResp = await fetch(apiUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!apiResp.ok) {
    throw new Error(`news source unavailable (${apiResp.status})`);
  }
  const data = await apiResp.json();
  const articles = Array.isArray(data.articles) ? data.articles : [];
  const items = [];
  const seenTitles = new Set();
  for (const article of articles) {
    const title = article.title || '';
    if (!title || seenTitles.has(title)) continue;
    seenTitles.add(title);
    items.push({
      title,
      link: safeArticleUrl(article.url || ''),
      source: article.source?.name || '',
      pubDate: article.publishedAt || '',
    });
    if (items.length >= 8) break;
  }
  return items;
}

async function handleNews(request, env, ctx) {
  const url = new URL(request.url);
  const city = (url.searchParams.get('city') || '').trim();
  const state = (url.searchParams.get('state') || '').trim();

  if (!LOCATION_PATTERN.test(city) || !LOCATION_PATTERN.test(state)) {
    return json({ error: 'invalid city or state' }, 400);
  }
  if (!env.GNEWS_API_KEY) {
    return json({ error: 'news source not configured' }, 500);
  }

  const cacheKey = new Request(
    `https://cache.internal/news?city=${encodeURIComponent(city.toLowerCase())}&state=${encodeURIComponent(state.toLowerCase())}`
  );
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  let items;
  try {
    items = await fetchNewsArticles(city, env);
  } catch {
    return json({ error: 'news source unavailable' }, 502);
  }

  const response = json({ query: `${city} crime`, items }, 200, {
    'Cache-Control': `public, max-age=${NEWS_CACHE_TTL_SECONDS}`,
  });
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

export function subKey(state, city, email) {
  return `${SUB_PREFIX}${state.toLowerCase()}:${city.toLowerCase()}:${email.toLowerCase()}`;
}

// Open-Meteo's geocoder matches names literally and doesn't know "St." means
// "Saint" — searching "St Paul" returns zero US results (only UK/Australia
// places named "St Paul's"), while "Saint Paul" correctly finds Minnesota's
// capital. Since abbreviated forms are how people actually type these city
// names, expand the common ones before querying. Query-only: the value
// stored on the subscription record stays exactly what the user typed.
export function expandCityAbbreviations(city) {
  return city
    .replace(/\bSt\.?\s/gi, 'Saint ')
    .replace(/\bFt\.?\s/gi, 'Fort ')
    .replace(/\bMt\.?\s/gi, 'Mount ');
}

// Free, keyless geocoder — used once per signup so alert fan-out (see
// getSeverityTier/runAlertCheck below) can compute distance between
// subscribed cities without bundling a US-cities dataset into the worker.
// A failed lookup just leaves lat/lon null on the record; the subscriber
// still gets alerts for their own city, they just can't receive nearby
// (regional-tier) fan-out.
export async function geocodeCity(city, state) {
  try {
    const queryName = expandCityAbbreviations(city);
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(queryName)}&count=10&language=en&format=json`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!resp.ok) return null;
    const data = await resp.json();
    const results = Array.isArray(data.results) ? data.results : [];
    const stateLower = state.toLowerCase();
    const match =
      results.find((r) => r.country_code === 'US' && (r.admin1 || '').toLowerCase() === stateLower) ||
      results.find((r) => r.country_code === 'US');
    if (!match) return null;
    return { lat: match.latitude, lon: match.longitude };
  } catch {
    return null;
  }
}

// Confirmation-email HTML, in the same table-based/inlined style as
// renderAlertEmailHtml (see that function's comment for why: it's the
// safest baseline across Gmail/Outlook/Apple Mail).
function renderConfirmSubscriptionEmailHtml({ state, city, confirmUrl }) {
  const location = `${escapeHtml(city)}, ${escapeHtml(state)}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Confirm your Crime Radar alerts</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f1f5f9;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
            <tr>
              <td style="background-color:#0f172a;padding:24px 32px;">
                <span style="font-size:13px;font-weight:700;letter-spacing:3px;color:#38bdf8;text-transform:uppercase;">Crime Radar</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:22px;line-height:1.35;color:#0f172a;">Confirm your alerts for ${location}</h1>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">Someone (hopefully you) asked to receive Crime Radar email alerts for ${location}. Click below to confirm -- if this wasn't you, just ignore this email and nothing further will happen.</p>
                <a href="${confirmUrl}" style="display:inline-block;padding:12px 24px;background-color:#0ea5e9;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:999px;">Confirm alerts for ${location}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendConfirmationEmail(env, email, state, city, confirmUrl) {
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Crime Radar Alerts <alerts@mail.platinumsoftwaremn.com>',
        to: [email],
        subject: `Confirm your Crime Radar alerts for ${city}, ${state}`,
        html: renderConfirmSubscriptionEmailHtml({ state, city, confirmUrl }),
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

// Subscribing does NOT activate alerts immediately -- it only stores a
// pending request keyed by a random token and emails a confirmation link
// (handleConfirmSubscribe below actually creates the `sub:` record). Without
// this, anyone could type in a stranger's email address and sign them up for
// recurring alert emails they never asked for: unwanted mail at best,
// harassment at worst, and enough of it risks the sending domain's
// deliverability reputation. This mirrors the one-click unsubscribe link
// already used for the opposite direction.
async function handleSubscribe(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid request body' }, 400);
  }
  // `null` is valid JSON (JSON.parse('null') succeeds), so it isn't caught
  // above -- but body.email on a null body throws, uncaught, turning into an
  // ugly platform error page instead of the clean 400 every other malformed
  // input gets here. Every other non-object JSON body (42, true, "x", [])
  // degrades safely since property access on those just returns undefined.
  if (!body || typeof body !== 'object') {
    return json({ error: 'invalid request body' }, 400);
  }

  // String(x ?? '') rather than (x || '') -- the request body is arbitrary
  // JSON, so email/state/city could just as easily be a number, boolean,
  // array, or object as a string. (x || '').trim() throws on any truthy
  // non-string (e.g. {"email": 12345, ...}), same uncaught-exception class
  // as the null-body case above. String() always produces a string, so the
  // worst case is a value that then correctly fails validation below with a
  // clean 400, instead of throwing.
  const email = String(body.email ?? '').trim();
  const state = String(body.state ?? '').trim();
  const city = String(body.city ?? '').trim();

  if (!isValidEmail(email)) {
    return json({ error: 'invalid email' }, 400);
  }
  if (!LOCATION_PATTERN.test(city) || !LOCATION_PATTERN.test(state)) {
    return json({ error: 'invalid city or state' }, 400);
  }
  if (!env.RESEND_API_KEY) {
    return json({ error: 'email service not configured' }, 500);
  }

  // The per-email throttle below stops one address from being repeatedly
  // targeted, but does nothing against an attacker cycling through many
  // different fake addresses from one source -- each one still costs a
  // real Resend send. Free/low tiers cap sends per day; a burst across
  // enough distinct fake addresses could exhaust that quota and break
  // confirmation emails for genuine signups for the rest of the day. This
  // per-IP cap is deliberately tighter than the view-endpoint one (5 per
  // 10 minutes vs. 30 per minute) since a real user only ever submits this
  // form a handful of times, not dozens.
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const ipRateKey = `${SUBSCRIBE_IP_RATE_PREFIX}${ip}`;
  const recentFromIp = Number((await env.VIEWS.get(ipRateKey)) || '0');
  if (recentFromIp >= SUBSCRIBE_IP_RATE_MAX) {
    return json({ error: 'too many requests -- try again in a few minutes' }, 429);
  }

  // Confirmation alone doesn't stop *this* endpoint from being used to
  // spam a stranger's inbox with confirmation emails they never asked
  // for -- it only stops fake signups from receiving ongoing alert
  // emails. Cap how often a given address can trigger a new one.
  const throttleKey = `${SUBSCRIBE_THROTTLE_PREFIX}${email.toLowerCase()}`;
  if (await env.VIEWS.get(throttleKey)) {
    return json({ error: 'a confirmation email was already sent recently -- check your inbox' }, 429);
  }

  const token = crypto.randomUUID();
  await env.VIEWS.put(
    `${PENDING_PREFIX}${token}`,
    JSON.stringify({ email: email.toLowerCase(), state, city, requestedAt: new Date().toISOString() }),
    { expirationTtl: PENDING_TTL_SECONDS }
  );

  const confirmUrl = `${API_BASE_URL}/api/subscribe/confirm?token=${token}`;
  const sent = await sendConfirmationEmail(env, email, state, city, confirmUrl);
  if (!sent) {
    await env.VIEWS.delete(`${PENDING_PREFIX}${token}`);
    return json({ error: 'failed to send confirmation email' }, 502);
  }

  // Only start the cooldowns once an email has actually gone out, so a
  // transient send failure doesn't lock a genuine user out of retrying.
  await env.VIEWS.put(throttleKey, '1', { expirationTtl: SUBSCRIBE_THROTTLE_SECONDS });
  await env.VIEWS.put(ipRateKey, String(recentFromIp + 1), { expirationTtl: SUBSCRIBE_IP_RATE_WINDOW_SECONDS });

  return json({ success: true, pending: true });
}

async function handleConfirmSubscribe(request, env) {
  const url = new URL(request.url);
  const token = (url.searchParams.get('token') || '').trim();
  if (!token) return html(confirmSubscribePage({ ok: false }), 400);

  const pendingKey = `${PENDING_PREFIX}${token}`;
  const raw = await env.VIEWS.get(pendingKey);
  if (!raw) return html(confirmSubscribePage({ ok: false }), 400);

  let pending;
  try {
    pending = JSON.parse(raw);
  } catch {
    return html(confirmSubscribePage({ ok: false }), 400);
  }

  const { email, state, city } = pending;
  const coords = await geocodeCity(city, state);
  const record = {
    email,
    state,
    city,
    lat: coords?.lat ?? null,
    lon: coords?.lon ?? null,
    subscribedAt: new Date().toISOString(),
  };
  await env.VIEWS.put(subKey(state, city, email), JSON.stringify(record));
  await env.VIEWS.delete(pendingKey);

  return html(confirmSubscribePage({ ok: true, state, city }));
}

export function confirmSubscribePage({ ok, state, city }) {
  const heading = ok ? "You're subscribed" : "Couldn't confirm that link";
  const body = ok
    ? `You'll get an email when something significant happens in <strong>${escapeHtml(city)}, ${escapeHtml(state)}</strong>. Unsubscribe anytime from the link in any alert email.`
    : 'This confirmation link is invalid or has expired. Head back to the site to sign up again.';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${heading} — Crime Radar</title>
  </head>
  <body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#020617 0%,#111827 50%,#0f172a 100%);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#f8fafc;padding:24px;box-sizing:border-box;">
    <div style="max-width:420px;width:100%;text-align:center;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.05);border-radius:24px;padding:40px 32px;">
      <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:3px;color:#67e8f9;text-transform:uppercase;">Crime Radar</p>
      <h1 style="margin:0 0 16px;font-size:22px;color:#ffffff;">${heading}</h1>
      <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:#cbd5e1;">${body}</p>
      <a href="${SITE_URL}/local-alerts" style="display:inline-block;padding:10px 24px;border-radius:999px;border:1px solid rgba(56,189,248,0.3);background:rgba(14,165,233,0.15);color:#a5f3fc;font-size:14px;font-weight:600;text-decoration:none;">Manage alerts</a>
    </div>
  </body>
</html>`;
}

// Shared by both unsubscribe entry points: the app's fetch-based DELETE
// (handleUnsubscribe) and the one-click link in alert emails
// (handleUnsubscribeLink), so the validation/deletion logic can't drift
// between the two.
async function performUnsubscribe(searchParams, env) {
  const email = (searchParams.get('email') || '').trim();
  const state = (searchParams.get('state') || '').trim();
  const city = (searchParams.get('city') || '').trim();

  if (!isValidEmail(email) || !LOCATION_PATTERN.test(city) || !LOCATION_PATTERN.test(state)) {
    return { ok: false };
  }

  await env.VIEWS.delete(subKey(state, city, email));
  return { ok: true, state, city };
}

async function handleUnsubscribe(request, env) {
  const url = new URL(request.url);
  const result = await performUnsubscribe(url.searchParams, env);
  if (!result.ok) return json({ error: 'invalid request' }, 400);
  return json({ success: true });
}

export function unsubscribePage({ ok, state, city }) {
  const heading = ok ? "You're unsubscribed" : "Couldn't process that link";
  const body = ok
    ? `You won't receive any more crime alert emails for <strong>${escapeHtml(city)}, ${escapeHtml(state)}</strong>.`
    : 'This unsubscribe link is invalid or has expired. You can manage your alerts directly on the site instead.';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${heading} — Crime Radar</title>
  </head>
  <body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#020617 0%,#111827 50%,#0f172a 100%);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#f8fafc;padding:24px;box-sizing:border-box;">
    <div style="max-width:420px;width:100%;text-align:center;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.05);border-radius:24px;padding:40px 32px;">
      <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:3px;color:#67e8f9;text-transform:uppercase;">Crime Radar</p>
      <h1 style="margin:0 0 16px;font-size:22px;color:#ffffff;">${heading}</h1>
      <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:#cbd5e1;">${body}</p>
      <a href="${SITE_URL}/local-alerts" style="display:inline-block;padding:10px 24px;border-radius:999px;border:1px solid rgba(56,189,248,0.3);background:rgba(14,165,233,0.15);color:#a5f3fc;font-size:14px;font-weight:600;text-decoration:none;">Manage alerts</a>
    </div>
  </body>
</html>`;
}

async function handleUnsubscribeLink(request, env) {
  const url = new URL(request.url);
  const result = await performUnsubscribe(url.searchParams, env);
  return html(unsubscribePage(result), result.ok ? 200 : 400);
}

const SENT_PREFIX = 'sent:';
const SENT_TTL_SECONDS = 60 * 60 * 24 * 30;

// Severity is a spectrum, not a yes/no: how far an alert fans out beyond the
// subscriber's own city scales with how serious the headline is (see
// TIER_RADIUS_MILES and runAlertCheck).
//   local     — stays with subscribers of that exact city (today's behavior)
//   regional  — also reaches subscribers within TIER_RADIUS_MILES.regional
//   statewide — reaches every subscriber in that state, regardless of distance
const LOCAL_KEYWORDS = [
  'robbery',
  'robbed',
  'burglary',
  'burglarized',
  'assault',
  'assaulted',
  'armed robbery',
  'carjacking',
  'carjacked',
  'break-in',
  'broke in',
  'shots fired',
  'vandalism',
  'theft',
  'stolen',
  'drive-by',
];

const REGIONAL_KEYWORDS = [
  'shooting',
  'shot dead',
  'gunman',
  'gunfire',
  'killed',
  'kills',
  'killing',
  'murder',
  'homicide',
  'stabbing',
  'stabbed',
  'fatal',
  'hostage',
  'kidnap',
  'abduct',
  'manhunt',
  'standoff',
  'arson',
  'dead body',
  'body found',
  'found dead',
  'decomposition',
  'slain',
  'deceased',
];

const STATEWIDE_KEYWORDS = [
  'mass shooting',
  'bodies found',
  'dead bodies',
  'multiple bodies',
  'active shooter',
  'terrorist',
  'terrorism',
  'bombing',
  'explosion',
  'serial killer',
  'serial killings',
  'serial murders',
  'serial rapist',
  'escaped inmate',
  'prison break',
  'amber alert',
];

const TIER_RADIUS_MILES = { regional: 60 };

function matchesAny(lower, keywords) {
  return keywords.some((kw) => lower.includes(kw));
}

export function getSeverityTier(title) {
  const lower = title.toLowerCase();
  if (matchesAny(lower, STATEWIDE_KEYWORDS)) return 'statewide';
  if (matchesAny(lower, REGIONAL_KEYWORDS)) return 'regional';
  if (matchesAny(lower, LOCAL_KEYWORDS)) return 'local';
  return null;
}

export function haversineMiles(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const EARTH_RADIUS_MILES = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hashBuffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function getSubscribersByLocation(env) {
  const keys = await listAllKeys(env, SUB_PREFIX);
  const locations = new Map();

  for (const k of keys) {
    const raw = await env.VIEWS.get(k.name);
    if (!raw) continue;
    let record;
    try {
      record = JSON.parse(raw);
    } catch {
      continue;
    }
    const locKey = `${record.state.toLowerCase()}:${record.city.toLowerCase()}`;
    if (!locations.has(locKey)) {
      locations.set(locKey, { state: record.state, city: record.city, emails: [], lat: null, lon: null });
    }
    const location = locations.get(locKey);
    location.emails.push(record.email);
    if (location.lat == null && typeof record.lat === 'number' && typeof record.lon === 'number') {
      location.lat = record.lat;
      location.lon = record.lon;
    }
  }

  return [...locations.values()];
}

export function formatArticleDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Table-based layout with everything inlined — the safest baseline for
// rendering consistently across Gmail, Outlook, and Apple Mail, most of
// which strip or mangle <style> blocks and modern CSS. Light theme by
// design: dark-themed HTML email is a known minefield (clients auto-invert
// colors they don't recognize), so this deliberately doesn't try to match
// the app's dark UI.
// `scope` distinguishes why the recipient got this email: 'home' (subscribed
// to the exact city it happened in), 'regional' (nearby city, within
// TIER_RADIUS_MILES.regional), or 'statewide' (same state, any distance).
// `subState`/`subCity` are always the RECIPIENT's own subscription — not the
// incident location — so the unsubscribe link and footer stay correct for
// fan-out recipients who never subscribed to the incident's city.
export function renderAlertEmailHtml({
  incidentState,
  incidentCity,
  subState,
  subCity,
  article,
  unsubscribeUrl,
  scope = 'home',
  distanceMiles = null,
}) {
  const title = escapeHtml(article.title);
  const source = escapeHtml(article.source || '');
  const dateLabel = formatArticleDate(article.pubDate);
  const meta = [source, dateLabel].filter(Boolean).join(' · ');
  const link = escapeHtml(article.link);
  const incidentLabel = `${escapeHtml(incidentCity)}, ${escapeHtml(incidentState)}`;
  const subLabel = `${escapeHtml(subCity)}, ${escapeHtml(subState)}`;

  let eyebrow;
  if (scope === 'statewide') {
    eyebrow = `Statewide alert for ${escapeHtml(incidentState)} &mdash; reported in ${escapeHtml(incidentCity)}`;
  } else if (scope === 'regional') {
    const distanceText = distanceMiles != null ? ` &mdash; ${Math.round(distanceMiles)} mi away` : '';
    eyebrow = `Nearby alert &mdash; reported in ${incidentLabel}${distanceText}`;
  } else {
    eyebrow = `Alert for ${incidentLabel}`;
  }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Crime Radar Alert</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f1f5f9;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">New alert for ${incidentLabel}: ${title}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
            <tr>
              <td style="background-color:#0f172a;padding:24px 32px;">
                <span style="font-size:13px;font-weight:700;letter-spacing:3px;color:#38bdf8;text-transform:uppercase;">Crime Radar</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:1.5px;color:#0ea5e9;text-transform:uppercase;">${eyebrow}</p>
                <h1 style="margin:0 0 16px;font-size:22px;line-height:1.35;color:#0f172a;">${title}</h1>
                ${meta ? `<p style="margin:0 0 24px;font-size:13px;color:#64748b;">${meta}</p>` : ''}
                <a href="${link}" style="display:inline-block;padding:12px 24px;background-color:#0ea5e9;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:999px;">Read the full story &rarr;</a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
                <p style="margin:0;font-size:12px;color:#94a3b8;">You're receiving this because you signed up for crime alerts in ${subLabel} on Crime Radar.</p>
                <p style="margin:8px 0 0;font-size:12px;"><a href="${unsubscribeUrl}" style="color:#64748b;text-decoration:underline;">Unsubscribe from ${subLabel} alerts</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// Sends one email per recipient (not a shared `to` array) for two reasons:
// each recipient's unsubscribe link has to carry their own email address,
// and a shared `to` list would otherwise expose every subscriber's address
// to every other subscriber in that location.
async function sendAlertEmail(env, email, incidentState, incidentCity, article, recipientInfo) {
  const { subState, subCity, scope, distanceMiles } = recipientInfo;
  const unsubscribeUrl = `${API_BASE_URL}/api/unsubscribe?${new URLSearchParams({ email, state: subState, city: subCity })}`;

  const subjectLocation =
    scope === 'statewide'
      ? `${incidentState} (statewide)`
      : scope === 'regional'
        ? `near ${subCity}, ${subState}`
        : `${incidentCity}, ${incidentState}`;

  // A network-level failure here (as opposed to a non-2xx response, which
  // just falls through to `resp.ok`) must not escape as a thrown exception:
  // runAlertCheck calls this once per recipient in a loop across every
  // subscribed location, and an uncaught throw here would abort every
  // remaining location's alerts for that entire cron run, not just this one
  // send.
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Crime Radar Alerts <alerts@mail.platinumsoftwaremn.com>',
        to: [email],
        subject: `Crime Radar alert: ${subjectLocation}`,
        html: renderAlertEmailHtml({
          incidentState,
          incidentCity,
          subState,
          subCity,
          article,
          unsubscribeUrl,
          scope,
          distanceMiles,
        }),
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    // Status (or the network-error message) is returned rather than just a
    // boolean, specifically so a location where every send fails logs *why*
    // (e.g. a 401 across the board means the Resend key is bad) instead of
    // just "send failed" with nothing to act on.
    return { ok: resp.ok, status: resp.status };
  } catch (e) {
    return { ok: false, status: null, error: e.message };
  }
}

async function runAlertCheck(env) {
  const summary = { locations: 0, articlesSeen: 0, significant: 0, sent: 0, errors: [] };
  if (!env.RESEND_API_KEY || !env.GNEWS_API_KEY) {
    summary.errors.push('missing API key(s)');
    return summary;
  }

  const locations = await getSubscribersByLocation(env);
  summary.locations = locations.length;

  for (const home of locations) {
    const { state, city, emails } = home;
    let articles;
    try {
      articles = await fetchNewsArticles(city, env);
    } catch (e) {
      summary.errors.push(`fetch failed for ${city}: ${e.message}`);
      continue;
    }
    summary.articlesSeen += articles.length;

    const tiered = articles
      .map((article) => ({ article, tier: getSeverityTier(article.title) }))
      .filter((entry) => entry.tier);
    summary.significant += tiered.length;

    for (const { article, tier } of tiered) {
      if (!article.link) continue;

      // A KV hiccup on any one article (dedup lookup, dedup write) must not
      // abort the remaining articles for this location, let alone the
      // remaining locations in this cron run — so each article gets its own
      // error boundary, same as the per-recipient send failures below.
      try {
        const hash = await sha256Hex(article.link);
        const sentKey = `${SENT_PREFIX}${state.toLowerCase()}:${city.toLowerCase()}:${hash}`;
        const alreadySent = await env.VIEWS.get(sentKey);
        if (alreadySent) continue;

        // Always the home city's own subscribers, plus (for regional/statewide
        // tiers) other same-state subscribers within the tier's reach.
        const recipients = new Map();
        for (const email of emails) {
          recipients.set(email, { scope: 'home', distanceMiles: 0, subState: state, subCity: city });
        }

        if (tier !== 'local') {
          for (const other of locations) {
            if (other === home) continue;
            if (other.state.toLowerCase() !== state.toLowerCase()) continue;

            let distanceMiles = null;
            if (home.lat != null && home.lon != null && other.lat != null && other.lon != null) {
              distanceMiles = haversineMiles(home.lat, home.lon, other.lat, other.lon);
            }

            const included =
              tier === 'statewide' ? true : distanceMiles != null && distanceMiles <= TIER_RADIUS_MILES.regional;
            if (!included) continue;

            for (const email of other.emails) {
              if (!recipients.has(email)) {
                recipients.set(email, { scope: tier, distanceMiles, subState: other.state, subCity: other.city });
              }
            }
          }
        }

        let successCount = 0;
        const failureReasons = [];
        for (const [email, info] of recipients) {
          const result = await sendAlertEmail(env, email, state, city, article, info);
          if (result.ok) successCount += 1;
          else failureReasons.push(result.status ?? result.error ?? 'unknown');
        }

        if (successCount > 0) {
          summary.sent += successCount;
          await env.VIEWS.put(sentKey, '1', { expirationTtl: SENT_TTL_SECONDS });
        } else {
          summary.errors.push(
            `send failed for ${article.title} (${recipients.size} recipient(s), reasons: ${failureReasons.join(', ')})`
          );
        }
      } catch (e) {
        summary.errors.push(`processing failed for ${article.title}: ${e.message}`);
      }
    }
  }
  return summary;
}

async function resetWeeklyCounts(env) {
  const keys = await listAllKeys(env, WEEKLY_PREFIX);
  const snapshot = {};
  for (const k of keys) {
    const slug = k.name.slice(WEEKLY_PREFIX.length);
    snapshot[slug] = Number((await env.VIEWS.get(k.name)) || '0');
  }

  const now = new Date().toISOString();
  // expirationTtl so this doesn't grow forever: nothing in the codebase
  // reads these back programmatically (they're a manually-inspectable
  // historical log, e.g. via `wrangler kv key list`), so a runaway key
  // count would go unnoticed indefinitely otherwise.
  await env.VIEWS.put(`${ARCHIVE_PREFIX}${now}`, JSON.stringify(snapshot), { expirationTtl: ARCHIVE_TTL_SECONDS });

  await Promise.all(keys.map((k) => env.VIEWS.delete(k.name)));
  await env.VIEWS.put(LAST_RESET_KEY, now);
  return { resetCount: keys.length, resetAt: now };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const viewMatch = url.pathname.match(/^\/api\/view\/([a-z-]+)$/);
    if (viewMatch && request.method === 'POST') {
      return handleView(viewMatch[1], env, request);
    }

    if (url.pathname === '/api/views' && request.method === 'GET') {
      return handleAllViews(env);
    }

    if (url.pathname === '/api/trending' && request.method === 'GET') {
      return handleTrending(env);
    }

    if (url.pathname === '/api/meta' && request.method === 'GET') {
      return handleMeta(env);
    }

    if (url.pathname === '/api/news' && request.method === 'GET') {
      return handleNews(request, env, ctx);
    }

    if (url.pathname === '/api/subscribe' && request.method === 'POST') {
      return handleSubscribe(request, env);
    }

    if (url.pathname === '/api/subscribe/confirm' && request.method === 'GET') {
      return handleConfirmSubscribe(request, env);
    }

    if (url.pathname === '/api/subscribe' && request.method === 'DELETE') {
      return handleUnsubscribe(request, env);
    }

    if (url.pathname === '/api/unsubscribe' && request.method === 'GET') {
      return handleUnsubscribeLink(request, env);
    }

    return json({ error: 'not found' }, 404);
  },

  // Both cron jobs used to run via a bare `ctx.waitUntil(fn(env))`, discarding
  // whatever they returned. runAlertCheck in particular builds a detailed
  // summary every day -- locations checked, articles seen, alerts sent, and
  // any errors -- specifically so a partial failure doesn't have to crash to
  // be visible. Without logging it, that summary went nowhere: a day where
  // the alert check silently sent zero emails (missing API key, every fetch
  // failing, etc.) would leave no signal anywhere that anything was wrong.
  // console.log here is what Cloudflare's dashboard Logs/tail actually
  // captures for a scheduled Worker.
  async scheduled(event, env, ctx) {
    if (event.cron === '0 0 * * SUN') {
      ctx.waitUntil(resetWeeklyCounts(env).then((summary) => console.log('resetWeeklyCounts', JSON.stringify(summary))));
    } else {
      ctx.waitUntil(runAlertCheck(env).then((summary) => console.log('runAlertCheck', JSON.stringify(summary))));
    }
  },
};
