import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { getSavedPlaces, savePlace } from '../services/savedPlacesService';
import { geocodeDestination } from '../services/geocodingService';

export default function RouteScreen({ onPlanRoute }) {
  const [destination, setDestination] = useState('');
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [working, setWorking] = useState(false);

  useEffect(() => { getSavedPlaces().then(setSavedPlaces); }, []);

  async function resolveDestination(value) {
    const text = String(value || '').trim();
    if (!text) return null;
    const result = await geocodeDestination(text);
    if (!result) { Alert.alert('CrossNav', 'Nie znaleziono tego adresu.'); return null; }
    return { id: `${result.latitude}:${result.longitude}`, label: result.name || text, latitude: result.latitude, longitude: result.longitude };
  }

  async function plan(value = destination) {
    if (working) return;
    setWorking(true);
    try {
      const place = await resolveDestination(value);
      if (place && onPlanRoute) onPlanRoute(place);
    } catch (e) {
      console.log('ROUTE PLAN ERROR:', e);
      Alert.alert('CrossNav', 'Nie udało się znaleźć adresu.');
    } finally { setWorking(false); }
  }

  async function saveCurrentDestination() {
    if (working) return;
    setWorking(true);
    try {
      const place = await resolveDestination(destination);
      if (!place) return;
      const result = await savePlace(place);
      setSavedPlaces(result);
      setDestination(place.label);
    } catch (e) {
      console.log('SAVE PLACE ERROR:', e);
      Alert.alert('CrossNav', 'Nie udało się zapisać adresu.');
    } finally { setWorking(false); }
  }

  function planSaved(place) {
    if (onPlanRoute) onPlanRoute(place);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.icon}>🧭</Text>
      <Text style={styles.title}>Planowanie trasy</Text>
      <Text style={styles.text}>Wpisz cel, a CrossNav znajdzie dokładny adres i przygotuje trasę.</Text>
      <TextInput value={destination} onChangeText={setDestination} placeholder="Dokąd jedziemy?" style={styles.input} returnKeyType="search" onSubmitEditing={() => plan()} />
      <TouchableOpacity style={[styles.button, (!destination.trim() || working) && styles.buttonDisabled]} onPress={() => plan()} disabled={!destination.trim() || working}>
        <Text style={styles.buttonText}>{working ? '⏳ SZUKAM...' : '▶ WYZNACZ TRASĘ'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.saveButton, (!destination.trim() || working) && styles.buttonDisabled]} onPress={saveCurrentDestination} disabled={!destination.trim() || working}>
        <Text style={styles.saveText}>⭐ ZAPISZ DOKŁADNY ADRES</Text>
      </TouchableOpacity>
      {savedPlaces.length > 0 && <Text style={styles.sectionTitle}>⭐ Zapamiętane adresy</Text>}
      {savedPlaces.map(place => (
        <TouchableOpacity key={place.id} style={styles.savedRow} onPress={() => planSaved(place)}>
          <Text style={styles.savedIcon}>📍</Text>
          <View style={styles.savedTextWrap}><Text style={styles.savedLabel}>{place.label}</Text><Text style={styles.coords}>{place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}</Text></View>
          <Text style={styles.arrow}>▶</Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.hint}>Adres jest zapisywany razem z prawdziwymi współrzędnymi.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { alignItems: 'center', padding: 24, paddingBottom: 120 },
  icon: { fontSize: 48, marginTop: 30, marginBottom: 8 },
  title: { fontSize: 27, fontWeight: '900', marginBottom: 8 },
  text: { textAlign: 'center', fontSize: 16, lineHeight: 23, color: '#444', marginBottom: 22 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 17, backgroundColor: '#fafafa' },
  button: { width: '100%', marginTop: 12, backgroundColor: '#111', borderRadius: 14, padding: 15, alignItems: 'center' },
  saveButton: { width: '100%', marginTop: 8, backgroundColor: '#eee', borderRadius: 14, padding: 14, alignItems: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  saveText: { color: '#111', fontSize: 15, fontWeight: '900' },
  sectionTitle: { width: '100%', fontSize: 19, fontWeight: '900', marginTop: 24, marginBottom: 8 },
  savedRow: { width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 14, padding: 13, marginBottom: 8 },
  savedIcon: { fontSize: 22, marginRight: 10 },
  savedTextWrap: { flex: 1 },
  savedLabel: { fontSize: 15, fontWeight: '700' },
  coords: { color: '#777', fontSize: 11, marginTop: 3 },
  arrow: { fontSize: 18, color: '#777' },
  hint: { textAlign: 'center', fontSize: 14, marginTop: 18, color: '#777' }
});
