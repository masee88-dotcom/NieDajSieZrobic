export function getMapHtml(latitude, longitude) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

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

var map=L.map('map').setView([${latitude},${longitude}],15);

L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
maxZoom:19
}
).addTo(map);

L.marker([${latitude},${longitude}]).addTo(map)
.bindPopup('📍 Jesteś tutaj')
.openPopup();

</script>

</body>
</html>
`;
}
