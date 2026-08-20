// Tiny synthesized sound engine — no audio files, everything generated via
// Web Audio API oscillators so there's nothing to license or download.
// The AudioContext is created lazily on first use (browsers require a user
// gesture before audio can play, which every call site here satisfies since
// they're all triggered from click handlers).

let ctx = null;
function getContext() {
  if (!ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    ctx = new AudioContextClass();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(audioCtx, { freq, start, duration, type = 'sine', gain = 0.15, freqEnd }) {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, start + duration);
  gainNode.gain.setValueAtTime(0, start);
  gainNode.gain.linearRampToValueAtTime(gain, start + 0.005);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

let soundEnabled = false;
export function setSoundEnabled(value) {
  soundEnabled = value;
}

function play(fn) {
  if (!soundEnabled) return;
  const audioCtx = getContext();
  if (!audioCtx) return;
  try {
    fn(audioCtx);
  } catch {
    // audio is a nice-to-have; never let it break the app
  }
}

// Radar ping — short sine sweep with a soft echo, like a sonar blip. Used
// when zooming into a state on the map.
export function playPing() {
  play((audioCtx) => {
    const now = audioCtx.currentTime;
    tone(audioCtx, { freq: 880, freqEnd: 660, start: now, duration: 0.35, gain: 0.14 });
    tone(audioCtx, { freq: 880, freqEnd: 660, start: now + 0.14, duration: 0.3, gain: 0.06 });
  });
}

// Soft tick — short, quiet, higher-pitched. Used for tab switches and
// search-result selection.
export function playTick() {
  play((audioCtx) => {
    const now = audioCtx.currentTime;
    tone(audioCtx, { freq: 1200, start: now, duration: 0.05, type: 'triangle', gain: 0.08 });
  });
}

// Pop — quick upward pitch blip. Used when favoriting a state.
export function playPop() {
  play((audioCtx) => {
    const now = audioCtx.currentTime;
    tone(audioCtx, { freq: 520, freqEnd: 1040, start: now, duration: 0.12, type: 'sine', gain: 0.16 });
  });
}
