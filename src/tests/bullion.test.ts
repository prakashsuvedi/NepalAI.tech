/**
 * Automated Verification Tests for Nepal Bullion & Jewelry Tax Engine
 */

import {
  convertTolaAanaLalToGrams,
  convertGramsToTolaBreakdown,
  calculateJewelryCost,
  simulateGoldInvestment,
  DEFAULT_FENEGOSIDA_RATES
} from '../utils/nepalBullionCalculator';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- Running Nepal Bullion & Jewelry Tax Suite Tests ---');

// Test 1: Weight conversion fidelity (1 tola = 11.664 g, 1 tola = 16 aana)
console.log('[Test 1] Testing Tola, Aana, Lal, and Gram conversions...');
const oneTolaGrams = convertTolaAanaLalToGrams(1, 0, 0);
assert(Math.abs(oneTolaGrams - 11.664) < 0.001, `1 Tola must equal 11.664g, got ${oneTolaGrams}`);

const sixteenAanaGrams = convertTolaAanaLalToGrams(0, 16, 0);
assert(Math.abs(sixteenAanaGrams - 11.664) < 0.001, `16 Aana must equal 11.664g, got ${sixteenAanaGrams}`);

const eightAanaGrams = convertTolaAanaLalToGrams(0, 8, 0);
assert(Math.abs(eightAanaGrams - 5.832) < 0.001, `8 Aana must equal 5.832g (half tola), got ${eightAanaGrams}`);

const reverseBreakdown = convertGramsToTolaBreakdown(11.664);
assert(reverseBreakdown.tola === 1, `11.664g must convert to 1 tola`);
console.log('  ✓ Tola, Aana, Lal to Gram conversions verified.');

// Test 2: Jewelry bill breakdown with Wastage (जर्ती) and Making charges (ज्याला)
console.log('[Test 2] Testing Jewelry Cost Breakdown (1 tola gold, 2.5% wastage, flat making charge)...');
const jewelCalc = calculateJewelryCost({
  bullionType: 'chhapawal_gold',
  inputMode: 'tola_aana_lal',
  tola: 1,
  aana: 0,
  lal: 0,
  customRatePerTola: 160000,
  makingChargeType: 'flat_per_tola',
  makingChargeValue: 5000,
  wastagePercent: 2.5,
  includeLuxuryTax: false,
  includeVat: false,
});

// Raw gold: 160,000
assert(jewelCalc.rawMetalCostNpr === 160000, `Raw metal cost should be 160,000, got ${jewelCalc.rawMetalCostNpr}`);
// Wastage 2.5%: 160,000 * 0.025 = 4,000
assert(jewelCalc.wastageCostNpr === 4000, `Wastage should be 4,000, got ${jewelCalc.wastageCostNpr}`);
// Making charge: 5,000
assert(jewelCalc.makingChargeNpr === 5000, `Making charge should be 5,000, got ${jewelCalc.makingChargeNpr}`);
// Total before tax: 160,000 + 4,000 + 5,000 = 169,000
assert(jewelCalc.finalTotalNpr === 169000, `Final total should be 169,000, got ${jewelCalc.finalTotalNpr}`);
// Total markup: 9,000 (5.63% over raw gold)
assert(jewelCalc.markupPercentageOverRawMetal > 5.5, `Markup percentage should be around 5.6%`);
console.log('  ✓ Jewelry cost breakdown and markup auditing verified.');

// Test 3: Taxes (2% Luxury Tax & 13% VAT)
console.log('[Test 3] Testing Luxury Tax and 13% VAT application...');
const taxedCalc = calculateJewelryCost({
  bullionType: 'chhapawal_gold',
  inputMode: 'grams',
  grams: 11.664, // 1 tola
  customRatePerTola: 100000,
  makingChargeType: 'total_flat',
  makingChargeValue: 0,
  wastagePercent: 0,
  includeLuxuryTax: true, // 2% -> 2,000
  includeVat: true,       // 13% on (100,000 + 2,000) = 13% of 102,000 = 13,260 -> Total = 115,260
});
assert(taxedCalc.luxuryTaxNpr === 2000, `Luxury tax should be 2,000, got ${taxedCalc.luxuryTaxNpr}`);
assert(taxedCalc.vatNpr === 13260, `VAT should be 13,260, got ${taxedCalc.vatNpr}`);
assert(taxedCalc.finalTotalNpr === 115260, `Final total with VAT should be 115,260, got ${taxedCalc.finalTotalNpr}`);
console.log('  ✓ Luxury tax (2%) and IRD 13% VAT verified.');

// Test 4: Silver calculations
console.log('[Test 4] Testing Silver jewelry calculation...');
const silverCalc = calculateJewelryCost({
  bullionType: 'silver',
  inputMode: 'tola_aana_lal',
  tola: 10,
  customRatePerTola: 2000,
  makingChargeType: 'percentage',
  makingChargeValue: 10, // 10%
  wastagePercent: 5,     // 5%
});
// 10 tolas silver @ 2000 = 20,000 raw silver
// Wastage 5% = 1,000
// Making 10% = 2,000
// Total = 23,000
assert(silverCalc.rawMetalCostNpr === 20000, `Raw silver should be 20,000`);
assert(silverCalc.wastageCostNpr === 1000, `Wastage should be 1,000`);
assert(silverCalc.makingChargeNpr === 2000, `Making charge should be 2,000`);
assert(silverCalc.finalTotalNpr === 23000, `Final silver total should be 23,000`);
console.log('  ✓ Silver calculations verified.');

// Test 5: Gold vs NEPSE vs FD Investment Simulation
console.log('[Test 5] Testing Gold vs NEPSE vs FD investment simulator...');
const sim = simulateGoldInvestment({
  investmentType: 'lump_sum',
  amountNpr: 100000,
  durationYears: 5,
  customGoldCagr: 12.0,
  customNepseCagr: 9.0,
  customFdRate: 8.0,
});
assert(sim.totalInvestedNpr === 100000, 'Total invested should be 100,000');
assert(sim.finalGoldValueNpr > sim.finalNepseValueNpr, '12% Gold return should exceed 9% NEPSE');
assert(sim.finalNepseValueNpr > sim.finalFdValueNpr, '9% NEPSE should exceed 8% FD');
assert(sim.yearlyBreakdown.length === 5, 'Should have 5 yearly breakdowns');
console.log('  ✓ Investment simulator comparison verified.');

console.log('-------------------------------------------------------');
console.log('✅ ALL BULLION & JEWELRY TESTS PASSED SUCCESSFULLY (5/5)');
console.log('-------------------------------------------------------');
