import stateData, { normalizeStateName, stateSlugs } from '../data/stateData';

// Simulated network delay
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function getState(slug) {
  const normalized = normalizeStateName(slug || '');
  await delay(120 + Math.random() * 120);
  return stateData[normalized] || null;
}

export async function searchStates(query) {
  const q = normalizeStateName(query || '');
  if (!q) return stateSlugs.map((s) => ({ slug: s, name: stateData[s].displayName }));
  const matches = stateSlugs
    .map((s) => ({ slug: s, name: stateData[s].displayName }))
    .filter(({ name, slug }) => slug.includes(q) || name.toLowerCase().includes(q));
  await delay(60);
  return matches.slice(0, 8);
}

export default { getState, searchStates };
