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

// DOM Elements
const keyboardWrapper = document.getElementById('keyboardWrapper');
const keyElements = document.querySelectorAll('.key[data-code]');
const lastKeyValueEl = document.getElementById('lastKeyValue');
const lastKeyCodeValueEl = document.getElementById('lastKeyCodeValue');
const lastWhichValueEl = document.getElementById('lastWhichValue');
const keyLocationValueEl = document.getElementById('keyLocationValue');
const activeKeysCountEl = document.getElementById('activeKeysCount');
const maxRolloverValueEl = document.getElementById('maxRolloverValue');
const testedProgressEl = document.getElementById('testedProgress');
const progressBarEl = document.getElementById('progressBar');
const preventShortcutsCheckbox = document.getElementById('preventShortcutsCheckbox');
const eventLogBody = document.getElementById('eventLogBody');
const logCounterEl = document.getElementById('logCounter');

const osMacBtn = document.getElementById('osMacBtn');
const osWinBtn = document.getElementById('osWinBtn');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const resetBtn = document.getElementById('resetBtn');

// Key code mapping cache
const keyMap = new Map();
keyElements.forEach(el => {
  const code = el.getAttribute('data-code');
  if (code) {
    keyMap.set(code, el);
  }
});

const totalTestableKeys = keyMap.size;

// Web Audio API Synth for Mechanical Key Click
let audioCtx = null;

function playKeySound(isKeyDown = true) {
  if (!soundEnabled) return;

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

    if (isKeyDown) {
      // Crisp mechanical clack
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.04);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } else {
      // Subtle switch release pop
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
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
  testedProgressEl.textContent = `${testedCount} / ${totalTestableKeys}`;
  const pct = totalTestableKeys > 0 ? (testedCount / totalTestableKeys) * 100 : 0;
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

// Handle Key Down
window.addEventListener('keydown', (e) => {
  if (shouldPreventShortcut(e)) {
    e.preventDefault();
  }

  const code = e.code;
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
  maxRollover = 0;
  eventCounter = 0;

  keyElements.forEach(el => {
    el.classList.remove('active', 'tested');
  });

  lastKeyValueEl.textContent = '—';
  lastKeyCodeValueEl.textContent = 'event.code: none';
  lastWhichValueEl.textContent = '—';
  keyLocationValueEl.textContent = 'Location: Standard';
  activeKeysCountEl.textContent = '0';
  maxRolloverValueEl.textContent = 'Max peak: 0 keys';
  logCounterEl.textContent = '0 events recorded';

  eventLogBody.innerHTML = `
    <tr class="empty-state">
      <td colspan="7">Press any key on your keyboard to begin testing...</td>
    </tr>
  `;

  updateProgress();
}

resetBtn.addEventListener('click', resetAll);

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

// Auto-focus keyboard wrapper on click so user is immediately ready
keyboardWrapper.addEventListener('click', () => {
  keyboardWrapper.focus();
});

// Initial Setup
updateProgress();

// Detect OS default
if (navigator.platform && navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
  setOS('mac');
} else {
  setOS('win');
}
