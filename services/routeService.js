import { CROSSNAV_PROFILE } from './routing/crossNavProfile';
import { EXPLORER_PROFILE } from './routing/explorerProfile';


async function requestRoute(
  startLat,
  startLon,
  endLat,
  endLon,
  options = {}
) {

  let url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${startLon},${startLat};${endLon},${endLat}` +
    `?overview=full&geometries=geojson`;

  if (options.avoidMotorway) {
    url += '&exclude=motorway';
  }

  console.log(
    'CrossNav routing:',
    options.mode || 'normal'
  );

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const json = await response.json();

  if (!json.routes || !json.routes.length) {
    return null;
  }

  const route = json.routes[0];

  return {
    distance: route.distance,
    duration: route.duration,
    geometry: route.geometry.coordinates
  };
}


export async function getRoute(
  startLat,
  startLon,
  endLat,
  endLon,
  profile = {}
) {

  try {

    const explorerMode =
      profile.explorerMode || 'normal';


    // ==================================
    // NORMALNA TRASA
    // ==================================

    if (explorerMode === 'normal') {

      return await requestRoute(
        startLat,
        startLon,
        endLat,
        endLon,
        {
          mode: 'normal',
          avoidMotorway:
            profile.avoidMotorway === true
        }
      );
    }


    // ==================================
    // ODKRYWCA
    // ==================================

    if (explorerMode === 'explorer') {

      console.log(
        'CrossNav Odkrywca:',
        EXPLORER_PROFILE.name
      );

      const route =
        await requestRoute(
          startLat,
          startLon,
          endLat,
          endLon,
          {
            mode: 'explorer',
            avoidMotorway:
              EXPLORER_PROFILE.avoidMotorway
          }
        );

      if (route) {
        return route;
      }

      // awaryjnie zwykła trasa
      return await requestRoute(
        startLat,
        startLon,
        endLat,
        endLon,
        {
          mode: 'explorer-fallback'
        }
      );
    }


    // ==================================
    // TEREN
    // ==================================

    if (explorerMode === 'terrain') {

      console.log(
        'CrossNav Teren:',
        CROSSNAV_PROFILE.name
      );

      const route =
        await requestRoute(
          startLat,
          startLon,
          endLat,
          endLon,
          {
            mode: 'terrain',
            avoidMotorway: true
          }
        );

      if (route) {
        return route;
      }

      return await requestRoute(
        startLat,
        startLon,
        endLat,
        endLon,
        {
          mode: 'terrain-fallback'
        }
      );
    }


    // ==================================
    // AWARYJNIE
    // ==================================

    return await requestRoute(
      startLat,
      startLon,
      endLat,
      endLon,
      {}
    );


  } catch (e) {

    console.log(
      'CrossNav routing error:',
      e
    );

    return null;
  }

}
