import React, { useEffect, useRef, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity
} from 'react-native';

import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';

import { getMapHtml } from '../utils/mapHtml';
import { getRoute } from '../services/routeService';
import { geocodeDestination } from '../services/geocodingService';

import RouteModeButton from '../components/RouteModeButton';
import SearchBar from '../components/SearchBar';


export default function MapScreen() {

  const webViewRef = useRef(null);

  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');

  const [mode, setMode] = useState('auto');

  const [searching, setSearching] = useState(false);

  const [route, setRoute] = useState(null);

  const [navigating, setNavigating] = useState(false);

  const [rerouting, setRerouting] = useState(false);

  const [currentStep, setCurrentStep] = useState(null);

  const [stepIndex, setStepIndex] = useState(0);

  const [stepDistance, setStepDistance] = useState(null);

  const [destinationDistance, setDestinationDistance] =
    useState(null);

  const [currentSpeed, setCurrentSpeed] = useState(0);

  const [heading, setHeading] = useState(null);

  const spokenRef = useRef({});

  const lastRerouteRef = useRef(0);


  // ==========================================
  // GPS
  // ==========================================

  useEffect(() => {

    let watcher = null;

    async function startGPS() {

      try {

        const permission =
          await Location.requestForegroundPermissionsAsync();

        if (
          permission.status !== 'granted'
        ) {

          setError(
            'Brak zgody na lokalizację'
          );

          return;

        }


        const first =
          await Location.getCurrentPositionAsync({

            accuracy:
              Location.Accuracy.High

          });


        setLocation(
          first.coords
        );


        if (
          typeof first.coords.speed === 'number' &&
          first.coords.speed >= 0
        ) {

          setCurrentSpeed(
            first.coords.speed
          );

        }


        if (
          typeof first.coords.heading === 'number' &&
          first.coords.heading >= 0
        ) {

          setHeading(
            first.coords.heading
          );

        }


        watcher =
          await Location.watchPositionAsync(

            {

              accuracy:
                Location.Accuracy.High,

              distanceInterval:
                2,

              timeInterval:
                1000

            },

            position => {

              const coords =
                position.coords;


              setLocation(
                coords
              );


              if (
                typeof coords.speed === 'number' &&
                coords.speed >= 0
              ) {

                setCurrentSpeed(
                  coords.speed
                );

              }


              if (
                typeof coords.heading === 'number' &&
                coords.heading >= 0
              ) {

                setHeading(
                  coords.heading
                );

              }

            }

          );

      } catch (e) {

        console.log(
          'GPS ERROR:',
          e
        );

        setError(
          'Błąd GPS'
        );

      }

    }


    startGPS();


    return () => {

      if (watcher) {

        watcher.remove();

      }

    };

  }, []);


  // ==========================================
  // GPS → MAPA
  // ==========================================

  useEffect(() => {

    if (
      !location ||
      !webViewRef.current
    ) {

      return;

    }


    const gpsData = {

      type:
        'GPS',

      latitude:
        location.latitude,

      longitude:
        location.longitude,

      speed:
        currentSpeed,

      heading:
        heading

    };


    webViewRef.current.injectJavaScript(`

      if (
        typeof window.updateCrossNavGPS === 'function'
      ) {

        window.updateCrossNavGPS(
          ${JSON.stringify(
            JSON.stringify(gpsData)
          )}
        );

      }

      true;

    `);

  }, [
    location,
    currentSpeed,
    heading
  ]);


  // ==========================================
  // NAWIGACJA
  // ==========================================

  useEffect(() => {

    if (
      !location ||
      !route ||
      !navigating
    ) {

      return;

    }


    // ----------------------------------------
    // ODLEGŁOŚĆ OD TRASY
    // ----------------------------------------

    if (
      route.geometry &&
      route.geometry.length
    ) {

      const distanceFromRoute =
        getDistanceFromRoute(
          location,
          route.geometry
        );


      if (
        distanceFromRoute > 100
      ) {

        recalculateRoute();

        return;

      }

    }


    // ----------------------------------------
    // CEL
    // ----------------------------------------

    if (
      route.destination
    ) {

      const distance =
        calculateDistance(

          location.latitude,
          location.longitude,

          route.destination.latitude,
          route.destination.longitude

        );


      setDestinationDistance(
        distance
      );


      if (
        distance < 0.03
      ) {

        finishNavigation();

        return;

      }

    }


    // ----------------------------------------
    // MANEWRY
    // ----------------------------------------

    const steps =
      route.steps || [];


    if (
      !steps.length
    ) {

      return;

    }


    let index =
      Math.min(
        stepIndex,
        steps.length - 1
      );


    // Pomijamy stare punkty manewrów,
    // kiedy użytkownik już je minął.

    while (
      index < steps.length - 1
    ) {

      const distance =
        getStepDistance(
          location,
          steps[index]
        );


      if (
        distance > 35
      ) {

        break;

      }


      index++;

    }


    if (
      index !== stepIndex
    ) {

      setStepIndex(
        index
      );

    }


    const step =
      steps[index];


    if (!step) {

      return;

    }


    const distance =
      getStepDistance(
        location,
        step
      );


    setCurrentStep(
      step
    );


    setStepDistance(
      distance
    );


    speakNavigationInstruction(

      index,

      step,

      distance,

      spokenRef

    );

  }, [
    location,
    route,
    navigating,
    stepIndex
  ]);


  // ==========================================
  // ZMIANA TRYBU
  // ==========================================

  function changeMode(
    newMode
  ) {

    setMode(
      newMode
    );


    if (route) {

      Speech.stop();

      setRoute(
        null
      );

      setNavigating(
        false
      );

      setCurrentStep(
        null
      );

      setStepDistance(
        null
      );

      setDestinationDistance(
        null
      );

      spokenRef.current =
        {};

    }

  }


  // ==========================================
  // PRZELICZANIE TRASY
  // ==========================================

  async function recalculateRoute() {

    if (
      !location ||
      !route?.destination ||
      rerouting
    ) {

      return;

    }


    const now =
      Date.now();


    if (
      now -
      lastRerouteRef.current
      <
      10000
    ) {

      return;

    }


    lastRerouteRef.current =
      now;


    setRerouting(
      true
    );


    try {

      const destination =
        route.destination;


      const result =
        await getRoute(

          location.latitude,
          location.longitude,

          destination.latitude,
          destination.longitude,

          {
            mode:
              mode
          }

        );


      if (!result) {

        return;

      }


      setRoute({

        ...result,

        destination

      });


      setStepIndex(
        0
      );


      setCurrentStep(
        result.steps?.[0] || null
      );


      spokenRef.current =
        {};


      Speech.speak(

        'Przeliczam trasę',

        {

          language:
            'pl-PL',

          rate:
            0.95

        }

      );

    } catch (e) {

      console.log(
        'REROUTE ERROR:',
        e
      );

    } finally {

      setRerouting(
        false
      );

    }

  }


  // ==========================================
  // SZUKANIE CELU
  // ==========================================

  async function searchDestination(
    query
  ) {

    if (!location) {

      return;

    }


    setSearching(
      true
    );


    try {

      const destination =
        await geocodeDestination(
          query
        );


      if (!destination) {

        Alert.alert(
          'CrossNav',
          'Nie znaleziono celu.'
        );

        return;

      }


      const result =
        await getRoute(

          location.latitude,
          location.longitude,

          destination.latitude,
          destination.longitude,

          {
            mode:
              mode
          }

        );


      if (!result) {

        Alert.alert(
          'CrossNav',
          'Nie znaleziono trasy dla wybranego trybu.'
        );

        return;

      }


      setRoute({

        ...result,

        destination

      });


      setStepIndex(
        0
      );


      setCurrentStep(
        result.steps?.[0] || null
      );


      setNavigating(
        false
      );


      setDestinationDistance(
        calculateDistance(

          location.latitude,
          location.longitude,

          destination.latitude,
          destination.longitude

        )

      );


      spokenRef.current =
        {};

    } catch (e) {

      console.log(
        'SEARCH ERROR:',
        e
      );


      Alert.alert(
        'CrossNav',
        'Błąd wyszukiwania.'
      );

    } finally {

      setSearching(
        false
      );

    }

  }


  // ==========================================
  // START NAWIGACJI
  // ==========================================

  function startNavigation() {

    if (
      !route
    ) {

      return;

    }


    setStepIndex(
      0
    );


    setCurrentStep(
      route.steps?.[0] || null
    );


    setNavigating(
      true
    );


    spokenRef.current =
      {};


    Speech.stop();


    Speech.speak(

      'Rozpoczynam nawigację',

      {

        language:
          'pl-PL',

        rate:
          0.95

      }

    );

  }


  // ==========================================
  // KONIEC
  // ==========================================

  function finishNavigation() {

    Speech.stop();


    setNavigating(
      false
    );


    setCurrentStep(
      null
    );


    setStepDistance(
      null
    );


    setDestinationDistance(
      null
    );


    spokenRef.current =
      {};


    Alert.alert(
      'CrossNav',
      '🏁 Dotarłeś do celu!'
    );

  }


  // ==========================================
  // STOP
  // ==========================================

  function stopNavigation() {

    Speech.stop();


    setNavigating(
      false
    );


    setCurrentStep(
      null
    );


    setStepDistance(
      null
    );


    setDestinationDistance(
      null
    );


    spokenRef.current =
      {};

  }


  // ==========================================
  // BŁĄD
  // ==========================================

  if (error) {

    return (

      <View
        style={styles.center}
      >

        <Text
          style={styles.error}
        >

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

        <Text
          style={styles.loading}
        >

          📡 Pobieranie GPS...

        </Text>

      </View>

    );

  }


  // ==========================================
  // EKRAN
  // ==========================================

  return (

    <View
      style={styles.container}
    >

      <WebView

        ref={webViewRef}

        originWhitelist={[
          '*'
        ]}

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

        javaScriptEnabled={
          true
        }

        domStorageEnabled={
          true
        }

      />


      <RouteModeButton

        mode={
          mode
        }

        onChange={
          changeMode
        }

      />


      <SearchBar

        onSearch={
          searchDestination
        }

        searching={
          searching
        }

      />


      {/* ====================================
          GOTOWA TRASA
      ==================================== */}

      {!navigating && route && (

        <View
          style={styles.readyPanel}
        >

          <Text
            style={styles.readyTitle}
          >

            🏁 TRASA GOTOWA

          </Text>


          <Text
            style={styles.modeText}
          >

            {getModeName(
              mode
            )}

          </Text>


          <Text
            style={styles.readyInfo}
          >

            {formatDistance(
              route.distance / 1000
            )}

            {'  •  '}

            {Math.max(
              1,
              Math.round(
                route.duration / 60
              )
            )}

            {' min'}

          </Text>


          <TouchableOpacity

            style={styles.startButton}

            onPress={
              startNavigation
            }

          >

            <Text
              style={styles.startButtonText}
            >

              ▶ JEDŹ

            </Text>

          </TouchableOpacity>

        </View>

      )}


      {/* ====================================
          NAWIGACJA
      ==================================== */}

      {navigating && route && (

        <View
          style={styles.navigationPanel}
        >

          <View
            style={styles.navigationHeader}
          >

            <Text
              style={styles.navigationTitle}
            >

              🧭 NAWIGACJA

            </Text>


            <Text
              style={styles.speed}
            >

              {Math.round(
                currentSpeed * 3.6
              )}

              {' km/h'}

            </Text>

          </View>


          <View
            style={styles.maneuver}
          >

            <Text
              style={styles.maneuverIcon}
            >

              {getManeuverIcon(
                currentStep
              )}

            </Text>


            <View
              style={styles.maneuverText}
            >

              <Text
                style={styles.instruction}
              >

                {currentStep?.instruction ||
                  'Jedź zgodnie z trasą'}

              </Text>


              <Text
                style={styles.stepDistance}
              >

                {stepDistance !== null
                  ? formatDistance(
                      stepDistance
                    )
                  : '...'}

              </Text>

            </View>

          </View>


          <View
            style={styles.routeInfo}
          >

            <View
              style={styles.infoBox}
            >

              <Text
                style={styles.smallLabel}
              >

                DO CELU

              </Text>


              <Text
                style={styles.bigInfo}
              >

                {destinationDistance !== null
                  ? formatDistance(
                      destinationDistance
                    )
                  : '...'}

              </Text>

            </View>


            <View
              style={styles.infoBox}
            >

              <Text
                style={styles.smallLabel}
              >

                CZAS

              </Text>


              <Text
                style={styles.bigInfo}
              >

                {Math.max(
                  1,
                  Math.round(
                    route.duration / 60
                  )
                )}

                {' min'}

              </Text>

            </View>


            <View
              style={styles.infoBox}
            >

              <Text
                style={styles.smallLabel}
              >

                TRYB

              </Text>


              <Text
                style={styles.modeSmall}
              >

                {getModeName(
                  mode
                )}

              </Text>

            </View>

          </View>


          {rerouting && (

            <Text
              style={styles.rerouting}
            >

              🔄 PRZELICZAM TRASĘ...

            </Text>

          )}


          <TouchableOpacity

            style={styles.stopButton}

            onPress={
              stopNavigation
            }

          >

            <Text
              style={styles.stopButtonText}
            >

              ZAKOŃCZ NAWIGACJĘ

            </Text>

          </TouchableOpacity>


          <Text
            style={styles.gps}
          >

            📡 GPS AKTYWNY
            {heading !== null
              ? `  •  ${Math.round(heading)}°`
              : ''}

          </Text>

        </View>

      )}

    </View>

  );

}


