import assert from 'node:assert/strict';
import {
  HEALTH_SAMPLE_DOCS,
  translateHealthReportFallback,
} from '../utils/healthTranslatorEngine';
import { resolveToolFromUrl, buildWebApplicationJsonLd } from '../utils/toolSeo';

console.log('Running Lab Report & Prescription Translator tests...');

// 1. Sugar, Lipid & Thyroid lab report parsing
const labReport = translateHealthReportFallback({
  text: HEALTH_SAMPLE_DOCS[0].text,
  mode: 'lab_report',
  language: 'ne',
});
assert.equal(labReport.mode, 'lab_report');
assert.ok(labReport.labMarkers.length >= 5);
assert.ok(labReport.labMarkers.some((m) => m.name.includes('Fasting Blood Sugar') && m.status === 'attention'));
assert.ok(labReport.labMarkers.some((m) => m.name.includes('Creatinine') && m.status === 'normal'));
assert.ok(labReport.audioScriptNe.length > 50);

// 2. Prescription Morning / Day / Night decoding (OD/BD/HS/AC/PC)
const rxReport = translateHealthReportFallback({
  text: HEALTH_SAMPLE_DOCS[1].text,
  mode: 'prescription',
  language: 'ne',
});
assert.equal(rxReport.mode, 'prescription');
assert.equal(rxReport.medicineSchedule.length, 4);

const metformin = rxReport.medicineSchedule.find((m) => /metformin/i.test(m.medicineName));
assert.ok(metformin);
assert.equal(metformin.morning, true);
assert.equal(metformin.afternoon, false);
assert.equal(metformin.night, true);

const rosuva = rxReport.medicineSchedule.find((m) => /rosuvastatin/i.test(m.medicineName));
assert.ok(rosuva);
assert.equal(rosuva.morning, false);
assert.equal(rosuva.night, true);

const pantop = rxReport.medicineSchedule.find((m) => /pantoprazole/i.test(m.medicineName));
assert.ok(pantop);
assert.ok(pantop.mealNote.includes('अगाडि'));

// 3. Individual SEO route for /tools/health-translator
const healthSeo = resolveToolFromUrl('/tools/health-translator', '');
assert.ok(healthSeo, 'Expected /tools/health-translator SEO metadata');
assert.equal(healthSeo.tab, 'health');
const jsonLd = buildWebApplicationJsonLd(healthSeo, 'https://nepalai.tech');
assert.equal(jsonLd.url, 'https://nepalai.tech/tools/health-translator');

console.log('✅ All Lab Report & Prescription Translator tests passed cleanly!');
