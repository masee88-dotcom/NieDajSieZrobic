import {
  getRoadsAround
} from './overpassService';

import {
  analyzeRoad
} from './roadAnalyzer';


export async function testOsm(
  latitude,
  longitude
) {

  const roads =
    await getRoadsAround(
      latitude,
      longitude,
      1000
    );


  const analyzed =
    roads.map(
      road =>
        analyzeRoad(
          road,
          'motorower'
        )
    );


  console.log(
    'CrossNav OSM - znaleziono dróg:',
    analyzed.length
  );


  analyzed
    .slice(0, 20)
    .forEach(road => {

      console.log(
        `${road.name} | ` +
        `${road.highway} | ` +
        `${road.surface} | ` +
        `score=${road.score} | ` +
        `legal=${road.accessAllowed &&
                 road.typeAllowed}`
      );

    });


  return analyzed;
}
