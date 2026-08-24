import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const items = [
  ['⭐', 'Ulubione miejsca', 'Szybki dostęp do zapisanych celów'],
  ['🛣️', 'Zapisane trasy', 'Twoje przygotowane trasy'],
  ['🕘', 'Historia', 'Ostatnie przejazdy CrossNav']
];

export default function MyScreen() {
  const [selected, setSelected] = useState(null);

  function openItem(title) {
    setSelected(title);
    Alert.alert('CrossNav', `${title} — moduł przygotowany do podłączenia zapisu danych.`);
  }

  return (
    <View style={styles.container}>
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

      {selected && <Text style={styles.status}>Wybrano: {selected}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: '900', marginTop: 18 },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4, marginBottom: 22 },
  card: { flexDirection: 'row', alignItems: 'center', width: '100%', padding: 16, borderRadius: 16, backgroundColor: '#f5f5f5', marginBottom: 12 },
  icon: { fontSize: 30, width: 46, textAlign: 'center' },
  cardText: { flex: 1, paddingHorizontal: 10 },
  cardTitle: { fontSize: 18, fontWeight: '900' },
  description: { fontSize: 13, color: '#666', marginTop: 3 },
  arrow: { fontSize: 30, color: '#777' },
  status: { marginTop: 16, textAlign: 'center', color: '#666' }
});
