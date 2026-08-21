import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import About from './About';

vi.mock('../hooks/usePageMeta', () => ({ default: vi.fn() }));

describe('About', () => {
  it('renders the methodology sections and a link back home', () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    );
    expect(screen.getByText('Where the data comes from')).toBeInTheDocument();
    expect(screen.getByText('How the safety grade (A–F) works')).toBeInTheDocument();
    expect(screen.getByText('What Area Scan actually does')).toBeInTheDocument();
    expect(screen.getByText('How this site sustains itself')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });
});
