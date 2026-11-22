import { describe, it, expect } from 'vitest';
import { ACC } from './maqam-data';
import {
  groupIntoMeasures,
  packLinesGreedy,
  keySigSpaceFor,
  computeKeySigAccs,
  buildStaveNote,
  computeMeasureMinWidth,
  computeStaffLayout,
} from './staff-layout';

// Small builders to keep the test bodies readable.
const note = (duration = 'quarter', over = {}) => ({
  kind: 'note',
  name: 'C',
  accidental: ACC.NATURAL,
  octave: 4,
  duration,
  ...over,
});
const rest = (duration = 'quarter') => ({ kind: 'rest', duration });
const naturalKey = () => ({ C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 });

describe('groupIntoMeasures', () => {
  const ts44 = { numerator: 4, denominator: 4 };

  it('returns no measures for an empty score', () => {
    expect(groupIntoMeasures([], ts44)).toEqual([]);
  });

  it('packs four quarter notes into one complete 4/4 measure', () => {
    const measures = groupIntoMeasures([note(), note(), note(), note()], ts44);
    expect(measures).toHaveLength(1);
    expect(measures[0].isComplete).toBe(true);
    expect(measures[0].beatsUsed).toBe(4);
    expect(measures[0].entries).toHaveLength(4);
  });

  it('leaves a trailing partial measure incomplete', () => {
    const measures = groupIntoMeasures([note(), note(), note(), note(), note()], ts44);
    expect(measures).toHaveLength(2);
    expect(measures[0].isComplete).toBe(true);
    expect(measures[1].isComplete).toBe(false);
    expect(measures[1].beatsUsed).toBe(1);
    expect(measures[1].entries).toHaveLength(1);
  });

  it('closes a measure exactly on a whole note in 4/4', () => {
    const measures = groupIntoMeasures([note('whole')], ts44);
    expect(measures).toHaveLength(1);
    expect(measures[0].isComplete).toBe(true);
    expect(measures[0].beatsUsed).toBe(4);
  });

  it('uses beats-per-measure from the time signature (6/8 = 3 beats)', () => {
    const ts68 = { numerator: 6, denominator: 8 };
    const sixEighths = Array.from({ length: 6 }, () => note('eighth'));
    const measures = groupIntoMeasures(sixEighths, ts68);
    expect(measures).toHaveLength(1);
    expect(measures[0].isComplete).toBe(true);
    expect(measures[0].beatsUsed).toBe(3);
  });

  it('counts rests toward the measure like notes', () => {
    const measures = groupIntoMeasures([note(), rest(), note(), rest()], ts44);
    expect(measures).toHaveLength(1);
    expect(measures[0].isComplete).toBe(true);
  });
});

describe('packLinesGreedy', () => {
  it('returns no lines for no measures', () => {
    expect(packLinesGreedy([], 400, 400)).toEqual([]);
  });

  it('keeps measures on one line while they fit the budget', () => {
    // Each measure costs min*1.5; gaps of 12 between measures on a line.
    // 100,100 -> 150 + (150+12) = 312 <= 400, both fit.
    const lines = packLinesGreedy([100, 100], 400, 400);
    expect(lines).toHaveLength(1);
    expect(lines[0].measureIndices).toEqual([0, 1]);
    expect(lines[0].isFirst).toBe(true);
  });

  it('wraps to a new line when the budget is exceeded', () => {
    // 100,100,100: line1 takes 0,1 (312), measure 2 would push to 474 > 400.
    const lines = packLinesGreedy([100, 100, 100], 400, 400);
    expect(lines.map((l) => l.measureIndices)).toEqual([[0, 1], [2]]);
    expect(lines[1].isFirst).toBe(false);
  });

  it('honors the separate first-line budget', () => {
    // Narrow first line forces measure 1 onto line 2.
    const lines = packLinesGreedy([100, 100], 160, 400);
    expect(lines.map((l) => l.measureIndices)).toEqual([[0], [1]]);
  });

  it('always places at least one measure per line, even if it overflows', () => {
    // A single oversized measure (1500 > 100 budget) still gets its own line
    // rather than looping forever — the caller widens the canvas for it.
    const lines = packLinesGreedy([1000], 100, 100);
    expect(lines).toHaveLength(1);
    expect(lines[0].measureIndices).toEqual([0]);
  });
});

describe('keySigSpaceFor', () => {
  it('reserves no space when there are no accidentals', () => {
    expect(keySigSpaceFor([])).toBe(0);
  });

  it('reserves glyph width plus left/right padding per accidental', () => {
    // N * 14 + 4 + 8
    expect(keySigSpaceFor([{}])).toBe(26);
    expect(keySigSpaceFor([{}, {}, {}])).toBe(54);
  });
});

