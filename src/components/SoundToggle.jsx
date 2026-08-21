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
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/5 hover:text-white"
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}
