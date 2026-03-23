(() => {
  const canvas = document.getElementById('game');
  if (!canvas) { console.warn('Canvas #game not found — aborting game script'); return; }
  const ctx = canvas.getContext('2d');
  if (!ctx) { console.warn('2D context not available — aborting game script'); return; }
  // Accessibility: make canvas focusable and provide an aria-label describing controls so
  // keyboard and screen-reader users can discover how to play without editing HTML.
  try {
    canvas.setAttribute('role', 'application');
    canvas.setAttribute('aria-label', 'Garden shooter game canvas — use arrow keys or A/D to move; Space to fire. On touch devices, tap the bottom half to move there and hold to fire. Press I or H for help.');
    canvas.setAttribute('tabindex', '0');
    // Ensure the canvas receives keyboard focus on first user interaction so keyboard controls work without an extra click.
    try {
      const _focusOnce = function(){ try{ canvas.focus(); }catch(e){}; try{ canvas.removeEventListener('pointerdown', _focusOnce); }catch(e){}; try{ canvas.removeEventListener('touchstart', _focusOnce); }catch(e){}; };
      canvas.addEventListener('pointerdown', _focusOnce, { passive: true });
      canvas.addEventListener('touchstart', _focusOnce, { passive: true });
    } catch (e) {}
    // Prevent browser touch scrolling/gestures while interacting with the game canvas (improves mobile responsiveness)
    try { canvas.style.touchAction = 'none'; } catch (e) { /* ignore */ }
    // Ensure shield CSS state is initialized so CSS selectors have a deterministic value on page load
    try { if (typeof document !== 'undefined' && document.body) { document.body.setAttribute('data-shield-active', 'false'); } } catch (e) {}
  } catch (e) { /* ignore attribute errors in older browsers */ }
  // Polyfill small safe requestAnimationFrame fallback for very old browsers/environments
  try { if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'undefined') { window.requestAnimationFrame = function(cb){ return setTimeout(cb, 16); }; if (typeof window.cancelAnimationFrame === 'undefined') window.cancelAnimationFrame = function(id){ clearTimeout(id); }; } } catch(e) {}

  // Ensure a single autopause live region exists. Multiple identical live regions can confuse assistive tech
  // and cause repeated announcements. This helper deduplicates any existing nodes and returns the single node.
  function getAutopauseAnnouncer(){
    try{
      const nodes = document.querySelectorAll('#autopause-announcer');
      if(nodes && nodes.length){
        // If duplicates exist, keep the first and remove others
        if(nodes.length > 1){
          for(let i = 1; i < nodes.length; i++){
            try{ nodes[i].parentNode && nodes[i].parentNode.removeChild(nodes[i]); }catch(e){}
          }
        }
        return nodes[0];
      }
      let el = document.getElementById('autopause-announcer');
      if(el) return el;
      el = document.createElement('div');
      el.id = 'autopause-announcer';
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      el.style.width = '1px';
      el.style.height = '1px';
      el.setAttribute('aria-live', 'assertive');
      el.setAttribute('aria-atomic', 'true');
      try{ document.body.appendChild(el); }catch(e){}
      return el;
    }catch(e){ return null; }
  }
  try { getAutopauseAnnouncer(); } catch(e) {}
  // Subtle pointer-driven atmosphere parallax: gently shift the html::before highlights based on pointer position
  // This is intentionally low-impact and respects prefers-reduced-motion and touch devices.
  try {
    (function(){
      var _atmoPending = false, _lastAtmoEv = null;
      try {
        var _prefersReduced = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      } catch(e) { var _prefersReduced = false; }
      if (!_prefersReduced) {
        window.addEventListener('pointermove', function(ev){
          try {
            if (isTouch) return; // avoid pointer-driven motion on touch devices
            _lastAtmoEv = ev;
            if (_atmoPending) return;
            _atmoPending = true;
            requestAnimationFrame(function(){
              try {
                if (!_lastAtmoEv) { _atmoPending = false; return; }
                var cx = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
                var cy = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
                var dx = ((_lastAtmoEv.clientX || (cx*0.5)) - (cx*0.5)) / (cx*0.5); // -1..1
                var dy = ((_lastAtmoEv.clientY || (cy*0.5)) - (cy*0.5)) / (cy*0.5);
                var maxX = 18; var maxY = 12; var rot = dx * 2;
                try { document.documentElement.style.setProperty('--atmo-x', (dx * maxX).toFixed(2) + 'px'); } catch(e) {}
                try { document.documentElement.style.setProperty('--atmo-y', (dy * maxY).toFixed(2) + 'px'); } catch(e) {}
                try { document.documentElement.style.setProperty('--atmo-rot', (rot.toFixed(2) + 'deg')); } catch(e) {}
              } catch(e) {}
              _atmoPending = false;
            });
          } catch(e) {}
        }, { passive: true });
        window.addEventListener('pointerleave', function(){ try { document.documentElement.style.removeProperty('--atmo-x'); document.documentElement.style.removeProperty('--atmo-y'); document.documentElement.style.removeProperty('--atmo-rot'); } catch(e){} }, { passive: true });
      }
    })();
  } catch(e) {}
  // Show a one-time session tip toast on first session load. Guarded by sessionStorage
  try {
    if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('selfmade_seen_session_toast')) {
      // mark as seen immediately so we don't repeatedly attempt to show if DOM operations fail
      try { sessionStorage.setItem('selfmade_seen_session_toast', '1'); } catch (e) {}
      try {
        var _sessionTip = document.createElement('div');
        _sessionTip.id = 'session-tip-toast';
        _sessionTip.setAttribute('role', 'status');
        _sessionTip.setAttribute('aria-live', 'polite');
        _sessionTip.style.position = 'fixed';
        _sessionTip.style.left = '50%';
        _sessionTip.style.top = '8px';
        _sessionTip.style.transform = 'translateX(-50%)';
        _sessionTip.style.background = 'rgba(0,0,0,0.75)';
        _sessionTip.style.color = '#fff';
        _sessionTip.style.padding = '8px 12px';
        _sessionTip.style.borderRadius = '8px';
        _sessionTip.style.zIndex = '10005';
        _sessionTip.style.pointerEvents = 'none';
        _sessionTip.style.opacity = '0';
        _sessionTip.style.transition = 'opacity 220ms ease, transform 220ms ease';
        _sessionTip.textContent = 'Tip: Press H for help, P to pause, O to toggle auto-pause, N to advance waves. Enjoy the game!';
        try { document.body.appendChild(_sessionTip); } catch (e) {}
        try { void _sessionTip.offsetWidth; _sessionTip.style.opacity = '1'; } catch (e) {}
        setTimeout(function(){ try { _sessionTip.style.opacity = '0'; } catch(e){} }, 4200);
        setTimeout(function(){ try { if (_sessionTip && _sessionTip.parentNode) _sessionTip.parentNode.removeChild(_sessionTip); } catch(e){} }, 4600);
      } catch (e) {}
    }
  } catch (e) {}
  let cw, ch;
  let player;
  let lastShieldActive = false;
  function createImageAsset(src, handlers) {
    const asset = { image: null, ready: false, src };
    try {
      if (typeof Image !== 'undefined') {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          asset.ready = true;
          try { if (handlers && typeof handlers.onload === 'function') handlers.onload(img); } catch (e) {}
        };
        img.onerror = () => {
          asset.ready = false;
          try { if (handlers && typeof handlers.onerror === 'function') handlers.onerror(); } catch (e) {}
        };
        img.src = src;
        asset.image = img;
      }
    } catch (e) {}
    return asset;
  }
  function drawImageCover(img, dx, dy, dw, dh) {
    if (!img || !img.naturalWidth || !img.naturalHeight) return false;
    const srcRatio = img.naturalWidth / img.naturalHeight;
    const destRatio = dw / dh;
    let sx = 0;
    let sy = 0;
    let sw = img.naturalWidth;
    let sh = img.naturalHeight;
    if (srcRatio > destRatio) {
      sw = img.naturalHeight * destRatio;
      sx = (img.naturalWidth - sw) * 0.5;
    } else {
      sh = img.naturalWidth / destRatio;
      sy = (img.naturalHeight - sh) * 0.5;
    }
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    return true;
  }
  function pathRoundedRect(x, y, w, h, r) {
    const radius = Math.max(0, Math.min(r, Math.abs(w) * 0.5, Math.abs(h) * 0.5));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
  const gardenBackgroundAsset = createImageAsset('assets/images/garden-background.jpg', {
    onload: () => {
      try {
        const pref = (function(){ try { return localStorage.getItem('selfmade_show_bg'); } catch(e){ return null; } })();
        if (pref !== '0') {
          canvas.style.backgroundImage = 'url("assets/images/garden-background.jpg")';
          canvas.style.backgroundPosition = 'center top';
          canvas.style.backgroundSize = 'cover';
          try { canvas.dataset.bgVisible = 'true'; } catch(e) {}
        } else {
          // user opted out of background images
          try { canvas.dataset.bgVisible = 'false'; } catch(e) {}
        }
      } catch (e) {}
    },
    onerror: () => {
      try {
        // If the garden background image fails to load, show a subtle garden-themed gradient as a low-cost visual fallback
        // Respect user's explicit "show background" preference: only show the gradient when they haven't disabled backgrounds.
        try {
          const pref = (function(){ try { return localStorage.getItem('selfmade_show_bg'); } catch(e){ return null; } })();
          if (pref !== '0') {
            canvas.style.backgroundImage = 'linear-gradient(180deg, #e8f7ff 0%, #eafbe8 100%)';
            canvas.style.backgroundPosition = 'center top';
            canvas.style.backgroundSize = 'cover';
            try { canvas.dataset.bgVisible = 'false'; } catch(e) {}
          } else {
            // user disabled backgrounds — keep canvas clear
            canvas.style.backgroundImage = '';
            try { canvas.dataset.bgVisible = 'false'; } catch(e) {}
          }
        } catch (inner) {
          canvas.style.backgroundImage = '';
          try { canvas.dataset.bgVisible = 'false'; } catch(e) {}
        }
      } catch (e) {}
    }
  });
  const playerSpriteAsset = createImageAsset('assets/images/player-sprite.jpg');
  const enemySpriteAsset = createImageAsset('assets/images/enemy-sprite.jpg');
  let gardenBackground = gardenBackgroundAsset.image;
  let playerSprite = playerSpriteAsset.image;
  let enemySprite = enemySpriteAsset.image;
  try {
    gardenBackground = gardenBackgroundAsset.image;
    playerSprite = playerSpriteAsset.image;
    enemySprite = enemySpriteAsset.image;
  } catch (e) { /* ignore background image loading errors */ }
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
    try { if (typeof spawnBgLeaves === 'function') spawnBgLeaves(); if (typeof spawnBgClouds === 'function') spawnBgClouds(); } catch (e) { /* ignore */ }
  }
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 120);
  }, { passive: true });
  resize();
  // background leaves (parallax) — lightweight layer
  const bgLeaves = [];
  function spawnBgLeaves(count) {
    try {
      bgLeaves.length = 0;
      const n = typeof count === 'number' ? count : Math.max(10, Math.floor(cw / 50));
      for (let i = 0; i < n; i++) {
        bgLeaves.push({
          x: Math.random() * cw,
          y: Math.random() * ch,
          vx: (Math.random() * 0.6 - 0.3),
          vy: 0.12 + Math.random() * 0.28,
          r: 6 + Math.random() * 10,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.02,
          // Broaden the palette with warmer garden tones so the background feels more varied and lively
          color: ['#8BC34A', '#66BB6A', '#A5D6A7', '#FFD54F', '#FFCC80'][Math.floor(Math.random() * 5)],
          // Slightly increase alpha range so leaves are a bit more visible without overpowering foreground
          alpha: 0.12 + Math.random() * 0.10
        });
      }
    } catch (e) { /* ignore bg leaf init errors */ }
  }

  // subtle drifting cloud layer (parallax, behind leaves)
  const bgClouds = [];
  function spawnBgClouds(count) {
    try {
      bgClouds.length = 0;
      const n = typeof count === 'number' ? count : Math.max(3, Math.floor(cw / 420));
      for (let i = 0; i < n; i++) {
        bgClouds.push({
          x: Math.random() * cw,
          y: Math.random() * (ch * 0.45),
          vx: 0.12 + Math.random() * 0.3,
          w: 80 + Math.random() * 160,
          h: 24 + Math.random() * 40,
          alpha: 0.04 + Math.random() * 0.08
        });
      }
    } catch (e) { /* ignore cloud init errors */ }
  }
  // Prevent right-click context menu on game canvas and page (within canvas area) to avoid accidental interruption
  try { canvas.addEventListener('contextmenu', e => { e.preventDefault(); }); document.addEventListener('contextmenu', e => { try { if (e.target && (e.target === canvas || canvas.contains(e.target))) { e.preventDefault(); } } catch (err) { /* ignore */ } }, { passive: false }); } catch (e) { /* ignore */ }
  // Improve accessibility: focus the canvas on pointer interaction so keyboard controls work after tap/click
  try { canvas.addEventListener('pointerdown', () => { try { canvas.focus(); } catch (e) {} }, { passive: true }); } catch (e) { /* ignore */ }
  // Pause the game when the page becomes hidden to avoid player losing progress when switching tabs or apps.
  try {
    // Read autopause preference with backward-compatibility for the legacy key. Migrate legacy value to the new key when present.
    var _visibilityPref = (function(){
      try {
        var v = null;
        try { v = localStorage.getItem('selfmade_autopause'); } catch (e) { v = null; }
        if (v === null || v === undefined) {
          try { v = localStorage.getItem('selfmade_pause_on_blur'); } catch (e) { v = null; }
          // migrate legacy key to new canonical key so future reads use the new name
          try { if (v !== null && v !== undefined) { localStorage.setItem('selfmade_autopause', v); try { localStorage.removeItem('selfmade_pause_on_blur'); } catch(e) {} } } catch(e) {}
        }
        return v;
      } catch(e) { return null; }
    })();
    // Default to enabled unless user explicitly set to '0'
    if (_visibilityPref !== '0') {
      var _wasRunningBeforeHide = false;
      document.addEventListener('visibilitychange', function(){
        try {
          if (document.hidden) {
            // remember if game was running so we can restore state
            try { _wasRunningBeforeHide = (typeof running !== 'undefined' ? running : false); } catch(e) { _wasRunningBeforeHide = false; }
            try { if (typeof running !== 'undefined' && running) { togglePause(true, 'visibility'); } } catch(e) {}
            // Clear any pending scheduled spawn timeout to avoid enemies spawning while the page is hidden.
            try { if (typeof scheduledSpawnTimeout !== 'undefined' && scheduledSpawnTimeout) { clearTimeout(scheduledSpawnTimeout); scheduledSpawnTimeout = null; } } catch (e) {}
          } else {
            // when returning, only auto-resume if it was running before AND the document actually has focus.
            // Some platforms fire visibilitychange during transient transitions — require document.hasFocus() to avoid accidental auto-resume.
            try { if (_wasRunningBeforeHide && document.hasFocus && document.hasFocus()) { togglePause(false, 'visibility'); } } catch(e) {}
          }
        } catch(e) {}
      }, { passive: true });
      // Also handle window blur/focus events so switching to another app/window pauses immediately on desktop OSes
      try {
        window.addEventListener('blur', function(){
          try {
            _wasRunningBeforeHide = (typeof running !== 'undefined' ? running : false);
            if (typeof running !== 'undefined' && running) { togglePause(true, 'blur'); }
          } catch(e) {}
        }, { passive: true });
        window.addEventListener('focus', function(){
          try {
            if (_wasRunningBeforeHide) { togglePause(false, 'focus'); }
          } catch(e) {}
        }, { passive: true });
      } catch(e) { /* ignore blur/focus errors */ }
    }
  } catch (e) { /* ignore visibility handling errors */ }

  // Global helper: draw text with a dark outline for readability on busy backgrounds
  function drawOutlinedText(ctxArg, text, x, y, fillStyle) {
    try {
      ctxArg.save();
      if (fillStyle) ctxArg.fillStyle = fillStyle;
      ctxArg.lineWidth = 3;
      ctxArg.strokeStyle = 'rgba(0,0,0,0.85)';
      ctxArg.miterLimit = 2;
      try { ctxArg.strokeText(text, x, y); } catch(e){}
      try { ctxArg.fillText(text, x, y); } catch(e){}
      ctxArg.restore();
    } catch(e) {}
  }

  // Score helper: add score respecting temporary mulch multiplier and create popup
  function addScoreAndPopup(n, x, y, color) {
    try {
      const now = Date.now();
      const mult = (player && typeof player.scoreMultiplier === 'number' && (player.mulchUntil || 0) > now) ? player.scoreMultiplier : 1;
      const add = Math.round(n * mult);
      try { score += add; } catch(e) { score = (typeof score === 'number' ? score : 0) + add; }
      try { scorePopups.push({ x: x, y: y, text: '+' + add, vy: -0.05, life: 800, totalLife: 800, color: color || '#ffff88' }); } catch(e){}
    } catch(e) { try { score += n; } catch(e){} }
  }

  // Small transient wave toast: briefly shows a message near the top when waves start or clear.
  function showWaveToast(msg) {
    try {
      var el = document.getElementById('wave-toast');
      if (!el) {
        el = document.createElement('div');
        el.id = 'wave-toast';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        el.style.pointerEvents = 'none';
        document.body.appendChild(el);
      }
      try { el.textContent = String(msg); } catch(e) {}
      try { el.classList.add('show'); } catch(e) {}
      // Auto-hide after a short duration; keep accessible but non-intrusive
      // Slightly longer so the toast is more noticeable on small screens
      setTimeout(function(){ try { el.classList.remove('show'); } catch(e) {} }, 1800);
    } catch(e) { /* ignore */ }
  }

  const scoreEl = document.getElementById('score');
  const versionEl = document.getElementById('version');
  const livesEl = document.getElementById('lives');
  const waveEl = document.getElementById('wave');
  const enemiesEl = document.getElementById('enemies');
  // Create a small manual "Next Wave" button as a fallback when automatic spawns stall.
  // This helps players proceed if a wave unexpectedly fails to progress.
  let nextWaveBtn = null;
  try {
    nextWaveBtn = document.getElementById('nextWaveBtn');
    if (!nextWaveBtn) {
      nextWaveBtn = document.createElement('button');
      nextWaveBtn.id = 'nextWaveBtn';
      nextWaveBtn.type = 'button';
      nextWaveBtn.textContent = 'Next Wave';
      nextWaveBtn.title = 'Advance to next wave';
      nextWaveBtn.style.position = 'fixed';
      nextWaveBtn.style.right = '12px';
      nextWaveBtn.style.bottom = '12px';
      nextWaveBtn.style.zIndex = '10002';
      nextWaveBtn.style.padding = '14px 20px';
      nextWaveBtn.style.borderRadius = '16px';
      nextWaveBtn.style.background = 'linear-gradient(135deg,#c8e6c9,#66bb6a)';
      nextWaveBtn.style.color = '#063f0d';
      nextWaveBtn.style.border = 'none';
      nextWaveBtn.style.fontWeight = '800';
      nextWaveBtn.style.fontSize = '16px';
      nextWaveBtn.style.cursor = 'pointer';
      nextWaveBtn.style.boxShadow = '0 10px 22px rgba(0,0,0,0.22)';
      // Subtle transition so the button feels lively when it appears and on hover
      nextWaveBtn.style.transition = 'transform 220ms ease, box-shadow 220ms ease, opacity 220ms ease';
      nextWaveBtn.setAttribute('aria-label', 'Advance to next wave');
      try { document.body.appendChild(nextWaveBtn); } catch(e) {}
    }
    // Click handler: only trigger a new wave if current wave is cleared to avoid accidental skipping
    nextWaveBtn.addEventListener('click', function(){
      try {
        const present = (typeof enemies !== 'undefined' ? enemies.filter(function(e){ try { return e && e.wave === waveNumber; } catch(err){ return false; } }).length : 0);
        if (present === 0 && !gameOver) {
          try { if (scheduledSpawnTimeout) { clearTimeout(scheduledSpawnTimeout); scheduledSpawnTimeout = null; } } catch(e){}
          try { lastSpawn = Date.now(); } catch(e){}
          try { spawnWave(); } catch(e){}
        }
      } catch(e) {}
    }, { passive: true });
    // Keyboard activation: also allow Enter and Space keys to activate the Next Wave button for keyboard users.
    try {
      nextWaveBtn.addEventListener('keydown', function(e){
        try {
          const key = (e.key || '').toString();
          const code = (e.code || '').toString();
          const activated = key === 'Enter' || key === ' ' || key === 'Spacebar' || key === 'Space' || code === 'Space';
          if (activated) {
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
            // Reuse click handler logic by invoking click to keep behavior consistent
            try { this.click(); } catch(err) {}
          }
        } catch(err) {}
      });
    } catch(e) {}
  } catch (e) { /* ignore UI creation errors */ }
  const waveProgressEl = document.getElementById('wave-progress');
  // Active power-up HUD element (shows current power-up and remaining time)
  const activePowerEl = document.getElementById('active-powerup');

  // Track last shown wave so the HUD can briefly animate when a new wave starts
  let lastWaveShown = null;

  function refreshVersionHUD() {
    try {
      // Update version line (shows version, current or persisted high score, and auto-pause state)
      const displayHigh = Math.max(highScore, score);
      if (versionEl) {
        try { versionEl.textContent = 'v' + version + ' — High: ' + displayHigh + ((typeof autoPauseEnabled !== 'undefined' && autoPauseEnabled) ? ' — Auto-pause: On' : ' — Auto-pause: Off') + ' • Press P to pause'; } catch (e) { /* ignore DOM errors */ }
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
            span.style.marginRight = '6px';
            span.style.fontSize = '18px';
            span.style.lineHeight = '1';
            span.setAttribute('aria-hidden', 'true');
            livesEl.appendChild(span);
          }
          // Show shield status via aria-label and body attribute; render a small visual badge in Lives HUD when active
          try {
            const now = Date.now();
            const charges = Math.max(0, (typeof player !== 'undefined' && typeof player.shieldCharges === 'number' ? player.shieldCharges : 0));
            // Remove any previous shield badge to avoid duplicates
            try { const old = livesEl.querySelector('#lives-shield-badge'); if (old && old.parentNode) old.parentNode.removeChild(old); } catch(e) {}
            if (typeof player !== 'undefined' && now < (player.shieldUntil || 0)) {
              try { livesEl.setAttribute('aria-label', lives + (lives === 1 ? ' life' : ' lives') + ' • Shield: ' + charges + (charges === 1 ? ' charge' : ' charges')); } catch(e) {}
              try { if (typeof document !== 'undefined' && document.body) { document.body.setAttribute('data-shield-active', 'true'); } } catch(e) {}
              // Visual shield badge: lightweight inline element showing shield icon + charges
              try {
                const shieldSpan = document.createElement('span');
                shieldSpan.id = 'lives-shield-badge';
                // Add class so CSS rules targeting .shield-badge apply consistently
                try { shieldSpan.className = 'shield-badge'; } catch(e) {}
                shieldSpan.setAttribute('aria-hidden','true');
                const sec = Math.max(0, Math.ceil(((player.shieldUntil || 0) - Date.now()) / 1000));
                shieldSpan.textContent = ' 🛡' + (charges > 0 ? (' x' + charges) : '') + (sec ? (' ' + sec + 's') : '');
                // Provide a concise tooltip and accessible label describing remaining time and charges
                try { shieldSpan.title = 'Shield: ' + (sec ? sec + 's' : '') + (charges ? (' • ' + charges + ' charges') : ''); } catch(e) {}
                try { shieldSpan.setAttribute('aria-label', 'Shield: ' + (sec ? sec + ' seconds' : '') + (charges ? (', ' + charges + ' charges') : '')); } catch(e) {}
                shieldSpan.style.marginLeft = '8px';
                shieldSpan.style.padding = '2px 6px';
                shieldSpan.style.borderRadius = '8px';
                shieldSpan.style.background = '#bbdefb';
                shieldSpan.style.color = '#012b30';
                shieldSpan.style.fontWeight = '700';
                shieldSpan.style.fontSize = '0.95em';
                try { livesEl.appendChild(shieldSpan); } catch(e) {}
              } catch(e) {}
            } else {
              try { livesEl.setAttribute('aria-label', lives + (lives === 1 ? ' life' : ' lives')); } catch(e) {}
              try { if (typeof document !== 'undefined' && document.body) { document.body.setAttribute('data-shield-active', 'false'); } } catch(e) {}
            }
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
            // Show total waves when configured so players understand remaining progression (e.g., "Wave: 2/6"). Mark the final wave clearly.
            let labelText = 'Wave: ' + n + ' ';
            try {
              if (typeof maxWaves === 'number' && maxWaves > 0) {
                if (n === maxWaves) {
                  labelText = 'Wave: ' + n + '/' + maxWaves + ' (Final) ';
                } else {
                  labelText = 'Wave: ' + n + '/' + maxWaves + ' ';
                }
              }
            } catch (e) {}
            waveEl.appendChild(document.createTextNode(labelText));
            const emoji = document.createElement('span');
            emoji.textContent = (typeof maxWaves === 'number' && maxWaves > 0 && n === maxWaves) ? '🏆' : '🌱';
            try { emoji.setAttribute('aria-hidden','true'); } catch (e) {}
            emoji.style.marginLeft = '6px';
            try { waveEl.appendChild(emoji); } catch(e) { /* ignore */ }
            // Small, always-visible waves-left hint appended to the Wave HUD so players immediately see progression toward the level goal.
            try {
              if (typeof maxWaves === 'number' && maxWaves > 0 && n < maxWaves) {
                const leftSpan = document.createElement('span');
                leftSpan.textContent = ' • ' + (maxWaves - n) + ' waves left';
                leftSpan.style.marginLeft = '8px';
                leftSpan.style.fontSize = '0.9em';
                try { leftSpan.setAttribute('aria-hidden','true'); } catch (e) {}
                try { waveEl.appendChild(leftSpan); } catch (e) {}
              }
            } catch(e) {}

            try {
              let ariaLabel = 'Wave: ' + n;
              try { if (typeof maxWaves === 'number' && maxWaves > 0) ariaLabel = 'Wave: ' + n + ' of ' + maxWaves + (n === maxWaves ? ' (Final)' : ''); } catch(e){}
              waveEl.setAttribute('aria-label', ariaLabel);
            } catch (err) {}
            // Also update the browser tab title so players can see progress when the tab is backgrounded
            try { document.title = 'Selfmade — Wave ' + n + ' — Score ' + (typeof score !== 'undefined' ? score : 0); } catch (e) {}
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
                // Show a brief transient toast to make wave transitions more visible (non-intrusive and accessible)
                try { showWaveToast('Wave ' + n + (typeof maxWaves === 'number' && maxWaves > 0 ? '/' + maxWaves : '') + ' starting'); } catch(e) {}
                // Audible chime for wave start to make progression more noticeable (respect soundEnabled and autoplay policies)
                try { if (typeof soundEnabled !== 'undefined' && soundEnabled) { try { ensureAudio(); } catch(e) {} try { playSound('wave'); } catch(e) {} } } catch(e) {}
              }
            } catch (e) { /* ignore pulse errors */ }
          } catch (e) { /* ignore DOM errors */ }
        } catch (e) { /* ignore DOM errors */ }
      }
      // Update enemies HUD if present
      if (enemiesEl) {
        try {
          // Count only enemies that belong to the current wave so HUD shows accurate remaining/total
          const present = (typeof enemies !== 'undefined' ? enemies.filter(function(e){ try { return e && e.wave === waveNumber; } catch(err){ return false; } }).length : 0);
          const total = (typeof currentWaveEnemyCount !== 'undefined' ? currentWaveEnemyCount : 0);
          enemiesEl.textContent = (total > 0 ? (present + '/' + total + ' left') : ((typeof enemies !== 'undefined' ? enemies.length : 0) + ' ' + ((typeof enemies !== 'undefined' && enemies.length === 1) ? 'Enemy' : 'Enemies')));
          // Show Next Wave button only when the current wave is cleared and the game is not over. This reduces UI clutter during active waves and makes progression clearer.
          try {
            if (nextWaveBtn) {
              try {
                const becomingVisible = (!nextWaveBtn._wasVisible && !gameOver && total > 0 && present === 0);
                if (!gameOver && total > 0 && present === 0) {
                  nextWaveBtn.style.display = '';
                  nextWaveBtn.setAttribute('aria-hidden', 'false');
                } else {
                  nextWaveBtn.style.display = 'none';
                  nextWaveBtn.setAttribute('aria-hidden', 'true');
                }
                // Announce when Next Wave becomes available for assistive tech (avoid repeating)
                try {
                  if (becomingVisible) {
                    const ann = getAutopauseAnnouncer();
                    if (ann) ann.textContent = 'Next wave available';
                    // Add a brief pulse animation to draw attention to the Next Wave button (respects reduced-motion via CSS)
                    try {
                      if (nextWaveBtn && nextWaveBtn.classList) {
                        nextWaveBtn.classList.add('next-wave-pulse');
                        setTimeout(function(){ try { nextWaveBtn.classList.remove('next-wave-pulse'); } catch(e) {} }, 900);
                      }
                    } catch(e){}
                  }
                } catch(e){}
                nextWaveBtn._wasVisible = (!gameOver && total > 0 && present === 0);
              } catch(e) {}
            }
          } catch (e) { /* ignore nextWaveBtn DOM errors */ }
        } catch (e) { /* ignore DOM errors */ }
      }
      // Update active power-up HUD if present
      try {
        if (activePowerEl) {
          const now = Date.now();
          let text = '';
          // Capture previous shield state to detect expiry for accessibility announcements
          const hadShield = (player && (player._lastShieldActive || 0) > now);
          if (player && now < (player.spreadUntil || 0)) {
            const s = Math.ceil(((player.spreadUntil || 0) - now) / 1000);
            text = '🌿 Spread (' + s + 's)';
          } else if (player && (player.fireRate > 1) && now < (player.fireRateUntil || 0)) {
            const s = Math.ceil(((player.fireRateUntil || 0) - now) / 1000);
            text = '⚡ Rapid (' + s + 's)';
          } else if (player && now < (player.shieldUntil || 0)) {
            const s = Math.ceil(((player.shieldUntil || 0) - now) / 1000);
            const charges = (player && typeof player.shieldCharges === 'number' && player.shieldCharges > 0) ? (' x' + player.shieldCharges) : '';
            text = '🛡 Shield' + charges + ' (' + s + 's)';
          } else if (player && now < (player.mulchUntil || 0)) {
            const s = Math.ceil(((player.mulchUntil || 0) - now) / 1000);
            text = '🌾 Mulch x' + (player.scoreMultiplier ? player.scoreMultiplier.toFixed(2) : '1.5') + ' (' + s + 's)';
          } else if (player && now < (player.slowUntil || 0)) {
            const s = Math.ceil(((player.slowUntil || 0) - now) / 1000);
            text = '🍃 Slow (' + s + 's)';
          } else {
            text = '';
          }
          try {
            // If shield just expired, announce to assistive tech and clear internal marker
            try {
              const _pa = document.getElementById('powerup-announcer');
              if (_pa && hadShield && !(player && now < (player.shieldUntil || 0))) {
                _pa.textContent = 'Shield expired';
              }
            } catch (e) {}
            // Update active power HUD without removing inner elements (preserve .power-label and .power-timer)
            try {
              let label = activePowerEl.querySelector('.power-label');
              if (!label) {
                label = document.createElement('span');
                label.className = 'power-label';
                activePowerEl.insertBefore(label, activePowerEl.firstChild);
              }
              label.textContent = text;
              activePowerEl.setAttribute('aria-hidden', text ? 'false' : 'true');
              // Update timer fill if present and we can compute remaining duration
              try {
                const timerFill = activePowerEl.querySelector('.power-timer .power-timer-fill');
                if (timerFill) {
                  let remaining = 0, total = 1000;
                  if (player && now < (player.shieldUntil || 0)) {
                    remaining = Math.max(0, (player.shieldUntil || 0) - now);
                    total = (player._shieldDuration && player._shieldDuration > 0) ? player._shieldDuration : 26000;
                  } else if (player && now < (player.fireRateUntil || 0)) {
                    remaining = Math.max(0, (player.fireRateUntil || 0) - now);
                    total = Math.max(remaining, 6000);
                  } else if (player && now < (player.spreadUntil || 0)) {
                    remaining = Math.max(0, (player.spreadUntil || 0) - now);
                    total = Math.max(remaining, 6000);
                  } else if (player && now < (player.mulchUntil || 0)) {
                    remaining = Math.max(0, (player.mulchUntil || 0) - now);
                    total = Math.max(remaining, 6000);
                  } else if (player && now < (player.slowUntil || 0)) {
                    remaining = Math.max(0, (player.slowUntil || 0) - now);
                    total = Math.max(remaining, 6000);
                  } else {
                    remaining = 0; total = 1000;
                  }
                  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
                  timerFill.style.width = pct + '%';
                }
              } catch (e) {}
            } catch (e) {}
            // Toggle a shield-active class when Shield is the current active power-up so CSS can add a subtle glow
            try {
              if (text && String(text).trim().indexOf('🛡') === 0) { activePowerEl.classList.add('shield-active'); }
              else { activePowerEl.classList.remove('shield-active'); }
            } catch(e) {}
            // Accessibility: expose active power-up as an aria-label so screen readers get a concise label, and set title for hover/tooltips
            try {
              if (text) {
                try { activePowerEl.setAttribute('aria-label', text); } catch(e) {}
                try { activePowerEl.title = text; } catch(e) {}
              } else {
                try { activePowerEl.removeAttribute('aria-label'); } catch(e) {}
                try { activePowerEl.removeAttribute('title'); } catch(e) {}
              }
            } catch(e) {}
            // Also update on-screen touch fire button to show active power-up icon for mobile discoverability.
            try {
              const touchFireBtn = document.getElementById('touch-fire');
              if (touchFireBtn) {
                if (text) {
                  // Prepend the power-up emoji to the fire button while preserving water icon
                  const emoji = (String(text).split(' ')[0] || '');
                  // If Shield is active, also include its charge count (e.g. "x2") so mobile players see how many absorbs remain
                  let suffix = '';
                  try {
                    if (String(text).trim().indexOf('🛡') === 0) {
                      const m = String(text).match(/x(\d+)/);
                      if (m && m[0]) suffix = ' ' + m[0];
                    }
                  } catch(e){}
                  touchFireBtn.textContent = '💧' + ' ' + emoji + (suffix ? (' ' + suffix.trim()) : '');
                  try { touchFireBtn.setAttribute('aria-label', 'Water / Fire — ' + text); } catch(e){}
                  try { touchFireBtn.title = 'Water plants' + ' · ' + text; } catch(e){}
                  // Add or remove a visual "shield-active" class on the touch fire button when Shield is active
                  try { if (String(text).trim().indexOf('🛡') === 0) touchFireBtn.classList.add('shield-active'); else touchFireBtn.classList.remove('shield-active'); } catch(e){}
                } else {
                  touchFireBtn.textContent = '💧';
                  try { touchFireBtn.setAttribute('aria-label', 'Water / Fire'); } catch(e){}
                  try { touchFireBtn.title = 'Water plants'; } catch(e){}
                  try { touchFireBtn.classList.remove('shield-active'); } catch(e){}
                }
              }
            } catch(e){}
            // Track last shield active timestamp for next update tick
            try { if (player) player._lastShieldActive = (player.shieldUntil || 0); } catch(e){}
          } catch (e) {}
        }
      } catch (e) { /* ignore HUD update errors */ }
      // Update wave progress HUD if present (defeated / total for current wave)
      if (waveProgressEl) {
        try {
          const total = (typeof currentWaveEnemyCount !== 'undefined' ? currentWaveEnemyCount : 0);
          const remaining = (typeof enemies !== 'undefined' ? enemies.filter(function(e){ try { return e && e.wave === waveNumber; } catch(err){ return false; } }).length : 0);
          const defeated = Math.max(0, total - remaining);
          let progressText = 'Progress: ' + defeated + '/' + total + (total > 0 ? ' (' + Math.round((defeated / total) * 100) + '%)' : '');
          try {
            if (typeof maxWaves === 'number' && maxWaves > 0) {
              const wavesLeft = Math.max(0, maxWaves - (typeof waveNumber === 'number' ? waveNumber : 0));
              progressText += ' • Waves left: ' + wavesLeft;
            }
          } catch (e) {}
          waveProgressEl.textContent = progressText;
          // If the current wave has just been cleared, show a brief toast so players notice the pause between waves and get a recovery moment.
          try {
            if (total > 0 && remaining === 0 && (typeof lastClearedWave === 'undefined' || lastClearedWave !== waveNumber)) {
              lastClearedWave = waveNumber;
              try {
                const bonusToast = 10 + (typeof lives === 'number' ? (lives * 5) : 0);
                try { showWaveToast('Wave ' + waveNumber + ' cleared! +' + bonusToast + ' pts'); } catch(e) {}
              } catch(e) {}
              try {
                // Celebratory flourish: brief screen shake + leaf/petal particles to make wave clear feel satisfying
                screenShake = Math.max(screenShake || 0, 6);
                const cx = (player && typeof player.x === 'number') ? player.x : Math.floor(cw/2);
                const cy = (player && typeof player.y === 'number') ? player.y - 20 : Math.floor(ch/2);
                for (let k = 0; k < 12; k++) {
                  particles.push({ x: cx, y: cy, vx: (Math.random()-0.5)*2.4, vy: -Math.random()*2, r: 2 + Math.random()*4, life: 360 + Math.random()*360, born: Date.now(), color: (Math.random() < 0.5 ? '#ffd54f' : '#a5d6a7'), petal: true });
                }
              } catch(e){}
              // If this was the configured final wave, pause progression and show a clear victory overlay so the run feels beatable
              try {
                if (typeof maxWaves === 'number' && maxWaves > 0 && waveNumber >= maxWaves) {
                  gameOver = true; // stop further automatic progression
                  try {
                    if (typeof overlay !== 'undefined' && overlay && overlayMessage) {
                      overlayMessage.textContent = 'Victory! You beat the garden — Final Score: ' + score + ' — Press R to play again or L to continue to next level';
                      try { setOverlayVisible(true); } catch(e){}
                      try { if (replayBtn) replayBtn.focus(); } catch(e){}
                      // Also show an explicit Continue button on the overlay so mobile and keyboard users have a discoverable control to advance to the next level.
                      try {
                        let cont = document.getElementById('continueBtn');
                        if (!cont) {
                          cont = document.createElement('button');
                          cont.id = 'continueBtn';
                          cont.type = 'button';
                          cont.textContent = 'Continue (Next Level)';
                          cont.title = 'Continue to next level';
                          cont.style.marginLeft = '8px';
                          cont.style.padding = '8px 12px';
                          cont.style.borderRadius = '10px';
                          cont.style.background = 'linear-gradient(135deg,#ffd54f,#ffb300)';
                          cont.style.color = '#2b2b00';
                          cont.style.border = 'none';
                          cont.style.fontWeight = '700';
                          cont.style.cursor = 'pointer';
                          try { overlay.appendChild(cont); } catch(e) {}
                          cont.addEventListener('click', function(){ try { continueToNextLevel(); } catch(e){} }, { passive: true });
                        } else {
                          try { cont.style.display = ''; } catch(e) {}
                        }
                      } catch(e) {}
                    }
                  } catch(e) {}
                }
              } catch(e) {}

              // Small pacing tweak: if player is low on lives, spawn a Shield near the player to aid recovery.
              try {
                if (typeof lives === 'number' && lives <= 1) {
                  const now = Date.now();
                  const hasShield = (player && now < (player.shieldUntil || 0));
                  if (!hasShield) {
                    const sx = (player && typeof player.x === 'number') ? player.x : Math.floor(cw/2);
                    const sy = Math.max(40, (player && typeof player.y === 'number') ? (player.y - 120) : Math.floor(ch * 0.2));
                    const nearbyShield = powerups.some(p => p && p.type === 'shield' && Math.abs((p.x||0) - sx) < 48 && Math.abs((p.y||0) - sy) < 48);
                    if (!nearbyShield) {
                      try { powerups.push({ x: sx, y: sy, vy: 0.06, type: 'shield', born: Date.now(), life: 12000 }); } catch(e){}
                      // Visual cue: briefly pulse the Lives HUD to draw attention to the newly spawned Shield
                      try { if (livesEl) { livesEl.classList.add('shield-spawn-pulse'); setTimeout(function(){ try{ livesEl.classList.remove('shield-spawn-pulse'); }catch(e){} }, 1000); } } catch(e){}
                      try { scorePopups.push({ x: sx, y: sy - 12, text: '🛡 Shield', vy: -0.04, life: 900, totalLife: 900, color: '#a5d6a7' }); } catch(e){}
                      try { playSound('shield'); } catch(e){}
                    }
                  }
                }
              } catch(e) {}
            }
          } catch(e) {}

          // Create or update a small visual progress bar under the progress text so players get at-a-glance feedback
          try {
            let bar = waveProgressEl.querySelector('.wave-bar');
            if (!bar) {
              bar = document.createElement('div');
              bar.className = 'wave-bar';
              // Accessible progressbar: expose wave progress to assistive tech
              bar.setAttribute('role', 'progressbar');
              bar.setAttribute('aria-valuemin', '0');
              bar.setAttribute('aria-valuemax', String(typeof total === 'number' ? total : 0));
              bar.setAttribute('aria-valuenow', String(typeof defeated === 'number' ? defeated : 0));
              // Provide an explicit, readable label for screen readers describing current wave progress and remaining waves when configured
              try {
                var wavesLeftLabel = '';
                try { if (typeof maxWaves === 'number' && maxWaves > 0) { wavesLeftLabel = ' • Waves left: ' + Math.max(0, maxWaves - (typeof waveNumber === 'number' ? waveNumber : 0)); } } catch(e) {}
                bar.setAttribute('aria-label', 'Wave progress: ' + defeated + ' of ' + total + wavesLeftLabel);
              } catch (e) {}
              bar.setAttribute('aria-hidden', 'false');
              const inner = document.createElement('div');
              inner.className = 'wave-bar-fill';
              inner.style.width = '0%';
              bar.appendChild(inner);
              try { waveProgressEl.appendChild(bar); } catch (e) { /* ignore append errors */ }
            }
            try {
              const fill = bar.querySelector('.wave-bar-fill');
              const pct = total > 0 ? Math.round((defeated / total) * 100) : 0;
              if (fill) fill.style.width = pct + '%';
              try { bar.setAttribute('aria-valuenow', String(typeof defeated === 'number' ? defeated : 0)); bar.setAttribute('aria-valuemax', String(typeof total === 'number' ? total : 0)); bar.setAttribute('aria-label', 'Wave progress: ' + defeated + ' of ' + total); } catch (e) {}
            } catch (e) { /* ignore fill update errors */ }
          } catch (e) { /* ignore progress bar DOM errors */ }
        } catch (e) { /* ignore DOM errors */ }
      }
    } catch (e) { /* ignore */ }
  }

  // Accessibility: announce wave changes to assistive tech
  if (waveEl) { try { waveEl.setAttribute('aria-live', 'polite'); waveEl.setAttribute('role', 'status'); } catch (e) {} }
  const version = '9.73.0';
  let score = 0;
  let highScore = (function(){ try { const v = parseInt(localStorage.getItem('selfmade_highscore')||'0', 10); return isNaN(v) ? 0 : Math.max(0, v); } catch (e) { return 0; } })();
  let lives = 3;
  let lastKillAt = 0;
  let killCombo = 0;
  let gameOver = false;

  // Debounced high score saver to reduce frequent localStorage writes when score updates rapidly
  let _highScoreSaveTimeout = null;
  function saveHighScoreDebounced(hs) {
    try {
      if (_highScoreSaveTimeout) clearTimeout(_highScoreSaveTimeout);
      _highScoreSaveTimeout = setTimeout(() => {
        try { localStorage.setItem('selfmade_highscore', hs); } catch (e) { /* ignore storage errors */ }
        _highScoreSaveTimeout = null;
      }, 2000);
    } catch (e) { /* ignore */ }
  }
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
      const TOUCH_HOLD_DELAY = 80; // reduced slightly for snappier mobile hold-to-fire (from 120ms)
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
  try {
    window.addEventListener('blur', () => {
      try {
        clearInputs(); pointerActive = false;
        // Auto-pause on blur when enabled so gameplay doesn't continue when user switches tabs or apps
        try {
          if (typeof autoPauseEnabled !== 'undefined' && autoPauseEnabled && typeof paused !== 'undefined' && !paused && typeof gameOver !== 'undefined' && !gameOver) {
            try { togglePause(true, 'blur'); } catch(e) {
              // Fallback: in rare cases where togglePause is unavailable, set paused flags conservatively
              try { paused = true; pausedByFocus = true; document.body.classList.add('auto-paused'); } catch(e2) {}
              try { if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); } } catch(e2) {}
            }
          }
        } catch (e) { /* ignore */ }
      } catch(e){}
    }, { passive: true });
    window.addEventListener('focusout', () => { try { clearInputs(); pointerActive = false; } catch(e){} }, { passive: true });

    // Also pause when the document becomes hidden (visibilitychange). This catches cases where blur
    // may not fire (mobile app switching, some browsers' tab handling). Only pause; do not auto-resume
    // here to avoid surprising the player when they return.
    try {
      document.addEventListener('visibilitychange', function() {
        try {
          if (document.hidden) {
            try { clearInputs(); pointerActive = false; } catch(e){}
            try {
              if (typeof autoPauseEnabled !== 'undefined' && autoPauseEnabled && typeof paused !== 'undefined' && !paused && typeof gameOver !== 'undefined' && !gameOver) {
                try { togglePause(true, 'visibility'); } catch(e) {
                  try { paused = true; pausedByFocus = true; document.body.classList.add('auto-paused'); } catch(e2){}
                  try { if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); } } catch(e2){}
                }
              }
            } catch(e){}
          }
        } catch(e){}
      }, { passive: true });
    } catch(e) {}
  } catch (e) { /* ignore */ }

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
  // Master gain node to allow immediate global mute/unmute (silences ongoing AudioNode outputs)
  let masterGain = null;
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
    // Ensure a master gain node exists so muting can silence ongoing sounds immediately
    try {
      if (audioCtx && !masterGain) {
        masterGain = audioCtx.createGain();
        try { masterGain.connect(audioCtx.destination); } catch(e) { /* ignore connect errors */ }
        try { masterGain.gain.setValueAtTime(soundEnabled ? 1 : 0, audioCtx.currentTime); } catch(e) { /* ignore timing errors */ }
      }
    } catch (e) { /* ignore masterGain creation errors */ }
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
    o.connect(g);
    try { if (masterGain) g.connect(masterGain); else g.connect(audioCtx.destination); } catch (e) { try { g.connect(audioCtx.destination); } catch(e){} }
    if (type === 'fire') { o.type = 'square'; o.frequency.setValueAtTime(880, now); g.gain.setValueAtTime(0.02, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12); }
    else if (type === 'hit') { o.type = 'sawtooth'; o.frequency.setValueAtTime(260, now); o.frequency.linearRampToValueAtTime(420, now + 0.06); g.gain.setValueAtTime(0.035, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22); }
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
    else if (type === 'shield-collect') {
      // Slightly brighter arpeggio for Shield pickup (distinct from absorb)
      o.type = 'sine';
      o.frequency.setValueAtTime(620, now);
      o.frequency.linearRampToValueAtTime(820, now + 0.10);
      g.gain.setValueAtTime(0.04, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
      o.start(now);
      o.stop(now + 0.28);
      // brief vibration to provide tactile feedback on shield pickup (respect prefers-reduced-motion)
      try { if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function' && !(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) navigator.vibrate(22); } catch (e) {}
      return;
    }
    else if (type === 'shield') {
      // Soft rising triangle chime for shield absorb events (keeps existing sound)
      o.type = 'triangle';
      o.frequency.setValueAtTime(520, now);
      o.frequency.linearRampToValueAtTime(780, now + 0.12);
      g.gain.setValueAtTime(0.035, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
      o.start(now);
      o.stop(now + 0.34);
      // Brief vibration on shield absorb for touch devices (respect prefers-reduced-motion)
      try { if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function' && !(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) navigator.vibrate(14); } catch (e) {}
      return;
    }
    else if (type === 'powerup') {
      // Bright ascending arpeggio for collecting power-ups
      o.type = 'sine';
      o.frequency.setValueAtTime(520, now);
      o.frequency.linearRampToValueAtTime(740, now + 0.06);
      o.frequency.linearRampToValueAtTime(960, now + 0.12);
      g.gain.setValueAtTime(0.035, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      o.start(now);
      o.stop(now + 0.28);
      // Brief vibration on power-up collect for touch devices (respect prefers-reduced-motion)
      try { if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function' && !(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) navigator.vibrate(18); } catch (e) {}
      return;
    }
    else if (type === 'explode') {
      // Short sharp oscillator for enemy death (satisfying, lightweight)
      o.type = 'square';
      o.frequency.setValueAtTime(360, now);
      o.frequency.linearRampToValueAtTime(600, now + 0.06);
      g.gain.setValueAtTime(0.04, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      o.start(now);
      o.stop(now + 0.18);
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
      try { if (masterGain && audioCtx) { masterGain.gain.setValueAtTime(soundEnabled ? 1 : 0, audioCtx.currentTime); } } catch(e) {}
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
          // Add a small help hint about manual Shield activation for discoverability
          try {
            let he = document.getElementById('help-extra-u');
            if (!he) {
              he = document.createElement('div');
              he.id = 'help-extra-u';
              he.textContent = 'Tip: Press U to activate a stored Shield charge.';
              he.style.marginTop = '6px';
              he.style.fontSize = '14px';
              he.style.opacity = '0.92';
              he.style.color = '#fff';
              try { overlay.appendChild(he); } catch(e){}
            } else {
              he.textContent = 'Tip: Press U to activate a stored Shield charge.';
            }
          } catch(e) {}
        } else {
          if (replayBtn) try { replayBtn.style.display = ''; } catch (err) {}
          if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); }
          // Remove help-extra hint when help closes
          try { const he = document.getElementById('help-extra-u'); if (he && he.parentNode) he.parentNode.removeChild(he); } catch(e) {}
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
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space' || e.key === 'k' || e.key === 'K' || e.key === 'z' || e.key === 'Z') {
      e.preventDefault();
      // Convenience: allow Space/K/Z to resume the game when paused (but not when game over).
      // Otherwise, when playing, Space/K/Z fires as before.
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
        if (paused) {
          try { clearInputs(); } catch (e) {}
          // Also clear any scheduled spawn timer so enemies don't unexpectedly spawn while paused
          try { if (typeof scheduledSpawnTimeout !== 'undefined' && scheduledSpawnTimeout) { clearTimeout(scheduledSpawnTimeout); scheduledSpawnTimeout = null; } } catch (e) {}
        }
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
      try { if (masterGain && audioCtx) { masterGain.gain.setValueAtTime(soundEnabled ? 1 : 0, audioCtx.currentTime); } } catch(e) {}
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
try { localStorage.setItem('selfmade_pause_on_blur', autoPauseEnabled ? '1' : '0'); } catch (err) { /* ignore storage errors */ }
      let announcer = getAutopauseAnnouncer();
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
      try {
        const present = (typeof enemies !== 'undefined' ? enemies.filter(function(en){ try { return en && en.wave === waveNumber; } catch(err){ return false; } }).length : 0);
        if (present === 0) {
          try { if (scheduledSpawnTimeout) { clearTimeout(scheduledSpawnTimeout); scheduledSpawnTimeout = null; } } catch(e){}
          try { lastSpawn = Date.now(); } catch(e){}
          try { spawnWave(); } catch (e) { /* ignore */ }
        } else {
          try { showWaveToast('Next wave unavailable — enemies remain'); } catch(e) {}
        }
      } catch(e) {}
    }
    // 'B' uses one stored Shield charge immediately (consumes a charge and grants a short shield)
    if (e.key === 'b' || e.key === 'B') {
      try {
        if (player && typeof player.shieldCharges === 'number' && player.shieldCharges > 0) {
          player.shieldCharges = Math.max(0, player.shieldCharges - 1);
          // grant a short immediate shield and brief invulnerability for clarity
          player.shieldUntil = Math.max(Date.now(), player.shieldUntil || 0) + 6000; // +6s
          player.invulnerableUntil = Date.now() + 1400;
          shieldPulseUntil = Date.now() + 800; shieldPulseX = player.x; shieldPulseY = player.y;
          try { playSound('shield'); } catch (e) {}
          try { showWaveToast('Shield activated'); } catch(e) {}
        } else {
          try { showWaveToast('No shield charges'); } catch(e) {}
        }
      } catch(e) {}
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
    // HUD visibility is toggled via the hudBtn click handler above. Keep the keydown handler lightweight and
    // avoid duplicating the detailed toggling logic here to prevent double-toggle behavior.
    // The keydown shortcut that invokes hudBtn.click() remains in place earlier in this function.

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

    // 'V' toggles the garden background on/off (persisted). Useful for accessibility or performance on low-end devices.
    if (e.key === 'v' || e.key === 'V') {
      try {
        const currently = (canvas && canvas.dataset && canvas.dataset.bgVisible === 'true');
        const show = !currently;
        if (show && gardenBackgroundAsset && gardenBackgroundAsset.ready) {
          try { canvas.style.backgroundImage = 'url("assets/images/garden-background.jpg")'; canvas.style.backgroundPosition = 'center top'; canvas.style.backgroundSize = 'cover'; } catch(e) {}
          try { canvas.dataset.bgVisible = 'true'; } catch(e) {}
          try { localStorage.setItem('selfmade_show_bg','1'); } catch(e) {}
        } else {
          try { canvas.style.backgroundImage = ''; } catch(e) {}
          try { canvas.dataset.bgVisible = 'false'; } catch(e) {}
          try { localStorage.setItem('selfmade_show_bg','0'); } catch(e) {}
        }
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
    // 'N' advances to the next wave when cleared (keyboard shortcut)
    if ((e.key === 'n' || e.key === 'N')) {
      try {
        if (!gameOver) {
          const present = (typeof enemies !== 'undefined' ? enemies.filter(function(en){ try { return en && en.wave === waveNumber; } catch(err){ return false; } }).length : 0);
          if (present === 0) {
            if (scheduledSpawnTimeout) { clearTimeout(scheduledSpawnTimeout); scheduledSpawnTimeout = null; }
            try { lastSpawn = Date.now(); } catch(e){}
            try { spawnWave(); } catch(e){}
          }
        }
      } catch(e) {}
    }
    // 'L' continues to next level when player has beaten the final configured wave
    if ((e.key === 'l' || e.key === 'L') && gameOver) {
      try {
        if (typeof maxWaves !== 'undefined' && maxWaves > 0 && waveNumber >= maxWaves) {
          try { continueToNextLevel(); } catch (err) {}
        }
      } catch (e) {}
    }
    // 'R' or Enter restarts the game when it's over (keyboard accessibility)
    if ((e.key === 'r' || e.key === 'R' || e.key === 'Enter') && gameOver) {
      if (replayBtn) { try { replayBtn.click(); } catch (err) { /* ignore click errors */ } }
    }
  });
  // Manual shield activation: press U to consume a stored shield charge and activate shield immediately
  window.addEventListener('keydown', e => {
    if ((e.key === 'u' || e.key === 'U') && !gameOver) {
      try {
        if (player && typeof player.shieldCharges === 'number' && player.shieldCharges > 0) {
          const now = Date.now();
          // grant ~8s of shield and decrement charges
          player.shieldUntil = Math.max(now, player.shieldUntil || 0) + 10000;
          try { player._shieldDuration = Math.max(0, (player.shieldUntil || 0) - now); } catch(e) { player._shieldDuration = 10000; }
          player.shieldCharges = Math.max(0, player.shieldCharges - 1);
          try { scorePopups.push({ x: player.x, y: player.y - 20, text: '🛡 Shield activated', vy: -0.04, life: 900, totalLife: 900, color: '#a5d6a7' }); } catch(e){}
          try { var _pa = document.getElementById('powerup-announcer'); if (_pa) _pa.textContent = 'Shield activated'; } catch(e){}
          try { playSound('shield-collect'); } catch(e){}
        }
      } catch (e) {}
    }
  });

  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); keys.left = false; }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); keys.right = false; }
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space' || e.key === 'k' || e.key === 'K' || e.key === 'z' || e.key === 'Z') { e.preventDefault(); keys.fire = false; }
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
      // Visual polish: apply a subtle dim/filter to the game canvas to make paused state more obvious.
      try { if (canvas && typeof canvas.style !== 'undefined') { canvas.style.filter = 'brightness(0.72) saturate(0.92)'; } } catch (e) { /* ignore */ }
    } else {
      overlay.setAttribute('role', 'status');
      overlay.removeAttribute('aria-modal');
      overlay.style.pointerEvents = 'none';
      overlay.removeAttribute('tabindex');
      try { document.body.classList.remove('paused'); } catch (e) { /* ignore */ }
      // Restore keyboard focus to the game canvas when the overlay hides so keyboard users can continue play immediately
      try { if (canvas && typeof canvas.focus === 'function') { canvas.focus(); } } catch (e) { /* ignore focus errors */ }
      // Remove any visual filter applied when paused so rendering returns to normal
      try { if (canvas && typeof canvas.style !== 'undefined') { canvas.style.filter = ''; } } catch (e) { /* ignore */ }
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
        overlayMessage.textContent = 'Help: ←/A and →/D to move; Space, K, or Z to fire; On touch, tap left/right edges to move and tap center to fire; P to pause; I or H to toggle this help. Also: O toggles auto-pause, M toggles sound, C toggles colorblind mode, G toggles garden grid, N advances to the next wave (developer/testing). Collect 🛡 shield power-ups to absorb enemy collisions for a short time.';
      } else if (gameOver) {
        // If the player has completed the configured set of waves, offer to continue to a harder loop
        if (typeof maxWaves !== 'undefined' && maxWaves > 0 && waveNumber >= maxWaves) {
          overlayMessage.textContent = 'Victory! You beat the garden — Final Score: ' + score + ' — Press R to play again or L to continue to next level';
        } else {
          overlayMessage.textContent = 'Game Over — Final Score: ' + score + ' — Waves: ' + (typeof waveNumber !== 'undefined' ? waveNumber : 0) + ' — Press R or click to play again';
        }
      } else if (pausedByFocus) {
        overlayMessage.textContent = 'Paused (lost focus) — Wave: ' + (typeof waveNumber !== 'undefined' ? waveNumber : 0) + ' — press Space, click or tap, or return to this tab to resume. Auto-pause is enabled; press O to toggle.';
        try { if (overlay) overlay.setAttribute('data-paused','true'); } catch (e) {}
      } else if (paused) {
        overlayMessage.textContent = 'Paused — Wave: ' + (typeof waveNumber !== 'undefined' ? waveNumber : 0) + ' — press P, Esc, or Space to resume';
        try { if (overlay) overlay.setAttribute('data-paused','true'); } catch (e) {}
      } else {
        overlayMessage.textContent = '';
        try { if (overlay) overlay.removeAttribute('data-paused'); } catch (e) {}
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
      // UI polish: hide the Next Wave button while the game is over to avoid confusing players on touch/keyboard
      try {
        const nextBtn = document.getElementById('nextWaveBtn');
        if (nextBtn) {
          if (gameOver) {
            nextBtn.style.display = 'none';
            try { nextBtn.setAttribute('aria-hidden','true'); } catch(e) {}
          } else {
            nextBtn.style.display = '';
            try { nextBtn.setAttribute('aria-hidden','false'); } catch(e) {}
          }
        }
      } catch (e) { /* ignore next-wave UI errors */ }

      // Announce auto-pause to assistive tech when overlay shows a paused message
      try {
        let ap = getAutopauseAnnouncer();
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
  // Prevent accidental double-clicks by temporarily disabling the button
  try { replayBtn.disabled = true; replayBtn.setAttribute('aria-disabled','true'); } catch (e) {}
  // Clear any pending auto-pause or spawn timeouts to avoid delayed pauses or stray spawns after a restart
  try { if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; } } catch (e) {}
  try { if (typeof scheduledSpawnTimeout !== 'undefined' && scheduledSpawnTimeout) { clearTimeout(scheduledSpawnTimeout); scheduledSpawnTimeout = null; } } catch (e) {}
  try { if (typeof _highScoreSaveTimeout !== 'undefined' && _highScoreSaveTimeout) { clearTimeout(_highScoreSaveTimeout); _highScoreSaveTimeout = null; } } catch (e) {}
  try { const t = document.getElementById('autopause-toast'); if (t && t.parentNode) t.parentNode.removeChild(t); } catch (e) {}

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
  // Clear temporary power-ups so restarting does not retain previous run's buffs
  try { player.fireRate = 1; player.fireRateUntil = 0; player.spreadUntil = 0; player.shieldUntil = 0; player.shieldCharges = 0; player.pierceUntil = 0; player.slowUntil = 0; player._lastShieldActive = 0; } catch (e) {}
  // Start the first wave immediately after restart so players don't wait for the automatic spawn
  try { spawnWave(); } catch (e) { /* ignore spawn errors */ }
  // If sound is enabled, ensure the AudioContext is available/resumed after a restart so sounds play reliably.
  try { if (soundEnabled) { ensureAudio(); } } catch (e) { /* ignore audio errors on some platforms */ }
  if (overlay) setOverlayVisible(false);
  // After restarting, restore keyboard focus to the canvas so users can continue with keys.
  try { if (canvas && typeof canvas.focus === 'function') { canvas.focus(); } } catch (err) { /* ignore focus errors */ }
  // Re-enable the button shortly after restart to avoid accidental double restarts
  try { setTimeout(() => { try { replayBtn.disabled = false; replayBtn.setAttribute('aria-disabled','false'); } catch (e) {} }, 600); } catch (e) {}
});

