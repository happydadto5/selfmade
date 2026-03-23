// Small accessibility helper: ensure autopause announcer exposes role="status" for assistive tech
(function(){
  try {
    function ensureRole() {
      try {
        var el = document.getElementById('autopause-announcer');
        if (el && !el.getAttribute('role')) {
          el.setAttribute('role','status');
        }
      } catch (e) { /* ignore */ }
    }
    // Ensure role on DOMContentLoaded and immediately if already present
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ensureRole, { once: true, passive: true });
    } else {
      ensureRole();
    }
    // Observe additions to body so dynamically-created announcers get the role set
    try {
      var mo = new MutationObserver(function(records){
        for (var i=0;i<records.length;i++){
          var rec = records[i];
          for (var j=0;j<rec.addedNodes.length;j++){
            var n = rec.addedNodes[j];
            try {
              if (n && n.id === 'autopause-announcer') {
                try { n.setAttribute('role','status'); } catch(e) {}
              }
            } catch(e){}
          }
        }
      });
      mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
    } catch(e) { /* ignore MutationObserver availability */ }
  } catch (e) { /* ignore */ }
})();
