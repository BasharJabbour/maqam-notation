import React from 'react';
import { ACC, NOTES, NOTATION_STYLES, getAccShort } from '../lib/maqam-data';
import { isMicrotonal } from '../lib/music-theory';

const STAFF_TOP = 80;
const LINE_GAP = 14;
const STAFF_LINES = 5;
const WIDTH = 780;
const HEIGHT = 280;

/**
 * Calculate Y position for a note on the treble clef staff.
 * Lines from top: F5, D5, B4, G4, E4
 */
function noteY(name, octave) {
  const stepMap = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
  const step = stepMap[name] + (octave - 4) * 7;
  const f5Step = 10; // F5 = top line
  return STAFF_TOP + (f5Step - step) * (LINE_GAP / 2);
}

/**
 * SVG path-based accidental glyphs.
 * We draw these manually instead of relying on Unicode because the musical
 * quarter-tone symbols (U+1D132, U+1D133) are missing from most system fonts.
 *
 * Two styles are supported:
 *   'symbol'    — dedicated glyphs (slashed flat, single-stroke sharp, etc.)
 *   'plusminus'  — standard ♭/♯ with a +/− suffix
 */
function AccidentalGlyph({ acc, x, y, scale = 1, notationStyle = 'symbol' }) {
  const ink = '#1a1511';
  const micro = '#8b4513';

  // Standard flat path (reused)
  const flatPath = (color) => (
    <path
      d="M-2,-14 L-2,8 C-2,8 6,4 6,0 C6,-4 -2,-6 -2,-4"
      fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"
    />
  );

  // Standard sharp lines (reused)
  const sharpLines = (color) => (
    <>
      <line x1="-3" y1="-12" x2="-3" y2="12" stroke={color} strokeWidth="1.5" />
      <line x1="3" y1="-12" x2="3" y2="12" stroke={color} strokeWidth="1.5" />
      <line x1="-6" y1="-2" x2="6" y2="-5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="-6" y1="5" x2="6" y2="2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </>
  );

  // ── Symbol-style glyphs ──────────────────────────────────
  const symbolGlyphs = {
    [ACC.FLAT]: (
      <g transform={`translate(${x},${y}) scale(${scale})`}>
        {flatPath(ink)}
      </g>
    ),
    [ACC.SHARP]: (
      <g transform={`translate(${x},${y}) scale(${scale})`}>
        {sharpLines(ink)}
      </g>
    ),
    [ACC.HALF_FLAT]: (
      <g transform={`translate(${x},${y}) scale(${scale})`}>
        {flatPath(micro)}
        <line x1="-5" y1="4" x2="5" y2="-8" stroke={micro} strokeWidth="1.5" strokeLinecap="round" />
      </g>
    ),
    [ACC.HALF_SHARP]: (
      <g transform={`translate(${x},${y}) scale(${scale})`}>
        <line x1="0" y1="-12" x2="0" y2="12" stroke={micro} strokeWidth="1.5" />
        <line x1="-6" y1="-2" x2="6" y2="-5" stroke={micro} strokeWidth="2" strokeLinecap="round" />
        <line x1="-6" y1="5" x2="6" y2="2" stroke={micro} strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
    [ACC.THREE_Q_FLAT]: (
      <g transform={`translate(${x},${y}) scale(${scale})`}>
        <path d="M1,-14 L1,8 C1,8 9,4 9,0 C9,-4 1,-6 1,-4" fill="none" stroke={micro} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M-1,-14 L-1,8 C-1,8 -9,4 -9,0 C-9,-4 -1,-6 -1,-4" fill="none" stroke={micro} strokeWidth="1.6" strokeLinecap="round" />
      </g>
    ),
    [ACC.THREE_Q_SHARP]: (
      <g transform={`translate(${x},${y}) scale(${scale})`}>
        <line x1="-4" y1="-12" x2="-4" y2="12" stroke={micro} strokeWidth="1.3" />
        <line x1="0" y1="-12" x2="0" y2="12" stroke={micro} strokeWidth="1.3" />
        <line x1="4" y1="-12" x2="4" y2="12" stroke={micro} strokeWidth="1.3" />
        <line x1="-7" y1="-2" x2="7" y2="-5" stroke={micro} strokeWidth="2" strokeLinecap="round" />
        <line x1="-7" y1="5" x2="7" y2="2" stroke={micro} strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  };

  return symbolGlyphs[acc] || null;
}

export default function StaffSVG({ notes, accidentals, notationStyle = 'symbol' }) {
  // Collect non-natural key signature accidentals
  const keyAccidentals = NOTES.filter((n) => accidentals[n] !== ACC.NATURAL).map(
    (n) => ({ note: n, acc: accidentals[n] }),
  );

  // Determine octave placement for key sig accidentals to keep them in staff
  function keySigY(noteName) {
    let oct = ['C', 'D', 'E'].includes(noteName) ? 5 : ['F', 'G'].includes(noteName) ? 5 : 4;
    let y = noteY(noteName, oct);
    if (y < STAFF_TOP - LINE_GAP) { oct--; y = noteY(noteName, oct); }
    if (y > STAFF_TOP + LINE_GAP * 5) { oct++; y = noteY(noteName, oct); }
    return y;
  }

  let keySigX = 88;
  const keySigElements = keyAccidentals.map((ka, i) => {
    const x = keySigX + i * 20;
    return (
      <AccidentalGlyph key={`ks-${i}`} acc={ka.acc} x={x} y={keySigY(ka.note)} notationStyle={notationStyle} />
    );
  });

  const startX = Math.max(keySigX + keyAccidentals.length * 20 + 30, 160);
  const noteSpacing = (WIDTH - 60 - startX) / (notes.length - 1);

  return (
    <svg
      className="staff"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Staff lines */}
      {Array.from({ length: STAFF_LINES }, (_, i) => (
        <line
          key={`sl-${i}`}
          x1="40"
          y1={STAFF_TOP + i * LINE_GAP}
          x2={WIDTH - 30}
          y2={STAFF_TOP + i * LINE_GAP}
          stroke="#3a342c"
          strokeWidth="1"
          strokeOpacity="0.6"
        />
      ))}

      {/* Treble clef */}
      <text
        x="52"
        y={STAFF_TOP + LINE_GAP * 2.5}
        fontSize="62"
        fontFamily="serif"
        fill="#1a1511"
        textAnchor="middle"
        dominantBaseline="central"
        opacity="0.85"
      >
        𝄞
      </text>

      {/* Key signature */}
      {keySigElements}

      {/* Opening bar line */}
      <line
        x1={startX - 15}
        y1={STAFF_TOP}
        x2={startX - 15}
        y2={STAFF_TOP + LINE_GAP * 4}
        stroke="#3a342c"
        strokeWidth="1.5"
      />

      {/* Notes */}
      {notes.map((note, i) => {
        const x = startX + i * noteSpacing;
        const y = noteY(note.name, note.octave);
        const micro = isMicrotonal(note.accidental);
        const stemUp = y > STAFF_TOP + LINE_GAP * 2;

        // Ledger lines
        const ledgers = [];
        if (y > STAFF_TOP + LINE_GAP * 4 + 2) {
          for (let ly = STAFF_TOP + LINE_GAP * 5; ly <= y + 1; ly += LINE_GAP) {
            ledgers.push(
              <line
                key={`ll-${i}-${ly}`}
                x1={x - 14}
                y1={ly}
                x2={x + 14}
                y2={ly}
                stroke="#3a342c"
                strokeWidth="1"
                strokeOpacity="0.5"
              />,
            );
          }
        }
        if (y < STAFF_TOP - 2) {
          for (let ly = STAFF_TOP - LINE_GAP; ly >= y - 1; ly -= LINE_GAP) {
            ledgers.push(
              <line
                key={`ll-${i}-${ly}`}
                x1={x - 14}
                y1={ly}
                x2={x + 14}
                y2={ly}
                stroke="#3a342c"
                strokeWidth="1"
                strokeOpacity="0.5"
              />,
            );
          }
        }

        const accShort = getAccShort(notationStyle);
        const displayName = note.name + accShort[note.accidental];
        const labelY = STAFF_TOP + LINE_GAP * 4 + 45;

        return (
          <g key={`note-${i}`}>
            {ledgers}

            {/* Note head */}
            <ellipse
              className="note-highlight"
              cx={x}
              cy={y}
              rx={7.5}
              ry={5.5}
              fill={micro ? '#8b4513' : '#1a1511'}
              transform={`rotate(-8 ${x} ${y})`}
            />

            {/* Stem */}
            {stemUp ? (
              <line
                x1={x + 7}
                y1={y}
                x2={x + 7}
                y2={y - 35}
                stroke="#1a1511"
                strokeWidth="1.3"
              />
            ) : (
              <line
                x1={x - 7}
                y1={y}
                x2={x - 7}
                y2={y + 35}
                stroke="#1a1511"
                strokeWidth="1.3"
              />
            )}

            {/* Inline accidental */}
            {note.accidental !== ACC.NATURAL && (
              <AccidentalGlyph acc={note.accidental} x={x - 18} y={y} scale={0.85} notationStyle={notationStyle} />
            )}

            {/* Note label */}
            <text
              x={x}
              y={labelY}
              fontFamily="'DM Sans', sans-serif"
              fontSize="11"
              fill={micro ? '#8b4513' : '#8a8078'}
              textAnchor="middle"
              fontWeight="500"
            >
              {displayName}
            </text>
          </g>
        );
      })}

      {/* Closing double bar */}
      <line
        x1={WIDTH - 35}
        y1={STAFF_TOP}
        x2={WIDTH - 35}
        y2={STAFF_TOP + LINE_GAP * 4}
        stroke="#3a342c"
        strokeWidth="2.5"
      />
      <line
        x1={WIDTH - 40}
        y1={STAFF_TOP}
        x2={WIDTH - 40}
        y2={STAFF_TOP + LINE_GAP * 4}
        stroke="#3a342c"
        strokeWidth="1"
      />
    </svg>
  );
}
