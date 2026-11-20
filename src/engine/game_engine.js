import { TUNING, ISLAND_RADIUS, DEFAULT_LANTERNS, TICKS_PER_SEC } from './constants.js';
import { PRNG } from './rng.js';
import { round3, distXZ, transformMove } from './math.js';
import { Player, Lantern, Shade, Mote } from './entities.js';

export class GameEngine {
  constructor(options = {}) {
    this.seed = options.seed !== undefined ? options.seed : 42;
    this.rng = new PRNG(this.seed);
    this.tuning = { ...TUNING, ...(options.tuning || {}) };

    this.tick = 0;
    this.simTick = 0;
    this.state = "playing"; // "playing", "won", "lost"
    this.score = 0;
    this.durationS = this.tuning.night1_duration_s;
    this.timeLeftS = this.durationS;

    this.player = new Player(this.tuning, [0, 0, 0], 0, this.tuning.flames);
    this.lanterns = [];
    this.shades = [];
    this.motes = [];

    // Controller input states
    this.inputState = {
      move: [0, 0],
      cam_yaw_deg: 0,
      jump: false,
      interact: false,
      pulse: false
    };
    this.prevActions = {
      jump: false,
      interact: false,
      pulse: false
    };

    // Events and output buffer
    this.events = [];
    this.nextMoteId = 1;
    this.nextShadeId = 1;

    // Load initial scenario / defaults
    this.initDefaultWorld();
    if (options.scenario) {
      this.applyScenario(options.scenario);
    }
  }

  initDefaultWorld() {
    // 5 Lanterns
    this.lanterns = DEFAULT_LANTERNS.map(l => new Lantern(l.id, l.pos, 0, false));

    // Spawn 20 random motes across island
    for (let i = 0; i < 20; i++) {
      const angle = this.rng.next() * Math.PI * 2;
      const r = Math.sqrt(this.rng.next()) * (ISLAND_RADIUS - 5);
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      this.motes.push(new Mote(`M${this.nextMoteId++}`, [x, 0, z]));
    }

    // Spawn 2 initial shades
    for (let i = 0; i < 2; i++) {
      const angle = (i * Math.PI) + (Math.PI / 4);
      const r = 25;
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      this.shades.push(new Shade(`S${this.nextShadeId++}`, [x, 0, z], "chase"));
    }
  }

  applyScenario(scenario) {
    if (scenario.time_left_s !== undefined) {
      this.timeLeftS = scenario.time_left_s;
      this.durationS = scenario.time_left_s;
    }

    if (scenario.player) {
      if (scenario.player.pos) this.player.pos = [...scenario.player.pos];
      if (scenario.player.carried !== undefined) this.player.carried = scenario.player.carried;
      if (scenario.player.flames !== undefined) this.player.flames = scenario.player.flames;
    }

    if (scenario.lanterns) {
      for (const sl of scenario.lanterns) {
        let found = this.lanterns.find(l => l.id === sl.id);
        if (found) {
          if (sl.pos) found.pos = [...sl.pos];
          if (sl.deposited !== undefined) found.deposited = sl.deposited;
          if (sl.lit !== undefined) found.lit = sl.lit;
        } else {
          this.lanterns.push(new Lantern(sl.id, sl.pos || [0, 0, 0], sl.deposited || 0, sl.lit || false));
        }
      }
    }

    if (scenario.random_motes === false) {
      this.motes = [];
    }
    if (scenario.motes) {
      this.motes = scenario.motes.map((m, idx) => {
        const pos = Array.isArray(m) ? m : m.pos;
        const id = Array.isArray(m) ? `M${idx + 1}` : (m.id || `M${idx + 1}`);
        return new Mote(id, pos);
      });
    }

    if (scenario.random_shades === false) {
      this.shades = [];
    }
    if (scenario.shades) {
      this.shades = scenario.shades.map((s, idx) => {
        const id = s.id || `S${idx + 1}`;
        const pos = s.pos || [0, 0, 0];
        const state = s.state || "chase";
        return new Shade(id, pos, state);
      });
    }
  }

  applyInputFrame(frame) {
    if (!frame) return;
    if (frame.move !== undefined) this.inputState.move = [...frame.move];
    if (frame.cam_yaw_deg !== undefined) this.inputState.cam_yaw_deg = frame.cam_yaw_deg;
    if (frame.jump !== undefined) this.inputState.jump = frame.jump;
    if (frame.interact !== undefined) this.inputState.interact = frame.interact;
    if (frame.pulse !== undefined) this.inputState.pulse = frame.pulse;
  }

