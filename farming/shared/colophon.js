/**
 * Sources and caveats, injected on every page.
 *
 * This lives in one file because the first version of the site kept it on a
 * single page; splitting the site into five dropped it from four of them,
 * including the one with the planner on it.
 */
(function () {
  'use strict';

  var SOURCES = [
    {
      href: 'https://gamewith.net/genshin-impact/article/show/47939',
      text: 'GameWith',
      what: 'route counts and step directions'
    },
    {
      href: 'https://game8.co/games/Genshin-Impact/archives/470331',
      text: 'Game8',
      what: 'drop and crafting rules'
    },
    {
      href: 'https://act.hoyolab.com/ys/app/interactive-map/index.html',
      text: 'HoYoLAB Interactive Map',
      what: 'every pin, place name and basemap tile'
    }
  ];

  var CAVEATS = [
    'Fangs per kill is your own estimate, not a published drop rate — no source publishes one.',
    'Two written routes carry a warning where the source’s own step list disagrees with its stated total.',
    'Reputation figures were doubled in a later patch; older guides still quote the halved numbers.'
  ];

  var foot = document.createElement('footer');
  foot.className = 'colophon';

  var p = document.createElement('p');
  p.appendChild(document.createTextNode('Built from '));
  SOURCES.forEach(function (s, i) {
    var a = document.createElement('a');
    a.href = s.href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.text;
    p.appendChild(a);
    p.appendChild(document.createTextNode(' (' + s.what + ')'));
    p.appendChild(document.createTextNode(
      i === SOURCES.length - 1 ? '. ' : i === SOURCES.length - 2 ? ' and ' : ', '
    ));
  });
  p.appendChild(document.createTextNode(
    'Everything marked “observed in game” was confirmed by screenshot instead.'
  ));
  foot.appendChild(p);

  var ul = document.createElement('ul');
  ul.className = 'colophon__caveats';
  CAVEATS.forEach(function (c) {
    var li = document.createElement('li');
    li.textContent = c;
    ul.appendChild(li);
  });
  foot.appendChild(ul);

  var main = document.querySelector('main') || document.body;
  main.appendChild(foot);
})();
