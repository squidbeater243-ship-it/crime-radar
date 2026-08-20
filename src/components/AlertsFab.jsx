import { Bell } from 'lucide-react';

export default function AlertsFab({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Sign up for crime alerts"
      title="Get crime alerts for your area"
      className="fixed bottom-20 right-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/30 bg-slate-900/80 text-cyan-300 shadow-lg shadow-cyan-500/10 backdrop-blur transition hover:bg-slate-900/95 hover:text-cyan-100"
    >
      <Bell className="h-5 w-5" aria-hidden />
    </button>
  );
}
