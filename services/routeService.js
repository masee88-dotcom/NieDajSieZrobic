export async function getRoute(
  startLat,
  startLon,
  endLat,
  endLon,
  options = {}
) {
  try {
    const mode = options.mode || 'auto';
    const alternatives = options.alternatives !== false;

    let params =
      'overview=full' +
      '&geometries=geojson' +
      '&steps=true' +
      '&annotations=true' +
      `&alternatives=${alternatives ? 'true' : 'false'}` +
      '&continue_straight=false';

    if (mode === 'moped' || mode === 'explorer') {
      params += '&exclude=motorway';
    }

    if (Number.isFinite(options.heading) && options.heading >= 0 && options.heading <= 360) {
      params += `&bearings=${Math.round(options.heading)},`;
    }

    const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?${params}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`OSRM HTTP ${response.status}`);

    const json = await response.json();
    if (json.code !== 'Ok' || !Array.isArray(json.routes) || !json.routes.length) return null;

    const routes = json.routes.map((route) => {
      const distance = Number(route.distance) || 0;
      const duration = Number(route.duration) || 0;
      return {
        distance,
        duration,
        distanceLabel: formatDistance(distance),
        durationLabel: formatDuration(duration),
        etaLabel: formatEta(duration),
        geometry: route.geometry?.coordinates || [],
        steps: parseSteps(route),
        mode
      };
    });

    routes.sort((a, b) => a.duration - b.duration);

    return {
      ...routes[0],
      alternatives: routes.slice(1),
      routes
    };
  } catch (error) {
    console.log('CrossNav routing error:', error);
    return null;
  }
}

function parseSteps(route) {
  const steps = [];
  if (!Array.isArray(route.legs)) return steps;

  for (const leg of route.legs) {
    if (!Array.isArray(leg.steps)) continue;
    for (const step of leg.steps) {
      const maneuver = step.maneuver || {};
      const exit = maneuver.exit;
      steps.push({
        distance: Number(step.distance) || 0,
        duration: Number(step.duration) || 0,
        name: step.name || '',
        instruction: getInstruction(maneuver, step.name),
        type: maneuver.type || '',
        modifier: maneuver.modifier || '',
        location: maneuver.location || null,
        exit: Number.isFinite(exit) ? exit : null
      });
    }
  }
  return steps;
}

function getInstruction(maneuver, roadName) {
  const type = maneuver.type || '';
  const modifier = maneuver.modifier || '';
  const road = roadName ? ` na ${roadName}` : '';
  if (type === 'depart') return 'Ruszaj';
  if (type === 'arrive') return 'Dojechałeś do celu';
  if (type === 'roundabout' || type === 'rotary') {
    if (Number.isFinite(maneuver.exit)) return `Na rondzie zjedź ${ordinalExit(maneuver.exit)} zjazdem${road}`;
    return `Wjedź na rondo${road}`;
  }
  if (type === 'uturn') return `Zawróć${road}`;
  if (modifier === 'left') return `Skręć w lewo${road}`;
  if (modifier === 'right') return `Skręć w prawo${road}`;
  if (modifier === 'slight left') return `Lekko w lewo${road}`;
  if (modifier === 'slight right') return `Lekko w prawo${road}`;
  if (modifier === 'sharp left') return `Ostry skręt w lewo${road}`;
  if (modifier === 'sharp right') return `Ostry skręt w prawo${road}`;
  return `Jedź dalej${road}`;
}

function formatDistance(meters) {
  const km = meters / 1000;
  return km < 1 ? `${Math.round(meters)} m` : `${km.toFixed(1)} km`;
}

function formatDuration(seconds) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins} min`;
  return mins ? `${hours} godz. ${mins} min` : `${hours} godz.`;
}

function formatEta(seconds) {
  const arrival = new Date(Date.now() + Math.max(0, seconds) * 1000);
  return arrival.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

function ordinalExit(number) {
  const values = { 1: 'pierwszym', 2: 'drugim', 3: 'trzecim', 4: 'czwartym', 5: 'piątym', 6: 'szóstym', 7: 'siódmym', 8: 'ósmym', 9: 'dziewiątym', 10: 'dziesiątym' };
  return values[number] || `${number}.`;
}
