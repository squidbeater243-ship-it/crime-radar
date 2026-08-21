import { afterEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import usePageMeta from './usePageMeta';
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from '../config/site';

function metaContent(attrName, attrValue) {
  return document.head.querySelector(`meta[${attrName}="${attrValue}"]`)?.getAttribute('content') ?? null;
}

function canonicalHref() {
  return document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null;
}

function structuredDataEl() {
  return document.getElementById('page-structured-data');
}

// usePageMeta mutates the shared document head, so previous tests' tags
// would otherwise leak into later assertions.
function resetHead() {
  document.title = '';
  document.querySelectorAll('meta[name], meta[property], link[rel="canonical"]').forEach((el) => el.remove());
  structuredDataEl()?.remove();
}

function Harness(props) {
  usePageMeta(props);
  return null;
}

afterEach(() => {
  resetHead();
});

describe('usePageMeta', () => {
  it('falls back to the site name alone when no title is given', () => {
    render(<Harness path="/" />);
    expect(document.title).toBe(SITE_NAME);
  });

  it('appends the site name to a given title', () => {
    render(<Harness title="California" path="/state/california" />);
    expect(document.title).toBe(`California — ${SITE_NAME}`);
  });

  it('uses the default description when none is given, and a custom one when provided', () => {
    render(<Harness path="/" />);
    expect(metaContent('name', 'description')).toBe(DEFAULT_DESCRIPTION);

    resetHead();
    render(<Harness path="/about" description="Custom page description." />);
    expect(metaContent('name', 'description')).toBe('Custom page description.');
  });

  it('builds og:url and the canonical link from SITE_URL + path', () => {
    render(<Harness path="/compare" />);
    expect(metaContent('property', 'og:url')).toBe(`${SITE_URL}/compare`);
    expect(canonicalHref()).toBe(`${SITE_URL}/compare`);
  });

  it('defaults og:image to the site-wide default image', () => {
    render(<Harness path="/" />);
    expect(metaContent('property', 'og:image')).toBe(`${SITE_URL}/og/default.png`);
  });

  it('uses a per-page image when given', () => {
    render(<Harness path="/state/texas" image="/og/texas.png" />);
    expect(metaContent('property', 'og:image')).toBe(`${SITE_URL}/og/texas.png`);
  });

  it('sets robots to index,follow by default and noindex,nofollow when requested', () => {
    render(<Harness path="/" />);
    expect(metaContent('name', 'robots')).toBe('index, follow');

    resetHead();
    render(<Harness path="/state/nowhere" noindex />);
    expect(metaContent('name', 'robots')).toBe('noindex, nofollow');
  });

  it('writes a JSON-LD script tag when structuredData is given, and none when omitted', () => {
    render(<Harness path="/" />);
    expect(structuredDataEl()).toBeNull();

    resetHead();
    const data = { '@context': 'https://schema.org', '@type': 'Dataset', name: 'Test dataset' };
    render(<Harness path="/state/california" structuredData={data} />);
    expect(JSON.parse(structuredDataEl().textContent)).toEqual(data);
  });

  it('reuses the same DOM nodes across an update instead of duplicating tags', () => {
    const { rerender } = render(<Harness path="/" />);
    const canonicalBefore = document.head.querySelector('link[rel="canonical"]');
    const descBefore = document.head.querySelector('meta[name="description"]');

    rerender(<Harness path="/" description="Updated description" />);

    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.head.querySelector('link[rel="canonical"]')).toBe(canonicalBefore);
    expect(document.head.querySelector('meta[name="description"]')).toBe(descBefore);
    expect(metaContent('name', 'description')).toBe('Updated description');
  });

  it('removes a previously-set structured data script once a later page omits it', () => {
    const data = { '@type': 'Dataset' };
    const { rerender } = render(<Harness path="/state/california" structuredData={data} />);
    expect(structuredDataEl()).not.toBeNull();

    rerender(<Harness path="/state/california" structuredData={null} />);
    expect(structuredDataEl()).toBeNull();
  });

  it('restores the previous document title on unmount', () => {
    document.title = 'Some other page';
    const { unmount } = render(<Harness title="California" path="/state/california" />);
    expect(document.title).toBe(`California — ${SITE_NAME}`);

    unmount();
    expect(document.title).toBe('Some other page');
  });
});
