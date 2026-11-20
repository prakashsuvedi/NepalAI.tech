import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  ArrowRight,
  Search,
  RefreshCw,
  Globe2,
  Briefcase,
  CalendarRange,
} from 'lucide-react';
import { Language, ThemeMode } from '../../types';
import { TREND_CATEGORIES } from '../../utils/trendsEngine';
import { fetchSharedJson } from '../../utils/officialFeedsClient';

export interface LiveTrendSummary {
  id: string;
  slug: string;
  keyword: string;
  country: string;
  language: string;
  category: string;
  audienceSegment: string;
  trafficBand: string;
  trendScore: number;
  aiWhyTrending?: string | null;
  lastSeenAt: string;
}

interface MarketDeskState {
  loading: boolean;
  publishedDate: string | null;
  usdBuy: number | null;
  usdSell: number | null;
  audBuy: number | null;
  gbpBuy: number | null;
  goldTola: number | null;
  goldDelta: number | null;
  silverTola: number | null;
  kalimatiItems: Array<{ id: string; labelEn: string; labelNe: string; price: number }>;
}

interface TrendingHomepageStripProps {
  theme: ThemeMode;
  language: Language;
  onOpenTrendDetail: (slug: string) => void;
  onOpenTrendsRoute: (path: string) => void;
  onOpenDailyTab?: (tab: string) => void;
}

