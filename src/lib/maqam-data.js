// ============================================================
// ACCIDENTAL TYPES
// ============================================================
// 24-TET accidentals used in Arabic maqam notation.
// Standard Western notation only supports flat/sharp/natural.
// Arabic music adds half-flat, half-sharp, three-quarter-flat,
// and three-quarter-sharp to notate quarter-tone intervals.

import { Accidental as VexAccidental } from 'vexflow';

export const ACC = {
  NATURAL: 0,
  HALF_FLAT: 1,
  FLAT: 2,
  HALF_SHARP: 3,
  SHARP: 4,
  THREE_Q_FLAT: 5,
  THREE_Q_SHARP: 6,
};

// UI accidental glyphs.
// Prefer VexFlow's own glyph strings (so the UI matches staff rendering),
// but keep a safe Unicode fallback if VexFlow isn't available.
const ACC_FALLBACK_LABELS = {
  [ACC.NATURAL]: '♮',
  [ACC.FLAT]: '♭',
  [ACC.SHARP]: '♯',
  // Half / three-quarter tones: SMuFL quarter-tone marks (𝄳 𝄲) and double flat/sharp (𝄫 𝄪).
  [ACC.HALF_FLAT]: '𝄳',
  [ACC.HALF_SHARP]: '𝄲',
  [ACC.THREE_Q_FLAT]: '𝄫',
  [ACC.THREE_Q_SHARP]: '𝄪',
};

// Maps our ACC constants to VexFlow accidental codes. This is the single
// source of truth for the ACC → VexFlow relationship — both the UI labels
// here and the staff renderer (StaffVex) read from it, so a new accidental
// only ever needs to be added in one place.
// VexFlow microtonal codes: d = half-flat (Stein), + = half-sharp (Stein),
// db = 3/4 flat (Zimmermann), ++ = 3/4 sharp (Stein).
export const ACC_TO_VEX = {
  [ACC.NATURAL]: 'n',
  [ACC.FLAT]: 'b',
  [ACC.SHARP]: '#',
  [ACC.HALF_FLAT]: 'd',
  [ACC.HALF_SHARP]: '+',
  [ACC.THREE_Q_FLAT]: 'db',
  [ACC.THREE_Q_SHARP]: '++',
};

// Resolve a VexFlow accidental code to its SMuFL glyph string. VexFlow's
// `Tables` class isn't re-exported from the public entry, so we read `.text`
// off a freshly constructed Accidental (its constructor calls
// Tables.accidentalCodes()).
export function glyphFor(vexCode) {
  return new VexAccidental(vexCode).text;
}

export const ACC_LABELS = Object.freeze(
  Object.fromEntries(
    Object.entries(ACC_TO_VEX).map(([k, vexCode]) => {
      const acc = Number(k);
      try {
        return [acc, glyphFor(vexCode)];
      } catch {
        return [acc, ACC_FALLBACK_LABELS[acc]];
      }
    })
  )
);

// Short labels shown beneath notes on the staff
export const ACC_SHORT_SYMBOL = {
  [ACC.NATURAL]: '',
  [ACC.FLAT]: ACC_LABELS[ACC.FLAT],
  [ACC.SHARP]: ACC_LABELS[ACC.SHARP],
  [ACC.HALF_FLAT]: ACC_LABELS[ACC.HALF_FLAT],
  [ACC.HALF_SHARP]: ACC_LABELS[ACC.HALF_SHARP],
  [ACC.THREE_Q_FLAT]: ACC_LABELS[ACC.THREE_Q_FLAT],
  [ACC.THREE_Q_SHARP]: ACC_LABELS[ACC.THREE_Q_SHARP],
};

// Offset in quarter-tone steps from natural
export const ACC_OFFSET = {
  [ACC.NATURAL]: 0,
  [ACC.HALF_FLAT]: -1,
  [ACC.FLAT]: -2,
  [ACC.HALF_SHARP]: 1,
  [ACC.SHARP]: 2,
  [ACC.THREE_Q_FLAT]: -3,
  [ACC.THREE_Q_SHARP]: 3,
};

// ============================================================
// NOTE DEFINITIONS
// ============================================================

export const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Quarter-tone positions from C in 24-TET
// C=0, C#=2, D=4, Eb=6, E=8, F=10, F#=12, G=14, Ab=16, A=18, Bb=20, B=22
export const NOTE_QT_POS = {
  C: 0,
  D: 4,
  E: 8,
  F: 10,
  G: 14,
  A: 18,
  B: 22,
};


// The accidentals available in the custom key editor
export const EDITABLE_ACCIDENTALS = [
  ACC.NATURAL,
  ACC.HALF_FLAT,
  ACC.FLAT,
  ACC.HALF_SHARP,
  ACC.SHARP,
];

/** Letter-name map with every degree natural — default key state. */
export function naturalAccidentals() {
  const acc = {};
  NOTES.forEach((n) => {
    acc[n] = ACC.NATURAL;
  });
  return acc;
}
