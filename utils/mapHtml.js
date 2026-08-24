export function getMapHtml(latitude, longitude, route = null) {
  const routeCoordinates = route?.geometry || [];
  const routeJson = JSON.stringify(routeCoordinates);

  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
html, body, #map { width:100%; height:100%; margin:0; padding:0; }
#gpsInfo { position:absolute; top:15px; left:15px; z-index:9999; background:white; padding:10px 14px; border-radius:14px; font-size:17px; font-weight:bold; box-shadow:0 2px 8px rgba(0,0,0,.25); }
#direction { position:absolute; top:70px; left:50%; transform:translateX(-50%); z-index:9999; width:58px; height:58px; border-radius:50%; background:white; display:flex; align-items:center; justify-content:center; font-size:34px; box-shadow:0 2px 8px rgba(0,0,0,.25); }
.crossnav-motorcycle { background:transparent !important; border:0 !important; }
.crossnav-motorcycle-inner { width:40px; height:40px; display:flex; align-items:center; justify-content:center; font-size:34px; transform-origin:center center; filter:drop-shadow(0 1px 2px rgba(0,0,0,.35)); }
</style>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body>
<div id="map"></div>
<div id="gpsInfo">📡 GPS</div>
<div id="direction">⬆️</div>
<script>
const startLat = ${latitude};
const startLon = ${longitude};
const routeCoordinates = ${routeJson};
const map = L.map('map', { zoomControl: false }).setView([startLat, startLon], 13);
L.control.zoom({ position: 'bottomright' }).addTo(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);

if (routeCoordinates.length) {
  const points = routeCoordinates.map(point => [point[1], point[0]]);
  const routeLine = L.polyline(points, { color:'#1976d2', weight:6, opacity:.85 }).addTo(map);
  try { map.fitBounds(routeLine.getBounds(), { padding:[70,70], maxZoom:14 }); } catch(e) {}
}

const motorcycleIcon = L.divIcon({ className:'crossnav-motorcycle', html:'<div id="motorcycle" class="crossnav-motorcycle-inner">🏍️</div>', iconSize:[40,40], iconAnchor:[20,20] });
let userMarker = L.marker([startLat,startLon], { icon:motorcycleIcon }).addTo(map);
let firstGpsUpdate = true;
window.updateCrossNavGPS = function(message) {
  try {
    const data = JSON.parse(message);
    const lat = data.latitude, lon = data.longitude;
    if (typeof lat !== 'number' || typeof lon !== 'number') return;
    userMarker.setLatLng([lat, lon]);
    let speedText = '📡 GPS';
    if (typeof data.speed === 'number' && data.speed >= 0) speedText = '🏍️ ' + Math.round(data.speed * 3.6) + ' km/h';
    const gpsInfo = document.getElementById('gpsInfo');
    if (gpsInfo) gpsInfo.innerText = speedText;
    if (typeof data.heading === 'number' && data.heading >= 0) {
      const heading = data.heading;
      const motorcycle = document.getElementById('motorcycle');
      if (motorcycle) motorcycle.style.transform = 'rotate(' + heading + 'deg)';
      const direction = document.getElementById('direction');
      if (direction) { direction.style.transform = 'translateX(-50%) rotate(' + heading + 'deg)'; direction.innerText = '⬆️'; }
    }
    // Nie animujemy mapy przy każdym odczycie GPS: zapobiega miganiu i daje stabilniejszy obraz.
    // Centrum zmieniamy tylko po większym oddaleniu od aktualnego widoku.
    const center = map.getCenter();
    const distance = map.distance(center, [lat, lon]);
    if (firstGpsUpdate || distance > 250) {
      map.panTo([lat, lon], { animate:false });
      firstGpsUpdate = false;
    }
  } catch(e) { console.log('GPS MAP ERROR', e); }
};
</script>
</body>
</html>
`;
}
