import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Search,
  FileText,
  Calculator,
  ArrowRightLeft,
  Scan,
  Check,
  Copy,
  LayoutDashboard,
  TrendingUp,
} from 'lucide-react';
import { HeroConfig, ThemeMode, Language, AppPage } from '../types';
import { Button } from './ui/Button';
import { HimalayanWireframeScene } from './3d/HimalayanWireframeScene';
import { fetchSharedJson } from '../utils/officialFeedsClient';

interface HeroProps {
  config: HeroConfig;
  theme: ThemeMode;
  language: Language;
  onOpenConsultation: () => void;
  onExploreConsulting: () => void;
  onOpenAdminPanel: () => void;
  onOpenSearch?: () => void;
  onSelectPage?: (page: AppPage) => void;
  onOpenDailyTab?: (tab: string) => void;
  onOpenTrendDetail?: (slug: string) => void;
}

interface HeroPulseState {
  usdBuy: number | null;
  usdSell: number | null;
  eurBuy: number | null;
  eurSell: number | null;
  gbpBuy: number | null;
  gbpSell: number | null;
  goldTola: number | null;
  goldDelta: number | null;
  topTrendKeyword: string | null;
  topTrendSlug: string | null;
  topTrendTraffic: string | null;
  loading: boolean;
}

function formatNprCompact(amount: number): string {
  return new Intl.NumberFormat('en-IN').format(Math.round(amount));
}

