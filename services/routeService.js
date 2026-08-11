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

  // Na razie tylko autostrady możemy bezpiecznie
  // wykluczyć w publicznym OSRM.
  if (options.avoidMotorway) {
    url += '&exclude=motorway';
  }

  console.log(
    'CrossNav routing:',
    options.explorerMode || 'normal'
  );

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const json = await response.json();

  if (
    !json.routes ||
    !json.routes.length
  ) {
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

    const explorer =
      profile.explorerMode || 'normal';

    /*
     * NORMALNA
     */
    if (explorer === 'normal') {

      return await requestRoute(
        startLat,
        startLon,
        endLat,
        endLon,
        {
          avoidMotorway:
            profile.avoidMotorway === true
        }
      );
    }


    /*
     * ODKRYWCA / TEREN
     *
     * Na obecnym silniku zaczynamy od
     * bezpiecznego wykluczenia autostrad.
     *
     * Prawdziwe preferowanie dróg gruntowych
     * dołożymy po podłączeniu właściwego
     * silnika routingu.
     */

    const explorerRoute =
      await requestRoute(
        startLat,
        startLon,
        endLat,
        endLon,
        {
          avoidMotorway: true,
          explorerMode: explorer
        }
      );

    if (explorerRoute) {
      return explorerRoute;
    }


    // Awaryjnie zwykła trasa

    return await requestRoute(
      startLat,
      startLon,
      endLat,
      endLon,
      {
        avoidMotorway: false,
        explorerMode: 'fallback'
      }
    );

  } catch (e) {

    console.log(
      'CrossNav routing error:',
      e
    );

    return null;
  }

}
