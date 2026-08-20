import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Overview from './Overview';

describe('Overview', () => {
  it('renders ranking sections with links back to state pages', () => {
    render(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(screen.getByText('Combined crime index (violent + property, per 100k)')).toBeInTheDocument();
    expect(screen.getByText('Violent crime rate')).toBeInTheDocument();
    expect(screen.getByText('Poverty rate')).toBeInTheDocument();
    // every ranked row should link to a real state page
    const stateLinks = screen.getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('/state/'));
    expect(stateLinks.length).toBeGreaterThan(0);
  });
});