// ==========================================
// TRYB
// ==========================================

function getModeName(
  mode
) {

  if (
    mode === 'moped'
  ) {

    return '🛵 MOTOROWER';

  }


  if (
    mode === 'explorer'
  ) {

    return '🌲 ODKRYWCA';

  }


  return '🚗 AUTO';

}


// ==========================================
// IKONA
// ==========================================

function getManeuverIcon(
  step
) {

  if (!step) {

    return '⬆️';

  }


  const type =
    step.type || '';

  const modifier =
    step.modifier || '';


  if (
    type === 'arrive'
  ) {

    return '🏁';

  }


  if (
    type === 'roundabout' ||
    type === 'rotary'
  ) {

    return '🔄';

  }


  if (
    type === 'uturn'
  ) {

    return '↩️';

  }


  if (
    modifier.includes(
      'left'
    )
  ) {

    return '⬅️';

  }


  if (
    modifier.includes(
      'right'
    )
  ) {

    return '➡️';

  }


  return '⬆️';

}


// ==========================================
// ODLEGŁOŚĆ OD TRASY
// ==========================================

function getDistanceFromRoute(
  location,
  geometry
) {

  if (
    !geometry ||
    !geometry.length
  ) {

    return 0;

  }


  let closest =
    Infinity;


  for (
    const point of geometry
  ) {

    if (
      !point ||
      point.length < 2
    ) {

      continue;

    }


    const distance =
      calculateDistance(

        location.latitude,
        location.longitude,

        point[1],
        point[0]

      );


    if (
      distance < closest
    ) {

      closest =
        distance;

    }

  }


  return closest * 1000;

}


