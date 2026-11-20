import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Search,
  Globe2,
  Briefcase,
  ArrowLeft,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  BookOpen,
  Layers,
  Wrench,
  Bookmark,
  Download,
  Key,
  Terminal,
  GitCompare,
  Trash2,
} from 'lucide-react';
import { Language, ThemeMode } from '../../types';
import {
  TREND_CATEGORIES,
  DIASPORA_COUNTRIES,
  TriScriptVariantRow,
  buildKeywordCsvExport,
  buildVelocitySeriesFromSnapshots,
  buildVelocitySeriesFromInterest,
} from '../../utils/trendsEngine';
import {
  TrendsRouteMatch,
  buildTrendsListingSeo,
  buildTrendDetailSeo,
  applyClientTrendsSeo,
} from '../../utils/trendsSeo';
import { useToast } from '../../context/ToastContext';
import { TrendsD3VelocityChart } from './TrendsD3VelocityChart';
import { DailyInsightsSubscription } from './DailyInsightsSubscription';
import { VelocityThresholdAlerts } from './VelocityThresholdAlerts';
import { SeasonalAnalyticsView } from './SeasonalAnalyticsView';
import {
  DiasporaPartnersSection,
  DiasporaPartnerSlotDto,
} from './DiasporaPartnersSection';

interface TrendNewsDto {
  id: string;
  title: string;
  url: string;
  source: string;
  snippet?: string | null;
  imageUrl?: string | null;
  publishedAt: string;
}

interface TrendSnapshotDto {
  id: string;
  capturedAt: string;
  rankPosition: number;
  trafficBand: string;
  numericTrafficFloor: number;
  velocityDelta: number;
}

interface ContentBriefOutline {
  headlineEn: string;
  headlineNe: string;
  hookEn: string;
  hookNe: string;
  keyPoints: string[];
  seoKeywords: string[];
  faqQuestion: string;
  faqAnswer: string;
}

interface TrendItemDto {
  id: string;
  slug: string;
  keyword: string;
  keywordNormalized: string;
  country: string;
  language: string;
  category: string;
  audienceSegment: string;
  trafficBand: string;
  numericTrafficFloor: number;
  trendScore: number;
  aiWhyTrending?: string | null;
  citations: Array<{ title: string; url: string; source: string }>;
  relatedQueries: string[];
  triScriptVariants: TriScriptVariantRow[];
  linkedToolTab?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  newsItems?: TrendNewsDto[];
  snapshots?: TrendSnapshotDto[];
  briefs?: Array<{ id: string; outlineJson: ContentBriefOutline; createdAt: string }>;
}

interface KeywordMetricDto {
  id: string;
  keyword: string;
  country: string;
  detectedScript: string;
  category: string;
  interestScore: number;
  direction: string;
  localIntentScore: number;
  diasporaIntentScore: number;
  dataSource: string;
  interestSeries: Array<{ date: string; score: number }>;
  relatedQueries: string[];
  contentAngles: string[];
  variants: Array<{
    id?: string;
    baseKeyword: string;
    englishVariant: string;
    romanizedNepali: string;
    devanagariVariant: string;
    intentTag: string;
  }>;
}

interface BusinessPackDto {
  category: string;
  direction: string;
  localIntentScore: number;
  diasporaIntentScore: number;
  variants: TriScriptVariantRow[];
  contentAngles: string[];
}

interface NepalTrendsPortalProps {
  theme: ThemeMode;
  language: Language;
  route: TrendsRouteMatch;
  onChangeRoute: (path: string) => void;
  onNavigateToolTab?: (tab: string) => void;
  onNavigateHome: () => void;
}

function getCategoryName(slug: string, isNe: boolean): string {
  const found = TREND_CATEGORIES.find((c) => c.slug === slug);
  if (!found) return slug;
  return isNe ? found.labelNe : found.labelEn;
}

function getAudienceLabel(segment: string, isNe: boolean): string {
  if (segment === 'diaspora') return isNe ? 'प्रवास लक्षित' : 'Diaspora Intent';
  if (segment === 'global_nepali') return isNe ? 'विश्वव्यापी नेपाली' : 'Global Nepali';
  return isNe ? 'नेपाल स्थानीय' : 'Nepal Local';
}

function formatShortTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export const NepalTrendsPortal: React.FC<NepalTrendsPortalProps> = ({
  theme,
  language,
  route,
  onChangeRoute,
  onNavigateToolTab,
  onNavigateHome,
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';
  const { showToast } = useToast();

  // Listing states
  const [trends, setTrends] = useState<TrendItemDto[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [listError, setListError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [syncingRss, setSyncingRss] = useState<boolean>(false);

  // Diaspora state
  const [diasporaCountry, setDiasporaCountry] = useState<string>('ALL');
  const [diasporaPartners, setDiasporaPartners] = useState<DiasporaPartnerSlotDto[]>([]);

  // Detail states
  const [detail, setDetail] = useState<TrendItemDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [chartWindow, setChartWindow] = useState<'24h' | '7d'>('7d');
  const [briefLoading, setBriefLoading] = useState<boolean>(false);
  const [activeBrief, setActiveBrief] = useState<ContentBriefOutline | null>(null);

  // Keyword explorer states
  const [kwInput, setKwInput] = useState<string>('AI jobs Nepal');
  const [kwLoading, setKwLoading] = useState<boolean>(false);
  const [kwResult, setKwResult] = useState<KeywordMetricDto | null>(null);
  const [kwError, setKwError] = useState<string | null>(null);

  // Business keywords states
  const [bizPacks, setBizPacks] = useState<BusinessPackDto[]>([]);
  const [bizLoading, setBizLoading] = useState<boolean>(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Phase 3: Watchlist, Keyword Compare, Saved Briefs & API v1
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [kwInputB, setKwInputB] = useState<string>('AI course Nepal');
  const [kwResultB, setKwResultB] = useState<KeywordMetricDto | null>(null);

  const [watchlist, setWatchlist] = useState<Array<{ id: string; keyword: string; slug?: string | null; category: string; country: string; createdAt: string }>>([]);
  const [savedBriefs, setSavedBriefs] = useState<Array<{ id: string; keyword: string; outlineJson: ContentBriefOutline; createdAt: string }>>([]);
  const [apiKeys, setApiKeys] = useState<Array<{ id: string; label: string; keyPrefix: string; planTier: string; monthlyQuota: number; requestCount: number; isActive: boolean; lastUsedAt: string | null; createdAt: string }>>([]);
  const [newKeyLabel, setNewKeyLabel] = useState<string>('Kathmandu Newsroom');
  const [newKeyTier, setNewKeyTier] = useState<'starter' | 'agency'>('starter');
  const [provisionedSecret, setProvisionedSecret] = useState<string | null>(null);
  const [vaultLoading, setVaultLoading] = useState<boolean>(false);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);

  const handleCopy = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const getSessionOwnerKey = () => {
    if (typeof window === 'undefined') return 'guest_nepalai';
    let key = window.localStorage.getItem('nepalai_trends_owner');
    if (!key) {
      key = `ses_${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem('nepalai_trends_owner', key);
    }
    return key;
  };

  // Sync listing views
  useEffect(() => {
    if (route.view === 'nepal' || route.view === 'category') {
      const cat = route.view === 'category' && route.category ? route.category : 'all';
      applyClientTrendsSeo(buildTrendsListingSeo(route, window.location.origin));
      setLoadingList(true);
      setListError(null);
      fetch(
        `/api/trends/nepal?category=${encodeURIComponent(cat)}&search=${encodeURIComponent(
          searchText
        )}&limit=50`
      )
        .then((r) => r.json())
        .then((data) => {
          if (!data.success) throw new Error(data.error || 'Failed to load trends');
          setTrends(data.trends || []);
        })
        .catch((err) => setListError(err?.message || 'Unable to load Nepal trends'))
        .finally(() => setLoadingList(false));
    } else if (route.view === 'diaspora') {
      applyClientTrendsSeo(buildTrendsListingSeo(route, window.location.origin));
      setLoadingList(true);
      setListError(null);
      fetch(
        `/api/trends/diaspora?country=${encodeURIComponent(diasporaCountry)}&search=${encodeURIComponent(
          searchText
        )}`
      )
        .then((r) => r.json())
        .then((data) => {
          if (!data.success) throw new Error(data.error || 'Failed to load diaspora trends');
          setTrends(data.trends || []);
          setDiasporaPartners(Array.isArray(data.partners) ? data.partners : []);
        })
        .catch((err) => setListError(err?.message || 'Unable to load diaspora trends'))
        .finally(() => setLoadingList(false));
    }
  }, [route.view, route.category, searchText, diasporaCountry]);

  // Sync detail view
  useEffect(() => {
    if (route.view === 'detail' && route.slug) {
      setLoadingDetail(true);
      setDetailError(null);
      setActiveBrief(null);
      fetch(`/api/trends/detail/${encodeURIComponent(route.slug)}`)
        .then((r) => {
          if (!r.ok) throw new Error('Trend explainer not found');
          return r.json();
        })
        .then((data) => {
          const tr: TrendItemDto = data.trend;
          setDetail(tr);
          if (tr.briefs && tr.briefs.length > 0) {
            setActiveBrief(tr.briefs[0].outlineJson);
          }
          applyClientTrendsSeo(buildTrendDetailSeo(tr, window.location.origin));
        })
        .catch((err) => setDetailError(err?.message || 'Trend not found'))
        .finally(() => setLoadingDetail(false));
    }
  }, [route.view, route.slug]);

  // Sync Keyword Explorer & Business Keywords
  useEffect(() => {
    if (route.view === 'keywords') {
      applyClientTrendsSeo(buildTrendsListingSeo(route, window.location.origin));
      if (!kwResult) {
        runKeywordExplore('AI jobs Nepal');
      }
    } else if (route.view === 'business-keywords') {
      applyClientTrendsSeo(buildTrendsListingSeo(route, window.location.origin));
      setBizLoading(true);
      fetch('/api/keywords/business')
        .then((r) => r.json())
        .then((data) => {
          setBizPacks(Array.isArray(data.packs) ? data.packs : []);
        })
        .catch(() => setBizPacks([]))
        .finally(() => setBizLoading(false));
    } else if (route.view === 'api-vault') {
      applyClientTrendsSeo(buildTrendsListingSeo(route, window.location.origin));
      loadVaultAndApiState();
    } else if (route.view === 'seasonal') {
      applyClientTrendsSeo(buildTrendsListingSeo(route, window.location.origin));
    }
  }, [route.view]);

  const loadVaultAndApiState = async () => {
    setVaultLoading(true);
    try {
      const owner = getSessionOwnerKey();
      const [wRes, bRes, kRes] = await Promise.all([
        fetch(`/api/trends/watchlist?ownerKey=${encodeURIComponent(owner)}`).then((r) => r.json()),
        fetch('/api/trends/briefs?limit=15').then((r) => r.json()),
        fetch('/api/trends/keys').then((r) => r.json()),
      ]);
      if (Array.isArray(wRes?.items)) setWatchlist(wRes.items);
      if (Array.isArray(bRes?.briefs)) setSavedBriefs(bRes.briefs);
      if (Array.isArray(kRes?.keys)) setApiKeys(kRes.keys);
    } catch {
      // Ignore transient errors cleanly
    } finally {
      setVaultLoading(false);
    }
  };

  const handleTrackInWatchlist = async (payload: { keyword: string; slug?: string | null; category?: string; country?: string }) => {
    try {
      const resp = await fetch('/api/trends/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerKey: getSessionOwnerKey(),
          ...payload,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data.error || 'Could not track topic');
      showToast(
        data.item?.alreadyTracked
          ? isNe ? 'यो विषय पहिले नै वाचलिस्टमा छ।' : 'Already in your tracked watchlist.'
          : isNe ? 'वाचलिस्टमा सुरक्षित गरियो।' : 'Added to Watchlist.',
        'success'
      );
      if (!data.item?.alreadyTracked && data.item) {
        setWatchlist((prev) => [data.item, ...prev]);
      }
    } catch (err: any) {
      showToast(err?.message || 'Unable to track topic', 'error');
    }
  };

  const handleRemoveWatchlist = async (id: string) => {
    try {
      const resp = await fetch(`/api/trends/watchlist/${encodeURIComponent(id)}?ownerKey=${encodeURIComponent(getSessionOwnerKey())}`, {
        method: 'DELETE',
      });
      if (resp.ok) {
        setWatchlist((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      showToast('Failed to remove item.', 'error');
    }
  };

  const handleDownloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyLabel.trim()) return;
    try {
      const resp = await fetch('/api/trends/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newKeyLabel.trim(), planTier: newKeyTier }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data.error || 'Could not create API key');
      setProvisionedSecret(data.plainTextKey);
      setApiKeys((prev) => [data.keyRecord, ...prev]);
      showToast('REST API v1 key generated. Copy it now.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to generate API key', 'error');
    }
  };

  const handleTestApiV1 = async () => {
    if (!provisionedSecret) return;
    try {
      const resp = await fetch('/api/v1/trends/nepal?limit=3', {
        headers: { 'x-api-key': provisionedSecret },
      });
      const data = await resp.json();
      setApiTestResult(JSON.stringify(data, null, 2));
      loadVaultAndApiState();
    } catch {
      setApiTestResult('API v1 request failed');
    }
  };

  const runKeywordExplore = async (queryTerm: string, compareTerm?: string) => {
    const clean = queryTerm.trim();
    if (clean.length < 2) return;
    setKwLoading(true);
    setKwError(null);
    try {
      if (compareTerm && compareTerm.trim().length >= 2) {
        const resp = await fetch('/api/keywords/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywordA: clean, keywordB: compareTerm.trim(), country: 'NP' }),
        });
        const data = await resp.json();
        if (!resp.ok || !data.success) {
          throw new Error(data.error || 'Keyword comparison failed');
        }
        setKwResult(data.keywordA);
        setKwResultB(data.keywordB);
      } else {
        setKwResultB(null);
        const resp = await fetch('/api/keywords/explore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword: clean, country: 'NP' }),
        });
        const data = await resp.json();
        if (!resp.ok || !data.success) {
          throw new Error(data.error || 'Keyword analysis failed');
        }
        setKwResult(data.analysis);
      }
    } catch (err: any) {
      setKwError(err?.message || 'Failed to explore keyword');
    } finally {
      setKwLoading(false);
    }
  };

  const handleSyncLiveRss = async () => {
    setSyncingRss(true);
    try {
      const resp = await fetch('/api/trends/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeDiaspora: true }),
      });
      const data = await resp.json();
      if (data.success) {
        showToast(
          isNe
            ? 'Google Trends RSS फिड सफलतापूर्वक अपडेट भयो।'
            : 'Live Google Trends RSS synchronized.',
          'success'
        );
        // Re-fetch current list view
        const cat = route.view === 'category' && route.category ? route.category : 'all';
        const listUrl =
          route.view === 'diaspora'
            ? `/api/trends/diaspora?country=${encodeURIComponent(diasporaCountry)}`
            : `/api/trends/nepal?category=${encodeURIComponent(cat)}`;
        const refreshed = await fetch(listUrl).then((r) => r.json());
        if (refreshed.trends) setTrends(refreshed.trends);
      }
    } catch {
      showToast('Failed to sync RSS feed.', 'error');
    } finally {
      setSyncingRss(false);
    }
  };

  const handleGenerateBrief = async () => {
    if (!detail) return;
    setBriefLoading(true);
    try {
      const resp = await fetch(
        `/api/trends/${encodeURIComponent(detail.slug)}/content-brief`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ languageMode: 'bilingual' }),
        }
      );
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Could not generate brief');
      }
      setActiveBrief(data.brief.outlineJson);
      showToast(
        isNe ? 'नेपाली र अंग्रेजी सामग्री आइडिया तयार भयो।' : 'Bilingual content brief ready.',
        'success'
      );
    } catch (err: any) {
      showToast(err?.message || 'Failed to create brief.', 'error');
    } finally {
      setBriefLoading(false);
    }
  };

  const surfaceCard = isDark
    ? 'border-slate-800 bg-[#0b1220] text-slate-100'
    : 'border-slate-200 bg-white text-slate-900 shadow-2xs';

  const inputClass = isDark
    ? 'border-slate-700 bg-[#080d1a] text-white placeholder:text-slate-400 focus:border-cyan-400'
    : 'border-slate-300 bg-white text-slate-950 placeholder:text-slate-500 focus:border-cyan-600';

  return (
    <section
      className={`min-h-[82vh] py-8 sm:py-12 transition-colors ${
        isDark ? 'bg-[#080d1a] text-slate-100' : 'bg-slate-50/50 text-slate-950'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Breadcrumb + Section Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{isNe ? 'गृहपृष्ठ' : 'Home'}</span>
            </button>
            <span aria-hidden="true" className="text-slate-400">/</span>
            <span className="text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-400">
              {isNe ? 'नेपाल एआई + ट्रेन्ड्स' : 'Nepal AI + Trends'}
            </span>
          </div>

          {/* Primary Platform Section Tabs */}
          <div
            className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto max-w-full ${
              isDark ? 'border-slate-800 bg-[#0b1220]' : 'border-slate-200 bg-white'
            }`}
            role="tablist"
            aria-label="Nepal AI Trends sections"
          >
            {[
              { path: '/trending/nepal', active: route.view === 'nepal' || route.view === 'category' || route.view === 'detail', labelEn: 'Trending Now', labelNe: 'ताजा ट्रेन्ड्स', icon: TrendingUp },
              { path: '/trending/diaspora', active: route.view === 'diaspora', labelEn: 'Diaspora Trends', labelNe: 'प्रवास ट्रेन्ड्स', icon: Globe2 },
              { path: '/trending/seasonal', active: route.view === 'seasonal', labelEn: 'Seasonal & Rising', labelNe: 'मौसमी र बढ्दो', icon: Calendar },
              { path: '/keywords/nepal', active: route.view === 'keywords', labelEn: 'Keyword Explorer', labelNe: 'किबोर्ड खोज', icon: Search },
              { path: '/keywords/nepal/business', active: route.view === 'business-keywords', labelEn: 'Business Keywords', labelNe: 'व्यापार किबोर्ड', icon: Briefcase },
              { path: '/trending/api', active: route.view === 'api-vault', labelEn: 'Briefs & API v1', labelNe: 'ब्रिफ र API v1', icon: Key },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.path}
                  type="button"
                  role="tab"
                  aria-selected={tab.active}
                  onClick={() => onChangeRoute(tab.path)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    tab.active
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                        : 'bg-cyan-600 text-white'
                      : isDark
                        ? 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{isNe ? tab.labelNe : tab.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================================
            VIEW 1: TRENDING NOW NEPAL (/trending/nepal & /trending/nepal/[category])
           ================================================================ */}
        {(route.view === 'nepal' || route.view === 'category' || route.view === 'diaspora') && (
          <div className="space-y-6">
            {/* Editorial Header */}
            <div className={`rounded-2xl border p-6 ${surfaceCard}`}>
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                <div className="max-w-2xl">
                  <h1 className={`text-2xl sm:text-3xl font-extrabold font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    {route.view === 'diaspora'
                      ? isNe
                        ? 'विश्वभरका नेपाली प्रवास ट्रेन्ड्स'
                        : 'Nepali Diaspora Search Trends'
                      : route.view === 'category' && route.category
                        ? `${getCategoryName(route.category, isNe)} — ${isNe ? 'नेपाल ट्रेन्ड्स' : 'Trending in Nepal'}`
                        : isNe
                          ? 'नेपालमा अहिले के ट्रेन्डिङ छ?'
                          : 'Trending Searches in Nepal'}
                  </h1>
                  <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {route.view === 'diaspora'
                      ? isNe
                        ? 'अमेरिका, अष्ट्रेलिया, बेलायत, यूएई, जापान र क्यानाडाबाट नेपालसम्बन्धी खोजिएका विषयहरू।'
                        : 'Nepal-related search surges across the US, Australia, UK, UAE, Japan, and Canada — remittance, flights, gifting, and property.'
                      : isNe
                        ? 'प्रत्येक २० मिनेटमा Google Trends Nepal RSS बाट संकलित, ११ वर्गमा वर्गीकृत र समाचार स्रोतसहित व्याख्या गरिएको।'
                        : 'Refreshed every 20 minutes from Google Trends Nepal RSS, classified across 11 Nepal verticals, and paired with source-cited AI explainers.'}
                  </p>
                </div>

                {/* Search & Sync Controls */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder={
                        isNe ? 'खोज्नुहोस् (नेपाली/EN)...' : 'Filter trends or topics...'
                      }
                      className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-hidden transition-colors ${inputClass}`}
                      aria-label="Filter trends"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncLiveRss}
                    disabled={syncingRss}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[38px]"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${syncingRss ? 'animate-spin' : ''}`} />
                    <span>{syncingRss ? (isNe ? 'सिङ्क हुँदै...' : 'Syncing...') : (isNe ? 'लाइभ RSS सिङ्क' : 'Sync Live RSS')}</span>
                  </button>
                </div>
              </div>

              {/* Filter Strip: 11 Nepal Categories OR 6 Diaspora Countries */}
              {route.view === 'diaspora' ? (
                <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setDiasporaCountry('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer border ${
                      diasporaCountry === 'ALL'
                        ? isDark
                          ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40'
                          : 'bg-cyan-600 text-white border-cyan-600'
                        : isDark
                          ? 'border-slate-800 text-slate-300 hover:text-white'
                          : 'border-slate-200 text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    {isNe ? 'सबै ६ देश' : 'All 6 Diaspora Hubs'}
                  </button>
                  {DIASPORA_COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setDiasporaCountry(c.code)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer border ${
                        diasporaCountry === c.code
                          ? isDark
                            ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40'
                            : 'bg-cyan-600 text-white border-cyan-600'
                          : isDark
                            ? 'border-slate-800 text-slate-300 hover:text-white'
                            : 'border-slate-200 text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      {isNe ? `${c.labelNe} (${c.code})` : `${c.labelEn} (${c.code})`}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => onChangeRoute('/trending/nepal')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer border ${
                      route.view === 'nepal'
                        ? isDark
                          ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40'
                          : 'bg-cyan-600 text-white border-cyan-600'
                        : isDark
                          ? 'border-slate-800 text-slate-300 hover:text-white'
                          : 'border-slate-200 text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    {isNe ? 'सबै वर्ग' : 'All Categories'}
                  </button>
                  {TREND_CATEGORIES.map((cat) => {
                    const active = route.view === 'category' && route.category === cat.slug;
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => onChangeRoute(`/trending/nepal/${cat.slug}`)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer border ${
                          active
                            ? isDark
                              ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40'
                              : 'bg-cyan-600 text-white border-cyan-600'
                            : isDark
                              ? 'border-slate-800 text-slate-300 hover:text-white'
                              : 'border-slate-200 text-slate-700 hover:text-slate-950'
                        }`}
                      >
                        {isNe ? cat.labelNe : cat.labelEn}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Keyword Velocity Snapshot (D3.js Interactive Bar Chart) */}
            {!loadingList && trends.length > 0 && (
              <div className={`rounded-2xl border p-5 sm:p-6 ${surfaceCard}`}>
                <TrendsD3VelocityChart
                  theme={theme}
                  language={language}
                  variant="snapshot"
                  title={isNe ? 'लाइभ किबोर्ड गति स्न्यापसट (D3.js)' : 'Live Keyword Velocity Snapshot'}
                  subtitle={
                    isNe
                      ? 'प्रत्येक बारमा होभर गरी ठ्याक्कै गति सूचकाङ्क र खोज ब्यान्ड हेर्नुहोस्, वा क्लिक गरी विवरण खोल्नुहोस्।'
                      : 'Hover any bar for exact keyword velocity values and traffic bands, or click to open its AI explainer.'
                  }
                  primaryLabel="Velocity Index"
                  snapshotItems={trends.slice(0, 8).map((item, idx) => ({
                    slug: item.slug,
                    keyword: item.keyword,
                    velocityScore: item.trendScore,
                    trafficBand: item.trafficBand,
                    rank: idx + 1,
                    categoryLabel: getCategoryName(item.category, isNe),
                  }))}
                  onSelectTrendSlug={(slug) => onChangeRoute(`/trending/nepal/${slug}`)}
                  height={250}
                />
              </div>
            )}

            {/* Main Grid + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Ranked Feed Column */}
              <div className={`lg:col-span-8 rounded-2xl border divide-y ${
                isDark ? 'border-slate-800 bg-[#0b1220] divide-slate-800/80' : 'border-slate-200 bg-white divide-slate-200 shadow-2xs'
              }`}>
                {loadingList ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={`h-20 rounded-xl animate-pulse ${
                          isDark ? 'bg-slate-900' : 'bg-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                ) : listError ? (
                  <div className="p-8 text-center space-y-3">
                    <p className="text-sm font-medium text-red-500">{listError}</p>
                    <button
                      type="button"
                      onClick={handleSyncLiveRss}
                      className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      {isNe ? 'पुन: प्रयास' : 'Retry Sync'}
                    </button>
                  </div>
                ) : trends.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {isNe
                        ? 'अहिले यहाँ मिल्दो ट्रेन्ड भेटिएन।'
                        : 'No matching trends stored for this filter yet.'}
                    </p>
                    <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {isNe
                        ? 'नयाँ लाइभ ट्रेन्ड तान्न माथिको "लाइभ RSS सिङ्क" बटन प्रयोग गर्नुहोस् वा खोज शब्द परिवर्तन गर्नुहोस्।'
                        : 'Use "Sync Live RSS" to ingest the latest Google Trends snapshot or broaden your category filter.'}
                    </p>
                  </div>
                ) : (
                  trends.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => onChangeRoute(`/trending/nepal/${item.slug}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onChangeRoute(`/trending/nepal/${item.slug}`);
                        }
                      }}
                      className={`p-5 transition-colors cursor-pointer flex items-start justify-between gap-4 ${
                        isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50/90'
                      }`}
                    >
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <span className="font-mono tabular-nums text-sm font-bold text-cyan-600 dark:text-cyan-400 pt-0.5 shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          {/* Quiet Unboxed 1-line Metadata Kicker */}
                          <div className={`text-xs flex flex-wrap items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            <span className="font-semibold text-cyan-700 dark:text-cyan-300">
                              {getCategoryName(item.category, isNe)}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums font-semibold">
                              {item.trafficBand}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{item.country}</span>
                            <span aria-hidden="true">·</span>
                            <span>{getAudienceLabel(item.audienceSegment, isNe)}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{formatShortTime(item.lastSeenAt)}</span>
                          </div>

                          <h2 className={`mt-1 text-base sm:text-lg font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-950'}`}>
                            {item.keyword}
                          </h2>

                          {item.aiWhyTrending && (
                            <p className={`mt-1.5 text-sm leading-relaxed line-clamp-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                              {item.aiWhyTrending}
                            </p>
                          )}

                          {item.newsItems && item.newsItems.length > 0 && (
                            <div className={`mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {isNe ? 'स्रोत:' : 'Source:'} {item.newsItems[0].source} — {item.newsItems[0].title}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Thumbnail or Fallback */}
                      <div className="hidden sm:block shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.keyword}
                            referrerPolicy="no-referrer"
                            className="w-20 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div
                            className={`w-20 h-16 rounded-xl border flex items-center justify-center ${
                              isDark
                                ? 'border-slate-800 bg-slate-900/70 text-cyan-400'
                                : 'border-slate-200 bg-slate-100 text-cyan-600'
                            }`}
                          >
                            <TrendingUp className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Right Sidebar: Daily Insights Subscription Toggle + Keyword Explorer Shortcut */}
              <div className="lg:col-span-4 space-y-5">
                <DailyInsightsSubscription
                  theme={theme}
                  language={language}
                  defaultCategories={
                    route.view === 'category' && route.category
                      ? [route.category, 'technology-ai']
                      : ['technology-ai', 'business-finance']
                  }
                />

                <VelocityThresholdAlerts
                  theme={theme}
                  language={language}
                  ownerKey={getSessionOwnerKey()}
                  defaultCategory={route.view === 'category' && route.category ? route.category : 'all'}
                />

                {/* Keyword Explorer Quick Card */}
                <div className={`rounded-2xl border p-5 space-y-3 ${surfaceCard}`}>
                  <div className="text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-400">
                    {isNe ? 'त्रि-लिपि किबोर्ड टुल' : 'Tri-Script Intelligence'}
                  </div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    {isNe ? 'English + Roman + नेपाली विस्तार' : 'Expand Any Nepal Keyword'}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {isNe
                      ? 'Romanized नेपाली वा देवनागरीमा टाइप गरी व्यावसायिक र प्रवास किबोर्ड पत्ता लगाउनुहोस्।'
                      : 'Search "AI jobs Nepal ko vacancy" or "एआई जागिर नेपाल" to unlock local & diaspora search variants.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => onChangeRoute('/keywords/nepal')}
                    className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer ${
                      isDark
                        ? 'border-slate-700 bg-slate-900 text-white hover:border-cyan-400'
                        : 'border-slate-300 bg-slate-50 text-slate-900 hover:border-cyan-600'
                    }`}
                  >
                    <Search className="h-3.5 w-3.5 text-cyan-500" />
                    <span>{isNe ? 'किबोर्ड एक्सप्लोरर खोल्नुहोस्' : 'Open Keyword Explorer'}</span>
                  </button>
                </div>
              </div>
            </div>

            {route.view === 'diaspora' && (
              <DiasporaPartnersSection
                theme={theme}
                language={language}
                activeCountry={diasporaCountry}
                partners={diasporaPartners}
                onNavigateInternalUrl={(url) => onChangeRoute(url)}
              />
            )}
          </div>
        )}

        {/* ================================================================
            VIEW 1B: RISING & SEASONAL NEPAL ANALYTICS (/trending/seasonal)
           ================================================================ */}
        {route.view === 'seasonal' && (
          <SeasonalAnalyticsView
            theme={theme}
            language={language}
            onExploreKeyword={(kw) => {
              setKwInput(kw);
              onChangeRoute('/keywords/nepal');
              runKeywordExplore(kw);
            }}
            onSelectTrendSlug={(slug) => onChangeRoute(`/trending/nepal/${slug}`)}
            onNavigateToolTab={onNavigateToolTab}
          />
        )}

        {/* ================================================================
            VIEW 2: AI TREND EXPLAINER DETAIL (/trending/nepal/[slug])
           ================================================================ */}
        {route.view === 'detail' && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => onChangeRoute('/trending/nepal')}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                isDark ? 'text-cyan-300 hover:text-cyan-200' : 'text-cyan-700 hover:text-cyan-900'
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{isNe ? 'सबै नेपाल ट्रेन्ड्समा फर्कनुहोस्' : 'Back to Trending in Nepal'}</span>
            </button>

            {loadingDetail ? (
              <div className={`rounded-2xl border p-8 h-64 animate-pulse ${surfaceCard}`} />
            ) : detailError || !detail ? (
              <div className={`rounded-2xl border p-8 text-center space-y-3 ${surfaceCard}`}>
                <p className="text-sm font-semibold">{detailError || 'Trend not found'}</p>
                <button
                  type="button"
                  onClick={() => onChangeRoute('/trending/nepal')}
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Browse All Nepal Trends
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Main Editorial Explainer Column */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Lead Header & Why It's Trending Card */}
                  <article className={`rounded-2xl border p-6 sm:p-8 space-y-5 ${surfaceCard}`}>
                    <div className={`text-xs flex flex-wrap items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <button
                        type="button"
                        onClick={() => onChangeRoute(`/trending/nepal/${detail.category}`)}
                        className="font-semibold text-cyan-700 dark:text-cyan-300 hover:underline cursor-pointer"
                      >
                        {getCategoryName(detail.category, isNe)}
                      </button>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums font-bold">
                        {detail.trafficBand} approx. searches
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Region: {detail.country}</span>
                      <span aria-hidden="true">·</span>
                      <span>{getAudienceLabel(detail.audienceSegment, isNe)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                        <Calendar className="h-3 w-3" />
                        {formatShortTime(detail.lastSeenAt)}
                      </span>
                    </div>

                    <h1 className={`text-2xl sm:text-4xl font-extrabold font-display tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {detail.keyword}
                    </h1>

                    {/* Why is this trending? */}
                    <div
                      className={`rounded-xl border p-5 space-y-3 ${
                        isDark
                          ? 'border-slate-700/90 bg-[#080d1a]'
                          : 'border-slate-200 bg-slate-50/90'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                          {isNe ? 'यो विषय किन ट्रेन्डिङमा छ?' : 'Why is this trending?'}
                        </h2>
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Source-checked summary
                        </span>
                      </div>
                      <p className={`text-base leading-relaxed ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        {detail.aiWhyTrending}
                      </p>

                      {detail.citations && detail.citations.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                          <div className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {isNe ? 'सन्दर्भ स्रोतहरू:' : 'Verified Sources:'}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {detail.citations.map((c, idx) => (
                              <a
                                key={c.url}
                                href={c.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-cyan-700 dark:text-cyan-300 hover:underline"
                              >
                                <span className="font-mono">[{idx + 1}]</span>
                                <span>{c.source}</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleGenerateBrief}
                        disabled={briefLoading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>
                          {briefLoading
                            ? isNe
                              ? 'आइडिया बन्दैछ...'
                              : 'Generating Content Brief...'
                            : isNe
                              ? 'कन्टेन्ट आइडिया बनाउनुहोस्'
                              : 'Create Content Ideas'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setKwInput(detail.keyword);
                          onChangeRoute('/keywords/nepal');
                          runKeywordExplore(detail.keyword);
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 ${
                          isDark
                            ? 'border-slate-700 bg-slate-900 text-slate-100 hover:border-cyan-400'
                            : 'border-slate-300 bg-white text-slate-900 hover:border-cyan-600'
                        }`}
                      >
                        <Search className="h-3.5 w-3.5 text-cyan-500" />
                        <span>{isNe ? 'किबोर्ड भेरिएन्ट हेर्नुहोस्' : 'Explore Keyword Variants'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleTrackInWatchlist({
                            keyword: detail.keyword,
                            slug: detail.slug,
                            category: detail.category,
                            country: detail.country,
                          })
                        }
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 ${
                          isDark
                            ? 'border-slate-700 bg-slate-900 text-slate-100 hover:border-cyan-400'
                            : 'border-slate-300 bg-white text-slate-900 hover:border-cyan-600'
                        }`}
                      >
                        <Bookmark className="h-3.5 w-3.5 text-cyan-500" />
                        <span>{isNe ? 'वाचलिस्टमा राख्नुहोस्' : 'Track Topic'}</span>
                      </button>
                    </div>
                  </article>

                  {/* Generated Bilingual Content Brief Drawer */}
                  {activeBrief && (
                    <div className={`rounded-2xl border p-6 space-y-4 ${surfaceCard}`}>
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-700 dark:text-cyan-400">
                          <BookOpen className="h-4 w-4" />
                          <span>{isNe ? 'द्विभाषी सामग्री योजना' : 'Bilingual Creator & SEO Brief'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              'full-brief',
                              `EN: ${activeBrief.headlineEn}\nNE: ${activeBrief.headlineNe}\n\nHook: ${activeBrief.hookEn}\n\nKey Points:\n- ${activeBrief.keyPoints.join('\n- ')}`
                            )
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300 cursor-pointer"
                        >
                          {copiedId === 'full-brief' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedId === 'full-brief' ? 'Copied' : 'Copy Brief'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border ${isDark ? 'border-slate-800 bg-[#080d1a]' : 'border-slate-200 bg-slate-50'}`}>
                          <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 mb-1">English Angle</div>
                          <div className="text-sm font-bold">{activeBrief.headlineEn}</div>
                          <p className={`mt-2 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {activeBrief.hookEn}
                          </p>
                        </div>
                        <div className={`p-4 rounded-xl border font-devanagari ${isDark ? 'border-slate-800 bg-[#080d1a]' : 'border-slate-200 bg-slate-50'}`}>
                          <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 mb-1">नेपाली एङ्गल</div>
                          <div className="text-sm font-bold">{activeBrief.headlineNe}</div>
                          <p className={`mt-2 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {activeBrief.hookNe}
                          </p>
                        </div>
                      </div>

                      <ul className={`list-disc pl-5 space-y-1.5 text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {activeBrief.keyPoints.map((pt, idx) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* D3.js Historical Search Growth & Snapshot Velocity Chart */}
                  <div className={`rounded-2xl border p-6 space-y-4 ${surfaceCard}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className={`flex items-center gap-1 p-1 rounded-lg border ml-auto ${isDark ? 'border-slate-800 bg-[#080d1a]' : 'border-slate-200 bg-slate-100'}`}>
                        {(['24h', '7d'] as const).map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setChartWindow(w)}
                            className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                              chartWindow === w
                                ? isDark
                                  ? 'bg-cyan-500/20 text-cyan-200'
                                  : 'bg-white text-slate-950 shadow-2xs'
                                : isDark
                                  ? 'text-slate-300'
                                  : 'text-slate-600'
                            }`}
                          >
                            {w === '24h' ? '24 Hours' : '7 Days'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <TrendsD3VelocityChart
                      theme={theme}
                      language={language}
                      variant="timeseries"
                      title={isNe ? 'ऐतिहासिक खोज वृद्धि र गति चार्ट' : 'Historical Search Velocity & Growth'}
                      subtitle="Relative 0–100 velocity score derived from timestamped Google Trends RSS snapshots (hover for exact values)."
                      primaryLabel={detail.keyword}
                      primaryPoints={buildVelocitySeriesFromSnapshots({
                        snapshots: (detail.snapshots || []).filter((s) => {
                          if (chartWindow === '7d') return true;
                          return Date.now() - new Date(s.capturedAt).getTime() <= 24 * 60 * 60 * 1000;
                        }),
                        fallbackTrendScore: detail.trendScore,
                        fallbackTrafficBand: detail.trafficBand,
                        fallbackTrafficFloor: detail.numericTrafficFloor,
                        firstSeenAt: detail.firstSeenAt,
                        lastSeenAt: detail.lastSeenAt,
                      })}
                      height={250}
                    />
                  </div>

                  {/* Related News Articles */}
                  <div className={`rounded-2xl border p-6 space-y-4 ${surfaceCard}`}>
                    <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {isNe ? 'सम्बन्धित समाचारहरू' : 'Related News Coverage'}
                    </h3>
                    {detail.newsItems && detail.newsItems.length > 0 ? (
                      <div className="space-y-3">
                        {detail.newsItems.map((news) => (
                          <a
                            key={news.id}
                            href={news.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-start justify-between gap-4 p-4 rounded-xl border transition-colors ${
                              isDark
                                ? 'border-slate-800 bg-[#080d1a] hover:border-cyan-500/40'
                                : 'border-slate-200 bg-slate-50/70 hover:border-cyan-500'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                                {news.source} · {formatShortTime(news.publishedAt)}
                              </div>
                              <div className={`mt-1 text-sm font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                                {news.title}
                              </div>
                              {news.snippet && (
                                <p className={`mt-1 text-xs line-clamp-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                  {news.snippet}
                                </p>
                              )}
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-cyan-500 shrink-0 mt-1" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        No additional external news items accompanied this RSS entry.
                      </p>
                    )}
                  </div>
                </div>

                {/* Sidebar: Tri-Script Variants, Related Queries, NepalAI Utility Link */}
                <div className="lg:col-span-4 space-y-5">
                  {detail.linkedToolTab && onNavigateToolTab && (
                    <div className={`rounded-2xl border p-5 space-y-3 ${surfaceCard}`}>
                      <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-400">
                        <Wrench className="h-4 w-4" />
                        <span>{isNe ? 'सम्बन्धित NepalAI टुल' : 'Actionable NepalAI Utility'}</span>
                      </div>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {isNe
                          ? 'यस विषयसँग सम्बन्धित क्याल्कुलेटर वा गाइड प्रयोग गर्नुहोस्'
                          : 'Use the matching NepalAI tool for this topic'}
                      </p>
                      <button
                        type="button"
                        onClick={() => onNavigateToolTab(detail.linkedToolTab!)}
                        className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Open {detail.linkedToolTab.toUpperCase()} Tool</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Tri-script variants */}
                  {detail.triScriptVariants && detail.triScriptVariants.length > 0 && (
                    <div className={`rounded-2xl border p-5 space-y-3 ${surfaceCard}`}>
                      <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {isNe ? 'खोजी भेरिएन्टहरू' : 'Nepali + English Variants'}
                      </h3>
                      <div className="space-y-2.5 text-xs">
                        {detail.triScriptVariants.map((v, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border space-y-1.5 ${
                              isDark ? 'border-slate-800 bg-[#080d1a]' : 'border-slate-200 bg-slate-50'
                            }`}
                          >
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">English: </span>
                              <span className="font-semibold">{v.englishVariant}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Romanized: </span>
                              <span className="font-semibold">{v.romanizedNepali}</span>
                            </div>
                            <div className="font-devanagari">
                              <span className="text-slate-500 dark:text-slate-400">देवनागरी: </span>
                              <span className="font-semibold">{v.devanagariVariant}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Queries */}
                  {detail.relatedQueries && detail.relatedQueries.length > 0 && (
                    <div className={`rounded-2xl border p-5 space-y-3 ${surfaceCard}`}>
                      <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {isNe ? 'सम्बन्धित खोजी शब्दहरू' : 'Related Searches'}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {detail.relatedQueries.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => {
                              setKwInput(q);
                              onChangeRoute('/keywords/nepal');
                              runKeywordExplore(q);
                            }}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                              isDark
                                ? 'border-slate-800 bg-[#080d1a] text-slate-200 hover:border-cyan-400'
                                : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-cyan-600'
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <VelocityThresholdAlerts
                    theme={theme}
                    language={language}
                    ownerKey={getSessionOwnerKey()}
                    defaultKeyword={detail.keyword}
                    defaultCategory={detail.category}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================
            VIEW 3: TRI-SCRIPT KEYWORD EXPLORER (/keywords/nepal)
           ================================================================ */}
        {route.view === 'keywords' && (
          <div className="space-y-6">
            <div className={`rounded-2xl border p-6 space-y-5 ${surfaceCard}`}>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-extrabold font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {isNe
                    ? 'नेपाल किबोर्ड एक्सप्लोरर (English · Romanized · नेपाली)'
                    : 'Nepal Tri-Script Keyword Explorer'}
                </h1>
                <p className={`mt-1.5 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Search in English, Romanized Nepali, or Devanagari to uncover variant phrasings, direction, local commercial intent, and diaspora relevance.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  runKeywordExplore(kwInput, compareMode ? kwInputB : undefined);
                }}
                className="space-y-3"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={kwInput}
                      onChange={(e) => setKwInput(e.target.value)}
                      placeholder='Try "AI jobs Nepal", "bijuli bill online tirne", or "एआई जागिर नेपाल"'
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-hidden ${inputClass}`}
                    />
                  </div>
                  {compareMode && (
                    <div className="relative flex-1">
                      <GitCompare className="h-4 w-4 text-cyan-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={kwInputB}
                        onChange={(e) => setKwInputB(e.target.value)}
                        placeholder='Compare against e.g. "AI course Nepal"'
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-hidden ${inputClass}`}
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setCompareMode((prev) => !prev)}
                    className={`px-4 py-3 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                      compareMode
                        ? isDark
                          ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-200'
                          : 'border-cyan-600 bg-cyan-50 text-cyan-900'
                        : isDark
                          ? 'border-slate-700 text-slate-200 hover:border-cyan-400'
                          : 'border-slate-300 text-slate-800 hover:border-cyan-600'
                    }`}
                  >
                    <GitCompare className="h-3.5 w-3.5 text-cyan-500" />
                    <span>{compareMode ? 'Single Mode' : 'Compare A vs B'}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={kwLoading}
                    className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {kwLoading ? 'Analyzing...' : compareMode ? 'Compare Keywords' : 'Analyze Keyword'}
                  </button>
                </div>
              </form>

              {/* Quick Sample Queries */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Examples:</span>
                {[
                  'AI jobs Nepal',
                  'dentist Kathmandu',
                  'bijuli bill online tirne',
                  'एआई जागिर नेपाल',
                  'cake delivery Kathmandu',
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setKwInput(sample);
                      runKeywordExplore(sample, compareMode ? kwInputB : undefined);
                    }}
                    className={`px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                      isDark
                        ? 'border-slate-800 bg-[#080d1a] text-slate-200 hover:border-cyan-400'
                        : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-cyan-600'
                    }`}
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            {kwLoading ? (
              <div className={`rounded-2xl border p-8 h-64 animate-pulse ${surfaceCard}`} />
            ) : kwError ? (
              <div className={`rounded-2xl border p-6 text-sm text-red-500 ${surfaceCard}`}>
                {kwError}
              </div>
            ) : kwResult ? (
              <div className="space-y-6">
                {/* Optional Side-by-Side Comparison Strip */}
                {kwResultB && (
                  <div className={`rounded-2xl border p-5 ${surfaceCard}`}>
                    <div className="text-xs font-mono font-bold text-cyan-700 dark:text-cyan-400 mb-3">
                      Side-by-Side Keyword Comparison (A vs B)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {[kwResult, kwResultB].map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className={`p-4 rounded-xl border space-y-2 ${
                            isDark ? 'border-slate-800 bg-[#080d1a]' : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold">{idx === 0 ? 'A' : 'B'}: {item.keyword}</span>
                            <span className="text-xs font-mono capitalize text-emerald-600 dark:text-emerald-400">
                              ↑ {item.direction}
                            </span>
                          </div>
                          <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-300">
                            Local Intent {item.localIntentScore}/100 · Diaspora {item.diasporaIntentScore}/100 · {getCategoryName(item.category, isNe)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary Metrics Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className={`rounded-2xl border p-5 ${surfaceCard}`}>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Trend Direction</div>
                    <div className="mt-1 text-lg font-bold capitalize text-emerald-600 dark:text-emerald-400">
                      ↑ {kwResult.direction}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Script: {kwResult.detectedScript} · {getCategoryName(kwResult.category, isNe)}
                    </div>
                  </div>
                  <div className={`rounded-2xl border p-5 ${surfaceCard}`}>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Local Business Intent</div>
                    <div className="mt-1 text-lg font-bold font-mono tabular-nums">
                      {kwResult.localIntentScore}/100
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Domestic commercial readiness
                    </div>
                  </div>
                  <div className={`rounded-2xl border p-5 ${surfaceCard}`}>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Diaspora Relevance</div>
                    <div className="mt-1 text-lg font-bold font-mono tabular-nums">
                      {kwResult.diasporaIntentScore}/100
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      NRN / overseas buyer overlap
                    </div>
                  </div>
                  <div className={`rounded-2xl border p-5 ${surfaceCard}`}>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Data Provenance</div>
                    <div className="mt-1 text-sm font-bold">
                      {kwResult.dataSource === 'google_trends_api'
                        ? 'Google Trends Alpha API'
                        : 'RSS Snapshot Velocity'}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      Relative score: {kwResult.interestScore}/100
                    </div>
                  </div>
                </div>

                {/* D3.js Keyword Velocity & Historical Interest Curve */}
                <div className={`rounded-2xl border p-6 ${surfaceCard}`}>
                  <TrendsD3VelocityChart
                    theme={theme}
                    language={language}
                    variant="timeseries"
                    title={
                      kwResultB
                        ? `Velocity & Interest Curve: ${kwResult.keyword} vs ${kwResultB.keyword}`
                        : `Keyword Velocity & Interest Curve: ${kwResult.keyword}`
                    }
                    subtitle={
                      kwResult.dataSource === 'google_trends_api'
                        ? 'Google Trends Alpha API relative interest timeline (hover for exact scores).'
                        : 'Relative 0–100 velocity derived from stored Nepal RSS snapshot records (hover for exact values).'
                    }
                    primaryLabel={kwResult.keyword}
                    primaryPoints={buildVelocitySeriesFromInterest({
                      series: kwResult.interestSeries || [],
                      keyword: kwResult.keyword,
                      fallbackScore: kwResult.interestScore,
                    })}
                    secondaryLabel={kwResultB?.keyword}
                    secondaryPoints={
                      kwResultB
                        ? buildVelocitySeriesFromInterest({
                            series: kwResultB.interestSeries || [],
                            keyword: kwResultB.keyword,
                            fallbackScore: kwResultB.interestScore,
                          })
                        : undefined
                    }
                    height={240}
                  />
                </div>

                {/* Tri-Script Expansion Matrix */}
                <div className={`rounded-2xl border overflow-hidden ${surfaceCard}`}>
                  <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-base font-bold">
                      Nepali + English + Romanized Keyword Expansion
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleTrackInWatchlist({
                            keyword: kwResult.keyword,
                            category: kwResult.category,
                            country: kwResult.country,
                          })
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                          isDark ? 'border-slate-700 text-slate-200 hover:border-cyan-400' : 'border-slate-300 text-slate-800 hover:border-cyan-600'
                        }`}
                      >
                        <Bookmark className="h-3.5 w-3.5 text-cyan-500" />
                        <span>Track</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const csv = buildKeywordCsvExport(kwResult);
                          handleDownloadFile(`nepalai-keywords-${Date.now()}.csv`, csv, 'text/csv;charset=utf-8');
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                          isDark ? 'border-slate-700 text-slate-200 hover:border-cyan-400' : 'border-slate-300 text-slate-800 hover:border-cyan-600'
                        }`}
                      >
                        <Download className="h-3.5 w-3.5 text-cyan-500" />
                        <span>Export CSV</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleDownloadFile(
                            `nepalai-keywords-${Date.now()}.json`,
                            JSON.stringify(kwResult, null, 2),
                            'application/json'
                          );
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                          isDark ? 'border-slate-700 text-slate-200 hover:border-cyan-400' : 'border-slate-300 text-slate-800 hover:border-cyan-600'
                        }`}
                      >
                        <Download className="h-3.5 w-3.5 text-cyan-500" />
                        <span>JSON</span>
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className={isDark ? 'bg-[#080d1a] text-slate-300' : 'bg-slate-50 text-slate-700'}>
                        <tr>
                          <th className="py-3 px-4 font-semibold">Base Keyword</th>
                          <th className="py-3 px-4 font-semibold">English Variant</th>
                          <th className="py-3 px-4 font-semibold">Romanized Nepali</th>
                          <th className="py-3 px-4 font-semibold">Devanagari</th>
                          <th className="py-3 px-4 font-semibold">Intent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {kwResult.variants.map((v, i) => (
                          <tr key={i} className={isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50/70'}>
                            <td className="py-3 px-4 font-semibold">{v.baseKeyword}</td>
                            <td className="py-3 px-4">{v.englishVariant}</td>
                            <td className="py-3 px-4 font-mono text-xs">{v.romanizedNepali}</td>
                            <td className="py-3 px-4 font-devanagari">{v.devanagariVariant}</td>
                            <td className="py-3 px-4 text-xs text-cyan-700 dark:text-cyan-300 font-medium">
                              {v.intentTag}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Content Angles & Related Queries */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`rounded-2xl border p-5 space-y-3 ${surfaceCard}`}>
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Layers className="h-4 w-4 text-cyan-500" />
                      <span>Content-Angle Suggestions</span>
                    </h3>
                    <ul className={`list-disc pl-5 space-y-2 text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {kwResult.contentAngles.map((angle, i) => (
                        <li key={i}>{angle}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={`rounded-2xl border p-5 space-y-3 ${surfaceCard}`}>
                    <h3 className="text-sm font-bold">Related Queries</h3>
                    <div className="flex flex-wrap gap-2">
                      {kwResult.relatedQueries.map((rq) => (
                        <button
                          key={rq}
                          type="button"
                          onClick={() => {
                            setKwInput(rq);
                            runKeywordExplore(rq);
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                            isDark
                              ? 'border-slate-800 bg-[#080d1a] text-slate-200 hover:border-cyan-400'
                              : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-cyan-600'
                          }`}
                        >
                          {rq}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ================================================================
            VIEW 4: COMMERCIAL BUSINESS KEYWORDS (/keywords/nepal/business)
           ================================================================ */}
        {route.view === 'business-keywords' && (
          <div className="space-y-6">
            <div className={`rounded-2xl border p-6 ${surfaceCard}`}>
              <h1 className={`text-2xl sm:text-3xl font-extrabold font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {isNe
                  ? 'नेपाली व्यवसायका लागि व्यावसायिक किबोर्ड आइडिया'
                  : 'Nepal Business & Local-Service Keyword Packs'}
              </h1>
              <p className={`mt-2 text-sm max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Pre-structured commercial search clusters spanning English, Romanized Nepali, and Devanagari — ready for clinics, trekking operators, fintech wallets, and diaspora gift/property services.
              </p>
            </div>

            {bizLoading ? (
              <div className={`rounded-2xl border p-8 h-64 animate-pulse ${surfaceCard}`} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bizPacks.map((pack, idx) => (
                  <div key={idx} className={`rounded-2xl border p-6 space-y-4 ${surfaceCard}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-sm font-bold text-cyan-700 dark:text-cyan-300">
                        {getCategoryName(pack.category, isNe)}
                      </span>
                      <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        Local {pack.localIntentScore}% · Diaspora {pack.diasporaIntentScore}%
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {pack.variants.map((v, vIdx) => (
                        <div
                          key={vIdx}
                          className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                            isDark ? 'border-slate-800 bg-[#080d1a]' : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-sm">{v.englishVariant}</span>
                            <span className="text-cyan-600 dark:text-cyan-400 font-medium">{v.intentTag}</span>
                          </div>
                          <div className="font-mono text-slate-500 dark:text-slate-300">
                            Romanized: {v.romanizedNepali}
                          </div>
                          <div className="font-devanagari text-slate-700 dark:text-slate-200">
                            Devanagari: {v.devanagariVariant}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-1 flex items-center justify-between gap-2">
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {pack.contentAngles[0]}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const target = pack.variants[0]?.baseKeyword || 'Nepal business';
                          setKwInput(target);
                          onChangeRoute('/keywords/nepal');
                          runKeywordExplore(target);
                        }}
                        className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Explore →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================
            VIEW 5: BRIEFS VAULT, WATCHLIST & REST API v1 (/trending/api)
           ================================================================ */}
        {route.view === 'api-vault' && (
          <div className="space-y-6">
            <div className={`rounded-2xl border p-6 ${surfaceCard}`}>
              <h1 className={`text-2xl sm:text-3xl font-extrabold font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {isNe
                  ? 'क्रिएटर ब्रिफ भल्ट, वाचलिस्ट र REST API v1'
                  : 'Creator Briefs Vault, Watchlist & REST API v1'}
              </h1>
              <p className={`mt-2 text-sm max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Manage tracked Nepal keywords, revisit saved bilingual SEO content briefs, and provision metered REST API v1 keys for Nepali newsrooms, agencies, and e-commerce stores.
              </p>
            </div>

            {vaultLoading ? (
              <div className={`rounded-2xl border p-8 h-64 animate-pulse ${surfaceCard}`} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Tracked Watchlist & Saved Bilingual Briefs */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Tracked Watchlist */}
                  <div className={`rounded-2xl border p-6 space-y-4 ${surfaceCard}`}>
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-700 dark:text-cyan-400">
                        <Bookmark className="h-4 w-4" />
                        <span>Tracked Watchlist ({watchlist.length})</span>
                      </div>
                    </div>

                    {watchlist.length === 0 ? (
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        No tracked keywords yet. Click "Track Topic" on any Nepal trend or Keyword Explorer result to monitor it here.
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {watchlist.map((item) => (
                          <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.slug) {
                                  onChangeRoute(`/trending/nepal/${item.slug}`);
                                } else {
                                  setKwInput(item.keyword);
                                  onChangeRoute('/keywords/nepal');
                                  runKeywordExplore(item.keyword);
                                }
                              }}
                              className="text-left min-w-0 flex-1 cursor-pointer group"
                            >
                              <div className="text-sm font-bold group-hover:text-cyan-500 truncate">
                                {item.keyword}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {getCategoryName(item.category, isNe)} · {item.country}
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveWatchlist(item.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
                              aria-label="Remove watchlist item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Saved Bilingual Briefs */}
                  <div className={`rounded-2xl border p-6 space-y-4 ${surfaceCard}`}>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-700 dark:text-cyan-400 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <BookOpen className="h-4 w-4" />
                      <span>Saved Bilingual SEO Briefs ({savedBriefs.length})</span>
                    </div>

                    {savedBriefs.length === 0 ? (
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Generate a content brief from any trend explainer page to access downloadable bilingual outlines here.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {savedBriefs.slice(0, 6).map((b) => (
                          <div
                            key={b.id}
                            className={`p-4 rounded-xl border space-y-2 ${
                              isDark ? 'border-slate-800 bg-[#080d1a]' : 'border-slate-200 bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                                {b.keyword}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDownloadFile(
                                    `brief-${b.id}.md`,
                                    `# ${b.outlineJson.headlineEn}\n## ${b.outlineJson.headlineNe}\n\n${b.outlineJson.hookEn}\n\n${b.outlineJson.hookNe}\n\n${b.outlineJson.keyPoints.map((p) => `- ${p}`).join('\n')}`,
                                    'text/markdown;charset=utf-8'
                                  )
                                }
                                className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300 cursor-pointer"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>Markdown</span>
                              </button>
                            </div>
                            <div className="text-sm font-bold">{b.outlineJson.headlineEn}</div>
                            <div className="text-xs font-devanagari text-slate-600 dark:text-slate-300">
                              {b.outlineJson.headlineNe}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Developer & Media REST API v1 */}
                <div className="lg:col-span-6 space-y-6">
                  <div className={`rounded-2xl border p-6 space-y-5 ${surfaceCard}`}>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-700 dark:text-cyan-400">
                      <Terminal className="h-4 w-4" />
                      <span>NepalAI Trends REST API v1</span>
                    </div>

                    <form onSubmit={handleCreateApiKey} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <input
                          type="text"
                          value={newKeyLabel}
                          onChange={(e) => setNewKeyLabel(e.target.value)}
                          placeholder="e.g. Kathmandu Newsroom"
                          className={`sm:col-span-2 px-3.5 py-2.5 rounded-xl border text-sm outline-hidden ${inputClass}`}
                        />
                        <select
                          value={newKeyTier}
                          onChange={(e) => setNewKeyTier(e.target.value as 'starter' | 'agency')}
                          className={`px-3 py-2.5 rounded-xl border text-xs font-semibold outline-hidden ${inputClass}`}
                        >
                          <option value="starter">Starter (5K/mo)</option>
                          <option value="agency">Agency (50K/mo)</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
                      >
                        Provision API v1 Key
                      </button>
                    </form>

                    {provisionedSecret && (
                      <div
                        className={`p-4 rounded-xl border space-y-2 text-xs ${
                          isDark
                            ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-100'
                            : 'border-emerald-300 bg-emerald-50 text-emerald-950'
                        }`}
                      >
                        <div className="font-bold">API Key Provisioned (save now — shown once):</div>
                        <div className="flex items-center justify-between gap-2 font-mono break-all">
                          <span>{provisionedSecret}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy('api-secret', provisionedSecret)}
                            className="px-2 py-1 rounded bg-emerald-600 text-white shrink-0 cursor-pointer"
                          >
                            {copiedId === 'api-secret' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleTestApiV1}
                          className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-semibold cursor-pointer"
                        >
                          Test GET /api/v1/trends/nepal Live
                        </button>
                      </div>
                    )}

                    {apiTestResult && (
                      <pre
                        className={`p-3 rounded-xl border text-xs font-mono overflow-x-auto max-h-56 ${
                          isDark ? 'border-slate-800 bg-[#080d1a] text-cyan-200' : 'border-slate-200 bg-slate-900 text-cyan-200'
                        }`}
                      >
                        {apiTestResult}
                      </pre>
                    )}

                    {/* Endpoint Documentation */}
                    <div
                      className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
                        isDark ? 'border-slate-800 bg-[#080d1a] text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="font-bold text-cyan-600 dark:text-cyan-400">Authenticated Endpoints</div>
                      <div>GET /api/v1/trends/nepal?category=sports-npl&amp;limit=20</div>
                      <div>GET /api/v1/keywords/explore?q=AI+jobs+Nepal&amp;country=NP</div>
                      <div className="text-slate-500 dark:text-slate-400">
                        Header: x-api-key: nat_live_...
                      </div>
                    </div>

                    {/* Provisioned Keys List */}
                    {apiKeys.length > 0 && (
                      <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {apiKeys.map((k) => (
                          <div key={k.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                            <div>
                              <div className="font-bold">{k.label}</div>
                              <div className="font-mono text-slate-500 dark:text-slate-400">
                                {k.keyPrefix}… · {k.planTier} · {k.requestCount}/{k.monthlyQuota} calls
                              </div>
                            </div>
                            <span
                              className={`font-semibold ${
                                k.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                              }`}
                            >
                              {k.isActive ? 'Active' : 'Revoked'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
