import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import { getLocalNews } from '../services/newsService';

vi.mock('../services/newsService', () => ({
  getLocalNews: vi.fn(),
}));

// Auto-correct is exercised in cityService.test.js -- here it's a no-op
// passthrough so scan submissions resolve the city they were given.
vi.mock('../services/cityService', () => ({
  default: {
    autoCorrectCity: vi.fn((city) => Promise.resolve(city)),
    searchCities: vi.fn(() => Promise.resolve([])),
  },
}));

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

function submitScan(stateSlug, city) {
  fireEvent.change(screen.getByLabelText('State'), { target: { value: stateSlug } });
  fireEvent.change(screen.getByLabelText('City'), { target: { value: city } });
  fireEvent.click(screen.getByRole('button', { name: /scan this area/i }));
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('HomePage', () => {
  it('shows the idle prompt before any scan is submitted', () => {
    renderHome();
    expect(screen.getByText(/Enter a state and city above to scan the area/)).toBeInTheDocument();
  });

  it('scans a location and shows results plus the state safety grade', async () => {
    getLocalNews.mockResolvedValue({
      items: [{ title: 'Test headline', link: 'https://example.com/a', source: 'Test Source', pubDate: '2026-01-01' }],
    });
    renderHome();
    submitScan('texas', 'Austin');

    expect(await screen.findByText('Test headline')).toBeInTheDocument();
    expect(screen.getByText('Austin, Texas')).toBeInTheDocument();
    expect(screen.getByTitle(/Safety score/)).toBeInTheDocument();
  });

  it('shows an empty-state message when no headlines are found', async () => {
    getLocalNews.mockResolvedValue({ items: [] });
    renderHome();
    submitScan('texas', 'Austin');

    expect(await screen.findByText(/No recent safety-relevant headlines/)).toBeInTheDocument();
  });

  it('shows an error message when the news fetch fails', async () => {
    getLocalNews.mockRejectedValue(new Error('network error'));
    renderHome();
    submitScan('texas', 'Austin');

    expect(await screen.findByText(/Couldn.t reach the news feed/)).toBeInTheDocument();
  });

  it('saves and unsaves the scanned area', async () => {
    getLocalNews.mockResolvedValue({ items: [] });
    renderHome();
    submitScan('texas', 'Austin');
    await screen.findByText(/No recent safety-relevant headlines/);

    fireEvent.click(screen.getByRole('button', { name: 'Save this area' }));
    expect(screen.getByRole('button', { name: 'Remove this area from saved areas' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove this area from saved areas' }));
    expect(screen.getByRole('button', { name: 'Save this area' })).toBeInTheDocument();
  });

  it('offers a previously saved area as a one-click pill that re-runs the scan', async () => {
    getLocalNews.mockResolvedValue({ items: [] });
    const first = renderHome();
    submitScan('texas', 'Austin');
    await screen.findByText(/No recent safety-relevant headlines/);
    fireEvent.click(screen.getByRole('button', { name: 'Save this area' }));
    first.unmount();

    // Fresh render (simulating a new visit) — the saved area should appear
    // as a selectable pill without having to type it in again.
    getLocalNews.mockClear();
    renderHome();
    const pill = await screen.findByRole('button', { name: 'Austin, Texas' });
    fireEvent.click(pill);

    await waitFor(() => expect(getLocalNews).toHaveBeenCalledWith('Austin', 'Texas'));
  });
});
