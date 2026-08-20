import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import stateData, { stateSlugs } from '../data/stateData';
import usePageMeta from '../hooks/usePageMeta';
import { computeRange, getCombinedCrimeIndex, getMetricValue, getPovertyRate, normalizeToRange } from '../utils/stateStats';
import CountUp from '../components/CountUp';

const compareOptions = stateSlugs.map((slug) => ({ slug, label: stateData[slug].displayName }));

export default function ComparePage() {
  usePageMeta({
    title: 'Compare States',
    description: 'Compare crime rates, poverty, and income side-by-side for any two U.S. states.',
    path: '/compare',
  });
  const [left, setLeft] = useState('california');
  const [right, setRight] = useState('texas');

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
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/70">Compare states</p>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Compare{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
                crime and income
              </span>{' '}
              side-by-side
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
              Choose two states to compare key metrics and get a quick visual overview of how they differ.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Back to home
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {[{ side: 'left', state: leftState, value: left, setValue: setLeft }, { side: 'right', state: rightState, value: right, setValue: setRight }].map((column) => (
            <div key={column.side} className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
              <label className="block text-sm font-medium text-slate-300">{column.side === 'left' ? 'First state' : 'Second state'}</label>
              <select
                value={column.value}
                onChange={(event) => column.setValue(event.target.value)}
                className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              >
                {compareOptions.map((option) => (
                  <option key={option.slug} value={option.slug} className="bg-slate-950 text-slate-100">
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Top metric</p>
                  <p className="mt-3 text-xl font-semibold text-white">{column.state.displayName}</p>
                  <p className="mt-1 text-sm text-slate-300">{column.state.lastUpdated}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                    <p className="text-xs text-slate-400">Trend</p>
                    <p className="mt-2 text-lg font-semibold text-white">{column.state.crimeGrowth}</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                    <p className="text-xs text-slate-400">{column.state.verified ? 'Poverty rate' : 'Median income'}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{column.state.incomeHeadline}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Combined crime index</p>
              <p className="mt-3 text-3xl font-semibold text-white"><CountUp value={leftTotalCrime} /></p>
              <p className="mt-2 text-sm text-slate-400">{leftState.displayName}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Difference</p>
              <p className="mt-3 text-3xl font-semibold text-white"><CountUp value={Math.abs(leftTotalCrime - rightTotalCrime)} /></p>
              <p className="mt-2 text-sm text-slate-400">Higher in {higherCrime}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Combined crime index</p>
              <p className="mt-3 text-3xl font-semibold text-white"><CountUp value={rightTotalCrime} /></p>
              <p className="mt-2 text-sm text-slate-400">{rightState.displayName}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Shape comparison</p>
            <h2 className="text-xl font-semibold text-white">Radar profile</h2>
            <p className="mt-1 text-sm text-slate-400">
              Each axis is scaled 0-100 against all 50 states, so the two shapes compare where each state sits nationally — not raw numbers.
            </p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name={leftState.displayName} dataKey="left" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.35} />
                <Radar name={rightState.displayName} dataKey="right" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.35} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#e2e8f0' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {[
            { title: leftState.displayName, data: leftState.crimeData, color: '#38bdf8', verified: leftState.verified },
            { title: rightState.displayName, data: rightState.crimeData, color: '#f59e0b', verified: rightState.verified },
          ].map((panel) => (
            <div key={panel.title} className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{panel.verified ? 'Rate per 100k residents' : 'Sample categories'}</p>
                  <h2 className="text-xl font-semibold text-white">{panel.title}</h2>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200">
                  {panel.verified ? 'FBI/state data' : 'Sample values'}
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <BarChart data={panel.data}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={panel.color} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
