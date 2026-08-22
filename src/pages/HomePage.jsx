import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { ExternalLink, Heart, Mail, Radar } from 'lucide-react';
import stateData, { stateSlugs } from '../data/stateData';
import usePageMeta from '../hooks/usePageMeta';
import { getLocalNews } from '../services/newsService';
import { subscribe } from '../services/subscribeService';
import prefsService from '../services/prefsService';
import cityService from '../services/cityService';
import { computeCrimeIndexRange, getSafetyScore } from '../utils/stateStats';
import RadarBackdrop from '../components/RadarBackdrop';
import SafetyBadge from '../components/SafetyBadge';
import SavedAreas from '../components/SavedAreas';
import CityAutocomplete from '../components/CityAutocomplete';
import FadeIn from '../components/FadeIn';

const TAGLINES = [
  { lead: 'Make sure ', highlight: 'your new home', trail: ' is safe.' },
  { lead: 'Know your neighborhood ', highlight: 'before you move in', trail: '.' },
  { lead: "Don't move blind. ", highlight: 'Scan first', trail: '.' },
  { lead: 'Peace of mind starts ', highlight: 'with the right data', trail: '.' },
];

const TAGLINE_INTERVAL_MS = 4500;

function RotatingTagline() {
  const [index, setIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % TAGLINES.length), TAGLINE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [prefersReducedMotion]);

  const { lead, highlight, trail } = TAGLINES[index];

  return (
    <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
      <AnimatePresence mode="wait">
        <FadeIn key={index} y={8} duration={0.4} exit as="span" className="inline-block">
          {lead}
          <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">{highlight}</span>
          {trail}
        </FadeIn>
      </AnimatePresence>
    </h1>
  );
}

// The "scanning" moment between submitting a location and results landing —
// reuses the same .radar-sweep/.radar-blip CSS already defined globally for
// RadarBackdrop (including its prefers-reduced-motion handling), just sized
// for an inline loading state instead of a decorative background.
function ScanningRadar({ label }) {
  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="relative h-36 w-36">
        <div
          className="radar-sweep absolute inset-0 rounded-full"
          style={{ background: 'conic-gradient(from 0deg, rgba(34,211,238,0.7), transparent 45%)' }}
        />
        <div className="absolute inset-0 rounded-full border border-cyan-400/30" />
        <div className="absolute inset-[20%] rounded-full border border-cyan-400/25" />
        <div className="absolute inset-[40%] rounded-full border border-cyan-400/20" />
        <div className="radar-blip absolute left-[30%] top-[35%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300" style={{ boxShadow: '0 0 10px 3px rgba(103,232,249,0.8)' }} />
      </div>
      <p className="text-sm text-slate-300">{label}</p>
    </div>
  );
}

const formatPubDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

function EmailSignup({ city, stateDisplay }) {
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!agreed) return;
    setStatus('submitting');
    try {
      await subscribe(email.trim(), stateDisplay, city);
      setStatus('pending');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-cyan-300" aria-hidden />
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">Stay informed</p>
      </div>
      <h2 className="mt-2 text-lg font-semibold text-white">
        Get emailed if something serious happens in {city}, {stateDisplay}.
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        We&apos;ll only send an email for significant crime news here — not routine headlines. Unsubscribe anytime.
      </p>

      {status === 'pending' ? (
        // Signing up only requests a confirmation email -- it can't activate
        // alerts immediately, since that would let anyone type in a
        // stranger's address and sign them up. There's nothing active to
        // offer an "Unsubscribe" control for yet; that lives in the
        // confirmation/alert emails themselves as a one-click link.
        <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4">
          <p className="text-sm text-cyan-100">
            Almost there — check <strong>{email}</strong> for a confirmation link. Alerts for {city}, {stateDisplay} start once you
            confirm.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              aria-label="Email address"
              className="w-full rounded-full border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 sm:flex-1"
            />
            <button
              type="submit"
              disabled={!agreed || status === 'submitting'}
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/15 px-5 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === 'submitting' ? 'Signing up…' : 'Sign up'}
            </button>
          </div>
          <label className="flex items-start gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded border-white/20 bg-slate-950"
            />
            I agree to receive occasional email alerts for this area.
          </label>
          {status === 'error' && <p className="text-xs text-rose-300">Something went wrong. Try again in a moment.</p>}
        </form>
      )}
    </div>
  );
}

