import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function RouteScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🧭</Text>
      <Text style={styles.title}>Trasa</Text>
      <Text style={styles.text}>Wyznaczanie i prowadzenie po trasie odbywa się z poziomu mapy.</Text>
      <Text style={styles.hint}>Wybierz Mapa → wpisz cel → wybierz tryb → JEDŹ.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#fff' },
  icon: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 10 },
  text: { textAlign: 'center', fontSize: 16, lineHeight: 23, color: '#444' },
  hint: { textAlign: 'center', fontSize: 14, marginTop: 16, color: '#777' }
});
