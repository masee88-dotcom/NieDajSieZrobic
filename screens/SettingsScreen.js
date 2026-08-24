import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>⚙️ Ustawienia</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>CrossNav 1.0</Text>
        <Text style={styles.text}>Nawigacja dla motocykli, motorowerów i jazdy odkrywczej.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tryby jazdy</Text>
        <Text style={styles.text}>🚗 Auto — zwykła nawigacja drogowa</Text>
        <Text style={styles.text}>🛵 Motorower — trasa dostosowana do wolniejszego pojazdu</Text>
        <Text style={styles.text}>🌲 Odkrywca — rozwijany tryb tras mniej oczywistych</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ważne</Text>
        <Text style={styles.text}>CrossNav jest rozwijany. Zawsze przestrzegaj znaków drogowych i lokalnych ograniczeń.</Text>
      </View>
      <Text style={styles.version}>CrossNav 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40, backgroundColor: '#f5f5f5', flexGrow: 1 },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 18 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '900', marginBottom: 8 },
  text: { fontSize: 15, lineHeight: 22, marginBottom: 5 },
  version: { textAlign: 'center', color: '#777', marginTop: 10 }
});