// ==========================================
// ODLEGŁOŚĆ DO MANEWRU
// ==========================================

function getStepDistance(
  location,
  step
) {

  if (
    !step ||
    !step.location
  ) {

    return 999;

  }


  return calculateDistance(

    location.latitude,
    location.longitude,

    step.location[1],
    step.location[0]

  );

}


// ==========================================
// GŁOS
// ==========================================

function speakNavigationInstruction(
  index,
  step,
  distance,
  spokenRef
) {

  if (
    !step ||
    !step.instruction ||
    !Number.isFinite(distance)
  ) {

    return;

  }


  let level = null;


  if (
    distance <= 50
  ) {

    level =
      'NOW';

  } else if (
    distance <= 200
  ) {

    level =
      '200';

  } else if (
    distance <= 500
  ) {

    level =
      '500';

  }


  if (!level) {

    return;

  }


  const key =
    index +
    '_' +
    level;


  if (
    spokenRef.current[key]
  ) {

    return;

  }


  spokenRef.current[key] =
    true;


  let text;


  if (
    level === 'NOW'
  ) {

    text =
      step.instruction;

  } else {

    text =
      'Za ' +
      Math.round(
        distance * 1000
      ) +
      ' metrów ' +
      step.instruction.toLowerCase();

  }


  Speech.speak(

    text,

    {

      language:
        'pl-PL',

      rate:
        0.95,

      pitch:
        1.0

    }

  );

}