  // Execute 1 tick of simulation (at tick k -> creates state k+1)
  step(currentTickInput = null) {
    if (this.state !== "playing") return [];

    if (currentTickInput) {
      this.applyInputFrame(currentTickInput);
    }

    const currentTick = this.tick + 1;
    this.tick = currentTick;
    this.simTick = currentTick;
    this.timeLeftS = Math.max(0, this.durationS - (this.tick / TICKS_PER_SEC));

    const stepEvents = [];

    // Rising edge detection for button actions
    const interactTriggered = this.inputState.interact && !this.prevActions.interact;
    const pulseTriggered = this.inputState.pulse && !this.prevActions.pulse;
    this.prevActions.interact = this.inputState.interact;
    this.prevActions.pulse = this.inputState.pulse;
    this.prevActions.jump = this.inputState.jump;

    // 1. Player movement
    const [moveX, moveZ] = transformMove(this.inputState.move, this.inputState.cam_yaw_deg);
    const stepDist = (this.tuning.player_speed / TICKS_PER_SEC);
    this.player.pos[0] += moveX * stepDist;
    this.player.pos[2] += moveZ * stepDist;

    // Island boundary clamp (keep player on island)
    const pDist = Math.sqrt(this.player.pos[0] * this.player.pos[0] + this.player.pos[2] * this.player.pos[2]);
    if (pDist > ISLAND_RADIUS) {
      if (this.tuning.fall_enabled) {
        // Fall event if enabled in future
      } else {
        const factor = ISLAND_RADIUS / pDist;
        this.player.pos[0] *= factor;
        this.player.pos[2] *= factor;
      }
    }

    // Invulnerability & Pulse Cooldown decay
    if (this.player.invuln_ticks > 0) this.player.invuln_ticks--;
    if (this.player.pulse_cooldown_ticks > 0) this.player.pulse_cooldown_ticks--;

    // 2. Mote pickup
    for (const mote of this.motes) {
      if (mote.active && this.player.carried < this.tuning.carry_capacity) {
        const d = distXZ(this.player.pos, mote.pos);
        if (d <= this.tuning.pickup_radius) {
          mote.active = false;
          this.player.carried++;
          this.score += this.tuning.score.per_mote;
          stepEvents.push({
            type: "event",
            tick: currentTick,
            name: "mote_picked",
            data: { carried: this.player.carried }
          });
        }
      }
    }

    // 3. Deposit to Lantern (interact trigger)
    if (interactTriggered && this.player.carried > 0) {
      for (const lantern of this.lanterns) {
        if (!lantern.lit) {
          const d = distXZ(this.player.pos, lantern.pos);
          if (d <= this.tuning.interact_radius) {
            const needed = this.tuning.lantern_cost - lantern.deposited;
            const amount = Math.min(this.player.carried, needed);
            if (amount > 0) {
              this.player.carried -= amount;
              lantern.deposited += amount;
              stepEvents.push({
                type: "event",
                tick: currentTick,
                name: "deposit",
                data: {
                  lantern_id: lantern.id,
                  amount: amount,
                  deposited: lantern.deposited
                }
              });

              if (lantern.deposited >= this.tuning.lantern_cost) {
                lantern.lit = true;
                this.score += this.tuning.score.per_lantern;
                stepEvents.push({
                  type: "event",
                  tick: currentTick,
                  name: "lantern_lit",
                  data: { lantern_id: lantern.id }
                });
              }
              break; // Deposit to one lantern per interact
            }
          }
        }
      }
    }

    // 4. Pulse Action
    if (pulseTriggered && this.player.carried >= this.tuning.pulse_cost && this.player.pulse_cooldown_ticks <= 0) {
      this.player.carried -= this.tuning.pulse_cost;
      this.player.pulse_cooldown_ticks = Math.round(this.tuning.pulse_cooldown_s * TICKS_PER_SEC);

      const stunnedIds = [];
      for (const shade of this.shades) {
        const d = distXZ(this.player.pos, shade.pos);
        if (d <= this.tuning.pulse_radius) {
          shade.state = "stunned";
          shade.stunned_ticks = Math.round(this.tuning.pulse_stun_s * TICKS_PER_SEC);
          stunnedIds.push(shade.id);
          this.score += this.tuning.score.per_stun;

          // Push shade away
          let pushDx = shade.pos[0] - this.player.pos[0];
          let pushDz = shade.pos[2] - this.player.pos[2];
          const pushLen = Math.sqrt(pushDx * pushDx + pushDz * pushDz);
          if (pushLen > 0.001) {
            pushDx /= pushLen;
            pushDz /= pushLen;
          } else {
            pushDx = 1;
            pushDz = 0;
          }
          shade.pos[0] += pushDx * this.tuning.pulse_push_m;
          shade.pos[2] += pushDz * this.tuning.pulse_push_m;
        }
      }

      stepEvents.push({
        type: "event",
        tick: currentTick,
        name: "pulse",
        data: { stunned_ids: stunnedIds }
      });
    }

    // 5. Update Shades (Chase player, respect Safe Radii, Hit player)
    const shadeStepDist = this.tuning.shade_speed / TICKS_PER_SEC;

    for (const shade of this.shades) {
      if (shade.state === "stunned") {
        shade.stunned_ticks--;
        if (shade.stunned_ticks <= 0) {
          shade.state = "chase";
        }
      } else if (shade.state === "chase") {
        // Move towards player
        let dx = this.player.pos[0] - shade.pos[0];
        let dz = this.player.pos[2] - shade.pos[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.001) {
          dx /= dist;
          dz /= dist;
          shade.pos[0] += dx * shadeStepDist;
          shade.pos[2] += dz * shadeStepDist;
        }

        // Avoid safe zones of lit lanterns
        for (const lantern of this.lanterns) {
          if (lantern.lit) {
            const dl = distXZ(shade.pos, lantern.pos);
            if (dl < this.tuning.safe_radius && dl > 0.0001) {
              // Push out to safe radius
              const ldx = (shade.pos[0] - lantern.pos[0]) / dl;
              const ldz = (shade.pos[2] - lantern.pos[2]) / dl;
              shade.pos[0] = lantern.pos[0] + ldx * this.tuning.safe_radius;
              shade.pos[2] = lantern.pos[2] + ldz * this.tuning.safe_radius;
            }
          }
        }

        // Check collision with player
        const hitDist = distXZ(this.player.pos, shade.pos);
        if (hitDist <= this.tuning.shade_hit_radius && this.player.invuln_ticks <= 0) {
          const dropped = Math.ceil(this.player.carried * this.tuning.hit_drop_ratio);
          this.player.carried -= dropped;
          this.player.flames -= 1;
          this.player.invuln_ticks = Math.round(this.tuning.invuln_s * TICKS_PER_SEC);

          // Drop motes around player
          for (let dIdx = 0; dIdx < dropped; dIdx++) {
            const angle = (dIdx / dropped) * Math.PI * 2;
            const dropX = this.player.pos[0] + Math.cos(angle) * 2.0;
            const dropZ = this.player.pos[2] + Math.sin(angle) * 2.0;
            this.motes.push(new Mote(`M${this.nextMoteId++}`, [dropX, 0, dropZ]));
          }

          stepEvents.push({
            type: "event",
            tick: currentTick,
            name: "player_hit",
            data: {
              by: "shade",
              flames: this.player.flames,
              dropped: dropped
            }
          });
        }
      }
    }

    // 6. Check Win/Loss conditions
    const allLit = this.lanterns.length > 0 && this.lanterns.every(l => l.lit);
    if (allLit) {
      this.state = "won";
      // Bonus score for remaining time and flames
      const timeBonus = Math.floor(this.timeLeftS) * this.tuning.score.per_second_left;
      const flameBonus = this.player.flames * this.tuning.score.per_flame_left;
      this.score += timeBonus + flameBonus;

      stepEvents.push({
        type: "event",
        tick: currentTick,
        name: "game_over",
        data: { result: "won", reason: "all_lit" }
      });
    } else if (this.player.flames <= 0) {
      this.state = "lost";
      stepEvents.push({
        type: "event",
        tick: currentTick,
        name: "game_over",
        data: { result: "lost", reason: "no_flames" }
      });
    } else if (this.timeLeftS <= 0) {
      this.state = "lost";
      stepEvents.push({
        type: "event",
        tick: currentTick,
        name: "game_over",
        data: { result: "lost", reason: "dawn" }
      });
    }

    return stepEvents;
  }

  getSnapshot() {
    return {
      type: "snapshot",
      tick: this.tick,
      sim_tick: this.simTick,
      state: this.state,
      time_left_s: round3(this.timeLeftS),
      score: this.score,
      player: this.player.toJSON(),
      lanterns: this.lanterns.map(l => l.toJSON()),
      shades: this.shades.map(s => s.toJSON()),
      motes_active: this.motes.filter(m => m.active).length
    };
  }

  getEndRecord() {
    return {
      type: "end",
      ticks: this.tick,
      state: this.state,
      score: this.score
    };
  }
}
