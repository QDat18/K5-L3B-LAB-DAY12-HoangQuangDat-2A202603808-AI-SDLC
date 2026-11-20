import { round3 } from './math.js';

// Helper to generate circular points
function circlePoints(count, radius, startDeg = 0, stepDeg = null, centerX = 0, centerZ = 0, y = 0) {
  const points = [];
  const step = stepDeg !== null ? stepDeg : (360 / count);
  for (let i = 0; i < count; i++) {
    const deg = startDeg + i * step;
    const rad = (deg * Math.PI) / 180.0;
    const x = round3(centerX + radius * Math.cos(rad));
    const z = round3(centerZ + radius * Math.sin(rad));
    points.push([x, y, z]);
  }
  return points;
}

// ----------------------------------------------------
// NIGHT 1 — ĐẢO BẾN
// ----------------------------------------------------
export const NIGHT_1_MAP = {
  night: 1,
  duration_s: 300,
  start_pos: [0, 0, 0],
  start_yaw: 0,
  island_radius: 40.0,
  lanterns: [
    { id: "L1", pos: [0.0, 0.0, 25.0] },
    { id: "L2", pos: [23.8, 0.0, 7.7] },
    { id: "L3", pos: [14.7, 0.0, -20.2] },
    { id: "L4", pos: [-14.7, 0.0, -20.2] },
    { id: "L5", pos: [-23.8, 0.0, 7.7] }
  ],
  mote_spawns: [
    ...circlePoints(8, 12, 0, 45),
    ...circlePoints(16, 33, 0, 22.5)
  ],
  shade_spawns: circlePoints(12, 37, 15, 30),
  shade_interval_ticks: 480, // 8s
  shade_max: 6,
  shade_speed: 4.0,
  charms: [],
  has_drifters: false,
  getGroundHeight(x, z) {
    const d = Math.sqrt(x * x + z * z);
    if (d <= 40.0) return 0.0;
    return -100.0; // Void
  }
};

// ----------------------------------------------------
// NIGHT 2 — ĐẢO CAU
// ----------------------------------------------------
export const NIGHT_2_MAP = {
  night: 2,
  duration_s: 330,
  start_pos: [0, 0, 0],
  start_yaw: 0,
  islandA: { center: [0, 0, 0], radius: 28.0 },
  islandB: { center: [70, 0, 0], radius: 28.0 },
  bridge: { minX: 26.0, maxX: 44.0, minZ: -2.0, maxZ: 2.0 },
  jumpPads: [
    {
      pos: [20, 0, 18],
      radius: 1.0,
      target: [70, 0, 0],
      vy: 14.0,
      vHorizontal: 24.0
    },
    {
      pos: [50, 0, -18],
      radius: 1.0,
      target: [0, 0, 0],
      vy: 14.0,
      vHorizontal: 24.0
    }
  ],
  lanterns: [
    { id: "L1", pos: [0.0, 0.0, 20.0] },
    { id: "L2", pos: [17.0, 0.0, -10.0] },
    { id: "L3", pos: [-17.0, 0.0, -10.0] },
    { id: "L4", pos: [70.0, 0.0, 20.0] },
    { id: "L5", pos: [87.0, 0.0, -10.0] },
    { id: "L6", pos: [53.0, 0.0, -10.0] }
  ],
  mote_spawns: [
    ...circlePoints(4, 10, 0, 90, 0, 0),
    ...circlePoints(8, 22, 0, 45, 0, 0),
    ...circlePoints(4, 10, 0, 90, 70, 0),
    ...circlePoints(8, 22, 0, 45, 70, 0)
  ],
  shade_spawns: [
    ...circlePoints(8, 26, 22.5, 45, 0, 0),
    ...circlePoints(8, 26, 22.5, 45, 70, 0)
  ],
  shade_interval_ticks: 420, // 7s
  shade_max: 8,
  shade_speed: 4.0,
  charms: [
    { id: "C1", pos: [35.0, 0.0, 0.0] }
  ],
  has_drifters: true,
  drifter_interval_ticks: 1200,
  getGroundHeight(x, z) {
    const da = Math.sqrt(x * x + z * z);
    if (da <= 28.0) return 0.0;
    const db = Math.sqrt((x - 70) * (x - 70) + z * z);
    if (db <= 28.0) return 0.0;
    if (x >= 26.0 && x <= 44.0 && z >= -2.0 && z <= 2.0) return 0.0;
    return -100.0;
  }
};

