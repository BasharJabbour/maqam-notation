// ============================================================
// ACCIDENTAL TYPES
// ============================================================
// 24-TET accidentals used in Arabic maqam notation.
// Standard Western notation only supports flat/sharp/natural.
// Arabic music adds half-flat, half-sharp, three-quarter-flat,
// and three-quarter-sharp to notate quarter-tone intervals.

export const ACC = {
  NATURAL: 0,
  HALF_FLAT: 1,
  FLAT: 2,
  HALF_SHARP: 3,
  SHARP: 4,
  THREE_Q_FLAT: 5,
  THREE_Q_SHARP: 6,
};

export const ACC_LABELS = {
  [ACC.NATURAL]: '♮',
  [ACC.FLAT]: '♭',
  [ACC.SHARP]: '♯',
  [ACC.HALF_FLAT]: '½♭',
  [ACC.HALF_SHARP]: '½♯',
  [ACC.THREE_Q_FLAT]: '¾♭',
  [ACC.THREE_Q_SHARP]: '¾♯',
};

// Two notation styles for quarter-tone accidentals:
//   'symbol' — uses dedicated glyphs (slashed flat, single-stroke sharp, etc.)
//   'plusminus' — appends +/- to standard sharp/flat (♯+, ♭-, etc.)
export const NOTATION_STYLES = {
  symbol: 'symbol',
  plusminus: 'plusminus',
};

// Short labels shown beneath notes on the staff
export const ACC_SHORT_SYMBOL = {
  [ACC.NATURAL]: '',
  [ACC.FLAT]: '♭',
  [ACC.SHARP]: '♯',
  [ACC.HALF_FLAT]: '½♭',
  [ACC.HALF_SHARP]: '½♯',
  [ACC.THREE_Q_FLAT]: '¾♭',
  [ACC.THREE_Q_SHARP]: '¾♯',
};

export const ACC_SHORT_PLUSMINUS = {
  [ACC.NATURAL]: '',
  [ACC.FLAT]: '♭',
  [ACC.SHARP]: '♯',
  [ACC.HALF_FLAT]: '♭−',
  [ACC.HALF_SHARP]: '♯+',
  [ACC.THREE_Q_FLAT]: '♭+',
  [ACC.THREE_Q_SHARP]: '♯++',
};

export function getAccShort(style) {
  return style === NOTATION_STYLES.plusminus
    ? ACC_SHORT_PLUSMINUS
    : ACC_SHORT_SYMBOL;
}

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

// ============================================================
// MAQAM PRESETS
// ============================================================
// Each maqam defines:
//   arabic  - Arabic name in Arabic script
//   tonic   - Default root note
//   accidentals - Map of { note: accidental } for the key signature
//   jins    - The two primary ajnas (tetrachords) that compose the maqam

export const MAQAMAT = {
  Rast: {
    arabic: 'رَسْت',
    tonic: 'C',
    accidentals: { C: 0, D: 0, E: 1, F: 0, G: 0, A: 0, B: 1 },
    jins: ['Rast', 'Nahawand'],
  },
  Bayati: {
    arabic: 'بَيَاتِي',
    tonic: 'D',
    accidentals: { C: 0, D: 0, E: 1, F: 0, G: 0, A: 0, B: 2 },
    jins: ['Bayati', 'Nahawand'],
  },
  Nahawand: {
    arabic: 'نَهَاوَنْد',
    tonic: 'C',
    accidentals: { C: 0, D: 0, E: 2, F: 0, G: 0, A: 2, B: 2 },
    jins: ['Nahawand', 'Kurd'],
  },
  Hijaz: {
    arabic: 'حِجَاز',
    tonic: 'D',
    accidentals: { C: 0, D: 0, E: 2, F: 4, G: 0, A: 0, B: 2 },
    jins: ['Hijaz', 'Nahawand'],
  },
  Saba: {
    arabic: 'صَبَا',
    tonic: 'D',
    accidentals: { C: 0, D: 0, E: 1, F: 0, G: 2, A: 0, B: 2 },
    jins: ['Saba', 'Hijaz'],
  },
  Sikah: {
    arabic: 'سِيكَاه',
    tonic: 'E',
    accidentals: { C: 0, D: 0, E: 1, F: 0, G: 0, A: 0, B: 1 },
    jins: ['Sikah', 'Rast'],
  },
  Ajam: {
    arabic: 'عَجَم',
    tonic: 'C',
    accidentals: { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 },
    jins: ['Ajam', 'Ajam'],
  },
  Kurd: {
    arabic: 'كُرْد',
    tonic: 'D',
    accidentals: { C: 0, D: 0, E: 2, F: 0, G: 0, A: 0, B: 2 },
    jins: ['Kurd', 'Nahawand'],
  },
  Jiharkah: {
    arabic: 'جِهَارْكَاه',
    tonic: 'F',
    accidentals: { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 1 },
    jins: ['Jiharkah', 'Rast'],
  },
  Huzam: {
    arabic: 'هُزَام',
    tonic: 'E',
    accidentals: { C: 0, D: 0, E: 1, F: 0, G: 0, A: 2, B: 1 },
    jins: ['Sikah', 'Hijaz'],
  },
};

// The accidentals available in the custom key editor
export const EDITABLE_ACCIDENTALS = [
  ACC.NATURAL,
  ACC.HALF_FLAT,
  ACC.FLAT,
  ACC.HALF_SHARP,
  ACC.SHARP,
];
