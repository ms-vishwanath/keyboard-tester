/**
 * Keyboard Tester Application Logic
 * Standalone diagnostic suite for mechanical & membrane keyboards.
 */

// State
const activeKeys = new Set();
const testedKeys = new Set();
let maxRollover = 0;
let eventCounter = 0;
let soundEnabled = true;
let currentOS = 'mac'; // 'mac' | 'win'
let currentSoundProfile = 'blue'; // 'blue' | 'red' | 'brown'
let soundVolume = 1.0; // 0.0 - 1.0 (0% - 100%)
let soundPitch = 1.0; // 0.5 - 2.0 (0.5x - 2.0x)
let currentLayout = '100'; // '100' | 'tkl' | '75' | '65' | '60'
let currentVariant = 'ansi'; // 'ansi' | 'iso'
let chatterCount = 0;
let heatmapMode = false;
const keyPressFrequencyMap = new Map();
const lastKeyDownTimeMap = new Map();
const holdDurations = [];
const recentKeyPressTimes = [];
let peakWpm = 0;
let peakCps = 0;
let remapMode = false;
const customRemapMap = new Map(); // physicalCode -> simulatedCode
let remapModalOpen = false;
let currentRemapSource = null;
let capturedTargetCandidate = null;

// DOM Elements
const keyboardWrapper = document.getElementById('keyboardWrapper');
const keyboardEl = document.getElementById('keyboard');
const keyElements = document.querySelectorAll('.key[data-code]');
const lastKeyValueEl = document.getElementById('lastKeyValue');
const lastKeyCodeValueEl = document.getElementById('lastKeyCodeValue');
const lastWhichValueEl = document.getElementById('lastWhichValue');
const keyLocationValueEl = document.getElementById('keyLocationValue');
const activeKeysCountEl = document.getElementById('activeKeysCount');
const maxRolloverValueEl = document.getElementById('maxRolloverValue');
const testedProgressEl = document.getElementById('testedProgress');
const progressBarEl = document.getElementById('progressBar');
const lastHoldDurationEl = document.getElementById('lastHoldDuration');
const avgHoldDurationEl = document.getElementById('avgHoldDuration');
const chatterCountEl = document.getElementById('chatterCount');
const chatterStatusEl = document.getElementById('chatterStatus');
const chatterCardEl = document.getElementById('chatterCard');
const currentWpmValueEl = document.getElementById('currentWpmValue');
const cpsSubValueEl = document.getElementById('cpsSubValue');
const preventShortcutsCheckbox = document.getElementById('preventShortcutsCheckbox');
const eventLogBody = document.getElementById('eventLogBody');
const logCounterEl = document.getElementById('logCounter');

const osMacBtn = document.getElementById('osMacBtn');
const osWinBtn = document.getElementById('osWinBtn');
const soundProfileSelect = document.getElementById('soundProfileSelect');
const layoutBtns = document.querySelectorAll('.layout-btn');
const variantBtns = document.querySelectorAll('.variant-btn');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const audioSettingsBtn = document.getElementById('audioSettingsBtn');
const audioTuningDropdown = document.getElementById('audioTuningDropdown');
const closeAudioSettingsBtn = document.getElementById('closeAudioSettingsBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const pitchSlider = document.getElementById('pitchSlider');
const pitchValue = document.getElementById('pitchValue');
const testAudioBtn = document.getElementById('testAudioBtn');
const resetAudioBtn = document.getElementById('resetAudioBtn');
const heatmapToggleBtn = document.getElementById('heatmapToggleBtn');
const practiceToggleBtn = document.getElementById('practiceToggleBtn');
const practiceContainer = document.getElementById('practiceContainer');
const practicePromptSelect = document.getElementById('practicePromptSelect');
const practiceAccuracyEl = document.getElementById('practiceAccuracy');
const practiceErrorsEl = document.getElementById('practiceErrors');
const practiceProgressEl = document.getElementById('practiceProgress');
const practiceResetBtn = document.getElementById('practiceResetBtn');
const practiceNextBtn = document.getElementById('practiceNextBtn');
const practiceTextDisplay = document.getElementById('practiceTextDisplay');
const practiceCompletionStatusEl = document.getElementById('practiceCompletionStatus');
const exportBtn = document.getElementById('exportBtn');
const resetBtn = document.getElementById('resetBtn');
const standardLegend = document.getElementById('standardLegend');
const heatmapLegend = document.getElementById('heatmapLegend');
const jitterCanvas = document.getElementById('jitterCanvas');
const jitterCtx = jitterCanvas ? jitterCanvas.getContext('2d') : null;
const jitterStdBadge = document.getElementById('jitterStdBadge');
const jitterSummary = document.getElementById('jitterSummary');
const remapToggleBtn = document.getElementById('remapToggleBtn');
const remapStatusPill = document.getElementById('remapStatusPill');
const remapCountText = document.getElementById('remapCountText');
const clearAllRemapsBtn = document.getElementById('clearAllRemapsBtn');
const remapModalBackdrop = document.getElementById('remapModalBackdrop');
const remapModalCloseBtn = document.getElementById('remapModalCloseBtn');
const remapSourceChip = document.getElementById('remapSourceChip');
const remapTargetChip = document.getElementById('remapTargetChip');
const remapRemoveBtn = document.getElementById('remapRemoveBtn');
const remapCancelBtn = document.getElementById('remapCancelBtn');
const remapApplyBtn = document.getElementById('remapApplyBtn');
const presetBtns = document.querySelectorAll('.preset-btn');

// Key code mapping cache
const keyMap = new Map();
keyElements.forEach(el => {
  const code = el.getAttribute('data-code');
  if (code) {
    keyMap.set(code, el);
  }
});

let currentTotalTestableKeys = keyMap.size;

// Web Audio API Synth for Mechanical Key Click
let audioCtx = null;
let analyserNode = null;

function playKeySound(isKeyDown = true) {
  if (!soundEnabled) return;

  const vol = Math.max(0, Math.min(1, soundVolume));
  if (vol === 0) return;

  const pitch = Math.max(0.1, soundPitch);

  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      audioCtx = new AudioContextClass();
    }

    if (!analyserNode && audioCtx) {
      analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 128;
      analyserNode.connect(audioCtx.destination);
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const audioTarget = analyserNode || audioCtx.destination;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    if (currentSoundProfile === 'blue') {
      // Cherry MX Blue (Clicky: sharp high pitch crisp snap)
      if (isKeyDown) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(820 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, 160 * pitch), now + 0.035);
        gain.gain.setValueAtTime(0.22 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(audioTarget);
        osc.start(now);
        osc.stop(now + 0.04);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, 110 * pitch), now + 0.025);
        gain.gain.setValueAtTime(0.09 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);
        osc.connect(gain);
        gain.connect(audioTarget);
        osc.start(now);
        osc.stop(now + 0.028);
      }
    } else if (currentSoundProfile === 'red') {
      // Cherry MX Red (Linear: deep, muted, thocky low-frequency bottom-out)
      if (isKeyDown) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(190 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, 55 * pitch), now + 0.06);
        gain.gain.setValueAtTime(0.25 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
        osc.connect(gain);
        gain.connect(audioTarget);
        osc.start(now);
        osc.stop(now + 0.065);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(130 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, 50 * pitch), now + 0.03);
        gain.gain.setValueAtTime(0.07 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(audioTarget);
        osc.start(now);
        osc.stop(now + 0.035);
      }
    } else {
      // Cherry MX Brown (Tactile: balanced mid-range bump)
      if (isKeyDown) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(460 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, 110 * pitch), now + 0.045);
        gain.gain.setValueAtTime(0.19 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(audioTarget);
        osc.start(now);
        osc.stop(now + 0.05);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, 80 * pitch), now + 0.03);
        gain.gain.setValueAtTime(0.08 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);
        osc.connect(gain);
        gain.connect(audioTarget);
        osc.start(now);
        osc.stop(now + 0.032);
      }
    }
  } catch (err) {
    // Ignore audio initialization errors if blocked by browser policy
  }
}

