const NOMINATIM_URL =
  'https://nominatim.openstreetmap.org/search';

export async function geocodeDestination(query) {

  try {

    const cleanQuery =
      query.trim();

    if (!cleanQuery) {
      return null;
    }

    const url =
      `${NOMINATIM_URL}` +
      `?format=json` +
      `&q=${encodeURIComponent(cleanQuery)}` +
      `&limit=5` +
      `&addressdetails=1` +
      `&accept-language=pl`;

    console.log(
      'CrossNav szuka:',
      cleanQuery
    );

    const response =
      await fetch(url, {
        headers: {
          Accept:
            'application/json',
          'User-Agent':
            'CrossNav/0.1'
        }
      });

    if (!response.ok) {

      console.log(
        'Nominatim HTTP:',
        response.status
      );

      return null;
    }

    const data =
      await response.json();

    console.log(
      'Nominatim wyniki:',
      data.length
    );

    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {
      return null;
    }

    const result = data[0];

    return {
      latitude:
        Number(result.lat),

      longitude:
        Number(result.lon),

      name:
        result.display_name,

      type:
        result.type || '',

      address:
        result.address || {}
    };

  } catch (error) {

    console.log(
      'CrossNav geocoding error:',
      error
    );

    return null;
  }
}
