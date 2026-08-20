// Runs after `vite build` (see the `postbuild` script in package.json).
// Serves the freshly built dist/ folder, visits every real route in a
// headless browser, and overwrites each route's HTML with the fully
// rendered snapshot. This is a static-content snapshot, not real SSR —
// main.jsx does a plain createRoot().render() rather than hydrateRoot(),
// so the client bundle just re-renders over the snapshot on load. The
// point is that crawlers and social-link previews that don't execute JS
// (most of them besides Googlebot) see real content instead of an empty
// <div id="root">.
import { preview } from 'vite';
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stateSlugs } from '../src/data/stateData.js';

// vite preview (and Vercel) resolve extensionless paths as clean URLs —
// `/state/california` -> `/state/california.html` — but do NOT do
// directory-index resolution (`/state/california` -> `.../index.html`)
// without a trailing slash. Writing flat `<route>.html` files is what
// actually gets served for the app's real (no-trailing-slash) routes.
function outputPathFor(route, distDir) {
  if (route === '/') return join(distDir, 'index.html');
  return join(distDir, `${route}.html`);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');

const STATIC_ROUTES = ['/', '/compare', '/overview', '/local-alerts'];
const routes = [...STATIC_ROUTES, ...stateSlugs.map((slug) => `/state/${slug}`)];

async function main() {
  const server = await preview({ preview: { port: 4174, host: '127.0.0.1', open: false } });
  const base = server.resolvedUrls.local[0];
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Tells the app (StateDetail's view-count effect) that this visit is a
  // build-time crawl, not a real reader — so it doesn't fire a real POST
  // to the live view-counter API for every one of the 50 state pages.
  await page.addInitScript(() => {
    window.__PRERENDERING__ = true;
  });

  let done = 0;
  for (const route of routes) {
    const url = new URL(route, base).toString();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    // Both the route-level Suspense fallback and StateDetail's chart
    // skeleton use these classes — wait for both to clear so the snapshot
    // has real content, not a spinner.
    await page.waitForFunction(() => !document.querySelector('.animate-spin, .animate-pulse'), { timeout: 20000 });
    await page.waitForTimeout(200);

    const html = await page.content();
    const outPath = outputPathFor(route, DIST_DIR);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    done += 1;
  }

  await browser.close();
  await new Promise((resolve, reject) => {
    server.httpServer.close((err) => (err ? reject(err) : resolve()));
  });

  console.log(`Prerendered ${done}/${routes.length} routes.`);
}

main().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
