import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Renderer,
  Stave,
  StaveNote,
  Accidental,
  Voice,
  Formatter,
  Element,
  BarNote,
  StaveModifier,
  Clef,
  TimeSignature,
} from 'vexflow';
import { ACC, NOTES, ACC_TO_VEX, glyphFor } from '../lib/maqam-data';
import { isMicrotonal } from '../lib/music-theory';

// Treble-clef line positions for key-signature accidentals.
// Chosen to keep every glyph on or adjacent to the 5-line staff
// (G5 would be above the top line, so G uses G4 instead, etc.).
const TREBLE_KEYSIG_LINE = {
  C: 1.5,
  D: 1,
  E: 0.5,
  F: 0,
  G: 3,
  A: 2.5,
  B: 2,
};

// VexFlow duration codes and their weights in quarter-beat units.
const DURATION_CODE = {
  whole: 'w',
  half: 'h',
  quarter: 'q',
  eighth: '8',
};
const DURATION_BEATS = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
};

// Minimum width below which the staff can't usefully render (clef + time sig
// + a couple of notes won't fit). At narrower viewports we let the parent
// container scroll horizontally instead.
const MIN_WIDTH = 280;

// Single-line height is preserved at this minimum so short scores look the
// same as before. Taller scores grow as needed.
const MIN_HEIGHT = 220;

// Multi-system layout.
const TOP_PAD = 30; // y of the first stave
const LINE_HEIGHT = 110; // vertical spacing between staves
const BOTTOM_PAD = 100; // space below the last stave for stems + breathing room
const STAVE_LEFT = 10; // x of every stave
const STAVE_RIGHT_MARGIN = 10; // gap between stave right edge and SVG right edge

// Approximate widths reserved by line-start modifiers. These don't have to
// match VexFlow's actual values exactly — they only steer line packing.
const CLEF_WIDTH = 30;
const TIME_SIG_WIDTH = 25;

// Uniform note-spacing multiplier. The formatter's `preCalculateMinTotalWidth`
// gives the tightest legible width for a measure; multiplying by this constant
// applies the same breathing room to *every* line so density stays consistent
// whether a line is full or only has a few notes.
const NOTE_STRETCH = 1.5;

// Small extra space added per measure when packing (covers the BarNote glyph
// between measures and a touch of breathing room).
const INTER_MEASURE_GAP = 12;

// Pad between the last note on a line and the stave's closing barline.
const TRAILING_PAD = 30;

const INK = '#1a1511';
const MICRO = '#8b4513';

// Approx width reserved per key-signature glyph (px).
const KEYSIG_GLYPH_WIDTH = 14;
const KEYSIG_PAD_LEFT = 4;
const KEYSIG_PAD_RIGHT = 8;

// ============================================================
// Helpers
// ============================================================

function computeKeySigAccs(accidentals) {
  return NOTES
    .filter((n) => accidentals && accidentals[n] !== ACC.NATURAL)
    .map((n) => ({
      note: n,
      acc: accidentals[n],
      vex: ACC_TO_VEX[accidentals[n]],
      line: TREBLE_KEYSIG_LINE[n],
      color: isMicrotonal(accidentals[n]) ? MICRO : INK,
    }));
}

function keySigSpaceFor(keySigAccs) {
  if (keySigAccs.length === 0) return 0;
  return keySigAccs.length * KEYSIG_GLYPH_WIDTH + KEYSIG_PAD_LEFT + KEYSIG_PAD_RIGHT;
}

function drawKeySignatureGlyphs(context, stave, keySigAccs) {
  if (keySigAccs.length === 0) return;
  const clefs = stave.getModifiers(StaveModifier.Position.BEGIN, Clef.CATEGORY);
  const clef = clefs && clefs[0];
  const clefEndX = clef ? clef.getX() + clef.getWidth() : stave.getX() + 28;
  const keySigStartX = clefEndX + KEYSIG_PAD_LEFT;
  keySigAccs.forEach((ka, i) => {
    const glyph = new Element('Accidental');
    glyph.setText(glyphFor(ka.vex));
    glyph.setStyle({ fillStyle: ka.color, strokeStyle: ka.color });
    const x = keySigStartX + i * KEYSIG_GLYPH_WIDTH;
    const y = stave.getYForLine(ka.line);
    context.save();
    glyph.applyStyle(context);
    glyph.renderText(context, x, y);
    context.restore();
  });
}

