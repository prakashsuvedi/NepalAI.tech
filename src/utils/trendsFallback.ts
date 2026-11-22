import {
  CURATED_SEASONAL_BENCHMARKS,
  buildSeasonalCurveSeries,
  computeSeasonalDirection,
  buildFallbackTriScriptVariants,
  normalizeKeyword,
  parseTrafficBandNumber,
  TrendVelocityPoint,
  TriScriptVariantRow,
} from './trendsEngine';

const API_BASE = ((import.meta as any).env?.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export function resolveApiUrl(path: string): string {
  if (!path.startsWith('/')) return path;
  return API_BASE ? `${API_BASE}${path}` : path;
}

/**
 * Safely fetches JSON from an API endpoint.
 * Returns `isHtmlFallback: true` instead of throwing `Unexpected token '<', "<!doctype "... is not valid JSON`
 * when static hosting (e.g. cPanel Apache) serves HTML for missing /api/* routes.
 */
export async function safeFetchJson<T = any>(
  url: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T | null; isHtmlFallback: boolean }> {
  try {
    const resp = await fetch(resolveApiUrl(url), init);
    const contentType = resp.headers.get('content-type') || '';
    const text = await resp.text();
    const trimmed = text.trim();

    if (
      trimmed.startsWith('<') ||
      contentType.toLowerCase().includes('text/html')
    ) {
      return { ok: false, status: resp.status, data: null, isHtmlFallback: true };
    }

    if (!trimmed) {
      return { ok: resp.ok, status: resp.status, data: null, isHtmlFallback: false };
    }

    const parsed = JSON.parse(trimmed) as T;
    return { ok: resp.ok, status: resp.status, data: parsed, isHtmlFallback: false };
  } catch {
    return { ok: false, status: 0, data: null, isHtmlFallback: false };
  }
}

export interface CuratedTrendRecord {
  id: string;
  slug: string;
  keyword: string;
  keywordNormalized: string;
  country: string;
  language: string;
  category: string;
  audienceSegment: 'nepal_local' | 'diaspora' | 'global_nepali';
  trafficBand: string;
  numericTrafficFloor: number;
  trendScore: number;
  aiWhyTrending: string;
  citations: Array<{ title: string; url: string; source: string }>;
  relatedQueries: string[];
  triScriptVariants: TriScriptVariantRow[];
  linkedToolTab?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  newsItems: Array<{
    id: string;
    title: string;
    url: string;
    source: string;
    snippet?: string;
    publishedAt: string;
  }>;
  snapshots: Array<{
    id: string;
    capturedAt: string;
    rankPosition: number;
    trafficBand: string;
    numericTrafficFloor: number;
    velocityDelta: number;
  }>;
}

const nowMinusMinutes = (mins: number) => new Date(Date.now() - mins * 60_000).toISOString();

function makeCuratedItem(input: {
  id: string;
  slug: string;
  keyword: string;
  country: string;
  language: string;
  category: string;
  audienceSegment: 'nepal_local' | 'diaspora' | 'global_nepali';
  trafficBand: string;
  trendScore: number;
  aiWhyTrending: string;
  minsAgo: number;
  sourceTitle: string;
  sourceName: string;
  linkedToolTab?: string;
}): CuratedTrendRecord {
  const seen = nowMinusMinutes(input.minsAgo);
  const firstSeen = nowMinusMinutes(input.minsAgo + 180);
  const floor = parseTrafficBandNumber(input.trafficBand);
  const analysis = buildFallbackTriScriptVariants(input.keyword);

  return {
    id: input.id,
    slug: input.slug,
    keyword: input.keyword,
    keywordNormalized: normalizeKeyword(input.keyword),
    country: input.country,
    language: input.language,
    category: input.category,
    audienceSegment: input.audienceSegment,
    trafficBand: input.trafficBand,
    numericTrafficFloor: floor,
    trendScore: input.trendScore,
    aiWhyTrending: input.aiWhyTrending,
    citations: [
      {
        title: input.sourceTitle,
        url: `https://nepalai.tech/trending/nepal/${input.category}`,
        source: input.sourceName,
      },
    ],
    relatedQueries: analysis.relatedQueries,
    triScriptVariants: analysis.variants,
    linkedToolTab: input.linkedToolTab || null,
    imageUrl: null,
    isActive: true,
    firstSeenAt: firstSeen,
    lastSeenAt: seen,
    newsItems: [
      {
        id: `news_${input.id}`,
        title: input.sourceTitle,
        url: `https://nepalai.tech/trending/nepal/${input.category}`,
        source: input.sourceName,
        snippet: input.aiWhyTrending,
        publishedAt: seen,
      },
    ],
    snapshots: [
      {
        id: `snap_${input.id}_1`,
        capturedAt: firstSeen,
        rankPosition: 4,
        trafficBand: input.trafficBand,
        numericTrafficFloor: Math.max(1000, Math.round(floor * 0.6)),
        velocityDelta: 12,
      },
      {
        id: `snap_${input.id}_2`,
        capturedAt: seen,
        rankPosition: 1,
        trafficBand: input.trafficBand,
        numericTrafficFloor: floor,
        velocityDelta: 24,
      },
    ],
  };
}

export const CURATED_NEPAL_TRENDS: CuratedTrendRecord[] = [
  makeCuratedItem({
    id: 'cur_npl_cricket',
    slug: 'nepal-premier-league-npl-live-points-table',
    keyword: 'Nepal Premier League (NPL) Live Standings',
    country: 'NP',
    language: 'en',
    category: 'sports-npl',
    audienceSegment: 'nepal_local',
    trafficBand: '50K+ searches',
    trendScore: 94,
    aiWhyTrending:
      'High domestic and diaspora match-day search interest around TU Cricket Ground fixtures, qualifiers, and squad updates.',
    minsAgo: 18,
    sourceTitle: 'NPL playoff race heats up at TU International Cricket Ground',
    sourceName: 'NepalAI Sports Desk',
  }),
  makeCuratedItem({
    id: 'cur_nepse_index',
    slug: 'nepse-live-index-broker-commission-cgt-2081',
    keyword: 'NEPSE Live Market & Bonus Share Adjustment',
    country: 'NP',
    language: 'en',
    category: 'business-finance',
    audienceSegment: 'nepal_local',
    trafficBand: '20K+ searches',
    trendScore: 89,
    aiWhyTrending:
      'Investors tracking banking/hydropower quarterly reports, book-close price adjustments, and 5%/7.5% CGT rules.',
    minsAgo: 32,
    sourceTitle: 'NEPSE turnover concentrates in hydropower and commercial banking scrips',
    sourceName: 'Kathmandu Market Desk',
    linkedToolTab: 'nepse',
  }),
  makeCuratedItem({
    id: 'cur_gold_fenegosida',
    slug: 'nepal-today-gold-rate-tola-fenegosida',
    keyword: 'Today Gold & Silver Price in Nepal (FENEGOSIDA)',
    country: 'NP',
    language: 'mixed',
    category: 'business-finance',
    audienceSegment: 'nepal_local',
    trafficBand: '50K+ searches',
    trendScore: 91,
    aiWhyTrending:
      'Wedding season demand and global bullion shifts keep 24K Chhapawal gold per tola and 2% luxury tax calculations trending.',
    minsAgo: 45,
    sourceTitle: 'Bullion traders track international spot swings and local tola benchmarks',
    sourceName: 'FENEGOSIDA Bulletin',
    linkedToolTab: 'bullion',
  }),
  makeCuratedItem({
    id: 'cur_it_export_95ka',
    slug: 'nepal-it-export-5-percent-tds-section-95ka',
    keyword: 'Section 95Ka 5% IT Export Tax & USD Remittance',
    country: 'NP',
    language: 'en',
    category: 'technology-ai',
    audienceSegment: 'global_nepali',
    trafficBand: '10K+ searches',
    trendScore: 86,
    aiWhyTrending:
      'Nepali software engineers and remote agencies verify Section 95Ka 5% final TDS and NRB bank declaration letters.',
    minsAgo: 64,
    sourceTitle: 'Remote IT service inflows benefit from simplified 5% TDS documentation',
    sourceName: 'Nepal Tech Policy',
    linkedToolTab: 'it_export',
  }),
  makeCuratedItem({
    id: 'cur_loksewa_exam',
    slug: 'loksewa-aayog-vacancy-notice-nepal-2082',
    keyword: 'Lok Sewa Aayog Vacancy & Exam Routine',
    country: 'NP',
    language: 'ne',
    category: 'jobs-education',
    audienceSegment: 'nepal_local',
    trafficBand: '20K+ searches',
    trendScore: 85,
    aiWhyTrending:
      'Weekly Lok Sewa Aayog advertisements, admit card downloads, and Nayab Subba / Officer exam centers across 77 districts.',
    minsAgo: 95,
    sourceTitle: 'Candidates check Lok Sewa online portal for upcoming written exam schedules',
    sourceName: 'Sarkari Portal Digest',
    linkedToolTab: 'sarkari',
  }),
  makeCuratedItem({
    id: 'cur_sarkari_passport',
    slug: 'epassport-nid-appointment-kathmandu-nepal',
    keyword: 'e-Passport & National ID Biometric Appointment',
    country: 'NP',
    language: 'en',
    category: 'politics-governance',
    audienceSegment: 'nepal_local',
    trafficBand: '20K+ searches',
    trendScore: 83,
    aiWhyTrending:
      'Daily slot openings at Department of Passports (Tripureshwor) and DAO counters for National ID pre-enrollment.',
    minsAgo: 120,
    sourceTitle: 'DoP releases daily morning pre-enrollment slots for urgent e-Passport renewals',
    sourceName: 'Kathmandu Civic Desk',
    linkedToolTab: 'sarkari',
  }),
  makeCuratedItem({
    id: 'cur_ev_road_tax',
    slug: 'ev-annual-road-tax-nepal-charging-tariff',
    keyword: 'EV Road Tax & NEA Fast Charging Rates Nepal',
    country: 'NP',
    language: 'en',
    category: 'technology-ai',
    audienceSegment: 'nepal_local',
    trafficBand: '10K+ searches',
    trendScore: 81,
    aiWhyTrending:
      'Growing BYD, Tata, Deepal, and Omoda adoption sparks queries on provincial kW road tax slabs and NEA ToD charging tariffs.',
    minsAgo: 145,
    sourceTitle: 'Highway DC fast chargers expand along Mugling, Kurintar, and Bardibas corridors',
    sourceName: 'Nepal Mobility Watch',
    linkedToolTab: 'ev',
  }),
  makeCuratedItem({
    id: 'cur_diaspora_aus_remit',
    slug: 'usd-aud-to-npr-remittance-rate-nepal',
    keyword: 'USD / AUD / GBP to NPR Remittance Rate',
    country: 'AU',
    language: 'en',
    category: 'diaspora-remittance',
    audienceSegment: 'diaspora',
    trafficBand: '20K+ searches',
    trendScore: 87,
    aiWhyTrending:
      'Nepali students and professionals in Australia, US, UAE, UK, and Japan track NRB reference rates for transfers home.',
    minsAgo: 52,
    sourceTitle: 'NRB posts daily foreign exchange buy/sell guide for remittance corridors',
    sourceName: 'NRB Forex Feed',
    linkedToolTab: 'fx',
  }),
];

export function getCuratedNepalTrendsFallback(opts: {
  category?: string;
  search?: string;
  limit?: number;
}) {
  const cat = (opts.category || 'all').trim();
  const q = (opts.search || '').trim().toLowerCase();
  const limit = opts.limit || 20;

  let filtered = CURATED_NEPAL_TRENDS.filter((item) => {
    if (cat && cat !== 'all' && item.category !== cat) return false;
    if (q) {
      const hay = `${item.keyword} ${item.aiWhyTrending} ${item.category}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (filtered.length === 0 && !q) {
    filtered = CURATED_NEPAL_TRENDS;
  }

  return filtered.slice(0, limit);
}

export function getCuratedDiasporaTrendsFallback(country = 'ALL', search = '') {
  const q = search.trim().toLowerCase();
  const list = CURATED_NEPAL_TRENDS.filter((t) => {
    if (country !== 'ALL' && t.country !== country && t.audienceSegment !== 'diaspora') {
      return false;
    }
    if (q && !t.keyword.toLowerCase().includes(q) && !t.aiWhyTrending.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });
  return list.length > 0 ? list : CURATED_NEPAL_TRENDS.slice(0, 6);
}

export function getCuratedTrendDetailFallback(slug: string) {
  const found =
    CURATED_NEPAL_TRENDS.find((t) => t.slug === slug) || CURATED_NEPAL_TRENDS[0];
  return {
    ...found,
    briefs: [
      {
        id: `brief_${found.id}`,
        createdAt: found.lastSeenAt,
        outlineJson: {
          headlineEn: `${found.keyword} — Practical Nepal Explainer`,
          headlineNe: `${found.keyword} — नेपाली विश्लेषण र मार्गदर्शिका`,
          hookEn: found.aiWhyTrending,
          hookNe: `${found.keyword} सम्बन्धी ताजा जानकारी, नियम र आधिकारिक दररेटको संक्षिप्त विवरण।`,
          keyPoints: [
            found.aiWhyTrending,
            'Verify official notices directly against NRB, IRD, FENEGOSIDA, or Department of Passports.',
            'Use NepalAI built-in Daily Utilities for exact NPR tax, forex, and document calculations.',
          ],
          seoKeywords: found.relatedQueries,
          faqQuestion: `Why is "${found.keyword}" trending in Nepal right now?`,
          faqAnswer: found.aiWhyTrending,
        },
      },
    ],
  };
}

export function getCuratedSeasonalFallback(pillar = 'all', search = '') {
  const currentMonth = new Date().getUTCMonth() + 1;
  const q = search.trim().toLowerCase();
  const filtered = CURATED_SEASONAL_BENCHMARKS.filter((b) => {
    if (pillar !== 'all' && b.pillar !== pillar) return false;
    if (q) {
      const hay = `${b.keyword} ${b.romanizedNepali} ${b.devanagariVariant} ${b.insightNote}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const benchmarks = filtered.map((b) => {
    const dir = computeSeasonalDirection(b.monthlyIndex, currentMonth);
    return {
      ...b,
      currentInterestScore: dir.currentScore,
      direction: dir.direction,
      dataSource: 'curated_benchmark',
    };
  });

  const curvePoints: TrendVelocityPoint[] = buildSeasonalCurveSeries(filtered);

  return {
    success: true,
    curvePoints,
    benchmarks,
    risingLiveTrends: CURATED_NEPAL_TRENDS.slice(0, 5).map((t) => ({
      id: t.id,
      slug: t.slug,
      keyword: t.keyword,
      category: t.category,
      trafficBand: t.trafficBand,
      trendScore: t.trendScore,
      latestVelocityDelta: 8,
      aiWhyTrending: t.aiWhyTrending,
    })),
    trendsApiConfigured: false,
    liveApiEnrichedCount: 0,
  };
}

export function getCuratedKeywordExploreFallback(keyword: string) {
  const out = buildFallbackTriScriptVariants(keyword);
  const interestScore = Math.round((out.localIntentScore + out.diasporaIntentScore) / 2);
  const interestSeries = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86_400_000).toISOString().slice(0, 10);
    return { date: d, score: Math.max(20, Math.min(100, interestScore - 10 + i * 3)) };
  });

  return {
    id: `kw_${normalizeKeyword(keyword).replace(/\s+/g, '_')}`,
    keyword,
    country: 'NP',
    detectedScript: out.detectedScript,
    category: out.category,
    interestScore,
    direction: out.direction,
    localIntentScore: out.localIntentScore,
    diasporaIntentScore: out.diasporaIntentScore,
    dataSource: 'curated_model',
    interestSeries,
    relatedQueries: out.relatedQueries,
    contentAngles: out.contentAngles,
    variants: out.variants,
  };
}
