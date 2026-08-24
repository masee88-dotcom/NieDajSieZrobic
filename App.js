import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import MapScreen from './screens/MapScreen';
import RouteScreen from './screens/RouteScreen';
import MyScreen from './screens/MyScreen';
import SettingsScreen from './screens/SettingsScreen';
import BottomTabs from './components/BottomTabs';

export default function App() {
  const [tab, setTab] = useState('mapa');
  const [plannedDestination, setPlannedDestination] = useState(null);

  function planRoute(destination) {
    setPlannedDestination(destination);
    setTab('mapa');
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
