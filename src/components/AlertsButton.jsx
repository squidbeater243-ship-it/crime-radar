import { Bell } from 'lucide-react';

export default function AlertsButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Sign up for crime alerts"
      title="Get crime alerts for your area"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-cyan-300 transition hover:bg-white/5 hover:text-cyan-100"
    >
      <Bell className="h-4 w-4" aria-hidden />
    </button>
  );
}
