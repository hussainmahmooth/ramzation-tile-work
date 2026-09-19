import assert from 'node:assert';
import {
  calculateSquareFeet,
  calculateWorkItemSubtotal,
  calculateDiscountAmount,
  computeWorkItemValues,
  computeProjectTotals,
  formatCurrency,
} from '../src/utils/calculations.ts';
import { generateNextBillNumber } from '../src/utils/billNumber.ts';

console.log('🚀 Starting Acceptance & Financial Verification Tests for RAMZATION TILE WORK...\n');

// -------------------------------------------------------------
// Test 1: Square Feet Calculation (Length x Width)
// -------------------------------------------------------------
console.log('Test 1: Square Feet Calculation');
const sqft1 = calculateSquareFeet(20, 15);
assert.strictEqual(sqft1, 300, '20ft x 15ft must equal 300 sq.ft');
console.log('  ✓ 20ft x 15ft = 300 sq.ft');

// -------------------------------------------------------------
// Test 2: Square Feet Subtotal (300 sq.ft @ Rs. 180)
// -------------------------------------------------------------
console.log('Test 2: Square Feet Subtotal');
const subtotal1 = calculateWorkItemSubtotal('square_feet', { length: 20, width: 15, ratePerSqft: 180 });
assert.strictEqual(subtotal1, 54000, '300 sq.ft @ Rs.180 must equal Rs.54,000');
console.log('  ✓ 300 sq.ft @ Rs.180/sq.ft = Rs. 54,000');

// -------------------------------------------------------------
// Test 3: Fixed Amount Discount on Square Feet Work (Rs. 4,000 off Rs. 54,000)
// -------------------------------------------------------------
console.log('Test 3: Work Item 1 Full Computation');
const workItem1 = computeWorkItemValues({
  pricing_type: 'square_feet',
  length: 20,
  width: 15,
  rate_per_sqft: 180,
  discount_type: 'fixed_amount',
  discount_value: 4000,
});
assert.strictEqual(workItem1.square_feet, 300);
assert.strictEqual(workItem1.subtotal, 54000);
assert.strictEqual(workItem1.discount_amount, 4000);
assert.strictEqual(workItem1.final_amount, 50000);
console.log('  ✓ Work Item 1 (Floor): Subtotal = Rs.54,000, Discount = Rs.4,000, Final = Rs.50,000');

// -------------------------------------------------------------
// Test 4: Fixed Price Work with Discount (Rs. 25,000 - Rs. 3,000)
// -------------------------------------------------------------
console.log('Test 4: Work Item 2 Full Computation (Fixed Price)');
const workItem2 = computeWorkItemValues({
  pricing_type: 'fixed_price',
  fixed_price: 25000,
  discount_type: 'fixed_amount',
  discount_value: 3000,
});
assert.strictEqual(workItem2.subtotal, 25000);
assert.strictEqual(workItem2.discount_amount, 3000);
assert.strictEqual(workItem2.final_amount, 22000);
console.log('  ✓ Work Item 2 (Repair): Subtotal = Rs.25,000, Discount = Rs.3,000, Final = Rs.22,000');

// -------------------------------------------------------------
// Test 5: Percentage Discount calculation
// -------------------------------------------------------------
console.log('Test 5: Percentage Discount Computation');
const workItemPct = computeWorkItemValues({
  pricing_type: 'fixed_price',
  fixed_price: 25000,
  discount_type: 'percentage',
  discount_value: 10,
});
assert.strictEqual(workItemPct.subtotal, 25000);
assert.strictEqual(workItemPct.discount_amount, 2500);
assert.strictEqual(workItemPct.final_amount, 22500);
console.log('  ✓ Fixed Price Rs.25,000 with 10% discount = Rs.2,500 off, Final = Rs.22,500');

// -------------------------------------------------------------
// Test 6: Requirement #43 Acceptance Scenario End-to-End
// -------------------------------------------------------------
console.log('\n--- Requirement #43 Official Acceptance Test ---');
const projectWorkItems = [
  {
    id: 'w1',
    project_id: 'p1',
    description: 'Bathroom Floor',
    pricing_type: 'square_feet',
    length: 20,
    width: 15,
    square_feet: 300,
    rate_per_sqft: 180,
    subtotal: 54000,
    discount_type: 'fixed_amount',
    discount_value: 4000,
    discount_amount: 4000,
    final_amount: 50000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'w2',
    project_id: 'p1',
    description: 'Bathroom Tile Repair',
    pricing_type: 'fixed_price',
    fixed_price: 25000,
    subtotal: 25000,
    discount_type: 'fixed_amount',
    discount_value: 3000,
    discount_amount: 3000,
    final_amount: 22000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const projectPayments = [
  {
    id: 'pay1',
    project_id: 'p1',
    payment_date: '2026-09-15',
    amount: 30000,
    payment_method: 'Cash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pay2',
    project_id: 'p1',
    payment_date: '2026-09-17',
    amount: 20000,
    payment_method: 'Bank Transfer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const totals = computeProjectTotals(projectWorkItems, projectPayments);

assert.strictEqual(totals.subtotal, 79000, 'Project subtotal must be Rs.79,000');
assert.strictEqual(totals.total_discount, 7000, 'Project total discount must be Rs.7,000');
assert.strictEqual(totals.final_amount, 72000, 'Project final amount must be Rs.72,000');
assert.strictEqual(totals.total_paid, 50000, 'Total paid must be Rs.50,000');
assert.strictEqual(totals.remaining_balance, 22000, 'Remaining balance must be Rs.22,000');
assert.strictEqual(totals.payment_status, 'Partially Paid');

console.log('  ✓ Project Gross Subtotal: ' + formatCurrency(totals.subtotal));
console.log('  ✓ Project Total Discount: ' + formatCurrency(totals.total_discount));
console.log('  ✓ Project Final Amount:   ' + formatCurrency(totals.final_amount));
console.log('  ✓ Total Paid (2 pays):    ' + formatCurrency(totals.total_paid));
console.log('  ✓ Remaining Balance:      ' + formatCurrency(totals.remaining_balance));
console.log('  ✓ Payment Status:         ' + totals.payment_status);

// -------------------------------------------------------------
// Test 7: Unique Bill Number Generator (Requirement #19)
// -------------------------------------------------------------
console.log('\nTest 7: Bill Number Generator (RTW-YYYY-XXXX)');
const mockBills = [
  { bill_number: 'RTW-2026-0001' },
  { bill_number: 'RTW-2026-0002' },
];
const nextBill = generateNextBillNumber(mockBills);
assert.strictEqual(nextBill, 'RTW-2026-0003', 'Next bill number must be RTW-2026-0003');
console.log('  ✓ Generated Bill Number: ' + nextBill);

console.log('\n🎉 ALL ACCEPTANCE TESTS PASSED SUCCESSFULLY! 100% COMPLIANT.\n');
