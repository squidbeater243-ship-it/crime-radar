import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StateDetail from './StateDetail';
import usePageMeta from '../hooks/usePageMeta';

// Spied (not faked) so the real title/meta-tag effect still runs -- only
// the call arguments are inspected, for the memoization regression test
// below.
vi.mock('../hooks/usePageMeta', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, default: vi.fn(actual.default) };
});

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

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

  it('keeps the same structuredData reference across an unrelated re-render', async () => {
    // Regression test: structuredData used to be a fresh object literal on
    // every render, passed straight to usePageMeta -- whose effect keys off
    // referential identity, so an unrelated local re-render (e.g. toggling
    // favorite) reran the whole title/meta-tag/structured-data effect
    // instead of only when the displayed state actually changes.
    renderAt('/state/california');
    await screen.findByRole('heading', { name: 'California' });

    const firstStructuredData = usePageMeta.mock.calls.at(-1)[0].structuredData;
    expect(firstStructuredData).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Add California to favorites' }));

    const secondStructuredData = usePageMeta.mock.calls.at(-1)[0].structuredData;
    expect(secondStructuredData).toBe(firstStructuredData);
  });

  it('renders the violent-crime trend chart with the generic provenance caption for a normal state', async () => {
    renderAt('/state/california');
    expect(await screen.findByText('Violent crime rate, 2018–2024')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Independently sourced from FBI historical data; figures may not align exactly with the snapshot above due to differing collection dates\./
      )
    ).toBeInTheDocument();
  });

  it('renders the Florida-specific caveat instead of the generic caption', async () => {
    renderAt('/state/florida');
    expect(await screen.findByText('Violent crime rate, 2018–2024')).toBeInTheDocument();
    expect(screen.getByText(/FBI-methodology trend; differs from the FDLE figure above\./)).toBeInTheDocument();
  });

  it('renders the Nebraska-specific caveat instead of the generic caption', async () => {
    renderAt('/state/nebraska');
    expect(await screen.findByText('Violent crime rate, 2018–2024')).toBeInTheDocument();
    expect(
      screen.getByText(
        /FBI-methodology trend; this state's snapshot above is sourced from state data flagged as approximate\./
      )
    ).toBeInTheDocument();
  });
});
