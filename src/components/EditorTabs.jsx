import React from 'react';

const TABS = [
  { id: 'key', label: 'Key' },
  { id: 'time', label: 'Time' },
  { id: 'notes', label: 'Notes' },
];

export default function EditorTabs({ activeTab, onSelectTab }) {
  return (
    <div className="editor-tabs" role="tablist" aria-label="Editor steps">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`editor-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onSelectTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

