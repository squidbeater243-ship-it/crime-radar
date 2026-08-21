// Regenerates public/sitemap.xml from the real route list so it can't drift
// out of sync with the app (e.g. a state added to stateData.js is
// automatically included). Runs as a `prebuild` step — see package.json.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { stateSlugs } from '../src/data/stateData.js';
import { SITE_URL } from '../src/config/site.js';

const STATIC_ROUTES = ['/', '/state-statistics', '/compare', '/about'];
const routes = [...STATIC_ROUTES, ...stateSlugs.map((slug) => `/state/${slug}`)];

const urls = routes
  .map((route) => `  <url>\n    <loc>${SITE_URL}${route}</loc>\n  </url>`)
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

const outPath = fileURLToPath(new URL('../public/sitemap.xml', import.meta.url));
writeFileSync(outPath, xml);
console.log(`sitemap.xml written with ${routes.length} routes`);
