const API_BASE = import.meta.env.VITE_API_URL || 'https://crime-radar-api.crimeradar.workers.dev';

export async function getLocalNews(city, state) {
  const params = new URLSearchParams({ city, state });
  const res = await fetch(`${API_BASE}/api/news?${params.toString()}`);
  if (!res.ok) {
    throw new Error('news fetch failed');
  }
  return res.json();
}