// Continue to next level without clearing score/lives — increase maxWaves and restart waves for a harder loop
function continueToNextLevel() {
  try {
    levelNumber = (typeof levelNumber === 'number' ? levelNumber + 1 : 2);
    maxWaves = (typeof maxWaves === 'number' ? maxWaves + 2 : 8);
    // Clear current enemies and effects but preserve score and lives so progression feels meaningful
    enemies.length = 0;
    bullets.length = 0;
    particles.length = 0;
    currentWaveEnemyCount = 0;
    lastClearedWave = 0;
    waveNumber = 0;
    lastSpawn = Date.now();
    gameOver = false;
    paused = false;
    if (overlay) setOverlayVisible(false);
    try { spawnWave(); } catch (e) {}
    try { if (soundEnabled) { ensureAudio(); } } catch (e) {}
    try { let ann = document.getElementById('wave-announcer'); if (ann) ann.textContent = 'Level ' + levelNumber + ' — New challenge!'; } catch (e){}
  } catch (e) { /* ignore continue errors */ }
}
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
  const AUTO_PAUSE_DEBOUNCE = 900; // ms used for blur/visibility auto-pause debounce (slightly increased to reduce accidental pauses)
  let paused = false;
  let pausedByFocus = false;
  let helpOpen = false;
  // whether we suspended the AudioContext in response to an auto-pause so we can resume on focus/visibility restore
  let suspendedAudioByFocus = false;
  let blurTimeout = null;
  let autoPauseHandlersAttached = false;
  // Centralized pause/resume helper used by blur/visibility handlers to avoid undefined function calls
  // and ensure consistent behavior (clear inputs, manage overlay, and suspend/resume audio when appropriate).
  function togglePause(forcePaused, reason) {
    try {
      const shouldPause = !!forcePaused;
      if (shouldPause) {
        // Enter paused state
        paused = true;
        if (reason === 'blur' || reason === 'visibility' || reason === 'pagehide') pausedByFocus = true;
        try { clearInputs(); } catch (e) {}
        try { pointerActive = false; } catch (e) {}
        try { if (typeof scheduledSpawnTimeout !== 'undefined' && scheduledSpawnTimeout) { clearTimeout(scheduledSpawnTimeout); scheduledSpawnTimeout = null; } } catch (e) {}
        try { document.body.classList.add('auto-paused'); } catch (e) {}
        // Try to suspend audio for autoplay-friendly behavior
        try {
          if (audioCtx && audioCtx.state === 'running') { audioCtx.suspend().catch(()=>{}); suspendedAudioByFocus = true; }
        } catch (e) {}
      } else {
        // Exit paused state (only auto-resume if pausedByFocus was set by a focus/visibility pause)
        paused = false;
        pausedByFocus = false;
        try { document.body.classList.remove('auto-paused'); } catch (e) {}
        try {
          if (suspendedAudioByFocus && audioCtx && audioCtx.state === 'suspended') {
            if (soundEnabled) { try { audioCtx.resume(); } catch (e) {} }
            suspendedAudioByFocus = false;
          }
        } catch (e) {}
      }
      try { if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); } } catch (e) {}
    } catch (e) { /* swallow to avoid introducing runtime errors */ }
  }
  // Track whether a pointer/touch is currently active (prevents auto-pausing while user is holding touch or pointer)
  let pointerActive = false;
  // When a touch is first detected, show low-contrast dashed guides for a short time so touch zones are discoverable.
  let showTouchGuidesUntil = 0;
  // Respect user's reduced-motion preference by disabling screen shake when requested.
  const prefersReducedMotion = (typeof window !== 'undefined') && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Preference: allow the user to disable auto-pause on blur/visibility (toggled with O). Defaults to enabled for safety.
  // Persist preference in localStorage ('1' = enabled, '0' = disabled)
  let autoPauseEnabled = (function(){ try { /* Read new key first, fall back to legacy key and migrate if needed */ const vNew = localStorage.getItem('selfmade_autopause'); if (vNew !== null) return vNew === '1'; const vOld = localStorage.getItem('selfmade_pause_on_blur'); if (vOld !== null) { try { localStorage.setItem('selfmade_autopause', vOld); } catch(e){} return vOld === '1'; } return true; } catch (e) { return true; } })();
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
try { localStorage.setItem('selfmade_pause_on_blur', autoPauseEnabled ? '1' : '0'); } catch (e) { /* ignore */ }
          // Announce the change to assistive tech
          let announcer = getAutopauseAnnouncer();
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

    // Ensure only a single Next Wave button exists (avoid duplicates created by legacy and HUD code)
    try {
      const nodes = document.querySelectorAll('#nextWaveBtn');
      if (nodes && nodes.length > 1) {
        for (let i = 1; i < nodes.length; i++) { try { nodes[i].parentNode && nodes[i].parentNode.removeChild(nodes[i]); } catch(e) {} }
      }
    } catch (e) { /* ignore */ }

    // Add a small 'Next Wave' button to the HUD to allow manual wave advancement if progression stalls.
    try {
      let nextBtn = document.getElementById('nextWaveBtn');
      if (!nextBtn) {
        nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.id = 'nextWaveBtn';
        nextBtn.textContent = 'Next Wave';
        nextBtn.title = 'Advance to the next wave (also shortcut: N)';
        nextBtn.style.marginLeft = '6px';
        nextBtn.setAttribute('aria-label','Advance to next wave');
        const uiEl = document.getElementById('ui') || document.body;
        try { uiEl.appendChild(nextBtn); } catch(e){}
        nextBtn.addEventListener('click', () => {
          try {
            if (gameOver) return;
            // Clear remaining enemies and spawn the next wave immediately
            enemies.length = 0;
            lastSpawn = 0;
            spawnWave();
          } catch (e) {}
        });
      }
    } catch (e) { /* ignore next-wave UI errors */ }
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
        try {
          // Flush debounced high score immediately to avoid losing it on quick navigations or tab close
          try { if (_highScoreSaveTimeout) { clearTimeout(_highScoreSaveTimeout); _highScoreSaveTimeout = null; } } catch (e) {}
          try { localStorage.setItem('selfmade_highscore', String(highScore || 0)); } catch (e) {}
        } catch (e) {}
        try { restoreTitle(); } catch (e) {}
      }, { passive: true });
    } catch (e) { /* ignore initialization errors */ }
  }
  // Auto-pause handlers consolidated later with guarded registration to avoid duplicate listeners.
  // The guarded block further down attaches blur/focus/visibility handlers exactly once.

  // Also handle pagehide (navigation, mobile back) to pause immediately when the page is being hidden or unloaded.
  // This helps mobile users and ensures backgrounded sessions are paused reliably.
  try {
    window.addEventListener('pagehide', (ev) => {
      if (!autoPauseEnabled) return;
      if (pointerActive) return; // don't pause while a pointer/touch is active
      try { if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; } } catch (e) {}
      if (!paused && !gameOver) {
        paused = true;
        pausedByFocus = true;
        try { document.body.classList.add('auto-paused'); } catch (e) { /* ignore */ }
        // clear transient inputs and suspend audio similar to blur-based auto-pause
        clearInputs();
        try { if (typeof scheduledSpawnTimeout !== 'undefined' && scheduledSpawnTimeout) { clearTimeout(scheduledSpawnTimeout); scheduledSpawnTimeout = null; } } catch (e) {}
        if (audioCtx && audioCtx.state === 'running') {
          try {
            const p = audioCtx.suspend();
            if (p && typeof p.then === 'function') {
              p.then(function(){ suspendedAudioByFocus = true; }).catch(function(){});
            } else {
              suspendedAudioByFocus = true;
            }
          } catch (e) { /* ignore suspend errors */ }
        }
        if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); }
      }
    }, { passive: true });
  } catch (e) { /* ignore pagehide availability issues */ }
  try {
    // pageshow complements pagehide and visibilitychange; it fires when a page is restored from bfcache
    // Resume auto-paused games when the page is shown again and the document/window has focus.
    window.addEventListener('pageshow', (ev) => {
      if (!autoPauseEnabled) return;
      if (pointerActive) return; // don't change state while user is interacting
      try { if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; } } catch (e) {}
      // Only auto-resume if we previously auto-paused due to focus/visibility loss
      if (pausedByFocus && !gameOver) {
        paused = false;
        pausedByFocus = false;
        try { document.body.classList.remove('auto-paused'); } catch (e) { /* ignore */ }
        // Resume audio if we suspended it due to auto-pause
        if (suspendedAudioByFocus && audioCtx && audioCtx.state === 'suspended') {
          if (soundEnabled) { try { audioCtx.resume(); } catch (e) {} }
          suspendedAudioByFocus = false;
        }
        if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); }
      }
    }, { passive: true });
  } catch (e) { /* ignore pageshow availability issues */ }
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
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Always clear inputs to prevent stuck controls when the page becomes hidden, even if auto-pause is disabled
      try { clearInputs(); } catch (e) { /* ignore */ }
      if (!autoPauseEnabled) return;
      // If pointer/touch interaction is active, don't auto-pause to avoid interrupting active play on touch-hold
      if (pointerActive) return;
      // Debounce visibility auto-pause to match blur behavior and avoid accidental pauses on quick tab switches
      if (!paused) {
        if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; }
        blurTimeout = setTimeout(() => {
          paused = true;
          pausedByFocus = true;
          try { document.body.classList.add('auto-paused'); } catch (e) { /* ignore */ }
          // Clear transient input state when auto-pausing to avoid stuck controls (keyboard, mouse, or touch)
          clearInputs();
          try { if (typeof scheduledSpawnTimeout !== 'undefined' && scheduledSpawnTimeout) { clearTimeout(scheduledSpawnTimeout); scheduledSpawnTimeout = null; } } catch (e) {}
          // If audio is playing, suspend it when auto-pausing so sounds don't continue in background
          if (audioCtx && audioCtx.state === 'running') {
            try {
              const p = audioCtx.suspend();
              if (p && typeof p.then === 'function') {
                p.then(function(){ suspendedAudioByFocus = true; }).catch(function(){});
              } else {
                suspendedAudioByFocus = true;
              }
            } catch (e) { /* ignore suspend errors */ }
          }
          // Persist a small snapshot of the current run so a quick tab switch doesn't lose progress
          try {
            try { localStorage.setItem('selfmade_last_score', String(typeof score !== 'undefined' ? score : 0)); } catch (e) { /* ignore */ }
            try { localStorage.setItem('selfmade_last_wave', String(typeof waveNumber !== 'undefined' ? waveNumber : 0)); } catch (e) { /* ignore */ }
          } catch (e) { /* ignore storage errors */ }
          if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(true); updateOverlayMessage(); }
          try {
            let ap = document.getElementById('autopause-announcer');
            if (!ap) {
              ap = document.createElement('div');
              ap.id = 'autopause-announcer';
              ap.style.position = 'absolute'; ap.style.left = '-9999px'; ap.style.width = '1px'; ap.style.height = '1px';
              ap.setAttribute('aria-live', 'assertive'); ap.setAttribute('aria-atomic', 'true');
              try { document.body.appendChild(ap); } catch(e){}
            }
            try { ap.textContent = 'Auto-paused (lost focus)'; } catch(e){}
          } catch(e) {}
          blurTimeout = null;
        }, AUTO_PAUSE_DEBOUNCE);
      }
    } else {
      if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; }
      // Only auto-resume when the document actually has focus. Some platforms fire visibilitychange
      // when the page becomes visible but the tab or window isn't focused; avoid accidental unpauses.
      try {
        if (typeof document.hasFocus === 'function' && !document.hasFocus()) {
          // Keep pausedByFocus true so focus event or user interaction will resume the game.
          return;
        }
      } catch (e) { /* ignore hasFocus check errors */ }
      var wasPausedByFocus = pausedByFocus;
      if (wasPausedByFocus && !gameOver) {
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
      // Announce resume with a small transient toast and ARIA announcement when auto-resuming due to visibility change
      try {
        if (wasPausedByFocus && !gameOver) {
          try { showWaveToast('Resumed — Wave ' + (typeof waveNumber !== 'undefined' ? waveNumber : 0) + ' • Score ' + (typeof score !== 'undefined' ? score : 0)); } catch(e) {}
          try {
            let ap = document.getElementById('autopause-announcer');
            if (!ap) {
              ap = document.createElement('div'); ap.id = 'autopause-announcer'; ap.style.position = 'absolute'; ap.style.left = '-9999px'; ap.style.width = '1px'; ap.style.height = '1px'; ap.setAttribute('aria-live','assertive'); ap.setAttribute('aria-atomic','true'); try{ document.body.appendChild(ap); } catch(e) {}
            }
            try { ap.textContent = 'Resumed'; } catch(e) {}
          } catch(e) {}
        }
      } catch(e) {}
      if (typeof overlay !== 'undefined' && overlay) {
        setOverlayVisible(paused || gameOver);
        updateOverlayMessage();
        // Clear any stale overlay message after auto-resume to avoid lingering ARIA announcements
        if (!paused && !gameOver && typeof overlayMessage !== 'undefined' && overlayMessage) { try { overlayMessage.textContent = ''; } catch (e) {} }
      }
    }
  });

  // Also handle window blur/focus for cases where document.hidden isn't triggered but the window loses focus.
  // Debounced to match visibility behavior and avoid accidental pauses during quick alt-tab or window switching.
  try { if (typeof autoPauseHandlersAttached !== 'undefined' && autoPauseHandlersAttached) { /* auto-pause handlers already attached; skip duplicate registration */ } else { autoPauseHandlersAttached = true; 
    // Also pause when the pointer leaves the window (desktop/mouse). Some browsers fire mouseout with relatedTarget==null when leaving the page.
    try { window.addEventListener('mouseout', (e) => {
      try {
        if (!autoPauseEnabled) return;
        // relatedTarget is null when the pointer leaves the window; debounce to avoid accidental pauses
        if (e && e.relatedTarget === null) {
          if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; }
          blurTimeout = setTimeout(() => {
            blurTimeout = null;
            if (!paused && !gameOver) {
              paused = true;
              pausedByFocus = true;
              try { document.body.classList.add('auto-paused'); } catch (e) {}
              if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); }
            }
          }, AUTO_PAUSE_DEBOUNCE);
        }
      } catch (e) { /* ignore mouseout handler errors */ }
    }, { passive: true }); } catch(e) { /* ignore addEventListener errors */ }
    window.addEventListener('blur', () => {
      if (!autoPauseEnabled) return;
      if (pointerActive) return; // don't pause while interacting
      if (!paused) {
        if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; }
        blurTimeout = setTimeout(() => {
          paused = true;
          pausedByFocus = true;
          try { document.body.classList.add('auto-paused'); } catch (e) { /* ignore */ }
          clearInputs();
          if (audioCtx && audioCtx.state === 'running') {
            try {
              const p = audioCtx.suspend();
              if (p && typeof p.then === 'function') {
                p.then(function(){ suspendedAudioByFocus = true; }).catch(function(){});
              } else {
                suspendedAudioByFocus = true;
              }
            } catch (e) { /* ignore */ }
          }
          if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(true); updateOverlayMessage(); }
          // Create a small transient autopause toast for mobile discoverability. Click/tap to resume when paused by focus/visibility.
          try {
            let t = document.getElementById('autopause-toast');
            if (!t) {
              t = document.createElement('div');
              t.id = 'autopause-toast';
              // Make this toast keyboard-focusable and operable like a button for screen-reader and keyboard users
              t.setAttribute('role','button');
              t.setAttribute('tabindex','0');
              t.setAttribute('aria-label','Resume game (press Enter or Space)');
              t.setAttribute('aria-live','assertive');
              t.style.position = 'fixed'; t.style.left = '50%'; t.style.bottom = '12px'; t.style.transform = 'translateX(-50%)';
              t.style.background = 'rgba(0,0,0,0.88)'; t.style.color = '#fff'; t.style.padding = '10px 14px';
              t.style.borderRadius = '10px'; t.style.zIndex = '10004'; t.style.fontSize = '14px';
              t.style.cursor = 'pointer'; t.style.pointerEvents = 'auto';
              try { document.body.appendChild(t); try { t.focus(); } catch(e) {} } catch (e) {}
              // Click handler: resume when tapped/clicked
              t.addEventListener('click', function(){ try { if (paused && pausedByFocus && !gameOver) { paused = false; pausedByFocus = false; try { if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); } } catch(e){} try { if (canvas && typeof canvas.focus === 'function') canvas.focus(); } catch(e){} } } catch(e){} });
              // Keyboard handler: allow Enter / Space to activate the toast when focused
              t.addEventListener('keydown', function(ev){ try { if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') { ev.preventDefault(); try { t.click(); } catch(e){} } } catch(e){} });
            }
            try { t.textContent = 'Auto-paused — Tap or press Enter/Space to resume'; try { t.focus(); } catch(e) {} } catch(e){}
            // Auto-remove after a short delay so it doesn't linger
            setTimeout(()=>{ try { let nt = document.getElementById('autopause-toast'); if (nt && nt.parentNode) nt.parentNode.removeChild(nt); } catch(e){} }, 2800);
          } catch (e) { /* ignore toast injection errors */ }

          try {
            let ap = document.getElementById('autopause-announcer');
            if (!ap) {
              ap = document.createElement('div');
              ap.id = 'autopause-announcer';
              ap.style.position = 'absolute'; ap.style.left = '-9999px'; ap.style.width = '1px'; ap.style.height = '1px';
              ap.setAttribute('aria-live', 'assertive'); ap.setAttribute('aria-atomic', 'true');
              try { document.body.appendChild(ap); } catch(e){}
            }
            try { ap.textContent = 'Auto-paused (lost focus)'; } catch(e){}
          } catch(e) {}

          blurTimeout = null;
        }, AUTO_PAUSE_DEBOUNCE);
      }
    }, { passive: true });

    window.addEventListener('focus', () => {
      if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; }
      try { if (typeof document.hasFocus === 'function' && !document.hasFocus()) return; } catch (e) {}
      if (pausedByFocus && !gameOver) {
        paused = false;
      }
      pausedByFocus = false;
      if (suspendedAudioByFocus && audioCtx && audioCtx.state === 'suspended') {
        if (soundEnabled) { try { audioCtx.resume(); } catch (e) { /* ignore */ } }
        suspendedAudioByFocus = false;
      }
      if (typeof overlay !== 'undefined' && overlay) {
        setOverlayVisible(paused || gameOver);
        updateOverlayMessage();
        if (!paused && !gameOver && typeof overlayMessage !== 'undefined' && overlayMessage) { try { overlayMessage.textContent = ''; } catch (e) {} }
      }
      // Remove any transient autopause toast that might have been added while the page was hidden
      try { let t = document.getElementById('autopause-toast'); if (t && t.parentNode) t.parentNode.removeChild(t); } catch (e) { /* ignore */ }
      try { if (canvas && typeof canvas.focus === 'function') { canvas.focus(); } } catch (e) {}
    }, { passive: true });

    // Pageshow: when a page is restored from the bfcache (back-forward cache), some browsers do not fire focus/visibility events as expected.
    // Ensure the game resumes cleanly when the page is restored by treating pageshow like a focus/resume event.
    try {
      window.addEventListener('pageshow', (ev) => {
        try {
          if (ev && ev.persisted) {
            // If we auto-paused due to focus loss and the page was restored from bfcache, resume reliably
            if (pausedByFocus && !gameOver) {
              paused = false;
            }
            pausedByFocus = false;
            if (suspendedAudioByFocus && audioCtx && audioCtx.state === 'suspended') {
              if (soundEnabled) { try { audioCtx.resume(); } catch (e) { /* ignore */ } }
              suspendedAudioByFocus = false;
            }
            if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(paused || gameOver); updateOverlayMessage(); }
            try { let t = document.getElementById('autopause-toast'); if (t && t.parentNode) t.parentNode.removeChild(t); } catch (e) {}
            try { if (canvas && typeof canvas.focus === 'function') { canvas.focus(); } } catch (e) {}
          }
        } catch (e) { /* ignore pageshow handler errors */ }
      }, { passive: true });
    } catch (e) { /* ignore pageshow availability errors */ }
    }
  } catch (e) { /* ignore focus/blur availability */ }

  // Duplicate pagehide handler removed — consolidated earlier pagehide/visibility handlers handle pausing and cleanup.


  player = { x: cw/2, y: ch - 80, w: 40, h: 22, speed: 6, cooldown: 0, fireRate: 1, fireRateUntil: 0, shieldUntil: 0, shieldCharges: 0, spreadUntil: 0 };
  let lastFireFlashUntil = 0;
  const bullets = [], enemies = [], particles = [], scorePopups = [], powerups = [], hitMarkers = []; let screenShake = 0; let hitStopUntil = 0; let canvasHitFlashX = 0, canvasHitFlashY = 0; let shieldPulseUntil = 0, shieldPulseX = 0, shieldPulseY = 0; lastKillAt = 0; killCombo = 0;
  // transient visual pulse when a power-up is collected
  let powerupPulseUntil = 0;
  let shieldNearbyHintUntil = 0;
  let lastPowerupColor = '';
  let lastSpawn = 0; let waveNumber = 0; let currentWaveEnemyCount = 0; let lastClearedWave = 0; let waveSpawnWatchdog = 0; let waveStartGraceUntil = 0; let maxWaves = 8; let levelNumber = 1; let scheduledSpawnTimeout = null;
  // Clean up pending timers on page unload to avoid timers firing after unload (stability)
  try {
    window.addEventListener('beforeunload', () => {
      try { if (scheduledSpawnTimeout) { clearTimeout(scheduledSpawnTimeout); scheduledSpawnTimeout = null; } } catch (e) {}
      try { if (typeof _highScoreSaveTimeout !== 'undefined' && _highScoreSaveTimeout) { clearTimeout(_highScoreSaveTimeout); _highScoreSaveTimeout = null; } } catch (e) {}
      try { if (resizeTimeout) { clearTimeout(resizeTimeout); resizeTimeout = null; } } catch (e) {}
      try { if (typeof hitPopTimeout !== 'undefined' && hitPopTimeout) { clearTimeout(hitPopTimeout); hitPopTimeout = null; } } catch (e) {}
      try { if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; } } catch (e) {}
      try { if (audioCtx && audioCtx.state === 'running') { try { audioCtx.suspend(); suspendedAudioByFocus = true; } catch(e){} } } catch (e) {}
    }, { passive: true });

    // Also handle pagehide (bfcache/unload alternative) to ensure timers are cleared and audio suspended reliably on mobile/embedded browsers.
    try {
      window.addEventListener('pagehide', () => {
        try { if (scheduledSpawnTimeout) { clearTimeout(scheduledSpawnTimeout); scheduledSpawnTimeout = null; } } catch (e) {}
        try { if (typeof _highScoreSaveTimeout !== 'undefined' && _highScoreSaveTimeout) { clearTimeout(_highScoreSaveTimeout); _highScoreSaveTimeout = null; } } catch (e) {}
        try { if (resizeTimeout) { clearTimeout(resizeTimeout); resizeTimeout = null; } } catch (e) {}
        try { if (typeof hitPopTimeout !== 'undefined' && hitPopTimeout) { clearTimeout(hitPopTimeout); hitPopTimeout = null; } } catch (e) {}
        try { if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; } } catch (e) {}
        try { if (audioCtx && audioCtx.state === 'running') { try { audioCtx.suspend(); suspendedAudioByFocus = true; } catch(e){} } } catch (e) {}
      }, { passive: true });
    } catch(e) {}
  } catch (e) { /* ignore unload handler errors */ }

  // Kick off the first wave immediately so HUD shows an active wave on load
  let wavePulseUntil = 0;
  let livesPulseUntil = 0;
  let livesFlashUntil = 0;
  let canvasHitFlashUntil = 0;
  let canvasWhiteFlashUntil = 0;
  let canvasPlayerHitFlashUntil = 0;
