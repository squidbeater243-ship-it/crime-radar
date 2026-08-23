import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import prefsService from '../services/prefsService';
import stateData from '../data/stateData';

const getFavorites = () => {
  const prefs = prefsService.loadPrefs();
  return (prefs.favorites || []).map((slug) => ({ slug, label: stateData[slug]?.displayName || slug }));
};

export default function FavoriteStates() {
  const [favorites, setFavorites] = useState(getFavorites);

  if (!favorites.length) {
    return null;
  }

  const handleRemove = (slug) => {
    prefsService.toggleFavorite(slug);
    setFavorites((prev) => prev.filter((f) => f.slug !== slug));
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200 shadow-sm backdrop-blur-xl sm:px-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/70">Favorites</p>
        <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
      </div>
      <div className="flex flex-wrap gap-2">
        {favorites.map((item) => (
          <span
            key={item.slug}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 pl-3 pr-1.5 py-1 text-[11px] text-slate-200 transition hover:bg-white/10"
          >
            <Link to={`/state/${encodeURIComponent(item.slug)}`} className="hover:text-white">
              {item.label}
            </Link>
            <button
              onClick={() => handleRemove(item.slug)}
              aria-label={`Remove ${item.label} from favorites`}
              className="rounded-full p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-rose-300"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
