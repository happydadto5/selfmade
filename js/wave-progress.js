(function(){
  function updateWaveBar(){
    try{
      const wp = document.getElementById('wave-progress');
      if(!wp) return;
      const txt = (wp.textContent || '').trim();
      // Look for "Progress: X/Y" pattern
      const m = txt.match(/Progress:\s*(\d+)\/(\d+)/);
      if(m){
        const defeated = parseInt(m[1],10), total = parseInt(m[2],10);
        const pct = total > 0 ? Math.round((defeated/total)*100) : 0;
        const fill = wp.querySelector('.wave-bar-fill') || wp.querySelector('.wave-progress-bar');
        if(fill) {
          try { fill.style.width = pct + '%'; } catch(e){}
          // Add a "near-complete" class when the wave is almost finished to draw player attention.
          try {
            if (pct >= 75) {
              fill.classList.add('near-complete');
              wp.setAttribute('aria-label', 'Wave progress: ' + pct + ' percent — nearly complete');
            } else {
              fill.classList.remove('near-complete');
              wp.setAttribute('aria-label', 'Wave progress: ' + pct + ' percent');
            }
          } catch(e){}
        }
      }
    }catch(e){}
  }
  // update regularly to reflect HUD updates made by game.js
  // Throttle updates slightly to reduce CPU on low-power devices while keeping HUD responsive.
  const t = setInterval(updateWaveBar, 400);
  // also run once shortly after load
  window.addEventListener('load', () => { setTimeout(updateWaveBar, 200); });
})();
