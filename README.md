# Maqam مقام — Arabic Music Notation

A web app for creating and displaying custom key signatures that support Arabic maqam notation, including quarter-tone (microtonal) accidentals that standard Western music software doesn't handle well.

![Maqam Notation](https://img.shields.io/badge/24--TET-Quarter%20Tones-c4943a)

## Features

- **10 maqam presets** — Rast, Bayati, Hijaz, Nahawand, Saba, Sikah, Ajam, Kurd, Jiharkah, Huzam
- **Custom key editor** — set any accidental (♮ ♭ ♯ 𝄳 𝄲) per note
- **SVG staff rendering** — treble clef, key signature, note heads with stems and ledger lines
- **Quarter-tone aware** — half-flat and half-sharp accidentals are visually distinguished in brown
- **Interval display** — shows the step pattern with ¾-tone and 1¼-tone intervals highlighted
- **Audio playback** — hear the scale in 24-TET tuning via Web Audio API
- **SVG export** — download the rendered staff as an SVG file

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploy to GitHub Pages

1. Create a GitHub repo named `maqam-notation` (or update `base` in `vite.config.js`)

2. Deploy:
```bash
npm run deploy
```

This runs `vite build` and pushes the `dist/` folder to the `gh-pages` branch.

3. In your repo settings, set GitHub Pages source to the `gh-pages` branch.

If using a **custom domain**, set `base: '/'` in `vite.config.js`.

## Project Structure

```
maqam-notation/
├── index.html                 # Entry point
├── vite.config.js             # Vite + GitHub Pages config
├── package.json
└── src/
    ├── main.jsx               # React mount
    ├── App.jsx                # Root component + state
    ├── components/
    │   ├── KeyBuilder.jsx     # Left panel: tonic, presets, custom editor
    │   ├── MusicSheet.jsx     # Right panel: title, staff, intervals, play
    │   └── StaffSVG.jsx       # SVG staff renderer
    ├── lib/
    │   ├── maqam-data.js      # Constants, accidentals, maqam definitions
    │   ├── music-theory.js    # Scale construction, intervals, frequencies
    │   └── audio.js           # Web Audio API playback engine
    └── styles/
        └── index.css          # All styles
```

## About Arabic Maqam Notation

Arabic music uses a 24-tone equal temperament (24-TET) system, dividing the octave into 24 quarter-tone steps instead of the 12 semitones used in Western music. This allows for intervals like the ¾-tone (neutral second) that are fundamental to maqam melodies.

The key accidentals include:
- **𝄳** Half-flat — lowers a note by a quarter tone
- **𝄲** Half-sharp — raises a note by a quarter tone
- **♭** Flat — lowers by a semitone (standard)
- **♯** Sharp — raises by a semitone (standard)

Most notation software doesn't natively support these microtonal accidentals in key signatures, which is the problem this app solves.

## License

MIT
