import { useParams } from 'react-router-dom';
import stateData from '../data/stateData';
import { computeCrimeIndexRange, getSafetyGrade, getSafetyScore, getSeverityColor } from '../utils/stateStats';
import RadarBackdrop from '../components/RadarBackdrop';

// Rendered at exactly 1200x630 (the standard OG image size) and screenshotted
// by scripts/generate-og-images.js — never linked to from the app itself.
// Deliberately has no NavBar/modal/etc. — App.jsx skips all chrome for
// `/og/*` routes so this is the entire page.
export default function OgCard() {
  const { slug } = useParams();
  const state = slug && slug !== 'default' ? stateData[slug] : null;

  const range = computeCrimeIndexRange(Object.values(stateData));
  const score = state ? getSafetyScore(state, range) : null;
  const grade = score != null ? getSafetyGrade(score) : null;
  const color = score != null ? getSeverityColor(score) : '#38bdf8';

  return (
    <div
      style={{ width: 1200, height: 630 }}
      className="relative flex items-center overflow-hidden bg-slate-950 text-white"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.25),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.25),_transparent_45%)]" />
      <RadarBackdrop size={760} top="-9rem" className="opacity-30" />

      <div className="relative z-10 flex w-full items-center justify-between gap-10 px-20">
        <div className="min-w-0">
          <p className="text-lg font-semibold uppercase tracking-[0.4em] text-cyan-300/80">Crime Radar</p>

          {state ? (
            <>
              <h1 className="mt-5 text-7xl font-bold leading-none">{state.displayName}</h1>
              <div className="mt-8 flex items-center gap-5 text-2xl text-slate-300">
                <span>{state.crimeMeta?.[0]?.value ?? 'N/A'} violent</span>
                <span className="text-slate-600">·</span>
                <span>{state.crimeMeta?.[1]?.value ?? 'N/A'} property</span>
              </div>
              <p className="mt-2 text-lg text-slate-400">per 100,000 residents</p>
            </>
          ) : (
            <h1 className="mt-5 max-w-3xl text-6xl font-bold leading-tight">
              Make sure <span className="text-cyan-300">your new home</span> is safe.
            </h1>
          )}
        </div>

        {grade && (
          <div
            className="flex h-60 w-60 shrink-0 items-center justify-center rounded-full text-9xl font-black text-slate-950 shadow-2xl"
            style={{ backgroundColor: color }}
          >
            {grade}
          </div>
        )}
      </div>
    </div>
  );
}
