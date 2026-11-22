import React, { useState, useCallback } from 'react';
// Ensure VexFlow's Bravura music font is registered in the document.
import 'vexflow/bravura';
import EditorTabs from './components/EditorTabs';
import KeyEditor from './components/KeyEditor';
import TimeSignatureEditor from './components/TimeSignatureEditor';
import NotesEditor from './components/NotesEditor';
import MusicSheet from './components/MusicSheet';
import { naturalAccidentals } from './lib/maqam-data';
import { playScoreNotes } from './lib/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState('key');
  const [tonic, setTonic] = useState('C');
  const [accidentals, setAccidentals] = useState(() => naturalAccidentals());
  const [timeSignature, setTimeSignature] = useState({ numerator: 4, denominator: 4 });
  const [scoreNotes, setScoreNotes] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSelectTonic = useCallback((note) => setTonic(note), []);

  const handleSetAccidental = useCallback((note, acc) => {
    setAccidentals((prev) => ({ ...prev, [note]: acc }));
  }, []);

  const handleResetKey = useCallback(() => {
    setTonic('C');
    setAccidentals(naturalAccidentals());
  }, []);

  const handleSetTimeSignature = useCallback((sig) => setTimeSignature(sig), []);

  const handleAddScoreNote = useCallback((entry) => {
    setScoreNotes((prev) => [...prev, entry]);
  }, []);

  const handleRemoveScoreNote = useCallback((index) => {
    setScoreNotes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearScoreNotes = useCallback(() => setScoreNotes([]), []);

  const handleExport = useCallback(() => {
    const svgEl = document.querySelector('svg.staff');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'score.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handlePlay = useCallback(async () => {
    if (isPlaying || scoreNotes.length === 0) return;
    setIsPlaying(true);
    await playScoreNotes(scoreNotes);
    setIsPlaying(false);
  }, [isPlaying, scoreNotes]);

  return (
    <div className="app">
      <header>
        <h1>
          Maqam <span className="arabic">مقام</span>
        </h1>
        <div className="subtitle">arabic music notation</div>
      </header>

      <main className="main">
        <section className="editor-area">
          <EditorTabs activeTab={activeTab} onSelectTab={setActiveTab} />

          {activeTab === 'key' && (
            <KeyEditor
              tonic={tonic}
              accidentals={accidentals}
              onSelectTonic={handleSelectTonic}
              onSetAccidental={handleSetAccidental}
              onReset={handleResetKey}
              onNext={() => setActiveTab('time')}
            />
          )}
          {activeTab === 'time' && (
            <TimeSignatureEditor
              value={timeSignature}
              onChange={handleSetTimeSignature}
              onNext={() => setActiveTab('notes')}
            />
          )}
          {activeTab === 'notes' && (
            <NotesEditor
              scoreNotes={scoreNotes}
              onAdd={handleAddScoreNote}
              onRemove={handleRemoveScoreNote}
              onClear={handleClearScoreNotes}
            />
          )}
        </section>

        <MusicSheet
          tonic={tonic}
          accidentals={accidentals}
          timeSignature={timeSignature}
          scoreNotes={scoreNotes}
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onExport={handleExport}
        />
      </main>
    </div>
  );
}