let hitPopTimeout = null;

  spawnWave();
  // Focus the canvas on initial load so keyboard users can play without extra click
  try { if (canvas && typeof canvas.focus === 'function') { canvas.focus(); } } catch (e) { /* ignore focus errors */ }

  function spawnWave() {
    waveNumber++;
    try { lastSpawn = Date.now(); } catch (e) {}
    try { waveSpawnWatchdog = Date.now(); } catch (e) {}
    // briefly show a wave banner so players notice wave transitions
    wavePulseUntil = Date.now() + 1200;
    // Give players a short grace period at the start of each wave where enemies move slightly slower to improve beatability
    try {
      // Slightly longer grace for very early waves so new players have more reaction time
      let graceMs = (typeof waveNumber === 'number' && waveNumber <= 3) ? 2000 : 1100;
      // If this is the configured final wave, give an extra grace moment so the finale feels achievable
      try { if (typeof maxWaves === 'number' && maxWaves > 0 && waveNumber >= maxWaves) { graceMs += 1200; } } catch (e) {}
      // Extra breathing room when player is critically low on lives to improve beatability
      try { if (typeof lives === 'number' && lives <= 1) { graceMs += 800; } } catch (e) {}
      waveStartGraceUntil = Date.now() + graceMs;
    } catch (e) {}
  // small, optional screen shake to emphasize wave start (skip for reduced-motion users)
  try {
    if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('wave-shake');
      setTimeout(function(){ try { document.body.classList.remove('wave-shake'); } catch(e){} }, 560);
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
    // Base spawn count scales with wave; slightly reduce count on the final configured wave to keep it beatable
    let baseCount = (typeof waveNumber === 'number' && waveNumber <= 3) ? 4 + Math.min(5, Math.floor(waveNumber * 0.6)) : 5 + Math.min(10, Math.floor(waveNumber * 0.55));
    const isFinalWave = (typeof maxWaves === 'number' && maxWaves > 0 && waveNumber >= maxWaves);
    const count = Math.max(1, Math.round(baseCount * (isFinalWave ? 0.75 : 1)));
    const beforeWaveEnemies = enemies.length;
    for (let i=0;i<count;i++) {
      const ex = 40 + Math.random() * (cw-80);
      const ey = -20 - Math.random()*200;
      let speed = Math.min(3.2, 0.6 + Math.random()*1.2 + waveNumber*0.03);
      try { if (typeof lives === 'number' && lives <= 1) { speed = Math.max(0.45, speed * 0.82); } } catch(e){}
      // Small chance to spawn a zigging "hopper" enemy that oscillates horizontally for visual and gameplay variety
      // Increase visibility of zigging "hopper" enemies so players notice new behavior more often
      const isZig = Math.random() < Math.min(0.35, 0.08 + waveNumber*0.025);
      // Small chance for a "charger" enemy type: drifts horizontally and occasionally charges downward
      const isCharger = Math.random() < Math.min(0.12, 0.03 + waveNumber*0.01);
      // Small chance for a slow, high-HP "snail" enemy (garden-themed slow mover)
      const isSnail = Math.random() < Math.min(0.12, 0.02 + waveNumber*0.01);
      // Small chance for a "pest" enemy that splits into two mini pests on death
      const isBee = Math.random() < Math.min(0.12, 0.03 + waveNumber*0.02);
      // Small chance for a "moth" enemy that sways horizontally in a sinuous pattern
      // Increased base chance and cap so moths are more noticeable without changing difficulty much
      const isMoth = Math.random() < Math.min(0.55, 0.18 + waveNumber*0.035);
      // Small chance for a "sprout" enemy (small garden sprout, low HP, green-themed)
      const isSprout = Math.random() < Math.min(0.12, 0.03 + waveNumber*0.015);
      // Small chance for a "hopper" enemy that performs lateral hops for visual variety
      const isHopper = Math.random() < Math.min(0.22, 0.06 + waveNumber*0.015);
      const isPest = Math.random() < Math.min(0.12, 0.02 + waveNumber*0.01);
       const isCaterpillar = Math.random() < Math.min(0.1, 0.02 + waveNumber*0.01);
      // Small chance for a slow, short-burst "beetle" enemy: slightly tougher scuttling bug
      const isBeetle = Math.random() < Math.min(0.20, 0.02 + waveNumber*0.012);
      // Small chance for a "snatcher" enemy: medium enemy that periodically dashes toward the player
      const isSnatcher = Math.random() < Math.min(0.08, 0.02 + waveNumber*0.01);
      if (isZig) {
        const hpVal = 1 + Math.floor(waveNumber/3);
        enemies.push({x:ex,y:ey,w:34,h:30,vy:speed*0.9, hp:hpVal, maxHp:hpVal, type:'zig', t: Math.random()*1000});
      } else if (isCharger) {
        // charger: slower base descent, has a baseVy, a countdown to its next charge, and a charging flag
        const hpVal = 1 + Math.floor(waveNumber/3);
        enemies.push({x:ex,y:ey,w:32,h:34,vy:speed*0.7, baseVy: speed*0.7, vx:0, hp:hpVal, maxHp:hpVal, type:'charger', chargeTimer: 800 + Math.random()*1200, charging: false, t: Math.random()*1000});
      } else if (isSnail) {
        // snail: slow descent, larger size, more HP, gentle horizontal wiggle
        const hpVal = 2 + Math.floor(waveNumber/4);
        enemies.push({x:ex,y:ey,w:40,h:36,vy:speed*0.45, baseVy: speed*0.45, vx: (Math.random()-0.5)*0.6, hp:hpVal, maxHp:hpVal, type:'snail', t: Math.random()*1000});
      } else if (isBee) {
        // bee: small, fast, slight homing towards player
        enemies.push({x:ex,y:ey,w:20,h:18,vy:speed*1.5, hp:1, maxHp:1, type:'bee', t: Math.random()*1000});
      } else if (isMoth) {
        // moth: medium descent, sinuous horizontal motion for visual variety
        enemies.push({x:ex,y:ey,w:28,h:26,vy:speed*0.85, hp:1, maxHp:1, type:'moth', swayAmp:10 + Math.random()*6, swayFreq: 0.01 + Math.random()*0.01, t: Math.random()*1000});
      } else if (isHopper) {
        // hopper: medium descent, performs lateral hops for visual and gameplay variety
        enemies.push({x:ex,y:ey,w:28,h:24,vy:speed*0.9, vx:0, hp:1, maxHp:1, type:'hopper', hopTimer: 360 + Math.random()*420, hopStrength: 2.4 + Math.random()*1.8, t: Math.random()*1000});
      } else if (isSprout) {
        // sprout: small garden sprout, slightly slow, low HP, subtle horizontal drift
        enemies.push({x:ex,y:ey,w:22,h:20,vy:speed*0.65, vx:(Math.random()-0.5)*0.4, hp:1, maxHp:1, type:'sprout', t: Math.random()*1000});
      } else if (isPest) {
        // pest: medium speed, low HP, splits into two mini pests on death
        enemies.push({x:ex,y:ey,w:26,h:22,vy:speed*0.95, hp:1, maxHp:1, type:'pest'});
      } else if (isBeetle) {
        // beetle: scuttling armored bug, slightly tougher with periodic lateral bursts
        enemies.push({x:ex,y:ey,w:30,h:26,vy:speed*0.85, vx:(Math.random()-0.5)*0.4, hp:2, maxHp:2, type:'beetle', scuttleTimer: 600 + Math.random()*800, t: Math.random()*1000});
      } else if (isSnatcher) {
        // snatcher: medium speed, telegraphed dashes toward the player (garden-themed vine snatcher)
        enemies.push({x:ex,y:ey,w:28,h:24,vy:speed*0.85, vx:0, hp:1, maxHp:1, type:'snatcher', huntTimer: 900 + Math.random()*800, t: Math.random()*1000});
      } else if (isCaterpillar) {
        // caterpillar: slow, sinuous mover that sheds leaf particles occasionally
        const hpVal = 1;
        enemies.push({x:ex,y:ey,w:34,h:20,vy:speed*0.65, baseVy: speed*0.65, vx:0, hp:hpVal, maxHp:hpVal, type:'caterpillar', t: Math.random()*1000});
      } else {
        const hpVal = 1 + Math.floor(waveNumber/4);
        if (Math.random() < Math.min(0.06, 0.02 + waveNumber*0.01)) { enemies.push({x:ex,y:ey,w:24,h:20,vy:speed*0.8, baseVy: speed*0.8, vx:0, hp:2, maxHp:2, type:'ladybug', hopTimer: 500 + Math.random()*700, t: Math.random()*1000}); }
        if (Math.random() < 0.08) { enemies.push({x:ex,y:ey,w:26,h:22,vy:speed*0.9, vx:(Math.random()-0.5)*0.4, hp:1, maxHp:1, type:'weevil', t: Math.random()*1000, baseVy: speed*0.9}); } else { enemies.push({x:ex,y:ey,w:30,h:28,vy:speed, hp:hpVal, maxHp:hpVal}); }
      }
    }
    // Immediate sanity check: ensure the intended number of new enemies were added.
    // Occasionally branching or transient errors can cause fewer spawns than intended; fill the deficit immediately for stable wave behavior.
    try {
      const newAdded = enemies.length - beforeWaveEnemies;
      let deficit = Math.max(0, count - newAdded);
      for (let j = 0; j < deficit; j++) {
        const ex2 = 40 + Math.random() * (cw - 80);
        const ey2 = -20 - Math.random() * 160;
        enemies.push({ x: ex2, y: ey2, w: 30, h: 28, vy: 0.9, hp: 1, maxHp: 1 });
      }
      // Re-check immediately and do a small capped retry if still short; this guards against rare branching issues
      const stillAdded = enemies.length - beforeWaveEnemies;
      deficit = Math.max(0, count - stillAdded);
      if (deficit > 0) {
        for (let j = 0; j < Math.min(deficit, 3); j++) {
          const ex3 = 40 + Math.random() * (cw - 80);
          const ey3 = -20 - Math.random() * 160;
          enemies.push({ x: ex3, y: ey3, w: 30, h: 28, vy: 0.9, hp: 1, maxHp: 1 });
        }
      }
    } catch (e) {}
    try {
      currentWaveEnemyCount = enemies.length - beforeWaveEnemies;
      // Ensure the reported target is at least the intended spawn count so waves can't report a smaller total
      if (typeof currentWaveEnemyCount !== 'number' || currentWaveEnemyCount < count) {
        currentWaveEnemyCount = count;
      }
    } catch (e) { currentWaveEnemyCount = count; }
    try { for (let i = beforeWaveEnemies; i < enemies.length; i++) { try { enemies[i].wave = waveNumber; } catch(e){} } } catch(e){}
    try { let waveAnnEl = document.getElementById('wave-announcer'); if (waveAnnEl) { try { waveAnnEl.textContent = 'Wave ' + waveNumber + ' starting. Defeat ' + currentWaveEnemyCount + ' enemies.'; } catch(e){} } } catch(e) {}
    // Pulse the DOM wave HUD briefly to draw attention (CSS handles animation).
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
      // Make the final configured wave more obvious: label it "Final Wave" and tint the toast slightly for visibility
      try {
        const isFinal = (typeof maxWaves === 'number' && maxWaves > 0 && waveNumber >= maxWaves);
        if (isFinal) {
          wt.textContent = 'Final Wave — Defeat ' + currentWaveEnemyCount + ' enemies';
          try { wt.style.background = '#fff8e1'; wt.style.color = '#4e2b00'; } catch (e) {}
          try { var waveAnnEl = document.getElementById('wave-announcer'); if (waveAnnEl) waveAnnEl.textContent = 'Final wave starting.'; } catch (e) {}
        } else {
          wt.textContent = 'Wave ' + waveNumber + ' — Defeat ' + currentWaveEnemyCount + ' enemies';
        }
      } catch (e) {
        wt.textContent = 'Wave ' + waveNumber + ' — Defeat ' + currentWaveEnemyCount + ' enemies';
      }
      // show briefly then hide
      try { wt.style.opacity = '1'; wt.style.transform = 'translateX(-50%) translateY(0)'; } catch(e){}
      setTimeout(() => { try { wt.style.opacity = '0'; wt.style.transform = 'translateX(-50%) translateY(-8px)'; } catch(e){} }, 900);
      setTimeout(() => { try { if (wt && wt.parentNode) wt.parentNode.removeChild(wt); } catch(e){} }, 1400);

      // Gameplay tweak: spawn a guaranteed Shield power-up every 2 waves to improve recovery options.
      try {
        if (typeof waveNumber === 'number' && (waveNumber > 0) && ((waveNumber % 2) === 0)) {
          const spawnX = Math.max(60, Math.min(cw - 60, Math.floor(cw / 2 + (Math.random() - 0.5) * 120)));
          const spawnY = -20;
          const nearbyShield = powerups.some(p => p && p.type === 'shield' && Math.abs((p.x||0) - spawnX) < 48 && Math.abs((p.y||0) - spawnY) < 48);
          if (!nearbyShield) {
            if (powerups.length < 6) {
              powerups.push({ x: spawnX, y: spawnY, vy: 0.06, type: 'shield', born: Date.now(), life: 12000 });
              if (powerups.length > 8) powerups.shift();
              try { playSound('shield'); } catch(e){}
              try { scorePopups.push({ x: spawnX, y: spawnY - 12, text: '🛡 Shield', vy: -0.04, life: 900, totalLife: 900, color: '#a5d6a7' }); } catch(e){}
              try {
                // One-time helpful tip: show a brief overlay message the first time a Shield appears to aid discoverability
                if (typeof localStorage !== 'undefined' && !localStorage.getItem('seenShieldTipV1')) {
                  try { if (overlayMessage) { overlayMessage.textContent = 'Tip: Collect 🛡 to absorb an enemy hit. Tap or press Esc to dismiss.'; setTimeout(function(){ try { overlayMessage.textContent = ''; } catch(e){} }, 3800); } } catch(e){}
                  try { localStorage.setItem('seenShieldTipV1', '1'); } catch(e){}
                }
              } catch(e) {}
            } else {
              // Replace the oldest to avoid growing the array while ensuring a shield appears
              try { powerups.shift(); } catch(e){}
              powerups.push({ x: spawnX, y: spawnY, vy: 0.06, type: 'shield', born: Date.now(), life: 12000 });
              try { playSound('shield'); } catch(e){}
              try { scorePopups.push({ x: spawnX, y: spawnY - 12, text: '🛡 Shield', vy: -0.04, life: 900, totalLife: 900, color: '#a5d6a7' }); } catch(e){}
            }
          }
        }
      } catch (e) { /* ignore spawn tweak errors */ }

      // Small, additional gameplay tweak: every 3rd wave spawn a guaranteed Mulch power-up to support recovery and garden theme.
      try {
        if (typeof waveNumber === 'number' && waveNumber > 0 && (waveNumber % 3) === 0) {
          const mSpawnX = Math.max(60, Math.min(cw - 60, Math.floor(cw / 2 + (Math.random() - 0.5) * 140)));
          const mSpawnY = -18;
          const nearbyMulch = powerups.some(p => p && p.type === 'mulch' && Math.abs((p.x||0) - mSpawnX) < 48 && Math.abs((p.y||0) - mSpawnY) < 48);
          if (!nearbyMulch) {
            if (powerups.length < 6) {
              powerups.push({ x: mSpawnX, y: mSpawnY, vy: 0.06, type: 'mulch', born: Date.now(), life: 12000 });
              if (powerups.length > 8) powerups.shift();
              try { scorePopups.push({ x: mSpawnX, y: mSpawnY - 12, text: '🌱 Mulch', vy: -0.04, life: 900, totalLife: 900, color: '#8BC34A' }); } catch(e){}
              try {
                // subtle particle hint so Mulch is noticeable without being distracting
                for (let k = 0; k < 6; k++) particles.push({ x: mSpawnX + (Math.random()-0.5)*10, y: mSpawnY + (Math.random()-0.5)*6, vx: (Math.random()-0.5)*0.8, vy: -0.6 - Math.random()*0.6, r: 2 + Math.random()*2, life: 360 + Math.random()*220, born: Date.now(), color: '#c8e6c9', leaf: true });
              } catch(e) {}
            } else {
              // replace oldest power-up to ensure Mulch appears without growing arrays
              try { powerups.shift(); } catch(e){}
              powerups.push({ x: mSpawnX, y: mSpawnY, vy: 0.06, type: 'mulch', born: Date.now(), life: 12000 });
              try { scorePopups.push({ x: mSpawnX, y: mSpawnY - 12, text: '🌱 Mulch', vy: -0.04, life: 900, totalLife: 900, color: '#8BC34A' }); } catch(e){}
            }
          }
        }
      } catch (e) { /* ignore mulch spawn errors */ }

    } catch (e) { /* ignore toast errors */ }
  }

  function pickEnemyDropType(rand, shieldThreshold) {
    if (rand < 0.28) return 'rapid';
    if (rand < shieldThreshold) return 'shield';
    if (rand < shieldThreshold + 0.04) return 'spread';
    if (rand < shieldThreshold + 0.10) return 'slow';
    if (rand < shieldThreshold + 0.15) return 'bomb';
    if (rand < shieldThreshold + 0.165) return 'mulch';
    if (rand < shieldThreshold + 0.168) return 'pierce';
    return 'life';
  }

  function update(dt) {
    if (keys.left) player.x -= player.speed;
    if (keys.right) player.x += player.speed;
    player.x = Math.max(20, Math.min(cw-20, player.x));

    player.cooldown = Math.max(0, player.cooldown - dt);
    // expire temporary fire rate boosts
    try { if (player.fireRate > 1 && Date.now() > (player.fireRateUntil || 0)) { player.fireRate = 1; player.fireRateUntil = 0; } } catch (e) {}
    // Performance: cap particle count to avoid runaway particle growth during long runs
    try { if (particles && particles.length > 400) particles.splice(0, particles.length - 400); } catch (e) { }
    try {
      if (bgLeaves) {
        for (const l of bgLeaves) {
          l.x += (l.vx || 0);
          l.y += (l.vy || 0);
          l.angle += (l.spin || 0);
          if (l.x < -40) l.x = cw + 40;
          if (l.x > cw + 40) l.x = -40;
          if (l.y > ch + 40) l.y = -40;
          if (l.y < -40) l.y = ch + 40;
        }
      }
      if (bgClouds) {
        for (const c of bgClouds) {
          const speed = (prefersReducedMotion ? (c.vx * 0.25) : c.vx);
          c.x += speed;
          if (c.x < -c.w) c.x = cw + c.w;
          if (c.x > cw + c.w) c.x = -c.w;
          // gentle vertical bob
          c.y += Math.sin(Date.now() * 0.0005 + c.x) * 0.02;
          if (c.y < 0) c.y = 0;
          if (c.y > ch * 0.5) c.y = ch * 0.5;
        }
      }
    } catch (e) { /* ignore bg layer update errors */ }
    if (keys.fire && player.cooldown <= 0) {
      if (Date.now() < (player.spreadUntil || 0)) {
        // spread shot: center + two angled pellets
        // adjust bullet speed slightly when Rapid power-up is active for a snappier feel
        const _rapid = Date.now() < (player.fireRateUntil || 0);
        const _bv_center = _rapid ? -11 : -10;
        const _bv_angled = _rapid ? -10 : -9;
        bullets.push({x:player.x, y:player.y-28, vy:_bv_center, r: (_rapid ? 7 : 6)});
        bullets.push({x:player.x - 8, y:player.y-28, vx:-1.6, vy:_bv_angled, r: (_rapid ? 7 : 6)});
        bullets.push({x:player.x + 8, y:player.y-28, vx:1.6, vy:_bv_angled, r: (_rapid ? 7 : 6)});
        // Rapid fire muzzle/trail particles for stronger feedback
        if (_rapid) {
          try {
            for (let p = 0; p < 3; p++) {
              particles.push({ x: player.x + (Math.random()-0.5)*8, y: player.y - 24 + (Math.random()-0.5)*6, vx: (Math.random()-0.5)*0.8, vy: -1.2 - Math.random()*0.6, r: 1 + Math.random()*2, life: 220 + Math.random()*160, born: Date.now(), color: '#ffe082' });
            }
          } catch(e){}
        }
      } else {
        // adjust bullet speed when Rapid power-up is active
        const _rapid = Date.now() < (player.fireRateUntil || 0);
        const _bv = _rapid ? -11 : -10;
        bullets.push({x:player.x, y:player.y-28, vy:_bv, r: (_rapid ? 6 : 5)});
        // Rapid fire muzzle/trail particles for stronger feedback
        if (_rapid) {
          try {
            for (let p = 0; p < 3; p++) {
              particles.push({ x: player.x + (Math.random()-0.5)*8, y: player.y - 24 + (Math.random()-0.5)*6, vx: (Math.random()-0.5)*0.8, vy: -1.2 - Math.random()*0.6, r: 1 + Math.random()*2, life: 220 + Math.random()*160, born: Date.now(), color: '#ffe082' });
            }
          } catch(e){}
        }
      }
      player.cooldown = Math.max(30, Math.round(180 / (player.fireRate || 1))); // ms (respect player's fireRate, min cap)
      lastFireFlashUntil = Date.now() + 120; // brief muzzle flash for firing feedback
      try {
        if (!prefersReducedMotion) { player.recoilUntil = Date.now() + 90; player.recoilX = (Math.random() - 0.5) * 6; player.recoilY = - (1 + Math.random() * 2); } else { player.recoilUntil = 0; player.recoilX = 0; player.recoilY = 0; }
      } catch (e) {}
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
      try { if (!prefersReducedMotion) screenShake = Math.min(6, (screenShake || 0) + 1); } catch(e) {}
    }

    for (let i=bullets.length-1;i>=0;i--) {
      bullets[i].x += (bullets[i].vx || 0);
      bullets[i].y += bullets[i].vy;
      if (bullets[i].y < -10 || bullets[i].x < -20 || bullets[i].x > cw + 20) bullets.splice(i,1);
    }
    // Stability: cap bullets to avoid runaway growth during very long runs
    try { if (bullets.length > 120) bullets.splice(0, bullets.length - 120); } catch (e) { }
    // Stability: cap particles to avoid runaway growth during very long runs (prevents memory/CPU spikes)
    try { if (particles.length > 400) particles.splice(0, particles.length - 400); } catch (e) { }
    
    for (let i=enemies.length-1;i>=0;i--) {
      const e = enemies[i];
      e.t = (e.t || 0) + dt;
      // Zigging enemies gently oscillate horizontally as they descend for a livelier garden feel
      if (e.type === 'zig') {
        e.x += Math.sin(e.t * 0.012) * (1.6 + Math.min(0.8, waveNumber*0.02));
      }
      // Moth enemies move with a sinuous horizontal sway to add visible variety
      if (e.type === 'moth') {
        try {
          const amp = (typeof e.swayAmp !== 'undefined') ? e.swayAmp : 6;
          const freq = (typeof e.swayFreq !== 'undefined') ? e.swayFreq : 0.01;
          // scale sway slightly with wave number for subtle challenge increase
          e.x += Math.sin(e.t * freq) * amp * (0.9 + Math.min(0.5, waveNumber*0.01));
          // Small homing component: when the player is present, moths gently steer toward the player's X
          // This is kept subtle so moths remain visually swaying but feel slightly more purposeful
          const dx = (player && typeof player.x === 'number') ? (player.x - e.x) : 0;
          const homing = 0.0016 + Math.min(0.006, waveNumber * 0.00035);
          e.vx = ((e.vx || 0) * 0.88) + Math.max(-1.2, Math.min(1.2, dx * homing));
          // small glowing petal trail to make moths more noticeable (increased frequency and occasional larger petal)
          if (Math.random() < 0.12) {
            // occasional larger petal for emphasis
            if (Math.random() < 0.18) {
              particles.push({ x: e.x, y: e.y, vx: (Math.random()-0.5)*0.6, vy: -0.3 - Math.random()*0.4, r: 2.4 + Math.random()*1.6, life: 380 + Math.random()*240, born: Date.now(), color: '#fff59d', petal: true, big: true });
            } else {
              particles.push({ x: e.x, y: e.y, vx: (Math.random()-0.5)*0.45, vy: -0.2 - Math.random()*0.3, r: 0.8 + Math.random()*1.4, life: 220 + Math.random()*180, born: Date.now(), color: '#fff59d', petal: true });
              if (Math.random() < 0.25) particles.push({ x: e.x + (Math.random()-0.5)*4, y: e.y + (Math.random()-0.5)*4, vx: (Math.random()-0.5)*0.25, vy: -0.15 - Math.random()*0.25, r: 0.6 + Math.random()*1.0, life: 120 + Math.random()*120, born: Date.now(), color: '#fff59d', petal: true });
            }
          }
        } catch (err) { /* ignore moth update errors */ }
      }
      // Charger behavior: drift towards player and occasionally perform a short high-speed downward charge
      if (e.type === 'charger') {
        try {
          e.baseVy = (typeof e.baseVy !== 'undefined') ? e.baseVy : (e.vy || 0.7);
          // decrement charge timer (ms)
          e.chargeTimer = (typeof e.chargeTimer === 'undefined') ? (800 + Math.random()*1200) : (e.chargeTimer - dt);
          if (e.charging) {
            // end charging after the charge duration stored on the enemy
            if (e.chargeEnd && e.t > e.chargeEnd) {
              e.charging = false;
              e.vy = e.baseVy;
              e.chargeTimer = 800 + Math.random()*1200;
            }
          } else {
            // gentle horizontal drift toward player with a small smoothing factor
            const dx = (player && typeof player.x === 'number') ? (player.x - e.x) : 0;
            const maxH = 1 + Math.min(1.5, waveNumber*0.03);
            e.vx = ((e.vx || 0) * 0.94) + Math.max(-maxH, Math.min(maxH, dx * 0.002));
            // when timer expires, start a short high-speed downward charge
            if (e.chargeTimer <= 0) {
              e.charging = true;
              e.chargeEnd = e.t + (120 + Math.random()*220);
              e.vy = e.baseVy * (2.2 + Math.random()*1.2);
            }
          }
        } catch (err) { /* ignore charger update errors */ }
      }
      // Snail behavior: very slow mover with a gentle horizontal wiggle
      if (e.type === 'snail') {
        try {
          e.vx = Math.sin(e.t * 0.006) * 0.6;
          e.vy = (typeof e.baseVy !== 'undefined') ? e.baseVy : (e.vy || 0.45);
        } catch (err) { /* ignore snail update errors */ }
      }
      // Caterpillar behavior: slow, sinuous mover that occasionally pauses to wiggle and sheds leaf particles
      if (e.type === 'caterpillar') {
        try {
          e.baseVy = (typeof e.baseVy !== 'undefined') ? e.baseVy : (e.vy || 0.65);
          e.vy = (typeof e.vy === 'number') ? e.vy : e.baseVy;
          // wide horizontal sway for caterpillars
          e.x += Math.sin(e.t * 0.018) * 2.2;
          if (typeof e._wiggleTimer === 'undefined') e._wiggleTimer = 800 + Math.random()*1200;
          e._wiggleTimer -= dt;
          if (e._wiggleTimer <= 0 && !e._wiggling) {
            e._wiggling = true;
            e._wiggleEnd = e.t + 220 + Math.random()*260;
            e._wiggleTimer = 900 + Math.random()*1600;
          }
          if (e._wiggling) {
            e.x += Math.sin(e.t * 0.075) * 3.2;
            e.vy = e.baseVy * 0.35;
            if (e.t > (e._wiggleEnd || 0)) { e._wiggling = false; e.vy = e.baseVy; }
          }
          // shed occasional leaf particles for visual variety
          if (Math.random() < 0.06) {
            particles.push({ x: e.x + (Math.random()-0.5)*6, y: e.y + e.h/2, vx: (Math.random()-0.5)*0.2, vy: 0.4 + Math.random()*0.4, r: 1 + Math.random()*1.6, life: 420 + Math.random()*220, color: '#c8e6c9' });
          }
        } catch (err) { /* ignore caterpillar update errors */ }
      }
      // Bee behavior: small fast enemies that slightly home toward player's X for lively challenge
      if (e.type === 'bee') {
        try {
          const dx = (player && typeof player.x === 'number') ? (player.x - e.x) : 0;
          const homing = 0.006 + Math.min(0.02, waveNumber*0.002);
          e.vx = ((e.vx || 0) * 0.92) + Math.max(-2, Math.min(2, dx * homing));
          // gentle vertical smoothing so bees don't jitter; they already have a fast base vy from spawn
          e.vy = (e.vy || 1) * 0.98;
          // boost bees once to ensure they're noticeably faster than basic enemies
          if (!e._beeBoosted) { e.vy = (e.vy || 1) * 1.12; e._beeBoosted = true; }
        } catch (err) { /* ignore bee update errors */ }
       // Weevil behavior: nimble little weevils that occasionally dart horizontally toward the player
       if (e.type === 'weevil') {
         try {
           if (typeof e.burstTimer === 'undefined') e.burstTimer = 400 + Math.random() * 600;
           e.burstTimer -= dt;
           if (e.burstTimer <= 0) {
             e.bursting = true;
             e.burstEnd = e.t + 220 + Math.random() * 260;
             e.burstTimer = 900 + Math.random() * 1200;
             const dir = (player && typeof player.x === 'number') ? Math.sign(player.x - e.x) : (Math.random() < 0.5 ? -1 : 1);
             e.vx = dir * (1.8 + Math.random() * 1.2 + Math.min(1.2, waveNumber * 0.02));
             e.vy = (typeof e.baseVy === 'number' ? e.baseVy : (e.vy || 0.9)) * 1.05;
           } else if (e.bursting && e.t > (e.burstEnd || 0)) {
             e.bursting = false;
             e.vx = (Math.random() - 0.5) * 0.6;
             e.vy = (typeof e.baseVy === 'number' ? e.baseVy : (e.vy || 0.9));
           } else {
             // gentle drift toward player's X so weevils feel purposeful
             e.vx = ((e.vx || 0) * 0.92) + ((player && typeof player.x === 'number') ? (player.x - e.x) * 0.0012 : 0);
           }
         } catch (err) { /* ignore weevil update errors */ }
       }
      }
      // Beetle behavior: scuttling armored bug
      if (e.type === 'beetle') {
        try {
          // gentle scuttle wobble and periodic short lateral bursts
          e.x += Math.sin(e.t * 0.03) * 1.2;
          if (typeof e.scuttleTimer === 'undefined') e.scuttleTimer = 600 + Math.random() * 800;
          e.scuttleTimer -= dt;
          if (e.scuttleTimer <= 0) {
            e.scuttleBurst = (Math.random() < 0.5) ? -1 : 1;
            e.vx = e.scuttleBurst * (1.6 + Math.random() * 1.6);
            e.scuttleEnd = e.t + 160 + Math.random() * 200;
            e.scuttleTimer = 900 + Math.random() * 1200;
            // spawn a few brown/dust petals to make scuttle bursts more noticeable (small, cheap particles)
            try { for (let p=0;p<6;p++) particles.push({ x: e.x, y: e.y, vx: (Math.random()-0.5)*1.6 + (e.vx||0)*0.2, vy: -0.4 - Math.random()*0.6, r: 1 + Math.random()*3, life: 240 + Math.random()*160, born: Date.now(), color: '#8d6e63' }); } catch(pe) {}
            try { playSound('scuttle'); } catch(e) {}
          } else if (e.scuttleEnd && e.t > e.scuttleEnd) {
            e.vx = (Math.random() - 0.5) * 0.4;
            e.scuttleEnd = 0;
          }
        } catch (err) { /* ignore beetle update errors */ }
      }
      // Hopper behavior: medium speed, periodic lateral hops (new)
      if (e.type === 'hopper') {
        try {
          // gentle horizontal bob based on internal hopStrength
          e.x += Math.sin(e.t * 0.02) * (e.hopStrength || 1.8);
          if (typeof e.hopTimer === 'undefined') e.hopTimer = 420 + Math.random() * 480;
          e.hopTimer -= dt;
          if (e.hopTimer <= 0) {
            // quick lateral hop
            e.vx = (Math.random() < 0.5 ? -1 : 1) * (1.6 + Math.random() * (e.hopStrength || 1.6));
            e.hopTimer = 520 + Math.random() * 700;
          }
        } catch (err) { /* ignore hopper update errors */ }
      }
      // Ladybug behavior: medium speed, small HP, occasional quick lateral hops for variety
      if (e.type === 'ladybug') {
        try {
          // gentle horizontal wobble
          e.x += Math.sin(e.t * 0.02) * 1.8;
          // occasional lateral hop: use a hopTimer stored on the enemy
          if (typeof e.hopTimer === 'undefined') e.hopTimer = 600 + Math.random() * 800;
          e.hopTimer -= dt;
          if (e.hopTimer <= 0) {
            e.vx = (Math.random() - 0.5) * 2.4;
            e.hopTimer = 700 + Math.random() * 1000;
          }
        } catch (err) { /* ignore ladybug update errors */ }
      }
      // Snatcher behavior: medium enemies that periodically dash toward the player
      if (e.type === 'snatcher') {
        try {
          if (typeof e.huntTimer === 'undefined') e.huntTimer = 900 + Math.random() * 800;
          e.huntTimer -= dt;
          // Telegraphed dash: spawn a small visual cue shortly before the dash so players can react
          try {
            if (e.huntTimer > 0 && e.huntTimer <= 360 && !e._snatchWarned) {
              e._snatchWarned = Date.now() + 420; // suppress repeated warning spawns for a short window
              try { particles.push({ x: e.x, y: e.y - 8, vx: 0, vy: -0.18, r: 3, life: 320, born: Date.now(), color: '#ffb74d' }); } catch(pe){}
            }
          } catch(pe){}
          if (e.huntTimer <= 0) {
            // short downward dash to threaten the player
            e.vy = (e.vy || 1) * (1.8 + Math.random() * 0.6);
            e.huntTimer = 900 + Math.random() * 1200;
            // reset warning flag after dash
            e._snatchWarned = 0;
          } else {
            const dx = (player && typeof player.x === 'number') ? (player.x - e.x) : 0;
            e.vx = ((e.vx || 0) * 0.92) + Math.max(-2, Math.min(2, dx * 0.003 + (Math.random()-0.5) * 0.12));
          }
        } catch (err) { /* ignore snatcher update errors */ }
      }
      const slowFactor = Date.now() < (player.slowUntil || 0) ? 0.6 : 1;
      // Pest-mini behavior: nimble mini-pests have a small horizontal wobble for visual variety
      if (e.type === 'pest-mini') {
        try {
          e.x += Math.sin(e.t * 0.024) * 0.9;
        } catch (err) { /* ignore pest-mini update errors */ }
      }
      // Sprout behavior: gentle bobbing and occasional leaf-shedding for livelier garden visuals
      if (e.type === 'sprout') {
        try {
          // gentle horizontal bob and slight smoothing of vx so sprouts feel organic
          e.vx = (Math.sin(e.t * 0.018) * 0.42) + ((e.vx || 0) * 0.92);
          // ensure a steady, slightly slower descent for sprouts
          e.vy = (typeof e.vy === 'number') ? e.vy : 0.65;
          // occasional tiny leaf particle to make sprouts feel alive (very low frequency to limit cost)
          try {
            if (Math.random() < 0.002) {
              particles.push({ x: e.x, y: e.y, vx: (Math.random() - 0.5) * 0.6, vy: -0.6 - Math.random() * 0.4, r: 1 + Math.random() * 2, life: 300 + Math.random() * 200, born: Date.now(), color: '#8BC34A', leaf: true, spin: (Math.random() - 0.5) * 0.08 });
            }
          } catch (pe) { /* ignore particle push errors */ }
        } catch (err) { /* ignore sprout update errors */ }
      }
      const waveGraceFactor = (typeof waveStartGraceUntil === 'number' && Date.now() < (waveStartGraceUntil || 0)) ? 0.65 : 1;
      const perEnemySlow = Date.now() < (e.slowUntil || 0) ? (typeof e.slowFactor === 'number' ? e.slowFactor : 0.6) : 1;
      const finalMoveFactor = slowFactor * waveGraceFactor * perEnemySlow;
      e.y += e.vy * finalMoveFactor;
      // apply horizontal velocity if present (fallback for types that don't set vx)
      e.x += (e.vx || 0) * slowFactor * perEnemySlow;

      // New: check for direct collision with the player (visible and immediate feedback). If an enemy touches
      // the player, consume the enemy and either let the shield absorb it or cause a life loss. This makes
      // the Shield power-up more useful and immediately noticeable when it protects the player.
      try {
        if (player && typeof player.x === 'number' && typeof player.y === 'number') {
          const overlapX = Math.abs((e.x || 0) - player.x) <= ((e.w || 20) / 2 + (player.w || 40) / 2 + 6);
          const overlapY = Math.abs((e.y || 0) - player.y) <= ((e.h || 20) / 2 + (player.h || 22) / 2 + 6);
          if (overlapX && overlapY) {
            // remove the enemy on collision
            enemies.splice(i,1);
            // Shield absorbs collisions too
            try {
              if (Date.now() < (player.invulnerableUntil || 0)) {
                // Recently picked up a shield: temporary invulnerability window. Provide gentle feedback but do not consume a shield charge.
                try { scorePopups.push({ x: player.x, y: player.y - 20, text: 'Invulnerable!', vy: -0.05, life: 700, totalLife: 700, color: '#fff59d' }); } catch (e) {}
                try { for (let k=0;k<8;k++) particles.push({ x: player.x, y: player.y, vx: (Math.random()-0.5)*1.8, vy: -Math.random()*1.2, r: 2+Math.random()*3, life: 300+Math.random()*200, born: Date.now(), color: '#fff59d' }); } catch(e){}
                try { playSound('blip'); } catch(e){}
                // skip life loss and shield consumption during this brief window
                continue;
              }
              if (Date.now() < (player.shieldUntil || 0)) {
                // consume one shield charge (clamped to avoid negative values)
                player.shieldCharges = Math.max(0, (typeof player.shieldCharges === 'number' ? player.shieldCharges : 0) - 1);
                if (player.shieldCharges <= 0) {
                  player.shieldCharges = 0;
                  player.shieldUntil = 0;
                } else {
                  player.shieldUntil = Math.max(Date.now(), player.shieldUntil);
                }
                try { scorePopups.push({ x: player.x, y: player.y - 20, text: 'Shield absorbed!', vy: -0.05, life: 900, totalLife: 900, color: '#a5d6a7' }); } catch (e) {}
                try {
                  // Longer, stronger pulse so absorbs are more noticeable
                  shieldPulseUntil = Date.now() + 800; shieldPulseX = player.x; shieldPulseY = player.y;
                  // Spawn extra garden-petal particles to make shield-absorb feedback more visible and satisfying
                  try {
                    const petalColors = ['#ffd7e6','#ffe082','#f8bbd0','#a5d6a7'];
                    for (let _i = 0; _i < 14; _i++) {
                      const ang = Math.random() * Math.PI * 2;
                      const spd = 1 + Math.random() * 2;
                      particles.push({
                        x: (player && typeof player.x === 'number') ? (player.x + (Math.random()*12-6)) : (cw/2 + (Math.random()*12-6)),
                        y: (player && typeof player.y === 'number') ? (player.y + (Math.random()*10-5)) : (ch/2 + (Math.random()*10-5)),
                        vx: Math.cos(ang) * spd,
                        vy: Math.sin(ang) * spd - 0.6,
                        life: 800 + Math.random() * 600,
                        color: petalColors[Math.floor(Math.random() * petalColors.length)],
                        size: 8 + Math.random() * 8,
                        petal: true,
                        spin: (Math.random()-0.5)*0.18
                      });
                    }
                    // Add a small deterministic rotating ring of bright particles for a clear visual cue
                    try {
                      const nowAng = ((Date.now() % 1000) / 1000) * Math.PI * 2;
                      for (let r = 0; r < 6; r++) {
                        const a = nowAng + (r / 6) * Math.PI * 2;
                        particles.push({ x: player.x + Math.cos(a) * 20, y: player.y + Math.sin(a) * 20, vx: Math.cos(a) * 0.4, vy: Math.sin(a) * 0.4 - 0.2, r: 4, life: 420, born: Date.now(), color: '#fff9c4', flash: true });
                      }
                    } catch(e) {}
                  } catch (e) {}
                } catch(e) {}
                try { addScoreAndPopup(6, player.x + 16, player.y - 10, '#ffff88'); } catch(e){}
                // Small tactile/gamefeel improvement: give shield absorb a brief screen shake, hit-stop, and player flash so it's more noticeable
                try { screenShake = Math.max(typeof screenShake === 'number' ? screenShake : 0, 8); } catch(e){}
                try { hitStopUntil = performance.now() + 60; } catch (err) { hitStopUntil = Date.now() + 60; }
                try { canvasPlayerHitFlashUntil = Date.now() + 420; } catch(e){}
                try { shieldPulseUntil = Date.now() + 800; shieldPulseX = player.x; shieldPulseY = player.y; } catch(e){}
                try { if (typeof playSound === 'function') playSound('shield'); } catch(e){}
                try { for (let k=0;k<6;k++) particles.push({ x: player.x + (Math.random()-0.5)*18, y: player.y + (Math.random()-0.5)*8, vx: (Math.random()-0.5)*1.6, vy: -0.8 - Math.random()*1.2, r: 6+Math.random()*6, life: 420+Math.random()*240, born: Date.now(), color: (Math.random() < 0.5 ? '#ffd54f' : '#ffcc80'), petal: true, spin: (Math.random()-0.5)*0.18 }); } catch(e){}
                try { playSound('shield'); } catch (e) {}
                try { if (canvas && typeof canvas.focus === 'function') canvas.focus(); } catch(e) {}
                try { livesPulseUntil = Date.now() + 700; } catch(e) {}
                try { if (navigator && typeof navigator.vibrate === 'function') navigator.vibrate(40); } catch(e) {}
                try {
                  for (let k=0;k<12;k++) particles.push({ x: player.x, y: player.y, vx: (Math.random()-0.5)*2.8, vy: -Math.random()*2.2, r: 2+Math.random()*4, life: 360+Math.random()*360, born: Date.now(), color: '#a5d6a7', leaf: true, spin: (Math.random()-0.5)*0.12 });
                  // Extra petals and a brief flash to make Shield absorb more noticeable and garden-themed
                  for (let k=0;k<6;k++) particles.push({ x: player.x + (Math.random()-0.5)*18, y: player.y + (Math.random()-0.5)*8, vx: (Math.random()-0.5)*1.6, vy: -0.8 - Math.random()*1.2, r: 6+Math.random()*6, life: 420+Math.random()*240, born: Date.now(), color: (Math.random() < 0.5 ? '#ffd54f' : '#ffcc80'), petal: true, spin: (Math.random()-0.5)*0.18 });
                  // Small bright ring flash
                  particles.push({ x: player.x, y: player.y, vx: 0, vy: 0, r: 8, life: 160, born: Date.now(), color: '#fff9c4', flash: true });
                } catch(e){}
                try { screenShake = Math.min(20, (screenShake||0) + 4); } catch(e){}
                try { canvasWhiteFlashUntil = Date.now() + 380; canvasHitFlashUntil = Date.now() + 520; } catch(e){}
                try { var _pa = document.getElementById('powerup-announcer'); if (_pa) _pa.textContent = 'Shield absorbed'; } catch (e) {}
                try {
                  if (activePowerEl) {
                    const _prev = activePowerEl.textContent || '';
                    try { activePowerEl.textContent = '🛡 Shield absorbed'; activePowerEl.setAttribute('aria-hidden','false'); } catch(e){}
                    try {
                      const livesElPulse = document.getElementById('lives');
                      if (livesElPulse) {
                        try { livesElPulse.classList.add('lives-pulse'); } catch(e){}
                        setTimeout(function(){ try { livesElPulse.classList.remove('lives-pulse'); } catch(e){} }, 700);
                        try { const b = livesElPulse.querySelector('.shield-badge') || livesElPulse.querySelector('#lives-shield-badge'); if (b) { b.classList.add('pulse'); setTimeout(function(){ try { b.classList.remove('pulse'); } catch(e){} }, 1600); } } catch(e){}
                      }
                    } catch(e){}
                    setTimeout(function(){
                      try { activePowerEl.textContent = _prev; if (!_prev) activePowerEl.setAttribute('aria-hidden','true'); } catch(e){}
                    }, 900);
                  }
                } catch(e){}

                // Small area effect: briefly slow nearby enemies to give the player a moment to recover (garden-themed vine tangle)
                try {
                  const now2 = Date.now();
                  const slowRadius = 120;
                  for (let ei = enemies.length - 1; ei >= 0; ei--) {
                    try {
                      const en = enemies[ei];
                      const dx = (en.x || 0) - (player.x || 0);
                      const dy = (en.y || 0) - (player.y || 0);
                      if (Math.sqrt(dx*dx + dy*dy) <= slowRadius) {
                        en.slowUntil = now2 + 900; // 0.9s slow
                        en.slowFactor = 0.55; // slow to 55% speed
                        for (let mp=0; mp<4; mp++) particles.push({ x: en.x + (Math.random()-0.5)*8, y: en.y + (Math.random()-0.5)*8, vx: (Math.random()-0.5)*1.2, vy: -Math.random()*1.2, r: 1.2 + Math.random()*1.8, life: 300 + Math.random()*200, born: now2, color:'#90caf9', leaf: true });
                      }
                    } catch(ex){}
                  }
                } catch(ex){}

                // skip life loss
                continue;
              }
            } catch (e) { /* ignore shield check errors */ }

            // No shield: apply normal life loss feedback
            lives--;
            livesPulseUntil = Date.now() + 700;
            livesFlashUntil = Date.now() + 260;
            try { player.hitFlashUntil = Date.now() + 320; } catch (e) {}
            try { canvasPlayerHitFlashUntil = Date.now() + 360; } catch (e) {}
            lives = Math.max(0, lives);

            // small hit feedback (particles/screen shake) — reuse existing life-loss visuals
            try {
              const pcLost = 8;
              for (let p=0;p<pcLost;p++) {
                const angle = Math.PI + (Math.random() - 0.5) * 1.5;
                const speed = 1 + Math.random() * 2;
                particles.push({ x: player.x, y: player.y - 12, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: 2 + Math.random() * 3, life: 400 + Math.random() * 300, born: Date.now() });
              }
              screenShake = Math.min(20, screenShake + 6);
            } catch(e){}

            try {
              if (!lifeAnnouncer) lifeAnnouncer = document.getElementById('life-announcer');
              if (lifeAnnouncer) {
                const msg = lives > 0 ? ('Life lost. ' + lives + (lives === 1 ? ' life remaining.' : ' lives remaining.')) : 'Last life lost. Game over.';
                try { lifeAnnouncer.textContent = msg; } catch (e) { }
              }
            } catch(e){}

            // continue to next enemy iteration
            continue;
          }
        }
      } catch (err) { /* ignore collision errors */ }

      // previous behavior: if an enemy leaks past bottom of the screen, treat as life loss (or shield absorption)
      if (e.y > ch + 50) {
        enemies.splice(i,1);
        // Shield absorbs bottom-leak life loss if active
        try {
          if (Date.now() < (player.invulnerableUntil || 0)) {
            // temporary invulnerability after pickup: gentle feedback, no shield consumption
            try { scorePopups.push({ x: player.x, y: player.y - 20, text: 'Invulnerable!', vy: -0.05, life: 700, totalLife: 700, color: '#fff59d' }); } catch (e) {}
            try { for (let k=0;k<8;k++) particles.push({ x: player.x, y: player.y, vx: (Math.random()-0.5)*1.8, vy: -Math.random()*1.2, r: 2+Math.random()*3, life: 300+Math.random()*200, born: Date.now(), color: '#fff59d' }); } catch(e){}
            try { playSound('blip'); } catch(e){}
            // skip life loss and shield consumption during this brief window
            continue;
          } else if (Date.now() < (player.shieldUntil || 0)) {
            // consume one shield charge (support multi-charge shields). Clamp to avoid negatives.
            player.shieldCharges = Math.max(0, (typeof player.shieldCharges === 'number' ? player.shieldCharges : 0) - 1);
            if (player.shieldCharges <= 0) {
              player.shieldCharges = 0;
              player.shieldUntil = 0;
            } else {
              // keep shield active; ensure remaining time is at least now
              player.shieldUntil = Math.max(Date.now(), player.shieldUntil);
            }
            // small visual feedback and a minor score reward to make shield use feel satisfying
            try { scorePopups.push({ x: player.x, y: player.y - 20, text: 'Shield absorbed!', vy: -0.05, life: 900, totalLife: 900, color: '#a5d6a7' }); } catch (e) {}
            try { addScoreAndPopup(5, player.x + 16, player.y - 10, '#ffff88'); } catch(e){}
            try { playSound('shield'); } catch (e) {}
            try { if (canvas && typeof canvas.focus === 'function') canvas.focus(); } catch(e) {}
            try { if (navigator && typeof navigator.vibrate === 'function') navigator.vibrate(30); } catch(e) {}
            try {
              // burst of sparkles and larger brighter petals for stronger visual feedback on shield absorb
              for (let k=0;k<10;k++) particles.push({ x: player.x, y: player.y, vx: (Math.random()-0.5)*2.4, vy: -Math.random()*2, r: 2+Math.random()*4, life: 360+Math.random()*360, born: Date.now(), color: '#a5d6a7', leaf: true, spin: (Math.random()-0.5)*0.12 });
              for (let p=0;p<8;p++) {
                const ang = Math.random()*Math.PI*2;
                const spd = 1 + Math.random()*2.2;
                particles.push({ x: player.x + (Math.random()-0.5)*6, y: player.y + (Math.random()-0.5)*6, vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd, r: 2 + Math.random()*3, life: 420 + Math.random()*280, born: Date.now(), color: '#fff59d', petal: true, blend: 'lighter' });
              }
            } catch(e){}
            try { hitStopUntil = performance.now() + 60; } catch (err) { hitStopUntil = Date.now() + 60; }
            try { shieldPulseUntil = Date.now() + 800; shieldPulseX = player.x; shieldPulseY = player.y; } catch(e){}
            try { screenShake = Math.min(20, (screenShake||0) + 6); } catch(e){}
            try { canvasWhiteFlashUntil = Date.now() + 340; canvasHitFlashUntil = Date.now() + 420; } catch(e){}
            try { var _pa = document.getElementById('powerup-announcer'); if (_pa) _pa.textContent = 'Shield absorbed'; } catch (e) {}
            try {
              if (activePowerEl) {
                const _prev = activePowerEl.textContent || '';
                try { activePowerEl.textContent = '🛡 Shield absorbed'; activePowerEl.setAttribute('aria-hidden','false'); } catch(e){}
                setTimeout(function(){
                  try { activePowerEl.textContent = _prev; if (!_prev) activePowerEl.setAttribute('aria-hidden','true'); } catch(e){}
                }, 900);
              }
            } catch(e){}
            continue;
          }
        } catch (e) { /* ignore shield check errors */ }
        lives--;
        livesPulseUntil = Date.now() + 700;
        livesFlashUntil = Date.now() + 260;
        // brief player hit flash for clearer visual feedback (respects reduced-motion preference)
        try { player.hitFlashUntil = Date.now() + 320; } catch (e) {}
        try { canvasPlayerHitFlashUntil = Date.now() + 360; } catch (e) {}
        lives = Math.max(0, lives);
        // Expose a body dataset flag when the player is low on lives so CSS can emphasize feedback (e.g., stronger hit shake)
        try { if (typeof document !== 'undefined' && document.body) { document.body.setAttribute('data-low-lives', (lives <= 1) ? 'true' : 'false'); } } catch (e) {}
        // brief invulnerability after losing a life to avoid immediate follow-up hits
        try {
          if (lives > 0) {
            try { player.invulnerableUntil = Date.now() + 1400; } catch(e) { player.invulnerableUntil = Date.now() + 1400; }
            try { scorePopups.push({ x: player.x, y: player.y - 20, text: 'Invulnerable!', vy: -0.05, life: 700, totalLife: 700, color: '#fff59d' }); } catch (e) {}
          }
        } catch (e) {}
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
        try { playSound('hit'); } catch (e) { /* ignore sound errors */ }
        try { if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function' && !(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) navigator.vibrate(30); } catch (e) { /* ignore vibration errors */ }
      } catch (e) { /* ignore particle errors */ }
      if (lives <= 0) {
        gameOver = true;
        paused = true;
        // Persist high score when the run ends
        if (score > highScore) {
          highScore = score;
          try { saveHighScoreDebounced(highScore); } catch (e) { /* ignore storage errors */ }
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
          // If the player has a temporary pierce power-up active, bullets pierce enemies and are not removed on hit
          if (!(Date.now() < (player.pierceUntil || 0))) {
            bullets.splice(j,1);
          }
          e.hp--;
          // Brief hit flash to improve visual feedback when an enemy is struck
          try { e.hitFlashUntil = Date.now() + 320; } catch (err) { /* ignore */ }
          try { hitMarkers.push({ x: e.x, y: e.y, until: Date.now() + 160 }); } catch (err) { /* ignore */ }
          // Canvas-wide warm flash to make hits more visually obvious (respects reduced-motion)
          try { canvasHitFlashUntil = Date.now() + 360; canvasHitFlashX = e.x; canvasHitFlashY = e.y; } catch (err) { /* ignore */ }
          try { canvasWhiteFlashUntil = Date.now() + 220; } catch (err) { /* ignore */ }
          try { screenShake = Math.min(20, (screenShake || 0) + 2); } catch (err) { /* ignore */ }
          // Trigger body-level hit-pop overlay (CSS) for stronger, thematic hit feedback.
          try {
            if (typeof document !== 'undefined' && document.body) {
              const _prm = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
              if (!_prm) {
                const hx = Math.max(0, Math.min(1, (e.x / cw)));
                const hy = Math.max(0, Math.min(1, (e.y / ch)));
                document.body.style.setProperty('--hit-x', (hx*100).toFixed(2) + '%');
                document.body.style.setProperty('--hit-y', (hy*100).toFixed(2) + '%');
                // Debounce and reuse a single removal timeout so rapid hits don't queue multiple removals
                try { if (typeof hitPopTimeout !== 'undefined' && hitPopTimeout) { clearTimeout(hitPopTimeout); hitPopTimeout = null; } } catch(e){}
                document.body.classList.add('hit-pop');
                try {
                  var hitAnn = document.getElementById('hit-announcer');
                  if (!hitAnn) {
                    hitAnn = document.createElement('div');
                    hitAnn.id = 'hit-announcer';
                    hitAnn.style.position = 'absolute';
                    hitAnn.style.left = '-9999px';
                    hitAnn.style.width = '1px';
                    hitAnn.style.height = '1px';
                    hitAnn.setAttribute('aria-live','polite');
                    hitAnn.setAttribute('aria-atomic','true');
                    hitAnn.setAttribute('role','status');
                    document.body.appendChild(hitAnn);
                  }
                  try { hitAnn.textContent = 'Enemy hit'; } catch(e){}
                } catch(e){}
                hitPopTimeout = setTimeout(function(){ try { document.body.classList.remove('hit-pop'); } catch (e) {} try { hitPopTimeout = null; } catch(e){} }, 900);
              }
            }
          } catch (err) { /* ignore overlay errors */ }
            try {
              // tiny garden-themed particle burst to make hits feel more satisfying (low-cost)
              for (let k=0;k<6;k++) {
                const clr = (Math.random() < 0.4) ? '#a5d6a7' : ((Math.random() < 0.5) ? '#fff59d' : '#ffd54f');
                particles.push({
                  x: e.x + (Math.random()-0.5)*6,
                  y: e.y + (Math.random()-0.5)*6,
                  vx: (Math.random()-0.5)*1.4,
                  vy: -0.6 - Math.random()*0.8,
                  r: 1 + Math.random()*1.8,
                  life: 200 + Math.random()*180,
                  born: Date.now(),
                  color: clr,
                  petal: Math.random() < 0.6,
                  leaf: Math.random() < 0.25,
                  angle: Math.random() * Math.PI * 2,
                  spin: (Math.random()-0.5) * 0.18
                });
              }
              // add a few bright spark particles with additive blending for clearer impact
              for (let s=0;s<3;s++) particles.push({ x: e.x + (Math.random()-0.5)*6, y: e.y + (Math.random()-0.5)*6, vx: (Math.random()-0.5)*2.2, vy: -0.4 - Math.random()*0.8, r: 0.8 + Math.random()*1.2, life: 100 + Math.random()*120, born: Date.now(), color: '#ffffff', blend: 'lighter' });
            } catch (pe) { /* ignore particle errors */ }
          // If the hit was non-lethal, show a small +1 popup and a few particles to reward the hit visually
          if (e.hp > 0) {
            try {
              scorePopups.push({ x: e.x, y: e.y, text: '+1', vy: -0.04, life: 600, totalLife: 600, color: '#fff9c4' });
              if (typeof document !== 'undefined' && document.body) {
                try {
                  if (typeof prefersReducedMotion === 'undefined' || !prefersReducedMotion) {
                    document.body.classList.add('wave-shake');
                    setTimeout(function () {
                      try { document.body.classList.remove('wave-shake'); } catch (e) {}
                    }, 220);
                  }
                } catch (e) {}
              }
            } catch (ex) { /* ignore */ }
            try {
              for (let sp = 0; sp < 5; sp++) {
                particles.push({
                  x: e.x + (Math.random() - 0.5) * 8,
                  y: e.y + (Math.random() - 0.5) * 8,
                  vx: (Math.random() - 0.5) * 1.2,
                  vy: -0.6 - Math.random() * 0.6,
                  r: 1 + Math.random() * 2,
                  life: 240 + Math.random() * 160,
                  born: Date.now(),
                  color: '#fff59d'
                });
              }
            } catch (ex) { /* ignore particle errors */ }
            // Add a small screen-shake and hit sound/vibration for non-lethal enemy hits to improve feedback
            try {
              // Slightly stronger screen shake for clearer hit feedback (small, capped)
              screenShake = Math.min(12, (screenShake || 0) + 4);
              // very brief hit-stop (freeze-frame) to improve perceived impact
              try { hitStopUntil = performance.now() + 80; } catch (err) { hitStopUntil = Date.now() + 80; }
              try { playSound('hit'); } catch (e) { /* ignore sound errors */ }
              try { if (navigator && typeof navigator.vibrate === 'function') navigator.vibrate(18); } catch (e) { /* ignore vibration errors */ }
            } catch (e) { /* ignore feedback errors */ }
          }
          if (e.hp <= 0) {
            enemies.splice(i,1);
            // brief kill popup to highlight enemy defeat
            try { scorePopups.push({ x: e.x, y: e.y, text: '+3', vy: -0.06, life: 900, totalLife: 900, color: '#fff9c4' }); } catch (sperr) {}
            // small explosion particle burst on enemy death (garden-themed petals)
            try {
              const pc = Math.min(14, 6 + Math.round(Math.random()*8));
              for (let p=0;p<pc;p++) {
                const ang = Math.random()*Math.PI*2;
                const spd = 0.6 + Math.random()*2.2;
                particles.push({
                  x: e.x + (Math.random()-0.5)*6,
                  y: e.y + (Math.random()-0.5)*6,
                  vx: Math.cos(ang)*spd,
                  vy: Math.sin(ang)*spd,
                  r: 1 + Math.random()*3,
                  life: 380 + Math.random()*240,
                  born: Date.now(),
                  color: (e.type === 'sprout' ? '#8BC34A' : (e.type === 'bee' ? '#FFD54F' : '#FF8A65')),
                  blend: 'lighter',
                  petal: true
                });
              }
              try { screenShake = Math.min(20, (screenShake||0) + 10); } catch(e){}
              // Stronger flash and extra bright particles for enemy death to improve clarity (respects reduced-motion)
              try { if (!prefersReducedMotion) { canvasWhiteFlashUntil = Date.now() + 640; canvasHitFlashUntil = Date.now() + 780; canvasHitFlashX = e.x; canvasHitFlashY = e.y; } } catch(e) {}
               try { if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function' && !(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) navigator.vibrate(22); } catch(e) {}
              try {
                for (let q=0;q<16;q++) particles.push({ x: e.x + (Math.random()-0.5)*10, y: e.y + (Math.random()-0.5)*10, vx: (Math.random()-0.5)*3, vy: (Math.random()-0.5)*3, r: 0.8 + Math.random()*2.6, life: 220 + Math.random()*260, born: Date.now(), color: '#fff59d', blend: 'lighter' });
              } catch(e) {}
              try { playSound('explode'); } catch(e){}
            } catch (err) {}
            try {
              const now = Date.now();
              try {
                if (now - lastKillAt <= 700) {
                  killCombo = Math.min(killCombo + 1, 5);
                } else {
                  killCombo = 1;
                }
              } catch (e) { killCombo = 1; }
              lastKillAt = now;
              const base = 10;
              const bonusPer = 3;
              const maxBonus = 10;
              const comboBonus = Math.min(maxBonus, (killCombo - 1) * bonusPer);
              addScoreAndPopup(base + comboBonus, e.x, e.y, '#ffff88');
              if (killCombo > 1) {
                try { scorePopups.push({ x: e.x, y: e.y - 18, text: 'Combo x' + killCombo + ' +' + comboBonus, vy: -0.08, life: 900, totalLife: 900, color: '#ffd54f' }); } catch (e) {}
                try { if (scoreEl) { scoreEl.classList.add('hud-combo'); setTimeout(function(){ try { scoreEl.classList.remove('hud-combo'); } catch(e){} }, 520); } } catch(e) {}
              }
            } catch(e) {}
            // pest split: spawn two small mini-pests at the death location when a pest dies
            try {
              if (e.type === 'pest') {
                for (let m = 0; m < 2; m++) {
                  enemies.push({
                    x: e.x + (m === 0 ? -8 : 8),
                    y: e.y,
                    w: 14,
                    h: 12,
                    vy: (Math.random() * 0.6) + 0.4,
                    vx: (m === 0 ? -0.35 : 0.35),
                    hp: 1,
                    maxHp: 1,
                    wave: waveNumber,
                    type: 'pest-mini'
                  });
                }
              }
            } catch (ex) { /* ignore pest spawn errors */ }
            // If the player surpasses the previous high score during the run, update and show a small badge
            try {
              const prevHigh = highScore;
              if (score > prevHigh) {
                highScore = score;
                try { saveHighScoreDebounced(highScore); } catch (e) { /* ignore storage errors */ }
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
                try { playSound('powerup'); } catch (e) {}
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
            try { if (scoreEl) { scoreEl.classList.add('hud-hit'); setTimeout(() => { try { scoreEl.classList.remove('hud-hit'); } catch (e) {} }, 280); } } catch (e) {}
            // Small chance to spawn a temporary power-up when an enemy dies
            try {
              // Slightly increased spawn chance so players see power-ups more often (small gameplay tweak)
              let puChance = 0.72;
              if (typeof lives === 'number' && lives <= 1) {
                // When player is low on lives, increase power-up frequency to aid recovery
                puChance = Math.min(0.85, puChance + 0.28);
              }
              if (Math.random() < puChance) {
                // slightly favor rapid/shield but occasionally spawn a new spread, slow, bomb, or rare pierce power-up
                let _r = Math.random();
                // If low on lives, bias toward shield slightly
                if (typeof lives === 'number' && lives <= 1 && Math.random() < 0.6) {
                  _r = 0.4; // falls into shield bucket in the selection logic below
                }
                // limit active power-ups to avoid overload
                if (powerups.length < 6) {
                  powerups.push({ x: e.x, y: e.y, vy: -0.4, type: pickEnemyDropType(_r, 0.84), born: Date.now(), life: 14000 });
                  // Visual hint: when a Shield spawns, emit small petal/leaf sparkles so players notice the pickup
                  try { for (let k=0;k<8;k++) particles.push({ x: e.x + (Math.random()-0.5)*8, y: e.y + (Math.random()-0.5)*8, vx: (Math.random()-0.5)*1.6, vy: -Math.random()*1.4, r: 2 + Math.random()*3, life: 420 + Math.random()*300, born: Date.now(), color: '#a5d6a7', leaf: true, spin: (Math.random()-0.5)*0.12 }); } catch(e) {}
                  // Defensive: keep powerup count bounded to avoid pathological growth during long runs
                  if (powerups.length > 8) powerups.shift();
                } else {
                  // occasionally replace the oldest power-up to keep variety without growing arrays
                  if (Math.random() < 0.12) {
                    powerups.shift();
                    powerups.push({ x: e.x, y: e.y, vy: -0.4, type: pickEnemyDropType(_r, 0.78), born: Date.now(), life: 14000 });
                    // Visual hint: when a Shield is inserted via replacement, emit a small sparkle burst for discoverability
                    try {
                      for (let k = 0; k < 6; k++) {
                        particles.push({ x: e.x + (Math.random() - 0.5) * 10, y: e.y + (Math.random() - 0.5) * 10, vx: (Math.random() - 0.5) * 1.8, vy: -Math.random() * 1.6, r: 2 + Math.random() * 2.6, life: 380 + Math.random() * 260, born: Date.now(), color: '#a5d6a7', leaf: true, spin: (Math.random() - 0.5) * 0.14 });
                      }
                    } catch (e) {}
                    if (powerups.length > 8) powerups.shift();
                  }
                }
              }
              try { if (e && e.type === 'weevil' && Math.random() < 0.45) { if (powerups.length < 6) powerups.push({ x: e.x, y: e.y, vy: -0.4, type: 'mulch', born: Date.now(), life: 14000 }); } if (e && e.type === 'snail' && Math.random() < 0.30) { if (powerups.length < 6) powerups.push({ x: e.x, y: e.y, vy: -0.4, type: 'mulch', born: Date.now(), life: 14000 }); } } catch(e) {}
            } catch (err) { /* ignore powerup spawn errors */ }
          }
          break;
        }
      }
    }

    // update particles
    // Cap particle count to avoid performance issues on low-end devices (tiny)
    if (particles.length > 400) particles.splice(0, particles.length - 400);
    for (let i=particles.length-1;i>=0;i--) {
      const p = particles[i];
      // initialize small spin for petals and leaves so they rotate subtly
      if (typeof p.spin === 'undefined') {
        if (p.petal) p.spin = (Math.random() * 0.14) - 0.07;
        else if (p.leaf) p.spin = (Math.random() * 0.18) - 0.09;
        else p.spin = 0;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      if (p.leaf || p.petal) {
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

    // update power-ups: drift up slightly, expire, and handle collection by player
    try {
      for (let i=powerups.length-1;i>=0;i--) {
        const pu = powerups[i];
        pu.y += (pu.vy || -0.4) * dt * 0.06; // gentle upward float (scaled by dt)
        pu.life -= dt;
        // remove if expired or off-screen
        if (pu.life <= 0 || pu.y < -40) { powerups.splice(i,1); continue; }
        // check collection: simple distance check
        try {
          const dx = pu.x - player.x;
          const dy = pu.y - player.y;
          const pickupRadius = (typeof isTouch !== 'undefined' && isTouch) ? 220 : 180; // larger radius on touch devices to aid collection; slightly increased non-touch radius for better pickup feel

          if (Math.sqrt(dx*dx + dy*dy) < pickupRadius) {
            try {
              // hint when a shield drifts within pickup range to aid discoverability (small, non-spammy)
              if (pu.type === 'shield' && Date.now() > (shieldNearbyHintUntil || 0)) {
                try { scorePopups.push({ x: player.x, y: player.y - 30, text: '🛡 Shield nearby!', vy: -0.04, life: 900, totalLife: 900, color: '#a5d6a7' }); } catch(e){}
                try { var _pa = document.getElementById('powerup-announcer'); if (_pa) _pa.textContent = 'Shield nearby'; } catch(e){}
                shieldNearbyHintUntil = Date.now() + 2600;
                powerupPulseUntil = Date.now() + 420;
              }
            } catch(e){}

            // handle different power-up types
            if (pu.type === 'rapid') {
              player.fireRate = 3; // stronger rapid fire: 3x rate for a noticeably snappier feel
              player.fireRateUntil = Date.now() + 18000; // 18 seconds
              // small celebratory feedback
              try { scorePopups.push({ x: player.x, y: player.y - 20, text: 'Rapid Fire!', vy: -0.05, life: 900, totalLife: 900, color: '#ffe082' }); } catch (e) {}
              try { playSound('blip'); } catch (e) {}
              try { for (let k=0;k<6;k++) particles.push({ x: pu.x, y: pu.y, vx: (Math.random()-0.5)*1.6, vy: -Math.random()*1.2, r: 2+Math.random()*2, life: 400+Math.random()*300, born: Date.now(), color: '#fff59d' }); } catch (e) {}
              // Accessibility: announce Rapid power-up collection for screen readers (keeps HUD discoverable)
              try { var _pa = document.getElementById('powerup-announcer'); if (_pa) _pa.textContent = 'Rapid collected'; } catch (e) {}
            } else if (pu.type === 'shield') {
              // grant or refresh a temporary shield; collecting while active adds one charge (max 3) and extends duration
              try {
                const now = Date.now();
                if (player && now < (player.shieldUntil || 0)) {
                  // already has shield: add one charge up to 3 and extend by 10s
                  try { player.shieldCharges = Math.min(3, (typeof player.shieldCharges === 'number' ? player.shieldCharges : 0) + 1); } catch(e) { player.shieldCharges = 1; }
                  player.shieldUntil = (player.shieldUntil || now) + 10000;
                  // record the total duration for HUD progress (remaining from now)
                  try { player._shieldDuration = Math.max(0, (player.shieldUntil || 0) - now); } catch(e) { player._shieldDuration = 10000; }
                  // grant a very short invulnerability to avoid immediate follow-up hits after pickup
                  try { player.invulnerableUntil = Date.now() + 2000; } catch(e) {}
                  try { player._shieldWarned = false; } catch(e){};
                  // small feedback: indicate an extra shield charge was gained
                  try { scorePopups.push({ x: player.x, y: player.y - 20, text: 'Shield +1', vy: -0.05, life: 900, totalLife: 900, color: '#a5d6a7' }); } catch(e) {}
                  try { playSound('blip'); } catch(e) {}
                } else {
                  // new shield
                  player.shieldUntil = Date.now() + 26000; // 26 seconds (tuned for balance)
                  // record the total duration for HUD progress
                  try { player._shieldDuration = 26000; } catch(e) { player._shieldDuration = 26000; }
                  // grant a very short invulnerability to avoid immediate follow-up hits after pickup
                  try { player.invulnerableUntil = Date.now() + 2000; } catch(e) {}
                  try { player._shieldWarned = false; } catch(e){};
                  try { player.shieldCharges = 3; } catch(e) { player.shieldCharges = 3; }
                }
              } catch(e) {}
              try { var _pa = document.getElementById('powerup-announcer'); if (_pa) _pa.textContent = 'Shield collected'; } catch (e) {}
              try { scorePopups.push({ x: player.x, y: player.y - 20, text: 'Shield!', vy: -0.05, life: 900, totalLife: 900, color: '#a5d6a7' }); } catch (e) {}
              try { playSound('shield-collect'); } catch (e) {}
              // Small UI pulse: briefly highlight Lives HUD and Shield badge so pickups are more noticeable
              try { livesPulseUntil = Date.now() + 700; } catch(e){}
              try { const b = (typeof livesEl !== 'undefined' && livesEl) ? (livesEl.querySelector('.shield-badge') || livesEl.querySelector('#lives-shield-badge')) : null; if (b) { try { b.classList.add('pulse'); } catch(e) {} setTimeout(function(){ try { b.classList.remove('pulse'); } catch(e){} }, 1400); } } catch(e){}
              // Accessibility: keep keyboard focus on canvas so keyboard users can continue playing after pickup
              try { const c = document.getElementById('game'); if (c && typeof c.focus === 'function') c.focus(); } catch (e) {}
              try { for (let k=0;k<10;k++) particles.push({ x: pu.x, y: pu.y, vx: (Math.random()-0.5)*2.6, vy: -Math.random()*1.8, r: 2+Math.random()*3, life: 420+Math.random()*320, born: Date.now(), color: '#a5d6a7', leaf: true, spin: (Math.random()-0.5)*0.12 }); } catch (e) {}
            } else if (pu.type === 'spread') {
              // grant a temporary spread shot that fires three angled pellets
              player.spreadUntil = Date.now() + 12000; // 12 seconds
              try { scorePopups.push({ x: player.x, y: player.y - 20, text: 'Spread!', vy: -0.05, life: 900, totalLife: 900, color: '#ffd180' }); } catch (e) {}
              try { playSound('blip'); } catch (e) {}
              try { for (let k=0;k<8;k++) particles.push({ x: pu.x, y: pu.y, vx: (Math.random()-0.5)*2.2, vy: -Math.random()*1.6, r: 2+Math.random()*3, life: 400+Math.random()*300, born: Date.now(), color: '#ffd180' }); } catch (e) {}
            } else if (pu.type === 'bomb') {
              // Bomb: clear nearby enemies around the pickup location
              const blastRadius = 120;
              let killed = 0;
              try {
                for (let k = enemies.length - 1; k >= 0; k--) {
                  const en = enemies[k];
                  const dx2 = en.x - player.x;
                  const dy2 = en.y - player.y;
                  if (Math.sqrt(dx2*dx2 + dy2*dy2) <= blastRadius) {
                    // spawn particles for each killed enemy
                    try {
                      for (let m=0;m<10;m++) particles.push({ x: en.x + (Math.random()-0.5)*8, y: en.y + (Math.random()-0.5)*8, vx: (Math.random()-0.5)*2.4, vy: -Math.random()*2, r: 2+Math.random()*3, life: 400+Math.random()*300, born: Date.now(), color: '#ffccbc' });
                    } catch(ex) {}
                    try { addScoreAndPopup(10, en.x, en.y, '#ffff88'); } catch(e) {}
                    enemies.splice(k,1);
                    killed++;
                  }
                }
              } catch (ex) { /* ignore bomb cleanup errors */ }
              try { scorePopups.push({ x: player.x, y: player.y - 20, text: 'Bomb!', vy: -0.05, life: 900, totalLife: 900, color: '#ffccbc' }); } catch (e) {}
              try { playSound('blip'); } catch (e) {}
            } else if (pu.type === 'pierce') {
              // grant a temporary piercing shot: bullets do not disappear on hit for a short time
              player.pierceUntil = Date.now() + 12000; // 12 seconds
              try { scorePopups.push({ x: player.x, y: player.y - 20, text: 'Pierce!', vy: -0.05, life: 900, totalLife: 900, color: '#b39ddb' }); } catch (e) {}
              try { playSound('blip'); } catch (e) {}
              try { for (let k=0;k<8;k++) particles.push({ x: pu.x, y: pu.y, vx: (Math.random()-0.5)*2.2, vy: -Math.random()*1.6, r: 2+Math.random()*3, life: 400+Math.random()*300, born: Date.now(), color: '#b39ddb' }); } catch (e) {}
              try { var _pa = document.getElementById('powerup-announcer'); if (_pa) _pa.textContent = 'Pierce collected'; } catch (e) {}
            } else if (pu.type === 'slow') {
              // grant a temporary slow effect that reduces enemy speed
              player.slowUntil = Date.now() + 12000; // 12 seconds
              try { var _pa = document.getElementById('powerup-announcer'); if (_pa) _pa.textContent = 'Vine collected: enemies slowed'; } catch (e) {}
              try { scorePopups.push({ x: player.x, y: player.y - 20, text: 'Vine! Slow enemies', vy: -0.05, life: 900, totalLife: 900, color: '#c8e6c9' }); } catch (e) {}
              try { playSound('blip'); } catch (e) {}
              try { for (let k=0;k<10;k++) particles.push({ x: pu.x, y: pu.y, vx: (Math.random()-0.5)*2.4, vy: -Math.random()*1.8, r: 2+Math.random()*3, life: 500+Math.random()*300, born: Date.now(), color: '#c8e6c9' }); } catch (e) {}
            } else if (pu.type === 'mulch') {
              // Mulch: temporary score multiplier (gardening-themed power-up)
              try {
                const now = Date.now();
                // If already have mulch active, stack slightly (up to 2.0), else start at 1.5
                try { player.scoreMultiplier = (typeof player.scoreMultiplier === 'number' ? Math.min(2.0, player.scoreMultiplier + 0.25) : 1.5); } catch(e) { player.scoreMultiplier = 1.5; }
                player.mulchUntil = now + 18000; // 18 seconds
                try { if (player) player._mulchDuration = 18000; } catch(e) {}
                try { player._mulchWarned = false; } catch(e){}
              } catch(e){}
              try { var _pa = document.getElementById('powerup-announcer'); if (_pa) _pa.textContent = '🌿 Mulch collected: score bonus'; } catch (e) {}
              try { scorePopups.push({ x: player.x, y: player.y - 20, text: '🌿 Mulch! x' + (player.scoreMultiplier ? player.scoreMultiplier.toFixed(2) : '1.5'), vy: -0.05, life: 900, totalLife: 900, color: '#a5d6a7' }); } catch (e) {}
              try { playSound('blip'); } catch (e) {}
              try {
                // brief local mulch effect: slow nearby enemies for 2.5s to give players a feel-good recovery (small, garden-themed)
                const now2 = Date.now();
                const mulchRadius = 120;
                for (let mi = enemies.length - 1; mi >= 0; mi--) {
                  const en = enemies[mi];
                  try {
                    const dxm = en.x - player.x;
                    const dym = en.y - player.y;
                    if (Math.sqrt(dxm*dxm + dym*dym) <= mulchRadius) {
                      en.slowUntil = now2 + 2500;
                      en.slowFactor = 0.6;
                      for (let mp=0; mp<6; mp++) particles.push({ x: en.x + (Math.random()-0.5)*8, y: en.y + (Math.random()-0.5)*8, vx: (Math.random()-0.5)*1.2, vy: -Math.random()*1.2, r: 1.2 + Math.random()*1.8, life: 300 + Math.random()*200, born: now2, color:'#8BC34A', leaf: true });
                    }
                  } catch(e){}
                }
              } catch(e){}
              try { for (let k=0;k<8;k++) particles.push({ x: pu.x, y: pu.y, vx: (Math.random()-0.5)*2.4, vy: -Math.random()*1.8, r: 2+Math.random()*3, life: 420+Math.random()*320, born: Date.now(), color: '#a5d6a7' }); } catch (e) {}
            } else if (pu.type === 'life') {
              // grant one extra life (cap to avoid runaway)
              try { lives = Math.min(9, (typeof lives === 'number' ? lives : 0) + 1); } catch (e) { lives = (typeof lives === 'number' ? lives : 0) + 1; }
              try { var _pa = document.getElementById('powerup-announcer'); if (_pa) _pa.textContent = 'Extra life collected'; } catch (e) {}
              try { scorePopups.push({ x: player.x, y: player.y - 20, text: 'Life +1', vy: -0.05, life: 900, totalLife: 900, color: '#ff8a65' }); } catch (e) {}
              try { playSound('blip'); } catch (e) {}
              try { for (let k=0;k<10;k++) particles.push({ x: pu.x, y: pu.y, vx: (Math.random()-0.5)*2.4, vy: -Math.random()*1.8, r: 2+Math.random()*3, life: 500+Math.random()*300, born: Date.now(), color: '#ff8a65' }); } catch (e) {}
              // small visual pulse on the lives HUD and announce to assistive tech
              try { livesPulseUntil = Date.now() + 700; } catch(e){}
              try {
                if (!lifeAnnouncer) lifeAnnouncer = document.getElementById('life-announcer');
                if (lifeAnnouncer) {
                  try { lifeAnnouncer.textContent = 'Extra life. ' + lives + (lives === 1 ? ' life' : ' lives'); } catch (e) {}
                }
              } catch(e) {}
            }
            try { screenShake = Math.min(16, (typeof screenShake === 'number' ? screenShake : 0) + 6); } catch (e) {}
            try { 
              // small pulse effect on power-up collection for satisfying feedback
              powerupPulseUntil = Date.now() + 420;
              lastPowerupColor = (pu.type === 'rapid' ? '#ffe082' : (pu.type === 'shield' ? '#a5d6a7' : (pu.type === 'mulch' ? '#8BC34A' : (pu.type === 'spread' ? '#ffd180' : (pu.type === 'bomb' ? '#ffccbc' : (pu.type === 'pierce' ? '#b39ddb' : (pu.type === 'slow' ? '#c8e6c9' : '#ff8a65')))))));
            } catch (e) {}
            powerups.splice(i,1);
          }
        } catch (e) { /* ignore collection errors */ }
      }
    } catch (e) { /* ignore powerup update errors */ }

    // Shield sparkle and expiry detection: while shield active, spawn sparkles; when it expires, announce and emit expiry particles
    try {
      const now = Date.now();
      const remainingShieldMs = Math.max(0, (player.shieldUntil || 0) - now);
      // warn once when shield is about to expire (<=3s)
      try {
        if (remainingShieldMs > 0 && remainingShieldMs <= 3000 && !player._shieldWarned) {
          try { playSound('blip'); } catch(e){}
          try { var _pa = document.getElementById('powerup-announcer'); if (_pa) _pa.textContent = 'Shield low'; } catch(e){}
          try { player._shieldWarned = true; } catch(e){}
        }
      } catch(e){}
      const shieldActive = remainingShieldMs > 0;
      if (shieldActive && Math.random() < 0.06) {
        // small, short-lived sparkles that orbit near the player
        particles.push({ x: player.x + (Math.random()-0.5)*(player.w*1.2), y: player.y + (Math.random()-0.5)*(player.h*1.2), vx: (Math.random()-0.5)*0.6, vy: -Math.random()*0.6, r: 1 + Math.random()*1.4, life: 300 + Math.random()*200, born: now, color: '#bbdefb' });
      }
      // detect transition from active to inactive to announce expiry once
      try {
        if (lastShieldActive && !shieldActive) {
          // shield just expired
          try { var _pa = document.getElementById('powerup-announcer'); if (_pa) _pa.textContent = 'Shield expired'; } catch(e){}
          try { playSound('shield'); } catch(e){}
          try { player._shieldWarned = false; } catch(e){}
          try {
            for (let k=0;k<12;k++) particles.push({ x: player.x, y: player.y, vx: (Math.random()-0.5)*2.2, vy: -Math.random()*2.0, r: 2+Math.random()*4, life: 400+Math.random()*300, born: now, color: '#90caf9' });
          } catch(e){}
          try { document.body && document.body.setAttribute('data-shield-active','false'); } catch(e){}
        }
        if (shieldActive) {
          try { document.body && document.body.setAttribute('data-shield-active','true'); } catch(e){}
        }
        lastShieldActive = !!shieldActive;
      } catch(e){}
    } catch (e) { /* ignore shield sparkle errors */ }

    // Update active power-up HUD: show the most important active power-up and remaining seconds
    try {
      if (activePowerEl) {
        const now = Date.now();
        let label = '';
        if (now < (player.shieldUntil || 0)) {
          const sec = Math.ceil(((player.shieldUntil || 0) - now) / 1000);
          const charges = (player && typeof player.shieldCharges === 'number' && player.shieldCharges > 0) ? (' x' + player.shieldCharges) : '';
          // Show a shield emoji to make the active Shield power-up more immediately visible in the HUD
          label = '🛡 Shield' + charges + ' — ' + sec + 's';
        } else if (now < (player.fireRateUntil || 0)) {
          const sec = Math.ceil(((player.fireRateUntil || 0) - now) / 1000);
          label = 'Rapid — ' + sec + 's';
        } else if (now < (player.spreadUntil || 0)) {
          const sec = Math.ceil(((player.spreadUntil || 0) - now) / 1000);
          label = 'Spread — ' + sec + 's';
        } else if (now < (player.pierceUntil || 0)) {
          const sec = Math.ceil(((player.pierceUntil || 0) - now) / 1000);
          label = 'Pierce — ' + sec + 's';
        } else if (now < (player.mulchUntil || 0)) {
          // Mulch is a gardening-themed score multiplier; show remaining time in the HUD when active
          const sec = Math.ceil(((player.mulchUntil || 0) - now) / 1000);
          label = '🌿 Mulch — ' + sec + 's';
        } else if (now < (player.slowUntil || 0)) {
          const sec = Math.ceil(((player.slowUntil || 0) - now) / 1000);
          label = 'Vine — ' + sec + 's';
        } else {
          label = '';
        }
        try {
          if (label) {
            // write the label into the existing .power-label element if present to avoid removing the timer node
            try {
              const labelEl = activePowerEl.querySelector('.power-label');
              const timerEl = activePowerEl.querySelector('.power-timer .power-timer-fill');
              if (labelEl) labelEl.textContent = label; else activePowerEl.textContent = label;
            } catch (e) { try { activePowerEl.textContent = label; } catch (ee) {} }
            try { activePowerEl.style.opacity = '0.95'; } catch (e) {}
            try { activePowerEl.setAttribute('aria-hidden', 'false'); } catch (e) {}
            try {
              // color the active power-up HUD to match the collected power-up for quick recognition
              if (lastPowerupColor) { activePowerEl.style.background = lastPowerupColor; activePowerEl.style.color = '#012b30'; }
              try {
                const timer = activePowerEl.querySelector('.power-timer .power-timer-fill');
                if (timer) {
                  let remaining = 0, total = 1;
                  if (now < (player.shieldUntil || 0) && player._shieldDuration) { remaining = Math.max(0, (player.shieldUntil || 0) - now); total = player._shieldDuration || 18000; }
                  else if (now < (player.fireRateUntil || 0)) { remaining = Math.max(0, (player.fireRateUntil || 0) - now); total = 18000; }
                  else if (now < (player.spreadUntil || 0)) { remaining = Math.max(0, (player.spreadUntil || 0) - now); total = 12000; }
                  else if (now < (player.pierceUntil || 0)) { remaining = Math.max(0, (player.pierceUntil || 0) - now); total = 12000; }
                  else if (now < (player.mulchUntil || 0)) { remaining = Math.max(0, (player.mulchUntil || 0) - now); total = player._mulchDuration || 18000; }
                  else if (now < (player.slowUntil || 0)) { remaining = Math.max(0, (player.slowUntil || 0) - now); total = 8000; }
                  const pct = Math.max(0, Math.min(100, Math.round((remaining / Math.max(1,total)) * 100)));
                  try { timer.style.width = pct + '%'; } catch(e) {}
                }
              } catch(e) {}
            } catch (e) {}
          } else {
            try { const labelEl = activePowerEl.querySelector('.power-label'); if (labelEl) labelEl.textContent = ''; } catch (e) {}
            try { activePowerEl.style.opacity = '0.0'; } catch (e) {}
            try { activePowerEl.setAttribute('aria-hidden', 'true'); } catch (e) {}
            try { activePowerEl.style.background = ''; activePowerEl.style.color = ''; } catch (e) {}
          }
          // Also expose shield active status on the document body so CSS can apply a consistent global tint when Shield is active
          try { if (typeof document !== 'undefined' && document.body) { document.body.setAttribute('data-shield-active', (now < (player.shieldUntil || 0)) ? 'true' : 'false'); document.body.setAttribute('data-mulch-active', (now < (player.mulchUntil || 0)) ? 'true' : 'false'); try { var _rem = (player && player.shieldUntil) ? ((player.shieldUntil || 0) - now) : 0; if (now < (player.shieldUntil || 0) && _rem <= 4000) { document.body.setAttribute('data-shield-warning','true'); } else { document.body.setAttribute('data-shield-warning','false'); } } catch(e) {} } } catch(e) {}
        } catch (e) { /* ignore HUD update errors */ }
      }
    } catch (e) { /* ignore active power HUD errors */ }

    screenShake = Math.max(0, screenShake - dt * 0.04);
    // Do not replenish missing current-wave enemies here.
    // The initial spawn path already fills any deficit, and refilling during gameplay
    // makes waves feel endless because defeated enemies get silently replaced.

    const presentForWave = (typeof enemies !== 'undefined' ? enemies.filter(function(e){ try { return e && e.wave === waveNumber; } catch(err){ return false; } }).length : 0);
    if (presentForWave === 0) {
      // Wave cleared: show a brief "Wave X cleared!" toast once per wave for clear progression feedback
      try {
        if ((typeof currentWaveEnemyCount === 'number' && currentWaveEnemyCount > 0) && (typeof lastClearedWave === 'undefined' || lastClearedWave !== waveNumber)) {
          lastClearedWave = waveNumber;
          try {
            // If maxWaves is configured and this was the final wave, declare victory
            if (typeof maxWaves !== 'undefined' && maxWaves > 0 && waveNumber >= maxWaves) {
              gameOver = true;
              paused = true;
              try { if (score > highScore) { highScore = score; saveHighScoreDebounced(highScore); } } catch (e) {}
              try {
                if (typeof overlay !== 'undefined' && overlay && overlayMessage) {
                  overlay.setAttribute('aria-hidden','false');
                  overlayMessage.textContent = 'Victory! You beat the garden — Final Score: ' + score + ' — Press R to play again';
                  if (replayBtn) try { replayBtn.focus(); } catch(e){}
                }
              } catch (e) {}

              // Celebratory particles and audio (respect user's prefers-reduced-motion setting)
              try {
                const prefersReducedMotionLocal = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
                if (!prefersReducedMotionLocal) {
                  try {
                    const burstCount = 28;
                    for (let i = 0; i < burstCount; i++) {
                      const angle = Math.random() * Math.PI * 2;
                      const speed = 1 + Math.random() * 3;
                      particles.push({
                        x: (typeof cw === 'number' ? cw/2 : (canvas ? (canvas.getBoundingClientRect().width/2) : 0)) + (Math.random() - 0.5) * 40,
                        y: (typeof ch === 'number' ? ch/2 : (canvas ? (canvas.getBoundingClientRect().height/2) : 0)) - 20 + (Math.random() - 0.5) * 40,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed - 0.6,
                        r: 2 + Math.random() * 4,
                        life: 600 + Math.random() * 800,
                        born: Date.now(),
                        color: ['#ffd54f','#ff8a65','#66bb6a','#29b6f6','#ab47bc'][Math.floor(Math.random() * 5)],
                        petal: Math.random() < 0.5
                      });
                    }
                  } catch (e) { /* ignore particle spawn errors */ }
                  try { screenShake = Math.min(30, (typeof screenShake === 'number' ? screenShake : 0) + 10); } catch (e) {}
                }
                // Play a victory chime even if reduced motion is preferred (audio is not motion), but respect soundEnabled
                try { if (soundEnabled) { ensureAudio(); playSound('wave'); } } catch (e) {}
              } catch (e) { /* ignore celebratory errors */ }
            }
          } catch(e) {}

          try {
            let wt = document.getElementById('wave-cleared-toast');
            if (!wt) {
              wt = document.createElement('div');
              wt.id = 'wave-cleared-toast';
              wt.setAttribute('role','status');
              wt.setAttribute('aria-live','polite');
              wt.style.position = 'fixed';
              wt.style.left = '50%';
              wt.style.top = '14px';
              wt.style.transform = 'translateX(-50%)';
              wt.style.background = 'rgba(0,0,0,0.72)';
              wt.style.color = '#fff';
              wt.style.padding = '8px 12px';
              wt.style.borderRadius = '8px';
              wt.style.zIndex = '10001';
              wt.style.fontSize = '15px';
              wt.style.pointerEvents = 'none';
              wt.style.opacity = '0';
              wt.style.transition = 'opacity 200ms ease, transform 200ms ease';
              document.body.appendChild(wt);
            }
            try { wt.textContent = 'Wave ' + waveNumber + ' cleared!'; } catch(e){}
            try {
              // If this was the configured final wave, make the toast more prominent and last longer
              const isFinal = (typeof maxWaves === 'number' && maxWaves > 0 && waveNumber >= maxWaves);
              if (isFinal) {
                try { wt.style.background = 'linear-gradient(90deg,#ffd54f,#ff8a65)'; wt.style.color = '#012b30'; wt.style.fontSize = '16px'; } catch(e){}
              } else {
                try { wt.style.background = 'rgba(0,0,0,0.72)'; wt.style.color = '#fff'; } catch(e){}
              }
              wt.style.opacity = '1';
              wt.style.transform = 'translateX(-50%) translateY(0)';
            } catch(e){}
            try { playSound('blip'); } catch(e){}
            try {
              const nb = document.getElementById('nextWaveBtn');
              if (nb) {
                nb.classList.add('highlight-next-wave');
                setTimeout(() => { try { nb.classList.remove('highlight-next-wave'); } catch(e) {} }, 1800);
              }
            } catch(e) {}
            // Show longer for final wave
            const hideDelay = (typeof maxWaves === 'number' && maxWaves > 0 && waveNumber >= maxWaves) ? 2800 : 1800;
            const removeDelay = (typeof maxWaves === 'number' && maxWaves > 0 && waveNumber >= maxWaves) ? 4200 : 2600;
            setTimeout(() => { try { wt.style.opacity = '0'; } catch(e){} }, hideDelay);
            setTimeout(() => { try { if (wt && wt.parentNode) wt.parentNode.removeChild(wt); } catch(e){} }, removeDelay);
          } catch(e){}
        }
      } catch(e){}
      // Add a short recovery window between waves so players get a brief respite.
      // Reward milestone: grant 1 extra life every 5 waves to give players a clear progression milestone.
      try {
        if (typeof waveNumber === 'number' && waveNumber > 0 && waveNumber % 5 === 0) {
          try {
            if (typeof lives === 'number') {
              // cap lives to avoid runaway growth
              lives = Math.min(9, lives + 1);
              try { scorePopups.push({ x: player.x, y: player.y - 20, text: 'Extra life!', vy: -0.05, life: 900, totalLife: 900, color: '#ff8a65' }); } catch(e){}
              try { playSound('blip'); } catch(e){}
              // small visual pulse on the lives HUD
              try { livesPulseUntil = Date.now() + 700; } catch(e){}
            }
          } catch(e){}
        }
      } catch(e){}

      // Pacing aid: spawn a guaranteed Shield power-up every 2 waves to aid recovery and pacing.
      try {
        if (typeof waveNumber === 'number' && waveNumber > 0 && waveNumber % 2 === 0) {
          try {
            // spawn shield slightly above the player so it's easy to collect but not instant
            const spawnY = (typeof player === 'object' && typeof player.y === 'number') ? Math.max(40, player.y - 120) : Math.max(40, ch * 0.2);
            // Avoid spawning a second shield very close to an existing one (defensive: prevents accidental duplicate spawns)
            (function(){
              const spawnX = (player && typeof player.x === 'number') ? player.x : cw/2;
              const nearbyShield = powerups.some(p => p && p.type === 'shield' && Math.abs((p.x||0) - spawnX) < 48 && Math.abs((p.y||0) - spawnY) < 48);
              if (nearbyShield) return;
              if (powerups.length < 6) {
                powerups.push({ x: spawnX, y: spawnY, vy: 0.06, type: 'shield', born: Date.now(), life: 12000 });
                // Defensive: keep powerup count bounded to avoid pathological growth during long runs
                if (powerups.length > 8) powerups.shift();
                try {
                  // One-time helpful tip: show a brief overlay message the first time a Shield appears to aid discoverability
                  if (typeof localStorage !== 'undefined' && !localStorage.getItem('seenShieldTipV1')) {
                    try { if (overlayMessage) { overlayMessage.textContent = 'Tip: Collect 🛡 to absorb an enemy hit. Tap or press Esc to dismiss.'; setTimeout(function(){ try { overlayMessage.textContent = ''; } catch(e){} }, 3800); } } catch(e){}
                    try { localStorage.setItem('seenShieldTipV1', '1'); } catch(e){}
                  }
                } catch(e) {}
                // Small, transient hint to draw attention to the spawned shield: pulse the Lives HUD and show a brief toast
                try {
                  shieldNearbyHintUntil = Date.now() + 2200;
                  try { if (typeof livesEl !== 'undefined' && livesEl) { livesEl.classList.add('shield-spawn-pulse'); setTimeout(function(){ try { livesEl.classList.remove('shield-spawn-pulse'); } catch(e){} }, 1800); } } catch(e){}
                  try {
                    let st = document.getElementById('shield-nearby-toast');
                    if (!st) {
                      st = document.createElement('div');
                      st.id = 'shield-nearby-toast';
                      st.setAttribute('role','status'); st.setAttribute('aria-live','polite');
                      st.style.position = 'fixed'; st.style.left = '50%'; st.style.top = '60px'; st.style.transform = 'translateX(-50%)';
                      st.style.background = 'rgba(0,0,0,0.72)'; st.style.color = '#fff'; st.style.padding = '6px 10px'; st.style.borderRadius = '8px'; st.style.zIndex = '10002'; st.style.pointerEvents = 'none';
                      document.body.appendChild(st);
                    }
                    try { st.textContent = 'Shield nearby!'; } catch(e){}
                    setTimeout(function(){ try { if (st && st.parentNode) st.parentNode.removeChild(st); } catch(e){} }, 2200);
                  } catch(e) {}
                } catch(e) {}
              } else {
                // if full, rotate oldest out to keep variety
                powerups.shift();
                powerups.push({ x: spawnX, y: spawnY, vy: 0.06, type: 'shield', born: Date.now(), life: 12000 });
              }
            })();
            try { playSound('shield'); } catch(e){}
            try { scorePopups.push({ x: (player && typeof player.x === 'number') ? player.x : cw/2, y: (player && typeof player.y === 'number') ? player.y - 20 : ch/2, text: 'Shield nearby!', vy: -0.05, life: 900, totalLife: 900, color: '#a5d6a7' }); } catch(e){}
          } catch(e){}
        }
      } catch(e){}

      // Base inter-wave delay (ms). Shortened slightly to make runs feel more complete and snappier
      // Tweak: reduce base and growth slightly for snappier pacing and better beatability
      let interWaveDelay = 650 + Math.min(1000, Math.floor(waveNumber * 25));
      // Reduce delay for the first three waves so new players see clearer progression quickly
      // Give players a bit more breathing room on the first few waves for better beatability.
      // Previously early waves used a very short 600ms delay; increase early delay to at least 1400ms for better recovery between waves
      // and reduce the aggressive subtraction so early pacing feels less abrupt.
      try { if (waveNumber <= 3) interWaveDelay = Math.max(1400, interWaveDelay - 400); } catch (e) {}
      // If the player is low on lives, extend the inter-wave delay to provide extra recovery time.
      try { if (typeof lives === 'number' && lives <= 1) interWaveDelay += 1200; } catch (e) {}
       // Auto-schedule a short auto-advance to the next wave shortly after a clear to improve pacing (1.2s respite).
       // This is small, respects the existing Next Wave button, and only runs when not on the final configured wave.
       try {
         if (!gameOver && (typeof maxWaves !== 'number' || waveNumber < maxWaves)) {
           if (!scheduledSpawnTimeout) {
             scheduledSpawnTimeout = setTimeout(function(){ try { lastSpawn = Date.now(); spawnWave(); scheduledSpawnTimeout = null; } catch(e){} }, 1400);
           }
         }
       } catch(e) {}
      // Show a small countdown HUD during the inter-wave delay so players know when the next wave starts.
      try {
        const elapsed = Date.now() - lastSpawn;
        const remainingMs = Math.max(0, interWaveDelay - elapsed);
        if (remainingMs > 0) {
          let nw = document.getElementById('next-wave-countdown');
          if (!nw) {
            nw = document.createElement('div');
            nw.id = 'next-wave-countdown';
            nw.setAttribute('role','status');
            nw.setAttribute('aria-live','polite');
            nw.style.position = 'fixed';
            nw.style.right = '14px';
            nw.style.top = '14px';
            nw.style.background = 'rgba(0,0,0,0.62)';
            nw.style.color = '#fff';
            nw.style.padding = '6px 10px';
            nw.style.borderRadius = '8px';
            nw.style.zIndex = '10001';
            nw.style.fontSize = '13px';
            nw.style.pointerEvents = 'none';
            nw.style.opacity = '0';
            nw.style.transition = 'opacity 200ms ease, transform 200ms ease';
            document.body.appendChild(nw);
          }
          // Update countdown with fractional seconds and refresh regularly so players see live pacing feedback
          const updateCountdown = function(){
            try {
              const rem = Math.max(0, interWaveDelay - (Date.now() - lastSpawn));
              nw.textContent = 'Next wave in ' + (rem/1000).toFixed(1) + 's';
              nw.style.opacity = '1';
              nw.style.transform = 'translateY(0)';
            } catch(e){}
          };
          try { updateCountdown(); } catch(e){}
          try { if (!nw._countdownInterval) nw._countdownInterval = setInterval(updateCountdown, 200); } catch(e){}
        } else {
          // ready to spawn: only proceed if current wave enemies have been cleared.
          try {
            const present = (typeof enemies !== 'undefined' ? enemies.filter(function(e){ try { return e && e.wave === waveNumber; } catch(err){ return false; } }).length : 0);
            if (present === 0) {
              const nw = document.getElementById('next-wave-countdown'); if (nw) { try { if (nw._countdownInterval) { clearInterval(nw._countdownInterval); nw._countdownInterval = null; } } catch(e){} if (nw.parentNode) try { nw.parentNode.removeChild(nw); } catch(e){} }
              // If this was the final configured wave, trigger a victory state so runs feel beatable
              try {
                if (typeof maxWaves === 'number' && maxWaves > 0 && waveNumber >= maxWaves) {
                  gameOver = true;
                  paused = true;
                  // Persist high score if beaten
                  try { if (score > highScore) { highScore = score; saveHighScoreDebounced(highScore); } } catch(e){}
                  // celebratory audio/particles
                  try { playSound('blip'); } catch(e){}
                  try {
                    for (let p=0;p<28;p++) particles.push({ x: player.x + (Math.random()-0.5)*40, y: player.y - 20 + (Math.random()-0.5)*20, vx: (Math.random()-0.5)*3, vy: -Math.random()*2 - 0.6, r: 2 + Math.random()*3, life: 800 + Math.random()*600, born: Date.now(), color: (Math.random()<0.5? '#ffe082' : '#a5d6a7') });
                  } catch(e){}
                  try { if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(true); updateOverlayMessage(); if (replayBtn) try { replayBtn.focus(); } catch(e){} } } catch(e){}
                } else {
                  // Give player a brief recovery pause and a small reward for clearing the wave
                  try {
                    const bonus = 10 + (typeof lives === 'number' ? (lives * 5) : 0);
                    try { addScoreAndPopup(bonus, player.x, player.y - 20, '#ffff88'); } catch(e){}
                    if (scoreEl) try { scoreEl.textContent = 'Score: ' + score; } catch(e){}
                    try { playSound('blip'); } catch(e) {}
                  } catch(e) {}
                  try { let ann = document.getElementById('wave-announcer'); if (ann) try { ann.textContent = 'Wave ' + waveNumber + ' cleared!'; } catch(e) {} } catch(e) {}
                  // Schedule the next wave after a short pause so players get a clear recovery window
                  try {
                    if (scheduledSpawnTimeout) { clearTimeout(scheduledSpawnTimeout); scheduledSpawnTimeout = null; }
                    scheduledSpawnTimeout = setTimeout(function(){ try { lastSpawn = Date.now(); spawnWave(); scheduledSpawnTimeout = null; } catch(e){} }, Math.max(1400, Math.min(interWaveDelay, 3500)));
                  } catch(e){}
                }
              } catch(e){}
            } else {
              // There are still enemies from this wave; update countdown element to indicate waiting.
              let nw = document.getElementById('next-wave-countdown');
              if (nw) {
                try { nw.textContent = 'Waiting for ' + present + ' enemy' + (present===1 ? '' : 'ies') + '...'; } catch(e){}
                try { nw.style.opacity = '1'; nw.style.transform = 'translateY(0)'; } catch(e){}
              }
              // Nudge lastSpawn so we re-check shortly but avoid immediate repeated spawns
              try { lastSpawn = Date.now() - Math.max(0, interWaveDelay - 600); } catch(e){}
            }
          } catch(e) {
            // Fallback: remove countdown and spawn if errors occur
            const nw = document.getElementById('next-wave-countdown'); if (nw) { try { if (nw._countdownInterval) { clearInterval(nw._countdownInterval); nw._countdownInterval = null; } } catch(e){} if (nw.parentNode) try { nw.parentNode.removeChild(nw); } catch(e){} }
            lastSpawn = Date.now(); spawnWave();
          }
        }
      } catch(e) {
        // fallback to original behaviour on any error
        if (Date.now() - lastSpawn > interWaveDelay) { lastSpawn = Date.now(); spawnWave(); }
      }
    }
  }

  function draw() {
    ctx.clearRect(0,0,cw,ch);
    ctx.save();
    if (screenShake > 0 && !prefersReducedMotion) { const effectiveShake = (typeof player !== 'undefined' && Date.now() < (player.shieldUntil || 0)) ? (screenShake * 0.55) : screenShake; const sx = (Math.random()*2-1) * effectiveShake; const sy = (Math.random()*2-1) * effectiveShake; ctx.translate(sx, sy); }
    // animated background gradient (subtle, respects reduced-motion)
    try {
      if (prefersReducedMotion) {
        ctx.fillStyle = '#b3e5fc';
      } else {
        const bgShift = Math.sin(Date.now() * 0.00032) * 8;
        const topColor = 'hsl(' + (197 + bgShift).toFixed(2) + ', 70%, 92%)';
        const bottomColor = 'hsl(' + (210 + bgShift).toFixed(2) + ', 70%, 82%)';
        const bgGrad = ctx.createLinearGradient(0,0,0,ch);
        bgGrad.addColorStop(0, topColor);
        bgGrad.addColorStop(1, bottomColor);
        ctx.fillStyle = bgGrad;
      }
      ctx.fillRect(0,0,cw,ch);
    } catch (e) { ctx.fillStyle = '#b3e5fc'; ctx.fillRect(0,0,cw,ch); }
    try {
      if (gardenBackgroundAsset && gardenBackgroundAsset.ready && gardenBackground.naturalWidth > 0 && gardenBackground.naturalHeight > 0) {
        const scale = Math.max(cw / gardenBackground.naturalWidth, ch / gardenBackground.naturalHeight);
        const drawW = gardenBackground.naturalWidth * scale;
        const drawH = gardenBackground.naturalHeight * scale;
        const drawX = (cw - drawW) / 2;
        const drawY = (ch - drawH) / 2;
        // subtle vertical parallax oscillation to bring the background to life (very low amplitude)
        const yShift = Math.sin(Date.now() * 0.00028) * Math.min(40, ch * 0.03);
        ctx.save();
        ctx.globalAlpha = 0.52;
        ctx.drawImage(gardenBackground, drawX, drawY + yShift, drawW, drawH);
        ctx.restore();
        ctx.save();
        const artOverlay = ctx.createLinearGradient(0, 0, 0, ch);
        artOverlay.addColorStop(0, 'rgba(255,255,255,0.06)');
        artOverlay.addColorStop(0.55, 'rgba(255,255,255,0.02)');
        artOverlay.addColorStop(1, 'rgba(18,40,18,0.16)');
        ctx.fillStyle = artOverlay;
        ctx.fillRect(0, 0, cw, ch);
        ctx.restore();
      }
    } catch (e) { /* ignore background art drawing errors */ }
    // draw subtle drifting background clouds (behind leaves)
    try {
      if (bgClouds && bgClouds.length) {
        // subtle parallax based on player position for extra depth
        const parallaxX = (player && typeof player.x === 'number') ? (player.x - (cw * 0.5)) * 0.04 : 0;
        ctx.save();
        // translate the whole cloud layer by a small amount opposite the player's movement
        ctx.translate(parallaxX, 0);
        for (const c of bgClouds) {
          try {
            ctx.save();
            ctx.globalAlpha = c.alpha;
            ctx.fillStyle = '#ffffff';
            const x = c.x, y = c.y, w = c.w, h = c.h;
            // soft cloud made from overlapping ellipses
            ctx.beginPath();
            ctx.ellipse(x, y, w * 0.5, h * 0.6, 0, 0, Math.PI * 2);
            ctx.ellipse(x + w * 0.22, y - h * 0.12, w * 0.36, h * 0.5, 0, 0, Math.PI * 2);
            ctx.ellipse(x - w * 0.22, y - h * 0.12, w * 0.36, h * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } catch (e) { /* ignore single cloud draw error */ }
        }
        ctx.globalAlpha = 1;
      }
    } catch (e) { /* ignore bg cloud draw errors */ }

    // draw subtle drifting background leaves behind game objects
    try {
      if (bgLeaves && bgLeaves.length) {
        for (const l of bgLeaves) {
          try {
            ctx.save();
            ctx.globalAlpha = l.alpha;
            ctx.translate(l.x, l.y);
            ctx.rotate(l.angle || 0);
            ctx.fillStyle = l.color || '#8BC34A';
            ctx.beginPath();
            ctx.ellipse(0, 0, l.r * 1.2, Math.max(1, l.r * 0.5), 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } catch (e) { /* ignore single leaf draw error */ }
        }
        ctx.globalAlpha = 1;
      }
    } catch (e) { /* ignore bg leaf draw errors */ }
    // subtle vignette to focus the play area and improve HUD readability on busy backgrounds
    try {
      ctx.save();
      const vx = cw * 0.5;
      const vy = ch * 0.35;
      const inner = Math.min(cw, ch) * 0.12;
      const outer = Math.max(cw, ch) * 0.9;
      const vignette = ctx.createRadialGradient(vx, vy, inner, vx, vy, outer);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(0.6, 'rgba(0,0,0,0.06)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.18)');
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = vignette;
      ctx.fillRect(0,0,cw,ch);
      ctx.restore();
    } catch (e) { /* ignore vignette errors */ }
    const g = ctx.createLinearGradient(0,ch-180,0,ch); g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(1,'rgba(0,0,0,0.06)'); ctx.fillStyle = g; ctx.fillRect(0,ch-180,cw,180);
    // Compact in-canvas HUD when DOM HUD is hidden: show wave and remaining enemies in top-right
    try {
      if (typeof hudVisible !== 'undefined' && !hudVisible) {
        ctx.save();
        try {
          const present = (typeof enemies !== 'undefined' ? enemies.filter(function(e){ try { return e && e.wave === waveNumber; } catch(err){ return false; } }).length : 0);
          const rem = Math.max(0, (typeof currentWaveEnemyCount !== 'undefined' ? currentWaveEnemyCount : 0) - present);
          const total = (typeof currentWaveEnemyCount !== 'undefined' ? currentWaveEnemyCount : 0);
          const txt = 'Wave ' + (typeof waveNumber !== 'undefined' ? waveNumber : 0) + ' — ' + rem + '/' + total + ' left';
          ctx.font = '13px sans-serif';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
          const x = Math.max(12, cw - 12);
          const y = 12;

          // draw a subtle rounded backdrop behind the compact HUD text to improve readability
          try {
            const padding = 8;
            const metrics = ctx.measureText ? ctx.measureText(txt) : { width: txt.length * 8 };
            const textWidth = Math.ceil(metrics.width);
            const rectW = textWidth + padding * 2;
            const rectH = 20;
            const rectX = x - rectW;
            const rectY = y - 4;
            const radius = 8;
            ctx.fillStyle = 'rgba(0,0,0,0.28)';
            // rounded rect
            ctx.beginPath();
            ctx.moveTo(rectX + radius, rectY);
            ctx.arcTo(rectX + rectW, rectY, rectX + rectW, rectY + rectH, radius);
            ctx.arcTo(rectX + rectW, rectY + rectH, rectX, rectY + rectH, radius);
            ctx.arcTo(rectX, rectY + rectH, rectX, rectY, radius);
            ctx.arcTo(rectX, rectY, rectX + rectW, rectY, radius);
            ctx.closePath();
            ctx.fill();
            // subtle border for separation
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255,255,255,0.04)';
            ctx.stroke();
          } catch (be) { /* ignore backdrop drawing errors */ }

          // subtle outline for readability
          ctx.lineWidth = 4;
          ctx.strokeStyle = 'rgba(0,0,0,0.52)';
          ctx.strokeText(txt, x, y);
          ctx.fillStyle = 'rgba(255,255,255,0.92)';
          ctx.fillText(txt, x, y);
        } catch (e) { /* ignore compact HUD draw errors */ }
        ctx.restore();
      }
    } catch (e) { /* ignore HUD visibility check errors */ }

    // In-canvas large wave counter (always visible near top-center) — small, readable, garden-themed
    try {
      const waveText = 'Wave ' + (typeof waveNumber !== 'undefined' ? waveNumber : 0) + (typeof maxWaves === 'number' && maxWaves > 0 ? ('/' + maxWaves) : '');
      ctx.save();
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const tx = Math.max(12, cw / 2);
      const ty = 12;
      // subtle backdrop
      const metrics2 = ctx.measureText ? ctx.measureText(waveText) : { width: waveText.length * 10 };
      const pad2 = 10;
      const rw = Math.ceil(metrics2.width) + pad2 * 2;
      const rh = 26;
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      // rounded rect
      const rx = tx - rw / 2;
      const ry = ty - 4;
      const rr = 10;
      ctx.beginPath();
      ctx.moveTo(rx + rr, ry);
      ctx.arcTo(rx + rw, ry, rx + rw, ry + rh, rr);
      ctx.arcTo(rx + rw, ry + rh, rx, ry + rh, rr);
      ctx.arcTo(rx, ry + rh, rx, ry, rr);
      ctx.arcTo(rx, ry, rx + rw, ry, rr);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.stroke();
      // wave text with outline
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.strokeText(waveText + ' 🌱', tx, ty);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fillText(waveText + ' 🌱', tx, ty);
      ctx.restore();
    } catch (e) {}

    // Brief red flash overlay when a life is lost to increase clarity of life loss (respects reduced-motion)
    try {
      if (Date.now() < livesFlashUntil && !prefersReducedMotion) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,56,56,0.18)';
        ctx.fillRect(0,0,cw,ch);
        ctx.restore();
      }
    } catch (e) { /* ignore flash errors */ }

    // Brief garden hit flash overlay when an enemy is hit to improve hit feedback (respects reduced-motion)
    try {
      if (Date.now() < (canvasHitFlashUntil || 0) && !prefersReducedMotion) {
        const remaining = (canvasHitFlashUntil || 0) - Date.now();
        // Slightly more focused, brighter radial flash for clearer feedback while keeping it brief.
        const dur = 420; // a touch longer so the peak is visible
        const t = Math.max(0, Math.min(1, remaining / dur));
        // Slight ease curve to emphasize the initial peak
        const alpha = Math.max(0, Math.min(1.0, 1.0 * Math.pow(Math.max(0, t), 0.55)));
        const cx = (typeof canvasHitFlashX === 'number' && canvasHitFlashX) ? canvasHitFlashX : (cw * 0.5);
        const cy = (typeof canvasHitFlashY === 'number' && canvasHitFlashY) ? canvasHitFlashY : (ch * 0.45);
        // use a smaller radius so the flash feels more local and punchy
        const radius = Math.max(cw, ch) * 0.65;
        try {
          const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
          g2.addColorStop(0, 'rgba(160,240,160,' + (Math.min(1, alpha * 1.08)).toFixed(3) + ')');
          g2.addColorStop(0.35, 'rgba(255,235,140,' + (alpha * 0.82).toFixed(3) + ')');
          g2.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.save();
          // use 'screen' for a slightly stronger, crisper blend on varied backgrounds
          ctx.globalCompositeOperation = 'screen';
          ctx.fillStyle = g2;
          ctx.fillRect(0,0,cw,ch);
          ctx.restore();
        } catch (innerE) {
          try { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(255,235,140,' + alpha.toFixed(3) + ')'; ctx.fillRect(0,0,cw,ch); ctx.restore(); } catch (e) { /* ignore fallback errors */ }
        }
      }
    } catch (e) { /* ignore hit flash errors */ }

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
    const potCount = 0; // removed decorative pots to reduce bottom clutter (per suggestion)
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
    try {
      const _recoilX = (player && Date.now() < (player.recoilUntil || 0) && !prefersReducedMotion) ? (player.recoilX || 0) : 0;
      const _recoilY = (player && Date.now() < (player.recoilUntil || 0) && !prefersReducedMotion) ? (player.recoilY || 0) : 0;
      ctx.translate((player && typeof player.x === 'number' ? player.x : 0) + _recoilX, (player && typeof player.y === 'number' ? player.y : 0) + _recoilY);
    } catch (e) { try { ctx.translate(player.x, player.y); } catch (e2) {} }
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
    // If Rapid power-up is active, draw a subtle glow halo and show remaining seconds above the player
    // Also: while Shield is active, draw a subtle pulsing ring around the player so the active Shield state is more immediately visible.
    try {
      if (player && Date.now() < (player.shieldUntil || 0)) {
        const _now = Date.now();
        const _pulse = 1 + 0.08 * Math.sin(_now / 120);
        try {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          // subtle outer ring (centered on player local coordinates since ctx is translated)
          ctx.lineWidth = 4;
          ctx.strokeStyle = 'rgba(165,214,167,0.9)';
          ctx.shadowBlur = 14;
          ctx.shadowColor = 'rgba(165,214,167,0.6)';
          const rx = Math.max(18, (player.w || 20) * 1.6 * _pulse);
          const ry = Math.max(12, (player.h || 16) * 1.6 * _pulse);
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
          // inner subtle ring for depth
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255,255,255,0.32)';
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(255,255,255,0.12)';
          ctx.beginPath();
          ctx.ellipse(0, 0, Math.max(10, rx - 8), Math.max(8, ry - 6), 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        } catch (e) { /* ignore shield draw errors */ }
      }
    } catch (e) { /* ignore shield ring errors */ }
    try {
      if (player && (player.fireRate > 1) && Date.now() < (player.fireRateUntil || 0)) {
        // calculate remaining time
        const _remainingMs = Math.max(0, (player.fireRateUntil || 0) - Date.now());
        const _remainingSec = Math.ceil(_remainingMs / 1000);

        // soft yellow glow around player
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,235,59,0.12)'; // soft yellow glow
        ctx.ellipse(0,0,player.w * 1.8, player.h * 1.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // draw remaining seconds above the player so it's visible while Rapid is active
        try {
          ctx.save();
          // position text just above the player's top
          ctx.translate(player.x - player.x, -player.h - 8);
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          const _txt = _remainingSec + 's';
          // subtle outline for readability
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(0,0,0,0.6)';
          ctx.fillStyle = 'rgba(255,245,157,0.95)';
          ctx.strokeText(_txt, 0, 0);
          ctx.fillText(_txt, 0, 0);
          ctx.restore();
        } catch (e) { /* ignore text draw errors */ }
      }
    } catch (e) { /* ignore glow draw errors */ }

    // Draw shield ring and charge indicators when Shield is active to improve visibility and feedback
    try {
      if (player && Date.now() < (player.shieldUntil || 0)) {
        // soft blue ring with light bloom
        try {
          ctx.save();
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(102,187,106,0.78)';
          ctx.lineWidth = 4;
          // subtle shadow for a gentle glow (keeps effect low-cost)
          ctx.shadowColor = 'rgba(165,214,167,0.55)';
          ctx.shadowBlur = 8;
          ctx.ellipse(0, 0, player.w * 1.9, player.h * 1.9, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        } catch (e) { /* ignore ring draw errors */ }

        // When shield charges are low, add a stronger warm pulsing highlight to draw attention to imminent depletion
        try {
          const chargesPreview = Math.max(0, player.shieldCharges || 0);
          if (chargesPreview <= 1) {
            try {
              ctx.save();
              const pulse = 1 + 0.18 * Math.sin(Date.now() / 120);
              ctx.beginPath();
              ctx.strokeStyle = 'rgba(255,204,79,0.88)';
              ctx.lineWidth = 6;
              ctx.shadowColor = 'rgba(255,204,79,0.36)';
              ctx.shadowBlur = 14;
              ctx.ellipse(0, 0, player.w * 2.1 * pulse, player.h * 2.1 * pulse, 0, 0, Math.PI * 2);
              ctx.stroke();
              ctx.restore();
            } catch (e) { /* ignore low-charge highlight errors */ }
          }
        } catch (e) { /* ignore preview errors */ }

        // Draw small charge dots above the player to indicate remaining shield charges
        try {
          const charges = Math.max(0, player.shieldCharges || 0);
          if (charges > 0) {
            ctx.save();
            ctx.translate(0, -player.h - 14);
            // stronger fill for readability on varied backgrounds
            ctx.fillStyle = 'rgba(102,187,106,0.95)';
            for (let i = 0; i < charges; i++) {
              const cx = (i - (charges - 1) / 2) * 10;
              ctx.beginPath();
              ctx.arc(cx, 0, 3.5, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          }
        } catch (e) { /* ignore charge-dot errors */ }

        // Draw remaining shield time in seconds above the player for quick feedback
        try {
          const now = Date.now();
          const remMs = Math.max(0, (player.shieldUntil || 0) - now);
          const remSec = Math.ceil(remMs / 1000);
          if (remMs > 0) {
            ctx.save();
            ctx.translate(0, -player.h - 30);
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            // outline for readability on busy backgrounds
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(0,0,0,0.6)';
            ctx.fillStyle = 'rgba(165,214,167,0.98)';
            const txt = remSec + 's';
            try { ctx.strokeText(txt, 0, 0); } catch (e) {}
            try { ctx.fillText(txt, 0, 0); } catch (e) {}
            ctx.restore();
          }
        } catch (e) { /* ignore shield-timer draw errors */ }
      }
    } catch (e) { /* ignore shield draw errors */ }

    // Brief player pulse when a power-up was recently collected
    try {
      if (Date.now() < (powerupPulseUntil || 0)) {
        const rem = Math.max(0, (powerupPulseUntil || 0) - Date.now());
        const alpha = Math.max(0, Math.min(1, rem / 420));
        const col = lastPowerupColor || '#ffd54f';
        ctx.beginPath();
        ctx.strokeStyle = col.replace('#','rgba(' + parseInt(col.slice(1,3),16) + ',' + parseInt(col.slice(3,5),16) + ',' + parseInt(col.slice(5,7),16) + ',') + alpha.toFixed(3) + ')';
        ctx.lineWidth = 6 * (0.8 + 0.4 * alpha);
        ctx.ellipse(0,0,player.w * (1.6 + 0.4 * (1 - alpha)), player.h * (1.6 + 0.4 * (1 - alpha)), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } catch (e) { /* ignore pulse draw errors */ }
    // player body (with brief hit flash ring when recently hit)
    try {
      if (Date.now() < (player.hitFlashUntil || 0) && !prefersReducedMotion) {
        const _alpha = Math.max(0, Math.min(1, ((player.hitFlashUntil || 0) - Date.now()) / 320));
        ctx.strokeStyle = 'rgba(255,255,255,' + (_alpha * 0.9).toFixed(3) + ')';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0,0,player.w * 1.36, player.h * 1.36, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } catch (e) {}
    let drewPlayerSprite = false;
    try {
      if (playerSpriteAsset && playerSpriteAsset.ready && playerSprite) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, 0, player.w, player.h, 0, 0, Math.PI * 2);
        ctx.clip();
        drewPlayerSprite = drawImageCover(playerSprite, -player.w, -player.h, player.w * 2, player.h * 2);
        ctx.restore();
        if (drewPlayerSprite) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255,255,255,0.68)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(0, 0, player.w, player.h, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }
    } catch (e) { drewPlayerSprite = false; }
    if (!drewPlayerSprite) {
      ctx.fillStyle = '#2e8b57';
      ctx.beginPath(); ctx.ellipse(0,0,player.w,player.h,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#000'; ctx.fillRect(-8,-4,16,8);
    }
    ctx.restore();

    // draw shield ring if active (pulses to indicate remaining time)
    try {
      if (Date.now() < (player.shieldUntil || 0)) {
        ctx.save();
        try {
          const _recoilX = (player && Date.now() < (player.recoilUntil || 0) && !prefersReducedMotion) ? (player.recoilX || 0) : 0;
          const _recoilY = (player && Date.now() < (player.recoilUntil || 0) && !prefersReducedMotion) ? (player.recoilY || 0) : 0;
          ctx.translate((player && typeof player.x === 'number' ? player.x : 0) + _recoilX, (player && typeof player.y === 'number' ? player.y : 0) + _recoilY);
        } catch (e) { try { ctx.translate(player.x, player.y); } catch (e2) {} }
        // Show a subtle pulse and alpha change based on remaining shield time so players can see when it will expire
        const _remaining = Math.max(0, (player.shieldUntil || 0) - Date.now());
        const _frac = Math.max(0, Math.min(1, _remaining / 20000)); // fraction of 20s duration remaining
        const _pulse = 1 + 0.08 * Math.sin(Date.now() * 0.02);
        // soft halo behind the shield for stronger visual clarity (additive blend)
        try {
          ctx.save();
          try { ctx.globalCompositeOperation = 'lighter'; } catch (e) {}
          const haloR = Math.max(player.w, player.h) * 2.6 * _pulse;
          const hg = ctx.createRadialGradient(0,0,Math.max(player.w,player.h)*0.8, 0,0, haloR);
          hg.addColorStop(0, 'rgba(129,212,255,' + (0.20 + 0.5 * _frac).toFixed(3) + ')');
          hg.addColorStop(1, 'rgba(129,212,255,0)');
          ctx.fillStyle = hg;
          ctx.beginPath(); ctx.arc(0,0,haloR,0,Math.PI*2); ctx.fill();
          ctx.restore();
        } catch (e) {}
        ctx.strokeStyle = 'rgba(129,212,255,' + (0.5 + 0.45 * _frac).toFixed(3) + ')';
        ctx.lineWidth = 4 + 2 * (1 - _frac); // slightly thicken as it nears expiration
        ctx.beginPath();
        ctx.ellipse(0,0,player.w*1.8*_pulse,player.h*1.8*_pulse,0,0,Math.PI*2);
        ctx.stroke();
        ctx.restore();

        // brief shield-absorb pulse ring for clearer feedback
        try {
          if (Date.now() < (shieldPulseUntil || 0)) {
            const t = (shieldPulseUntil - Date.now()) / 420; // 1 -> 0
            const frac = Math.max(0, Math.min(1, t));
            const radius = Math.max(18, player.w * (1.8 + (1 - frac) * 2.4));
            ctx.save();
            ctx.translate(shieldPulseX, shieldPulseY);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,255,255,${(0.9 * frac).toFixed(3)})`;
            ctx.lineWidth = 6 * frac;
            ctx.globalCompositeOperation = 'lighter';
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
        } catch(e) {}

        // Draw small shield-charge indicators above the player so remaining charges are visible at a glance
        try {
          if (player && typeof player.shieldCharges === 'number' && player.shieldCharges > 0) {
            ctx.save();
            try {
              const _recoilX = (player && Date.now() < (player.recoilUntil || 0) && !prefersReducedMotion) ? (player.recoilX || 0) : 0;
              const _recoilY = (player && Date.now() < (player.recoilUntil || 0) && !prefersReducedMotion) ? (player.recoilY || 0) : 0;
              ctx.translate((player && typeof player.x === 'number' ? player.x : 0) + _recoilX, (player && typeof player.y === 'number' ? player.y : 0) + _recoilY);
            } catch (e) { try { ctx.translate(player.x, player.y); } catch (e2) {} }
            const charges = Math.min(3, player.shieldCharges);
            const spacing = 14;
            for (let si = 0; si < charges; si++) {
              const ox = (si - (charges - 1) / 2) * spacing;
              const oy = -player.h - 14;
              // simple circular shield-dot with light stroke for readability
              ctx.beginPath();
              ctx.fillStyle = 'rgba(129,212,255,0.98)';
              ctx.arc(ox, oy, 5, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = 'rgba(255,255,255,0.92)';
              ctx.lineWidth = 1;
              ctx.stroke();
            }
            ctx.restore();
          }
        } catch (e) { /* ignore shield-charge draw errors */ }
      }
    } catch (e) { /* ignore shield draw errors */ }

    // draw particles
    for (const p of particles) {
      const alpha = Math.max(0, Math.min(1, p.life / 1000));
      ctx.save();
      // allow individual particles to request additive or other blending modes for stronger visual feedback
      if (p.blend) {
        try { ctx.globalCompositeOperation = p.blend; } catch (e) { /* ignore */ }
      }
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
      } else if (p.petal) {
        try {
          // draw a rotated petal-like shape for explosion particles for nicer garden feel
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle || 0);
          ctx.fillStyle = p.color || '#ff8a65';
          ctx.beginPath();
          // petal: elongated ellipse with taper
          ctx.ellipse(0, 0, p.r * 2.0, Math.max(1, p.r * 0.7), 0, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) { /* ignore draw errors for petals */ }
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

    // draw power-ups (small garden-themed icons)
    try {
      for (const pu of powerups) {
        ctx.save();
        const alpha = Math.max(0, Math.min(1, pu.life / 12000));
        ctx.globalAlpha = alpha;
        // gentle circle with a type-specific color to make pickups readable at-a-glance
        const isShield = (pu.type === 'shield');
        const baseColor = isShield ? '#29b6f6' : '#66bb6a';
        ctx.fillStyle = baseColor;
        // slightly larger base radius for shield to improve discoverability
        const baseRadius = isShield ? 14 : 10;
        // Draw with a soft glow for shields to make them more noticeable (keeps effect low-cost and reversible)
        if (isShield) {
          try {
            ctx.save();
            ctx.shadowColor = 'rgba(129,212,255,0.65)';
            ctx.shadowBlur = 16;
            ctx.beginPath(); ctx.arc(pu.x, pu.y, baseRadius, 0, Math.PI*2); ctx.fill();
            ctx.restore();
          } catch (e) {
            // fallback if shadow APIs fail
            ctx.beginPath(); ctx.arc(pu.x, pu.y, baseRadius, 0, Math.PI*2); ctx.fill();
          }
        } else {
          ctx.beginPath(); ctx.arc(pu.x, pu.y, baseRadius, 0, Math.PI*2); ctx.fill();
        }
        // subtle pulsing ring to make power-ups more discoverable (respects reduced-motion preference)
        try {
          if (!(typeof prefersReducedMotion !== 'undefined' && prefersReducedMotion)) {
            const t = Date.now();
            const base = isShield ? 20 : 14;
            // increase shield pulse strength, halo alpha, and base size for better discoverability
            const pulse = 1 + (isShield ? 0.26 : 0.10) * Math.sin(t / (isShield ? 180 : 220) + ((pu.born||0) / 330));
            ctx.lineWidth = isShield ? 3 : 2;
            const ringAlpha = Math.max(0, Math.min(0.95, (isShield ? 0.55 : 0.40) + (isShield ? 0.42 : 0.30) * Math.sin(t / (isShield ? 260 : 300) + ((pu.born||0) / 420))));
            // For shield, draw a slightly stronger tinted halo behind the ring for clearer pickup feedback
            if (isShield) {
              try {
                ctx.save();
                ctx.globalAlpha = Math.min(alpha * 0.95, 0.9);
                ctx.fillStyle = 'rgba(41,182,246,0.26)';
                ctx.beginPath(); ctx.arc(pu.x, pu.y, base * pulse * 1.35, 0, Math.PI*2); ctx.fill();
                ctx.restore();
              } catch (e) { /* ignore halo draw errors */ }
            }
            ctx.strokeStyle = 'rgba(255,255,255,' + ringAlpha.toFixed(3) + ')';
            ctx.beginPath(); ctx.arc(pu.x, pu.y, base * pulse, 0, Math.PI*2); ctx.stroke();
          }
        } catch (e) { /* ignore pulsing ring errors */ }

        // gentle periodic sparkle for shield pickups to improve discoverability (tiny, low-cost)
        try {
          if (isShield) {
            if (!pu._lastSpark || (Date.now() - pu._lastSpark) > 220) {
              pu._lastSpark = Date.now();
              particles.push({ x: pu.x + (Math.random()-0.5)*6, y: pu.y + (Math.random()-0.5)*6, vx: (Math.random()-0.5)*0.6, vy: -Math.random()*0.6, r: 1 + Math.random()*2, life: 320 + Math.random()*200, born: Date.now(), color: '#a5d6a7', leaf: true, spin: (Math.random()-0.5)*0.12 });
            }
          }
        } catch (e) { /* ignore sparkle errors */ }
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const icon = (pu.type === 'shield') ? '🛡' : (pu.type === 'rapid' ? '⚡' : (pu.type === 'spread' ? '🌿' : (pu.type === 'slow' ? '🍃' : (pu.type === 'bomb' ? '💣' : (pu.type === 'mulch' ? '🌱' : (pu.type === 'pierce' ? '🎯' : (pu.type === 'life' ? '+' : '')))))));
        ctx.fillText(icon, pu.x, pu.y + 1);
        ctx.restore();
      }
    } catch (e) { /* ignore draw errors */ }

    // draw small hit markers (fades/outward pulse)
    try {
      const nowM = Date.now();
      for (let hm = hitMarkers.length - 1; hm >= 0; hm--) {
        const m = hitMarkers[hm];
        const life = Math.max(0, m.until - nowM);
        if (life <= 0) { hitMarkers.splice(hm,1); continue; }
        const pct = life / 160;
        const alpha = Math.max(0, Math.min(1, pct));
        const r = 4 + (1 - pct) * 10;
        ctx.save();
        ctx.globalAlpha = alpha;
        try { ctx.shadowColor = 'rgba(76,175,80,' + (0.7 * alpha).toFixed(3) + ')'; ctx.shadowBlur = 10; } catch (e) { /* ignore shadow errors */ }
        // gentle radial bloom with a green-yellow garden tint
        try {
          const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, r * 1.6);
          grad.addColorStop(0, 'rgba(255,255,200,' + (0.9 * alpha).toFixed(3) + ')');
          grad.addColorStop(0.5, 'rgba(156,204,101,' + (0.9 * alpha).toFixed(3) + ')');
          grad.addColorStop(1, 'rgba(102,187,106,0)');
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(m.x, m.y, r * 0.9, 0, Math.PI*2); ctx.fill();
        } catch (e) { /* ignore gradient errors */ }
        // outer ring in a soft green
        ctx.strokeStyle = 'rgba(67,160,71,' + (0.95 * alpha).toFixed(3) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(m.x, m.y, r, 0, Math.PI*2); ctx.stroke();
        // small leaf flourish: two mirrored leaf ellipses for a gardening feel
        try {
          ctx.save();
          ctx.translate(m.x, m.y);
          ctx.rotate((1 - pct) * Math.PI / 8);
          ctx.fillStyle = 'rgba(34,139,34,' + alpha.toFixed(3) + ')';
          // left leaf
          ctx.beginPath();
          ctx.ellipse(-r*0.35, 0, r*0.8, r*0.36, -0.6, 0, Math.PI*2);
          ctx.fill();
          // right leaf
          ctx.beginPath();
          ctx.ellipse(r*0.35, 0, r*0.8, r*0.36, 0.6, 0, Math.PI*2);
          ctx.fill();
          ctx.restore();
        } catch (e) { /* ignore leaf draw errors */ }
        try { ctx.shadowBlur = 0; } catch (e) {}
        ctx.restore();
      }
    } catch (e) { /* ignore hit marker draw errors */ }
    // bullets
    ctx.fillStyle = '#fff';
    try {
      for (const b of bullets) {
        // short motion streak based on velocity for clearer bullet travel (no new particles)
        try {
          const pvx = (b.vx || 0) * -2;
          const pvy = (b.vy || 0) * -2;
          ctx.save();
          ctx.globalAlpha = 0.45;
          ctx.strokeStyle = 'rgba(255,255,255,0.45)';
          ctx.lineWidth = Math.max(1, Math.min(3, b.r));
          ctx.beginPath();
          ctx.moveTo(b.x + pvx, b.y + pvy);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.restore();
        } catch (e) {}
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
        ctx.fill();
      }
    } catch (e) {}

    for (const e of enemies) {
      const sc = 1 + (e.y / ch) * 0.25;
      ctx.save();
      ctx.translate(e.x,e.y);
      ctx.scale(sc,sc);
      try {
          const nowHit = Date.now();
          let enemyColor;
          // Telegraphed dash: if a snatcher is about to dash, tint it brighter so players notice
          const snatcherImminent = (e.type === 'snatcher' && typeof e.huntTimer === 'number' && e.huntTimer <= 360);
          if (e.hitFlashUntil && nowHit < e.hitFlashUntil) {
            // brighter tint while hit flash is active (type-specific for snails and pests)
            enemyColor = (e.type === 'snail') ? '#a1887f' : ((e.type === 'ladybug') ? '#ff8a80' : ((e.type === 'pest' || e.type === 'pest-mini') ? '#ffd1a4' : (e.type === 'bee' ? '#ffd54f' : (e.type === 'sprout' ? '#c5e1a5' : (e.type === 'caterpillar' ? '#9ccc65' : '#ffb3b3')))));
          } else if (snatcherImminent) {
            // highlight imminent snatcher dashes with an orange tint for telegraphing
            enemyColor = '#ff7043';
          } else {
            // default enemy color, but snails and pests get distinct tones for readability
            enemyColor = (e.type === 'snail') ? '#6d4c41' : ((e.type === 'ladybug') ? '#d32f2f' : ((e.type === 'pest' || e.type === 'pest-mini') ? '#ff8a50' : (e.type === 'bee' ? '#ffd54f' : (e.type === 'sprout' ? '#8BC34A' : (e.type === 'caterpillar' ? '#9ccc65' : '#ff6666')))));
          }
          // If hit flash is active, draw a brief radial glow under the enemy for stronger hit feedback
          try {
            if (e.hitFlashUntil && Date.now() < e.hitFlashUntil && !prefersReducedMotion) {
              // Garden-tinted hit glow: shift warm orange to green tones for clearer, thematic feedback
              const flashRadius = Math.max(e.w, e.h) * 1.6;
              const grad = ctx.createRadialGradient(0,0,0,0,0,flashRadius);
              grad.addColorStop(0, 'rgba(220,255,210,0.96)');
              grad.addColorStop(0.28, 'rgba(160,220,140,0.54)');
              grad.addColorStop(1, 'rgba(160,220,140,0)');
              ctx.fillStyle = grad;
              ctx.beginPath(); ctx.arc(0,0,flashRadius,0,Math.PI*2); ctx.fill();
            }
          } catch (err) { /* ignore flash draw errors */ }
          // finally draw the enemy body using the chosen color
          try { ctx.fillStyle = enemyColor; } catch (err) { ctx.fillStyle = '#ff6666'; }
      } catch (err) { ctx.fillStyle = '#ff6666'; }
      // Draw a subtle ground shadow for hoppers when a hop is imminent to telegraph movement
      if (e.type === 'hopper' && typeof e.hopTimer !== 'undefined' && e.hopTimer <= 220) {
        try {
          const shadowAlpha = Math.max(0.12, 0.6 * (1 - (e.hopTimer / 220)));
          ctx.save();
          ctx.globalAlpha = shadowAlpha;
          ctx.fillStyle = 'rgba(10,34,12,0.18)';
          ctx.beginPath(); ctx.ellipse(0, e.h/2 + 6, e.w * 1.4, e.h * 0.42, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        } catch (err) { /* ignore shadow draw errors */ }
      }
      let drewEnemySprite = false;
      try {
        if (enemySpriteAsset && enemySpriteAsset.ready && enemySprite) {
          ctx.save();
          pathRoundedRect(-e.w / 2, -e.h / 2, e.w, e.h, Math.max(6, Math.min(e.w, e.h) * 0.28));
          ctx.clip();
          drewEnemySprite = drawImageCover(enemySprite, -e.w / 2, -e.h / 2, e.w, e.h);
          if (drewEnemySprite) {
            try {
              ctx.globalCompositeOperation = 'multiply';
              ctx.globalAlpha = 0.32;
              pathRoundedRect(-e.w / 2, -e.h / 2, e.w, e.h, Math.max(6, Math.min(e.w, e.h) * 0.28));
              ctx.fill();
            } catch (e2) {}
          }
          ctx.restore();
          if (drewEnemySprite) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.45)';
            ctx.lineWidth = 1.6;
            pathRoundedRect(-e.w / 2, -e.h / 2, e.w, e.h, Math.max(6, Math.min(e.w, e.h) * 0.28));
            ctx.stroke();
            ctx.restore();
            // brief white overlay on hit to make damage more visible (respects reduced-motion preference)
            try {
              if (e.hitFlashUntil && Date.now() < e.hitFlashUntil && !prefersReducedMotion) {
                ctx.save();
                try { ctx.globalCompositeOperation = 'lighter'; } catch(e) {}
                const rem = Math.max(0, e.hitFlashUntil - Date.now());
                const alpha = Math.max(0.12, Math.min(0.65, 0.65 * (rem / 320)));
                try { ctx.globalAlpha = alpha; } catch(e) {}
                pathRoundedRect(-e.w / 2, -e.h / 2, e.w, e.h, Math.max(6, Math.min(e.w, e.h) * 0.28));
                ctx.fillStyle = 'rgba(255,255,255,1)';
                ctx.fill();
                ctx.restore();
              }
            } catch (err) { /* ignore overlay errors */ }
          }
        }
      } catch (e) { drewEnemySprite = false; }
      if (!drewEnemySprite) {
        ctx.fillRect(-e.w/2,-e.h/2,e.w,e.h);
      }
      // Moth visual: add a soft petal-tinted halo so sinuous moths are more noticeable (tiny visual polish)
      try {
        if (e.type === 'moth') {
          ctx.save();
          try { ctx.globalCompositeOperation = 'lighter'; } catch(e) {}
          const glowR = Math.max(e.w, e.h) * 1.6;
          const mg = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR);
          mg.addColorStop(0, 'rgba(255,230,245,0.55)');
          mg.addColorStop(0.4, 'rgba(255,200,230,0.22)');
          mg.addColorStop(1, 'rgba(255,200,230,0)');
          ctx.fillStyle = mg;
          ctx.beginPath(); ctx.arc(0, 0, glowR, 0, Math.PI*2); ctx.fill();
          ctx.restore();
        }
      } catch (e) { /* ignore moth glow errors */ }
        // Hopper visual: draw a small pulsing lateral stripe and halo to make hoppers more noticeable
        try {
          if (e.type === 'hopper') {
            ctx.save();
            try { ctx.globalCompositeOperation = 'lighter'; } catch(e) {}
            const hr = Math.max(e.w, e.h) * 1.6;
            const hg = ctx.createLinearGradient(-hr, 0, hr, 0);
            hg.addColorStop(0, 'rgba(255,200,150,0)');
            hg.addColorStop(0.5, 'rgba(255,235,180,0.65)');
            hg.addColorStop(1, 'rgba(255,200,150,0)');
            ctx.fillStyle = hg;
            const pulse = 1 + 0.16 * Math.sin(Date.now() / 140);
            ctx.beginPath();
            ctx.ellipse(0, 0, hr * pulse, (e.h * 0.5) * pulse, 0, 0, Math.PI * 2);
            ctx.fill();
            // subtle white streak to emphasize lateral motion
            try {
              ctx.strokeStyle = 'rgba(255,255,255,0.85)';
              ctx.lineWidth = 2 * (0.8 + 0.2 * Math.sin(Date.now() / 110));
              ctx.beginPath();
              ctx.moveTo(-e.w*0.8, 0);
              ctx.lineTo(e.w*0.8, 0);
              ctx.stroke();
            } catch(e){}
            ctx.restore();
          }
        } catch (e) { /* ignore hopper glow errors */ }

      // Charger visual: show a warning triangle above the charger while it is preparing or actively charging
      try {
        if (e.type === 'charger' && (e.charging || (typeof e.chargeTimer !== 'undefined' && e.chargeTimer <= 360))) {
          // treat near-expiry as 'imminent' to make the telegraph more visible
          const isImminent = e.charging || (e.chargeTimer <= 220);
          const pulse = Math.sin(Date.now() * 0.02);
          const alpha = Math.max(0.35, Math.min(0.95, isImminent ? 0.95 : 0.45 + 0.25 * pulse));
          ctx.fillStyle = 'rgba(255,100,40,' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(0, -e.h/2 - 10);
          ctx.lineTo(-9, -e.h/2 + 4);
          ctx.lineTo(9, -e.h/2 + 4);
          ctx.closePath();
          ctx.fill();
          // draw an exclamation mark to make the warning clearer
          ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 0.95).toFixed(3) + ')';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('!', 0, -e.h/2 - 3);
        }
      } catch (err) { /* ignore charger draw errors */ }
      // draw a small health bar above multi-HP enemies (garden-theme, lightweight)
      try {
        if ((typeof e.maxHp === "number" ? e.maxHp : e.hp) > 1) {
          const barW = e.w * 0.8;
          const barH = 6;
          const barX = -barW/2;
          const barY = -e.h/2 - barH - 6;
          // background for readability
          ctx.fillStyle = 'rgba(0,0,0,0.55)';
          ctx.fillRect(barX, barY, barW, barH);
          const maxHp = (typeof e.maxHp === 'number' ? e.maxHp : e.hp);
          const pct = Math.max(0, Math.min(1, e.hp / maxHp));
          // color ramp: green -> yellow -> red for quick readability
          let fillColor = pct > 0.6 ? '#66bb6a' : (pct > 0.3 ? '#ffd54f' : '#ef5350');
          // respect colorblind mode by using blue/orange ramp when enabled
          try { if (document && document.body && document.body.classList.contains('colorblind-mode')) { fillColor = pct > 0.6 ? '#42a5f5' : (pct > 0.3 ? '#ffb74d' : '#ff7043'); } } catch(e) {}
          const fillW = Math.max(2, (barW - 4) * pct);
          ctx.fillStyle = fillColor;
          ctx.fillRect(barX + 2, barY + 2, fillW, barH - 4);
          // subtle rounded border for separation from busy backgrounds
          ctx.strokeStyle = 'rgba(255,255,255,0.12)';
          ctx.lineWidth = 1;
          pathRoundedRect(barX, barY, barW, barH, 3);
          ctx.stroke();
        }
      } catch (err) { /* ignore health bar errors */ }
      if (!drewEnemySprite) {
        ctx.fillStyle='#600'; ctx.fillRect(-e.w/4,-e.h/8,e.w/2,e.h/4);
      }
      ctx.restore();
    }

    if (scoreEl) scoreEl.textContent = 'Score: ' + score;
    if (waveEl) {
      const n = waveNumber;
      try {
        // Keep the compact DOM wave HUD consistent with refreshVersionHUD: show X/Y when maxWaves configured
        while (waveEl.firstChild) waveEl.removeChild(waveEl.firstChild);
        let labelText = 'Wave: ' + n + ' ';
        try {
          if (typeof maxWaves === 'number' && maxWaves > 0) {
            if (n === maxWaves) {
              labelText = 'Wave: ' + n + '/' + maxWaves + ' (Final) ';
            } else {
              labelText = 'Wave: ' + n + '/' + maxWaves + ' ';
            }
          }
        } catch (e) {}
        waveEl.appendChild(document.createTextNode(labelText));
        const emoji = document.createElement('span');
        emoji.textContent = (typeof maxWaves === 'number' && maxWaves > 0 && n === maxWaves) ? '🏆' : '🌱';
        try { emoji.setAttribute('aria-hidden','true'); } catch (e) {}
        emoji.style.marginLeft = '6px';
        try { waveEl.appendChild(emoji); } catch(e) { /* ignore */ }
        try {
          let ariaLabel = 'Wave: ' + n;
          try { if (typeof maxWaves === 'number' && maxWaves > 0) ariaLabel = 'Wave: ' + n + ' of ' + maxWaves + (n === maxWaves ? ' (Final)' : ''); } catch(e){}
          waveEl.setAttribute('aria-label', ariaLabel);
        } catch (e) {}
      } catch (e) { /* ignore DOM errors */ }
      try {
        if (Date.now() < wavePulseUntil) { waveEl.classList.add('wave-pulse'); } else { waveEl.classList.remove('wave-pulse'); }
      } catch (e) { }
    }
    if (enemiesEl) {
      try {
        // Count only enemies from the current wave so the compact HUD shows accurate remaining/total
        const present = (typeof enemies !== 'undefined' ? enemies.filter(function(e){ try { return e && e.wave === waveNumber; } catch(err){ return false; } }).length : 0);
        const total = (typeof currentWaveEnemyCount !== 'undefined' ? currentWaveEnemyCount : 0);
        enemiesEl.textContent = (total > 0 ? (present + '/' + total + ' left') : ((typeof enemies !== 'undefined' ? enemies.length : 0) + ' ' + ((typeof enemies !== 'undefined' && enemies.length === 1) ? 'Enemy' : 'Enemies')));
      } catch (e) { /* ignore DOM errors */ }
    }
    // Wave completion check: when a wave had a target and no enemies from that wave remain, mark cleared and advance.
    try {
      const present = (typeof enemies !== 'undefined' ? enemies.filter(function(e){ try { return e && e.wave === waveNumber; } catch(err){ return false; } }).length : 0);
      if ((typeof currentWaveEnemyCount === 'number' && currentWaveEnemyCount > 0) && present === 0 && (typeof lastClearedWave === 'undefined' || lastClearedWave !== waveNumber)) {
        lastClearedWave = waveNumber;
        try {
          // Small toast to signal wave clear (visually brief and accessible)
          let wt = document.createElement('div');
          wt.id = 'wave-cleared-toast';
          wt.setAttribute('role','status'); wt.setAttribute('aria-live','polite');
          wt.style.position = 'fixed'; wt.style.left = '50%'; wt.style.top = '8%';
          wt.style.transform = 'translateX(-50%)';
          wt.style.background = 'rgba(255,255,255,0.96)'; wt.style.color = '#063f0d';
          wt.style.padding = '8px 14px'; wt.style.borderRadius = '8px'; wt.style.zIndex='10004'; wt.style.pointerEvents='none';
          wt.textContent = 'Wave ' + (waveNumber) + ' cleared!';
          try { document.body.appendChild(wt); } catch(e) {}
          setTimeout(()=>{ try{ if (wt && wt.parentNode) wt.parentNode.removeChild(wt); }catch(e){} }, 1100);
        } catch (e) { /* ignore toast errors */ }
        try { playSound('blip'); } catch (e) {}
        // Advance to the next wave after a short moment — show a brief countdown so players know when the next wave starts
        (function(){
          const delay = (typeof interWaveDelayMs === 'number' ? interWaveDelayMs : ((waveNumber <= 2) ? 1400 : 1400));
          const start = Date.now();
          let el = null;
          try {
            el = document.createElement('div');
            el.id = 'wave-next-countdown';
            el.setAttribute('role','status'); el.setAttribute('aria-live','polite');
            el.style.position = 'fixed'; el.style.left = '50%'; el.style.top = '12%';
            el.style.transform = 'translateX(-50%)';
            el.style.background = 'rgba(0,0,0,0.72)'; el.style.color = '#fff';
            el.style.padding = '6px 10px'; el.style.borderRadius = '8px'; el.style.zIndex = '10004'; el.style.pointerEvents = 'none';
            document.body.appendChild(el);
          } catch (e) { el = null; }
          const update = function(){
            const rem = Math.max(0, delay - (Date.now() - start));
            const sec = Math.ceil(rem/1000);
            try { if (el) el.textContent = 'Next wave in ' + (sec > 0 ? sec : '...'); } catch(e){}
            if (rem <= 0) {
              try { if (el && el.parentNode) el.parentNode.removeChild(el); } catch(e){}
              clearInterval(iv);
              try { if (!gameOver) spawnWave(); } catch(e){}
            }
          };
          update();
          const iv = setInterval(update, 200);
        })();
      }
    } catch (e) { /* ignore wave-complete detection errors */ }
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
      // Show shield badge in the Lives HUD when shield is active (small visual + screen-reader label)
      try {
        if (player && Date.now() < (player.shieldUntil || 0)) {
          const secShield = Math.ceil(((player.shieldUntil || 0) - Date.now()) / 1000);
          // Reuse existing badge if present, otherwise create it once
          let existingBadge = livesEl.querySelector('.shield-badge');
          if (!existingBadge) {
            existingBadge = document.createElement('span');
            existingBadge.className = 'shield-badge';
            existingBadge.setAttribute('aria-hidden', 'true');
            existingBadge.style.marginLeft = '8px';
            existingBadge.style.display = 'inline-flex';
            existingBadge.style.alignItems = 'center';
            existingBadge.style.gap = '6px';
            livesEl.appendChild(existingBadge);
          }
          // Update badge children to show per-charge icons (max 3) and a small timer
          try {
            const chargesNum = (player && typeof player.shieldCharges === 'number' && player.shieldCharges > 0) ? Math.min(3, player.shieldCharges) : 0;
            // clear previous icons/timer
            while (existingBadge.firstChild) existingBadge.removeChild(existingBadge.firstChild);
            for (let s = 0; s < chargesNum; s++) {
              const ic = document.createElement('span');
              ic.textContent = '🛡';
              ic.style.color = '#42a5f5';
              ic.style.fontSize = '14px';
              ic.setAttribute('aria-hidden', 'true');
              existingBadge.appendChild(ic);
            }
            const timerSpan = document.createElement('span');
            timerSpan.textContent = ' ' + secShield + 's';
            timerSpan.style.color = '#42a5f5';
            timerSpan.style.marginLeft = '4px';
            timerSpan.style.fontSize = '12px';
            timerSpan.setAttribute('aria-hidden', 'true');
            existingBadge.appendChild(timerSpan);
            try { existingBadge.classList.toggle('pulse', ((player.shieldUntil || 0) - Date.now()) > 4000); } catch(e) {}
            // include shield status and charges in the accessible label
            livesEl.setAttribute('aria-label', lives + (lives === 1 ? ' life' : ' lives') + (secShield ? (', shield ' + secShield + 's' + (chargesNum ? (', ' + chargesNum + ' charges') : '')) : ', shield'));
          } catch(e) { /* ignore badge update errors */ }
        } else {
          // Remove existing badge when shield expires to avoid duplicates
          try {
            const existingBadge = livesEl.querySelector('.shield-badge');
            if (existingBadge && existingBadge.parentNode) existingBadge.parentNode.removeChild(existingBadge);
          } catch (e) { /* ignore DOM errors */ }
          livesEl.setAttribute('aria-label', lives + (lives === 1 ? ' life' : ' lives'));
        }
      } catch (e) { /* ignore DOM errors */ }
      // Pulse visual feedback when a life was recently lost
      try {
        if (Date.now() < livesPulseUntil) { livesEl.classList.add('lives-pulse'); } else { livesEl.classList.remove('lives-pulse'); }
      } catch (e) { /* ignore DOM errors */ }
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
    // subtle vignette to darken edges for improved contrast (respects reduced-motion)
    try {
      const prefersReducedMotionLocal = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      if (!prefersReducedMotionLocal) {
        ctx.save();
        try {
          const g = ctx.createRadialGradient(cw/2, ch/2, Math.min(cw, ch) * 0.25, cw/2, ch/2, Math.max(cw, ch) * 0.9);
          g.addColorStop(0, 'rgba(0,0,0,0)');
          g.addColorStop(1, 'rgba(0,0,0,0.28)');
          ctx.fillStyle = g;
          // multiply slightly to darken corners without obscuring content
          try { ctx.globalCompositeOperation = 'multiply'; } catch (e) {}
          ctx.fillRect(0, 0, cw, ch);
          try { ctx.globalCompositeOperation = 'source-over'; } catch (e) {}
        } catch (e) { /* ignore gradient errors */ }
        ctx.restore();
      }
    } catch (e) { /* ignore vignette errors */ }
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
        ctx.fillStyle = 'rgba(0,0,0,' + (0.72 + pulse) + ')';
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
          drawOutlinedText(ctx, waveText, rx + pad, ry + 16, 'rgba(255,255,255,0.95)');
          // Draw a 'Lives:' label then heart icons for lives for clearer, more visual feedback (garden-themed hearts)
          try {
            const heartSize = 18; // px (slightly larger for readability)
            // Draw the Lives text label on its own line for clarity
            ctx.font = '16px sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            drawOutlinedText(ctx, livesText, rx + pad, ry + 16 + lineHeight, 'rgba(255,255,255,0.95)');
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
          // Draw a compact wave progress bar inside the HUD when the current wave has a target enemy count.
          try {
            const presentCount = (typeof enemies !== 'undefined' ? enemies.filter(function(e){ try { return e && e.wave === waveNumber; } catch(err){ return false; } }).length : (typeof enemies !== 'undefined' ? enemies.length : 0));
            const totalCount = (typeof currentWaveEnemyCount !== 'undefined' ? currentWaveEnemyCount : 0);
            if (totalCount > 0) {
              const progressPct = Math.max(0, Math.min(1, (totalCount - presentCount) / totalCount));
              const barWfull = Math.max(80, boxW - pad * 2);
              const barH = 8;
              const barX = rx + pad;
              const barY = ry + 16 + lineHeight * 2 + 10;
              ctx.save();
              // subtle background for the bar
              ctx.globalAlpha = 0.95;
              ctx.fillStyle = 'rgba(255,255,255,0.12)';
              ctx.fillRect(barX, barY, barWfull, barH);
              // filled portion
              ctx.fillStyle = '#66bb6a';
              ctx.fillRect(barX + 1, barY + 1, Math.max(2, (barWfull - 2) * progressPct), barH - 2);
              // border
              ctx.strokeStyle = 'rgba(255,255,255,0.06)';
              ctx.lineWidth = 1;
              try { ctx.strokeRect(barX, barY, barWfull, barH); } catch(e){}
              ctx.restore();
            }
          } catch (e) { /* ignore progress bar errors */ }
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
      drawOutlinedText(ctx, 'Wave ' + waveNumber + ' 🌱', cw/2, 80, 'rgba(255,255,255,0.98)');
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
      drawOutlinedText(ctx, 'FPS: ' + Math.round(fpsSmoothed), cw - 12, 18, 'rgba(255,255,255,0.92)');
      ctx.restore();
    } catch (e) { /* ignore FPS draw errors */ }
    ctx.restore();
    // Garden-themed canvas hit flash: soft green overlay on hits (respects prefers-reduced-motion)
    try {
      const prefersReducedMotion = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      if (Date.now() < (canvasHitFlashUntil || 0) && !prefersReducedMotion) {
        const remaining = (canvasHitFlashUntil || 0) - Date.now();
        const alpha = Math.max(0, Math.min(1, remaining / 240)); // slightly longer fade for clearer hit feedback
        ctx.save();
        // localized radial garden tint centered on last hit position for clearer, less obtrusive feedback
        const cx = (typeof canvasHitFlashX === 'number' && canvasHitFlashX) ? canvasHitFlashX : (cw * 0.5);
        const cy = (typeof canvasHitFlashY === 'number' && canvasHitFlashY) ? canvasHitFlashY : (ch * 0.45);
        const maxR = Math.max(cw, ch) * 0.7;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
        // Slightly increase the inner and mid stop opacities for a brighter, clearer hit flash (tiny, conservative)
        grad.addColorStop(0, 'rgba(232,255,186,' + (0.88 * alpha).toFixed(3) + ')');
        grad.addColorStop(0.6, 'rgba(232,255,186,' + (0.52 * alpha).toFixed(3) + ')');
        grad.addColorStop(1, 'rgba(232,255,186,0)');
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,cw,ch);
        ctx.restore();
      }
      // Brief white pop flash for clearer immediate hit feedback (respects prefers-reduced-motion)
      try {
        if (Date.now() < (canvasWhiteFlashUntil || 0) && !prefersReducedMotion) {
          const remW = (canvasWhiteFlashUntil || 0) - Date.now();
          const durW = 160;
          const alphaW = Math.max(0, Math.min(1, remW / durW));
          // center the white pop on the last hit location (fall back to center)
          const cx = (typeof canvasHitFlashX === 'number' && canvasHitFlashX) ? canvasHitFlashX : (cw * 0.5);
          const cy = (typeof canvasHitFlashY === 'number' && canvasHitFlashY) ? canvasHitFlashY : (ch * 0.45);
          const maxR = Math.max(80, Math.min(Math.max(cw, ch) * 0.28, 220));
          try {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
            g.addColorStop(0, 'rgba(255,255,255,' + (0.95 * alphaW).toFixed(3) + ')');
            g.addColorStop(0.5, 'rgba(255,255,255,' + (0.30 * alphaW).toFixed(3) + ')');
            g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = g;
            // draw only the affected region for minimal overdraw
            ctx.fillRect(Math.max(0, cx - maxR), Math.max(0, cy - maxR), Math.min(cw, maxR * 2), Math.min(ch, maxR * 2));
            ctx.restore();
          } catch (e) { /* ignore white flash errors */ }
        }
        // Sync a lightweight body-level CSS white pop overlay with canvas white pop for an extra visible hit flash.
        try {
          const _flashActive = (Date.now() < (canvasWhiteFlashUntil || 0) && !prefersReducedMotion);
          if (typeof document !== 'undefined' && document.body) {
            if (_flashActive) {
              const _cx = (typeof canvasHitFlashX === 'number' && canvasHitFlashX) ? canvasHitFlashX : (cw * 0.5);
              const _cy = (typeof canvasHitFlashY === 'number' && canvasHitFlashY) ? canvasHitFlashY : (ch * 0.45);
              try { document.body.style.setProperty('--hit-x', (100 * (_cx / Math.max(1, cw))) + '%'); } catch(e){}
              try { document.body.style.setProperty('--hit-y', (100 * (_cy / Math.max(1, ch))) + '%'); } catch(e){}
              try {
                // Clear any pending removal timeout so rapid consecutive hits keep the overlay visible and we only schedule one removal
                try { if (typeof hitPopTimeout !== 'undefined' && hitPopTimeout) { clearTimeout(hitPopTimeout); hitPopTimeout = null; } } catch(e){}
                document.body.classList.add('hit-pop');
              } catch(e){}
            } else {
              try {
                try { if (typeof hitPopTimeout !== 'undefined' && hitPopTimeout) { clearTimeout(hitPopTimeout); hitPopTimeout = null; } } catch(e){}
                hitPopTimeout = setTimeout(function(){ try { document.body.classList.remove('hit-pop'); } catch(e){} try { hitPopTimeout = null; } catch(e){} }, 900);
              } catch(e){}
            }
          }
        } catch (e) { /* ignore body overlay sync errors */ }
      } catch (e) { /* ignore white flash errors */ }
      // If the player lost a life recently, draw a stronger radial red flash centered on the player for clearer player-hit feedback
      if (Date.now() < (canvasPlayerHitFlashUntil || 0) && !prefersReducedMotion) {
        const remainingP = (canvasPlayerHitFlashUntil || 0) - Date.now();
        const alphaP = Math.max(0, Math.min(1, remainingP / 240));
        // center the red radial on the player when possible; fall back to last-hit coords or center
        const cx = (typeof player === 'object' && typeof player.x === 'number') ? player.x : ((typeof canvasHitFlashX === 'number' && canvasHitFlashX) ? canvasHitFlashX : (cw * 0.5));
        const cy = (typeof player === 'object' && typeof player.y === 'number') ? player.y : ((typeof canvasHitFlashY === 'number' && canvasHitFlashY) ? canvasHitFlashY : (ch * 0.45));
        const maxR = Math.max(80, Math.min(Math.max(cw, ch) * 0.36, 300));
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        try {
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
          g.addColorStop(0, 'rgba(255,120,120,' + (0.98 * alphaP).toFixed(3) + ')');
          g.addColorStop(0.5, 'rgba(255,60,60,' + (0.42 * alphaP).toFixed(3) + ')');
          g.addColorStop(1, 'rgba(255,60,60,0)');
          ctx.fillStyle = g;
          // draw only the affected region to reduce overdraw
          ctx.fillRect(Math.max(0, cx - maxR), Math.max(0, cy - maxR), Math.min(cw, maxR * 2), Math.min(ch, maxR * 2));
        } catch (e) {
          // Fallback: full-screen red fill if radial gradient isn't supported or errors occur
          try {
            ctx.fillStyle = 'rgba(255,80,80,' + (0.36 * alphaP).toFixed(3) + ')';
            ctx.fillRect(0,0,cw,ch);
          } catch (e2) { /* ignore fallback errors */ }
        }
        ctx.restore();
      }
    } catch (e) { /* ignore hit flash overlay errors */ }
    if (paused || gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0,0,cw,ch);
      ctx.fillStyle = '#fff';
      ctx.font = '48px sans-serif';
      ctx.textAlign = 'center';
      drawOutlinedText(ctx, gameOver ? 'Game Over' : (pausedByFocus ? 'Paused (focus lost)' : 'Paused'), cw/2, ch/2, 'rgba(255,255,255,0.98)');
      if (!gameOver) {
        // Draw a semi-opaque rounded backdrop behind the resume hint for improved readability on busy backgrounds
        ctx.font = '18px sans-serif';
        const resumeText = pausedByFocus ? 'Paused due to focus loss — tap, Space, or press P to resume' : 'Press P, Esc, or Space to resume';
        const resumeW = ctx.measureText(resumeText).width;
        const padX = 14, padY = 8;
        const rectW = resumeW + padX * 2;
        const rectH = 28;
        const rectX = Math.round(cw/2 - rectW/2);
        const rectY = Math.round(ch/2 + 48 - rectH + 6);
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.62)';
        const rr = 6;
        ctx.beginPath();
        ctx.moveTo(rectX + rr, rectY);
        ctx.arcTo(rectX + rectW, rectY, rectX + rectW, rectY + rectH, rr);
        ctx.arcTo(rectX + rectW, rectY + rectH, rectX, rectY + rectH, rr);
        ctx.arcTo(rectX, rectY + rectH, rectX, rectY, rr);
        ctx.arcTo(rectX, rectY, rectX + rectW, rectY, rr);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#fff';
        ctx.fillText(resumeText, cw/2, ch/2 + 48);
      } else {
        // Draw semi-opaque rounded backdrop behind the final score for improved readability
        ctx.font = '20px sans-serif';
        const scoreText = 'Final Score: ' + score;
        const scoreW = ctx.measureText(scoreText).width;
        const padX = 12, padY = 8;
        const rectW = scoreW + padX * 2;
        const rectH = 36;
        const rectX = Math.round(cw/2 - rectW/2);
        const rectY = Math.round(ch/2 + 48 - rectH + 6);
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.62)';
        const rr = 6;
        ctx.beginPath();
        ctx.moveTo(rectX + rr, rectY);
        ctx.arcTo(rectX + rectW, rectY, rectX + rectW, rectY + rectH, rr);
        ctx.arcTo(rectX + rectW, rectY + rectH, rectX, rectY + rectH, rr);
        ctx.arcTo(rectX, rectY + rectH, rectX, rectY, rr);
        ctx.arcTo(rectX, rectY, rectX + rectW, rectY, rr);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#fff';
        ctx.fillText(scoreText, cw/2, ch/2 + 48);
        // Keyboard hint to restart the game for accessibility/clarity (also draw a small backdrop)
        ctx.font = '16px sans-serif';
        const restartText = 'Press R to restart';
        const restartW = ctx.measureText(restartText).width;
        const rectW2 = restartW + padX * 2;
        const rectH2 = 30;
        const rectX2 = Math.round(cw/2 - rectW2/2);
        const rectY2 = Math.round(ch/2 + 84 - rectH2 + 6);
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.62)';
        ctx.beginPath();
        ctx.moveTo(rectX2 + rr, rectY2);
        ctx.arcTo(rectX2 + rectW2, rectY2, rectX2 + rectW2, rectY2 + rectH2, rr);
        ctx.arcTo(rectX2 + rectW2, rectY2 + rectH2, rectX2, rectY2 + rectH2, rr);
        ctx.arcTo(rectX2, rectY2 + rectH2, rectX2, rectY2, rr);
        ctx.arcTo(rectX2, rectY2, rectX2 + rectW2, rectY2, rr);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#fff';
        ctx.fillText(restartText, cw/2, ch/2 + 84);
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
    let dt = Math.max(0, Math.min(50, rawDt));
    // brief hit-stop (freeze-frame) when hitStopUntil is set to improve hit feedback
    if (typeof hitStopUntil !== 'undefined' && t < hitStopUntil) { dt = 0; }
    last = t;
    // Safety: if the canvas is removed from the document (e.g., SPA navigation or test harness),
    // stop active timers, suspend audio, and bail out of the loop to avoid errors or runaway callbacks.
    try {
      if (!canvas || (typeof canvas.isConnected !== 'undefined' && !canvas.isConnected) || !document.body.contains(canvas)) {
        try {
          if (typeof scheduledSpawnTimeout !== 'undefined' && scheduledSpawnTimeout) { clearTimeout(scheduledSpawnTimeout); scheduledSpawnTimeout = null; }
        } catch (e) {}
        try { if (typeof _highScoreSaveTimeout !== 'undefined' && _highScoreSaveTimeout) { clearTimeout(_highScoreSaveTimeout); _highScoreSaveTimeout = null; } } catch (e) {}
        try { if (typeof resizeTimeout !== 'undefined' && resizeTimeout) { clearTimeout(resizeTimeout); resizeTimeout = null; } } catch (e) {}
        try { if (audioCtx && audioCtx.state === 'running') { audioCtx.suspend(); suspendedAudioByFocus = true; } } catch (e) {}
        // Do not schedule further animation frames when canvas is not present.
        return;
      }
    } catch (e) {}
    try {
      if (!paused && !gameOver) update(dt);
      draw();
    } catch (err) {
      try { console.error('Game loop error:', err); } catch (e) {}
      // Pause safely and show overlay to avoid stopping the loop; user can resume manually
      try {
        if (!gameOver) {
          paused = true;
          pausedByFocus = false;
          if (typeof overlay !== 'undefined' && overlay) { setOverlayVisible(true); updateOverlayMessage(); }
        }
      } catch (e) {}
    }
    // keep loop running; when paused, run at a lower refresh to save CPU but keep overlay responsive
    if (!paused) {
      requestAnimationFrame(loop);
      // Best-effort: focus the canvas shortly after start so keyboard users can play without an extra click
      setTimeout(() => { try { canvas.focus(); } catch (e) {} }, 50);
    } else {
      // When auto-paused due to focus loss, throttle the loop more aggressively to reduce CPU while still remaining responsive.
      const pauseInterval = (pausedByFocus ? 2000 : 200);
      setTimeout(() => requestAnimationFrame(loop), pauseInterval);
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

  // Keyboard shortcut: 'N' advances to the next wave for accessibility
  try {
    window.addEventListener('keydown', function(e){
      try {
        const k = (e && (e.key || e.code)) || '';
        if (k === 'n' || k === 'N') {
          try {
            const nb = document.getElementById('nextWaveBtn');
            if (nb) nb.click();
          } catch (err) {}
        }
      } catch (err) {}
    }, { passive: true });
  } catch (err) {};




})();