// Acoustic Oscilloscope Visualizer Renderer
const visualizerCanvas = document.getElementById('audioVisualizer');
const visualizerCtx = visualizerCanvas ? visualizerCanvas.getContext('2d') : null;

function drawOscilloscope() {
  requestAnimationFrame(drawOscilloscope);
  if (!visualizerCanvas || !visualizerCtx) return;

  const width = visualizerCanvas.width;
  const height = visualizerCanvas.height;

  visualizerCtx.fillStyle = '#090e17';
  visualizerCtx.fillRect(0, 0, width, height);

  if (!analyserNode) {
    // Subtle ambient baseline
    visualizerCtx.lineWidth = 1.5;
    visualizerCtx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    visualizerCtx.beginPath();
    visualizerCtx.moveTo(0, height / 2);
    visualizerCtx.lineTo(width, height / 2);
    visualizerCtx.stroke();
    return;
  }

  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyserNode.getByteTimeDomainData(dataArray);

  visualizerCtx.lineWidth = 2;
  visualizerCtx.strokeStyle = '#38bdf8';
  visualizerCtx.shadowBlur = 6;
  visualizerCtx.shadowColor = '#38bdf8';

  visualizerCtx.beginPath();
  const sliceWidth = width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * height) / 2;
    if (i === 0) {
      visualizerCtx.moveTo(x, y);
    } else {
      visualizerCtx.lineTo(x, y);
    }
    x += sliceWidth;
  }

  visualizerCtx.lineTo(width, height / 2);
  visualizerCtx.stroke();
  visualizerCtx.shadowBlur = 0;
}

requestAnimationFrame(drawOscilloscope);

// Switch Chatter & Debounce Jitter Histogram Engine
const JITTER_BIN_COLORS = [
  '#ef4444', // <5ms (Severe chatter / contact bounce)
  '#f59e0b', // 5-10ms (Fast debounce window alert)
  '#eab308', // 10-15ms (Debounce zone)
  '#10b981', // 15-20ms (Nominal switch response)
  '#06b6d4', // 20-25ms (Conservative debounce margin)
  '#3b82f6'  // >25ms (Clean actuation stroke)
];

const jitterBins = [0, 0, 0, 0, 0, 0];
const jitterSamples = [];
let minJitterDelta = null;

function recordJitterSample(deltaMs) {
  if (deltaMs <= 0) return;
  const rounded = Math.round(deltaMs * 10) / 10;
  jitterSamples.push(rounded);
  if (jitterSamples.length > 500) {
    jitterSamples.shift();
  }

  if (minJitterDelta === null || rounded < minJitterDelta) {
    minJitterDelta = rounded;
  }

  // Classify into interval bins
  if (rounded < 5) {
    jitterBins[0]++;
  } else if (rounded < 10) {
    jitterBins[1]++;
  } else if (rounded < 15) {
    jitterBins[2]++;
  } else if (rounded < 20) {
    jitterBins[3]++;
  } else if (rounded < 25) {
    jitterBins[4]++;
  } else {
    jitterBins[5]++;
  }

  // Calculate Average and Standard Deviation (σ)
  const n = jitterSamples.length;
  const sum = jitterSamples.reduce((acc, val) => acc + val, 0);
  const avg = sum / n;
  const variance = jitterSamples.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  if (jitterStdBadge) {
    jitterStdBadge.textContent = `σ: ${stdDev.toFixed(1)} ms`;
  }
  if (jitterSummary) {
    jitterSummary.textContent = `Samples: ${n} • Min: ${minJitterDelta.toFixed(1)}ms • Avg: ${Math.round(avg)} ms`;
  }

  drawJitterHistogram();
}

