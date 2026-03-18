(() => {
  const canvas = document.getElementById('game');
  if (!canvas) { console.warn('Canvas #game not found — aborting game script'); return; }
  const ctx = canvas.getContext('2d');
  // Accessibility: make canvas focusable and provide an aria-label describing controls so
  // keyboard and screen-reader users can discover how to play without editing HTML.
  try {
    canvas.setAttribute('role', 'application');
    canvas.setAttribute('aria-label', 'Garden shooter game canvas — use arrow keys or A/D to move; Space to fire. On touch devices, tap the bottom half to move there and hold to fire. Press I or H for help.');
    canvas.setAttribute('tabindex', '0');
    // Prevent browser touch scrolling/gestures while interacting with the game canvas (improves mobile responsiveness)
    try { canvas.style.touchAction = 'none'; } catch (e) { /* ignore */ }
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
  const enemiesEl = document.getElementById('enemies');
  const waveProgressEl = document.getElementById('wave-progress');

  // Track last shown wave so the HUD can briefly animate when a new wave starts
  let lastWaveShown = null;

  function refreshVersionHUD() {
    try {
      // Update version line (shows version, current or persisted high score, and auto-pause state)
      const displayHigh = Math.max(highScore, score);
      if (versionEl) {
        try { versionEl.textContent = 'v' + version + ' — High: ' + displayHigh + (autoPauseEnabled ? ' — Auto-pause: On' : ' — Auto-pause: Off'); } catch (e) { /* ignore DOM errors */ }
      }
      // Update lives HUD to reflect current lives (keeps existing DOM structure)
      if (livesEl) {
        try {
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
          livesEl.setAttribute('aria-label', lives + (lives === 1 ? ' life' : ' lives'));
          // Add a low-lives visual hint when player has only one life left
          try {
            if (lives <= 1) livesEl.classList.add('low'); else livesEl.classList.remove('low');
          } catch (e) { /* ignore classList errors */ }
        } catch (e) { /* ignore DOM errors */ }
      }
      // Update wave HUD if present and add a brief pulse when the wave changes
      if (waveEl) {
        try {
          const n = (typeof waveNumber !== 'undefined' ? waveNumber : 0);
          try {
            // Build accessible wave HUD: text node for the numeric label and a separate emoji span set aria-hidden
            while (waveEl.firstChild) waveEl.removeChild(waveEl.firstChild);
            waveEl.appendChild(document.createTextNode('Wave: ' + n + ' '));
            const emoji = document.createElement('span');
            emoji.textContent = '🌱';
            try { emoji.setAttribute('aria-hidden','true'); } catch (e) {}
            emoji.style.marginLeft = '6px';
            try { waveEl.appendChild(emoji); } catch(e) { /* ignore */ }
            try { waveEl.setAttribute('aria-label', 'Wave: ' + n); } catch (err) {}
            try {
              if (lastWaveShown !== n) {
                lastWaveShown = n;
                // Respect user preference for reduced motion: skip pulse when prefers-reduced-motion is set
                const prefersReducedMotion = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
                if (!prefersReducedMotion) {
                  // Add pulse class to trigger CSS animation; remove it after animation completes or timeout
                  try { waveEl.classList.add('wave-pulse'); } catch (e) {}
                  const remover = () => { try { waveEl.classList.remove('wave-pulse'); waveEl.removeEventListener('animationend', remover); } catch (e) {} };
                  try { waveEl.addEventListener('animationend', remover); } catch (e) {}
                  // Fallback removal in case animationend doesn't fire
                  setTimeout(remover, 900);
                }
              }
            } catch (e) { /* ignore pulse errors */ }
          } catch (e) { /* ignore DOM errors */ }
        } catch (e) { /* ignore DOM errors */ }
      }
      // Update enemies HUD if present
      if (enemiesEl) {
        try {
          const cnt = (typeof enemies !== 'undefined' ? enemies.length : 0);
          enemiesEl.textContent = cnt + ' ' + (cnt === 1 ? 'Enemy' : 'Enemies');
        } catch (e) { /* ignore DOM errors */ }
      }
      // Update wave progress HUD if present (defeated / total for current wave)
      if (waveProgressEl) {
        try {
          const total = (typeof currentWaveEnemyCount !== 'undefined' ? currentWaveEnemyCount : 0);
          const defeated = Math.max(0, total - (typeof enemies !== 'undefined' ? enemies.length : 0));
          waveProgressEl.textContent = 'Progress: ' + defeated + '/' + total;
        } catch (e) { /* ignore DOM errors */ }
      }
    } catch (e) { /* ignore */ }
  }

  // Accessibility: announce wave changes to assistive tech
  if (waveEl) { try { waveEl.setAttribute('aria-live', 'polite'); waveEl.setAttribute('role', 'status'); } catch (e) {} }
  const version = '3.5.0';
  let score = 0;
  let highScore = (function(){ try { const v = parseInt(localStorage.getItem('selfmade_highscore')||'0', 10); return isNaN(v) ? 0 : Math.max(0, v); } catch (e) { return 0; } })();
  let lives = 3;
  let gameOver = false;
  const keys = {left:false,right:false,fire:false};
  function clearInputs() { keys.left = keys.right = keys.fire = false; }
  // Detect touch-capable devices to show subtle touch-zone guides for discoverability
  const isTouch = (typeof window !== 'undefined') && (('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0));
  // Show a simple horizontal guide briefly after the first touch so mobile users discover control zones
  // touchGuideExpires stores the timestamp (ms) until which the guide should be visible
  let touchGuideExpires = 0;
  const TOUCH_GUIDE_DURATION = 8000;
  if (typeof window !== 'undefined') {
    try {
      const showTouchGuide = (durationMs = TOUCH_GUIDE_DURATION) => {
        try { touchGuideExpires = Date.now() + durationMs; } catch (e) { touchGuideExpires = Date.now() + durationMs; }
        // Persist that the user has seen the touch guides so they are not repeatedly shown across sessions
        try { localStorage.setItem('selfmade_touch_guides_shown', '1'); } catch (e) { /* ignore */ }
        // Add a transient class that CSS uses to draw subtle dashed guides on touch devices
        try { document.body.classList.add('show-touch-guides'); } catch (e) { /* ignore */ }
        // Accessibility: announce that touch controls were revealed so screen readers get immediate feedback
        try {
          let tgAnn = document.getElementById('touch-guides-announcer');
          if (!tgAnn) {
            tgAnn = document.createElement('div');
            tgAnn.id = 'touch-guides-announcer';
            tgAnn.style.position = 'absolute';
            tgAnn.style.left = '-9999px';
            tgAnn.style.width = '1px';
            tgAnn.style.height = '1px';
            tgAnn.setAttribute('aria-live', 'polite');
            tgAnn.setAttribute('aria-atomic', 'true');
            document.body.appendChild(tgAnn);
          }
          try { tgAnn.textContent = 'Touch controls shown: tap the bottom half to move there, and hold there to water plants.'; } catch (e) { /* ignore */ }
          setTimeout(() => { try { tgAnn.textContent = ''; } catch (e) {} }, 2000);
        } catch (e) { /* ignore announcer errors */ }
        // Create a small transient toast to clarify touch zones for first-time touch users
        try {
          let t = document.getElementById('touch-toast');
          if (!t) {
            t = document.createElement('div');
            t.id = 'touch-toast';
            t.textContent = 'Tip: Tap the bottom half to move there. Hold there to water plants. Press P to pause.';
            // Accessibility: make this transient hint discoverable to screen readers
            try { t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); t.setAttribute('aria-atomic', 'true'); } catch (e) { /* ignore attribute errors */ }
            try { t.setAttribute('aria-hidden', 'false'); } catch (e) {}
            t.style.position = 'fixed';
            t.style.left = '50%';
            t.style.top = '12px';
            t.style.transform = 'translateX(-50%)';
            t.style.background = 'rgba(0,0,0,0.72)';
            t.style.color = '#fff';
            t.style.padding = '8px 12px';
            t.style.borderRadius = '8px';
            t.style.zIndex = '10001';
            t.style.fontSize = '14px';
            t.style.pointerEvents = 'none';
            t.style.opacity = '0';
            // Respect user motion preferences: disable transitions if user prefers reduced motion
            const prefersReducedMotion = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
            if (prefersReducedMotion) {
              t.style.transition = 'none';
              t.style.opacity = '1';
            } else {
              t.style.transition = 'opacity 220ms ease, transform 220ms ease';
            }
            document.body.appendChild(t);
            // show and auto-remove after a short delay
            try { if (!prefersReducedMotion) { void t.offsetWidth; t.style.opacity = '1'; } } catch (e) { /* ignore */ }
            const hideDelay = prefersReducedMotion ? 1200 : 3800;
            setTimeout(() => { try { t.style.opacity = '0'; } catch (e) {} }, hideDelay);
            setTimeout(() => { try { try { t.setAttribute('aria-hidden', 'true'); } catch(e){} if (t && t.parentNode) t.parentNode.removeChild(t); } catch (e) {} }, hideDelay + 400);
          } else {
            // Reuse existing touch-toast node when present: make it accessible and temporarily visible
            try {
              t.textContent = 'Tip: Tap the bottom half to move there. Hold there to water plants.';
              try { t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); t.setAttribute('aria-atomic', 'true'); } catch (e) { /* ignore */ }
              try { t.removeAttribute('aria-hidden'); } catch (e) { /* ignore */ }
              const prefersReducedMotion = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
              if (prefersReducedMotion) {
                try { t.style.transition = 'none'; t.style.opacity = '1'; } catch (e) { /* ignore */ }
              } else {
                try { t.style.transition = 'opacity 220ms ease, transform 220ms ease'; t.style.opacity = '1'; } catch (e) { /* ignore */ }
              }
            } catch (e) { /* ignore DOM errors */ }
            // Hide it again after a short delay but do not remove the node if it was part of index.html
            const hideDelay = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 1200 : 3800;
            setTimeout(() => { try { t.style.opacity = '0'; try { t.setAttribute('aria-hidden', 'true'); } catch (e) {} } catch (e) {} }, hideDelay);
          }
        } catch (e) { /* ignore DOM errors */ }

        // Add a transient hint label for first-time touch discoverability.
        try {
          const lbls = document.createElement('div');
          lbls.id = 'touch-zone-labels';
          lbls.setAttribute('aria-hidden', 'true');
          lbls.style.position = 'fixed';
          lbls.style.left = '0';
          lbls.style.top = '32vh';
          lbls.style.width = '100%';
          lbls.style.display = 'flex';
          lbls.style.justifyContent = 'center';
          lbls.style.alignItems = 'center';
          lbls.style.padding = '0 6%';
          lbls.style.pointerEvents = 'none';
          lbls.style.zIndex = '10001';
          lbls.style.fontFamily = 'Segoe UI, Roboto, Arial, sans-serif';

          const makeSpan = (txt) => {
            const s = document.createElement('span');
            s.textContent = txt;
            s.style.background = 'rgba(0,0,0,0.52)';
            s.style.color = '#fff';
            s.style.padding = '6px 10px';
            s.style.borderRadius = '8px';
            s.style.fontSize = '13px';
            s.style.opacity = '0';
            s.style.transition = 'opacity 220ms ease, transform 220ms ease';
            s.style.transform = 'translateY(6px)';
            s.style.pointerEvents = 'none';
            return s;
          };

          const centerLbl = makeSpan('Tap bottom half to move · hold to water');
          lbls.appendChild(centerLbl);
          document.body.appendChild(lbls);

          // Animate in
          requestAnimationFrame(() => {
            try { centerLbl.style.opacity = '1'; centerLbl.style.transform = 'translateY(0)'; } catch (e) {}
          });

          // Fade out and remove after a short time (no longer than the guide display)
          setTimeout(() => { try { centerLbl.style.opacity = '0'; } catch (e) {} }, Math.min(durationMs, 3500));
          setTimeout(() => { try { if (lbls && lbls.parentNode) lbls.parentNode.removeChild(lbls); } catch (e) {} }, Math.min(durationMs, 3800));
        } catch (e) { /* ignore label injection errors */ }

        // Remove the class shortly after the guide expiry so the DOM stays clean
        setTimeout(() => {
          try {
            // ensure assistive tech no longer sees the transient toast when guides hide
            const tnode = document.getElementById('touch-toast');
            try { if (tnode) tnode.setAttribute('aria-hidden', 'true'); } catch (e) {}
            document.body.classList.remove('show-touch-guides');
          } catch (e) { /* ignore */ }
        }, durationMs);
      };
      // Prefer the standard touchstart, but many modern devices fire pointerdown with pointerType 'touch' instead.
      try {
        const _seen = (function(){ try { return !!localStorage.getItem('selfmade_touch_guides_shown'); } catch(e){ return false; } })();
        if (!_seen) {
          window.addEventListener('touchstart', () => showTouchGuide(), { once: true, passive: true });
          window.addEventListener('pointerdown', (ev) => {
            try { if (ev && ev.pointerType === 'touch') showTouchGuide(); } catch (e) { /* ignore */ }
          }, { once: true, passive: true });
        }
      } catch (e) { /* ignore */ }
    } catch (e) { /* ignore */ }
  }

  // Direct touch controls: tap anywhere in the bottom half to move there; hold to auto-fire until release.
  try {
    if (isTouch) {
      const clearTouchInputs = () => { keys.left = keys.right = keys.fire = false; };
      const showTouchPulse = (x, y) => {
        try {
          const el = document.createElement('div');
          el.style.position = 'fixed';
          el.style.left = (x - 24) + 'px';
          el.style.top = (y - 24) + 'px';
          el.style.width = '48px';
          el.style.height = '48px';
          el.style.borderRadius = '50%';
          el.style.background = 'rgba(76,175,80,0.9)';
          el.style.boxShadow = '0 8px 18px rgba(76,175,80,0.18)';
          el.style.pointerEvents = 'none';
          el.style.zIndex = '10002';
          // Respect user's reduced-motion preference: if they prefer reduced motion, show a static indicator without transitions
          const prefersReducedMotionLocal = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
          if (prefersReducedMotionLocal) {
            el.style.opacity = '1';
            el.style.transform = 'scale(1)';
            el.style.transition = 'none';
            document.body.appendChild(el);
            // Remove after a brief static display so the element doesn't linger indefinitely
            setTimeout(() => { try { if (el && el.parentNode) el.parentNode.removeChild(el); } catch (e) {} }, 600);
            return;
          }
          el.style.opacity = '0';
          el.style.transform = 'scale(0.7)';
          el.style.transition = 'opacity 320ms ease, transform 320ms ease';
          document.body.appendChild(el);
          // trigger animation
          requestAnimationFrame(() => {
            try { el.style.opacity = '1'; el.style.transform = 'scale(1.08)'; } catch (e) {}
          });
          setTimeout(() => { try { el.style.opacity = '0'; el.style.transform = 'scale(1.28)'; } catch (e) {} }, 300);
          setTimeout(() => { try { if (el && el.parentNode) el.parentNode.removeChild(el); } catch (e) {} }, 760);
        } catch (e) { /* ignore */ }
      };
      const TOUCH_HOLD_DELAY = 180;
      let activeBottomTouchId = null;
      let touchHoldTimer = null;
      let touchHoldActive = false;
      const movePlayerToClientX = (clientX) => {
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        player.x = Math.max(20, Math.min(cw - 20, x));
        return x;
      };
      const isBottomTouchZone = (clientY) => typeof clientY === 'number' && clientY >= window.innerHeight * 0.5;
      const stopBottomTouchInteraction = (id) => {
        if (id != null && activeBottomTouchId != null && activeBottomTouchId !== id) return false;
        if (touchHoldTimer) clearTimeout(touchHoldTimer);
        touchHoldTimer = null;
        touchHoldActive = false;
        activeBottomTouchId = null;
        clearTouchInputs();
        return true;
      };
      const beginBottomTouchInteraction = (clientX, clientY, id) => {
        if (!isBottomTouchZone(clientY)) return false;
        stopBottomTouchInteraction();
        activeBottomTouchId = id;
        // Determine which horizontal zone the touch is in: left 25%, center 50%, right 25%
        const w = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
        const frac = (typeof clientX === 'number') ? (clientX / w) : 0.5;
        // Left continuous-move zone
        if (frac <= 0.25) {
          keys.left = true; keys.right = false; keys.fire = false;
          try { canvas.focus(); } catch (e) {}
          return true;
        }
        // Right continuous-move zone
        if (frac >= 0.75) {
          keys.right = true; keys.left = false; keys.fire = false;
          try { canvas.focus(); } catch (e) {}
          return true;
        }
        // Center zone: move to location and allow hold-to-fire
        movePlayerToClientX(clientX);
        try { canvas.focus(); } catch (e) {}
        touchHoldTimer = setTimeout(() => {
          if (activeBottomTouchId !== id || paused || gameOver) return;
          touchHoldTimer = null;
          touchHoldActive = true;
          keys.fire = true;
          keys.left = false;
          keys.right = false;
          if (soundEnabled) ensureAudio();
          try { playSound('fire'); } catch (e) {}
          try { if (navigator && typeof navigator.vibrate === 'function') navigator.vibrate(18); } catch (e) {}
          try { showTouchPulse(clientX, clientY); } catch (e) {}
        }, TOUCH_HOLD_DELAY);
        return true;
      };
      const updateBottomTouchInteraction = (clientX, clientY, id) => {
        if (activeBottomTouchId !== id) return false;
        if (!isBottomTouchZone(clientY)) {
          stopBottomTouchInteraction(id);
          return false;
        }
        const w = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
        const frac = (typeof clientX === 'number') ? (clientX / w) : 0.5;
        // If moving into left/right zones, switch to continuous move and cancel any pending hold-to-fire
        if (frac <= 0.25) {
          if (touchHoldTimer) { clearTimeout(touchHoldTimer); touchHoldTimer = null; }
          touchHoldActive = false;
          keys.left = true; keys.right = false; keys.fire = false;
          return true;
        }
        if (frac >= 0.75) {
          if (touchHoldTimer) { clearTimeout(touchHoldTimer); touchHoldTimer = null; }
          touchHoldActive = false;
          keys.right = true; keys.left = false; keys.fire = false;
          return true;
        }
        // Center zone: move player to the touch X; if already holding, keep firing
        movePlayerToClientX(clientX);
        if (touchHoldActive) {
          keys.fire = true; keys.left = false; keys.right = false;
        } else {
          // ensure continuous left/right flags are cleared when in center
          keys.left = false; keys.right = false;
        }
        return true;
      };
      window.addEventListener('pointerup', () => { stopBottomTouchInteraction(); }, { passive: true });
      window.addEventListener('pointercancel', () => { stopBottomTouchInteraction(); }, { passive: true });
      window.addEventListener('touchend', () => { stopBottomTouchInteraction(); }, { passive: true });
      window.addEventListener('touchcancel', () => { stopBottomTouchInteraction(); }, { passive: true });

      canvas._beginBottomTouchInteraction = beginBottomTouchInteraction;
      canvas._updateBottomTouchInteraction = updateBottomTouchInteraction;
      canvas._stopBottomTouchInteraction = stopBottomTouchInteraction;
    }
  } catch (e) { /* ignore touch-zone binding errors */ }

  // Hide on-screen touch control buttons on touch devices so full-screen touch zones are used instead
  const touchControls = document.getElementById('touch-controls');
  if (isTouch && touchControls) {
    try {
      touchControls.style.display = 'none';
      touchControls.setAttribute('aria-hidden', 'true');
    } catch (e) { /* ignore DOM errors */ }
  }
  // Also clear inputs on window blur to avoid stuck movement/fire when the page loses focus
  try { window.addEventListener('blur', clearInputs, { passive: true }); } catch (e) { /* ignore */ }

  // Bind on-screen touch-control buttons so tapping them triggers the same inputs as full-screen zones.
  // This improves discoverability and ensures keyboard activation works for accessibility.
  try {
    const touchLeftBtn = document.getElementById('touch-left');
    const touchFireBtn = document.getElementById('touch-fire');
    const touchRightBtn = document.getElementById('touch-right');
    const bindTouchControl = (btn, downHandler) => {
      if (!btn) return;
      try {
        // pointerdown to handle touch and stylus; preventDefault to avoid accidental focus shift
        btn.addEventListener('pointerdown', (ev) => { try { ev.preventDefault(); downHandler(); } catch (e) {} }, { passive: false });
        // click as a fallback for older browsers
        btn.addEventListener('click', (ev) => { try { ev.preventDefault(); downHandler(); } catch (e) {} }, { passive: false });
        // release clears inputs
        btn.addEventListener('pointerup', () => { try { clearInputs(); } catch (e) {} }, { passive: true });
        btn.addEventListener('pointercancel', () => { try { clearInputs(); } catch (e) {} }, { passive: true });
        // keyboard activation (Enter / Space)
        btn.addEventListener('keydown', (ev) => {
          try {
            if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') { ev.preventDefault(); downHandler(); }
          } catch (e) {}
        });
        // Clear inputs on keyboard keyup to avoid stuck controls when using Enter/Space to activate touch buttons
        btn.addEventListener('keyup', (ev) => {
          try {
            if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') { ev.preventDefault(); clearInputs(); }
          } catch (e) {}
        });
      } catch (e) { /* ignore binding errors */ }
    };
    bindTouchControl(touchLeftBtn, () => { keys.left = true; keys.right = false; keys.fire = false; try { canvas.focus(); } catch(e){} });
    bindTouchControl(touchRightBtn, () => { keys.right = true; keys.left = false; keys.fire = false; try { canvas.focus(); } catch(e){} });
    bindTouchControl(touchFireBtn, () => { keys.fire = true; keys.left = false; keys.right = false; try { playSound('fire'); } catch(e){} try { if (navigator && typeof navigator.vibrate === 'function') navigator.vibrate(20); } catch(e){} try { canvas.focus(); } catch(e){} });
  } catch (e) { /* ignore touch-control wiring errors */ }

  // Transient controls hint: shows briefly on startup (ms)
  // Increased to 9000ms for better discoverability on touch devices and slower starters.
  const tipDuration = 9000;
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
    else if (type === 'wave') { 
      // Distinct two-tone chime for wave starts: triangle wave that glides up slightly
      o.type = 'triangle';
      o.frequency.setValueAtTime(660, now);
      o.frequency.linearRampToValueAtTime(880, now + 0.08);
      g.gain.setValueAtTime(0.035, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      o.start(now);
      o.stop(now + 0.32);
      return;
    }
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
    try { muteBtn.setAttribute('type', 'button'); muteBtn.setAttribute('role', 'button'); muteBtn.setAttribute('tabindex', '0'); } catch (e) {}
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
    // Fullscreen toggle button (enter/exit fullscreen). Keeps UI accessible and announces state via button attributes.
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    function updateFullscreenUI() {
      if (!fullscreenBtn) return;
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      try { fullscreenBtn.setAttribute('aria-pressed', (!!isFs).toString()); } catch (e) {}
      try { fullscreenBtn.setAttribute('aria-label', isFs ? 'Exit fullscreen' : 'Enter fullscreen'); } catch (e) {}
      try { fullscreenBtn.title = isFs ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)'; } catch (e) {}
    }
    if (fullscreenBtn) {
      try {
        fullscreenBtn.setAttribute('type','button'); fullscreenBtn.setAttribute('role','button'); fullscreenBtn.setAttribute('tabindex','0');
        fullscreenBtn.addEventListener('click', () => {
          try {
            if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
            else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(()=>{});
          } catch (e) {}
          setTimeout(updateFullscreenUI, 80);
        });
        document.addEventListener('fullscreenchange', updateFullscreenUI, { passive: true });
        updateFullscreenUI();
      } catch (e) { /* ignore fullscreen init errors */ }
    }
    // Ensure HUD reflects initial values (lives, wave, version) on load
    try { if (typeof refreshVersionHUD === 'function') refreshVersionHUD(); } catch (e) {}

    // HUD toggle button (mirrors 'H' keyboard shortcut) — improves discoverability for non-keyboard users
    const hudBtn = document.getElementById('hudBtn');
    if (hudBtn) {
      try { hudBtn.setAttribute('type','button'); hudBtn.setAttribute('role','button'); hudBtn.setAttribute('tabindex','0'); hudBtn.setAttribute('aria-pressed', (typeof hudVisible !== 'undefined' && hudVisible) ? 'true' : 'false'); } catch (e) {}
      hudBtn.addEventListener('click', () => {
        try {
          const ui = document.getElementById('ui');
          hudVisible = !(typeof hudVisible !== 'undefined' && hudVisible === false);
          try { localStorage.setItem('selfmade_hud_visible', hudVisible ? '1' : '0'); } catch (e) { /* ignore */ }
          if (ui) {
            const hidden = ui.getAttribute('data-hidden') === 'true';
            if (hidden) {
              ui.style.display = '';
              ui.setAttribute('data-hidden','false');
              try { ui.setAttribute('aria-hidden','false'); } catch (err) {}
            } else {
              ui.style.display = 'none';
              ui.setAttribute('data-hidden','true');
              try { ui.setAttribute('aria-hidden','true'); } catch (err) {}
            }
          }
          // Update HUD button accessible state for assistive tech
          try { hudBtn.setAttribute('aria-pressed', (ui && ui.getAttribute('data-hidden') === 'true') ? 'false' : 'true'); } catch (e) {}
          try { if (typeof refreshVersionHUD === 'function') refreshVersionHUD(); } catch (e) {}
          try {
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
            try { announcer.textContent = (ui && ui.getAttribute('data-hidden') === 'true') ? 'HUD hidden' : 'HUD visible'; } catch (e) {}
          } catch (e) {}
        } catch (e) { /* ignore */ }
      });
    }

    // Restore colorblind-friendly palette preference (accessibility)
    let colorblindMode = (function(){ try { const v = localStorage.getItem('selfmade_colorblind'); return v === '1'; } catch (e) { return false; } })();
    try { if (colorblindMode) document.body.classList.add('colorblind-mode'); } catch (e) { /* ignore */ }
    // Restore persisted garden grid preference (visual)
    let gardenGrid = (function(){ try { const v = localStorage.getItem('selfmade_garden_grid'); return v === '1'; } catch (e) { return false; } })();
    try { if (gardenGrid) document.body.classList.add('garden-grid'); } catch (e) { /* ignore */ }
  }
  // Ensure HUD reflects initial values even if mute button is missing (defensive)
  try { if (typeof refreshVersionHUD === 'function') refreshVersionHUD(); } catch (e) {}
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
    '2.178.0 — UI: Add in-game Recent changes entry for this iteration so players can see the update (tiny) — 2026-03-16',
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
    // Avoid intercepting keyboard input when a form control or editable element has focus
    try {
      const ae = document.activeElement;
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return;
    } catch (err) {}

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
        // Clear transient input state when user manually pauses to avoid stuck controls
        if (paused) clearInputs();
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
    // 'F' toggles fullscreen mode for a more immersive experience (shortcut: F)
    if (e.key === 'f' || e.key === 'F') {
      try {
        if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
        else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(()=>{});
      } catch (e) { /* ignore fullscreen errors */ }
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
        announcer.style.width = '1px';
        announcer.style.height = '1px';
        announcer.setAttribute('aria-live', 'assertive');
        announcer.setAttribute('aria-atomic', 'true');
        document.body.appendChild(announcer);
      }
      try { announcer.textContent = autoPauseEnabled ? 'Auto-pause enabled' : 'Auto-pause disabled'; } catch (err) { /* ignore */ }
      try { if (typeof refreshVersionHUD === 'function') refreshVersionHUD(); } catch (e) { /* ignore */ }
      // Ensure the Auto-Pause toggle button updates when the preference is changed via the keyboard shortcut
      try { if (typeof updateAutoPauseUI === 'function') updateAutoPauseUI(); } catch (e) { /* ignore */ }
    }

    // 'N' advances to the next wave (developer/testing)
    if ((e.key === 'n' || e.key === 'N') && !gameOver) {
      try { spawnWave(); } catch (e) { /* ignore */ }
    }
    // 'H' toggles HUD visibility (keyboard shortcut) — mirror HUD button behavior
    if (e.key === 'h' || e.key === 'H') {
      try { const btn = document.getElementById('hudBtn'); if (btn) { btn.click(); } } catch (err) { /* ignore */ }
    }
    // 'C' toggles colorblind-friendly palette (accessibility). Persisted to localStorage and announced to assistive tech.
    if (e.key === 'c' || e.key === 'C') {
      try {
        const enabled = document.body.classList.toggle('colorblind-mode');
        try { localStorage.setItem('selfmade_colorblind', enabled ? '1' : '0'); } catch (err) { /* ignore */ }
        let announcer = document.getElementById('colorblind-announcer');
        if (!announcer) {
          announcer = document.createElement('div');
          announcer.id = 'colorblind-announcer';
          announcer.style.position = 'absolute';
          announcer.style.left = '-9999px';
          announcer.style.width = '1px';
          announcer.style.height = '1px';
          announcer.setAttribute('aria-live','polite');
          announcer.setAttribute('aria-atomic','true');
          document.body.appendChild(announcer);
        }
        try { announcer.textContent = enabled ? 'Colorblind mode enabled' : 'Colorblind mode disabled'; } catch (err) { /* ignore */ }
      } catch (e) { /* ignore */ }
    }
    // 'H' toggles HUD visibility (accessibility / distraction-free). Announces state to assistive tech.
    if (e.key === 'h' || e.key === 'H') {
      try {
        const ui = document.getElementById('ui');
        // Toggle our hudVisible flag (used for both DOM HUD and in-canvas HUD rendering)
        hudVisible = !(typeof hudVisible !== 'undefined' && hudVisible === false);
        if (ui) {
          const hidden = ui.getAttribute('data-hidden') === 'true';
          if (hidden) {
            ui.style.display = '';
            ui.setAttribute('data-hidden','false');
            // Keep ARIA in sync so screen readers know when HUD is hidden
            try { ui.setAttribute('aria-hidden','false'); } catch (err) {}
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
            try { ui.setAttribute('aria-hidden','true'); } catch (err) {}
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
        } else {
          // If no DOM HUD exists, still announce the HUD state change
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
          try { announcer.textContent = hudVisible ? 'HUD visible' : 'HUD hidden'; } catch (e) {}
        }
      } catch (e) { /* ignore */ }
    }

    // 'T' briefly shows touch-zone guides for preview (useful on desktop). Honor reduced-motion preference by keeping this non-animated.
    if (e.key === 't' || e.key === 'T') {
      try {
        // Show the same subtle guides used on touch devices so desktop users can preview touch zones
        showTouchGuide();
        // Also ensure the in-canvas separators and zone overlays are shown when previewing with the T key
        try { showTouchGuidesUntil = Date.now() + TOUCH_GUIDE_DURATION; } catch (e) { /* ignore if variable not available */ }
        // Also briefly reveal on-screen touch buttons for desktop preview so users see the alternative control affordance
        try {
          if (touchControls) {
            touchControls.style.display = 'flex';
            touchControls.setAttribute('aria-hidden', 'false');
            // hide after a short preview interval
            setTimeout(() => { try { touchControls.style.display = 'none'; touchControls.setAttribute('aria-hidden','true'); } catch (e) {} }, 5000);
          }
        } catch (e) { /* ignore UI errors */ }
      } catch (e) { /* ignore */ }
    }

    // 'G' toggles a subtle garden grid overlay for aiming/visual variety. Persisted across sessions.
    if (e.key === 'g' || e.key === 'G') {
      try {
        const enabled = document.body.classList.toggle('garden-grid');
        try { localStorage.setItem('selfmade_garden_grid', enabled ? '1' : '0'); } catch (err) { }
        let announcer = document.getElementById('grid-announcer');
        if (!announcer) {
          announcer = document.createElement('div');
          announcer.id = 'grid-announcer';
          announcer.style.position = 'absolute';
          announcer.style.left = '-9999px';
          announcer.style.width = '1px';
          announcer.style.height = '1px';
          announcer.setAttribute('aria-live','polite');
          document.body.appendChild(announcer);
        }
        try { announcer.textContent = enabled ? 'Grid overlay enabled' : 'Grid overlay disabled'; } catch (err) { }
      } catch (e) { /* ignore */ }
    }

    // 'N' advances to the next wave for quick testing and visible progression (developer/testing)
    if (e.key === 'n' || e.key === 'N') {
      try {
        if (!gameOver) {
          // Spawn a new wave immediately and refresh HUD so players see progression
          try { spawnWave(); } catch (err) { /* ignore spawn errors */ }
          try { if (typeof refreshVersionHUD === 'function') refreshVersionHUD(); } catch (e) {}
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

  // On-screen touch buttons have been removed in favor of full-screen touch zones for better mobile responsiveness.
  // Keep references as null so older code paths that touch these variables remain safe.
  const leftBtn = null;
  const rightBtn = null;
  const fireBtn = null;
  // Previously there was a setTouch helper to wire touch/mouse events to those buttons; handlers removed intentionally.
// Full-screen touch zones: left 25% = left, center 50% = fire, right 25% = right.
// Use Pointer Events for broad device support; update on pointerdown/move and clear on up/cancel.
(function setupFullScreenTouchZones(){
  try {
    if (!canvas) return;
    const activeTouches = new Map();
    // Brief visual feedback for touch interactions (small ephemeral circle near touch point)
    let lastTouchX = 0, lastTouchY = 0, touchFeedbackUntil = 0;
    function updateKeysFromXY(clientX, clientY){
      const rect = canvas.getBoundingClientRect();
      const pct = rect.width ? (clientX - rect.left) / rect.width : 0.5;
      // Reset inputs then set the appropriate control for the primary touch
      keys.left = keys.right = keys.fire = false;
      if (pct < 0.25) keys.left = true;
      else if (pct > 0.75) keys.right = true;
      else keys.fire = true;
      // Record touch location in CSS pixels for a short visual feedback pulse
      try {
        lastTouchX = Math.max(0, Math.min(rect.width, clientX - rect.left));
        lastTouchY = Math.max(0, Math.min(rect.height, clientY - rect.top));
        touchFeedbackUntil = Date.now() + 480; // show for ~480ms (slightly longer, improves discoverability)
      } catch (e) { /* ignore coord errors */ }
    }
    canvas.addEventListener('pointerdown', ev => {
      try {
        if (ev.pointerType !== 'touch') return;
        ev.preventDefault();
        activeTouches.set(ev.pointerId, ev);
        updateKeysFromXY(ev.clientX, ev.clientY);
        // Provide immediate audio and visual feedback for center-fire when using pointer events (touch/pen). Keeps parity with touchstart behavior.
        if (keys.fire) {
          try { playSound('fire'); } catch (e) { /* ignore sound errors */ }
          try { showTouchPulse(ev.clientX, ev.clientY); } catch (e) { /* ignore pulse errors */ }
        }
      } catch (e) { /* ignore */ }
    }, { passive: false });
    canvas.addEventListener('pointermove', ev => {
      try {
        if (ev.pointerType !== 'touch') return;
        if (!activeTouches.has(ev.pointerId)) return;
        ev.preventDefault();
        updateKeysFromXY(ev.clientX, ev.clientY);
      } catch (e) { /* ignore */ }
    }, { passive: false });
    function clearPointer(ev){
      try {
        if (ev.pointerType !== 'touch') return;
        activeTouches.delete(ev.pointerId);
        if (activeTouches.size === 0) { keys.left = keys.right = keys.fire = false; }
        else {
          const last = Array.from(activeTouches.values()).pop();
          if (last) updateKeysFromXY(last.clientX, last.clientY);
        }
      } catch (e) { /* ignore */ }
    }
    canvas.addEventListener('pointerup', clearPointer, { passive: true });
    canvas.addEventListener('pointercancel', clearPointer, { passive: true });
  } catch (e) { /* ignore setup errors */ }
})();
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
      // Accessibility: when showing overlay due to pause, focus the Resume button so keyboard and touch users can quickly resume
      try { if (show && !gameOver && typeof resumeBtn !== 'undefined' && resumeBtn) { resumeBtn.focus(); } } catch (e) { /* ignore focus errors */ }
      // Small accessibility/UX hook: add a class to the document body when the overlay is visible
      // so CSS can style the paused state (e.g., dimming, cursor changes). Keep this defensive.
      try { document.body.classList.add('paused'); } catch (e) { /* ignore */ }
    } else {
      overlay.setAttribute('role', 'status');
      overlay.removeAttribute('aria-modal');
      overlay.style.pointerEvents = 'none';
      overlay.removeAttribute('tabindex');
      try { document.body.classList.remove('paused'); } catch (e) { /* ignore */ }
    }
  }
  // Small UX/accessibility helper: show different overlay messages when pause was triggered by focus loss vs user toggle.
  function updateOverlayMessage() {
    if (!overlayMessage) return;
    try {
      const resumeBtn = document.getElementById('resumeBtn');
      if (typeof changesOpen !== 'undefined' && changesOpen) {
        overlayMessage.textContent = 'Recent changes — click or press Esc to close';
      } else if (typeof helpOpen !== 'undefined' && helpOpen) {
        overlayMessage.textContent = 'Help: ←/A and →/D to move; Space to fire; On touch, tap left/right edges to move and tap center to fire; P to pause; I or H to toggle this help. Also: O toggles auto-pause, M toggles sound, C toggles colorblind mode, G toggles garden grid, N advances to the next wave (developer/testing).';
      } else if (gameOver) {
        overlayMessage.textContent = 'Game Over — Final Score: ' + score + ' — Waves: ' + (typeof waveNumber !== 'undefined' ? waveNumber : 0) + ' — Press R or click to play again';
      } else if (pausedByFocus) {
        overlayMessage.textContent = 'Paused (lost focus) — Wave: ' + (typeof waveNumber !== 'undefined' ? waveNumber : 0) + ' — press Space, click or tap, or return to this tab to resume. Auto-pause is enabled; press O to toggle.';
      } else if (paused) {
        overlayMessage.textContent = 'Paused — Wave: ' + (typeof waveNumber !== 'undefined' ? waveNumber : 0) + ' — press P, Esc, or Space to resume';
      } else {
        overlayMessage.textContent = '';
      }
      // Show resume button when paused (but not when game over); hide otherwise
      if (resumeBtn) {
        try {
          if (paused && !gameOver && !helpOpen && !changesOpen) {
            resumeBtn.style.display = '';
            resumeBtn.setAttribute('aria-hidden','false');
          } else {
            resumeBtn.style.display = 'none';
            resumeBtn.setAttribute('aria-hidden','true');
          }
        } catch (e) { /* ignore */ }
      }

      // Announce auto-pause to assistive tech when overlay shows a paused message
      try {
        let ap = document.getElementById('autopause-announcer');
        if (!ap) {
          ap = document.createElement('div');
          ap.id = 'autopause-announcer';
          ap.style.position = 'absolute';
          ap.style.left = '-9999px';
          ap.style.width = '1px';
          ap.style.height = '1px';
          ap.setAttribute('aria-live', 'assertive');
          ap.setAttribute('aria-atomic', 'true');
          document.body.appendChild(ap);
        }
        if (pausedByFocus) ap.textContent = 'Game paused — lost focus';
        else if (paused) ap.textContent = 'Game paused';
        else ap.textContent = '';
      } catch (e) { /* ignore announcer errors */ }

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
  // Start the first wave immediately after restart so players don't wait for the automatic spawn
  try { spawnWave(); } catch (e) { /* ignore spawn errors */ }
  // If sound is enabled, ensure the AudioContext is available/resumed after a restart so sounds play reliably.
  try { if (soundEnabled) { ensureAudio(); } } catch (e) { /* ignore audio errors on some platforms */ }
  if (overlay) setOverlayVisible(false);
  // After restarting, restore keyboard focus to the canvas so users can continue with keys.
  try { if (canvas && typeof canvas.focus === 'function') { canvas.focus(); } } catch (err) { /* ignore focus errors */ }
});
// Small UX: provide a visible Resume button inside the overlay for touch users and accessibility
const resumeBtn = document.getElementById('resumeBtn');
if (resumeBtn) {
  try { resumeBtn.setAttribute('role', 'button'); resumeBtn.setAttribute('tabindex', '0'); resumeBtn.setAttribute('aria-label', 'Resume game — press Space or P to resume'); resumeBtn.title = 'Resume game (Space or P)'; resumeBtn.textContent = 'Resume (Space/P)'; } catch (e) {}
  resumeBtn.addEventListener('click', () => {
    if (!gameOver && paused) {
      paused = false;
      pausedByFocus = false;
      // If audio was suspended by our auto-pause, resume it now when the user explicitly unpauses.
      if (suspendedAudioByFocus && audioCtx && audioCtx.state === 'suspended') {
        if (soundEnabled) { try { audioCtx.resume(); } catch (e) { /* ignore resume errors */ } }
        suspendedAudioByFocus = false;
      }
      if (overlay) setOverlayVisible(false);
      try { updateOverlayMessage(); } catch (e) {}
      try { if (canvas && typeof canvas.focus === 'function') { canvas.focus(); } } catch (e) { /* ignore focus errors */ }
    }
  });
  // Allow keyboard activation (Enter / Space) when the resume button is focused
  resumeBtn.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter' || evt.key === ' ' || evt.key === 'Spacebar') {
      evt.preventDefault();
      try { resumeBtn.click(); } catch (e) { /* ignore */ }
    }
  });
}
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
  const AUTO_PAUSE_DEBOUNCE = 500; // ms used for blur/visibility auto-pause debounce (slightly increased to reduce accidental pauses)
  let paused = false;
  let pausedByFocus = false;
  let helpOpen = false;
  // whether we suspended the AudioContext in response to an auto-pause so we can resume on focus/visibility restore
  let suspendedAudioByFocus = false;
  let blurTimeout = null;
  // Track whether a pointer/touch is currently active (prevents auto-pausing while user is holding touch or pointer)
  let pointerActive = false;
  // When a touch is first detected, show low-contrast dashed guides for a short time so touch zones are discoverable.
  let showTouchGuidesUntil = 0;
  // Respect user's reduced-motion preference by disabling screen shake when requested.
  const prefersReducedMotion = (typeof window !== 'undefined') && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Preference: allow the user to disable auto-pause on blur/visibility (toggled with O). Defaults to enabled for safety.
  // Persist preference in localStorage ('1' = enabled, '0' = disabled)
  let autoPauseEnabled = (function(){ try { const v = localStorage.getItem('selfmade_autopause'); if (v === null) return true; return v === '1'; } catch (e) { return true; } })();
  // HUD visibility flag (toggle with H). When false both DOM HUD and in-canvas HUD are hidden for a distraction-free mode.
  let hudVisible = (function(){ try { const v = localStorage.getItem('selfmade_hud_visible'); if (v === null) return true; return v === '1'; } catch (e) { return true; } })();
  // Apply persisted HUD preference to DOM HUD immediately so initial UI matches user preference
  try {
    const ui = document.getElementById('ui');
    if (ui) {
      if (!hudVisible) {
        ui.style.display = 'none';
        ui.setAttribute('data-hidden','true');
        try { ui.setAttribute('aria-hidden','true'); } catch(e) {}
      } else {
        ui.style.display = '';
        ui.setAttribute('data-hidden','false');
        try { ui.setAttribute('aria-hidden','false'); } catch(e) {}
      }
    }
  } catch (e) { /* ignore */ }
  // Create an Auto-pause toggle button in the UI for discoverability and accessibility.
  // This small UI control mirrors the O key and persists the preference to localStorage.
  try {
    function updateAutoPauseUI() {
      try {
        let btn = document.getElementById('autopauseBtn');
        if (!btn) {
          btn = document.createElement('button');
          btn.id = 'autopauseBtn';
          // Ensure this is a non-submit button to avoid accidental form submissions when embedded in forms
          try { btn.type = 'button'; } catch (e) { /* ignore */ }
          btn.style.marginLeft = '6px';
          // Insert after the mute button if present for consistent placement
          const ref = document.getElementById('muteBtn');
          if (ref && ref.parentNode) ref.parentNode.insertBefore(btn, ref.nextSibling);
          else if (document.getElementById('ui')) document.getElementById('ui').appendChild(btn);
          else document.body.appendChild(btn);
        }
        btn.textContent = autoPauseEnabled ? 'Auto-Pause: On' : 'Auto-Pause: Off';
        // Always update the title to reflect current state for clarity
        btn.title = autoPauseEnabled ? 'Auto-pause enabled (shortcut: O) — click to disable' : 'Auto-pause disabled (shortcut: O) — click to enable';
        btn.setAttribute('aria-pressed', autoPauseEnabled.toString());
        btn.setAttribute('aria-label', autoPauseEnabled ? 'Auto-pause enabled. Click to disable.' : 'Auto-pause disabled. Click to enable.');
        btn.setAttribute('role', 'button');
        btn.setAttribute('tabindex', '0');
        btn.onclick = () => {
          autoPauseEnabled = !autoPauseEnabled;
          try { localStorage.setItem('selfmade_autopause', autoPauseEnabled ? '1' : '0'); } catch (e) { /* ignore */ }
          // Announce the change to assistive tech
          let announcer = document.getElementById('autopause-announcer');
          if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'autopause-announcer';
            announcer.style.position = 'absolute';
            announcer.style.left = '-9999px';
            announcer.style.width = '1px';
            announcer.style.height = '1px';
            announcer.setAttribute('aria-live', 'assertive');
            announcer.setAttribute('aria-atomic', 'true');
            document.body.appendChild(announcer);
          }
          try { announcer.textContent = autoPauseEnabled ? 'Auto-pause enabled' : 'Auto-pause disabled'; } catch (e) { /* ignore */ }
          try { if (typeof refreshVersionHUD === 'function') refreshVersionHUD(); } catch (e) { /* ignore */ }
          // Refresh the button text/attributes
          try { updateAutoPauseUI(); } catch (e) { /* ignore */ }
        };
        // Accessibility: allow keyboard activation (Enter / Space) for the Auto-Pause toggle so keyboard users can operate it like other buttons.
        try {
          const apBtn = document.getElementById('autopauseBtn');
          if (apBtn && !apBtn.dataset.keyboardInit) {
            apBtn.addEventListener('keydown', (evt) => {
              if (evt.key === 'Enter' || evt.key === ' ' || evt.key === 'Spacebar') {
                evt.preventDefault();
                try { apBtn.click(); } catch (e) { /* ignore */ }
              }
            });
            apBtn.dataset.keyboardInit = '1';
          }
        } catch (e) { /* ignore keyboard hookup errors */ }
      } catch (e) { /* ignore UI creation errors */ }
    }
    // Initialize the button UI
    try { updateAutoPauseUI(); } catch (e) { /* ignore */ }
  } catch (e) { /* ignore */ }
  // Keep pointer state updated across pointer/touch events so we can avoid accidental auto-pauses while interacting
  try {
    window.addEventListener('pointerdown', () => { pointerActive = true; }, { passive: true });
    window.addEventListener('pointerup', () => { pointerActive = false; }, { passive: true });
    window.addEventListener('pointercancel', () => { pointerActive = false; }, { passive: true });
    document.addEventListener('touchstart', () => {
      pointerActive = true;
      showTouchGuidesUntil = Date.now() + 10000;
      // Also set the legacy touchGuideExpires and add a transient body class so CSS-based guides stay consistent
      try { touchGuideExpires = Date.now() + TOUCH_GUIDE_DURATION; } catch (e) { /* ignore */ }
      try { document.body.classList.add('show-touch-guides'); } catch (e) { /* ignore */ }
      // Also briefly reveal on-screen touch buttons for discoverability (then hide again)
      try {
        if (touchControls) {
          try { touchControls.style.display = 'flex'; } catch (e) { /* ignore style errors */ }
          try { touchControls.setAttribute('aria-hidden', 'false'); } catch (e) { /* ignore */ }
          setTimeout(() => { try { touchControls.style.display = 'none'; touchControls.setAttribute('aria-hidden','true'); } catch(e) { /* ignore */ } }, 5000);
        }
      } catch (e) { /* ignore */ }
      // Remove the class shortly after the guide expiry so the DOM stays clean
      try {
        const removeDelay = Math.max(0, (touchGuideExpires || Date.now()) - Date.now());
        setTimeout(() => { try { document.body.classList.remove('show-touch-guides'); } catch (e) {} }, removeDelay);
      } catch (e) { /* ignore */ }

    }, { passive: true });
    document.addEventListener('touchend', () => { pointerActive = false; }, { passive: true });
    document.addEventListener('touchcancel', () => { pointerActive = false; }, { passive: true });
  } catch (e) { /* ignore if environment doesn't support these events */ }

  // Accessibility polish: update document.title when the overlay shows an auto-pause so users
  // switching tabs or on mobile are more likely to notice the paused state. Use a MutationObserver
  // on the overlay (which is toggled when pausing) so this is small and non-invasive.
  const originalTitle = (typeof document !== 'undefined' && document.title) ? document.title : 'Selfmade';
  function setTitlePaused() { try { document.title = (typeof pausedByFocus !== 'undefined' && pausedByFocus) ? 'Paused (lost focus) — ' + originalTitle : 'Paused — ' + originalTitle; } catch (e) { /* ignore title errors */ } }
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
      // Only auto-pause if the game is not already paused so user's manual pause isn't overridden
      if (!paused) {
        paused = true;
        pausedByFocus = true;
        try { document.body.classList.add('auto-paused'); } catch (e) { /* ignore */ }
        // Clear transient input state when auto-paused to avoid stuck controls (keyboard, mouse, or touch)
        clearInputs();
        // If audio is playing, suspend it when auto-pausing so sounds don't continue in background
        if (audioCtx && audioCtx.state === 'running') {
          try { audioCtx.suspend(); } catch (e) { /* ignore suspend errors */ }
          suspendedAudioByFocus = true;
        }
        // Announce auto-pause to assistive tech so screen-reader users receive immediate feedback
        try {
          let announcer = document.getElementById('autopause-announcer');
          if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'autopause-announcer';
            announcer.style.position = 'absolute';
            announcer.style.left = '-9999px';
            announcer.style.width = '1px';
            announcer.style.height = '1px';
            announcer.setAttribute('aria-live', 'assertive');
            announcer.setAttribute('aria-atomic', 'true');
            document.body.appendChild(announcer);
          }
          try { announcer.textContent = 'Auto-paused due to focus loss'; } catch (e) { /* ignore */ }
        } catch (e) { /* ignore announcer errors */ }
        // Also show a transient visible toast for mobile/visual users so auto-pause is apparent without needing to switch tabs
        try {
          let t = document.getElementById('autopause-toast');
          if (!t) {
            t = document.createElement('div');
            t.id = 'autopause-toast';
            t.textContent = 'Paused (lost focus)';
            t.style.position = 'fixed';
            t.style.left = '50%';
            t.style.top = '8vh';
            t.style.transform = 'translateX(-50%)';
            t.style.background = 'rgba(0,0,0,0.8)';
            t.style.color = '#fff';
            t.style.padding = '8px 12px';
            t.style.borderRadius = '8px';
            t.style.zIndex = '10003';
            t.style.pointerEvents = 'none';
            t.style.opacity = '0';
            // Respect reduced-motion preference
            const prefersReducedMotion = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
            if (prefersReducedMotion) t.style.transition = 'none'; else t.style.transition = 'opacity 240ms ease, transform 240ms ease';
            document.body.appendChild(t);
          }
          try { t.style.opacity = '1'; } catch (e) { /* ignore */ }
          setTimeout(() => { try { t.style.opacity = '0'; } catch (e) {} }, 2600);
          setTimeout(() => { try { if (t && t.parentNode) t.parentNode.removeChild(t); } catch (e) {} }, 3000);
        } catch (e) { /* ignore toast errors */ }
        if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); }
      }
      blurTimeout = null;
    }, AUTO_PAUSE_DEBOUNCE);
  });
  window.addEventListener('focus', () => {
    if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; }
    // only unpause if the pause was caused by focus loss, the game isn't over, and auto-pause is still enabled
    if (pausedByFocus && !gameOver && autoPauseEnabled) {
      paused = false;
    }
    pausedByFocus = false;
    try { document.body.classList.remove('auto-paused'); } catch (e) { /* ignore */ }
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
      try { if (typeof refreshVersionHUD === 'function') refreshVersionHUD(); } catch (e) {}
      // Clear any stale overlay message after auto-resume to avoid lingering ARIA announcements
      if (!paused && !gameOver && typeof overlayMessage !== 'undefined' && overlayMessage) { try { overlayMessage.textContent = ''; } catch (e) {} }
    }
  });
  // Allow pointer/click to resume when auto-paused due to focus loss (helpful for touch users)
  try {
    window.addEventListener('pointerdown', () => {
      if (paused && pausedByFocus && !gameOver && autoPauseEnabled) {
        paused = false;
        pausedByFocus = false;
        try { document.body.classList.remove('auto-paused'); } catch (e) { /* ignore */ }
        // Resume audio if we suspended it due to auto-pause
        if (suspendedAudioByFocus && audioCtx && audioCtx.state === 'suspended') {
          if (soundEnabled) { try { audioCtx.resume(); } catch (e) {} }
          suspendedAudioByFocus = false;
        }
        // Restore canvas focus for keyboard users
        try { if (canvas && typeof canvas.focus === 'function') { canvas.focus(); } } catch (e) {}
        if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); }
      }
    }, { passive: true });
  } catch (e) { /* ignore */ }

  // also handle visibility change (tabs/mobile): pause when document becomes hidden, and resume only if pausedByFocus
  // Vendor-prefixed fallback for older WebKit browsers: mirror the visibilitychange event so our handler runs on legacy platforms.
  try { document.addEventListener('webkitvisibilitychange', () => { try { document.dispatchEvent(new Event('visibilitychange')); } catch (e) { /* ignore */ } }, { passive: true }); } catch (e) { /* ignore */ }
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
          try { document.body.classList.add('auto-paused'); } catch (e) { /* ignore */ }
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
    try { document.body.classList.add('auto-paused'); } catch (e) { /* ignore */ }
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
  let lastFireFlashUntil = 0;
  const bullets = []; const enemies = []; const particles = []; const scorePopups = []; let screenShake = 0;
  let lastSpawn = 0; let waveNumber = 0; let currentWaveEnemyCount = 0;

  // Kick off the first wave immediately so HUD shows an active wave on load
  let wavePulseUntil = 0;
  let livesPulseUntil = 0;
  let livesFlashUntil = 0;

  spawnWave();
  // Focus the canvas on initial load so keyboard users can play without extra click
  try { if (canvas && typeof canvas.focus === 'function') { canvas.focus(); } } catch (e) { /* ignore focus errors */ }

  function spawnWave() {
    waveNumber++;
    // briefly show a wave banner so players notice wave transitions
    wavePulseUntil = Date.now() + 800;
  // small, optional screen shake to emphasize wave start (skip for reduced-motion users)
  try {
    if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('wave-shake');
      setTimeout(function(){ try { document.body.classList.remove('wave-shake'); } catch(e){} }, 340);
    }
  } catch (e) { /* ignore DOM errors */ }

    // Play a short chime to audibly signal the new wave (WebAudio oscillator only)
    try { playSound('wave'); } catch(e) { /* ignore audio errors */ }
    // Accessibility: announce new wave to assistive tech via an aria-live region
    try {
      let waveAnn = document.getElementById('wave-announcer');
      if (!waveAnn) {
        waveAnn = document.createElement('div');
        waveAnn.id = 'wave-announcer';
        waveAnn.style.position = 'absolute';
        waveAnn.style.left = '-9999px';
        waveAnn.style.width = '1px';
        waveAnn.style.height = '1px';
        waveAnn.setAttribute('aria-live', 'polite');
        waveAnn.setAttribute('aria-atomic', 'true');
        document.body.appendChild(waveAnn);
      }
      try { waveAnn.textContent = 'Wave ' + waveNumber + ' starting.'; } catch (e) { }
    } catch (e) { /* ignore announcer creation errors */ }
    const count = 3 + Math.min(8, Math.floor(waveNumber * 0.6));
    for (let i=0;i<count;i++) {
      const ex = 40 + Math.random() * (cw-80);
      const ey = -20 - Math.random()*200;
      const speed = Math.min(4, 0.6 + Math.random()*1.2 + waveNumber*0.05);
      // Small chance to spawn a zigging "hopper" enemy that oscillates horizontally for visual and gameplay variety
      const isZig = Math.random() < Math.min(0.25, 0.04 + waveNumber*0.02);
      if (isZig) {
        enemies.push({x:ex,y:ey,w:34,h:30,vy:speed*0.9, hp:1 + Math.floor(waveNumber/3), type:'zig', t: Math.random()*1000});
      } else {
        enemies.push({x:ex,y:ey,w:30,h:28,vy:speed, hp:1 + Math.floor(waveNumber/4)});
      }
    }
    try { currentWaveEnemyCount = count; } catch (e) { currentWaveEnemyCount = count; }
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
    // Also show a small DOM toast for better discoverability on small or busy screens
    try {
      let wt = document.getElementById('wave-toast');
      if (!wt) {
        wt = document.createElement('div');
        wt.id = 'wave-toast';
        wt.setAttribute('role','status');
        wt.setAttribute('aria-live','polite');
        wt.style.position = 'fixed';
        wt.style.left = '50%';
        wt.style.top = '6%';
        wt.style.transform = 'translateX(-50%)';
        wt.style.background = 'rgba(255,255,255,0.94)';
        wt.style.color = '#063f0d';
        wt.style.padding = '8px 14px';
        wt.style.borderRadius = '8px';
        wt.style.boxShadow = '0 6px 18px rgba(0,0,0,0.14)';
        wt.style.fontWeight = '800';
        wt.style.zIndex = '10003';
        wt.style.pointerEvents = 'none';
        wt.style.opacity = '0';
        wt.style.transition = 'opacity 220ms ease, transform 220ms ease';
        document.body.appendChild(wt);
      }
      wt.textContent = 'Wave ' + waveNumber + ' starting';
      // show briefly then hide
      try { wt.style.opacity = '1'; wt.style.transform = 'translateX(-50%) translateY(0)'; } catch(e){}
      setTimeout(() => { try { wt.style.opacity = '0'; wt.style.transform = 'translateX(-50%) translateY(-8px)'; } catch(e){} }, 900);
      setTimeout(() => { try { if (wt && wt.parentNode) wt.parentNode.removeChild(wt); } catch(e){} }, 1400);
    } catch (e) { /* ignore toast errors */ }
  }

  function update(dt) {
    if (keys.left) player.x -= player.speed;
    if (keys.right) player.x += player.speed;
    player.x = Math.max(20, Math.min(cw-20, player.x));

    player.cooldown = Math.max(0, player.cooldown - dt);
    // Performance: cap particle count to avoid runaway particle growth during long runs
    try { if (particles && particles.length > 300) particles.splice(0, particles.length - 300); } catch (e) { }
    if (keys.fire && player.cooldown <= 0) {
      bullets.push({x:player.x, y:player.y-28, vy:-9, r:6});
      player.cooldown = 180; // ms
      lastFireFlashUntil = Date.now() + 120; // brief muzzle flash for firing feedback
      // Small garden-themed leaf particles on fire for visual feedback (tiny, low-cost)
      try {
        for (let lp = 0; lp < 2; lp++) {
          particles.push({
            x: player.x + (Math.random() - 0.5) * 12,
            y: player.y - 28,
            vx: (Math.random() - 0.5) * 1.2,
            vy: -1 - Math.random() * 0.6,
            r: 2 + Math.random() * 2,
            life: 240 + Math.random() * 160,
            born: Date.now(),
            color: '#8BC34A',
            leaf: true,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.12
          });
        }
      } catch (e) { /* ignore particle errors */ }
      playSound('fire');
    }

    for (let i=bullets.length-1;i>=0;i--) { bullets[i].y += bullets[i].vy; if (bullets[i].y < -10) bullets.splice(i,1); }
    for (let i=enemies.length-1;i>=0;i--) {
      const e = enemies[i];
      e.t = (e.t || 0) + dt;
      // Zigging enemies gently oscillate horizontally as they descend for a livelier garden feel
      if (e.type === 'zig') {
        e.x += Math.sin(e.t * 0.012) * (1.6 + Math.min(0.8, waveNumber*0.02));
      }
      e.y += e.vy;
      if (e.y > ch + 50) {
      enemies.splice(i,1);
      lives--;
      livesPulseUntil = Date.now() + 700;
      livesFlashUntil = Date.now() + 180;
      lives = Math.max(0, lives);
      // Trigger a short HUD pulse to draw attention to the lost life (CSS handles animation)
      try {
        if (livesEl) {
          try { livesEl.classList.add('lives-pulse'); } catch(e) {}
          setTimeout(() => { try { livesEl.classList.remove('lives-pulse'); } catch(e) {} }, 700);
        }
      } catch (e) { /* ignore HUD update errors */ }
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
          // Brief hit flash to improve visual feedback when an enemy is struck
          try { e.hitFlashUntil = Date.now() + 140; } catch (err) { /* ignore */ }
          if (e.hp <= 0) {
            enemies.splice(i,1);
            score += 10;
            // spawn a small floating score popup at the enemy position (visual polish)
            try { scorePopups.push({ x: e.x, y: e.y, text: '+10', vy: -0.05, life: 800, totalLife: 800, color: '#ffff88' }); } catch (ex) { /* ignore */ }
            // If the player surpasses the previous high score during the run, update and show a small badge
            try {
              const prevHigh = highScore;
              if (score > prevHigh) {
                highScore = score;
                try { localStorage.setItem('selfmade_highscore', highScore); } catch (e) { /* ignore storage errors */ }
                // create or update a transient high-score badge to celebrate the achievement
                let badge = document.getElementById('highscore-badge');
                if (!badge) {
                  badge = document.createElement('div');
                  badge.id = 'highscore-badge';
                  badge.setAttribute('aria-live', 'polite');
                  badge.setAttribute('role', 'status');
                  badge.style.pointerEvents = 'none';
                  badge.style.position = 'fixed';
                  badge.style.right = '12px';
                  badge.style.top = '48px';
                  badge.style.zIndex = '10000';
                  document.body.appendChild(badge);
                }
                try { badge.textContent = 'New high score: ' + highScore + '!'; } catch (e) {}
                // restart CSS animation
                try { badge.classList.remove('show'); void badge.offsetWidth; badge.classList.add('show'); } catch (e) {}
                setTimeout(() => { try { badge.classList.remove('show'); } catch (e) {} }, 1800);
                try { playSound('blip'); } catch (e) {}
                // spawn a few green 'leaf' particles to celebrate the garden-themed high score
                try {
                  for (let lp = 0; lp < 8; lp++) {
                    const angle = -Math.PI/2 + (Math.random() - 0.5) * 1.3;
                    const speed = 1 + Math.random() * 2.2;
                    particles.push({
                      x: e.x,
                      y: e.y,
                      vx: Math.cos(angle) * speed,
                      vy: Math.sin(angle) * speed,
                      r: 2 + Math.random() * 3,
                      life: 700 + Math.random() * 400,
                      born: Date.now(),
                      color: '#66bb6a'
                    });
                  }
                } catch (e) {}
              }
            } catch (e) { /* ignore highscore UI errors */ }
            // spawn simple particles for a little explosion effect (garden-themed: mix leaf and debris)
            const pc = 12;
            for (let p=0;p<pc;p++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 1 + Math.random() * 3;
              const isLeaf = (p % 3 === 0);
              particles.push({
                x: e.x,
                y: e.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                r: 2 + Math.random() * 3,
                life: 600 + Math.random() * 400,
                born: Date.now(),
                color: isLeaf ? '#8BC34A' : '#ffd46a',
                leaf: isLeaf
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
    // Cap particle count to avoid performance issues on low-end devices (tiny)
    if (particles.length > 120) particles.splice(0, particles.length - 120);
    for (let i=particles.length-1;i>=0;i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      if (p.leaf) {
        p.angle = (p.angle || 0) + (p.spin || 0);
      }
      p.life -= dt;
      if (p.life <= 0) particles.splice(i,1);
    }

    // update score popups (floating +points)
    for (let i=scorePopups.length-1;i>=0;i--) {
      const sp = scorePopups[i];
      sp.y += (sp.vy || -0.02) * dt;
      sp.life -= dt;
      if (sp.life <= 0) scorePopups.splice(i,1);
    }

    screenShake = Math.max(0, screenShake - dt * 0.04);
    if (enemies.length === 0 && Date.now() - lastSpawn > 600) { lastSpawn = Date.now(); spawnWave(); }
  }

  function draw() {
    ctx.clearRect(0,0,cw,ch);
    ctx.save();
    if (screenShake > 0 && !prefersReducedMotion) { const sx = (Math.random()*2-1)*screenShake; const sy = (Math.random()*2-1)*screenShake; ctx.translate(sx, sy); }
    ctx.fillStyle = '#b3e5fc'; ctx.fillRect(0,0,cw,ch);
    const g = ctx.createLinearGradient(0,ch-180,0,ch); g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(1,'rgba(0,0,0,0.06)'); ctx.fillStyle = g; ctx.fillRect(0,ch-180,cw,180);
    // Brief red flash overlay when a life is lost to increase clarity of life loss (respects reduced-motion)
    try {
      if (Date.now() < livesFlashUntil && !prefersReducedMotion) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,56,56,0.12)';
        ctx.fillRect(0,0,cw,ch);
        ctx.restore();
      }
    } catch (e) { /* ignore flash errors */ }

    // Subtle dashed touch-zone guide lines for touch-capable devices. These lines run up approximately 1/3 of the viewport height
    // and indicate the left/center/right touch regions (left 25% = left, center 50% = fire, right 25% = right).
    if ((isTouch || Date.now() < showTouchGuidesUntil) && cw > 240) {
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

    // If the user has touched the screen recently, show a subtle horizontal guide near the top third for a short time
    if ((Date.now() < touchGuideExpires || Date.now() < showTouchGuidesUntil) && cw > 240) {
      ctx.save();
      ctx.strokeStyle = 'rgba(102,187,106,0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6,6]);
      const y = Math.floor(ch * 0.33);
      ctx.beginPath();
      ctx.moveTo(0.5, y + 0.5);
      ctx.lineTo(cw + 0.5, y + 0.5);
      ctx.stroke();
      ctx.setLineDash([]);
      // Draw subtle low-contrast overlays for the three full-screen touch zones (left 25%, center 50%, right 25%)
      try {
        const leftW = Math.floor(cw * 0.25);
        const rightW = leftW;
        const centerW = Math.max(0, cw - leftW - rightW);
        // Very subtle fill so it doesn't distract during play
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        const zoneH = 60;
        ctx.fillRect(0, y - Math.floor(zoneH/2), leftW, zoneH);
        ctx.fillRect(leftW, y - Math.floor(zoneH/2), centerW, zoneH);
        ctx.fillRect(leftW + centerW, y - Math.floor(zoneH/2), rightW, zoneH);
        // Small labels to clarify zones: keep contrast low and text small
        ctx.fillStyle = 'rgba(255,255,255,0.36)';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Move', Math.floor(leftW/2), y);
        // Draw a subtle fire dot for the center zone instead of text to be less obtrusive on small screens
        try {
          const centerX = Math.floor(leftW + centerW/2);
          ctx.beginPath();
          // Make the center fire dot slightly larger and subtly pulse while touch guides are visible
          try {
            const pulseActive = (Date.now() < touchGuideExpires) || (Date.now() < showTouchGuidesUntil);
            const pulse = (pulseActive && !prefersReducedMotion) ? (1 + 0.5 * Math.sin(Date.now() / 160)) : 1;
            const r = 8 * pulse;
            ctx.fillStyle = 'rgba(102,187,106,0.98)'; // garden-green center indicator (subtle)
            ctx.arc(centerX, y, r, 0, Math.PI * 2);
          } catch (e) {
            ctx.fillStyle = 'rgba(255,138,101,0.95)';
            ctx.arc(centerX, y, 8, 0, Math.PI * 2);
          }
          ctx.fill();
          // Add a small label under the center dot to clarify the garden action for touch users
          try {
            ctx.fillStyle = 'rgba(255,255,255,0.46)';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText('Water', centerX, y + 12);
          } catch (e) { /* ignore label draw errors */ }
        } catch (e) { /* ignore drawing errors */ }
        ctx.fillStyle = 'rgba(255,255,255,0.36)';
        ctx.fillText('Move', Math.floor(leftW + centerW + rightW/2), y);
      } catch (e) { /* ignore drawing errors on older platforms */ }
      ctx.restore();
    }

    // Short touch feedback circle (drawn near the touch point) to provide immediate tactile feedback on touch interactions
    if (typeof touchFeedbackUntil !== 'undefined' && Date.now() < touchFeedbackUntil) {
      ctx.save();
      try {
        const alpha = Math.max(0, (touchFeedbackUntil - Date.now()) / 480);
        // Garden-themed green touch pulse for clearer feedback on mobile
        ctx.fillStyle = 'rgba(27,94,32,' + (0.6 * alpha).toFixed(3) + ')';
        ctx.beginPath();
        const tx = Math.max(12, Math.min(cw - 12, lastTouchX || 0));
        const ty = Math.max(12, Math.min(ch - 12, lastTouchY || (ch - 80)));
        const r = 12 + 10 * (1 - alpha);
        ctx.arc(tx, ty, r, 0, Math.PI * 2);
        ctx.fill();
      } catch (e) { /* ignore draw errors */ }
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

    ctx.save();
    ctx.translate(player.x, player.y);
    // Brief muzzle flash when firing to improve feedback on touch and keyboard/mouse
    try {
      if (Date.now() < lastFireFlashUntil) {
        const flashRemaining = Math.max(0, (lastFireFlashUntil - Date.now()) / 120);
        const flashAlpha = 0.9 * flashRemaining;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,210,140,' + flashAlpha.toFixed(3) + ')';
        // draw a small glowing arc slightly above and to the right of the player to simulate a muzzle
        ctx.arc(12, -6, 8 * (0.8 + flashRemaining * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
    } catch (e) { /* ignore flash drawing errors */ }
    ctx.fillStyle = '#2e8b57'; ctx.beginPath(); ctx.ellipse(0,0,player.w,player.h,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#000'; ctx.fillRect(-8,-4,16,8); ctx.restore();

    // draw particles
    for (const p of particles) {
      const alpha = Math.max(0, Math.min(1, p.life / 1000));
      ctx.save();
      ctx.globalAlpha = alpha;
      if (p.leaf) {
        try {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle || 0);
          ctx.fillStyle = p.color || '#8BC34A';
          // draw a small leaf-like ellipse
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r * 1.6, Math.max(1, p.r * 0.8), 0, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) { /* ignore draw errors for leaves */ }
      } else {
        ctx.fillStyle = p.color || 'rgba(255,220,100,1)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    }
    // draw floating score popups
    for (const sp of scorePopups) {
      const alpha = Math.max(0, Math.min(1, sp.life / sp.totalLife));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = sp.color || '#ffff88';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sp.text, sp.x, sp.y);
      ctx.restore();
    }
    ctx.fillStyle = '#fff'; for (const b of bullets) { ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill(); }

    for (const e of enemies) { const sc = 1 + (e.y / ch) * 0.25; ctx.save(); ctx.translate(e.x,e.y); ctx.scale(sc,sc); try {
          const nowHit = Date.now();
          if (e.hitFlashUntil && nowHit < e.hitFlashUntil) {
            // brighter tint while hit flash is active
            ctx.fillStyle = '#ffb3b3';
          } else {
            ctx.fillStyle = '#ff6666';
          }
        } catch (err) { ctx.fillStyle = '#ff6666'; }
        ctx.fillRect(-e.w/2,-e.h/2,e.w,e.h);
        ctx.fillStyle='#600'; ctx.fillRect(-e.w/4,-e.h/8,e.w/2,e.h/4); ctx.restore(); }

    if (scoreEl) scoreEl.textContent = 'Score: ' + score;
    if (waveEl) {
      const n = waveNumber;
      waveEl.textContent = 'Wave: ' + n + ' 🌱';
      try { waveEl.setAttribute('aria-label', 'Wave: ' + n); } catch (e) { }
      try {
        if (Date.now() < wavePulseUntil) { waveEl.classList.add('wave-pulse'); } else { waveEl.classList.remove('wave-pulse'); }
      } catch (e) { }
    }
    if (enemiesEl) {
      try {
        const cnt = enemies.length;
        enemiesEl.textContent = cnt + ' ' + (cnt === 1 ? 'Enemy' : 'Enemies');
      } catch (e) { /* ignore DOM errors */ }
    }
    // Update document title to include current wave and score for better visibility when tabbed away
    try {
      if (!paused && !gameOver) {
        const suffix = ' (Wave ' + waveNumber + ' — Score ' + score + ')';
        if (!document.title.endsWith(suffix)) { document.title = originalTitle + suffix; }
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
      // Add a low-lives visual hint when player has only one life left
      try { if (lives <= 1) livesEl.classList.add('low'); else livesEl.classList.remove('low'); } catch (e) { /* ignore */ }
    }
    // Show the higher of persisted high score and current run score so HUD reflects when the player surpasses the high score live during a run.
    const displayHigh = Math.max(highScore, score);
    if (versionEl) {
      try {
        versionEl.textContent = 'v' + version + ' — High: ' + displayHigh + (autoPauseEnabled ? ' — Auto-pause: On' : ' — Auto-pause: Off');
      } catch (e) { /* ignore DOM errors */ }
    }

    // Draw a small HUD on the canvas so players see Wave, Lives, and Enemies even if the DOM HUD is hidden
    if (typeof hudVisible === 'undefined' || hudVisible) {
      try {
        ctx.save();
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'left';
        const waveText = 'Wave: ' + waveNumber + ' 🌱';
        const livesText = 'Lives: ' + lives;
        const enemiesText = enemies.length + ' ' + (enemies.length === 1 ? 'Enemy' : 'Enemies');
        const pad = 10;
        const lineHeight = 22;
        const waveW = ctx.measureText(waveText).width;
        const livesW = ctx.measureText(livesText).width;
        const enemiesW = ctx.measureText(enemiesText).width;
        const boxW = Math.max(waveW, livesW, enemiesW) + pad * 2;
        const boxH = lineHeight * 3 + 8;
        const rx = 8, ry = 6;
        // pulse slightly when wave, lives, or enemies changed recently
        const now = Date.now();
        const pulse = (now < wavePulseUntil || now < livesPulseUntil) ? 0.18 : 0.06;
        // Slightly increase the HUD background opacity for better readability on busy scenes (tiny)
        ctx.fillStyle = 'rgba(0,0,0,' + (0.62 + pulse) + ')';
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
        // subtle border to separate HUD from background
        try { ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.stroke(); } catch (e) {}
        // If the player is low on lives (1 or fewer), add a subtle red dashed outline to the HUD for stronger visual feedback
        try {
          if (typeof lives !== 'undefined' && lives <= 1) {
            ctx.save();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = 'rgba(230,60,60,0.95)';
            try { ctx.setLineDash([4,2]); } catch (e) {}
            try { ctx.stroke(); } catch (e) {}
            try { ctx.setLineDash([]); } catch (e) {}
            ctx.restore();
          }
        } catch (e) {}
        // Improve readability: add a subtle drop shadow for HUD text (helps on busy backgrounds)
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 6;
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
          ctx.fillText(waveText, rx + pad, ry + 16);
          // Draw a 'Lives:' label then heart icons for lives for clearer, more visual feedback (garden-themed hearts)
          try {
            const heartSize = 18; // px (slightly larger for readability)
            // Draw the Lives text label on its own line for clarity
            ctx.font = '16px sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            ctx.fillText(livesText, rx + pad, ry + 16 + lineHeight);
            // Now draw heart icons to the right of the Lives label
            ctx.font = heartSize + 'px sans-serif';
            for (let j = 0; j < Math.max(0, lives); j++) {
              ctx.fillStyle = '#e53935';
              const hxStart = rx + pad + (typeof livesW !== 'undefined' ? livesW : 60) + 12;
              const hx = hxStart + j * (heartSize + 6);
              const hy = ry + 16 + lineHeight - 4; // vertically align with text baseline
              ctx.fillText('♥', hx, hy);
            }
            // restore text font and color for subsequent text
            ctx.font = '16px sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.95)';
          } catch (e) { /* ignore heart draw errors */ }
          ctx.fillText(enemiesText, rx + pad, ry + 16 + lineHeight * 2);
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.restore();
      } catch (e) { /* ignore drawing errors */ }
    }

    // draw a temporary wave banner when a new wave starts (fades out)
    if (Date.now() < wavePulseUntil) {
      const remain = wavePulseUntil - Date.now();
      const alpha = Math.max(0, Math.min(1, remain / 800));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fff';
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      // Add a subtle shadow to the wave banner for improved contrast on busy backgrounds
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 10;
      ctx.fillText('Wave ' + waveNumber + ' 🌱', cw/2, 80);
      // Clear shadow after drawing so subsequent drawings are unaffected
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.restore();
    }

    // transient on-screen controls hint (shows for tipDuration ms after load)
    if (Date.now() < tipExpires) {
      ctx.save();
      const tipText = 'Tip: Garden shooter — Arrow keys or A/D to move; Space or tap center to water plants. Tap left/right edges to move. Press M to mute, O to toggle auto-pause. Dashed guides indicate touch zones.';
      const tipW = Math.min(420, Math.max(160, cw - 24));
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(12,12,tipW,44);
      ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(tipText, 20, 36, Math.max(80, tipW - 24));
      ctx.restore();
    }

    // Show low-contrast dashed guide line near the top third of the canvas after the first touch
    if (Date.now() < showTouchGuidesUntil) {
      try {
        ctx.save();
        // horizontal guide
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6,6]);
        const guideY = Math.round(ch / 3);
        ctx.beginPath();
        ctx.moveTo(12, guideY);
        ctx.lineTo(cw - 12, guideY);
        ctx.stroke();
        // subtle vertical separators at 25% and 75% for touch zone clarity
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4,6]);
        const x1 = Math.round(cw * 0.25);
        const x2 = Math.round(cw * 0.75);
        ctx.beginPath();
        ctx.moveTo(x1, 12);
        ctx.lineTo(x1, ch - 12);
        ctx.moveTo(x2, 12);
        ctx.lineTo(x2, ch - 12);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      } catch (e) { /* ignore drawing errors on older browsers */ }
    }

    // Draw a small FPS counter in the HUD corner for visibility during play (smoothed)
    try {
      const fps = rawDt > 0 ? (1000 / rawDt) : 0;
      fpsSmoothed = fpsSmoothed * 0.92 + fps * 0.08;
      ctx.save();
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fillText('FPS: ' + Math.round(fpsSmoothed), cw - 12, 18);
      ctx.restore();
    } catch (e) { /* ignore FPS draw errors */ }
    ctx.restore();
    if (paused || gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0,0,cw,ch);
      ctx.fillStyle = '#fff';
      ctx.font = '48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(gameOver ? 'Game Over' : (pausedByFocus ? 'Paused (focus lost)' : 'Paused'), cw/2, ch/2);
      if (!gameOver) {
        ctx.font = '18px sans-serif';
        ctx.fillText(pausedByFocus ? 'Paused due to focus loss — tap, Space, or press P to resume' : 'Press P, Esc, or Space to resume', cw/2, ch/2 + 48);
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
  let fpsSmoothed = 60;
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
    if (e.pointerType === 'mouse') {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      player.x = Math.max(20, Math.min(cw - 20, x));
    } else if ((e.pointerType === 'touch' || e.pointerType === 'pen') && typeof canvas._updateBottomTouchInteraction === 'function') {
      if (canvas._updateBottomTouchInteraction(e.clientX, e.clientY, e.pointerId)) {
        try { e.preventDefault(); } catch (err) { /* ignore */ }
      }
    }
  });
  // Pointer down: mouse repositions/fires; touch/pen on the bottom half repositions immediately and starts firing only after a short hold.
  canvas.addEventListener('pointerdown', function(e){
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (e.pointerType === 'mouse') {
      player.x = Math.max(20, Math.min(cw - 20, x));
      keys.fire = true;
      if (soundEnabled) ensureAudio();
    } else if ((e.pointerType === 'touch' || e.pointerType === 'pen') && typeof canvas._beginBottomTouchInteraction === 'function') {
      if (canvas._beginBottomTouchInteraction(e.clientX, e.clientY, e.pointerId)) {
        if (soundEnabled) ensureAudio();
        try { e.preventDefault(); } catch (err) { /* ignore */ }
      }
    }
  }, { passive: false });
  // Some platforms may emit pointercancel/touchcancel when input is interrupted (e.g., OS gestures). Clear transient input there to avoid stuck controls.
  canvas.addEventListener('pointercancel', function(e){
    if (typeof canvas._stopBottomTouchInteraction === 'function') canvas._stopBottomTouchInteraction(e.pointerId);
    clearInputs();
  }, { passive: true });
  // Direct touch fallback for browsers that dispatch Touch Events instead of Pointer Events.
  canvas.addEventListener('touchstart', function(e){
    for (let i=0;i<e.changedTouches.length;i++) {
      const t = e.changedTouches[i];
      if (t.target === canvas && typeof canvas._beginBottomTouchInteraction === 'function') {
        e.preventDefault();
        if (soundEnabled) ensureAudio();
        if (canvas._beginBottomTouchInteraction(t.clientX, t.clientY, t.identifier)) break;
      }
    }
  }, {passive:false});
  canvas.addEventListener('touchend', function(e){
    try { e.preventDefault(); } catch (err) { /* ignore if preventDefault not allowed */ }
    if (typeof canvas._stopBottomTouchInteraction === 'function') {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (canvas._stopBottomTouchInteraction(e.changedTouches[i].identifier)) break;
      }
    }
    clearInputs();
  }, {passive:false});

  // Prevent touchmove scrolling when dragging on the canvas so mobile controls stay responsive.
  canvas.addEventListener('touchmove', function(e){
    try { e.preventDefault(); } catch (err) { /* ignore */ }
    if (typeof canvas._updateBottomTouchInteraction !== 'function') return;
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      if (canvas._updateBottomTouchInteraction(t.clientX, t.clientY, t.identifier)) break;
    }
  }, {passive:false});
  // Mirror touchcancel handling to ensure canceled touches also clear transient state
  canvas.addEventListener('touchcancel', function(e){
    try { e.preventDefault(); } catch (err) { /* ignore if preventDefault not allowed */ }
    if (typeof canvas._stopBottomTouchInteraction === 'function') {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (canvas._stopBottomTouchInteraction(e.changedTouches[i].identifier)) break;
      }
    }
    clearInputs();
  }, {passive:false});
  document.body.addEventListener('touchstart', function(e){ if (e.target === canvas) e.preventDefault(); }, {passive:false});



})();

