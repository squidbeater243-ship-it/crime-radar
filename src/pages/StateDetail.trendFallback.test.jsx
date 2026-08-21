import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StateDetail from './StateDetail';

vi.mock('../data/stateTrendData', () => ({ default: {} }));

describe('StateDetail (trend data missing)', () => {
  it('renders the rest of the page without crashing when a state has no trend entry', async () => {
    render(
      <MemoryRouter initialEntries={['/state/california']}>
        <Routes>
          <Route path="/state/:stateName" element={<StateDetail />} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByRole('heading', { name: 'California' })).toBeInTheDocument();
    expect(await screen.findByText('Reported incidents')).toBeInTheDocument();
    expect(screen.queryByText('Violent crime rate, 2018–2024')).not.toBeInTheDocument();
  });
});
