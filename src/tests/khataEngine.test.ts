import assert from 'node:assert/strict';
import {
  KHATA_SAMPLE_NOTES,
  normalizeNepaliDigits,
  parseHandwrittenKhataText,
  reconcileKhataLedger,
  buildKhataWhatsAppReminder,
  exportKhataCsv,
} from '../utils/khataEngine';
import { resolveToolFromUrl, buildWebApplicationJsonLd } from '../utils/toolSeo';

console.log('Running Handwritten Bill & Udharo Khata Snapper tests...');

// 1. Nepali digit normalization
assert.equal(normalizeNepaliDigits('२७५० + १५०० = ४२५०'), '2750 + 1500 = 4250');

// 2. Bilingual handwritten bill & udharo notebook parser
const kirana = parseHandwrittenKhataText(KHATA_SAMPLE_NOTES[0].rawText, {
  ledgerMode: 'udharo_khata',
  language: 'ne',
});
assert.equal(kirana.phone, '9841556677');
assert.ok(kirana.shopOrPartyName.includes('रमेश थापा'));
assert.equal(kirana.items.length, 5);
assert.equal(kirana.totalNpr, 4340);
assert.equal(kirana.paidNpr, 1500);
assert.equal(kirana.dueNpr, 2840);
assert.equal(kirana.entryType, 'udharo_due');

// 3. Kitchen grocery bill sample
const kitchen = parseHandwrittenKhataText(KHATA_SAMPLE_NOTES[1].rawText, {
  ledgerMode: 'grocery_bill',
  language: 'ne',
});
assert.equal(kitchen.items.length, 6);
assert.equal(kitchen.totalNpr, 1000);
assert.equal(kitchen.paidNpr, 1000);
assert.equal(kitchen.dueNpr, 0);
assert.equal(kitchen.entryType, 'household_expense');

// 4. Reconciliation after user edits item or partial payment
const edited = reconcileKhataLedger({
  ...kirana,
  paidNpr: 2000,
});
assert.equal(edited.dueNpr, 2340);

// 5. WhatsApp reminder link & CSV export
const reminder = buildKhataWhatsAppReminder({
  record: edited,
  senderShopName: 'Sagarmatha Kirana',
  esewaOrFonepayId: '9800001122',
  language: 'ne',
});
assert.ok(reminder.whatsappUrl.startsWith('https://wa.me/9779841556677?text='));
assert.ok(reminder.message.includes('२,३४०') || reminder.message.includes('2,340'));
assert.ok(reminder.message.includes('9800001122'));

const csv = exportKhataCsv([edited]);
assert.ok(csv.includes('Party / Shop'));
assert.ok(csv.includes('9841556677'));

// 6. Individual SEO route for /tools/khata-snap
const khataSeo = resolveToolFromUrl('/tools/khata-snap', '');
assert.ok(khataSeo, 'Expected /tools/khata-snap SEO metadata');
assert.equal(khataSeo.tab, 'khata');
const jsonLd = buildWebApplicationJsonLd(khataSeo, 'https://nepalai.tech');
assert.equal(jsonLd.url, 'https://nepalai.tech/tools/khata-snap');

console.log('✅ All Handwritten Bill & Udharo Khata Snapper tests passed cleanly!');
