import { Link, NavLink } from 'react-router-dom';
import { Radar } from 'lucide-react';
import SoundToggle from './SoundToggle';
import AlertsButton from './AlertsButton';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/state-statistics', label: 'State Statistics' },
  { to: '/compare', label: 'Compare' },
];

export default function NavBar({ onAlertsClick }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-wide text-white">
          <Radar className="h-5 w-5 text-cyan-300" aria-hidden />
          Crime Radar
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end sm:gap-1">
          <div className="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-full px-2.5 py-1 font-medium transition sm:px-3 sm:py-1.5 ${
                    isActive ? 'bg-cyan-500/15 text-cyan-100' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-0.5 border-l border-white/10 pl-2">
            <SoundToggle />
            <AlertsButton onClick={onAlertsClick} />
          </div>
        </div>
      </nav>
    </header>
  );
}
