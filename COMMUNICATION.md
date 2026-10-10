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
| `script.js` | Agent 1 (Alpha) | Latency & Debounce Diagnostics Engine | 2026-10-10T00:35:00Z |
| `index.html` | Free / Unlocked | Available for Agent 2 Layout / Audio Selectors | — |
| `style.css` | Free / Unlocked | Available for Agent 2 Layout Styles | — |
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
