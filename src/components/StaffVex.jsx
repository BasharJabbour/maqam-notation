import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Renderer,
  Stave,
  Voice,
  Formatter,
  Element,
  BarNote,
  StaveModifier,
  Clef,
  TimeSignature,
} from 'vexflow';
import { glyphFor } from '../lib/maqam-data';
import {
  computeStaffLayout,
  buildStaveNote,
  STAVE_LEFT,
  KEYSIG_GLYPH_WIDTH,
  KEYSIG_PAD_LEFT,
} from '../lib/staff-layout';

// Draw the custom microtonal key signature. VexFlow can't render these
// accidentals as a real key signature, so we place the glyphs by hand just
// after the clef. Needs a live rendering context + laid-out stave, so it
// stays here rather than in the pure layout module.
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

    // All layout decisions happen in the pure layout module; this effect only
    // walks the resulting plan and draws it.
    const {
      width,
      totalHeight,
      maxStaveWidth,
      keySigAccs,
      keySigSpace,
      measureGroups,
      lines,
    } = computeStaffLayout({ scoreNotes, accidentals, timeSignature, containerWidth });

    host.innerHTML = '';
    const renderer = new Renderer(host, Renderer.Backends.SVG);
    renderer.resize(width, totalHeight);
    const context = renderer.getContext();
    context.setFont('DM Sans, serif', 11);

    lines.forEach((line) => {
      const { isFirst, y, formatWidth } = line;

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