function drawJitterHistogram() {
  if (!jitterCanvas || !jitterCtx) return;

  const width = jitterCanvas.width;
  const height = jitterCanvas.height;

  // Clear background
  jitterCtx.fillStyle = '#070b12';
  jitterCtx.fillRect(0, 0, width, height);

  // Subtle horizontal center grid line
  jitterCtx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  jitterCtx.lineWidth = 1;
  jitterCtx.beginPath();
  jitterCtx.moveTo(0, height / 2);
  jitterCtx.lineTo(width, height / 2);
  jitterCtx.stroke();

  const total = jitterSamples.length;
  if (total === 0) {
    jitterCtx.fillStyle = '#475569';
    jitterCtx.font = '10px "JetBrains Mono", monospace';
    jitterCtx.textAlign = 'center';
    jitterCtx.fillText('Awaiting rapid actuations...', width / 2, height / 2 + 3);
    return;
  }

  const maxBinCount = Math.max(...jitterBins, 1);
  const binCount = jitterBins.length;
  const gap = 6;
  const totalGaps = (binCount + 1) * gap;
  const barWidth = Math.max(8, (width - totalGaps) / binCount);

  for (let i = 0; i < binCount; i++) {
    const count = jitterBins[i];
    const x = gap + i * (barWidth + gap);
    const barHeight = count > 0 ? Math.max(4, Math.round((count / maxBinCount) * (height - 8))) : 2;
    const y = height - barHeight - 2;

    jitterCtx.fillStyle = count > 0 ? JITTER_BIN_COLORS[i] : 'rgba(255, 255, 255, 0.08)';
    if (count > 0) {
      jitterCtx.shadowColor = JITTER_BIN_COLORS[i];
      jitterCtx.shadowBlur = 4;
    } else {
      jitterCtx.shadowBlur = 0;
    }

    // Rounded bar
    jitterCtx.beginPath();
    const r = 2;
    if (typeof jitterCtx.roundRect === 'function') {
      jitterCtx.roundRect(x, y, barWidth, barHeight, [r, r, 0, 0]);
    } else {
      jitterCtx.rect(x, y, barWidth, barHeight);
    }
    jitterCtx.fill();
    jitterCtx.shadowBlur = 0;

    // Small count label
    if (count > 0 && barHeight > 10) {
      jitterCtx.fillStyle = '#ffffff';
      jitterCtx.font = '8px "JetBrains Mono", monospace';
      jitterCtx.textAlign = 'center';
      jitterCtx.fillText(String(count), x + barWidth / 2, Math.max(10, y - 2));
    }
  }
}

// Initial draw of empty jitter histogram
drawJitterHistogram();

// Location formatter
function formatLocation(loc) {
  switch (loc) {
    case 1: return 'Left side (DOM_KEY_LOCATION_LEFT)';
    case 2: return 'Right side (DOM_KEY_LOCATION_RIGHT)';
    case 3: return 'Numpad (DOM_KEY_LOCATION_NUMPAD)';
    default: return 'Standard (DOM_KEY_LOCATION_STANDARD)';
  }
}

// Update UI Progress
function updateProgress() {
  const testedCount = testedKeys.size;
  testedProgressEl.textContent = `${testedCount} / ${currentTotalTestableKeys}`;
  const pct = currentTotalTestableKeys > 0 ? (testedCount / currentTotalTestableKeys) * 100 : 0;
  progressBarEl.style.width = `${Math.min(100, Math.round(pct))}%`;
}