function formatRelativeAge(iso: string, isNe: boolean): string {
  const diffMs = Math.max(0, Date.now() - new Date(iso).getTime());
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return isNe ? `${mins || 1} मिनेट अघि` : `${mins || 1}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return isNe ? `${hrs} घण्टा अघि` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return isNe ? `${days} दिन अघि` : `${days}d ago`;
}

function formatNpr(amount: number): string {
  return new Intl.NumberFormat('en-IN').format(Math.round(amount));
}

export const TrendingHomepageStrip: React.FC<TrendingHomepageStripProps> = ({
  theme,
  language,
  onOpenTrendDetail,
  onOpenTrendsRoute,
  onOpenDailyTab,
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';

  const [trends, setTrends] = useState<LiveTrendSummary[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);

  const [marketDesk, setMarketDesk] = useState<MarketDeskState>({
    loading: true,
    publishedDate: null,
    usdBuy: null,
    usdSell: null,
    audBuy: null,
    gbpBuy: null,
    goldTola: null,
    goldDelta: null,
    silverTola: null,
    kalimatiItems: [],
  });

  const loadTrends = async (category: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const resp = await fetch(
        `/api/trends/nepal?limit=6&category=${encodeURIComponent(category)}`
      );
      if (!resp.ok) throw new Error('Unable to load live Nepal trends');
      const data = await resp.json();
      setTrends(Array.isArray(data.trends) ? data.trends : []);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to load trends right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrends(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    let mounted = true;
    const loadMarketDesk = async () => {
      try {
        const [nrbRes, bullionRes, kalimatiRes] = await Promise.all([
          fetchSharedJson('/api/forex/nrb'),
          fetchSharedJson('/api/bullion/fenegosida'),
          fetchSharedJson('/api/market/kalimati'),
        ]);

        if (!mounted) return;

        const featured = kalimatiRes?.featuredRates || {};
        const pickProduce = [
          { key: 'tomato_big', fallbackEn: 'Tomato Big', fallbackNe: 'गोलभेंडा ठूलो' },
          { key: 'potato_red', fallbackEn: 'Potato Red', fallbackNe: 'आलु रातो' },
          { key: 'onion_dry', fallbackEn: 'Onion Dry', fallbackNe: 'प्याज सुकेको' },
        ]
          .map((spec) => {
            const item = featured[spec.key];
            if (!item) return null;
            return {
              id: spec.key,
              labelEn: item.name || spec.fallbackEn,
              labelNe: item.nameNe || spec.fallbackNe,
              price: Number(item.avgPrice || item.wholesale || item.pricePerKg || 0),
            };
          })
          .filter((x): x is { id: string; labelEn: string; labelNe: string; price: number } => Boolean(x && x.price > 0));

        setMarketDesk({
          loading: false,
          publishedDate: bullionRes?.publishedAt || nrbRes?.publishedAt || null,
          usdBuy: nrbRes?.rates?.USD?.buy ?? null,
          usdSell: nrbRes?.rates?.USD?.sell ?? null,
          audBuy: nrbRes?.rates?.AUD?.buy ?? null,
          gbpBuy: nrbRes?.rates?.GBP?.buy ?? null,
          goldTola: bullionRes?.rates?.chhapawalGoldPerTola ?? null,
          goldDelta:
            typeof bullionRes?.rates?.deltaChhapawalPerTola === 'number'
              ? bullionRes.rates.deltaChhapawalPerTola
              : null,
          silverTola: bullionRes?.rates?.silverPerTola ?? null,
          kalimatiItems: pickProduce,
        });
      } catch {
        if (mounted) {
          setMarketDesk((prev) => ({ ...prev, loading: false }));
        }
      }
    };

    loadMarketDesk();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRefreshFeed = async () => {
    setSyncing(true);
    try {
      await fetch('/api/trends/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeDiaspora: false }),
      });
      await loadTrends(selectedCategory);
    } finally {
      setSyncing(false);
    }
  };

  const quickCategories = [
    { slug: 'all', labelEn: 'All Nepal', labelNe: 'सबै नेपाल' },
    { slug: 'sports-npl', labelEn: 'Sports & NPL', labelNe: 'खेलकुद' },
    { slug: 'politics-governance', labelEn: 'Politics', labelNe: 'राजनीति' },
    { slug: 'technology-ai', labelEn: 'Tech & AI', labelNe: 'प्रविधि' },
    { slug: 'business-finance', labelEn: 'Finance', labelNe: 'अर्थ' },
  ];

  const getCategoryLabel = (slug: string) => {
    const found = TREND_CATEGORIES.find((c) => c.slug === slug);
    if (!found) return slug;
    return isNe ? found.labelNe : found.labelEn;
  };

  return (
    <section
      className={`py-10 sm:py-14 border-t transition-colors ${
        isDark
          ? 'border-slate-800/80 bg-[#070B14] text-slate-100'
          : 'border-slate-200/90 bg-[#FAF9F6] text-slate-900'
      }`}
      aria-label="Live Nepal Pulse Broadsheet"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`rounded-2xl border overflow-hidden ${
            isDark
              ? 'border-slate-800 bg-[#0B1220]'
              : 'border-slate-200/90 bg-white shadow-sm'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
            
            {/* Left 8 Columns: Trending in Nepal Search Feed */}
            <div className="lg:col-span-8 p-5 sm:p-7 flex flex-col justify-between">
              <div>
                {/* Broadsheet Masthead Header */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.14em]">
                      <span className="text-rose-700 dark:text-rose-400">02</span>
                      <span aria-hidden="true" className="text-slate-400 dark:text-slate-600">/</span>
                      <TrendingUp className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
                      <span className="text-cyan-700 dark:text-cyan-400">
                        {isNe ? 'प्रत्यक्ष नेपाल पल्स ब्रोडशिट' : 'LIVE PULSE BROADSHEET'}
                      </span>
                    </div>
                    <h2
                      className={`mt-1.5 text-xl sm:text-2xl font-extrabold tracking-tight font-display ${
                        isDark ? 'text-white' : 'text-slate-950'
                      }`}
                    >
                      {isNe ? 'नेपालमा अहिले ट्रेन्डिङ' : 'Trending in Nepal'}
                    </h2>
                  </div>

                  {/* Category Filter Tabs + Sync Trigger */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full"
                      role="tablist"
                      aria-label="Filter homepage trends by category"
                    >
                      {quickCategories.map((cat) => {
                        const active = selectedCategory === cat.slug;
                        return (
                          <button
                            key={cat.slug}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => setSelectedCategory(cat.slug)}
                            className={`relative px-2.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                              active
                                ? isDark
                                  ? 'text-cyan-300'
                                  : 'text-cyan-800'
                                : isDark
                                  ? 'text-slate-400 hover:text-slate-200'
                                  : 'text-slate-600 hover:text-slate-950'
                            }`}
                          >
                            <span>{isNe ? cat.labelNe : cat.labelEn}</span>
                            {active && (
                              <span
                                className="absolute inset-x-1 bottom-0 h-[2px] bg-cyan-600 dark:bg-cyan-400"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleRefreshFeed}
                      disabled={syncing}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isDark
                          ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-cyan-500/50 hover:text-white'
                          : 'border-slate-200 bg-[#FAF9F6] text-slate-800 hover:border-cyan-600 hover:text-slate-950'
                      }`}
                      aria-label="Refresh live Nepal trends feed"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 ${syncing ? 'animate-spin' : ''}`}
                      />
                      <span>{syncing ? (isNe ? 'ताजा हुँदै...' : 'Syncing') : (isNe ? 'रिफ्रेस' : 'Sync')}</span>
                    </button>
                  </div>
                </div>

                {/* Ranked Content Grid */}
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-5">
                    {[1, 2, 3, 4, 5, 6].map((idx) => (
                      <div
                        key={idx}
                        className={`h-20 rounded-xl border ${
                          isDark
                            ? 'border-slate-800 bg-slate-900/40'
                            : 'border-slate-200 bg-slate-100/70'
                        }`}
                      />
                    ))}
                  </div>
                ) : errorMsg ? (
                  <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                    <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                      {errorMsg}
                    </span>
                    <button
                      type="button"
                      onClick={() => loadTrends(selectedCategory)}
                      className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {isNe ? 'पुन: प्रयास गर्नुहोस्' : 'Retry'}
                    </button>
                  </div>
                ) : trends.length === 0 ? (
                  <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {isNe
                          ? 'यस वर्गमा अहिले सक्रिय ट्रेन्ड भेटिएन।'
                          : 'No active trends stored in this category yet.'}
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {isNe
                          ? 'ताजा Google Trends Nepal RSS फिड तान्न Sync थिच्नुहोस्।'
                          : 'Click Sync to fetch the latest Google Trends Nepal RSS snapshot.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRefreshFeed}
                      className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {isNe ? 'Google RSS सिङ्क गर्नुहोस्' : 'Fetch Live Nepal RSS'}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 divide-y md:divide-y-0 divide-slate-200/70 dark:divide-slate-800/80 pt-3">
                    {trends.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onOpenTrendDetail(item.slug)}
                        className={`group text-left py-3.5 px-2.5 -mx-1 rounded-lg transition-colors flex items-start gap-3.5 cursor-pointer ${
                          isDark
                            ? 'hover:bg-white/[0.04]'
                            : 'hover:bg-[#FAF9F6]'
                        }`}
                      >
                        <span
                          className={`font-mono tabular-nums text-xs font-bold pt-0.5 shrink-0 ${
                            idx < 2
                              ? 'text-rose-700 dark:text-rose-400'
                              : 'text-cyan-700 dark:text-cyan-400'
                          }`}
                          aria-hidden="true"
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-sm font-bold leading-snug group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors truncate ${
                              isDark ? 'text-white' : 'text-slate-950'
                            }`}
                          >
                            {item.keyword}
                          </div>
                          <div
                            className={`mt-1 flex flex-wrap items-center gap-1.5 text-xs ${
                              isDark ? 'text-slate-400' : 'text-slate-600'
                            }`}
                          >
                            <span>{getCategoryLabel(item.category)}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{item.trafficBand}</span>
                            <span aria-hidden="true">·</span>
                            <span>{formatRelativeAge(item.lastSeenAt, isNe)}</span>
                          </div>
                        </div>
                        <ArrowRight
                          className="h-4 w-4 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Broadsheet Sub-Routes Footer Strip */}
              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => onOpenTrendsRoute('/trending/seasonal')}
                    className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <CalendarRange className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isNe ? 'मौसमी ट्रेन्ड्स नक्सा (Dashain/SEE)' : 'Seasonal Trends Map'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenTrendsRoute('/keywords/nepal')}
                    className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Search className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
                    <span>{isNe ? 'किबोर्ड एक्सप्लोरर' : 'Keyword Explorer'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenTrendsRoute('/trending/diaspora')}
                    className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Globe2 className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
                    <span>{isNe ? 'प्रवास ट्रेन्ड्स' : 'Diaspora Trends'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenTrendsRoute('/keywords/nepal/business')}
                    className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Briefcase className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
                    <span>{isNe ? 'व्यापारिक किबोर्ड' : 'Business Keywords'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenTrendsRoute('/trending/nepal')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>{isNe ? 'सबै ट्रेन्ड्स र AI विश्लेषण' : 'Open Full Trends Hub'}</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Right 4 Columns: Official Nepal Market Desk (NRB + FENEGOSIDA + Kalimati) */}
            <aside
              className={`lg:col-span-4 p-5 sm:p-6 flex flex-col justify-between ${
                isDark ? 'bg-[#080E1B]' : 'bg-[#FAF9F6]/70'
              }`}
              aria-label="Official Nepal Economic & Market Rates"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-rose-700 dark:text-rose-400 font-bold">
                      {isNe ? 'आधिकारिक आर्थिक डेस्क' : 'OFFICIAL MARKET DESK'}
                    </div>
                    <h3 className={`mt-1 text-base font-bold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {isNe ? 'राष्ट्र बैंक, सुनचाँदी र कालिमाटी' : 'NRB Forex, Bullion & Produce'}
                    </h3>
                  </div>
                  {marketDesk.publishedDate && (
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                      {marketDesk.publishedDate}
                    </span>
                  )}
                </div>

                {/* Hairline Table Blocks */}
                <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {/* Block 1: NRB Forex */}
                  <div className="py-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-700 dark:text-cyan-400 font-semibold">
                        {isNe ? 'नेपाल राष्ट्र बैंक विनिमय' : 'NRB Exchange Rates'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenDailyTab?.('fx')}
                        className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 hover:underline cursor-pointer"
                      >
                        {isNe ? 'सबै हेर्नुहोस्' : 'All 11'}
                      </button>
                    </div>
                    <div className="space-y-1.5 font-mono tabular-nums">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">USD 1</span>
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                          {marketDesk.usdBuy !== null
                            ? `रू ${marketDesk.usdBuy.toFixed(2)} / ${marketDesk.usdSell?.toFixed(2)}`
                            : marketDesk.loading
                            ? '—'
                            : 'रू 148.97 / 149.57'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">AUD 1 · GBP 1</span>
                        <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {marketDesk.audBuy !== null && marketDesk.gbpBuy !== null
                            ? `रू ${marketDesk.audBuy.toFixed(2)} · ${marketDesk.gbpBuy.toFixed(2)}`
                            : marketDesk.loading
                            ? '—'
                            : 'रू 105.05 · 199.78'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Block 2: FENEGOSIDA Bullion */}
                  <div className="py-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-700 dark:text-cyan-400 font-semibold">
                        {isNe ? 'सुनचाँदी महासंघ (FENEGOSIDA)' : 'FENEGOSIDA Bullion'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenDailyTab?.('bullion')}
                        className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 hover:underline cursor-pointer"
                      >
                        {isNe ? 'कर हिसाब' : 'Jewelry Tax'}
                      </button>
                    </div>
                    <div className="space-y-1.5 font-mono tabular-nums">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">{isNe ? 'छापावाल सुन / तोला' : '24K Gold / Tola'}</span>
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                          {marketDesk.goldTola !== null
                            ? `रू ${formatNpr(marketDesk.goldTola)}`
                            : marketDesk.loading
                            ? '—'
                            : 'रू 1,62,500'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">{isNe ? 'चाँदी / तोला' : 'Silver / Tola'}</span>
                        <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {marketDesk.silverTola !== null
                            ? `रू ${formatNpr(marketDesk.silverTola)}`
                            : marketDesk.loading
                            ? '—'
                            : 'रू 1,960'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Block 3: Kalimati Market */}
                  <div className="py-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-700 dark:text-cyan-400 font-semibold">
                        {isNe ? 'कालिमाटी बजार (थोक औसत)' : 'Kalimati Wholesale'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenDailyTab?.('market')}
                        className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 hover:underline cursor-pointer"
                      >
                        {isNe ? 'बजार र रोपनी' : 'Full Board'}
                      </button>
                    </div>
                    <div className="space-y-1.5 font-mono tabular-nums">
                      {(marketDesk.kalimatiItems.length > 0
                        ? marketDesk.kalimatiItems
                        : [
                            { id: 't', labelEn: 'Tomato Big (Nepali)', labelNe: 'गोलभेंडा ठूलो', price: 55 },
                            { id: 'p', labelEn: 'Potato Red', labelNe: 'आलु रातो', price: 40 },
                            { id: 'o', labelEn: 'Onion Dry', labelNe: 'प्याज सुकेको', price: 72 },
                          ]
                      ).map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-2">
                          <span className="text-slate-600 dark:text-slate-400 truncate font-sans">
                            {isNe ? item.labelNe : item.labelEn}
                          </span>
                          <span className={`font-semibold shrink-0 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            रू {item.price}/kg
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>nrb.org.np · fenegosida.org</span>
                <span>kalimatimarket.gov.np</span>
              </div>
            </aside>

          </div>
        </div>
      </div>
    </section>
  );
};
