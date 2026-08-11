export const EXPLORER_MODES = {
  normal: {
    id: 'normal',
    name: 'Normalna trasa',
    icon: '🧭',
    description: 'Najszybsza dostępna trasa'
  },

  explorer: {
    id: 'explorer',
    name: 'Odkrywca',
    icon: '🌲',
    description: 'Drogi lokalne i mniej uczęszczane'
  },

  terrain: {
    id: 'terrain',
    name: 'Teren',
    icon: '🏕️',
    description: 'Preferuj drogi gruntowe i terenowe'
  }
};

export const DEFAULT_EXPLORER_MODE = 'normal';
