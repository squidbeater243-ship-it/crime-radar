import { useState } from 'react';
import { Link } from 'react-router-dom';
import prefsService from '../services/prefsService';
import stateData from '../data/stateData';

const getRecent = () => {
  const prefs = prefsService.loadPrefs();
  return (prefs.recent || []).map((slug) => ({ slug, label: stateData[slug]?.displayName || slug }));
};

export default function RecentSearches() {
  const [recent] = useState(getRecent);

  if (!recent.length) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200 shadow-sm backdrop-blur-xl sm:px-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/70">Recent searches</p>
        <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-400">Quick access</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {recent.map((item) => (
          <Link
            key={item.slug}
            to={`/state/${encodeURIComponent(item.slug)}`}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
