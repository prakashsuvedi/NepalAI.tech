import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import {
  TREND_CATEGORIES,
  TrendCategorySlug,
  AudienceSegment,
  ParsedRssTrendItem,
  parseGoogleTrendsRssXml,
  classifyTrendByRules,
  validateGroundedCitations,
  buildDeterministicWhyTrending,
  isNepalRelevantForDiaspora,
  buildFallbackTriScriptVariants,
  KeywordAnalysisOutput,
  DIASPORA_COUNTRIES,
} from '../utils/trendsEngine.ts';
import {
  upsertTrendWithSnapshotAndNews,
  markInactiveMissingTrends,
  getTrendByNormalized,
  listTrendsFromDb,
} from '../db/trends.ts';

let geminiQuotaCooldownUntil = 0;

function isGeminiRateLimitError(err: any): boolean {
  const msg = String(err?.message || err || '');
  return (
    err?.status === 429 ||
    err?.code === 429 ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('Quota exceeded')
  );
}

function getServerGemini(): GoogleGenAI | null {
  if (Date.now() < geminiQuotaCooldownUntil) return null;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function generateGroundedTrendEnrichment(
  item: ParsedRssTrendItem,
  ruleClassification: ReturnType<typeof classifyTrendByRules>
): Promise<{
  category: TrendCategorySlug;
  audienceSegment: AudienceSegment;
  aiWhyTrending: string;
  citations: Array<{ title: string; url: string; source: string }>;
  relatedQueries: string[];
  triScriptVariants: Array<{
    baseKeyword: string;
    englishVariant: string;
    romanizedNepali: string;
    devanagariVariant: string;
    intentTag: string;
  }>;
  enrichedByAi: boolean;
}> {
  const ai = getServerGemini();
  const fallbackWhy = buildDeterministicWhyTrending(
    item.keyword,
    ruleClassification.category,
    item.trafficBand,
    item.newsItems
  );
  const fallbackCitations = validateGroundedCitations(undefined, item.newsItems);
  const fallbackAnalysis = buildFallbackTriScriptVariants(item.keyword);

  // Skip Gemini when API key missing/cooling down or when high-confidence rules + no multi-news context suffice
  if (!ai || (ruleClassification.confidence === 'high' && item.newsItems.length === 0)) {
    return {
      category: ruleClassification.category,
      audienceSegment: ruleClassification.audienceSegment,
      aiWhyTrending: fallbackWhy,
      citations: fallbackCitations,
      relatedQueries: fallbackAnalysis.relatedQueries,
      triScriptVariants: fallbackAnalysis.variants,
      enrichedByAi: false,
    };
  }

  try {
    const allowedCategories = TREND_CATEGORIES.map((c) => c.slug).join(', ');
    const newsContext =
      item.newsItems.length > 0
        ? item.newsItems
            .slice(0, 5)
            .map((n, i) => `[${i + 1}] Source: ${n.source} | Title: ${n.title} | URL: ${n.url}${n.snippet ? ` | Snippet: ${n.snippet}` : ''}`)
            .join('\n')
        : 'No news snippets returned in RSS item.';

    const prompt = `Analyze this live Nepal search trend strictly using the supplied RSS metadata and news links.
Do NOT invent statistics, dates, match scores, or causes not supported by the supplied news items. If news items are empty, state neutrally that live search interest is rising without fabricating specific events.

Keyword: "${item.keyword}"
Approximate Search Band: "${item.trafficBand}"
Suggested Rule Category: "${ruleClassification.category}" (confidence: ${ruleClassification.confidence})
Allowed Categories: ${allowedCategories}

Supplied News Items:
${newsContext}`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'You are a neutral Nepal search intelligence editor. Return valid JSON matching the schema. Cite only supplied news URLs.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              audienceSegment: { type: Type.STRING },
              whyTrending: { type: Type.STRING },
              citedUrls: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              relatedQueries: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              englishVariant: { type: Type.STRING },
              romanizedNepali: { type: Type.STRING },
              devanagariVariant: { type: Type.STRING },
            },
            required: ['category', 'audienceSegment', 'whyTrending'],
          },
        },
      }),
      8000,
      `Trend enrichment (${item.keyword})`
    );

    const parsed = JSON.parse((response.text || '{}').trim());
    const validCat = TREND_CATEGORIES.some((c) => c.slug === parsed.category)
      ? (parsed.category as TrendCategorySlug)
      : ruleClassification.category;

    const validAudience: AudienceSegment =
      parsed.audienceSegment === 'diaspora' ||
      parsed.audienceSegment === 'global_nepali' ||
      parsed.audienceSegment === 'nepal_local'
        ? parsed.audienceSegment
        : ruleClassification.audienceSegment;

    const citations = validateGroundedCitations(
      Array.isArray(parsed.citedUrls)
        ? parsed.citedUrls.map((u: string) => ({ url: u }))
        : undefined,
      item.newsItems
    );

    const triVariants = [
      {
        baseKeyword: item.keyword,
        englishVariant: parsed.englishVariant || fallbackAnalysis.variants[0].englishVariant,
        romanizedNepali: parsed.romanizedNepali || fallbackAnalysis.variants[0].romanizedNepali,
        devanagariVariant: parsed.devanagariVariant || fallbackAnalysis.variants[0].devanagariVariant,
        intentTag: 'Search Variant',
      },
    ];

    return {
      category: ruleClassification.confidence === 'high' ? ruleClassification.category : validCat,
      audienceSegment: validAudience,
      aiWhyTrending:
        typeof parsed.whyTrending === 'string' && parsed.whyTrending.trim().length > 20
          ? parsed.whyTrending.trim()
          : fallbackWhy,
      citations,
      relatedQueries:
        Array.isArray(parsed.relatedQueries) && parsed.relatedQueries.length > 0
          ? parsed.relatedQueries.slice(0, 6)
          : fallbackAnalysis.relatedQueries,
      triScriptVariants: triVariants,
      enrichedByAi: true,
    };
  } catch (err: any) {
    if (isGeminiRateLimitError(err)) {
      if (Date.now() >= geminiQuotaCooldownUntil) {
        console.info('[Trends AI Enrichment] Gemini daily/rate quota reached; activating deterministic grounded fallback for 30m.');
      }
      geminiQuotaCooldownUntil = Date.now() + 30 * 60 * 1000;
    } else {
      console.warn(`[Trends AI Enrichment] Fallback used for "${item.keyword}":`, err?.message || err);
    }
    return {
      category: ruleClassification.category,
      audienceSegment: ruleClassification.audienceSegment,
      aiWhyTrending: fallbackWhy,
      citations: fallbackCitations,
      relatedQueries: fallbackAnalysis.relatedQueries,
      triScriptVariants: fallbackAnalysis.variants,
      enrichedByAi: false,
    };
  }
}

