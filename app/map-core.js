/* The parts every map page needs: basemap tiles, teleports, place names, and
   pan/zoom. What sits on top differs - the quest map opens an info panel, the
   collectible map ticks pins off and groups them into warps - so this deals
   only with the shared ground and hands back the pieces.

   window.MapCore(host, DATA, opts) -> { world, view, apply, fit, frame, zoomAt,
                                         layer(), wpLayer, nameLayer }

   Markers divide by the CSS var --k, which is kept in step with the zoom, so
   they hold a constant on-screen size instead of swelling with the map. */
(function () {
  'use strict';

  window.MapCore = function (host, DATA, opts) {
    opts = opts || {};
    var MAX_ZOOM = opts.maxZoom || 5;
    var NAMES_FROM = opts.namesFrom || 0.45;
    var ignore = opts.dragIgnore || '';

    var view = { x: 0, y: 0, k: 0.2 };

    var world = document.createElement('div');
    world.className = 'lmap__world';
    world.style.width = DATA.size.w + 'px';
    world.style.height = DATA.size.h + 'px';

    DATA.tiles.forEach(function (t) {
      var im = document.createElement('img');
      im.className = 'lmap__tile';
      im.src = t.url;
      im.alt = '';
      im.loading = 'lazy';
      im.style.cssText = 'left:' + t.x + 'px;top:' + t.y + 'px;width:' +
        DATA.tileSize + 'px;height:' + DATA.tileSize + 'px';
      world.appendChild(im);
    });

    function layer(cls) {
      var el = document.createElement('div');
      el.className = 'lmap__layer' + (cls ? ' ' + cls : '');
      world.appendChild(el);
      return el;
    }

    // Teleports: the thing that makes any pin reachable.
    var wpLayer = layer();
    (DATA.waypoints || []).forEach(function (w) {
      var el = document.createElement('i');
      el.className = 'lmap__wp lmap__wp--' + w.kind;
      el.style.left = w.x + 'px';
      el.style.top = w.y + 'px';
      el.title = w.kind === 'statue' ? 'Statue of the Seven'
               : w.kind === 'domain' ? 'Domain' : 'Teleport waypoint';
      wpLayer.appendChild(el);
    });

    // Place names, so a pin can be described and not just pointed at.
    var nameLayer = layer('lmap__names');
    (DATA.areas || []).forEach(function (a) {
      var el = document.createElement('span');
      el.className = 'lmap__place';
      el.style.left = a.x + 'px';
      el.style.top = a.y + 'px';
      el.textContent = a.name;
      nameLayer.appendChild(el);
    });

    host.appendChild(world);

    // ── view ──────────────────────────────────────────────────────────
    function apply() {
      world.style.transform =
        'translate(' + view.x + 'px,' + view.y + 'px) scale(' + view.k + ')';
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

    /* Frame a set of {x, y} points - used for "show me this region" and
       "show me this warp and everything it serves". */
    function frame(points, pad) {
      if (!points || !points.length) return;
      pad = pad == null ? 120 : pad;
      var xs = points.map(function (p) { return p.x; });
      var ys = points.map(function (p) { return p.y; });
      var minX = Math.min.apply(null, xs) - pad;
      var maxX = Math.max.apply(null, xs) + pad;
      var minY = Math.min.apply(null, ys) - pad;
      var maxY = Math.max.apply(null, ys) + pad;
      var r = host.getBoundingClientRect();
      view.k = Math.max(0.05, Math.min(MAX_ZOOM,
        Math.min(r.width / (maxX - minX), r.height / (maxY - minY))));
      view.x = r.width / 2 - ((minX + maxX) / 2) * view.k;
      view.y = r.height / 2 - ((minY + maxY) / 2) * view.k;
      apply();
    }

    function zoomAt(cx, cy, factor) {
      var k = Math.max(0.05, Math.min(MAX_ZOOM, view.k * factor));
      var ratio = k / view.k;
      view.x = cx - (cx - view.x) * ratio;
      view.y = cy - (cy - view.y) * ratio;
      view.k = k;
      apply();
    }

    function centreZoom(factor) {
      var r = host.getBoundingClientRect();
      zoomAt(r.width / 2, r.height / 2, factor);
    }

    host.addEventListener('wheel', function (e) {
      e.preventDefault();
      var r = host.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.2 : 1 / 1.2);
    }, { passive: false });

    var drag = null;
    host.addEventListener('pointerdown', function (e) {
      if (ignore && e.target.closest(ignore)) return;
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

    /* Wire the +/-/Fit buttons a page chose to include. */
    function buttons(ids) {
      var zin = document.getElementById(ids.in);
      var zout = document.getElementById(ids.out);
      var zfit = document.getElementById(ids.fit);
      if (zin) zin.addEventListener('click', function () { centreZoom(1.4); });
      if (zout) zout.addEventListener('click', function () { centreZoom(1 / 1.4); });
      if (zfit && ids.onFit) zfit.addEventListener('click', ids.onFit);
      else if (zfit) zfit.addEventListener('click', fit);
    }

    return {
      world: world, view: view, wpLayer: wpLayer, nameLayer: nameLayer,
      layer: layer, apply: apply, fit: fit, frame: frame,
      zoomAt: zoomAt, centreZoom: centreZoom, buttons: buttons
    };
  };
})();
