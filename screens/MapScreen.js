import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { getMapHtml } from '../utils/mapHtml';
import { getRoute } from '../services/routeService';
import { geocodeDestination } from '../services/geocodingService';
import { getNextNavigationStep, getInstructionDistance } from '../services/navigation/navigationEngine';
import RouteModeButton from '../components/RouteModeButton';
import SearchBar from '../components/SearchBar';

export default function MapScreen() {
  const webViewRef = useRef(null);
  const spokenRef = useRef({});
  const lastRerouteRef = useRef(0);
  const reroutingRef = useRef(false);
  const [location, setLocation] = useState(null);
  const [mapHtml, setMapHtml] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('auto');
  const [searching, setSearching] = useState(false);
  const [route, setRoute] = useState(null);
  const [navigating, setNavigating] = useState(false);
  const [rerouting, setRerouting] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepDistance, setStepDistance] = useState(null);
  const [destinationDistance, setDestinationDistance] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [heading, setHeading] = useState(null);

  useEffect(() => {
    let watcher = null;
    let mounted = true;
    async function startGPS() {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          if (mounted) setError('Brak zgody na lokalizację');
          return;
        }
        const first = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        if (!mounted) return;
        setLocation(first.coords);
        updateMotion(first.coords);
        setMapHtml(getMapHtml(first.coords.latitude, first.coords.longitude, null));
        watcher = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 2, timeInterval: 1000 },
          position => {
            if (!mounted) return;
            setLocation(position.coords);
            updateMotion(position.coords);
          }
        );
      } catch (e) {
        console.log('GPS ERROR:', e);
        if (mounted) setError('Błąd GPS');
      }
    }
    startGPS();
    return () => { mounted = false; watcher?.remove(); };
  }, []);

  // Tylko zmiana trasy przebudowuje HTML. Ruch GPS nie przeładowuje mapy.
  useEffect(() => {
    if (!location || !route) return;
    setMapHtml(getMapHtml(location.latitude, location.longitude, route));
  }, [route]);

  function updateMotion(coords) {
    if (typeof coords.speed === 'number' && coords.speed >= 0) setCurrentSpeed(coords.speed);
    if (typeof coords.heading === 'number' && coords.heading >= 0) setHeading(coords.heading);
  }

  useEffect(() => {
    if (!location || !webViewRef.current) return;
    const gpsData = JSON.stringify({ type: 'GPS', latitude: location.latitude, longitude: location.longitude, speed: currentSpeed, heading });
    webViewRef.current.injectJavaScript(`if (typeof window.updateCrossNavGPS === 'function') { window.updateCrossNavGPS(${JSON.stringify(gpsData)}); } true;`);
  }, [location, currentSpeed, heading]);

  useEffect(() => {
    if (!location || !route || !navigating) return;
    if (route.destination) {
      const distanceKm = calculateDistance(location.latitude, location.longitude, route.destination.latitude, route.destination.longitude);
      setDestinationDistance(distanceKm);
      if (distanceKm < 0.03) { finishNavigation(); return; }
    }
    if (route.geometry?.length && getDistanceFromRoute(location, route.geometry) > 100) {
      recalculateRoute();
      return;
    }
    const result = getNextNavigationStep(location, route.steps || [], stepIndex);
    if (!result.step) return;
    if (result.index !== stepIndex) setStepIndex(result.index);
    if (result.arrived) { finishNavigation(); return; }
    setCurrentStep(result.step);
    setStepDistance(result.distance);
    speakNavigationInstruction(result.index, result.step, result.distance);
  }, [location, route, navigating, stepIndex]);

  function changeMode(newMode) {
    Speech.stop();
    setMode(newMode);
    setRoute(null);
    setNavigating(false);
    setCurrentStep(null);
    setStepIndex(0);
    setStepDistance(null);
    setDestinationDistance(null);
    spokenRef.current = {};
  }

  async function recalculateRoute() {
    if (!location || !route?.destination || reroutingRef.current) return;
    const now = Date.now();
    if (now - lastRerouteRef.current < 10000) return;
    lastRerouteRef.current = now;
    reroutingRef.current = true;
    setRerouting(true);
    try {
      const destination = route.destination;
      const result = await getRoute(location.latitude, location.longitude, destination.latitude, destination.longitude, { mode, heading });
      if (!result) return;
      setRoute({ ...result, destination });
      setStepIndex(0);
      setCurrentStep(result.steps?.[0] || null);
      spokenRef.current = {};
      setNavigating(true);
      Speech.stop();
      Speech.speak('Przeliczam trasę', { language: 'pl-PL', rate: 0.95 });
    } catch (e) {
      console.log('REROUTE ERROR:', e);
    } finally {
      reroutingRef.current = false;
      setRerouting(false);
    }
  }

  async function searchDestination(query) {
    if (!location || !query?.trim()) return;
    setSearching(true);
    try {
      const destination = await geocodeDestination(query.trim());
      if (!destination) { Alert.alert('CrossNav', 'Nie znaleziono celu.'); return; }
      const result = await getRoute(location.latitude, location.longitude, destination.latitude, destination.longitude, { mode, heading });
      if (!result) { Alert.alert('CrossNav', 'Nie znaleziono trasy dla wybranego trybu.'); return; }
      setRoute({ ...result, destination });
      setStepIndex(0);
      setCurrentStep(result.steps?.[0] || null);
      setNavigating(false);
      setDestinationDistance(calculateDistance(location.latitude, location.longitude, destination.latitude, destination.longitude));
      spokenRef.current = {};
    } catch (e) {
      console.log('SEARCH ERROR:', e);
      Alert.alert('CrossNav', 'Błąd wyszukiwania.');
    } finally { setSearching(false); }
  }

  function startNavigation() {
    if (!route) return;
    Speech.stop();
    setStepIndex(0);
    setCurrentStep(route.steps?.[0] || null);
    setNavigating(true);
    spokenRef.current = {};
    Speech.speak('Rozpoczynam nawigację', { language: 'pl-PL', rate: 0.95 });
  }

  function finishNavigation() {
    Speech.stop();
    setNavigating(false);
    setCurrentStep(null);
    setStepDistance(null);
    setDestinationDistance(null);
    spokenRef.current = {};
    Alert.alert('CrossNav', '🏁 Dotarłeś do celu!');
  }

  function stopNavigation() {
    Speech.stop();
    setNavigating(false);
    setCurrentStep(null);
    setStepDistance(null);
    setDestinationDistance(null);
    spokenRef.current = {};
  }

  function speakNavigationInstruction(index, step, distanceMeters) {
    if (!step?.instruction || !Number.isFinite(distanceMeters)) return;
    let level = null;
    if (distanceMeters <= 45) level = 'NOW';
    else if (distanceMeters <= 200) level = '200';
    else if (distanceMeters <= 500) level = '500';
    else if (distanceMeters <= 1000) level = '1000';
    if (!level) return;
    const key = `${index}_${level}`;
    if (spokenRef.current[key]) return;
    spokenRef.current[key] = true;
    const text = level === 'NOW' ? step.instruction : `Za ${getInstructionDistance(distanceMeters)} ${step.instruction.toLowerCase()}`;
    Speech.speak(text, { language: 'pl-PL', rate: 0.95, pitch: 1.0 });
  }

  if (error) return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;
  if (!location || !mapHtml) return <View style={styles.center}><Text style={styles.loading}>📡 Pobieranie GPS...</Text></View>;

  return (
    <View style={styles.container}>
      <WebView ref={webViewRef} originWhitelist={['*']} source={{ html: mapHtml }} style={StyleSheet.absoluteFill} javaScriptEnabled domStorageEnabled onError={event => console.log('WEBVIEW ERROR:', event.nativeEvent)} />
      <RouteModeButton mode={mode} onChange={changeMode} />
      <SearchBar onSearch={searchDestination} searching={searching} />

      {!navigating && route && (
        <View style={styles.readyPanel}>
          <Text style={styles.readyTitle}>🏁 TRASA GOTOWA</Text>
          <Text style={styles.modeText}>{getModeName(mode)}</Text>
          <Text style={styles.readyInfo}>{formatDistance(route.distance / 1000)} • {Math.max(1, Math.round(route.duration / 60))} min</Text>
          <TouchableOpacity style={styles.startButton} onPress={startNavigation}><Text style={styles.startButtonText}>▶ JEDŹ</Text></TouchableOpacity>
        </View>
      )}

      {navigating && route && (
        <View style={styles.navigationPanel}>
          <View style={styles.navigationHeader}><Text style={styles.navigationTitle}>🧭 NAWIGACJA</Text><Text style={styles.speed}>{Math.round(currentSpeed * 3.6)} km/h</Text></View>
          {currentStep && (
            <View style={styles.maneuver}>
              <Text style={styles.maneuverIcon}>{getManeuverIcon(currentStep)}</Text>
              <View style={styles.maneuverText}><Text style={styles.instruction}>{currentStep.instruction}</Text>{stepDistance !== null && <Text style={styles.stepDistance}>{formatDistance(stepDistance / 1000)}</Text>}</View>
            </View>
          )}
          <View style={styles.routeInfo}>
            <View><Text style={styles.smallLabel}>DO CELU</Text><Text style={styles.bigInfo}>{destinationDistance !== null ? formatDistance(destinationDistance) : '...'}</Text></View>
            <View><Text style={styles.smallLabel}>CZAS</Text><Text style={styles.bigInfo}>{Math.max(1, Math.round(route.duration / 60))} min</Text></View>
          </View>
          {rerouting && <Text style={styles.rerouting}>🔄 Przeliczam trasę...</Text>}
          <TouchableOpacity style={styles.stopButton} onPress={stopNavigation}><Text style={styles.stopButtonText}>ZAKOŃCZ NAWIGACJĘ</Text></TouchableOpacity>
          <Text style={styles.gps}>📡 GPS aktywny</Text>
        </View>
      )}
    </View>
  );
}