export async function fetchGoogleTrendsRssFeed(geo = 'NP'): Promise<{
  ok: boolean;
  items: ParsedRssTrendItem[];
  error?: string;
}> {
  const cleanGeo = geo.toUpperCase();
  const rssUrl = `https://trends.google.com/trending/rss?geo=${encodeURIComponent(cleanGeo)}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(rssUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NepalAITrends/1.0; +https://nepalai.tech)',
        Accept: 'application/rss+xml, application/xml, text/xml;q=0.9',
      },
    });
    clearTimeout(timer);

    if (!resp.ok) {
      return { ok: false, items: [], error: `HTTP ${resp.status} from Google Trends RSS (${cleanGeo})` };
    }

    const xml = await resp.text();
    const items = parseGoogleTrendsRssXml(xml);
    return { ok: true, items };
  } catch (err: any) {
    return {
      ok: false,
      items: [],
      error: err?.message || `Failed to reach Google Trends RSS (${cleanGeo})`,
    };
  }
}

export async function syncNepalAndDiasporaTrends(options?: {
  includeDiaspora?: boolean;
  maxEnrichPerCycle?: number;
}) {
  const maxEnrich = options?.maxEnrichPerCycle ?? 8;
  const startedAt = new Date().toISOString();

  // 1. Primary Nepal Feed (geo=NP)
  const npResult = await fetchGoogleTrendsRssFeed('NP');
  let upsertedNp = 0;
  let aiEnrichedCount = 0;

  if (npResult.ok && npResult.items.length > 0) {
    const normalizedKeys: string[] = [];
    const itemsToEnrich: Array<{
      item: ParsedRssTrendItem;
      rule: ReturnType<typeof classifyTrendByRules>;
      score: number;
      rankPosition: number;
    }> = [];

    // Pass 1: Fast deterministic upsert for EVERY RSS item so all trends appear immediately
    for (let idx = 0; idx < npResult.items.length; idx++) {
      const item = npResult.items[idx];
      normalizedKeys.push(item.keywordNormalized);

      const rule = classifyTrendByRules(
        item.keyword,
        item.newsItems.map((n) => n.title)
      );

      const existing = await getTrendByNormalized(item.keywordNormalized, 'NP');
      const recentlyEnriched =
        existing?.enrichedAt &&
        Date.now() - existing.enrichedAt.getTime() < 6 * 60 * 60 * 1000;

      const score = Math.max(
        10,
        Math.min(100, Math.round(Math.log10(Math.max(item.numericTrafficFloor, 100)) * 20) + (20 - Math.min(idx, 19)))
      );

      const fallback = buildFallbackTriScriptVariants(item.keyword);
      await upsertTrendWithSnapshotAndNews({
        rssItem: item,
        country: 'NP',
        language: rule.language,
        category: recentlyEnriched && existing && rule.confidence !== 'high'
          ? (existing.category as TrendCategorySlug)
          : rule.category,
        audienceSegment: rule.audienceSegment,
        trendScore: score,
        aiWhyTrending:
          recentlyEnriched && existing?.aiWhyTrending
            ? existing.aiWhyTrending
            : buildDeterministicWhyTrending(item.keyword, rule.category, item.trafficBand, item.newsItems),
        citations:
          recentlyEnriched && existing?.citations?.length
            ? existing.citations
            : validateGroundedCitations(undefined, item.newsItems),
        relatedQueries:
          recentlyEnriched && existing?.relatedQueries?.length
            ? existing.relatedQueries
            : fallback.relatedQueries,
        triScriptVariants:
          recentlyEnriched && existing?.triScriptVariants?.length
            ? existing.triScriptVariants
            : fallback.variants,
        linkedToolTab: rule.linkedToolTab || existing?.linkedToolTab || undefined,
        rankPosition: idx + 1,
        enriched: false,
      });

      if (!recentlyEnriched && itemsToEnrich.length < maxEnrich) {
        itemsToEnrich.push({ item, rule, score, rankPosition: idx + 1 });
      }
      upsertedNp++;
    }

    await markInactiveMissingTrends('NP', normalizedKeys);

    // Pass 2: Parallel AI enrichment (batches of 4, bounded 8s timeout each)
    for (let i = 0; i < itemsToEnrich.length; i += 4) {
      const batch = itemsToEnrich.slice(i, i + 4);
      const settled = await Promise.allSettled(
        batch.map(async ({ item, rule, score, rankPosition }) => {
          const enriched = await generateGroundedTrendEnrichment(item, rule);
          if (enriched.enrichedByAi) {
            aiEnrichedCount++;
            await upsertTrendWithSnapshotAndNews({
              rssItem: item,
              country: 'NP',
              language: rule.language,
              category: enriched.category,
              audienceSegment: enriched.audienceSegment,
              trendScore: score,
              aiWhyTrending: enriched.aiWhyTrending,
              citations: enriched.citations,
              relatedQueries: enriched.relatedQueries,
              triScriptVariants: enriched.triScriptVariants,
              linkedToolTab: rule.linkedToolTab,
              rankPosition,
              enriched: true,
            });
          }
        })
      );
      void settled;
    }
  }

  // 2. Optional Diaspora Feeds (US, AU, GB, AE, JP, CA) fetched in parallel, filtered strictly for Nepal-relevant queries
  let upsertedDiaspora = 0;
  if (options?.includeDiaspora) {
    const diasporaFeeds = await Promise.allSettled(
      DIASPORA_COUNTRIES.map(async (geo) => ({
        geo,
        feed: await fetchGoogleTrendsRssFeed(geo.code),
      }))
    );

    for (const outcome of diasporaFeeds) {
      if (outcome.status !== 'fulfilled') continue;
      const { geo, feed } = outcome.value;
      if (!feed.ok || feed.items.length === 0) continue;

      const nepalItems = feed.items.filter((it) =>
        isNepalRelevantForDiaspora(
          it.keyword,
          it.newsItems.map((n) => n.title)
        )
      );

      for (let i = 0; i < nepalItems.length; i++) {
        const item = nepalItems[i];
        const rule = classifyTrendByRules(
          item.keyword,
          item.newsItems.map((n) => n.title)
        );
        const fallback = buildFallbackTriScriptVariants(item.keyword);
        await upsertTrendWithSnapshotAndNews({
          rssItem: item,
          country: geo.code,
          language: rule.language,
          category: rule.category,
          audienceSegment: 'diaspora',
          trendScore: 70,
          aiWhyTrending: buildDeterministicWhyTrending(item.keyword, rule.category, item.trafficBand, item.newsItems),
          citations: validateGroundedCitations(undefined, item.newsItems),
          relatedQueries: fallback.relatedQueries,
          triScriptVariants: fallback.variants,
          linkedToolTab: rule.linkedToolTab,
          rankPosition: i + 1,
          enriched: false,
        });
        upsertedDiaspora++;
      }
    }
  }

  return {
    startedAt,
    completedAt: new Date().toISOString(),
    npFeedOk: npResult.ok,
    npFeedError: npResult.error || null,
    upsertedNp,
    upsertedDiaspora,
    aiEnrichedCount,
  };
}

/**
 * Pluggable TrendsDataProvider for Comparative & Historical Interest:
 * Uses official Google Trends API (Alpha) when configured via GOOGLE_TRENDS_API_KEY /
 * GOOGLE_TRENDS_API_ENDPOINT; otherwise derives authentic relative 0-100 velocity
 * strictly from stored Cloud SQL RSS snapshots & active matching trends.
 */
export async function fetchComparativeInterestSeries(
  keyword: string,
  country = 'NP'
): Promise<{
  dataSource: 'google_trends_api' | 'rss_velocity';
  interestScore: number;
  series: Array<{ date: string; score: number }>;
}> {
  const apiEndpoint = process.env.GOOGLE_TRENDS_API_ENDPOINT;
  const apiKey = process.env.GOOGLE_TRENDS_API_KEY;

  if (apiEndpoint && apiKey) {
    try {
      const resp = await fetch(
        `${apiEndpoint}?term=${encodeURIComponent(keyword)}&geo=${encodeURIComponent(country)}`,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );
      if (resp.ok) {
        const payload = await resp.json();
        if (Array.isArray(payload?.timeline) && payload.timeline.length > 0) {
          const series = payload.timeline.map((pt: any) => ({
            date: String(pt.date || pt.time || ''),
            score: Math.max(0, Math.min(100, Number(pt.value || 0))),
          }));
          const latest = series[series.length - 1]?.score || 50;
          return {
            dataSource: 'google_trends_api',
            interestScore: latest,
            series,
          };
        }
      }
    } catch (err) {
      console.warn('[TrendsDataProvider] Trends Alpha API fallback to RSS snapshot history:', err);
    }
  }

  // Fallback: Query Cloud SQL stored trends & snapshots matching the term
  const matchingTrends = await listTrendsFromDb({
    country,
    search: keyword,
    limit: 5,
  });

  if (matchingTrends.length > 0) {
    const topMatch = matchingTrends[0];
    return {
      dataSource: 'rss_velocity',
      interestScore: topMatch.trendScore,
      series: [
        {
          date: topMatch.lastSeenAt.slice(0, 10),
          score: topMatch.trendScore,
        },
      ],
    };
  }

  return {
    dataSource: 'rss_velocity',
    interestScore: 0,
    series: [],
  };
}

const seasonalTrendsApiCache = new Map<
  string,
  { monthlyIndex: number[]; fetchedAt: number }
>();

/**
 * Integrates official Google Trends API (when GOOGLE_TRENDS_API_ENDPOINT and
 * GOOGLE_TRENDS_API_KEY are configured) to compute normalized 12-month (Jan-Dec)
 * seasonal spike vectors for a given Nepal query. Caches for 6 hours to keep
 * dashboard switches fast and rate-limit safe.
 */
export async function fetchSeasonalGoogleTrendsMonthly(
  keyword: string,
  country = 'NP'
): Promise<{
  monthlyIndex: number[];
  dataSource: 'google_trends_api' | 'bs_calendar_benchmark';
} | null> {
  const apiEndpoint = process.env.GOOGLE_TRENDS_API_ENDPOINT?.trim();
  const apiKey = process.env.GOOGLE_TRENDS_API_KEY?.trim();
  if (!apiEndpoint || !apiKey) return null;

  const cacheKey = `${country}:${keyword.toLowerCase().trim()}`;
  const cached = seasonalTrendsApiCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < 6 * 60 * 60 * 1000) {
    return { monthlyIndex: cached.monthlyIndex, dataSource: 'google_trends_api' };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch(
      `${apiEndpoint}?term=${encodeURIComponent(keyword)}&geo=${encodeURIComponent(country)}&timeframe=today+5-y`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      }
    );
    clearTimeout(timer);
    if (!resp.ok) return null;

    const payload: any = await resp.json();
    const timeline = Array.isArray(payload?.timeline) ? payload.timeline : [];
    if (timeline.length === 0) return null;

    const sums = Array(12).fill(0);
    const counts = Array(12).fill(0);
    for (const pt of timeline) {
      const dt = new Date(String(pt.date || pt.time || ''));
      if (Number.isNaN(dt.getTime())) continue;
      const m = dt.getUTCMonth();
      const val = Math.max(0, Math.min(100, Number(pt.value ?? pt.score ?? 0)));
      sums[m] += val;
      counts[m] += 1;
    }

    const monthlyIndex = sums.map((s, idx) =>
      counts[idx] > 0 ? Math.round(s / counts[idx]) : 0
    );
    if (monthlyIndex.some((v) => v > 0)) {
      seasonalTrendsApiCache.set(cacheKey, { monthlyIndex, fetchedAt: Date.now() });
      return { monthlyIndex, dataSource: 'google_trends_api' };
    }
  } catch {
    // Cleanly fall back to Bikram Sambat seasonal benchmark
  }

  return null;
}

export async function analyzeKeywordWithGemini(keyword: string): Promise<KeywordAnalysisOutput> {
  const fallback = buildFallbackTriScriptVariants(keyword);
  const ai = getServerGemini();
  if (!ai) return fallback;

  try {
    const allowedCategories = TREND_CATEGORIES.map((c) => c.slug).join(', ');
    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Analyze this search query for Nepal SEO & audience intelligence: "${keyword}".
Generate natural English, Romanized Nepali (written in Latin script as Nepalis type it), and Devanagari Nepali keyword variants.
Allowed categories: ${allowedCategories}.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'You are a bilingual Nepali/English search strategist. Return accurate JSON matching the schema without inventing search volume numbers.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              direction: { type: Type.STRING },
              localIntentScore: { type: Type.INTEGER },
              diasporaIntentScore: { type: Type.INTEGER },
              variants: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    baseKeyword: { type: Type.STRING },
                    englishVariant: { type: Type.STRING },
                    romanizedNepali: { type: Type.STRING },
                    devanagariVariant: { type: Type.STRING },
                    intentTag: { type: Type.STRING },
                  },
                  required: ['baseKeyword', 'englishVariant', 'romanizedNepali', 'devanagariVariant', 'intentTag'],
                },
              },
              relatedQueries: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              contentAngles: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['category', 'direction', 'variants', 'relatedQueries', 'contentAngles'],
          },
        },
      }),
      7500,
      `Keyword explore (${keyword})`
    );

    const parsed = JSON.parse((response.text || '{}').trim());
    const validCat = TREND_CATEGORIES.some((c) => c.slug === parsed.category)
      ? (parsed.category as TrendCategorySlug)
      : fallback.category;
    const validDirection =
      parsed.direction === 'rising' || parsed.direction === 'seasonal' || parsed.direction === 'steady'
        ? parsed.direction
        : fallback.direction;

    return {
      keyword: fallback.keyword,
      keywordNormalized: fallback.keywordNormalized,
      detectedScript: fallback.detectedScript,
      category: validCat,
      direction: validDirection,
      localIntentScore:
        typeof parsed.localIntentScore === 'number'
          ? Math.max(0, Math.min(100, parsed.localIntentScore))
          : fallback.localIntentScore,
      diasporaIntentScore:
        typeof parsed.diasporaIntentScore === 'number'
          ? Math.max(0, Math.min(100, parsed.diasporaIntentScore))
          : fallback.diasporaIntentScore,
      variants:
        Array.isArray(parsed.variants) && parsed.variants.length > 0
          ? parsed.variants.slice(0, 5)
          : fallback.variants,
      relatedQueries:
        Array.isArray(parsed.relatedQueries) && parsed.relatedQueries.length > 0
          ? parsed.relatedQueries.slice(0, 8)
          : fallback.relatedQueries,
      contentAngles:
        Array.isArray(parsed.contentAngles) && parsed.contentAngles.length > 0
          ? parsed.contentAngles.slice(0, 4)
          : fallback.contentAngles,
    };
  } catch (err: any) {
    if (isGeminiRateLimitError(err)) {
      if (Date.now() >= geminiQuotaCooldownUntil) {
        console.info('[Keyword Explorer] Gemini quota reached; using deterministic tri-script analyzer for 30m.');
      }
      geminiQuotaCooldownUntil = Date.now() + 30 * 60 * 1000;
    } else {
      console.warn(`[Keyword Explorer] Gemini fallback for "${keyword}":`, err?.message || err);
    }
    return fallback;
  }
}

export async function generateTrendContentBrief(input: {
  keyword: string;
  category: string;
  whyTrending: string;
  relatedQueries: string[];
}) {
  const ai = getServerGemini();
  const fallbackBrief = {
    headlineEn: `${input.keyword}: Key Context, Impact & What Nepal Readers Should Know`,
    headlineNe: `${input.keyword}: मुख्य कारण, पृष्ठभूमि र नेपालका लागि महत्वपूर्ण जानकारी`,
    hookEn: `Searches for "${input.keyword}" are surging across Nepal right now. Here is the verified summary backed by local news reports.`,
    hookNe: `नेपालमा अहिले "${input.keyword}" को खोजी तीव्र रूपमा बढिरहेको छ। प्रमाणित समाचार स्रोतका आधारमा मुख्य विवरण यहाँ छ।`,
    keyPoints: [
      input.whyTrending,
      `Related searches: ${input.relatedQueries.slice(0, 4).join(', ') || input.keyword}`,
      'Include clear English and Romanized/Devanagari section headings so both domestic and diaspora readers find it.',
    ],
    seoKeywords: [input.keyword, ...input.relatedQueries.slice(0, 4)],
    faqQuestion: `Why is ${input.keyword} trending in Nepal?`,
    faqAnswer: input.whyTrending,
  };

  if (!ai) return fallbackBrief;

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Generate a concise bilingual (English + Devanagari Nepali) editorial content brief for a Nepali creator/journalist covering this trending topic:
Topic: "${input.keyword}"
Category: "${input.category}"
Verified Context: "${input.whyTrending}"
Related Queries: ${input.relatedQueries.join(', ')}

Stay strictly factual to the verified context without inventing numbers.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headlineEn: { type: Type.STRING },
              headlineNe: { type: Type.STRING },
              hookEn: { type: Type.STRING },
              hookNe: { type: Type.STRING },
              keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              seoKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              faqQuestion: { type: Type.STRING },
              faqAnswer: { type: Type.STRING },
            },
            required: ['headlineEn', 'headlineNe', 'hookEn', 'hookNe', 'keyPoints', 'seoKeywords', 'faqQuestion', 'faqAnswer'],
          },
        },
      }),
      7500,
      `Content brief (${input.keyword})`
    );

    const parsed = JSON.parse((response.text || '{}').trim());
    if (parsed.headlineEn && parsed.headlineNe) {
      return parsed;
    }
    return fallbackBrief;
  } catch (err: any) {
    if (isGeminiRateLimitError(err)) {
      if (Date.now() >= geminiQuotaCooldownUntil) {
        console.info('[Content Brief] Gemini quota reached; using deterministic bilingual brief for 30m.');
      }
      geminiQuotaCooldownUntil = Date.now() + 30 * 60 * 1000;
    } else {
      console.warn(`[Content Brief] Fallback used for "${input.keyword}":`, err?.message || err);
    }
    return fallbackBrief;
  }
}
