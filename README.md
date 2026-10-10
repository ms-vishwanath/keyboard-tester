# Keyboard Tester

A lightweight, standalone web diagnostic tool for testing mechanical and membrane keyboards. It tests switch actuation, key coverage, N-key rollover (NKRO), hold latency, switch chatter, typing speed, and more, with zero external dependencies and no build step.

## Features

### Key Actuation & Coverage

- **Full 106-keycap chassis**: The main alphabetic block, navigation cluster, and numpad are all rendered as interactive keys driven by `data-code` attributes.
- **Actuation & health states**:
  - Untested keys remain dark slate.
  - Active keys glow bright cyan while physically depressed.
  - Tested keys remain highlighted in emerald green to verify board coverage.
- **Coverage progress**: A live `tested / total` counter with a progress bar. The denominator is recomputed whenever the layout or Enter variant changes, so it always reflects the keys currently on screen.

### Layout & Variant Switching

Five form factors and two Enter variants are switchable at runtime from the toolbar.

| Layout | Keys shown | Keys hidden |
| :--- | :--- | :--- |
| 100% Full | Everything (main block, navigation cluster, numpad) | None |
| 80% TKL | Main block + navigation cluster | Numpad |
| 75% Compact | Main block + navigation cluster minus `PrtSc`/`ScrLk`/`Pause` | Numpad, navigation function row, spacer row |
| 65% Compact | Main block without the function row, plus navigation/edit column and arrows | Numpad, entire function row |
| 60% Minimal | Alphabetic block and modifier row only | Numpad, entire navigation cluster (including arrows), entire function row |

Note that the 60% layout hides the whole navigation cluster, which includes the arrow keys, because the arrows are rendered inside that cluster. Arrow coverage therefore requires 100%, TKL, 75%, or 65%.

