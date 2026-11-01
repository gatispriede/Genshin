/* Swap effects in Genius Invokation, split by whether they actually pay you.

   The point of the split: most "switch" cards only make switching cheaper.
   Very few turn a switch into damage, healing, energy or dice. Lumping them
   together makes the pool look richer than it is, which is the mistake this
   page exists to avoid.

   Data: reference/data/tcg-swap.json, quoted from the wiki card lists. */
(function () {
  'use strict';

  var mount = document.getElementById('swap');
  if (!mount) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  fetch('reference/data/tcg-swap.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(render)
    .catch(function () {
      mount.innerHTML = '<div class="note">Could not read ' +
        '<code>reference/data/tcg-swap.json</code>.</div>';
    });

  function badge(c) {
    if (c.hostile) return '<span class="swap__tag swap__tag--bad">against you</span>';
    if (c.locked) return '<span class="swap__tag swap__tag--locked">locked</span>';
    if (c.payoff) return '<span class="swap__tag swap__tag--pay">pays you</span>';
    return '<span class="swap__tag">cheaper only</span>';
  }

  function card(c) {
    var cost = c.cost === 0 ? 'free' : c.cost + ' dice';
    return '<div class="swap__card' + (c.pick === 'best' ? ' is-pick' : '') +
      (c.owned ? ' is-owned' : '') + '">' +
      '<h3>' + esc(c.name) +
        (c.owned ? ' <span class="swap__own">you own this</span>' : '') + '</h3>' +
      '<p class="swap__meta">' + esc(c.type) + ' · <b>' + esc(cost) + '</b>' +
        (c.uses ? ' · ' + c.uses + ' uses' : '') + ' ' + badge(c) + '</p>' +
      '<blockquote class="swap__text">' + esc(c.text) + '</blockquote>' +
      (c.locked ? '<p class="swap__why"><b>Locked:</b> ' + esc(c.locked) + '</p>' : '') +
      (c.why ? '<p class="swap__why">' + esc(c.why) + '</p>' : '') +
      '</div>';
  }

  function render(d) {
    var pays = 0, cheap = 0;
    d.groups.forEach(function (g) {
      g.cards.forEach(function (c) {
        if (c.payoff) pays++; else if (!c.hostile && !c.locked) cheap++;
      });
    });

    var html =
      '<div class="bar warn"><b>There is no generic swap bonus.</b> ' +
      esc(d._reality) + '</div>' +

      '<div class="bar key"><b>' + pays + ' cards pay you for switching. ' +
      cheap + ' only make it cheaper.</b> Both are useful — but if you were ' +
      'looking for a card that rewards a swap the way a reaction rewards an ' +
      'element, it mostly does not exist.</div>' +

      '<h2>The two keywords</h2><div class="swap__grid">' +
      d.keywords.map(function (k) {
        return '<div class="swap__card"><h3>' + esc(k.name) + '</h3>' +
          '<blockquote class="swap__text">' + esc(k.text) + '</blockquote>' +
          '<p class="swap__why">' + esc(k.note) + '</p></div>';
      }).join('') + '</div>';

    d.groups.forEach(function (g) {
      html += '<h2>' + esc(g.title) + '</h2>' +
        (g.note ? '<p class="sub">' + esc(g.note) + '</p>' : '') +
        '<div class="swap__grid">' + g.cards.map(card).join('') + '</div>';
    });

    html += '<h2>Characters that turn a swap into something</h2>' +
      '<div class="swap__grid">' +
      d.characters.map(function (c) {
        return '<div class="swap__card' + (c.owned ? ' is-owned' : '') + '">' +
          '<h3>' + esc(c.name) +
            (c.owned ? ' <span class="swap__own">you own this</span>' : '') + '</h3>' +
          '<p class="swap__meta">' + esc(c.element) + ' · ' + c.hp + ' HP · <b>' +
            esc(c.cost || '') + '</b></p>' +
          '<blockquote class="swap__text">' + esc(c.text) + '</blockquote>' +
          '<p class="swap__why">' + esc(c.why) + '</p></div>';
      }).join('') + '</div>';

    html += '<h2>What is not settled</h2>' +
      d.caveats.map(function (t) {
        return '<div class="note">' + esc(t) + '</div>';
      }).join('');

    html += '<div class="note"><b>Checked ' + esc(d._checked) + '.</b> ' +
      esc(d._source) + ' ' + esc(d._note) + '</div>';

    mount.innerHTML = html;
  }
})();
