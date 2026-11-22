import React, { useEffect, useState } from 'react';
import { Calendar, Search, ArrowUpRight, Sparkles, Compass } from 'lucide-react';
import { Language, ThemeMode } from '../../types';
import { TrendVelocityPoint, SEASONAL_PILLARS } from '../../utils/trendsEngine';
import { getCuratedSeasonalFallback, safeFetchJson } from '../../utils/trendsFallback';
import { TrendsD3VelocityChart } from './TrendsD3VelocityChart';
import { SeasonalNepalTrendsMap } from './SeasonalNepalTrendsMap';

interface SeasonalBenchmarkDto {
  id: string;
  keyword: string;
  pillar: string;
  bsMonthLabel: string;
  peakMonths: number[];
  monthlyIndex: number[];
  currentInterestScore: number;
  direction: 'rising' | 'pre-peak' | 'peak' | 'steady';
  romanizedNepali: string;
  devanagariVariant: string;
  linkedToolTab?: string | null;
  insightNote: string;
  dataSource: string;
}

interface RisingLiveTrendDto {
  id: string;
  slug: string;
  keyword: string;
  category: string;
  trafficBand: string;
  trendScore: number;
  latestVelocityDelta: number;
  aiWhyTrending?: string | null;
}

interface SeasonalAnalyticsViewProps {
  theme: ThemeMode;
  language: Language;
  onExploreKeyword: (keyword: string) => void;
  onSelectTrendSlug: (slug: string) => void;
  onNavigateToolTab?: (tab: string) => void;
}

