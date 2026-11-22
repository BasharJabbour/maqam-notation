import React, { useState } from 'react';
import {
  ACC,
  ACC_LABELS,
  ACC_SHORT_SYMBOL,
  NOTES,
} from '../lib/maqam-data';

const ALL_ACCIDENTALS = [
  ACC.NATURAL,
  ACC.HALF_FLAT,
  ACC.FLAT,
  ACC.HALF_SHARP,
  ACC.SHARP,
  ACC.THREE_Q_FLAT,
  ACC.THREE_Q_SHARP,
];

const OCTAVES = [3, 4, 5, 6];

const DURATIONS = [
  { id: 'whole', label: 'Whole' },
  { id: 'half', label: 'Half' },
  { id: 'quarter', label: 'Quarter' },
  { id: 'eighth', label: 'Eighth' },
];

function labelFor(entry) {
  if (entry.kind === 'rest') {
    const dur = DURATIONS.find((d) => d.id === entry.duration)?.label || entry.duration;
    return `${dur} rest`;
  }
  const accSym = ACC_SHORT_SYMBOL[entry.accidental] || '';
  const dur = DURATIONS.find((d) => d.id === entry.duration)?.label || entry.duration;
  return `${entry.name}${accSym}${entry.octave} · ${dur}`;
}

export default function NotesEditor({ scoreNotes, onAdd, onRemove, onClear }) {
  const [isRest, setIsRest] = useState(false);
  const [name, setName] = useState('C');
  const [accidental, setAccidental] = useState(ACC.NATURAL);
  const [octave, setOctave] = useState(4);
  const [duration, setDuration] = useState('quarter');

  const handleAdd = () => {
    if (isRest) {
      onAdd({ kind: 'rest', duration });
    } else {
      onAdd({ kind: 'note', name, accidental, octave, duration });
    }
  };

  return (
    <div className="panel editor-panel">
      <div className="panel-header">
        <span className="ornament">◆</span>
        <h2>Notes</h2>
      </div>
      <div className="panel-body">
        <div className="notes-rest-toggle">
          <label>
            <input
              type="checkbox"
              checked={isRest}
              onChange={(e) => setIsRest(e.target.checked)}
            />
            <span>Add as rest</span>
          </label>
        </div>

        {!isRest && (
          <>
            <div className="section-label">Note</div>
            <div className="tonic-row">
              {NOTES.map((n) => (
                <button
                  key={n}
                  className={`tonic-btn ${name === n ? 'active' : ''}`}
                  onClick={() => setName(n)}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="section-label" style={{ marginTop: 20 }}>
              Accidental
            </div>
            <div className="accidental-options notes-acc-row">
              {ALL_ACCIDENTALS.map((a) => (
                <button
                  key={a}
                  className={`acc-btn ${accidental === a ? 'active' : ''}`}
                  onClick={() => setAccidental(a)}
                  title={ACC_LABELS[a]}
                >
                  <span className="acc-symbol">{ACC_LABELS[a]}</span>
                </button>
              ))}
            </div>

            <div className="section-label" style={{ marginTop: 20 }}>
              Octave
            </div>
            <div className="tonic-row">
              {OCTAVES.map((o) => (
                <button
                  key={o}
                  className={`tonic-btn ${octave === o ? 'active' : ''}`}
                  onClick={() => setOctave(o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="section-label" style={{ marginTop: 20 }}>
          Duration
        </div>
        <div className="tonic-row">
          {DURATIONS.map((d) => (
            <button
              key={d.id}
              className={`tonic-btn ${duration === d.id ? 'active' : ''}`}
              onClick={() => setDuration(d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="actions">
          <button className="action-btn primary" onClick={handleAdd}>
            + Add to score
          </button>
        </div>

        <div className="notes-list">
          <div className="notes-list-header">
            <div className="section-label" style={{ margin: 0 }}>
              Score ({scoreNotes.length})
            </div>
            {scoreNotes.length > 0 && (
              <button className="link-btn" onClick={onClear}>
                Clear all
              </button>
            )}
          </div>
          {scoreNotes.length === 0 ? (
            <div className="notes-empty">No notes yet. Add one above.</div>
          ) : (
            <ol className="notes-list-items">
              {scoreNotes.map((entry, i) => (
                <li key={i} className="notes-list-item">
                  <span className="notes-list-index">{i + 1}</span>
                  <span className="notes-list-label">{labelFor(entry)}</span>
                  <button
                    className="notes-list-remove"
                    onClick={() => onRemove(i)}
                    aria-label="Remove"
                    title="Remove"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
