(() => {
  const canvas = document.getElementById('game');
  if (!canvas) { console.warn('Canvas #game not found — aborting game script'); return; }
  const ctx = canvas.getContext('2d');
  // Accessibility: make canvas focusable and provide an aria-label describing controls so
  // keyboard and screen-reader users can discover how to play without editing HTML.
  try {
    canvas.setAttribute('role', 'application');
    canvas.setAttribute('aria-label', 'Garden shooter game canvas — use arrow keys or A/D to move; Space or tap center to fire. Press I for help.');
    canvas.setAttribute('tabindex', '0');
  } catch (e) { /* ignore attribute errors in older browsers */ }
  let cw, ch;
  let player;
  function resize() {
    // Support high-DPI / Retina displays by scaling the canvas backing store using devicePixelRatio
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;
    // Set backing store size and keep CSS size equal to viewport so existing layout remains unchanged
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    // Scale drawing operations so the rest of the code can continue using CSS-pixel coordinates (cw/ch)
    try { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); } catch (e) { /* ignore if context not available */ }
    cw = cssW;
    ch = cssH;
    // Keep player anchored to the bottom when the window resizes
    if (typeof player !== 'undefined') {
      player.y = ch - 80;
      player.x = Math.max(20, Math.min(cw - 20, player.x));
    }
  }
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 120);
  }, { passive: true });
  resize();
  // Prevent right-click context menu on game canvas to avoid accidental interruption
  try { canvas.addEventListener('contextmenu', e => { e.preventDefault(); }); } catch (e) { /* ignore */ }
  // Improve accessibility: focus the canvas on pointer interaction so keyboard controls work after tap/click
  try { canvas.addEventListener('pointerdown', () => { try { canvas.focus(); } catch (e) {} }, { passive: true }); } catch (e) { /* ignore */ }

  const scoreEl = document.getElementById('score');
  const versionEl = document.getElementById('version');
  const livesEl = document.getElementById('lives');
  const waveEl = document.getElementById('wave');
  // Accessibility: announce wave changes to assistive tech
  if (waveEl) { try { waveEl.setAttribute('aria-live', 'polite'); waveEl.setAttribute('role', 'status'); } catch (e) {} }
  const version = '2.91.0';
  let score = 0;
  let highScore = (function(){ try { const v = parseInt(localStorage.getItem('selfmade_highscore')||'0', 10); return isNaN(v) ? 0 : Math.max(0, v); } catch (e) { return 0; } })();
  let lives = 3;
  let gameOver = false;
  const keys = {left:false,right:false,fire:false};
  function clearInputs() { keys.left = keys.right = keys.fire = false; }
  // Detect touch-capable devices to show subtle touch-zone guides for discoverability
  const isTouch = (typeof window !== 'undefined') && (('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0));
  // Show a simple horizontal guide once after the first touch so mobile users discover control zones
  let touchGuideShown = false;
  if (typeof window !== 'undefined') {
    try { window.addEventListener('touchstart', () => { touchGuideShown = true; }, { once: true, passive: true }); } catch (e) { /* ignore */ }
  }

  // Hide on-screen touch control buttons on touch devices so full-screen touch zones are used instead
  const touchControls = document.getElementById('touch-controls');
  if (isTouch && touchControls) {
    try {
      touchControls.style.display = 'none';
      touchControls.setAttribute('aria-hidden', 'true');
    } catch (e) { /* ignore DOM errors */ }
  }

  // Transient controls hint: shows briefly on startup (ms)
  const tipDuration = 4000;
  let tipExpires = Date.now() + tipDuration;

  // Simple WebAudio effects (oscillators only). Created on first user gesture to satisfy autoplay policies.
  let audioCtx = null;
  // sound toggle persisted in localStorage ('1' = on, '0' = off)
  let soundEnabled;
  try {
    const s = localStorage.getItem('selfmade_sound');
    soundEnabled = (s === null) ? true : (s === '1');
  } catch (e) {
    // localStorage may be disabled; default to sound on
    soundEnabled = true;
  }
  function ensureAudio() {
    if (!soundEnabled) return;
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; }
    }
    // If the context is suspended (autoplay policy), try to resume it on first user gesture.
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => { /* ignore resume failures */ });
    }
  }
  // Resume suspended AudioContext on first pointer or key gesture for broader reliability
  if (typeof window !== 'undefined') {
    const resumeAudioOnGesture = () => { if (soundEnabled) ensureAudio(); };
    window.addEventListener('pointerdown', resumeAudioOnGesture, { once: true, passive: true });
    window.addEventListener('keydown', resumeAudioOnGesture, { once: true });
  }
  function playSound(type='blip') {
    if (!soundEnabled) return;
    ensureAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    if (type === 'fire') { o.type = 'square'; o.frequency.setValueAtTime(880, now); g.gain.setValueAtTime(0.02, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12); }
    else if (type === 'hit') { o.type = 'sawtooth'; o.frequency.setValueAtTime(220, now); g.gain.setValueAtTime(0.04, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18); }
    else { o.type='sine'; o.frequency.setValueAtTime(440, now); g.gain.setValueAtTime(0.02, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.1); }
    o.start(now); o.stop(now + 0.2);
  }
  const muteBtn = document.getElementById('muteBtn');
  function updateMuteUI() {
    if (!muteBtn) return;
    muteBtn.textContent = soundEnabled ? '🔊' : '🔇';
    muteBtn.setAttribute('aria-pressed', (!soundEnabled).toString());
    // Accessibility: provide a clear aria-label describing current state and action for screen readers
    muteBtn.setAttribute('aria-label', soundEnabled ? 'Sound: On. Click to mute.' : 'Sound: Off. Click to unmute.');
    muteBtn.title = soundEnabled ? 'Sound: On (click to mute)' : 'Sound: Off (click to unmute)';
  }
  if (muteBtn) {
    // Make mute button explicitly a button for assistive tech and keyboard focus
    try { muteBtn.setAttribute('role', 'button'); muteBtn.setAttribute('tabindex', '0'); } catch (e) {}
    muteBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      try { localStorage.setItem('selfmade_sound', soundEnabled ? '1' : '0'); } catch (e) { /* ignore storage errors */ }
      if (soundEnabled) ensureAudio();
      updateMuteUI();
    });
    // Allow keyboard activation (Enter / Space) when the mute button is focused
    muteBtn.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter' || evt.key === ' ' || evt.key === 'Spacebar') {
        evt.preventDefault();
        try { muteBtn.click(); } catch (e) { /* ignore */ }
      }
    });
    // Announce mute state changes to assistive tech
    try { muteBtn.setAttribute('aria-live', 'polite'); } catch (e) {}
    updateMuteUI();
  }
  // Help button: toggle help overlay
  const helpBtn = document.getElementById('helpBtn');
  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      try {
        helpOpen = !helpOpen;
        if (helpOpen) {
          if (replayBtn) try { replayBtn.style.display = 'none'; } catch (err) {}
          if (typeof overlay !== 'undefined' && overlay) { overlay.setAttribute('aria-label', 'Help'); setOverlayVisible(true); updateOverlayMessage(); }
        } else {
          if (replayBtn) try { replayBtn.style.display = ''; } catch (err) {}
          if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); }
        }
      } catch (e) { /* ignore */ }
    });
  }

  // Changes button: show recent changelog entries inside the overlay (no external requests)
  const changesBtn = document.getElementById('changesBtn');
  let changesOpen = false;
  let changesContainer = null;
  const recentChanges = [
    '2.71.0 — Cap enemy spawn speed to keep waves beatable (small)',
    '2.70.0 — Accessibility: pause on blur/visibility with debounce; suspend/resume audio; announce overlay for screen readers (small)',
    '2.69.0 — UI: increase Wave HUD font-size for better readability (small)',
    '2.68.0 — Add visual feedback (particles and small screen shake) when player loses a life (small)',
    '2.67.0 — Add help overlay toggled with I key and Help button; displays basic controls and closes with I, Escape, or click (small)'
  ];
  function showChangesOverlay(open) {
    if (!overlay) return;
    changesOpen = !!open;
    if (changesOpen) {
      // ensure other overlays are closed
      helpOpen = false;
      if (replayBtn) try { replayBtn.style.display = 'none'; } catch (e) {}
      if (typeof overlay !== 'undefined' && overlay) { overlay.setAttribute('aria-label', 'Recent changes'); setOverlayVisible(true); }
      // create container if missing
      if (!changesContainer) {
        changesContainer = document.createElement('div');
        changesContainer.className = 'changes-list';
        changesContainer.style.maxHeight = '60vh';
        changesContainer.style.overflowY = 'auto';
        changesContainer.style.padding = '8px 12px';
        changesContainer.style.background = 'rgba(0,0,0,0.18)';
        changesContainer.style.borderRadius = '8px';
        changesContainer.style.color = '#fff';
        changesContainer.style.textAlign = 'left';
        changesContainer.style.fontSize = '14px';
      }
      // populate
      while (changesContainer.firstChild) changesContainer.removeChild(changesContainer.firstChild);
      recentChanges.slice(0,50).forEach(line => {
        const d = document.createElement('div');
        d.textContent = line;
        d.style.marginBottom = '6px';
        changesContainer.appendChild(d);
      });
      // insert after overlayMessage if present
      try {
        if (overlayMessage && overlayMessage.parentNode) overlay.insertBefore(changesContainer, overlayMessage.nextSibling);
        else overlay.appendChild(changesContainer);
      } catch (e) { /* ignore DOM errors */ }
    } else {
      // close and cleanup
      try { if (changesContainer && changesContainer.parentNode) changesContainer.parentNode.removeChild(changesContainer); } catch (e) {}
      if (typeof overlay !== 'undefined' && overlay) { overlay.setAttribute('aria-label', ''); setOverlayVisible(paused || gameOver); }
    }
  }
  if (changesBtn) {
    try { changesBtn.setAttribute('role', 'button'); changesBtn.setAttribute('tabindex', '0'); } catch (e) {}
    changesBtn.addEventListener('click', () => {
      try {
        showChangesOverlay(!changesOpen);
        if (overlayMessage) overlayMessage.textContent = changesOpen ? 'Recent changes' : '';
      } catch (e) { /* ignore */ }
    });
    // Allow keyboard activation (Enter / Space) when the changes button is focused
    changesBtn.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter' || evt.key === ' ' || evt.key === 'Spacebar') {
        evt.preventDefault();
        try { changesBtn.click(); } catch (e) { /* ignore */ }
      }
    });
  }

  window.addEventListener('keydown', e => {
    // prevent arrow keys and space from scrolling the page while playing
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); keys.left = true; }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); keys.right = true; }
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space') {
      e.preventDefault();
      // Convenience: allow Space to resume the game when paused (but not when game over).
      // Otherwise, when playing, Space fires as before.
      if (paused && !gameOver) {
        paused = false;
        pausedByFocus = false;
        if (typeof blurTimeout !== 'undefined' && blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; }
        if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); }
        try { if (canvas && typeof canvas.focus === 'function') { canvas.focus(); } } catch (err) { /* ignore focus errors */ }
      } else {
        keys.fire = true;
      }
    }
    // 'P' or 'Escape' toggles pause (accessibility): do not unpause when game is over
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      // If Escape is pressed while Help overlay is open, close help instead of toggling pause
      if ((e.key === 'Escape') && typeof helpOpen !== 'undefined' && helpOpen) {
        helpOpen = false;
        if (replayBtn) try { replayBtn.style.display = ''; } catch (err) {}
        if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); }
        return;
      }
      if (!gameOver) {
        paused = !paused;
        // user toggled pause; clear pausedByFocus so auto-resume doesn't override user's intent
        pausedByFocus = false;
        // If an auto-pause timeout was pending (blur/visibility debounce), clear it so manual toggle takes precedence
        if (typeof blurTimeout !== 'undefined' && blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; }
        if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); }
      }
    }
    // 'M' or 'S' toggles sound mute/unmute (persisted). Provide 'S' as an alternate mnemonic for "sound".
    if (e.key === 'm' || e.key === 'M' || e.key === 's' || e.key === 'S') {
      soundEnabled = !soundEnabled;
      try { localStorage.setItem('selfmade_sound', soundEnabled ? '1' : '0'); } catch (e) { /* ignore storage errors */ }
      if (soundEnabled) ensureAudio();
      updateMuteUI();
    }
    // 'O' toggles auto-pause on blur/visibility (accessibility preference)
    if (e.key === 'o' || e.key === 'O') {
      autoPauseEnabled = !autoPauseEnabled;
      try { localStorage.setItem('selfmade_autopause', autoPauseEnabled ? '1' : '0'); } catch (err) { /* ignore storage errors */ }
      let announcer = document.getElementById('autopause-announcer');
      if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'autopause-announcer';
        announcer.style.position = 'absolute';
        announcer.style.left = '-9999px';
        announcer.setAttribute('aria-live', 'polite');
        document.body.appendChild(announcer);
      }
      try { announcer.textContent = autoPauseEnabled ? 'Auto-pause enabled' : 'Auto-pause disabled'; } catch (err) { /* ignore */ }
    }
    // 'H' toggles HUD visibility (accessibility / distraction-free). Announces state to assistive tech.
    if (e.key === 'h' || e.key === 'H') {
      try {
        const ui = document.getElementById('ui');
        if (ui) {
          const hidden = ui.getAttribute('data-hidden') === 'true';
          if (hidden) {
            ui.style.display = '';
            ui.setAttribute('data-hidden','false');
            // Announce visibility
            let announcer = document.getElementById('hud-announcer');
            if (!announcer) {
              announcer = document.createElement('div');
              announcer.id = 'hud-announcer';
              announcer.style.position = 'absolute';
              announcer.style.left = '-9999px';
              announcer.style.width = '1px';
              announcer.style.height = '1px';
              announcer.setAttribute('aria-live','polite');
              document.body.appendChild(announcer);
            }
            try { announcer.textContent = 'HUD visible'; } catch (e) {}
          } else {
            ui.style.display = 'none';
            ui.setAttribute('data-hidden','true');
            let announcer = document.getElementById('hud-announcer');
            if (!announcer) {
              announcer = document.createElement('div');
              announcer.id = 'hud-announcer';
              announcer.style.position = 'absolute';
              announcer.style.left = '-9999px';
              announcer.style.width = '1px';
              announcer.style.height = '1px';
              announcer.setAttribute('aria-live','polite');
              document.body.appendChild(announcer);
            }
            try { announcer.textContent = 'HUD hidden'; } catch (e) {}
          }
        }
      } catch (e) { /* ignore */ }
    }

    // 'I' toggles a brief help overlay describing controls. Closes when pressed again or when Escape is pressed.
    if (e.key === 'i' || e.key === 'I') {
      try {
        helpOpen = !helpOpen;
        if (helpOpen) {
          if (replayBtn) try { replayBtn.style.display = 'none'; } catch (err) {}
          if (typeof overlay !== 'undefined' && overlay) { overlay.setAttribute('aria-label', 'Help'); setOverlayVisible(true); updateOverlayMessage(); }
        } else {
          if (replayBtn) try { replayBtn.style.display = ''; } catch (err) {}
          if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); }
        }
      } catch (e) { /* ignore */ }
    }

    // 'C' toggles a colorblind-friendly palette for better accessibility. Preference is persisted.
    if (e.key === 'c' || e.key === 'C') {
      try {
        const enabled = document.body.classList.toggle('colorblind-mode');
        try { localStorage.setItem('selfmade_colorblind', enabled ? '1' : '0'); } catch (err) { /* ignore storage errors */ }
        // Announce the change to assistive tech
        let announcer = document.getElementById('color-mode-announcer');
        if (!announcer) {
          announcer = document.createElement('div');
          announcer.id = 'color-mode-announcer';
          announcer.style.position = 'absolute';
          announcer.style.left = '-9999px';
          announcer.style.width = '1px';
          announcer.style.height = '1px';
          announcer.setAttribute('aria-live','polite');
          document.body.appendChild(announcer);
        }
        try { announcer.textContent = enabled ? 'Colorblind mode enabled' : 'Colorblind mode disabled'; } catch (err) { /* ignore */ }
      } catch (e) { /* ignore */ }
    }
    // Allow Enter/Return to resume when the game is paused (but not when it's game over)
    if (e.key === 'Enter' && paused && !gameOver) {
      paused = false;
      pausedByFocus = false;
      if (typeof blurTimeout !== 'undefined' && blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; }
      if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); }
      try { if (canvas && typeof canvas.focus === 'function') { canvas.focus(); } } catch (err) { /* ignore focus errors */ }
    }
    // 'R' or Enter restarts the game when it's over (keyboard accessibility)
    if ((e.key === 'r' || e.key === 'R' || e.key === 'Enter') && gameOver) {
      if (replayBtn) { try { replayBtn.click(); } catch (err) { /* ignore click errors */ } }
    }
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); keys.left = false; }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); keys.right = false; }
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space') { e.preventDefault(); keys.fire = false; }
  });

  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');
  const fireBtn = document.getElementById('fireBtn');
  function setTouch(btn, name) {
    if (!btn) return;
    btn.addEventListener('touchstart', e => { e.preventDefault(); keys[name] = true; });
    btn.addEventListener('touchend', e => { e.preventDefault(); keys[name] = false; });
    // Ensure canceled touches clear the input state to avoid stuck controls on some devices/browsers
    btn.addEventListener('touchcancel', e => { e.preventDefault(); keys[name] = false; });
    btn.addEventListener('mousedown', e => { e.preventDefault(); keys[name] = true; });
    btn.addEventListener('mouseup', e => { e.preventDefault(); keys[name] = false; });
    // Clear state when the pointer leaves the element or the pointer is canceled
    btn.addEventListener('mouseleave', e => { e.preventDefault(); keys[name] = false; });
    btn.addEventListener('pointercancel', e => { e.preventDefault(); keys[name] = false; });
  }
  setTouch(leftBtn, 'left'); setTouch(rightBtn, 'right'); setTouch(fireBtn, 'fire');
