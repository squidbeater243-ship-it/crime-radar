import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as Sentry from '@sentry/react';
import ErrorBoundary from './ErrorBoundary';

vi.mock('@sentry/react', () => ({ captureException: vi.fn() }));

function Bomb() {
  throw new Error('kaboom');
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ErrorBoundary', () => {
  it('renders children normally when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders the fallback UI with the error message once a child throws', () => {
    // React logs the error to the console by default when a boundary catches
    // it -- expected noise for this test, not a real failure.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText('This page hit an unexpected error')).toBeInTheDocument();
    expect(screen.getByText('kaboom')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back home' })).toHaveAttribute('href', '/');
  });

  it('reports the caught error to Sentry', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error), expect.objectContaining({ extra: expect.any(Object) }));
    expect(Sentry.captureException.mock.calls[0][0].message).toBe('kaboom');
  });
});
