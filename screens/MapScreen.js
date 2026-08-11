import React, {
  useEffect,
  useState
} from 'react';

import {
  View,
  Text,
  StyleSheet
} from 'react-native';

import {
  WebView
} from 'react-native-webview';

import * as Location from 'expo-location';

import {
  getMapHtml
} from '../utils/mapHtml';

import RouteModeButton
  from '../components/RouteModeButton';


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
          'Nie udało się pobrać lokalizacji GPS'
        );

      }

    })();

  }, []);


  if (error) {

    return (
      <View
        style={styles.center}
      >
        <Text>
          {error}
        </Text>
      </View>
    );

  }


  if (!location) {

    return (
      <View
        style={styles.center}
      >
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
              location.longitude
            )
        }}
        style={
          StyleSheet.absoluteFill
        }
      />


      <RouteModeButton
        mode={mode}
        onChange={setMode}
      />

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
    }

  });
