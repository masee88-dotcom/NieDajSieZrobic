import React, {
  useEffect,
  useState
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Alert
} from 'react-native';

import {
  WebView
} from 'react-native-webview';

import * as Location from 'expo-location';

import {
  getMapHtml
} from '../utils/mapHtml';

import {
  getRoute
} from '../services/routeService';

import {
  geocodeDestination
} from '../services/geocodingService';

import RouteModeButton
  from '../components/RouteModeButton';

import SearchBar
  from '../components/SearchBar';


export default function MapScreen() {

  const [
    location,
    setLocation
  ] = useState(null);

  const [
    error,
    setError
  ] = useState('');

  const [
    mode,
    setMode
  ] = useState('normal');

  const [
    searching,
    setSearching
  ] = useState(false);

  const [
    route,
    setRoute
  ] = useState(null);


  useEffect(() => {

    (async () => {

      try {

        const {
          status
        } =
          await Location
            .requestForegroundPermissionsAsync();


        if (
          status !== 'granted'
        ) {

          setError(
            'Brak zgody na lokalizację'
          );

          return;

        }


        const position =
          await Location
            .getCurrentPositionAsync({
              accuracy:
                Location.Accuracy.High
            });


        setLocation(
          position.coords
        );


      } catch (e) {

        console.log(
          'GPS error:',
          e
        );

        setError(
          'Nie udało się pobrać GPS'
        );

      }

    })();

  }, []);


  async function searchDestination(
    query
  ) {

    if (!location) {
      return;
    }


    setSearching(true);


    try {

      // ==================================
      // SZUKAMY CELU
      // ==================================

      const destination =
        await geocodeDestination(
          query
        );


      if (!destination) {

        Alert.alert(
          'CrossNav',
          'Nie znaleziono tego celu.'
        );

        return;

      }


      // ==================================
      // WYZNACZAMY TRASĘ
      // ==================================

      const result =
        await getRoute(
          location.latitude,
          location.longitude,
          destination.latitude,
          destination.longitude,
          {
            explorerMode:
              mode,

            avoidMotorway:
              mode === 'explorer'
          }
        );


      if (!result) {

        Alert.alert(
          'CrossNav',
          'Nie udało się znaleźć trasy do tego celu.'
        );

        return;

      }


      // ==================================
      // ZAPISUJEMY TRASĘ
      // ==================================

      setRoute({

        ...result,

        destination

      });


    } catch (e) {

      console.log(
        'CrossNav search error:',
        e
      );

      Alert.alert(
        'CrossNav',
        'Wystąpił błąd podczas wyszukiwania.'
      );

    } finally {

      setSearching(false);

    }

  }


  if (error) {

    return (
      <View style={styles.center}>

        <Text>
          {error}
        </Text>

      </View>
    );

  }


  if (!location) {

    return (
      <View style={styles.center}>

        <Text>
          Pobieranie GPS...
        </Text>

      </View>
    );

  }


  return (

    <View
      style={styles.container}
    >

      <WebView
        originWhitelist={['*']}
        source={{
          html:
            getMapHtml(
              location.latitude,
              location.longitude,
              route
            )
        }}
        style={
          StyleSheet.absoluteFill
        }
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />


      <RouteModeButton
        mode={mode}
        onChange={setMode}
      />


      <SearchBar
        onSearch={
          searchDestination
        }
        searching={
          searching
        }
      />


      {route && (

        <View
          style={styles.routeInfo}
        >

          <Text
            style={styles.routeTitle}
          >
            {mode === 'explorer'
              ? '🌲 ODKRYWCA'
              : '🛣️ NORMALNA'}
          </Text>


          <Text
            style={styles.routeText}
          >
            Dystans:{' '}
            {(
              route.distance / 1000
            ).toFixed(1)} km
          </Text>


          <Text
            style={styles.routeText}
          >
            Czas:{' '}
            {Math.round(
              route.duration / 60
            )} min
          </Text>


          <Text
            style={styles.routeReady}
          >
            ✅ TRASA GOTOWA
          </Text>

        </View>

      )}

    </View>

  );

}


const styles =
  StyleSheet.create({

    container: {
      flex: 1
    },

    center: {
      flex: 1,
      justifyContent:
        'center',
      alignItems:
        'center'
    },

    routeInfo: {
      position:
        'absolute',

      bottom: 80,

      left: 15,

      right: 15,

      backgroundColor:
        '#ffffff',

      borderRadius: 14,

      padding: 15,

      elevation: 7
    },

    routeTitle: {
      fontSize: 18,

      fontWeight: '800',

      marginBottom: 6
    },

    routeText: {
      fontSize: 16,

      marginTop: 3
    },

    routeReady: {
      marginTop: 8,

      fontWeight: '800'
    }

  });
