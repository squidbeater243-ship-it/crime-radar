import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, BarChart3, Heart, PieChart as PieChartIcon, ShieldCheck, TrendingUp } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import stateData, { normalizeStateName, stateSlugs } from '../data/stateData';
import stateTrendData from '../data/stateTrendData';
import { getState } from '../services/dataService';
import { arrestsBySex, arrestsByRace, arrestDataMeta } from '../data/nationalArrestData';
import usePageMeta from '../hooks/usePageMeta';
import { SITE_NAME, SITE_URL } from '../config/site';
import prefsService from '../services/prefsService';
import { recordView } from '../services/viewsService';
import { playTick, playPop } from '../utils/sounds';
import { computeCrimeIndexRange, getSafetyScore } from '../utils/stateStats';
import isPrerendering from '../utils/isPrerendering';
import SafetyBadge from '../components/SafetyBadge';
import ShareButton from '../components/ShareButton';
import CountUp from '../components/CountUp';
import FadeIn from '../components/FadeIn';

const tabs = [
  { id: 'crime', label: 'Crime Statistics', icon: ShieldCheck },
  { id: 'gender', label: 'Gender Demographics', icon: PieChartIcon },
  { id: 'race', label: 'Race/Ethnicity', icon: BarChart3 },
  { id: 'income', label: 'Income Levels', icon: TrendingUp },
];

function ContentSkeleton() {
  return (
    <div className="grid animate-pulse gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="h-72 rounded-2xl border border-white/10 bg-slate-950/70" />
      <div className="space-y-4">
        <div className="h-20 rounded-2xl border border-white/10 bg-white/5" />
        <div className="h-20 rounded-2xl border border-white/10 bg-white/5" />
      </div>
    </div>
  );
}

