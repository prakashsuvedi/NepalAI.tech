import assert from 'node:assert/strict';
import {
  CONTRACT_SAMPLE_DOCS,
  analyzeContractRiskFallback,
} from '../utils/contractRiskEngine';
import { resolveToolFromUrl, buildWebApplicationJsonLd } from '../utils/toolSeo';

console.log('Running Contract & Tamasuk Risk Scanner tests...');

// 1. Loan Tamasuk exceeding 10% legal interest & missing ward/witness check
const tamasukReport = analyzeContractRiskFallback({
  text: CONTRACT_SAMPLE_DOCS[1].text,
  docType: 'tamasuk_loan',
  language: 'ne',
});
assert.equal(tamasukReport.docType, 'tamasuk_loan');
assert.equal(tamasukReport.riskLevel, 'high');
assert.ok(tamasukReport.safetyScore < 55);
assert.ok(tamasukReport.redFlags.some((f) => f.id === 'flag_usury_interest'));
assert.ok(tamasukReport.redFlags.some((f) => f.id === 'flag_forfeit_seize'));
assert.ok(tamasukReport.missingProtections.length >= 2);
assert.ok(tamasukReport.questionsToAsk.length >= 2);

// 2. House rent deed unfair deposit forfeiture & 3-day eviction check
const rentReport = analyzeContractRiskFallback({
  text: CONTRACT_SAMPLE_DOCS[0].text,
  docType: 'rent_agreement',
  language: 'en',
});
assert.equal(rentReport.docType, 'rent_agreement');
assert.equal(rentReport.riskLevel, 'high');
assert.ok(rentReport.redFlags.some((f) => f.id === 'flag_privacy_eviction'));
assert.ok(rentReport.redFlags.some((f) => f.id === 'flag_rent_hike'));

// 3. Job offer bond & overtime check
const jobReport = analyzeContractRiskFallback({
  text: CONTRACT_SAMPLE_DOCS[2].text,
  docType: 'job_offer',
  language: 'en',
});
assert.equal(jobReport.docType, 'job_offer');
assert.equal(jobReport.riskLevel, 'high');
assert.ok(jobReport.redFlags.some((f) => f.id === 'flag_job_bond'));
assert.ok(jobReport.redFlags.some((f) => f.id === 'flag_overtime'));
assert.ok(jobReport.redFlags.some((f) => f.id === 'flag_asymmetric_notice'));

// 4. Individual SEO route for /tools/contract-risk
const contractSeo = resolveToolFromUrl('/tools/contract-risk', '');
assert.ok(contractSeo, 'Expected /tools/contract-risk SEO metadata');
assert.equal(contractSeo.tab, 'contract');
const jsonLd = buildWebApplicationJsonLd(contractSeo, 'https://nepalai.tech');
assert.equal(jsonLd.url, 'https://nepalai.tech/tools/contract-risk');

console.log('✅ All Contract & Tamasuk Risk Scanner tests passed cleanly!');
