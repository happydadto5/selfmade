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
