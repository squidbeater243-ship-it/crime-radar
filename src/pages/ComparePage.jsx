import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Activity, Landmark, ShieldAlert } from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import stateData, { stateSlugs } from '../data/stateData';
import usePageMeta from '../hooks/usePageMeta';
import {
  computeCrimeIndexRange,
  computeRange,
  getCombinedCrimeIndex,
  getMetricValue,
  getPovertyRate,
  getSafetyScore,
  normalizeToRange,
} from '../utils/stateStats';
import SafetyBadge from '../components/SafetyBadge';
import CountUp from '../components/CountUp';
import FadeIn from '../components/FadeIn';
import { EASE_OUT_STRONG } from '../utils/motion';

const compareOptions = stateSlugs.map((slug) => ({ slug, label: stateData[slug].displayName }));

function RankList({ title, unit, rows, color, safetyScores }) {
  const top = rows.slice(0, 5);
  const bottom = rows.slice(-5).reverse();
  const prefersReducedMotion = useReducedMotion();
  const rowDelay = (i) => (prefersReducedMotion ? 0 : i * 0.04);

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
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <p className={`mb-2 text-xs uppercase tracking-[0.28em] ${color}`}>Highest — {title}</p>
        <div className="space-y-1.5">
          {top.map((item, i) => (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: rowDelay(i), ease: EASE_OUT_STRONG }}
            >
              <Row rank={i + 1} item={item} />
            </motion.div>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.28em] text-slate-400">Lowest — {title}</p>
        <div className="space-y-1.5">
          {bottom.map((item, i) => (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: rowDelay(i), ease: EASE_OUT_STRONG }}
            >
              <Row rank={i + 1} item={item} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const RANK_TABS = [
  { id: 'combined', label: 'Combined Index', icon: Activity, color: 'text-rose-300/80' },
  { id: 'violent', label: 'Violent Crime', icon: ShieldAlert, color: 'text-orange-300/80' },
  { id: 'poverty', label: 'Poverty Rate', icon: Landmark, color: 'text-amber-300/80' },
];

export default function ComparePage() {
  usePageMeta({
    title: 'Compare & Rankings',
    description: 'Compare crime and poverty stats side-by-side for any two states, or see how all 50 states rank.',
    path: '/compare',
  });
  const [left, setLeft] = useState('california');
  const [right, setRight] = useState('texas');
  const [rankTab, setRankTab] = useState('combined');

  const leftState = stateData[left];
  const rightState = stateData[right];

  const leftTotalCrime = useMemo(() => getCombinedCrimeIndex(leftState), [leftState]);
  const rightTotalCrime = useMemo(() => getCombinedCrimeIndex(rightState), [rightState]);
  const higherCrime = leftTotalCrime === rightTotalCrime ? 'Even' : leftTotalCrime > rightTotalCrime ? leftState.displayName : rightState.displayName;

  // Violent/property/poverty are on wildly different scales, so each axis is
  // normalized against the full 50-state range before plotting — otherwise
  // property crime (a much bigger raw number) would dominate the shape.
  const radarData = useMemo(() => {
    const allStates = stateSlugs.map((slug) => stateData[slug]);
    const violentRange = computeRange(allStates.map((s) => getMetricValue(s, 'Violent')));
    const propertyRange = computeRange(allStates.map((s) => getMetricValue(s, 'Property')));
    const povertyRange = computeRange(allStates.map((s) => getPovertyRate(s)));

    return [
      {
        metric: 'Violent crime',
        left: normalizeToRange(getMetricValue(leftState, 'Violent'), violentRange),
        right: normalizeToRange(getMetricValue(rightState, 'Violent'), violentRange),
      },
      {
        metric: 'Property crime',
        left: normalizeToRange(getMetricValue(leftState, 'Property'), propertyRange),
        right: normalizeToRange(getMetricValue(rightState, 'Property'), propertyRange),
      },
      {
        metric: 'Poverty rate',
        left: normalizeToRange(getPovertyRate(leftState), povertyRange),
        right: normalizeToRange(getPovertyRate(rightState), povertyRange),
      },
    ];
  }, [leftState, rightState]);

  const crimeIndexRange = useMemo(() => computeCrimeIndexRange(Object.values(stateData)), []);
  const safetyScores = useMemo(() => {
    const map = {};
    stateSlugs.forEach((slug) => {
      map[slug] = getSafetyScore(stateData[slug], crimeIndexRange);
    });
    return map;
  }, [crimeIndexRange]);

  const rankRows = useMemo(() => {
    const byCombinedIndex = stateSlugs
      .map((slug) => ({ slug, name: stateData[slug].displayName, value: getCombinedCrimeIndex(stateData[slug]) }))
      .sort((a, b) => b.value - a.value);
    const byViolent = stateSlugs
      .map((slug) => ({ slug, name: stateData[slug].displayName, value: getMetricValue(stateData[slug], 'Violent') }))
      .sort((a, b) => b.value - a.value);
    const byPoverty = stateSlugs
      .map((slug) => ({ slug, name: stateData[slug].displayName, value: getPovertyRate(stateData[slug]) }))
      .sort((a, b) => b.value - a.value);
    return { combined: byCombinedIndex, violent: byViolent, poverty: byPoverty };
  }, []);

  const activeRankTab = RANK_TABS.find((t) => t.id === rankTab);
  const rankUnit = rankTab === 'violent' ? 'per 100k' : rankTab === 'poverty' ? '%' : '';

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <FadeIn y={14} duration={0.35} className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/70">Compare &amp; rankings</p>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              See how states{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
                stack up
              </span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
              Compare any two states head-to-head, or browse how all 50 rank nationally.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Back to home
          </Link>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
          <div className="grid gap-4 sm:grid-cols-2">
            {[{ side: 'left', value: left, setValue: setLeft }, { side: 'right', value: right, setValue: setRight }].map((column) => (
              <select
                key={column.side}
                value={column.value}
                onChange={(event) => column.setValue(event.target.value)}
                aria-label={column.side === 'left' ? 'First state' : 'Second state'}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              >
                {compareOptions.map((option) => (
                  <option key={option.slug} value={option.slug} className="bg-slate-950 text-slate-100">
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Combined index</p>
              <p className="mt-2 text-2xl font-semibold text-white"><CountUp value={leftTotalCrime} /></p>
              <p className="mt-1 text-sm text-slate-400">{leftState.displayName}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Difference</p>
              <p className="mt-2 text-2xl font-semibold text-white"><CountUp value={Math.abs(leftTotalCrime - rightTotalCrime)} /></p>
              <p className="mt-1 text-sm text-slate-400">Higher in {higherCrime}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Combined index</p>
              <p className="mt-2 text-2xl font-semibold text-white"><CountUp value={rightTotalCrime} /></p>
              <p className="mt-1 text-sm text-slate-400">{rightState.displayName}</p>
            </div>
          </div>

          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="58%">
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name={leftState.displayName} dataKey="left" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.35} />
                <Radar name={rightState.displayName} dataKey="right" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.35} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#e2e8f0' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-center text-xs text-slate-400">
            Each axis is scaled 0-100 against all 50 states, so the shapes compare where each state sits nationally — not raw numbers.
          </p>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
          <nav className="no-scrollbar flex gap-2 overflow-x-auto rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-2" role="tablist" aria-label="Ranking category">
            {RANK_TABS.map(({ id, label, icon: Icon }) => {
              const isActive = rankTab === id;
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setRankTab(id)}
                  className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-cyan-500/20 text-cyan-100' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </nav>
          <div className="mt-4">
            <RankList
              key={rankTab}
              title={activeRankTab.label}
              unit={rankUnit}
              rows={rankRows[rankTab]}
              color={activeRankTab.color}
              safetyScores={rankTab === 'combined' ? safetyScores : undefined}
            />
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
