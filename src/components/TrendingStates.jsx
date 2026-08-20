import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import stateData from '../data/stateData';
import { getTrending, getMeta } from '../services/viewsService';

const formatResetDate = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function TrendingStates() {
  const [trending, setTrending] = useState([]);
  const [lastReset, setLastReset] = useState(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([getTrending(), getMeta()]).then(([views, meta]) => {
      if (!mounted) return;
      const top = Object.entries(views)
        .filter(([, count]) => count > 0)
        .slice(0, 5)
        .map(([slug, count]) => ({ slug, count, label: stateData[slug]?.displayName || slug }));
      setTrending(top);
      setLastReset(meta.lastReset);
    });
    return () => (mounted = false);
  }, []);

  if (!trending.length) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200 shadow-sm backdrop-blur-xl sm:px-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/70">Trending this week</p>
        <Flame className="h-3.5 w-3.5 text-amber-400" />
      </div>
      <div className="flex flex-wrap gap-2">
        {trending.map((item) => (
          <Link
            key={item.slug}
            to={`/state/${encodeURIComponent(item.slug)}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            {item.label}
            <span className="text-slate-400">{item.count}</span>
          </Link>
        ))}
      </div>
      {lastReset && (
        <p className="mt-3 text-[11px] text-slate-500">Resets weekly · last reset {formatResetDate(lastReset)}</p>
      )}
    </div>
  );
}
