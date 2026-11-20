import { TUNING, TICKS_PER_SEC, JUMP_VELOCITY, GRAVITY, CHARM_SPEED, CHARM_DURATION_TICKS, CHARM_RESPAWN_TICKS, DROPPED_MOTE_TTL_TICKS } from './constants.js';
import { PRNG } from './rng.js';
import { round3, distXZ, transformMove } from './math.js';
import { Player, Lantern, Shade, Mote, Drifter, Charm } from './entities.js';
import { getMapForNight } from './maps.js';

export class GameEngine {
  constructor(options = {}) {
    this.seed = options.seed !== undefined ? options.seed : 42;
    this.night = options.night !== undefined ? options.night : 1;
    this.rng = new PRNG(this.seed);
    this.tuning = { ...TUNING, ...(options.tuning || {}) };

    this.map = getMapForNight(this.night);

    this.tick = 0;
    this.simTick = 0;
    this.state = "playing"; // "playing", "won", "lost"
    this.isPaused = false;
    this.score = 0;

    // Duration based on night
    if (this.night === 1) this.durationS = this.tuning.night1_duration_s;
    else if (this.night === 2) this.durationS = this.tuning.night2_duration_s;
    else this.durationS = this.tuning.night3_duration_s;

    this.timeLeftS = this.durationS;

    // Wind
    this.wind = { active: false, dir_deg: 0, timer: 0 };
    this.windEnabled = this.night === 3;

    // Player
    this.player = new Player(this.tuning, this.map.start_pos, 0, this.tuning.flames);
    this.player.facing_yaw_deg = this.map.start_yaw;

    this.lanterns = [];
    this.shades = [];
    this.motes = [];
    this.drifters = [];
    this.charms = [];

    // Controller input state
    this.inputState = {
      move: [0, 0],
      cam_yaw_deg: 0,
      jump: false,
      interact: false,
      pulse: false,
      dash: false,
      pause: false
    };

    this.prevActions = {
      jump: false,
      interact: false,
      pulse: false,
      dash: false,
      pause: false
    };

    this.nextMoteId = 1;
    this.nextShadeId = 1;
    this.nextDrifterId = 1;

    // Flags
    this.randomMotes = true;
    this.randomShades = true;
    this.randomDrifters = true;

    // Initialize Default World for current night
    this.initDefaultWorld();

    // Override with Scenario if provided
    if (options.scenario) {
      this.applyScenario(options.scenario);
    }
  }

  initDefaultWorld() {
    // Lanterns
    this.lanterns = this.map.lanterns.map(l => new Lantern(l.id, l.pos, 0, false));

    // Initial 20 motes from map spawns
    const spawns = [...this.map.mote_spawns];
    for (let i = 0; i < Math.min(20, spawns.length); i++) {
      const p = spawns[i];
      this.motes.push(new Mote(`M${this.nextMoteId++}`, p, "random"));
    }

    // Charms
    this.charms = this.map.charms.map(c => new Charm(c.id, c.pos, true, 0));
  }

