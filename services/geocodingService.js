const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const PHOTON_URL = 'https://photon.komoot.io/api/';

function normalizeResult(item) {
  if (!item) return null;
  const latitude = Number(item.lat ?? item.latitude);
  const longitude = Number(item.lon ?? item.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    latitude,
    longitude,
    name: item.display_name || item.name || item.properties?.name || 'Wybrany cel',
    type: item.type || item.properties?.type || '',
    address: item.address || item.properties || {},
  };
}

async function nominatim(query) {
  const url = `${NOMINATIM_URL}?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=pl&accept-language=pl`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Nominatim HTTP ${response.status}`);
  const data = await response.json();
  return Array.isArray(data) ? data.map(normalizeResult).filter(Boolean) : [];
}

async function photon(query) {
  const url = `${PHOTON_URL}?q=${encodeURIComponent(query)}&limit=5&lang=pl`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Photon HTTP ${response.status}`);
  const data = await response.json();
  const features = Array.isArray(data?.features) ? data.features : [];
  return features.map((feature) => {
    const coordinates = feature.geometry?.coordinates || [];
    return normalizeResult({
      latitude: coordinates[1],
      longitude: coordinates[0],
      name: feature.properties?.name || feature.properties?.street || feature.properties?.city,
      type: feature.properties?.type,
      properties: feature.properties,
    });
  }).filter(Boolean);
}

export async function geocodeDestination(query) {
  const cleanQuery = String(query || '').trim();
  if (!cleanQuery) return null;

  console.log('CrossNav szuka:', cleanQuery);

  try {
    const results = await nominatim(cleanQuery);
    console.log('Nominatim wyniki:', results.length);
    if (results.length) return results[0];
  } catch (error) {
    console.log('Nominatim error:', error?.message || error);
  }

  try {
    const results = await photon(cleanQuery);
    console.log('Photon wyniki:', results.length);
    if (results.length) return results[0];
  } catch (error) {
    console.log('Photon error:', error?.message || error);
  }

  return null;
}
