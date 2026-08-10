export async function getRoute(
  startLat,
  startLon,
  endLat,
  endLon,
  profile = {}
) {

  try {

    /*
     * OSRM publiczny używa profilu samochodowego.
     * Parametry CrossNav przechowujemy już tutaj,
     * żeby później można było podłączyć właściwy
     * silnik routingu dla motorowerów i crossów.
     */

    const avoidHighways =
      profile.avoidHighways === true;

    const avoidMotorways =
      profile.avoidMotorways === true;


    let url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${startLon},${startLat};${endLon},${endLat}` +
      `?overview=full&geometries=geojson`;


    /*
     * Dodatkowe parametry zapisujemy w zapytaniu.
     * Publiczny OSRM może je ignorować,
     * ale zachowujemy strukturę pod przyszły routing CrossNav.
     */

    if (avoidHighways) {
      url += '&exclude=motorway';
    }


    if (avoidMotorways && !avoidHighways) {
      url += '&exclude=motorway';
    }


    console.log(
      'CrossNav routing profile:',
      profile.name || 'standard'
    );


    const response =
      await fetch(url);


    if (!response.ok) {

      console.log(
        'Routing HTTP error:',
        response.status
      );

      return null;
    }


    const json =
      await response.json();


    if (
      !json.routes ||
      !json.routes.length
    ) {

      return null;
    }


    const route =
      json.routes[0];


    return {

      distance:
        route.distance,

      duration:
        route.duration,

      geometry:
        route.geometry.coordinates

    };


  } catch (e) {

    console.log(
      'Routing error:',
      e
    );

    return null;
  }

}
