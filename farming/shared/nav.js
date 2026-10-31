/**
 * One source of truth for the site nav, injected into every page.
 * Add a page here and it appears everywhere; there is no build step.
 */
(function () {
  'use strict';

  var PAGES = [
    { href: 'index.html', label: 'Plan',   hint: 'What to do and how long it takes' },
    { href: 'map.html',   label: 'Map',    hint: 'Every spawn, circled and routed' },
    { href: 'routes.html', label: 'Routes', hint: 'All 16 written routes' },
    { href: 'quests.html', label: 'Quests', hint: 'The same map, pointed at world quests' },
    { href: 'reputation.html', label: 'Reputation', hint: 'Shortest path to each treasure compass' },
    { href: 'field.html', label: 'Field notes', hint: 'What the guides get wrong' },
    { href: '../quest-map.html', label: 'Quest map',
      hint: 'Every reputation quest, with NPC and start screenshot' },
    { href: '../index.html', label: 'Notes home',
      hint: 'The rest of the project' }
  ];

  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  var nav = document.createElement('nav');
  nav.className = 'nav';
  nav.setAttribute('aria-label', 'Sections');

  var inner = document.createElement('div');
  inner.className = 'nav__inner';

  var brand = document.createElement('a');
  brand.className = 'nav__brand';
  brand.href = 'index.html';
  brand.innerHTML = '<b>Tyrant&rsquo;s Fang</b><span>farming plan</span>';
  inner.appendChild(brand);

  var list = document.createElement('ul');
  list.className = 'nav__list';

  PAGES.forEach(function (p) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = p.href;
    a.textContent = p.label;
    a.title = p.hint;
    if (p.external) {
      a.className = 'nav__ext';
      a.rel = 'noopener';
    } else if (p.href.toLowerCase() === here) {
      a.setAttribute('aria-current', 'page');
    }
    li.appendChild(a);
    list.appendChild(li);
  });

  inner.appendChild(list);
  nav.appendChild(inner);
  document.body.insertBefore(nav, document.body.firstChild);
})();
