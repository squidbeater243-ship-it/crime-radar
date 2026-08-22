import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchStates } from '../services/dataService';
import prefsService from '../services/prefsService';
import stateData from '../data/stateData';
import { normalizeStateName } from '../data/stateData';
import { playTick } from '../utils/sounds';

export default function GlassSearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!query.trim()) {
        // show recent searches when query is empty
        const prefs = prefsService.loadPrefs();
        const recent = (prefs.recent || []).map((slug) => ({ slug, name: stateData[slug]?.displayName || slug }));
        setSuggestions(recent);
        setOpen(recent.length > 0);
        setActiveIndex(-1);
        return;
      }
      const items = await searchStates(query);
      if (!mounted) return;
      setSuggestions(items);
      setOpen(true);
      setActiveIndex(-1);
    })();
    return () => (mounted = false);
  }, [query]);

  const handleSelect = (slug) => {
    playTick();
    setOpen(false);
    setQuery('');
    prefsService.addRecent(slug);
    navigate(`/state/${encodeURIComponent(slug)}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      handleSelect(suggestions[activeIndex].slug);
      return;
    }
    const value = query.trim();
    if (!value && suggestions.length === 1) {
      handleSelect(suggestions[0].slug);
      return;
    }
    const normalized = normalizeStateName(value);
    handleSelect(normalized);
  };

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex].slug);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl rounded-full border border-white/20 bg-white/10 p-2 shadow-[0_0_70px_rgba(59,130,246,0.18)] backdrop-blur-xl" role="search" aria-label="Search states">
      <div className="relative">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/70 px-4 py-3 sm:px-5 sm:py-4">
          <Search className="h-5 w-5 shrink-0 text-slate-300" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            role="combobox"
            aria-autocomplete="list"
            aria-controls="state-suggestions"
            aria-expanded={open && isFocused}
            aria-haspopup="listbox"
            placeholder="Search a state"
            className="w-full min-w-0 truncate bg-transparent text-base text-white outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="rounded-full border border-cyan-400/30 bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/25"
            aria-label="Search"
          >
            Search
          </button>
        </div>

        {open && isFocused && (
          <ul id="state-suggestions" role="listbox" className="absolute left-0 right-0 z-30 mt-2 max-h-48 overflow-auto rounded-lg border border-white/10 bg-slate-900/90 p-2">
            {suggestions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-400">No states match "{query.trim()}"</li>
            ) : (
              suggestions.map((s, idx) => (
                <li
                  key={s.slug}
                  role="option"
                  aria-selected={activeIndex === idx}
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => handleSelect(s.slug)}
                  className={`cursor-pointer rounded px-3 py-2 text-sm transition ${activeIndex === idx ? 'bg-cyan-500/20 text-white' : 'text-slate-200 hover:bg-white/5'}`}
                >
                  {s.name}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </form>
  );
}
