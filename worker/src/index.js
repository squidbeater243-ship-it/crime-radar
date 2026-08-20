const SLUG_PATTERN = /^[a-z-]{2,40}$/;
const WEEKLY_PREFIX = 'weekly:';
const VIEWS_PREFIX = 'views:';
const LAST_RESET_KEY = 'meta:lastReset';
const LOCATION_PATTERN = /^[a-zA-Z0-9 .'-]{1,80}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUB_PREFIX = 'sub:';
const NEWS_CACHE_TTL_SECONDS = 600;

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

async function bump(env, key) {
  const current = Number((await env.VIEWS.get(key)) || '0');
  const next = current + 1;
  await env.VIEWS.put(key, String(next));
  return next;
}

async function handleView(slug, env) {
  if (!SLUG_PATTERN.test(slug)) {
    return json({ error: 'invalid slug' }, 400);
  }
  const [views, weekly] = await Promise.all([
    bump(env, `${VIEWS_PREFIX}${slug}`),
    bump(env, `${WEEKLY_PREFIX}${slug}`),
  ]);
  return json({ slug, views, weekly });
}

async function listCounts(env, prefix) {
  const list = await env.VIEWS.list({ prefix });
  const entries = await Promise.all(
    list.keys.map(async (k) => {
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

async function fetchNewsArticles(city, env) {
  const query = `${city} crime`;
  const apiUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=us&max=10&apikey=${env.GNEWS_API_KEY}`;

  const apiResp = await fetch(apiUrl);
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
      link: article.url || '',
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

function subKey(state, city, email) {
  return `${SUB_PREFIX}${state.toLowerCase()}:${city.toLowerCase()}:${email.toLowerCase()}`;
}

async function handleSubscribe(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid request body' }, 400);
  }

  const email = (body.email || '').trim();
  const state = (body.state || '').trim();
  const city = (body.city || '').trim();

  if (!EMAIL_PATTERN.test(email)) {
    return json({ error: 'invalid email' }, 400);
  }
  if (!LOCATION_PATTERN.test(city) || !LOCATION_PATTERN.test(state)) {
    return json({ error: 'invalid city or state' }, 400);
  }

  const record = { email: email.toLowerCase(), state, city, subscribedAt: new Date().toISOString() };
  await env.VIEWS.put(subKey(state, city, email), JSON.stringify(record));

  return json({ success: true });
}

async function handleUnsubscribe(request, env) {
  const url = new URL(request.url);
  const email = (url.searchParams.get('email') || '').trim();
  const state = (url.searchParams.get('state') || '').trim();
  const city = (url.searchParams.get('city') || '').trim();

  if (!EMAIL_PATTERN.test(email) || !LOCATION_PATTERN.test(city) || !LOCATION_PATTERN.test(state)) {
    return json({ error: 'invalid request' }, 400);
  }

  await env.VIEWS.delete(subKey(state, city, email));
  return json({ success: true });
}

const SENT_PREFIX = 'sent:';
const SENT_TTL_SECONDS = 60 * 60 * 24 * 30;

const SEVERITY_KEYWORDS = [
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
  'explosion',
  'bombing',
  'kidnap',
  'abduct',
  'mass shooting',
  'manhunt',
  'standoff',
  'arson',
  'dead body',
  'dead bodies',
  'bodies found',
  'body found',
  'found dead',
  'bodies',
  'decomposition',
  'slain',
  'deceased',
];

function isSignificant(title) {
  const lower = title.toLowerCase();
  return SEVERITY_KEYWORDS.some((kw) => lower.includes(kw));
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hashBuffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function getSubscribersByLocation(env) {
  const list = await env.VIEWS.list({ prefix: SUB_PREFIX });
  const locations = new Map();

  for (const k of list.keys) {
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
      locations.set(locKey, { state: record.state, city: record.city, emails: [] });
    }
    locations.get(locKey).emails.push(record.email);
  }

  return [...locations.values()];
}

async function sendAlertEmail(env, emails, state, city, article) {
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Crime Radar Alerts <alerts@mail.platinumsoftwaremn.com>',
      to: emails,
      subject: `Crime Radar alert: ${city}, ${state}`,
      html: `<p><strong>${article.title}</strong></p><p>${article.source ? `${article.source} · ` : ''}${article.pubDate}</p><p><a href="${article.link}">Read the full story</a></p><p style="color:#94a3b8;font-size:12px;">You're receiving this because you signed up for crime alerts in ${city}, ${state} on Crime Radar.</p>`,
    }),
  });
  return resp.ok;
}

async function runAlertCheck(env) {
  const summary = { locations: 0, articlesSeen: 0, significant: 0, sent: 0, errors: [] };
  if (!env.RESEND_API_KEY || !env.GNEWS_API_KEY) {
    summary.errors.push('missing API key(s)');
    return summary;
  }

  const locations = await getSubscribersByLocation(env);
  summary.locations = locations.length;

  for (const { state, city, emails } of locations) {
    let articles;
    try {
      articles = await fetchNewsArticles(city, env);
    } catch (e) {
      summary.errors.push(`fetch failed for ${city}: ${e.message}`);
      continue;
    }
    summary.articlesSeen += articles.length;

    const significant = articles.filter((a) => isSignificant(a.title));
    summary.significant += significant.length;

    for (const article of significant) {
      if (!article.link) continue;
      const hash = await sha256Hex(article.link);
      const sentKey = `${SENT_PREFIX}${state.toLowerCase()}:${city.toLowerCase()}:${hash}`;
      const alreadySent = await env.VIEWS.get(sentKey);
      if (alreadySent) continue;

      const ok = await sendAlertEmail(env, emails, state, city, article);
      if (ok) {
        summary.sent += 1;
        await env.VIEWS.put(sentKey, '1', { expirationTtl: SENT_TTL_SECONDS });
      } else {
        summary.errors.push(`send failed for ${article.title}`);
      }
    }
  }
  return summary;
}

async function resetWeeklyCounts(env) {
  const list = await env.VIEWS.list({ prefix: WEEKLY_PREFIX });
  const snapshot = {};
  for (const k of list.keys) {
    const slug = k.name.slice(WEEKLY_PREFIX.length);
    snapshot[slug] = Number((await env.VIEWS.get(k.name)) || '0');
  }

  const now = new Date().toISOString();
  await env.VIEWS.put(`archive:${now}`, JSON.stringify(snapshot));

  await Promise.all(list.keys.map((k) => env.VIEWS.delete(k.name)));
  await env.VIEWS.put(LAST_RESET_KEY, now);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const viewMatch = url.pathname.match(/^\/api\/view\/([a-z-]+)$/);
    if (viewMatch && request.method === 'POST') {
      return handleView(viewMatch[1], env);
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

    if (url.pathname === '/api/subscribe' && request.method === 'DELETE') {
      return handleUnsubscribe(request, env);
    }

    return json({ error: 'not found' }, 404);
  },

  async scheduled(event, env, ctx) {
    if (event.cron === '0 0 * * SUN') {
      ctx.waitUntil(resetWeeklyCounts(env));
    } else {
      ctx.waitUntil(runAlertCheck(env));
    }
  },
};
