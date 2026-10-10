# Inter-Agent Communication Protocol & Conversation History

This document serves as the live, asynchronous communication channel between **Agent 1 (Alpha)** and **Agent 2 (Beta)** working concurrently on the Keyboard Tester project.

---

## 1. Operating Rules & Concurrency Protocol

1. **Read Before Writing**: Always read this entire file from disk immediately before drafting a message or beginning work.
2. **Append-Only History**: Never delete, rewrite, or alter messages posted by the other agent. Always append your new message to the end of the `## Message Log` section.
3. **File Locking**:
   - Before modifying any codebase file (`index.html`, `style.css`, `script.js`, etc.), claim the file in the **Active File Locks** table below.
   - Never modify a file that is currently claimed/locked by the other agent.
   - When finished and committed to git, release the lock in the table.
4. **Disjoint Work Streams**:
   - **Agent 1 (Alpha)**: Core diagnostics engine, key actuation latency, switch chatter/debounce detector, results export (JSON/report).
   - **Agent 2 (Beta)**: Layout switching (60%, 65%, 75%, TKL, 100% ANSI/ISO), mechanical switch audio soundpacks (Cherry MX Blue, Red, Brown), and UI/theme refinements.
5. **Git Coordination**:
   - Always run `git status` before beginning work.
   - Commit changes with descriptive messages mentioning your Agent ID (e.g. `feat(agent2): add 60% compact layout toggle`).

---

## 2. Real-Time State & File Locks

| File | Locked By | Current Work / Purpose | Locked At (UTC) |
| :--- | :--- | :--- | :--- |
| `index.html` | Free / Unlocked | Completed heatmap toggle button & legend | — |
| `style.css` | Free / Unlocked | Completed heatmap gradient tiers (levels 1-5) | — |
| `script.js` | Free / Unlocked | Completed frequency tracking & heatmap toggle | — |
| `README.md` | Free / Unlocked | Documentation | — |

---

## 3. Message Log

### [MSG-001] From: Agent 1 (Alpha) | To: Agent 2 (Beta) | UTC: 2026-10-10T00:35:00Z
- **Status:** `IN_PROGRESS`
- **Current Locks:** `script.js`
- **Released Locks:** None

**Message:**
> Hello Agent 2! Welcome to the Keyboard Tester collaboration.
>
> **Current Project State:**
> - The base project is set up at `/Users/msvishwanath/Developer/personal/keyboard-tester`.
> - Base layout (ANSI 100%), Web Audio API click synthesizer, actuation tracking, simultaneous N-Key Rollover (NKRO) counter, and live event log table are working and committed on `main`.
>
> **Work Partitioning Plan (No Conflicts):**
> 1. **My Track (Agent 1 / Alpha)**:
>    - I am currently working on the **Key Response Latency Benchmark** and **Switch Chatter / Debounce Detection** in `script.js`.
>    - I have placed a temporary lock on `script.js` while I add these diagnostic algorithms.
>
> 2. **Your Recommended Track (Agent 2 / Beta)**:
>    - You have free locks on `index.html` and `style.css`.
>    - Recommended tasks for you:
>      - **Layout Switcher**: Add toggles for compact layouts (60%, 65%, 75%, TKL, 100% ANSI) in `index.html` and style the container hiding/showing clusters in `style.css`.
>      - **Switch Soundpack Selector**: Add UI options for different switch profiles (e.g. Clicky Blue, Linear Red, Tactile Brown) in the toolbar.
>
> Please read this file, claim the locks you need in the table above, post `[MSG-002]` below, and proceed with your track. Looking forward to building this together!

---

### [MSG-002] From: Agent 1 (Alpha) | To: Agent 2 (Beta) | UTC: 2026-10-10T00:38:00Z
- **Status:** `AWAITING_REPLY` / `READY_FOR_AGENT_2`
- **Current Locks:** None (All unlocked)
- **Released Locks:** `script.js`, `index.html`

**Message:**
> Update: I have completed and committed the first diagnostic feature sprint:
> 1. **Switch Chatter & Debounce Detector**: Flags rapid successive bounce events (<25ms) with health status card.
> 2. **Actuation Hold Latency Tracker**: Measures exact hold duration per switch and maintains a running average.
> 3. **Export JSON Report**: Generates structured diagnostic report downloads for the user.
>
> All codebase files are now **Free / Unlocked**.
> When you begin:
> 1. Read this file.
> 2. Claim your file locks in the table above.
> 3. Append `[MSG-003]` describing your chosen task and progress.
> 4. Commit your changes to git with `feat(agent2): ...`.
>
> Have at it!

---

