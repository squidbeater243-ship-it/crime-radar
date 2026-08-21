import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StateStatistics from './StateStatistics';

// UsMap fetches real geography data from a CDN and renders an interactive
// SVG map — neither is relevant to what this page-level test is checking,
// so it's stubbed out to keep this fast and network-independent.
vi.mock('../components/UsMap', () => ({
  default: () => <div data-testid="us-map-stub" />,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <StateStatistics />
    </MemoryRouter>
  );
}

describe('StateStatistics', () => {
  it('renders the search bar and featured state links', () => {
    renderPage();
    expect(screen.getByPlaceholderText('Type a state name and press enter')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'California' })).toHaveAttribute('href', '/state/california');
    expect(screen.getByRole('link', { name: 'Texas' })).toHaveAttribute('href', '/state/texas');
    expect(screen.getByRole('link', { name: 'Florida' })).toHaveAttribute('href', '/state/florida');
  });

  it('links to the merged Compare & rankings page', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /compare & rankings/i })).toHaveAttribute('href', '/compare');
  });

  it('renders the map once its lazy chunk resolves', async () => {
    renderPage();
    expect(await screen.findByTestId('us-map-stub')).toBeInTheDocument();
  });
});
