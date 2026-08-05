export async function getRoute(startLat,startLon,endLat,endLon){

try{

const response=await fetch(

`https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`

);

const json=await response.json();

if(!json.routes||!json.routes.length){

return null;

}

const route=json.routes[0];

return{

distance:route.distance,
duration:route.duration,
geometry:route.geometry.coordinates

};

}catch(e){

console.log(e);

return null;

}

}
