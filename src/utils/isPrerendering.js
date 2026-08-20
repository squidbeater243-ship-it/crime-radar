// The build-time prerender script (scripts/prerender.js) sets this flag
// before visiting each route in a headless browser. Code with real external
// side effects (e.g. recording a page view) checks this so a build doesn't
// silently generate fake traffic against the live API.
export default function isPrerendering() {
  return typeof window !== 'undefined' && window.__PRERENDERING__ === true;
}
