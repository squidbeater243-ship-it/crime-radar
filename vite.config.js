import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Default injection is a plain synchronous <script src="/registerSW.js">
      // in <head>, which blocks HTML parsing to fetch+run 542 bytes that only
      // register a service worker — defer it so it can't hold up first paint.
      injectRegister: 'script-defer',
      // We already ship public/manifest.webmanifest and its <link> tag by
      // hand — disable the plugin's own manifest generation so there's
      // exactly one source of truth for it, not two competing ones.
      manifest: false,
      includeAssets: ['icons/*.png', 'robots.txt'],
      workbox: {
        // Precache only the app shell's code, not the 54 prerendered HTML
        // routes or the ~18MB of per-state OG images — those are handled
        // by the runtime caching rules below instead, on demand.
        globPatterns: ['**/*.{js,css}'],
        // We ship a real prerendered HTML file per route, not a single SPA
        // shell — Workbox's default "redirect every navigation miss to
        // index.html" fallback would fight that, so it's disabled.
        navigateFallback: null,
        runtimeCaching: [
          {
            // Page navigations: always prefer a fresh network response;
            // only fall back to a previously cached page when offline or
            // the network is slow, so content doesn't go stale silently.
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/og/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'og-images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://crime-radar-api.crimeradar.workers.dev',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['crimeradar.platinumsoftwaremn.com', '.trycloudflare.com'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});
