import { round3 } from './math.js';

export class Player {
  constructor(tuning, pos = [0, 0, 0], carried = 0, flames = 3) {
    this.tuning = tuning;
    this.pos = [...pos]; // [x, y, z]
    this.vel = [0, 0, 0]; // [vx, vy, vz]
    this.carried = carried;
    this.flames = flames;
    this.grounded = true;

    this.invuln_ticks = 0;
    this.dash_ticks = 0;
    this.dash_dir = [0, 1];
    this.dash_cd_ticks = 0;
    this.pulse_cd_ticks = 0;
    this.charm_ticks = 0;
    this.facing_yaw_deg = 0;

    // Launch pad airborne lock
    this.is_launched = false;

    // Fall respawn delay
    this.fall_wait_ticks = 0;
  }

  toJSON() {
    return {
      pos: [round3(this.pos[0]), round3(this.pos[1]), round3(this.pos[2])],
      vel: [round3(this.vel[0]), round3(this.vel[1]), round3(this.vel[2])],
      flames: this.flames,
      carried: this.carried,
      grounded: this.grounded,
      invuln: this.invuln_ticks > 0,
      dash_cd_s: round3(this.dash_cd_ticks / 60),
      pulse_cd_s: round3(this.pulse_cd_ticks / 60),
      charm_s: round3(this.charm_ticks / 60)
    };
  }
}

export class Lantern {
  constructor(id, pos, deposited = 0, lit = false) {
    this.id = id;
    this.pos = [...pos];
    this.deposited = deposited;
    this.lit = lit;
  }

  toJSON() {
    return {
      id: this.id,
      pos: [round3(this.pos[0]), round3(this.pos[1]), round3(this.pos[2])],
      lit: this.lit,
      deposited: this.deposited
    };
  }
}

export class Shade {
  constructor(id, pos, state = "wander") {
    this.id = id;
    this.pos = [...pos];
    // States: spawning, wander, chase, recoil, stunned
    this.state = state;
    this.state_ticks_left = 0;
    this.push_ticks_left = 0;
    this.push_dir = [1, 0];
    this.recoil_dir = [0, 0];
    this.safe_eject_ticks = 0;
  }

  toJSON() {
    return {
      id: this.id,
      pos: [round3(this.pos[0]), round3(this.pos[1]), round3(this.pos[2])],
      state: this.state
    };
  }
}

export class Mote {
  constructor(id, pos, kind = "random", ttl_ticks = 0) {
    this.id = id;
    this.pos = [...pos];
    this.kind = kind; // "random" | "dropped"
    this.ttl_ticks = ttl_ticks;
    this.active = true;
    this.can_pickup = true; // Dropped motes cannot be picked on the exact tick dropped
  }

  toJSON() {
    return {
      id: this.id,
      pos: [round3(this.pos[0]), round3(this.pos[1]), round3(this.pos[2])],
      kind: this.kind,
      ttl_s: this.kind === "dropped" ? round3(this.ttl_ticks / 60) : null
    };
  }
}

export class Drifter {
  constructor(id, pos, state = "idle", stolen = 0) {
    this.id = id;
    this.pos = [...pos];
    // States: idle, chase, flee, removed
    this.state = state;
    this.stolen = stolen;
    this.flee_ticks = 0;
    this.drop_ticks = 0;
    this.has_stolen = false;
  }

  toJSON() {
    return {
      id: this.id,
      pos: [round3(this.pos[0]), round3(this.pos[1]), round3(this.pos[2])],
      state: this.state,
      stolen: this.stolen
    };
  }
}

export class Charm {
  constructor(id, pos, available = true, respawn_ticks = 0) {
    this.id = id;
    this.pos = [...pos];
    this.available = available;
    this.respawn_ticks = respawn_ticks;
  }

  toJSON() {
    return {
      id: this.id,
      available: this.available,
      respawn_s: this.available ? 0 : round3(this.respawn_ticks / 60)
    };
  }
}
