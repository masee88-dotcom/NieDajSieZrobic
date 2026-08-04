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

import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { getMapHtml } from '../utils/mapHtml';

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('Brak zgody na lokalizację');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});
      setLocation(pos.coords);
    })();
  }, []);

  if (error) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text>Pobieranie GPS...</Text>
      </View>
    );
  }

  return (
    <WebView
      originWhitelist={['*']}
      source={{
        html: getMapHtml(
          location.latitude,
          location.longitude
        )
      }}
      style={{ flex: 1 }}
    />
  );
}      <Text style={{ marginTop: 15 }}>
        MapScreen działa ✅
      </Text>
    </View>
  );
}
