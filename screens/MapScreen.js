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

import {
  WebView
} from 'react-native-webview';

import * as Location from 'expo-location';

import SearchBar from '../components/SearchBar';

import RouteProfileMenu from '../components/RouteProfileMenu';

import {
  searchPlaces
} from '../services/geocodingService';

import {
  getRoute
} from '../services/routeService';

import {
  getMapHtml
} from '../utils/mapHtml';

import {
  ROUTE_PROFILES,
  DEFAULT_ROUTE_PROFILE
} from '../utils/routeProfiles';


export default function MapScreen() {

  const webViewRef = useRef(null);

  const [location, setLocation] =
    useState(null);

  const [error, setError] =
    useState('');

  const [results, setResults] =
    useState([]);

  const [route, setRoute] =
    useState([]);

  const [routeInfo, setRouteInfo] =
    useState(null);

  const [loadingRoute, setLoadingRoute] =
    useState(false);

  const [followUser, setFollowUser] =
    useState(true);

  const [profile, setProfile] =
    useState(DEFAULT_ROUTE_PROFILE);

  const [showProfiles, setShowProfiles] =
    useState(false);


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


  async function handleSearch(text) {

    if (!text ||
        text.trim().length < 3) {

      setResults([]);

      return;
    }

    const places =
      await searchPlaces(text);

    setResults(places);
  }


  async function handleSelect(place) {

    setResults([]);

    if (!location) {
      return;
    }

    setLoadingRoute(true);

    try {

      const selectedProfile =
        ROUTE_PROFILES[profile];

      const result =
        await getRoute(
          location.latitude,
          location.longitude,
          place.latitude,
          place.longitude,
          selectedProfile
        );

      if (!result) {

        setRouteInfo(null);
        setRoute([]);

        setError(
          'Nie udało się wyznaczyć trasy'
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

      setError(
        'Błąd podczas wyznaczania trasy'
      );

    } finally {

      setLoadingRoute(false);
    }

  }


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


  function selectProfile(id) {

    setProfile(id);

    setRoute([]);

    setRouteInfo(null);
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


  const distanceKm =
    routeInfo
      ? (routeInfo.distance / 1000).toFixed(1)
      : null;


  const durationMin =
    routeInfo
      ? Math.round(routeInfo.duration / 60)
      : null;


  const activeProfile =
    ROUTE_PROFILES[profile];


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


      <SearchBar
        results={results}
        onSearch={handleSearch}
        onSelect={handleSelect}
      />


      <TouchableOpacity
        style={styles.locationButton}
        onPress={centerOnUser}
      >

        <Text style={styles.locationIcon}>
          📍
        </Text>

      </TouchableOpacity>


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


      {loadingRoute && (

        <View style={styles.routeLoading}>

          <ActivityIndicator color="#fff" />

          <Text style={styles.routeLoadingText}>
            Wyznaczanie trasy...
          </Text>

        </View>

      )}


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


      {showProfiles && (

        <RouteProfileMenu
          activeProfile={profile}
          onSelect={selectProfile}
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
    elevation: 6
  },

  profileIcon: {
    fontSize: 20,
    marginRight: 6
  },

  profileText: {
    fontSize: 13,
    fontWeight: 'bold'
  },

  followButton: {
    position: 'absolute',
    right: 12,
    top: 135,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
    elevation: 5
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
