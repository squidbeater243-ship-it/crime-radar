// Screenshots the /og/:slug route (see src/pages/OgCard.jsx) for every state
// plus a site-wide default, saving 1200x630 PNGs into public/og/. Those get
// referenced as og:image/twitter:image by usePageMeta.
//
// Deliberately NOT wired into the build lifecycle (unlike sitemap/prerender)
// — state data changes rarely, and screenshotting 51 images adds real time
// to every build for something that's usually unchanged. Run manually via
// `npm run og-images` (after `npm run build`, so dist/ has the /og/ routes)
// whenever state data actually changes.
import { preview } from 'vite';
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stateSlugs } from '../src/data/stateData.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_OG_DIR = join(__dirname, '..', 'public', 'og');

async function main() {
  const server = await preview({ preview: { port: 4175, host: '127.0.0.1', open: false } });
  const base = server.resolvedUrls.local[0];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

  // Same reasoning as scripts/prerender.js: don't let a headless crawl fire
  // real requests against Google's ad network on every run.
  await page.route(/googlesyndication\.com|doubleclick\.net|googleadservices\.com/, (route) => route.abort());

  mkdirSync(PUBLIC_OG_DIR, { recursive: true });

  const targets = ['default', ...stateSlugs];
  for (const slug of targets) {
    const url = new URL(`/og/${slug}`, base).toString();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(200);
    await page.screenshot({ path: join(PUBLIC_OG_DIR, `${slug}.png`) });
  }

  await browser.close();
  await new Promise((resolve, reject) => {
    server.httpServer.close((err) => (err ? reject(err) : resolve()));
  });

  console.log(`Generated ${targets.length} OG images in public/og/`);
}

main().catch((err) => {
  console.error('OG image generation failed:', err);
  process.exit(1);
});
