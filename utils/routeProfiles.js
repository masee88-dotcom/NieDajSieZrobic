export const ROUTE_PROFILES = {

  motorower: {
    id: 'motorower',
    name: 'Motorower 50 cc',
    icon: '🛵',
    maxSpeed: 45,
    avoidMotorway: true,
    avoidTrunk: true,
    preferLocal: true
  },

  motocykl: {
    id: 'motocykl',
    name: 'Motocykl',
    icon: '🏍️',
    maxSpeed: null,
    avoidMotorway: false,
    avoidTrunk: false,
    preferLocal: false
  },

  cross: {
    id: 'cross',
    name: 'Cross / Enduro',
    icon: '🌲',
    maxSpeed: null,
    avoidMotorway: true,
    avoidTrunk: true,
    preferLocal: true,
    preferUnpaved: true
  },

  samochod: {
    id: 'samochod',
    name: 'Samochód',
    icon: '🚗',
    maxSpeed: null,
    avoidMotorway: false,
    avoidTrunk: false,
    preferLocal: false
  }

};

export const DEFAULT_ROUTE_PROFILE =
  'motorower';
