/* Flag quests you cannot actually start yet.

   The reputation lists only show the quest that PAYS reputation. When that
   quest is the last part of a World Quest series, the earlier parts pay
   nothing and never appear - so a five-quest chain renders as one row, and the
   length tier on that row measures the final part alone.

   "Orobashi's Legacy: Part V" is the clearest case: listed as Short, 4
   objectives, and not startable until four whole quests are done.

   This runs on any page that prints quest names in a table and rewrites the
   affected rows in place, so the static pages do not have to be regenerated.
   Data: reference/data/quest-chains.json. */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* Completed rows are prefixed with a tick, and the badge we add becomes part
     of the cell's textContent on a re-run. Strip both before matching, or a
     quest you have already finished silently fails to match. */
  function norm(s) {
    return String(s || '')
      .replace(/locked behind.*$/i, '')
      .replace(/^[\s✓✔✅·\-—]+/, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  /* reference/data/ resolves from the site root; regional pages live there too. */
  fetch('reference/data/quest-chains.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(apply)
    .catch(function () { /* page is still usable without the annotations */ });

  function apply(d) {
    var byName = {};
    d.chains.forEach(function (c) { byName[norm(c.quest)] = c; });

    var hits = 0;

    /* Table rows: match the quest-name cell, then rewrite that row. */
    Array.prototype.forEach.call(document.querySelectorAll('tr'), function (tr) {
      var cell = tr.querySelector('td.q');
      if (!cell) return;
      var c = byName[norm(cell.textContent)];
      if (!c) return;
      hits++;
      tr.classList.add('chain', 'chain--' + c.severity);
      cell.insertAdjacentHTML('beforeend', badge(c));
      var tier = tr.querySelector('td.tier');
      if (tier && c.severity !== 'ok') {
        tier.insertAdjacentHTML('beforeend',
          '<span class="chain__tierwarn" title="The tier measures the final part only">' +
          'final part only</span>');
      }
    });

    /* Headings on the regional walkthrough pages. */
    Array.prototype.forEach.call(document.querySelectorAll('h2'), function (h) {
      var c = byName[norm(h.textContent)];
      if (!c) return;
      hits++;
      h.insertAdjacentHTML('afterend',
        '<div class="bar warn chain__bar">' + body(c) + '</div>');
    });

    if (hits) lede(d);
  }

  function badge(c) {
    if (c.severity === 'ok') return '';
    var n = c.priors == null ? 'a whole series' : c.priors + ' quest' +
            (c.priors === 1 ? '' : 's');
    return '<span class="chain__badge" title="' + esc(c.note) + '">' +
           'locked behind ' + n + '</span>';
  }

  function body(c) {
    var head = c.priors == null
      ? '<b>You cannot start this yet — it needs a whole series first.</b>'
      : '<b>' + c.priors + ' earlier quest' + (c.priors === 1 ? '' : 's') +
        ' must be done first.</b>';
    return head + ' ' + esc(c.note) +
      (c.before && c.before.length
        ? '<br><span class="chain__before">In order: ' +
          c.before.map(esc).join(' &rarr; ') + ' &rarr; <b>' + esc(c.quest) +
          '</b></span>'
        : '');
  }

  function lede(d) {
    var host = document.querySelector('h1');
    if (!host) return;
    var worst = d.chains.filter(function (c) { return c.severity === 'worst'; });
    host.insertAdjacentHTML('afterend',
      '<div class="bar warn chain__lede">' +
      '<b>Some of these cannot be started directly.</b> ' + esc(d._why) +
      (worst.length
        ? '<br><br><b>Worst offenders:</b> ' +
          worst.map(function (c) { return esc(c.quest); }).join(' and ') + '.'
        : '') +
      '</div>');
  }
})();
