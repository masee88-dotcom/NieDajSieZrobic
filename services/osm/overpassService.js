const OVERPASS_URL =
  'https://overpass-api.de/api/interpreter';


function buildRouteQuery(routeCoords) {

  const points = routeCoords
    .filter(point =>
      Array.isArray(point) &&
      point.length >= 2
    )
    .filter((point, index, array) => {
      return index % 10 === 0 ||
        index === array.length - 1;
    })
    .map(point => {
      const lon = point[0];
      const lat = point[1];

      return `way(around:40,${lat},${lon})["highway"];`;
    })
    .join('\n');


  return `
[out:json][timeout:60];

(
  ${points}
);

out tags center;
`;
}


export async function getRoadsAlongRoute(
  routeCoords
) {

  if (
    !routeCoords ||
    routeCoords.length === 0
  ) {
    return [];
  }


  try {

    const query =
      buildRouteQuery(routeCoords);


    const response =
      await fetch(
        OVERPASS_URL,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded'
          },

          body:
            'data=' +
            encodeURIComponent(query)
        }
      );


    if (!response.ok) {

      throw new Error(
        `Overpass HTTP ${response.status}`
      );

    }


    const json =
      await response.json();


    if (
      !json.elements ||
      !Array.isArray(json.elements)
    ) {

      return [];

    }


    /*
     * Jeden OSM way może zostać znaleziony
     * wiele razy, dlatego usuwamy duplikaty.
     */

    const unique =
      new Map();


    for (
      const element
      of json.elements
    ) {

      if (
        element.type !== 'way'
      ) {
        continue;
      }


      if (
        !element.tags?.highway
      ) {
        continue;
      }


      unique.set(
        element.id,
        {
          id: element.id,

          tags:
            element.tags || {},

          latitude:
            element.center?.lat ?? null,

          longitude:
            element.center?.lon ?? null
        }
      );

    }


    return Array.from(
      unique.values()
    );


  } catch (error) {

    console.log(
      'CrossNav Overpass route error:',
      error
    );

    return [];

  }

}