// Add Event to Live Stream Table
function appendEventLog(type, event) {
  eventCounter++;
  logCounterEl.textContent = `${eventCounter} events recorded`;

  const emptyRow = eventLogBody.querySelector('.empty-state');
  if (emptyRow) {
    emptyRow.remove();
  }

  const tr = document.createElement('tr');
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;

  const typeClass = type === 'keydown' ? 'event-type-keydown' : 'event-type-keyup';

  tr.innerHTML = `
    <td>${eventCounter}</td>
    <td class="${typeClass}">${type}</td>
    <td><strong>${escapeHtml(event.key || 'Unknown')}</strong></td>
    <td><code>${escapeHtml(event.code || 'Unknown')}</code></td>
    <td>${event.which || event.keyCode || '—'}</td>
    <td>${formatLocation(event.location)}</td>
    <td>${timeStr}</td>
  `;

  eventLogBody.insertBefore(tr, eventLogBody.firstChild);

  // Keep table limited to latest 40 entries for high performance
  if (eventLogBody.children.length > 40) {
    eventLogBody.removeChild(eventLogBody.lastChild);
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Should prevent default browser shortcut
function shouldPreventShortcut(event) {
  if (!preventShortcutsCheckbox.checked) return false;

  // Preserve critical developer tools and page refresh shortcuts
  const isRefresh = (event.ctrlKey || event.metaKey) && (event.key === 'r' || event.key === 'R');
  const isDevTools = (event.ctrlKey || event.metaKey) && event.altKey && (event.key === 'i' || event.key === 'I');
  const isInspect = event.key === 'F12' && (event.ctrlKey || event.metaKey);

  if (isRefresh || isDevTools || isInspect) {
    return false;
  }

  // Intercept common testing blockers like Tab, F-keys, Space scrolling, Backspace navigation
  const interceptCodes = [
    'Tab', 'Space', 'Backspace', 'ContextMenu',
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
    'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight'
  ];

  if (interceptCodes.includes(event.code)) {
    return true;
  }

  return false;
}

// Heatmap & Press Frequency Mode
const HEATMAP_CLASSES = [
  'heatmap-1', 'heatmap-2', 'heatmap-3', 'heatmap-4', 'heatmap-5',
  'heatmap-level-1', 'heatmap-level-2', 'heatmap-level-3', 'heatmap-level-4', 'heatmap-level-5'
];

function getHeatmapLevel(count, maxCount) {
  if (count <= 0) return 0;
  if (maxCount <= 1) return 1;
  const ratio = count / maxCount;
  if (ratio <= 0.2) return 1;
  if (ratio <= 0.4) return 2;
  if (ratio <= 0.6) return 3;
  if (ratio <= 0.8) return 4;
  return 5;
}

function updateHeatmapDisplay() {
  if (!heatmapMode) return;

  let maxCount = 0;
  keyPressFrequencyMap.forEach(count => {
    if (count > maxCount) maxCount = count;
  });

  keyMap.forEach((el, code) => {
    HEATMAP_CLASSES.forEach(cls => el.classList.remove(cls));

    const count = keyPressFrequencyMap.get(code) || 0;
    if (count > 0) {
      const level = getHeatmapLevel(count, maxCount);
      el.classList.add(`heatmap-${level}`);
      el.setAttribute('title', `${code}: ${count} press${count === 1 ? '' : 'es'}`);
    } else {
      el.removeAttribute('title');
    }
  });
}

function clearHeatmapDisplay() {
  keyMap.forEach((el) => {
    HEATMAP_CLASSES.forEach(cls => el.classList.remove(cls));
    el.removeAttribute('title');
  });
}

function toggleHeatmapMode() {
  heatmapMode = !heatmapMode;
  if (heatmapMode) {
    if (heatmapToggleBtn) {
      heatmapToggleBtn.classList.add('active');
      heatmapToggleBtn.textContent = '🔥 Heatmap: ON';
    }
    if (keyboardEl) keyboardEl.classList.add('heatmap-mode');
    if (standardLegend && heatmapLegend) {
      standardLegend.style.display = 'none';
      heatmapLegend.style.display = 'flex';
    }
    updateHeatmapDisplay();
  } else {
    if (heatmapToggleBtn) {
      heatmapToggleBtn.classList.remove('active');
      heatmapToggleBtn.textContent = '🔥 Heatmap: OFF';
    }
    if (keyboardEl) keyboardEl.classList.remove('heatmap-mode');
    if (standardLegend && heatmapLegend) {
      standardLegend.style.display = 'flex';
      heatmapLegend.style.display = 'none';
    }
    clearHeatmapDisplay();
  }
}

// Interactive Typing Practice & Accuracy Benchmark
const PRACTICE_PROMPTS = [
  "The quick brown fox jumps over the lazy dog",
  "Pack my box with five dozen liquor jugs",
  "Sphinx of black quartz, judge my vow",
  "How vexingly quick daft zebras jump",
  "Jackdaws love my big sphinx of quartz",
  "Crazy Fredrick bought many very exquisite opal jewels"
];

let practiceMode = false;
let practicePromptIndex = 0;
let practiceCurrentText = PRACTICE_PROMPTS[0];
let practiceCursor = 0;
let practiceCharStates = []; // 'pending' | 'correct' | 'incorrect'
let practiceTotalInputs = 0;
let practiceCorrectInputs = 0;
let practiceErrorCount = 0;

function initPracticePrompt(index = 0) {
  practicePromptIndex = index;
  practiceCurrentText = PRACTICE_PROMPTS[practicePromptIndex] || PRACTICE_PROMPTS[0];
  practiceCursor = 0;
  practiceCharStates = Array(practiceCurrentText.length).fill('pending');
  practiceTotalInputs = 0;
  practiceCorrectInputs = 0;
  practiceErrorCount = 0;
  if (practicePromptSelect) {
    practicePromptSelect.value = String(practicePromptIndex);
  }
  renderPracticePrompt();
}

function renderPracticePrompt() {
  if (!practiceTextDisplay) return;

  const html = [];
  for (let i = 0; i < practiceCurrentText.length; i++) {
    const char = practiceCurrentText[i];
    const state = practiceCharStates[i] || 'pending';
    const isCursor = i === practiceCursor;
    const displayChar = char === ' ' ? '&nbsp;' : escapeHtml(char);
    html.push(`<span class="p-char ${state} ${isCursor ? 'cursor' : ''}">${displayChar}</span>`);
  }
  if (practiceCursor >= practiceCurrentText.length) {
    html.push(`<span class="p-char cursor end-cursor"></span>`);
  }
  practiceTextDisplay.innerHTML = html.join('');

  if (practiceProgressEl) {
    practiceProgressEl.textContent = `${practiceCursor} / ${practiceCurrentText.length}`;
  }
  if (practiceErrorsEl) {
    practiceErrorsEl.textContent = practiceErrorCount;
  }
  if (practiceAccuracyEl) {
    const acc = practiceTotalInputs > 0 ? Math.max(0, Math.round((practiceCorrectInputs / practiceTotalInputs) * 100)) : 100;
    practiceAccuracyEl.textContent = `${acc}%`;
  }
  if (practiceCompletionStatusEl) {
    if (practiceCursor >= practiceCurrentText.length) {
      practiceCompletionStatusEl.textContent = '🎉 Prompt Completed! Press Next ➔ or Restart ↺';
      practiceCompletionStatusEl.style.color = '#10b981';
    } else {
      practiceCompletionStatusEl.textContent = '';
    }
  }
}

function handlePracticeKeyInput(e) {
  if (!practiceMode) return;

  if (e.key === 'Backspace') {
    if (practiceCursor > 0) {
      practiceCursor--;
      practiceCharStates[practiceCursor] = 'pending';
      renderPracticePrompt();
    }
    return;
  }

  // Single printable characters (including Space)
  if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (practiceCursor < practiceCurrentText.length) {
      practiceTotalInputs++;
      const expectedChar = practiceCurrentText[practiceCursor];
      if (e.key === expectedChar) {
        practiceCharStates[practiceCursor] = 'correct';
        practiceCorrectInputs++;
      } else {
        practiceCharStates[practiceCursor] = 'incorrect';
        practiceErrorCount++;
      }
      practiceCursor++;
      renderPracticePrompt();
    }
  }
}

function togglePracticeMode() {
  practiceMode = !practiceMode;
  if (practiceMode) {
    if (practiceToggleBtn) {
      practiceToggleBtn.classList.add('active');
      practiceToggleBtn.textContent = '🎯 Practice: ON';
    }
    if (practiceContainer) {
      practiceContainer.style.display = 'flex';
    }
    initPracticePrompt(practicePromptIndex);
  } else {
    if (practiceToggleBtn) {
      practiceToggleBtn.classList.remove('active');
      practiceToggleBtn.textContent = '🎯 Practice: OFF';
    }
    if (practiceContainer) {
      practiceContainer.style.display = 'none';
    }
  }
}

// Custom Key Rebinding & Remapping Simulator
function getFriendlyKeyName(code) {
  if (!code) return '';
  const map = {
    ControlLeft: 'Ctrl',
    ControlRight: 'RCtrl',
    ShiftLeft: 'Shift',
    ShiftRight: 'RShift',
    AltLeft: 'Alt',
    AltRight: 'RAlt',
    MetaLeft: 'Cmd',
    MetaRight: 'RCmd',
    Escape: 'Esc',
    Backspace: 'Bksp',
    CapsLock: 'Caps',
    Space: 'Space',
    Enter: 'Enter',
    Tab: 'Tab',
    Delete: 'Del',
    Insert: 'Ins',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→'
  };
  if (map[code]) return map[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return 'N' + code.slice(6);
  return code.slice(0, 6);
}

function updateRemapVisuals() {
  keyElements.forEach(el => {
    el.classList.remove('remapped');
    const oldBadge = el.querySelector('.key-remap-badge');
    if (oldBadge) oldBadge.remove();
  });

  customRemapMap.forEach((targetCode, sourceCode) => {
    const el = keyMap.get(sourceCode);
    if (el) {
      el.classList.add('remapped');
      const badge = document.createElement('span');
      badge.className = 'key-remap-badge';
      badge.textContent = `➔ ${getFriendlyKeyName(targetCode)}`;
      badge.title = `Remapped: ${sourceCode} ➔ ${targetCode}`;
      el.appendChild(badge);
    }
  });

  const count = customRemapMap.size;
  if (remapStatusPill && remapCountText) {
    if (count > 0) {
      remapStatusPill.style.display = 'inline-flex';
      remapCountText.textContent = `${count} remapped`;
    } else {
      remapStatusPill.style.display = 'none';
    }
  }
}

function openRemapModal(sourceCode) {
  currentRemapSource = sourceCode;
  capturedTargetCandidate = customRemapMap.get(sourceCode) || null;
  remapModalOpen = true;

  if (remapSourceChip) {
    remapSourceChip.textContent = `${sourceCode} (${getFriendlyKeyName(sourceCode)})`;
  }
  if (remapTargetChip) {
    if (capturedTargetCandidate) {
      remapTargetChip.textContent = `${capturedTargetCandidate} (${getFriendlyKeyName(capturedTargetCandidate)})`;
      remapTargetChip.classList.remove('waiting');
    } else {
      remapTargetChip.textContent = 'Press any key...';
      remapTargetChip.classList.add('waiting');
    }
  }

  if (remapRemoveBtn) {
    remapRemoveBtn.style.display = customRemapMap.has(sourceCode) ? 'inline-block' : 'none';
  }

  if (remapModalBackdrop) {
    remapModalBackdrop.style.display = 'flex';
  }
}

function closeRemapModal() {
  remapModalOpen = false;
  currentRemapSource = null;
  capturedTargetCandidate = null;
  if (remapModalBackdrop) {
    remapModalBackdrop.style.display = 'none';
  }
}

function setCapturedTarget(targetCode) {
  capturedTargetCandidate = targetCode;
  if (remapTargetChip) {
    remapTargetChip.textContent = `${targetCode} (${getFriendlyKeyName(targetCode)})`;
    remapTargetChip.classList.remove('waiting');
  }
}

function applyRemap() {
  if (currentRemapSource && capturedTargetCandidate) {
    if (currentRemapSource === capturedTargetCandidate) {
      customRemapMap.delete(currentRemapSource);
    } else {
      customRemapMap.set(currentRemapSource, capturedTargetCandidate);
    }
    updateRemapVisuals();
  }
  closeRemapModal();
}

function removeRemap() {
  if (currentRemapSource) {
    customRemapMap.delete(currentRemapSource);
    updateRemapVisuals();
  }
  closeRemapModal();
}

function clearAllRemaps() {
  customRemapMap.clear();
  updateRemapVisuals();
}

function toggleRemapMode() {
  remapMode = !remapMode;
  if (remapMode) {
    if (remapToggleBtn) {
      remapToggleBtn.classList.add('active');
      remapToggleBtn.textContent = '🔀 Remap: ON';
    }
    if (keyboardEl) {
      keyboardEl.classList.add('remap-mode-active');
    }
  } else {
    if (remapToggleBtn) {
      remapToggleBtn.classList.remove('active');
      remapToggleBtn.textContent = '🔀 Remap: OFF';
    }
    if (keyboardEl) {
      keyboardEl.classList.remove('remap-mode-active');
    }
  }
}

// Handle Key Down
window.addEventListener('keydown', (e) => {
  // If remap modal is open, capture the target candidate and suppress tester input
  if (remapModalOpen) {
    e.preventDefault();
    e.stopPropagation();
    setCapturedTarget(e.code);
    return;
  }

  if (shouldPreventShortcut(e)) {
    e.preventDefault();
  }

  const physicalCode = e.code;
  const isRemapped = customRemapMap.has(physicalCode);
  const code = isRemapped ? customRemapMap.get(physicalCode) : physicalCode;
  const now = performance.now();

  // Switch Chatter / Bounce Detection (Rapid successive keydown < 25ms on same key)
  const lastDown = lastKeyDownTimeMap.get(code);
  if (lastDown && !e.repeat) {
    const delta = now - lastDown;
    if (delta < 25) {
      chatterCount++;
      chatterCountEl.textContent = chatterCount;
      chatterCountEl.style.color = '#ef4444';
      chatterStatusEl.textContent = `Alert: Chatter on ${code} (${Math.round(delta)}ms)`;
      if (chatterCardEl) chatterCardEl.style.borderColor = '#ef4444';
    }
    // Record debounce jitter intervals for rapid re-strikes under 200ms
    if (delta < 200) {
      recordJitterSample(delta);
    }
  }
  lastKeyDownTimeMap.set(code, now);

  // Press Frequency Tracking
  const pressCount = (keyPressFrequencyMap.get(code) || 0) + 1;
  keyPressFrequencyMap.set(code, pressCount);
  recentKeyPressTimes.push(now);

  // Handle Practice Mode input evaluation
  if (practiceMode) {
    handlePracticeKeyInput(e);
  }

  activeKeys.add(code);
  testedKeys.add(code);

  if (activeKeys.size > maxRollover) {
    maxRollover = activeKeys.size;
    maxRolloverValueEl.textContent = `Max peak: ${maxRollover} keys`;
  }

  // Update Diagnostics
  lastKeyValueEl.textContent = e.key === ' ' ? 'Space' : e.key;
  if (isRemapped) {
    lastKeyCodeValueEl.textContent = `${code} (🔀 from ${physicalCode})`;
  } else {
    lastKeyCodeValueEl.textContent = `event.code: ${e.code}`;
  }
  lastWhichValueEl.textContent = `${e.which || e.keyCode || '—'}`;
  keyLocationValueEl.textContent = `Location: ${formatLocation(e.location)}`;
  activeKeysCountEl.textContent = activeKeys.size;

  if (heatmapMode) {
    updateHeatmapDisplay();
  }

  // Update visual key
  const keyEl = keyMap.get(code);
  if (keyEl) {
    keyEl.classList.add('active');
    keyEl.classList.add('tested');
  }

  updateProgress();
  const logEvent = isRemapped ? {
    key: e.key,
    code: `${code} (🔀 ${physicalCode})`,
    which: e.which,
    keyCode: e.keyCode,
    location: e.location
  } : e;
  appendEventLog('keydown', logEvent);
  playKeySound(true);
});

// Handle Key Up
window.addEventListener('keyup', (e) => {
  if (remapModalOpen) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  const physicalCode = e.code;
  const isRemapped = customRemapMap.has(physicalCode);
  const code = isRemapped ? customRemapMap.get(physicalCode) : physicalCode;

  activeKeys.delete(code);
  activeKeysCountEl.textContent = activeKeys.size;

  // Calculate Hold Duration (Actuation latency)
  const downTime = lastKeyDownTimeMap.get(code);
  if (downTime) {
    const holdMs = Math.round(performance.now() - downTime);
    lastHoldDurationEl.textContent = `${holdMs} ms`;
    holdDurations.push(holdMs);
    const avg = Math.round(holdDurations.reduce((a, b) => a + b, 0) / holdDurations.length);
    avgHoldDurationEl.textContent = `Avg hold: ${avg} ms`;
  }

  const keyEl = keyMap.get(code);
  if (keyEl) {
    keyEl.classList.remove('active');
  }

  const logEvent = isRemapped ? {
    key: e.key,
    code: `${code} (🔀 ${physicalCode})`,
    which: e.which,
    keyCode: e.keyCode,
    location: e.location
  } : e;
  appendEventLog('keyup', logEvent);
  playKeySound(false);
});

// Handle Window Blur (Release all active keys if user alt-tabs or switches windows)
window.addEventListener('blur', () => {
  activeKeys.forEach(code => {
    const keyEl = keyMap.get(code);
    if (keyEl) {
      keyEl.classList.remove('active');
    }
  });
  activeKeys.clear();
  activeKeysCountEl.textContent = 0;
});

// Reset Functionality
function resetAll() {
  activeKeys.clear();
  testedKeys.clear();
  keyPressFrequencyMap.clear();
  maxRollover = 0;
  eventCounter = 0;
  chatterCount = 0;
  lastKeyDownTimeMap.clear();
  holdDurations.length = 0;

  keyElements.forEach(el => {
    el.classList.remove('active', 'tested');
    HEATMAP_CLASSES.forEach(cls => el.classList.remove(cls));
    el.removeAttribute('title');
  });
  updateRemapVisuals();

  lastKeyValueEl.textContent = '—';
  lastKeyCodeValueEl.textContent = 'event.code: none';
  lastWhichValueEl.textContent = '—';
  keyLocationValueEl.textContent = 'Location: Standard';
  activeKeysCountEl.textContent = '0';
  maxRolloverValueEl.textContent = 'Max peak: 0 keys';
  lastHoldDurationEl.textContent = '—';
  avgHoldDurationEl.textContent = 'Avg hold: 0 ms';
  chatterCountEl.textContent = '0';
  chatterCountEl.style.color = '#10b981';
  chatterStatusEl.textContent = 'Status: Healthy (No bounce)';
  if (chatterCardEl) chatterCardEl.style.borderColor = 'var(--border-color)';
  recentKeyPressTimes.length = 0;
  peakWpm = 0;
  peakCps = 0;
  if (currentWpmValueEl) currentWpmValueEl.textContent = '0 WPM';
  if (cpsSubValueEl) cpsSubValueEl.textContent = '0.0 CPS • Peak: 0 WPM';
  if (practiceMode) {
    initPracticePrompt(practicePromptIndex);
  }
  jitterSamples.length = 0;
  jitterBins.fill(0);
  minJitterDelta = null;
  if (jitterStdBadge) jitterStdBadge.textContent = 'σ: 0.0 ms';
  if (jitterSummary) jitterSummary.textContent = 'Samples: 0 • Min: — • Avg: 0 ms';
  drawJitterHistogram();
  logCounterEl.textContent = '0 events recorded';

  eventLogBody.innerHTML = `
    <tr class="empty-state">
      <td colspan="7">Press any key on your keyboard to begin testing...</td>
    </tr>
  `;

  updateProgress();
}

resetBtn.addEventListener('click', resetAll);

// Export Diagnostic Report
function exportReport() {
  const avgHold = holdDurations.length ? Math.round(holdDurations.reduce((a, b) => a + b, 0) / holdDurations.length) : 0;
  const totalActuations = Array.from(keyPressFrequencyMap.values()).reduce((a, b) => a + b, 0);

  const report = {
    application: "Keyboard Tester",
    version: "1.8.0",
    exportTime: new Date().toISOString(),
    osTarget: currentOS,
    soundProfile: currentSoundProfile,
    audioSettings: {
      soundEnabled: soundEnabled,
      soundProfile: currentSoundProfile,
      volumePercent: Math.round(soundVolume * 100),
      pitchMultiplier: Number(soundPitch.toFixed(2))
    },
    layout: currentLayout,
    enterVariant: currentVariant,
    heatmapModeActive: heatmapMode,
    practiceMode: {
      active: practiceMode,
      prompt: practiceCurrentText,
      progress: `${practiceCursor} / ${practiceCurrentText.length}`,
      accuracyPercent: practiceTotalInputs > 0 ? Math.max(0, Math.round((practiceCorrectInputs / practiceTotalInputs) * 100)) : 100,
      errors: practiceErrorCount,
      completed: practiceCursor >= practiceCurrentText.length
    },
    customRemaps: {
      activeCount: customRemapMap.size,
      mappings: Object.fromEntries(customRemapMap)
    },
    jitterAnalysis: {
      totalSamples: jitterSamples.length,
      minDeltaMs: minJitterDelta !== null ? minJitterDelta : null,
      averageDeltaMs: jitterSamples.length > 0 ? Number((jitterSamples.reduce((a, b) => a + b, 0) / jitterSamples.length).toFixed(1)) : 0,
      stdDevMs: jitterSamples.length > 0 ? Number(Math.sqrt(jitterSamples.reduce((a, b, _, arr) => a + Math.pow(b - (arr.reduce((x, y) => x + y, 0) / arr.length), 2), 0) / jitterSamples.length).toFixed(2)) : 0,
      distributionBins: {
        severeUnder5ms: jitterBins[0],
        fast5to10ms: jitterBins[1],
        standard10to15ms: jitterBins[2],
        normal15to20ms: jitterBins[3],
        conservative20to25ms: jitterBins[4],
        cleanOver25ms: jitterBins[5]
      }
    },
    summary: {
      testedKeysCount: testedKeys.size,
      totalKeysAvailable: currentTotalTestableKeys,
      coveragePercent: currentTotalTestableKeys > 0 ? `${Math.round((testedKeys.size / currentTotalTestableKeys) * 100)}%` : "0%",
      maxRolloverKeys: maxRollover,
      chatterBounceAlerts: chatterCount,
      averageHoldDurationMs: avgHold,
      peakWpm: peakWpm,
      peakCps: Number(peakCps.toFixed(1)),
      totalEventsRecorded: eventCounter,
      totalKeyActuations: totalActuations
    },
    heatmap: {
      modeActive: heatmapMode,
      totalUniqueKeysActuated: keyPressFrequencyMap.size,
      totalActuations: totalActuations,
      frequencyMap: Object.fromEntries(keyPressFrequencyMap)
    },
    testedKeys: Array.from(testedKeys)
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `keyboard-test-report-${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

exportBtn.addEventListener('click', exportReport);

// Layout Switching Logic
function calculateVisibleTestableKeys() {
  let count = 0;
  keyMap.forEach((el) => {
    if (el.offsetParent !== null) {
      count++;
    }
  });
  currentTotalTestableKeys = count > 0 ? count : keyMap.size;
  updateProgress();
}

function setLayout(layout) {
  currentLayout = layout;
  layoutBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-layout') === layout);
  });

  keyboardEl.classList.remove('layout-tkl', 'layout-75', 'layout-65', 'layout-60');
  if (layout !== '100') {
    keyboardEl.classList.add(`layout-${layout}`);
  }

  // Reading offsetParent forces a synchronous layout, so recalculate now so the
  // progress denominator is never stale, then again after the next frame
  calculateVisibleTestableKeys();
  requestAnimationFrame(() => {
    calculateVisibleTestableKeys();
  });
}

layoutBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    setLayout(btn.getAttribute('data-layout'));
  });
});

// Variant Switching Logic (ANSI vs ISO)
function setVariant(variant) {
  currentVariant = variant;
  variantBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-variant') === variant);
  });
  keyboardEl.classList.toggle('variant-iso', variant === 'iso');

  // The variant swaps which keys are present, so recalculate the testable total
  // synchronously (offsetParent forces layout) and again after the next frame
  calculateVisibleTestableKeys();
  requestAnimationFrame(() => {
    calculateVisibleTestableKeys();
  });
}

variantBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    setVariant(btn.getAttribute('data-variant'));
  });
});

// Realtime Typing Speed (WPM & CPS) Benchmark Engine
function updateSpeedBenchmark() {
  const now = performance.now();
  while (recentKeyPressTimes.length > 0 && now - recentKeyPressTimes[0] > 3000) {
    recentKeyPressTimes.shift();
  }

  let currentCps = 0;
  let currentWpm = 0;

  if (recentKeyPressTimes.length >= 2) {
    const timeSpanMs = now - recentKeyPressTimes[0];
    if (timeSpanMs > 250) {
      currentCps = recentKeyPressTimes.length / (timeSpanMs / 1000);
      currentWpm = Math.round((currentCps * 60) / 5);
    }
  }

  if (currentWpm > peakWpm) peakWpm = currentWpm;
  if (currentCps > peakCps) peakCps = currentCps;

  if (currentWpmValueEl) {
    currentWpmValueEl.textContent = `${currentWpm} WPM`;
  }
  if (cpsSubValueEl) {
    cpsSubValueEl.textContent = `${currentCps.toFixed(1)} CPS • Peak: ${peakWpm} WPM`;
  }
}

setInterval(updateSpeedBenchmark, 200);

// Sound Profile Selector
if (soundProfileSelect) {
  soundProfileSelect.addEventListener('change', (e) => {
    currentSoundProfile = e.target.value;
  });
}

// OS Toggle
function setOS(os) {
  currentOS = os;
  const osLabels = document.querySelectorAll('.os-label');

  if (os === 'mac') {
    osMacBtn.classList.add('active');
    osWinBtn.classList.remove('active');
    osLabels.forEach(el => {
      const macText = el.getAttribute('data-mac');
      if (macText) el.textContent = macText;
    });
  } else {
    osWinBtn.classList.add('active');
    osMacBtn.classList.remove('active');
    osLabels.forEach(el => {
      const winText = el.getAttribute('data-win');
      if (winText) el.textContent = winText;
    });
  }
}

osMacBtn.addEventListener('click', () => setOS('mac'));
osWinBtn.addEventListener('click', () => setOS('win'));

// Sound Toggle
soundToggleBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    soundToggleBtn.classList.add('active');
    soundToggleBtn.innerHTML = '<span class="icon">🔊</span> Sound: ON';
  } else {
    soundToggleBtn.classList.remove('active');
    soundToggleBtn.innerHTML = '<span class="icon">🔇</span> Sound: OFF';
  }
});

// Audio Tuning Controls
if (volumeSlider) {
  volumeSlider.addEventListener('input', (e) => {
    soundVolume = parseFloat(e.target.value) / 100;
    if (volumeValue) volumeValue.textContent = `${e.target.value}%`;
  });
}

if (pitchSlider) {
  pitchSlider.addEventListener('input', (e) => {
    soundPitch = parseFloat(e.target.value);
    if (pitchValue) pitchValue.textContent = `${soundPitch.toFixed(2)}x`;
  });
}

if (testAudioBtn) {
  testAudioBtn.addEventListener('click', () => {
    playKeySound(true);
    setTimeout(() => playKeySound(false), 90);
  });
}

if (resetAudioBtn) {
  resetAudioBtn.addEventListener('click', () => {
    soundVolume = 1.0;
    soundPitch = 1.0;
    if (volumeSlider) volumeSlider.value = 100;
    if (volumeValue) volumeValue.textContent = '100%';
    if (pitchSlider) pitchSlider.value = 1.0;
    if (pitchValue) pitchValue.textContent = '1.00x';
  });
}

if (audioSettingsBtn && audioTuningDropdown) {
  audioSettingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = audioTuningDropdown.style.display === 'none';
    audioTuningDropdown.style.display = isHidden ? 'flex' : 'none';
    audioSettingsBtn.classList.toggle('active', isHidden);
  });
}

if (closeAudioSettingsBtn && audioTuningDropdown) {
  closeAudioSettingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    audioTuningDropdown.style.display = 'none';
    if (audioSettingsBtn) audioSettingsBtn.classList.remove('active');
  });
}

// Close audio dropdown on outside click
document.addEventListener('click', (e) => {
  if (audioTuningDropdown && audioTuningDropdown.style.display !== 'none') {
    if (!audioTuningDropdown.contains(e.target) && e.target !== audioSettingsBtn && !audioSettingsBtn.contains(e.target)) {
      audioTuningDropdown.style.display = 'none';
      if (audioSettingsBtn) audioSettingsBtn.classList.remove('active');
    }
  }
});

// Heatmap Toggle
if (heatmapToggleBtn) {
  heatmapToggleBtn.addEventListener('click', toggleHeatmapMode);
}

// Practice Mode Event Listeners
if (practiceToggleBtn) {
  practiceToggleBtn.addEventListener('click', togglePracticeMode);
}

if (practicePromptSelect) {
  practicePromptSelect.addEventListener('change', (e) => {
    initPracticePrompt(parseInt(e.target.value, 10));
  });
}

if (practiceResetBtn) {
  practiceResetBtn.addEventListener('click', () => {
    initPracticePrompt(practicePromptIndex);
  });
}

if (practiceNextBtn) {
  practiceNextBtn.addEventListener('click', () => {
    practicePromptIndex = (practicePromptIndex + 1) % PRACTICE_PROMPTS.length;
    if (practicePromptSelect) practicePromptSelect.value = String(practicePromptIndex);
    initPracticePrompt(practicePromptIndex);
  });
}

// Remap Mode & Modal Listeners
if (remapToggleBtn) {
  remapToggleBtn.addEventListener('click', toggleRemapMode);
}

if (remapApplyBtn) {
  remapApplyBtn.addEventListener('click', applyRemap);
}

if (remapCancelBtn) {
  remapCancelBtn.addEventListener('click', closeRemapModal);
}

if (remapModalCloseBtn) {
  remapModalCloseBtn.addEventListener('click', closeRemapModal);
}

if (remapRemoveBtn) {
  remapRemoveBtn.addEventListener('click', removeRemap);
}

if (clearAllRemapsBtn) {
  clearAllRemapsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearAllRemaps();
  });
}

if (remapModalBackdrop) {
  remapModalBackdrop.addEventListener('click', (e) => {
    if (e.target === remapModalBackdrop) {
      closeRemapModal();
    }
  });
}

presetBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const target = btn.getAttribute('data-target');
    if (target) {
      setCapturedTarget(target);
    }
  });
});

// Click key to remap when Remap Mode is ON
keyElements.forEach(el => {
  el.addEventListener('click', (e) => {
    if (remapMode) {
      e.stopPropagation();
      const code = el.getAttribute('data-code');
      if (code) {
        openRemapModal(code);
      }
    }
  });
});

// Auto-focus keyboard wrapper on click so user is immediately ready
keyboardWrapper.addEventListener('click', () => {
  keyboardWrapper.focus();
});

// Initial Setup
calculateVisibleTestableKeys();

// Detect OS default
if (navigator.platform && navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
  setOS('mac');
} else {
  setOS('win');
}
