import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import isPrerendering from './utils/isPrerendering';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Loaded via dynamic import so the Sentry SDK isn't part of the main bundle
// blocking initial render — nothing needs it until an error actually
// happens. Skipped during the build-time prerender crawl (see
// scripts/prerender.js) — otherwise every CI build would report ~53 fake
// "sessions" to Sentry, one per page visited by the headless crawler.
if (!isPrerendering()) {
  const initSentry = () => {
    import('@sentry/react').then((Sentry) => {
      Sentry.init({
        dsn: 'https://75917c9d9e5ba44ae079f314e1315ce7@o4511946163879936.ingest.us.sentry.io/4511946172334080',
      });
    });
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initSentry);
  } else {
    setTimeout(initSentry, 1);
  }
}
