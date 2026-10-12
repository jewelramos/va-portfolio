(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile menu ---------- */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('lock', open);
    if (open) menu.scrollTop = 0;
  }
  /* Scroll to an in-page section after the drawer has closed. The drawer is closed first (and the
     body scroll-lock released) because iOS Safari ignores scrolling while body overflow is hidden. */
  function goTo(id, href) {
    var target = document.getElementById(id);
    if (!target) return;
    var offset = parseInt(getComputedStyle(document.documentElement).scrollPaddingTop, 10) || 92;
    var y = id === 'home' ? 0 : Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - offset);
    window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    try { if (history.replaceState) history.replaceState(null, '', href); } catch (err) { /* file:// or sandboxed */ }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    /* One delegated handler covers every drawer link (and any child element inside it): same-page
       anchors close the drawer, release the scroll lock, then scroll smoothly; links to other pages
       just close it and navigate normally. */
    menu.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a || !menu.contains(a)) return;
      var href = a.getAttribute('href') || '';
      var id = href.charAt(0) === '#' ? href.slice(1) : '';
      var wasOpen = menu.classList.contains('open');
      if (id && document.getElementById(id)) {
        e.preventDefault();
        setMenu(false);
        if (wasOpen) { setTimeout(function () { goTo(id, href); }, 60); } else { goTo(id, href); }
      } else {
        setMenu(false);
      }
    });
    window.addEventListener('orientationchange', function () { setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); burger.focus(); }
    });
    var wide = window.matchMedia('(min-width: 1101px)');
    var onWide = function (e) { if (e.matches) setMenu(false); };
    if (wide.addEventListener) { wide.addEventListener('change', onWide); } else if (wide.addListener) { wide.addListener(onWide); }
  }

  /* ---------- active section highlight ---------- */
  var links = [].slice.call(document.querySelectorAll('.menu a[href^="#"]'));
  if (links.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.toggle('on', l.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(function (l) {
      var s = document.querySelector(l.getAttribute('href'));
      if (s) spy.observe(s);
    });
  }

  /* ---------- stat counters (final numbers are in the HTML, so no-JS is fine) ---------- */
  var counters = [].slice.call(document.querySelectorAll('[data-count]'));
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    var fmt = function (n) { return n.toLocaleString('en-US'); };
    counters.forEach(function (el) { el.textContent = '0' + (el.dataset.suffix || ''); });
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        co.unobserve(en.target);
        var el = en.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = null, dur = 1400;
        function tick(t) {
          if (t0 === null) t0 = t;
          var p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(Math.round(end * eased)) + suf;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------- package buttons pre-fill the contact message ---------- */
  var msg = document.getElementById('m');
  [].slice.call(document.querySelectorAll('[data-package]')).forEach(function (a) {
    a.addEventListener('click', function () {
      if (msg && !msg.value.trim()) {
        msg.value = 'Hi Jewel, I’d like to discuss the ' + a.dataset.package + ' package. ';
      }
    });
  });

  /* ---------- lightbox ---------- */
  var dlg = document.getElementById('lb');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  var items = [].slice.call(document.querySelectorAll('[data-zoom]'));
  var i = 0, img = dlg.querySelector('img'), cap = dlg.querySelector('p'), last;
  function show(n) {
    i = (n + items.length) % items.length;
    var it = items[i];
    img.src = it.dataset.zoom; img.alt = it.dataset.alt; cap.textContent = it.dataset.cap;
  }
  items.forEach(function (it, n) {
    it.addEventListener('click', function () { last = it; show(n); dlg.showModal(); dlg.querySelector('.x').focus(); });
  });
  dlg.querySelector('.x').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { if (last) last.focus(); });
  dlg.querySelector('.pv').addEventListener('click', function () { show(i - 1); });
  dlg.querySelector('.nx').addEventListener('click', function () { show(i + 1); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
  if (items.length < 2) { dlg.querySelector('.pv').hidden = dlg.querySelector('.nx').hidden = true; }
})();

/* ---------- Section 09 pubmat gallery (separate from the certificate lightbox) ---------- */
(function () {
  'use strict';
  var dlg = document.getElementById('gal');
  var thumbs = [].slice.call(document.querySelectorAll('.gthumb'));
  if (!dlg || !thumbs.length || typeof dlg.showModal !== 'function') {
    /* No <dialog> support: thumbnails fall back to opening the Facebook post. */
    thumbs.forEach(function (t) { t.addEventListener('click', function () { window.open(t.dataset.fb, '_blank', 'noopener'); }); });
    return;
  }
  var img = dlg.querySelector('.gfig img'), title = dlg.querySelector('.gtitle'),
      count = dlg.querySelector('.gcount'), fb = dlg.querySelector('.gfb'),
      reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      idx = 0, last, startX = null;
  function load(n) { var t = thumbs[(n + thumbs.length) % thumbs.length]; var p = new Image(); p.src = t.dataset.full; }
  function show(n, instant) {
    idx = (n + thumbs.length) % thumbs.length;
    var t = thumbs[idx];
    function apply() {
      img.src = t.dataset.full;
      img.alt = 'Pubmat: ' + t.dataset.title;
      title.textContent = t.dataset.title;
      count.textContent = t.dataset.org + '  ·  ' + (idx + 1) + ' / ' + thumbs.length;
      fb.href = t.dataset.fb;
      img.classList.remove('swap');
      load(idx + 1); load(idx - 1);
    }
    if (instant || reduce) { apply(); return; }
    img.classList.add('swap');
    setTimeout(apply, 140);
  }
  thumbs.forEach(function (t, n) {
    t.addEventListener('click', function () { last = t; show(n, true); dlg.showModal(); dlg.querySelector('.gx').focus(); });
  });
  dlg.querySelector('.gx').addEventListener('click', function () { dlg.close(); });
  dlg.querySelector('.gp').addEventListener('click', function () { show(idx - 1); });
  dlg.querySelector('.gn').addEventListener('click', function () { show(idx + 1); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.classList.contains('gin') || e.target.classList.contains('gstage')) dlg.close(); });
  dlg.addEventListener('close', function () { if (last) last.focus(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
  });
  dlg.addEventListener('touchstart', function (e) { startX = e.changedTouches[0].clientX; }, { passive: true });
  dlg.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX; startX = null;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();

/* ---------- Section 09 gallery: first 4 visible, "View More Designs" reveals the rest ---------- */
(function () {
  'use strict';
  var grid = document.getElementById('ggrid');
  var btn = document.querySelector('.gmorebtn');
  if (!grid || !btn) return;               /* without JS every design simply stays visible */
  var wrap = btn.parentNode, label = btn.querySelector('.gml');
  var extras = [].slice.call(grid.querySelectorAll('.gmore'));
  if (!extras.length) return;
  grid.classList.add('is-collapsed');
  wrap.hidden = false;
  btn.addEventListener('click', function () {
    var open = btn.getAttribute('aria-expanded') === 'true';
    if (!open) {
      grid.classList.remove('is-collapsed');
      extras.forEach(function (li) { li.classList.remove('reveal'); void li.offsetWidth; li.classList.add('reveal'); });
      btn.setAttribute('aria-expanded', 'true');
      label.textContent = 'Show Fewer Designs';
    } else {
      grid.classList.add('is-collapsed');
      extras.forEach(function (li) { li.classList.remove('reveal'); });
      btn.setAttribute('aria-expanded', 'false');
      label.textContent = 'View More Designs';
      var g = document.getElementById('pubmats');
      if (g && g.getBoundingClientRect().top < 0) g.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  /* ---------- case study cards: click to view details ---------- */
  (function () {
    var cards = document.querySelectorAll('.cs');
    function setCard(card, open) {
      var btn = card.querySelector('.cs-toggle');
      if (!btn) return;
      card.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      var t = btn.querySelector('.cs-toggle-t');
      if (t) t.textContent = open ? 'Hide details' : 'Click to view details';
    }
    cards.forEach(function (card) {
      var btn = card.querySelector('.cs-toggle');
      if (btn) btn.addEventListener('click', function () { setCard(card, btn.getAttribute('aria-expanded') !== 'true'); });
    });
    /* Open a card when a link (e.g. "View Sample Work") jumps straight to it */
    function openFromHash() {
      var id = (location.hash || '').replace('#', '');
      var card = id && document.getElementById(id);
      if (card && card.classList.contains('cs')) setCard(card, true);
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href*="#case-0"]');
      if (!a) return;
      var id = a.getAttribute('href').split('#')[1];
      var card = id && document.getElementById(id);
      if (card && card.classList.contains('cs')) setCard(card, true);
    });
    window.addEventListener('hashchange', openFromHash);
    openFromHash();
  })();
})();
