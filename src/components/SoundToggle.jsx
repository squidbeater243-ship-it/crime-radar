import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import prefsService from '../services/prefsService';
import { setSoundEnabled, playTick } from '../utils/sounds';

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isEnabled = prefsService.isSoundEnabled();
    setEnabled(isEnabled);
    setSoundEnabled(isEnabled);
  }, []);

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);
    prefsService.setSoundEnabled(next);
    if (next) playTick();
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={enabled ? 'Mute sound effects' : 'Enable sound effects'}
      aria-pressed={enabled}
      title={enabled ? 'Sound on' : 'Sound off'}
      className="fixed left-5 bottom-5 z-50 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-slate-300 shadow-lg backdrop-blur transition hover:bg-slate-900/95 hover:text-white"
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}
