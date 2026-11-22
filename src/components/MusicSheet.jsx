import React from 'react';
import StaffVex from './StaffVex';

export default function MusicSheet({
  tonic,
  accidentals,
  timeSignature,
  scoreNotes,
  isPlaying,
  onPlay,
  onExport,
}) {
  const { numerator, denominator } = timeSignature;

  return (
    <div className="sheet-area">
      <div className="panel sheet-panel">
        <div className="sheet-container fade-in">
          <div className="sheet-title-area">
            <div className="sheet-maqam-name">Score</div>
            <div className="sheet-maqam-arabic">مقطوعة</div>
            <div className="sheet-meta">
              Tonic: {tonic} · {scoreNotes.length} note{scoreNotes.length === 1 ? '' : 's'} ·{' '}
              {numerator}/{denominator} · 24-TET
            </div>
          </div>

          <StaffVex
            accidentals={accidentals}
            timeSignature={timeSignature}
            scoreNotes={scoreNotes}
          />

          <div className="play-section">
            <button
              className="play-btn"
              onClick={onPlay}
              disabled={isPlaying || scoreNotes.length === 0}
            >
              {isPlaying ? '▶ Playing...' : '▶ Play Score'}
            </button>
            <button
              className="action-btn"
              onClick={onExport}
              style={{ marginLeft: 8, padding: '10px 20px' }}
            >
              Export SVG
            </button>
          </div>
        </div>
      </div>

      <div className="info-bar">
        <strong>About quarter tones:</strong> Arabic music divides the octave
        into 24 equal parts instead of the Western 12. The half-flat (
        <span className="qt-symbol">𝄳</span>) and half-sharp (
        <span className="qt-symbol">𝄲</span>) symbols represent these
        microtonal intervals. Notes colored in{' '}
        <span className="qt-highlight">brown</span> contain quarter-tone
        accidentals — the hallmark of the maqam system.
      </div>
    </div>
  );
}
