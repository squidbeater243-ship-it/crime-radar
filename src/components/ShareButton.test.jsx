import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ShareButton from './ShareButton';

const originalShare = navigator.share;
const originalClipboard = navigator.clipboard;

afterEach(() => {
  vi.restoreAllMocks();
  navigator.share = originalShare;
  navigator.clipboard = originalClipboard;
});

describe('ShareButton (native share available)', () => {
  beforeEach(() => {
    navigator.share = vi.fn().mockResolvedValue(undefined);
    navigator.clipboard = { writeText: vi.fn() };
  });

  it('invokes the native share sheet with the given title/text/url, preferring it over clipboard', async () => {
    render(<ShareButton title="California" text="Check this out" url="https://example.com/state/california" />);
    fireEvent.click(screen.getByRole('button', { name: 'Share this report' }));

    await vi.waitFor(() => expect(navigator.share).toHaveBeenCalledWith({
      title: 'California',
      text: 'Check this out',
      url: 'https://example.com/state/california',
    }));
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it('falls back to window.location.href when no url prop is given', async () => {
    render(<ShareButton title="California" text="Check this out" />);
    fireEvent.click(screen.getByRole('button', { name: 'Share this report' }));

    await vi.waitFor(() => expect(navigator.share).toHaveBeenCalledWith(
      expect.objectContaining({ url: window.location.href })
    ));
  });

  it('does not crash or show "Copied!" when the user dismisses the native share sheet', async () => {
    navigator.share = vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError'));
    render(<ShareButton title="California" text="x" url="https://example.com" />);
    fireEvent.click(screen.getByRole('button', { name: 'Share this report' }));

    await vi.waitFor(() => expect(navigator.share).toHaveBeenCalled());
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
  });
});

describe('ShareButton (no native share -- clipboard fallback)', () => {
  beforeEach(() => {
    navigator.share = undefined;
    navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
  });

  it('copies the url to the clipboard and shows transient "Copied!" feedback', async () => {
    render(<ShareButton title="California" text="x" url="https://example.com/state/california" />);
    fireEvent.click(screen.getByRole('button', { name: 'Share this report' }));

    expect(await screen.findByText('Copied!')).toBeInTheDocument();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/state/california');
  });

  it('reverts to "Share" after the feedback window elapses', async () => {
    vi.useFakeTimers();
    render(<ShareButton title="California" text="x" url="https://example.com" />);
    fireEvent.click(screen.getByRole('button', { name: 'Share this report' }));

    await vi.waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalled());
    await vi.advanceTimersByTimeAsync(0);
    expect(screen.getByText('Copied!')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(2000);
    expect(screen.getByText('Share')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('does not show "Copied!" when the clipboard write is rejected', async () => {
    navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error('permission denied'));
    render(<ShareButton title="California" text="x" url="https://example.com" />);
    fireEvent.click(screen.getByRole('button', { name: 'Share this report' }));

    await vi.waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalled());
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
  });
});
