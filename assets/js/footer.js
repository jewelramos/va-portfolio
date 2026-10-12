/* footer.js - "Back to Top" action. Pure vanilla JS, no dependencies. */
(function () {
  'use strict';
  var btn = document.querySelector('[data-top]');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
    var skip = document.querySelector('.skip');
    if (skip) { skip.focus({ preventScroll: true }); skip.blur(); }
  });
})();
