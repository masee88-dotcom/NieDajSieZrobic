export function getMapHtml(latitude, longitude, route = null) {
  const routes = Array.isArray(route?.routes) && route.routes.length ? route.routes : (route?.geometry?.length ? [route] : []);
  const routeJson = JSON.stringify(routes.map((item, index) => ({ geometry: item.geometry || [], distance: item.distance || 0, duration: item.duration || 0, index })));
  return `
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>html,body,#map{width:100%;height:100%;margin:0;padding:0}#gpsInfo{position:absolute;top:15px;left:15px;z-index:9999;background:white;padding:10px 14px;border-radius:14px;font-size:17px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,.25)}#direction{position:absolute;top:70px;left:50%;transform:translateX(-50%);z-index:9999;width:58px;height:58px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;font-size:34px;box-shadow:0 2px 8px rgba(0,0,0,.25)}.crossnav-motorcycle{background:transparent!important;border:0!important}.crossnav-motorcycle-inner{width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:34px;transform-origin:center center;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))}.route-panel{position:absolute;left:10px;right:10px;bottom:12px;z-index:9999;background:white;border-radius:16px;padding:10px;box-shadow:0 2px 10px rgba(0,0,0,.25);font-family:Arial,sans-serif}.route-option{padding:10px;border-radius:12px;margin:4px 0;background:#f1f1f1;font-size:15px;font-weight:700}.route-option.active{background:#dbeafe}.route-time{font-size:16px}.route-meta{font-size:13px;color:#555;margin-top:3px}</style>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" /><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script></head><body>
<div id="map"></div><div id="gpsInfo">📡 GPS</div><div id="direction">⬆️</div><div id="routePanel" class="route-panel" style="display:none"></div>
<script>
const startLat=${latitude},startLon=${longitude},routeData=${routeJson};
const map=L.map('map',{zoomControl:false}).setView([startLat,startLon],13);L.control.zoom({position:'bottomright'}).addTo(map);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
let routeLines=[],selectedRoute=0;
function routeLabel(i){return i===0?'🥇 Najszybsza':'🛣️ Alternatywna '+i}
function formatDuration(sec){const m=Math.max(1,Math.round(sec/60));const h=Math.floor(m/60),r=m%60;return h?(r?(h+' godz. '+r+' min'):(h+' godz.')):(m+' min')}
function formatKm(m){return (m/1000).toFixed(1)+' km'}
function selectRoute(i){selectedRoute=i;renderRoutes();if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify({type:'ROUTE_SELECTED',index:i}));}
function renderRoutes(){
 routeLines.forEach(l=>map.removeLayer(l));routeLines=[];
 routeData.forEach((r,i)=>{if(!r.geometry?.length)return;const pts=r.geometry.map(p=>[p[1],p[0]]);const line=L.polyline(pts,{color:i===selectedRoute?'#1976d2':'#777',weight:i===selectedRoute?7:4,opacity:i===selectedRoute?.9:.55}).addTo(map);line.on('click',()=>selectRoute(i));routeLines.push(line)});
 const panel=document.getElementById('routePanel');if(!routeData.length){panel.style.display='none';return}panel.style.display='block';panel.innerHTML=routeData.map((r,i)=>'<div class="route-option '+(i===selectedRoute?'active':'')+'" data-route="'+i+'">'+routeLabel(i)+'<div class="route-time">'+formatDuration(r.duration)+' · '+formatKm(r.distance)+'</div><div class="route-meta">Kliknij, aby wybrać tę trasę</div></div>').join('');panel.querySelectorAll('.route-option').forEach(el=>el.onclick=()=>selectRoute(Number(el.dataset.route)));
 const all=[];routeData.forEach(r=>(r.geometry||[]).forEach(p=>all.push([p[1],p[0]])));if(all.length)try{map.fitBounds(L.latLngBounds(all),{padding:[60,120],maxZoom:13})}catch(e){}
}
renderRoutes();
const motorcycleIcon=L.divIcon({className:'crossnav-motorcycle',html:'<div id="motorcycle" class="crossnav-motorcycle-inner">🏍️</div>',iconSize:[40,40],iconAnchor:[20,20]});let userMarker=L.marker([startLat,startLon],{icon:motorcycleIcon}).addTo(map);let firstGpsUpdate=true;
window.updateCrossNavGPS=function(message){try{const d=JSON.parse(message),lat=d.latitude,lon=d.longitude;if(typeof lat!=='number'||typeof lon!=='number')return;userMarker.setLatLng([lat,lon]);const gps=document.getElementById('gpsInfo');if(gps)gps.innerText=typeof d.speed==='number'&&d.speed>=0?'🏍️ '+Math.round(d.speed*3.6)+' km/h':'📡 GPS';if(typeof d.heading==='number'&&d.heading>=0){const m=document.getElementById('motorcycle');if(m)m.style.transform='rotate('+d.heading+'deg)';const dir=document.getElementById('direction');if(dir){dir.style.transform='translateX(-50%) rotate('+d.heading+'deg)';dir.innerText='⬆️'}}const c=map.getCenter();if(firstGpsUpdate||map.distance(c,[lat,lon])>250){map.panTo([lat,lon],{animate:false});firstGpsUpdate=false}}catch(e){console.log('GPS MAP ERROR',e)}};
</script></body></html>`;
}
