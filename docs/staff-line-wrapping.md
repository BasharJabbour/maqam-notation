# Staff line wrapping — implementation plan

This document tracks the work needed to wrap the music staff onto multiple
systems (lines) when notes don't fit horizontally. The goal is for the score
to flow like a real music sheet: as you add more notes, new lines appear
below the previous one, wrapping at measure (bar-line) boundaries.

## Status

| Layer | Description | Status |
| ----- | ----------- | ------ |
| 1 | Container-aware renderer (single line, fills the viewport, resizes) | **Done** |
| 2 | Split notes into systems, wrapping at measure boundaries | **Done** |
| 3 | Render the multi-system layout (multiple staves stacked vertically) | **Done** |

All three layers shipped. The sections below are the design notes that
informed the implementation, kept for reference; see `src/components/StaffVex.jsx`
for the code.

## Design decisions (already settled)

These were agreed up-front and shouldn't be re-litigated unless the product
direction changes:

- **Wrap only at measure boundaries.** Never mid-measure — that isn't how
  music notation works.
- **Line height between systems: 110 px.** Comfortable, score-like spacing.
- **Time signature: standard convention.** Drawn on the first line only,
  redrawn on any later line where the meter changes (not relevant today
  because the meter is fixed for the whole score, but design for it).
- **Clef and key signature: redrawn on every line.** Standard convention.
- **Measures-per-line: fully automatic.** Driven by available width. No
  manual override in v1.
- **Pathological case (one measure too wide to fit):** allow it to overflow.
  `.sheet-container` already has `overflow-x: auto` as the safety net.

## Layer 2 — Split notes into systems

All work happens inside `src/components/StaffVex.jsx`, in the main draw
effect. The existing measure-boundary logic (that inserts `BarNote`s) is the
starting point — we already know where measures end, we just need to keep
the groupings.

Steps:

1. **Group `scoreNotes` into measures.** Reuse the existing beat-counting
   loop, but instead of producing one flat `tickables` array with `BarNote`s
   inside, produce an array of measures, where each measure is an array of
   `StaveNote`s (no `BarNote`s — the bar line will be drawn by the next
   stave's left edge).
2. **Pre-compute per-measure minimum width.** For each measure, build a
   throwaway `Voice` and call
   `Formatter.preCalculateMinTotalWidth([voice])` to get the pixel width
   the measure needs at its tightest. Add a small per-measure padding
   constant (e.g. 20 px) for breathing room.
3. **Reserve space for line-start modifiers.** Each line needs:
   - clef width (~30 px),
   - key signature width (use the existing `keySigSpace` calculation —
     extract it into a small helper since both layers need it),
   - time signature width on line 0 only (~25 px),
   - left + right margin on the stave (~20 px total).
4. **Greedy line packing.** Walk the measures in order, accumulating into
   the current line until the next measure would exceed
   `width - lineStartReserve`. Then start a new line. Always allow at
   least one measure per line (otherwise we'd infinite-loop on a
   too-wide measure — let it overflow horizontally instead).
5. **Stretch factor.** Once measures are assigned to a line, the line's
   spare width should be distributed proportionally to each measure's
   min-width. Pass each measure's allotted width to `Formatter.format`
   in Layer 3.

Output of Layer 2: an array of `lines`, each shaped like

```js
{
  measures: [{ tickables: [...], width: number }, ...],
  totalNotesWidth: number,  // space available for notes on this line
  isFirstLine: boolean,
}
```

## Layer 3 — Render the multi-system layout

Once `lines` exists, rendering is mostly a loop around the current draw
code:

1. **Resize the renderer.** Before drawing anything:
   `renderer.resize(width, topPadding + lines.length * LINE_HEIGHT + bottomPadding)`
   where `LINE_HEIGHT = 110`.
2. **For each line, create a `Stave`** at
   `(x=10, y=topPadding + i * LINE_HEIGHT, width=width - 20)`.
   - Always add a clef.
   - Always redraw the custom key-signature glyphs (factor the existing
     glyph-drawing code into a helper that takes `stave` and `context`).
   - Add the time signature on line 0 only (and on lines where meter
     changes, when that feature exists).
3. **For each measure on the line, build a `Voice`** (one voice per
   measure is cleanest) and call `Formatter.format([voice], measureWidth)`
   against that measure's allotted width. Then draw against the line's
   stave. Use the per-measure x-offset returned by your stretch calculation
   to position the formatter's starting x.
   - Alternative: one `Voice` per *line* containing all that line's
     tickables (including internal `BarNote`s). Either works; per-measure
     is simpler to reason about for stretch math.
4. **Keep the `staff` class on the `<svg>`.** There's still only one SVG
   element — Export SVG keeps working unchanged.

## Things explicitly out of scope

- Beaming across line breaks (we currently render eighths un-beamed anyway).
- Soft-wrap inside a measure (musically wrong; never needed).
- Automatic line breaks at musical phrase boundaries.
- Manual "measures per line" override.
- Pickup measures / partial-measure starts.

## Mobile notes

Layer 1 already makes the staff fill the viewport on mobile and reduces
`.sheet-container` padding below 700 px. Once Layer 2/3 lands, also:

- Consider reducing the per-note padding constant used in the stretch
  calculation when `width < 500 px`, so 1–2 measures still fit comfortably.
- The grid in `index.css` already collapses to a single column below
  1100 px, so the sheet area gets the full viewport width on phones — no
  layout changes needed there.

## Files touched (expected)

- `src/components/StaffVex.jsx` — most of the change. Probably ~80–120 new
  lines of layout logic. Extract helpers if it gets unwieldy:
  - `groupIntoMeasures(scoreNotes, timeSignature)`
  - `computeKeySigSpace(accidentals)` (already inline today; factor out)
  - `drawKeySignature(context, stave, keySigAccs)` (already inline today)
  - `packLinesGreedy(measures, lineWidth, firstLineReserve, otherLineReserve)`
- `src/styles/index.css` — possibly bump `.sheet-panel { min-height }` if
  the dynamic SVG height looks awkward when very short.
- No changes expected in `MusicSheet.jsx` or `App.jsx`.
