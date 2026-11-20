import { GameEngine } from '../src/engine/game_engine.js';
import { distXZ } from '../src/engine/math.js';

export function runGameplayTests() {
  console.log("=== Testing Core Gameplay Logic ===");

  // 1. Pickup motes & carry capacity
  {
    const engine = new GameEngine({
      seed: 123,
      scenario: {
        player: { pos: [0, 0, 0], carried: 0, flames: 3 },
        random_motes: false,
        random_shades: false,
        motes: [
          [0, 0, 0.5],
          [0, 0, 1.0],
          [0, 0, 1.2],
          [0, 0, 1.3],
          [0, 0, 1.4],
          [0, 0, 1.45] // 6th mote exceeds capacity of 5
        ]
      }
    });

    const events = engine.step();
    const pickedEvents = events.filter(e => e.name === 'mote_picked');
    if (engine.player.carried !== 5) {
      throw new Error(`Expected carried 5, got ${engine.player.carried}`);
    }
    if (pickedEvents.length !== 5) {
      throw new Error(`Expected 5 mote_picked events, got ${pickedEvents.length}`);
    }
    console.log("  [PASS] Mote pickup respects carry_capacity (5)");
  }

  // 2. Deposit & Lighting lantern
  {
    const engine = new GameEngine({
      seed: 123,
      scenario: {
        player: { pos: [0, 0, 24.0], carried: 5, flames: 3 },
        random_motes: false,
        random_shades: false,
        lanterns: [{ id: "L1", pos: [0, 0, 25.0], deposited: 0, lit: false }]
      }
    });

    // Tick 0: interact = true
    const events = engine.step({ interact: true });
    const depositEv = events.find(e => e.name === 'deposit');
    const litEv = events.find(e => e.name === 'lantern_lit');

    if (!depositEv || depositEv.data.amount !== 5 || depositEv.data.deposited !== 5) {
      throw new Error(`Invalid deposit event: ${JSON.stringify(depositEv)}`);
    }
    if (!litEv || litEv.data.lantern_id !== 'L1') {
      throw new Error(`Invalid lantern_lit event: ${JSON.stringify(litEv)}`);
    }
    if (engine.player.carried !== 0) {
      throw new Error(`Expected carried 0 after deposit, got ${engine.player.carried}`);
    }
    console.log("  [PASS] Deposit 5 motes lights lantern L1");
  }

  // 3. Win Condition (All 5 lanterns lit)
  {
    const engine = new GameEngine({
      seed: 123,
      scenario: {
        player: { pos: [0, 0, 24.0], carried: 5, flames: 3 },
        random_motes: false,
        random_shades: false,
        lanterns: [
          { id: "L1", pos: [0, 0, 25.0], deposited: 0, lit: false },
          { id: "L2", pos: [10, 0, 0], deposited: 5, lit: true },
          { id: "L3", pos: [20, 0, 0], deposited: 5, lit: true },
          { id: "L4", pos: [30, 0, 0], deposited: 5, lit: true },
          { id: "L5", pos: [40, 0, 0], deposited: 5, lit: true }
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
    console.log("  [PASS] Lighting all 5 lanterns triggers game_over won (all_lit)");
  }

  // 4. Pulse stuns shade and pushes it
  {
    const engine = new GameEngine({
      seed: 123,
      scenario: {
        player: { pos: [0, 0, 0], carried: 2, flames: 3 },
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
    if (engine.player.carried !== 1) {
      throw new Error(`Expected carried 1 after pulse cost 1, got ${engine.player.carried}`);
    }
    const shade = engine.shades[0];
    if (shade.state !== 'stunned') {
      throw new Error(`Expected shade state stunned, got ${shade.state}`);
    }
    if (shade.pos[2] <= 3.0) {
      throw new Error(`Expected shade pushed back, got z=${shade.pos[2]}`);
    }
    console.log("  [PASS] Pulse costs 1 mote, stuns shade and pushes it");
  }

  // 5. Shade hit player & Lose condition
  {
    const engine = new GameEngine({
      seed: 123,
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
    console.log("  [PASS] Shade hit drops 50% motes, loses flame, triggers game_over no_flames");
  }

  console.log("Gameplay tests passed successfully!\n");
}

