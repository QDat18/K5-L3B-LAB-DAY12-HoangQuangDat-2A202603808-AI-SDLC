import { round3 } from './math.js';

export class Player {
  constructor(tuning, pos = [0, 0, 0], carried = 0, flames = 3) {
    this.tuning = tuning;
    this.pos = [...pos]; // [x, y, z]
    this.carried = carried;
    this.flames = flames;
    this.invuln_ticks = 0;
    this.pulse_cooldown_ticks = 0;
  }

  toJSON() {
    return {
      pos: [round3(this.pos[0]), round3(this.pos[1]), round3(this.pos[2])],
      flames: this.flames,
      carried: this.carried
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
  constructor(id, pos, state = "chase") {
    this.id = id;
    this.pos = [...pos];
    this.state = state; // "chase", "stunned", "patrol"
    this.stunned_ticks = 0;
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
  constructor(id, pos) {
    this.id = id;
    this.pos = [...pos];
    this.active = true;
  }
}

