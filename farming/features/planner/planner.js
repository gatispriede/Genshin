/**
 * "How much farming is left": converts everything to Juvenile-equivalents,
 * then turns the gap into kills and days at the best route's density.
 */
(function () {
  'use strict';

  var routes = window.NATLAN_ROUTES || [];
  var map = window.SAURIAN_MAP;

  /* Fangs convert upward 3:1, so Juvenile is the common unit. */
  var PER_SEASONED = 3;
  var PER_TYRANT = 9;

  var inputs = {
    need: document.getElementById('need'),
    haveTyrant: document.getElementById('haveTyrant'),
    haveSeasoned: document.getElementById('haveSeasoned'),
    haveJuvenile: document.getElementById('haveJuvenile'),
    perKill: document.getElementById('perKill')
  };
  var readout = document.getElementById('readout');
  if (!readout || !inputs.need) return;

  /* The map's fattest cluster beats any written route, so prefer it. */
  var best = map && map.clusters && map.clusters[0]
    ? { label: 'the densest cluster on the map', count: map.clusters[0].n }
    : routes[0]
      ? { label: routes[0].region + ' ' + routes[0].name, count: routes[0].count }
      : null;

  function num(el, fallback) {
    var v = parseFloat(el.value);
    return isFinite(v) && v >= 0 ? v : fallback;
  }

  function render() {
    var need = Math.floor(num(inputs.need, 0));
    var perKill = num(inputs.perKill, 2) || 2;

    var needJuv = need * PER_TYRANT;
    var haveJuv =
      Math.floor(num(inputs.haveTyrant, 0)) * PER_TYRANT +
      Math.floor(num(inputs.haveSeasoned, 0)) * PER_SEASONED +
      Math.floor(num(inputs.haveJuvenile, 0));

    var deficit = Math.max(0, needJuv - haveJuv);
    var craftable = Math.floor(haveJuv / PER_TYRANT);

    if (deficit === 0) {
      readout.innerHTML =
        '<p class="done"><b>You already have enough.</b> Craft up at any Alchemy table ' +
        'and you land on <b>' + craftable + '</b> Tyrant&rsquo;s Fang.</p>';
      return;
    }

    var kills = Math.ceil(deficit / perKill);
    var days = best ? Math.ceil(kills / best.count) : 0;

    readout.innerHTML =
      '<p>You can craft <b>' + craftable + '</b> right now, leaving <b>' +
      (need - craftable) + '</b> short.</p>' +
      '<p>That gap is <b>' + deficit + '</b> Juvenile-equivalent fangs &mdash; roughly <b>' +
      kills + '</b> Saurian kills at your ' + perKill + '-per-kill estimate.</p>' +
      (best
        ? '<p>Clearing <b>' + best.label + '</b> (' + best.count +
          ' Saurians) once per daily reset, that is about <b>' + days +
          (days === 1 ? '</b> day.' : '</b> days.') +
          ' <a href="map.html">Show me where &rarr;</a></p>'
        : '');
  }

  Object.keys(inputs).forEach(function (k) {
    if (inputs[k]) inputs[k].addEventListener('input', render);
  });

  render();
})();
