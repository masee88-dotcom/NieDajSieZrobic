export async function getRoute(
  startLat,
  startLon,
  endLat,
  endLon,
  options = {}
) {
  try {
    const mode = options.mode || 'auto';

    let params =
      'overview=full' +
      '&geometries=geojson' +
      '&steps=true' +
      '&annotations=true';

    if (mode === 'moped') {
      params += '&exclude=motorway';
    }

    // OSRM nie potrafi jeszcze wyznaczać prawdziwych tras terenowych.
    // ODKRYWCA nadal korzysta z dróg OSRM, ale omija autostrady.
    if (mode === 'explorer') {
      params += '&exclude=motorway';
    }

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${startLon},${startLat};${endLon},${endLat}?${params}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OSRM HTTP ${response.status}`);
    }

    const json = await response.json();

    if (
      json.code !== 'Ok' ||
      !Array.isArray(json.routes) ||
      !json.routes.length
    ) {
      return null;
    }

    const route = json.routes[0];
    const steps = [];

    if (Array.isArray(route.legs)) {
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
    }

    return {
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry?.coordinates || [],
      steps,
      mode
    };
  } catch (error) {
    console.log('CrossNav routing error:', error);
    return null;
  }
}

function getInstruction(maneuver, roadName) {
  const type = maneuver.type || '';
  const modifier = maneuver.modifier || '';
  const road = roadName ? ` na ${roadName}` : '';

  if (type === 'depart') return 'Ruszaj';
  if (type === 'arrive') return 'Dojechałeś do celu';

  if (type === 'roundabout' || type === 'rotary') {
    if (Number.isFinite(maneuver.exit)) {
      return `Na rondzie zjedź ${ordinalExit(maneuver.exit)} zjazdem${road}`;
    }
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

function ordinalExit(number) {
  const values = {
    1: 'pierwszym',
    2: 'drugim',
    3: 'trzecim',
    4: 'czwartym',
    5: 'piątym',
    6: 'szóstym',
    7: 'siódmym',
    8: 'ósmym',
    9: 'dziewiątym',
    10: 'dziesiątym'
  };

  return values[number] || `${number}.`;
}
