export const ROUTE_PROFILES = {
  motorower: {
    id: 'motorower',
    name: 'Motorower 50 cc',
    icon: '🛵',
    maxSpeed: 45,
    avoidHighways: true,
    avoidMotorways: true,
    preferLocal: true
  },

  motocykl: {
    id: 'motocykl',
    name: 'Motocykl',
    icon: '🏍️',
    maxSpeed: null,
    avoidHighways: false,
    avoidMotorways: false,
    preferLocal: false
  },

  cross: {
    id: 'cross',
    name: 'Cross / Enduro',
    icon: '🌲',
    maxSpeed: null,
    avoidHighways: true,
    avoidMotorways: true,
    preferLocal: true
  },

  samochod: {
    id: 'samochod',
    name: 'Samochód',
    icon: '🚗',
    maxSpeed: null,
    avoidHighways: false,
    avoidMotorways: false,
    preferLocal: false
  }
};

export const DEFAULT_ROUTE_PROFILE = 'motorower';
