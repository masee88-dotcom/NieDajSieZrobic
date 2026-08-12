export async function getRoute(
  startLat,
  startLon,
  endLat,
  endLon,
  options = {}
) {

  try {

    const mode =
      options.mode || 'auto';


    let params =
      'overview=full' +
      '&geometries=geojson' +
      '&steps=true' +
      '&annotations=true';


    // ==========================================
    // TRYB MOTOROWER
    // ==========================================

    if (mode === 'moped') {

      params +=
        '&exclude=motorway';

    }


    // ==========================================
    // TRYB ODKRYWCA
    // ==========================================

    if (mode === 'explorer') {

      params +=
        '&exclude=motorway';

    }


    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${startLon},${startLat};` +
      `${endLon},${endLat}?${params}`;


    console.log(
      'CrossNav routing mode:',
      mode
    );


    console.log(
      'CrossNav routing URL:',
      url
    );


    const response =
      await fetch(url);


    if (!response.ok) {

      throw new Error(
        `OSRM HTTP ${response.status}`
      );

    }


    const json =
      await response.json();


    if (
      json.code !== 'Ok' ||
      !json.routes ||
      !json.routes.length
    ) {

      return null;

    }


    const route =
      json.routes[0];


    const steps = [];


    // ==========================================
    // MANEWRY
    // ==========================================

    if (
      Array.isArray(route.legs)
    ) {

      for (
        const leg of route.legs
      ) {

        if (
          !Array.isArray(
            leg.steps
          )
        ) {

          continue;

        }


        for (
          const step of leg.steps
        ) {

          const maneuver =
            step.maneuver || {};


          steps.push({

            distance:
              step.distance || 0,

            duration:
              step.duration || 0,

            name:
              step.name || '',

            instruction:
              getInstruction(
                maneuver,
                step.name
              ),

            type:
              maneuver.type || '',

            modifier:
              maneuver.modifier || '',

            location:
              maneuver.location || null

          });

        }

      }

    }


    return {

      distance:
        route.distance,

      duration:
        route.duration,

      geometry:
        route.geometry.coordinates,

      steps,

      mode

    };


  } catch (error) {

    console.log(
      'CrossNav routing error:',
      error
    );

    return null;

  }

}


// ==========================================
// INSTRUKCJE
// ==========================================

function getInstruction(
  maneuver,
  roadName
) {

  const type =
    maneuver.type || '';

  const modifier =
    maneuver.modifier || '';


  const road =
    roadName
      ? ` na ${roadName}`
      : '';


  if (
    type === 'depart'
  ) {

    return 'Ruszaj';

  }


  if (
    type === 'arrive'
  ) {

    return 'Dojechałeś do celu';

  }


  if (
    type === 'roundabout' ||
    type === 'rotary'
  ) {

    return 'Wjedź na rondo';

  }


  if (
    type === 'uturn'
  ) {

    return 'Zawróć';

  }


  if (
    modifier === 'left'
  ) {

    return `Skręć w lewo${road}`;

  }


  if (
    modifier === 'right'
  ) {

    return `Skręć w prawo${road}`;

  }


  if (
    modifier === 'slight left'
  ) {

    return `Lekko w lewo${road}`;

  }


  if (
    modifier === 'slight right'
  ) {

    return `Lekko w prawo${road}`;

  }


  if (
    modifier === 'sharp left'
  ) {

    return `Ostry skręt w lewo${road}`;

  }


  if (
    modifier === 'sharp right'
  ) {

    return `Ostry skręt w prawo${road}`;

  }


  return `Jedź dalej${road}`;

}
