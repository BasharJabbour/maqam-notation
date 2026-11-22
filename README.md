# Maqam مقام — Arabic Music Notation

A web app for scoring Arabic music, including the quarter-tone (microtonal)
accidentals that standard Western notation software doesn't handle well. You
build a custom key signature, pick a time signature, enter notes, and get a
rendered staff you can hear and export.

![Maqam Notation](https://img.shields.io/badge/24--TET-Quarter%20Tones-c4943a)

## Features

- **Custom key signatures** — set any accidental (♮ 𝄳 ♭ 𝄲 ♯) per letter name,
  including microtonal ones, rendered directly into the staff's key signature.
- **Time signatures** — common presets plus a custom beats / note-value picker.
- **Note entry** — add notes (name · accidental · octave · duration) or rests
  to build up a score, with a live editable list.
- **VexFlow staff rendering** — treble clef, custom microtonal key signature,
  and automatic multi-system line wrapping that re-packs as the score grows
  (see `docs/staff-line-wrapping.md`).
- **Quarter-tone aware** — half-flat / half-sharp (and three-quarter) accidentals
  are visually distinguished in brown.
- **Audio playback** — hear the score in 24-TET tuning via the Web Audio API.
- **SVG export** — download the rendered staff as an SVG file.

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

Node version is pinned in `.nvmrc` (`nvm use`).

## Deploy to GitHub Pages

1. Create a GitHub repo named `maqam-notation` (or update `base` in `vite.config.js`).

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
├── index.html                      # Entry point
├── vite.config.js                  # Vite + GitHub Pages config
├── package.json
├── docs/
│   └── staff-line-wrapping.md      # How the multi-system layout works
└── src/
    ├── main.jsx                    # React mount
    ├── App.jsx                     # Root component + state
    ├── components/
    │   ├── EditorTabs.jsx          # Key / Time / Notes tab bar
    │   ├── KeyEditor.jsx           # Tonic + custom accidentals
    │   ├── TimeSignatureEditor.jsx # Time signature presets + custom
    │   ├── NotesEditor.jsx         # Note/rest entry + score list
    │   ├── MusicSheet.jsx          # Staff panel, play + export
    │   └── StaffVex.jsx            # VexFlow staff renderer + line packing
    ├── lib/
    │   ├── maqam-data.js           # Constants, accidental ↔ VexFlow mapping
    │   ├── music-theory.js         # Quarter-tone positions & frequencies
    │   └── audio.js                # Web Audio API playback engine
    └── styles/
        └── index.css              # All styles
```

## About Arabic Maqam Notation

Arabic music uses a 24-tone equal temperament (24-TET) system, dividing the
octave into 24 quarter-tone steps instead of the 12 semitones used in Western
music. This allows for intervals like the ¾-tone (neutral second) that are
fundamental to maqam melodies.

The key accidentals include:
- **𝄳** Half-flat — lowers a note by a quarter tone
- **𝄲** Half-sharp — raises a note by a quarter tone
- **♭** Flat — lowers by a semitone (standard)
- **♯** Sharp — raises by a semitone (standard)

Most notation software doesn't natively support these microtonal accidentals in
key signatures, which is the problem this app solves.

## License

MIT
