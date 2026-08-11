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


  const accessAllowed =
    isAccessAllowed(tags);


  const typeAllowed =
    isRoadAllowed(
      highway,
      mode
    );


  let surface =
    tags.surface ||
    'unknown';


  let score = 50;


  // --------------------------------
  // LEGALNOŚĆ
  // --------------------------------

  if (!accessAllowed) {
    score = -1000;
  }


  if (!typeAllowed) {
    score = -1000;
  }


  // --------------------------------
  // RODZAJ DROGI
  // --------------------------------

  if (
    highway === 'track'
  ) {
    score += 25;
  }

  if (
    highway === 'unclassified'
  ) {
    score += 15;
  }

  if (
    highway === 'residential'
  ) {
    score += 10;
  }

  if (
    highway === 'tertiary'
  ) {
    score += 5;
  }


  // --------------------------------
  // NAWIERZCHNIA
  // --------------------------------

  if (
    surface === 'gravel' ||
    surface === 'fine_gravel'
  ) {
    score += 20;
  }

  if (
    surface === 'compacted'
  ) {
    score += 15;
  }

  if (
    surface === 'ground' ||
    surface === 'dirt'
  ) {
    score += 20;
  }

  if (
    surface === 'mud'
  ) {
    score -= 20;
  }


  return {

    id: road.id,

    highway,

    name:
      tags.name ||
      getRoadName(highway),

    surface,

    accessAllowed,

    typeAllowed,

    score,

    tags

  };

}
