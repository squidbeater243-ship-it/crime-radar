import js from '@eslint/js';
import globals from 'globals';

// This worker runs on Cloudflare's Workers runtime, which implements the
// Service Worker API surface (caches, crypto.subtle, fetch, Request/
// Response, etc.) -- not a browser (no `window`/DOM) and not Node (no
// `require`/`process`). `globals.serviceworker` matches that runtime, unlike
// the root project's `eslint.config.js` (browser + React), which this file
// was previously borrowed from by directory-walking resolution -- worker/
// has no eslint of its own until now, so worker code was never actually
// linted against rules that match what it runs on.
export default [
  { ignores: ['.wrangler/**', 'node_modules/**', 'coverage/**'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.serviceworker,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },
];