export const Hero: React.FC<HeroProps> = ({
  theme,
  language,
  onOpenSearch,
  onSelectPage,
  onOpenDailyTab,
  onOpenTrendDetail,
}) => {
  const isDark = theme === 'dark';
  const isNepali = language === 'ne';

  const [activePreview, setActivePreview] = useState<'nibedan' | 'tax' | 'forex' | 'ocr'>('nibedan');
  const [copied, setCopied] = useState(false);

  const [pulse, setPulse] = useState<HeroPulseState>({
    usdBuy: null,
    usdSell: null,
    eurBuy: null,
    eurSell: null,
    gbpBuy: null,
    gbpSell: null,
    goldTola: null,
    goldDelta: null,
    topTrendKeyword: null,
    topTrendSlug: null,
    topTrendTraffic: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;
    const loadHeroPulse = async () => {
      try {
        const [nrbRes, bullionRes, trendsRes] = await Promise.all([
          fetchSharedJson('/api/forex/nrb'),
          fetchSharedJson('/api/bullion/fenegosida'),
          fetchSharedJson('/api/trends/nepal?limit=1'),
        ]);

        if (!active) return;

        const firstTrend = Array.isArray(trendsRes?.trends) ? trendsRes.trends[0] : null;
        setPulse({
          usdBuy: nrbRes?.rates?.USD?.buy ?? null,
          usdSell: nrbRes?.rates?.USD?.sell ?? null,
          eurBuy: nrbRes?.rates?.EUR?.buy ?? null,
          eurSell: nrbRes?.rates?.EUR?.sell ?? null,
          gbpBuy: nrbRes?.rates?.GBP?.buy ?? null,
          gbpSell: nrbRes?.rates?.GBP?.sell ?? null,
          goldTola: bullionRes?.rates?.chhapawalGoldPerTola ?? null,
          goldDelta:
            typeof bullionRes?.rates?.deltaChhapawalPerTola === 'number'
              ? bullionRes.rates.deltaChhapawalPerTola
              : null,
          topTrendKeyword: firstTrend?.keyword ?? null,
          topTrendSlug: firstTrend?.slug ?? null,
          topTrendTraffic: firstTrend?.trafficBand ?? null,
          loading: false,
        });
      } catch {
        if (active) {
          setPulse((prev) => ({ ...prev, loading: false }));
        }
      }
    };

    loadHeroPulse();
    return () => {
      active = false;
    };
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openDailyUtility = (tab: string) => {
    if (onOpenDailyTab) {
      onOpenDailyTab(tab);
    } else {
      onSelectPage?.('daily');
    }
  };

  return (
    <section
      className={`relative pt-10 pb-14 sm:pt-14 sm:pb-20 transition-colors duration-300 overflow-hidden ${
        isDark
          ? 'bg-[#070B14] text-white'
          : 'bg-[#FAF9F6] text-slate-950'
      }`}
      aria-label="NepalAI Platform Introduction"
    >
      {/* Subtle Architectural Hairline Grid */}
      <div
        className="absolute inset-0 himalayan-hairline-grid pointer-events-none opacity-60 [mask-image:radial-gradient(ellipse_75%_65%_at_65%_35%,#000_20%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* Ambient Atmospheric Glows */}
      <div
        className="absolute top-1/2 right-[-6%] -translate-y-1/2 w-[540px] h-[540px] rounded-full blur-3xl pointer-events-none opacity-55 dark:opacity-75"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(6, 182, 212, 0.14) 0%, rgba(190, 18, 60, 0.06) 50%, transparent 72%)'
            : 'radial-gradient(circle, rgba(8, 145, 178, 0.10) 0%, rgba(190, 18, 60, 0.04) 50%, transparent 72%)',
        }}
        aria-hidden="true"
      />

      {/* 3D Himalayan Topographic Contour Horizon */}
      <HimalayanWireframeScene theme={theme} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Headline, Search & Primary Actions */}
          <div className="lg:col-span-6 text-center lg:text-left">
            
            {/* Editorial Section Marker */}
            <div className="inline-flex items-center gap-2.5 text-[11px] font-mono font-bold tracking-[0.16em] uppercase mb-4">
              <span className="text-rose-700 dark:text-rose-400">01</span>
              <span aria-hidden="true" className="text-slate-400 dark:text-slate-600">/</span>
              <span className="text-cyan-700 dark:text-cyan-400">
                {isNepali ? 'नेपालएआई · काठमाडौं, नेपाल' : 'NEPALAI · KATHMANDU, NEPAL'}
              </span>
            </div>

            {/* Asymmetric Editorial Display Headline */}
            <h1
              className={`font-extrabold tracking-tight font-display leading-[1.08] text-balance ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
              style={{ fontSize: 'clamp(2.25rem, 4.1vw, 3.65rem)' }}
            >
              {isNepali ? (
                <>
                  नेपालको सार्वभौम <br className="hidden sm:inline" />
                  <span className="text-cyan-700 dark:text-cyan-400">एआई</span>{' '}
                  <span className="text-rose-700 dark:text-rose-400 font-bold">र डेटा</span> प्लेटफर्म।
                </>
              ) : (
                <>
                  Nepal’s Sovereign <br className="hidden sm:inline" />
                  <span className="font-serif-editorial italic font-normal text-rose-700 dark:text-rose-400 pr-1">
                    Intelligence
                  </span>{' '}
                  <span className="text-cyan-700 dark:text-cyan-400">&amp; AI Hub.</span>
                </>
              )}
            </h1>

            {/* Concise Value Proposition */}
            <p
              className={`mt-4 text-base sm:text-[17px] leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              {isNepali
                ? 'आधिकारिक राष्ट्र बैंक दर, आयकर हिसाब, वडा निवेदन, सुनचाँदी र प्रत्यक्ष नेपाली एआई — एउटै सार्वभौम कार्यस्थानमा।'
                : 'Live NRB forex, IRD 2081/82 tax, FENEGOSIDA bullion, ward letters, and Nepali search trends — unified in one bilingual workspace.'}
            </p>

            {/* Rock-Solid High-Contrast Command Search Trigger */}
            <div className="mt-6 w-full max-w-lg mx-auto lg:mx-0">
              <div
                onClick={onOpenSearch}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenSearch?.();
                  }
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors cursor-pointer min-h-[48px] ${
                  isDark
                    ? 'border-slate-800 bg-[#0B1220]/95 hover:bg-[#10192D] text-slate-100 hover:border-cyan-400/70'
                    : 'border-slate-300/90 bg-white hover:border-cyan-600 text-slate-800 shadow-2xs'
                }`}
                aria-label="Open search command palette"
              >
                <div className="flex items-center gap-3 text-sm min-w-0">
                  <Search className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" aria-hidden="true" />
                  <span className="truncate font-medium">
                    {isNepali ? 'खोज्नुहोस्: आयकर, डलर दर, सुन मूल्य, वडा निवेदन...' : 'Search IRD tax, NRB forex, gold rate, ward letters...'}
                  </span>
                </div>
                <kbd className="hidden sm:inline-flex text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/15 shrink-0">
                  Ctrl+K
                </kbd>
              </div>
            </div>

            {/* Single Dominant CTA + Crisp Secondary Link */}
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => onSelectPage?.('command-center')}
                leftIcon={<LayoutDashboard className="h-4 w-4" aria-hidden="true" />}
              >
                {isNepali ? 'कमान्ड सेन्टर खोल्नुहोस्' : 'Open Command Center'}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => onSelectPage?.('daily')}
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                {isNepali ? 'दैनिक टुल्स (१४)' : 'Daily Utilities'}
              </Button>
            </div>

            {/* Unboxed Editorial Trust Line (Zero Pills) */}
            <div
              className={`mt-7 pt-5 border-t flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1.5 text-xs font-mono ${
                isDark ? 'border-slate-800/90 text-slate-300' : 'border-slate-200 text-slate-600'
              }`}
            >
              <span>{isNepali ? 'राष्ट्र बैंक दर' : 'NRB Official Feed'}</span>
              <span aria-hidden="true" className="text-rose-600 dark:text-rose-400">·</span>
              <span>{isNepali ? 'आ.व. २०८१/८२ कर' : 'IRD FY 2081/82'}</span>
              <span aria-hidden="true" className="text-rose-600 dark:text-rose-400">·</span>
              <span>{isNepali ? 'eSewa र Khalti' : 'eSewa & Khalti'}</span>
              <span aria-hidden="true" className="text-rose-600 dark:text-rose-400">·</span>
              <span>{isNepali ? 'नेपाली र अंग्रेजी' : 'EN / नेपाली'}</span>
            </div>

          </div>

          {/* Right Column: Live Nepal Pulse + Interactive Editorial Workspace Card */}
          <div className="lg:col-span-6 w-full">
            <div
              className={`rounded-2xl border overflow-hidden transition-colors ${
                isDark
                  ? 'border-slate-800 bg-[#0B1220]/95 shadow-2xl shadow-black/50'
                  : 'border-slate-200/90 bg-white shadow-xl shadow-slate-900/[0.04]'
              }`}
            >
              {/* Top Band: Live Nepal Pulse Strip (3 Hairline Cells) */}
              <div
                className={`grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x border-b ${
                  isDark
                    ? 'divide-slate-800 border-slate-800 bg-[#080E1B]'
                    : 'divide-slate-200 border-slate-200 bg-[#FAF9F6]/80'
                }`}
              >
                {/* Cell 1: NRB USD Rate */}
                <button
                  type="button"
                  onClick={() => openDailyUtility('fx')}
                  className="text-left px-4 py-3 hover:bg-cyan-500/[0.05] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span>{isNepali ? 'राष्ट्र बैंक USD' : 'NRB USD Rate'}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-cyan-600 dark:text-cyan-400 transition-opacity" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5 font-mono tabular-nums">
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {pulse.usdBuy !== null ? `रू ${pulse.usdBuy.toFixed(2)}` : pulse.loading ? '—' : 'रू 148.97'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pulse.usdSell !== null ? `/ ${pulse.usdSell.toFixed(2)}` : ''}
                    </span>
                  </div>
                </button>

                {/* Cell 2: FENEGOSIDA 24K Gold */}
                <button
                  type="button"
                  onClick={() => openDailyUtility('bullion')}
                  className="text-left px-4 py-3 hover:bg-cyan-500/[0.05] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span>{isNepali ? 'छापावाल सुन (तोला)' : '24K Gold / Tola'}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-cyan-600 dark:text-cyan-400 transition-opacity" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-2 font-mono tabular-nums">
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {pulse.goldTola !== null
                        ? `रू ${formatNprCompact(pulse.goldTola)}`
                        : pulse.loading
                        ? '—'
                        : 'रू 1,62,500'}
                    </span>
                    {pulse.goldDelta !== null && pulse.goldDelta !== 0 && (
                      <span
                        className={`text-[10px] font-semibold ${
                          pulse.goldDelta > 0
                            ? 'text-rose-700 dark:text-rose-400'
                            : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {pulse.goldDelta > 0 ? `+${formatNprCompact(pulse.goldDelta)}` : formatNprCompact(pulse.goldDelta)}
                      </span>
                    )}
                  </div>
                </button>

                {/* Cell 3: #1 Live Nepal Trend */}
                <button
                  type="button"
                  onClick={() => {
                    if (pulse.topTrendSlug && onOpenTrendDetail) {
                      onOpenTrendDetail(pulse.topTrendSlug);
                    } else {
                      onSelectPage?.('trends');
                    }
                  }}
                  className="text-left px-4 py-3 hover:bg-cyan-500/[0.05] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-rose-700 dark:text-rose-400 font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" aria-hidden="true" />
                      <span>{isNepali ? 'नेपाल #१ ट्रेन्ड' : 'Nepal #1 Trend'}</span>
                    </span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-cyan-600 dark:text-cyan-400 transition-opacity" />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between gap-2 min-w-0">
                    <span className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {pulse.topTrendKeyword || (pulse.loading ? 'Syncing...' : 'Nepal Trends Hub')}
                    </span>
                    {pulse.topTrendTraffic && (
                      <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400 shrink-0 tabular-nums">
                        {pulse.topTrendTraffic}
                      </span>
                    )}
                  </div>
                </button>
              </div>

              {/* Flush Underline Utility Switcher */}
              <div
                className={`grid grid-cols-2 sm:grid-cols-4 border-b ${
                  isDark ? 'border-slate-800 bg-[#0B1220]' : 'border-slate-200 bg-white'
                }`}
                role="tablist"
                aria-label="Live Utility Previews"
              >
                {[
                  { id: 'nibedan' as const, label: isNepali ? 'वडा निवेदन' : 'Ward Letter', icon: FileText },
                  { id: 'tax' as const, label: isNepali ? 'आयकर TDS' : 'Tax & TDS', icon: Calculator },
                  { id: 'forex' as const, label: isNepali ? 'डलर दर' : 'NRB Forex', icon: ArrowRightLeft },
                  { id: 'ocr' as const, label: isNepali ? 'कागजात OCR' : 'Devanagari OCR', icon: Scan },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activePreview === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActivePreview(item.id)}
                      className={`relative py-3 px-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        isActive
                          ? isDark
                            ? 'text-cyan-300 bg-cyan-500/[0.06]'
                            : 'text-cyan-800 bg-cyan-50/70'
                          : isDark
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                      {isActive && (
                        <span
                          className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-rose-600 to-cyan-600 dark:from-rose-400 dark:to-cyan-400"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Clean Preview Workspace Body */}
              <div className="p-5 sm:p-6">
                {/* 1. Ward Nibedan Preview */}
                {activePreview === 'nibedan' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-950 dark:text-white">
                          {isNepali ? 'नेपाली नागरिकता सिफारिस निवेदन' : 'Ward Citizenship Letter'}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {isNepali ? 'स्थानीय तह वडा कार्यालय प्रयोजन' : 'Official Devanagari & Romanized Format'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('श्रीमान् वडा अध्यक्षज्यू,\nवडा कार्यालय, काठमाडौं।\nविषय: नागरिकता प्रमाणपत्रको सिफारिस पाउँ।')}
                        className="text-xs text-cyan-700 dark:text-cyan-300 hover:underline inline-flex items-center gap-1 cursor-pointer font-semibold min-h-[34px] px-2"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copied ? (isNepali ? 'कपी भयो' : 'Copied') : (isNepali ? 'कपी' : 'Copy')}</span>
                      </button>
                    </div>

                    <div
                      className={`p-3.5 rounded-lg border font-devanagari text-xs leading-relaxed space-y-1.5 ${
                        isDark ? 'bg-[#070B14] border-slate-800 text-slate-200' : 'bg-[#FAF9F6] border-slate-200 text-slate-900'
                      }`}
                    >
                      <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">मिति: २०८१/०८/१५</div>
                      <div className="font-bold text-slate-950 dark:text-white">श्रीमान् वडा अध्यक्षज्यू,</div>
                      <div>वडा नं. ४ को कार्यालय, काठमाडौं महानगरपालिका।</div>
                      <div className="text-cyan-700 dark:text-cyan-300 font-semibold pt-0.5">
                        विषय: नेपाली नागरिकता प्रमाणपत्रको सिफारिस पाउँ।
                      </div>
                      <div className="text-slate-700 dark:text-slate-300 pt-0.5">
                        म निवेदक यसै वडामा स्थायी बसोबास गर्दै आएको हुँदा नागरिकता प्राप्तिका लागि सिफारिस गरिपाऊँ...
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-mono text-slate-600 dark:text-slate-400">
                        {isNepali ? '५०+ वडा ढाँचा · A4 PDF' : '50+ Ward Templates · Direct A4 PDF'}
                      </span>
                      <button
                        type="button"
                        onClick={() => openDailyUtility('letter')}
                        className="text-cyan-700 dark:text-cyan-300 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer min-h-[34px]"
                      >
                        <span>{isNepali ? 'स्टुडियो खोल्नुहोस्' : 'Open Letter Studio'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Tax & TDS Preview */}
                {activePreview === 'tax' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-950 dark:text-white">
                          {isNepali ? 'आ.व. २०८१/८२ आयकर तथा टीडीएस' : 'Income Tax & TDS (FY 2081/82)'}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {isNepali ? 'आन्तरिक राजस्व विभाग (IRD) नियम' : 'IRD Nepal Progressive Slabs'}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-rose-700 dark:text-rose-400 font-bold">
                        FY 2081/82
                      </span>
                    </div>

                    <div
                      className={`grid grid-cols-3 divide-x rounded-lg border ${
                        isDark
                          ? 'divide-slate-800 border-slate-800 bg-[#070B14]'
                          : 'divide-slate-200 border-slate-200 bg-[#FAF9F6]'
                      }`}
                    >
                      <div className="p-3 text-center">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{isNepali ? 'मासिक तलब' : 'Monthly Pay'}</div>
                        <div className="text-sm font-bold font-mono tabular-nums mt-1 text-slate-950 dark:text-white">रू ६०,०००</div>
                      </div>
                      <div className="p-3 text-center bg-cyan-500/[0.06]">
                        <div className="text-[11px] text-cyan-700 dark:text-cyan-300 font-semibold">{isNepali ? 'मासिक TDS' : 'Monthly TDS'}</div>
                        <div className="text-sm font-bold font-mono tabular-nums mt-1 text-cyan-800 dark:text-cyan-200">रू १,८३३</div>
                      </div>
                      <div className="p-3 text-center">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{isNepali ? 'हात पर्ने' : 'Take-Home'}</div>
                        <div className="text-sm font-bold font-mono tabular-nums mt-1 text-slate-950 dark:text-white">रू ५८,१६७</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-mono text-slate-600 dark:text-slate-400">
                        {isNepali ? 'SSF, EPF, CIT र दफा ९५क सहित' : 'SSF, EPF, CIT & Sec 95Ka Ready'}
                      </span>
                      <button
                        type="button"
                        onClick={() => openDailyUtility('tax')}
                        className="text-cyan-700 dark:text-cyan-300 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer min-h-[34px]"
                      >
                        <span>{isNepali ? 'हिसाब गर्नुहोस्' : 'Open Calculator'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. NRB Forex Preview */}
                {activePreview === 'forex' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-950 dark:text-white">
                          {isNepali ? 'नेपाल राष्ट्र बैंक विनिमय दर' : 'NRB Official Exchange Rates'}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {isNepali ? 'प्रत्यक्ष केन्द्रीय बैंक सन्दर्भ दर' : 'Live Central Bank Reference Feed'}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-cyan-700 dark:text-cyan-300 font-semibold">
                        nrb.org.np
                      </span>
                    </div>

                    <div
                      className={`grid grid-cols-3 divide-x rounded-lg border ${
                        isDark
                          ? 'divide-slate-800 border-slate-800 bg-[#070B14]'
                          : 'divide-slate-200 border-slate-200 bg-[#FAF9F6]'
                      }`}
                    >
                      <div className="p-3">
                        <div className="text-xs font-bold text-slate-950 dark:text-white">USD (1)</div>
                        <div className="text-sm font-bold font-mono tabular-nums text-cyan-700 dark:text-cyan-300 mt-0.5">
                          रू {(pulse.usdBuy ?? 148.97).toFixed(2)}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {isNepali ? 'बिक्री' : 'Sell'}: {(pulse.usdSell ?? 149.57).toFixed(2)}
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="text-xs font-bold text-slate-950 dark:text-white">EUR (1)</div>
                        <div className="text-sm font-bold font-mono tabular-nums text-cyan-700 dark:text-cyan-300 mt-0.5">
                          रू {(pulse.eurBuy ?? 171.75).toFixed(2)}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {isNepali ? 'बिक्री' : 'Sell'}: {(pulse.eurSell ?? 172.44).toFixed(2)}
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="text-xs font-bold text-slate-950 dark:text-white">GBP (1)</div>
                        <div className="text-sm font-bold font-mono tabular-nums text-cyan-700 dark:text-cyan-300 mt-0.5">
                          रू {(pulse.gbpBuy ?? 199.78).toFixed(2)}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {isNepali ? 'बिक्री' : 'Sell'}: {(pulse.gbpSell ?? 200.59).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-mono text-slate-600 dark:text-slate-400">
                        {isNepali ? '$५०० कार्ड कोटा + २% DST' : '$500 Card Quota · 2% DST Audit'}
                      </span>
                      <button
                        type="button"
                        onClick={() => openDailyUtility('fx')}
                        className="text-cyan-700 dark:text-cyan-300 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer min-h-[34px]"
                      >
                        <span>{isNepali ? 'विनिमय टुल खोल्नुहोस्' : 'Open Forex Tool'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Devanagari OCR Preview */}
                {activePreview === 'ocr' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-950 dark:text-white">
                          {isNepali ? 'नागरिकता तथा लालपुर्जा स्क्यानर' : 'Devanagari Document OCR'}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {isNepali ? 'स्वचालित डेटा एक्सट्र्याक्सन' : 'Instant Structured Field Extraction'}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-cyan-700 dark:text-cyan-300 font-semibold">
                        JSON Ready
                      </span>
                    </div>

                    <div
                      className={`p-3.5 rounded-lg border text-xs divide-y font-mono ${
                        isDark
                          ? 'bg-[#070B14] border-slate-800 divide-slate-800/80 text-slate-100'
                          : 'bg-[#FAF9F6] border-slate-200 divide-slate-200 text-slate-900'
                      }`}
                    >
                      <div className="flex justify-between pb-2">
                        <span className="text-slate-500 dark:text-slate-400">{isNepali ? 'नाम' : 'Name'}</span>
                        <span className="font-bold text-slate-950 dark:text-white">राम बहादुर खत्री</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-500 dark:text-slate-400">{isNepali ? 'नागरिकता नं' : 'Citizenship'}</span>
                        <span className="font-bold text-slate-950 dark:text-white">२७-०१-७८-०४९२१</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-slate-500 dark:text-slate-400">{isNepali ? 'जिल्ला' : 'District'}</span>
                        <span className="font-bold text-slate-950 dark:text-white">काठमाडौं (Kathmandu)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-mono text-slate-600 dark:text-slate-400">
                        {isNepali ? 'हस्तलिखित र छापिएका दुवै' : 'Printed & handwritten docs'}
                      </span>
                      <button
                        type="button"
                        onClick={() => openDailyUtility('ocr')}
                        className="text-cyan-700 dark:text-cyan-300 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer min-h-[34px]"
                      >
                        <span>{isNepali ? 'ओसीआर खोल्नुहोस्' : 'Open Scanner'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
