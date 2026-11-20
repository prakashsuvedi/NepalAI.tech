import {
  TREND_CATEGORIES,
  parseGoogleTrendsRssXml,
  parseTrafficBandNumber,
  classifyTrendByRules,
  validateGroundedCitations,
  detectScriptLanguage,
  toTrendSlug,
  buildFallbackTriScriptVariants,
  isNepalRelevantForDiaspora,
  buildKeywordCsvExport,
  buildDigestEmailContent,
  buildVelocitySeriesFromSnapshots,
  buildVelocitySeriesFromInterest,
  evaluateVelocityThresholdAlerts,
  buildVelocityThresholdEmailContent,
  SEASONAL_PILLARS,
  CURATED_SEASONAL_BENCHMARKS,
  computeSeasonalDirection,
  buildSeasonalCurveSeries,
  normalizeWhatsappNumber,
  isValidWhatsappNumber,
  buildWhatsappDigestMessage,
  buildWhatsappThresholdMessage,
} from '../utils/trendsEngine';
import { resolveTrendsRouteFromPath, buildTrendDetailSeo, buildTrendsListingSeo } from '../utils/trendsSeo';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

console.log('--- Running Nepal AI + Trends Engine Tests ---');

// 1. 11 Canonical Nepal Categories
assert(TREND_CATEGORIES.length === 11, `Expected 11 canonical categories, got ${TREND_CATEGORIES.length}`);

// 2. Zero-dependency RSS XML parser
const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:ht="https://trends.google.com/trending/rss" version="2.0">
  <channel>
    <item>
      <title>Janakpur Bolts vs Chitwan Rhinos</title>
      <ht:approx_traffic>50K+</ht:approx_traffic>
      <pubDate>Fri, 14 Nov 2026 09:30:00 +0545</pubDate>
      <link>https://trends.google.com/trending/rss?geo=NP</link>
      <ht:picture>https://example.com/npl.jpg</ht:picture>
      <ht:news_item>
        <ht:news_item_title>Janakpur Bolts edge Chitwan Rhinos in NPL thriller</ht:news_item_title>
        <ht:news_item_url>https://example.com/news/npl-match</ht:news_item_url>
        <ht:news_item_source>OnlineKhabar</ht:news_item_source>
        <ht:news_item_snippet>A packed stadium watched the Nepal Premier League clash.</ht:news_item_snippet>
      </ht:news_item>
    </item>
    <item>
      <title>Janakpur Bolts vs Chitwan Rhinos</title>
      <ht:approx_traffic>50K+</ht:approx_traffic>
    </item>
    <item>
      <title>हिमपातको सम्भावना</title>
      <ht:approx_traffic>5K+</ht:approx_traffic>
      <ht:news_item>
        <ht:news_item_title>उच्च पहाडी क्षेत्रमा हिमपातको सम्भावना</ht:news_item_title>
        <ht:news_item_url>https://example.com/news/weather</ht:news_item_url>
        <ht:news_item_source>Setopati</ht:news_item_source>
      </ht:news_item>
    </item>
  </channel>
