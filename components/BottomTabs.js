import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function BottomTabs({ activeTab, onChangeTab }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => onChangeTab('mapa')}>
        <Text style={[styles.text, activeTab === 'mapa' && styles.active]}>🗺️ Mapa</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => onChangeTab('trasa')}>
        <Text style={[styles.text, activeTab === 'trasa' && styles.active]}>🛣️ Trasa</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => onChangeTab('moje')}>
        <Text style={[styles.text, activeTab === 'moje' && styles.active]}>⭐ Moje</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => onChangeTab('ustawienia')}>
        <Text style={[styles.text, activeTab === 'ustawienia' && styles.active]}>⚙️ Ustaw.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: '#666',
  },
  active: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});
