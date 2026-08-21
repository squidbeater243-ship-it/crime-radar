import { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import prefsService from '../services/prefsService';

const getSavedAreas = () => prefsService.loadPrefs().savedAreas || [];

// Unlike FavoriteStates (which links to a real /state/:slug page), a saved
// area isn't a standalone route — scanning is a form submission on the
// homepage — so selecting a pill re-runs that scan via onSelect rather than
// navigating anywhere.
export default function SavedAreas({ onSelect }) {
  const [areas, setAreas] = useState(getSavedAreas);

  if (!areas.length) return null;

  const handleRemove = (state, city) => {
    prefsService.toggleSavedArea(state, city);
    setAreas(getSavedAreas());
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200 shadow-sm backdrop-blur-xl sm:px-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/70">Saved areas</p>
        <MapPin className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
      </div>
      <div className="flex flex-wrap gap-2">
        {areas.map((area) => (
          <span
            key={`${area.state}:${area.city.toLowerCase()}`}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 py-1 pl-3 pr-1.5 text-[11px] text-slate-200 transition hover:bg-white/10"
          >
            <button type="button" onClick={() => onSelect(area)} className="hover:text-white">
              {area.city}, {area.stateDisplay}
            </button>
            <button
              type="button"
              onClick={() => handleRemove(area.state, area.city)}
              aria-label={`Remove ${area.city}, ${area.stateDisplay} from saved areas`}
              className="rounded-full p-0.5 text-slate-500 transition hover:bg-white/10 hover:text-rose-300"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
