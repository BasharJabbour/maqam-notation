import { getFrequency } from './music-theory';

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// Relative durations in quarter-beat units. Used to stretch per-note playback.
const DURATION_WEIGHT = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
};

/**
 * Play a sequence of score entries sequentially using Web Audio API.
 * Each entry is either { kind: 'note', name, accidental, octave, duration }
 * or { kind: 'rest', duration }. Rests stay silent for their duration.
 * Returns a promise that resolves when playback finishes.
 */
export function playScoreNotes(scoreNotes, { quarterTempo = 0.45 } = {}) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  let cursor = 0; // seconds offset from now

  for (let i = 0; i < scoreNotes.length; i++) {
    const entry = scoreNotes[i];
    const weight = DURATION_WEIGHT[entry.duration] ?? 1;
    const duration = quarterTempo * weight;

    if (entry.kind === 'note') {
      const freq = getFrequency({
        name: entry.name,
        accidental: entry.accidental,
        octave: entry.octave,
      });

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const start = now + cursor;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration - 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    }

    cursor += duration;
  }

  return new Promise((resolve) => {
    setTimeout(resolve, cursor * 1000 + 100);
  });
}
