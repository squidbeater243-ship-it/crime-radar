const API_BASE = import.meta.env.VITE_API_URL || 'https://crime-radar-api.crimeradar.workers.dev';

export async function recordView(slug) {
  try {
    const res = await fetch(`${API_BASE}/api/view/${encodeURIComponent(slug)}`, { method: 'POST' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getAllViews() {
  try {
    const res = await fetch(`${API_BASE}/api/views`);
    if (!res.ok) return {};
    const data = await res.json();
    return data.views || {};
  } catch {
    return {};
  }
}

export async function getTrending() {
  try {
    const res = await fetch(`${API_BASE}/api/trending`);
    if (!res.ok) return {};
    const data = await res.json();
    return data.trending || {};
  } catch {
    return {};
  }
}

export async function getMeta() {
  try {
    const res = await fetch(`${API_BASE}/api/meta`);
    if (!res.ok) return { lastReset: null };
    return await res.json();
  } catch {
    return { lastReset: null };
  }
}
