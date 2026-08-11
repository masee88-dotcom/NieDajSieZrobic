export function getMapHtml(
  latitude,
  longitude,
  route = null
) {

  const routeCoordinates =
    route?.geometry || [];

  const routeJson =
    JSON.stringify(
      routeCoordinates
    );

  const destination =
    route?.destination || null;

  const destinationJson =
    JSON.stringify(
      destination
    );

  return `
<!DOCTYPE html>

<html>

<head>

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
/>

<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>

<script
  src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js">
</script>

<style>

html,
body,
#map {

  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;

}

.leaflet-control-attribution {

  font-size: 9px;

}

</style>

</head>

<body>

<div id="map"></div>

<script>

const startLat =
  ${latitude};

const startLon =
  ${longitude};

const routeCoordinates =
  ${routeJson};

const destination =
  ${destinationJson};


const map =
  L.map('map')
   .setView(
     [startLat, startLon],
     14
   );


L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution:
      '&copy; OpenStreetMap contributors'
  }
).addTo(map);


// ========================================
// AKTUALNA LOKALIZACJA
// ========================================

const currentMarker =
  L.marker(
    [startLat, startLon]
  )
  .addTo(map)
  .bindPopup(
    '📍 Twoja lokalizacja'
  );


// ========================================
// TRASA
// ========================================

if (
  Array.isArray(routeCoordinates) &&
  routeCoordinates.length > 1
) {

  const latLngs =
    routeCoordinates.map(
      point => [
        point[1],
        point[0]
      ]
    );


  const routeLine =
    L.polyline(
      latLngs,
      {
        color: '#1565c0',
        weight: 6,
        opacity: 0.9
      }
    ).addTo(map);


  // Dopasowanie mapy
  // do całej trasy

  map.fitBounds(
    routeLine.getBounds(),
    {
      padding: [
        40,
        40
      ]
    }
  );

}


// ========================================
// CEL
// ========================================

if (
  destination &&
  Number.isFinite(
    destination.latitude
  ) &&
  Number.isFinite(
    destination.longitude
  )
) {

  L.marker(
    [
      destination.latitude,
      destination.longitude
    ]
  )
  .addTo(map)
  .bindPopup(
    '🏁 Cel'
  );

}

</script>

</body>

</html>
`;
}
