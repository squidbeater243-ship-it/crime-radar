import { Link } from 'react-router-dom';
import { Radar } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/60 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2 text-slate-300">
          <Radar className="h-4 w-4 text-cyan-300" aria-hidden />
          <span>Crime Radar</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link to="/about" className="transition hover:text-white">
            About &amp; methodology
          </Link>
          <span className="text-slate-600">
            Public safety data from FBI, state agencies, and U.S. Census sources.
          </span>
        </div>
      </div>
    </footer>
  );
}
