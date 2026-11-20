import { runContractTests } from './test_contract.js';
import { runGameplayTests } from './test_gameplay.js';
import { runDeterminismTests } from './test_determinism.js';

console.log("=========================================");
console.log(" RUNNING ALL PHASE 1 AUTOMATED TESTS");
console.log("=========================================\n");

try {
  runContractTests();
  runGameplayTests();
  runDeterminismTests();
  console.log("=========================================");
  console.log(" ALL TESTS PASSED (100% SUCCESS)!");
  console.log("=========================================");
  process.exit(0);
} catch (err) {
  console.error("\nTEST SUITE FAILED:", err);
  process.exit(1);
}