// overlay and replay button
const overlay = document.getElementById('overlay');
const replayBtn = document.getElementById('replayBtn');
// create or locate a simple accessible message element inside the overlay so screen readers
// and users know whether the game is paused or over. This is created dynamically to avoid
// requiring index.html edits and keeps the change small and reversible.
let overlayMessage = null; let lifeAnnouncer = null;
if (overlay) {
  overlayMessage = overlay.querySelector('.overlay-message');
  if (!overlayMessage) {
    overlayMessage = document.createElement('div');
    overlayMessage.className = 'overlay-message';
    overlayMessage.style.marginBottom = '8px';
    overlayMessage.style.fontSize = '18px';
    overlayMessage.style.color = '#fff';
    // Use a more assertive live region so auto-pauses are immediately announced to screen readers
    overlayMessage.setAttribute('role', 'alert');
    overlayMessage.setAttribute('aria-live', 'assertive');
    overlayMessage.setAttribute('aria-atomic', 'true');
    overlay.insertBefore(overlayMessage, overlay.firstChild);
    // Provide an accessible label for the overlay to clarify its purpose to screen readers
    overlay.setAttribute('aria-label', 'Game overlay — paused or game over');
  }
  // Ensure there's a dedicated live region to announce life changes (e.g., "Life lost — 2 lives remaining")
  try {
    lifeAnnouncer = document.getElementById('life-announcer');
    if (!lifeAnnouncer) {
      lifeAnnouncer = document.createElement('div');
      lifeAnnouncer.id = 'life-announcer';
      lifeAnnouncer.style.position = 'absolute';
      lifeAnnouncer.style.left = '-9999px';
      lifeAnnouncer.style.width = '1px';
      lifeAnnouncer.style.height = '1px';
      lifeAnnouncer.setAttribute('aria-live', 'assertive');
      lifeAnnouncer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(lifeAnnouncer);
    }
  } catch (e) { /* ignore announcer creation errors */ }
  // Helper to set overlay visibility and accessible dialog attributes
  function setOverlayVisible(show) {
    if (!overlay) return;
    overlay.setAttribute('aria-hidden', show ? 'false' : 'true');
    if (show) {
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.style.pointerEvents = 'auto';
      // Make the overlay focusable and move focus to it so screen readers announce the pause/overlay state
      overlay.setAttribute('tabindex', '-1');
      try { overlay.focus(); } catch (e) { /* ignore focus errors */ }
    } else {
      overlay.setAttribute('role', 'status');
      overlay.removeAttribute('aria-modal');
      overlay.style.pointerEvents = 'none';
      overlay.removeAttribute('tabindex');
    }
  }
  // Small UX/accessibility helper: show different overlay messages when pause was triggered by focus loss vs user toggle.
  function updateOverlayMessage() {
    if (!overlayMessage) return;
    try {
      if (typeof changesOpen !== 'undefined' && changesOpen) {
        overlayMessage.textContent = 'Recent changes — click or press Esc to close';
      } else if (typeof helpOpen !== 'undefined' && helpOpen) {
        overlayMessage.textContent = 'Help: ←/A and →/D to move; Space to fire; P to pause; I to toggle this help.';
      } else if (gameOver) overlayMessage.textContent = 'Game Over — Final Score: ' + score + ' — Waves: ' + (typeof waveNumber !== 'undefined' ? waveNumber : 0);
      else if (pausedByFocus) overlayMessage.textContent = 'Paused (lost focus) — return to this tab to resume';
      else if (paused) overlayMessage.textContent = 'Paused — press P or Esc to resume';
      else overlayMessage.textContent = '';
    } catch (e) { /* ignore DOM race conditions */ }
  }
  setOverlayVisible(false);
}

