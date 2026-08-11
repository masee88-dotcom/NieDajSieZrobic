import React, {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';

import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

import SearchBar from '../components/SearchBar';
import RouteProfileMenu from '../components/RouteProfileMenu';
import ExplorerMenu from '../components/ExplorerMenu';

import { searchPlaces } from '../services/geocodingService';
import { getRoute } from '../services/routeService';

import { getMapHtml } from '../utils/mapHtml';

import {
  ROUTE_PROFILES,
  DEFAULT_ROUTE_PROFILE
} from '../utils/routeProfiles';

import {
  DEFAULT_EXPLORER_MODE,
  EXPLORER_MODES
} from '../utils/explorerMode';


export default function MapScreen() {

  const webViewRef = useRef(null);

  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);

  const [route, setRoute] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  const [loadingRoute, setLoadingRoute] = useState(false);

  const [followUser, setFollowUser] = useState(true);

  const [profile, setProfile] =
    useState(DEFAULT_ROUTE_PROFILE);

  const [showProfiles, setShowProfiles] =
    useState(false);

  const [explorerMode, setExplorerMode] =
    useState(DEFAULT_EXPLORER_MODE);

  const [showExplorer, setShowExplorer] =
    useState(false);

  const [routeMessage, setRouteMessage] =
    useState('');


  // ==============================
  // GPS
  // ==============================

  useEffect(() => {

    let subscription;

    async function startGPS() {

      try {

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {

          setError(
            'Brak zgody na lokalizację'
          );

          return;
        }

        const position =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High
          });

        setLocation(position.coords);

        subscription =
          await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 3000,
              distanceInterval: 5
            },

            newPosition => {

              const coords =
                newPosition.coords;

              setLocation(coords);

              if (webViewRef.current) {

                webViewRef.current.injectJavaScript(`
                  if(window.updateUserLocation){
                    window.updateUserLocation(
                      ${coords.latitude},
                      ${coords.longitude},
                      ${followUser}
                    );
                  }
                  true;
                `);

              }

            }
          );

      } catch (e) {

        console.log(e);

        setError(
          'Nie udało się uruchomić GPS'
        );

      }

    }

    startGPS();

    return () => {

      if (subscription) {
        subscription.remove();
      }

    };

  }, [followUser]);


  // ==============================
  // WYSZUKIWANIE
  // ==============================

  async function handleSearch(text) {

    setRouteMessage('');

    if (!text ||
        text.trim().length < 3) {

      setResults([]);

      return;
    }

    const places =
      await searchPlaces(text);

    setResults(places);
  }


  // ==============================
  // TRASA
  // ==============================

  async function handleSelect(place) {

    setResults([]);

    setRouteMessage('');
    setRouteInfo(null);
    setRoute([]);

    if (!location) {
      return;
    }

    setLoadingRoute(true);

    try {

      const selectedProfile =
        ROUTE_PROFILES[profile];

      const selectedExplorer =
        EXPLORER_MODES[explorerMode];


      console.log(
        'CrossNav profil:',
        selectedProfile.name
      );

      console.log(
        'CrossNav tryb:',
        selectedExplorer.name
      );


      const result =
        await getRoute(
          location.latitude,
          location.longitude,
          place.latitude,
          place.longitude,
          {
            ...selectedProfile,
            explorerMode
          }
        );


      if (!result) {

        setRouteMessage(
          'Nie udało się znaleźć trasy do tego celu.'
        );

        return;
      }

      setRoute(result.geometry);

      setRouteInfo({
        distance: result.distance,
        duration: result.duration
      });

      setFollowUser(true);

    } catch (e) {

      console.log(e);

      setRouteMessage(
        'Wystąpił błąd podczas wyznaczania trasy.'
      );

    } finally {

      setLoadingRoute(false);
    }

  }


  // ==============================
  // LOKALIZACJA
  // ==============================

  function centerOnUser() {

    if (!location ||
        !webViewRef.current) {

      return;
    }

    setFollowUser(true);

    webViewRef.current.injectJavaScript(`
      if(window.updateUserLocation){
        window.updateUserLocation(
          ${location.latitude},
          ${location.longitude},
          true
        );
      }
      true;
    `);
  }


  if (error) {

    return (
      <View style={styles.center}>

        <Text style={styles.error}>
          {error}
        </Text>

      </View>
    );
  }


  if (!location) {

    return (
      <View style={styles.center}>

        <ActivityIndicator size="large" />

        <Text style={styles.loading}>
          Pobieranie GPS...
        </Text>

      </View>
    );
  }


  const activeProfile =
    ROUTE_PROFILES[profile];

  const activeExplorer =
    EXPLORER_MODES[explorerMode];


  const distanceKm =
    routeInfo
      ? (routeInfo.distance / 1000).toFixed(1)
      : null;


  const durationMin =
    routeInfo
      ? Math.round(routeInfo.duration / 60)
      : null;


  return (

    <View style={styles.container}>

      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{
          html: getMapHtml(
            location.latitude,
            location.longitude,
            route
          )
        }}
        style={styles.map}
      />


      {/* WYSZUKIWANIE */}

      <SearchBar
        results={results}
        onSearch={handleSearch}
        onSelect={handleSelect}
      />


      {/* PROFIL POJAZDU */}

      <TouchableOpacity
        style={styles.profileButton}
        onPress={() =>
          setShowProfiles(true)
        }
      >

        <Text style={styles.profileIcon}>
          {activeProfile.icon}
        </Text>

        <Text style={styles.profileText}>
          {activeProfile.name}
        </Text>

      </TouchableOpacity>


      {/* ODKRYWCA */}

      <TouchableOpacity
        style={[
          styles.explorerButton,
          explorerMode !== 'normal' &&
            styles.explorerActive
        ]}
        onPress={() =>
          setShowExplorer(true)
        }
      >

        <Text style={styles.explorerIcon}>
          {activeExplorer.icon}
        </Text>

        <Text style={styles.explorerText}>
          {activeExplorer.name}
        </Text>

      </TouchableOpacity>


      {/* MOJA LOKALIZACJA */}

      <TouchableOpacity
        style={styles.locationButton}
        onPress={centerOnUser}
      >

        <Text style={styles.locationIcon}>
          📍
        </Text>

      </TouchableOpacity>


      {/* FOLLOW GPS */}

      <TouchableOpacity
        style={[
          styles.followButton,
          followUser
            ? styles.followActive
            : styles.followInactive
        ]}
        onPress={() =>
          setFollowUser(!followUser)
        }
      >

        <Text style={styles.followText}>

          {followUser
            ? '🧭 GPS'
            : '⏸️ GPS'}

        </Text>

      </TouchableOpacity>


      {/* WYZNACZANIE */}

      {loadingRoute && (

        <View style={styles.routeLoading}>

          <ActivityIndicator color="#fff" />

          <Text style={styles.routeLoadingText}>
            Wyznaczanie trasy...
          </Text>

        </View>

      )}


      {/* KOMUNIKAT */}

      {routeMessage &&
       !loadingRoute && (

        <View style={styles.routeMessage}>

          <Text style={styles.routeMessageText}>
            ⚠️ {routeMessage}
          </Text>

        </View>

      )}


      {/* INFORMACJE */}

      {routeInfo &&
       !loadingRoute && (

        <View style={styles.info}>

          <Text style={styles.infoTitle}>
            🛣️ Trasa
          </Text>

          <Text style={styles.infoText}>
            📏 {distanceKm} km
          </Text>

          <Text style={styles.infoText}>
            ⏱️ około {durationMin} min
          </Text>

        </View>

      )}


      {/* MENU ODKRYWCY */}

      {showExplorer && (

        <ExplorerMenu
          activeMode={explorerMode}
          onSelect={setExplorerMode}
          onClose={() =>
            setShowExplorer(false)
          }
        />

      )}


      {/* MENU PROFILU */}

      {showProfiles && (

        <RouteProfileMenu
          activeProfile={profile}
          onSelect={setProfile}
          onClose={() =>
            setShowProfiles(false)
          }
        />

      )}

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1
  },

  map: {
    flex: 1
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  loading: {
    marginTop: 12,
    fontSize: 16
  },

  error: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
    padding: 20
  },


  profileButton: {
    position: 'absolute',
    left: 12,
    top: 75,
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 7
  },

  profileIcon: {
    fontSize: 20,
    marginRight: 6
  },

  profileText: {
    fontSize: 13,
    fontWeight: 'bold'
  },


  explorerButton: {
    position: 'absolute',
    left: 12,
    top: 125,
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 7
  },

  explorerActive: {
    backgroundColor: '#dcedc8'
  },

  explorerIcon: {
    fontSize: 20,
    marginRight: 6
  },

  explorerText: {
    fontSize: 13,
    fontWeight: 'bold'
  },


  locationButton: {
    position: 'absolute',
    right: 12,
    top: 75,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 7
  },

  locationIcon: {
    fontSize: 25
  },


  followButton: {
    position: 'absolute',
    right: 12,
    top: 135,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
    elevation: 6
  },

  followActive: {
    backgroundColor: '#1976D2'
  },

  followInactive: {
    backgroundColor: '#555'
  },

  followText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12
  },


  routeLoading: {
    position: 'absolute',
    top: 190,
    alignSelf: 'center',
    backgroundColor: '#1976D2',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6
  },

  routeLoadingText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold'
  },


  routeMessage: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 14,
    elevation: 7
  },

  routeMessageText: {
    color: '#7a5b00',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold'
  },


  info: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    elevation: 7,
    minWidth: 150
  },

  infoTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 5
  },

  infoText: {
    fontSize: 15,
    marginTop: 2
  }

});
