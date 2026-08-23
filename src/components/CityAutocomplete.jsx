import { useEffect, useRef, useState } from 'react';
import cityService from '../services/cityService';

const DEFAULT_INPUT_CLASSNAME =
  'w-full rounded-full border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20';

export default function CityAutocomplete({
  value,
  onChange,
  stateDisplayName,
  placeholder = 'City',
  ariaLabel = 'City',
  id = 'city',
  className = '',
  inputClassName = DEFAULT_INPUT_CLASSNAME,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (!stateDisplayName || trimmed.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return undefined;
    }

    let cancelled = false;
    debounceRef.current = setTimeout(async () => {
      const results = await cityService.searchCities(trimmed, stateDisplayName);
      if (cancelled) return;
      setSuggestions(results);
      setOpen(results.length > 0);
      setActiveIndex(-1);
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(debounceRef.current);
    };
  }, [value, stateDisplayName]);

  const handleSelect = (name) => {
    onChange(name);
    setSuggestions([]);
    setOpen(false);
  };

  const onKeyDown = (event) => {
    if (!open) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      if (activeIndex >= 0) {
        event.preventDefault();
        handleSelect(suggestions[activeIndex]);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const listId = `${id}-suggestions`;

  return (
    <div className={`relative ${className}`}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        required
        aria-label={ariaLabel}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open && isFocused}
        aria-haspopup="listbox"
        autoComplete="off"
        className={inputClassName}
      />
      {open && isFocused && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-2 max-h-48 overflow-auto rounded-2xl border border-white/10 bg-slate-900/95 p-2 text-left shadow-xl backdrop-blur-xl"
        >
          {suggestions.map((name, idx) => (
            <li
              key={name}
              role="option"
              aria-selected={activeIndex === idx}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(name)}
              className={`cursor-pointer rounded-xl px-3 py-2 text-sm transition ${
                activeIndex === idx ? 'bg-cyan-500/20 text-white' : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
