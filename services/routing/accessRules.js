export function isAccessAllowed(tags = {}) {

  if (
    tags.access === 'no' ||
    tags.access === 'private'
  ) {
    return false;
  }

  if (
    tags.moped === 'no' ||
    tags.moped === 'private'
  ) {
    return false;
  }

  if (
    tags.motor_vehicle === 'no' ||
    tags.motor_vehicle === 'private'
  ) {
    return false;
  }

  if (tags.motorroad === 'yes') {
    return false;
  }

  return true;
}
