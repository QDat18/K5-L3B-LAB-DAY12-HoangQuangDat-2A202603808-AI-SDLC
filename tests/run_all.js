import { runContractTests } from './test_contract.js';
import { runGameplayTests } from './test_gameplay.js';
import { runPhase2Tests } from './test_phase2.js';
import { runDeterminismTests } from './test_determinism.js';
import { runPhase4Tests } from './test_phase4.js';

console.log("=========================================");
console.log(" RUNNING ALL AUTOMATED TESTS (PHASE 1-4)");
console.log("=========================================\n");

try {
  runContractTests();
  runGameplayTests();
  runPhase2Tests();
  runDeterminismTests();
  runPhase4Tests();
  console.log("=========================================");
  console.log(" ALL TESTS PASSED (100% SUCCESS)!");
  console.log("=========================================");
  process.exit(0);
} catch (err) {
  console.error("\nTEST SUITE FAILED:", err);
  process.exit(1);
}