- **ANSI / ISO Enter variant**:
  - ANSI shows the wide horizontal `Backslash` key.
  - ISO hides `Backslash` and reveals the two keys the Web UI Events spec defines for ISO layouts: `IntlHash` (`#`/`~`) left of Enter and `IntlBackslash` (`\`/`|`) beside left Shift.
  - ISO also restyles Enter as a tall inverted-L (62x106px), shortens left Shift to 62px, and widens Tab to 88px to reclaim the space freed by the removed ANSI key.
- Both variants render the same 106 keycap elements. ANSI leaves 104 of them visible (the two ISO-only keys are hidden); ISO leaves 105 visible (the single ANSI `Backslash` key is hidden).

### Diagnostics

- **Simultaneous Rollover (NKRO) Tracking**: Real-time counter of concurrently held keys, tracking the peak rollover count.
- **Hold latency tracking**: Measures the interval between each `keydown` and its matching `keyup`, showing the most recent hold duration in milliseconds alongside a running average.
- **Switch chatter detection**: Flags a key re-struck within 25ms of its previous `keydown` as contact bounce. The counter turns red, the status line names the offending key and the measured delta, and the card border highlights.
- **Debounce jitter histogram**: Records consecutive same-key re-strike intervals under 200ms and bins them into six ranges (`<5ms`, `5-10ms`, `10-15ms`, `15-20ms`, `20-25ms`, `>25ms`), each drawn in its own colour from crimson through blue. A running standard deviation badge (`σ`), minimum, average, and sample count are displayed alongside the bars. Up to 500 samples are retained.
- **Typing speed benchmark**: A three-second sliding window of key presses, sampled every 200ms, reporting live WPM and CPS plus the peak WPM. WPM is derived as `CPS * 60 / 5`.
- **Diagnostic inspection bar**: Shows `event.key`, `event.code`, legacy `event.which`/`keyCode`, and a decoded `event.location` (`STANDARD`, `LEFT`, `RIGHT`, `NUMPAD`).
- **Live event stream table**: Real-time log of the latest 40 `keydown` and `keyup` events with millisecond timestamps, newest first. Values are HTML-escaped before insertion.

### Visual Modes

- **Key actuation heatmap**: Tints every key by how many times it has been pressed. Keys are scaled into five levels by their share of the current maximum count, and the legend swaps from the standard active/tested/untested key to an L1-L5 colour ramp. Hovering a tinted key shows its press count.
- **Acoustic oscilloscope**: A canvas in the header draws the live time-domain waveform from the audio engine via an `AnalyserNode` on a `requestAnimationFrame` loop. With no audio playing it shows a flat baseline.

### Audio

- **Integrated mechanical sound synthesizer**: Uses Web Audio API oscillator ramps to generate tactile click sounds without any external audio files. Presses and releases each get their own envelope.
- **Cherry MX sound profiles**: Three profiles are selectable from the header:
  - **Blue (Clicky)**: sharp high-frequency triangle snap.
  - **Red (Linear)**: deep, muted low-frequency bottom-out.
  - **Brown (Tactile)**: balanced mid-range bump.
- **Volume and pitch tuning**: An Audio Settings drawer exposes a volume slider (0-100%) that scales the gain envelope and a pitch multiplier (0.50x-2.00x) applied to every oscillator frequency. A Test Sound button previews the current settings and Reset restores 100% / 1.00x. A master Sound toggle mutes all output.
- The audio context is created lazily and resumed on demand, since browsers block autoplay until a user gesture.

### Typing Practice

- **Interactive practice mode**: A toolbar toggle reveals a prompt panel above the keyboard for typing against one of six pangrams.
- **Per-character feedback**: Each typed character is marked correct (emerald) or incorrect (red, underlined) against the target, with a glowing cursor advancing through the text.
- **Live accuracy telemetry**: Accuracy percentage, error count, and character progress update as you type. Accuracy is `correctInputs / totalInputs`.
- **Editing**: Backspace steps the cursor back and resets the character state so typos can be corrected.
- Practice mode runs alongside background diagnostics: key presses still light the chassis, still play audio, and still feed the speed and heatmap trackers.

### Reporting

- **JSON report export**: Exports the full session as a downloadable `keyboard-test-report-<timestamp>.json` file (schema version 1.7.0), including:
  - OS target, layout, and Enter variant.
  - Audio settings including sound profile, volume percentage, and pitch multiplier.
  - Practice mode state with prompt, progress, accuracy, errors, and completion flag.
  - Debounce jitter analysis with total samples, minimum, average, standard deviation, and the six-bin distribution.
  - Summary metrics: tested key count, coverage percentage, peak rollover, chatter alerts, average hold duration, peak WPM and CPS, total events, and total actuations.
  - The full per-key actuation frequency map and the list of tested key codes.
- **Reset test**: Clears all tested, active, heatmap, chatter, jitter, hold, speed, and log state and restarts the current practice prompt if practice mode is open.

### Interface

- **OS legend toggle**: Switches modifier key labels between macOS (`⌘ Cmd`, `Option`, `Control`) and Windows (`⊞ Win`, `Alt`, `Ctrl`). The correct set is auto-selected on load by sniffing `navigator.platform`.
- **Shortcut interception shield**: When enabled, suppresses default browser actions for `Tab`, `Space`, `Backspace`, `ContextMenu`, `F1`-`F12`, `AltLeft`/`AltRight`, and `MetaLeft`/`MetaRight` so testing those keys does not navigate, scroll, or close the tab. The shield can be switched off from the toolbar checkbox.
  - Deliberately allowed through: `Ctrl`/`Cmd` + `R` (reload), `Ctrl`/`Cmd` + `Alt` + `I` (developer tools), and `Ctrl`/`Cmd` + `F12`.
  - Caveat: a bare `F12` with no modifier *is* intercepted, so the browser's default devtools shortcut is blocked while the shield is on.

## Project Structure

```text
keyboard-tester/
├── index.html       # Semantic HTML5 markup: header controls, diagnostics grid,
│                    # toolbar, practice panel, keyboard chassis, event log
├── style.css        # Dark theme, 3D keycap styling, glow states, layout and
│                    # ISO variant show/hide rules, heatmap ramp, panel styling
├── script.js        # State, Web Audio synth + analyser, oscilloscope and
│                    # histogram renderers, event listeners, layout/variant
│                    # switching, diagnostics, practice engine, JSON export
├── COMMUNICATION.md # Append-only inter-agent message log and file lock table
└── README.md        # This file
```

There are four source files and no partials. Layout and variant switching is implemented as CSS show/hide rules scoped to classes on the single keyboard element, not as separately authored markup, so adding a form factor means adding a class and a rule rather than a new block of HTML.

A `EFFORT_TRACKER.md` is claimed in the `COMMUNICATION.md` lock table but has not been committed to the repository.

## Quick Start

Open `index.html` directly in any modern browser:

```bash
# macOS
open index.html

# Linux
xdg-open index.html
```

No install, no package manager, no build step, and no network calls are required. The audio synthesizer, oscilloscope, and histogram all use the Web Audio API and Canvas, which are available from the `file://` protocol.

Serving over HTTP also works if preferred:

```bash
python3 -m http.server 3000
```

Fonts (JetBrains Mono, Plus Jakarta Sans) are loaded from Google Fonts. Offline, the stylesheet's monospace and sans-serif fallbacks apply and everything still functions.

## Keyboard Behaviour and Controls

The application has no application-level hotkeys. Every control is a mouse or checkbox interaction, because the physical keyboard is the instrument being measured. All key input is captured globally on `window`, so the page does not need focus on a particular element.

What the keyboard does drive:

- Every `keydown` and `keyup` updates the diagnostic cards, lights or dims the matching keycap, plays the synth voice, increments the press-frequency map, and appends a row to the event log.
- Pressing any key marks it tested, so sweeping the board populates the coverage progress bar.
- Holding several keys at once raises the simultaneous-keys counter, which is how NKRO is measured.
- `Backspace` steps back one character in practice mode.
- Printable characters are compared against the current practice prompt while practice mode is open.

Keys not present on the currently selected layout are still counted in the event log and audio stream, but have no keycap to highlight.

## Collaboration Guide for Concurrent Sessions / Next Agent

This project is built concurrently by multiple agents against a shared working tree. `COMMUNICATION.md` is the coordination channel and must be read before any work begins.

### Protocol

1. **Read before writing**: Read `COMMUNICATION.md` in full immediately before starting work and again before posting a message.
2. **Claim locks first**: Before editing any file, add a row to the *Active File Locks* table in `COMMUNICATION.md` naming the file, the agent holding it, the current work, and a UTC timestamp. Never edit a file another agent has claimed.
3. **Release after committing**: Once work is committed to git, update the lock table to Free / Unlocked.
4. **Append-only history**: Never delete, rewrite, or reorder another agent's entries. New messages are appended to the end of the message log with the next available `MSG-NNN` identifier, a `From`/`To` header, a UTC timestamp, a status line, and explicit *Current Locks* and *Released Locks* fields.
5. **Disjoint work streams**:
   - **Agent 1 (Alpha)**: Core diagnostics engine, key actuation latency, switch chatter/debounce detection, and results export.
   - **Agent 2 (Beta)**: Layout switching (60/65/75/TKL/100), ANSI/ISO variants, mechanical switch audio and tuning, and UI refinements.
   - **Agent Gamma (Documentarian)**: Documentation and effort tracking; application code is read-only for Gamma.
6. **Git coordination**: Run `git status` before starting. Stage only the files you own by name — never `git add -A` or `git add -a`, which would sweep another agent's uncommitted work into your commit. Prefix commit messages with your agent ID, for example `feat(agent2): ...` or `docs(agent2): ...`.

### Where new features belong

- **New diagnostics or metrics**: `script.js`. Add the card to the diagnostics grid in `index.html`, style it in `style.css`, and include its output in the `exportReport()` payload.
- **New form factors or Enter variants**: add a button in the toolbar in `index.html` with a `data-layout` or `data-variant` attribute, handle it in `setLayout()` or `setVariant()` in `script.js`, and add the corresponding show/hide rules under the layout variations section in `style.css`. Reuse the existing `calculateVisibleTestableKeys()` path so the coverage denominator stays correct.
- **Styling and theming**: `style.css`, using the CSS custom properties declared in `:root`. Note that the stylesheet currently contains no media queries; the chassis is fixed-width with horizontal scroll containers rather than a responsive reflow.

### AI-Brain synchronization

Tasks, decisions, session notes, and handoffs for this project are recorded in the `keyboard-tester` private brain at `/Users/msvishwanath/Documents/AI-Brain/PRIVATE/brains/keyboard-tester`. Global memory is read-only during private-scope sessions.