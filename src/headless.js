#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { GameEngine } from './engine/game_engine.js';
import { parseScenario, parseInputs, FormatError } from './engine/scenario.js';

function parseArgs(args) {
  const options = {
    seed: 42,
    night: 1,
    scenario: null,
    inputs: null,
    ticks: 60,
    out: null,
    snapshotEvery: 10
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--seed' && i + 1 < args.length) {
      options.seed = parseInt(args[++i], 10);
    } else if (arg === '--night' && i + 1 < args.length) {
      options.night = parseInt(args[++i], 10);
    } else if (arg === '--scenario' && i + 1 < args.length) {
      options.scenario = args[++i];
    } else if (arg === '--inputs' && i + 1 < args.length) {
      options.inputs = args[++i];
    } else if (arg === '--ticks' && i + 1 < args.length) {
      options.ticks = parseInt(args[++i], 10);
    } else if (arg === '--out' && i + 1 < args.length) {
      options.out = args[++i];
    } else if (arg === '--snapshot-every' && i + 1 < args.length) {
      options.snapshotEvery = parseInt(args[++i], 10);
    }
  }

  return options;
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (!options.out) {
    console.error("Missing required --out parameter");
    process.exit(1);
  }

  let scenarioData = null;
  if (options.scenario) {
    try {
      const content = fs.readFileSync(options.scenario, 'utf-8');
      scenarioData = parseScenario(content);
    } catch (err) {
      if (err instanceof FormatError) {
        console.error("Scenario format error:", err.message);
        process.exit(2);
      }
      console.error("Failed to read scenario file:", err.message);
      process.exit(1);
    }
  }

  let inputsData = null;
  if (options.inputs) {
    try {
      const content = fs.readFileSync(options.inputs, 'utf-8');
      inputsData = parseInputs(content);
    } catch (err) {
      if (err instanceof FormatError) {
        console.error("Inputs format error:", err.message);
        process.exit(2);
      }
      console.error("Failed to read inputs file:", err.message);
      process.exit(1);
    }
  }

  // Pre-index inputs by tick
  const inputFramesByTick = new Map();
  if (inputsData && Array.isArray(inputsData.frames)) {
    for (const frame of inputsData.frames) {
      inputFramesByTick.set(frame.tick, frame);
    }
  }

  // Initialize engine
  const engine = new GameEngine({
    seed: options.seed,
    scenario: scenarioData
  });

  const outLines = [];

  // Snapshot at tick 0 (before applying input)
  outLines.push(JSON.stringify(engine.getSnapshot()));

  const totalTicks = options.ticks;
  const snapshotEvery = options.snapshotEvery > 0 ? options.snapshotEvery : 10;

  for (let k = 0; k < totalTicks; k++) {
    const frameInput = inputFramesByTick.get(k) || null;
    const events = engine.step(frameInput);

    // Write events immediately
    for (const ev of events) {
      outLines.push(JSON.stringify(ev));
    }

    // Write snapshot every snapshotEvery ticks
    if (engine.tick % snapshotEvery === 0) {
      outLines.push(JSON.stringify(engine.getSnapshot()));
    }

    if (engine.state !== "playing") {
      break;
    }
  }

  // Final end record
  outLines.push(JSON.stringify(engine.getEndRecord()));

  // Write to output file
  try {
    const dir = path.dirname(options.out);
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(options.out, outLines.join('\n') + '\n', 'utf-8');
  } catch (err) {
    console.error("Failed to write output file:", err.message);
    process.exit(1);
  }

  process.exit(0);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});