// ==========================================
// ODLEGŁOŚĆ
// ==========================================

function calculateDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const R =
    6371;


  const dLat =
    toRadians(
      lat2 - lat1
    );


  const dLon =
    toRadians(
      lon2 - lon1
    );


  const a =

    Math.sin(
      dLat / 2
    ) ** 2 +

    Math.cos(
      toRadians(
        lat1
      )
    ) *

    Math.cos(
      toRadians(
        lat2
      )
    ) *

    Math.sin(
      dLon / 2
    ) ** 2;


  const c =
    2 *
    Math.atan2(

      Math.sqrt(a),

      Math.sqrt(
        1 - a
      )

    );


  return R * c;

}


function toRadians(
  degrees
) {

  return (
    degrees *
    Math.PI /
    180
  );

}


// ==========================================
// FORMAT
// ==========================================

function formatDistance(
  km
) {

  if (
    !Number.isFinite(km)
  ) {

    return '...';

  }


  if (
    km < 1
  ) {

    return (

      Math.max(
        0,
        Math.round(
          km * 1000
        )
      ) +

      ' m'

    );

  }


  return (
    km.toFixed(1) +
    ' km'
  );

}


// ==========================================
// STYLE
// ==========================================

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
        'center',

      backgroundColor:
        '#ffffff'

    },


    loading: {

      fontSize:
        18,

      fontWeight:
        '700'

    },


    error: {

      fontSize:
        18,

      color:
        '#cc0000'

    },


    readyPanel: {

      position:
        'absolute',

      bottom:
        15,

      left:
        10,

      right:
        10,

      backgroundColor:
        '#ffffff',

      borderRadius:
        20,

      padding:
        16,

      elevation:
        10,

      alignItems:
        'center'

    },


    readyTitle: {

      fontSize:
        21,

      fontWeight:
        '900'

    },


    modeText: {

      fontSize:
        15,

      fontWeight:
        '800',

      marginTop:
        4

    },


    readyInfo: {

      fontSize:
        18,

      fontWeight:
        '700',

      marginTop:
        5

    },


    startButton: {

      marginTop:
        12,

      width:
        '100%',

      backgroundColor:
        '#111111',

      borderRadius:
        14,

      padding:
        16,

      alignItems:
        'center'

    },


    startButtonText: {

      color:
        '#ffffff',

      fontSize:
        21,

      fontWeight:
        '900'

    },


    navigationPanel: {

      position:
        'absolute',

      bottom:
        12,

      left:
        10,

      right:
        10,

      backgroundColor:
        '#ffffff',

      borderRadius:
        20,

      padding:
        15,

      elevation:
        12,

      shadowOpacity:
        0.25,

      shadowRadius:
        8

    },


    navigationHeader: {

      flexDirection:
        'row',

      justifyContent:
        'space-between',

      alignItems:
        'center',

      marginBottom:
        10

    },


    navigationTitle: {

      fontSize:
        18,

      fontWeight:
        '900'

    },


    speed: {

      fontSize:
        18,

      fontWeight:
        '900'

    },


    maneuver: {

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        '#eeeeee',

      borderRadius:
        16,

      padding:
        12

    },


    maneuverIcon: {

      fontSize:
        42,

      width:
        58,

      textAlign:
        'center'

    },


    maneuverText: {

      flex: 1,

      paddingLeft:
        8

    },


    instruction: {

      fontSize:
        20,

      fontWeight:
        '900'

    },


    stepDistance: {

      fontSize:
        23,

      fontWeight:
        '900',

      marginTop:
        4

    },


    routeInfo: {

      flexDirection:
        'row',

      justifyContent:
        'space-around',

      marginTop:
        12,

      paddingTop:
        10,

      borderTopWidth:
        1,

      borderTopColor:
        '#dddddd'

    },


    infoBox: {

      alignItems:
        'center'

    },


    smallLabel: {

      fontSize:
        10,

      fontWeight:
        '800',

      color:
        '#666666'

    },


    bigInfo: {

      fontSize:
        18,

      fontWeight:
        '900',

      marginTop:
        2

    },


    modeSmall: {

      fontSize:
        12,

      fontWeight:
        '900',

      marginTop:
        4

    },


    rerouting: {

      marginTop:
        8,

      textAlign:
        'center',

      fontSize:
        15,

      fontWeight:
        '900'

    },


    stopButton: {

      marginTop:
        12,

      backgroundColor:
        '#222222',

      borderRadius:
        12,

      padding:
        12,

      alignItems:
        'center'

    },


    stopButtonText: {

      color:
        '#ffffff',

      fontSize:
        14,

      fontWeight:
        '900'

    },


    gps: {

      marginTop:
        8,

      textAlign:
        'center',

      fontSize:
        12,

      fontWeight:
        '700'

    }

  });
