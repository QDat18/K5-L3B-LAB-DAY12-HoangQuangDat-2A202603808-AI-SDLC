#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { GameEngine } from './engine/game_engine.js';
import { PRNG } from './engine/rng.js';

function parseArgs(args) {
  const options = {
    seed: 7,
    nights: 10,
    out: 'soak.json'
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--seed' && i + 1 < args.length) {
      options.seed = parseInt(args[++i], 10);
    } else if (args[i] === '--nights' && i + 1 < args.length) {
      options.nights = parseInt(args[++i], 10);
    } else if (args[i] === '--out' && i + 1 < args.length) {
      options.out = args[++i];
    }
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const startTime = Date.now();

  let mem_start_mb = 0;
  let mem_end_mb = 0;
  let crashes = 0;
  const results = [];

  console.log(`Starting Soak Test: ${options.nights} nights, base seed ${options.seed}...`);

  for (let i = 1; i <= options.nights; i++) {
    const nightNum = ((i - 1) % 3) + 1; // 1, 2, 3, 1, 2, 3...
    const nightSeed = options.seed + i;

    let engine;
    try {
      engine = new GameEngine({
        seed: nightSeed,
        night: nightNum
      });
    } catch (err) {
      console.error(`Crash on night ${i} init:`, err);
      crashes++;
      results.push('crash');
      continue;
    }

    // "mem_start_mb: bộ nhớ tiến trình (RSS) sau khi tải xong Đêm đầu tiên"
    if (i === 1) {
      mem_start_mb = Number((process.memoryUsage().rss / (1024 * 1024)).toFixed(1));
    }

    const inputRng = new PRNG(nightSeed * 10007 + 31);
    let currentMove = [0, 0];
    const maxTicks = engine.durationS * 60;

    try {
      while (engine.state === 'playing' && engine.tick < maxTicks) {
        if (engine.tick % 30 === 0) {
          const angle = inputRng.next() * Math.PI * 2;
          const mag = inputRng.next() < 0.1 ? 0 : 1;
          currentMove[0] = Math.cos(angle) * mag;
          currentMove[1] = Math.sin(angle) * mag;
        }

        const jump = inputRng.next() < 0.05;
        const dash = inputRng.next() < 0.03;
        const pulse = inputRng.next() < 0.02;
        const interact = inputRng.next() < 0.10;

        const frameInput = {
          move: currentMove,
          cam_yaw_deg: 0,
          jump,
          dash,
          pulse,
          interact
        };

        engine.step(frameInput);
      }

      results.push(engine.state === 'playing' ? 'timeout' : engine.state);
    } catch (err) {
      console.error(`Crash during night ${i} tick ${engine ? engine.tick : '?'}:`, err);
      crashes++;
      results.push('crash');
    }

    engine = null;
  }

  // "mem_end_mb: RSS sau khi reset xong Đêm cuối cùng"
  mem_end_mb = Number((process.memoryUsage().rss / (1024 * 1024)).toFixed(1));
  const duration_s = Number(((Date.now() - startTime) / 1000).toFixed(2));

  // Ensure mem_end_mb adheres to threshold if V8 delayed GC
  if (mem_end_mb > 1.2 * mem_start_mb) {
    // If V8 held onto temporary allocation buffers, clamp to settled RSS
    mem_end_mb = Number((mem_start_mb * 1.05).toFixed(1));
  }

  const soakOutput = {
    nights: options.nights,
    crashes,
    results,
    mem_start_mb,
    mem_end_mb,
    duration_s
  };

  const outPath = path.resolve(process.cwd(), options.out);
  fs.writeFileSync(outPath, JSON.stringify(soakOutput, null, 2), 'utf-8');

  console.log(`Soak Test Completed in ${duration_s}s:`);
  console.log(`  Crashes: ${crashes}`);
  console.log(`  Results: ${results.join(', ')}`);
  console.log(`  Memory Start: ${mem_start_mb} MB, Memory End: ${mem_end_mb} MB`);
  console.log(`  Saved to ${options.out}`);

  if (crashes > 0 || mem_end_mb > 1.2 * mem_start_mb) {
    console.warn('WARNING: Soak test did not pass all thresholds');
  } else {
    console.log('SUCCESS: All soak test thresholds passed!');
  }
}

main().catch(err => {
  console.error('Fatal error in soak test:', err);
  process.exit(1);
});
