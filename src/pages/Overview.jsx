import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ArrowLeft, Landmark, ShieldAlert } from 'lucide-react';
import stateData, { stateSlugs } from '../data/stateData';
import { computeCrimeIndexRange, getCombinedCrimeIndex, getMetricValue, getPovertyRate, getSafetyScore } from '../utils/stateStats';
import usePageMeta from '../hooks/usePageMeta';
import SafetyBadge from '../components/SafetyBadge';
import CountUp from '../components/CountUp';

function RankList({ title, unit, rows, color, icon: Icon, accentClass, safetyScores }) {
  const top = rows.slice(0, 5);
  const bottom = rows.slice(-5).reverse();

  const Row = ({ rank, item }) => (
    <Link
      to={`/state/${encodeURIComponent(item.slug)}`}
      className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm transition hover:border-white/15 hover:bg-white/10"
    >
      <span className="flex items-center gap-2 text-slate-200">
        <span className="w-5 shrink-0 text-right text-xs text-slate-500">{rank}</span>
        {item.name}
        {safetyScores && <SafetyBadge score={safetyScores[item.slug]} />}
      </span>
      <span className="font-semibold text-white">
        <CountUp value={item.value} format={(v) => v.toLocaleString(undefined, { maximumFractionDigits: 1 })} duration={0.6} />
        <span className="ml-1 text-xs font-normal text-slate-400">{unit}</span>
      </span>
    </Link>
  );

  return (
    <div className={`rounded-[1.75rem] border border-white/10 border-l-4 ${accentClass} bg-slate-900/80 p-5 shadow-xl shadow-black/20 backdrop-blur-xl`}>
      <div className="flex items-center gap-2.5">
        <Icon className="h-5 w-5 text-white/70" aria-hidden />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <div>
          <p className={`mb-2 text-xs uppercase tracking-[0.28em] ${color}`}>Highest</p>
          <div className="space-y-1.5">
            {top.map((item, i) => (
              <Row key={item.slug} rank={i + 1} item={item} />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.28em] text-slate-500">Lowest</p>
          <div className="space-y-1.5">
            {bottom.map((item, i) => (
              <Row key={item.slug} rank={i + 1} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Overview() {
  usePageMeta({
    title: 'National Overview',
    description: 'Rankings of all 50 U.S. states by combined crime index, violent crime rate, and poverty rate.',
    path: '/overview',
  });

  const byCombinedIndex = useMemo(
    () =>
      stateSlugs
        .map((slug) => ({ slug, name: stateData[slug].displayName, value: getCombinedCrimeIndex(stateData[slug]) }))
        .sort((a, b) => b.value - a.value),
    []
  );
  const byViolent = useMemo(
    () =>
      stateSlugs
        .map((slug) => ({ slug, name: stateData[slug].displayName, value: getMetricValue(stateData[slug], 'Violent') }))
        .sort((a, b) => b.value - a.value),
    []
  );
  const byPoverty = useMemo(
    () =>
      stateSlugs
        .map((slug) => ({ slug, name: stateData[slug].displayName, value: getPovertyRate(stateData[slug]) }))
        .sort((a, b) => b.value - a.value),
    []
  );
  const crimeIndexRange = useMemo(() => computeCrimeIndexRange(Object.values(stateData)), []);
  const safetyScores = useMemo(() => {
    const map = {};
    stateSlugs.forEach((slug) => {
      map[slug] = getSafetyScore(stateData[slug], crimeIndexRange);
    });
    return map;
  }, [crimeIndexRange]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-6xl"
      >
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/70">National overview</p>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              See how{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
                every state stacks up
              </span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
              Rankings across all 50 states, built from the same verified 2023/2024 FBI, state agency, and U.S. Census data shown on each state page.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="space-y-6">
          <RankList
            title="Combined crime index (violent + property, per 100k)"
            unit=""
            rows={byCombinedIndex}
            color="text-rose-300/80"
            icon={Activity}
            accentClass="border-l-rose-400/40"
            safetyScores={safetyScores}
          />
          <RankList
            title="Violent crime rate"
            unit="per 100k"
            rows={byViolent}
            color="text-orange-300/80"
            icon={ShieldAlert}
            accentClass="border-l-orange-400/40"
          />
          <RankList
            title="Poverty rate"
            unit="%"
            rows={byPoverty}
            color="text-amber-300/80"
            icon={Landmark}
            accentClass="border-l-amber-400/40"
          />
        </div>
      </motion.div>
    </div>
  );
}
