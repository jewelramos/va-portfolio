/* contact.js - Section 12 interactions: live PHT clock, scope-builder pills,
   copy-email toast, and the inquiry form. Pure vanilla JS, no dependencies,
   works on GitHub Pages and when opened straight from disk. */
(function () {
  'use strict';

  /* ---------- live clock: Philippine Standard Time (UTC+8, no DST) ---------- */
  var clock = document.getElementById('pht-clock');
  var dateEl = document.getElementById('pht-date');
  if (clock) {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    var tick = function () {
      var now = new Date();
      /* shift to UTC+8 regardless of the visitor's own time zone, then read the UTC fields */
      var p = new Date(now.getTime() + 8 * 3600000);
      var h = p.getUTCHours(), ap = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      clock.textContent = h + ':' + pad(p.getUTCMinutes()) + ':' + pad(p.getUTCSeconds()) + ' ' + ap;
      clock.setAttribute('datetime', p.getUTCFullYear() + '-' + pad(p.getUTCMonth() + 1) + '-' + pad(p.getUTCDate()) +
        'T' + pad(p.getUTCHours()) + ':' + pad(p.getUTCMinutes()) + ':' + pad(p.getUTCSeconds()) + '+08:00');
      if (dateEl) dateEl.textContent = days[p.getUTCDay()] + ', ' + months[p.getUTCMonth()] + ' ' + p.getUTCDate();
    };
    tick();
    var timer = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', function () {
      clearInterval(timer);
      if (!document.hidden) { tick(); timer = setInterval(tick, 1000); }
    });
  }

  /* ---------- copy email + toast ---------- */
  var copyBtn = document.querySelector('[data-copy]');
  if (copyBtn) {
    var toast = document.querySelector('[data-toast]');
    var label = copyBtn.querySelector('.copy-t');
    var resetTimer;
    var done = function () {
      copyBtn.classList.add('is-copied');
      if (label) label.textContent = 'Copied';
      if (toast) { toast.textContent = '✓ Address Copied!'; toast.classList.add('is-on'); }
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () {
        copyBtn.classList.remove('is-copied');
        if (label) label.textContent = 'Copy Email';
        if (toast) { toast.classList.remove('is-on'); }
      }, 2200);
    };
    var fallback = function (text) {
      var t = document.createElement('textarea');
      t.value = text; t.setAttribute('readonly', '');
      t.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
      document.body.appendChild(t); t.select();
      try { t.setSelectionRange(0, text.length); } catch (e) { /* ignore */ }
      try { if (document.execCommand('copy')) done(); } catch (e) { /* ignore */ }
      document.body.removeChild(t);
    };
    copyBtn.addEventListener('click', function () {
      var text = copyBtn.getAttribute('data-copy');
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text); });
      } else { fallback(text); }
    });
  }

  /* ---------- scope builder: pills, live counter, message insertion ---------- */
  var form = document.getElementById('inquiry');
  if (!form) return;
  var pills = [].slice.call(document.querySelectorAll('.pills .pill'));
  var badge = document.querySelector('[data-scope]');
  var email = form.elements.email, message = form.elements.message;
  var autoText = '';   /* the last message this script wrote, so visitor edits are never overwritten */

  function selected() {
    return pills.filter(function (p) { return p.getAttribute('aria-pressed') === 'true'; })
      .map(function (p) { return p.getAttribute('data-service') || p.textContent.trim(); });
  }
  function joinList(list) {
    if (list.length < 2) return list.join('');
    return list.slice(0, -1).join(', ') + (list.length > 2 ? ',' : '') + ' and ' + list[list.length - 1];
  }
  function draft(list) {
    return list.length ? 'Hi Jewel, I am reaching out regarding ' + joinList(list) + '. ' : '';
  }
  var help = document.querySelector('.qf-help');
  function refresh() {
    var list = selected();
    if (help) help.hidden = list.length === 0;   /* helper note only shows once the Scope Builder is used */
    if (badge) {
      badge.textContent = 'Scope: ' + list.length + (list.length === 1 ? ' Service Selected' : ' Services Selected');
      badge.classList.toggle('has', list.length > 0);
    }
    var next = draft(list), cur = message.value;
    if (cur === '' || cur === autoText) {
      message.value = next;                                   /* untouched or still auto-written: replace */
    } else if (autoText && cur.indexOf(autoText) === 0) {
      message.value = next + cur.slice(autoText.length);      /* keep whatever the visitor typed after it */
    } else { return; }                                         /* visitor rewrote it: leave their words alone */
    autoText = next;
  }
  pills.forEach(function (p) {
    p.addEventListener('click', function () {
      p.setAttribute('aria-pressed', p.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      refresh();
      reset();
    });
  });

  /* ---------- inquiry form ---------- */
  var btn = form.querySelector('.qf-btn'), lab = form.querySelector('.qf-label');
  var status = form.querySelector('.qf-status');
  var LABEL = { idle: 'Submit Project Scope ↗', sending: 'Sending…', success: 'Scope Sent ✓', error: 'Try Again' };

  function setState(state, text, isError) {
    btn.setAttribute('data-state', state);
    btn.disabled = state === 'sending';
    lab.textContent = LABEL[state];
    status.textContent = text || '';
    status.classList.toggle('is-error', !!isError);
  }
  function fail(field, text) {
    field.setAttribute('aria-invalid', 'true');
    setState('error', text, true);
    field.focus();
  }
  function reset() {
    if (btn.getAttribute('data-state') !== 'idle') setState('idle', '');
    email.removeAttribute('aria-invalid'); message.removeAttribute('aria-invalid');
  }
  email.addEventListener('input', reset);
  message.addEventListener('input', reset);

  function buildMail(to, data) {
    var body = 'Services needed: ' + (data.services.length ? data.services.join(', ') : 'Not specified') +
      '\r\nReply to: ' + data.email + '\r\n\r\n' + data.message;
    return 'mailto:' + to + '?subject=' + encodeURIComponent('Portfolio inquiry from ' + data.email) +
      '&body=' + encodeURIComponent(body);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (btn.disabled) return;
    var data = { email: email.value.trim(), message: message.value.trim(), services: selected() };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) return fail(email, 'Please enter a valid email address so I can reply.');
    if (data.message.length < 5) return fail(message, 'Please add a short message about what you need.');
    email.removeAttribute('aria-invalid'); message.removeAttribute('aria-invalid');

    var success = function (text) {
      setState('success', text);
      form.reset();
      autoText = '';
      pills.forEach(function (p) { p.setAttribute('aria-pressed', 'false'); });
      if (badge) { badge.textContent = 'Scope: 0 Services Selected'; badge.classList.remove('has'); }
      if (help) help.hidden = true;
    };
    if (form.elements._gotcha && form.elements._gotcha.value) { return success('Thank you! Your project scope was sent.'); }
    setState('sending', 'Sending your project scope…');

    var endpoint = (form.getAttribute('data-endpoint') || '').trim();
    if (endpoint) {
      /* Form service mode (for example Formspree): posts JSON, no server needed on your side. */
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, message: data.message, services: data.services.join(', '), _subject: 'Portfolio inquiry' })
      }).then(function (r) {
        if (!r.ok) throw new Error('bad status');
        success('Thank you! Your project scope was sent. I will reply within 4 hours.');
      }).catch(function () {
        setState('error', 'Something went wrong. Please try again or email ' + form.getAttribute('data-to') + ' directly.', true);
      });
    } else {
      /* No endpoint set: open the visitor's email app with the message ready to send. */
      var to = form.getAttribute('data-to');
      var href = buildMail(to, data);
      setTimeout(function () {
        window.location.href = href;
        success('A draft should now be open in your email client. You can also write to ' + to + ' directly.');
      }, 600);
    }
  });
})();