// Build a single VexFlow StaveNote for one scoreNotes entry. StaveNotes are
// stateful (the formatter mutates them), so we build fresh ones each time
// we need to lay out — once for min-width pre-calculation and again for the
// final render.
function buildStaveNote(entry) {
  const durCode = DURATION_CODE[entry.duration] || 'q';

  if (entry.kind === 'rest') {
    return new StaveNote({ keys: ['b/4'], duration: `${durCode}r` });
  }

  const key = `${entry.name.toLowerCase()}/${entry.octave}`;
  const sn = new StaveNote({ keys: [key], duration: durCode });

  // Naturals carry no explicit accidental glyph on the note head (the custom
  // key signature already establishes the default), so only non-naturals add
  // a modifier.
  const vexAcc = ACC_TO_VEX[entry.accidental];
  if (entry.accidental !== ACC.NATURAL && vexAcc) {
    sn.addModifier(new Accidental(vexAcc), 0);
  }

  const micro = isMicrotonal(entry.accidental);
  sn.setStyle({
    fillStyle: micro ? MICRO : INK,
    strokeStyle: micro ? MICRO : INK,
  });
  return sn;
}

// Group `scoreNotes` into measures by accumulating durations.
// Each group carries `entries`, `beatsUsed`, and `isComplete` so the packer
// can treat partial measures specially (see measurePackingWidths below).
function groupIntoMeasures(scoreNotes, timeSignature) {
  const { numerator, denominator } = timeSignature;
  const beatsPerMeasure = (numerator * 4) / denominator;
  const measures = [];
  let current = [];
  let beats = 0;

  scoreNotes.forEach((entry) => {
    current.push(entry);
    beats += DURATION_BEATS[entry.duration] || 1;
    if (beats >= beatsPerMeasure - 1e-9) {
      measures.push({ entries: current, beatsUsed: beats, isComplete: true });
      current = [];
      beats = 0;
    }
  });

  if (current.length > 0) {
    measures.push({ entries: current, beatsUsed: beats, isComplete: false });
  }
  return measures;
}

// Returns the minimum pixel width VexFlow needs to render this measure's
// notes (not counting clef / key sig / time sig — those are reserved
// separately by the caller).
function computeMeasureMinWidth(entries, timeSignature) {
  if (entries.length === 0) return 0;
  const { numerator, denominator } = timeSignature;
  const tickables = entries.map(buildStaveNote);
  const voice = new Voice({ numBeats: numerator, beatValue: denominator })
    .setMode(Voice.Mode.SOFT);
  voice.addTickables(tickables);
  const f = new Formatter();
  f.joinVoices([voice]);
  return f.preCalculateMinTotalWidth([voice]);
}

// Greedy line packer. Walks through measures and assigns each to the
// current line if it fits in that line's notes-area budget, otherwise
// starts a new line. Always assigns at least one measure per line so a
// single oversized measure can't loop forever (the caller has already
// widened the canvas to accommodate it in that case).
//
// Per-measure cost uses the *stretched* min width — the same factor used
// at render time — so packing and rendering agree on how much room each
// measure actually takes.
function packLinesGreedy(measureMinWidths, firstLineBudget, otherLineBudget) {
  const lines = [];
  let i = 0;

  while (i < measureMinWidths.length) {
    const isFirst = lines.length === 0;
    const budget = isFirst ? firstLineBudget : otherLineBudget;
    const measureIndices = [];
    let used = 0;

    while (i < measureMinWidths.length) {
      const required =
        measureMinWidths[i] * NOTE_STRETCH +
        (measureIndices.length > 0 ? INTER_MEASURE_GAP : 0);
      if (measureIndices.length > 0 && used + required > budget) break;
      measureIndices.push(i);
      used += required;
      i += 1;
    }

    lines.push({ measureIndices, isFirst });
  }

  return lines;
}

// ============================================================
// Component
// ============================================================

