import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function MyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⭐</Text>
      <Text style={styles.title}>Moje</Text>
      <Text style={styles.text}>Tutaj będą ulubione miejsca, zapisane trasy i historia przejazdów.</Text>
      <Text style={styles.hint}>Funkcje społecznościowe i zapis tras dołączymy po stabilizacji wersji 1.0.</Text>
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
