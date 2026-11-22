import React from 'react';

const PRESETS = [
  { numerator: 2, denominator: 4 },
  { numerator: 3, denominator: 4 },
  { numerator: 4, denominator: 4 },
  { numerator: 6, denominator: 8 },
  { numerator: 7, denominator: 8 },
  { numerator: 5, denominator: 4 },
];

const NUMERATORS = Array.from({ length: 16 }, (_, i) => i + 1);
const DENOMINATORS = [2, 4, 8, 16];

export default function TimeSignatureEditor({ value, onChange, onNext }) {
  const { numerator, denominator } = value;

  const isPreset = (p) =>
    p.numerator === numerator && p.denominator === denominator;

  return (
    <div className="panel editor-panel">
      <div className="panel-header">
        <span className="ornament">◆</span>
        <h2>Time Signature</h2>
      </div>
      <div className="panel-body">
        <div className="time-preview">
          <div className="time-preview-fraction">
            <span className="time-num">{numerator}</span>
            <span className="time-den">{denominator}</span>
          </div>
        </div>

        <div className="section-label">Presets</div>
        <div className="time-presets">
          {PRESETS.map((p) => (
            <button
              key={`${p.numerator}/${p.denominator}`}
              className={`preset-btn ${isPreset(p) ? 'active' : ''}`}
              onClick={() => onChange(p)}
            >
              {p.numerator}/{p.denominator}
            </button>
          ))}
        </div>

        <div className="section-label" style={{ marginTop: 24 }}>
          Custom
        </div>
        <div className="time-custom">
          <label className="time-field">
            <span>Beats</span>
            <select
              value={numerator}
              onChange={(e) =>
                onChange({ numerator: Number(e.target.value), denominator })
              }
            >
              {NUMERATORS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="time-field">
            <span>Note value</span>
            <select
              value={denominator}
              onChange={(e) =>
                onChange({ numerator, denominator: Number(e.target.value) })
              }
            >
              {DENOMINATORS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="actions">
          <button className="action-btn primary" onClick={onNext}>
            Next: Notes →
          </button>
        </div>
      </div>
    </div>
  );
}
