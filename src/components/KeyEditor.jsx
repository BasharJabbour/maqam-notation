import React from 'react';
import {
  ACC_LABELS,
  NOTES,
  EDITABLE_ACCIDENTALS,
} from '../lib/maqam-data';

export default function KeyEditor({
  tonic,
  accidentals,
  onSelectTonic,
  onSetAccidental,
  onReset,
  onNext,
}) {
  return (
    <div className="panel editor-panel">
      <div className="panel-header">
        <span className="ornament">◆</span>
        <h2>Key Signature</h2>
      </div>
      <div className="panel-body">
        <div className="tonic-section">
          <div className="section-label">Tonic (Root Note)</div>
          <div className="tonic-row">
            {NOTES.map((n) => (
              <button
                key={n}
                className={`tonic-btn ${tonic === n ? 'active' : ''}`}
                onClick={() => onSelectTonic(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="custom-key-section">
          <div className="section-label">Custom Accidentals</div>
          {NOTES.map((note) => (
            <div key={note} className="note-row">
              <div className="note-name">{note}</div>
              <div className="accidental-options">
                {EDITABLE_ACCIDENTALS.map((acc) => (
                  <button
                    key={acc}
                    className={`acc-btn ${accidentals[note] === acc ? 'active' : ''}`}
                    onClick={() => onSetAccidental(note, acc)}
                    title={ACC_LABELS[acc] === '♮' ? 'Natural' : ACC_LABELS[acc]}
                  >
                    <span className="acc-symbol">{ACC_LABELS[acc]}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="actions">
          <button className="action-btn" onClick={onReset}>
            Reset
          </button>
          <button className="action-btn primary" onClick={onNext}>
            Next: Time Signature →
          </button>
        </div>
      </div>
    </div>
  );
}