export default function StateDetail() {
  const { stateName } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Crime Statistics');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorited, setFavorited] = useState(false);
  const [viewCount, setViewCount] = useState(null);
  const normalizedState = normalizeStateName(stateName || '');
  // normalizedState is the raw lookup key (spaces, no hyphens) used against
  // stateData and prefsService storage below -- URLs need the encoded form
  // instead, since a literal space is invalid in a URL (multi-word states
  // like "north carolina" were shipping an unencoded space in the canonical
  // link, og:url, and og:image tags).
  const encodedState = encodeURIComponent(normalizedState);

  useEffect(() => {
    setFavorited(prefsService.isFavorite(normalizedState));
  }, [normalizedState]);

  const handleToggleFavorite = () => {
    prefsService.toggleFavorite(normalizedState);
    const next = !favorited;
    if (next) playPop();
    else playTick();
    setFavorited(next);
  };

  // The data layer simulates network latency, but it's really reading from an
  // already-loaded local dataset — so the header/tab shell can render from this
  // synchronous lookup immediately (and can never go stale mid-transition),
  // while `loading` purely gates how long the chart skeleton stays visible.
  const previewState = stateData[normalizedState] || null;
  const trendEntry = stateTrendData[normalizedState] || null;
  const trendChartData = trendEntry
    ? trendEntry.years.map((year, i) => ({ year, violent: trendEntry.violent[i] }))
    : [];
  const TREND_CAVEATS = {
    florida: 'FBI-methodology trend; differs from the FDLE figure above.',
    nebraska: "FBI-methodology trend; this state's snapshot above is sourced from state data flagged as approximate.",
  };
  const TREND_2021_NOTE = "2021 figures reflect reduced agency reporting during the FBI's NIBRS transition.";
  const trendCaption =
    TREND_CAVEATS[normalizedState] ||
    'Independently sourced from FBI historical data; figures may not align exactly with the snapshot above due to differing collection dates.';
  const crimeIndexRange = useMemo(() => computeCrimeIndexRange(Object.values(stateData)), []);
  const safetyScore = previewState ? getSafetyScore(previewState, crimeIndexRange) : null;

  useEffect(() => {
    if (!previewState) {
      setLoading(false);
      setError('No data found');
      return undefined;
    }
    let mounted = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await getState(normalizedState);
        if (!mounted) return;
        if (!data) setError('No data found');
      } catch {
        if (mounted) setError('Failed to load data');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [normalizedState, previewState]);

  useEffect(() => {
    if (!previewState || isPrerendering()) return undefined;
    let mounted = true;
    recordView(normalizedState).then((result) => {
      if (mounted && result) setViewCount(result.views);
    });
    return () => (mounted = false);
  }, [normalizedState, previewState]);

  const isUnknownState = !previewState || (!loading && !!error);
  const displayName = previewState?.displayName || decodeURIComponent(stateName || 'Unknown');

  const metaDescription = previewState
    ? `${displayName} crime stats: ${previewState.crimeMeta?.[0]?.value ?? 'N/A'} violent, ${previewState.crimeMeta?.[1]?.value ?? 'N/A'} property crime. ${previewState.incomeHeadline ?? ''} Explore interactive charts on Crime Radar.`.replace(/\s+/g, ' ').trim()
    : undefined;

  // Dataset schema — this page presents real, sourced statistics (not just
  // narrative content), which is what schema.org/Dataset is actually for;
  // it's also the type Google's Dataset Search indexes against.
  //
  // Memoized because it's passed to usePageMeta, which re-runs its
  // head-mutating effect (title, ~12 meta tags, canonical link, this script
  // tag) whenever this reference changes -- without useMemo, a fresh object
  // literal here reruns that effect on every render of this page, not just
  // when the state being displayed actually changes.
  const structuredData = useMemo(
    () =>
      previewState
        ? {
            '@context': 'https://schema.org',
            '@type': 'Dataset',
            name: `${displayName} Crime, Arrest, and Poverty Statistics`,
            description: metaDescription,
            url: `${SITE_URL}/state/${encodedState}`,
            keywords: ['crime statistics', displayName, 'poverty rate', 'arrest data', 'public safety'],
            creator: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
            temporalCoverage: previewState.dataYear ? String(previewState.dataYear) : undefined,
            spatialCoverage: { '@type': 'State', name: `${displayName}, United States` },
            isAccessibleForFree: true,
            ...(previewState.sources?.length
              ? { citation: previewState.sources.map((s) => ({ '@type': 'CreativeWork', name: s.label, url: s.url })) }
              : {}),
          }
        : null,
    [previewState, displayName, metaDescription, encodedState]
  );

  usePageMeta({
    title: isUnknownState && !loading ? 'State Not Found' : displayName,
    description: metaDescription,
    path: `/state/${encodedState}`,
    image: previewState ? `/og/${encodedState}.png` : undefined,
    noindex: isUnknownState && !loading,
    structuredData,
  });

  if (isUnknownState) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.15),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.15),_transparent_30%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/15 bg-white/10 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white" aria-label="Back home">
              <ArrowLeft className="h-4 w-4" />
              Back home
            </button>
            <h1 className="text-3xl font-semibold text-white">Data not found</h1>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Unknown state</p>
            <h2 className="mt-4 text-4xl font-semibold text-white">No data available for “{displayName}”</h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              This app currently includes sample data for a select set of states. Try one of these:
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-slate-200">
              {stateSlugs.map((slug) => (
                <Link
                  key={slug}
                  to={`/state/${encodeURIComponent(slug)}`}
                  className="rounded-full border border-white/10 bg-white/10 px-4 py-2 transition hover:border-cyan-300/40 hover:text-cyan-100"
                >
                  {stateData[slug].displayName}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { crimeData, incomeData, povertyData, crimeMeta, incomeHeadline, incomeNote, crimeGrowth, lastUpdated, verified, sources, dataYear, povertyDataYear } = previewState;

  const renderPanel = () => {
    if (loading) return <ContentSkeleton />;

    if (activeTab === 'Crime Statistics') {
      return (
        <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{verified ? `Per 100,000 residents (${dataYear})` : 'Sample category breakdown'}</p>
                <h2 className="text-xl font-semibold text-white">Reported incidents</h2>
              </div>
              <span className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">{crimeGrowth}</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={crimeData}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip cursor={{ fill: 'rgba(56, 189, 248, 0.08)' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#38bdf8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            {crimeMeta.map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-slate-400">{card.title}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
                <p className="mt-1 text-sm text-slate-300">{card.note}</p>
              </div>
            ))}
            {verified && sources && (
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-slate-400">Data sources</p>
                <ul className="mt-2 space-y-1.5">
                  {sources.map((s) => (
                    <li key={s.url}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-cyan-200 underline decoration-cyan-200/30 decoration-dotted underline-offset-2 hover:text-cyan-100"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        {trendEntry && (
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="text-sm text-slate-400">Per 100,000 residents</p>
            <h2 className="text-xl font-semibold text-white">Violent crime rate, 2018–2024</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    cursor={{ stroke: 'rgba(56, 189, 248, 0.35)' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }}
                    itemStyle={{ color: '#e2e8f0' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Line type="monotone" dataKey="violent" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              {trendCaption} {TREND_2021_NOTE}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Source:{' '}
              <a
                href="https://en.wikipedia.org/wiki/List_of_U.S._states_and_territories_by_violent_crime_rate"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-200 underline decoration-cyan-200/30 decoration-dotted underline-offset-2 hover:text-cyan-100"
              >
                FBI UCR data via Wikipedia
              </a>
            </p>
          </div>
        )}
        </div>
      );
    }

    if (activeTab === 'Gender Demographics') {
      return (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <h2 className="text-xl font-semibold text-white">Share of arrests by sex</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={arrestsBySex} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
                    {arrestsBySex.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  {/* Nothing in the chart itself previously said which
                      color was which -- a viewer had to guess, or cross-
                      reference the "73.8% male / 26.2% female" text below
                      and assume the larger segment came first. */}
                  <Legend verticalAlign="bottom" formatter={(value) => <span style={{ color: '#cbd5e1' }}>{value}</span>} />
                  <Tooltip cursor={false} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-sm text-slate-400">FBI Uniform Crime Report, {arrestDataMeta.year}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{arrestsBySex[0].value}% male / {arrestsBySex[1].value}% female</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">{arrestDataMeta.sexNote}</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'Race/Ethnicity') {
      return (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <h2 className="text-xl font-semibold text-white">Share of arrests by race</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={arrestsByRace} margin={{ left: 0, right: 8, top: 20, bottom: 24 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  {/* The full FBI category names ("American Indian / Alaska
                      Native", "Asian / Pacific Islander") don't fit on a
                      mobile-width axis at any reasonable rotation angle
                      without wrapping and overlapping into an unreadable
                      mess -- abbreviate the tick labels using the same
                      short forms the Census Bureau/BJS use for these
                      categories. The full name is still in the tooltip on
                      hover/tap, so nothing is actually lost. */}
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    tickFormatter={(name) =>
                      ({ 'American Indian / Alaska Native': 'AI/AN', 'Asian / Pacific Islander': 'Asian/PI' })[name] || name
                    }
                  />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip cursor={{ fill: 'rgba(245, 158, 11, 0.08)' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} formatter={(value) => `${value}%`} />
                  {/* Two of the four categories are ~2% vs. ~64%/~32% for
                      the other two -- real, not a bug -- so their bars are
                      only a couple pixels tall. A value label on every bar
                      keeps the small categories legible without distorting
                      the scale to fake-inflate them. */}
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#f59e0b">
                    <LabelList dataKey="value" position="top" formatter={(value) => `${value}%`} fill="#e2e8f0" fontSize={11} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-sm text-slate-400">FBI Uniform Crime Report, {arrestDataMeta.year}</p>
            <p className="mt-2 text-2xl font-semibold text-white">Arrests by race</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">{arrestDataMeta.raceNote}</p>
          </div>
        </div>
      );
    }

    if (povertyData) {
      return (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <h2 className="text-xl font-semibold text-white">Poverty rate vs. national average</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={povertyData}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  {/* interval={0}: with only 2 categories, Recharts'
                      default auto-skip logic was dropping the first tick
                      ("California") at narrow widths, leaving that bar
                      unlabeled. tickFormatter shortens "National average"
                      so the two labels don't run into each other once both
                      are forced to render at mobile width. */}
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    interval={0}
                    tickFormatter={(name) => (name === 'National average' ? 'U.S. average' : name)}
                  />
                  <YAxis stroke="#94a3b8" unit="%" />
                  <Tooltip cursor={{ fill: 'rgba(52, 211, 153, 0.08)' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} formatter={(value) => `${value}%`} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#34d399" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-sm text-slate-400">U.S. Census Bureau, {povertyDataYear || dataYear}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{incomeHeadline}</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">{incomeNote}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <h2 className="text-xl font-semibold text-white">Average household income</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={incomeData}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip cursor={{ stroke: 'rgba(52, 211, 153, 0.35)' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
                <Line type="monotone" dataKey="income" stroke="#34d399" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p className="text-sm text-slate-400">Sample estimate — not yet verified</p>
          <p className="mt-2 text-2xl font-semibold text-white">{incomeHeadline}</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">{incomeNote}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.15),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.15),_transparent_30%)] px-4 py-8 sm:px-6 lg:px-8">
      <FadeIn y={14} duration={0.35} className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
          <div className="text-left sm:text-right">
            <div className="flex items-center gap-2 sm:justify-end">
              <h1 className="text-3xl font-semibold text-white">{displayName}</h1>
              <SafetyBadge score={safetyScore} />
              <button
                onClick={handleToggleFavorite}
                aria-label={favorited ? `Remove ${displayName} from favorites` : `Add ${displayName} to favorites`}
                aria-pressed={favorited}
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-rose-300"
              >
                <Heart className={`h-5 w-5 transition ${favorited ? 'fill-rose-400 text-rose-400' : ''}`} />
              </button>
              <ShareButton
                title={`${displayName} — Crime Radar`}
                text={`See public safety stats for ${displayName} on Crime Radar.`}
              />
            </div>
            <p className="text-sm text-slate-400">{loading ? 'Loading…' : `Updated ${lastUpdated}`}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 sm:justify-end">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  verified
                    ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                    : 'border-amber-400/30 bg-amber-500/10 text-amber-200'
                }`}
              >
                {verified ? 'Verified with FBI/Census data' : 'Sample estimate — not yet verified'}
              </span>
              {viewCount != null && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  Viewed <CountUp value={viewCount} /> {viewCount === 1 ? 'time' : 'times'}
                </span>
              )}
            </div>
            {verified && sources && (
              <p className="mt-2 text-xs text-slate-400">
                Sources:{' '}
                {sources.map((s, i) => (
                  <span key={s.url}>
                    <a href={s.url} target="_blank" rel="noreferrer" className="underline decoration-dotted hover:text-cyan-300">
                      {s.label}
                    </a>
                    {i < sources.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl">
          <nav className="no-scrollbar flex gap-2 overflow-x-auto rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-2" role="tablist" aria-label="State detail tabs">
            {tabs.map(({ id, label, icon: Icon }, idx) => {
              const isActive = activeTab === label;
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') {
                      const next = tabs[(idx + 1) % tabs.length].label;
                      setActiveTab(next);
                    } else if (e.key === 'ArrowLeft') {
                      const prev = tabs[(idx - 1 + tabs.length) % tabs.length].label;
                      setActiveTab(prev);
                    }
                  }}
                  onClick={() => {
                    playTick();
                    setActiveTab(label);
                  }}
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

          <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-slate-900/60 p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <FadeIn key={loading ? 'loading' : activeTab} y={10} duration={0.25} exit>
                {renderPanel()}
              </FadeIn>
            </AnimatePresence>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