export default function StaffVex({ scoreNotes, accidentals, timeSignature }) {
  const hostRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Track the host element's width so the staff fills the available space
  // and re-renders when the viewport / side panel resizes.
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const measure = () => {
      const w = host.clientWidth;
      if (w > 0) setContainerWidth(w);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (containerWidth <= 0) return;

    const { numerator, denominator } = timeSignature;
    const keySigAccs = computeKeySigAccs(accidentals);
    const keySigSpace = keySigSpaceFor(keySigAccs);

    // Reserved (non-notes) width on each line: stave margins + clef + key sig.
    // The first line additionally reserves space for the time signature.
    const baseReserved =
      STAVE_LEFT + STAVE_RIGHT_MARGIN + CLEF_WIDTH + keySigSpace;
    const firstLineReserved = baseReserved + TIME_SIG_WIDTH;
    const otherLineReserved = baseReserved;

    const beatsPerMeasure = (numerator * 4) / denominator;

    // Group notes into measures and pre-calculate each measure's min width.
    const measureGroups = groupIntoMeasures(scoreNotes || [], timeSignature);
    const measureMinWidths = measureGroups.map((m) =>
      computeMeasureMinWidth(m.entries, timeSignature)
    );

    // Packing widths: for complete measures this equals measureMinWidths[i].
    // For the partial (last) measure, we scale up to what a full measure of
    // that density would cost. This means a partial measure is always
    // assigned to the same line it would land on when complete — no measure
    // ever "jumps" to the next line mid-addition as the user adds notes.
    const measurePackingWidths = measureGroups.map((m, i) => {
      if (m.isComplete || m.beatsUsed <= 0) return measureMinWidths[i];
      return measureMinWidths[i] * (beatsPerMeasure / m.beatsUsed);
    });

    // If a single measure can't fit in the available width, expand the
    // canvas instead of crushing the notes. `.sheet-container` already has
    // `overflow-x: auto` to provide the scrolling.
    const widestPackingWidth = measurePackingWidths.length
      ? Math.max(...measurePackingWidths) * NOTE_STRETCH + TRAILING_PAD
      : 0;
    const minNeededWidth = widestPackingWidth
      ? widestPackingWidth + Math.max(firstLineReserved, otherLineReserved)
      : MIN_WIDTH;
    const width = Math.max(containerWidth, MIN_WIDTH, minNeededWidth);

    // Pack measures into lines using the scaled packing widths (not the
    // actual render widths) so partial measures are assigned stably.
    const packedLines = packLinesGreedy(
      measurePackingWidths,
      width - firstLineReserved,
      width - otherLineReserved
    );

    // When the score is empty, still render a single empty staff with
    // clef + key sig + time sig (matches the prior behaviour).
    const lines = packedLines.length > 0
      ? packedLines
      : [{ measureIndices: [], isFirst: true }];

    // Total height grows with the number of lines, but never below the
    // single-line minimum so the panel doesn't suddenly collapse.
    const totalHeight = Math.max(
      MIN_HEIGHT,
      TOP_PAD + (lines.length - 1) * LINE_HEIGHT + BOTTOM_PAD
    );

    host.innerHTML = '';
    const renderer = new Renderer(host, Renderer.Backends.SVG);
    renderer.resize(width, totalHeight);
    const context = renderer.getContext();
    context.setFont('DM Sans, serif', 11);

    const maxStaveWidth = width - STAVE_LEFT - STAVE_RIGHT_MARGIN;

    lines.forEach((line, lineIdx) => {
      const isFirst = line.isFirst;
      const y = TOP_PAD + lineIdx * LINE_HEIGHT;

      // Always use full container width so every staff line reaches the
      // right edge. Notes are formatted to their constant-spaced width
      // (not stretched to fill), leaving the remainder as blank staff.
      const stave = new Stave(STAVE_LEFT, y, maxStaveWidth);
      stave.addClef('treble');
      if (isFirst) {
        stave.addTimeSignature(`${numerator}/${denominator}`);
      }

      // Grab the time signature modifier so we can shift it right to make
      // room for the custom microtonal key signature (VexFlow 5's
      // TimeSignature.draw() uses `this.x` directly).
      const timeSigs = isFirst
        ? stave.getModifiers(StaveModifier.Position.BEGIN, TimeSignature.CATEGORY)
        : null;
      const timeSig = timeSigs && timeSigs[0];

      stave.setContext(context);
      // Force initial layout so clef/time positions and note start are known.
      stave.getNoteStartX();

      if (keySigSpace > 0) {
        if (timeSig) {
          timeSig.setX(timeSig.getX() + keySigSpace);
        }
        stave.setNoteStartX(stave.getNoteStartX() + keySigSpace);
      }

      stave.draw();
      drawKeySignatureGlyphs(context, stave, keySigAccs);

      if (line.measureIndices.length === 0) return;

      // Build fresh StaveNotes for the final render (the ones used for
      // min-width pre-calculation have been mutated by the formatter and
      // shouldn't be reused). Insert BarNotes between measures — the
      // stave's own right barline closes the last measure on the line.
      const tickables = [];
      line.measureIndices.forEach((mIdx, i) => {
        const entries = measureGroups[mIdx].entries;
        const notes = entries.map(buildStaveNote);
        tickables.push(...notes);
        if (i < line.measureIndices.length - 1) {
          tickables.push(new BarNote());
        }
      });

      const voice = new Voice({ numBeats: numerator, beatValue: denominator })
        .setMode(Voice.Mode.SOFT);
      voice.addTickables(tickables);

      // Format notes to their natural stretched width — not the full stave
      // width — so density is the same on every line, full or partial.
      const lineMinWidth = line.measureIndices.reduce(
        (sum, idx) => sum + measureMinWidths[idx],
        0
      );
      const numInterMeasureGaps = Math.max(0, line.measureIndices.length - 1);
      const formatWidth = Math.max(
        50,
        lineMinWidth * NOTE_STRETCH + numInterMeasureGaps * INTER_MEASURE_GAP
      );

      new Formatter()
        .joinVoices([voice])
        .format([voice], formatWidth);

      voice.draw(context, stave);
    });

    const svgEl = host.querySelector('svg');
    if (svgEl) svgEl.classList.add('staff');
  }, [scoreNotes, accidentals, timeSignature, containerWidth]);

  return <div ref={hostRef} className="staff-host" />;
}
