export async function searchLocation(query) {
  if (!query || query.trim() === '') return null;

  try {
    const response = await fetch(
      'https://nominatim.openstreetmap.org/search?format=json&q=' +
      encodeURIComponent(query) +
      '&limit=1',
      {
        headers: {
          'User-Agent': 'CrossNav/1.0'
        }
      }
    );

    const data = await response.json();

    if (!data.length) return null;

    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      name: data[0].display_name
    };

  } catch (err) {
    console.log(err);
    return null;
  }
}
