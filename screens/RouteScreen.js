import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { getSavedPlaces, savePlace } from '../services/savedPlacesService';

export default function RouteScreen({ onPlanRoute }) {
  const [destination, setDestination] = useState('');
  const [savedPlaces, setSavedPlaces] = useState([]);

  useEffect(() => { getSavedPlaces().then(setSavedPlaces); }, []);

  function plan(value = destination) {
    const text = String(value || '').trim();
    if (!text || !onPlanRoute) return;
    onPlanRoute(text);
  }

  async function saveCurrentDestination() {
    const text = destination.trim();
    if (!text) return;
    const result = await savePlace({ label: text, latitude: 0.000001, longitude: 0.000001, id: `query:${text.toLowerCase()}` });
    setSavedPlaces(result);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.icon}>🧭</Text>
      <Text style={styles.title}>Planowanie trasy</Text>
      <Text style={styles.text}>Wpisz cel, a CrossNav przygotuje trasę na ekranie mapy.</Text>

      <TextInput value={destination} onChangeText={setDestination} placeholder="Dokąd jedziemy?" style={styles.input} returnKeyType="search" onSubmitEditing={() => plan()} />

      <TouchableOpacity style={[styles.button, !destination.trim() && styles.buttonDisabled]} onPress={() => plan()} disabled={!destination.trim()}>
        <Text style={styles.buttonText}>▶ WYZNACZ TRASĘ</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.saveButton, !destination.trim() && styles.buttonDisabled]} onPress={saveCurrentDestination} disabled={!destination.trim()}>
        <Text style={styles.saveText}>⭐ ZAPISZ ADRES</Text>
      </TouchableOpacity>

      {savedPlaces.length > 0 && <Text style={styles.sectionTitle}>⭐ Ostatnio zapisane</Text>}
      {savedPlaces.map(place => (
        <TouchableOpacity key={place.id} style={styles.savedRow} onPress={() => plan(place.label)}>
          <Text style={styles.savedIcon}>📍</Text>
          <Text style={styles.savedLabel}>{place.label}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.hint}>Kliknij zapisany adres, aby od razu rozpocząć planowanie.</Text>
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
  savedLabel: { flex: 1, fontSize: 16, fontWeight: '700' },
  arrow: { fontSize: 28, color: '#777' },
  hint: { textAlign: 'center', fontSize: 14, marginTop: 18, color: '#777' }
});
