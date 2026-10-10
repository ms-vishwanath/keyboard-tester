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
const exportBtn = document.getElementById('exportBtn');
const resetBtn = document.getElementById('resetBtn');
const standardLegend = document.getElementById('standardLegend');
const heatmapLegend = document.getElementById('heatmapLegend');

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

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

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
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, 110 * pitch), now + 0.025);
        gain.gain.setValueAtTime(0.09 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
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
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.065);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(130 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, 50 * pitch), now + 0.03);
        gain.gain.setValueAtTime(0.07 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
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
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, 80 * pitch), now + 0.03);
        gain.gain.setValueAtTime(0.08 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.032);
      }
    }
  } catch (err) {
    // Ignore audio initialization errors if blocked by browser policy
  }
}

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

// Handle Key Down
window.addEventListener('keydown', (e) => {
  if (shouldPreventShortcut(e)) {
    e.preventDefault();
  }

  const code = e.code;
  const now = performance.now();

  // Switch Chatter / Bounce Detection (Rapid successive keydown < 25ms on same key)
  const lastDown = lastKeyDownTimeMap.get(code);
  if (lastDown && (now - lastDown < 25) && !e.repeat) {
    chatterCount++;
    chatterCountEl.textContent = chatterCount;
    chatterCountEl.style.color = '#ef4444';
    chatterStatusEl.textContent = `Alert: Chatter on ${code} (${Math.round(now - lastDown)}ms)`;
    if (chatterCardEl) chatterCardEl.style.borderColor = '#ef4444';
  }
  lastKeyDownTimeMap.set(code, now);

  // Press Frequency Tracking
  const pressCount = (keyPressFrequencyMap.get(code) || 0) + 1;
  keyPressFrequencyMap.set(code, pressCount);
  recentKeyPressTimes.push(now);

  activeKeys.add(code);
  testedKeys.add(code);

  if (activeKeys.size > maxRollover) {
    maxRollover = activeKeys.size;
    maxRolloverValueEl.textContent = `Max peak: ${maxRollover} keys`;
  }

  // Update Diagnostics
  lastKeyValueEl.textContent = e.key === ' ' ? 'Space' : e.key;
  lastKeyCodeValueEl.textContent = `event.code: ${e.code}`;
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
  appendEventLog('keydown', e);
  playKeySound(true);
});

// Handle Key Up
window.addEventListener('keyup', (e) => {
  const code = e.code;
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

  appendEventLog('keyup', e);
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
    version: "1.5.0",
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

  // Allow DOM reflow then recalculate
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