function getModeName(mode) {
  if (mode === 'moped') return '🛵 MOTOROWER';
  if (mode === 'explorer') return '🌲 ODKRYWCA';
  return '🚗 AUTO';
}

function getManeuverIcon(step) {
  if (!step) return '⬆️';
  if (step.type === 'arrive') return '🏁';
  if (step.type === 'roundabout' || step.type === 'rotary') return '🔄';
  if (step.type === 'uturn') return '↩️';
  if ((step.modifier || '').includes('left')) return '⬅️';
  if ((step.modifier || '').includes('right')) return '➡️';
  return '⬆️';
}

function getDistanceFromRoute(location, geometry) {
  if (!geometry?.length) return 0;
  let closest = Infinity;
  for (let i = 0; i < geometry.length; i += 1) {
    const point = geometry[i];
    if (!point || point.length < 2) continue;
    closest = Math.min(closest, calculateDistance(location.latitude, location.longitude, point[1], point[0]) * 1000);
    if (i > 0 && geometry[i - 1]?.length >= 2) closest = Math.min(closest, distanceToSegmentMeters(location, geometry[i - 1], point));
  }
  return closest === Infinity ? 0 : closest;
}

function distanceToSegmentMeters(location, a, b) {
  const meanLat = ((a[1] + b[1]) / 2) * Math.PI / 180;
  const sx = 111320 * Math.cos(meanLat);
  const sy = 110540;
  const px = location.longitude * sx;
  const py = location.latitude * sy;
  const ax = a[0] * sx;
  const ay = a[1] * sy;
  const bx = b[0] * sx;
  const by = b[1] * sy;
  const dx = bx - ax;
  const dy = by - ay;
  const len = dx * dx + dy * dy;
  if (!len) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(degrees) { return degrees * Math.PI / 180; }
function formatDistance(km) { if (!Number.isFinite(km)) return '...'; if (km < 1) return `${Math.max(0, Math.round(km * 1000))} m`; return `${km.toFixed(1)} km`; }

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loading: { fontSize: 18, fontWeight: '700' },
  error: { fontSize: 18, color: '#cc0000' },
  navigationPanel: { position: 'absolute', bottom: 15, left: 10, right: 10, backgroundColor: '#fff', borderRadius: 20, padding: 15, elevation: 10, shadowOpacity: 0.2, shadowRadius: 8 },
  navigationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  navigationTitle: { fontSize: 18, fontWeight: '900' },
  speed: { fontSize: 17, fontWeight: '800' },
  maneuver: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', borderRadius: 16, padding: 12 },
  maneuverIcon: { fontSize: 42, width: 55, textAlign: 'center' },
  maneuverText: { flex: 1, paddingLeft: 8 },
  instruction: { fontSize: 20, fontWeight: '900' },
  stepDistance: { fontSize: 22, fontWeight: '900', marginTop: 4 },
  routeInfo: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#ddd' },
  smallLabel: { fontSize: 11, fontWeight: '700', color: '#666' },
  bigInfo: { fontSize: 19, fontWeight: '900' },
  rerouting: { marginTop: 8, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  stopButton: { marginTop: 12, backgroundColor: '#222', borderRadius: 12, padding: 12, alignItems: 'center' },
  stopButtonText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  gps: { marginTop: 8, textAlign: 'center', fontSize: 13, fontWeight: '700' },
  readyPanel: { position: 'absolute', bottom: 15, left: 10, right: 10, backgroundColor: '#fff', borderRadius: 20, padding: 15, elevation: 10, alignItems: 'center' },
  readyTitle: { fontSize: 20, fontWeight: '900' },
  modeText: { fontSize: 15, fontWeight: '800', marginTop: 4 },
  readyInfo: { fontSize: 17, marginTop: 5 },
  startButton: { marginTop: 12, width: '100%', backgroundColor: '#111', borderRadius: 14, padding: 15, alignItems: 'center' },
  startButtonText: { color: '#fff', fontSize: 20, fontWeight: '900' }
});
