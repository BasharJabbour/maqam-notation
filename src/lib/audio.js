import { getFrequency } from './music-theory';

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * Play an array of scale notes sequentially using Web Audio API.
 * Returns a promise that resolves when playback finishes.
 */
export function playScaleNotes(notes, { tempo = 0.45 } = {}) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  for (let i = 0; i < notes.length; i++) {
    const freq = getFrequency(notes[i]);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    const start = now + i * tempo;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.25, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, start + tempo - 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + tempo);
  }

  return new Promise((resolve) => {
    setTimeout(resolve, notes.length * tempo * 1000 + 100);
  });
}
