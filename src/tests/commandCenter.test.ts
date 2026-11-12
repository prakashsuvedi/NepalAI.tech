/**
 * Phase 02 Automated Verification Tests
 * Tests for Utility Registry, Search Behavior, Tax/Land Math, and Workspace States
 */

import { UTILITY_REGISTRY, UtilityItem, UtilityCategory } from '../data/utilityRegistry';
import { calculateNepalIncomeTax } from '../utils/nepalTaxCalculator';
import { convertFromRopaniSystem, convertFromBighaSystem, convertFromSqFeet } from '../utils/nepalUnitsConverter';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- Running Phase 02 Command Center & Registry Tests ---');

// 1. Registry Integrity Tests
console.log('[Test 1] Validating UTILITY_REGISTRY schema and metadata...');
assert(UTILITY_REGISTRY.length >= 10, 'Registry should have at least 10 verified tools');

const validPages = ['home', 'command-center', 'dashboard', 'directory', 'daily', 'free', 'consulting', 'compliance', 'commerce'];
const validTabs = ['fx', 'letter', 'voice', 'ocr', 'tax', 'market', 'ev', 'nepse', 'it_export', 'bullion'];
const ids = new Set<string>();

UTILITY_REGISTRY.forEach((tool) => {
  assert(!ids.has(tool.id), `Duplicate tool ID found: ${tool.id}`);
  ids.add(tool.id);
  assert(tool.nameEn.length > 0, `Tool ${tool.id} missing nameEn`);
  assert(tool.nameNe.length > 0, `Tool ${tool.id} missing nameNe`);
  assert(tool.descEn.length > 0, `Tool ${tool.id} missing descEn`);
  assert(tool.descNe.length > 0, `Tool ${tool.id} missing descNe`);
  assert(validPages.includes(tool.targetPage), `Tool ${tool.id} has invalid targetPage: ${tool.targetPage}`);
  if (tool.targetTab) {
    assert(validTabs.includes(tool.targetTab), `Tool ${tool.id} has invalid targetTab: ${tool.targetTab}`);
  }
  assert(tool.sourceMetadata && tool.sourceMetadata.source.length > 0, `Tool ${tool.id} missing sourceMetadata`);
});
console.log(`  ✓ All ${UTILITY_REGISTRY.length} registered utilities have valid schemas and target routes.`);

// 2. Search Behavior Tests
console.log('[Test 2] Testing search filter logic (English & Devanagari)...');

function searchRegistry(query: string, category: UtilityCategory = 'all'): UtilityItem[] {
  const q = query.toLowerCase().trim();
  return UTILITY_REGISTRY.filter((tool) => {
    const matchesCategory = category === 'all' || tool.category === category;
    if (!q) return matchesCategory;

    const matchesQuery =
      tool.nameEn.toLowerCase().includes(q) ||
      tool.nameNe.toLowerCase().includes(q) ||
      tool.descEn.toLowerCase().includes(q) ||
      tool.descNe.toLowerCase().includes(q) ||
      tool.keywords.toLowerCase().includes(q);

    return matchesCategory && matchesQuery;
  });
}

// Test queries
const taxResults = searchRegistry('tax');
assert(taxResults.some((t) => t.id === 'income-tax-tds'), 'Search "tax" must include income-tax-tds');

const nepaliTaxResults = searchRegistry('आयकर');
assert(nepaliTaxResults.some((t) => t.id === 'income-tax-tds'), 'Search "आयकर" must include income-tax-tds');

const forexResults = searchRegistry('dollar card');
assert(forexResults.some((t) => t.id === 'nrb-forex'), 'Search "dollar card" must include nrb-forex');

const wardResults = searchRegistry('नाता');
assert(wardResults.some((t) => t.id === 'ward-nibedan-studio'), 'Search "नाता" must include ward-nibedan-studio');

const kalimatiResults = searchRegistry('कालिमाटी');
assert(kalimatiResults.some((t) => t.id === 'kalimati-market-rates'), 'Search "कालिमाटी" must include kalimati-market-rates');

const landResults = searchRegistry('ropani');
assert(landResults.some((t) => t.id === 'nepal-land-converter'), 'Search "ropani" must include nepal-land-converter');

const evResults = searchRegistry('ev');
assert(evResults.some((t) => t.id === 'ev-road-tax'), 'Search "ev" must include ev-road-tax');

const nepseResults = searchRegistry('nepse');
assert(nepseResults.some((t) => t.id === 'nepse-capital-terminal'), 'Search "nepse" must include nepse-capital-terminal');

