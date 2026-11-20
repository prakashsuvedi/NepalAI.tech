import { and, desc, eq, gte, ilike, inArray, or, sql } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from './index.ts';
import {
  trends,
  trendSnapshots,
  trendNews,
  keywordMetrics,
  keywordVariants,
  trendAlertSubscriptions,
  contentBriefs,
  trendApiKeys,
  trendWatchlists,
  trendVelocityAlerts,
  seasonalBenchmarks,
  whatsappDeliveryLogs,
  diasporaPartnerSlots,
  TrendRecord,
} from './schema.ts';
import {
  KeywordAnalysisOutput,
  ParsedRssTrendItem,
  TrendCategorySlug,
  AudienceSegment,
  TrendScriptLanguage,
  GroundedCitation,
  TriScriptVariantRow,
  CURATED_SEASONAL_BENCHMARKS,
  computeSeasonalDirection,
  normalizeKeyword,
  normalizeWhatsappNumber,
} from '../utils/trendsEngine.ts';

export async function listTrendsFromDb(opts: {
  country?: string;
  countries?: string[];
  category?: string;
  audience?: string;
  search?: string;
  activeOnly?: boolean;
  limit?: number;
}) {
  const conditions = [];

  if (opts.country) {
    conditions.push(eq(trends.country, opts.country.toUpperCase()));
  } else if (opts.countries && opts.countries.length > 0) {
    conditions.push(inArray(trends.country, opts.countries.map((c) => c.toUpperCase())));
  }

  if (opts.category && opts.category !== 'all') {
    conditions.push(eq(trends.category, opts.category));
  }

  if (opts.audience && opts.audience !== 'all') {
    conditions.push(eq(trends.audienceSegment, opts.audience));
  }

  if (opts.activeOnly) {
    conditions.push(eq(trends.isActive, true));
  }

  if (opts.search && opts.search.trim()) {
    const q = `%${opts.search.trim()}%`;
    conditions.push(
      or(
        ilike(trends.keyword, q),
        ilike(trends.keywordNormalized, q),
        ilike(trends.aiWhyTrending, q)
      )!
    );
  }

  const query = db
    .select()
    .from(trends)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(trends.isActive), desc(trends.lastSeenAt), desc(trends.numericTrafficFloor))
    .limit(opts.limit || 50);

  const rows = await query;

  // Fetch top news count & first news item per trend cleanly
  if (rows.length === 0) return [];
  const trendIds = rows.map((r) => r.id);
  const allNews = await db
    .select()
    .from(trendNews)
    .where(inArray(trendNews.trendId, trendIds))
    .orderBy(desc(trendNews.publishedAt));

  const newsMap = new Map<string, typeof allNews>();
  for (const n of allNews) {
    const list = newsMap.get(n.trendId) || [];
    list.push(n);
    newsMap.set(n.trendId, list);
  }

  return rows.map((row) => ({
    ...row,
    firstSeenAt: row.firstSeenAt.toISOString(),
    lastSeenAt: row.lastSeenAt.toISOString(),
    enrichedAt: row.enrichedAt ? row.enrichedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    newsItems: (newsMap.get(row.id) || []).slice(0, 3).map((n) => ({
      ...n,
      publishedAt: n.publishedAt.toISOString(),
    })),
  }));
}

export async function getTrendDetailFromDb(slug: string) {
  const [trend] = await db
    .select()
    .from(trends)
    .where(eq(trends.slug, slug))
    .limit(1);

  if (!trend) return null;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [newsRows, snapshotRows, briefRows] = await Promise.all([
    db
      .select()
      .from(trendNews)
      .where(eq(trendNews.trendId, trend.id))
      .orderBy(desc(trendNews.publishedAt)),
    db
      .select()
      .from(trendSnapshots)
      .where(and(eq(trendSnapshots.trendId, trend.id), gte(trendSnapshots.capturedAt, sevenDaysAgo)))
      .orderBy(trendSnapshots.capturedAt),
    db
      .select()
      .from(contentBriefs)
      .where(eq(contentBriefs.trendId, trend.id))
      .orderBy(desc(contentBriefs.createdAt))
      .limit(3),
  ]);

  return {
    ...trend,
    firstSeenAt: trend.firstSeenAt.toISOString(),
    lastSeenAt: trend.lastSeenAt.toISOString(),
    enrichedAt: trend.enrichedAt ? trend.enrichedAt.toISOString() : null,
    createdAt: trend.createdAt.toISOString(),
    newsItems: newsRows.map((n) => ({
      ...n,
      publishedAt: n.publishedAt.toISOString(),
    })),
    snapshots: snapshotRows.map((s) => ({
      ...s,
      capturedAt: s.capturedAt.toISOString(),
    })),
    briefs: briefRows.map((b) => ({
      ...b,
      createdAt: b.createdAt.toISOString(),
    })),
  };
}

export async function getTrendByNormalized(keywordNormalized: string, country: string) {
  const [row] = await db
    .select()
    .from(trends)
    .where(and(eq(trends.keywordNormalized, keywordNormalized), eq(trends.country, country.toUpperCase())))
    .limit(1);
  return row || null;
}

