import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StateDetail from './StateDetail';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/state/:stateName" element={<StateDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('StateDetail', () => {
  it('renders a verified state with real crime-rate data, then loads the chart panel', async () => {
    renderAt('/state/california');
    expect(await screen.findByRole('heading', { name: 'California' })).toBeInTheDocument();
    expect(screen.getByText('Verified with FBI/Census data')).toBeInTheDocument();
    // chart content should replace the loading skeleton once the simulated fetch resolves
    expect(await screen.findByText('Reported incidents')).toBeInTheDocument();
  });

  it('renders a state whose crime data year differs from its poverty data year', async () => {
    renderAt('/state/nevada');
    expect(await screen.findByRole('heading', { name: 'Nevada' })).toBeInTheDocument();
    expect(screen.getByText('Verified with FBI/Census data')).toBeInTheDocument();
    expect(await screen.findByText('Reported incidents')).toBeInTheDocument();
  });

  it('shows the "not found" panel for an unknown slug instead of crashing', async () => {
    renderAt('/state/nowhereland');
    expect(await screen.findByText(/No data available for/)).toBeInTheDocument();
  });
});
