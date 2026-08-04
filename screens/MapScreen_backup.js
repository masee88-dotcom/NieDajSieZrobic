import React from 'react';
import { View, Text } from 'react-native';

export default function MapScreen() {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f2f2f2'
    }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        CrossNav
      </Text>

      <Text style={{ marginTop: 15 }}>
        MapScreen działa ✅
      </Text>
    </View>
  );
}
