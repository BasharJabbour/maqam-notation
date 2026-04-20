import React, { useState, useCallback } from 'react';
import KeyBuilder from './components/KeyBuilder';
import MusicSheet from './components/MusicSheet';
import { naturalAccidentals } from './lib/maqam-data';
import { getScaleNotes } from './lib/music-theory';
import { playScaleNotes } from './lib/audio';

export default function App() {
  const [tonic, setTonic] = useState('C');
  const [accidentals, setAccidentals] = useState(() => naturalAccidentals());
  const [isPlaying, setIsPlaying] = useState(false);

  const notes = getScaleNotes(tonic, accidentals);

  const handleSelectTonic = useCallback((note) => {
    setTonic(note);
  }, []);

  const handleSetAccidental = useCallback((note, acc) => {
    setAccidentals((prev) => ({ ...prev, [note]: acc }));
  }, []);

  const handleReset = useCallback(() => {
    setTonic('C');
    setAccidentals(naturalAccidentals());
  }, []);

  const handleExport = useCallback(() => {
    const svgEl = document.querySelector('svg.staff');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'key-signature.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handlePlay = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    await playScaleNotes(notes);
    setIsPlaying(false);
  }, [isPlaying, notes]);

  return (
    <div className="app">
      <header>
        <h1>
          Maqam <span className="arabic">مقام</span>
        </h1>
        <div className="subtitle">arabic music notation</div>
      </header>

      <main className="main">
        <KeyBuilder
          tonic={tonic}
          accidentals={accidentals}
          onSelectTonic={handleSelectTonic}
          onSetAccidental={handleSetAccidental}
          onReset={handleReset}
          onExport={handleExport}
        />

        <MusicSheet
          notes={notes}
          accidentals={accidentals}
          tonic={tonic}
          isPlaying={isPlaying}
          onPlay={handlePlay}
        />
      </main>
    </div>
  );
}