export interface UpsertTrendInput {
  rssItem: ParsedRssTrendItem;
  country: string;
  language: TrendScriptLanguage;
  category: TrendCategorySlug;
  audienceSegment: AudienceSegment;
  trendScore: number;
  aiWhyTrending: string;
  citations: GroundedCitation[];
  relatedQueries: string[];
  triScriptVariants: TriScriptVariantRow[];
  linkedToolTab?: string;
  rankPosition: number;
  enriched: boolean;
}

export async function upsertTrendWithSnapshotAndNews(input: UpsertTrendInput): Promise<TrendRecord> {
  const { rssItem, country } = input;
  const upperCountry = country.toUpperCase();
  const baseSlug = upperCountry === 'NP' ? rssItem.slug : `${upperCountry.toLowerCase()}-${rssItem.slug}`;

  const existing = await getTrendByNormalized(rssItem.keywordNormalized, upperCountry);
  const now = new Date();
  let trendRow: TrendRecord;

  if (existing) {
    const prevFloor = existing.numericTrafficFloor || 200;
    const velocityDelta = rssItem.numericTrafficFloor - prevFloor;

    const [updated] = await db
      .update(trends)
      .set({
        keyword: rssItem.keyword,
        trafficBand: rssItem.trafficBand,
        numericTrafficFloor: rssItem.numericTrafficFloor,
        trendScore: input.trendScore,
        category: input.category,
        audienceSegment: input.audienceSegment,
        language: input.language,
        aiWhyTrending: input.aiWhyTrending || existing.aiWhyTrending,
        citations: input.citations.length > 0 ? input.citations : existing.citations,
        relatedQueries: input.relatedQueries.length > 0 ? input.relatedQueries : existing.relatedQueries,
        triScriptVariants:
          input.triScriptVariants.length > 0 ? input.triScriptVariants : existing.triScriptVariants,
        linkedToolTab: input.linkedToolTab || existing.linkedToolTab,
        imageUrl: rssItem.imageUrl || existing.imageUrl,
        sourceUrl: rssItem.sourceUrl || existing.sourceUrl,
        isActive: true,
        lastSeenAt: now,
        enrichedAt: input.enriched ? now : existing.enrichedAt,
      })
      .where(eq(trends.id, existing.id))
      .returning();

    trendRow = updated;

    await db.insert(trendSnapshots).values({
      id: `snap_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      trendId: existing.id,
      capturedAt: now,
      rankPosition: input.rankPosition,
      trafficBand: rssItem.trafficBand,
      numericTrafficFloor: rssItem.numericTrafficFloor,
      velocityDelta,
    });
  } else {
    // Ensure slug uniqueness if collision happens
    const [slugTaken] = await db
      .select({ id: trends.id })
      .from(trends)
      .where(eq(trends.slug, baseSlug))
      .limit(1);
    const finalSlug = slugTaken ? `${baseSlug}-${crypto.randomBytes(2).toString('hex')}` : baseSlug;
    const newId = `tr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    const [inserted] = await db
      .insert(trends)
      .values({
        id: newId,
        slug: finalSlug,
        keyword: rssItem.keyword,
        keywordNormalized: rssItem.keywordNormalized,
        country: upperCountry,
        language: input.language,
        category: input.category,
        audienceSegment: input.audienceSegment,
        trafficBand: rssItem.trafficBand,
        numericTrafficFloor: rssItem.numericTrafficFloor,
        trendScore: input.trendScore,
        aiWhyTrending: input.aiWhyTrending,
        citations: input.citations,
        relatedQueries: input.relatedQueries,
        triScriptVariants: input.triScriptVariants,
        linkedToolTab: input.linkedToolTab || null,
        imageUrl: rssItem.imageUrl || null,
        isActive: true,
        sourceUrl: rssItem.sourceUrl || null,
        firstSeenAt: new Date(rssItem.publishedAt),
        lastSeenAt: now,
        enrichedAt: input.enriched ? now : null,
        createdAt: now,
      })
      .returning();

    trendRow = inserted;

    await db.insert(trendSnapshots).values({
      id: `snap_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      trendId: newId,
      capturedAt: now,
      rankPosition: input.rankPosition,
      trafficBand: rssItem.trafficBand,
      numericTrafficFloor: rssItem.numericTrafficFloor,
      velocityDelta: 0,
    });
  }

  // Insert deduped news items for this trend
  if (rssItem.newsItems.length > 0) {
    const existingNews = await db
      .select({ url: trendNews.url })
      .from(trendNews)
      .where(eq(trendNews.trendId, trendRow.id));
    const existingUrls = new Set(existingNews.map((n) => n.url));

    const toInsert = rssItem.newsItems
      .filter((n) => !existingUrls.has(n.url))
      .map((n) => ({
        id: `tnews_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        trendId: trendRow.id,
        title: n.title,
        url: n.url,
        source: n.source,
        snippet: n.snippet || null,
        imageUrl: n.imageUrl || null,
        publishedAt: new Date(rssItem.publishedAt),
      }));

    if (toInsert.length > 0) {
      await db.insert(trendNews).values(toInsert);
    }
  }

  return trendRow;
}

export async function markInactiveMissingTrends(country: string, activeNormalizedKeys: string[]) {
  if (activeNormalizedKeys.length === 0) return;
  const upperCountry = country.toUpperCase();
  const staleCutoff = new Date(Date.now() - 12 * 60 * 60 * 1000);
  await db
    .update(trends)
    .set({ isActive: false })
    .where(
      and(
        eq(trends.country, upperCountry),
        eq(trends.isActive, true),
        sql`${trends.lastSeenAt} < ${staleCutoff}`
      )
    );
}

export async function getCategoryCountsFromDb(country = 'NP') {
  const rows = await db
    .select({
      category: trends.category,
      count: sql<number>`count(*)::int`,
    })
    .from(trends)
    .where(eq(trends.country, country.toUpperCase()))
    .groupBy(trends.category);
  return rows;
}

export async function getRecentTrendsForSitemap(limit = 100) {
  return db
    .select({
      slug: trends.slug,
      lastSeenAt: trends.lastSeenAt,
      isActive: trends.isActive,
    })
    .from(trends)
    .where(eq(trends.country, 'NP'))
    .orderBy(desc(trends.lastSeenAt))
    .limit(limit);
}

export async function getCachedKeywordMetric(keywordNormalized: string, country = 'NP') {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const [metric] = await db
    .select()
    .from(keywordMetrics)
    .where(
      and(
        eq(keywordMetrics.keywordNormalized, keywordNormalized),
        eq(keywordMetrics.country, country.toUpperCase()),
        gte(keywordMetrics.capturedAt, sixHoursAgo)
      )
    )
    .orderBy(desc(keywordMetrics.capturedAt))
    .limit(1);

  if (!metric) return null;

  const variants = await db
    .select()
    .from(keywordVariants)
    .where(eq(keywordVariants.metricId, metric.id));

  return {
    ...metric,
    capturedAt: metric.capturedAt.toISOString(),
    variants,
  };
}

export async function saveKeywordAnalysisToDb(input: {
  analysis: KeywordAnalysisOutput;
  country: string;
  interestScore: number;
  dataSource: 'google_trends_api' | 'rss_velocity';
  interestSeries: Array<{ date: string; score: number }>;
}) {
  const metricId = `kw_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date();

  const [metric] = await db
    .insert(keywordMetrics)
    .values({
      id: metricId,
      keyword: input.analysis.keyword,
      keywordNormalized: input.analysis.keywordNormalized,
      country: input.country.toUpperCase(),
      detectedScript: input.analysis.detectedScript,
      category: input.analysis.category,
      interestScore: input.interestScore,
      direction: input.analysis.direction,
      localIntentScore: input.analysis.localIntentScore,
      diasporaIntentScore: input.analysis.diasporaIntentScore,
      period: 'weekly',
      dataSource: input.dataSource,
      interestSeries: input.interestSeries,
      relatedQueries: input.analysis.relatedQueries,
      contentAngles: input.analysis.contentAngles,
      capturedAt: now,
    })
    .returning();

  const variantRows = input.analysis.variants.map((v) => ({
    id: `kwv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    metricId,
    baseKeyword: v.baseKeyword,
    englishVariant: v.englishVariant,
    romanizedNepali: v.romanizedNepali,
    devanagariVariant: v.devanagariVariant,
    intentTag: v.intentTag,
    createdAt: now,
  }));

  if (variantRows.length > 0) {
    await db.insert(keywordVariants).values(variantRows);
  }

  return {
    ...metric,
    capturedAt: metric.capturedAt.toISOString(),
    variants: variantRows,
  };
}

