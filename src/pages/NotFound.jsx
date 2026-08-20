import { Link } from 'react-router-dom';
import { ArrowLeft, Radar } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

export default function NotFound() {
  usePageMeta({ title: 'Page Not Found', noindex: true });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.15),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.15),_transparent_30%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-[2rem] border border-white/15 bg-white/10 p-10 text-center shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10">
          <Radar className="h-6 w-6 text-cyan-300" aria-hidden />
        </div>
        <p className="mt-4 text-xs uppercase tracking-[0.35em] text-cyan-300/80">Off the radar</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Page not found</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          That page doesn&apos;t exist. Try searching for a state from the home page instead.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/25"
        >
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>
      </div>
    </div>
  );
}
