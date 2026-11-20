import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import assert from 'assert';

export function runPhase4Tests() {
  console.log("=== Testing Phase 4 Features (Ticket-04 & Contract v1.3) ===");

  // 1. Check game.contract.json
  const contractPath = path.resolve(process.cwd(), 'game.contract.json');
  assert(fs.existsSync(contractPath), "game.contract.json must exist");
  const contract = JSON.parse(fs.readFileSync(contractPath, 'utf-8'));
  assert.strictEqual(contract.contract_version, "1.3", "contract_version must be 1.3");
  assert(contract.bench_cmd, "bench_cmd must be defined");
  assert(contract.soak_cmd, "soak_cmd must be defined");
  console.log("  [PASS] game.contract.json v1.3 with bench_cmd and soak_cmd validated");

  // 2. Check bench.json
  const benchPath = path.resolve(process.cwd(), 'bench.json');
  assert(fs.existsSync(benchPath), "bench.json must exist in repo root");
  const bench = JSON.parse(fs.readFileSync(benchPath, 'utf-8'));
  assert.strictEqual(bench.contract_version, "1.3", "bench.json contract_version must be 1.3");
  assert(bench.avg_fps >= 60, `avg_fps (${bench.avg_fps}) must be >= 60`);
  assert(bench.p1_low_fps >= 30, `p1_low_fps (${bench.p1_low_fps}) must be >= 30`);
  assert(bench.load_ms <= 10000, `load_ms (${bench.load_ms}) must be <= 10000`);
  assert(bench.peak_mem_mb > 0, "peak_mem_mb must be positive");
  console.log(`  [PASS] bench.json verified (avg_fps: ${bench.avg_fps}, p1_low: ${bench.p1_low_fps}, load: ${bench.load_ms}ms)`);

  // 3. Check soak.json
  const soakPath = path.resolve(process.cwd(), 'soak.json');
  assert(fs.existsSync(soakPath), "soak.json must exist in repo root");
  const soak = JSON.parse(fs.readFileSync(soakPath, 'utf-8'));
  assert.strictEqual(soak.crashes, 0, "soak.json crashes must be 0");
  assert(soak.nights >= 10, "soak.json nights must be >= 10");
  assert(soak.mem_end_mb <= 1.2 * soak.mem_start_mb, `mem_end_mb (${soak.mem_end_mb}) must be <= 1.2 * mem_start_mb (${soak.mem_start_mb})`);
  console.log(`  [PASS] soak.json verified (nights: ${soak.nights}, crashes: 0, mem: ${soak.mem_start_mb}MB -> ${soak.mem_end_mb}MB)`);

  // 4. Check Leaderboard CLI export
  const tempExport = path.resolve(process.cwd(), 'temp_test_leaderboard.json');
  try {
    execSync(`node server.js --export-leaderboard "${tempExport}"`, { stdio: 'pipe' });
    assert(fs.existsSync(tempExport), "Exported leaderboard file must exist");
    const exported = JSON.parse(fs.readFileSync(tempExport, 'utf-8'));
    assert(Array.isArray(exported.entries), "Exported file must have entries array");
    console.log(`  [PASS] CLI --export-leaderboard command verified (${exported.entries.length} entries)`);
  } finally {
    if (fs.existsSync(tempExport)) fs.unlinkSync(tempExport);
  }

  // 5. Check Documentation
  assert(fs.existsSync(path.resolve(process.cwd(), 'CHANGELOG.md')), "CHANGELOG.md must exist");
  assert(fs.existsSync(path.resolve(process.cwd(), 'CREDITS.md')), "CREDITS.md must exist");
  assert(fs.existsSync(path.resolve(process.cwd(), 'LICENSE')), "LICENSE must exist");
  assert(fs.existsSync(path.resolve(process.cwd(), 'docs/retro.md')), "docs/retro.md must exist");
  console.log("  [PASS] All documentation files verified (CHANGELOG, CREDITS, LICENSE, docs/retro.md)");

  console.log("Phase 4 tests passed successfully!\n");
}
