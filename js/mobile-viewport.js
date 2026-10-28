
(function () {
  var root = document.documentElement;
  var vv = window.visualViewport;
  var raf = 0;
  var baselineHeight = Math.round(window.innerHeight || root.clientHeight || 0);
  var lastApplied = 0;
  var keyboardOpen = false;
  var inputFocused = false;

  function layoutHeight() { return Math.round(window.innerHeight || root.clientHeight || baselineHeight || 0); }
  function visualHeight() { return Math.round(vv && vv.height ? vv.height : layoutHeight()); }
  function applyHeight(h) {
    if (!h || !isFinite(h)) return;
    if (Math.abs(h - lastApplied) > 1) {
      lastApplied = h;
      root.style.setProperty('--nv-visual-height', h + 'px');
    }
  }
  function sync() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      raf = 0;
      var lh = layoutHeight();
      var vh = visualHeight();
      if (!baselineHeight) baselineHeight = lh || vh;
      // Update the baseline only when the keyboard is clearly closed and the viewport is stable/full.
      if (lh >= baselineHeight * 0.88 && vh >= baselineHeight * 0.82) {
        if (lh > baselineHeight) baselineHeight = lh;
        keyboardOpen = false;
        applyHeight(baselineHeight || lh || vh);
        // Reset only the outer document scroll; preserve message-history scroll position.
        if (window.scrollY || root.scrollTop || (document.body && document.body.scrollTop)) {
          window.scrollTo(0, 0);
          root.scrollTop = 0;
          if (document.body) document.body.scrollTop = 0;
        }
      } else {
        keyboardOpen = true;
        applyHeight(Math.min(vh || lh, lh || vh));
      }
    });
  }
  function restoreChecks() {
    // Android may keep the input focused and delay visualViewport updates after Back hides IME.
    [60, 140, 260, 420, 650, 900, 1300].forEach(function (ms) { setTimeout(sync, ms); });
  }
  sync();
  window.addEventListener('resize', sync, {passive:true});
  window.addEventListener('orientationchange', function () {
    setTimeout(function () { var h=layoutHeight(); if (h > 0) baselineHeight=h; sync(); }, 150);
    setTimeout(sync, 500);
  }, {passive:true});
  window.addEventListener('pageshow', sync);
  window.addEventListener('focus', sync);
  window.addEventListener('blur', restoreChecks);
  if (vv) {
    vv.addEventListener('resize', sync, {passive:true});
    vv.addEventListener('scroll', sync, {passive:true});
  }
  document.addEventListener('focusin', function (e) {
    if (e.target && e.target.id === 'messageInput') { inputFocused=true; restoreChecks(); }
  });
  document.addEventListener('focusout', function (e) {
    if (e.target && e.target.id === 'messageInput') { inputFocused=false; restoreChecks(); }
  });
  // Poll only while the message input is focused or a keyboard transition is in progress.
  setInterval(function () {
    if (inputFocused || keyboardOpen) sync();
  }, 180);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) restoreChecks(); });
})();
