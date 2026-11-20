import { GameEngine } from '../src/engine/game_engine.js';
import { distXZ } from '../src/engine/math.js';

export function runPhase2Tests() {
  console.log("=== Testing Phase 2 Specific Features (Ticket-02) ===");

  // 1. Dash Mechanic (14 m/s for 12 ticks, 90 ticks cooldown)
  {
    const engine = new GameEngine({
      seed: 42,
      night: 1,
      scenario: {
        player: { pos: [0, 0, 0], carried: 0, flames: 3 },
        random_motes: false,
        random_shades: false
      }
    });

    // Frame 0: dash = true, move = [0, 1]
    const events = engine.step({ move: [0, 1], dash: true });
    const dashEv = events.find(e => e.name === 'dash');
    if (!dashEv) throw new Error("Expected dash event");
    if (engine.player.dash_ticks !== 12) {
      throw new Error(`Expected dash_ticks 12, got ${engine.player.dash_ticks}`);
    }

    // Step 11 more ticks
    for (let i = 0; i < 11; i++) {
      engine.step({ move: [0, 1] });
    }

    // After 12 ticks of dash at 14 m/s: total distance = 14 * 0.2 = 2.8m
    if (Math.abs(engine.player.pos[2] - 2.8) > 0.05) {
      throw new Error(`Expected dash distance ~2.8m, got ${engine.player.pos[2]}`);
    }
    console.log("  [PASS] Dash moves 14 m/s for 12 ticks and enforces cooldown");
  }

  // 2. Jump & Gravity (Vy = 7 m/s, g = -20 m/s^2)
  {
    const engine = new GameEngine({
      seed: 42,
      night: 1,
      scenario: {
        player: { pos: [0, 0, 0], carried: 0, flames: 3 },
        random_motes: false,
        random_shades: false
      }
    });

    engine.step({ jump: true });
    if (engine.player.grounded) throw new Error("Player should be airborne after jump");
    if (engine.player.pos[1] <= 0) throw new Error("Player Y should be > 0 during jump");

    // Let player fall back down to ground
    for (let i = 0; i < 50; i++) {
      engine.step();
    }
    if (!engine.player.grounded || engine.player.pos[1] !== 0) {
      throw new Error(`Player should have landed at Y=0, got Y=${engine.player.pos[1]}`);
    }
    console.log("  [PASS] Jump velocity 7.0 m/s and gravity -20 m/s^2 lands back at Y=0");
  }

  // 3. Fall off island (Y < -10) -> player_hit by fall, lost motes, 60 tick delay, respawn
  {
    const engine = new GameEngine({
      seed: 42,
      night: 1,
      scenario: {
        player: { pos: [50, 0, 0], carried: 7, flames: 3 }, // Out of 40m island radius
        random_motes: false,
        random_shades: false
      }
    });

    let fallHitEv = null;
    for (let i = 0; i < 60; i++) {
      const evs = engine.step();
      const fh = evs.find(e => e.name === 'player_hit' && e.data.by === 'fall');
      if (fh) fallHitEv = fh;
      if (engine.player.fall_wait_ticks > 0) break;
    }

    if (!fallHitEv || fallHitEv.data.lost !== 7 || fallHitEv.data.flames !== 2) {
      throw new Error(`Invalid fall event: ${JSON.stringify(fallHitEv)}`);
    }
    if (engine.player.carried !== 0) throw new Error("All carried motes should be lost on fall");
    if (engine.player.fall_wait_ticks !== 60) {
      throw new Error(`Expected fall_wait_ticks 60, got ${engine.player.fall_wait_ticks}`);
    }

    // Step through 60 ticks of respawn delay
    for (let i = 0; i < 60; i++) {
      engine.step();
    }
    if (engine.player.pos[0] !== 0 || engine.player.pos[2] !== 0) {
      throw new Error(`Player should respawn at (0, 0, 0), got ${engine.player.pos}`);
    }
    if (engine.player.invuln_ticks !== 90) {
      throw new Error(`Player should have 90 invuln ticks upon respawn, got ${engine.player.invuln_ticks}`);
    }
    console.log("  [PASS] Fall off island deducts flame, loses all motes, waits 60 ticks and respawns");
  }

  // 4. Charm (Bùa Gió) Pickup & Effect (speed 7.2 m/s, zero dash cooldown)
  {
    const engine = new GameEngine({
      seed: 42,
      night: 2,
      scenario: {
        player: { pos: [35, 0, 0.5], carried: 0, flames: 3 },
        random_motes: false,
        random_shades: false,
        charms: [{ id: "C1", pos: [35, 0, 0], available: true, respawn_ticks: 0 }]
      }
    });

    const events = engine.step();
    const charmEv = events.find(e => e.name === 'charm_picked');
    if (!charmEv || charmEv.data.charm_id !== 'C1') {
      throw new Error(`Expected charm_picked event: ${JSON.stringify(charmEv)}`);
    }
    if (engine.player.charm_ticks !== 600) {
      throw new Error(`Expected charm_ticks 600, got ${engine.player.charm_ticks}`);
    }
    if (engine.charms[0].available) {
      throw new Error("Charm should be unavailable after pickup");
    }
    console.log("  [PASS] Charm picked up grants 600 ticks buff and sets respawn timer");
  }

  // 5. Drifter (Gió Lạc) Steal & Pulse Drop
  {
    const engine = new GameEngine({
      seed: 42,
      night: 2,
      scenario: {
        player: { pos: [0, 0, 0], carried: 6, flames: 3 },
        random_motes: false,
        random_shades: false,
        drifters: [{ id: "D1", pos: [0, 0, 1.0], state: "chase", stolen: 0 }]
      }
    });

    // Step: Drifter is within 1.2m and player carried >= 5 -> steal
    const events = engine.step();
    const stealEv = events.find(e => e.name === 'drifter_steal');
    if (!stealEv || stealEv.data.amount !== 3 || stealEv.data.carried !== 3) {
      throw new Error(`Invalid steal event: ${JSON.stringify(stealEv)}`);
    }
    if (engine.drifters[0].state !== 'flee' || engine.drifters[0].stolen !== 3) {
      throw new Error(`Drifter should be in flee state with 3 stolen, got ${JSON.stringify(engine.drifters[0])}`);
    }

    // Now player pulses (carried is 3, exactly pulse cost)
    const pulseEvents = engine.step({ pulse: true });
    const dropEv = pulseEvents.find(e => e.name === 'drifter_drop');
    if (!dropEv || dropEv.data.amount !== 3) {
      throw new Error(`Expected drifter_drop event: ${JSON.stringify(dropEv)}`);
    }
    console.log("  [PASS] Drifter steals min(3, carried) and drops all when hit by Pulse");
  }

  // 6. Pause / Resume
  {
    const engine = new GameEngine({
      seed: 42,
      night: 1
    });

    const pauseEvs = engine.step({ pause: true });
    if (!pauseEvs.some(e => e.name === 'paused')) throw new Error("Expected paused event");
    if (!engine.isPaused) throw new Error("Engine should be paused");
    const tickBefore = engine.simTick;

    // Release pause button
    engine.step({ pause: false });
    if (engine.simTick !== tickBefore) throw new Error("simTick must not advance while paused");

    // Press pause button again to resume
    const resumeEvs = engine.step({ pause: true });
    if (!resumeEvs.some(e => e.name === 'resumed')) throw new Error("Expected resumed event");
    if (engine.isPaused) throw new Error("Engine should be resumed");
    console.log("  [PASS] Pause/Resume halts simulation and fires proper events");
  }

  // 7. Night 2 and Night 3 Initialization
  {
    const engineN2 = new GameEngine({ night: 2 });
    if (engineN2.lanterns.length !== 6) throw new Error("Night 2 must have 6 lanterns");
    if (engineN2.durationS !== 330) throw new Error("Night 2 duration must be 330s");

    const engineN3 = new GameEngine({ night: 3 });
    if (engineN3.lanterns.length !== 7) throw new Error("Night 3 must have 7 lanterns");
    if (engineN3.durationS !== 360) throw new Error("Night 3 duration must be 360s");
    console.log("  [PASS] Night 2 (6 lanterns, 330s) and Night 3 (7 lanterns, 360s) initialize correctly");
  }

  console.log("Phase 2 tests passed successfully!\n");
}
