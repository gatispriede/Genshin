/* One nav bar, injected into every page.
   Before this, only index.html had links - every other page was a dead end
   you had to use the back button to escape.

   Add a page here and it appears everywhere. Entries marked `ext` live in the
   companion farming project on its own server, so they are styled as leaving. */
(function () {
  'use strict';

  var PAGES = [
    { href: 'index.html', label: 'Home' },
    { href: 'quest-map.html', label: 'Quest map' },
    { href: 'reputation-quests.html', label: 'Reputation quests' },
    { href: 'reputation-compass.html', label: 'Compasses' },
    { href: 'collectible-map.html', label: 'Collectible maps' },
    { href: 'domains.html', label: 'Domains' },
    { href: 'local-legends.html', label: 'Local Legends' },
    { href: 'collectibles-status.html', label: 'Collectibles' },
    { href: 'build-coverage.html', label: 'Builds' },
    { href: 'talent-farming.html', label: 'Talent farming' },
    { href: 'theater.html', label: 'Theater' },
    { href: 'level-to-60.html', label: 'Four to Lv.60' },
    { href: 'codes.html', label: 'Codes' },
    { href: 'tcg-swap.html', label: 'TCG swaps' },
    { href: 'farming/map.html', label: 'Saurian map' },
    { href: 'farming/index.html', label: "Tyrant's Fang" }
  ];

  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  var nav = document.createElement('nav');
  nav.className = 'sitenav';
  nav.setAttribute('aria-label', 'Sections');

  var inner = document.createElement('div');
  inner.className = 'sitenav__inner';

  PAGES.forEach(function (p) {
    var a = document.createElement('a');
    a.href = p.href;
    a.textContent = p.label;
    if (p.ext) {
      a.className = 'sitenav__ext';
      a.rel = 'noopener';
      a.title = 'Companion farming project — needs its server on port 5173';
    } else if (p.href.toLowerCase() === here) {
      a.setAttribute('aria-current', 'page');
    }
    inner.appendChild(a);
  });

  nav.appendChild(inner);
  document.body.insertBefore(nav, document.body.firstChild);
})();
