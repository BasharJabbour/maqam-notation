import React, { useState, useCallback } from 'react';
import KeyBuilder from './components/KeyBuilder';
import MusicSheet from './components/MusicSheet';
import { NOTES, MAQAMAT, ACC, NOTATION_STYLES } from './lib/maqam-data';
import { getScaleNotes } from './lib/music-theory';
import { playScaleNotes } from './lib/audio';

export default function App() {
  const [selectedMaqam, setSelectedMaqam] = useState('Rast');
  const [tonic, setTonic] = useState('C');
  const [accidentals, setAccidentals] = useState({
    ...MAQAMAT['Rast'].accidentals,
  });
  const [isCustom, setIsCustom] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [notationStyle, setNotationStyle] = useState(NOTATION_STYLES.symbol);

  const notes = getScaleNotes(tonic, accidentals);

  const handleSelectMaqam = useCallback((name) => {
    const data = MAQAMAT[name];
    setSelectedMaqam(name);
    setTonic(data.tonic);
    setAccidentals({ ...data.accidentals });
    setIsCustom(false);
  }, []);

  const handleSelectTonic = useCallback((note) => {
    setTonic(note);
  }, []);

  const handleSetAccidental = useCallback((note, acc) => {
    setAccidentals((prev) => ({ ...prev, [note]: acc }));
    setIsCustom(true);
  }, []);

  const handleReset = useCallback(() => {
    const acc = {};
    NOTES.forEach((n) => (acc[n] = ACC.NATURAL));
    setAccidentals(acc);
    setIsCustom(true);
  }, []);

  const handleExport = useCallback(() => {
    const svgEl = document.querySelector('svg.staff');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maqam-${isCustom ? 'custom' : selectedMaqam.toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [isCustom, selectedMaqam]);

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
          selectedMaqam={selectedMaqam}
          isCustom={isCustom}
          onSelectMaqam={handleSelectMaqam}
          onSelectTonic={handleSelectTonic}
          onSetAccidental={handleSetAccidental}
          onReset={handleReset}
          onExport={handleExport}
        />

        <MusicSheet
          notes={notes}
          accidentals={accidentals}
          selectedMaqam={selectedMaqam}
          isCustom={isCustom}
          tonic={tonic}
          isPlaying={isPlaying}
          onPlay={handlePlay}
          notationStyle={notationStyle}
          onToggleNotation={setNotationStyle}
        />
      </main>
    </div>
  );
}
