/* Flag the reputation quests you cannot actually start yet.

   The lists only show the quest that PAYS reputation. When that quest ends a
   World Quest series, the earlier parts pay nothing and never appear - so a
   five-quest chain renders as one row and its length tier measures the final
   part alone. "Orobashi's Legacy: Part V" was listed as Short, 4 objectives,
   and needs four whole quests first.

   Two things are deliberately NOT shouted about:
     - Archon Quests behind the Archon storyline ("story"). That is the main
       plot; everyone knows it runs in order, and flagging 22 priors on it
       would bury the real finds.
     - Quests needing only the region's entry Archon quest ("entry"). If you
       are standing in Inazuma you have done Ritou Escape Plan.

   Data: reference/data/quest-chains.json, built by tools/fetch-quest-prereqs.py. */
(function () {
  'use strict';

  var LOUD = { worst: 1, bad: 1, mild: 1 };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* Completed rows carry a tick, and our own badge joins the cell's text on a
     re-run. Strip both, or a quest you have already finished fails to match. */
  function norm(s) {
    return String(s || '')
      .replace(/\b\d+\s+quests?\s+first\b.*$/i, '')
      .replace(/\bneeds\b.*$/i, '')
      .replace(/^[\s✓✔✅·\-—]+/, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function short(c) {
    if (c.priors) return c.priors + ' quest' + (c.priors === 1 ? '' : 's') + ' first';
    if (c.requirement) return 'needs ' + c.requirement.split(/;|,/)[0].slice(0, 42);
    return '';
  }

  fetch('reference/data/quest-chains.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(apply)
    .catch(function () { /* the page is still usable unannotated */ });

  function apply(d) {
    var byName = {};
    d.chains.forEach(function (c) { byName[norm(c.quest)] = c; });
    var shown = 0;

    Array.prototype.forEach.call(document.querySelectorAll('tr'), function (tr) {
      var cell = tr.querySelector('td.q');
      if (!cell) return;
      var c = byName[norm(cell.textContent)];
      if (!c) return;
      tr.classList.add('chain', 'chain--' + c.severity);
      if (!LOUD[c.severity]) return;
      shown++;
      cell.insertAdjacentHTML('beforeend',
        '<span class="chain__badge" title="' + esc(detail(c)) + '">' +
        esc(short(c)) + '</span>');
      var tier = tr.querySelector('td.tier');
      if (tier && c.priors) {
        tier.insertAdjacentHTML('beforeend',
          '<span class="chain__tierwarn" title="The tier measures the final quest only">' +
          'final quest only</span>');
      }
    });

    Array.prototype.forEach.call(document.querySelectorAll('h2'), function (h) {
      var c = byName[norm(h.textContent)];
      if (!c || !LOUD[c.severity]) return;
      shown++;
      h.insertAdjacentHTML('afterend', '<div class="bar warn chain__bar">' + full(c) + '</div>');
    });

    if (shown) lede(d, shown);
  }

  function detail(c) {
    var bits = [];
    if (c.priors) bits.push(c.priors + ' earlier quest' + (c.priors === 1 ? '' : 's'));
    if (c.requirement) bits.push('Requires: ' + c.requirement);
    if (c.archonPriors) bits.push('plus ' + c.archonPriors + ' Archon quests');
    if (c.note) bits.push(c.note);
    return bits.join(' — ');
  }

  function full(c) {
    var head = c.priors
      ? '<b>' + c.priors + ' earlier quest' + (c.priors === 1 ? '' : 's') +
        ' must be done first.</b>'
      : '<b>This one is gated.</b>';
    var out = head;
    if (c.requirement) out += ' Requires: ' + esc(c.requirement) + '.';
    if (c.note) out += ' <i>' + esc(c.note) + '</i>';
    if (c.before && c.before.length) {
      out += '<span class="chain__before">In order: ' +
        c.before.map(esc).join(' &rarr; ') +
        ' &rarr; <b>' + esc(c.quest) + '</b></span>';
    }
    if (c.archonPriors) {
      out += '<span class="chain__before">Plus ' + c.archonPriors +
        ' Archon Quests further back, which you have likely done.</span>';
    }
    return out;
  }

  function lede(d, shown) {
    var h1 = document.querySelector('h1');
    if (!h1) return;
    var worst = d.chains.filter(function (c) { return c.severity === 'worst'; })
                        .sort(function (a, b) { return (b.priors || 0) - (a.priors || 0); })
                        .slice(0, 3);
    h1.insertAdjacentHTML('afterend',
      '<div class="bar warn chain__lede">' +
      '<b>' + shown + ' of these cannot be started directly.</b> ' + esc(d._why) +
      (worst.length
        ? '<br><br><b>Deepest here:</b> ' + worst.map(function (c) {
            return esc(c.quest) + (c.priors ? ' (' + c.priors + ')' : '');
          }).join(' · ')
        : '') +
      '<br><span class="chain__before">' + esc(d._caveat) + '</span>' +
      '</div>');
  }
})();
