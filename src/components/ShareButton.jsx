import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

// Uses the native share sheet where available (mobile browsers, some
// desktop browsers); falls back to copying the link to the clipboard
// with brief inline feedback everywhere else.
export default function ShareButton({ title, text, url, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch {
        // User dismissed the native share sheet — nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied — no further fallback available.
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:border-cyan-300/40 hover:bg-cyan-500/15 ${className}`}
      aria-label="Share this report"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Share2 className="h-3.5 w-3.5" />}
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}
