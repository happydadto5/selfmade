(function(){
  try{
    const waveEl = document.getElementById('wave');
    if (!waveEl) return;
    const pulse = () => {
      try {
        waveEl.classList.add('wave-pulse');
        setTimeout(()=>{ try { waveEl.classList.remove('wave-pulse'); } catch(e){} }, 900);
      } catch(e){}
    };
    // Observe content/attribute changes to ensure the wave HUD pulses whenever it updates
    const mo = new MutationObserver(() => { pulse(); });
    try { mo.observe(waveEl, { childList: true, characterData: true, subtree: true, attributes: true }); } catch(e){}
    // Pulse once on load so the HUD feels responsive immediately
    try { setTimeout(pulse, 260); } catch(e){}
  } catch(e) { /* ignore */ }
})();