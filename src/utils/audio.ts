let audioCtx: AudioContext | null = null;
let soundEnabled = true;

const PENTATONIC_SCALE = [
  523.25,
  587.33,
  659.25,
  783.99,
  880.00,
  1046.50,
  1174.66,
  1318.51,
];

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playChime(pitchIndex?: number) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const index = pitchIndex !== undefined
      ? pitchIndex % PENTATONIC_SCALE.length
      : Math.floor(Math.random() * PENTATONIC_SCALE.length);

    const freq = PENTATONIC_SCALE[index];
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.01, now);

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.06, now + 0.015);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 1.3);
    osc2.stop(now + 0.8);
  } catch {}
}

export function playBloomChord() {
  if (!soundEnabled) return;
  const notes = [0, 2, 4, 7];
  notes.forEach((noteIdx, i) => {
    setTimeout(() => {
      playChime(noteIdx);
    }, i * 140);
  });
}

export function setAudioEnabled(enabled: boolean) {
  soundEnabled = enabled;
  if (enabled) {
    getAudioContext();
  }
}

export function isAudioEnabled(): boolean {
  return soundEnabled;
}
