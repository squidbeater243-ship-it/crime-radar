import { Component } from 'react';
import * as Sentry from '@sentry/react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled error in app tree:', error, info);
    Sentry.captureException(error, { extra: { componentStack: info?.componentStack } });
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.15),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.15),_transparent_30%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 p-8 text-center shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Something broke</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">This page hit an unexpected error</h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
            Try reloading the page. If it keeps happening, the error below may help track it down.
          </p>
          <pre className="mt-4 max-w-full overflow-auto rounded-xl border border-white/10 bg-slate-950/80 p-3 text-left text-xs text-rose-300">
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <a
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/25"
          >
            Back home
          </a>
        </div>
      </div>
    );
  }
}
