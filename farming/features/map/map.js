/**
 * The Natlan Saurian map: official map tiles, every spawn as a dot, the fat
 * clusters circled and numbered, and an arrowed route joining the best ones.
 *
 * Pan by dragging, zoom with the wheel or the buttons. Cleared circles are
 * remembered per day in localStorage.
 */
(function () {
  'use strict';

  /* The page names its dataset, so this component is not Saurian-specific:
     <div class="smap" id="map-canvas" data-source="QUEST_MAP"> */
  var host = document.getElementById('map-canvas');
  if (!host) return;
  var source = host.dataset.source || 'SAURIAN_MAP';
  var DATA = window[source];
  if (!DATA) return;

  var ROUTE_STOPS = Number(host.dataset.routeStops || 6);
  var LABELLED = Number(host.dataset.labelled || 12);
  var STORE = 'tyrants-fang:cleared:' + source;
  /* Place names turn to mush when the whole continent is on screen. */
  var NAMES_FROM = Number(host.dataset.namesFrom || 0.25);
  /* N1 is the sharpest level the CDN serves, so beyond 1x the basemap
     upscales — worth allowing anyway to separate overlapping pins. */
  var MAX_ZOOM = Number(host.dataset.maxZoom || 4);

  var view = { x: 0, y: 0, k: 0.08 };
  var cleared = load();

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORE));
      if (raw && raw.day === today()) return raw;
    } catch (e) { /* fall through to a fresh day */ }
    return { day: today(), ids: [] };
  }
  function today() { return new Date().toISOString().slice(0, 10); }
  function persist() {
    cleared.day = today();
    try { localStorage.setItem(STORE, JSON.stringify(cleared)); } catch (e) { /* session only */ }
  }

  // ── Scaffold ─────────────────────────────────────────────────
  var world = document.createElement('div');
  world.className = 'smap__world';
  world.style.width = DATA.size.w + 'px';
  world.style.height = DATA.size.h + 'px';

  DATA.tiles.forEach(function (t) {
    var im = document.createElement('img');
    im.className = 'smap__tile';
    im.src = t.url;
    im.alt = '';
    im.loading = 'lazy';
    im.style.left = t.x + 'px';
    im.style.top = t.y + 'px';
    im.style.width = DATA.tileSize + 'px';
    im.style.height = DATA.tileSize + 'px';
    world.appendChild(im);
  });

  // Every individual spawn, as a faint dot.
  var dots = document.createElement('div');
  dots.className = 'smap__dots';
  var dotHtml = '';
  DATA.points.forEach(function (p) {
    dotHtml += '<i style="left:' + p[0] + 'px;top:' + p[1] + 'px"></i>';
  });
  dots.innerHTML = dotHtml;
  world.appendChild(dots);

  // Teleport waypoints — the thing that makes a cluster reachable.
  var waypoints = document.createElement('div');
  waypoints.className = 'smap__waypoints';
  (DATA.waypoints || []).forEach(function (w) {
    var el = document.createElement('i');
    el.className = 'smap__wp smap__wp--' + w.kind;
    el.style.left = w.x + 'px';
    el.style.top = w.y + 'px';
    el.title = w.kind === 'statue' ? 'Statue of the Seven'
             : w.kind === 'domain' ? 'Domain' : 'Teleport waypoint';
    waypoints.appendChild(el);
  });
  world.appendChild(waypoints);

  // Named places, so a circle can be described and not just pointed at.
  var places = document.createElement('div');
  places.className = 'smap__places';
  (DATA.areas || []).forEach(function (a) {
    var el = document.createElement('span');
    el.className = 'smap__place';
    el.style.left = a.x + 'px';
    el.style.top = a.y + 'px';
    el.textContent = a.name;
    places.appendChild(el);
  });
  world.appendChild(places);

  // ── Route: nearest-neighbour walk across the fattest clusters ─
  var top = DATA.clusters.slice(0, ROUTE_STOPS);
  var route = [];
  if (top.length) {
    var pool = top.slice(1);
    var cur = top[0];
    route.push(cur);
    while (pool.length) {
      var bi = 0, bd = Infinity;
      pool.forEach(function (c, i) {
        var d = Math.hypot(c.x - cur.x, c.y - cur.y);
        if (d < bd) { bd = d; bi = i; }
      });
      cur = pool.splice(bi, 1)[0];
      route.push(cur);
    }
  }

  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'smap__svg');
  svg.setAttribute('viewBox', '0 0 ' + DATA.size.w + ' ' + DATA.size.h);

  var defs = document.createElementNS(NS, 'defs');
  defs.innerHTML =
    '<marker id="smap-arrow" viewBox="0 0 10 10" refX="8" refY="5" ' +
    'markerWidth="5" markerHeight="5" orient="auto-start-reverse">' +
    '<path d="M0,0 L10,5 L0,10 z" fill="#ffb27a"/></marker>';
  svg.appendChild(defs);

  for (var i = 0; i < route.length - 1; i++) {
    var a = route[i], b = route[i + 1];
    var line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
    line.setAttribute('class', 'smap__leg');
    line.setAttribute('marker-end', 'url(#smap-arrow)');
    svg.appendChild(line);
  }
  world.appendChild(svg);

  // ── Circles ──────────────────────────────────────────────────
  var routeIds = route.map(function (c) { return c.x + ',' + c.y; });
  DATA.clusters.forEach(function (c, idx) {
    var id = c.x + ',' + c.y;
    var onRoute = routeIds.indexOf(id) !== -1;
    var el = document.createElement('button');
    el.type = 'button';
    el.className = 'smap__ring' + (onRoute ? ' is-route' : '');
    el.style.left = c.x + 'px';
    el.style.top = c.y + 'px';
    el.style.width = el.style.height = (c.r * 2) + 'px';
    el.dataset.id = id;
    el.title = c.n + ' ' + (host.dataset.noun || 'Saurians') +
      (c.place ? ' near ' + c.place : '') +
      (c.hop != null ? ' · ' + (c.hop < 90 ? 'teleport right beside it'
        : c.hop < 220 ? 'short walk from a teleport' : 'a glide from the nearest teleport') : '') +
      ' — click to mark cleared';

    if (idx < LABELLED || onRoute) {
      var tag = document.createElement('span');
      tag.className = 'smap__tag';
      tag.textContent = onRoute
        ? (routeIds.indexOf(id) + 1) + ' · ' + c.n
        : String(c.n);
      el.appendChild(tag);
    }
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      var at = cleared.ids.indexOf(id);
      if (at === -1) cleared.ids.push(id); else cleared.ids.splice(at, 1);
      persist();
      sync();
    });
    world.appendChild(el);
  });

  host.appendChild(world);

  function sync() {
    var rings = world.querySelectorAll('.smap__ring');
    var left = 0, total = 0;
    DATA.clusters.forEach(function (c) {
      total += c.n;
      if (cleared.ids.indexOf(c.x + ',' + c.y) === -1) left += c.n;
    });
    Array.prototype.forEach.call(rings, function (r) {
      r.classList.toggle('is-cleared', cleared.ids.indexOf(r.dataset.id) !== -1);
    });
    var out = document.getElementById('smap-status');
    if (out) {
      var noun = host.dataset.noun || 'Saurians';
      out.textContent = DATA.clusters.length + ' clusters · ' + total +
        ' ' + noun + ' in them · ' + left + ' left';
    }
  }

  // ── Pan + zoom ───────────────────────────────────────────────
  function apply() {
    world.style.transform =
      'translate(' + view.x + 'px,' + view.y + 'px) scale(' + view.k + ')';
    /* Markers divide by this, so rings and labels keep a constant
       on-screen size instead of swelling with the map. */
    world.style.setProperty('--k', view.k);
    world.classList.toggle('is-far', view.k < NAMES_FROM);
  }

  function fit() {
    var r = host.getBoundingClientRect();
    view.k = Math.min(r.width / DATA.size.w, r.height / DATA.size.h);
    view.x = (r.width - DATA.size.w * view.k) / 2;
    view.y = (r.height - DATA.size.h * view.k) / 2;
    apply();
  }

  function zoomAt(cx, cy, factor) {
    var k = Math.max(0.03, Math.min(MAX_ZOOM, view.k * factor));
    var ratio = k / view.k;
    view.x = cx - (cx - view.x) * ratio;
    view.y = cy - (cy - view.y) * ratio;
    view.k = k;
    apply();
  }

  host.addEventListener('wheel', function (e) {
    e.preventDefault();
    var r = host.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.18 : 1 / 1.18);
  }, { passive: false });

  var drag = null;
  host.addEventListener('pointerdown', function (e) {
    if (e.target.closest('.smap__ring')) return;
    drag = { x: e.clientX - view.x, y: e.clientY - view.y };
    host.setPointerCapture(e.pointerId);
    host.classList.add('is-grabbing');
  });
  host.addEventListener('pointermove', function (e) {
    if (!drag) return;
    view.x = e.clientX - drag.x;
    view.y = e.clientY - drag.y;
    apply();
  });
  ['pointerup', 'pointercancel'].forEach(function (ev) {
    host.addEventListener(ev, function () {
      drag = null;
      host.classList.remove('is-grabbing');
    });
  });

  var zi = document.getElementById('smap-in');
  var zo = document.getElementById('smap-out');
  var zf = document.getElementById('smap-fit');
  var toggle = document.getElementById('smap-dots');
  if (zi) zi.addEventListener('click', function () { centreZoom(1.35); });
  if (zo) zo.addEventListener('click', function () { centreZoom(1 / 1.35); });
  if (zf) zf.addEventListener('click', fit);
  if (toggle) toggle.addEventListener('change', function () {
    dots.style.display = toggle.checked ? '' : 'none';
  });

  var wpToggle = document.getElementById('smap-wp');
  if (wpToggle) wpToggle.addEventListener('change', function () {
    waypoints.style.display = wpToggle.checked ? '' : 'none';
  });

  function centreZoom(f) {
    var r = host.getBoundingClientRect();
    zoomAt(r.width / 2, r.height / 2, f);
  }

  // Jump straight to the best cluster.
  var go = document.getElementById('smap-best');
  if (go && DATA.clusters[0]) {
    go.addEventListener('click', function () {
      var c = DATA.clusters[0], r = host.getBoundingClientRect();
      view.k = 0.42;
      view.x = r.width / 2 - c.x * view.k;
      view.y = r.height / 2 - c.y * view.k;
      apply();
    });
  }

  // ── Deep links ───────────────────────────────────────────────
  // map.html?place=Tepeacac%20Rise  or  map.html?at=1234,567
  function flyTo(x, y, k) {
    var r = host.getBoundingClientRect();
    view.k = k || 0.45;
    view.x = r.width / 2 - x * view.k;
    view.y = r.height / 2 - y * view.k;
    apply();

    var ping = document.createElement('div');
    ping.className = 'smap__ping';
    ping.style.left = x + 'px';
    ping.style.top = y + 'px';
    world.appendChild(ping);
  }

  function announce(text) {
    var out = document.getElementById('smap-target');
    if (out) out.textContent = text;
  }

  var params = new URLSearchParams(location.search);
  var at = params.get('at');
  var place = params.get('place');

  if (at && /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(at)) {
    var xy = at.split(',').map(Number);
    flyTo(xy[0], xy[1]);
    announce('Showing the spot you came from.');
  } else if (place) {
    var want = place.trim().toLowerCase();
    var hit = (DATA.areas || []).filter(function (a) {
      return a.name.toLowerCase() === want;
    })[0] || (DATA.areas || []).filter(function (a) {
      return a.name.toLowerCase().indexOf(want) !== -1;
    })[0];

    if (hit) {
      flyTo(hit.x, hit.y);
      announce('Showing ' + hit.name + '.');
    } else {
      fit();
      announce('No place called “' + place + '” on this map — showing all of it.');
    }
  } else {
    fit();
  }

  sync();
  window.addEventListener('resize', function () {
    if (!at && !place) fit();
  });
})();
