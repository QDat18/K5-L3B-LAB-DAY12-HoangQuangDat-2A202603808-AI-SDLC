// Math helpers on XZ plane (ground plane, Y is vertical)
export function round3(num) {
  return Math.round((num + Number.EPSILON) * 1000) / 1000;
}

export function distXZ(posA, posB) {
  const dx = posA[0] - posB[0];
  const dz = posA[2] - posB[2];
  return Math.sqrt(dx * dx + dz * dz);
}

export function distXZSq(posA, posB) {
  const dx = posA[0] - posB[0];
  const dz = posA[2] - posB[2];
  return dx * dx + dz * dz;
}

// Transform input move [x, z] by cam_yaw_deg (degrees)
// Contract:
// theta = cam_yaw_deg * pi / 180
// x' = x*cos(theta) + z*sin(theta)
// z' = -x*sin(theta) + z*cos(theta)
// If vector length > 1, normalize to 1
export function transformMove(move, cam_yaw_deg = 0) {
  const x = move[0] || 0;
  const z = move[1] || 0;
  if (x === 0 && z === 0) return [0, 0];

  const theta = (cam_yaw_deg * Math.PI) / 180.0;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  let nx = x * cosT + z * sinT;
  let nz = -x * sinT + z * cosT;

  const len = Math.sqrt(nx * nx + nz * nz);
  if (len > 1.0) {
    nx /= len;
    nz /= len;
  }
  return [nx, nz];
}

