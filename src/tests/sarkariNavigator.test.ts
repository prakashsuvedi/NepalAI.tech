import assert from 'node:assert/strict';
import {
  SARKARI_WORKFLOWS,
  findSarkariWorkflow,
} from '../utils/sarkariNavigatorEngine';
import { resolveToolFromUrl, buildWebApplicationJsonLd } from '../utils/toolSeo';

console.log('Running Sarkari Kaam Zero-Mistake Counter Navigator tests...');

// 1. Validate all 7 workflows have docs, counter steps, fees, and rejection tips
assert.equal(SARKARI_WORKFLOWS.length, 7);
SARKARI_WORKFLOWS.forEach((wf) => {
  assert.ok(wf.requiredDocs.length >= 2, `Expected requiredDocs for ${wf.id}`);
  assert.ok(wf.counterSteps.length >= 2, `Expected counterSteps for ${wf.id}`);
  assert.ok(wf.commonMistakes.length >= 1, `Expected commonMistakes for ${wf.id}`);
  assert.ok(wf.officialPortal.startsWith('https://'), `Expected https portal for ${wf.id}`);
});

// 2. Bilingual query resolution
assert.equal(findSarkariWorkflow('driving license renewal')?.id, 'driving_license');
assert.equal(findSarkariWorkflow('मालपोत जग्गा पास')?.id, 'land_malpot');
assert.equal(findSarkariWorkflow('पुलिस रिपोर्ट clearance')?.id, 'police_clearance');
assert.equal(findSarkariWorkflow('passport')?.id, 'passport');

// 3. Individual SEO route for /tools/sarkari-guide
const sarkariSeo = resolveToolFromUrl('/tools/sarkari-guide', '');
assert.ok(sarkariSeo, 'Expected /tools/sarkari-guide SEO metadata');
assert.equal(sarkariSeo.tab, 'sarkari');
const jsonLd = buildWebApplicationJsonLd(sarkariSeo, 'https://nepalai.tech');
assert.equal(jsonLd.url, 'https://nepalai.tech/tools/sarkari-guide');

console.log('✅ All Sarkari Kaam Zero-Mistake Counter Navigator tests passed cleanly!');
