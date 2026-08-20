import { useEffect } from 'react';
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from '../config/site';

function upsertMeta(attrName, attrValue, content) {
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// Sets the document title plus meta description / Open Graph / Twitter Card
// tags / canonical link for the current page. Every route mounts exactly one
// page component, so there's always a next page to overwrite these when
// this one unmounts — only the title restores its previous value (matching
// the old useDocumentTitle behavior, for the brief window between routes).
export default function usePageMeta({ title, description, path, image, noindex = false } = {}) {
  useEffect(() => {
    const previousTitle = document.title;
    const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
    const desc = description || DEFAULT_DESCRIPTION;
    const url = `${SITE_URL}${path || ''}`;
    const imageUrl = `${SITE_URL}${image || '/og/default.png'}`;

    document.title = fullTitle;
    upsertMeta('name', 'description', desc);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:image:width', '1200');
    upsertMeta('property', 'og:image:height', '630');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:image', imageUrl);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertCanonical(url);

    return () => {
      document.title = previousTitle;
    };
  }, [title, description, path, image, noindex]);
}
