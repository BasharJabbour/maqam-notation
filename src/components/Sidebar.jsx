import React from 'react';

const TABS = [
  { id: 'key', label: 'Key', hint: 'Tonic & accidentals' },
  { id: 'time', label: 'Time', hint: 'Time signature' },
  { id: 'notes', label: 'Notes', hint: 'Score input' },
];

export default function Sidebar({ activeTab, onSelectTab }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-title">Editor</div>
      <ul className="sidebar-tabs">
        {TABS.map((tab, i) => (
          <li key={tab.id}>
            <button
              className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
            >
              <span className="sidebar-tab-number">{i + 1}</span>
              <span className="sidebar-tab-body">
                <span className="sidebar-tab-label">{tab.label}</span>
                <span className="sidebar-tab-hint">{tab.hint}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
