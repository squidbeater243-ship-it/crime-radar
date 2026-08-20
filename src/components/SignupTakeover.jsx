import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Radar, ShieldCheck, X } from 'lucide-react';
import stateData, { stateSlugs } from '../data/stateData';
import { subscribe } from '../services/subscribeService';
import RadarBackdrop from './RadarBackdrop';

export default function SignupTakeover({ open, onClose }) {
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!state || !city.trim() || !agreed) return;
    setStatus('submitting');
    try {
      const stateDisplay = stateData[state]?.displayName || state;
      await subscribe(email.trim(), stateDisplay, city.trim());
      setStatus('subscribed');
    } catch {
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/95 px-4 py-10 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Sign up for local crime alerts"
        >
          <RadarBackdrop size={780} top="-8%" className="opacity-80" />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className="relative w-full max-w-lg rounded-[2rem] border border-white/15 bg-slate-900/80 p-8 text-center shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl drop-shadow-[0_4px_24px_rgba(2,6,23,0.9)] sm:p-10"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {status === 'subscribed' ? (
              <div className="py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
                  <ShieldCheck className="h-6 w-6 text-emerald-300" aria-hidden />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-white">You&apos;re all set.</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-300">
                  We&apos;ll email {email} if something significant happens in {city}, {stateData[state]?.displayName || state}.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/15 px-6 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/25"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10">
                  <Radar className="h-6 w-6 text-cyan-300" aria-hidden />
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.32em] text-cyan-300/70">Crime Radar Alerts</p>
                <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                  Know before you move in.
                </h1>
                <p className="mx-auto mt-3 max-w-sm text-sm text-slate-300">
                  Free email alerts when something significant happens near your next home — not routine headlines.
                  Skip anytime; you can turn this on later from the bell icon.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-left">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                      value={state}
                      onChange={(event) => setState(event.target.value)}
                      required
                      aria-label="State"
                      className="w-full rounded-full border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none sm:w-40"
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
                    <input
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      placeholder="City"
                      required
                      aria-label="City"
                      className="w-full rounded-full border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 sm:flex-1"
                    />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    aria-label="Email address"
                    className="w-full rounded-full border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500"
                  />
                  <label className="flex items-start gap-2 text-xs text-slate-400">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(event) => setAgreed(event.target.checked)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-white/20 bg-slate-950"
                    />
                    I agree to receive occasional email alerts for this area.
                  </label>

                  {status === 'error' && (
                    <p className="text-xs text-rose-300">Something went wrong. Try again in a moment.</p>
                  )}

                  <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                    <button
                      type="submit"
                      disabled={!agreed || status === 'submitting'}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/15 px-5 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-1"
                    >
                      {status === 'submitting' ? 'Signing up…' : 'Sign me up'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full shrink-0 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white sm:w-auto"
                    >
                      Maybe later
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
