import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@crossnav_saved_places_v1';
const MAX_PLACES = 30;

export async function getSavedPlaces() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const places = raw ? JSON.parse(raw) : [];
    return Array.isArray(places) ? places : [];
  } catch (e) {
    console.log('SAVED PLACES READ ERROR:', e);
    return [];
  }
}

export async function savePlace(place) {
  if (!place?.latitude || !place?.longitude || !place?.label) return [];
  const current = await getSavedPlaces();
  const normalized = {
    id: place.id || `${place.latitude}:${place.longitude}`,
    label: String(place.label).trim(),
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
    updatedAt: Date.now(),
  };
  const next = [normalized, ...current.filter(item => item.id !== normalized.id && item.label.toLowerCase() !== normalized.label.toLowerCase())].slice(0, MAX_PLACES);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function removeSavedPlace(id) {
  const next = (await getSavedPlaces()).filter(item => item.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function clearSavedPlaces() {
  await AsyncStorage.removeItem(KEY);
  return [];
}
