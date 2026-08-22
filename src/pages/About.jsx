import { Link } from 'react-router-dom';
import { Activity, Database, Newspaper, ShieldCheck } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';
import FadeIn from '../components/FadeIn';

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10">
          <Icon className="h-4.5 w-4.5 text-cyan-300" aria-hidden />
        </div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">{children}</div>
    </div>
  );
}

export default function About() {
  usePageMeta({
    title: 'About',
    description: 'How Crime Radar calculates safety grades, where the data comes from, and what Area Scan actually does.',
    path: '/about',
  });

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100 sm:px-6 lg:px-8">
      <FadeIn y={14} duration={0.35} className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/70">About Crime Radar</p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Real data, explained{' '}
            <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">plainly</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-400">
            Crime Radar helps you check an area's safety before you move there. Here's exactly where the numbers come
            from and how they're calculated — no black box.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          <Section icon={Database} title="Where the data comes from">
            <p>
              State-level crime and poverty statistics come from the FBI's Uniform Crime Reporting Program, individual
              state crime agencies, and the U.S. Census Bureau's American Community Survey. Most figures reflect 2023,
              with a few states using 2024 data where that was the most recently published. Every state page links its
              exact sources — you can check the primary data yourself rather than take our word for it.
            </p>
            <p>
              Gender and race breakdowns show national FBI arrest data, since the FBI doesn't publish state-by-state
              breakdowns by sex or race — every state page uses the same national figures for those two tabs.
            </p>
          </Section>

          <Section icon={Activity} title="How the safety grade (A–F) works">
            <p>
              Each state's violent and property crime rates (per 100,000 residents) are added into a single combined
              index. Every state is then scored 0–100 based on where its index falls relative to all 50 states — 100
              means the lowest crime index in the country, 0 means the highest. That score maps to a letter grade:
              roughly A for the safest states, F for the highest-crime states.
            </p>
            <p className="text-slate-400">
              Important: this is a <strong className="text-slate-200">relative</strong> ranking, not an absolute safety
              certification — a state graded "C" isn't necessarily dangerous, it just sits in the middle of the
              national distribution. And because the underlying data is state-level, the grade describes the whole
              state, not the specific city or neighborhood you're checking.
            </p>
          </Section>

          <Section icon={Newspaper} title="What Area Scan actually does">
            <p>
              Area Scan searches recent news coverage mentioning crime in the city you enter, using a live news API.
              It shows you what's actually being reported — not a computed score for that specific city (we don't have
              city-level crime statistics; see the safety grade section above for what is state-level and computed).
              Think of it as a quick "what's been in the news here lately" check, meant to sit alongside the state's
              overall grade, not replace it.
            </p>
          </Section>

          <Section icon={ShieldCheck} title="How this site sustains itself">
            <p>
              Crime Radar is a small independent project. It's supported by display advertising, which helps cover the
              cost of keeping the data, the news lookups, and the infrastructure running. Ads don't affect what data is
              shown or how any grade is calculated.
            </p>
          </Section>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:border-cyan-300/40 hover:bg-cyan-500/15"
          >
            Back to home
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
