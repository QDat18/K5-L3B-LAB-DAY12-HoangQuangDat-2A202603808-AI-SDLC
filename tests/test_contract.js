import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export function runContractTests() {
  console.log("=== Testing Test Contract Compliance & Exit Codes ===");
  const tmpDir = path.resolve('tests/tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const validOut = path.join(tmpDir, 'valid.jsonl');
  
  // 1. Valid headless run
  try {
    execSync(`node src/headless.js --seed 42 --night 1 --ticks 30 --out "${validOut}" --snapshot-every 10`, { stdio: 'pipe' });
    console.log("  [PASS] Valid headless run exited with code 0");
  } catch (err) {
    console.error("  [FAIL] Valid headless run failed:", err);
    throw err;
  }

  // Check valid JSONL lines
  const lines = fs.readFileSync(validOut, 'utf-8').trim().split('\n');
  const snap0 = JSON.parse(lines[0]);
  if (snap0.type !== 'snapshot' || snap0.tick !== 0 || snap0.state !== 'playing') {
    throw new Error(`Snapshot 0 invalid: ${JSON.stringify(snap0)}`);
  }
  console.log("  [PASS] Snapshot at tick 0 is valid");

  const endLine = JSON.parse(lines[lines.length - 1]);
  if (endLine.type !== 'end' || typeof endLine.ticks !== 'number' || typeof endLine.score !== 'number') {
    throw new Error(`End line invalid: ${JSON.stringify(endLine)}`);
  }
  console.log("  [PASS] End line is valid");

  // 2. Invalid inputs format -> exit code 2
  const badInputFile = path.join(tmpDir, 'bad_inputs.json');
  fs.writeFileSync(badInputFile, JSON.stringify({
    frames: [
      { tick: 20, move: [0, 1] },
      { tick: 10, move: [0, 0] } // Non-increasing ticks!
    ]
  }));

  try {
    execSync(`node src/headless.js --seed 42 --night 1 --inputs "${badInputFile}" --ticks 30 --out "${validOut}"`, { stdio: 'pipe' });
    throw new Error("Should have failed with exit code 2");
  } catch (err) {
    if (err.status === 2) {
      console.log("  [PASS] Non-increasing input tick exited with code 2");
    } else {
      throw new Error(`Expected exit code 2, got ${err.status}`);
    }
  }

  // 3. Invalid scenario format -> exit code 2
  const badScenarioFile = path.join(tmpDir, 'bad_scenario.json');
  fs.writeFileSync(badScenarioFile, "{ invalid json");

  try {
    execSync(`node src/headless.js --seed 42 --night 1 --scenario "${badScenarioFile}" --ticks 30 --out "${validOut}"`, { stdio: 'pipe' });
    throw new Error("Should have failed with exit code 2");
  } catch (err) {
    if (err.status === 2) {
      console.log("  [PASS] Malformed scenario JSON exited with code 2");
    } else {
      throw new Error(`Expected exit code 2, got ${err.status}`);
    }
  }

  console.log("Contract tests passed successfully!\n");
}
