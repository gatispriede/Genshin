/* Redeem codes, and — the point of the page — which ones you have already used.

   Nothing can look that up: no API exposes an account's redemption history,
   and the only way to find out is to enter a code and see whether the game
   says "already in use". So this keeps your own record, in this browser.

   Codes themselves live in reference/data/codes.json as a dated snapshot. */
(function () {
  'use strict';

  var mount = document.getElementById('codes');
  if (!mount) return;

  var STORE = 'codes:used';
  var used = load();

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
    catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(used)); } catch (e) {}
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  fetch('reference/data/codes.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (d) { render(d); })
    .catch(function () {
      mount.innerHTML = '<div class="note">Could not read ' +
        '<code>reference/data/codes.json</code>.</div>';
    });

  function render(d) {
    var live = d.codes.filter(function (c) { return c.status !== 'expired'; });
    var dead = d.codes.filter(function (c) { return c.status === 'expired'; });

    function row(c) {
      var isUsed = !!used[c.code];
      var dateText = c.added === 'permanent' ? 'never expires'
                   : c.added ? 'found ' + c.added : '';
      return '<tr class="code' + (isUsed ? ' is-used' : '') +
        (c.status === 'expired' ? ' is-dead' : '') + '">' +
        '<td><button type="button" class="code__tick" data-code="' + esc(c.code) + '"' +
          (c.status === 'expired' ? ' disabled' : '') + '>' +
          (isUsed ? '✓' : '') + '</button></td>' +
        '<td><code class="code__text">' + esc(c.code) + '</code>' +
          (c.status === 'permanent' ? ' <span class="code__perm">permanent</span>' : '') +
        '</td>' +
        '<td>' + esc(c.rewards) +
          (c.note ? '<em>' + esc(c.note) + '</em>' : '') + '</td>' +
        '<td class="code__when">' + esc(dateText) + '</td>' +
        '</tr>';
    }

    mount.innerHTML =
      '<div class="bar key" id="codes-total"></div>' +
      '<h2>Live codes</h2>' +
      '<p class="sub">Tick one once you have redeemed it. A code you have already ' +
      'used simply errors in game, so there is no cost to trying any of these.</p>' +
      '<p><button type="button" class="btn-all" id="codes-all">Mark every live code as used</button> ' +
      '<button type="button" class="btn-all" id="codes-none">Clear all ticks</button></p>' +
      '<table class="asc code-table"><tbody>' + live.map(row).join('') + '</tbody></table>' +
      '<h2>Dead — do not bother</h2>' +
      '<p class="sub">Kept deliberately: several of these are <b>still listed as active</b> ' +
      'by code aggregators, and this project has wasted time on them before.</p>' +
      '<table class="asc code-table"><tbody>' + dead.map(row).join('') + '</tbody></table>' +
      '<div class="note"><b>Checked ' + esc(d._checked) + '</b> against ' +
        d._sources.length + ' sources: ' + d._sources.map(esc).join('; ') + '. ' +
        esc(d._note) + '</div>' +
      '<div class="bar"><b>Next batch:</b> ' + esc(d._next) + '</div>' +
      '<div class="note"><b>How:</b> ' + esc(d._howto) + '</div>';

    /* One delegated listener for the whole page. It lives on #codes, which render()
       refills rather than replaces, so it must be bound once — binding it inside
       render() would stack a second copy per redraw and toggle each tick twice. */
    if (!mount.dataset.bound) {
      mount.dataset.bound = '1';
      mount.addEventListener('click', function (e) {
        var tick = e.target.closest('.code__tick');
        if (tick && !tick.disabled) {
          var code = tick.dataset.code;
          if (used[code]) delete used[code]; else used[code] = 1;
          save();
          tick.textContent = used[code] ? '✓' : '';
          tick.closest('tr').classList.toggle('is-used', !!used[code]);
          total(d);
          return;
        }
        if (e.target.id === 'codes-all') {
          d.codes.forEach(function (c) {
            if (c.status !== 'expired') used[c.code] = 1;
          });
          save(); render(d);
        } else if (e.target.id === 'codes-none') {
          if (!confirm('Clear every tick?')) return;
          used = {}; save(); render(d);
        }
      });
    }

    total(d);
  }

  function total(d) {
    var out = document.getElementById('codes-total');
    if (!out) return;
    var live = d.codes.filter(function (c) { return c.status !== 'expired'; });
    var left = live.filter(function (c) { return !used[c.code]; });
    var gems = left.reduce(function (a, c) { return a + (c.primogems || 0); }, 0);
    out.innerHTML = left.length
      ? '<b>' + gems + ' Primogems</b> still unclaimed across <b>' + left.length +
        '</b> untried code' + (left.length === 1 ? '' : 's') + ', of ' + live.length + ' live.'
      : '<b>All ' + live.length + ' live codes ticked off.</b> Nothing left until the next batch.';
  }
})();
