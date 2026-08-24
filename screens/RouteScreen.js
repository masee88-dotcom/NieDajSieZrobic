import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RouteScreen({ onPlanRoute }) {
  const [destination, setDestination] = useState('');

  function plan() {
    const value = destination.trim();
    if (!value || !onPlanRoute) return;
    onPlanRoute(value);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🧭</Text>
      <Text style={styles.title}>Planowanie trasy</Text>
      <Text style={styles.text}>Wpisz cel, a CrossNav przygotuje trasę na ekranie mapy.</Text>

      <TextInput
        value={destination}
        onChangeText={setDestination}
        placeholder="Dokąd jedziemy?"
        style={styles.input}
        returnKeyType="search"
        onSubmitEditing={plan}
      />

      <TouchableOpacity
        style={[styles.button, !destination.trim() && styles.buttonDisabled]}
        onPress={plan}
        disabled={!destination.trim()}
      >
        <Text style={styles.buttonText}>▶ WYZNACZ TRASĘ</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>CrossNav wykorzysta wybrany tryb jazdy z ekranu Mapy.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  icon: { fontSize: 48, marginTop: 30, marginBottom: 8 },
  title: { fontSize: 27, fontWeight: '900', marginBottom: 8 },
  text: { textAlign: 'center', fontSize: 16, lineHeight: 23, color: '#444', marginBottom: 22 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 17, backgroundColor: '#fafafa' },
  button: { width: '100%', marginTop: 12, backgroundColor: '#111', borderRadius: 14, padding: 15, alignItems: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  hint: { textAlign: 'center', fontSize: 14, marginTop: 18, color: '#777' }
});