export async function saveContentBriefToDb(input: {
  trendId?: string | null;
  keyword: string;
  userUid?: string | null;
  languageMode: string;
  outlineJson: {
    headlineEn: string;
    headlineNe: string;
    hookEn: string;
    hookNe: string;
    keyPoints: string[];
    seoKeywords: string[];
    faqQuestion: string;
    faqAnswer: string;
  };
}) {
  const [created] = await db
    .insert(contentBriefs)
    .values({
      id: `brief_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      trendId: input.trendId || null,
      keyword: input.keyword,
      userUid: input.userUid || null,
      languageMode: input.languageMode,
      outlineJson: input.outlineJson,
      createdAt: new Date(),
    })
    .returning();

  return {
    ...created,
    createdAt: created.createdAt.toISOString(),
  };
}

export async function upsertAlertSubscription(input: {
  email: string;
  userUid?: string | null;
  categories: string[];
  cadence: 'daily' | 'breaking';
  preferredLanguage?: 'en' | 'ne' | 'bilingual';
  countryFilter?: string;
  deliveryChannel?: 'email' | 'whatsapp' | 'both';
  whatsappNumber?: string | null;
  whatsappWebhookUrl?: string | null;
}) {
  const cleanEmail = input.email.trim().toLowerCase();
  const lang =
    input.preferredLanguage === 'en' || input.preferredLanguage === 'ne'
      ? input.preferredLanguage
      : 'bilingual';
  const channel: 'email' | 'whatsapp' | 'both' =
    input.deliveryChannel === 'whatsapp' || input.deliveryChannel === 'both'
      ? input.deliveryChannel
      : 'email';
  const cleanWa = input.whatsappNumber ? normalizeWhatsappNumber(input.whatsappNumber) || null : null;
  const cleanWebhook = input.whatsappWebhookUrl?.trim() ? input.whatsappWebhookUrl.trim().slice(0, 400) : null;

  const [existing] = await db
    .select()
    .from(trendAlertSubscriptions)
    .where(eq(trendAlertSubscriptions.email, cleanEmail))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(trendAlertSubscriptions)
      .set({
        categories: input.categories,
        cadence: input.cadence,
        preferredLanguage: lang,
        countryFilter: (input.countryFilter || 'NP').toUpperCase(),
        deliveryChannel: channel,
        whatsappNumber: cleanWa !== null ? cleanWa : existing.whatsappNumber,
        whatsappWebhookUrl: cleanWebhook !== null ? cleanWebhook : existing.whatsappWebhookUrl,
        isVerified: true,
        userUid: input.userUid || existing.userUid,
      })
      .where(eq(trendAlertSubscriptions.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(trendAlertSubscriptions)
    .values({
      id: `sub_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      email: cleanEmail,
      userUid: input.userUid || null,
      categories: input.categories,
      cadence: input.cadence,
      preferredLanguage: lang,
      countryFilter: (input.countryFilter || 'NP').toUpperCase(),
      deliveryChannel: channel,
      whatsappNumber: cleanWa,
      whatsappWebhookUrl: cleanWebhook,
      isVerified: true,
      unsubscribeToken: crypto.randomBytes(16).toString('hex'),
      createdAt: new Date(),
    })
    .returning();
  return created;
}

