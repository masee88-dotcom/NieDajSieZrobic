export const ROAD_RULES = {

  motorway: {
    name: 'Autostrada',
    motorower: false,
    explorer: false
  },

  motorway_link: {
    name: 'Wjazd na autostradę',
    motorower: false,
    explorer: false
  },

  trunk: {
    name: 'Droga główna',
    motorower: true,
    explorer: false
  },

  primary: {
    name: 'Droga krajowa',
    motorower: true,
    explorer: false
  },

  secondary: {
    name: 'Droga wojewódzka',
    motorower: true,
    explorer: true
  },

  tertiary: {
    name: 'Droga lokalna',
    motorower: true,
    explorer: true
  },

  residential: {
    name: 'Droga osiedlowa',
    motorower: true,
    explorer: true
  },

  unclassified: {
    name: 'Droga lokalna',
    motorower: true,
    explorer: true
  },

  service: {
    name: 'Droga dojazdowa',
    motorower: true,
    explorer: true
  },

  track: {
    name: 'Droga gruntowa',
    motorower: true,
    explorer: true
  },

  path: {
    name: 'Ścieżka',
    motorower: false,
    explorer: false
  },

  footway: {
    name: 'Droga piesza',
    motorower: false,
    explorer: false
  },

  pedestrian: {
    name: 'Strefa piesza',
    motorower: false,
    explorer: false
  },

  steps: {
    name: 'Schody',
    motorower: false,
    explorer: false
  }

};


export function isRoadAllowed(
  highway,
  mode = 'motorower'
) {

  const rule = ROAD_RULES[highway];

  if (!rule) {
    return true;
  }

  if (mode === 'explorer') {
    return rule.explorer;
  }

  return rule.motorower;
}


export function getRoadName(highway) {

  const rule = ROAD_RULES[highway];

  if (!rule) {
    return 'Droga';
  }

  return rule.name;
}
