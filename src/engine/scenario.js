export class FormatError extends Error {
  constructor(message) {
    super(message);
    this.name = "FormatError";
  }
}

export function parseInputs(jsonString) {
  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (err) {
    throw new FormatError("Inputs file is not valid JSON: " + err.message);
  }

  if (typeof data !== "object" || data === null || !Array.isArray(data.frames)) {
    throw new FormatError("Inputs must contain a 'frames' array");
  }

  let lastTick = -1;
  for (let i = 0; i < data.frames.length; i++) {
    const f = data.frames[i];
    if (typeof f.tick !== "number" || !Number.isInteger(f.tick) || f.tick < 0) {
      throw new FormatError(`Frame ${i} has invalid tick`);
    }
    if (f.tick <= lastTick) {
      throw new FormatError(`Ticks must strictly increase: frame ${i} tick ${f.tick} <= ${lastTick}`);
    }
    lastTick = f.tick;

    if (f.move !== undefined) {
      if (!Array.isArray(f.move) || f.move.length !== 2 || typeof f.move[0] !== "number" || typeof f.move[1] !== "number") {
        throw new FormatError(`Frame ${i} has invalid 'move' array`);
      }
    }
    if (f.cam_yaw_deg !== undefined && typeof f.cam_yaw_deg !== "number") {
      throw new FormatError(`Frame ${i} has invalid 'cam_yaw_deg'`);
    }
    for (const action of ["jump", "interact", "pulse", "dash", "pause"]) {
      if (f[action] !== undefined && typeof f[action] !== "boolean") {
        throw new FormatError(`Frame ${i} has invalid '${action}' flag`);
      }
    }
  }

  return data;
}

export function parseScenario(jsonString) {
  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (err) {
    throw new FormatError("Scenario file is not valid JSON: " + err.message);
  }

  if (typeof data !== "object" || data === null) {
    throw new FormatError("Scenario must be an object");
  }

  if (data.player !== undefined) {
    if (typeof data.player !== "object" || data.player === null) {
      throw new FormatError("Scenario 'player' must be an object");
    }
    if (data.player.pos !== undefined && (!Array.isArray(data.player.pos) || data.player.pos.length !== 3)) {
      throw new FormatError("Scenario 'player.pos' must be array of 3 numbers");
    }
  }

  if (data.motes !== undefined && !Array.isArray(data.motes)) {
    throw new FormatError("Scenario 'motes' must be an array");
  }

  if (data.shades !== undefined && !Array.isArray(data.shades)) {
    throw new FormatError("Scenario 'shades' must be an array");
  }

  if (data.lanterns !== undefined && !Array.isArray(data.lanterns)) {
    throw new FormatError("Scenario 'lanterns' must be an array");
  }

  if (data.drifters !== undefined && !Array.isArray(data.drifters)) {
    throw new FormatError("Scenario 'drifters' must be an array");
  }

  if (data.charms !== undefined && !Array.isArray(data.charms)) {
    throw new FormatError("Scenario 'charms' must be an array");
  }

  return data;
}
