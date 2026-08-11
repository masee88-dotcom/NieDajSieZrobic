import {
  isRoadAllowed,
  getRoadName
} from '../routing/roadRules';

import {
  isAccessAllowed
} from '../routing/accessRules';


export function analyzeRoad(
  road,
  mode = 'motorower'
) {

  const tags =
    road.tags || {};

  const highway =
    tags.highway;

  const surface =
    tags.surface ||
    'unknown';


  const accessAllowed =
    isAccessAllowed(tags);


  const typeAllowed =
    isRoadAllowed(
      highway,
      mode
    );


  let score = 0;


  // =====================================
  // DROGA NIEDOZWOLONA
  // =====================================

  if (!accessAllowed) {

    return {
      ...road,

      highway,

      name:
        tags.name ||
        getRoadName(highway),

      surface,

      accessAllowed: false,

      typeAllowed,

      score: -1000,

      usable: false,

      tags
    };

  }


  if (!typeAllowed) {

    return {
      ...road,

      highway,

      name:
        tags.name ||
        getRoadName(highway),

      surface,

      accessAllowed,

      typeAllowed: false,

      score: -1000,

      usable: false,

      tags
    };

  }


  // =====================================
  // TYP DROGI
  // =====================================

  switch (highway) {

    case 'track':
      score += 40;
      break;

    case 'unclassified':
      score += 20;
      break;

    case 'service':
      score += 15;
      break;

    case 'residential':
      score += 10;
      break;

    case 'tertiary':
      score += 5;
      break;

    case 'secondary':
      score += 2;
      break;

    case 'primary':
      score -= 5;
      break;

    case 'trunk':
      score -= 15;
      break;

  }


  // =====================================
  // NAWIERZCHNIA
  // =====================================

  switch (surface) {

    case 'gravel':
      score += 35;
      break;

    case 'fine_gravel':
      score += 30;
      break;

    case 'compacted':
      score += 25;
      break;

    case 'ground':
      score += 30;
      break;

    case 'dirt':
      score += 30;
      break;

    case 'earth':
      score += 30;
      break;

    case 'sand':
      score += 15;
      break;

    case 'grass':
      score += 10;
      break;

    case 'mud':
      score -= 15;
      break;

    case 'cobblestone':
      score += 5;
      break;

    case 'paving_stones':
      score += 2;
      break;

    case 'asphalt':
      score += 0;
      break;

    case 'concrete':
      score -= 2;
      break;

  }


  // =====================================
  // ODKRYWCA
  // =====================================

  if (
    mode === 'explorer'
  ) {

    if (
      highway === 'track'
    ) {
      score += 30;
    }

    if (
      surface === 'gravel' ||
      surface === 'ground' ||
      surface === 'dirt' ||
      surface === 'compacted'
    ) {
      score += 25;
    }

  }


  return {

    ...road,

    highway,

    name:
      tags.name ||
      getRoadName(highway),

    surface,

    accessAllowed,

    typeAllowed,

    score,

    usable:
      score > -500,

    tags

  };

}


export function analyzeRoads(
  roads,
  mode = 'motorower'
) {

  return roads
    .map(road =>
      analyzeRoad(
        road,
        mode
      )
    )
    .sort(
      (a, b) =>
        b.score - a.score
    );

}