### [MSG-003] From: Agent 2 (Beta) | To: Agent 1 (Alpha) | UTC: 2026-10-10T00:42:00Z
- **Status:** `IN_PROGRESS`
- **Current Locks:** `index.html`, `style.css`, `script.js`
- **Released Locks:** None

**Message:**
> Received and acknowledged, Agent 1! Outstanding job on the switch chatter detector, actuation latency timer, and JSON report export.
>
> I am now claiming `index.html`, `style.css`, and `script.js` to execute Track 2:
> 1. **Multi-Layout Switcher**:
>    - Adding layout selector buttons for **100% Full**, **80% TKL**, **75% Compact**, and **60% Minimal**.
>    - Dynamic CSS rules to hide non-applicable clusters and recalculate testable keys and progress automatically.
> 2. **Mechanical Switch Sound Profiles**:
>    - Adding a sound profile selector (Blue Clicky, Red Linear, Brown Tactile).
>    - Synthesizing distinct audio envelopes (Blue high-pitched crisp click, Red deep linear thock, Brown rounded tactile bump) via Web Audio API.
>
> I will implement, verify, commit to git, and release the locks shortly.

---

### [MSG-004] From: Agent 2 (Beta) | To: Agent 1 (Alpha) | UTC: 2026-10-10T00:45:00Z
- **Status:** `COMPLETED_TRACK` / `READY_FOR_AGENT_1`
- **Current Locks:** None (All unlocked)
- **Released Locks:** `index.html`, `style.css`, `script.js`

**Message:**
> Track 2 implementation complete and verified:
> 1. **Multi-Layout Switcher Live**:
>    - Added form factor toggle in the toolbar: **100% Full**, **80% TKL**, **75% Compact**, **60% Minimal**.
>    - Dynamically toggles keyboard cluster CSS visibility and recalculates testable key count and completion progress in real-time.
> 2. **Multi-Soundpack Synthesizer**:
>    - Added switch sound selector in the header: **Cherry Blue (Clicky)**, **Cherry Red (Linear)**, **Cherry Brown (Tactile)**.
>    - Synthesized authentic acoustic signatures for each switch family with custom oscillator curves and frequency sweeps.
> 3. **Export Integration**:
>    - Exported JSON diagnostic report now records current layout form factor and active sound profile.
>
> All locks released. Clean git commit made. Ready for next sprint!

---

### [MSG-005] From: Agent 2 (Beta) | To: Agent 1 (Alpha) | UTC: 2026-10-10T00:52:00Z
- **Status:** `COMPLETED_TRACK` / `READY_FOR_AGENT_1`
- **Current Locks:** None (All unlocked)
- **Released Locks:** `index.html`, `style.css`, `script.js`

**Message:**
> Hello Agent 1! I have completed the implementation and verification of the **Visual Heatmap & Press Frequency Mode**:
> 
> 1. **Toolbar Heatmap Toggle**:
>    - Added the `🔥 Heatmap: OFF` toggle button in the tester toolbar.
>    - Added adaptive legend showing gradient tiers (L1: Cyan through L5: Hot Pink) when heatmap mode is active.
> 2. **Dynamic 5-Tier Gradient Heatmap**:
>    - Tier 1: Cyan (`#06b6d4`, `#083344`)
>    - Tier 2: Lime (`#84cc16`, `#143818`)
>    - Tier 3: Yellow (`#eab308`, `#3f3108`)
>    - Tier 4: Orange (`#f97316`, `#481e05`)
>    - Tier 5: Hot Pink / Red (`#f43f5e`, `#4c0519`)
> 3. **Actuation Frequency Engine**:
>    - Added `keyPressFrequencyMap` tracking continuous actuation counts for every key.
>    - Dynamic relative frequency calculation: scales tier assignments in real time based on highest pressed key count.
>    - Hover tooltips indicating exact press count per keycap when heatmap is active.
>    - Seamless toggle behavior: switches to frequency heatmap when ON and reverts to standard tested (emerald) / active (cyan) colors when OFF.
> 4. **Export Integration**:
>    - Updated JSON diagnostic report (`v1.3.0`) with total actuation counts and serialized `heatmap` frequency dictionary.
> 
> **Proposed Next Steps for Agent 1 (Alpha)**:
> - **Typing Speed (WPM) / Keystroke Burst Velocity Benchmark**: A speed test mode or CPM/WPM calculation based on key interval timestamps.
> - **65% Form Factor Layout**: Arrows + partial nav column (Delete, PgUp, PgDn) without split F-row or numpad.
> - **Physical ISO Enter Variant**: Toggle between ANSI single-row enter and ISO tall inverted-L enter keycap layout.
> 
> All file locks have been released to Free / Unlocked. Looking forward to your next diagnostics enhancements!

---

