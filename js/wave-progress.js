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

          // Update or create a centered percent label inside the bar for clearer feedback
          try {
            let pctLabel = wp.querySelector('.wave-bar-label');
            if (!pctLabel) {
              pctLabel = document.createElement('span');
              pctLabel.className = 'wave-bar-label';
              // place label inside the bar's container so it overlays the fill
              const bar = wp.querySelector('.wave-bar');
              if (bar) {
                // prefer appending to the bar so label is positioned absolutely
                try { bar.appendChild(pctLabel); } catch(e) { if (wp) try { wp.appendChild(pctLabel); } catch(e){} }
              } else {
                try { wp.appendChild(pctLabel); } catch(e){}
              }
            }
            try { pctLabel.textContent = pct + '%'; } catch(e){}
          } catch(e){}

          // Also update the Enemies HUD to show remaining / total for the current wave (small UX improvement)
          try {
            const enemiesEl = document.getElementById('enemies');
            if (enemiesEl) {
              try { enemiesEl.textContent = 'Enemies: ' + Math.max(0, total - defeated) + ' / ' + total; } catch(e){}
            }
          } catch(e){}

          // Add a "near-complete" class when the wave is almost finished to draw player attention.
          try {
            const waveEl = document.getElementById('wave');
            // Build a more descriptive ARIA label including defeated/total counts for assistive tech
            try {
              const parts = [];
              try { parts.push('Wave progress: ' + defeated + ' of ' + total + ' defeated'); } catch(e){}
              try { parts.push('(' + pct + '%)'); } catch(e){}
              const ariaText = parts.join(' ');
              if (pct >= 75) {
                fill.classList.add('near-complete');
                if (waveEl) try { waveEl.classList.add('near-complete'); } catch(e){}
                wp.setAttribute('aria-label', ariaText + ' — nearly complete');
              } else {
                fill.classList.remove('near-complete');
                if (waveEl) try { waveEl.classList.remove('near-complete'); } catch(e){}
                wp.setAttribute('aria-label', ariaText);
              }
            } catch(e){}

            // Small, low-risk enhancement: when only one wave remains (final wave incoming), give a subtle HUD cue and a brief toast to make beatability obvious.
            try {
              const currentWave = (typeof waveNumber !== 'undefined' ? waveNumber : 0);
              const totalWaves = (typeof maxWaves === 'number' && maxWaves > 0) ? maxWaves : null;
              const wavesLeft = (totalWaves !== null) ? Math.max(0, totalWaves - currentWave) : null;
              // Only announce once per wave transition to avoid repeated toasts.
              if (totalWaves !== null && wavesLeft === 1) {
                try {
                  if (typeof window._lastFinalImminentWave === 'undefined') window._lastFinalImminentWave = null;
                  if (window._lastFinalImminentWave !== currentWave) {
                    window._lastFinalImminentWave = currentWave;
                    try { if (typeof showWaveToast === 'function') showWaveToast('Final wave incoming!'); } catch(e){}
                    try { if (waveEl) waveEl.classList.add('final-imminent'); } catch(e){}
                  }
                } catch(e){}
              } else {
                try { if (waveEl) waveEl.classList.remove('final-imminent'); } catch(e){}
              }
            } catch(e){}
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
