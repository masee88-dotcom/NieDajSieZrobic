import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';

import MapScreen from './screens/MapScreen';
import RouteScreen from './screens/RouteScreen';
import MyScreen from './screens/MyScreen';
import SettingsScreen from './screens/SettingsScreen';
import BottomTabs from './components/BottomTabs';
import { CROSSNAV_BACKGROUND_LOCATION_TASK, startBackgroundLocation, stopBackgroundLocation } from './services/navigation/backgroundLocationTask';

export default function App() {
  const [tab, setTab] = useState('mapa');
  const [plannedDestination, setPlannedDestination] = useState(null);

  useEffect(() => {
    return () => {
      stopBackgroundLocation().catch(() => {});
    };
  }, []);

  async function planRoute(destination) {
    setPlannedDestination(destination);
    setTab('mapa');
    try {
      const foreground = await Location.getForegroundPermissionsAsync();
      if (foreground.status === 'granted') await startBackgroundLocation();
    } catch (e) {
      console.log('BACKGROUND LOCATION START ERROR:', e);
    }
  }

  function clearPlannedDestination() {
    setPlannedDestination(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.screen}>
        {tab === 'mapa' && (
          <MapScreen
            plannedDestination={plannedDestination}
            onPlannedDestinationHandled={clearPlannedDestination}
          />
        )}
        {tab === 'trasa' && <RouteScreen onPlanRoute={planRoute} />}
        {tab === 'moje' && <MyScreen />}
        {tab === 'ustawienia' && <SettingsScreen />}
      </View>
      <BottomTabs activeTab={tab} onChangeTab={setTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 45, backgroundColor: '#fff' },
  screen: { flex: 1 }
});
