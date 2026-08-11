const OVERPASS_URL =
  'https://overpass-api.de/api/interpreter';


function buildQuery(
  south,
  west,
  north,
  east
) {

  return `
[out:json][timeout:25];

(
  way["highway"]
    (${south},${west},${north},${east});
);

out tags center;
`;
}


export async function getRoadsAround(
  latitude,
  longitude,
  radius = 1000
) {

  try {

    // Przybliżone przesunięcie stopni
    // dla małego obszaru wokół użytkownika.

    const latDelta =
      radius / 111000;

    const lonDelta =
      radius /
      (111000 *
        Math.cos(
          latitude * Math.PI / 180
        )
      );

    const south =
      latitude - latDelta;

    const north =
      latitude + latDelta;

    const west =
      longitude - lonDelta;

    const east =
      longitude + lonDelta;


    const query =
      buildQuery(
        south,
        west,
        north,
        east
      );


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


    return json.elements
      .map(element => ({

        id: element.id,

        type: element.type,

        tags: element.tags || {},

        latitude:
          element.center?.lat ?? null,

        longitude:
          element.center?.lon ?? null

      }))
      .filter(
        road =>
          road.tags &&
          road.tags.highway
      );


  } catch (error) {

    console.log(
      'CrossNav Overpass error:',
      error
    );

    return [];

  }

}
