import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { geoAlbersUsa, geoPath, geoCentroid } from 'd3-geo';
import { animate, motion, useReducedMotion } from 'framer-motion';
import stateData, { normalizeStateName } from '../data/stateData';
import { computeCrimeIndexRange, getCombinedCrimeIndex, getSafetyGrade, getSafetyScore, getSeverityColor } from '../utils/stateStats';
import { playPing } from '../utils/sounds';
import { EASE_OUT_STRONG } from '../utils/motion';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';
const MAP_WIDTH = 960;
const MAP_HEIGHT = 600;
const DEFAULT_CENTER = [-96.9, 38.7];
const DEFAULT_ZOOM = 1;
const MIN_ZOOM = 2.5;
const MAX_ZOOM = 14;

const projection = geoAlbersUsa().scale(1080).translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);
const pathGenerator = geoPath(projection);

// Cached at module scope so returning to the home page doesn't re-fetch.
let geoDataPromise = null;
function loadGeoData() {
  if (!geoDataPromise) {
    geoDataPromise = fetch(GEO_URL).then((res) => {
      if (!res.ok) throw new Error(`Map data request failed (${res.status})`);
      return res.json();
    });
  }
  return geoDataPromise;
}

const geographyStyle = (known, severityColor) => ({
  default: {
    fill: known ? severityColor : '#0f172a',
    stroke: known ? '#1e293b' : '#0f172a',
    strokeWidth: known ? 1 : 0.75,
    outline: 'none',
    transition: 'fill 200ms ease, stroke 200ms ease',
  },
  hover: {
    fill: known ? '#0ea5e9' : '#1e293b',
    stroke: known ? '#38bdf8' : '#0f172a',
    strokeWidth: known ? 1 : 0.75,
    outline: 'none',
  },
  pressed: {
    fill: '#38bdf8',
    stroke: '#67e8f9',
    strokeWidth: 1,
    outline: 'none',
  },
});

