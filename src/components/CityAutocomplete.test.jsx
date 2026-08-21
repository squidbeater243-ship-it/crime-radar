import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import CityAutocomplete from './CityAutocomplete';
import cityService from '../services/cityService';

vi.mock('../services/cityService', () => ({
  default: { searchCities: vi.fn() },
}));

function ControlledCityAutocomplete({ initialValue = '', onChange }) {
  const [value, setValue] = useState(initialValue);
  return (
    <CityAutocomplete
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      stateDisplayName="Minnesota"
    />
  );
}

describe('CityAutocomplete', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    cityService.searchCities.mockResolvedValue(['Minneapolis', 'Minnetonka']);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('does not query until at least 2 characters are typed', async () => {
    render(<ControlledCityAutocomplete />);
    fireEvent.change(screen.getByRole('textbox', { name: 'City' }), { target: { value: 'M' } });
    await act(async () => {
      vi.advanceTimersByTime(400);
      await Promise.resolve();
    });
    expect(cityService.searchCities).not.toHaveBeenCalled();
  });

  it('shows debounced suggestions after typing and lets you pick one', async () => {
    const handleChange = vi.fn();
    render(<ControlledCityAutocomplete initialValue="Minn" onChange={handleChange} />);

    const input = screen.getByRole('textbox', { name: 'City' });
    fireEvent.focus(input);
    await act(async () => {
      vi.advanceTimersByTime(400);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByRole('option', { name: 'Minneapolis' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: 'Minneapolis' }));
    expect(handleChange).toHaveBeenCalledWith('Minneapolis');
  });

  it('navigates and selects a suggestion with the keyboard', async () => {
    const handleChange = vi.fn();
    render(<ControlledCityAutocomplete initialValue="Minn" onChange={handleChange} />);

    const input = screen.getByRole('textbox', { name: 'City' });
    fireEvent.focus(input);
    await act(async () => {
      vi.advanceTimersByTime(400);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByRole('option', { name: 'Minneapolis' })).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleChange).toHaveBeenCalledWith('Minneapolis');
  });
});
