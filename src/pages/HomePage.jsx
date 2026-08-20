import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassSearchBar from '../components/GlassSearchBar';
import RecentSearches from '../components/RecentSearches';
import FavoriteStates from '../components/FavoriteStates';
import TrendingStates from '../components/TrendingStates';
import SourcesButton from '../components/SourcesButton';
import RadarBackdrop from '../components/RadarBackdrop';
import usePageMeta from '../hooks/usePageMeta';
import stateData from '../data/stateData';

// react-simple-maps + d3-geo pull in a meaningful chunk of JS that the hero
// content above the fold doesn't need — deferring it keeps the initial
// HomePage bundle focused on what actually needs to paint first.
const UsMap = lazy(() => import('../components/UsMap'));

const FEATURED_SLUGS = ['california', 'texas', 'florida'];

function MapFallback() {
  return (
    <div className="mt-8 w-full rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-sm shadow-cyan-500/10 backdrop-blur-sm sm:p-6">
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80"
        style={{ aspectRatio: '960 / 600' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-cyan-400 border-white/10" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  usePageMeta({ path: '/' });

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.2),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.2),_transparent_35%)]" />

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16 sm:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative w-full max-w-4xl rounded-[2rem] border border-white/15 bg-gradient-to-br from-white/6 to-white/3 p-8 text-center shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl sm:p-12 overflow-hidden"
        >
          <RadarBackdrop size={560} top="-6rem" className="opacity-40" />

          <div className="relative z-10">
            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-cyan-300/80">Crime Radar</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Explore{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
                public safety insights
              </span>{' '}
              with a glassy, modern lens.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300 sm:text-xl">
              Search any state to reveal interactive crime and demographic snapshots in a sleek, responsive dashboard.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4">
              <GlassSearchBar />
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300">
                <span className="text-slate-400">Most popular:</span>
                {FEATURED_SLUGS.map((slug) => (
                  <Link
                    key={slug}
                    to={`/state/${slug}`}
                    className="rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-500/20"
                  >
                    {stateData[slug].displayName}
                  </Link>
                ))}
                <Link
                  to="/compare"
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/40 hover:bg-cyan-500/15"
                >
                  Compare states
                </Link>
                <Link
                  to="/overview"
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/40 hover:bg-cyan-500/15"
                >
                  National overview
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="my-8 flex w-full flex-col items-center gap-4">
          <FavoriteStates />
          <RecentSearches />
          <TrendingStates />
        </div>

        <div className="w-full max-w-6xl">
          <Suspense fallback={<MapFallback />}>
            <UsMap />
          </Suspense>
        </div>
        <SourcesButton />
      </main>
    </div>
  );
}
