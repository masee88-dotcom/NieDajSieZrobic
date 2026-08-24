export function getNextNavigationStep(location, steps, currentIndex = 0) {
  if (!location || !Array.isArray(steps) || !steps.length) {
    return { index: currentIndex, step: null, distance: null, arrived: false };
  }

  let index = Math.max(0, Math.min(currentIndex, steps.length - 1));
  let step = steps[index];
  let distance = distanceToStep(location, step);

  while (index < steps.length - 1 && shouldAdvance(step, distance)) {
    index += 1;
    step = steps[index];
    distance = distanceToStep(location, step);
  }

  const arrived =
    (step?.type === 'arrive' || index === steps.length - 1) &&
    distance < 40;

  return { index, step, distance, arrived };
}

function shouldAdvance(step, distance) {
  if (!step || !Number.isFinite(distance)) return false;
  if (step.type === 'arrive') return false;
  if (step.type === 'depart') return distance < 80;
  return distance < 25;
}

export function getInstructionDistance(distanceMeters) {
  if (!Number.isFinite(distanceMeters)) return '';

  if (distanceMeters < 1000) {
    const rounded = Math.max(10, Math.round(distanceMeters / 10) * 10);
    return `${rounded} metrów`;
  }

  return `${(distanceMeters / 1000).toFixed(1).replace('.', ',')} km`;
}

export function getDistanceToStep(location, step) {
  return distanceToStep(location, step);
}

export function isOffRoute(distanceMeters, thresholdMeters = 60) {
  return Number.isFinite(distanceMeters) && distanceMeters > thresholdMeters;
}

export function shouldReroute(now, lastReroute = 0, minIntervalMs = 5000) {
  return Number.isFinite(now) && now - lastReroute >= minIntervalMs;
}

function distanceToStep(location, step) {
  if (!location || !step || !Array.isArray(step.location) || step.location.length < 2) {
    return Infinity;
  }

  return calculateDistance(
    location.latitude,
    location.longitude,
    step.location[1],
    step.location[0]
  ) * 1000;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}
