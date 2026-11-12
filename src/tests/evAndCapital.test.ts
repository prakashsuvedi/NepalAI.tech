import assert from 'node:assert';
import { calculateEvRoadTax, calculateNeaChargingCost, simulateHighwayRoute } from '../utils/nepalEvCalculator';
import { calculateNepseTrade, calculateBrokerCommission, calculateBookCloseAdjustments } from '../utils/nepseCalculator';
import { calculateItExportRemittance } from '../utils/nepalItExportEngine';

async function runTests() {
  console.log('--- Running EV, NEPSE Capital & IT Export Suite Tests ---');

  // Test 1: EV Road Tax & Bluebook fine
  console.log('[Test 1] Testing EV Road Tax and compound delay penalty...');
  const evCar = calculateEvRoadTax({
    category: 'car',
    motorKw: 70, // 50-99kW bracket -> 15,000 NPR
    expiryMonthsLate: 4, // 10% fine
  });
  assert.strictEqual(evCar.baseTaxNpr, 15000, 'Base tax for 70kW car should be 15,000 NPR');
  assert.strictEqual(evCar.finePercent, 10, 'Fine for 4 months delay should be 10%');
  assert.strictEqual(evCar.fineAmountNpr, 1500, 'Fine amount should be 1,500 NPR');
  assert.strictEqual(evCar.totalTaxDueNpr, 16500, 'Total tax due should be 16,500 NPR');
  console.log('  ✓ EV Provincial Road tax and delay fine verified.');

  // Test 2: NEA EV Charging Cost & Petrol Savings
  console.log('[Test 2] Testing NEA Time-of-Day Charging and Petrol Savings...');
  const charging = calculateNeaChargingCost({
    batteryKwh: 30, // 30 kWh battery
    timeOfDay: 'off_peak', // 4.30 NPR / unit
    dailyCommuteKm: 40,
    petrolPricePerLiter: 175,
    petrolMileageKmPerLiter: 12,
  });
  assert.strictEqual(charging.ratePerUnitNpr, 4.3, 'Off peak rate should be 4.3 NPR');
  assert.ok(charging.costPerKmEvNpr < 2.0, 'EV cost per km should be under 2.0 NPR');
  assert.ok(charging.monthlySavingsNpr > 10000, 'Monthly savings vs petrol should be significant');
  console.log('  ✓ NEA EV Charging rate and petrol savings math verified.');

  // Test 3: NEPSE Trade P&L, Broker Slabs and CGT
  console.log('[Test 3] Testing NEPSE Broker Slabs, SEBON Fee, DP and CGT...');
  const trade = calculateNepseTrade({
    units: 100,
    buyPrice: 300, // Buy 30,000
    sellPrice: 400, // Sell 40,000
    holdingPeriod: 'short_term', // 7.5%
  });
  assert.strictEqual(trade.totalPurchaseAmount, 30000);
  assert.strictEqual(trade.totalSalesAmount, 40000);
  assert.strictEqual(trade.grossProfitNpr, 10000);
  assert.strictEqual(trade.dpChargeNpr, 25);
  assert.ok(trade.netProfitLossNpr > 8500 && trade.netProfitLossNpr < 9500);
  assert.ok(trade.breakEvenSellPrice > 300 && trade.breakEvenSellPrice < 315);
  console.log('  ✓ NEPSE Broker commission, CGT and break-even price verified.');

  // Test 4: NEPSE Book-Close Adjustment Price
  console.log('[Test 4] Testing NEPSE Bonus & Right share price adjustment...');
  const bookClose = calculateBookCloseAdjustments({
    marketPriceBeforeBookClose: 500,
    bonusPercent: 20, // 20% bonus
  });
  // 500 / 1.2 = 416.67
  assert.strictEqual(bookClose.adjustedPriceNpr, 416.67);
  console.log('  ✓ NEPSE Book close adjustment formula verified.');

  // Test 5: IT Export Section 95Ka Final TDS & Bank Declaration
  console.log('[Test 5] Testing Section 95Ka IT Export 5% TDS and Bank Declaration...');
  const itExport = calculateItExportRemittance({
    inwardAmountUsd: 1000,
    nrbBuyRateNpr: 135.30,
    entityType: 'individual_freelancer',
    freelancerName: 'Prakash Suvedi',
    panNumber: '609812453',
    bankName: 'Nabil Bank Ltd.',
    bankBranch: 'Maitidevi',
    bankAccountNumber: '01234567890123',
    foreignClientOrPlatform: 'Upwork Global Inc.',
    serviceType: 'AI Model Engineering',
  });
  assert.strictEqual(itExport.grossAmountNpr, 135300);
  assert.strictEqual(itExport.tdsRatePercent, 5.0);
  assert.strictEqual(itExport.tdsAmountNpr, 6765);
  assert.strictEqual(itExport.netDepositedNpr, 128535);
  assert.ok(itExport.selfDeclarationLetterNe.includes('दफा ९५(क)'));
  console.log('  ✓ Section 95Ka remittance math and bank letter verified.');

  console.log('--- All 5 EV, Capital & IT Export Tests Passed! ---');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
