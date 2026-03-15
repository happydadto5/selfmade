(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let cw, ch;
  let player;
  function resize() { 
  cw = canvas.width = window.innerWidth; 
  ch = canvas.height = window.innerHeight; 
  // Keep player anchored to the bottom when the window resizes
  if (typeof player !== 'undefined') {
    player.y = ch - 80;
    player.x = Math.max(20, Math.min(cw - 20, player.x));
  }
}
  window.addEventListener('resize', resize);
  resize();

  const scoreEl = document.getElementById('score');
  const versionEl = document.getElementById('version');
  const livesEl = document.getElementById('lives');
  const version = '0.1.34';
  let score = 0;
  let highScore = Number(localStorage.getItem('selfmade_highscore') || 0);
  let lives = 3;
  let gameOver = false;
  const keys = {left:false,right:false,fire:false};

  // Simple WebAudio effects (oscillators only). Created on first user gesture to satisfy autoplay policies.
  let audioCtx = null;
  // sound toggle persisted in localStorage ('1' = on, '0' = off)
  let soundEnabled = localStorage.getItem('selfmade_sound');
  soundEnabled = (soundEnabled === null) ? true : (soundEnabled === '1');
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
    muteBtn.title = soundEnabled ? 'Sound: On (click to mute)' : 'Sound: Off (click to unmute)';
  }
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('selfmade_sound', soundEnabled ? '1' : '0');
      if (soundEnabled) ensureAudio();
      updateMuteUI();
    });
    updateMuteUI();
  }

  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (e.key === ' ') keys.fire = true;
    // 'P' or 'Escape' toggles pause (accessibility): do not unpause when game is over
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      if (!gameOver) {
        paused = !paused;
        // user toggled pause; clear pausedByFocus so auto-resume doesn't override user's intent
        pausedByFocus = false;
        if (typeof overlay !== 'undefined' && overlay) overlay.setAttribute('aria-hidden', (!paused && !gameOver) ? 'true' : 'false');
      }
    }
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    if (e.key === ' ') keys.fire = false;
  });

  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');
  const fireBtn = document.getElementById('fireBtn');
  function setTouch(btn, name) {
    if (!btn) return;
    btn.addEventListener('touchstart', e => { e.preventDefault(); keys[name] = true; });
    btn.addEventListener('touchend', e => { e.preventDefault(); keys[name] = false; });
    btn.addEventListener('mousedown', e => { e.preventDefault(); keys[name] = true; });
    btn.addEventListener('mouseup', e => { e.preventDefault(); keys[name] = false; });
  }
  setTouch(leftBtn, 'left'); setTouch(rightBtn, 'right'); setTouch(fireBtn, 'fire');
