# Project effort and contribution tracker

Maintainer: Agent Gamma (Documentarian). Assignment: [COMMUNICATION.md](COMMUNICATION.md), MSG-011.

## Assessment

**Beta has more agent-tagged commits and recorded code changes in this snapshot. Actual effort and time spent cannot be ranked from the available evidence.** Alpha established the base application per MSG-001, but its initial commit has no agent tag. Some later commits contain another agent's work. Both facts materially affect comparisons.

This report measures recorded contributions, with attribution qualifications. It does not convert lines changed, features, messages, or commit timestamps into hours or a productivity score.

## Snapshot and measurement rules

- Audit date: 2026-10-10.
- Fixed snapshot: `732c420ca3b0f343e5e0d313c8d4fdb1da3478a5` (typing practice implementation).
- Coverage: all 12 commits reachable from that snapshot, including the initial commit. The history at this snapshot is linear.
- Application code: `index.html`, `style.css`, and `script.js`. Coordination: `COMMUNICATION.md`. Other documentation: `README.md`.
- Attribution for numeric totals uses `(agent1)` and `(agent2)` in commit subjects. All 12 commits use the same Git author identity, so author names cannot distinguish agents. The initial untagged commit remains a separate category.
- Additions/deletions are Git `--numstat` line counts. Churn means additions plus deletions, including formatting and repeated edits; it is not unique surviving code or implementation difficulty.
- Feature ownership uses inspected diffs and the public project message log. Message claims and independently inspected code are distinguished below.
- Working-tree edits and subsequent commits are excluded. Alpha's jitter histogram was in progress at audit start and is not counted as delivered in this snapshot.

## Recorded contribution totals

| Metric | Alpha-tagged | Beta-tagged | Untagged base |
| :--- | ---: | ---: | ---: |
| Commits | 4 | 7 | 1 |
| `feat` commits | 3 | 6 | 1 |
| `docs` commits | 1 | 1 | 0 |
| Code lines added | 258 | 1,198 | 1,163 |
| Code lines deleted | 3 | 79 | 0 |
| Code churn | 261 | 1,277 | 1,163 |
| Net code lines | 255 | 1,119 | 1,163 |
| Coordination lines added / deleted | 151 / 7 | 231 / 12 | 0 / 0 |
| Other documentation lines added / deleted | 0 / 0 | 0 / 0 | 54 / 0 |
| Named JavaScript function declarations added | 4 | 10 | 8 |

The function count is a narrow structural measure: added lines matching `function name(` in `script.js` diffs. It excludes arrow callbacks, event-handler bodies, branches, and edits inside existing functions. No named function declarations were deleted in this history. It is **not cyclomatic complexity** and does not rank implementation difficulty.

If the initial application is provisionally credited to Alpha using MSG-001, Alpha's code additions become **1,421** and churn **1,424**, versus Beta's recorded **1,198** additions and **1,277** churn. This sensitivity check reverses the raw line-count ranking; it is not a corrected authorship total because mixed commits remain unresolved. It demonstrates why the unqualified statement “Beta did more work” would be unsupported.

## Commit ledger

Code and coordination columns show `+added / -deleted`. Base documentation is listed separately.

| Commit | Subject tag | Recorded deliverable | Code | Coordination |
| :--- | :--- | :--- | ---: | ---: |
| `ab85263` | Untagged | Initial application; also adds 54 README lines | +1163 / -0 | +0 / -0 |
| `ac1d708` | Alpha | Chatter detection, hold-duration tracking, JSON export | +87 / -0 | +62 / -0 |
| `e30fa96` | Alpha | Lock update and MSG-002 | +0 / -0 | +23 / -1 |
| `0dfa796` | Beta | Form-factor selector and three synthesized sound profiles | +207 / -35 | +43 / -3 |
| `f29f696` | Beta | Key-frequency heatmap | +188 / -3 | +38 / -3 |
| `fba3994` | Alpha | WPM/CPS and initial 65%/ISO logic and styles | +115 / -3 | +35 / -3 |
| `fdf3be0` | Beta | 65%/ISO completion; also contains audio-tuning implementation | +359 / -33 | +0 / -0 |
| `71c88a2` | Beta | Audio-tuning follow-up and completion message | +5 / -1 | +34 / -3 |
| `2698980` | Beta | Synchronous progress recalculation; also contains oscilloscope integration | +47 / -6 | +0 / -0 |
| `fd0073f` | Alpha | Oscilloscope renderer and completion message | +56 / -0 | +31 / -3 |
| `22a50fd` | Beta | Coordination messages, including Gamma registration | +0 / -0 | +50 / -0 |
| `732c420` | Beta | Typing practice and accuracy; coordination updates | +392 / -1 | +66 / -3 |

## Feature delivery and implementation complexity

The following 12 groups are a navigation aid, not equally sized work units. Completion here means implementation found in the committed source; Gamma did not rerun the application or independently reproduce the earlier browser-test claims.

