const OSRM_URL =
  'https://router.project-osrm.org/route/v1/driving';


async function requestRoutes(
  startLat,
  startLon,
  endLat,
  endLon,
  options = {}
) {

  let url =
    `${OSRM_URL}/` +
    `${startLon},${startLat};${endLon},${endLat}` +
    `?overview=full` +
    `&geometries=geojson` +
    `&alternatives=3` +
    `&steps=true`;

  if (options.avoidMotorway) {
    url += '&exclude=motorway';
  }

  console.log(
    'CrossNav routing:',
    options.mode || 'normal'
  );

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`OSRM HTTP ${response.status}`);
  }

  const json = await response.json();

  if (
    json.code !== 'Ok' ||
    !json.routes ||
    !json.routes.length
  ) {
    return null;
  }

  return json.routes.map((route, index) => ({

    id: index,

    distance: route.distance,

    duration: route.duration,

    geometry:
      route.geometry.coordinates,

    steps:
      route.legs?.flatMap(
        leg => leg.steps || []
      ) || []

  }));
}


export async function getRoute(
  startLat,
  startLon,
  endLat,
  endLon,
  profile = {}
) {

  try {

    const mode =
      profile.explorerMode || 'normal';


    const routes =
      await requestRoutes(
        startLat,
        startLon,
        endLat,
        endLon,
        {
          mode,

          avoidMotorway:
            mode !== 'normal' ||
            profile.avoidMotorway === true
        }
      );


    if (!routes || !routes.length) {
      return null;
    }


    /*
     * NORMALNA TRASA
     *
     * Bierzemy pierwszą trasę,
     * którą OSRM uznał za najlepszą.
     */

    if (mode === 'normal') {

      return routes[0];

    }


    /*
     * ODKRYWCA / TEREN
     *
     * Na tym etapie wybieramy
     * alternatywę z najmniejszym
     * dystansem spośród dostępnych.
     *
     * Kolejny etap dołoży tutaj
     * prawdziwą ocenę dróg z OSM.
     */

    const sorted =
      [...routes].sort(
        (a, b) =>
          a.distance - b.distance
      );


    return sorted[0];


  } catch (error) {

    console.log(
      'CrossNav route error:',
      error
    );

    return null;

  }

}
