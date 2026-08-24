import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSavedPlaces, removeSavedPlace } from '../services/savedPlacesService';

const items = [
  ['⭐', 'Ulubione miejsca', 'Szybki dostęp do zapisanych celów'],
  ['🛣️', 'Zapisane trasy', 'Twoje przygotowane trasy'],
  ['🕘', 'Historia', 'Ostatnie przejazdy CrossNav']
];

export default function MyScreen() {
  const [selected, setSelected] = useState(null);
  const [savedPlaces, setSavedPlaces] = useState([]);

  const loadPlaces = useCallback(async () => {
    setSavedPlaces(await getSavedPlaces());
  }, []);

  useFocusEffect(useCallback(() => { loadPlaces(); }, [loadPlaces]));

  async function deletePlace(place) {
    const next = await removeSavedPlace(place.id);
    setSavedPlaces(next);
  }

  function openItem(title) {
    setSelected(title);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Moje</Text>
      <Text style={styles.subtitle}>Twoje miejsca i przejazdy</Text>

      {items.map(([icon, title, description]) => (
        <TouchableOpacity key={title} style={styles.card} onPress={() => openItem(title)}>
          <Text style={styles.icon}>{icon}</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>⭐ Zapamiętane adresy</Text>
      {!savedPlaces.length ? (
        <Text style={styles.empty}>Brak zapisanych miejsc.</Text>
      ) : savedPlaces.map(place => (
        <View key={place.id} style={styles.placeRow}>
          <View style={styles.placeText}>
            <Text style={styles.placeTitle}>{place.label}</Text>
            <Text style={styles.coords}>{place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}</Text>
          </View>
          <TouchableOpacity onPress={() => deletePlace(place)}>
            <Text style={styles.delete}>Usuń</Text>
          </TouchableOpacity>
        </View>
      ))}

      {selected && <Text style={styles.status}>Wybrano: {selected}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingBottom: 110 },
  title: { fontSize: 32, fontWeight: '900', marginTop: 18 },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4, marginBottom: 22 },
  card: { flexDirection: 'row', alignItems: 'center', width: '100%', padding: 16, borderRadius: 16, backgroundColor: '#f5f5f5', marginBottom: 12 },
  icon: { fontSize: 30, width: 46, textAlign: 'center' },
  cardText: { flex: 1, paddingHorizontal: 10 },
  cardTitle: { fontSize: 18, fontWeight: '900' },
  description: { fontSize: 13, color: '#666', marginTop: 3 },
  arrow: { fontSize: 30, color: '#777' },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginTop: 20, marginBottom: 10 },
  empty: { color: '#777', paddingVertical: 12 },
  placeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 14, padding: 13, marginBottom: 8 },
  placeText: { flex: 1 },
  placeTitle: { fontSize: 16, fontWeight: '800' },
  coords: { color: '#777', fontSize: 12, marginTop: 3 },
  delete: { color: '#c62828', fontWeight: '800', padding: 8 },
  status: { marginTop: 16, textAlign: 'center', color: '#666' }
});
