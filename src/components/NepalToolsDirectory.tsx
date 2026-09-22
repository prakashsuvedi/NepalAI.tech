import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NEPAL_AI_TOOLS } from '../data/nepalTools';
import { ToolCategory, ThemeMode, Language, NepalAITool } from '../types';
import { Search, CheckCircle, AlertTriangle, ExternalLink, Plus, Check, Layers, Info, Sparkles, Zap, ShieldCheck, X, TrendingUp, Award, ShieldAlert, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { BentoGridSkeleton } from './BentoGridSkeleton';
import { AppleTooltip } from './AppleTooltip';

interface NepalToolsDirectoryProps {
  theme?: ThemeMode;
  language?: Language;
  selectedStack: string[];
  onToggleStack: (toolId: string) => void;
  onOpenStackCalculator: () => void;
  isHydrating?: boolean;
}

const CATEGORIES: ToolCategory[] = [
  'All',
  'Coding',
  'LLM & Writing',
  'Design & Video',
  'Audio & Voice',
  'Automation'
];

export const NepalToolsDirectory: React.FC<NepalToolsDirectoryProps> = ({
  theme = 'dark',
  language = 'en',
  selectedStack,
  onToggleStack,
  onOpenStackCalculator,
  isHydrating = false,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ToolCategory>('All');
  const [filterType, setFilterType] = useState<'all' | 'esewa' | 'dollar' | 'free'>('all');
  const [hoveredTool, setHoveredTool] = useState<NepalAITool | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; alignRight?: boolean } | null>(null);
  const [pinnedToolId, setPinnedToolId] = useState<string | null>(null);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Content-aware initial hydration state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFetchingData(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const handleRefreshDirectory = () => {
    setIsFetchingData(true);
    setTimeout(() => {
      setIsFetchingData(false);
    }, 600);
  };

  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];

  const exchangeRate = 135; // 1 USD = 135 NPR

  const handleMouseEnterTool = (tool: NepalAITool, e: React.MouseEvent<HTMLElement>) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    const isRightSide = rect.left > window.innerWidth / 2;
    setTooltipPos({
      top: rect.bottom + window.scrollY + 8,
      left: isRightSide ? rect.right + window.scrollX : rect.left + window.scrollX,
      alignRight: isRightSide,
    });
    setHoveredTool(tool);
  };

  const handleMouseLeaveTool = () => {
    if (pinnedToolId) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredTool(null);
    }, 150);
  };

  const handleTogglePinTooltip = (tool: NepalAITool) => {
    if (pinnedToolId === tool.id) {
      setPinnedToolId(null);
      setHoveredTool(null);
    } else {
      setPinnedToolId(tool.id);
      setHoveredTool(tool);
    }
  };

  const filteredTools = NEPAL_AI_TOOLS.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.keyCapability.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = category === 'All' || item.category === category;

    const matchesFilter =
      filterType === 'all'
        ? true
        : filterType === 'esewa'
        ? (item.nepalPaymentStatus === 'esewa-khalti' || Boolean(item.supportsQuickPay))
        : filterType === 'free'
        ? item.freeTierAvailable
        : item.nepalPaymentStatus === 'dollar-card-only';

    return matchesSearch && matchesCategory && matchesFilter;
  });

  return (
    <section
      id="tools-directory"
      className={`py-16 md:py-24 relative border-t transition-colors duration-300 ${
        isDark ? 'border-white/[0.08]' : 'border-slate-200 bg-slate-50/50'
      }`}
      aria-labelledby="tools-directory-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-500/20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-emerald-500 mb-2">
              <span className="font-['Noto_Sans_Devanagari'] font-medium">
                {language === 'ne' ? 'स्थानीय पहुँच तथा भुक्तानी' : 'Verified Nepal Ecosystem'}
              </span>
              <span className={isDark ? 'text-slate-600' : 'text-slate-300'} aria-hidden="true">•</span>
              <span className={`font-mono uppercase tracking-wider text-[11px] ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {t.tools.badge}
              </span>
            </div>
            <h2
              id="tools-directory-heading"
              className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {language === 'ne' ? 'प्रमाणित एआई टुल्स र भुक्तानी गाइड' : 'Verified AI Tools & Payment Directory'}
            </h2>
            <p className={`mt-2 text-xs sm:text-sm leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {t.tools.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenStackCalculator}
              aria-label={`Open AI Stack Calculator with ${selectedStack.length} tools selected`}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-center gap-2 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
                isDark
                  ? 'bg-white/[0.04] border-white/10 text-emerald-300 hover:text-white hover:border-emerald-500/50'
                  : 'bg-white border-slate-300 text-emerald-700 hover:text-emerald-900 shadow-xs'
              }`}
            >
              <Layers className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden="true" />
              <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                {t.nav.stackCalculator} ({selectedStack.length})
              </span>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              id="tools-search-input"
              type="text"
              aria-label={t.tools.searchPlaceholder}
              placeholder={t.tools.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full min-h-[44px] rounded-xl border pl-10 pr-3.5 py-2.5 text-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors ${
                isDark
                  ? 'border-white/10 bg-black/40 text-white placeholder-slate-500 focus:border-white/30'
                  : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-500 shadow-xs'
              }`}
            />
          </div>

          {/* Quick Payment Filter with 44px touch targets */}
          <div
            className="flex flex-wrap items-center gap-2 text-xs"
            role="group"
            aria-label="Payment method filter"
          >
            <span className={`text-xs mr-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t.tools.paymentFilterLabel}:
            </span>
            {[
              { id: 'all', label: t.tools.allPayments },
              { id: 'esewa', label: 'eSewa / Khalti' },
              { id: 'dollar', label: '$500 Dollar Card' },
              { id: 'free', label: 'Free Tier' },
            ].map((f) => (
              <motion.button
                key={f.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-pressed={filterType === f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl transition-colors text-xs font-medium flex items-center justify-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
                  filterType === f.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : isDark
                    ? 'bg-white/[0.03] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                    : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                {f.label}
              </motion.button>
            ))}
          </div>

        </div>

        {/* Categories */}
        <div
          className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs"
          role="group"
          aria-label="Tool categories filter"
        >
          {CATEGORIES.map((c) => (
            <motion.button
              key={c}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={`min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl whitespace-nowrap transition-colors flex items-center justify-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
                category === c
                  ? isDark
                    ? 'bg-white/10 text-emerald-400 border border-emerald-500/40 font-bold'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold'
                  : isDark
                  ? 'bg-black/20 text-slate-400 hover:text-slate-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              {c === 'All' ? t.tools.allCategories : c}
            </motion.button>
          ))}
        </div>

        {/* Smart Reminder & Nepal Police Cyber Bureau (CIB) Safety Advisory */}
        <div 
          className={`mt-5 p-4 sm:p-5 rounded-2xl border transition-all ${
            isDark 
              ? 'border-amber-500/25 bg-amber-500/[0.04]' 
              : 'border-amber-200 bg-amber-50/70 shadow-xs'
          }`}
          role="region"
          aria-label="Nepal AI Cyber Security and CIB Warning Advisory"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${
                isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-800'
              }`}>
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[11px] font-bold font-mono uppercase px-2 py-0.5 rounded-full border ${
                    isDark 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    {language === 'ne' ? 'नेपाल साइबर सुरक्षा सतर्कता' : 'Smart Cyber Security Reminder'}
                  </span>
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {language === 'ne' ? 'नेपाल प्रहरी साइबर ब्युरो (CIB) निर्देशिका' : 'Nepal Police Cyber Bureau (CIB) Guidelines'}
                  </span>
                </div>
                <h3 className={`text-sm sm:text-base font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {language === 'ne'
                    ? 'अनधिकृत एप्लिकेसन डाउनलोड नगर्नुहोस् र रिमोट पहुँच कहिल्यै नदिनुहोस्'
                    : 'Never Download Unverified Third-Party Apps or Grant Remote Access'}
                </h3>
                <p className={`text-xs sm:text-[13px] leading-relaxed max-w-4xl ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {language === 'ne'
                    ? 'nepalai.tech को डिरेक्टरी पूर्णतया सुरक्षित र केवल आधिकारिक वेबसाइटहरूमा लिङ्क गरिएको छ। अनधिकृत तेस्रो-पक्ष APK, क्र्याक फाइल वा शंकास्पद "एआई ट्रेडिङ बट/नेप्से क्लोन" (जस्तै नेपाल प्रहरी साइबर ब्युरो CIB द्वारा प्रतिबन्धित नक्कली नेप्से एआई जस्ता ठगीहरू) बाट सावधान रहनुहोस्। कसैलाई पनि AnyDesk, TeamViewer वा बैंकिङ OTP नदिनुहोस्।'
                    : 'While the informational directory at nepalai.tech is 100% verified and links strictly to official portals, always practice fundamental cyber hygiene: never download unverified third-party apps, cracked APKs, or grant remote access (AnyDesk/TeamViewer) to your device. Be vigilant against malicious scams such as the fake Nepse AI clone recently flagged and penalized by the Nepal Police Cyber Bureau (CIB).'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0 text-xs font-mono">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-semibold ${
                isDark 
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' 
                  : 'border-emerald-300 bg-emerald-100 text-emerald-900'
              }`}>
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>100% Official Links Only</span>
              </span>
              <span className={`inline-flex items-center gap-1 text-[11px] ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <Lock className="h-3 w-3 text-amber-500" aria-hidden="true" />
                <span>Zero Malware / No APKs</span>
              </span>
            </div>
          </div>
        </div>

        {/* Hover Tooltip Overlay Indicator & Live Sync Trigger */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" aria-hidden="true" />
            <span className="font-medium">{language === 'ne' ? 'टुल्सको संक्षिप्त नेपाली तथा अंग्रेजी विवरण हेर्न माउस होभर वा ट्याप गर्नुहोस्' : 'Hover or tap on any tool card for instant Apple-style bilingual tooltip & specs'}</span>
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefreshDirectory}
              disabled={isFetchingData || isHydrating}
              aria-label={language === 'ne' ? 'टुल्स डाटा पुनः सिंक गर्नुहोस्' : 'Sync directory data'}
              className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-mono transition-all cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:border-emerald-500/40'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:text-slate-900 hover:border-emerald-500/40'
              }`}
              title={language === 'ne' ? 'टुल्स डाटा पुनः लोड गर्नुहोस्' : 'Simulate live data fetch and test bento skeleton loading'}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-emerald-400 shrink-0 ${
                  isFetchingData || isHydrating ? 'animate-spin' : ''
                }`}
                aria-hidden="true"
              />
              <span>
                {isFetchingData || isHydrating
                  ? language === 'ne'
                    ? 'अपडेट हुँदैछ...'
                    : 'Hydrating Data...'
                  : language === 'ne'
                  ? 'रिफ्रेस'
                  : 'Sync Directory'}
              </span>
            </button>

            <span className="hidden sm:inline font-semibold text-slate-400">
              {filteredTools.length} {t.tools.toolsFound}
            </span>
          </div>
        </div>

        {/* Content-Aware Skeleton State during Data Fetch & Hydration */}
        <AnimatePresence mode="wait">
          {isFetchingData || isHydrating ? (
            <div key="directory-skeleton" className="mt-4">
              <BentoGridSkeleton theme={theme} type="tools" count={6} />
            </div>
          ) : (
            /* Modular Responsive Grid: Clean 1-col on mobile, 2-col on sm/tablet, 3-col on lg/desktop */
            <motion.div
              key="directory-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              {filteredTools.map((tool, idx) => {
                const isSelected = selectedStack.includes(tool.id);
                const npr = Math.round(tool.monthlyPriceUsd * exchangeRate);
                const isTooltipActive = hoveredTool?.id === tool.id || pinnedToolId === tool.id;
                const supportsQuickPay = Boolean(
                  tool.supportsQuickPay ||
                  tool.nepalPaymentStatus === 'esewa-khalti' ||
                  tool.paymentDetails.toLowerCase().includes('esewa') ||
                  tool.paymentDetails.toLowerCase().includes('khalti')
                );

                const adoption = tool.localAdoptionPercent || 85;
                const isHighValue = adoption >= 90;

                return (
                  <motion.article
                    key={tool.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: (idx % 6) * 0.06 }}
                whileHover={{ y: -4, scale: 1.015 }}
                onMouseEnter={(e) => handleMouseEnterTool(tool, e)}
                onMouseLeave={handleMouseLeaveTool}
                className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 focus-within:ring-2 focus-within:ring-emerald-500 cursor-default ${
                  isSelected
                    ? isDark
                      ? 'border-emerald-500/60 bg-emerald-950/20 shadow-xl shadow-emerald-950/30'
                      : 'border-emerald-400 bg-emerald-50/60 shadow-lg shadow-emerald-100'
                    : isDark
                    ? 'border-white/[0.08] bg-white/[0.015] hover:border-emerald-500/50 hover:bg-white/[0.035] hover:shadow-xl hover:shadow-emerald-950/25'
                    : 'border-slate-200 bg-white hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`font-semibold px-2.5 py-0.5 rounded-md text-[11px] ${
                        isDark ? 'bg-white/[0.05] text-slate-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tool.category}
                      </span>

                      {/* Small Visual Quick Pay Badge with Subtle Green Pulse Effect */}
                      {supportsQuickPay && (
                        <span
                          id={`quick-pay-badge-${tool.id}`}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight border transition-colors ${
                            isDark
                              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.18)]'
                              : 'bg-emerald-50 border-emerald-300/80 text-emerald-800 shadow-2xs'
                          }`}
                          title={language === 'ne' ? 'नेपालमा इसेवा वा खल्तीबाट सिधै भुक्तानी गर्न सकिने' : 'Direct payment via eSewa or Khalti supported'}
                        >
                          <span className="relative flex h-2 w-2" aria-hidden="true">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                          <span>Quick Pay</span>
                          <span className={`text-[9px] font-medium hidden sm:inline ${
                            isDark ? 'text-emerald-400/90' : 'text-emerald-700'
                          }`}>
                            • {tool.quickPayProvider || 'eSewa/Khalti'}
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isHighValue && (
                        <span className="flex items-center gap-1 text-amber-400 font-semibold text-[10px] bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                          <Award className="h-3 w-3" aria-hidden="true" />
                          <span>Top Choice</span>
                        </span>
                      )}

                      {tool.worksInNepal === 'direct' ? (
                        <span className="flex items-center gap-1 text-emerald-500 font-medium text-[11px]">
                          <CheckCircle className="h-3 w-3" aria-hidden="true" />
                          <span>{t.tools.worksDirectly}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-500 font-medium text-[11px]">
                          <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                          <span>{t.tools.needsVpn}</span>
                        </span>
                      )}

                      {/* Tooltip trigger button with strict 44x44px mobile touch target */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePinTooltip(tool);
                        }}
                        aria-label={`View bilingual description and specs for ${tool.name}`}
                        title="Click to toggle Apple-style specs tooltip"
                        className={`min-w-[44px] min-h-[44px] flex items-center justify-center -mr-1.5 rounded-xl transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                          isTooltipActive
                            ? 'bg-emerald-500 text-slate-950'
                            : isDark
                            ? 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                            : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <Info className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm font-bold leading-snug group-hover:text-emerald-400 transition-colors ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {tool.name}
                    </h3>
                    {tool.popularityInNepal === 'Essential' && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Essential
                      </span>
                    )}
                  </div>

                  <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {tool.description}
                  </p>

                  {/* Standout Capability Pill */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-500/90 font-medium">
                    <Zap className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{tool.keyCapability}</span>
                  </div>

                  {/* Local Business Adoption Usage Meter / Progress Bar */}
                  <div className={`mt-3 rounded-xl border p-2.5 space-y-1.5 text-xs ${
                    isDark ? 'bg-black/30 border-white/[0.06]' : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-slate-400">
                        <TrendingUp className="h-3 w-3 text-emerald-400 shrink-0" aria-hidden="true" />
                        <span className="font-medium text-xs">
                          {language === 'ne' ? 'नेपाली व्यवसाय प्रयोग दर:' : 'Local Business Adoption:'}
                        </span>
                      </div>
                      <span className="font-bold tabular-nums text-emerald-400">
                        {adoption}%
                      </span>
                    </div>

                    {/* Progress Bar Meter */}
                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          adoption >= 90
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-300 shadow-xs'
                            : adoption >= 80
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                            : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                        }`}
                        style={{ width: `${adoption}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span className="truncate max-w-[170px]" title={tool.businessUsageTier || 'SME & Enterprise Standard'}>
                        {tool.businessUsageTier || 'SME & Enterprise Standard'}
                      </span>
                      {tool.monthlyActiveBusinesses && (
                        <span className="text-emerald-500/90 font-semibold tabular-nums shrink-0">
                          {tool.monthlyActiveBusinesses}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Payment Details Box */}
                  <div className={`mt-2.5 rounded-xl border p-2.5 text-xs ${
                    isDark ? 'bg-black/40 border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between font-semibold">
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        {language === 'ne' ? 'भुक्तानी विधि:' : 'Payment Method:'}
                      </span>
                      <span className="text-emerald-500 font-bold tabular-nums">
                        {tool.monthlyPriceUsd > 0 ? `$${tool.monthlyPriceUsd}/mo (~NPR ${npr.toLocaleString()})` : 'Free Tier'}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {tool.paymentDetails}
                    </p>

                    {supportsQuickPay && (
                      <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-slate-500/15 text-[11px] text-emerald-500 font-medium">
                        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                        <span>{language === 'ne' ? 'सिधै इसेवा / खल्ती भुक्तानी समर्थित' : 'Direct eSewa / Khalti instant payment supported'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Card Actions with strict 44x44px touch targets */}
                <div className="mt-4 pt-3 border-t border-slate-500/15 flex items-center justify-between gap-2">
                  <a
                    href={tool.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit official website for ${tool.name} (opens in new tab)`}
                    className={`min-h-[44px] min-w-[44px] px-3.5 py-2.5 text-xs flex items-center justify-center gap-1.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl transition-colors cursor-pointer ${
                      isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{t.tools.visitOfficial}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </a>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onToggleStack(tool.id)}
                    aria-label={isSelected ? `Remove ${tool.name} from stack` : `Add ${tool.name} to stack`}
                    aria-pressed={isSelected}
                    className={`min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                        : isDark
                        ? 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/10'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950 border border-slate-200'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                          {t.tools.inStack}
                        </span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                          {t.tools.addToStack}
                        </span>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Minimalist Apple-Style Hover Tooltip Component */}
                <AppleTooltip
                  isVisible={isTooltipActive}
                  theme={theme}
                  language={language}
                  toolName={tool.name}
                  category={tool.category}
                  descriptionEn={tool.description}
                  descriptionNe={tool.descriptionNe}
                  supportsQuickPay={supportsQuickPay}
                  quickPayProvider={tool.quickPayProvider || 'eSewa & Khalti'}
                  worksInNepal={tool.worksInNepal}
                  priceLabel={tool.monthlyPriceUsd > 0 ? `$${tool.monthlyPriceUsd}/mo (~NPR ${npr.toLocaleString()})` : 'Free Tier'}
                  isPinned={pinnedToolId === tool.id}
                  onClose={() => {
                    setPinnedToolId(null);
                    setHoveredTool(null);
                  }}
                />
              </motion.article>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>

      </div>
    </section>
  );
};