export const SeasonalAnalyticsView: React.FC<SeasonalAnalyticsViewProps> = ({
  theme,
  language,
  onExploreKeyword,
  onSelectTrendSlug,
  onNavigateToolTab,
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';

  const [activePillar, setActivePillar] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [curvePoints, setCurvePoints] = useState<TrendVelocityPoint[]>([]);
  const [benchmarks, setBenchmarks] = useState<SeasonalBenchmarkDto[]>([]);
  const [risingLiveTrends, setRisingLiveTrends] = useState<RisingLiveTrendDto[]>([]);
  const [trendsApiConfigured, setTrendsApiConfigured] = useState<boolean>(false);
  const [liveApiEnrichedCount, setLiveApiEnrichedCount] = useState<number>(0);

  const loadSeasonalData = async (pillar: string, search: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await safeFetchJson<any>(
        `/api/trends/seasonal?pillar=${encodeURIComponent(pillar)}&search=${encodeURIComponent(search)}`
      );
      const data =
        res.ok && res.data?.success
          ? res.data
          : getCuratedSeasonalFallback(pillar, search);
      setCurvePoints(Array.isArray(data.curvePoints) ? data.curvePoints : []);
      setBenchmarks(Array.isArray(data.benchmarks) ? data.benchmarks : []);
      setRisingLiveTrends(Array.isArray(data.risingLiveTrends) ? data.risingLiveTrends : []);
      setTrendsApiConfigured(Boolean(data.trendsApiConfigured));
      setLiveApiEnrichedCount(Number(data.liveApiEnrichedCount || 0));
    } catch {
      const fallback = getCuratedSeasonalFallback(pillar, search);
      setCurvePoints(fallback.curvePoints);
      setBenchmarks(fallback.benchmarks);
      setRisingLiveTrends(fallback.risingLiveTrends);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSeasonalData(activePillar, searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [activePillar, searchQuery]);

  const surfaceCard = isDark
    ? 'border-slate-800 bg-[#0b1220] text-slate-100'
    : 'border-slate-200 bg-white text-slate-900 shadow-2xs';

  const inputClass = isDark
    ? 'border-slate-700 bg-[#080d1a] text-white placeholder:text-slate-400 focus:border-cyan-400'
    : 'border-slate-300 bg-white text-slate-950 placeholder:text-slate-500 focus:border-cyan-600';

  const getStatusDisplay = (dir: SeasonalBenchmarkDto['direction']) => {
    if (dir === 'peak') {
      return {
        label: isNe ? 'शिखर सिजन' : 'Peak Window',
        cls: 'text-emerald-600 dark:text-emerald-400',
      };
    }
    if (dir === 'pre-peak') {
      return {
        label: isNe ? 'सिजन नजिकिँदै' : 'Pre-Peak Surge',
        cls: 'text-amber-600 dark:text-amber-400',
      };
    }
    if (dir === 'rising') {
      return {
        label: isNe ? 'बढ्दो क्रममा' : 'Rising ↑',
        cls: 'text-emerald-600 dark:text-emerald-400',
      };
    }
    return {
      label: isNe ? 'स्थिर' : 'Steady',
      cls: isDark ? 'text-slate-300' : 'text-slate-600',
    };
  };

  const getPillarLabel = (slug: string) => {
    const found = SEASONAL_PILLARS.find((p) => p.slug === slug);
    if (!found) return slug;
    return isNe ? found.labelNe : found.labelEn;
  };

  const activePillarMeta = SEASONAL_PILLARS.find((p) => p.slug === activePillar);

  return (
    <div className="space-y-6">
      {/* Top Bar Contract: Header + Pillar Switcher + Search Filter */}
      <div className={`rounded-2xl border p-6 space-y-5 ${surfaceCard}`}>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-400">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                {trendsApiConfigured
                  ? 'Google Trends Alpha 5-Yr Adapter + Bikram Sambat Matrix'
                  : 'Bikram Sambat Seasonal Matrix + Live RSS Velocity'}
              </span>
            </div>
            <h1 className={`mt-1 text-2xl sm:text-3xl font-extrabold font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
              {isNe
                ? 'नेपाल मौसमी र बढ्दो खोज विश्लेषण'
                : 'Rising & Seasonal Nepal Demand Analytics'}
            </h1>
            <p className={`mt-1.5 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {activePillarMeta
                ? activePillarMeta.descriptionEn
                : 'Plan campaigns ahead of Dashain/Tihar festivals, SEE/NEB & Lok Sewa exam windows, Himalayan trekking seasons, and Daraz/eSewa commerce peaks.'}
            </p>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isNe ? 'सिजन वा किबोर्ड खोज्नुहोस्...' : 'Filter festivals, exams, treks...'}
              className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-hidden transition-colors ${inputClass}`}
              aria-label="Filter seasonal benchmarks"
            />
          </div>
        </div>

        {/* 4-Pillar Filter Bar */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActivePillar('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer border ${
              activePillar === 'all'
                ? isDark
                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40'
                  : 'bg-cyan-600 text-white border-cyan-600'
                : isDark
                  ? 'border-slate-800 text-slate-300 hover:text-white'
                  : 'border-slate-200 text-slate-700 hover:text-slate-950'
            }`}
          >
            {isNe ? 'सबै सिजन (४ क्षेत्र)' : 'All 4 Pillars'}
          </button>
          {SEASONAL_PILLARS.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => setActivePillar(p.slug)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer border ${
                activePillar === p.slug
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40'
                    : 'bg-cyan-600 text-white border-cyan-600'
                  : isDark
                    ? 'border-slate-800 text-slate-300 hover:text-white'
                    : 'border-slate-200 text-slate-700 hover:text-slate-950'
              }`}
            >
              {isNe ? p.labelNe : p.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* D3.js Seasonal Nepal Trends Map (Time-Based Spike Matrix) */}
      <SeasonalNepalTrendsMap
        theme={theme}
        language={language}
        benchmarks={benchmarks}
        loading={loading}
        error={error}
        trendsApiConfigured={trendsApiConfigured}
        liveApiEnrichedCount={liveApiEnrichedCount}
        onExploreKeyword={onExploreKeyword}
        onRefreshMap={() => loadSeasonalData(activePillar, searchQuery)}
        onResetFilters={() => {
          setActivePillar('all');
          setSearchQuery('');
        }}
      />

      {/* D3.js 12-Month Seasonal Demand Curve + PDF Report Download */}
      {!loading && curvePoints.length > 0 && (
        <div className={`rounded-2xl border p-5 sm:p-6 ${surfaceCard}`}>
          <TrendsD3VelocityChart
            theme={theme}
            language={language}
            variant="timeseries"
            title={
              activePillar === 'all'
                ? isNe
                  ? 'वार्षिक नेपाल मौसमी खोज कर्भ (Jan–Dec)'
                  : '12-Month Nepal Seasonal Demand Curve (Jan–Dec)'
                : `${getPillarLabel(activePillar)} — 12-Month Demand Curve`
            }
            subtitle="Relative 0–100 seasonal search intensity across Bikram Sambat & Gregorian calendar cycles. Hover for monthly index or export PDF."
            primaryLabel={activePillar === 'all' ? 'Nepal Seasonal Index' : getPillarLabel(activePillar)}
            primaryPoints={curvePoints}
            height={250}
          />
        </div>
      )}

      {/* Main Content Split: Seasonal Benchmarks Data Grid + Live Rising Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Seasonal Benchmarks High-Density Data Grid */}
        <div className={`lg:col-span-8 rounded-2xl border overflow-hidden ${surfaceCard}`}>
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold">
              {isNe ? 'प्रमुख मौसमी किबोर्ड तालिका' : 'Seasonal Keyword Calendar & Demand Matrix'}
            </h2>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {benchmarks.length} cycles
            </span>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`h-11 rounded-lg animate-pulse ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}
                />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm text-red-500 font-medium">{error}</p>
              <button
                type="button"
                onClick={() => loadSeasonalData(activePillar, searchQuery)}
                className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : benchmarks.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm font-semibold">No seasonal keyword cycles match this filter.</p>
              <button
                type="button"
                onClick={() => {
                  setActivePillar('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold cursor-pointer"
              >
                Reset Seasonal Filter
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className={isDark ? 'bg-[#080d1a] text-slate-300' : 'bg-slate-50 text-slate-700'}>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-4 font-semibold">Topic & Nepali Variants</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">BS Window</th>
                    <th className="py-2.5 px-3 font-semibold text-right whitespace-nowrap">Index</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Phase</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {benchmarks.map((row) => {
                    const status = getStatusDisplay(row.direction);
                    return (
                      <tr
                        key={row.id}
                        className={isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50/80'}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-sm">{row.keyword}</div>
                          <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {getPillarLabel(row.pillar)} · {row.romanizedNepali} ·{' '}
                            <span className="font-devanagari">{row.devanagariVariant}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs whitespace-nowrap">
                          {row.bsMonthLabel}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums font-bold text-right whitespace-nowrap">
                          {row.currentInterestScore}/100
                        </td>
                        <td className={`py-3 px-3 font-mono text-xs font-semibold whitespace-nowrap ${status.cls}`}>
                          {status.label}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            {row.linkedToolTab && onNavigateToolTab && (
                              <button
                                type="button"
                                onClick={() => onNavigateToolTab(row.linkedToolTab!)}
                                className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-cyan-500 cursor-pointer"
                              >
                                Tool
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onExploreKeyword(row.keyword)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:underline cursor-pointer"
                            >
                              <span>Explore</span>
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 4 Cols: Live Rising Nepal Keywords from Snapshot Velocity */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`rounded-2xl border p-5 space-y-4 ${surfaceCard}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-400">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>{isNe ? 'लाइभ बढ्दो किबोर्ड' : 'Live Rising Momentum'}</span>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                RSS Snapshots
              </span>
            </div>

            {risingLiveTrends.length === 0 ? (
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Sync live RSS trends from Trending Now to surface real-time momentum surges alongside seasonal anchors.
              </p>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {risingLiveTrends.map((tr, i) => (
                  <button
                    key={tr.id}
                    type="button"
                    onClick={() => onSelectTrendSlug(tr.slug)}
                    className="w-full py-2.5 text-left flex items-start justify-between gap-3 hover:opacity-85 transition-opacity cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">
                        <span className="font-mono text-cyan-600 dark:text-cyan-400 mr-1.5">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {tr.keyword}
                      </div>
                      <div className={`text-[11px] font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {tr.trafficBand} · Velocity {tr.trendScore}/100
                        {tr.latestVelocityDelta > 0 ? ` · +${tr.latestVelocityDelta.toLocaleString()}` : ''}
                      </div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-cyan-500 shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={`rounded-2xl border p-5 space-y-2.5 ${surfaceCard}`}>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-400">
              <Compass className="h-4 w-4 shrink-0" />
              <span>Bikram Sambat Lead Time</span>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Nepali search demand consistently ramps 3–4 weeks ahead of calendar events. Use the Pre-Peak indicators above to publish bilingual landing pages before Dashain, SEE results, or trekking permits spike.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
