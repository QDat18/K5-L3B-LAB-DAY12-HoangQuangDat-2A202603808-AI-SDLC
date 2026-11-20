import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export function runDeterminismTests() {
  console.log("=== Testing Simulation Determinism ===");
  const tmpDir = path.resolve('tests/tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const run1Out = path.join(tmpDir, 'det_run1.jsonl');
  const run2Out = path.join(tmpDir, 'det_run2.jsonl');

  const cmd = (out) => `node src/headless.js --seed 8888 --night 1 --ticks 180 --out "${out}" --snapshot-every 5`;

  execSync(cmd(run1Out), { stdio: 'pipe' });
  execSync(cmd(run2Out), { stdio: 'pipe' });

  const content1 = fs.readFileSync(run1Out, 'utf-8');
  const content2 = fs.readFileSync(run2Out, 'utf-8');

  if (content1 !== content2) {
    throw new Error("Determinism violation: run 1 and run 2 produced different outputs!");
  }

  console.log("  [PASS] 180 ticks with identical seed produced 100% byte-identical output JSONL");
  console.log("Determinism test passed successfully!\n");
}

