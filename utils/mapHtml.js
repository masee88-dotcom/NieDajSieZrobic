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

const me = L.marker(
  [startLat,startLon]
).addTo(map);

me.bindPopup('📍 Jesteś tutaj');

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

  const destination = route[route.length - 1];

  L.marker(destination)
    .addTo(map)
    .bindPopup('🏁 Cel')
    .openPopup();
}

</script>

</body>

</html>
`;
}