export default function HomePage() {
  usePageMeta({ path: '/' });
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [submitted, setSubmitted] = useState(null);
  const [status, setStatus] = useState('idle');
  const [items, setItems] = useState([]);
  const [areaSaved, setAreaSaved] = useState(false);

  const runScan = async (stateSlug, cityName) => {
    const trimmedCity = cityName.trim();
    if (!stateSlug || !trimmedCity) return;

    const stateDisplayName = stateData[stateSlug]?.displayName || stateSlug;
    const resolvedCity = await cityService.autoCorrectCity(trimmedCity, stateDisplayName);
    const wasCorrected = resolvedCity.toLowerCase() !== trimmedCity.toLowerCase();

    setState(stateSlug);
    setCity(resolvedCity);
    setSubmitted({ state: stateSlug, city: resolvedCity, originalCity: wasCorrected ? trimmedCity : null });
    setStatus('loading');
    setAreaSaved(prefsService.isAreaSaved(stateSlug, resolvedCity));

    try {
      const data = await getLocalNews(resolvedCity, stateDisplayName);
      setItems(data.items || []);
      setStatus(data.items && data.items.length > 0 ? 'success' : 'empty');
    } catch {
      setStatus('error');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    runScan(state, city);
  };

  const handleSelectSavedArea = (area) => {
    runScan(area.state, area.city);
  };

  const handleToggleSaveArea = () => {
    if (!submitted) return;
    const stateDisplayName = stateData[submitted.state]?.displayName || submitted.state;
    prefsService.toggleSavedArea(submitted.state, submitted.city, stateDisplayName);
    setAreaSaved((prev) => !prev);
  };

  const crimeIndexRange = computeCrimeIndexRange(Object.values(stateData));
  const submittedStateData = submitted ? stateData[submitted.state] : null;
  const submittedSafetyScore = submittedStateData ? getSafetyScore(submittedStateData, crimeIndexRange) : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-16 text-slate-100 sm:px-6 lg:px-8">
      <RadarBackdrop />

      <FadeIn y={18} duration={0.45} className="relative mx-auto max-w-3xl text-center drop-shadow-[0_2px_16px_rgba(2,6,23,0.85)]">
        <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/70">Crime Radar</p>
        <RotatingTagline />
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-300 sm:text-lg">
          Enter a state and city to scan for recent crime-related news — see what&apos;s actually happening before you move in.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-white/15 bg-white/5 p-4 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl sm:flex-row sm:gap-2"
        >
          <select
            value={state}
            onChange={(event) => setState(event.target.value)}
            required
            aria-label="State"
            className="w-full rounded-full border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none sm:w-48"
          >
            <option value="" disabled>
              State
            </option>
            {stateSlugs.map((slug) => (
              <option key={slug} value={slug}>
                {stateData[slug].displayName}
              </option>
            ))}
          </select>
          <CityAutocomplete
            value={city}
            onChange={setCity}
            stateDisplayName={state ? stateData[state]?.displayName : ''}
            placeholder="City"
            ariaLabel="City"
            id="scan-city"
            className="w-full sm:flex-1"
          />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/15 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/25 sm:w-auto"
          >
            <Radar className="h-4 w-4" aria-hidden />
            Scan this area
          </button>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm">
          <Link
            to="/state-statistics"
            className="rounded-full border border-white/15 bg-white/10 px-4 py-2 font-medium text-white transition hover:border-cyan-300/40 hover:bg-cyan-500/15"
          >
            Browse by state
          </Link>
          <Link
            to="/compare"
            className="rounded-full border border-white/15 bg-white/10 px-4 py-2 font-medium text-white transition hover:border-cyan-300/40 hover:bg-cyan-500/15"
          >
            Compare &amp; rankings
          </Link>
        </div>

        <div className="mt-6 flex justify-center">
          <SavedAreas onSelect={handleSelectSavedArea} />
        </div>
      </FadeIn>

      <div className="relative mx-auto mt-10 max-w-2xl">
        {submitted && (
          <div className="mb-4 rounded-3xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-white">
                  {submitted.city}, {stateData[submitted.state]?.displayName}
                </p>
                {submittedSafetyScore != null && <SafetyBadge score={submittedSafetyScore} />}
                <button
                  type="button"
                  onClick={handleToggleSaveArea}
                  aria-label={areaSaved ? 'Remove this area from saved areas' : 'Save this area'}
                  aria-pressed={areaSaved}
                  className="rounded-full p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-rose-300"
                >
                  <Heart className={`h-4 w-4 transition ${areaSaved ? 'fill-rose-400 text-rose-400' : ''}`} />
                </button>
              </div>
              {submittedSafetyScore != null && (
                <p className="hidden max-w-[14rem] text-right text-xs text-slate-500 sm:block">
                  Statewide safety grade for {stateData[submitted.state]?.displayName} — not specific to {submitted.city}.
                </p>
              )}
            </div>
            {submitted.originalCity && (
              <p className="mt-2 text-xs text-slate-500">
                Showing results for {submitted.city} — you typed &quot;{submitted.originalCity}&quot;.
              </p>
            )}
          </div>
        )}

        {status === 'idle' && (
          // A solid-enough background so RadarBackdrop's decorative ring
          // (which passes directly behind this box) doesn't read as a stray
          // line cutting across the text -- backdrop-blur alone was too
          // weak to soften a hairline stroke at this scale.
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/60 p-8 text-center text-sm text-slate-400">
            Enter a state and city above to scan the area.
          </div>
        )}

        {status === 'loading' && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center backdrop-blur-xl">
            <ScanningRadar label="Pulling recent safety updates…" />
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-3xl border border-rose-400/20 bg-rose-500/5 p-8 text-center">
            <p className="text-slate-200">Couldn&apos;t reach the news feed right now. Try again in a moment.</p>
          </div>
        )}

        {status === 'empty' && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center backdrop-blur-xl">
            <p className="text-slate-300">
              No recent safety-relevant headlines found for this area — that's good news. Try a larger nearby city for more coverage.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            {items.map((item) => (
              <a
                key={item.link}
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-slate-900/90"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {item.source}
                  {item.source && item.pubDate ? ' · ' : ''}
                  {formatPubDate(item.pubDate)}
                </p>
              </a>
            ))}
          </div>
        )}

        {submitted && status !== 'loading' && (
          <EmailSignup city={submitted.city} stateDisplay={stateData[submitted.state]?.displayName || submitted.state} />
        )}
      </div>
    </div>
  );
}
