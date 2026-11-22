import { NOTE_QT_POS, ACC, ACC_OFFSET } from './maqam-data';

/**
 * Get the quarter-tone position of a note (absolute, across octaves).
 */
export function getQuarterToneValue(note) {
  const base = NOTE_QT_POS[note.name];
  const offset = ACC_OFFSET[note.accidental] || 0;
  return base + offset + (note.octave - 4) * 24;
}

/**
 * Whether an accidental is a microtonal (quarter-tone) accidental.
 */
export function isMicrotonal(accidental) {
  return (
    accidental === ACC.HALF_FLAT ||
    accidental === ACC.HALF_SHARP ||
    accidental === ACC.THREE_Q_FLAT ||
    accidental === ACC.THREE_Q_SHARP
  );
}

/**
 * Get the frequency (Hz) for a note in 24-TET, with A4 = 440Hz.
 */
export function getFrequency(note) {
  const a4Qt = NOTE_QT_POS['A']; // A4 = 18 quarter-tones from C4
  const noteQt = getQuarterToneValue(note);
  const diff = noteQt - a4Qt;
  return 440 * Math.pow(2, diff / 24);
}
