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

  const webViewRef = useRef(null);

  const [location,setLocation] =
    useState(null);

  const [error,setError] =
    useState('');

  const [results,setResults] =
    useState([]);

  const [route,setRoute] =
    useState([]);

  const [routeInfo,setRouteInfo] =
    useState(null);

  const [loadingRoute,setLoadingRoute] =
    useState(false);

  const [followUser,setFollowUser] =
    useState(true);


  // =====================================
  // GPS
  // =====================================

  useEffect(() => {

    let subscription;

    async function startGPS(){

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


        subscription =
          await Location.watchPositionAsync(
            {
              accuracy:
                Location.Accuracy.High,

              timeInterval: 3000,

              distanceInterval: 5
            },

            newPosition => {

              const coords =
                newPosition.coords;

              setLocation(coords);


              // Aktualizujemy pozycję
              // bez przeładowywania mapy

              if(webViewRef.current){

                const js = `
                  if(window.updateUserLocation){
                    window.updateUserLocation(
                      ${coords.latitude},
                      ${coords.longitude},
                      ${followUser}
                    );
                  }
                  true;
                `;

                webViewRef.current.injectJavaScript(js);
              }

            }
          );

      }catch(e){

        console.log(e);

        setError(
          'Nie udało się uruchomić GPS'
        );

      }

    }


    startGPS();


    return () => {

      if(subscription){

        subscription.remove();

      }

    };

  }, [followUser]);


  // =====================================
  // WYSZUKIWANIE
  // =====================================

  async function handleSearch(text){

    if(!text ||
       text.trim().length < 3){

      setResults([]);

      return;
    }


    const places =
      await searchPlaces(text);


    setResults(places);

  }


  // =====================================
  // WYBÓR CELU
  // =====================================

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

        distance:
          result.distance,

        duration:
          result.duration

      });


      // Po wybraniu celu
      // włączamy śledzenie

      setFollowUser(true);


    }catch(e){

      console.log(e);

      setError(
        'Błąd podczas wyznaczania trasy'
      );

    }finally{

      setLoadingRoute(false);

    }

  }


  // =====================================
  // PRZYCISK MOJA LOKALIZACJA
  // =====================================

  function centerOnUser(){

    if(!location ||
       !webViewRef.current){

      return;
    }


    setFollowUser(true);


    const js = `
      if(window.updateUserLocation){

        window.updateUserLocation(
          ${location.latitude},
          ${location.longitude},
          true
        );

      }

      true;
    `;


    webViewRef.current.injectJavaScript(js);

  }


  // =====================================
  // EKRAN BŁĘDU
  // =====================================

  if(error){

    return(

      <View style={styles.center}>

        <Text style={styles.error}>
          {error}
        </Text>

      </View>

    );

  }


  // =====================================
  // CZEKAMY NA GPS
  // =====================================

  if(!location){

    return(

      <View style={styles.center}>

        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loading}>
          Pobieranie GPS...
        </Text>

      </View>

    );

  }


  // =====================================
  // INFORMACJE O TRASIE
  // =====================================

  const distanceKm =
    routeInfo
      ? (routeInfo.distance / 1000).toFixed(1)
      : null;


  const durationMin =
    routeInfo
      ? Math.round(
          routeInfo.duration / 60
        )
      : null;


  // =====================================
  // WIDOK
  // =====================================

  return(

    <View style={styles.container}>


      <WebView

        ref={webViewRef}

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


      {/* WYSZUKIWARKA */}

      <SearchBar

        results={results}

        onSearch={handleSearch}

        onSelect={handleSelect}

      />


      {/* MOJA LOKALIZACJA */}

      <TouchableOpacity

        style={styles.locationButton}

        onPress={centerOnUser}

      >

        <Text style={styles.locationIcon}>
          📍
        </Text>

      </TouchableOpacity>


      {/* INFORMACJA O ŚLEDZENIU */}

      <TouchableOpacity

        style={[
          styles.followButton,

          followUser
            ? styles.followActive
            : styles.followInactive
        ]}

        onPress={() => {

          setFollowUser(
            !followUser
          );

        }}

      >

        <Text style={styles.followText}>

          {followUser
            ? '🧭 Śledzenie GPS'
            : '⏸️ Śledzenie wyłączone'}

        </Text>

      </TouchableOpacity>


      {/* WYZNACZANIE TRASY */}

      {loadingRoute && (

        <View style={styles.routeLoading}>

          <ActivityIndicator
            color="#fff"
          />

          <Text
            style={styles.routeLoadingText}
          >
            Wyznaczanie trasy...
          </Text>

        </View>

      )}


      {/* INFORMACJE O TRASIE */}

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

    </View>

  );

}


// =====================================
// STYLE
// =====================================

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


  locationButton:{

    position:'absolute',

    right:12,

    top:75,

    width:52,

    height:52,

    borderRadius:26,

    backgroundColor:'#fff',

    justifyContent:'center',

    alignItems:'center',

    elevation:7

  },


  locationIcon:{
    fontSize:25
  },


  followButton:{

    position:'absolute',

    right:12,

    top:135,

    borderRadius:20,

    paddingHorizontal:13,

    paddingVertical:9,

    elevation:5

  },


  followActive:{
    backgroundColor:'#1976D2'
  },


  followInactive:{
    backgroundColor:'#555'
  },


  followText:{
    color:'#fff',
    fontWeight:'bold',
    fontSize:12
  },


  routeLoading:{

    position:'absolute',

    top:190,

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
