import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SavedAreas from './SavedAreas';
import prefsService from '../services/prefsService';

beforeEach(() => {
  localStorage.clear();
});

describe('SavedAreas', () => {
  it('renders nothing when there are no saved areas', () => {
    const { container } = render(<SavedAreas onSelect={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('lists each saved area as a pill', () => {
    prefsService.toggleSavedArea('texas', 'Austin', 'Texas');
    prefsService.toggleSavedArea('california', 'Los Angeles', 'California');
    render(<SavedAreas onSelect={() => {}} />);

    expect(screen.getByRole('button', { name: 'Austin, Texas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Los Angeles, California' })).toBeInTheDocument();
  });

  it('calls onSelect with the area when a pill is clicked', () => {
    prefsService.toggleSavedArea('texas', 'Austin', 'Texas');
    const onSelect = vi.fn();
    render(<SavedAreas onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'Austin, Texas' }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ state: 'texas', city: 'Austin' }));
  });

  it('removes an area when its remove button is clicked', () => {
    prefsService.toggleSavedArea('texas', 'Austin', 'Texas');
    render(<SavedAreas onSelect={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: 'Remove Austin, Texas from saved areas' }));
    expect(screen.queryByRole('button', { name: 'Austin, Texas' })).not.toBeInTheDocument();
    expect(prefsService.isAreaSaved('texas', 'Austin')).toBe(false);
  });
});
