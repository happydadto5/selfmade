(function(){
  try {
    const pa = document.getElementById('powerup-announcer');
    if (!pa) return;
    // Respect user's reduced-motion preference
    var prefersReduced = false;
    try { prefersReduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { prefersReduced = false; }
    if (prefersReduced) return;
    function doVibrate(){
      try { if (navigator && typeof navigator.vibrate === 'function') { navigator.vibrate(40); } } catch(e) {}
    }
    // Observe announcements and vibrate on Shield absorb messages for tactile feedback on mobile
    try {
      const mo = new MutationObserver(function(records){
        for (var i = 0; i < records.length; i++){
          try {
            var txt = (pa.textContent || '').toLowerCase();
            if (txt.indexOf('shield absorbed') !== -1 || txt.indexOf('\u{1f6e1}') !== -1) {
              doVibrate();
            }
          } catch(e) {}
        }
      });
      mo.observe(pa, { childList: true, characterData: true, subtree: true });
    } catch(e) {}
  } catch(e) {}
})();
