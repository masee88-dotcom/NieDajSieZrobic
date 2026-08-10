export async function searchPlaces(query) {
  if (!query || query.trim().length < 3) {
    return [];
  }

  try {
    const url =
      'https://nominatim.openstreetmap.org/search' +
      '?format=jsonv2' +
      '&limit=5' +
      '&countrycodes=pl' +
      '&q=' +
      encodeURIComponent(query.trim());

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'CrossNav/0.4'
      }
    });

    if (!response.ok) {
      throw new Error('Błąd wyszukiwarki');
    }

    const data = await response.json();

    return data.map(item => ({
      id: item.place_id,
      name: item.display_name,
      latitude: Number(item.lat),
      longitude: Number(item.lon)
    }));

  } catch (error) {
    console.log('Geocoding error:', error);
    return [];
  }
}
