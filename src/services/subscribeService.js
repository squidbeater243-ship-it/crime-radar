const API_BASE = import.meta.env.VITE_API_URL || 'https://crime-radar-api.crimeradar.workers.dev';

export async function subscribe(email, state, city) {
  const res = await fetch(`${API_BASE}/api/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, state, city }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'subscribe failed');
  }
  return data;
}

export async function unsubscribe(email, state, city) {
  const params = new URLSearchParams({ email, state, city });
  const res = await fetch(`${API_BASE}/api/subscribe?${params.toString()}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error('unsubscribe failed');
  }
  return res.json();
}
