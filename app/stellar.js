/* Stellar Glimmer reactions, and whether this account can actually run one.

   The whole subject hinges on one rule that is easy to miss: these reactions do
   not exist unless somebody in the party carries a Stellar Jubilee passive.
   Three characters in the game have one. So the page leads with the enablers
   and the verdict, not with the reaction theory.

   Data: reference/data/stellar.json, quoted from the wiki. */
(function () {
  'use strict';

  var mount = document.getElementById('stellar');
  if (!mount) return;

  var CDN = 'https://gi.yatta.moe/assets/UI/';
  var TINT = {
    Cryo: '#9fe3f0', Electro: '#b18fff', Anemo: '#5fd3b4',
    Hydro: '#4cc2ff', Geo: '#e0a944', Pyro: '#ff7b4d', Dendro: '#8fd04b'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function face(c, extra) {
    var tint = TINT[c.element] || '#8899aa';
    return '<figure class="st__card' + (c.owned ? ' is-owned' : ' is-missing') +
      (c.good === false ? ' is-weak' : '') + '">' +
      '<div class="st__face" style="border-color:' + tint + '">' +
        '<img src="' + CDN + esc(c.icon) + '.png" alt="' + esc(c.name) + '" loading="lazy">' +
      '</div>' +
      '<figcaption><b>' + esc(c.name) + '</b>' +
        (c.owned !== undefined
          ? '<span class="st__own">' + (c.owned ? 'you own this' : 'not owned') + '</span>'
          : '') +
        (c.level ? '<span class="st__own">Lv. ' + c.level + '</span>' : '') +
        (c.role ? '<span class="st__role">' + esc(c.role) + '</span>' : '') +
        (c.talent ? '<span class="st__role">' + esc(c.talent) + '</span>' : '') +
        (c.bonus ? '<span class="st__bonus">' + esc(c.bonus) + '</span>' : '') +
        '<span class="st__why">' + esc(c.why || c.note || '') + '</span>' +
        (extra || '') +
      '</figcaption></figure>';
  }

  fetch('reference/data/stellar.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(render)
    .catch(function () {
      mount.innerHTML = '<div class="note">Could not read ' +
        '<code>reference/data/stellar.json</code>.</div>';
    });

  function render(d) {
    var v = d.verdict;
    var html =
      '<div class="bar warn"><b>The one rule.</b> ' + esc(d._rule) + '</div>' +

      '<div class="st__verdict">' +
        '<h2>' + esc(v.question) + '</h2>' +
        '<p class="st__answer">' + esc(v.answer) + '</p>' +
        '<p>' + esc(v.detail) + '</p>' +
        '<p class="st__catch"><b>The catch:</b> ' + esc(v.catch) + '</p>' +
      '</div>' +

      '<h2>Every enabler in the game</h2>' +
      '<p class="sub">Three characters carry a <b>Stellar Jubilee</b> passive. ' +
      'Nothing else turns these reactions on.</p>' +
      '<div class="st__grid">' +
        d.enablers.concat(d.enablersMissing).map(function (c) { return face(c); }).join('') +
      '</div>' +

      '<h2>The two reactions</h2><div class="st__pair">' +
      d.reactions.map(function (r) {
        return '<div class="st__react">' +
          '<h3>' + esc(r.name) + '</h3>' +
          '<p class="st__recipe">' + esc(r.recipe) + '<em>replaces ' + esc(r.replaces) + '</em></p>' +
          '<p>' + esc(r.text) + '</p>' +
          '<p class="st__warn">' + esc(r.warn) + '</p></div>';
      }).join('') + '</div>' +

      '<h2>' + esc(d.field.name) + '</h2>' +
      '<p class="sub">From the ' + esc(d.field.from) + '.</p>' +
      '<ul class="st__list">' +
        d.field.effects.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') +
      '</ul>' +
      '<div class="note">' + esc(d.field.note) + '</div>' +

      '<h2>Who on your roster touches this</h2>' +
      '<div class="st__grid">' +
        d.roster.map(function (c) { return face(c); }).join('') +
      '</div>' +

      '<h2>Artifact sets that boost it</h2>' +
      '<table class="asc"><tbody>' +
        d.artifacts.map(function (a) {
          return '<tr><th scope="row">' + esc(a.set) + '<em>' + esc(a['for']) + '</em></th>' +
            '<td>' + esc(a.text) + '</td></tr>';
        }).join('') +
      '</tbody></table>' +

      '<div class="note"><b>Checked ' + esc(d._checked) + '.</b> ' + esc(d._source) + '</div>';

    mount.innerHTML = html;
  }
})();
