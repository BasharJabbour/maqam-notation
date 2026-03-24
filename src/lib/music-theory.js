import { NOTES, NOTE_QT_POS, ACC, ACC_OFFSET } from './maqam-data';

/**
 * Build the 8-note scale (tonic to octave) given a tonic and accidentals map.
 */
export function getScaleNotes(tonic, accidentals) {
  const tonicIdx = NOTES.indexOf(tonic);
  const notes = [];

  for (let i = 0; i < 8; i++) {
    const noteIdx = (tonicIdx + i) % 7;
    const noteName = NOTES[noteIdx];
    notes.push({
      name: noteName,
      accidental: accidentals[noteName],
      octave: tonicIdx + i >= 7 ? 5 : 4,
    });
  }

  return notes;
}

/**
 * Get the quarter-tone position of a note (absolute, across octaves).
 */
export function getQuarterToneValue(note) {
  const base = NOTE_QT_POS[note.name];
  const offset = ACC_OFFSET[note.accidental] || 0;
  return base + offset + (note.octave - 4) * 24;
}

/**
 * Calculate intervals between consecutive scale notes in quarter-tone steps.
 */
export function getIntervals(notes) {
  const intervals = [];
  for (let i = 0; i < notes.length - 1; i++) {
    const diff =
      getQuarterToneValue(notes[i + 1]) - getQuarterToneValue(notes[i]);
    intervals.push(diff);
  }
  return intervals;
}

/**
 * Human-readable interval label in tones.
 * 2 qt = ½ tone, 3 qt = ¾ tone, 4 qt = 1 tone, etc.
 */
export function intervalLabel(qt) {
  switch (qt) {
    case 2:
      return '½';
    case 3:
      return '¾';
    case 4:
      return '1';
    case 5:
      return '1¼';
    case 6:
      return '1½';
    default:
      return (qt / 4).toFixed(qt % 4 === 0 ? 0 : 2);
  }
}

/**
 * Whether an interval involves a quarter tone (¾ or 1¼).
 */
export function isQuarterToneInterval(qt) {
  return qt === 3 || qt === 5;
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