describe('computeKeySigAccs', () => {
  it('is empty when every degree is natural', () => {
    expect(computeKeySigAccs(naturalKey())).toEqual([]);
  });

  it('describes each non-natural degree with its VexFlow code and staff line', () => {
    const accs = computeKeySigAccs({ ...naturalKey(), B: ACC.FLAT });
    expect(accs).toHaveLength(1);
    expect(accs[0]).toMatchObject({ note: 'B', acc: ACC.FLAT, vex: 'b', line: 2 });
  });

  it('colors microtonal accidentals differently from diatonic ones', () => {
    const accs = computeKeySigAccs({ ...naturalKey(), E: ACC.HALF_FLAT, B: ACC.FLAT });
    const half = accs.find((a) => a.note === 'E');
    const flat = accs.find((a) => a.note === 'B');
    expect(half.vex).toBe('d');
    expect(half.color).not.toBe(flat.color);
  });
});

describe('buildStaveNote', () => {
  it('adds no accidental modifier to a natural note', () => {
    const sn = buildStaveNote(note('quarter', { accidental: ACC.NATURAL }));
    expect(sn.getModifiers()).toHaveLength(0);
  });

  it('adds one accidental modifier to a flat note', () => {
    const sn = buildStaveNote(note('quarter', { accidental: ACC.FLAT }));
    expect(sn.getModifiers()).toHaveLength(1);
  });

  it('adds one accidental modifier to a microtonal (half-flat) note', () => {
    const sn = buildStaveNote(note('quarter', { accidental: ACC.HALF_FLAT }));
    expect(sn.getModifiers()).toHaveLength(1);
  });

  it('builds a rest without throwing', () => {
    const sn = buildStaveNote(rest('half'));
    expect(sn).toBeTruthy();
  });
});

describe('computeMeasureMinWidth', () => {
  it('is zero for an empty measure', () => {
    expect(computeMeasureMinWidth([], { numerator: 4, denominator: 4 })).toBe(0);
  });

  it('grows with more notes in the measure', () => {
    const ts = { numerator: 4, denominator: 4 };
    const one = computeMeasureMinWidth([note()], ts);
    const four = computeMeasureMinWidth([note(), note(), note(), note()], ts);
    expect(four).toBeGreaterThan(one);
  });
});

describe('computeStaffLayout', () => {
  const ts44 = { numerator: 4, denominator: 4 };

  it('lays out a single empty staff for an empty score', () => {
    const plan = computeStaffLayout({
      scoreNotes: [],
      accidentals: naturalKey(),
      timeSignature: ts44,
      containerWidth: 600,
    });
    expect(plan.measureGroups).toEqual([]);
    expect(plan.lines).toHaveLength(1);
    expect(plan.lines[0].measureIndices).toEqual([]);
    expect(plan.totalHeight).toBe(220); // MIN_HEIGHT
  });

  it('never renders narrower than the minimum width', () => {
    const plan = computeStaffLayout({
      scoreNotes: [],
      accidentals: naturalKey(),
      timeSignature: ts44,
      containerWidth: 50, // below MIN_WIDTH
    });
    expect(plan.width).toBeGreaterThanOrEqual(280); // MIN_WIDTH
  });

  it('reserves key-signature space when accidentals are set', () => {
    const plain = computeStaffLayout({
      scoreNotes: [],
      accidentals: naturalKey(),
      timeSignature: ts44,
      containerWidth: 600,
    });
    const withKey = computeStaffLayout({
      scoreNotes: [],
      accidentals: { ...naturalKey(), B: ACC.FLAT, E: ACC.HALF_FLAT },
      timeSignature: ts44,
      containerWidth: 600,
    });
    expect(plain.keySigSpace).toBe(0);
    expect(withKey.keySigSpace).toBeGreaterThan(0);
    expect(withKey.keySigAccs).toHaveLength(2);
  });

  it('produces one measure group and a well-formed line for a full measure', () => {
    const plan = computeStaffLayout({
      scoreNotes: [note(), note(), note(), note()],
      accidentals: naturalKey(),
      timeSignature: ts44,
      containerWidth: 600,
    });
    expect(plan.measureGroups).toHaveLength(1);
    expect(plan.lines).toHaveLength(1);
    const line = plan.lines[0];
    expect(line.measureIndices).toEqual([0]);
    expect(line.formatWidth).toBeGreaterThan(0);
    expect(typeof line.y).toBe('number');
  });
});
