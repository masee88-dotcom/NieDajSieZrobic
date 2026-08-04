import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const reports = [
  '🚓 Patrol',
  '🚧 Wypadek',
  '🌳 Drzewo',
  '🪨 Kamienie',
  '🚜 Traktor',
  '🌊 Zalana droga',
  '⛽ Stacja paliw',
  '☕ Miejsce odpoczynku'
];

export default function ReportMenu({ onSelect }) {
  return (
    <View style={styles.container}>
      {reports.map(item => (
        <TouchableOpacity
          key={item}
          style={styles.item}
          onPress={() => onSelect(item)}
        >
          <Text style={styles.text}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  text: {
    fontSize: 17
  }
});

