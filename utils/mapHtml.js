export function getMapHtml(
  latitude,
  longitude,
  routeGeometry = []
) {

  const route = JSON.stringify(
    routeGeometry.map(point => [
      point[1],
      point[0]
    ])
  );

  return `
<!DOCTYPE html>
<html>

<head>

<meta name="viewport"
content="width=device-width, initial-scale=1.0">

<link
rel="stylesheet"
href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>

<script
src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js">
</script>

<style>

html,body,#map{
height:100%;
margin:0;
padding:0;
}

.leaflet-control-attribution{
display:none;
}

.user-marker{
width:22px;
height:22px;
border-radius:50%;
background:#1976D2;
border:4px solid white;
box-shadow:0 0 0 2px #1976D2;
}

</style>

</head>

<body>

<div id="map"></div>

<script>

const startLat = ${latitude};
const startLon = ${longitude};

const route = ${route};

const map = L.map('map').setView(
  [startLat,startLon],
  15
);

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom:19
  }
).addTo(map);


// ===============================
// TWOJA POZYCJA
// ===============================

const userIcon = L.divIcon({
  className: '',
  html: '<div class="user-marker"></div>',
  iconSize: [30,30],
  iconAnchor: [15,15]
});

let userMarker = L.marker(
  [startLat,startLon],
  {
    icon:userIcon,
    zIndexOffset:1000
  }
).addTo(map);

userMarker.bindPopup('📍 Jesteś tutaj');


// ===============================
// TRASA
// ===============================

if(route.length > 0){

  const line = L.polyline(
    route,
    {
      color:'#1976D2',
      weight:6,
      opacity:0.85
    }
  ).addTo(map);

  const bounds = line.getBounds();

  map.fitBounds(bounds,{
    padding:[40,40]
  });

  const destination =
    route[route.length - 1];

  L.marker(destination)
    .addTo(map)
    .bindPopup('🏁 Cel');

}


// ===============================
// AKTUALIZACJA POZYCJI
// ===============================

window.updateUserLocation = function(
  latitude,
  longitude,
  follow
){

  userMarker.setLatLng([
    latitude,
    longitude
  ]);

  if(follow){

    map.setView(
      [latitude,longitude],
      map.getZoom(),
      {
        animate:true
      }
    );

  }

};

</script>

</body>
</html>
`;
}
