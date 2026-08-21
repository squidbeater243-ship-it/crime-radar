import { useState } from 'react';

export default function SourcesButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label="Data sources"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
      >
        Sources
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative m-4 w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/95 p-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-white">Sources</h3>
              <button className="text-sm text-slate-300" onClick={() => setOpen(false)} aria-label="Close sources">Close</button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <p>
                <strong>Crime & poverty data (all 50 states):</strong>{' '}
                <span className="text-slate-400">Real, sourced figures from the FBI, state crime agencies, and the U.S. Census Bureau (ACS). Most reflect 2023; a few use 2024 crime data where that was the most recently published figure — each state page shows the exact year and links its sources. Where a state's own reporting agency uses a different methodology than the FBI standard, or where sources conflicted, that's flagged directly on the state page.</span>
              </p>
              <p>
                <strong>Gender & race tabs (every state):</strong>{' '}
                <span className="text-slate-400">Show real national FBI arrest data, 2023 — the FBI doesn't publish state-by-state breakdowns by sex or race, so every state shows the same national figures.</span>
              </p>
              <p className="text-xs text-slate-500">
                Note: arrest data reflects who was arrested, not who committed an offense — it's shaped by policing intensity and reporting differences, not just underlying offense rates.
              </p>
              <p>
                <strong>Charts:</strong> <span className="text-slate-400">Recharts (client-side)</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
