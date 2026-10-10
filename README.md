# Keyboard Tester

A lightweight, high-performance, standalone web diagnostic tool for testing mechanical and membrane keyboards. Tests switch actuation, N-key rollover (NKRO), key codes, and event streams with zero external dependencies.

## Features

- **Full ANSI 100% Layout**: Full function row (Esc, F1–F12), 60% alphanumeric block, navigation cluster (arrows, Ins/Del/Home/End/PgUp/PgDn), and numpad.
- **Actuation & Health Testing**:
  - Untested keys remain dark slate.
  - Active keys glow bright cyan while physically depressed.
  - Tested keys remain highlighted in emerald green to verify full board coverage.
- **Simultaneous Rollover (NKRO) Tracking**: Real-time counter of concurrently held keys, tracking peak rollover count.
- **Diagnostic Inspection Bar**: Shows `event.key`, `event.code`, legacy `event.which`/`keyCode`, and `event.location`.
- **Integrated Mechanical Sound Synthesizer**: Uses Web Audio API oscillator ramps to generate tactile click/clack sounds without requiring external audio files.
- **OS Layout Toggle**: Quick toggle between macOS (`⌘ Cmd`, `Option`, `Control`) and Windows (`⊞ Win`, `Alt`, `Ctrl`) legends.
- **Shortcut Interception Shield**: Prevents default browser actions when testing `Tab`, `F1`–`F12`, `Space`, and `Alt` combinations, while preserving `Ctrl+R` / `Cmd+R` and `F12` devtools.
- **Live Event Stream Table**: Real-time log of the latest 40 `keydown` and `keyup` events with millisecond timestamps.

## Project Structure

```text
keyboard-tester/
├── index.html       # Semantic HTML5 layout, diagnostic panels, and keyboard chassis
├── style.css        # Responsive dark UI, 3D keycap styling, glow states, and typography
├── script.js        # Event listeners, Web Audio synth, rollover tracking, and DOM updates
└── README.md        # Architecture overview and multi-session collaboration guide
```

## Quick Start

Open `index.html` directly in any modern web browser:

```bash
# macOS
open index.html

# Or run a local HTTP server
npx serve .
# or
python3 -m http.server 3000
```

## Collaboration Guide for Concurrent Sessions / Next Agent

To avoid merge conflicts between concurrent sessions:

1. **Modular Responsibilities**:
   - **Styling / Layout Themes**: Confine changes to `style.css` (custom CSS variables in `:root`).
   - **Logic & Diagnostics**: Add new diagnostic metrics (e.g. typing speed, switch bounce/debounce detection, heatmap visualization) in `script.js`.
   - **Markup & Layout Expansion**: Add ISO or 65%/75% compact layouts via data attributes or separate partial layouts in `index.html`.
2. **Git Branches**:
   - Work on feature branches (e.g., `feature/latency-timer` or `feature/iso-layout`) and merge cleanly into `main`.
3. **AI-Brain Synchronization**:
   - Record tasks, decisions, and session notes in the `keyboard-tester` private brain (`/Users/msvishwanath/Documents/AI-Brain/PRIVATE/brains/keyboard-tester`).