if (replayBtn) replayBtn.addEventListener('click', () => {
  gameOver = false;
  paused = false;
  pausedByFocus = false;
  score = 0;
  lives = 3;
  enemies.length = 0;
  bullets.length = 0;
  particles.length = 0;
  waveNumber = 0;
  lastSpawn = Date.now();
  player.x = cw/2;
  player.y = ch - 80;
  player.cooldown = 0;
  // If sound is enabled, ensure the AudioContext is available/resumed after a restart so sounds play reliably.
  try { if (soundEnabled) { ensureAudio(); } } catch (e) { /* ignore audio errors on some platforms */ }
  if (overlay) setOverlayVisible(false);
  // After restarting, restore keyboard focus to the canvas so users can continue with keys.
  try { if (canvas && typeof canvas.focus === 'function') { canvas.focus(); } } catch (err) { /* ignore focus errors */ }
});
// Allow clicking the overlay to resume when paused (but not when game over)
if (overlay) {
  overlay.addEventListener('click', (e) => {
    // If the game is over, clicking the overlay should restart the run (convenience for touch/mouse users).
    if (gameOver) {
      if (replayBtn) { try { replayBtn.click(); } catch (err) { /* ignore click errors */ } }
      return;
    }
    // If help is open, close it on click
    if (typeof helpOpen !== 'undefined' && helpOpen) {
      helpOpen = false;
      if (replayBtn) try { replayBtn.style.display = ''; } catch (err) {}
      if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); }
      try { if (canvas && typeof canvas.focus === 'function') { canvas.focus(); } } catch (err) { /* ignore focus errors */ }
      return;
    }
    // If changes overlay is open, close it on click
    if (typeof changesOpen !== 'undefined' && changesOpen) {
      try { showChangesOverlay(false); } catch (err) {}
      if (replayBtn) try { replayBtn.style.display = ''; } catch (err) {}
      if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); }
      try { if (canvas && typeof canvas.focus === 'function') { canvas.focus(); } } catch (err) { /* ignore focus errors */ }
      return;
    }
    if (!gameOver && paused) {
      paused = false;
      pausedByFocus = false;
      if (overlay) overlay.setAttribute('aria-hidden', 'true');
      // If audio was suspended by our auto-pause, resume it now when the user explicitly unpauses.
      if (suspendedAudioByFocus && audioCtx && audioCtx.state === 'suspended') {
        if (soundEnabled) { try { audioCtx.resume(); } catch (e) { /* ignore resume errors */ } }
        suspendedAudioByFocus = false;
      }
      // After unpausing via the overlay, restore keyboard focus to the canvas so users can continue with keys.
      try { if (canvas && typeof canvas.focus === 'function') { canvas.focus(); } } catch (err) { /* ignore focus errors */ }
    }
  });
}
  // Pause handling for accessibility: pause when window loses focus (debounced and respectful of gameOver)
  const AUTO_PAUSE_DEBOUNCE = 300; // ms used for blur/visibility auto-pause debounce
  let paused = false;
  let pausedByFocus = false;
  let helpOpen = false;
  // whether we suspended the AudioContext in response to an auto-pause so we can resume on focus/visibility restore
  let suspendedAudioByFocus = false;
  let blurTimeout = null;
  // Track whether a pointer/touch is currently active (prevents auto-pausing while user is holding touch or pointer)
  let pointerActive = false;
  // Preference: allow the user to disable auto-pause on blur/visibility (toggled with O). Defaults to enabled for safety.
  // Persist preference in localStorage ('1' = enabled, '0' = disabled)
  let autoPauseEnabled = (function(){ try { const v = localStorage.getItem('selfmade_autopause'); if (v === null) return true; return v === '1'; } catch (e) { return true; } })();
  // Keep pointer state updated across pointer/touch events so we can avoid accidental auto-pauses while interacting
  try {
    window.addEventListener('pointerdown', () => { pointerActive = true; }, { passive: true });
    window.addEventListener('pointerup', () => { pointerActive = false; }, { passive: true });
    window.addEventListener('pointercancel', () => { pointerActive = false; }, { passive: true });
    document.addEventListener('touchstart', () => { pointerActive = true; }, { passive: true });
    document.addEventListener('touchend', () => { pointerActive = false; }, { passive: true });
    document.addEventListener('touchcancel', () => { pointerActive = false; }, { passive: true });
  } catch (e) { /* ignore if environment doesn't support these events */ }

  // Accessibility polish: update document.title when the overlay shows an auto-pause so users
  // switching tabs or on mobile are more likely to notice the paused state. Use a MutationObserver
  // on the overlay (which is toggled when pausing) so this is small and non-invasive.
  const originalTitle = (typeof document !== 'undefined' && document.title) ? document.title : 'Selfmade';
  function setTitlePaused() { try { document.title = 'Paused — ' + originalTitle; } catch (e) { /* ignore title errors */ } }
  function restoreTitle() { try { document.title = originalTitle; } catch (e) { /* ignore title errors */ } }
  if (overlay) {
    try {
      const titleObserver = new MutationObserver(() => {
        try {
          const hidden = overlay.getAttribute('aria-hidden') === 'true';
          // If overlay is visible and its message mentions paused, show paused title; otherwise restore
          if (!hidden && overlayMessage && /paused/i.test(overlayMessage.textContent || '')) {
            setTitlePaused();
          } else {
            restoreTitle();
          }
        } catch (e) { /* ignore observer errors */ }
      });
      titleObserver.observe(overlay, { attributes: true, attributeFilter: ['aria-hidden'] });
      // Also ensure title is restored and pending auto-pause timers are cleared when the page is unloading
      window.addEventListener('beforeunload', () => {
        try { if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; } } catch (e) {}
        try { restoreTitle(); } catch (e) {}
      }, { passive: true });
    } catch (e) { /* ignore initialization errors */ }
  }
  window.addEventListener('blur', () => {
    if (!autoPauseEnabled) return;
    // If the user is actively interacting via pointer/touch (e.g., holding to fire or move), avoid auto-pausing.
    if (pointerActive) return;
    // wait a short time before pausing to avoid accidental pauses on transient focus loss
    blurTimeout = setTimeout(() => {
      paused = true;
      pausedByFocus = true;
      // Clear transient input state when auto-paused to avoid stuck controls (keyboard, mouse, or touch)
      clearInputs();
      // If audio is playing, suspend it when auto-pausing so sounds don't continue in background
      if (audioCtx && audioCtx.state === 'running') {
        try { audioCtx.suspend(); } catch (e) { /* ignore suspend errors */ }
        suspendedAudioByFocus = true;
      }
      blurTimeout = null;
      if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); }
    }, AUTO_PAUSE_DEBOUNCE);
  });
  window.addEventListener('focus', () => {
    if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; }
    // only unpause if the pause was caused by focus loss and the game isn't over
    if (pausedByFocus && !gameOver) {
      paused = false;
    }
    pausedByFocus = false;
    // If we suspended audio due to auto-pause, resume it when focus returns (respecting the user's sound setting)
    if (suspendedAudioByFocus && audioCtx && audioCtx.state === 'suspended') {
      if (soundEnabled) {
        try { audioCtx.resume(); } catch (e) { /* ignore resume errors */ }
      }
      suspendedAudioByFocus = false;
    }
    // When focus returns after an auto-pause, restore keyboard focus to the canvas so users can resume with keys immediately.
    try { if (!gameOver && !paused && canvas && typeof canvas.focus === 'function') { canvas.focus(); } } catch (e) { /* ignore focus errors */ }
    if (typeof overlay !== 'undefined' && overlay) {
      setOverlayVisible(paused || gameOver);
      updateOverlayMessage();
      // Clear any stale overlay message after auto-resume to avoid lingering ARIA announcements
      if (!paused && !gameOver && typeof overlayMessage !== 'undefined' && overlayMessage) { try { overlayMessage.textContent = ''; } catch (e) {} }
    }
  });

  // also handle visibility change (tabs/mobile): pause when document becomes hidden, and resume only if pausedByFocus
  document.addEventListener('visibilitychange', () => { if (!autoPauseEnabled) return;
    if (document.hidden) {
      // If pointer/touch interaction is active, don't auto-pause to avoid interrupting active play on touch-hold
      if (pointerActive) return;
      // Debounce visibility auto-pause to match blur behavior and avoid accidental pauses on quick tab switches
      if (!paused) {
        if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; }
        blurTimeout = setTimeout(() => {
          paused = true;
          pausedByFocus = true;
          // Clear transient input state when auto-paused to avoid stuck controls (keyboard, mouse, or touch)
          clearInputs();
          // If audio is playing, suspend it when auto-pausing so sounds don't continue in background
          if (audioCtx && audioCtx.state === 'running') {
            try { audioCtx.suspend(); } catch (e) { /* ignore suspend errors */ }
            suspendedAudioByFocus = true;
          }
          if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(true); updateOverlayMessage(); }
          blurTimeout = null;
        }, AUTO_PAUSE_DEBOUNCE);
      }
    } else {
      if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; }
      if (pausedByFocus && !gameOver) {
        paused = false;
      }
      pausedByFocus = false;
      // If audio was suspended by our auto-pause, resume it when visibility returns (respecting user's sound setting)
      if (suspendedAudioByFocus && audioCtx && audioCtx.state === 'suspended') {
        if (soundEnabled) {
          try { audioCtx.resume(); } catch (e) { /* ignore resume errors */ }
        }
        suspendedAudioByFocus = false;
      }
      if (typeof overlay !== 'undefined' && overlay) {
        setOverlayVisible(paused || gameOver);
        updateOverlayMessage();
        // Clear any stale overlay message after auto-resume to avoid lingering ARIA announcements
        if (!paused && !gameOver && typeof overlayMessage !== 'undefined' && overlayMessage) { try { overlayMessage.textContent = ''; } catch (e) {} }
      }
    }
  });

  // handle pagehide/navigation away: pause immediately and clear input so background navigation doesn't leave running game
  window.addEventListener('pagehide', () => {
    // Clear any pending auto-pause timers and restore title so no stray timers or paused title remain after navigation
    try { if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; } } catch (e) {}
    try { restoreTitle(); } catch (e) {}
    paused = true;
    pausedByFocus = true;
    // Clear transient input state when auto-paused to avoid stuck controls
    clearInputs();
    // If audio is playing, suspend it when auto-pausing so sounds don't continue in background
    if (audioCtx && audioCtx.state === 'running') {
      try { audioCtx.suspend(); } catch (e) { /* ignore suspend errors */ }
      suspendedAudioByFocus = true;
    }
    if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(true); updateOverlayMessage(); }
  });


  player = { x: cw/2, y: ch - 80, w: 40, h: 22, speed: 6, cooldown: 0 };
  const bullets = []; const enemies = []; const particles = []; let screenShake = 0;
  let lastSpawn = 0; let waveNumber = 0;

  // Kick off the first wave immediately so HUD shows an active wave on load
  let wavePulseUntil = 0;
  let livesPulseUntil = 0;

  spawnWave();
  // Focus the canvas on initial load so keyboard users can play without extra click
  try { if (canvas && typeof canvas.focus === 'function') { canvas.focus(); } } catch (e) { /* ignore focus errors */ }

  function spawnWave() {
    waveNumber++;
    // briefly show a wave banner so players notice wave transitions
    wavePulseUntil = Date.now() + 800;
    // Play a short chime to audibly signal the new wave (WebAudio oscillator only)
    try { playSound('blip'); } catch(e) { /* ignore audio errors */ }
    const count = 3 + Math.min(8, Math.floor(waveNumber * 0.6));
    for (let i=0;i<count;i++) {
      const ex = 40 + Math.random() * (cw-80);
      const ey = -20 - Math.random()*200;
      const speed = Math.min(4, 0.6 + Math.random()*1.2 + waveNumber*0.05);
      enemies.push({x:ex,y:ey,w:30,h:28,vy:speed, hp:1 + Math.floor(waveNumber/4)});
    }
    // Pulse the DOM wave HUD briefly to draw attention (CSS handles animation).
    if (waveEl) {
      try {
        waveEl.classList.remove('wave-pulse');
        // Force reflow to restart animation
        void waveEl.offsetWidth;
        waveEl.classList.add('wave-pulse');
        // remove the class after the pulse finishes to keep DOM clean
        setTimeout(() => waveEl.classList.remove('wave-pulse'), 900);
      } catch (e) { /* ignore DOM errors */ }
    }
  }

  function update(dt) {
    if (keys.left) player.x -= player.speed;
    if (keys.right) player.x += player.speed;
    player.x = Math.max(20, Math.min(cw-20, player.x));

    player.cooldown = Math.max(0, player.cooldown - dt);
    if (keys.fire && player.cooldown <= 0) {
      bullets.push({x:player.x, y:player.y-28, vy:-9, r:6});
      player.cooldown = 180; // ms
      playSound('fire');
    }

    for (let i=bullets.length-1;i>=0;i--) { bullets[i].y += bullets[i].vy; if (bullets[i].y < -10) bullets.splice(i,1); }
    for (let i=enemies.length-1;i>=0;i--) {
    enemies[i].y += enemies[i].vy;
    if (enemies[i].y > ch + 50) {
      enemies.splice(i,1);
      lives--;
      livesPulseUntil = Date.now() + 700;
      lives = Math.max(0, lives);
      // Announce life change to assistive tech so screen-reader users hear immediate feedback
      try {
        if (!lifeAnnouncer) lifeAnnouncer = document.getElementById('life-announcer');
        if (lifeAnnouncer) {
          const msg = lives > 0 ? ('Life lost. ' + lives + (lives === 1 ? ' life remaining.' : ' lives remaining.')) : 'Last life lost. Game over.';
          try { lifeAnnouncer.textContent = msg; } catch (e) { /* ignore DOM update errors */ }
        }
      } catch (e) { /* ignore announcer errors */ }
      // small hit feedback: spawn particles and add screen shake when player loses a life
      try {
        const pcLost = 8;
        for (let p=0;p<pcLost;p++) {
          const angle = Math.PI + (Math.random() - 0.5) * 1.5;
          const speed = 1 + Math.random() * 2;
          particles.push({
            x: player.x,
            y: player.y - 12,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: 2 + Math.random() * 3,
            life: 400 + Math.random() * 300,
            born: Date.now()
          });
        }
        screenShake = Math.min(20, screenShake + 6);
        playSound('hit');
      } catch (e) { /* ignore particle errors */ }
      if (lives <= 0) {
        gameOver = true;
        paused = true;
        // Persist high score when the run ends
        if (score > highScore) {
          highScore = score;
          try { localStorage.setItem('selfmade_highscore', highScore); } catch (e) { /* ignore storage errors */ }
          // Announce new high score to assistive tech so screen-reader users hear the achievement
          try {
            let scoreAnn = document.getElementById('score-announcer');
            if (!scoreAnn) {
              scoreAnn = document.createElement('div');
              scoreAnn.id = 'score-announcer';
              scoreAnn.style.position = 'absolute';
              scoreAnn.style.left = '-9999px';
              scoreAnn.setAttribute('aria-live', 'polite');
              scoreAnn.setAttribute('aria-atomic', 'true');
              document.body.appendChild(scoreAnn);
            }
            scoreAnn.textContent = 'New high score: ' + highScore;
          } catch (e) { /* ignore announcer errors */ }
        }
        // Accessibility: when the game ends, reveal the overlay and focus the Play Again button
        if (typeof overlay !== 'undefined' && overlay && replayBtn) {
          overlay.setAttribute('aria-hidden', 'false');
          try { replayBtn.focus(); } catch (e) { /* ignore focus errors */ }
        }
      }
    }
  }

    // collisions
    for (let i=enemies.length-1;i>=0;i--) {
      const e = enemies[i];
      for (let j=bullets.length-1;j>=0;j--) {
        const b = bullets[j];
        if (Math.abs(b.x - e.x) < (e.w/2 + b.r) && Math.abs(b.y - e.y) < (e.h/2 + b.r)) {
          bullets.splice(j,1);
          e.hp--;
          if (e.hp <= 0) {
            enemies.splice(i,1);
            score += 10;
            if (score > highScore) { highScore = score; try { localStorage.setItem('selfmade_highscore', highScore); } catch (e) { /* ignore storage errors */ } }
            // spawn simple particles for a little explosion effect
            const pc = 12;
            for (let p=0;p<pc;p++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 1 + Math.random() * 3;
              particles.push({
                x: e.x,
                y: e.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                r: 2 + Math.random() * 3,
                life: 600 + Math.random() * 400,
                born: Date.now()
              });
            }
            screenShake = Math.min(16, screenShake + 8);
            playSound('hit');
          }
          break;
        }
      }
    }

    // update particles
    for (let i=particles.length-1;i>=0;i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      p.life -= dt;
      if (p.life <= 0) particles.splice(i,1);
    }

    screenShake = Math.max(0, screenShake - dt * 0.04);
    if (enemies.length === 0 && Date.now() - lastSpawn > 600) { lastSpawn = Date.now(); spawnWave(); }
  }

  function draw() {
    ctx.clearRect(0,0,cw,ch);
    ctx.save();
    if (screenShake > 0) { const sx = (Math.random()*2-1)*screenShake; const sy = (Math.random()*2-1)*screenShake; ctx.translate(sx, sy); }
    ctx.fillStyle = '#b3e5fc'; ctx.fillRect(0,0,cw,ch);
    const g = ctx.createLinearGradient(0,ch-180,0,ch); g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(1,'rgba(0,0,0,0.06)'); ctx.fillStyle = g; ctx.fillRect(0,ch-180,cw,180);

    // Subtle dashed touch-zone guide lines for touch-capable devices. These lines run up approximately 1/3 of the viewport height
    // and indicate the left/center/right touch regions (left 25% = left, center 50% = fire, right 25% = right).
    if (isTouch && cw > 300) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6,6]);
      const guideHeight = Math.max(60, Math.floor(ch * 0.33));
      const yStart = ch - 10;
      const yEnd = ch - guideHeight;
      const x1 = Math.floor(cw * 0.25);
      const x2 = Math.floor(cw * 0.75);
      ctx.beginPath();
      ctx.moveTo(x1, yStart); ctx.lineTo(x1, yEnd);
      ctx.moveTo(x2, yStart); ctx.lineTo(x2, yEnd);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // If the user has touched the screen at least once, show a subtle horizontal guide near the top third
    if (touchGuideShown && cw > 300) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6,6]);
      const y = Math.floor(ch * 0.33);
      ctx.beginPath();
      ctx.moveTo(0.5, y + 0.5);
      ctx.lineTo(cw + 0.5, y + 0.5);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // small gardening-theme pots along the bottom (visual only)
    const potCount = Math.floor(cw / 100);
    for (let i = 0; i < potCount; i++) {
      const px = 50 + i * 100;
      const py = ch - 60;
      // pot body
      ctx.fillStyle = '#8b5a2b';
      ctx.beginPath();
      ctx.moveTo(px - 18, py);
      ctx.lineTo(px + 18, py);
      ctx.lineTo(px + 14, py + 20);
      ctx.lineTo(px - 14, py + 20);
      ctx.closePath();
      ctx.fill();
      // soil
      ctx.fillStyle = '#4b2e2e';
      ctx.fillRect(px - 12, py - 8, 24, 8);
      // small plant
      ctx.strokeStyle = '#2e8b57';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, py - 8);
      ctx.quadraticCurveTo(px - 6, py - 24, px, py - 34);
      ctx.moveTo(px, py - 8);
      ctx.quadraticCurveTo(px + 6, py - 24, px, py - 34);
      ctx.stroke();
    }

    ctx.save(); ctx.translate(player.x, player.y); ctx.fillStyle = '#2e8b57'; ctx.beginPath(); ctx.ellipse(0,0,player.w,player.h,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#000'; ctx.fillRect(-8,-4,16,8); ctx.restore();

    // draw particles
    for (const p of particles) {
      const alpha = Math.max(0, Math.min(1, p.life / 1000));
      ctx.fillStyle = 'rgba(255,220,100,' + alpha + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.fillStyle = '#fff'; for (const b of bullets) { ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill(); }

    for (const e of enemies) { const sc = 1 + (e.y / ch) * 0.25; ctx.save(); ctx.translate(e.x,e.y); ctx.scale(sc,sc); ctx.fillStyle='#ff6666'; ctx.fillRect(-e.w/2,-e.h/2,e.w,e.h); ctx.fillStyle='#600'; ctx.fillRect(-e.w/4,-e.h/8,e.w/2,e.h/4); ctx.restore(); }

    if (scoreEl) scoreEl.textContent = 'Score: ' + score;
    if (waveEl) {
      waveEl.textContent = 'Wave: ' + waveNumber;
      try {
        if (Date.now() < wavePulseUntil) { waveEl.classList.add('wave-pulse'); } else { waveEl.classList.remove('wave-pulse'); }
      } catch (e) { }
    }
    // Update document title to include current wave for better visibility when tabbed away
    try {
      if (!paused && !gameOver) {
        const waveSuffix = ' (Wave ' + waveNumber + ')';
        if (!document.title.endsWith(waveSuffix)) { document.title = originalTitle + waveSuffix; }
      } else {
        // restore base title when paused or game over
        if (document.title !== originalTitle) document.title = originalTitle;
      }
    } catch (e) { /* ignore title errors */ }
    if (livesEl) {
      // Build accessible HUD: prefix text then colorized heart spans to avoid innerHTML usage
      while (livesEl.firstChild) livesEl.removeChild(livesEl.firstChild);
      livesEl.appendChild(document.createTextNode('Lives: '));
      for (let i = 0; i < lives; i++) {
        const span = document.createElement('span');
        span.textContent = '♥';
        span.style.color = '#e53935';
        span.style.marginRight = '4px';
        span.setAttribute('aria-hidden', 'true');
        livesEl.appendChild(span);
      }
      // Pulse visual feedback when a life was recently lost
      try {
        if (Date.now() < livesPulseUntil) { livesEl.classList.add('lives-pulse'); } else { livesEl.classList.remove('lives-pulse'); }
      } catch (e) { /* ignore DOM errors */ }
      livesEl.setAttribute('aria-label', lives + (lives === 1 ? ' life' : ' lives'));
    }
    // Show the higher of persisted high score and current run score so HUD reflects when the player surpasses the high score live during a run.
    const displayHigh = Math.max(highScore, score);
    if (versionEl) {
      try {
        versionEl.textContent = 'v' + version + ' — High: ' + displayHigh + (autoPauseEnabled ? ' — Auto-pause: On' : ' — Auto-pause: Off');
      } catch (e) { /* ignore DOM errors */ }
    }

    // Draw a small HUD on the canvas so players see Wave and Lives even if the DOM HUD is hidden
    try {
      ctx.save();
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'left';
      const waveText = 'Wave: ' + waveNumber;
      const livesText = 'Lives: ' + lives;
      const pad = 10;
      const lineHeight = 22;
      const waveW = ctx.measureText(waveText).width;
      const livesW = ctx.measureText(livesText).width;
      const boxW = Math.max(waveW, livesW) + pad * 2;
      const boxH = lineHeight * 2 + 8;
      const rx = 8, ry = 6;
      // pulse slightly when wave or lives changed recently
      const now = Date.now();
      const pulse = (now < wavePulseUntil || now < livesPulseUntil) ? 0.18 : 0.06;
      ctx.fillStyle = 'rgba(0,0,0,' + (0.5 + pulse) + ')';
      // rounded rect background
      const r = 6;
      ctx.beginPath();
      ctx.moveTo(rx + r, ry);
      ctx.arcTo(rx + boxW, ry, rx + boxW, ry + boxH, r);
      ctx.arcTo(rx + boxW, ry + boxH, rx, ry + boxH, r);
      ctx.arcTo(rx, ry + boxH, rx, ry, r);
      ctx.arcTo(rx, ry, rx + boxW, ry, r);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fillText(waveText, rx + pad, ry + 16);
      ctx.fillText(livesText, rx + pad, ry + 16 + lineHeight);
      ctx.restore();
    } catch (e) { /* ignore drawing errors */ }

    // draw a temporary wave banner when a new wave starts (fades out)
    if (Date.now() < wavePulseUntil) {
      const remain = wavePulseUntil - Date.now();
      const alpha = Math.max(0, Math.min(1, remain / 800));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fff';
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Wave ' + waveNumber, cw/2, 80);
      ctx.restore();
    }

    // transient on-screen controls hint (shows for tipDuration ms after load)
    if (Date.now() < tipExpires) {
      ctx.save();
      const tipText = 'Tip: Garden shooter — Arrow keys or A/D to move; Space or tap center to fire. Tap left/right edges to move. Dashed guides indicate touch zones.';
      const tipW = Math.min(420, Math.max(160, cw - 24));
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(12,12,tipW,44);
      ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(tipText, 20, 36, Math.max(80, tipW - 24));
      ctx.restore();
    }

    ctx.restore();
    if (paused || gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0,0,cw,ch);
      ctx.fillStyle = '#fff';
      ctx.font = '48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(gameOver ? 'Game Over' : 'Paused', cw/2, ch/2);
      if (!gameOver) {
        ctx.font = '18px sans-serif';
        ctx.fillText('Press P or Esc to resume', cw/2, ch/2 + 48);
      } else {
        ctx.font = '20px sans-serif';
        ctx.fillText('Final Score: ' + score, cw/2, ch/2 + 48);
        // Keyboard hint to restart the game for accessibility/clarity
        ctx.font = '16px sans-serif';
        ctx.fillText('Press R to restart', cw/2, ch/2 + 84);
      }
    }
    if (typeof overlay !== 'undefined' && overlay) {
      setOverlayVisible(paused || gameOver);
      // keep an accessible textual hint in the DOM overlay for screen readers and non-canvas users
      try {
        if (typeof overlayMessage !== 'undefined' && overlayMessage) { updateOverlayMessage(); }
      } catch (e) { /* ignore if overlayMessage not available */ }
    }
  }

  let last = performance.now();
  function loop(t) {
    const rawDt = t - last;
    const dt = Math.max(0, Math.min(50, rawDt));
    last = t;
    if (!paused && !gameOver) update(dt);
    draw();
    // keep loop running; when paused, run at a lower refresh to save CPU but keep overlay responsive
    if (!paused) {
      requestAnimationFrame(loop);
      // Best-effort: focus the canvas shortly after start so keyboard users can play without an extra click
      setTimeout(() => { try { canvas.focus(); } catch (e) {} }, 50);
    } else {
      setTimeout(() => requestAnimationFrame(loop), 200);
    }
  }
  requestAnimationFrame(loop);
  setTimeout(() => { try { canvas.focus(); } catch (e) {} }, 200);

  canvas.addEventListener('mousedown', e => { keys.fire = true; if (soundEnabled) ensureAudio(); }, { passive: true });
  canvas.addEventListener('click', () => { try { canvas.focus(); } catch (e) {} });
  canvas.addEventListener('mouseup', e => keys.fire = false);
  // Also clear firing state on mouseup anywhere to avoid stuck fire if mouse is released outside the canvas
  window.addEventListener('mouseup', () => { keys.fire = false; }, { passive: true });
  // Also clear firing state on pointerup for pointer-based devices (pen, touch) to avoid stuck fire
  window.addEventListener('pointerup', () => { keys.fire = false; keys.left = false; keys.right = false; }, { passive: true });
  // Also clear transient input state on pointercancel globally to avoid stuck controls when cancellations happen outside the canvas
  window.addEventListener('pointercancel', () => { clearInputs(); }, { passive: true });
  // Mouse movement control: move player to the pointer X position (improves mouse playability)
  canvas.addEventListener('pointermove', function(e){
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      player.x = Math.max(20, Math.min(cw - 20, x));
    }
  });
  // Mouse click: pointerdown repositions player for mouse users (click to move) and also starts firing while pressed
  canvas.addEventListener('pointerdown', function(e){
    if (e.pointerType === 'mouse') {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      player.x = Math.max(20, Math.min(cw - 20, x));
      keys.fire = true;
      if (soundEnabled) ensureAudio();
    }
  }, { passive: true });
  // Some platforms may emit pointercancel/touchcancel when input is interrupted (e.g., OS gestures). Clear transient input there to avoid stuck controls.
  canvas.addEventListener('pointercancel', function(e){
    clearInputs();
  }, { passive: true });
  // Touch zones: left 25% = move left, right 25% = move right, center = fire. Uses touchstart/touchend for responsive mobile controls.
  canvas.addEventListener('touchstart', function(e){
    const rect = canvas.getBoundingClientRect();
    for (let i=0;i<e.changedTouches.length;i++) {
      const t = e.changedTouches[i];
      if (t.target === canvas) {
        e.preventDefault();
        if (soundEnabled) ensureAudio();
        const x = t.clientX - rect.left;
        const zone = x / rect.width;
        if (zone < 0.25) keys.left = true;
        else if (zone > 0.75) keys.right = true;
        else keys.fire = true;
      }
    }
  }, {passive:false});
  canvas.addEventListener('touchend', function(e){
    // Clear all transient touch inputs on any touchend to avoid stuck controls on some devices (Android fixes)
    try { e.preventDefault(); } catch (err) { /* ignore if preventDefault not allowed */ }
    clearInputs();
  }, {passive:false});

  // Prevent touchmove scrolling when dragging on the canvas so mobile controls stay responsive
  canvas.addEventListener('touchmove', function(e){
    e.preventDefault();
  }, {passive:false});
  // Mirror touchcancel handling to ensure canceled touches also clear transient state
  canvas.addEventListener('touchcancel', function(e){
    // Ensure canceled touches clear all transient inputs to avoid stuck controls
    try { e.preventDefault(); } catch (err) { /* ignore if preventDefault not allowed */ }
    clearInputs();
  }, {passive:false});
  document.body.addEventListener('touchstart', function(e){ if (e.target === canvas) e.preventDefault(); }, {passive:false});



})();
