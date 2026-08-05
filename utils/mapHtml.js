export function getMapHtml(latitude, longitude) {
return `
<!DOCTYPE html>
<html>

<head>

<meta name="viewport"
content="width=device-width, initial-scale=1.0">

<link rel="stylesheet"
href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<style>

html,body,#map{
margin:0;
padding:0;
height:100%;
width:100%;
}

.leaflet-control-attribution{
display:none;
}

</style>

</head>

<body>

<div id="map"></div>

<script>

const map=L.map('map').setView(
[${latitude},${longitude}],16
);

L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
maxZoom:19
}
).addTo(map);

const marker=L.marker(
[${latitude},${longitude}]
).addTo(map);

marker.bindPopup("📍 Jesteś tutaj");

map.locate({
setView:false,
watch:true,
enableHighAccuracy:true
});

map.on('locationfound',function(e){

marker.setLatLng(e.latlng);

});

</script>

</body>

</html>
`;
}
