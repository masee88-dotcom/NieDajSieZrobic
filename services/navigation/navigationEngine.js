export function getNextNavigationStep(
  location,
  steps,
  currentIndex = 0
) {
  if (
    !location ||
    !Array.isArray(steps) ||
    !steps.length
  ) {
    return {
      index: currentIndex,
      step: null,
      distance: null,
      arrived: false
    };
  }

  let index = Math.max(
    0,
    Math.min(
      currentIndex,
      steps.length - 1
    )
  );

  let step = steps[index];

  let distance = distanceToStep(
    location,
    step
  );

  /*
   * Automatycznie przechodzimy
   * do kolejnego manewru.
   */
  while (
    index < steps.length - 1 &&
    distance < 35
  ) {
    index++;

    step = steps[index];

    distance = distanceToStep(
      location,
      step
    );
  }

  const arrived =
    step?.type === 'arrive' &&
    distance < 40;

  return {
    index,
    step,
    distance,
    arrived
  };
}


function distanceToStep(
  location,
  step
) {
  if (
    !location ||
    !step ||
    !Array.isArray(step.location) ||
    step.location.length < 2
  ) {
    return Infinity;
  }

  return calculateDistance(
    location.latitude,
    location.longitude,
    step.location[1],
    step.location[0]
  ) * 1000;
}


function calculateDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const R = 6371;

  const dLat =
    toRadians(lat2 - lat1);

  const dLon =
    toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}


function toRadians(degrees) {
  return (
    degrees *
    Math.PI /
    180
  );
}
