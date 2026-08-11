export const CROSSNAV_PROFILE = {

  name: 'CrossNav Motorower',

  vehicle: 'moped',

  maxSpeed: 45,

  // Drogi, których motorower nie powinien używać
  forbiddenHighways: [
    'motorway',
    'motorway_link'
  ],

  // Drogi, które Odkrywca może preferować
  preferredHighways: [
    'residential',
    'unclassified',
    'tertiary',
    'track'
  ],

  // Nawierzchnie
  preferredSurfaces: [
    'asphalt',
    'concrete',
    'compacted',
    'fine_gravel',
    'gravel',
    'ground'
  ],

  // Tego NIE będziemy traktować
  // jako legalnej drogi tylko dlatego,
  // że jest w OSM
  forbiddenWays: [
    'footway',
    'steps',
    'pedestrian'
  ]

};
