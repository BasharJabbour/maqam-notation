import React from 'react';
import StaffSVG from './StaffSVG';
import {
  getIntervals,
  intervalLabel,
  isQuarterToneInterval,
} from '../lib/music-theory';
export default function MusicSheet({
  notes,
  accidentals,
  tonic,
  isPlaying,
  onPlay,
}) {
  const intervals = getIntervals(notes);

  const displayName = 'Key Signature Key'
  const displayArabic = 'دليل المقام'
   

  return (
    <div className="sheet-area">
      <div className="panel sheet-panel">
        <div className="sheet-container fade-in">
          {/* Title */}
          <div className="sheet-title-area">
            <div className="sheet-maqam-name">{displayName}</div>
            <div className="sheet-maqam-arabic">{displayArabic}</div>
            <div className="sheet-meta">
              Tonic: {tonic} · {notes.length} notes · 24-TET
            </div>
          </div>

          {/* Staff notation */}
          <StaffSVG notes={notes} accidentals={accidentals} />

          {/* Interval chips */}
          <div className="intervals-display">
            {intervals.map((iv, i) => (
              <React.Fragment key={i}>
                <div
                  className={`interval-chip ${isQuarterToneInterval(iv) ? 'quarter' : ''}`}
                >
                  {intervalLabel(iv)}T
                </div>
                {i < intervals.length - 1 && (
                  <span style={{ color: '#ccc', fontSize: '0.7rem' }}>·</span>
                )}
              </React.Fragment>
            ))}
          </div>


          {/* Play button */}
          <div className="play-section">
            <button
              className="play-btn"
              onClick={onPlay}
              disabled={isPlaying}
            >
              {isPlaying ? '▶ Playing...' : '▶ Play Scale'}
            </button>
          </div>
        </div>
      </div>

      {/* Info bar */}
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