| Feature group | Contribution evidence | Complexity and integration observed |
| :--- | :--- | :--- |
| Base application, NKRO, event log, OS legends, shortcut handling, initial synth | `ab85263`; Alpha claims base setup in MSG-001; commit untagged | Three-file foundation integrating keyboard state, DOM updates, styling, and Web Audio |
| Switch chatter alerts | Alpha, `ac1d708` | Per-key timing state and repeated-actuation threshold in existing event handler |
| Hold-duration tracking | Alpha, `ac1d708` | Keydown/keyup pairing, duration aggregation, display/reset state; not physical input latency |
| JSON diagnostic export | Alpha, `ac1d708`; later integrations from both agents | Serializes accumulated state; later feature work extends the schema |
| Full/TKL/75%/60% selector | Beta, `0dfa796` | Cluster visibility and visible-key counting across HTML, CSS, and JavaScript |
| Blue/Red/Brown synthesized profiles | Beta, `0dfa796` | Separate keydown/keyup oscillator envelopes within existing audio function |
| Relative-frequency heatmap | Beta, `f29f696` | Per-key counts, maximum-relative tiers, tooltips, visual-mode transitions, export |
| WPM/CPS burst benchmark | Alpha, `fba3994` | Sliding timestamp window, periodic update, peak statistics, reset/export integration |
| 65%/ISO and progress corrections | Shared: Alpha `fba3994`; Beta `fdf3be0`, `2698980` | Initial variant state and styles followed by toggle/key markup and synchronous visibility recount; one shared feature group, not two independently delivered features |
| Audio volume/pitch controls | Beta claims completion in MSG-007; substantial implementation in `fdf3be0`, follow-up `71c88a2` | UI settings, gain/frequency scaling across profiles, preview, defaults, export |
| Acoustic oscilloscope | Alpha claims completion in MSG-008; integration in Beta-tagged `2698980`, renderer in Alpha-tagged `fd0073f` | Audio graph routing, analyser samples, canvas animation; a verified mixed-attribution commit |
| Typing practice and accuracy | Beta, `732c420`, MSG-012 | Prompt/cursor state, per-character results, backspace behavior, accumulated accuracy, controls, reset/export |

This grouping contains five Alpha-led post-base groups, five Beta-led groups, one shared layout group, and the separately attributed base. Splitting diagnostics into metrics while grouping all base behavior together affects those counts, so they are not a workload ranking. Layout correction and export extensions are credited within their existing groups rather than counted as additional full features.

## Attribution and coordination limits

1. **Untagged foundation:** the 1,163 initial code lines account for a large portion of the application. MSG-001 supports an Alpha ownership claim, but the commit metadata alone does not resolve it.
2. **Interleaved work:** `fdf3be0` includes audio tuning despite a layout-focused subject. `2698980` includes the canvas markup, analyser setup, and audio routing for the oscilloscope despite a progress-fix subject. MSG-010 reports shared-tree interleaving. Do not automatically assign every changed line to the subject's agent.
3. **Overlapping layout completion:** MSG-006 and MSG-010 both claim 65%/ISO work. The inspected diffs show successive contributions, so the ledger preserves both without treating them as independent final features. Standards-compliance claims in the messages have not been independently validated by this documentation audit.
4. **Coordination authorship differs from commit ownership:** Beta-tagged `22a50fd` includes Gamma's MSG-009. Therefore coordination churn measures the commit carrying the text, not who wrote each message.
5. **No effort clock:** commit timestamps show recording times, not session start/end, active work, review, thinking, or time lost to collisions. Message timestamps are not consistently chronological. No defensible hours, speed, or efficiency ranking can be derived.

Message counts at the same committed snapshot:

| Message author | Count | IDs |
| :--- | ---: | :--- |
| Alpha | 5 | 001, 002, 006, 008, 011 |
| Beta | 6 | 003, 004, 005, 007, 010, 012 |
| Gamma | 1 | 009 |

These counts measure coordination volume, not wasted time. Lock-table edits, repeated status reports, and shared-commit transport are also reflected in the coordination-line totals. Their time cost is unknown.

## Delivery cadence and maintenance

This is the first measured snapshot, not a comparable multi-period velocity series. It contains three Alpha-tagged and six Beta-tagged feature commits after the base. A feature commit can complete several behaviors or only correct an existing one, so these are delivery-event counts, not a normalized speed measure.

| Audit | Snapshot | Alpha / Beta / untagged commits | Alpha / Beta code churn | Scope |
| :--- | :--- | :--- | :--- | :--- |
| 2026-10-10 initial | `732c420` | 4 / 7 / 1 | 261 / 1,277 | Initial app through typing practice; base churn 1,163 separate |

For the next update, claim this document's lock, choose a new immutable snapshot, inspect the diff from `732c420`, and append a dated row. Preserve the initial results. Reconcile cross-agent commits and shared features before changing ownership conclusions. Count the jitter histogram only in a snapshot containing its implementation commit. Keep Gamma's documentation out of the Alpha/Beta implementation totals.

## Reproduction

Run from the repository root. These commands read the fixed snapshot, not the current working tree:

```sh
git log --reverse --format='%h %s' 732c420ca3b0f343e5e0d313c8d4fdb1da3478a5
git log --reverse --format='%h %s' --numstat 732c420ca3b0f343e5e0d313c8d4fdb1da3478a5
git show 732c420ca3b0f343e5e0d313c8d4fdb1da3478a5:COMMUNICATION.md
git show fdf3be0 -- index.html style.css script.js
git show 2698980 -- index.html style.css script.js
```

Sum `--numstat` additions and deletions by the file categories and subject tags defined above. Include the root commit. For declaration counts, inspect each `git show --format= --unified=0 <commit> -- script.js` and count added `function name(` declaration lines. For messages, count headings by their `From:` field; do not infer authorship from the commit that carried them. Every conclusion in this report is based on repository evidence; private memory content is not a source for the public report.