export default function UsMap() {
  const navigate = useNavigate();
  const [position, setPosition] = useState({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM });
  const [hovered, setHovered] = useState(null);
  const [pendingSlug, setPendingSlug] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const controlsRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const crimeIndexRange = useMemo(() => computeCrimeIndexRange(Object.values(stateData)), []);
  const severityColorBySlug = useMemo(() => {
    const map = {};
    for (const slug of Object.keys(stateData)) {
      map[slug] = getSeverityColor(getSafetyScore(stateData[slug], crimeIndexRange));
    }
    return map;
  }, [crimeIndexRange]);

  useEffect(() => () => controlsRef.current?.stop(), []);

  // Loads map data, then (unless the user prefers reduced motion) plays the
  // radar-sweep reveal once as it arrives.
  useEffect(() => {
    let mounted = true;
    let scanTimeout;
    loadGeoData()
      .then((data) => {
        if (!mounted) return;
        setGeoData(data);
        if (!prefersReducedMotion) {
          setScanning(true);
          scanTimeout = setTimeout(() => mounted && setScanning(false), 1400);
        }
      })
      .catch((err) => mounted && setGeoError(err.message || 'Failed to load map data'));
    return () => {
      mounted = false;
      clearTimeout(scanTimeout);
    };
    // prefersReducedMotion is read once at load time; loadGeoData() is cached
    // at module scope, so re-running this on every render isn't desired.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnter = useCallback((geo) => {
    if (pendingSlug) return;
    const slug = normalizeStateName(geo.properties.name);
    if (!stateData[slug]) return;
    const [x, y] = pathGenerator.centroid(geo);
    const score = getSafetyScore(stateData[slug], crimeIndexRange);
    setHovered({
      slug,
      name: stateData[slug].displayName,
      total: getCombinedCrimeIndex(stateData[slug]),
      score,
      grade: getSafetyGrade(score),
      left: (x / MAP_WIDTH) * 100,
      top: (y / MAP_HEIGHT) * 100,
    });
  }, [pendingSlug, crimeIndexRange]);

  const handleLeave = useCallback(() => setHovered(null), []);

  const handleClick = useCallback((geo) => {
    const slug = normalizeStateName(geo.properties.name);
    if (!stateData[slug] || pendingSlug) return;

    playPing();

    if (prefersReducedMotion) {
      navigate(`/state/${encodeURIComponent(slug)}`);
      return;
    }

    const centroid = geoCentroid(geo);
    const [[x0, y0], [x1, y1]] = pathGenerator.bounds(geo);
    const boxWidth = Math.max(x1 - x0, 1);
    const boxHeight = Math.max(y1 - y0, 1);
    const fitZoom = Math.min(MAP_WIDTH / boxWidth, MAP_HEIGHT / boxHeight) * 0.55;
    const targetZoom = Math.min(Math.max(fitZoom, MIN_ZOOM), MAX_ZOOM);

    setHovered(null);
    setPendingSlug(slug);

    const from = position;
    controlsRef.current?.stop();
    controlsRef.current = animate(0, 1, {
      duration: 0.9,
      ease: EASE_OUT_STRONG,
      onUpdate: (t) => {
        setPosition({
          center: [
            from.center[0] + (centroid[0] - from.center[0]) * t,
            from.center[1] + (centroid[1] - from.center[1]) * t,
          ],
          zoom: from.zoom + (targetZoom - from.zoom) * t,
        });
      },
      onComplete: () => {
        navigate(`/state/${encodeURIComponent(slug)}`);
      },
    });
  }, [position, navigate, pendingSlug, prefersReducedMotion]);

  return (
    <div className="mt-8 w-full rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-sm shadow-cyan-500/10 backdrop-blur-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/70">Interactive map</p>
          <h2 className="text-lg font-semibold text-white sm:text-xl">Explore every state</h2>
        </div>
        <p className="text-xs text-slate-400">Click a state to zoom in and open its full report</p>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80"
        style={{ aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}` }}
      >
        {geoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm text-rose-300">Couldn't load the map ({geoError})</p>
            <p className="text-xs text-slate-500">Check your connection and refresh the page.</p>
          </div>
        )}

        {!geoData && !geoError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-cyan-400 border-white/10" />
          </div>
        )}

        {geoData && (
          <ComposableMap
            projection={projection}
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            style={{ width: '100%', height: '100%' }}
          >
            <ZoomableGroup
              center={position.center}
              zoom={position.zoom}
              minZoom={DEFAULT_ZOOM}
              maxZoom={MAX_ZOOM}
              filterZoomEvent={() => false}
            >
              <Geographies geography={geoData}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const slug = normalizeStateName(geo.properties.name);
                    const known = !!stateData[slug];
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => known && handleEnter(geo)}
                        onMouseLeave={handleLeave}
                        onClick={() => known && handleClick(geo)}
                        onKeyDown={(event) => {
                          if (!known) return;
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleClick(geo);
                          }
                        }}
                        style={geographyStyle(known, severityColorBySlug[slug])}
                        className={known ? 'cursor-pointer' : 'cursor-default'}
                        tabIndex={known ? 0 : -1}
                        role={known ? 'button' : undefined}
                        aria-label={
                          known
                            ? `View ${stateData[slug].displayName} details — safety grade ${getSafetyGrade(getSafetyScore(stateData[slug], crimeIndexRange))}`
                            : undefined
                        }
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        )}

        {scanning && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            style={{
              background: 'conic-gradient(from 90deg, rgba(34,211,238,0.35), transparent 30%)',
              animation: 'radar-spin 1.4s linear 1',
            }}
          />
        )}

        {hovered && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-[135%] rounded-2xl border border-white/10 bg-slate-950/95 px-3 py-2 text-xs text-slate-100 shadow-xl shadow-cyan-500/10"
            style={{ left: `${hovered.left}%`, top: `${hovered.top}%` }}
          >
            <div className="flex items-center gap-2">
              <p className="font-semibold text-white">{hovered.name}</p>
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-slate-950"
                style={{ backgroundColor: getSeverityColor(hovered.score) }}
              >
                {hovered.grade}
              </span>
            </div>
            <p className="text-slate-300">{hovered.total.toLocaleString()} combined crime index</p>
            <p className="text-slate-500">Click to view full report</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <span>Lower crime</span>
        <span
          className="h-2 flex-1 rounded-full"
          style={{ background: 'linear-gradient(to right, rgb(16,185,129), rgb(245,158,11), rgb(244,63,94))' }}
          role="img"
          aria-label="Legend: green is lower crime, red is higher crime"
        />
        <span>Higher crime</span>
      </div>

      {/* Click-to-open is already stated in the header caption above the map
          -- repeating it here too was redundant. Hover-preview is the one
          piece of information not said anywhere else on the card. */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
        <span className="inline-flex h-2 w-2 rounded-full bg-cyan-400" />
        Hover a state for a quick preview
      </div>
    </div>
  );
}