const remittanceResults = searchRegistry('95ka');
assert(remittanceResults.some((t) => t.id === 'it-export-remittance'), 'Search "95ka" must include it-export-remittance');

const goldResults = searchRegistry('gold');
assert(goldResults.some((t) => t.id === 'bullion-jewelry-terminal'), 'Search "gold" must include bullion-jewelry-terminal');

const nepaliGoldResults = searchRegistry('सुन');
assert(nepaliGoldResults.some((t) => t.id === 'bullion-jewelry-terminal'), 'Search "सुन" must include bullion-jewelry-terminal');

// Category test
const financialOnly = searchRegistry('', 'financial');
assert(financialOnly.every((t) => t.category === 'financial'), 'Category filter financial should only return financial tools');
assert(financialOnly.length >= 5, 'Financial category should have at least 5 tools');

const mobilityOnly = searchRegistry('', 'mobility');
assert(mobilityOnly.some((t) => t.id === 'ev-road-tax'), 'Mobility category should include ev-road-tax');

console.log('  ✓ Search filter correctly resolves English, Romanized, and Devanagari queries.');

// 3. Financial Engine Verification
console.log('[Test 3] Testing Financial Engine calculations...');

// Nepal Income Tax test under Finance Act 2081/82
const singleTax = calculateNepalIncomeTax({
  status: 'single',
  monthlyGrossSalary: 50000, // 600,000 annual
  includeDashainBonus: false,
  isItExportFreelancer: false,
  isItExportCompany: false,
  isSsfEnrolled: true, // SSF exempts 1% on first 500k
  isFemaleSingle: false,
  epfMonthly: 0,
  citMonthly: 0,
  annualLifeInsurance: 0,
  annualHealthInsurance: 0,
});
// 500k exempt with SSF. 100k taxed at 10% = 10,000 annual tax -> ~833.33/mo
assert(singleTax.totalAnnualIncome === 600000, 'Annual income should be 600,000');
assert(singleTax.finalAnnualTax === 10000, `Expected annual tax 10,000 with SSF exemption, got ${singleTax.finalAnnualTax}`);
assert(Math.round(singleTax.monthlyTaxTds) === 833, `Expected monthly TDS ~833, got ${singleTax.monthlyTaxTds}`);
console.log('  ✓ IRD Income Tax calculations match Finance Act 2081/82 specifications.');

// Land conversion test (1 Ropani = 5476 sq ft = 16 Aana equivalent)
const landTest1 = convertFromRopaniSystem(1, 0, 0, 0);
assert(landTest1.sqFeet === 5476, `1 Ropani must equal 5,476 sq ft, got ${landTest1.sqFeet}`);
assert(landTest1.ropani === 1 && landTest1.aana === 0, `1-0-0-0 must reduce to 1 Ropani, 0 Aana`);

// 16 Aana input directly equals 1 Ropani (5,476 sq ft)
const landTest16Aana = convertFromRopaniSystem(0, 16, 0, 0);
assert(landTest16Aana.sqFeet === 5476, `16 Aana must equal 5,476 sq ft, got ${landTest16Aana.sqFeet}`);
assert(landTest16Aana.ropani === 1, `16 Aana must convert to 1 Ropani`);

// 1 Bigha = 72,900 sq ft = 20 Kattha
const bighaTest = convertFromBighaSystem(1, 0, 0);
assert(bighaTest.sqFeet === 72900, `1 Bigha must equal 72,900 sq ft, got ${bighaTest.sqFeet}`);
assert(bighaTest.bigha === 1 && bighaTest.kattha === 0, `1 Bigha must reduce to 1 Bigha, 0 Kattha`);

console.log('  ✓ Land conversion math verified across Ropani, Aana, Bigha, Kattha systems.');

// 4. Workspace & Pinned Tools Logic
console.log('[Test 4] Testing Workspace and Pinned Tools configuration...');
const defaultPinned = ['nrb-forex', 'income-tax-tds', 'ward-nibedan-studio', 'devanagari-ocr'];
defaultPinned.forEach((id) => {
  assert(UTILITY_REGISTRY.some((t) => t.id === id), `Default pinned ID ${id} must exist in registry`);
});
console.log('  ✓ All default pinned shortcuts are valid and verified.');

console.log('-------------------------------------------------------');
console.log('✅ ALL PHASE 02 TESTS PASSED SUCCESSFULLY (4/4 test suites)');
console.log('-------------------------------------------------------');
