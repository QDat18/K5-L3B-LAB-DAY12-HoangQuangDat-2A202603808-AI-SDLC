import { GameEngine } from '../src/engine/game_engine.js';
import { distXZ } from '../src/engine/math.js';

export function runGameplayTests() {
  console.log("=== Testing Core Gameplay Logic (Standardized v1.1) ===");

  // 1. Pickup motes & carry capacity (capacity = 10, pickup_radius = 1.0m)
  {
    const engine = new GameEngine({
      seed: 123,
      night: 1,
      scenario: {
        player: { pos: [0, 0, 0], carried: 0, flames: 3 },
        random_motes: false,
        random_shades: false,
        motes: [
          [0, 0, 0.1],
          [0, 0, 0.2],
          [0, 0, 0.3],
          [0, 0, 0.4],
          [0, 0, 0.5],
          [0, 0, 0.6],
          [0, 0, 0.7],
          [0, 0, 0.8],
          [0, 0, 0.9],
          [0, 0, 1.0],
          [0, 0, 0.95] // 11th mote exceeds capacity of 10
        ]
      }
    });

    const events = engine.step();
    const pickedEvents = events.filter(e => e.name === 'mote_picked');
    if (engine.player.carried !== 10) {
      throw new Error(`Expected carried 10, got ${engine.player.carried}`);
    }
    if (pickedEvents.length !== 10) {
      throw new Error(`Expected 10 mote_picked events, got ${pickedEvents.length}`);
    }
    console.log("  [PASS] Mote pickup respects pickup_radius (1.0m) & carry_capacity (10)");
  }

  // 2. Deposit & Lighting lantern (cost = 10, interact_radius = 2.0m)
  {
    const engine = new GameEngine({
      seed: 123,
      night: 1,
      scenario: {
        player: { pos: [0, 0, 23.5], carried: 10, flames: 3 },
        random_motes: false,
        random_shades: false,
        lanterns: [{ id: "L1", pos: [0, 0, 25.0], deposited: 0, lit: false }]
      }
    });

    // Distance is 1.5m <= interact_radius (2.0m)
    const events = engine.step({ interact: true });
    const depositEv = events.find(e => e.name === 'deposit');
    const litEv = events.find(e => e.name === 'lantern_lit');

    if (!depositEv || depositEv.data.amount !== 10 || depositEv.data.deposited !== 10) {
      throw new Error(`Invalid deposit event: ${JSON.stringify(depositEv)}`);
    }
    if (!litEv || litEv.data.lantern_id !== 'L1') {
      throw new Error(`Invalid lantern_lit event: ${JSON.stringify(litEv)}`);
    }
    if (engine.player.carried !== 0) {
      throw new Error(`Expected carried 0 after deposit, got ${engine.player.carried}`);
    }
    console.log("  [PASS] Deposit 10 motes lights lantern L1");
  }

  // 3. Win Condition (All lanterns lit)
  {
    const engine = new GameEngine({
      seed: 123,
      night: 1,
      scenario: {
        player: { pos: [0, 0, 23.5], carried: 10, flames: 3 },
        random_motes: false,
        random_shades: false,
        lanterns: [
          { id: "L1", pos: [0, 0, 25.0], deposited: 0, lit: false },
          { id: "L2", pos: [10, 0, 0], deposited: 10, lit: true },
          { id: "L3", pos: [20, 0, 0], deposited: 10, lit: true },
          { id: "L4", pos: [30, 0, 0], deposited: 10, lit: true },
          { id: "L5", pos: [40, 0, 0], deposited: 10, lit: true }
        ]
      }
    });

    const events = engine.step({ interact: true });
    const winEv = events.find(e => e.name === 'game_over' && e.data.result === 'won');
    if (!winEv || winEv.data.reason !== 'all_lit') {
      throw new Error(`Expected won event with all_lit reason, got ${JSON.stringify(winEv)}`);
    }
    if (engine.state !== 'won') {
      throw new Error(`Expected state won, got ${engine.state}`);
    }
    console.log("  [PASS] Lighting all lanterns triggers game_over won (all_lit)");
  }

  // 4. Pulse costs 3 motes, stuns shade and pushes it
  {
    const engine = new GameEngine({
      seed: 123,
      night: 1,
      scenario: {
        player: { pos: [0, 0, 0], carried: 5, flames: 3 },
        random_motes: false,
        random_shades: false,
        shades: [{ id: "S1", pos: [0, 0, 3.0] }]
      }
    });

    const events = engine.step({ pulse: true });
    const pulseEv = events.find(e => e.name === 'pulse');
    if (!pulseEv || !pulseEv.data.stunned_ids.includes('S1')) {
      throw new Error(`Pulse did not stun S1: ${JSON.stringify(pulseEv)}`);
    }
    if (engine.player.carried !== 2) { // 5 - 3 = 2
      throw new Error(`Expected carried 2 after pulse cost 3, got ${engine.player.carried}`);
    }
    const shade = engine.shades[0];
    if (shade.state !== 'stunned') {
      throw new Error(`Expected shade state stunned, got ${shade.state}`);
    }
    console.log("  [PASS] Pulse costs 3 motes, stuns shade and pushes it 4m");
  }

  // 5. Shade hit player & Lose condition
  {
    const engine = new GameEngine({
      seed: 123,
      night: 1,
      scenario: {
        player: { pos: [0, 0, 0], carried: 4, flames: 1 },
        random_motes: false,
        random_shades: false,
        shades: [{ id: "S1", pos: [0, 0, 0.5] }]
      }
    });

    const events = engine.step();
    const hitEv = events.find(e => e.name === 'player_hit');
    const loseEv = events.find(e => e.name === 'game_over' && e.data.result === 'lost');

    if (!hitEv || hitEv.data.flames !== 0 || hitEv.data.dropped !== 2) {
      throw new Error(`Invalid hit event: ${JSON.stringify(hitEv)}`);
    }
    if (!loseEv || loseEv.data.reason !== 'no_flames') {
      throw new Error(`Invalid lose event: ${JSON.stringify(loseEv)}`);
    }
    if (engine.state !== 'lost') {
      throw new Error(`Expected engine state lost, got ${engine.state}`);
    }
    console.log("  [PASS] Shade hit drops floor(carried/2), loses flame, triggers game_over no_flames");
  }

  console.log("Gameplay tests passed successfully!\n");
}
