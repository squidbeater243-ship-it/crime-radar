import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ComparePage from './ComparePage';

describe('ComparePage', () => {
  it('defaults to the combined-index ranking tab with links back to state pages', () => {
    render(
      <MemoryRouter>
        <ComparePage />
      </MemoryRouter>
    );
    expect(screen.getByRole('tab', { name: 'Combined Index' })).toHaveAttribute('aria-selected', 'true');
    const stateLinks = screen.getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('/state/'));
    expect(stateLinks.length).toBeGreaterThan(0);
  });

  it('switches ranking categories when a different tab is clicked', () => {
    render(
      <MemoryRouter>
        <ComparePage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Violent Crime' }));
    expect(screen.getByRole('tab', { name: 'Violent Crime' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Combined Index' })).toHaveAttribute('aria-selected', 'false');
  });
});
