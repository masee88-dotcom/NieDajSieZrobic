import {
  getRoadsAlongRoute
} from './overpassService';

import {
  analyzeRoads
} from './roadAnalyzer';


export async function analyzeRouteWithOSM(
  route,
  mode = 'motorower'
) {

  if (
    !route ||
    !route.geometry
  ) {

    return {
      roads: [],
      score: 0,
      explorerScore: 0
    };

  }


  const roads =
    await getRoadsAlongRoute(
      route.geometry
    );


  const analyzed =
    analyzeRoads(
      roads,
      mode
    );


  if (
    analyzed.length === 0
  ) {

    return {
      roads: [],
      score: 0,
      explorerScore: 0
    };

  }


  const usable =
    analyzed.filter(
      road => road.usable
    );


  const explorerRoads =
    usable.filter(
      road =>
        road.highway === 'track' ||
        road.surface === 'gravel' ||
        road.surface === 'fine_gravel' ||
        road.surface === 'ground' ||
        road.surface === 'dirt' ||
        road.surface === 'compacted'
    );


  const totalScore =
    usable.reduce(
      (sum, road) =>
        sum + road.score,
      0
    );


  const explorerScore =
    explorerRoads.reduce(
      (sum, road) =>
        sum + road.score,
      0
    );


  return {

    roads: analyzed,

    score:
      totalScore,

    explorerScore,

    usableRoads:
      usable.length,

    explorerRoads:
      explorerRoads.length

  };

}
