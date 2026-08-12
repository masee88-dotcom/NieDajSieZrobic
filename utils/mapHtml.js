export function getMapHtml(
  latitude,
  longitude,
  route = null
) {

  const routeCoordinates =
    route?.geometry || [];

  const routeJson =
    JSON.stringify(routeCoordinates);

  return `
<!DOCTYPE html>
<html>

<head>

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<style>

html,
body,
#map {

  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;

}

#gpsInfo {

  position: absolute;

  top: 15px;
  left: 15px;

  z-index: 9999;

  background: white;

  padding: 10px 14px;

  border-radius: 14px;

  font-size: 17px;

  font-weight: bold;

  box-shadow:
    0 2px 8px rgba(0,0,0,0.25);

}

#direction {

  position: absolute;

  top: 70px;
  left: 50%;

  transform:
    translateX(-50%);

  z-index: 9999;

  width: 58px;
  height: 58px;

  border-radius: 50%;

  background: white;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 34px;

  box-shadow:
    0 2px 8px rgba(0,0,0,0.25);

}

</style>

</head>

<body>

<div id="map"></div>

<div id="gpsInfo">
📡 GPS
</div>

<div id="direction">
⬆️
</div>


<script
src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js">
</script>

<link
rel="stylesheet"
href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>


<script>

const startLat =
  ${latitude};

const startLon =
  ${longitude};

const routeCoordinates =
  ${routeJson};


// ==========================================
// MAPA
// ==========================================

const map =
  L.map('map')
   .setView(
     [startLat, startLon],
     15
   );


L.tileLayer(

  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

  {

    maxZoom: 19,

    attribution:
      '© OpenStreetMap'

  }

).addTo(map);


// ==========================================
// TRASA
// ==========================================

if (
  routeCoordinates.length
) {

  const points =
    routeCoordinates.map(
      point => [
        point[1],
        point[0]
      ]
    );


  L.polyline(

    points,

    {

      color:
        '#1976d2',

      weight:
        6,

      opacity:
        0.85

    }

  ).addTo(map);

}


// ==========================================
// MARKER MOTOCYKLA
// ==========================================

const motorcycleIcon =
  L.divIcon({

    className:
      'crossnav-marker',

    html:
      '<div style="font-size:36px;">🏍️</div>',

    iconSize:
      [40,40],

    iconAnchor:
      [20,20]

  });


let userMarker =
  L.marker(

    [startLat,startLon],

    {

      icon:
        motorcycleIcon

    }

  ).addTo(map);


// ==========================================
// GPS
// ==========================================

window.updateCrossNavGPS =
  function(message) {

    try {

      const data =
        JSON.parse(message);


      const lat =
        data.latitude;

      const lon =
        data.longitude;


      if (
        typeof lat !== 'number' ||
        typeof lon !== 'number'
      ) {

        return;

      }


      userMarker.setLatLng(
        [lat,lon]
      );


      // --------------------------------------
      // PRĘDKOŚĆ
      // --------------------------------------

      let speedText =
        '📡 GPS';


      if (
        typeof data.speed === 'number' &&
        data.speed >= 0
      ) {

        speedText =
          '🏍️ ' +
          Math.round(
            data.speed * 3.6
          ) +
          ' km/h';

      }


      document
        .getElementById(
          'gpsInfo'
        )
        .innerText =
          speedText;


      // --------------------------------------
      // KIERUNEK
      // --------------------------------------

      if (
        typeof data.heading === 'number' &&
        data.heading >= 0
      ) {

        const heading =
          data.heading;


        document
          .getElementById(
            'direction'
          )
          .style.transform =
            'translateX(-50%) rotate(' +
            heading +
            'deg)';


        document
          .getElementById(
            'direction'
          )
          .innerText =
            '⬆️';

      }


      // --------------------------------------
      // PODĄŻANIE ZA MOTOCYKLEM
      // --------------------------------------

      map.panTo(

        [lat,lon],

        {

          animate:
            true,

          duration:
            0.3

        }

      );


    } catch(e) {

      console.log(
        'GPS MAP ERROR',
        e
      );

    }

  };

</script>

</body>
</html>
`;
}
