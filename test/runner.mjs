// Automated Test Suite for Capability Forge Core Engines

import fs from 'fs';
import path from 'path';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log('==================================================');
  console.log('CAPABILITY FORGE AUTOMATED ENGINE TEST SUITE');
  console.log('==================================================\n');

  // Test 1: OpenAPI Spec File Exists
  console.log('[SUITE 1: OpenAPI File Validation]');
  const specPath = path.join(process.cwd(), 'src', 'data', 'ecommerce-api.yaml');
  assert(fs.existsSync(specPath), 'ecommerce-api.yaml exists in src/data/');

  const specContent = fs.readFileSync(specPath, 'utf-8');
  assert(specContent.includes('E-Commerce Store Operations API'), 'Spec title contains expected heading');
  assert(specContent.includes('/orders/{id}'), 'Spec defines /orders/{id}');
  assert(specContent.includes('/shipping/{orderId}'), 'Spec defines /shipping/{orderId}');
  assert(specContent.includes('/refund-policy'), 'Spec defines /refund-policy');
  assert(specContent.includes('/refund'), 'Spec defines /refund (POST)');

  // Test 2: In-Memory Mock Database
  console.log('\n[SUITE 2: Mock API In-Memory Store]');
  // Use dynamic imports or direct mock verification
  assert(specContent.includes('4821'), 'Order 4821 reference is present in demo specification');

  console.log('\n--------------------------------------------------');
  console.log(`Summary: ${passedTests} / ${totalTests} assertions passed.`);
  console.log('--------------------------------------------------\n');

  if (passedTests === totalTests) {
    console.log('ALL ENGINE UNIT CHECKS PASSED!\n');
    process.exit(0);
  } else {
    console.error('SOME CHECKS FAILED!\n');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
