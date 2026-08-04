import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapScreen from './screens/MapScreen';
import BottomTabs from './components/BottomTabs';

function PlaceholderScreen() {
  return <View style={styles.placeholder} />;
}

export default function App() {
  const [tab, setTab] = useState('mapa');

  return (
    <View style={styles.container}>
      <View style={styles.screenArea}>
        {tab === 'mapa' && <MapScreen />}
        {tab === 'trasa' && <PlaceholderScreen />}
        {tab === 'moje' && <PlaceholderScreen />}
        {tab === 'ustawienia' && <PlaceholderScreen />}
      </View>
      <BottomTabs activeTab={tab} onChangeTab={setTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  screenArea: { flex: 1 },
  placeholder: { flex: 1, backgroundColor: '#fff' },
});
