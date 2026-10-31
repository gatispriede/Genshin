/**
 * The written-route list: region filter, expandable directions, and a
 * "cleared today" checkbox per route kept in localStorage.
 */
(function () {
  'use strict';

  var routes = window.NATLAN_ROUTES || [];
  var totals = window.REGION_TOTALS || {};
  var STORE = 'tyrants-fang:cleared';

  var list = document.getElementById('routes');
  var filters = document.getElementById('filters');
  var runningTotal = document.getElementById('running-total');
  if (!list || !filters) return;

  var cleared = load();
  var activeRegion = 'All';
  var areas = (window.SAURIAN_MAP && window.SAURIAN_MAP.areas) || [];

  /**
   * Resolve a route to a named place the map knows about. Prefer the
   * route's own waypoint ("Tepeacac Rise waypoint" → "Tepeacac Rise");
   * fall back to its tribe region, which is only approximate.
   */
  function placeFor(route) {
    var hay = route.waypoint.toLowerCase();
    var byWaypoint = areas.filter(function (a) {
      return hay.indexOf(a.name.toLowerCase()) !== -1;
    }).sort(function (a, b) { return b.name.length - a.name.length; })[0];
    if (byWaypoint) return { name: byWaypoint.name, exact: true };

    /* The map and the route guides disagree on filler words —
       "Children of Echoes" vs "Children of the Echoes" — so compare
       only the words that carry meaning. */
    var keywords = function (s) {
      return s.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/)
        .filter(function (w) { return w && ['the', 'of', 'a'].indexOf(w) === -1; });
    };
    var want = keywords(route.region);
    var byRegion = areas.filter(function (a) {
      var got = keywords(a.name);
      return want.length && want.every(function (w) { return got.indexOf(w) !== -1; });
    }).sort(function (a, b) { return a.name.length - b.name.length; })[0];
    if (byRegion) return { name: byRegion.name, exact: false };

    return null;
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
    catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(cleared)); }
    catch (e) { /* session only */ }
  }

  function visible() {
    return activeRegion === 'All'
      ? routes
      : routes.filter(function (r) { return r.region === activeRegion; });
  }

  function renderTotal() {
    var shown = visible();
    var sum = shown.reduce(function (a, r) { return a + r.count; }, 0);
    var left = shown.reduce(function (a, r) {
      return a + (cleared[r.id] ? 0 : r.count);
    }, 0);
    var note = activeRegion !== 'All' && totals[activeRegion]
      ? ' The region holds ' + totals[activeRegion] + ' Saurians in total.'
      : '';
    runningTotal.textContent =
      shown.length + ' routes · ' + sum + ' Saurians · ' + left +
      ' still uncleared today.' + note;
  }

  function render() {
    list.innerHTML = '';
    visible().forEach(function (r) {
      var li = document.createElement('li');
      var details = document.createElement('details');
      details.className = 'route';
      details.dataset.cleared = cleared[r.id] ? 'true' : 'false';

      var summary = document.createElement('summary');
      summary.innerHTML =
        '<span class="route__count">' + r.count + '</span>' +
        '<span class="route__name"><b>' + r.region + ' &middot; ' + r.name +
        '</b><span>' + r.waypoint + '</span></span>';
      details.appendChild(summary);

      var body = document.createElement('div');
      body.className = 'route__body';

      var ol = document.createElement('ol');
      r.steps.forEach(function (s) {
        var step = document.createElement('li');
        step.textContent = s;
        ol.appendChild(step);
      });
      body.appendChild(ol);

      if (r.countNote) {
        var warn = document.createElement('p');
        warn.className = 'route__warn';
        warn.textContent = '⚠ ' + r.countNote;
        body.appendChild(warn);
      }

      var label = document.createElement('label');
      label.className = 'route__clear';
      var box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = !!cleared[r.id];
      box.addEventListener('change', function () {
        if (box.checked) cleared[r.id] = true;
        else delete cleared[r.id];
        save();
        details.dataset.cleared = box.checked ? 'true' : 'false';
        renderTotal();
      });
      label.appendChild(box);
      label.appendChild(document.createTextNode('Cleared today'));

      var actions = document.createElement('div');
      actions.className = 'route__actions';
      actions.appendChild(label);

      var place = placeFor(r);
      if (place) {
        var link = document.createElement('a');
        link.className = 'route__map';
        link.href = 'map.html?place=' + encodeURIComponent(place.name);
        link.textContent = place.exact
          ? 'Show ' + place.name + ' on the map →'
          : 'Show the ' + place.name + ' area on the map →';
        if (!place.exact) link.title = 'Approximate — the map has no pin named "' + r.waypoint + '"';
        actions.appendChild(link);
      }

      body.appendChild(actions);

      details.appendChild(body);
      li.appendChild(details);
      list.appendChild(li);
    });
    renderTotal();
  }

  var regions = ['All'].concat(
    routes.reduce(function (acc, r) {
      if (acc.indexOf(r.region) === -1) acc.push(r.region);
      return acc;
    }, [])
  );

  regions.forEach(function (region) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.textContent = region;
    btn.setAttribute('aria-pressed', String(region === activeRegion));
    btn.addEventListener('click', function () {
      activeRegion = region;
      Array.prototype.forEach.call(filters.children, function (c) {
        c.setAttribute('aria-pressed', String(c === btn));
      });
      render();
    });
    filters.appendChild(btn);
  });

  render();
})();
