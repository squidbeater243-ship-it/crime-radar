import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement ResizeObserver, which Recharts' ResponsiveContainer
// needs to size charts. A no-op stub is enough for tests that only assert on
// surrounding text/markup rather than actual chart pixel dimensions.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
