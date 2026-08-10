import React, {
  useEffect,
  useState
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator
} from 'react-native';

import {
  WebView
} from 'react-native-webview';

import * as Location from 'expo-location';

import SearchBar from '../components/SearchBar';

import {
  searchPlaces
} from '../services/geocodingService';

import {
  getRoute
} from '../services/routeService';

import {
  getMapHtml
} from '../utils/mapHtml';

export default function MapScreen() {

  const [location,setLocation] = useState(null);

  const [error,setError] = useState('');

  const [results,setResults] = useState([]);

  const [route,setRoute] = useState([]);

  const [routeInfo,setRouteInfo] = useState(null);

  const [loadingRoute,setLoadingRoute] = useState(false);

  useEffect(() => {

    async function loadLocation(){

      try{

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if(status !== 'granted'){

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

      }catch(e){

        console.log(e);

        setError(
          'Nie udało się pobrać lokalizacji'
        );

      }

    }

    loadLocation();

  },[]);

  async function handleSearch(text){

    if(!text || text.trim().length < 3){

      setResults([]);

      return;
    }

    const places =
      await searchPlaces(text);

    setResults(places);

  }

  async function handleSelect(place){

    setResults([]);

    if(!location){

      return;
    }

    setLoadingRoute(true);

    try{

      const result =
        await getRoute(
          location.latitude,
          location.longitude,
          place.latitude,
          place.longitude
        );

      if(!result){

        setRouteInfo(null);

        setRoute([]);

        setError(
          'Nie udało się wyznaczyć trasy'
        );

        return;
      }

      setRoute(
        result.geometry
      );

      setRouteInfo({
        distance: result.distance,
        duration: result.duration
      });

    }catch(e){

      console.log(e);

      setError(
        'Błąd podczas wyznaczania trasy'
      );

    }finally{

      setLoadingRoute(false);

    }

  }

  if(error){

    return(

      <View style={styles.center}>

        <Text style={styles.error}>
          {error}
        </Text>

      </View>

    );

  }

  if(!location){

    return(

      <View style={styles.center}>

        <ActivityIndicator size="large"/>

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

  return(

    <View style={styles.container}>

      <WebView
        originWhitelist={['*']}
        source={{
          html:getMapHtml(
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

      {loadingRoute && (

        <View style={styles.routeLoading}>

          <ActivityIndicator
            color="#fff"
          />

          <Text style={styles.routeLoadingText}>
            Wyznaczanie trasy...
          </Text>

        </View>

      )}

      {routeInfo && !loadingRoute && (

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

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1
  },

  map:{
    flex:1
  },

  center:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },

  loading:{
    marginTop:12,
    fontSize:16
  },

  error:{
    color:'#d32f2f',
    fontSize:16,
    textAlign:'center',
    padding:20
  },

  routeLoading:{
    position:'absolute',
    top:75,
    alignSelf:'center',
    backgroundColor:'#1976D2',
    paddingHorizontal:18,
    paddingVertical:10,
    borderRadius:20,
    flexDirection:'row',
    alignItems:'center',
    elevation:6
  },

  routeLoadingText:{
    color:'#fff',
    marginLeft:8,
    fontWeight:'bold'
  },

  info:{
    position:'absolute',
    bottom:10,
    left:10,
    backgroundColor:'#fff',
    borderRadius:12,
    padding:14,
    elevation:7,
    minWidth:150
  },

  infoTitle:{
    fontSize:17,
    fontWeight:'bold',
    marginBottom:5
  },

  infoText:{
    fontSize:15,
    marginTop:2
  }

});