// overlay and replay button
const overlay = document.getElementById('overlay');
const replayBtn = document.getElementById('replayBtn');
if (overlay) overlay.setAttribute('aria-hidden', 'true');
if (replayBtn) replayBtn.addEventListener('click', () => {
  gameOver = false;
  paused = false;
  score = 0;
  lives = 3;
  enemies.length = 0;
  bullets.length = 0;
  waveNumber = 0;
  lastSpawn = Date.now();
  player.x = cw/2;
});
  // Pause handling for accessibility: pause when window loses focus (debounced and respectful of gameOver)
  let paused = false;
  let pausedByFocus = false;
  let blurTimeout = null;
  window.addEventListener('blur', () => {
    // wait a short time before pausing to avoid accidental pauses on transient focus loss
    blurTimeout = setTimeout(() => {
      paused = true;
      pausedByFocus = true;
      blurTimeout = null;
      if (typeof overlay !== 'undefined' && overlay) overlay.setAttribute('aria-hidden', (paused || gameOver) ? 'false' : 'true');
    }, 150);
  });
  window.addEventListener('focus', () => {
    if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; }
    // only unpause if the pause was caused by focus loss and the game isn't over
    if (pausedByFocus && !gameOver) {
      paused = false;
    }
    pausedByFocus = false;
    if (typeof overlay !== 'undefined' && overlay) overlay.setAttribute('aria-hidden', (paused || gameOver) ? 'false' : 'true');
  });

  // also handle visibility change (tabs/mobile): pause when document becomes hidden, and resume only if pausedByFocus
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (!paused) {
        if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; }
        paused = true;
        pausedByFocus = true;
        if (typeof overlay !== 'undefined' && overlay) overlay.setAttribute('aria-hidden', 'false');
      }
    } else {
      if (pausedByFocus && !gameOver) {
        paused = false;
      }
      pausedByFocus = false;
      if (typeof overlay !== 'undefined' && overlay) overlay.setAttribute('aria-hidden', (paused || gameOver) ? 'false' : 'true');
    }
  });


  player = { x: cw/2, y: ch - 80, w: 40, h: 22, speed: 6, cooldown: 0 };
  const bullets = []; const enemies = []; const particles = [];
  let lastSpawn = 0; let waveNumber = 0;

  function spawnWave() {
    waveNumber++;
    const count = 3 + Math.min(8, Math.floor(waveNumber * 0.6));
    for (let i=0;i<count;i++) {
      const ex = 40 + Math.random() * (cw-80);
      const ey = -20 - Math.random()*200;
      const speed = 0.6 + Math.random()*1.2 + waveNumber*0.05;
      enemies.push({x:ex,y:ey,w:30,h:28,vy:speed, hp:1 + Math.floor(waveNumber/4)});
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
      lives = Math.max(0, lives);
      if (lives <= 0) { gameOver = true; paused = true; }
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
            if (score > highScore) { highScore = score; localStorage.setItem('selfmade_highscore', highScore); }
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

    if (enemies.length === 0 && Date.now() - lastSpawn > 600) { lastSpawn = Date.now(); spawnWave(); }
  }

  function draw() {
    ctx.clearRect(0,0,cw,ch);
    ctx.fillStyle = '#b3e5fc'; ctx.fillRect(0,0,cw,ch);
    const g = ctx.createLinearGradient(0,ch-180,0,ch); g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(1,'rgba(0,0,0,0.06)'); ctx.fillStyle = g; ctx.fillRect(0,ch-180,cw,180);

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

    scoreEl.textContent = 'Score: ' + score + ' — Wave: ' + waveNumber;
    livesEl.textContent = 'Lives: ' + lives;
    versionEl.textContent = 'v' + version + ' — High: ' + highScore;

    if (paused || gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0,0,cw,ch);
      ctx.fillStyle = '#fff';
      ctx.font = '48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(gameOver ? 'Game Over' : 'Paused', cw/2, ch/2);
      if (gameOver) {
        ctx.font = '20px sans-serif';
        ctx.fillText('Final Score: ' + score, cw/2, ch/2 + 48);
      }
      // sync HTML overlay visibility
      if (typeof overlay !== 'undefined' && overlay) overlay.setAttribute('aria-hidden', (paused || gameOver) ? 'false' : 'true');
    }
  }

  let last = performance.now();
  function loop(t) {
    const dt = t - last; last = t;
    if (!paused && !gameOver) update(dt);
    draw();
    // keep loop running; when paused, run at a lower refresh to save CPU but keep overlay responsive
    if (!paused) {
      requestAnimationFrame(loop);
    } else {
      setTimeout(() => requestAnimationFrame(loop), 200);
    }
  }
  requestAnimationFrame(loop);

  canvas.addEventListener('mousedown', e => { keys.fire = true; if (soundEnabled) ensureAudio(); });
  canvas.addEventListener('mouseup', e => keys.fire = false);
  canvas.addEventListener('touchstart', function(e){ if (e.target === canvas) { e.preventDefault(); if (soundEnabled) ensureAudio(); keys.fire = true; } }, {passive:false});
  canvas.addEventListener('touchend', function(e){ if (e.target === canvas) { e.preventDefault(); keys.fire = false; } }, {passive:false});
  document.body.addEventListener('touchstart', function(e){ if (e.target === canvas) e.preventDefault(); }, {passive:false});
})();