  applyScenario(scenario) {
    if (scenario.time_left_s !== undefined) {
      this.timeLeftS = scenario.time_left_s;
      this.durationS = scenario.time_left_s;
    }

    if (scenario.wind_enabled !== undefined) {
      this.windEnabled = scenario.wind_enabled;
    }

    if (scenario.player) {
      const sp = scenario.player;
      if (sp.pos) this.player.pos = [...sp.pos];
      if (sp.vel) this.player.vel = [...sp.vel];
      if (sp.carried !== undefined) this.player.carried = sp.carried;
      if (sp.flames !== undefined) this.player.flames = sp.flames;
      if (sp.invuln_ticks !== undefined) this.player.invuln_ticks = sp.invuln_ticks;
      if (sp.dash_cd_ticks !== undefined) this.player.dash_cd_ticks = sp.dash_cd_ticks;
      if (sp.pulse_cd_ticks !== undefined) this.player.pulse_cd_ticks = sp.pulse_cd_ticks;
      if (sp.charm_ticks !== undefined) this.player.charm_ticks = sp.charm_ticks;
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
      this.randomMotes = false;
      this.motes = [];
    }
    if (scenario.motes) {
      this.motes = scenario.motes.map((m, idx) => {
        const pos = Array.isArray(m) ? m : m.pos;
        const id = Array.isArray(m) ? `M${idx + 1}` : (m.id || `M${idx + 1}`);
        const kind = Array.isArray(m) ? "random" : (m.kind || "random");
        const ttl = Array.isArray(m) ? 0 : (m.ttl_ticks || 0);
        return new Mote(id, pos, kind, ttl);
      });
    }

    if (scenario.random_shades === false) {
      this.randomShades = false;
      this.shades = [];
    }
    if (scenario.shades) {
      this.shades = scenario.shades.map((s, idx) => {
        const pos = Array.isArray(s) ? s : (s.pos || [0, 0, 0]);
        const id = Array.isArray(s) ? `S${idx + 1}` : (s.id || `S${idx + 1}`);
        const state = Array.isArray(s) ? "wander" : (s.state || "wander");
        const shade = new Shade(id, pos, state);
        if (!Array.isArray(s) && s.state_ticks_left !== undefined) {
          shade.state_ticks_left = s.state_ticks_left;
        }
        return shade;
      });
    }

    if (scenario.random_drifters === false) {
      this.randomDrifters = false;
      this.drifters = [];
    }
    if (scenario.drifters) {
      this.drifters = scenario.drifters.map((d, idx) => {
        const pos = Array.isArray(d) ? d : (d.pos || [0, 0, 0]);
        const id = Array.isArray(d) ? `D${idx + 1}` : (d.id || `D${idx + 1}`);
        const state = Array.isArray(d) ? "idle" : (d.state || "idle");
        const stolen = Array.isArray(d) ? 0 : (d.stolen || 0);
        return new Drifter(id, pos, state, stolen);
      });
    }

    if (scenario.charms) {
      this.charms = scenario.charms.map((c, idx) => {
        const id = c.id || `C${idx + 1}`;
        const pos = c.pos || [0, 0, 0];
        const avail = c.available !== undefined ? c.available : true;
        const respawn = c.respawn_ticks || 0;
        return new Charm(id, pos, avail, respawn);
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
    if (frame.dash !== undefined) this.inputState.dash = frame.dash;
    if (frame.pause !== undefined) this.inputState.pause = frame.pause;
  }

  // ----------------------------------------------------
  // SIMULATION TICK (12 BẮT BUỘC)
  // ----------------------------------------------------
  step(currentTickInput = null) {
    if (this.state !== "playing") return [];

    if (currentTickInput) {
      this.applyInputFrame(currentTickInput);
    }

    const currentTick = this.tick + 1;
    this.tick = currentTick;
    const stepEvents = [];

    // First tick event: night_start
    if (this.tick === 1) {
      stepEvents.push({
        type: "event",
        tick: currentTick,
        name: "night_start",
        data: { night: this.night }
      });
    }

    // Step 1: Input & Pause handling
    const pauseTriggered = this.inputState.pause && !this.prevActions.pause;
    const jumpTriggered = this.inputState.jump && !this.prevActions.jump;
    const interactTriggered = this.inputState.interact && !this.prevActions.interact;
    const pulseTriggered = this.inputState.pulse && !this.prevActions.pulse;
    const dashTriggered = this.inputState.dash && !this.prevActions.dash;

    this.prevActions.pause = this.inputState.pause;
    this.prevActions.jump = this.inputState.jump;
    this.prevActions.interact = this.inputState.interact;
    this.prevActions.pulse = this.inputState.pulse;
    this.prevActions.dash = this.inputState.dash;

    if (pauseTriggered) {
      this.isPaused = !this.isPaused;
      stepEvents.push({
        type: "event",
        tick: currentTick,
        name: this.isPaused ? "paused" : "resumed",
        data: {}
      });
      if (this.isPaused) {
        return stepEvents; // Halt tick here when paused
      }
    }

    if (this.isPaused) {
      return stepEvents; // Do not advance sim_tick or logic while paused
    }

    // Advance simulation tick
    this.simTick++;
    this.timeLeftS = Math.max(0, this.durationS - (this.simTick / TICKS_PER_SEC));

    // Step 2: Giảm các bộ đếm
    if (this.player.invuln_ticks > 0) this.player.invuln_ticks--;
    if (this.player.dash_cd_ticks > 0) this.player.dash_cd_ticks--;
    if (this.player.pulse_cd_ticks > 0) this.player.pulse_cd_ticks--;
    if (this.player.charm_ticks > 0) this.player.charm_ticks--;
    if (this.player.dash_ticks > 0) this.player.dash_ticks--;

    for (const shade of this.shades) {
      if (shade.state_ticks_left > 0) {
        shade.state_ticks_left--;
        if (shade.state_ticks_left === 0) {
          shade.state = "wander";
        }
      }
      if (shade.push_ticks_left > 0) shade.push_ticks_left--;
      if (shade.safe_eject_ticks > 0) shade.safe_eject_ticks--;
    }

    for (const drifter of this.drifters) {
      if (drifter.state === "flee") {
        drifter.flee_ticks--;
        if (drifter.flee_ticks <= 0) drifter.state = "removed";
      }
      if (drifter.drop_ticks > 0) {
        drifter.drop_ticks--;
        if (drifter.drop_ticks <= 0) drifter.state = "removed";
      }
    }

    for (const charm of this.charms) {
      if (!charm.available) {
        charm.respawn_ticks--;
        if (charm.respawn_ticks <= 0) charm.available = true;
      }
    }

    for (const mote of this.motes) {
      if (mote.active && mote.kind === "dropped") {
        mote.ttl_ticks--;
        if (mote.ttl_ticks <= 0) mote.active = false;
        mote.can_pickup = true; // Can be picked up from next tick
      }
    }

    // Wind update (Night 3)
    if (this.windEnabled) {
      this.wind.timer++;
      if (this.wind.timer % 1800 === 0) {
        // Starts wind for 5s (300 ticks)
        this.wind.active = true;
        this.wind.dir_deg = this.rng.nextFloat(0, 360);
      } else if (this.wind.timer % 1800 === 300) {
        this.wind.active = false;
      }
    }

    // Step 3: Di chuyển Mây (nhảy, lướt, bục nhảy, gió) & rơi khỏi đảo
    if (this.player.fall_wait_ticks > 0) {
      this.player.fall_wait_ticks--;
      if (this.player.fall_wait_ticks === 0) {
        // Respawn at starting point
        this.player.pos = [...this.map.start_pos];
        this.player.vel = [0, 0, 0];
        this.player.grounded = true;
        this.player.invuln_ticks = 90;
      }
    } else {
      // 3.1 Dash activation
      const canDash = (this.player.dash_cd_ticks <= 0 || this.player.charm_ticks > 0);
      if (dashTriggered && canDash && this.player.dash_ticks <= 0) {
        this.player.dash_ticks = Math.round(this.tuning.dash_duration_s * TICKS_PER_SEC); // 12 ticks
        if (this.player.charm_ticks <= 0) {
          this.player.dash_cd_ticks = Math.round(this.tuning.dash_cooldown_s * TICKS_PER_SEC); // 90 ticks
        }

        // Determine dash direction
        const [mx, mz] = transformMove(this.inputState.move, this.inputState.cam_yaw_deg);
        if (mx !== 0 || mz !== 0) {
          this.player.dash_dir = [mx, mz];
        } else {
          const yawRad = (this.player.facing_yaw_deg * Math.PI) / 180.0;
          this.player.dash_dir = [Math.sin(yawRad), Math.cos(yawRad)];
        }

        stepEvents.push({
          type: "event",
          tick: currentTick,
          name: "dash",
          data: {}
        });
      }

      if (this.player.dash_ticks > 0) {
        // Dashing: 14 m/s, hold vertical position
        const dashStep = this.tuning.dash_speed / TICKS_PER_SEC;
        this.player.pos[0] += this.player.dash_dir[0] * dashStep;
        this.player.pos[2] += this.player.dash_dir[1] * dashStep;
        this.player.vel[1] = 0;
      } else {
        // Normal Jump
        if (jumpTriggered && this.player.grounded) {
          this.player.vel[1] = JUMP_VELOCITY;
          this.player.grounded = false;
        }

        // Horizontal Movement
        if (this.player.is_launched) {
          // Locked launch trajectory horizontally
          this.player.pos[0] += this.player.vel[0] / TICKS_PER_SEC;
          this.player.pos[2] += this.player.vel[2] / TICKS_PER_SEC;
        } else {
          const [mx, mz] = transformMove(this.inputState.move, this.inputState.cam_yaw_deg);
          const speed = this.player.charm_ticks > 0 ? CHARM_SPEED : this.tuning.player_speed;
          const stepDist = speed / TICKS_PER_SEC;
          this.player.pos[0] += mx * stepDist;
          this.player.pos[2] += mz * stepDist;
          this.player.vel[0] = mx * speed;
          this.player.vel[2] = mz * speed;

          if (mx !== 0 || mz !== 0) {
            this.player.facing_yaw_deg = (Math.atan2(mx, mz) * 180.0) / Math.PI;
          }
        }

        // Wind push
        if (this.wind.active) {
          const wRad = (this.wind.dir_deg * Math.PI) / 180.0;
          const wSpeed = 2.0 / TICKS_PER_SEC;
          this.player.pos[0] += Math.cos(wRad) * wSpeed;
          this.player.pos[2] += Math.sin(wRad) * wSpeed;
        }

        // Gravity & Vertical physics
        this.player.vel[1] += GRAVITY / TICKS_PER_SEC;
        this.player.pos[1] += this.player.vel[1] / TICKS_PER_SEC;

        // Ground check
        const groundY = this.map.getGroundHeight(this.player.pos[0], this.player.pos[2], this.player.pos[1]);
        if (this.player.pos[1] <= groundY && groundY > -50.0) {
          this.player.pos[1] = groundY;
          this.player.vel[1] = 0;
          this.player.grounded = true;
          this.player.is_launched = false;
        } else {
          this.player.grounded = false;
        }
      }

      // Check Jump Pads
      if (this.map.jumpPads) {
        for (const pad of this.map.jumpPads) {
          const dp = distXZ(this.player.pos, pad.pos);
          if (dp <= pad.radius && this.player.grounded) {
            // Launch player
            this.player.vel[1] = pad.vy;
            if (pad.dirZ !== undefined) {
              this.player.vel[0] = 0;
              this.player.vel[2] = pad.vHorizontal * pad.dirZ;
            } else {
              const dx = pad.target[0] - this.player.pos[0];
              const dz = pad.target[2] - this.player.pos[2];
              const len = Math.sqrt(dx * dx + dz * dz) || 1;
              this.player.vel[0] = (dx / len) * pad.vHorizontal;
              this.player.vel[2] = (dz / len) * pad.vHorizontal;
            }
            this.player.is_launched = true;
            this.player.grounded = false;
          }
        }
      }

      // Check Fall off island (Y < -10)
      if (this.player.pos[1] < -10.0) {
        const lostMotes = this.player.carried;
        this.player.carried = 0;
        this.player.flames -= 1;

        stepEvents.push({
          type: "event",
          tick: currentTick,
          name: "player_hit",
          data: {
            by: "fall",
            flames: this.player.flames,
            lost: lostMotes,
            dropped: 0
          }
        });

        if (this.player.flames <= 0) {
          this.state = "lost";
          stepEvents.push({
            type: "event",
            tick: currentTick,
            name: "game_over",
            data: { result: "lost", reason: "no_flames" }
          });
          return stepEvents;
        } else {
          this.player.fall_wait_ticks = 60;
        }
      }
    }

    // Step 4: Nhặt đom đóm và bùa
    if (this.player.fall_wait_ticks === 0) {
      // Motes pickup
      for (const mote of this.motes) {
        if (mote.active && mote.can_pickup && this.player.carried < this.tuning.carry_capacity) {
          const d = distXZ(this.player.pos, mote.pos);
          const dy = Math.abs(this.player.pos[1] - mote.pos[1]);
          if (d <= this.tuning.pickup_radius && dy <= 1.5) {
            mote.active = false;
            this.player.carried++;
            stepEvents.push({
              type: "event",
              tick: currentTick,
              name: "mote_picked",
              data: { carried: this.player.carried }
            });
          }
        }
      }

      // Charms pickup
      for (const charm of this.charms) {
        if (charm.available) {
          const dc = distXZ(this.player.pos, charm.pos);
          const dy = Math.abs(this.player.pos[1] - charm.pos[1]);
          if (dc <= 1.0 && dy <= 1.5) {
            charm.available = false;
            charm.respawn_ticks = CHARM_RESPAWN_TICKS;
            this.player.charm_ticks = CHARM_DURATION_TICKS;
            stepEvents.push({
              type: "event",
              tick: currentTick,
              name: "charm_picked",
              data: { charm_id: charm.id, charm_ticks: CHARM_DURATION_TICKS }
            });
          }
        }
      }
    }

    // Step 5: Tương tác với đèn
    if (interactTriggered && this.player.carried > 0 && this.player.fall_wait_ticks === 0) {
      // Find unlit lanterns in radius 2.0m
      const candidates = [];
      for (const l of this.lanterns) {
        if (!l.lit) {
          const dl = distXZ(this.player.pos, l.pos);
          if (dl <= this.tuning.interact_radius) {
            candidates.push({ lantern: l, dist: dl });
          }
        }
      }

      if (candidates.length > 0) {
        candidates.sort((a, b) => a.dist - b.dist || a.lantern.id.localeCompare(b.lantern.id));
        const target = candidates[0].lantern;
        const needed = this.tuning.lantern_cost - target.deposited;
        const amount = Math.min(this.player.carried, needed);

        if (amount > 0) {
          this.player.carried -= amount;
          target.deposited += amount;
          this.score += amount * this.tuning.score.per_mote; // +10 per mote deposited

          stepEvents.push({
            type: "event",
            tick: currentTick,
            name: "deposit",
            data: {
              lantern_id: target.id,
              amount: amount,
              deposited: target.deposited
            }
          });

          if (target.deposited >= this.tuning.lantern_cost) {
            target.lit = true;
            this.score += this.tuning.score.per_lantern; // +100
            stepEvents.push({
              type: "event",
              tick: currentTick,
              name: "lantern_lit",
              data: { lantern_id: target.id }
            });

            // Safe zone activation: eject any shade inside 6m
            for (const s of this.shades) {
              const ds = distXZ(s.pos, target.pos);
              if (ds < this.tuning.safe_radius) {
                s.safe_eject_ticks = 30; // Cannot damage during 30 ticks
              }
            }
          }
        }
      }
    }

    // Step 6: Cập nhật vùng an toàn
    for (const lantern of this.lanterns) {
      if (lantern.lit) {
        for (const shade of this.shades) {
          const ds = distXZ(shade.pos, lantern.pos);
          if (ds < this.tuning.safe_radius && ds > 0.0001) {
            const edx = (shade.pos[0] - lantern.pos[0]) / ds;
            const edz = (shade.pos[2] - lantern.pos[2]) / ds;
            if (shade.safe_eject_ticks > 0) {
              // Smooth ejection out to 6m
              shade.pos[0] += edx * 0.2;
              shade.pos[2] += edz * 0.2;
            } else {
              // Strict boundary clamp
              shade.pos[0] = lantern.pos[0] + edx * this.tuning.safe_radius;
              shade.pos[2] = lantern.pos[2] + edz * this.tuning.safe_radius;
            }
          }
        }
      }
    }

    // Step 7: Tỏa Sáng (Pulse)
    if (pulseTriggered && this.player.carried >= this.tuning.pulse_cost && this.player.pulse_cd_ticks <= 0 && this.player.fall_wait_ticks === 0) {
      this.player.carried -= this.tuning.pulse_cost;
      this.player.pulse_cd_ticks = Math.round(this.tuning.pulse_cooldown_s * TICKS_PER_SEC); // 180 ticks

      const pulseCenter = [this.player.pos[0], this.player.pos[1] + 0.8, this.player.pos[2]];
      const stunnedIds = [];

      for (const shade of this.shades) {
        const dx = shade.pos[0] - pulseCenter[0];
        const dy = (shade.pos[1] + 0.5) - pulseCenter[1];
        const dz = shade.pos[2] - pulseCenter[2];
        const d3d = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (d3d <= this.tuning.pulse_radius) {
          shade.state = "stunned";
          shade.state_ticks_left = Math.round(this.tuning.pulse_stun_s * TICKS_PER_SEC); // 120 ticks
          shade.push_ticks_left = 15;

          let hx = shade.pos[0] - this.player.pos[0];
          let hz = shade.pos[2] - this.player.pos[2];
          const hLen = Math.sqrt(hx * hx + hz * hz);
          if (hLen > 0.001) {
            shade.push_dir = [hx / hLen, hz / hLen];
          } else {
            shade.push_dir = [1, 0]; // +X if identical position
          }

          stunnedIds.push(shade.id);
          this.score += this.tuning.score.per_stun; // +5 per stun
        }
      }

      // Check Drifters in Pulse radius
      for (const drifter of this.drifters) {
        const d3d = distXZ(drifter.pos, pulseCenter);
        if (d3d <= this.tuning.pulse_radius) {
          if (drifter.state === "chase") {
            drifter.state = "flee";
            drifter.flee_ticks = 240;
          } else if (drifter.state === "flee" && drifter.stolen > 0) {
            stepEvents.push({
              type: "event",
              tick: currentTick,
              name: "drifter_drop",
              data: { drifter_id: drifter.id, amount: drifter.stolen }
            });
            // Drop motes
            for (let k = 0; k < drifter.stolen; k++) {
              this.motes.push(new Mote(`M${this.nextMoteId++}`, [...drifter.pos], "dropped", DROPPED_MOTE_TTL_TICKS));
            }
            drifter.stolen = 0;
            drifter.drop_ticks = 120;
          }
        }
      }

      stepEvents.push({
        type: "event",
        tick: currentTick,
        name: "pulse",
        data: { stunned_ids: stunnedIds }
      });
    }

    // Step 8: Di chuyển Bóng Mực và Gió Lạc
    const shadeSpeed = (this.night === 3 ? 4.5 : 4.0) / TICKS_PER_SEC;

    for (const shade of this.shades) {
      if (shade.state === "stunned") {
        if (shade.push_ticks_left > 0) {
          const pushStep = this.tuning.pulse_push_m / 15; // 4m in 15 ticks
          shade.pos[0] += shade.push_dir[0] * pushStep;
          shade.pos[2] += shade.push_dir[1] * pushStep;
        }
      } else if (shade.state === "recoil") {
        const recoilStep = 2.0 / 60; // 2m in 60 ticks
        shade.pos[0] += shade.recoil_dir[0] * recoilStep;
        shade.pos[2] += shade.recoil_dir[1] * recoilStep;
      } else if (shade.state === "wander") {
        const d = distXZ(shade.pos, this.player.pos);
        if (d <= 12.0) {
          shade.state = "chase";
        }
      } else if (shade.state === "chase") {
        const d = distXZ(shade.pos, this.player.pos);
        if (d > 18.0) {
          shade.state = "wander";
        } else {
          let dx = this.player.pos[0] - shade.pos[0];
          let dz = this.player.pos[2] - shade.pos[2];
          const dist = Math.sqrt(dx * dx + dz * dz) || 1;
          shade.pos[0] += (dx / dist) * shadeSpeed;
          shade.pos[2] += (dz / dist) * shadeSpeed;
        }
      }
    }

    // Drifters movement (7 m/s)
    const drifterSpeed = 7.0 / TICKS_PER_SEC;
    for (const drifter of this.drifters) {
      if (drifter.state === "idle") {
        const d = distXZ(drifter.pos, this.player.pos);
        if (this.player.carried >= 5 && d <= 15.0) {
          drifter.state = "chase";
        }
      } else if (drifter.state === "chase") {
        const d = distXZ(drifter.pos, this.player.pos);
        if (this.player.carried < 5 || d > 15.0) {
          drifter.state = "idle";
        } else {
          let dx = this.player.pos[0] - drifter.pos[0];
          let dz = this.player.pos[2] - drifter.pos[2];
          const dist = Math.sqrt(dx * dx + dz * dz) || 1;
          drifter.pos[0] += (dx / dist) * drifterSpeed;
          drifter.pos[2] += (dz / dist) * drifterSpeed;
        }
      } else if (drifter.state === "flee") {
        let dx = drifter.pos[0] - this.player.pos[0];
        let dz = drifter.pos[2] - this.player.pos[2];
        const dist = Math.sqrt(dx * dx + dz * dz) || 1;
        drifter.pos[0] += (dx / dist) * drifterSpeed;
        drifter.pos[2] += (dz / dist) * drifterSpeed;
      }
    }

    // Step 9: Chạm (Collisions)
    // 9.1 Gió Lạc cướp trước
    for (const drifter of this.drifters) {
      if (drifter.state === "chase" && !drifter.has_stolen && this.player.carried > 0) {
        const dd = distXZ(drifter.pos, this.player.pos);
        if (dd <= 1.2) {
          const stolen = Math.min(3, this.player.carried);
          this.player.carried -= stolen;
          drifter.stolen = stolen;
          drifter.has_stolen = true;
          drifter.state = "flee";
          drifter.flee_ticks = 240;

          stepEvents.push({
            type: "event",
            tick: currentTick,
            name: "drifter_steal",
            data: {
              drifter_id: drifter.id,
              amount: stolen,
              carried: this.player.carried
            }
          });
        }
      }
    }

    // 9.2 Bóng Mực gây hit (xét theo id tăng dần, tối đa 1 hit/tick)
    if (this.player.invuln_ticks <= 0 && this.player.fall_wait_ticks <= 0) {
      const sortedShades = [...this.shades].sort((a, b) => a.id.localeCompare(b.id));
      for (const shade of sortedShades) {
        if (shade.state !== "stunned" && shade.safe_eject_ticks <= 0) {
          const d = distXZ(this.player.pos, shade.pos);
          const dy = Math.abs(this.player.pos[1] - shade.pos[1]);
          if (d <= this.tuning.shade_hit_radius && dy <= 1.5) {
            const dropped = Math.floor(this.player.carried / 2);
            this.player.carried -= dropped;
            this.player.flames -= 1;
            this.player.invuln_ticks = 90; // 1.5s invulnerable

            // Drop motes in ring 1.5 - 2.5m
            for (let i = 0; i < dropped; i++) {
              const ang = (i / Math.max(1, dropped)) * Math.PI * 2;
              const r = 2.0;
              const dropPos = [
                this.player.pos[0] + Math.cos(ang) * r,
                this.player.pos[1],
                this.player.pos[2] + Math.sin(ang) * r
              ];
              const droppedMote = new Mote(`M${this.nextMoteId++}`, dropPos, "dropped", DROPPED_MOTE_TTL_TICKS);
              droppedMote.can_pickup = false; // Cannot pickup on same tick
              this.motes.push(droppedMote);
            }

            // Shade recoil 2m in 60 ticks
            let rdx = shade.pos[0] - this.player.pos[0];
            let rdz = shade.pos[2] - this.player.pos[2];
            const rlen = Math.sqrt(rdx * rdx + rdz * rdz) || 1;
            shade.recoil_dir = [rdx / rlen, rdz / rlen];
            shade.state = "recoil";
            shade.state_ticks_left = 60;

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

            break; // Max 1 flame lost per tick
          }
        }
      }
    }

    // Step 10: Sinh theo lịch
    // 10.1 Sinh đom đóm tại tick 240, 480...
    if (this.randomMotes && this.simTick % 240 === 0) {
      const activeCount = this.motes.filter(m => m.active).length;
      if (activeCount < 30) {
        // Find empty spawn point
        for (const sp of this.map.mote_spawns) {
          const occupied = this.motes.some(m => m.active && distXZ(m.pos, sp) < 1.0);
          if (!occupied) {
            this.motes.push(new Mote(`M${this.nextMoteId++}`, sp, "random"));
            break;
          }
        }
      }
    }

    // 10.2 Sinh Bóng Mực
    if (this.randomShades) {
      let shouldSpawn = false;
      let countToSpawn = 1;

      if (this.simTick === 300) {
        shouldSpawn = true;
        countToSpawn = 2;
      } else if (this.simTick > 300 && (this.simTick - 300) % this.map.shade_interval_ticks === 0) {
        shouldSpawn = true;
        countToSpawn = 1;
      }

      if (shouldSpawn) {
        for (let k = 0; k < countToSpawn; k++) {
          if (this.shades.length < this.map.shade_max) {
            // Find valid spawn point >= 15m from player
            const validSpawns = this.map.shade_spawns.filter(sp => distXZ(sp, this.player.pos) >= 15.0);
            if (validSpawns.length > 0) {
              const spawnPoint = validSpawns[this.rng.nextInt(0, validSpawns.length - 1)];
              const newShade = new Shade(`S${this.nextShadeId++}`, spawnPoint, "wander");
              this.shades.push(newShade);
              stepEvents.push({
                type: "event",
                tick: currentTick,
                name: "shade_spawned",
                data: { id: newShade.id }
              });
            }
          }
        }
      }
    }

    // 10.3 Sinh Gió Lạc (Night 2 and 3 at tick 1200, 2400...)
    if (this.map.has_drifters && this.randomDrifters && this.simTick % this.map.drifter_interval_ticks === 0) {
      const activeDrifters = this.drifters.filter(d => d.state !== "removed").length;
      if (activeDrifters < 2) {
        const spawns = this.map.shade_spawns;
        const spawnPoint = spawns[this.rng.nextInt(0, spawns.length - 1)];
        this.drifters.push(new Drifter(`D${this.nextDrifterId++}`, spawnPoint, "idle", 0));
      }
    }

    // Step 11: Xét thắng / thua
    if (this.player.flames <= 0) {
      this.state = "lost";
      stepEvents.push({
        type: "event",
        tick: currentTick,
        name: "game_over",
        data: { result: "lost", reason: "no_flames" }
      });
    } else if (this.lanterns.length > 0 && this.lanterns.every(l => l.lit)) {
      this.state = "won";
      // Score bonus: + floor(giây còn lại) × 2 + 50 × Ngọn Lửa còn lại
      const timeBonus = Math.floor(this.timeLeftS) * this.tuning.score.per_second_left;
      const flameBonus = this.player.flames * this.tuning.score.per_flame_left;
      this.score += timeBonus + flameBonus;

      stepEvents.push({
        type: "event",
        tick: currentTick,
        name: "game_over",
        data: { result: "won", reason: "all_lit" }
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
      night: this.night,
      state: this.isPaused ? "paused" : this.state,
      time_left_s: round3(this.timeLeftS),
      score: this.score,
      wind: {
        active: this.wind.active,
        dir_deg: round3(this.wind.dir_deg)
      },
      player: this.player.toJSON(),
      lanterns: this.lanterns.map(l => l.toJSON()),
      shades: this.shades.map(s => s.toJSON()),
      motes: this.motes.filter(m => m.active).map(m => m.toJSON()),
      drifters: this.drifters.filter(d => d.state !== "removed").map(d => d.toJSON()),
      charms: this.charms.map(c => c.toJSON()),
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
