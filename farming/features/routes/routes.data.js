/**
 * Natlan Saurian farming routes.
 *
 * Counts and directions transcribed from GameWith's Natlan Saurian route guide
 * (gamewith.net/genshin-impact/article/show/47939). `countNote` flags places
 * where the source's stated total disagrees with its own listed steps.
 *
 * Only Lv. 60+ Saurians drop Tyrant's Fang, so every route here assumes a
 * world level that spawns them at 60 or above (WL6+).
 */
window.NATLAN_ROUTES = [
  {
    id: 'canopy-1',
    region: 'Scions of the Canopy',
    name: 'Route 1',
    count: 17,
    countNote: 'Source states 17; its listed steps add up to 18.',
    waypoint: 'Tecicpac Peak waypoint',
    steps: [
      '8 near the water’s edge and the cliff southeast of the waypoint.',
      'Climb the cliff: 1 to the north, 1 to the northeast.',
      '2 under the southern cliff.',
      'Head east (or follow the river) to 4 on the cliff near the bridge.',
      'Go to the wooden scaffolding north, 2 in the valley below it.'
    ]
  },
  {
    id: 'echoes-1',
    region: 'Children of the Echoes',
    name: 'Route 1',
    count: 15,
    waypoint: 'Tepeacac Rise waypoint',
    steps: [
      'Northwest to the water’s edge for 3.',
      'Continue to the cliff edge: 3 on top, 2 below.',
      'Return to the waypoint, go west to the bridge for 4.',
      'Head under the waterfall, then 3 along the river below it.'
    ]
  },
  {
    id: 'echoes-2',
    region: 'Children of the Echoes',
    name: 'Route 2',
    count: 14,
    waypoint: 'Waypoint west of Tepeacac Rise',
    steps: [
      '2 along the river to the southwest.',
      '4 along the road north of the waypoint.',
      '1 at the base of the large tree to the east.',
      'Round to the back of the tree, head north for 7 more.'
    ]
  },
  {
    id: 'springs-1',
    region: 'People of the Springs',
    name: 'Route 1',
    count: 14,
    waypoint: 'Southeast waypoint, Ameyalco Waters',
    steps: [
      'Down the eastern slope for 2, then north to the coast.',
      'Walk the coast for 4.',
      'South along the coast from the northern peak for 4.',
      'Indwell a Koholasaurus to reach the northwest island for 2.',
      'Continue along the north coast for 2 more.'
    ]
  },
  {
    id: 'echoes-3',
    region: 'Children of the Echoes',
    name: 'Route 3',
    count: 13,
    waypoint: 'Statue of the Seven, Children of the Echoes',
    steps: [
      '1 on the wall just east of the statue.',
      'Southeast along the cliff wall to a nest of 4.',
      'South to the water: 8 around the water and the cliff to the west.'
    ]
  },
  {
    id: 'springs-2',
    region: 'People of the Springs',
    name: 'Route 2',
    count: 11,
    countNote: 'Source states 11; its listed steps add up to 8.',
    waypoint: 'Southeast warp',
    steps: [
      'North for 2, then cross to the tree on the opposite bank.',
      '3 on the opposite bank — two sea Saurians flee, so open with a bow or a Koholasaurus indwelling.',
      'North along the coast for 3.'
    ]
  },
  {
    id: 'canopy-4',
    region: 'Scions of the Canopy',
    name: 'Route 4',
    count: 10,
    waypoint: 'Northeast waypoint, Ancestral Temple',
    steps: [
      '2 on the steps to the southeast.',
      'Southwest from the warp for 5.',
      '1 on the lower west scaffolding, 2 on the ground at the very bottom.'
    ]
  },
  {
    id: 'canopy-2',
    region: 'Scions of the Canopy',
    name: 'Route 2',
    count: 9,
    waypoint: 'Statue of the Seven, Scions of the Canopy',
    steps: [
      '3 up the cliff just south of the statue.',
      '3 east of the statue.',
      'Southwest for 3 more.'
    ]
  },
  {
    id: 'echoes-4',
    region: 'Children of the Echoes',
    name: 'Route 4',
    count: 9,
    waypoint: 'North waypoint, Sulfurous Veins',
    steps: [
      'West for 2 on the rocks.',
      'Southwest for 3 near a rock.',
      'Top of the western cliff for 1, then south for 3.'
    ]
  },
  {
    id: 'canopy-3',
    region: 'Scions of the Canopy',
    name: 'Route 3',
    count: 8,
    waypoint: 'Northwest waypoint near Scions of the Canopy',
    steps: [
      '4 under the cliff north of the waypoint.',
      'West up the slope, then 4 at the bottom of the slope.'
    ]
  },
  {
    id: 'echoes-5',
    region: 'Children of the Echoes',
    name: 'Route 5',
    count: 7,
    waypoint: 'West waypoint, Sulfurous Veins',
    steps: [
      '3 to the southeast, 2 south of the same warp.',
      'East, then jump off the cliff for 2 on the ground below.'
    ]
  },
  {
    id: 'springs-3',
    region: 'People of the Springs',
    name: 'Route 3',
    count: 7,
    waypoint: 'Northeast warp, secret area',
    steps: ['Head to the water area, then southeast for 7.']
  },
  {
    id: 'canopy-5',
    region: 'Scions of the Canopy',
    name: 'Route 5',
    count: 6,
    waypoint: 'Hidden area',
    steps: [
      'West, roughly toward the Statue of the Seven, for 1.',
      '5 under the western cliff.'
    ]
  },
  {
    id: 'canopy-6',
    region: 'Scions of the Canopy',
    name: 'Route 6',
    count: 6,
    waypoint: 'East waypoint, Ancestral Temple',
    steps: ['Northwest for 1.', '5 under the cliff southeast of the waypoint.']
  },
  {
    id: 'springs-4',
    region: 'People of the Springs',
    name: 'Route 4',
    count: 6,
    waypoint: 'Northern waypoint, Ameyalco Waters',
    steps: ['South for 4 near the water.', 'West waters for 2 more.']
  },
  {
    id: 'springs-5',
    region: 'People of the Springs',
    name: 'Route 5',
    count: 6,
    waypoint: 'Secret area',
    steps: [
      'East for 1.',
      'Indwell a Yumkasaurus, move to the wooden platform south, 1 there.',
      'Continue along the cliff for 4 more.'
    ]
  }
];

window.REGION_TOTALS = {
  'Children of the Echoes': 58,
  'Scions of the Canopy': 56,
  'People of the Springs': 44
};