export async function getAlertSubscriptionByEmail(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;
  const [row] = await db
    .select()
    .from(trendAlertSubscriptions)
    .where(eq(trendAlertSubscriptions.email, cleanEmail))
    .limit(1);
  return row || null;
}

export async function deactivateAlertSubscriptionByEmail(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;
  const [updated] = await db
    .update(trendAlertSubscriptions)
    .set({ isVerified: false })
    .where(eq(trendAlertSubscriptions.email, cleanEmail))
    .returning();
  return updated || null;
}

export async function removeAlertSubscriptionByToken(token: string) {
  const deleted = await db
    .delete(trendAlertSubscriptions)
    .where(eq(trendAlertSubscriptions.unsubscribeToken, token))
    .returning({ id: trendAlertSubscriptions.id, email: trendAlertSubscriptions.email });
  return deleted[0] || null;
}

export async function listRecentContentBriefsFromDb(limit = 20) {
  const rows = await db
    .select()
    .from(contentBriefs)
    .orderBy(desc(contentBriefs.createdAt))
    .limit(limit);
  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getActiveAlertSubscribersFromDb() {
  return db
    .select()
    .from(trendAlertSubscriptions)
    .where(eq(trendAlertSubscriptions.isVerified, true))
    .orderBy(desc(trendAlertSubscriptions.createdAt));
}

export async function markAlertSubscriptionSent(id: string) {
  await db
    .update(trendAlertSubscriptions)
    .set({ lastSentAt: new Date() })
    .where(eq(trendAlertSubscriptions.id, id));
}

export async function listWatchlistFromDb(ownerKey: string) {
  const rows = await db
    .select()
    .from(trendWatchlists)
    .where(eq(trendWatchlists.ownerKey, ownerKey))
    .orderBy(desc(trendWatchlists.createdAt))
    .limit(40);
  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function addWatchlistItemToDb(input: {
  ownerKey: string;
  keyword: string;
  keywordNormalized: string;
  slug?: string | null;
  category?: string;
  country?: string;
  notes?: string | null;
}) {
  const [existing] = await db
    .select()
    .from(trendWatchlists)
    .where(
      and(
        eq(trendWatchlists.ownerKey, input.ownerKey),
        eq(trendWatchlists.keywordNormalized, input.keywordNormalized)
      )
    )
    .limit(1);

  if (existing) {
    return {
      ...existing,
      createdAt: existing.createdAt.toISOString(),
      alreadyTracked: true,
    };
  }

  const [created] = await db
    .insert(trendWatchlists)
    .values({
      id: `watch_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      ownerKey: input.ownerKey,
      keyword: input.keyword,
      keywordNormalized: input.keywordNormalized,
      slug: input.slug || null,
      category: input.category || 'technology-ai',
      country: (input.country || 'NP').toUpperCase(),
      notes: input.notes || null,
      createdAt: new Date(),
    })
    .returning();

  return {
    ...created,
    createdAt: created.createdAt.toISOString(),
    alreadyTracked: false,
  };
}

export async function removeWatchlistItemFromDb(id: string, ownerKey: string) {
  const deleted = await db
    .delete(trendWatchlists)
    .where(and(eq(trendWatchlists.id, id), eq(trendWatchlists.ownerKey, ownerKey)))
    .returning({ id: trendWatchlists.id });
  return deleted[0] || null;
}

function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

export async function createTrendApiKeyInDb(input: {
  label: string;
  userUid?: string | null;
  planTier?: 'starter' | 'agency';
}) {
  const rawSecret = `nat_live_${crypto.randomBytes(18).toString('hex')}`;
  const keyPrefix = rawSecret.slice(0, 14);
  const keyHash = hashApiKey(rawSecret);
  const tier = input.planTier === 'agency' ? 'agency' : 'starter';
  const monthlyQuota = tier === 'agency' ? 50000 : 5000;

  const [created] = await db
    .insert(trendApiKeys)
    .values({
      id: `tak_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      label: input.label.trim().slice(0, 80),
      keyPrefix,
      keyHash,
      userUid: input.userUid || null,
      planTier: tier,
      monthlyQuota,
      requestCount: 0,
      isActive: true,
      createdAt: new Date(),
    })
    .returning();

  return {
    keyRecord: {
      id: created.id,
      label: created.label,
      keyPrefix: created.keyPrefix,
      planTier: created.planTier,
      monthlyQuota: created.monthlyQuota,
      requestCount: created.requestCount,
      isActive: created.isActive,
      lastUsedAt: null,
      createdAt: created.createdAt.toISOString(),
    },
    plainTextKey: rawSecret,
  };
}

export async function listTrendApiKeysFromDb(userUid?: string | null) {
  const rows = userUid
    ? await db
        .select()
        .from(trendApiKeys)
        .where(eq(trendApiKeys.userUid, userUid))
        .orderBy(desc(trendApiKeys.createdAt))
        .limit(20)
    : await db
        .select()
        .from(trendApiKeys)
        .orderBy(desc(trendApiKeys.createdAt))
        .limit(20);

  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    keyPrefix: r.keyPrefix,
    planTier: r.planTier,
    monthlyQuota: r.monthlyQuota,
    requestCount: r.requestCount,
    isActive: r.isActive,
    lastUsedAt: r.lastUsedAt ? r.lastUsedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function revokeTrendApiKeyInDb(id: string) {
  const [updated] = await db
    .update(trendApiKeys)
    .set({ isActive: false })
    .where(eq(trendApiKeys.id, id))
    .returning({ id: trendApiKeys.id, isActive: trendApiKeys.isActive });
  return updated || null;
}

export async function verifyAndConsumeTrendApiKey(rawKey: string): Promise<{
  ok: boolean;
  reason?: string;
  key?: {
    id: string;
    label: string;
    planTier: string;
    monthlyQuota: number;
    requestCount: number;
  };
}> {
  const clean = rawKey.trim();
  if (!clean.startsWith('nat_')) {
    return { ok: false, reason: 'Invalid NepalAI Trends API key prefix.' };
  }
  const keyHash = hashApiKey(clean);
  const [found] = await db
    .select()
    .from(trendApiKeys)
    .where(eq(trendApiKeys.keyHash, keyHash))
    .limit(1);

  if (!found || !found.isActive) {
    return { ok: false, reason: 'API key not found or revoked.' };
  }
  if (found.requestCount >= found.monthlyQuota) {
    return { ok: false, reason: 'Monthly API quota exceeded for this key.' };
  }

  const nextCount = found.requestCount + 1;
  await db
    .update(trendApiKeys)
    .set({
      requestCount: nextCount,
      lastUsedAt: new Date(),
    })
    .where(eq(trendApiKeys.id, found.id));

  return {
    ok: true,
    key: {
      id: found.id,
      label: found.label,
      planTier: found.planTier,
      monthlyQuota: found.monthlyQuota,
      requestCount: nextCount,
    },
  };
}

function serializeVelocityAlert(row: typeof trendVelocityAlerts.$inferSelect) {
  return {
    ...row,
    lastTriggeredAt: row.lastTriggeredAt ? row.lastTriggeredAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listVelocityAlertsFromDb(opts: { ownerKey?: string; email?: string }) {
  const conditions = [];
  if (opts.ownerKey) conditions.push(eq(trendVelocityAlerts.ownerKey, opts.ownerKey));
  if (opts.email) conditions.push(eq(trendVelocityAlerts.email, opts.email.trim().toLowerCase()));

  const rows =
    conditions.length > 0
      ? await db
          .select()
          .from(trendVelocityAlerts)
          .where(conditions.length === 1 ? conditions[0] : or(...conditions))
          .orderBy(desc(trendVelocityAlerts.createdAt))
          .limit(30)
      : await db
          .select()
          .from(trendVelocityAlerts)
          .orderBy(desc(trendVelocityAlerts.createdAt))
          .limit(30);

  return rows.map(serializeVelocityAlert);
}

export async function getActiveVelocityAlertsFromDb() {
  const rows = await db
    .select()
    .from(trendVelocityAlerts)
    .where(eq(trendVelocityAlerts.isActive, true))
    .orderBy(desc(trendVelocityAlerts.createdAt))
    .limit(100);
  return rows.map(serializeVelocityAlert);
}

export async function createVelocityAlertInDb(input: {
  email: string;
  userUid?: string | null;
  ownerKey: string;
  keywordFilter?: string | null;
  category?: string;
  country?: string;
  minVelocityScore: number;
  minVelocityDelta?: number;
  deliveryChannel?: 'email' | 'whatsapp' | 'both';
  whatsappNumber?: string | null;
  whatsappWebhookUrl?: string | null;
  cooldownMinutes?: number;
}) {
  const cleanEmail = input.email.trim().toLowerCase();
  const cleanFilter = input.keywordFilter?.trim() ? input.keywordFilter.trim().slice(0, 120) : null;
  const normalizedFilter = cleanFilter ? normalizeKeyword(cleanFilter) : null;
  const clampedScore = Math.max(10, Math.min(100, Math.round(input.minVelocityScore)));
  const clampedDelta = Math.max(0, Math.round(input.minVelocityDelta || 0));
  const clampedCooldown = Math.max(15, Math.min(1440, Math.round(input.cooldownMinutes || 180)));
  const channel: 'email' | 'whatsapp' | 'both' =
    input.deliveryChannel === 'whatsapp' || input.deliveryChannel === 'both'
      ? input.deliveryChannel
      : 'email';
  const cleanWa = input.whatsappNumber ? normalizeWhatsappNumber(input.whatsappNumber) || null : null;
  const cleanWebhook = input.whatsappWebhookUrl?.trim() ? input.whatsappWebhookUrl.trim().slice(0, 400) : null;
  const now = new Date();

  const [created] = await db
    .insert(trendVelocityAlerts)
    .values({
      id: `valert_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      email: cleanEmail,
      userUid: input.userUid || null,
      ownerKey: input.ownerKey,
      keywordFilter: cleanFilter,
      keywordNormalized: normalizedFilter,
      category: input.category || 'all',
      country: (input.country || 'NP').toUpperCase(),
      minVelocityScore: clampedScore,
      minVelocityDelta: clampedDelta,
      deliveryChannel: channel,
      whatsappNumber: cleanWa,
      whatsappWebhookUrl: cleanWebhook,
      isActive: true,
      cooldownMinutes: clampedCooldown,
      triggerCount: 0,
      unsubscribeToken: crypto.randomBytes(16).toString('hex'),
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return serializeVelocityAlert(created);
}

export async function updateVelocityAlertInDb(
  id: string,
  ownerKey: string,
  patch: {
    isActive?: boolean;
    minVelocityScore?: number;
    minVelocityDelta?: number;
    category?: string;
    keywordFilter?: string | null;
    deliveryChannel?: 'email' | 'whatsapp' | 'both';
    whatsappNumber?: string | null;
    whatsappWebhookUrl?: string | null;
  }
) {
  const updates: Partial<typeof trendVelocityAlerts.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (typeof patch.isActive === 'boolean') updates.isActive = patch.isActive;
  if (typeof patch.minVelocityScore === 'number') {
    updates.minVelocityScore = Math.max(10, Math.min(100, Math.round(patch.minVelocityScore)));
  }
  if (typeof patch.minVelocityDelta === 'number') {
    updates.minVelocityDelta = Math.max(0, Math.round(patch.minVelocityDelta));
  }
  if (typeof patch.category === 'string') updates.category = patch.category;
  if (patch.keywordFilter !== undefined) {
    const clean = patch.keywordFilter?.trim() ? patch.keywordFilter.trim().slice(0, 120) : null;
    updates.keywordFilter = clean;
    updates.keywordNormalized = clean ? normalizeKeyword(clean) : null;
  }
  if (
    patch.deliveryChannel === 'email' ||
    patch.deliveryChannel === 'whatsapp' ||
    patch.deliveryChannel === 'both'
  ) {
    updates.deliveryChannel = patch.deliveryChannel;
  }
  if (patch.whatsappNumber !== undefined) {
    updates.whatsappNumber = patch.whatsappNumber ? normalizeWhatsappNumber(patch.whatsappNumber) || null : null;
  }
  if (patch.whatsappWebhookUrl !== undefined) {
    updates.whatsappWebhookUrl = patch.whatsappWebhookUrl?.trim()
      ? patch.whatsappWebhookUrl.trim().slice(0, 400)
      : null;
  }

  const [updated] = await db
    .update(trendVelocityAlerts)
    .set(updates)
    .where(and(eq(trendVelocityAlerts.id, id), eq(trendVelocityAlerts.ownerKey, ownerKey)))
    .returning();

  return updated ? serializeVelocityAlert(updated) : null;
}

export async function deleteVelocityAlertInDb(id: string, ownerKey: string) {
  const deleted = await db
    .delete(trendVelocityAlerts)
    .where(and(eq(trendVelocityAlerts.id, id), eq(trendVelocityAlerts.ownerKey, ownerKey)))
    .returning({ id: trendVelocityAlerts.id });
  return deleted[0] || null;
}

export async function deleteVelocityAlertByToken(token: string) {
  const deleted = await db
    .delete(trendVelocityAlerts)
    .where(eq(trendVelocityAlerts.unsubscribeToken, token))
    .returning({ id: trendVelocityAlerts.id, email: trendVelocityAlerts.email });
  return deleted[0] || null;
}

export async function markVelocityAlertTriggered(id: string, keyword: string, score: number) {
  await db
    .update(trendVelocityAlerts)
    .set({
      lastTriggeredAt: new Date(),
      lastTriggeredKeyword: keyword,
      lastTriggeredScore: Math.round(score),
      triggerCount: sql`${trendVelocityAlerts.triggerCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(trendVelocityAlerts.id, id));
}

export async function listActiveTrendsWithLatestDelta(country = 'NP', limit = 60) {
  const activeRows = await listTrendsFromDb({ country, activeOnly: true, limit });
  if (activeRows.length === 0) return [];

  const trendIds = activeRows.map((t) => t.id);
  const snapshots = await db
    .select()
    .from(trendSnapshots)
    .where(inArray(trendSnapshots.trendId, trendIds))
    .orderBy(desc(trendSnapshots.capturedAt))
    .limit(limit * 3);

  const latestByTrend = new Map<string, { velocityDelta: number; rankPosition: number }>();
  for (const snap of snapshots) {
    if (!latestByTrend.has(snap.trendId)) {
      latestByTrend.set(snap.trendId, {
        velocityDelta: snap.velocityDelta,
        rankPosition: snap.rankPosition,
      });
    }
  }

  return activeRows.map((tr) => ({
    ...tr,
    latestVelocityDelta: latestByTrend.get(tr.id)?.velocityDelta ?? 0,
    rankPosition: latestByTrend.get(tr.id)?.rankPosition ?? 1,
  }));
}

// =========================================================================
// PHASE 3B: SEASONAL BENCHMARKS, WHATSAPP LOGS & DIASPORA PARTNER SLOTS
// =========================================================================

export async function ensureSeasonalBenchmarksSeeded() {
  const existing = await db.select({ id: seasonalBenchmarks.id }).from(seasonalBenchmarks).limit(1);
  if (existing.length > 0) return;

  const currentMonth = new Date().getUTCMonth() + 1;
  const now = new Date();

  await db
    .insert(seasonalBenchmarks)
    .values(
      CURATED_SEASONAL_BENCHMARKS.map((seed) => {
        const computed = computeSeasonalDirection(seed.monthlyIndex, currentMonth);
        return {
          id: seed.id,
          keyword: seed.keyword,
          keywordNormalized: normalizeKeyword(seed.keyword),
          pillar: seed.pillar,
          bsMonthLabel: seed.bsMonthLabel,
          peakMonthsJson: seed.peakMonths,
          monthlyIndexJson: seed.monthlyIndex,
          currentInterestScore: computed.currentScore,
          direction: computed.direction,
          romanizedNepali: seed.romanizedNepali,
          devanagariVariant: seed.devanagariVariant,
          linkedToolTab: seed.linkedToolTab || null,
          insightNote: seed.insightNote,
          dataSource: 'bs_calendar_benchmark',
          updatedAt: now,
          createdAt: now,
        };
      })
    )
    .onConflictDoNothing();
}

export async function listSeasonalBenchmarksFromDb(opts: {
  pillar?: string;
  search?: string;
}) {
  await ensureSeasonalBenchmarksSeeded();
  const conditions = [];

  if (opts.pillar && opts.pillar !== 'all') {
    conditions.push(eq(seasonalBenchmarks.pillar, opts.pillar));
  }
  if (opts.search && opts.search.trim()) {
    const q = `%${opts.search.trim()}%`;
    conditions.push(
      or(
        ilike(seasonalBenchmarks.keyword, q),
        ilike(seasonalBenchmarks.romanizedNepali, q),
        ilike(seasonalBenchmarks.devanagariVariant, q),
        ilike(seasonalBenchmarks.bsMonthLabel, q),
        ilike(seasonalBenchmarks.insightNote, q)
      )!
    );
  }

  const rows = await db
    .select()
    .from(seasonalBenchmarks)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(seasonalBenchmarks.currentInterestScore));

  const currentMonth = new Date().getUTCMonth() + 1;
  return rows.map((r) => {
    const dynamic = computeSeasonalDirection(r.monthlyIndexJson || [], currentMonth);
    return {
      ...r,
      peakMonths: r.peakMonthsJson,
      monthlyIndex: r.monthlyIndexJson,
      currentInterestScore: dynamic.currentScore,
      direction: dynamic.direction,
      updatedAt: r.updatedAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
    };
  });
}

export async function recordWhatsappDeliveryLog(input: {
  sourceType: string;
  referenceId?: string | null;
  recipientNumber: string;
  webhookTarget: string;
  payloadPreview: string;
  deliveryStatus: string;
  httpStatus?: number | null;
  errorMessage?: string | null;
}) {
  const [created] = await db
    .insert(whatsappDeliveryLogs)
    .values({
      id: `walog_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      sourceType: input.sourceType,
      referenceId: input.referenceId || null,
      recipientNumber: input.recipientNumber,
      webhookTarget: input.webhookTarget,
      payloadPreview: input.payloadPreview,
      deliveryStatus: input.deliveryStatus,
      httpStatus: input.httpStatus ?? null,
      errorMessage: input.errorMessage || null,
      createdAt: new Date(),
    })
    .returning();
  return {
    ...created,
    createdAt: created.createdAt.toISOString(),
  };
}

export async function listRecentWhatsappLogsFromDb(limit = 20) {
  const rows = await db
    .select()
    .from(whatsappDeliveryLogs)
    .orderBy(desc(whatsappDeliveryLogs.createdAt))
    .limit(limit);
  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function ensureDiasporaPartnerSlotsSeeded() {
  const existing = await db.select({ id: diasporaPartnerSlots.id }).from(diasporaPartnerSlots).limit(1);
  if (existing.length > 0) return;

  const now = new Date();
  await db
    .insert(diasporaPartnerSlots)
    .values([
      {
        id: 'dp_remit_corridor',
        partnerName: 'NepalAI Forex & Remittance Calculator',
        tagline: 'Compare live NRB remittance buying rates & eSewa/bank corridor fees before sending to Kathmandu.',
        ctaLabel: 'Check NRB Rates',
        ctaUrl: '/?tab=fx',
        categoryLabel: 'Remittance & FX Corridor',
        targetCountries: ['US', 'AU', 'GB', 'AE', 'JP', 'CA'],
        sponsorTier: 'featured',
        impressionsCount: 0,
        clicksCount: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'dp_kathmandu_gifting',
        partnerName: 'NepalAI Commerce — Diaspora Gift Storefronts',
        tagline: 'Verify local Kathmandu flower, bakery & Dashain hamper merchants with instant eSewa/Khalti checkout.',
        ctaLabel: 'Explore Storefronts',
        ctaUrl: '/keywords/nepal/business',
        categoryLabel: 'Diaspora Gifting & Retail',
        targetCountries: ['US', 'AU', 'GB', 'CA'],
        sponsorTier: 'hub_spotlight',
        impressionsCount: 0,
        clicksCount: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'dp_uae_jp_flights',
        partnerName: 'Himalayan Travel & Trekking Demand Desk',
        tagline: 'Track peak Kathmandu–Dubai/Tokyo airfare windows & Annapurna/Everest permit cycles.',
        ctaLabel: 'View Seasonal Windows',
        ctaUrl: '/trending/seasonal',
        categoryLabel: 'Flights & Trekking Travel',
        targetCountries: ['AE', 'JP', 'AU', 'GB'],
        sponsorTier: 'hub_spotlight',
        impressionsCount: 0,
        clicksCount: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing();
}

export async function listDiasporaPartnerSlotsFromDb(country = 'ALL') {
  await ensureDiasporaPartnerSlotsSeeded();
  const rows = await db
    .select()
    .from(diasporaPartnerSlots)
    .where(eq(diasporaPartnerSlots.isActive, true))
    .orderBy(desc(diasporaPartnerSlots.createdAt));

  const upper = country.toUpperCase();
  const filtered =
    upper === 'ALL'
      ? rows
      : rows.filter((r) => (r.targetCountries || []).map((c) => c.toUpperCase()).includes(upper));

  return filtered.slice(0, 2).map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function trackDiasporaPartnerEventInDb(
  id: string,
  eventType: 'impression' | 'click'
) {
  const [updated] = await db
    .update(diasporaPartnerSlots)
    .set(
      eventType === 'click'
        ? {
            clicksCount: sql`${diasporaPartnerSlots.clicksCount} + 1`,
            updatedAt: new Date(),
          }
        : {
            impressionsCount: sql`${diasporaPartnerSlots.impressionsCount} + 1`,
            updatedAt: new Date(),
          }
    )
    .where(eq(diasporaPartnerSlots.id, id))
    .returning();

  return updated
    ? {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      }
    : null;
}

export async function createDiasporaPartnerSlotInDb(input: {
  partnerName: string;
  tagline: string;
  ctaLabel: string;
  ctaUrl: string;
  categoryLabel: string;
  targetCountries: string[];
}) {
  const now = new Date();
  const [created] = await db
    .insert(diasporaPartnerSlots)
    .values({
      id: `dp_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      partnerName: input.partnerName.trim().slice(0, 90),
      tagline: input.tagline.trim().slice(0, 220),
      ctaLabel: input.ctaLabel.trim().slice(0, 40) || 'Visit Partner',
      ctaUrl: input.ctaUrl.trim().slice(0, 300),
      categoryLabel: input.categoryLabel.trim().slice(0, 60),
      targetCountries:
        input.targetCountries.length > 0
          ? input.targetCountries.map((c) => c.toUpperCase())
          : ['US', 'AU', 'GB', 'AE', 'JP', 'CA'],
      sponsorTier: 'hub_spotlight',
      impressionsCount: 0,
      clicksCount: 0,
      isActive: false, // Pending moderation / partner confirmation
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return {
    ...created,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}


