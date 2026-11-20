/**
 * Automated Unit Tests for Official Nepal Live Data Feed Parsers
 * (NRB Forex, Kalimati Market Board, and FENEGOSIDA Bullion)
 */

import {
  parseNrbPayload,
  mapKalimatiPrices,
  parseFenegosidaDashboard,
} from '../services/nepalOfficialFeeds';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- Running Official Nepal Data Feed Parser Tests ---');

// Test 1: NRB Forex Parser picks latest date when array is sorted oldest->newest
console.log('[Test 1] Testing parseNrbPayload date sorting & currency normalization...');
const nrbFixture = {
  status: { code: 200 },
  data: {
    payload: [
      {
        date: '2026-11-12',
        rates: [
          { currency: { iso3: 'USD', name: 'U.S. Dollar', unit: 1 }, buy: '149.80', sell: '150.40' },
        ],
      },
      {
        date: '2026-11-14',
        rates: [
          { currency: { iso3: 'USD', name: 'U.S. Dollar', unit: 1 }, buy: '150.49', sell: '151.09' },
          { currency: { iso3: 'EUR', name: 'European Euro', unit: 1 }, buy: '162.10', sell: '162.80' },
          { currency: { iso3: 'INR', name: 'Indian Rupee', unit: 100 }, buy: '160.00', sell: '160.15' },
        ],
      },
    ],
  },
};

const parsedNrb = parseNrbPayload(nrbFixture);
assert(parsedNrb !== null, 'parseNrbPayload should return valid result');
assert(parsedNrb!.publishedAt === '2026-11-14', `Expected latest bulletin 2026-11-14, got ${parsedNrb!.publishedAt}`);
assert(parsedNrb!.rates.USD.buy === 150.49, `Expected USD buy 150.49, got ${parsedNrb!.rates.USD.buy}`);
assert(parsedNrb!.rates.USD.sell === 151.09, `Expected USD sell 151.09, got ${parsedNrb!.rates.USD.sell}`);
assert(parsedNrb!.rates.USD.mid === 150.79, `Expected USD mid 150.79, got ${parsedNrb!.rates.USD.mid}`);
assert(parsedNrb!.rates.EUR.buy === 162.10, 'Expected EUR buy rate');
assert(parsedNrb!.rates.GBP.buy > 0, 'Missing currencies should gracefully merge benchmark fallback');
assert(parseNrbPayload({ data: { payload: [] } }) === null, 'Empty payload must return null');
console.log('  ✓ NRB Forex parser verified.');

// Test 2: Kalimati Market Board Parser handles Devanagari digits + EN/NP pairing + featured keys
console.log('[Test 2] Testing mapKalimatiPrices Devanagari digit conversion & featured keys...');
const kalimatiEnFixture = {
  status: 200,
  date: '2026-11-14',
  prices: [
    { commodityname: 'Tomato Big(Nepali)', commodityunit: 'Kg', minprice: '55', maxprice: '65', avgprice: '60' },
    { commodityname: 'Potato Red', commodityunit: 'Kg', minprice: '40', maxprice: '46', avgprice: '43' },
    { commodityname: 'Coriander Green', commodityunit: 'Kg', minprice: '९०', maxprice: '११०', avgprice: '१००' },
  ],
};
const kalimatiNpFixture = {
  status: 200,
  date: '2026-11-14',
  prices: [
    { commodityname: 'गोलभेडा ठूलो(नेपाली)', commodityunit: 'के.जी.', minprice: '५५', maxprice: '६५', avgprice: '६०' },
    { commodityname: 'आलु रातो', commodityunit: 'के.जी.', minprice: '४०', maxprice: '४६', avgprice: '४३' },
    { commodityname: 'धनिया हरियो', commodityunit: 'के.जी.', minprice: '९०', maxprice: '११०', avgprice: '१००' },
  ],
};

const mappedKalimati = mapKalimatiPrices(kalimatiEnFixture, kalimatiNpFixture);
assert(mappedKalimati !== null, 'mapKalimatiPrices should parse valid fixture');
assert(mappedKalimati!.publishedAt === '2026-11-14', 'Expected Kalimati bulletin date');
assert(mappedKalimati!.allCommodities.length === 3, 'Should map all 3 commodities');
assert(mappedKalimati!.allCommodities[0].nameNe === 'गोलभेडा ठूलो(नेपाली)', 'Should pair Nepali name from /np payload');
assert(mappedKalimati!.allCommodities[2].avgPrice === 100, `Devanagari digits should convert to 100, got ${mappedKalimati!.allCommodities[2].avgPrice}`);
assert(mappedKalimati!.allCommodities[2].category === 'leafy', 'Coriander should classify as leafy');
assert(mappedKalimati!.featuredRates.tomato_big.wholesale === 60, 'Featured tomato_big wholesale should equal 60');
assert(mappedKalimati!.featuredRates.tomato_big.pricePerKg === Math.round(60 * 1.18), 'Retail margin should be 18%');
assert(mapKalimatiPrices({ prices: [] }) === null, 'Empty Kalimati payload must return null');
console.log('  ✓ Kalimati Market mapper verified.');

// Test 3: FENEGOSIDA Bullion Parser handles upstream "yestarday" spelling and Tejabi derivation
console.log('[Test 3] Testing parseFenegosidaDashboard Nepali labels & delta calculation...');
const fenegosidaFixture = [
  {
    rateType: 'छापावाल सुन (१ तोला)',
    todayDate: '2026-11-14T00:00:00',
    todayBaseRatePerGram: 271700,
    yestardayBaseRatePerGram: 270500,
  },
  {
    rateType: 'छापावाल सुन (१० ग्राम)',
    todayDate: '2026-11-14T00:00:00',
    todayBaseRatePerGram: 232940,
    yestardayBaseRatePerGram: 231910,
  },
  {
    rateType: 'असली चाँदी दर (१ तोला)',
    todayDate: '2026-11-14T00:00:00',
    todayBaseRatePerGram: 3700,
    yestardayBaseRatePerGram: 3720,
  },
  {
    rateType: 'असली चाँदी दर (१० ग्राम)',
    todayDate: '2026-11-14T00:00:00',
    todayBaseRatePerGram: 3172,
    yestardayBaseRatePerGram: 3189,
  },
];

const parsedBullion = parseFenegosidaDashboard(fenegosidaFixture);
assert(parsedBullion !== null, 'parseFenegosidaDashboard should parse valid fixture');
assert(parsedBullion!.publishedAt === '2026-11-14', `Expected 2026-11-14, got ${parsedBullion!.publishedAt}`);
assert(parsedBullion!.rates.chhapawalGoldPerTola === 271700, 'Expected 271,700 per tola gold');
assert(parsedBullion!.rates.chhapawalGoldPer10g === 232940, 'Expected 232,940 per 10g gold');
assert(parsedBullion!.rates.tejabiGoldPerTola === 271000, 'Tejabi fallback should derive chhapawal - 700');
assert(parsedBullion!.rates.deltaChhapawalPerTola === 1200, `Expected gold delta +1200, got ${parsedBullion!.rates.deltaChhapawalPerTola}`);
assert(parsedBullion!.rates.deltaSilverPerTola === -20, `Expected silver delta -20, got ${parsedBullion!.rates.deltaSilverPerTola}`);
assert(parseFenegosidaDashboard([]) === null, 'Empty bullion rows must return null');
console.log('  ✓ FENEGOSIDA Bullion parser verified.');

console.log('-------------------------------------------------------');
console.log('✅ ALL NEPAL OFFICIAL FEEDS TESTS PASSED SUCCESSFULLY (3/3)');
console.log('-------------------------------------------------------');