// ----------------------------------------------------
// NIGHT 3 — ĐẢO CHUÔNG
// ----------------------------------------------------
export const NIGHT_3_MAP = {
  night: 3,
  duration_s: 360,
  start_pos: [0, 0, 0],
  start_yaw: 0,
  island_radius: 45.0,
  jumpPads: [
    {
      pos: [0, 3, 13],
      radius: 1.0,
      target: [0, 6, 0],
      vy: 12.0,
      vHorizontal: 8.0,
      dirZ: -1.0
    }
  ],
  bellTower: { center: [0, 6, 0], radius: 2.0, height: 8.0 },
  ramps: [
    { angleDeg: 30, rMin: 24, rMax: 30, width: 3.0 },
    { angleDeg: 150, rMin: 24, rMax: 30, width: 3.0 }
  ],
  lanterns: [
    { id: "L1", pos: [0.0, 6.0, 6.0] },
    { id: "L2", pos: [18.0, 3.0, 10.0] },
    { id: "L3", pos: [-18.0, 3.0, 10.0] },
    { id: "L4", pos: [35.0, 0.0, -10.0] },
    { id: "L5", pos: [-35.0, 0.0, -10.0] },
    { id: "L6", pos: [20.0, 0.0, -35.0] },
    { id: "L7", pos: [-20.0, 0.0, -35.0] }
  ],
  mote_spawns: [
    ...circlePoints(18, 34, 0, 20, 0, 0, 0.0),
    ...circlePoints(8, 18, 20, 20, 0, 0, 3.0),
    ...circlePoints(4, 5, 45, 90, 0, 0, 6.0)
  ],
  shade_spawns: circlePoints(16, 43, 0, 22.5),
  shade_interval_ticks: 360, // 6s
  shade_max: 10,
  shade_speed: 4.5,
  charms: [
    { id: "C1", pos: [30.0, 0.0, 25.0] },
    { id: "C2", pos: [-30.0, 0.0, 25.0] }
  ],
  has_drifters: true,
  drifter_interval_ticks: 1200,
  getGroundHeight(x, z, currentY = 0) {
    const d = Math.sqrt(x * x + z * z);
    if (d > 45.0) return -100.0;

    // Check Bell tower
    if (d <= 2.0 && currentY >= 5.5) {
      // Bell tower obstacle
    }

    // Check Tier 2 (Center disk R <= 8, Y = 6)
    if (d <= 8.0) {
      if (currentY >= 5.5) return 6.0;
    }

    // Check Tier 1 (Annulus 12 <= R <= 24, z > 0, Y = 3)
    if (d >= 12.0 && d <= 24.0 && z > 0) {
      if (currentY >= 2.5) return 3.0;
    }

    // Check Ramps at 30 deg and 150 deg (R from 24 to 30)
    for (const ramp of this.ramps) {
      const rad = (ramp.angleDeg * Math.PI) / 180.0;
      // Project (x, z) along ramp direction
      const projR = x * Math.cos(rad) + z * Math.sin(rad);
      const perpDist = Math.abs(-x * Math.sin(rad) + z * Math.cos(rad));
      if (projR >= 24.0 && projR <= 30.0 && perpDist <= ramp.width / 2) {
        // Linear slope: Y=3 at r=24, Y=0 at r=30
        const rampY = 3.0 * (30.0 - projR) / 6.0;
        return rampY;
      }
    }

    // Tier 0 (Whole island at Y = 0)
    return 0.0;
  }
};

export function getMapForNight(night = 1) {
  if (night === 2) return NIGHT_2_MAP;
  if (night === 3) return NIGHT_3_MAP;
  return NIGHT_1_MAP;
}