</rss>`;

const parsed = parseGoogleTrendsRssXml(sampleXml);
assert(parsed.length === 2, `Expected deduplicated 2 items, got ${parsed.length}`);
assert(parsed[0].numericTrafficFloor === 50000, `Expected 50K+ -> 50000, got ${parsed[0].numericTrafficFloor}`);
assert(parsed[0].newsItems.length === 1 && parsed[0].newsItems[0].source === 'OnlineKhabar', 'Must parse ht:news_item');
assert(parseTrafficBandNumber('100K+') === 100000, '100K+ must parse to 100000');
assert(toTrendSlug('Janakpur Bolts vs Chitwan Rhinos') === 'janakpur-bolts-vs-chitwan-rhinos', 'Slug normalization check');

// 3. Rules-first classifier + tool synergy + script detection
const sportClass = classifyTrendByRules('Janakpur Bolts vs Chitwan Rhinos');
assert(sportClass.category === 'sports-npl' && sportClass.confidence === 'high', 'NPL cricket must classify as sports-npl');

const nbaClass = classifyTrendByRules('Spurs vs Warriors');
assert(nbaClass.category === 'sports-npl', 'Versus matchup must classify under sports');

const colorOsClass = classifyTrendByRules('ColorOS 15 Android update');
assert(colorOsClass.category === 'technology-ai', 'Mobile OS must classify under technology-ai');

const weatherClass = classifyTrendByRules('हिमपातको सम्भावना');
assert(weatherClass.category === 'weather-disasters' && weatherClass.language === 'ne', 'Devanagari weather must classify accurately');

const nepseClass = classifyTrendByRules('NEPSE bonus share adjustment');
assert(nepseClass.category === 'business-finance' && nepseClass.linkedToolTab === 'nepse', 'NEPSE trend should link nepse tool');

// 4. Citation Grounding Validator (rejects hallucinated URLs)
const grounded = validateGroundedCitations(
  [{ url: 'https://hallucinated-fake.example/xyz' }, { url: 'https://example.com/news/npl-match' }],
  parsed[0].newsItems
);
assert(grounded.length === 1 && grounded[0].url === 'https://example.com/news/npl-match', 'Must strip unverified citation URLs');

// 5. Tri-Script Keyword Expansion & Diaspora Filtering
assert(detectScriptLanguage('AI jobs Nepal ko vacancy') === 'romanized-ne', 'Detect Romanized Nepali');
assert(detectScriptLanguage('एआई जागिर नेपाल') === 'ne', 'Detect Devanagari');
const dentistAnalysis = buildFallbackTriScriptVariants('dentist Kathmandu');
assert(dentistAnalysis.variants.some((v) => v.romanizedNepali.includes('kathmandu ma')), 'Must generate Romanized commercial variant');
assert(isNepalRelevantForDiaspora('Flights to Kathmandu cheap') === true, 'Diaspora filter matches Kathmandu');
assert(isNepalRelevantForDiaspora('Super Bowl score US') === false, 'Diaspora filter excludes unrelated US query');

// 6. Phase 3: CSV Export & Personalized Digest Builder
const csv = buildKeywordCsvExport(dentistAnalysis);
assert(csv.startsWith('Base Keyword,English Variant,Romanized Nepali'), 'CSV must start with canonical header');
assert(csv.includes('kathmandu ma ramro dentist'), 'CSV must contain Romanized variant');

const digest = buildDigestEmailContent({
  originUrl: 'https://nepalai.tech',
  cadence: 'daily',
  preferredLanguage: 'bilingual',
  categories: ['sports-npl'],
  trends: [
    {
      slug: 'janakpur-bolts-vs-chitwan-rhinos',
      keyword: 'Janakpur Bolts vs Chitwan Rhinos',
      category: 'sports-npl',
      trafficBand: '50K+',
      trendScore: 92,
      aiWhyTrending: 'Nepal Premier League cricket live interest.',
      relatedQueries: ['NPL live score', 'Janakpur Bolts squad'],
      lastSeenAt: '2026-11-14T10:00:00Z',
    },
  ],
  unsubscribeUrl: 'https://nepalai.tech/api/alerts/unsubscribe?token=abc',
});
assert(
  digest.subject.includes('Daily Digest') &&
    digest.html.includes('Janakpur Bolts') &&
    digest.html.includes('Velocity 92/100') &&
    digest.text.includes('NPL live score'),
  'Bilingual digest HTML, velocity score, and related queries valid'
);

const neDigest = buildDigestEmailContent({
  originUrl: 'https://nepalai.tech',
  cadence: 'breaking',
  preferredLanguage: 'ne',
  categories: ['technology-ai'],
  trends: [
    {
      slug: 'nepal-ai-jobs',
      keyword: 'AI Jobs Nepal',
      category: 'technology-ai',
      trafficBand: '10K+',
      aiWhyTrending: 'नेपालमा एआई रोजगारीको खोजी बढ्दैछ।',
      lastSeenAt: '2026-11-14T11:00:00Z',
    },
  ],
  unsubscribeUrl: 'https://nepalai.tech/api/alerts/unsubscribe?token=ne',
});
assert(neDigest.subject.includes('NepalAI ट्रेन्ड्स') && neDigest.html.includes('प्रविधि र एआई'), 'Nepali digest localized cleanly');

// 7. D3 Velocity Series Builders
const snapSeries = buildVelocitySeriesFromSnapshots({
  snapshots: [
    {
      capturedAt: '2026-11-14T08:00:00Z',
      rankPosition: 4,
      trafficBand: '5K+',
      numericTrafficFloor: 5000,
      velocityDelta: 0,
    },
    {
      capturedAt: '2026-11-14T09:00:00Z',
      rankPosition: 1,
      trafficBand: '50K+',
      numericTrafficFloor: 50000,
      velocityDelta: 45000,
    },
  ],
});
assert(snapSeries.length === 2, 'Snapshot velocity series must preserve ordered points');
assert(snapSeries[1].velocityScore > snapSeries[0].velocityScore, 'Higher rank + traffic floor produces higher velocity score');
assert(snapSeries[1].velocityDelta === 45000, 'Velocity delta preserved');

const interestPoints = buildVelocitySeriesFromInterest({
  series: [
    { date: '2026-11-10', score: 42 },
    { date: '2026-11-11', score: 78 },
  ],
  keyword: 'AI jobs Nepal',
  fallbackScore: 78,
});
assert(interestPoints.length === 2 && interestPoints[1].velocityDelta === 36, 'Interest series computes exact point-to-point delta');

// 8. Canonical Route & SEO Resolution
assert(resolveTrendsRouteFromPath('/trending/nepal')?.view === 'nepal', 'Route /trending/nepal');
assert(resolveTrendsRouteFromPath('/trending/nepal/technology-ai')?.view === 'category', 'Category route');
assert(resolveTrendsRouteFromPath('/trending/nepal/janakpur-bolts-vs-chitwan-rhinos')?.view === 'detail', 'Detail slug route');
assert(resolveTrendsRouteFromPath('/trending/diaspora')?.view === 'diaspora', 'Diaspora route');
assert(resolveTrendsRouteFromPath('/keywords/nepal')?.view === 'keywords', 'Keywords route');
assert(resolveTrendsRouteFromPath('/keywords/nepal/business')?.view === 'business-keywords', 'Business keywords route');
assert(resolveTrendsRouteFromPath('/trending/api')?.view === 'api-vault', 'API Vault route');

const detailSeo = buildTrendDetailSeo(
  {
    slug: 'janakpur-bolts-vs-chitwan-rhinos',
    keyword: 'Janakpur Bolts vs Chitwan Rhinos',
    category: 'sports-npl',
    trafficBand: '50K+',
    aiWhyTrending: 'Nepal Premier League match coverage.',
    citations: [{ title: 'Match Report', url: 'https://example.com/news/npl-match', source: 'OnlineKhabar' }],
  },
  'https://nepalai.tech'
);
assert(detailSeo.canonicalPath === '/trending/nepal/janakpur-bolts-vs-chitwan-rhinos', 'Canonical path matches');
assert(JSON.stringify(detailSeo.jsonLd).includes('NewsArticle') && JSON.stringify(detailSeo.jsonLd).includes('FAQPage'), 'Includes NewsArticle and FAQPage schema');

// 9. Custom Velocity Threshold Alert Evaluator & SMTP Content Builder
const nowMs = new Date('2026-11-19T12:00:00Z').getTime();
const candidateTrends = [
  {
    id: 't1',
    slug: 'nepse-bonus-share',
    keyword: 'NEPSE Bonus Share',
    keywordNormalized: 'nepse bonus share',
    country: 'NP',
    category: 'business-finance',
    trafficBand: '20K+',
    trendScore: 86,
    latestVelocityDelta: 15000,
    aiWhyTrending: 'Listed banks announced dividend and bonus shares.',
    lastSeenAt: '2026-11-19T11:45:00Z',
  },
  {
    id: 't2',
    slug: 'ai-jobs-nepal',
    keyword: 'AI Jobs Nepal',
    keywordNormalized: 'ai jobs nepal',
    country: 'NP',
    category: 'technology-ai',
    trafficBand: '5K+',
    trendScore: 68,
    latestVelocityDelta: 2000,
    aiWhyTrending: 'Local tech hiring spike.',
    lastSeenAt: '2026-11-19T11:45:00Z',
  },
];

const evalMatches = evaluateVelocityThresholdAlerts(
  [
    {
      id: 'rule_hit',
      email: 'analyst@nepalai.tech',
      keywordFilter: 'NEPSE',
      keywordNormalized: 'nepse',
      category: 'business-finance',
      country: 'NP',
      minVelocityScore: 80,
      minVelocityDelta: 5000,
      isActive: true,
      cooldownMinutes: 180,
      lastTriggeredAt: null,
      unsubscribeToken: 'tok_hit',
    },
    {
      id: 'rule_cooldown',
      email: 'analyst@nepalai.tech',
      keywordFilter: null,
      keywordNormalized: null,
      category: 'all',
      country: 'NP',
      minVelocityScore: 60,
      minVelocityDelta: 0,
      isActive: true,
      cooldownMinutes: 180,
      lastTriggeredAt: '2026-11-19T11:30:00Z',
      unsubscribeToken: 'tok_cool',
    },
    {
      id: 'rule_below',
      email: 'analyst@nepalai.tech',
      keywordFilter: null,
      keywordNormalized: null,
      category: 'technology-ai',
      country: 'NP',
      minVelocityScore: 75,
      minVelocityDelta: 0,
      isActive: true,
      cooldownMinutes: 180,
      lastTriggeredAt: null,
      unsubscribeToken: 'tok_below',
    },
  ],
  candidateTrends,
  nowMs
);
assert(evalMatches.length === 1 && evalMatches[0].alert.id === 'rule_hit', 'Must trigger only rules meeting threshold & outside cooldown');
assert(evalMatches[0].matchedTrends[0].slug === 'nepse-bonus-share', 'Matched trend must be NEPSE Bonus Share');

const thresholdMail = buildVelocityThresholdEmailContent({
  originUrl: 'https://nepalai.tech',
  alert: evalMatches[0].alert,
  matchedTrends: evalMatches[0].matchedTrends,
  unsubscribeUrl: 'https://nepalai.tech/api/alerts/thresholds/unsubscribe?token=tok_hit',
});
assert(thresholdMail.subject.includes('>= 80/100') && thresholdMail.html.includes('NEPSE Bonus Share'), 'Threshold email formatting valid');

// 10. Phase 3B: Seasonal Pillars, Curve Builder, WhatsApp Relay Formatters & Seasonal Route
assert(SEASONAL_PILLARS.length === 4, `Expected 4 seasonal pillars, got ${SEASONAL_PILLARS.length}`);
assert(CURATED_SEASONAL_BENCHMARKS.length >= 10, 'Must seed >= 10 Nepal seasonal benchmarks');

const octFestDir = computeSeasonalDirection([20, 22, 25, 28, 30, 34, 42, 60, 88, 100, 85, 30], 10); // Month 10 (Oct) = 100
assert(octFestDir.direction === 'peak' && octFestDir.currentScore === 100, `Expected peak at max month 10, got ${octFestDir.direction}`);

const augPrePeakDir = computeSeasonalDirection([20, 22, 25, 28, 30, 34, 42, 60, 88, 100, 85, 30], 8); // Month 8 (Aug) -> rising into Sep (88)
assert(augPrePeakDir.direction === 'pre-peak' || augPrePeakDir.direction === 'rising', `Expected pre-peak/rising ahead of Dashain, got ${augPrePeakDir.direction}`);

const seasonalCurve = buildSeasonalCurveSeries(
  CURATED_SEASONAL_BENCHMARKS.filter((b) => b.pillar === 'festivals'),
  2026
);
assert(seasonalCurve.length === 12, `Expected 12 monthly points, got ${seasonalCurve.length}`);
assert(seasonalCurve[0].timestamp === '2026-01-15' && seasonalCurve[11].timestamp === '2026-12-15', 'Curve timestamps span Jan-Dec cleanly');

assert(normalizeWhatsappNumber('9841234567') === '+9779841234567', 'Normalize 10-digit Nepal mobile to +977 E.164');
assert(normalizeWhatsappNumber('00977 980-1112233') === '+9779801112233', 'Normalize 00-prefixed E.164');
assert(isValidWhatsappNumber('+9779841234567') === true, 'Valid Nepal WhatsApp number passes');
assert(isValidWhatsappNumber('12345') === false, 'Short invalid WhatsApp number rejected');

const waDigest = buildWhatsappDigestMessage({
  originUrl: 'https://nepalai.tech',
  cadence: 'daily',
  preferredLanguage: 'bilingual',
  trends: [
    {
      slug: 'dashain-flight-ticket',
      keyword: 'Dashain Flight Ticket',
      category: 'travel-tourism',
      trafficBand: '50K+',
      trendScore: 91,
      aiWhyTrending: 'Domestic airlines opened Dashain festive booking.',
      lastSeenAt: '2026-10-01T08:00:00Z',
    },
  ],
});
assert(waDigest.includes('Dashain Flight Ticket') && waDigest.includes('91/100'), 'WhatsApp digest formats trend and score');

const waThreshold = buildWhatsappThresholdMessage({
  originUrl: 'https://nepalai.tech',
  alert: evalMatches[0].alert,
  matchedTrends: evalMatches[0].matchedTrends,
});
assert(waThreshold.includes('>= 80/100') && waThreshold.includes('NEPSE Bonus Share'), 'WhatsApp threshold alert formats rule & match');

const seasonalRoute = resolveTrendsRouteFromPath('/trending/seasonal');
assert(seasonalRoute?.view === 'seasonal', 'Route /trending/seasonal resolves cleanly');
assert(resolveTrendsRouteFromPath('/keywords/nepal/seasonal')?.view === 'seasonal', 'Route /keywords/nepal/seasonal resolves cleanly');
const seasonalSeo = buildTrendsListingSeo({ view: 'seasonal' }, 'https://nepalai.tech');
assert(seasonalSeo.canonicalPath === '/trending/seasonal' && seasonalSeo.title.includes('Seasonal'), 'Seasonal SEO metadata valid');

console.log('✅ ALL NEPAL AI + TRENDS TESTS PASSED SUCCESSFULLY');
