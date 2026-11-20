import assert from 'node:assert/strict';
import {
  TOOL_SEO_REGISTRY,
  getToolSeoBySlug,
  getToolSeoByTab,
  resolveToolFromUrl,
  buildWebApplicationJsonLd,
} from '../utils/toolSeo';
import {
  transliterateRomanToDevanagari,
  transliterateCompletedWordsOnSpace,
} from '../utils/nepaliTextConverter';
import {
  buildSovereignLetterDraft,
  LETTER_STARTER_PROMPTS,
  VOICE_SAMPLE_SCENARIOS,
} from '../utils/letterDrafter';

console.log('Running Tool SEO & Romanized Nepali Transliteration unit tests...');

// 1. Ensure EV Tax, NEPSE, IT Export, and Bullion have individual slugs & metadata
const requiredSlugs = ['ev-tax', 'nepse', 'it-export', 'bullion'];
for (const slug of requiredSlugs) {
  const meta = getToolSeoBySlug(slug);
  assert.ok(meta, `Missing SEO metadata for ${slug}`);
  assert.ok(meta.title.length >= 25 && meta.title.length <= 70, `Title length check failed for ${slug}: ${meta.title.length}`);
  assert.ok(meta.description.length >= 100 && meta.description.length <= 180, `Description length check failed for ${slug}`);
  assert.ok(meta.ogTitle.length > 10, `Missing ogTitle for ${slug}`);
  assert.ok(meta.ogDescription.length > 40, `Missing ogDescription for ${slug}`);

  const jsonLd = buildWebApplicationJsonLd(meta, 'https://nepalai.tech');
  assert.equal(jsonLd['@type'], 'WebApplication');
  assert.equal(jsonLd.url, `https://nepalai.tech/tools/${slug}`);
  assert.equal(jsonLd.offers.price, '0');
  assert.equal(jsonLd.offers.priceCurrency, 'NPR');
  assert.ok(Array.isArray(jsonLd.featureList) && jsonLd.featureList.length >= 3);
}

// 2. Ensure URL resolution works for /tools/:slug and ?tool= query param
assert.equal(resolveToolFromUrl('/tools/ev-tax', '')?.tab, 'ev');
assert.equal(resolveToolFromUrl('/tools/nepse/', '')?.tab, 'nepse');
assert.equal(resolveToolFromUrl('/tools/it-export', '')?.tab, 'it_export');
assert.equal(resolveToolFromUrl('/tools/bullion', '')?.tab, 'bullion');
assert.equal(resolveToolFromUrl('/', '?tool=ward-letter')?.tab, 'letter');
assert.equal(getToolSeoByTab('bullion')?.slug, 'bullion');
assert.ok(TOOL_SEO_REGISTRY.length >= 10);

// 3. Romanized Nepali -> Devanagari conversion
assert.equal(transliterateRomanToDevanagari('namaste nepal'), 'नमस्ते नेपाल');
assert.equal(
  transliterateRomanToDevanagari('malai 3 din ko bida chahiyeko chha.'),
  'मलाई ३ दिन को बिदा चाहिएको छ.'
);
assert.equal(
  transliterateRomanToDevanagari('malai 3 din ko bida chahiyeko chha.', true),
  'मलाई ३ दिन को बिदा चाहिएको छ।'
);
assert.equal(
  transliterateRomanToDevanagari('shreeman adhyaksha kathmandu'),
  'श्रीमान् अध्यक्षज्यू काठमाडौं'
);
// Mixed Devanagari + Roman text should preserve existing Devanagari intact
assert.equal(
  transliterateRomanToDevanagari('मेरो naam प्रकाश ho'),
  'मेरो नाम प्रकाश हो'
);
// Space-aware live typing should convert finished words and keep partial word untouched
assert.equal(
  transliterateCompletedWordsOnSpace('namaste nepa'),
  'नमस्ते nepa'
);
assert.equal(
  transliterateCompletedWordsOnSpace('namaste nepal '),
  'नमस्ते नेपाल '
);

// 4. Sovereign & AI Letter Drafter across personas & Roman Nepali / English
const studentRomanDraft = buildSovereignLetterDraft({
  prompt: 'malai 3 din birami bida chahiyeko chha',
  persona: 'student',
  applicantName: 'सुमन थापा',
  applicantAddress: 'पोखरा-८, कास्की',
});
assert.ok(studentRomanDraft.subject.includes('बिदा'));
assert.ok(studentRomanDraft.letterBody.includes('सुमन थापा'));
assert.ok(studentRomanDraft.letterBody.includes('पोखरा-८, कास्की'));
assert.ok(studentRomanDraft.letterBody.includes('बिदा'));

const bankDollarDraft = buildSovereignLetterDraft({
  prompt: 'bank ma $500 dollar card ko lagi nibedan',
  persona: 'business',
});
assert.ok(bankDollarDraft.officeName.includes('बैंक'));
assert.ok(bankDollarDraft.subject.includes('डलर कार्ड'));

const marketerEnglishDraft = buildSovereignLetterDraft({
  prompt: 'Dashain 25% discount offer letter for loyal clients',
  persona: 'marketer',
  applicantName: 'Aarav Nepal',
  language: 'en',
});
assert.ok(marketerEnglishDraft.letterBody.includes('Aarav Nepal'));
assert.ok(marketerEnglishDraft.letterBody.includes('Dashain 25% discount offer'));

const homemakerMeterDraft = buildSovereignLetterDraft({
  prompt: 'ghar ma bijuli meter ra khanepani dhara jadan sifaris',
  persona: 'homemaker',
});
assert.ok(homemakerMeterDraft.subject.includes('मिटर'));
assert.ok(Array.isArray(homemakerMeterDraft.checklist) && homemakerMeterDraft.checklist.length >= 2);
assert.ok(homemakerMeterDraft.recommendedOffice && homemakerMeterDraft.estimatedFee);
assert.ok(VOICE_SAMPLE_SCENARIOS.length >= 4);
for (const scenario of VOICE_SAMPLE_SCENARIOS) {
  const voiceRes = buildSovereignLetterDraft({
    prompt: scenario.spokenText,
    persona: scenario.persona,
  });
  assert.ok(voiceRes.letterBody.length > 80);
  assert.ok(Array.isArray(voiceRes.checklist) && voiceRes.checklist.length >= 2);
}
assert.ok(LETTER_STARTER_PROMPTS.student.length >= 3);
assert.ok(LETTER_STARTER_PROMPTS.homemaker.length >= 3);

console.log('✅ All Tool SEO, Romanized Nepali & Voice-to-PDF tests passed cleanly!');
