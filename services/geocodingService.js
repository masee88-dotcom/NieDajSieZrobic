export async function searchPlace(query) {
  if (!query.trim()) return null;

  const response = await fetch(
    "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
      encodeURIComponent(query),
    {
      headers: {
        "User-Agent": "CrossNav"
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
}
