export const CONFIG = {
  LANE_WIDTH: 4,
  TOTAL_LANES: 3,
  MOVE_SPEED_START: 0.8,
  SPEED_INCREMENT: 0.0001,
  PLAYER_Z: 5,
  SPAWN_INTERVAL: 100, // frames
  MIN_SPAWN_DIST: 50,
  MAX_SPAWN_DIST: 150,
  ROAD_LENGTH: 1000,
  COIN_SPAWN_CHANCE: 0.01,
  THEMES: {
    CITY: { sky: 0x87ceeb, fog: 0x87ceeb, ground: 0x113311, buildings: 0x444444 },
    DESERT: { sky: 0xffcc88, fog: 0xffcc88, ground: 0xccaa66, buildings: 0x885522 },
    NIGHT: { sky: 0x050510, fog: 0x050510, ground: 0x0a0a20, buildings: 0x111122 },
    CYBER: { sky: 0x220044, fog: 0x220044, ground: 0x110022, buildings: 0xff00ff }
  },
  CAR_MODELS: {
    SPORT: { name: 'BMW M4', color: 0x0066ff, speedBonus: 0.1 },
    SUPER: { name: 'Audi R8', color: 0xff3300, speedBonus: 0.2 },
    OFFROAD: { name: 'Thar 4x4', color: 0x222222, speedBonus: -0.1 },
    CLASSIC: { name: 'Vintage', color: 0xffcc00, speedBonus: 0 },
    HYPER: { name: 'Hyper X', color: 0xffffff, speedBonus: 0.3 }
  },
  COLORS: {
    PLAYER: 0xff0000,
    ROAD: 0x333333,
    LANE: 0xffffff,
    COIN: 0xffd700,
    TRAFFIC: [0x2288ff, 0x55ff55, 0xffff00, 0xff00ff, 0x00ffff]
  }
};
