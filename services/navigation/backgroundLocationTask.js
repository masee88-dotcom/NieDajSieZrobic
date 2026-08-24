import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

export const CROSSNAV_BACKGROUND_LOCATION_TASK = 'crossnav-background-location';

TaskManager.defineTask(CROSSNAV_BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.log('BACKGROUND LOCATION ERROR:', error);
    return;
  }
  const locations = data?.locations;
  if (!Array.isArray(locations) || !locations.length) return;
  const latest = locations[locations.length - 1];
  console.log('CROSSNAV BACKGROUND GPS:', latest?.coords?.latitude, latest?.coords?.longitude);
});

export async function startBackgroundLocation() {
  const started = await Location.hasStartedLocationUpdatesAsync(CROSSNAV_BACKGROUND_LOCATION_TASK);
  if (started) return true;
  await Location.startLocationUpdatesAsync(CROSSNAV_BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 1000,
    distanceInterval: 5,
    foregroundService: {
      notificationTitle: 'CrossNav',
      notificationBody: 'Nawigacja działa w tle',
      notificationColor: '#1976d2',
    },
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
  });
  return true;
}

export async function stopBackgroundLocation() {
  const started = await Location.hasStartedLocationUpdatesAsync(CROSSNAV_BACKGROUND_LOCATION_TASK);
  if (started) await Location.stopLocationUpdatesAsync(CROSSNAV_BACKGROUND_LOCATION_TASK);
}
